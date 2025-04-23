<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos

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

<script>
import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { set_debug } from "@/core/core.mjs"

export default {
  props: {
    id: { type: String, required: true },
    arch_available: Array,
    default_architecture: { type: String, required: true },
    stack_total_list: { type: Number, required: true },
    autoscroll: { type: Boolean, required: true },
    notification_time: { type: Number, required: true },
    instruction_help_size: { type: Number, required: true },
    dark: { type: Boolean, required: true },
    c_debug: { type: Boolean, required: true },
  },
  emits: [
    // parent variables that will be updated
    "update:default_architecture",
    "update:stack_total_list",
    "update:autoscroll",
    "update:notification_time",
    "update:instruction_help_size",
    "update:dark",
    "update:c_debug",
  ],
  computed: {
    // modifying these variables will update the corresponding parent's variables
    // see https://vuejs.org/guide/components/v-model
    default_architecture_value: {
      get() {
        return this.default_architecture
      },
      set(value) {
        this.$emit("update:default_architecture", value)

        localStorage.setItem("conf_default_architecture", value)

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.default_architecture",
          "configuration.default_architecture." + value,
        )
      },
    },
    stack_total_list_value: {
      get() {
        return this.stack_total_list
      },
      set(value) {
        value = parseInt(value, 10)

        const prev = this.stack_total_list

        // enforce limit
        if (value < 20) {
          value = 20
        } else if (value > 500) {
          value = 500
        }

        this.$emit("update:stack_total_list", value)

        localStorage.setItem("conf_stack_total_list", value)

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.stack_total_list",
          "configuration.stack_total_list.speed_" + (prev > value).toString(),
        )
      },
    },
    autoscroll_value: {
      get() {
        return this.autoscroll
      },
      set(value) {
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
    notification_time_value: {
      get() {
        return this.notification_time
      },
      set(value) {
        const prev = this.stack_total_list

        value = parseInt(value, 10)

        // enforce limit
        if (value < 1000) {
          value = 1000
        } else if (value > 5000) {
          value = 5000
        }

        this.$emit("update:notification_time", value)

        localStorage.setItem("conf_notification_time", value)

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.notification_time",
          "configuration.notification_time.time_" + (prev > value).toString(),
        )
      },
    },
    instruction_help_size_value: {
      get() {
        return this.instruction_help_size
      },
      set(value) {
        const prev = this.stack_total_list

        value = parseInt(value, 10)

        // enforce limit
        if (value < 15) {
          value = 15
        } else if (value > 65) {
          value = 65
        }

        this.$emit("update:instruction_help_size", value)

        localStorage.setItem("conf_instruction_help_size", value)

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.instruction_help_size",
          "configuration.instruction_help_size.size_" +
            (prev > value).toString(),
        )
      },
    },
    dark_value: {
      get() {
        return this.dark
      },
      set(value) {
        // update style
        if (value) {
          document.getElementsByTagName("body")[0].style =
            "filter: invert(88%) hue-rotate(160deg) !important; background-color: #111 !important;"
        } else {
          document.getElementsByTagName("body")[0].style = ""
        }

        this.$emit("update:dark", value)
        localStorage.setItem("conf_dark_mode", value)

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
      set(value) {
        set_debug(value)

        this.$emit("update:c_debug", value)

        //Google Analytics
        creator_ga(
          "configuration",
          "configuration.debug_mode",
          "configuration.debug_mode." + value,
        )
      },
    },
  },
}
</script>

<template>
  <b-modal :id="id" title="Configuration">
    <b-list-group>
      <b-list-group-item class="justify-content-between align-items-center m-1">
        <label for="range-5">Default Architecture:</label>

        <!-- TODO: load from arch_available -->
        <b-form-select
          v-model="default_architecture_value"
          size="sm"
          title="Default Architecture"
        >
          <BFormSelectOption value="'none'">None</BFormSelectOption>
          <BFormSelectOption value="'RISC-V (RV32IMFD)'"
            >RISC-V (RV32IMFD)</BFormSelectOption
          >
          <BFormSelectOption value="'MIPS-32'">MIPS-32</BFormSelectOption>
        </b-form-select>
      </b-list-group-item>

      <b-list-group-item class="justify-content-between align-items-center m-1">
        <label for="range-1">Maximum stack values listed:</label>
        <b-input-group>
          <!-- <b-button variant="outline-secondary" @click="stack_total_list_value -= 5">-</b-button> -->
          <b-form-input
            id="range-1"
            v-model="stack_total_list_value"
            type="range"
            min="20"
            max="500"
            step="5"
            title="Stack max view"
          />
          <!-- <b-button variant="outline-secondary" @click="stack_total_list_value += 5">+</b-button> -->
        </b-input-group>
      </b-list-group-item>

      <b-list-group-item class="justify-content-between align-items-center m-1">
        <label for="range-3">Notification Time:</label>
        <b-input-group>
          <!-- <b-button variant="outline-secondary" @click="notification_time_value -= 20">-</b-button> -->
          <b-form-input
            id="range-3"
            v-model="notification_time_value"
            type="range"
            min="1000"
            max="5000"
            step="10"
            title="Notification Time"
          />
          <!-- <b-button variant="outline-secondary" @click="notification_time_value += 20">+</b-button> -->
        </b-input-group>
      </b-list-group-item>

      <b-list-group-item class="justify-content-between align-items-center m-1">
        <label for="range-3">Instruction Help Size:</label>
        <b-input-group>
          <!-- <b-button variant="outline-secondary" @click="instruction_help_size_value -= 2">-</b-button> -->
          <b-form-input
            id="range-3"
            v-model="instruction_help_size_value"
            type="range"
            min="15"
            max="65"
            step="2"
            title="Instruction Help Size"
          />
          <!-- <b-button variant="outline-secondary" @click="instruction_help_size_value += 2">+</b-button> -->
        </b-input-group>
      </b-list-group-item>

      <b-list-group-item class="justify-content-between align-items-center m-1">
        <label for="range-2">Execution Autoscroll:</label>
        <b-form-checkbox
          id="range-2"
          v-model="autoscroll_value"
          name="check-button"
          switch
          size="lg"
        />
      </b-list-group-item>

      <!-- <b-list-group-item class="justify-content-between align-items-center m-1">
        <label for="range-4">Font Size:</label>
        <b-input-group>
          <b-button variant="outline-secondary" @click="font_size_value -= 1">-</b-button>
          <b-form-input id="range-4" v-model="fontSize" type="range" min="8" max="48" step="1" title="Font Size" />
          <b-button variant="outline-secondary" @click="font_size_value += 1">+</b-button>
        </b-input-group>
      </b-list-group-item> -->

      <b-list-group-item class="justify-content-between align-items-center m-1">
        <label for="range-5">Dark Mode:</label>
        <b-form-checkbox
          id="range-5"
          name="check-button"
          switch
          size="lg"
          v-model="dark_value"
        />
      </b-list-group-item>

      <b-list-group-item class="justify-content-between align-items-center m-1">
        <label for="range-6">Debug:</label>
        <b-form-checkbox
          id="range-6"
          v-model="c_debug_value"
          name="check-button"
          switch
          size="lg"
        />
      </b-list-group-item>
    </b-list-group>
  </b-modal>
</template>
