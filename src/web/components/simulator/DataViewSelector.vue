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
    }
  },

  methods: {
    change_data_view(e: string) {
      this.current_reg_type = e
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
  <b-container fluid align-h="center" class="mx-0 px-2">
    <b-row cols="1">
      <b-col class="px-1">
        <b-button-group class="w-100 pb-3">
          <!-- Registers -->
          <b-dropdown
            split
            v-if="register_file_num > 4"
            right
            :text="current_reg_name"
            size="sm"
            :variant="getVariant()"
            @click="change_data_view(current_reg_type)"
          >
            <b-dropdown-item @click="change_data_view('int_registers')">
              CPU-INT/Ctrl Registers
            </b-dropdown-item>
            <b-dropdown-item @click="change_data_view('fp_registers')">
              CPU-FP Registers
            </b-dropdown-item>
          </b-dropdown>

          <b-button
            v-else
            v-for="register_type in reg_representation_options"
            :id="register_type.value"
            size="sm"
            :class="{ border: dark }"
            :pressed="isSelected(register_type.value)"
            :variant="dark ? 'dark' : 'outline-secondary'"
            @click="change_data_view(register_type.value)"
          >
            <font-awesome-icon :icon="['fas', 'microchip']" />
            {{ register_type.text }}
          </b-button>

          <b-button
            id="memory_btn"
            size="sm"
            :pressed="isSelected('memory')"
            :class="{ border: dark }"
            :variant="dark ? 'dark' : 'outline-secondary'"
            @click="change_data_view('memory')"
          >
            <font-awesome-icon :icon="['fas', 'memory']" />
            Memory
          </b-button>

          <b-button
            id="stats_btn"
            size="sm"
            :pressed="isSelected('stats')"
            :class="{ border: dark }"
            :variant="dark ? 'dark' : 'outline-secondary'"
            @click="change_data_view('stats')"
          >
            <font-awesome-icon :icon="['fas', 'chart-line']" />
            Statistics
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>
  </b-container>
</template>
