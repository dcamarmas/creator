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
import ToolbarBtngroup from "./ToolbarBtngroup.vue"
/**
 * @deprecated This component is deprecated. Toolbar functionality has been
 * integrated into NavbarCREATOR for better space efficiency.
 * This component now renders nothing to maintain backward compatibility
 * while the views are being updated.
 */
export default defineComponent({
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
})
</script>

<template>
  <!-- Toolbar has been moved to the main navbar for better vertical space usage -->
  <div :id="id" style="display: none;"></div>
</template>
