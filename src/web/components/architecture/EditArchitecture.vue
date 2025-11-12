<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
                    Alejandro Calderon Mateos, Luis Daniel Casais Mezquida

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
import { computed, defineProps, onMounted, onBeforeUnmount, ref, watch } from "vue"

/* Monaco */
import * as monaco from "monaco-editor"
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import { configureMonacoYaml, type JSONSchema } from "monaco-yaml"
import YamlWorker from "./workaround-yaml.worker?worker"

import { architecture, reset, loadArchitecture } from "@/core/core.mjs"
import { show_notification, storeBackup } from "@/web/utils.mjs"
import schema from "../../../../architecture/schema.json"

const props = defineProps({
  id: { type: String, required: true },
  arch_code: { type: String, required: true },
  dark: { type: Boolean, required: true },
  os: { type: String, required: true },
})

// document.app is the mounted root component (App.vue)
const $root = (document as any).app
const editorContainer = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// Setup Monaco Environment for Vite
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    switch (label) {
      case "editorWorkerService":
        return new EditorWorker()
      case "yaml":
        return new YamlWorker()
      default:
        throw new Error(`Unknown label ${label}`)
    }
  },
}

configureMonacoYaml(monaco, {
  enableSchemaRequest: true,
  schemas: [
    {
      fileMatch: ["**/architecture.yaml"],
      schema: schema as unknown as JSONSchema,
      uri: `${document.URL}architecture/schema.json`,
    },
  ],
})

const architecture_value = computed({
  // sync w/ App's
  get() {
    return props.arch_code
  },
  set(value: string) {
    $root.arch_code = value
  },
})

// save edited architecture
function saveArch() {
  try {
    const result = loadArchitecture(architecture_value.value)
    if (result.status !== "ok") {
      show_notification("Invalid architecture: " + result.token, "danger")
      return
    }
  } catch {
    show_notification(
      "Architecture not edited. Architecture format is incorrect",
      "danger",
    )
    return
  }

  // update architecture data
  $root.architecture_name = architecture.config.name
  $root.architecture = architecture

  // reset execution
  $root.instructions = []
  reset()

  show_notification("Architecture edited correctly", "success")

  storeBackup()
}

// Watch for external code changes (e.g., when loading a new file)
watch(
  () => props.arch_code,
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

onMounted(() => {
  if (!editorContainer.value) return

  // Get or create the model with a unique URI
  const modelUri = monaco.Uri.parse("file:///architecture.yaml")
  let model = monaco.editor.getModel(modelUri)
  
  if (!model) {
    model = monaco.editor.createModel(
      architecture_value.value,
      undefined,
      modelUri,
    )
  } else {
    // Update existing model with current value
    model.setValue(architecture_value.value)
  }

  editor = monaco.editor.create(editorContainer.value, {
    automaticLayout: true,
    model,
    theme: props.dark ? "creator-dark" : "creator-light",
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: "on",
    tabSize: 4,
    folding: true,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    occurrencesHighlight: "off",
    stickyScroll: { enabled: false },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true,
    },
  })

  // Add Ctrl+S / Cmd+S keybinding
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    saveArch()
  })

  // Listen to content changes and update parent immediately
  editor.onDidChangeModelContent(() => {
    if ($root && editor) {
      const newValue = editor.getValue()
      $root.arch_code = newValue
    }
  })

  // Auto-focus on desktop
  if (props.os !== "mobile") {
    editor.focus()
  }
})

onBeforeUnmount(() => {
  // Dispose of the editor when component is unmounted
  if (editor) {
    editor.dispose()
    editor = null
  }
})
</script>

<template>
  <b-modal
    :id="id"
    size="xl"
    title="Edit Architecture"
    ok-title="Save"
    @ok="saveArch"
  >
    <div
      ref="editorContainer"
      style="height: 75vh"
      class="monaco-editor-container"
    ></div>
  </b-modal>
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
