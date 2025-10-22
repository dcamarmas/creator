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
import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { set_debug } from "@/core/core.mjs"

export default defineComponent({
  props: {
    // Configuration props
    stack_total_list: { type: Number, required: true },
    autoscroll: { type: Boolean, required: true },
    backup: { type: Boolean, required: true },
    notification_time: { type: Number, required: true },
    instruction_help_size: { type: Number, required: true },
    dark: { type: [Boolean, null], required: true },
    c_debug: { type: Boolean, required: true },
    vim_mode: { type: Boolean, required: true },
    vim_custom_keybinds: {
      type: Array as PropType<VimKeybind[]>,
      required: true,
    },
    reg_representation_int: { type: String, required: true },
    reg_representation_float: { type: String, required: true },
    reg_name_representation: { type: String, required: true },
  },

  emits: [
    // parent variables that will be updated
    "update:stack_total_list",
    "update:autoscroll",
    "update:notification_time",
    "update:instruction_help_size",
    "update:dark",
    "update:c_debug",
    "update:vim_mode",
    "update:backup",
    "update:reg_representation_int",
    "update:reg_representation_float",
    "update:reg_name_representation",
  ],

  data() {
    return {
      // Register representation options
      reg_name_representation_options: [
        { text: "Name", value: "logical" },
        { text: "Alias", value: "alias" },
        { text: "All", value: "all" },
      ],

      reg_representation_int_options: [
        { text: "Signed", value: "signed" },
        { text: "Unsigned", value: "unsigned" },
        { text: "Hex", value: "hex" },
      ],

      reg_representation_float_options: [
        { text: "IEEE 754 (32b)", value: "ieee32" },
        { text: "IEEE 754 (64b)", value: "ieee64" },
        { text: "Hex", value: "hex" },
      ],
    }
  },

  computed: {
    // Computed properties for v-model binding
    stack_total_list_value: {
      get() {
        return this.stack_total_list
      },
      set(value: string) {
        let val = parseInt(value, 10)
        const prev = this.stack_total_list

        // enforce limit
        if (val < 20) {
          val = 20
        } else if (val > 500) {
          val = 500
        }

        this.$emit("update:stack_total_list", val)
        localStorage.setItem("conf_stack_total_list", val.toString())

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.stack_total_list",
          "configuration.stack_total_list.speed_" + (prev > val).toString(),
        )
      },
    },

    autoscroll_value: {
      get() {
        return this.autoscroll
      },
      set(value: string) {
        this.$emit("update:autoscroll", value)
        localStorage.setItem("conf_autoscroll", value)

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.autoscroll",
          "configuration.autoscroll." + value,
        )
      },
    },

    backup_value: {
      get() {
        return this.backup
      },
      set(value: string) {
        this.$emit("update:backup", value)
        localStorage.setItem("conf_backup", value)

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.backup",
          "configuration.backup." + value,
        )
      },
    },

    notification_time_value: {
      get() {
        return this.notification_time
      },
      set(value: string) {
        const prev = this.stack_total_list

        let val = parseInt(value, 10)

        // enforce limit
        if (val < 1000) {
          val = 1000
        } else if (val > 5000) {
          val = 5000
        }

        this.$emit("update:notification_time", val)
        localStorage.setItem("conf_notification_time", val.toString())

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.notification_time",
          "configuration.notification_time.time_" + (prev > val).toString(),
        )
      },
    },

    instruction_help_size_value: {
      get() {
        return this.instruction_help_size
      },
      set(value: string) {
        const prev = this.stack_total_list

        let val = parseInt(value, 10)

        // enforce limit
        if (val < 15) {
          val = 15
        } else if (val > 65) {
          val = 65
        }

        this.$emit("update:instruction_help_size", val)
        localStorage.setItem("conf_instruction_help_size", val.toString())

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.instruction_help_size",
          "configuration.instruction_help_size.size_" + (prev > val).toString(),
        )
      },
    },

    dark_value: {
      get() {
        return this.dark
      },
      set(value: boolean) {
        // update style
        document.documentElement.setAttribute(
          "data-bs-theme",
          value ? "dark" : "light",
        )

        this.$emit("update:dark", value)
        localStorage.setItem("conf_dark_mode", value.toString())

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.dark_mode",
          "configuration.dark_mode." + value,
        )
      },
    },

    c_debug_value: {
      get() {
        return this.c_debug
      },
      set(value: boolean) {
        set_debug(value)
        this.$emit("update:c_debug", value.toString())

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.debug_mode",
          "configuration.debug_mode." + value,
        )
      },
    },

    vim_mode_value: {
      get() {
        return this.vim_mode
      },
      set(value: boolean) {
        this.$emit("update:vim_mode", value)
        localStorage.setItem("conf_vim_mode", value.toString())

        // Google Analytics
        creator_ga(
          "configuration",
          "configuration.vim_mode",
          "configuration.vim_mode." + value,
        )
      },
    },

    reg_representation_int_value: {
      get() {
        return this.reg_representation_int
      },
      set(value: string) {
        this.$emit("update:reg_representation_int", value)
        localStorage.setItem("conf_reg_representation_int", value)

        // Google Analytics
        creator_ga(
          "configuration",
          "configuration.reg_representation_int",
          "configuration.reg_representation_int." + value,
        )
      },
    },

    reg_representation_float_value: {
      get() {
        return this.reg_representation_float
      },
      set(value: string) {
        this.$emit("update:reg_representation_float", value)
        localStorage.setItem("conf_reg_representation_float", value)

        // Google Analytics
        creator_ga(
          "configuration",
          "configuration.reg_representation_float",
          "configuration.reg_representation_float." + value,
        )
      },
    },

    reg_name_representation_value: {
      get() {
        return this.reg_name_representation
      },
      set(value: string) {
        this.$emit("update:reg_name_representation", value)
        localStorage.setItem("conf_reg_name_representation", value)

        // Google Analytics
        creator_ga(
          "configuration",
          "configuration.reg_name_representation",
          "configuration.reg_name_representation." + value,
        )
      },
    },
  },
})
</script>

<template>
  <div class="mobile-settings">
    <div class="mobile-settings-header">
      <h3 class="settings-title">
        <font-awesome-icon :icon="['fas', 'cog']" />
        Settings
      </h3>
    </div>

    <div class="mobile-settings-content">
      <!-- General Settings -->
      <div class="settings-section">
        <h4 class="section-title">General</h4>

        <div class="setting-item">
          <div class="setting-label">
            <font-awesome-icon :icon="['fas', 'moon']" />
            Dark Mode
          </div>
          <b-form-checkbox
            v-model="dark_value"
            switch
            size="lg"
            class="setting-toggle"
          />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <font-awesome-icon :icon="['fas', 'save']" />
            Auto Backup
          </div>
          <b-form-checkbox
            v-model="backup_value"
            switch
            size="lg"
            class="setting-toggle"
          />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <font-awesome-icon :icon="['fas', 'arrow-down']" />
            Auto Scroll
          </div>
          <b-form-checkbox
            v-model="autoscroll_value"
            switch
            size="lg"
            class="setting-toggle"
          />
        </div>
      </div>

      <!-- Display Settings -->
      <div class="settings-section">
        <h4 class="section-title">Display</h4>

        <div class="setting-item">
          <div class="setting-label">
            <font-awesome-icon :icon="['fas', 'list']" />
            Stack Values
          </div>
          <b-form-input
            v-model.number="stack_total_list_value"
            type="number"
            min="20"
            max="500"
            step="5"
            class="setting-input"
          />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <font-awesome-icon :icon="['fas', 'bell']" />
            Notification Time (ms)
          </div>
          <b-form-input
            v-model.number="notification_time_value"
            type="number"
            min="1000"
            max="5000"
            step="10"
            class="setting-input"
          />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <font-awesome-icon :icon="['fas', 'question-circle']" />
            Help Size (%)
          </div>
          <b-form-input
            v-model.number="instruction_help_size_value"
            type="number"
            min="15"
            max="65"
            step="2"
            class="setting-input"
          />
        </div>
      </div>

      <!-- Register Settings -->
      <div class="settings-section">
        <h4 class="section-title">Registers</h4>

        <div class="setting-item">
          <div class="setting-label">
            <font-awesome-icon :icon="['fas', 'tag']" />
            Register Names
          </div>
          <b-form-select
            v-model="reg_name_representation_value"
            :options="reg_name_representation_options"
            class="setting-select"
          />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <font-awesome-icon :icon="['fas', 'hashtag']" />
            Integer Format
          </div>
          <b-form-select
            v-model="reg_representation_int_value"
            :options="reg_representation_int_options"
            class="setting-select"
          />
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <font-awesome-icon :icon="['fas', 'dot-circle']" />
            Float Format
          </div>
          <b-form-select
            v-model="reg_representation_float_value"
            :options="reg_representation_float_options"
            class="setting-select"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mobile-settings {
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

.mobile-settings-header {
  padding: 1rem;
  border-bottom: 1px solid var(--bs-border-color);
  background-color: var(--bs-body-bg);
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .settings-title {
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
}

.mobile-settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;

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

.settings-section {
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--bs-body-color);
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--bs-border-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--bs-border-color-subtle);

  &:last-child {
    border-bottom: none;
  }

  .setting-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--bs-body-color);
    flex: 1;

    svg {
      color: var(--bs-primary);
      font-size: 1.1rem;
      min-width: 1.1rem;
    }
  }

  .setting-toggle {
    margin: 0;
    flex-shrink: 0;
  }

  .setting-input {
    max-width: 120px;
    text-align: right;
    font-size: 0.9rem;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    border: 1px solid var(--bs-border-color);
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    user-select: text; // Allow text selection in input fields

    &:focus {
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
    }

    [data-bs-theme="dark"] & {
      background-color: hsl(214, 9%, 15%);
      border-color: rgba(255, 255, 255, 0.1);
      color: var(--bs-body-color);
    }
  }

  .setting-select {
    max-width: 140px;
    font-size: 0.85rem;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    border: 1px solid var(--bs-border-color);
    background-color: var(--bs-body-bg);
    color: var(--bs-body-color);
    user-select: text; // Allow text selection in select fields

    &:focus {
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
    }

    [data-bs-theme="dark"] & {
      background-color: hsl(214, 9%, 15%);
      border-color: rgba(255, 255, 255, 0.1);
      color: var(--bs-body-color);
    }
  }
}

// Touch-friendly interactions
@media (hover: none) and (pointer: coarse) {
  .setting-item {
    min-height: 48px; // Minimum touch target
    padding: 0.25rem 0;

    .setting-label {
      font-size: 1rem;
    }
  }
}

// Responsive adjustments
@media (max-width: 480px) {
  .mobile-settings-header {
    padding: 0.75rem;
  }

  .mobile-settings-content {
    padding: 0.75rem;
  }

  .setting-item {
    .setting-input {
      max-width: 100px;
    }

    .setting-select {
      max-width: 120px;
      font-size: 0.8rem;
    }
  }
}
</style>