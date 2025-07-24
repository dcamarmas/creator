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
export default {
  props: {
    arch_conf: { type: Array, required: true },
  },

  computed: {
    config() {
      return this.arch_conf.map(({ name, value }) => {
        // format values
        if (name === "Data Format") {
          if (value === "big_endian") {
            return {
              name,
              value: "Big Endian",
            }
          } else if (value === "little_endian") {
            return {
              name,
              value: "Little Endian",
            }
          }
        } else if (
          [
            "Passing Convention",
            "Memory Alignment",
            "Sensitive Register Name",
          ].includes(name)
        ) {
          return {
            name,
            value: value === "1" ? "Enabled" : "Disabled",
          }
        }

        return { name, value }
      })
    },
  },
}
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
