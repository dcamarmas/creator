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
import { defineComponent, type PropType } from "vue"

import { status } from "@/core/core.mjs"
import type { Stat } from "@/core/executor/stats.mjs"

export default defineComponent({
  props: {
    stats: { type: Map as PropType<Map<string, Stat>>, required: true },
    type: { type: String, required: true },
    dark: { type: Boolean, required: true },
  },

  computed: {
    statsValues() {
      return Array.from(this.stats.entries()).map(([k, v]) => {
        const value = this.type === "instructions" ? v.instructions : v.cycles

        return {
          type: k,
          number: value,
          percentage:
            ((100 * value) / this.totalExecuted || 0).toFixed(2) + "%",
        }
      })
    },

    totalExecuted() {
      return this.type === "instructions"
        ? status.executedInstructions
        : status.clkCycles
    },

    fields() {
      return [
        {
          key: "type",
          label: "Type",
          sortable: true,
        },
        {
          key: "number",
          label: `Number of ${this.type}`,
          sortable: true,
        },
        {
          key: "percentage",
          label: "Percentage",
          sortable: true,
        },
      ]
    },
  },
})
</script>

<template>
  <b-table
    responsive
    striped
    small
    hover
    :items="statsValues"
    :fields="fields"
    class="stats text-center px-0"
  />
</template>
