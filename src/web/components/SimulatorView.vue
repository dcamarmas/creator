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
import UIeltoToolbar from "./general/UIeltoToolbar.vue"
import TableExecution from "./simulator/TableExecution.vue"
import DataViewSelector from "./simulator/DataViewSelector.vue"
import RegisterFile from "./simulator/RegisterFile.vue"
import Examples from "./assembly/Examples.vue"
import Memory from "./simulator/Memory.vue"

import { architecture } from "@/core/core.mjs"
import { instructions } from "@/core/compiler/compiler.mjs"

export default {
  props: {
    browser: String,
    arch_available: Array,
    architecture_name: String,
    data_mode: String,
    enter: [Boolean, null],
    stack_total_list: Number,
  },
  components: {
    UIeltoToolbar,
    TableExecution,
    DataViewSelector,
    RegisterFile,
    Examples,
    Memory,
  },

  data() {
    return {
      architecture: architecture,
      instructions: instructions,

      // stack
      callee_subrutine: "",
      caller_subrutine: "",
      stack_pointer: 0,
      begin_caller: 0,
      end_caller: 0,
      begin_callee: 0,
      end_callee: 0,

      // memory
      main_memory_busy: false,
    }
  },
}
</script>

<template>
  <b-container fluid align-h="center" id="simulator">
    <b-row>
      <b-col>
        <!-- Navbar -->
        <UIeltoToolbar
          id="navbar_simulator"
          components="btn_architecture,btn_assembly|btn_reset,btn_instruction,btn_run,btn_flash,btn_stop|btn_examples,btn_calculator|btn_configuration,btn_information"
          :browser="browser"
          :arch_available="arch_available"
        />

        <!-- Simulator navbar modals -->

        <!-- Flash -->
        <!-- <Flash
          id="flash"
          :lab_url="lab_url"
          :result_email="result_email"
          :target_board="target_board"
          :target_port="target_port"
          :flash_url="flash_url"
        /> -->

        <!-- Examples modal -->
        <!-- <Examples
          id="examples2"
          ref="examples2"
          :example_set_available="example_set_available"
          :example_available="example_available"
          compile="true"
          modal="examples2"
        /> -->

        <!-- Calculator -->
        <!-- <Calculator id="calculator" /> -->

        <b-container fluid align-h="center" class="mx-0 px-0">
          <b-row align-h="center">
            <!-- Execution instruction -->
            <b-col lg="7" cols="12">
              <TableExecution :instructions="instructions" :enter="enter" />
            </b-col>

            <!-- Execution data -->
            <b-col lg="5" cols="12">
              <!-- View selector -->
              <DataViewSelector
                :data_mode="data_mode"
                :register_file_num="architecture.components.length"
              />

              <!-- Registers view -->
              <!-- :render="render" -->
              <RegisterFile
                v-if="
                  data_mode == 'int_registers' || data_mode == 'fp_registers'
                "
                id="register_file"
                :data_mode="data_mode"
                :components="architecture.components"
              />

              <!-- Memory view-->
              <Memory
                v-if="data_mode == 'memory'"
                id="memory"
                :callee_subrutine="callee_subrutine"
                :caller_subrutine="caller_subrutine"
                :stack_total_list="stack_total_list"
                :main_memory_busy="main_memory_busy"
                :memory_layout="architecture.memory_layout"
              />

              <!-- Stats view--->
              <!-- <Stats :stats="stats" :stats_value="stats_value" v-if="data_mode ==
              'stats'" /> -->

              <!-- CLK Cycles view--->
              <!-- <ClkCycles
                :clk_cycles="clk_cycles"
                :clk_cycles_value="clk_cycles_value"
                :total_clk_cycles="total_clk_cycles"
                v-if="data_mode == 'clk_cycles'"
              />
            </b-col> -->

              <!-- Monitor & keyboard -->
              <!-- <b-col lg="12" cols="12">
              <b-container
                fluid
                align-h="center"
                class="mx-0 px-0"
                id="simulator"
                v-if="creator_mode == 'simulator'"
              >
                <b-row
                  cols-xl="2"
                  cols-lg="2"
                  cols-md="1"
                  cols-sm="1"
                  cols-xs="1"
                  cols="1"
                >
                  <b-col> -->
              <!-- Monitor -->
              <!-- <Monitor :display="display" />
                  </b-col>

                  <b-col> -->
              <!-- Keyboard -->
              <!-- <Keyboard :keyboard="keyboard" :enter="enter" /> -->
              <!-- </b-col>
                </b-row>
              </b-container> -->
            </b-col>
          </b-row>
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>

<style lang="scss" scoped>
:deep() {
  .consoleIcon {
    height: 5vh;
    opacity: 0.6;
  }
}

.popoverFooter {
  padding: 2px;
}

.popoverText {
  font-size: 1.2em;
}
</style>
