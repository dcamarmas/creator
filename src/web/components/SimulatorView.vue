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
import UIeltoToolbar from "./general/UIeltoToolbar.vue"
import TableExecution from "./simulator/TableExecution.vue"
import DataViewSelector from "./simulator/DataViewSelector.vue"
import RegisterFile from "./simulator/RegisterFile.vue"
import Examples from "./assembly/Examples.vue"
import Memory from "./simulator/Memory.vue"
import Monitor from "./simulator/Monitor.vue"
import Keyboard from "./simulator/Keyboard.vue"
import Calculator from "./simulator/Calculator.vue"
import Stats from "./simulator/Stats.vue"

import { architecture } from "@/core/core.mjs"

export default {
  props: {
    instructions: { type: Array, required: true },
    browser: String,
    os: { type: String, required: true },
    dark: { type: Boolean, required: true },
    windowHeight: { type: Number, required: true },
    windowWidth: { type: Number, required: true },
    arch_available: Array,
    architecture_name: String,
    data_mode: String,
    reg_representation_int: { type: String, required: true },
    reg_representation_float: { type: String, required: true },
    reg_name_representation: { type: String, required: true },
    stat_representation: { type: String, required: true },
    stat_type: { type: String, required: true },
    memory_segment: { type: String, required: true },
    enter: [Boolean, null],
    main_memory_busy: Boolean,
    display: String,
    keyboard: String,
    caller_frame: Object,
    callee_frame: Object,
  },

  components: {
    UIeltoToolbar,
    TableExecution,
    DataViewSelector,
    RegisterFile,
    Examples,
    Memory,
    Monitor,
    Keyboard,
    Calculator,
    Stats,
  },

  data() {
    return {
      architecture,
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
          :os="os"
          :dark="dark"
          :arch_available="arch_available"
          :show_instruction_help="true"
          :instructions="instructions"
          ref="toolbar"
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
        <Examples
          id="examples-simulator"
          :architecture_name="architecture_name"
          :compile="true"
        />

        <!-- Calculator -->
        <Calculator id="calculator" />

        <b-row align-h="center">
          <!-- Execution instruction -->
          <b-col lg="7" cols="12">
            <TableExecution
              :instructions="instructions"
              :enter="enter"
              ref="tableExecution"
            />
          </b-col>

          <!-- Execution data -->
          <b-col lg="5" cols="12">
            <!-- View selector -->
            <DataViewSelector
              :data_mode="data_mode"
              :register_file_num="architecture.components.length"
              :dark="dark"
            />

            <!-- Registers view -->
            <RegisterFile
              v-if="data_mode == 'int_registers' || data_mode == 'fp_registers'"
              :data_mode="data_mode"
              :reg_representation_int="reg_representation_int"
              :reg_representation_float="reg_representation_float"
              :reg_name_representation="reg_name_representation"
              :dark="dark"
              ref="registerFile"
            />

            <!-- Memory view-->
            <Memory
              v-if="data_mode === 'memory'"
              ref="memory"
              :selectedSegment="memory_segment"
              :dark="dark"
              :callee_frame="callee_frame"
              :caller_frame="caller_frame"
            />

            <!-- Stats view--->
            <Stats
              v-if="data_mode === 'stats'"
              ref="stats"
              :dark="dark"
              :representation="stat_representation"
              :type="stat_type"
            />
          </b-col>
        </b-row>

        <!-- Monitor & keyboard -->
        <b-row
          cols-xl="2"
          cols-lg="2"
          cols-md="1"
          cols-sm="1"
          cols-xs="1"
          cols="1"
          align-h="center"
          :class="{
            'mx-0': true,
            'pb-2': true,
            'fixed-bottom': windowHeight > 900,
          }"
        >
          <!-- Monitor -->
          <b-col>
            <Monitor :display="display" />
          </b-col>

          <!-- Keyboard -->
          <b-col>
            <Keyboard :keyboard="keyboard" :enter="enter" />
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<style lang="scss" scoped>
:deep() {
  .consoleIcon {
    height: 3em;
    opacity: 0.6;
  }

  .groupLabelling {
    float: top;
    position: relative;
    top: -0.6vw;
  }
}
</style>
