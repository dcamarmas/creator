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
        "Break",
        "Address",
        "Label",
        "userInstructions",
        "loadedInstructions",
        "tag",
      ],
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

    /* Computes the execution tag depending on the row's `_rowVariant` */
    computeExecutionTag(rowVariant) {
      switch (rowVariant) {
        case "warning":
          return "Interrupted"

        case "info":
          return this.enter !== null ? "Current-Keyboard" : "Current"

        case "success":
          return "Next"

        default:
          return ""
      }
    },
  },
}
</script>

<template>
  <b-row cols="1">
    <b-col align-h="center">
      <b-table
        id="inst_table"
        sticky-header="61vh"
        striped
        small
        hover
        responsive
        :items="instructions"
        :fields="archInstructions"
        class="instructions_table responsive"
        @row-clicked="breakPoint"
        :filter-function="filter"
        filter=" "
        primary-key="Address"
      >
        <!-- column headers -->
        <template #head(userInstructions)="_row"> User Instruction </template>

        <template #head(loadedInstructions)="_row">
          Loaded Instructions
        </template>

        <template #head(tag)="_row"> &nbsp; </template>

        <!-- breakpoints -->
        <template #cell(Break)="row">
          <div class="break" :id="row.index">
            <b-img
              alt="Break"
              src="@/web/assets/img/stop_classic.webp"
              class="shadow breakPoint"
              rounded="circle"
              v-if="row.item.Break"
            />
            <br v-else />
          </div>
        </template>

        <!-- address -->
        <template #cell(Address)="row">
          <span class="h6">{{ row.item.Address }}</span>
        </template>

        <!-- label -->
        <template #cell(Label)="row">
          <b-badge pill variant="info">{{ row.item.Label }}</b-badge>
        </template>

        <!-- user instruction -->
        <template #cell(userInstructions)="row">
          <span class="h6" v-if="row.item.visible">
            {{ row.item.user }}
          </span>
          <span class="h6" v-else> &lt;&lt;Hidden&gt;&gt; </span>
        </template>

        <!-- loaded instruction -->
        <template #cell(loadedInstructions)="row">
          <span class="h6" v-if="row.item.visible">
            {{ row.item.loaded }}
          </span>
          <span class="h6" v-else> &lt;&lt;Hidden&gt;&gt; </span>
        </template>

        <!-- execution tags -->
        <template #cell(tag)="row">
          <b-badge
            :variant="row.item._rowVariant"
            :class="`border border-${row.item._rowVariant} shadow executionTag`"
          >
            {{ computeExecutionTag(row.item._rowVariant) }}
          </b-badge>
        </template>
      </b-table>
    </b-col>
  </b-row>
</template>

<style lang="scss" scoped>
.instructions_table {
  font-size: 1em;
  padding-right: 1vw;
  cursor: pointer;
  max-height: 61vh;
}

.executionTag {
  float: right;
  position: relative;
  right: -0.7vw;
}

.breakPoint {
  width: auto !important;
  height: 4vh;
}

[data-bs-theme="dark"] {
  .instructions_table {
    // mute the colors a bit...
    filter: saturate(80%);
  }
}
</style>
