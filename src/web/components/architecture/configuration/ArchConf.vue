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

const configMap = new Map<string, string>([
  ["name", "Name"],
  ["word_size", "WordSize"],
  ["description", "Description"],
  ["endianness", "Endianness"],
  ["memory_alignment", "Memory Alignment"],
  ["main_function", "Main Function"],
  ["passing_convention", "Passing Convention"],
  ["sensitive_register_name", "Sensitive Register Name"],
  ["comment_prefix", "Comment Prefix"],
  ["start_address", "Start Address"],
  ["pc_offset", "PC Offset"],
  ["byte_size", "Byte Size"],
  ["assemblers", "Assemblers"],
])

function formatValue(attr: string, value: string) {
  if (attr === "endianness") {
    if (value === "big_endian") {
      return "Big Endian"
    } else if (value === "little_endian") {
      return "Little Endian"
    }
  } else if (
    [
      "passing_convention",
      "memory_alignment",
      "sensitive_register_name",
    ].includes(attr)
  ) {
    return value ? "Enabled" : "Disabled"
  }

  return value
}

export default defineComponent({
  props: {
    conf: { type: Object, required: true },
  },

  computed: {
    config() {
      return Object.entries(this.conf)
        .filter(([attr, _v]) => attr !== "assemblers") // no assemblers
        .map(([attr, value]) => ({
          name: configMap.get(attr),
          value: formatValue(attr, value),
        }))
    },
  },
})
</script>

<template>
  <b-table
    small
    :items="config"
    :fields="[{ key: 'name', label: 'Field' }, 'value']"
    class="text-center mt-3"
    sticky-header="60vh"
  />
</template>
