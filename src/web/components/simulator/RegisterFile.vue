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

export default {
  props: {
    // render: { type: Number, required: true },
    data_mode: { type: String, required: true },
    components: { type: Object, required: true },
  },

  components: {
    Register,
  },

  data() {
    return {
      local_data_mode: "int_registers",

      //Register value representation
      reg_representation: "signed",
      reg_representation_options_int: [
        { text: "Signed", value: "signed" },
        { text: "Unsigned", value: "unsigned" },
        { text: "Hex", value: "hex" },
      ],

      reg_representation_options_fp: [
        { text: "IEEE 754 (32 bits)", value: "ieee32" },
        { text: "IEEE 754 (64 bits)", value: "ieee64" },
      ],

      //Register name representation
      reg_name_representation: "all",
      reg_name_representation_options: [
        { text: "Name", value: "logical" },
        { text: "Alias", value: "alias" },
        { text: "All", value: "all" },
      ],
    }
  },

  methods: {
    mk_reg_representation_options() {
      if (
        this.data_mode === "int_registers" ||
        this.data_mode === "ctrl_registers"
      ) {
        if (this.data_mode !== this.local_data_mode) {
          this.reg_representation = "signed"
          this.local_data_mode = this.data_mode
        }
        return this.reg_representation_options_int
      } else {
        if (this.data_mode !== this.local_data_mode) {
          this.reg_representation = "ieee32"
          this.local_data_mode = this.data_mode
        }
        return this.reg_representation_options_fp
      }
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
            <b-badge variant="light" class="h6 groupLabelling border mx-2 my-0">
              Register value representation
            </b-badge>
            <b-form-group class="mb-2" v-slot="{ ariaDescribedby }">
              <b-form-radio-group
                id="btn-radios-1"
                class="w-100"
                v-model="reg_representation"
                :options="mk_reg_representation_options()"
                button-variant="outline-secondary"
                size="sm"
                :aria-describedby="ariaDescribedby"
                name="radios-btn-default"
                buttons
              />
            </b-form-group>
          </div>
        </b-col>

        <b-col cols="12" xl="6" md="6" align-h="end" class="px-2 col">
          <div class="border m-1 py-1 px-2">
            <b-badge variant="light" class="h6 groupLabelling border mx-2 my-0">
              Register name representation
            </b-badge>
            <b-form-group class="mb-2" v-slot="{ ariaDescribedby }">
              <b-form-radio-group
                id="btn-radios-2"
                class="w-100"
                v-model="reg_name_representation"
                :options="reg_name_representation_options"
                button-variant="outline-secondary"
                size="sm"
                :aria-describedby="ariaDescribedby"
                name="radios-btn-default"
                buttons
              />
            </b-form-group>
          </div>
        </b-col>
      </b-row>
    </b-container>

    <b-container fluid align-h="center" class="mx-0 px-3 my-2">
      <b-row align-h="center" cols="1">
        <b-col v-for="bank in components">
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
                <!-- :render="render" -->
                <Register
                  :type="bank.type"
                  :double_precision_type="
                    bank.double_precision ? bank.double_precision_type : null
                  "
                  :register="register"
                  :name_representation="reg_name_representation"
                  :value_representation="reg_representation"
                />
              </b-col>
            </b-row>
          </b-container>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>
