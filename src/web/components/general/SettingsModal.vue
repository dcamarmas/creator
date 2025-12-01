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
<script lang="ts">
import { creator_ga } from "@/core/utils/creator_ga.mjs";
import { set_debug } from "@/core/core.mjs";
import { Vim } from "@replit/codemirror-vim";

import VimKeybindsModal from "./VimKeybindsModal.vue";
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  props: {
    id: { type: String, required: true },
    arch_available: Array as PropType<AvailableArch[]>,
    default_architecture: { type: String, required: true },
    stack_total_list: { type: Number, required: true },
    autoscroll: { type: Boolean, required: true },
    backup: { type: Boolean, required: true },
    notification_time: { type: Number, required: true },
    instruction_help_size: { type: Number, required: true },
    dark_mode_setting: { type: String, required: true },
    c_debug: { type: Boolean, required: true },
    vim_custom_keybinds: {
      type: Array as PropType<VimKeybind[]>,
      required: true,
    },
    vim_mode: { type: Boolean, required: true },
    reg_representation_int: { type: String, required: true },
    reg_representation_float: { type: String, required: true },
    reg_name_representation: { type: String, required: true },
  },

  components: { VimKeybindsModal },

  data() {
    return {
      // vim config
      vim_expanded: false,
      selected_vim_keybind: null as number | null,
      newVimKeybind: {
        mode: "normal",
        lhs: "",
        rhs: "",
      },

      // register representation options
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
    };
  },
  emits: [
    // parent variables that will be updated
    "update:default_architecture",
    "update:stack_total_list",
    "update:autoscroll",
    "update:notification_time",
    "update:instruction_help_size",
    "update:dark_mode_setting",
    "update:c_debug",
    "update:vim_custom_keybinds",
    "update:vim_mode",
    "update:backup",
    "update:reg_representation_int",
    "update:reg_representation_float",
    "update:reg_name_representation",
  ],
  computed: {
    // placeholder for editing a vim keybind
    // we create a copy bc we don't want to sync the value automatically, we
    // want to wait for confirmation from the user to execute
    // modifySelectedVimKeybind
    modifiedVimKeybind(): VimKeybind {
      // copy selected keybind
      return { ...this.vim_custom_keybinds_value[this.selected_vim_keybind!]! };
    },

    // modifying these variables will update the corresponding parent's variables
    // see https://vuejs.org/guide/components/v-model
    default_architecture_value: {
      get() {
        return this.default_architecture;
      },
      set(value: string) {
        this.$emit("update:default_architecture", value);

        localStorage.setItem("conf_default_architecture", value);

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.default_architecture",
          "configuration.default_architecture." + value,
        );
      },
    },
    stack_total_list_value: {
      get() {
        return this.stack_total_list;
      },
      set(value: string) {
        let val = parseInt(value, 10);

        const prev = this.stack_total_list;

        // enforce limit
        if (val < 20) {
          val = 20;
        } else if (val > 500) {
          val = 500;
        }

        this.$emit("update:stack_total_list", val);

        localStorage.setItem("conf_stack_total_list", val.toString());

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.stack_total_list",
          "configuration.stack_total_list.speed_" + (prev > val).toString(),
        );
      },
    },
    autoscroll_value: {
      get() {
        return this.autoscroll;
      },
      set(value: string) {
        this.$emit("update:autoscroll", value);

        localStorage.setItem("conf_autoscroll", value);

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.autoscroll",
          "configuration.autoscroll." + value,
        );
      },
    },
    backup_value: {
      get() {
        return this.backup;
      },
      set(value: string) {
        this.$emit("update:backup", value);

        localStorage.setItem("conf_backup", value);

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.backup",
          "configuration.backup." + value,
        );
      },
    },
    notification_time_value: {
      get() {
        return this.notification_time;
      },
      set(value: string) {
        const prev = this.stack_total_list;

        let val = parseInt(value, 10);

        // enforce limit
        if (val < 1000) {
          val = 1000;
        } else if (val > 5000) {
          val = 5000;
        }

        this.$emit("update:notification_time", val);

        localStorage.setItem("conf_notification_time", val.toString());

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.notification_time",
          "configuration.notification_time.time_" + (prev > val).toString(),
        );
      },
    },
    instruction_help_size_value: {
      get() {
        return this.instruction_help_size;
      },
      set(value: string) {
        const prev = this.stack_total_list;

        let val = parseInt(value, 10);

        // enforce limit
        if (val < 15) {
          val = 15;
        } else if (val > 65) {
          val = 65;
        }

        this.$emit("update:instruction_help_size", val);

        localStorage.setItem("conf_instruction_help_size", val.toString());

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.instruction_help_size",
          "configuration.instruction_help_size.size_" + (prev > val).toString(),
        );
      },
    },
    dark_mode_setting_value: {
      get() {
        return this.dark_mode_setting;
      },
      set(value: string) {
        this.$emit("update:dark_mode_setting", value);

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.dark_mode_setting",
          "configuration.dark_mode_setting." + value,
        );
      },
    },
    c_debug_value: {
      get() {
        return this.c_debug;
      },
      set(value: boolean) {
        set_debug(value);

        this.$emit("update:c_debug", value.toString());

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.debug_mode",
          "configuration.debug_mode." + value,
        );
      },
    },
    vim_custom_keybinds_value: {
      get() {
        return this.vim_custom_keybinds;
      },
      set(value: VimKeybind[]) {
        this.$emit("update:vim_custom_keybinds", value);
      },
    },
    vim_mode_value: {
      get() {
        return this.vim_mode;
      },
      set(value: boolean) {
        this.$emit("update:vim_mode", value);
        localStorage.setItem("conf_vim_mode", value.toString());

        // Google Analytics
        creator_ga(
          "configuration",
          "configuration.vim_mode",
          "configuration.vim_mode." + value,
        );
      },
    },
    reg_representation_int_value: {
      get() {
        return this.reg_representation_int;
      },
      set(value: string) {
        this.$emit("update:reg_representation_int", value);
        localStorage.setItem("conf_reg_representation_int", value);

        // Google Analytics
        creator_ga(
          "configuration",
          "configuration.reg_representation_int",
          "configuration.reg_representation_int." + value,
        );
      },
    },
    reg_representation_float_value: {
      get() {
        return this.reg_representation_float;
      },
      set(value: string) {
        this.$emit("update:reg_representation_float", value);
        localStorage.setItem("conf_reg_representation_float", value);

        // Google Analytics
        creator_ga(
          "configuration",
          "configuration.reg_representation_float",
          "configuration.reg_representation_float." + value,
        );
      },
    },
    reg_name_representation_value: {
      get() {
        return this.reg_name_representation;
      },
      set(value: string) {
        this.$emit("update:reg_name_representation", value);
        localStorage.setItem("conf_reg_name_representation", value);

        // Google Analytics
        creator_ga(
          "configuration",
          "configuration.reg_name_representation",
          "configuration.reg_name_representation." + value,
        );
      },
    },
  },
  methods: {
    removeVimKeybind(index: number) {
      const { lhs, mode } = this.vim_custom_keybinds_value[index]!;

      Vim.unmap(lhs, mode);
      this.vim_custom_keybinds_value.splice(index, 1);
    },
  },
  watch: {
    // as we're not replacing this property, but mutating it, it will not
    // trigger the computed property setter, so we must do this
    vim_custom_keybinds_value: {
      handler(value: VimKeybind[], _old: VimKeybind[]) {
        localStorage.setItem(
          "conf_vim_custom_keybinds",
          // if you store an object in localstorage, it saves it as the *string*
          // '[object Object]', so we'll have to serialize it manually
          JSON.stringify(value),
        );

        // // Google Analytics
        // creator_ga(
        //   "configuration",
        //   "configuration.vim_custom_keybinds",
        //   "configuration.vim_custom_keybinds." + value,
        // )
      },
      deep: true,
    },
  },
});
</script>

<template>
  <b-modal :id="id" scrollable title="Configuration">
    <b-list-group class="compact-config">
      <!--
      <b-list-group-item class="justify-content-between align-items-center config-item">
        <label for="range-5">Default Architecture:</label>

        <b-form-select
          v-model="default_architecture_value"
          size="sm"
          title="Default Architecture"
        >
          <BFormSelectOption value="'none'">None</BFormSelectOption>
          <BFormSelectOption value="'RISC-V (RV32IMFD)'">
            RISC-V (RV32IMFD)
          </BFormSelectOption>
          <BFormSelectOption value="'MIPS-32'">MIPS-32</BFormSelectOption>
        </b-form-select>
      </b-list-group-item>
      -->
      <b-list-group-item
        class="justify-content-between align-items-center config-item"
      >
        <label for="range-1">Maximum stack values listed:</label>
        <b-form-input
          id="range-1"
          v-model.number="stack_total_list_value"
          type="number"
          min="20"
          max="500"
          step="5"
          title="Stack max view"
          class="number-input"
        />
      </b-list-group-item>
      <b-list-group-item
        class="justify-content-between align-items-center config-item"
      >
        <label for="range-3">Notification Time (ms):</label>
        <b-form-input
          id="range-3"
          v-model.number="notification_time_value"
          type="number"
          min="1000"
          max="5000"
          step="10"
          title="Notification Time"
          class="number-input"
        />
      </b-list-group-item>
      <b-list-group-item
        class="justify-content-between align-items-center config-item"
      >
        <label for="range-4">Instruction Help Size (%):</label>
        <b-form-input
          id="range-4"
          v-model.number="instruction_help_size_value"
          type="number"
          min="15"
          max="65"
          step="2"
          title="Instruction Help Size"
          class="number-input"
        />
      </b-list-group-item>
      <b-list-group-item
        class="justify-content-between align-items-center config-item"
      >
        <label for="range-2">Execution Autoscroll:</label>
        <b-form-checkbox
          id="range-2"
          v-model="autoscroll_value"
          name="check-button"
          switch
          size="lg"
        />
      </b-list-group-item>
      <b-list-group-item
        class="justify-content-between align-items-center config-item"
      >
        <label for="range-2">Automatic backup:</label>
        <b-form-checkbox
          id="range-2"
          v-model="backup_value"
          name="check-button"
          switch
          size="lg"
        />
      </b-list-group-item>
      <!--
      <b-list-group-item class="justify-content-between align-items-center config-item">
        <label for="range-4">Font Size:</label>
        <b-input-group>
          <b-button variant="outline-secondary" @click="font_size_value -= 1">-</b-button>
          <b-form-input id="range-4" v-model="fontSize" type="range" min="8" max="48" step="1" title="Font Size" />
          <b-button variant="outline-secondary" @click="font_size_value += 1">+</b-button>
        </b-input-group>
      </b-list-group-item>
      -->
      <b-list-group-item
        class="justify-content-between align-items-center config-item"
      >
        <label for="range-5">Theme:</label>
        <b-form-select
          id="range-5"
          v-model="dark_mode_setting_value"
          size="sm"
          title="Dark Mode Setting"
          class="representation-select"
        >
          <b-form-select-option value="system">System</b-form-select-option>
          <b-form-select-option value="dark">Dark</b-form-select-option>
          <b-form-select-option value="light">Light</b-form-select-option>
        </b-form-select>
      </b-list-group-item>
      <b-list-group-item
        class="justify-content-between align-items-center config-item"
      >
        <label for="range-6">Debug:</label>
        <b-form-checkbox
          id="range-6"
          v-model="c_debug_value"
          name="check-button"
          switch
          size="lg"
        />
      </b-list-group-item>
      <!-- Vim config -->
      <b-list-group-item
        class="justify-content-between align-items-center config-item"
      >
        <label for="range-2">Vim mode:</label>
        <b-form-checkbox
          v-model="vim_mode_value"
          name="check-button"
          switch
          size="lg"
        />
      </b-list-group-item>
      <b-list-group-item class="config-item vim-keybinds-section">
        <div class="vim-keybinds-header">
          <label for="range-7">Vim Custom Keybinds:</label>
          <!-- toggle button -->
          <b-button
            @click="vim_expanded = !vim_expanded"
            :variant="vim_expanded ? 'secondary' : 'primary'"
            size="sm"
          >
            <font-awesome-icon
              v-if="vim_expanded"
              icon="fa-solid fa-caret-up"
            />
            <font-awesome-icon v-else icon="fa-solid fa-caret-down" />
          </b-button>
        </div>
        <b-collapse v-model="vim_expanded" class="vim-keybinds-content">
          <b-table
            small
            hover
            sticky-header="25vh"
            :items="vim_custom_keybinds_value"
            :fields="[
              { key: 'mode', sortable: true, class: 'text-center' },
              { key: 'lhs', label: 'LHS', class: 'text-center font-monospace' },
              { key: 'rhs', label: 'RHS', class: 'text-center font-monospace' },
              { key: 'buttons', label: '', class: 'text-center' },
            ]"
          >
            <!-- mode in uppercase -->
            <template #cell(mode)="keybind">
              {{ (keybind.value as string).toUpperCase() }}
            </template>

            <!-- edit buttons -->
            <template #cell(buttons)="keybind">
              <b-button-group size="sm">
                <b-button
                  variant="primary"
                  v-b-toggle.modal-vim-edit
                  @click="selected_vim_keybind = keybind.index"
                >
                  <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                </b-button>
                <b-button
                  variant="danger"
                  @click="removeVimKeybind(keybind.index)"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </b-button>
              </b-button-group>
            </template>
          </b-table>

          <b-container fluid>
            <b-row align-h="end">
              <b-button v-b-toggle.modal-vim-new variant="primary" size="sm">
                <font-awesome-icon :icon="['fas', 'plus']" />
              </b-button>
            </b-row>
          </b-container>
        </b-collapse>
      </b-list-group-item>

      <!-- Register Representation Settings -->
      <b-list-group-item
        class="justify-content-between align-items-center config-item"
      >
        <label>Register Name Representation:</label>
        <b-form-select
          v-model="reg_name_representation_value"
          :options="reg_name_representation_options"
          size="sm"
          class="representation-select"
        />
      </b-list-group-item>
      <b-list-group-item
        class="justify-content-between align-items-center config-item"
      >
        <label>Register Value Format:</label>
        <b-form-select
          v-model="reg_representation_int_value"
          :options="reg_representation_int_options"
          size="sm"
          class="representation-select"
        />
      </b-list-group-item>
    </b-list-group>
  </b-modal>

  <VimKeybindsModal
    id="modal-vim-edit"
    title="Edit Vim keybind"
    type="edit"
    :selected_vim_keybind="selected_vim_keybind"
    v-model:vim_custom_keybinds="vim_custom_keybinds_value"
  />

  <VimKeybindsModal
    id="modal-vim-new"
    title="New Vim keybind"
    type="new"
    :selected_vim_keybind="selected_vim_keybind"
    v-model:vim_custom_keybinds="vim_custom_keybinds_value"
  />
</template>

<style lang="scss" scoped>
.compact-config {
  .config-item {
    padding: 0.35rem 0.75rem;
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    position: relative;

    label {
      margin: 0;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .form-check,
    .input-group,
    .form-select {
      margin: 0;
      flex-shrink: 0;
    }

    .input-group {
      max-width: 200px;
    }

    .number-input {
      max-width: 100px;
      text-align: right;
    }

    .representation-select {
      max-width: 200px;
      flex-shrink: 0;
    }

    // Fix dropdown overflow
    .dropdown {
      position: static;
    }

    .dropdown-menu {
      position: absolute;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1050;
    }
  }

  .vim-keybinds-section {
    flex-direction: column;
    align-items: stretch;
    padding: 0.35rem 0.75rem;

    .vim-keybinds-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      label {
        margin: 0;
        white-space: nowrap;
      }

      button {
        flex-shrink: 0;
      }
    }

    .vim-keybinds-content {
      width: 100%;
      margin-top: 0.5rem;
    }
  }
}
</style>
