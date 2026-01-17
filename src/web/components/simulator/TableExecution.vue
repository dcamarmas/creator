<!--
Copyright 2018-2026 CREATOR Team.

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
import { creator_ga } from "@/core/utils/creator_ga.mjs";

export default {
  props: {
    instructions: { type: Array, required: true },
    enter: { type: [Boolean, null], required: true },
    autoscroll: { type: Boolean, default: false },
  },

  data() {
    return {
      /*Instrutions table fields*/
      archInstructions: ["Address", "userInstructions", "loadedInstructions"],
    };
  },

  computed: {
    processedInstructions() {
      return this.instructions.map(instruction => ({
        ...instruction,
        _cellVariants: {},
      }));
    },

    // Find the index of the currently executing instruction
    currentInstructionIndex() {
      return this.instructions.findIndex(
        inst => inst._rowVariant === "success" || inst._rowVariant === "warning"
      );
    },
  },

  watch: {
    // Watch for changes in the current instruction and scroll to it
    currentInstructionIndex: {
      handler(newIndex) {
        if (newIndex >= 0 && this.autoscroll) {
          this.$nextTick(() => {
            this.scrollToCurrentInstruction(newIndex);
          });
        }
      },
      immediate: true,
    },
  },

  methods: {
    // Scroll to the currently executing instruction
    scrollToCurrentInstruction(index) {
      // The b-table with sticky-header wraps the table in a div with class 'b-table-sticky-header'
      // which is the scrollable container
      const scrollContainer = this.$el;
      if (!scrollContainer) return;

      const tbody = scrollContainer.querySelector("tbody");
      if (!tbody) return;

      const rows = tbody.querySelectorAll("tr");
      const targetRow = rows[index];
      if (!targetRow) return;

      // Calculate scroll position to center the row in view
      const containerHeight = scrollContainer.clientHeight;
      const rowTop = targetRow.offsetTop;
      const rowHeight = targetRow.offsetHeight;
      const scrollTop = rowTop - (containerHeight / 2) + (rowHeight / 2);

      scrollContainer.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: "auto",
      });
    },


    /* Filter table instructions */
    filter(row, _filter) {
      if (row.hide === true) {
        return false;
      } else {
        return true;
      }
    },

    /* Enter a breakpoint */
    breakPoint(record, index) {
      for (let i = 0; i < this.instructions.length; i++) {
        if (this.instructions[i].Address === record.Address) {
          index = i;
          break;
        }
      }

      if (this.instructions[index].Break === null) {
        this.$root.instructions[index].Break = true;

        /* Google Analytics */
        creator_ga(
          "send",
          "event",
          "execute",
          "execute.breakpoint",
          "execute.breakpoint",
        );
      } else if (this.instructions[index].Break) {
        this.$root.instructions[index].Break = null;
      }
    },
  },
};
</script>

<template>
  <b-table
    id="inst_table"
    sticky-header="100%"
    small
    hover
    :items="processedInstructions"
    :fields="archInstructions"
    class="instructions_table"
    @row-clicked="breakPoint"
    :filter-function="filter"
    filter=" "
    primary-key="Address"
  >
    <!-- column headers -->
    <template #head(userInstructions)="_row"> User Instruction </template>
    <template #head(loadedInstructions)="_row"> Loaded Instructions </template>

    <!-- address -->
    <template #cell(Address)="row">
      <span
        v-if="row.item.Break"
        class="breakpoint-indicator"
        title="Breakpoint"
        >●</span
      >
      <span v-else class="breakpoint-space">&nbsp;</span>
      <span>{{ row.item.Address }}</span>
      <b-badge
        v-if="row.item.Label"
        pill
        variant="info"
        style="margin-left: 0.5em"
        >{{ row.item.Label }}</b-badge
      >
    </template>

    <!-- user instruction -->
    <template #cell(userInstructions)="row">
      <span v-if="row.item.visible"> {{ row.item.user }} </span>
      <span v-else> &lt;&lt;Hidden&gt;&gt; </span>
    </template>

    <!-- loaded instruction -->
    <template #cell(loadedInstructions)="row">
      <div class="loaded-instruction-cell">
        <span v-if="row.item.visible" class="instruction-text">
          {{ row.item.loaded }}
        </span>
        <span v-else class="instruction-text"> &lt;&lt;Hidden&gt;&gt; </span>
        <!-- Execution state badges - small and discrete, absolutely positioned on the right -->
        <b-badge
          v-if="row.item._rowVariant === 'success'"
          pill
          variant="success"
          class="execution-badge"
          title="Next instruction"
          >next</b-badge
        >
        <b-badge
          v-else-if="row.item._rowVariant === 'info'"
          pill
          variant="info"
          class="execution-badge"
          title="Previous instruction"
        ></b-badge>
        <b-badge
          v-else-if="row.item._rowVariant === 'warning'"
          pill
          variant="warning"
          class="execution-badge"
          title="Next instruction"
          >next</b-badge
        >
      </div>
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

  // // Font size only on mobile phones
  // @media (max-width: 480px) {
  //   font-size: 1rem;
  // }
}

.loaded-instruction-cell {
  position: relative;
  width: 100%;
  padding-right: 3rem; // Space for the badge

  .instruction-text {
    display: block;
    width: 100%;
  }

  .execution-badge {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.7rem;
    font-weight: 500;
    opacity: 0.85;
  }
}

[data-bs-theme="dark"] {
  .instructions_table {
    // mute the colors a bit...
    filter: saturate(80%);
  }
}

.breakpoint-indicator {
  font-weight: bold;
  font-size: 0.8em;
  margin-right: 0.3em;
  color: red;
}

.breakpoint-space {
  font-size: 0.8em;
  margin-right: 1em;
}
</style>
