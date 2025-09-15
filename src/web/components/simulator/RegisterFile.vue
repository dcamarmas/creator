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

<script>
import { REGISTERS } from "@/core/core.mjs"

import Register from "./Register.vue"

export default {
  props: {
    data_mode: { type: String, required: true },
    reg_representation_int: { type: String, required: true },
    reg_representation_float: { type: String, required: true },
    reg_name_representation: { type: String, required: true },
    dark: { type: Boolean, required: true },
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

      // space modal
      spaceItem: null,
      spaceView: false,
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
          { text: "IEEE 754 (32b)", value: "ieee32" },
          { text: "IEEE 754 (64b)", value: "ieee64" },
          { text: "Hex", value: "hex" },
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
  <b-container fluid align-h="between" class="mx-0 my-3 px-2">
    <b-row cols-xl="2" cols-lg="1" cols-md="2" cols-sm="1" cols-xs="1" cols="1">
      <b-col cols="12" xl="6" md="6" align-h="start" class="px-2 col">
        <div class="border m-1 py-1 px-2">
          <b-badge
            :variant="dark ? 'dark' : 'light'"
            class="h6 border my-0 groupLabelling"
          >
            Register value representation
          </b-badge>
          <b-form-radio-group
            :class="{ 'w-100': true, 'mb-1': true, border: dark }"
            v-model="reg_representation_value"
            :options="reg_representation_options"
            :button-variant="dark ? 'dark' : 'outline-secondary'"
            size="sm"
            buttons
          />
        </div>
      </b-col>

      <b-col cols="12" xl="6" md="6" align-h="end" class="px-2 col">
        <div class="border m-1 py-1 px-2">
          <b-badge
            :variant="dark ? 'dark' : 'light'"
            class="h6 border my-0 groupLabelling"
          >
            Register name representation
          </b-badge>

          <b-form-radio-group
            :class="{ 'w-100': true, 'mb-1': true, border: dark }"
            v-model="reg_name_representation_value"
            :options="reg_name_representation_options"
            :button-variant="dark ? 'dark' : 'outline-secondary'"
            outline
            size="sm"
            buttons
          />
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
            <b-col class="p-1 mx-0" v-for="(register, _index) in bank.elements">
              <Register
                :type="bank.type"
                :double_precision_type="
                  bank.double_precision ? bank.double_precision_type : null
                "
                :register="register"
                :name_representation="reg_name_representation_value"
                :value_representation="reg_representation_value"
                :ref="`reg${register.name[0]}`"
                :key="render"
                @register-details="
                  item => {
                    spaceItem = item
                    spaceView = true
                  }
                "
              />
            </b-col>
          </b-row>
        </b-container>
      </b-col>
    </b-row>
  </b-container>

  <!-- Space view -->
  <!--
  I'd like to have this information as a popover in the register, like in
  CREATOR 5, but unfortunately this creates so many components Vue craps its
  pants, so we'll have to use a modal.
  If you'd like to check how it was before, go to Register.vue on commit
  8fddb81c.
  -->
  <b-modal
    v-if="spaceItem"
    responsive
    no-footer
    centered
    :title="`Space view for ${spaceItem.name.join(' | ')}`"
    v-model="spaceView"
  >
    <b-table-simple small responsive bordered>
      <b-tbody>
        <b-tr>
          <b-td>Hexadecimal</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ spaceItem.hex }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr>
          <b-td>Binary</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ spaceItem.bin }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr v-if="spaceItem.type !== 'fp_registers'">
          <b-td>Signed</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ spaceItem.signed }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr v-if="spaceItem.type !== 'fp_registers'">
          <b-td>Unsigned</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ spaceItem.unsigned }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr v-if="spaceItem.type !== 'fp_registers'">
          <b-td>Char</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ spaceItem.char }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr>
          <b-td>IEEE 754 (32 bits)</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ spaceItem.ieee32 }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr>
          <b-td>IEEE 754 (64 bits)</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ spaceItem.ieee64 }}
            </b-badge>
          </b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>

    <!-- <b-container fluid align-h="center" class="mx-0">
      <b-row align-h="center" :cols="this.double_precision_type !== null ? 3 : 2">
        <b-col class="popoverFooter">
          <b-form-input
            v-model="newValue"
            type="text"
            size="sm"
            title="New Register Value"
            placeholder="Enter new value"
          />
        </b-col>

        <b-col v-if="double_precision !== null">
          <b-form-select v-model="precision" size="sm" block>
            <b-form-select-option value="false"
              >Simple Precision</b-form-select-option
            >
            <b-form-select-option value="true" active
              >Double Precision</b-form-select-option
            >
          </b-form-select>
        </b-col>

        <b-col>
          <b-button
            class="w-100"
            variant="primary"
            size="sm"
            @click="
              update_register(
                component.index,
                register.name,
                architecture.components[component.index].type,
                precision === 'true',
              )
            "
          >
            Update
          </b-button>
        </b-col>
      </b-row>
    </b-container> -->
  </b-modal>
</template>

<style lang="scss" scoped>
.registerPopover {
  background-color: #ceecf5;
  font-family: monospace;
  font-weight: normal;
}
</style>
