<!--
Copyright 2018-2026 CREATOR Team.

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
import { ref, watch, onMounted, onBeforeUnmount, type PropType, computed, registerRuntimeCompiler, reactive } from "vue";
import { coreEvents, CoreEventTypes } from "@/core/events.mts";
import * as monaco from "monaco-editor";
import { initVimMode, VimMode } from "monaco-vim";
import { assembly_files, DeleteFile, showFileEditor, createFile, renameFile, switchApplyFile } from "@/web/components/assembly/MultifileEditor.mjs";
import { assembly_compile, reset, status, architecture } from "@/core/core.mjs";
import { resetStats } from "@/core/executor/stats.mts";
import { registerAssemblyLanguages } from "@/web/monaco/languages/index";
import { registerCreatorThemes } from "@/web/monaco/themes";
import {
  setupSemanticValidation,
  clearValidationMarkers,
} from "@/web/monaco/validation";
import { assemblerMap, getDefaultCompiler } from "@/web/assemblers";
import { SailCompile } from "@/core/assembler/sailAssembler/web/CNAssambler.mjs";
import { nextTick } from "vue";

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
      );
    };

    switch (label) {
      case "json":
        return getWorkerModule(
          "/monaco-editor/esm/vs/language/json/json.worker?worker",
          label,
        );
      case "css":
      case "scss":
      case "less":
        return getWorkerModule(
          "/monaco-editor/esm/vs/language/css/css.worker?worker",
          label,
        );
      case "html":
      case "handlebars":
      case "razor":
        return getWorkerModule(
          "/monaco-editor/esm/vs/language/html/html.worker?worker",
          label,
        );
      case "typescript":
      case "javascript":
        return getWorkerModule(
          "/monaco-editor/esm/vs/language/typescript/ts.worker?worker",
          label,
        );
      default:
        return getWorkerModule(
          "/monaco-editor/esm/vs/editor/editor.worker?worker",
          label,
        );
    }
  },
};

// Register custom themes once (using IIFE to avoid lint warning)

registerCreatorThemes();

function syncFiles(event?: { files: any[]; currentTab: number }) {
  files.value = (event?.files ?? assembly_files).map(file => ({ ...file }));
}

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
});


// List of current files created
const files = ref<any>([]);
const activeTabIndex = ref(0);

// Variables to tab menu to rename files
const renameModalOpen = ref(false);
const renameValue = ref("");
const tabToRename = ref<any | null>(null);

const closeTabMenu = () => {
  tabMenu.visible = false;
  tabMenu.tab = null;
};

const openTabMenu = (e: MouseEvent, tab: any) => {
  tabMenu.visible = true;
  tabMenu.x = e.clientX;
  tabMenu.y = e.clientY;
  tabMenu.tab = tab;

  nextTick(() => {
    window.addEventListener("click", closeTabMenu, {once: true});
  });
}



const onRenameClick = () => {
  if (!tabMenu.tab) 
    return;

    tabToRename.value = tabMenu.tab;
    renameValue.value = tabMenu.tab.filename ?? "";
    renameModalOpen.value = true;

    closeTabMenu();
}

const confirmRename = () => {
  const tab = tabToRename.value;
  if (!tab)
    return;

  const newName = renameValue.value.trim();
  renameFile(tab.filename, newName);

  renameModalOpen.value = false;
  tabToRename.value = null;

}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    closeTabMenu();
  }
}

window.addEventListener("keydown", onKeyDown);

onBeforeUnmount(() => {
  coreEvents.off(CoreEventTypes.ASSEMBLY_FILES_UPDATED, syncFiles);

  window.removeEventListener("keydown", onKeyDown);
});


const editorContainer = ref<HTMLDivElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
let validationDisposable: monaco.IDisposable | null = null;

const tabMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  tab: null as any | null,
});


// Get the selected compiler from the architecture or use default
const getSelectedCompiler = () => {
  const defaultCompiler = getDefaultCompiler(architecture);

  // Try to get the selected compiler from AssemblyActions component if available
  const root = (document as any).app;
  const assemblyActions = root?.$refs?.navbar?.$refs?.assemblyActions;
  const selectedCompiler = assemblyActions?.selectedCompiler || defaultCompiler;

  return selectedCompiler;
};

/**
 * Handler for the Ctrl-s keydown event that disables its default action
 */
const ctrlSHandler = (e: KeyboardEvent) => {
  if (
    e.key === "s" &&
    (navigator.userAgent.includes("Mac") ? e.metaKey : e.ctrlKey)
  ) {
    e.preventDefault();
  }
};

const assemble = async () => {
  // TODO: call the function defined in AssemblyActions.vue

  // Get root - document.app is the mounted root component (App.vue)
  const root = (document as any).app;

  if (!root) {
    console.error("Could not access root component");
    return true;
  }

  // Reset simulator
  root.keyboard = "";
  root.display = "";
  root.enter = null;
  reset();

  // Reset stats
  resetStats();
  status.executedInstructions = 0;
  status.clkCycles = 0;

  // Get the selected compiler and assemble the code
  const selectedCompilerName = getSelectedCompiler();
  const assemblerFn = assemblerMap[selectedCompilerName];
  const ret = await (assemblerFn
    ? assembly_compile(root.assembly_code, assemblerFn)
    : assembly_compile(root.assembly_code));

  // Handle results
  if (ret.status !== "ok") {
    root.assemblyError = ret.msg;
    // Trigger error modal - emit event to show error
    root.$emit("show-assembly-error");
  } else {
    // Compilation successful
    root.creator_mode = "simulator";
  }

  return true;
};

let vimMode: any;
const setVimMode = (enabled: boolean) => {
  if (enabled) {
    // enable Vim
    vimMode = initVimMode(
      editor,
      // initVimMode requires an ICoreEditor, so...
      // editor!.getEditors().at(0),
      document.getElementById("vim-statusbar"),
    );

    // add commands
    VimMode.Vim.defineEx("write", "w", assemble); // TODO: don't change view
    VimMode.Vim.defineEx("xit", "x", assemble);

    // add keybindings
    for (const { mode, lhs, rhs } of props.vim_custom_keybinds) {
      VimMode.Vim.map(lhs, rhs, mode);
    }
  } else {
    // disable Vim
    vimMode?.dispose();
  }
};

const showFile = (filename: String) => {
  if (editor && filename !== "")
    editor.setValue(showFileEditor(filename, editor.getValue()));
}

const scrollableTab = async () => {
  await nextTick();

  const tab = document.querySelector(".tab-editor .nav-tabs .nav-link-active");
  (tab as HTMLElement | null)?.scrollIntoView({ behavior: "smooth", inline: "nearest"});
}

const addFile = () => {
  

  let i = files.value.findIndex(file => file.editing_now);
  if (i !== -1)
    editor?.setValue(createFile(files.value[i].code));
  else 
    editor?.setValue(createFile());

  nextTick(() => {
    const n = files.value.length;
    if (n > 0) activeTabIndex.value = n - 1; 
    scrollableTab();
  });

}

onMounted(() => {
  coreEvents.on(CoreEventTypes.ASSEMBLY_FILES_UPDATED, syncFiles);
  syncFiles();

  document.addEventListener("keydown", ctrlSHandler, false);

  if (!editorContainer.value) return;

  // Register language support dynamically from architecture
  // Cast to any to handle extended properties not in the type definition
  registerAssemblyLanguages(architecture as any);

  // Determine language ID (same logic as in registerAssemblyLanguages):
  // 1. If syntax is explicitly set, use it (could be custom language or "plaintext")
  // 2. Otherwise, use architecture name
  const architectureName = (architecture?.config as any)?.name || "Assembly";
  const languageId = (architecture?.config as any)?.syntax
    ? (architecture?.config as any).syntax
    : architectureName.toLowerCase().replace(/\s+/g, "-");

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
  });

  // Add Ctrl+S / Cmd+S keybinding
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    assemble();
  });

  // Listen to content changes and update parent immediately
  editor.onDidChangeModelContent(() => {
    // document.app is the mounted root component (App.vue)
    const root = (document as any).app;
    if (root && editor) {
      const newValue = editor.getValue();
      root.assembly_code = newValue;

      // Also save to localStorage for persistence
      try {
        localStorage.setItem("creator_assembly_code", newValue);
      } catch (e) {
        console.warn("Failed to save to localStorage:", e);
      }
    }
  });

  // Auto-focus on desktop
  if (props.os !== "mobile") {
    editor.focus();
  }

  // Setup semantic validation
  // The validation system will automatically use the correct assembler from architecture.config.assemblers
  validationDisposable = setupSemanticValidation(
    editor,
    architecture as any,
    1500, // 1.5 second debounce
  );

  // vim mode
  setVimMode(props.vim_mode);

  const saved = Number(localStorage.getItem("activeTabEditor"));
  const arr = files.value;
  if (!arr.length) return;

  const idx = saved ? saved : -1;
  activeTabIndex.value = idx >= 0 ? idx : 0;
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", ctrlSHandler);

  // Clean up validation
  if (validationDisposable) {
    validationDisposable.dispose();
  }

  // Dispose editor - no need to save since onDidChangeModelContent already handles it
  if (editor) {
    editor.dispose();
  }
});

// Watch to check if there are tabs and which is active
watch(
  files,
  arr => {
    if (!arr || arr.length === 0) {
      activeTabIndex.value = -1;
      return;
    }

    const i = arr.findIndex(file => file.editing_now === true);
    activeTabIndex.value = i >= 0 ? i : 0;
  },
  { immediate: true, deep: true },
);

watch( activeTabIndex, i => {

  const arr = files.value;
  let tab;
  let tabindex = i;
  if (!arr || arr.length === 0){
    editor?.setValue("");
    return;
  }
  if (typeof i === "number"){
    tab = arr[tabindex];
    if (!tab || !tab.filename) return;
  } else {
    tabindex = arr.findIndex(file => file.filename === i);
    tab = arr[tabindex];
    if (!tab || !tab.filename) return;
  }
  localStorage.setItem("activeTabEditor", String(tabindex));
  showFile(tab.filename);
});

// Watch for external code changes (e.g., when loading a new file)
watch(
  () => props.assembly_code,
  newCode => {
    if (editor && editor.getValue() !== newCode) {
      // Preserve cursor position if possible
      const position = editor.getPosition();
      editor.setValue(newCode);
      if (position) {
        editor.setPosition(position);
      }
    }
  },
);

// Watch for theme changes
watch(
  () => props.dark,
  isDark => {
    if (editor) {
      monaco.editor.setTheme(isDark ? "creator-dark" : "creator-light");
    }
  },
);

// Watch for Vim mode
watch(() => props.vim_mode, setVimMode);

// Watch for architecture changes and update language support
watch(
  () => architecture,
  newArchitecture => {
    if (newArchitecture && editor) {
      // Register new language support
      registerAssemblyLanguages(newArchitecture as any);

      // Determine language ID (same logic as above)
      const architectureName =
        (newArchitecture?.config as any)?.name || "Assembly";
      const languageId = (newArchitecture?.config as any)?.syntax
        ? (newArchitecture?.config as any).syntax
        : architectureName.toLowerCase().replace(/\s+/g, "-");

      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, languageId);
      }

      // Restart validation with new architecture
      // The validation system will automatically detect the correct assembler
      if (validationDisposable) {
        validationDisposable.dispose();
      }
      clearValidationMarkers(editor);
      validationDisposable = setupSemanticValidation(
        editor,
        newArchitecture as any,
        1500, // 1.5 second debounce
      );
    }
  },
  { deep: true },
);
</script>

<template> 
 <!-- Editor monaco  -->
  <div class="editor-wrapper" :style="{ height: height }">
    <div v-if="architecture?.config?.name?.includes('SRV') && files.length >= 0" class="tabs-editor">
      <b-tabs content-class="mt-3" v-model="activeTabIndex">
        <b-tab v-for="(tab, i) in files" 
               :key="tab.filename"
               :id="i"
               class="tab-editor">
          <template #title>
            <span class="tab-title d-inline-flex align-items-center gap-2"
            @contextmenu.prevent.stop="openTabMenu($event, tab)">
              <span class="me-1">{{ tab.filename }}</span>
              <b-form-checkbox
                switch
                :model-value="tab.to_compile"
                class="mb-0"
                @update:model-value="switchApplyFile(tab.filename)"
              />
              <b-button size="sm" 
                        class="close-button" 
                        :class="{ 'close-button-dark': dark }"
                        @click.stop="DeleteFile(tab.filename)"
              >X</b-button>
            </span>


          </template>      
        </b-tab>
        <template #tabs-end>
          <li class="nav-item">
            <a class="nav-link" @click.prevent.stop="addFile">+</a>
          </li>
        </template>

      </b-tabs>
    </div>
    <div ref="editorContainer" class="monaco-editor-container" v-show="files.length > 0 || !architecture?.config?.name?.includes('SRV')"/>

    <div id="vim-statusbar" class="vim-statusbar"></div>
    <b-modal v-model="renameModalOpen" class="rename-button" :class="{ 'rename-button-dark': dark }" title="Rename file" @ok="confirmRename">
      <b-form-input
        v-model="renameValue"
        autofocus
        @keydown.enter.prevent="confirmRename"
        placeholder="New filename:"
      />
    </b-modal>
  </div>

  <Teleport to="body">
    <div
      v-show="tabMenu.visible"
      class="tab-context-menu rename-button"
      :class="{ 'rename-button-dark': dark }" 
      :style="{ left: tabMenu.x + 'px', top: tabMenu.y + 'px' }"
      @click.stop
      @contextmenu.prevent
    >
      <button class="tab-context-item" @click="onRenameClick">
        Rename file
      </button>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.tab-editor {
  display: ruby;
}
.tabs-editor {
  height: 5%;
  width: 100%;
}
.editor-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.monaco-editor-container {
  width: 100%;
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.vim-statusbar {
  width: 100%;
  flex-shrink: 0;
}

.close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  min-width: 16px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  font-size: 0.8125rem;
  font-family: inherit;
  color: rgba(0, 0, 0, 0.8);
  background-color: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  user-select: none;

  &:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.3);
  }

  &:focus-visible {
    outline: 2px solid rgba(0, 0, 0, 0.5);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.close-button-dark {
    color: rgba(255, 255, 255, 0.9);
    background-color: rgba(255, 255, 255, 0.1);

    &:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.15);
    }

    &:active:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.3);
    }

    &:focus-visible {
      outline-color: rgba(255, 255, 255, 0.5);
    }
  }

  // Success state for assembled
  &.assembled-success {
    background-color: #198754;
    color: white;

    &:hover:not(:disabled) {
      background-color: #157347;
    }

    &:active:not(:disabled) {
      background-color: #146c43;
    }

    &:focus-visible {
      outline-color: #198754;
    }
  }
}
:deep(.nav-tabs) {
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

:deep(.nav-tabs .nav-item) {
  flex: 0 0 auto;
}

:deep(.nav-tabs .nav-link) {
  white-space: nowrap;
}

.tab-context-menu {
  position: fixed;
  z-index: 99999;
  min-width: 180px;
  background: white;
  border: 1px solid rgba(0,0,0,.15);
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0,0,0,.15);
  padding: 6px;
}

.tab-context-item {
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border: 0;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
}

.tab-context-item:hover {
  background: rgba(0,0,0,.06);
}

.rename-button {
  opacity: 1;
  color: rgba(0, 0, 0, 0.8);
  background-color: rgb(255, 255, 255);

  &:hover:not(:disabled) {
    background-color: rgb(255, 255, 255);
  }

  &:active:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.3);
  }

  &:focus-visible {
    outline: 2px solid rgba(0, 0, 0, 0.5);
    outline-offset: 2px;
  }

  &.rename-button-dark {
    color: rgb(255, 255, 255);
    background-color: rgb(83, 83, 83);

    &:hover:not(:disabled) {
    background-color: rgb(61, 61, 61);
    }

    &:active:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.3);
    }

    &:focus-visible {
      outline-color: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>
