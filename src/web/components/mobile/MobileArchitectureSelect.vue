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
import {
  loadDefaultArchitecture,
  loadCustomArchitecture,
} from "@/web/utils.mjs"
import { initCAPI } from "@/core/capi/initCAPI.mts"
import { architecture } from "@/core/core"

interface AvailableArch {
  name: string
  alias: string[]
  file?: string
  img?: string
  alt?: string
  id: string
  examples: string[]
  description: string
  guide?: string
  available: boolean
  default?: boolean
}

export default defineComponent({
  props: {
    arch_available: { type: Array as PropType<AvailableArch[]>, required: true },
    dark: { type: [Boolean, null], required: true },
  },

  emits: [
    "select-architecture", // architecture has been selected
  ],

  computed: {
    availableArchitectures() {
      return this.arch_available.filter(arch => arch.available)
    },
  },

  methods: {
    /**
     * Selects an architecture by emitting the 'select-architecture' event
     */
    async select_arch(arch: AvailableArch) {
      if (arch.default) {
        await loadDefaultArchitecture(arch as any)
      } else {
        loadCustomArchitecture(arch)
      }
      const pluginName = architecture.config.plugin
      // Now we can initialize the CAPI with the plugin name
      initCAPI(pluginName)
      this.$emit("select-architecture", arch.name)
    },
  },
})
</script>

<template>
  <div class="mobile-arch-select">
    <div class="mobile-arch-header">
      <h2 class="arch-title">
        <font-awesome-icon :icon="['fas', 'microchip']" />
        Select Architecture
      </h2>
      <p class="arch-subtitle">Choose an architecture to start programming</p>
    </div>

    <div class="mobile-arch-list">
      <div
        v-for="arch in availableArchitectures"
        :key="arch.id"
        class="arch-item"
        @click="select_arch(arch)"
      >
        <div class="arch-item-content">
          <div class="arch-logo">
            <img
              :src="`img/logos/${arch.img}` || 'img/logos/default.webp'"
              :alt="arch.alt"
              class="arch-image"
            />
          </div>
          <div class="arch-info">
            <h3 class="arch-name">{{ arch.name }}</h3>
          </div>
        </div>
        <div class="arch-arrow">
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mobile-arch-select {
  position: fixed;
  top: env(safe-area-inset-top);
  left: 0;
  right: 0;
  bottom: env(safe-area-inset-bottom); // Full height with safe area
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

.mobile-arch-header {
  padding: 1.5rem 1rem 1rem;
  text-align: center;
  border-bottom: 1px solid var(--bs-border-color);

  .arch-title {
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

  .arch-subtitle {
    margin: 0;
    font-size: 0.95rem;
    color: var(--bs-body-color-secondary);
    opacity: 0.8;
  }
}

.mobile-arch-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }

  [data-bs-theme="dark"] & {
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.arch-item {
  background-color: transparent;
  border: none;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  color: #6c757d;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  // Dark mode
  [data-bs-theme="dark"] & {
    color: #adb5bd;
  }

  &:active {
    color: #2196f3;
    background-color: rgba(33, 150, 243, 0.08);
    transform: scale(0.98);

    [data-bs-theme="dark"] & {
      color: #64b5f6;
      background-color: rgba(100, 181, 246, 0.12);
    }
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.arch-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.arch-logo {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
}

.arch-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.arch-info {
  flex: 1;
  min-width: 0;

  .arch-name {
    margin: 0 0 0.25rem;
    font-size: 1rem;
    font-weight: 600;
    color: inherit;
    line-height: 1.3;
  }

  .arch-description {
    margin: 0;
    font-size: 0.85rem;
    color: var(--bs-body-color-secondary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
  }
}

.arch-arrow {
  color: var(--bs-body-color-secondary);
  opacity: 0.6;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  .arch-item:active & {
    color: #2196f3;
    opacity: 1;

    [data-bs-theme="dark"] & {
      color: #64b5f6;
    }
  }
}

// Touch-friendly interactions
@media (hover: none) and (pointer: coarse) {
  .arch-item {
    min-height: 72px; // Minimum touch target
    padding: 1.25rem;

    .arch-item-content {
      gap: 0.875rem;
    }

    .arch-logo {
      width: 50px;
      height: 50px;
      padding: 0.4rem;
    }

    .arch-info {
      .arch-name {
        font-size: 1rem;
      }

      .arch-description {
        font-size: 0.85rem;
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 480px) {
  .mobile-arch-header {
    padding: 1rem 0.75rem 0.75rem;

    .arch-title {
      font-size: 1.3rem;
    }

    .arch-subtitle {
      font-size: 0.9rem;
    }
  }

  .mobile-arch-list {
    padding: 0.25rem;
  }

  .arch-item {
    padding: 0.875rem;
    margin-bottom: 0.25rem;

    .arch-item-content {
      gap: 0.625rem;
    }

    .arch-logo {
      width: 44px;
      height: 44px;
      padding: 0.35rem;
    }

    .arch-info {
      .arch-name {
        font-size: 0.95rem;
      }

      .arch-description {
        font-size: 0.8rem;
      }
    }

    .arch-arrow {
      font-size: 0.8rem;
    }
  }
}
</style>