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
import Register from "./Register.vue"
import { REGISTERS } from "@/core/core.mjs"

export default {
  props: {
    data_mode: { type: String, required: true },
    reg_representation_int: { type: String, required: true },
    reg_representation_float: { type: String, required: true },
    reg_name_representation: { type: String, required: true },
  },

  components: {
    Register,
  },
  
  data() {
    return {
      register_file: REGISTERS,

      reg_name_representation_options: [
        { text: "Name", value: "logical" },
        { text: "Alias", value: "alias" },
        { text: "All", value: "all" },
      ],

      render: 0n, // dummy variable to force components with this as key to refresh
    }
  },

  computed: {
    // sync w/ root
    reg_representation_value: {
      get() {
        return this.data_mode === "fp_registers"
          ? this.reg_representation_float
          : this.reg_representation_int
      },
      set(value) {
        if (this.data_mode === "fp_registers") {
          this.$root.reg_representation_float = value
        } else {
          this.$root.reg_representation_int = value
        }
      },
    },

    // sync w/ root
    reg_name_representation_value: {
      get() {
        return this.reg_name_representation
      },
      set(value) {
        this.$root.reg_name_representation = value
      },
    },

    reg_representation_options() {
      if (
        this.data_mode === "int_registers" ||
        this.data_mode === "ctrl_registers"
      ) {
        return [
          { text: "Signed", value: "signed" },
          { text: "Unsigned", value: "unsigned" },
          { text: "Hex", value: "hex" },
        ]
      } else {
        return [
          { text: "IEEE 754 (32 bits)", value: "ieee32" },
          { text: "IEEE 754 (64 bits)", value: "ieee64" },
        ]
      }
    },
  },

  methods: {
    refresh() {
      // refreshes children components with `:key="render"`
      this.render++
    },
  },
}
</script>

<template>
  <div>
    <b-container fluid align-h="between" class="mx-0 my-3 px-2">
      <b-row
        cols-xl="2"
        cols-lg="1"
        cols-md="2"
        cols-sm="1"
        cols-xs="1"
        cols="1"
      >
        <b-col cols="12" xl="6" md="6" align-h="start" class="px-2 col">
          <div class="border m-1 py-1 px-2">
            <b-badge variant="light" class="h6 groupLabelling border mx-2 mb-1">
              Register value representation
            </b-badge>
            <b-form-group class="mb-2">
              <b-form-radio-group
                class="w-100"
                v-model="reg_representation_value"
                :options="reg_representation_options"
                button-variant="outline-secondary"
                size="sm"
                buttons
              />
            </b-form-group>
          </div>
        </b-col>

        <b-col cols="12" xl="6" md="6" align-h="end" class="px-2 col">
          <div class="border m-1 py-1 px-2">
            <b-badge variant="light" class="h6 groupLabelling border mx-2 mb-1">
              Register name representation
            </b-badge>
            <b-form-group class="mb-2">
              <b-form-radio-group
                class="w-100"
                v-model="reg_name_representation_value"
                :options="reg_name_representation_options"
                button-variant="outline-secondary"
                size="sm"
                buttons
              />
            </b-form-group>
          </div>
        </b-col>
      </b-row>
    </b-container>

    <b-container fluid align-h="center" class="mx-0 px-3 my-2">
      <b-row align-h="center" cols="1">
        <b-col v-for="bank in register_file">
          <b-container
            fluid
            align-h="center"
            class="px-0 mx-0 mb-2"
            v-if="
              data_mode === bank.type ||
              (data_mode === 'int_registers' && bank.type === 'ctrl_registers')
            "
          >
            <b-row
              align-h="start"
              cols-xl="4"
              cols-lg="4"
              cols-md="4"
              cols-sm="3"
              cols-xs="3"
              cols="3"
            >
              <b-col
                class="p-1 mx-0"
                v-for="(register, _index) in bank.elements"
              >
                <Register
                  :type="bank.type"
                  :double_precision_type="
                    bank.double_precision ? bank.double_precision_type : null
                  "
                  :register="register"
                  :name_representation="reg_name_representation_value"
                  :value_representation="reg_representation_value"
                  :ref="'reg' + register.name[0]"
                  :key="render"
                />
              </b-col>
            </b-row>
          </b-container>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style lang="scss" scoped>
.groupLabelling {
  float: top;
  position: relative;
  top: -0.6vw;
}
</style>
