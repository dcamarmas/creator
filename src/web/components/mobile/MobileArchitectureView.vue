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
import { defineComponent, type PropType } from "vue"

import { architecture } from "@/core/core.mjs"

import EditArchitecture from "../architecture/EditArchitecture.vue"
import DownloadPopup from "../general/DownloadModal.vue"
import ArchConf from "../architecture/configuration/ArchConf.vue"
import RegisterFileArch from "../architecture/register_file/RegisterFileArch.vue"
import Instructions from "../architecture/instructions/Instructions.vue"
import Directives from "../architecture/directives/Directives.vue"
import Pseudoinstructions from "../architecture/pseudoinstructions/Pseudoinstructions.vue"

export default defineComponent({
  props: {
    browser: { type: String, required: true },
    os: { type: String, required: true },
    arch_available: Array as PropType<AvailableArch[]>,
    architecture_name: String,
    dark: { type: Boolean, required: true },
    arch_code: { type: String, required: true },
  },
  components: {
    EditArchitecture,
    DownloadPopup,
    ArchConf,
    RegisterFileArch,
    Instructions,
    Directives,
    Pseudoinstructions,
  },
  data() {
    return {
      architecture,
      activeSection: null as string | null,
    }
  },
  methods: {
    toggleSection(section: string) {
      this.activeSection = this.activeSection === section ? null : section
    },
  },
})
</script>

<template>
  <div class="mobile-architecture-view">
    <div class="mobile-architecture-header">
      <h2 class="architecture-title">
        <font-awesome-icon :icon="['fas', 'microchip']" />
        Architecture View
      </h2>
      <p class="architecture-subtitle">Explore the current architecture details</p>
    </div>

    <div class="mobile-architecture-content">
      <!-- Edit architecture modal -->
      <EditArchitecture
        id="edit_architecture_mobile"
        :arch_code="arch_code"
        :dark="dark"
      />

      <!-- Download architecture modal -->
      <DownloadPopup
        id="save_architecture_mobile"
        type="architecture"
        title="Download Architecture"
        extension=".yml"
        :fileData="arch_code"
        default-filename="architecture"
      />

      <!-- Architecture sections in accordion -->
      <div class="architecture-accordion">
        <!-- Architecture Info -->
        <div class="accordion-section">
          <button
            class="accordion-header"
            @click="toggleSection('arch-info')"
            :class="{ active: activeSection === 'arch-info' }"
          >
            <div class="accordion-title">
              <font-awesome-icon :icon="['fas', 'info-circle']" />
              Architecture Info
            </div>
            <font-awesome-icon
              :icon="['fas', activeSection === 'arch-info' ? 'chevron-up' : 'chevron-down']"
              class="accordion-icon"
            />
          </button>
          <div
            class="accordion-content"
            v-show="activeSection === 'arch-info'"
          >
            <ArchConf :conf="architecture.config" />
          </div>
        </div>

        <!-- Memory Layout -->
        <div class="accordion-section">
          <button
            class="accordion-header"
            @click="toggleSection('memory-layout')"
            :class="{ active: activeSection === 'memory-layout' }"
          >
            <div class="accordion-title">
              <font-awesome-icon :icon="['fas', 'memory']" />
              Memory Layout
            </div>
            <font-awesome-icon
              :icon="['fas', activeSection === 'memory-layout' ? 'chevron-up' : 'chevron-down']"
              class="accordion-icon"
            />
          </button>
          <div
            class="accordion-content"
            v-show="activeSection === 'memory-layout'"
          >
          </div>
        </div>

        <!-- Register File -->
        <div class="accordion-section">
          <button
            class="accordion-header"
            @click="toggleSection('register-file')"
            :class="{ active: activeSection === 'register-file' }"
          >
            <div class="accordion-title">
              <font-awesome-icon :icon="['fas', 'database']" />
              Register File
            </div>
            <font-awesome-icon
              :icon="['fas', activeSection === 'register-file' ? 'chevron-up' : 'chevron-down']"
              class="accordion-icon"
            />
          </button>
          <div
            class="accordion-content"
            v-show="activeSection === 'register-file'"
          >
            <RegisterFileArch :register_file="architecture.components" />
          </div>
        </div>

        <!-- Instructions -->
        <div class="accordion-section">
          <button
            class="accordion-header"
            @click="toggleSection('instructions')"
            :class="{ active: activeSection === 'instructions' }"
          >
            <div class="accordion-title">
              <font-awesome-icon :icon="['fas', 'code']" />
              Instructions
            </div>
            <font-awesome-icon
              :icon="['fas', activeSection === 'instructions' ? 'chevron-up' : 'chevron-down']"
              class="accordion-icon"
            />
          </button>
          <div
            class="accordion-content"
            v-show="activeSection === 'instructions'"
          >
            <Instructions :instructions="architecture.instructions" />
          </div>
        </div>

        <!-- Pseudoinstructions -->
        <div v-if="architecture.pseudoinstructions && architecture.pseudoinstructions.length > 0" class="accordion-section">
          <button
            class="accordion-header"
            @click="toggleSection('pseudoinstructions')"
            :class="{ active: activeSection === 'pseudoinstructions' }"
          >
            <div class="accordion-title">
              <font-awesome-icon :icon="['fas', 'magic']" />
              Pseudoinstructions
            </div>
            <font-awesome-icon
              :icon="['fas', activeSection === 'pseudoinstructions' ? 'chevron-up' : 'chevron-down']"
              class="accordion-icon"
            />
          </button>
          <div
            class="accordion-content"
            v-show="activeSection === 'pseudoinstructions'"
          >
            <Pseudoinstructions
              :pseudoinstructions="architecture.pseudoinstructions"
            />
          </div>
        </div>

        <!-- Directives -->
        <div class="accordion-section">
          <button
            class="accordion-header"
            @click="toggleSection('directives')"
            :class="{ active: activeSection === 'directives' }"
          >
            <div class="accordion-title">
              <font-awesome-icon :icon="['fas', 'cogs']" />
              Directives
            </div>
            <font-awesome-icon
              :icon="['fas', activeSection === 'directives' ? 'chevron-up' : 'chevron-down']"
              class="accordion-icon"
            />
          </button>
          <div
            class="accordion-content"
            v-show="activeSection === 'directives'"
          >
            <Directives :directives="architecture.directives" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mobile-architecture-view {
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

.mobile-architecture-header {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid var(--bs-border-color);
  background-color: var(--bs-body-bg);
  flex-shrink: 0;

  .architecture-title {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--bs-body-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;

    svg {
      color: var(--bs-primary);
    }
  }

  .architecture-subtitle {
    margin: 0;
    font-size: 0.95rem;
    color: var(--bs-body-color-secondary);
    opacity: 0.8;
  }
}

.mobile-architecture-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.architecture-accordion {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.accordion-section {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--bs-border-color);
  background-color: var(--bs-body-bg);

  [data-bs-theme="dark"] & {
    background-color: hsl(214, 9%, 15%);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.accordion-header {
  width: 100%;
  padding: 1rem;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 1rem;
  font-weight: 600;
  color: var(--bs-body-color);

  &:hover {
    background-color: var(--bs-light);

    [data-bs-theme="dark"] & {
      background-color: hsl(214, 9%, 20%);
    }
  }

  &.active {
    background-color: var(--bs-primary);
    color: white;

    .accordion-icon {
      color: white;
    }
  }
}

.accordion-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: var(--bs-primary);
    font-size: 1.1rem;
  }

  .accordion-header.active & svg {
    color: white;
  }
}

.accordion-icon {
  color: var(--bs-body-color-secondary);
  font-size: 0.9rem;
  transition: transform 0.2s ease;
}

.accordion-content {
  padding: 1rem;
  border-top: 1px solid var(--bs-border-color);
  background-color: var(--bs-light);

  [data-bs-theme="dark"] & {
    background-color: hsl(214, 9%, 10%);
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  :deep(.table) {
    margin-bottom: 0;
  }

  :deep(.card) {
    border: none;
    background: transparent;
  }

  :deep(.card-header) {
    background: transparent;
    border: none;
    padding: 0.5rem 0;
  }

  :deep(.card-body) {
    padding: 0.5rem 0;
  }
}

// Mobile optimizations
@media (max-width: 480px) {
  .mobile-architecture-header {
    padding: 0.75rem;

    .architecture-title {
      font-size: 1.3rem;
    }

    .architecture-subtitle {
      font-size: 0.9rem;
    }
  }

  .mobile-architecture-content {
    padding: 0.75rem;
  }

  .accordion-header {
    padding: 0.875rem;
    font-size: 0.95rem;
  }

  .accordion-content {
    padding: 0.75rem;
  }
}

// Touch-friendly interactions
@media (hover: none) and (pointer: coarse) {
  .accordion-header {
    min-height: 48px; // Minimum touch target
  }
}
</style>