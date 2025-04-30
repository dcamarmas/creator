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
import { status } from "@/core/core.mjs"
import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { onUpdated } from "vue"

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
      render: 0n, // dummy variable to force components with this as key to refresh
    }
  },

  methods: {
    /*Filter table instructions*/
    filter(row, filter) {
      if (row.hide === true) {
        return false
      } else {
        return true
      }
    },

    /*Enter a breakpoint*/
    breakPoint(record, index) {
      for (let i = 0; i < this.instructions.length; i++) {
        if (this.instructions[i].Address === record.Address) {
          index = i
          break
        }
      }

      if (instructions[index].Break === null) {
        instructions[index].Break = true
        app._data.instructions[index].Break = true //TODO: vue bidirectional updates

        /* Google Analytics */
        creator_ga(
          "send",
          "event",
          "execute",
          "execute.breakpoint",
          "execute.breakpoint",
        )
      } else if (instructions[index].Break === true) {
        instructions[index].Break = null
        app._data.instructions[index].Break = null //TODO: vue bidirectional updates
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
        <template #head(userInstructions)="row"> User Instruction </template>

        <template #head(loadedInstructions)="row">
          Loaded Instructions
        </template>

        <template #head(tag)="row"> &nbsp; </template>

        <!-- breakpoints -->
        <template #cell(Break)="row">
          <div class="break" :id="row.index">
            <b-img
              alt="Break"
              src="@/web/assets/img/stop_classic.gif"
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
            variant="warning"
            class="border border-warning shadow executionTag"
            v-if="row.item._rowVariant == 'warning'"
          >
            Interrupted
          </b-badge>
          <b-badge
            variant="info"
            class="border border-info shadow executionTag"
            v-if="row.item._rowVariant == 'info' && enter == false"
          >
            Current-Keyboard
          </b-badge>
          <b-badge
            variant="success"
            class="border border-success shadow executionTag"
            v-if="row.item._rowVariant == 'success'"
          >
            Next
          </b-badge>
          <b-badge
            variant="info"
            class="border border-info shadow executionTag"
            v-if="row.item._rowVariant == 'info' && !enter"
          >
            Current
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
</style>
