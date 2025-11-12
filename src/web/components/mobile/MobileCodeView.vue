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

<script lang="ts">
import { defineComponent } from "vue"
import { assembly_compile, status, architecture } from "@/core/core.mjs"
import { resetStats } from "@/core/executor/stats.mts"
import { assemblerMap, getDefaultCompiler } from "@/web/assemblers"
import MobileEditor from "@/web/components/assembly/MobileEditor.vue"
import Examples from "@/web/components/assembly/Examples.vue"
import MobileInstructionHelp from "@/web/components/mobile/MobileInstructionHelp.vue"
import LoadLibrary from "@/web/components/assembly/LoadLibrary.vue"
import LibraryTags from "@/web/components/assembly/LibraryTags.vue"

export default defineComponent({
  props: {
    architecture_name: { type: String, required: true },
    assembly_code: { type: String, required: true },
    dark: { type: [Boolean, null], required: true },
  },

  emits: [
    "update:assembly_code",
    "assembly-error",
    "switch-to-simulator",
    "reset-simulator",
    "show-toast",
    "reset-code",
  ],

  components: {
    MobileEditor,
    Examples,
    MobileInstructionHelp,
    LoadLibrary,
    LibraryTags,
  },

  data() {
    return {
      code: this.assembly_code,
      isAssembled: false,
    }
  },

  watch: {
    assembly_code: {
      handler(newCode: string) {
        this.code = newCode
      },
      immediate: true,
    },
    code: {
      handler(newCode: string) {
        this.$emit("update:assembly_code", newCode)
      },
    },
  },

  methods: {
    async assemble() {
      // Reset simulator state (emit events instead of direct access)
      this.$emit("reset-simulator")

      // Reset stats
      resetStats()
      status.executedInstructions = 0
      status.clkCycles = 0

      // Assemble the code - use default compiler for mobile
      const defaultCompiler = getDefaultCompiler(architecture)
      const assemblerFn = assemblerMap[defaultCompiler]
      const ret = await assembly_compile(this.code, assemblerFn)

      // Handle results
      if (ret.status !== "ok") {
        this.isAssembled = false
        this.$emit("assembly-error", ret.msg)
        // Emit toast event
        this.$emit("show-toast", {
          message: ret.msg,
          title: "Assembly Error",
          variant: "danger"
        })
      } else {
        this.isAssembled = true
        // Compilation successful - switch to simulator
        this.$emit("switch-to-simulator")
        // Reset to normal after 2 seconds
        setTimeout(() => {
          this.isAssembled = false
        }, 2000)
      }

      return true // Return true for keymap handler
    },

    resetCode() {
      this.code = ""
      this.$emit("update:assembly_code", "")
      this.$emit("reset-code")
      this.isAssembled = false
    },
  },
})
</script>

<template>
  <div class="mobile-code-view">
    <div class="mobile-code-header">
      <div class="code-info">
        <h3 class="code-title">
          <font-awesome-icon :icon="['fas', 'code']" />
          Assembly
        </h3>
      </div>

      <div class="code-actions">
        <b-button
          :variant="isAssembled ? 'success' : 'primary'"
          size="sm"
          @click="assemble"
          title="Assemble"
        >
          <font-awesome-icon :icon="isAssembled ? ['fas', 'check'] : ['fas', 'play']" />
          <span class="btn-text">Assemble</span>
        </b-button>
        <b-dropdown
          variant="outline-secondary"
          size="sm"
          title="More"
          no-caret
        >
          <template #button-content>
            <font-awesome-icon :icon="['fas', 'bars']" />
          </template>
          <b-dropdown-item v-b-modal.instruction-help-mobile>
            <font-awesome-icon :icon="['fas', 'question-circle']" />
            Instruction Help
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.examples-mobile>
            <font-awesome-icon :icon="['fas', 'file-lines']" />
            Examples
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.load-library-mobile>
            <font-awesome-icon :icon="['fas', 'upload']" />
            Load Library
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.library-tags-mobile>
            <font-awesome-icon :icon="['fas', 'tags']" />
            View Library Tags
          </b-dropdown-item>
          <b-dropdown-item @click="resetCode">
            <font-awesome-icon :icon="['fas', 'trash']" />
            Clear
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </div>

    <div class="mobile-code-editor">
      <MobileEditor
        :os="'mobile'"
        :assembly_code="code"
        height="100%"
        :dark="dark || false"
      />
    </div>
  </div>

  <!-- Examples modal -->
  <Examples
    id="examples-mobile"
    :architecture_name="architecture_name"
    :compile="false"
  />

  <!-- Instruction Help modal -->
  <MobileInstructionHelp
    id="instruction-help-mobile"
    :architecture_name="architecture_name"
  />

  <!-- Load Library modal -->
  <LoadLibrary id="load-library-mobile" />

  <!-- Library Tags modal -->
  <LibraryTags id="library-tags-mobile" />
</template>

<style lang="scss" scoped>
.mobile-code-view {
  position: fixed;
  top: env(safe-area-inset-top);
  left: 0;
  right: 0;
  bottom: calc(56px + env(safe-area-inset-bottom)); // Above mobile navbar + safe area
  
  // Reduce bottom spacing on very small screens to match navbar height
  @media (max-width: 320px) {
    bottom: calc(48px + env(safe-area-inset-bottom));
  }
  background-color: var(--bs-body-bg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none; // Prevent text selection on mobile

  // Dark mode support
  [data-bs-theme="dark"] & {
    background-color: hsl(214, 9%, 12%);
  }
}

.mobile-code-header {
  padding: 0.5rem;
  border-bottom: 1px solid var(--bs-border-color);
  background-color: var(--bs-body-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;

  .code-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-self: center;

    .code-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--bs-body-color);
      display: flex;
      align-items: center;
      gap: 0.5rem;

      svg {
        color: var(--bs-primary);
      }
    }

    .architecture-badge {
      font-size: 0.75rem;
      color: var(--bs-secondary-color);
      background-color: var(--bs-light);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      align-self: flex-start;

      [data-bs-theme="dark"] & {
        background-color: hsl(214, 9%, 20%);
        color: var(--bs-body-color);
      }
    }
  }

  .code-actions {
    display: flex;
    gap: 0.5rem;
    .menu-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 6px;

      svg {
        font-size: 0.9rem;
      }
    }
  }

  .btn-text {
    margin-left: 0.5rem;
  }
}

.mobile-code-editor {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0; // Allow flex item to shrink below content size

  .code-editor {
    height: 100%;
    width: 100%;
    border: none;
    border-radius: 0;
    user-select: text; // Allow text selection in code editor
    overflow: hidden; // Let CodeMirror handle its own scrolling

    :deep(.cm-editor) {
      height: 100%;
      border-radius: 0;
      user-select: text; // Allow text selection in CodeMirror
      overflow: hidden; // Let CodeMirror handle its own scrolling
    }

    :deep(.cm-scroller) {
      padding: 0;
      overflow: auto; // Ensure scrolling works
      height: 100%; // Take full height of editor
    }

    :deep(.cm-content) {
      padding: 1rem;
      font-size: 14px;
      line-height: 1.4;
    }

    :deep(.cm-focused) {
      outline: none;
      box-shadow: none;
    }

    // Mobile-specific styling
    :deep(.cm-line) {
      padding: 2px 0;
    }

    :deep(.cm-gutters) {
      border-right: 1px solid var(--bs-border-color);
      background-color: var(--bs-light);

      [data-bs-theme="dark"] & {
        background-color: hsl(214, 9%, 15%);
      }
    }

    :deep(.cm-activeLineGutter) {
      background-color: var(--bs-primary);
      color: white;
    }
  }
}

.mobile-keyboard-hint {
  padding: 0.75rem 1rem;
  background-color: var(--bs-light);
  border-top: 1px solid var(--bs-border-color);
  text-align: center;
  flex-shrink: 0;

  [data-bs-theme="dark"] & {
    background-color: hsl(214, 9%, 15%);
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  svg {
    margin-right: 0.5rem;
    color: var(--bs-primary);
  }
}

// Mobile optimizations
@media (max-width: 480px) {
  .mobile-code-header {
    padding: 0.5rem;

    .code-info {
      .code-title {
        font-size: 1.1rem;
      }
    }
  }

  .mobile-code-editor {
    .code-editor {
      :deep(.cm-content) {
        padding: 0.75rem;
        font-size: 13px;
      }
    }
  }
}

// Touch-friendly interactions
@media (hover: none) and (pointer: coarse) {
  .mobile-code-header {
    :deep(.btn) {
      min-height: 44px; // Minimum touch target
    }
    
    :deep(.dropdown-toggle) {
      min-height: 44px; // Minimum touch target
      min-width: 44px;
    }
  }
}
</style>