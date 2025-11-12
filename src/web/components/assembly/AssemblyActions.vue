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
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue"
import { useToggle } from "bootstrap-vue-next"
import { assembly_compile, reset, status, architecture, loadedLibrary } from "@/core/core.mjs"
import { resetStats } from "@/core/executor/stats.mts"
import { instructions } from "@/core/assembler/assembler.mjs"
import { show_notification, storeBackup } from "@/web/utils.mjs"
import { assemblerMap, getDefaultCompiler } from "@/web/assemblers"
import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { coreEvents } from "@/core/events.mjs"

// State for dropdown visibility
const dropdownOpen = ref(false)
const libraryVersion = ref(0)

defineProps({
  dark: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  changeMode: [mode: string]
}>()

// State
const compiling = ref(false)
const selectedCompiler = ref("")
const isAssembled = ref(false)

// Composables
const showAssemblyError = useToggle("modalAssemblyError").show
const showLibraryTags = useToggle("library_tags").show

// Computed
const compilerOptions = computed(() => {
  const assemblers = architecture?.config?.assemblers || []

  if (assemblers.length === 0) {
    return [{ value: "CreatorCompiler", text: "CREATOR" }]
  }

  return assemblers.map((asm: { name: string }) => ({
    value: asm.name,
    text: asm.name === "CreatorCompiler" ? "CREATOR" : asm.name.toUpperCase(),
  }))
})

const showCompilerDropdown = computed(() => compilerOptions.value.length > 1)

const defaultCompiler = computed(() => getDefaultCompiler(architecture))

const selectedCompilerLabel = computed(() => {
  const found = compilerOptions.value.find(
    opt => opt.value === selectedCompiler.value,
  )
  return found ? found.text : "CREATOR"
})

const libraryLoaded = computed(() => {
  // Access libraryVersion to make this reactive to library changes
  return libraryVersion.value >= 0 && loadedLibrary && Object.keys(loadedLibrary).length !== 0
})

const libraryTagsCount = computed(() => {
  // Access libraryVersion to make this reactive
  if (libraryVersion.value < 0 || !libraryLoaded.value) return 0
  return loadedLibrary?.instructions_tag?.filter((t: any) => t.globl)?.length || 0
})

const usesCreatorAssembler = computed(() => {
  const assemblers = architecture?.config?.assemblers || []
  // If no assemblers configured, default is CREATOR
  if (assemblers.length === 0) {
    return true
  }
  // Check if CreatorCompiler is in the list
  return assemblers.some((asm: { name: string }) => asm.name === "CreatorCompiler")
})

const showLibraryButton = computed(() => {
  return usesCreatorAssembler.value && libraryLoaded.value
})

// Watch for architecture changes
watch(
  defaultCompiler,
  newCompiler => {
    if (newCompiler) {
      selectedCompiler.value = newCompiler
    }
  },
  { immediate: true },
)

// Listen for library load/remove events
onMounted(() => {
  coreEvents.on("library-loaded", () => libraryVersion.value++)
  coreEvents.on("library-removed", () => libraryVersion.value++)
})

onBeforeUnmount(() => {
  coreEvents.off("library-loaded", () => libraryVersion.value++)
  coreEvents.off("library-removed", () => libraryVersion.value++)
})

const root = (document as any).app

// Methods
async function assembly_compiler_only() {
  // Reset simulator
  root.keyboard = ""
  root.display = ""
  root.enter = null
  reset()

  compiling.value = true

  // Assemble
  const assemblerFn = assemblerMap[selectedCompiler.value]
  const ret = await (assemblerFn
    ? assembly_compile(root.assembly_code, assemblerFn)
    : assembly_compile(root.assembly_code))

  /* Reset stats */
  resetStats()
  status.executedInstructions = 0
  status.clkCycles = 0

  compiling.value = false

  // Show error/warning
  switch (ret.type) {
    case "error":
      compile_error(ret.msg)
      break

    case "warning":
      show_notification(ret.token, ret.bgcolor)
      break

    default:
      // Put rowVariant in entrypoint
      const entrypoint = instructions.at(status.execution_index)
      if (entrypoint) {
        entrypoint._rowVariant = "success"
      }
      isAssembled.value = true
      // Reset to normal after 2 seconds
      setTimeout(() => {
        isAssembled.value = false
      }, 2000)
      break
  }

  storeBackup()
}

async function assembly_compiler() {
  const root = (document as any).app

  // Reset simulator
  root.keyboard = ""
  root.display = ""
  root.enter = null
  reset()

  compiling.value = true

  // Assemble
  const assemblerFn = assemblerMap[selectedCompiler.value]
  const ret = await (assemblerFn
    ? assembly_compile(root.assembly_code, assemblerFn)
    : assembly_compile(root.assembly_code))

  /* Reset stats */
  resetStats()
  status.executedInstructions = 0
  status.clkCycles = 0

  compiling.value = false

  // Show error/warning
  switch (ret.type) {
    case "error":
      compile_error(ret.msg)
      break

    case "warning":
      show_notification(ret.token, ret.bgcolor)
      break

    default:
      // Put rowVariant in entrypoint
      const entrypoint = instructions.at(status.execution_index)
      if (entrypoint) {
        entrypoint._rowVariant = "success"
      }
      // Change to simulator view and run
      emit("changeMode", "simulator")
      break
  }

  storeBackup()
}

function toggleVim() {
  root.vim_mode = !root.vim_mode
  localStorage.setItem("conf_vim_mode", root.vim_mode.toString())

  // Google Analytics
  creator_ga(
    "configuration",
    "configuration.vim_mode",
    "configuration.vim_mode." + root.vim_mode,
  )
}

function compile_error(msg: string) {
  const root = (document as any).app

  // Set compilation msg
  root.assemblyError = msg

  // Show assembly error modal
  showAssemblyError()
}

function handleBlur() {
  window.setTimeout(() => (dropdownOpen.value = false), 200)
}
</script>

<template>
  <div class="button-group">
    <!-- Assemble button with optional compiler dropdown -->
    <div v-if="showCompilerDropdown" class="assemble-dropdown-wrapper">
      <div class="split-button-group">
        <button
          class="asm-button split-main"
          :class="{
            'asm-button-dark': dark,
            'assembled-success': isAssembled,
          }"
          :disabled="compiling"
          @click="assembly_compiler_only"
        >
          <font-awesome-icon
            :icon="isAssembled ? ['fas', 'check'] : ['fas', 'hammer']"
            class="icon-spacing"
          />
          <span class="button-text"
            >Assemble ({{ selectedCompilerLabel }})</span
          >
          <span v-if="compiling" class="spinner" />
        </button>
        <button
          class="asm-button split-toggle"
          :class="{
            'asm-button-dark': dark,
            'assembled-success': isAssembled,
            open: dropdownOpen,
          }"
          :disabled="compiling"
          @click="dropdownOpen = !dropdownOpen"
          @blur="handleBlur"
        >
          <font-awesome-icon :icon="['fas', 'chevron-down']" />
        </button>
      </div>

      <!--
      <div v-if="dropdownOpen" class="dropdown-menu">
        <button
          v-for="option in compilerOptions"
          :key="option.value"
          class="dropdown-item"
          @click="
            selectedCompiler = option.value
            dropdownOpen = false
          "
        >
          <font-awesome-icon
            :icon="['fas', 'check']"
            class="icon-spacing"
            v-if="selectedCompiler === option.value"
          />
          <span :class="{ indent: selectedCompiler !== option.value }">{{
            option.text
          }}</span>
        </button>
      </div>
      -->
    </div>

    <!-- Simple assemble button (when only one compiler) -->
    <button
      v-else
      class="asm-button"
      :class="{
        'asm-button-dark': dark,
        'assembled-success': isAssembled,
      }"
      :disabled="compiling"
      @click="assembly_compiler_only"
    >
      <font-awesome-icon
        :icon="isAssembled ? ['fas', 'check'] : ['fas', 'hammer']"
        class="icon-spacing"
      />
      <span class="button-text">Assemble</span>
      <span v-if="compiling" class="spinner" />
    </button>

    <!-- Assemble & Run button -->
    <button
      class="asm-button"
      :class="{ 'asm-button-dark': dark }"
      :disabled="compiling"
      @click="assembly_compiler"
    >
      <font-awesome-icon
        :icon="['fas', 'right-to-bracket']"
        class="icon-spacing"
      />
      <span class="button-text">Assemble & Run</span>
      <span v-if="compiling" class="spinner" />
    </button>

    <!-- Vim mode -->
    <button
      class="asm-button"
      :class="{ 'asm-button-dark': dark }"
      @click="toggleVim"
    >
      <font-awesome-icon
        :icon="['fa-brands', 'vimeo-v']"
        class="icon-spacing"
      />
      <span class="button-text">Vim: {{ root.vim_mode ? "on" : "off" }}</span>
    </button>

    <!-- Library Tags button (only shown when library is loaded) -->
    <button
      v-if="showLibraryButton"
      class="asm-button library-tags-button"
      :class="{ 'asm-button-dark': dark }"
      @click="() => showLibraryTags()"
      :title="`View ${libraryTagsCount} library tag${libraryTagsCount !== 1 ? 's' : ''}`"
    >
      <font-awesome-icon
        :icon="['fas', 'tags']"
        class="icon-spacing"
      />
      <span class="button-text">Library ({{ libraryTagsCount }})</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
// Button group with gap spacing
.button-group {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

// Custom assembly button styles
.asm-button {
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

  &.asm-button-dark {
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

// Split button group
.assemble-dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.split-button-group {
  display: flex;
  gap: 1px;

  .split-main {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .split-toggle {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    padding: 5px 8px;
    min-width: auto;

    &.open {
      background-color: rgba(0, 0, 0, 0.2);
    }

    &.asm-button-dark.open {
      background-color: rgba(255, 255, 255, 0.2);
    }

    &.assembled-success.open {
      background-color: #146c43;
    }
  }
}

// Dropdown menu
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 180px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: rgba(0, 0, 0, 0.8);
  font-family: inherit;
  font-size: 0.9375rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 150ms ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .indent {
    margin-left: 1.75rem;
  }
}

// Icon spacing
.icon-spacing {
  margin-right: 0.5rem;
}

// Hide button text on mobile
.button-text {
  @media (max-width: 767px) {
    display: none;
  }
}

// Spinner animation
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-left: 0.5rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-rotate 0.75s linear infinite;
}

@keyframes spinner-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
