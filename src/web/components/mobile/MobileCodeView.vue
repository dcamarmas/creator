<!--
Copyright 2018-2025 CREATOR Team.

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
import { ref, watch } from "vue";
import { getDefaultCompiler } from "@/web/assemblers";
import MobileEditor from "@/web/components/assembly/MobileEditor.vue";
import Examples from "@/web/components/assembly/Examples.vue";
import MobileInstructionHelp from "@/web/components/mobile/MobileInstructionHelp.vue";
import LoadLibrary from "@/web/components/assembly/LoadLibrary.vue";
import LibraryTags from "@/web/components/assembly/LibraryTags.vue";
import {
  useAssembly,
  type AssemblyResult,
} from "@/web/composables/useAssembly";

interface Props {
  architecture_name: string;
  assembly_code: string;
  dark: boolean | null;
}

interface Emits {
  (e: "update:assembly_code", value: string): void;
  (e: "assembly-error", msg: string): void;
  (e: "switch-to-simulator"): void;
  (e: "reset-simulator"): void;
  (
    e: "show-toast",
    toast: { message: string; title: string; variant: string },
  ): void;
  (e: "reset-code"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const code = ref(props.assembly_code);
const isAssembled = ref(false);

// Watch for prop changes
watch(
  () => props.assembly_code,
  newCode => {
    code.value = newCode;
  },
);

watch(code, newCode => {
  emit("update:assembly_code", newCode);
});

// Use assembly composable
const { assemble } = useAssembly({
  resetSimulator: false, // Mobile component emits events instead
  onError: (result: AssemblyResult) => {
    isAssembled.value = false;
    emit("assembly-error", result.msg || "Unknown error");
    emit("show-toast", {
      message: result.msg || "Unknown error",
      title: "Assembly Error",
      variant: "danger",
    });
  },
  onWarning: (_result: AssemblyResult) => {
    // Handle warnings if needed
  },
  onSuccess: () => {
    isAssembled.value = true;
    emit("switch-to-simulator");
    // Reset to normal after 2 seconds
    setTimeout(() => {
      isAssembled.value = false;
    }, 2000);
  },
});

async function assembleCode() {
  // Reset simulator state (emit events instead of direct access)
  emit("reset-simulator");

  // Use default compiler for mobile
  const defaultCompiler = getDefaultCompiler({ config: { assemblers: [] } });
  await assemble(code.value, defaultCompiler);

  return true; // Return true for keymap handler
}

function resetCode() {
  code.value = "";
  emit("update:assembly_code", "");
  emit("reset-code");
  isAssembled.value = false;
}
</script>

<template>

  <div class="mobile-code-view">

    <div class="mobile-code-header">

      <div class="code-info">

        <h3 class="code-title">
           <font-awesome-icon :icon="['fas', 'code']" /> Assembly
        </h3>

      </div>

      <div class="code-actions">
         <b-button
          :variant="isAssembled ? 'success' : 'primary'"
          size="sm"
          @click="assembleCode"
          title="Assemble"
          > <font-awesome-icon
            :icon="isAssembled ? ['fas', 'check'] : ['fas', 'play']"
          /> <span class="btn-text">Assemble</span> </b-button
        > <b-dropdown
          variant="outline-secondary"
          size="sm"
          title="More"
          no-caret
          > <template #button-content
            > <font-awesome-icon :icon="['fas', 'bars']" /> </template
          > <b-dropdown-item v-b-modal.instruction-help-mobile
            > <font-awesome-icon :icon="['fas', 'question-circle']" />
            Instruction Help </b-dropdown-item
          > <b-dropdown-item v-b-modal.examples-mobile
            > <font-awesome-icon :icon="['fas', 'file-lines']" /> Examples
            </b-dropdown-item
          > <b-dropdown-item v-b-modal.load-library-mobile
            > <font-awesome-icon :icon="['fas', 'upload']" /> Load Library
            </b-dropdown-item
          > <b-dropdown-item v-b-modal.library-tags-mobile
            > <font-awesome-icon :icon="['fas', 'tags']" /> View Library Tags
            </b-dropdown-item
          > <b-dropdown-item @click="resetCode"
            > <font-awesome-icon :icon="['fas', 'trash']" /> Clear
            </b-dropdown-item
          > </b-dropdown
        >
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
   <!-- Examples modal --> <Examples
    id="examples-mobile"
    :architecture_name="architecture_name"
    :compile="false"
  /> <!-- Instruction Help modal --> <MobileInstructionHelp
    id="instruction-help-mobile"
    :architecture_name="architecture_name"
  /> <!-- Load Library modal --> <LoadLibrary id="load-library-mobile" /> <!-- Library Tags modal -->
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

