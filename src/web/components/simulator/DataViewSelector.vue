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

<script lang="ts">
import { defineComponent } from "vue"

import { creator_ga } from "@/core/utils/creator_ga.mjs"

export default defineComponent({
  props: {
    data_mode: { type: String, required: true },
    register_file_num: { type: Number, required: true },
    dark: { type: Boolean, required: true },
  },

  computed: {
    current_reg_type: {
      // sync with App's data_mode
      get() {
        return this.data_mode
      },
      set(value: string) {
        ;(this.$root as any).data_mode = value

        /* Google Analytics */
        creator_ga("send", "event", "data.view." + value)
      },
    },
    current_reg_name() {
      switch (this.current_reg_type) {
        case "int_registers":
          return "INT/Ctrl Registers"
        case "fp_registers":
          return "FP Registers"

        default:
          return ""
      }
    },
  },

  data() {
    return {
      reg_representation_options: [
        { text: "INT/Ctrl Registers", value: "int_registers" },
        { text: "FP Registers", value: "fp_registers" },
      ],
      dropdownOpen: false,
    }
  },

  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    change_data_view(e: string) {
      this.current_reg_type = e
      this.dropdownOpen = false
    },

    toggleDropdown(event: Event) {
      event.stopPropagation()
      this.dropdownOpen = !this.dropdownOpen
    },

    handleClickOutside(event: Event) {
      const target = event.target as HTMLElement
      if (!target.closest('.tab-dropdown')) {
        this.dropdownOpen = false
      }
    },

    getVariant(): "secondary" | "outline-secondary" {
      if (
        this.current_reg_type === "int_registers" ||
        this.current_reg_type === "fp_registers"
      ) {
        return "secondary"
      }

      return "outline-secondary"
    },

    isSelected(button: string): boolean {
      return button === this.current_reg_type
    },
  },
})
</script>

<template>
  <div class="data-view-selector">
    <div class="tabs-container">
      <!-- Registers Tab -->
      <button
        v-if="register_file_num <= 4"
        :class="['tab', { active: current_reg_type === 'int_registers' }]"
        @click="change_data_view('int_registers')"
      >
        <font-awesome-icon :icon="['fas', 'microchip']" />
        <span>Registers</span>
      </button>


      <!-- Dropdown for multiple register banks -->
      <div v-if="register_file_num > 4" class="tab-dropdown">
        <button
          :class="['tab', { active: current_reg_type === 'int_registers' || current_reg_type === 'fp_registers' }]"
          @click="toggleDropdown"
        >
          <font-awesome-icon :icon="['fas', 'microchip']" />
          <span>{{ current_reg_name }}</span>
          <font-awesome-icon :icon="['fas', 'chevron-down']" class="dropdown-icon" />
        </button>
        <div v-if="dropdownOpen" class="dropdown-menu">
          <button class="dropdown-item" @click="change_data_view('int_registers')">
            CPU-INT/Ctrl Registers
          </button>
          <button class="dropdown-item" @click="change_data_view('fp_registers')">
            CPU-FP Registers
          </button>
        </div>
      </div>

      <!-- Memory Tab -->
      <button
        :class="['tab', { active: current_reg_type === 'memory' }]"
        @click="change_data_view('memory')"
      >
        <font-awesome-icon :icon="['fas', 'memory']" />
        <span>Memory</span>
      </button>

      <!-- Terminal Tab -->
      <button
        :class="['tab', { active: current_reg_type === 'terminal' }]"
        @click="change_data_view('terminal')"
      >
        <font-awesome-icon :icon="['fas', 'terminal']" />
        <span>Terminal</span>
      </button>
      
      <!-- Statistics Tab -->
      <button
        :class="['tab', { active: current_reg_type === 'stats' }]"
        @click="change_data_view('stats')"
      >
        <font-awesome-icon :icon="['fas', 'chart-line']" />
        <span>Statistics</span>
      </button>


    </div>
  </div>
</template>

<style scoped>
.data-view-selector {
  width: 100%;
  user-select: none;
}

.tabs-container {
  display: flex;
  gap: 0.25rem;
  padding: 6px;
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  overflow: hidden;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 24px;
  min-width: 16px;
  padding: 5px 10px;
  cursor: pointer;
  position: relative;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: bold;
  
  /* Light theme colors */
  color: rgba(0, 0, 0, 0.8);
  background-color: color-mix(in srgb, currentColor 10%, transparent);
  box-shadow: none;
  
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.tab:hover {
  background-color: color-mix(in srgb, currentColor 15%, transparent);
}

.tab:active {
  background-color: color-mix(in srgb, currentColor 30%, transparent);
}

/* Active/checked state for selected tab */
.tab.active {
  background-color: color-mix(in srgb, currentColor 30%, transparent);
  color: rgba(0, 0, 0, 0.9);
}

.tab.active:hover {
  background-color: color-mix(in srgb, currentColor 35%, transparent);
}

.tab.active:active {
  background-color: color-mix(in srgb, currentColor 40%, transparent);
}

.tab:focus-visible {
  outline: 2px solid color-mix(in srgb, currentColor 50%, transparent);
  outline-offset: 2px;
  transition: outline 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.tab svg {
  font-size: 14px;
  opacity: 0.9;
}

.tab.active svg {
  opacity: 1;
}

.tab span {
  display: inline;
}


/* Dark theme support */
[data-bs-theme="dark"] {
  .tabs-container {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }

  .tab-separator {
    color: rgba(255, 255, 255, 0.15);
  }

  .tab {
    color: rgba(255, 255, 255, 0.9);
  }

  .tab.active {
    color: rgba(255, 255, 255, 1);
  }

  .dropdown-menu {
    background: #2d2d2d;
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .dropdown-item {
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
