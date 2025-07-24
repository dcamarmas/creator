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
import { toHex } from "@/web/utils.mjs"

export default {
  props: {
    registers: { type: Array, required: true },
    register_file_index: { type: Number, required: true },
  },

  data() {
    return {
      // Directives table fields
      registers_fields: ["name", "ID", "nbits", "default_value", "properties"],
    }
  },

  methods: { toHex },
}
</script>

<template>
  <b-table
    :items="registers"
    class="text-center"
    :fields="registers_fields"
    v-if="registers.length > 0"
    sticky-header
  >
    <!-- For each register -->

    <template v-slot:cell(name)="row">
      {{ registers[row.index].name.join(" | ") }}
    </template>

    <template v-slot:cell(ID)="row">
      <!-- TODO: take into account double precision registers -->
      {{ row.index }}
    </template>

    <template v-slot:cell(default_value)="row">
      <span class="font-monospace">
        0x{{ toHex(row.item.default_value, 4) }}
      </span>
    </template>

    <template v-slot:cell(properties)="row">
      <b-badge
        class="m-1"
        v-for="property in registers[row.index].properties"
        pill
        variant="primary"
      >
        {{ property }}
      </b-badge>
    </template>
  </b-table>
</template>
