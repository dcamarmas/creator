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
import ToolbarBtngroup from "./ToolbarBtngroup.vue"

export default {
  props: {
    id: { type: String, required: true },
    components: { type: String, required: true },
    browser: { type: String, required: true },
    os: { type: String, required: true },
    dark: { type: Boolean, required: true },
    arch_available: { type: Array, required: false },
    assembly_code: { type: String, required: false },
    show_instruction_help: { type: Boolean, default: false },
    instructions: Array,
  },

  computed: {
    components_array() {
      return this.components.split("|")
    },
  },
  components: { ToolbarBtngroup },
}
</script>

<template>
  <b-container :id="id" fluid align-h="center" class="menu my-3 mx-0 px-0">
    <b-row cols-xl="4" cols-lg="3" cols-md="3" cols-sm="2" cols-xs="1" cols="1">
      <b-col class="px-2 py-1" v-for="(item, i) in components_array">
        <ToolbarBtngroup
          :group="item.split(',')"
          :browser="browser"
          :os="os"
          :dark="dark"
          :architectures="arch_available"
          :assembly_code="assembly_code"
          :show_instruction_help="show_instruction_help"
          :instructions="instructions"
          :ref="`btngroup${i}`"
        />

        <div class="w-100 d-block d-sm-none"></div>
      </b-col>
    </b-row>
  </b-container>
</template>
