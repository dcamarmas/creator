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
import { creator_ga } from "@/core/utils/creator_ga.mjs"

export default {
  props: {
    instructions: { type: Array, required: true },
    enter: { type: [Boolean, null], required: true },
  },

  data() {
    return {
      /*Instrutions table fields*/
      archInstructions: [
        "Address",
        "Label",
        "userInstructions",
        "loadedInstructions",
      ],
    }
  },

  computed: {
    processedInstructions() {
      return this.instructions.map(instruction => ({
        ...instruction,
        _cellVariants: instruction.Break ? { Address: 'danger' } : {}
      }))
    }
  },

  methods: {
    /* Filter table instructions */
    filter(row, _filter) {
      if (row.hide === true) {
        return false
      } else {
        return true
      }
    },

    /* Enter a breakpoint */
    breakPoint(record, index) {
      for (let i = 0; i < this.instructions.length; i++) {
        if (this.instructions[i].Address === record.Address) {
          index = i
          break
        }
      }

      if (this.instructions[index].Break === null) {
        this.$root.instructions[index].Break = true

        /* Google Analytics */
        creator_ga(
          "send",
          "event",
          "execute",
          "execute.breakpoint",
          "execute.breakpoint",
        )
      } else if (this.instructions[index].Break) {
        this.$root.instructions[index].Break = null
      }
    },
  },
}
</script>

<template>
  <b-table id="inst_table" sticky-header="100%" small hover :items="processedInstructions" :fields="archInstructions"
    class="instructions_table" @row-clicked="breakPoint" :filter-function="filter" filter=" " primary-key="Address">
    <!-- column headers -->
    <template #head(userInstructions)="_row"> User Instruction </template>

    <template #head(loadedInstructions)="_row">
      Loaded Instructions
    </template>

    <!-- address -->
    <template #cell(Address)="row">
      <span>{{ row.item.Address }}</span>
    </template>

    <!-- label -->
    <template #cell(Label)="row">
      <b-badge pill variant="info">{{ row.item.Label }}</b-badge>
    </template>

    <!-- user instruction -->
    <template #cell(userInstructions)="row">
      <span v-if="row.item.visible">
        {{ row.item.user }}
      </span>
      <span v-else> &lt;&lt;Hidden&gt;&gt; </span>
    </template>

    <!-- loaded instruction -->
    <template #cell(loadedInstructions)="row">
      <span v-if="row.item.visible">
        {{ row.item.loaded }}
      </span>
      <span v-else> &lt;&lt;Hidden&gt;&gt; </span>
    </template>
  </b-table>
</template>

<style lang="scss" scoped>
.table-execution-container {
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}

.table-execution-col {
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}

.instructions_table {
  cursor: pointer;
  height: 100%;
  max-height: 100%;
}

:deep(.instructions_table) {

  /* Make Address and Label columns narrower */
  th:nth-child(1),
  /* Address */
  td:nth-child(1) {
    width: 12%;
  }

  th:nth-child(2),
  /* Label */
  td:nth-child(2) {
    width: 6%;
  }
}

[data-bs-theme="dark"] {
  .instructions_table {
    // mute the colors a bit...
    filter: saturate(80%);
  }
}
</style>
