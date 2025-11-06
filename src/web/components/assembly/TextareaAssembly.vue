<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
                    Alejandro Calderon Mateos, Jorge Ramos Santana

This file is part of CREATOR.

CREATOR is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

CREATOR is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
-->

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, type PropType } from "vue"
import * as monaco from "monaco-editor"
import { initVimMode, VimMode } from "monaco-vim"

import { assembly_compile, reset, status, architecture } from "@/core/core.mjs"
import { resetStats } from "@/core/executor/stats.mts"
import { registerAssemblyLanguages } from "@/web/monaco/languages/index"
import { registerCreatorThemes } from "@/web/monaco/themes"
import {
  setupSemanticValidation,
  clearValidationMarkers,
} from "@/web/monaco/validation"
import { assemblerMap, getDefaultCompiler } from "@/web/assemblers"

// Setup Monaco Environment for Vite
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    const getWorkerModule = (moduleUrl: string, label: string) => {
      return new Worker(
        (import.meta.env?.DEV ? "" : (import.meta.env?.BASE_URL ?? "")) +
          moduleUrl,
        {
          name: label,
          type: "module",
        },
      )
    }

    switch (label) {
      case "json":
        return getWorkerModule(
          "/monaco-editor/esm/vs/language/json/json.worker?worker",
          label,
        )
      case "css":
      case "scss":
      case "less":
        return getWorkerModule(
          "/monaco-editor/esm/vs/language/css/css.worker?worker",
          label,
        )
      case "html":
      case "handlebars":
      case "razor":
        return getWorkerModule(
          "/monaco-editor/esm/vs/language/html/html.worker?worker",
          label,
        )
      case "typescript":
      case "javascript":
        return getWorkerModule(
          "/monaco-editor/esm/vs/language/typescript/ts.worker?worker",
          label,
        )
      default:
        return getWorkerModule(
          "/monaco-editor/esm/vs/editor/editor.worker?worker",
          label,
        )
    }
  },
}

// Register custom themes once (using IIFE to avoid lint warning)

registerCreatorThemes()

const props = defineProps({
  os: { type: String, required: true },
  assembly_code: { type: String, required: true },
  vim_mode: { type: Boolean, required: true },
  vim_custom_keybinds: {
    type: Array as PropType<VimKeybind[]>,
    required: true,
  },
  height: { type: String, required: true },
  dark: { type: Boolean, required: true },
})

const editorContainer = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null
let validationDisposable: monaco.IDisposable | null = null

// Get the selected compiler from the architecture or use default
const getSelectedCompiler = () => {
  const defaultCompiler = getDefaultCompiler(architecture)

  // Try to get the selected compiler from AssemblyActions component if available
  const root = (document as any).app
  const assemblyActions = root?.$refs?.navbar?.$refs?.assemblyActions
  const selectedCompiler = assemblyActions?.selectedCompiler || defaultCompiler

  return selectedCompiler
}

/**
 * Handler for the Ctrl-s keydown event that disables its default action
 */
const ctrlSHandler = (e: KeyboardEvent) => {
  if (
    e.key === "s" &&
    (navigator.userAgent.includes("Mac") ? e.metaKey : e.ctrlKey)
  ) {
    e.preventDefault()
  }
}

const assemble = async () => {
  // TODO: call the function defined in AssemblyActions.vue

  // Get root - document.app is the mounted root component (App.vue)
  const root = (document as any).app

  if (!root) {
    console.error("Could not access root component")
    return true
  }

  // Reset simulator
  root.keyboard = ""
  root.display = ""
  root.enter = null
  reset()

  // Reset stats
  resetStats()
  status.executedInstructions = 0
  status.clkCycles = 0

  // Get the selected compiler and assemble the code
  const selectedCompilerName = getSelectedCompiler()
  const assemblerFn = assemblerMap[selectedCompilerName]
  const ret = await (assemblerFn
    ? assembly_compile(root.assembly_code, assemblerFn)
    : assembly_compile(root.assembly_code))

  // Handle results
  if (ret.status !== "ok") {
    root.assemblyError = ret.msg
    // Trigger error modal - emit event to show error
    root.$emit("show-assembly-error")
  } else {
    // Compilation successful
    root.creator_mode = "simulator"
  }

  return true
}

let vimMode: any
const setVimMode = (enabled: boolean) => {
  if (enabled) {
    // enable Vim
    vimMode = initVimMode(
      editor,
      // initVimMode requires an ICoreEditor, so...
      // editor!.getEditors().at(0),
      document.getElementById("vim-statusbar"),
    )

    // add commands
    VimMode.Vim.defineEx("write", "w", assemble)
    VimMode.Vim.defineEx("xit", "x", assemble)

    // add keybindings
    for (const { mode, lhs, rhs } of props.vim_custom_keybinds) {
      VimMode.Vim.map(lhs, rhs, mode)
    }
  } else {
    // disable Vim
    vimMode?.dispose()
  }
}

onMounted(() => {
  document.addEventListener("keydown", ctrlSHandler, false)

  if (!editorContainer.value) return

  // Register language support dynamically from architecture
  // Cast to any to handle extended properties not in the type definition
  registerAssemblyLanguages(architecture as any)

  // Determine language ID (same logic as in registerAssemblyLanguages):
  // 1. If syntax is explicitly set, use it (could be custom language or "plaintext")
  // 2. Otherwise, use architecture name
  const architectureName = (architecture?.config as any)?.name || "Assembly"
  const languageId = (architecture?.config as any)?.syntax
    ? (architecture?.config as any).syntax
    : architectureName.toLowerCase().replace(/\s+/g, "-")

  // Create Monaco Editor instance
  editor = monaco.editor.create(editorContainer.value, {
    value: props.assembly_code,
    language: languageId,
    theme: props.dark ? "creator-dark" : "creator-light",
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: "on",
    tabSize: 4,
    folding: true,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    occurrencesHighlight: "off",
    stickyScroll: { enabled: false },
  })

  // Add Ctrl+S / Cmd+S keybinding
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    assemble()
  })

  // Listen to content changes and update parent immediately
  editor.onDidChangeModelContent(() => {
    // document.app is the mounted root component (App.vue)
    const root = (document as any).app
    if (root && editor) {
      const newValue = editor.getValue()
      root.assembly_code = newValue

      // Also save to localStorage for persistence
      try {
        localStorage.setItem("creator_assembly_code", newValue)
      } catch (e) {
        console.warn("Failed to save to localStorage:", e)
      }
    }
  })

  // Auto-focus on desktop
  if (props.os !== "mobile") {
    editor.focus()
  }

  // Setup semantic validation
  // The validation system will automatically use the correct assembler from architecture.config.assemblers
  validationDisposable = setupSemanticValidation(
    editor,
    architecture as any,
    1500, // 1.5 second debounce
  )

  // vim mode
  setVimMode(props.vim_mode)
})

onBeforeUnmount(() => {
  document.removeEventListener("keydown", ctrlSHandler)

  // Clean up validation
  if (validationDisposable) {
    validationDisposable.dispose()
  }

  // Dispose editor - no need to save since onDidChangeModelContent already handles it
  if (editor) {
    editor.dispose()
  }
})

// Watch for external code changes (e.g., when loading a new file)
watch(
  () => props.assembly_code,
  newCode => {
    if (editor && editor.getValue() !== newCode) {
      // Preserve cursor position if possible
      const position = editor.getPosition()
      editor.setValue(newCode)
      if (position) {
        editor.setPosition(position)
      }
    }
  },
)

// Watch for theme changes
watch(
  () => props.dark,
  isDark => {
    if (editor) {
      monaco.editor.setTheme(isDark ? "creator-dark" : "creator-light")
    }
  },
)

// Watch for Vim mode
watch(() => props.vim_mode, setVimMode)

// Watch for architecture changes and update language support
watch(
  () => architecture,
  newArchitecture => {
    if (newArchitecture && editor) {
      // Register new language support
      registerAssemblyLanguages(newArchitecture as any)

      // Determine language ID (same logic as above)
      const architectureName =
        (newArchitecture?.config as any)?.name || "Assembly"
      const languageId = (newArchitecture?.config as any)?.syntax
        ? (newArchitecture?.config as any).syntax
        : architectureName.toLowerCase().replace(/\s+/g, "-")

      const model = editor.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, languageId)
      }

      // Restart validation with new architecture
      // The validation system will automatically detect the correct assembler
      if (validationDisposable) {
        validationDisposable.dispose()
      }
      clearValidationMarkers(editor)
      validationDisposable = setupSemanticValidation(
        editor,
        newArchitecture as any,
        1500, // 1.5 second debounce
      )
    }
  },
  { deep: true },
)
</script>

<template>
  <div id="vim-statusbar"></div>
  <div
    ref="editorContainer"
    class="monaco-editor-container"
    :style="{ height: height }"
  />
</template>

<style lang="scss" scoped>
.monaco-editor-container {
  width: 100%;
  margin: 0;
  padding: 0;
  display: block;
  overflow: hidden;
}
</style>
