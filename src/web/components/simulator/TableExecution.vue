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
import { coreEvents } from "@/core/events.mts";
import { architecture, loadedCreatino } from "@/core/core.mjs";
import { creator_ga } from "@/core/utils/creator_ga.mjs";
import CacheInfo from "@/web/components/architecture/cache_memory/CacheInfo.vue";
// document.app.$data.architecture.name = "RISCV Sail 32/64"

export default {
  props: {
    instructions: { type: Array, required: true },
    enter: { type: [Boolean, null], required: true },
    autoscroll: { type: Boolean, default: false },
  },

  components:{
    CacheInfo
  },
  data() {
    const base = (() => {
      if (
        document.app.$data.architecture_name === "RISC-V Sail 32 - Full Specification" ||
        document.app.$data.architecture_name === "RISC-V Sail 64 - Full Specification"
      ) {
        switch (document.app.$data.cache_type) {
          case 0:
          case 1:
            return {
              archInstructions: ["Address", "userInstructions", "loadedInstructions", "L1"],
              sailArch: true,
            };
          case 2:
          case 3:
          case 4:
          case 5:
            return {
              archInstructions: ["Address", "userInstructions", "loadedInstructions", "L1", "L2"],
              sailArch: true,
            };
        }
      }

      return {
        archInstructions: ["Address", "userInstructions", "loadedInstructions"],
        sailArch: false,
      };
    })();

    return {
      ...base,
      tableRenderKey: 0,
    };
  },

  computed: {
    processedInstructions() {
      this.tableRenderKey;
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
      if (loadedCreatino){
        index = index - 20; // Adjustment for loadedCreatino environment
      }

      const targetRow = rows[index];
      if (!targetRow) return;

      // Calculate scroll position to center the row in view
      const containerHeight = scrollContainer.clientHeight;
      const rowTop = targetRow.offsetTop;
      const rowHeight = targetRow.offsetHeight;
      const scrollTop = rowTop - (containerHeight / 2) + (rowHeight / 2) ;

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
    pptarget(addr, level, value) {
      return (`${addr}-${level}-${value}`);
    },
    refreshTable(){
      this.tableRenderKey++;
    }
  },
  mounted(){
    coreEvents.on("sail-instruction-update", this.refreshTable);
  },
  beforeUnmount(){
    coreEvents.off("sail-instruction-update", this.refreshTable);
  }
};
</script>

<template>
  <b-table
    :key="tableRenderKey"
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
    <template v-if="sailArch" #head(L1)="_row"> L1 </template>
    <template v-if="sailArch" #head(L2)="_row"> L2 </template>
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
        v-for="label in (typeof row.item.Label === 'string'? [row.item.Label] : row.item.Label)"
        pill
        variant="info"
        style="margin-left: 0.5em"
        >{{ label }}</b-badge
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

    <template #cell(L1)="row">
        <!-- Case was tick -->
        <span v-if="(row.item.visible && (row.item.L1_I === 3 && row.item.L1_D === 0) || (row.item.L1_I === 0 && row.item.L1_D === 3) || (row.item.L1_I === 3 && row.item.L1_D === 3))" :id="pptarget(row.item.Address, 1, 3)" >
          <font-awesome-icon icon="fa-solid fa-circle-check" />
            <CacheInfo :target="pptarget(row.item.Address, 1, 3)" :instruction="row.item" :cache_type="'L1'" />
        </span>
        
        <!-- Case was cross -->          
        <span v-if="(row.item.visible && (row.item.L1_I === 4 && row.item.L1_D === 4) || (row.item.L1_I === 0 && row.item.L1_D === 4) || (row.item.L1_I === 4 && row.item.L1_D === 0))" :id="pptarget(row.item.Address, 1, 4)" >

          <font-awesome-icon icon="fa-regular fa-circle-xmark" />
          <CacheInfo :target="pptarget(row.item.Address, 1, 4)" :instruction="row.item" :cache_type="'L1'" />
        </span>
      

      <!-- Case was warning -->
        <span v-if="(row.item.visible && (row.item.L1_I === 1 || row.item.L1_D === 1) || (row.item.L1_I === 3 && row.item.L1_D === 4) || (row.item.L1_I === 4 && row.item.L1_D === 3))" :id="pptarget(row.item.Address, 1, 1)" >

          <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
          <CacheInfo :target="pptarget(row.item.Address, 1, 1)" :instruction="row.item" :cache_type="'L1'" />
        
        </span>

    </template>
     

    <template #cell(L2)="row">

      <!-- Case was tick -->
      <span  v-if="row.item.visible && (row.item.L2_I === 3 && row.item.L2_D === 0) || (row.item.L2_I === 0 && row.item.L2_D === 3) || (row.item.L2_I === 3 && row.item.L2_D === 3)" :id="pptarget(row.item.Address, 2, 3)"  >
        <font-awesome-icon icon="fa-regular fa-circle-check" />
        <CacheInfo :target="pptarget(row.item.Address, 2, 3)" :instruction="row.item" :cache_type="'L2'" />
      </span>
      
        <!-- Case was cross -->
      <span  v-if="row.item.visible && (row.item.L2_I === 4 && row.item.L2_D === 4) || (row.item.L2_I === 0 && row.item.L2_D === 4) || (row.item.L2_I === 4 && row.item.L2_D === 0)" :id="pptarget(row.item.Address, 2, 4)" >
        <font-awesome-icon icon="fa-regular fa-circle-xmark" />
        <CacheInfo :target="pptarget(row.item.Address, 2, 4)" :instruction="row.item" :cache_type="'L2'" />
      </span>
      
      <!-- Case was warning -->
      <span  v-if="row.item.visible && (row.item.L2_I === 1 || row.item.L2_D === 1) || (row.item.L2_I === 3 && row.item.L2_D === 4) || (row.item.L2_I === 4 && row.item.L2_D === 3)" :id="pptarget(row.item.Address, 2, 1)" >
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
        <CacheInfo :target="pptarget(row.item.Address, 2, 1)" :instruction="row.item" :cache_type="'L2'" />
      </span>
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
