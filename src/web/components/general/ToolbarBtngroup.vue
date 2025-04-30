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
<style lang="scss" scoped>
.actionsGroup {
  background-color: #e0e0e0;
}
</style>
<script>
import { useModal } from "bootstrap-vue-next"

import {
  assembly_compile,
  set_execution_mode,
  architecture,
  status,
  instructions_packed,
  reset,
} from "@/core/core.mjs"
import { instructions } from "@/core/compiler/compiler.mjs"
import { step, packExecute } from "@/core/executor/executor.mjs"
import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { show_notification } from "@/web/utils.mjs"

export default {
  props: {
    group: { type: Array, required: true },
    instructions: Array,
    browser: { type: String, required: true },
    architectures: { type: Array, required: true },
    assembly_code: String,
    show_instruction_help: { type: Boolean, default: false },
  },

  setup() {
    // BV Composeables, such as these, should only be used inside setup
    const modalAssemblyError = useModal("modalAssemblyError")

    return { modalAssemblyError }
  },

  data() {
    return {
      compiling: false,
      reset_disable: false,
      instruction_disable: false,
      run_disable: false,
      stop_disable: true,
    };
  },
  computed: {
    arch_available() {
      return this.architectures.filter(item => item.available === 1);
    },

    instruction_values: {
      get() {
        return this.instructions
      },
      set(value) {
        instructions = value
      },
    },
  },

  mounted() {
    if (this.$root.creator_mode === "simulator") {
      // enable execution buttons only if there are instructions to execute
      const prepared_for_execution = this.$root.instructions.length > 0

      if (this.group.includes("btn_run")) {
        this.run_disable = !prepared_for_execution
      }
      if (this.group.includes("btn_reset")) {
        this.reset_disable = !prepared_for_execution
      }
      if (this.group.includes("btn_instruction")) {
        this.instruction_disable = !prepared_for_execution
      }
    }
  },

  methods: {
    //
    //Screen change
    //

    change_UI_mode(e) {
      if (this.$root.creator_mode !== e) {
        // slow transition <any> => "architecture"
        // if (e === "architecture") {
        //   $(".loading").show()
        //   setTimeout(function () {
        //     app._data.creator_mode = e
        //     app.$forceUpdate()
        //     $(".loading").hide()
        //   }, 50)
        //   return
        // }

        // fast transition <any> => <any> - "architecture"
        // this.$root.creator_mode = e
        this.$root.creator_mode = e;

        //Assembly view => Start codemirror
        // if (e === "assembly") {
        //   setTimeout(function () {
        //     assembly_codemirror_start()
        //     if (codemirrorHistory !== null) {
        //       textarea_assembly_editor.setHistory(codemirrorHistory)
        //       textarea_assembly_editor.undo()
        //     }
        //     textarea_assembly_editor.setValue(code_assembly)
        //     if (update_binary !== "") {
        //       $("#divAssembly").attr("class", "col-lg-10 col-sm-12")
        //       $("#divTags").attr("class", "col-lg-2 col-sm-12")
        //       $("#divTags").show()
        //     }
        //   }, 50)
        // }

        //Architecture or simulator view => Close codemirror
        // if (textarea_assembly_editor !== null && e !== "assembly") {
        //   app._data.assembly_code = textarea_assembly_editor.getValue()
        //   code_assembly = textarea_assembly_editor.getValue()
        //   codemirrorHistory = textarea_assembly_editor.getHistory()
        //   textarea_assembly_editor.toTextArea()
        // }

        //Close all toast and refresh
        // this.$root.$bvToast.hide()
      }
    },

    //
    // Architecture Selector
    //

    load_arch_select(arch) {
      uielto_preload_architecture.methods.load_arch_select(arch);

      //Close all toast and refresh
      // app.$bvToast.hide()
    },

    //
    // Assembly
    //

    new_assembly() {
      this.$root.assembly_code = ""
    },

    //Compile assembly code
    assembly_compiler() {

      // reset simulator
      this.$root.keyboard = ""
      this.$root.display = ""
      this.$root.enter = null
      reset()

      this.compiling = true // Change buttons status

      setTimeout(() => {
        // Compile
        // if (typeof code !== "undefined") {
        //   code_assembly = code
        // } else {
        //   code_assembly = textarea_assembly_editor.getValue()
        // }
        const ret = assembly_compile(this.assembly_code);

        //TODO: Update/reset stats
        // app._data.totalStats = 0
        // app._data.instructions = instructions
        // tokenIndex = 0 //TODO: change to token_index in all files
        // uielto_toolbar_btngroup.methods.reset(true)

        // TODO: Save a backup in the cache memory
        // if (typeof Storage !== "undefined") {
        //   const aux_object = jQuery.extend(true, {}, architecture)
        //   const aux_architecture = register_value_serialize(aux_object)
        //   const aux_arch = JSON.stringify(aux_architecture, null, 2)

        //   const date = new Date()
        //   const auxDate =
        //     date.getHours() +
        //     ":" +
        //     date.getMinutes() +
        //     ":" +
        //     date.getSeconds() +
        //     " - " +
        //     date.getDate() +
        //     "/" +
        //     (date.getMonth() + 1) +
        //     "/" +
        //     date.getFullYear()

        //   localStorage.setItem(
        //     "backup_arch_name",
        //     app._data.architecture_name,
        //   )
        //   localStorage.setItem("backup_arch", aux_arch)
        //   localStorage.setItem("backup_asm", code_assembly)
        //   localStorage.setItem("backup_date", auxDate)
        // }

        //show error/warning

        //Change buttons status
        this.compiling = false;

        switch (ret.type) {
          case "error":
            this.compile_error(ret.msg);
            break;

          case "warning":
            show_notification(ret.token, ret.bgcolor)
            break

          default:
            // put rowVariant in entrypoint (we assume the main label exists)
            instructions.find(inst => inst.Label === "main")._rowVariant = "success"
            show_notification("Compilation completed successfully", "success")
            this.change_UI_mode("simulator")
            break
        }
      }, 25);

      // Close all toast
      // app.$bvToast.hide()

      this.compiling = false

      // enable execution buttons
    },

    // Show error message in the compilation
    compile_error(msg) {
      this.change_UI_mode("assembly")

      // set compilation msg
      this.$root.modalAssemblyError.error = msg;

      // show assembly error modal
      this.modalAssemblyError.show();
    },

    //Remove a loaded binary
    remove_library() {
      update_binary = "";
      load_binary = false;
      $("#divAssembly").attr("class", "col-lg-12 col-sm-12");
      $("#divTags").attr("class", "col-lg-0 col-sm-0");
      $("#divTags").attr("class", "d-none");
    },

    //
    // Simulator actions
    //

    /**
     * Updates the execution table UI, according to the return value of an execution.
     * @param {Object} ret {
     *                   error: Boolean,
     *                   msg: String | null,
     *                   type: String | null,
     *                   draw: {
     *                     space: Array,
     *                     info: Array,
     *                     success: Array,
     *                     warning: Array,
     *                     danger: Array
     *                   }
     *                 }
     */
    execution_UI_update(ret) {
      if (ret === undefined) {
        return
      }

      // update execution table instruction colors
      for (let i = 0; i < ret.draw.space.length; i++) {
        this.instruction_values[ret.draw.space[i]]._rowVariant = ""
      }
      for (let i = 0; i < ret.draw.success.length; i++) {
        this.instruction_values[ret.draw.success[i]]._rowVariant = "success"
      }
      for (let i = 0; i < ret.draw.info.length; i++) {
        this.instruction_values[ret.draw.info[i]]._rowVariant = "info"
      }
      for (let i = 0; i < ret.draw.warning.length; i++) {
        this.instruction_values[ret.draw.warning[i]]._rowVariant = "warning"
      }
      for (let i = 0; i < ret.draw.danger.length; i++) {
        this.instruction_values[ret.draw.danger[i]]._rowVariant = "danger"
      }

      // Auto-scroll

      if (
        this.$root.autoscroll &&
        status.run_program !== 1 &&
        this.instructions.length > 0
      ) {
        // scroll to next instruction

        if (
          status.execution_index >= 0 &&
          status.execution_index < this.instructions.length
        ) {
          let row = status.execution_index + 1 // next instruction
          if (status.execution_index + 1 === this.instructions.length) {
            // last instruction, use current instruction instead
            row = status.execution_index
          }

          const row_pos = $(
            "#inst_table__row_" + this.instructions[row].Address,
          ).position()

          if (row_pos) {
            $(".instructions_table").animate(
              {
                scrollTop: row_pos.top - $(".instructions_table").height() / 2,
              },
              300,
            )
          }
        } else {
          // scroll to top
          $(".instructions_table").animate(
            { scrollTop: $(".instructions_table").height() },
            300,
          );
        }
      }
    },

    /**
     * Resets the execution table's UI
     */
    execution_UI_reset() {
      const draw = {
        space: [],
        info: [],
        success: [],
        warning: [],
        danger: [],
        flash: [],
      };

      for (let i = 0; i < this.instructions.length; i++) {
        draw.space.push(i)
      }

      // UI: set default row color...
      for (let i = 0; i < this.instructions.length; i++) {
        if (this.instructions[i].Label === "main") {
          draw.success.push(i)
        }
      }

      this.execution_UI_update(packExecute(false, null, null, draw))
    },

    // Reset execution
    reset(reset_graphic) {
      // Google Analytics
      creator_ga("execute", "execute.reset", "execute.reset")

      // UI: reset I/O
      this.$root.keyboard = ""
      this.$root.display = ""
      this.$root.enter = null

      reset(reset_graphic)

      this.execution_UI_reset()

      this.$root.$refs.simulatorView.$refs.registerFile.refresh() // refresh table execution

      // Close all toast
      // app.$bvToast.hide()
    },

    // Execute one instruction
    execute_instruction() {
      // Google Analytics
      creator_ga("execute", "execute.instruction", "execute.instruction");

      set_execution_mode(0);

      const ret = step();

      if (typeof ret === "undefined") {
        console.log("Something weird happened :-S");
      }

      if (ret.msg) {
        show_notification(ret.msg, ret.type)
      }

      if (ret.draw !== null) {
        this.execution_UI_update(ret)
      }
    },

    //Execute all program
    execute_program() {
      let ret;

      // Google Analytics
      creator_ga("execute", "execute.run", "execute.run");

      set_execution_mode(1)

      if (status.run_program === 0) {
        status.run_program = 1;
      }

      if (this.instructions.length === 0) {
        show_notification("No instructions in memory", "danger")
        status.run_program = 0
        return
      }
      if (status.execution_index < -1) {
        show_notification("The program has finished", "warning")
        status.run_program = 0
        return
      }
      if (status.execution_index === -1) {
        show_notification("The program has finished with errors", "danger")
        status.run_program = 0
        return
      }

      // Change buttons status
      this.reset_disable = true
      this.instruction_disable = true
      this.run_disable = true
      this.stop_disable = false
      this.$root.main_memory_busy = true

      this.execute_program_packed(ret, this)
    },

    execute_program_packed(ret) {
      for (let i = 0; i < instructions_packed && status.execution_index >= 0; i++) {
        if (
          status.run_program === 0 || // stop button pressed
          status.run_program === 3 || // wait for user input at keyboard
          (instructions[status.execution_index].Break === true &&
            status.run_program !== 2) // stop because a breakpoint
        ) {
          this.execution_UI_update(ret)

          //Change buttons status
          this.reset_disable = false
          this.instruction_disable = false
          this.run_disable = false
          this.stop_disable = true
          this.$root.main_memory_busy = false

          if (instructions[status.execution_index].Break === true) {
            status.run_program = 2 //In case breakpoint --> stop
          }
          return;
        } else {
          if (status.run_program === 2) {
            status.run_program = 1;
          }

          ret = step();

          if (typeof ret === "undefined") {
            console.log("Something weird happened :-S");
            status.run_program = 0;

            this.execution_UI_update(ret)

            //Change buttons status
            this.reset_disable = false
            this.instruction_disable = false
            this.run_disable = false
            this.stop_disable = true
            this.$root.main_memory_busy = false

            return;
          }

          if (ret.msg !== null) {
            show_notification(ret.msg, ret.type)

            this.execution_UI_update(ret)

            //Change buttons status
            this.reset_disable = false
            this.instruction_disable = false
            this.run_disable = false
            this.stop_disable = true
            this.$root.main_memory_busy = false
          }
        }
      }

      if (status.execution_index >= 0) {
        setTimeout(this.execute_program_packed, 15, ret)
      } else {
        this.execution_UI_update(ret)
        //Change buttons status
        this.reset_disable = false
        this.instruction_disable = false
        this.run_disable = false
        this.stop_disable = true
        this.$root.main_memory_busy = false
      }
    },

    //Flash program
    flash_program() {},

    //Stop program excution
    stop_execution() {
      status.run_program = 0;

      //Change buttons status
      this.reset_disable = false
      this.instruction_disable = false
      this.run_disable = false
      this.stop_disable = true
      this.$root.main_memory_busy = false
    },
  },
};
</script>

<template>
  <b-container fluid>
    <b-row>
      <span class="col px-0 mr-1" v-for="(item, index) in group" :key="index">
        <!-- button_architecture -->
        <b-dropdown
          class="btn btn-block menuGroup arch_btn h-100 mr-1 p-0"
          split
          v-if="item == 'btn_architecture'"
          right
          text="Architecture"
          size="sm"
          variant="outline-secondary"
          @click="change_UI_mode('architecture')"
        >
          <b-dropdown-item
            v-for="item in arch_available"
            @click="load_arch_select(item)"
            >{{ item.name }}</b-dropdown-item
          >
        </b-dropdown>

        <!-- button_assembly -->
        <b-button
          v-if="item == 'btn_assembly'"
          class="btn btn-block btn-outline-secondary menuGroup btn-sm assembly_btn h-100 text-truncate"
          id="assembly_btn_sim"
          @click="change_UI_mode('assembly')"
        >
          <font-awesome-icon icon="fa-solid fa-hashtag" />
          Assembly
        </b-button>

        <!-- button_simulator -->
        <b-button
          v-if="item === 'btn_simulator'"
          class="btn btn-block btn-outline-secondary menuGroup btn-sm simulator_btn btn_arch h-100"
          id="sim_btn_arch"
          @click="change_UI_mode('simulator')"
        >
          <font-awesome-icon icon="fa-cogs" />
          Simulator
        </b-button>

        <!-- button_edit_architecture -->
        <b-button
          v-if="item === 'btn_edit_architecture'"
          class="btn btn-block btn-outline-secondary menuGroup btn-sm h-100"
          id="edit_btn_arch"
          v-b-modal.edit_architecture
        >
          <font-awesome-icon icon="fa-pen-to-square" />
          Edit Architecture
        </b-button>

        <!-- button_save_architecture -->

        <b-button
          v-if="item === 'btn_save_architecture'"
          class="btn btn-block btn-outline-secondary menuGroup btn-sm h-100"
          id="save_btn_arch"
          v-b-modal.save_architecture
        >
          <font-awesome-icon icon="fa-download" />
          Save Architecture
        </b-button>

        <!-- dropdown_assembly_file -->
        <b-dropdown
          v-if="item === 'dropdown_assembly_file'"
          right
          text="File"
          size="sm"
          class="btn btn-block menuGroup btn-sm p-0"
          variant="outline-secondary"
        >
          <b-dropdown-item @click="new_assembly">
            <font-awesome-icon icon="fa-file" />
            New
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.load_assembly>
            <font-awesome-icon icon="fa-upload" />
            Load
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.save_assembly>
            <font-awesome-icon icon="fa-download" />
            Save
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.examples>
            <font-awesome-icon icon="fa-regular fa-file" />
            Examples
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.make_uri>
            <font-awesome-icon icon="fa-link" />
            Get code as URI
          </b-dropdown-item>
        </b-dropdown>

        <!-- button_compile -->
        <b-button
          v-if="item === 'btn_compile'"
          class="btn btn-block btn-outline-secondary actionsGroup btn-sm h-100"
          id="compile_assembly"
          @click="assembly_compiler()"
        >
          <font-awesome-icon icon="fa-sign-in-alt" />
          Assemble/Link
          <b-spinner small v-if="compiling" class="ml-3"></b-spinner>
        </b-button>

        <!-- dropdown_library -->
        <b-dropdown
          v-if="item === 'dropdown_library'"
          right
          text="Library"
          size="sm"
          class="btn btn-block menuGroup btn-sm p-0"
          variant="outline-secondary"
        >
          <b-dropdown-item v-b-modal.save_binary>
            <font-awesome-icon icon="fa-plus-square" />
            Create
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.load_binary>
            <font-awesome-icon icon="fa-upload" />
            Load Library
          </b-dropdown-item>
          <b-dropdown-item @click="remove_library">
            <font-awesome-icon icon="fa-trash-alt" />
            Remove
          </b-dropdown-item>
        </b-dropdown>

        <!-- button_reset -->
        <b-button
          v-if="item == 'btn_reset'"
          @click="reset(true)"
          :disabled="reset_disable"
          class="btn btn-block btn-outline-secondary actionsGroup btn-sm h-100 mr-1 text-truncate"
        >
          <font-awesome-icon icon="fa-power-off" />
          Reset
        </b-button>

        <!-- button_instruction -->
        <b-button
          v-if="item == 'btn_instruction'"
          accesskey="a"
          :disabled="instruction_disable"
          class="btn btn-block btn-outline-secondary actionsGroup btn-sm h-100 mr-1 text-truncate"
          @click="execute_instruction"
          id="inst"
        >
          <font-awesome-icon icon="fa-fast-forward" />
          Inst.
        </b-button>
        <b-tooltip
          v-if="item == 'btn_instruction' && browser === 'Mac'"
          target="inst"
          title="Press [Control] [Alt/Option] + A"
        />
        <b-tooltip
          v-else-if="item == 'btn_instruction'"
          target="inst"
          title="Press [Alt] [Shift] + A"
        />

        <!-- button_run -->
        <b-button
          v-if="item === 'btn_run'"
          class="btn btn-block btn-outline-secondary actionsGroup btn-sm h-100 mr-1"
          @click="execute_program"
          :disabled="run_disable"
          id="playExecution"
        >
          <font-awesome-icon icon="fa-play" />
          Run
        </b-button>

        <!-- button_flash -->
        <b-button
          v-if="item === 'btn_flash'"
          class="btn btn-block btn-outline-secondary actionsGroup btn-sm h-100 mr-1"
          v-b-modal.flash
          :disabled="run_disable"
        >
          <font-awesome-icon icon="fa-brands fa-usb" />
          Flash
        </b-button>

        <!-- button_stop -->
        <b-button
          v-if="item == 'btn_stop'"
          class="btn btn-block btn-outline-secondary actionsGroup btn-sm h-100 text-truncate"
          @click="stop_execution"
          :disabled="stop_disable"
          id="stop_execution"
        >
          <font-awesome-icon icon="fa-stop" />
          Stop
        </b-button>

        <!-- button_examples -->
        <b-button
          v-if="item == 'btn_examples'"
          class="btn btn-block btn-outline-secondary menuGroup btn-sm h-100 mr-1 text-truncate"
          v-b-modal.examples2
        >
          <font-awesome-icon icon="fa-regular fa-file" />
          Examples
        </b-button>

        <!-- button_calculator -->
        <b-button
          v-if="item == 'btn_calculator'"
          class="btn btn-block btn-outline-secondary menuGroup btn-sm h-100 text-truncate"
          v-b-modal.calculator
        >
          <font-awesome-icon icon="fa-calculator" />
          Calculator
        </b-button>

        <!-- button_configuration -->
        <b-button
          v-if="item == 'btn_configuration'"
          class="btn btn-block btn-outline-secondary menuGroup btn-sm h-100 mr-1 text-truncate"
          id="conf_btn_sim"
          v-b-modal.configuration
        >
          <font-awesome-icon icon="fa-cogs" />
          Configuration
        </b-button>

        <!-- button_information -->

        <b-popover
          v-if="item == 'btn_information'"
          :click="true"
          :close-on-hide="true"
          :delay="{ show: 0, hide: 0 }"
        >
          <template #target>
            <b-button
              class="btn btn-block btn-outline-secondary btn-sm h-100 infoButton text-truncate"
              id="info"
            >
              <font-awesome-icon icon="fa-info-circle" />
              Info
            </b-button>
          </template>

          <b-button
            class="btn btn-outline-secondary btn-sm btn-block infoButton"
            href="https://creatorsim.github.io/"
            target="_blank"
            onclick="creator_ga('send', 'event', 'help', 'help.general_help', 'help.general_help');"
          >
            <font-awesome-icon icon="fa-question-circle" />
            Help
          </b-button>

          <b-button
            class="btn btn-outline-secondary btn-block btn-sm h-100 infoButton"
            v-if="show_instruction_help"
            id="inst_ass"
            v-b-toggle.sidebar_help
            onclick="creator_ga('send', 'event', 'help', 'help.instruction_help', 'help.instruction_help');"
          >
            <font-awesome-icon icon="fa-book" />
            Instruction Help
          </b-button>

          <b-button
            class="btn btn-outline-secondary btn-sm btn-block buttonBackground h-100"
            v-b-modal.notifications
          >
            <font-awesome-icon icon="fa-bell" />
            Show Notifications
          </b-button>
        </b-popover>
      </span>
    </b-row>
  </b-container>
</template>
