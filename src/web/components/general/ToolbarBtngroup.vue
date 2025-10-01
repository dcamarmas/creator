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
import { useToggle } from "bootstrap-vue-next"

import {
  assembly_compile,
  set_execution_mode,
  status,
  instructions_packed,
  reset,
  remove_library,
} from "@/core/core.mjs"
import { resetStats } from "@/core/executor/stats.mts"
import { instructions, setInstructions } from "@/core/assembler/assembler.mjs"
import { step } from "@/core/executor/executor.mjs"
import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { packExecute } from "@/core/utils/utils.mjs"
import {
  show_notification,
  loadDefaultArchitecture,
  storeBackup,
} from "@/web/utils.mjs"
import { rasmAssemble } from "@/core/assembler/rasm/web/rasm.mjs"
import { assembleCreator } from "@/core/assembler/creatorAssembler/web/creatorAssembler.mjs"

export default {
  props: {
    group: { type: Array, required: true },
    instructions: Array,
    browser: { type: String, required: true },
    os: { type: String, required: true },
    dark: { type: Boolean, required: true },
    architectures: { type: Array, required: false },
    show_instruction_help: { type: Boolean, default: false },
  },

  setup() {
    // BV Composeables, such as these, should only be used inside setup
    const showAssemblyError = useToggle("modalAssemblyError").show

    return { showAssemblyError }
  },

  data() {
    return {
      compiling: false,
      reset_disable: false,
      instruction_disable: false,
      run_disable: false,
      stop_disable: true,
      selectedCompiler: "default",
      compilerOptions: [
        { value: "default", text: "CREATOR" },
        { value: "rasm", text: "RASM" },
      ],
      assembler_map: {
        default: assembleCreator,
        rasm: rasmAssemble,
      },
    }
  },
  computed: {
    selectedCompilerLabel() {
      const found = this.compilerOptions.find(
        opt => opt.value === this.selectedCompiler,
      )
      return found ? found.text : ""
    },
    arch_available() {
      return this.architectures.filter(a => a.available)
    },

    instruction_values: {
      get() {
        return this.instructions
      },
      set(value) {
        setInstructions(value)
      },
    },
    /**
     * Computes the prefix keys that need to be pressed for an accesskey,
     * depending on the platforma and the browser.
     *
     * @returns  {Array}  List of prefixes
     *
     * More information in MDN (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/accesskey)
     */
    accesskey_prefix() {
      if (this.os === "Mac") {
        return "^ ⌥ "
      } else {
        switch (this.browser) {
          case "Chrome":
            return "Alt+"

          case "Firefox":
            return "Alt+Shift+"

          default:
            return "???"
        }
      }
    },
  },

  mounted() {
    if (this.$root.creator_mode === "simulator") {
      // enable execution buttons only if there are instructions to execute
      const prepared_for_execution = this.$root.instructions.length > 0

      if (this.group.includes("btn_run") && status.run_program !== 3) {
        this.run_disable = !prepared_for_execution
      }
      if (this.group.includes("btn_reset") && status.run_program !== 3) {
        this.reset_disable = !prepared_for_execution
      }
      if (this.group.includes("btn_instruction") && status.run_program !== 3) {
        this.instruction_disable = !prepared_for_execution
      }
    }
  },

  methods: {
    help_event(event) {
      creator_ga("send", "event", "help", `help.${event}`, `help.${event}`)
    },

    //
    // Screen change
    //

    change_UI_mode(e) {
      if (this.$root.creator_mode !== e) {
        this.$root.creator_mode = e
      }
    },

    //
    // Architecture Selector
    //

    load_arch_select(arch) {
      loadDefaultArchitecture(arch)
    },

    //
    // Assembly
    //

    new_assembly() {
      this.$root.assembly_code = ""
    },

    //Compile assembly code
    async assembly_compiler() {
      // reset simulator
      this.$root.keyboard = ""
      this.$root.display = ""
      this.$root.enter = null
      reset()

      this.compiling = true // Change buttons status

      // Assemble
      const assemblerFn = this.assembler_map[this.selectedCompiler]
      // If default, let assembly_compile use its internal default
      const ret = await (assemblerFn
        ? assembly_compile(this.$root.assembly_code, assemblerFn)
        : assembly_compile(this.$root.assembly_code))

      /* Reset stats */

      resetStats()

      status.executedInstructions = 0
      status.clkCycles = 0

      // Change buttons status
      this.compiling = false

      // show error/warning
      switch (ret.type) {
        case "error":
          this.compile_error(ret.msg)
          break

        case "warning":
          show_notification(ret.token, ret.bgcolor)
          break

        default:
          // put rowVariant in entrypoint
          const entrypoint = instructions.at(status.execution_index)
          if (entrypoint) {
            entrypoint._rowVariant = "success"
          }
          show_notification("Compilation completed successfully", "success")
          this.change_UI_mode("simulator")
          break
      }
      this.compiling = false

      // Close all toast
      // app.$bvToast.hide()

      storeBackup()
    },

    // Show error message in the compilation
    compile_error(msg) {
      // this.change_UI_mode("assembly")

      // set compilation msg
      this.$root.assemblyError = msg

      // show assembly error modal
      this.showAssemblyError()
    },

    //Remove a loaded binary
    removeLibrary() {
      // this.$root.librayLoaded = false
      remove_library()
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
      // this is ugly, but it's the only way I found, because the computed
      // properties in PlotStats.vue / TableStats.vue / TableExecution.vue don't
      // react to changes done to `stats`

      if (ret === undefined) {
        return
      }

      /* MEMORY */

      this.$root.$refs.simulatorView.$refs.memory?.$refs?.memory_table?.refresh()

      /* STATS */

      this.$root.$refs.simulatorView.$refs.stats?.refresh()

      /* EXECUTION TABLE */

      // update instructions' _rowVariant depending on the result of the
      // execution

      // we use this style of loop instead of a `for (const [i, instruction] of
      // this.instruction_values.entries())` because we have to update through
      // `this.instruction_values` so the computed property is updated
      for (let i = 0; i < this.instruction_values.length; i++) {
        // clear type
        this.instruction_values[i]._rowVariant = ""

        for (const [type, toUpdate] of Object.entries(ret.draw)) {
          if (
            toUpdate.includes(i) &&
            ["success", "info", "warning", "danger"].includes(type)
          ) {
            // update instruction type
            this.instruction_values[i]._rowVariant = type
          }
        }
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
          )
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
      }

      for (let i = 0; i < this.instructions.length; i++) {
        draw.space.push(i)
      }

      // put rowVariant in entrypoint
      draw.success.push(status.execution_index)
      // draw.success.push(this.instructions.findIndex(i => i.Address === ))

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

      this.$root.$refs.simulatorView.$refs.registerFile?.refresh() // refresh registers
    },

    // Execute one instruction
    execute_instruction() {
      // Google Analytics
      creator_ga("execute", "execute.instruction", "execute.instruction")

      set_execution_mode(0)

      const ret = step()

      if (status.run_program === 3) {
        // mutex read
        this.instruction_disable = true
        this.run_disable = true
      }

      if (typeof ret === "undefined") {
        console.log("Something weird happened :-S")
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
      let ret

      // Google Analytics
      creator_ga("execute", "execute.run", "execute.run")

      set_execution_mode(1)

      if (status.run_program === 0) {
        status.run_program = 1
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
      for (
        let i = 0;
        i < instructions_packed && status.execution_index >= 0;
        i++
      ) {
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
          return
        } else {
          if (status.run_program === 2) {
            status.run_program = 1
          }

          ret = step()

          if (typeof ret === "undefined") {
            console.log("Something weird happened :-S")
            status.run_program = 0

            this.execution_UI_update(ret)

            //Change buttons status
            this.reset_disable = false
            this.instruction_disable = false
            this.run_disable = false
            this.stop_disable = true
            this.$root.main_memory_busy = false

            return
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
      status.run_program = 0

      //Change buttons status
      this.reset_disable = false
      this.instruction_disable = false
      this.run_disable = false
      this.stop_disable = true
      this.$root.main_memory_busy = false
    },
  },
}
</script>

<template>
  <b-container fluid>
    <b-row>
      <b-col
        class="d-grid px-0 mx-1"
        v-for="(item, index) in group"
        :key="index"
      >
        <!-- button_architecture -->

        <b-button
          v-if="item === 'btn_architecture'"
          class="menuButton text-truncate"
          size="sm"
          variant="outline-secondary"
          id="assembly_btn_sim"
          @click="change_UI_mode('architecture')"
        >
          <font-awesome-icon :icon="['fas', 'screwdriver-wrench']" />
          Architecture
        </b-button>

        <!--
        Changing architecture from here is broken, if we fix it uncomment this
        -->
        <!-- <b-dropdown
          v-if="item === 'btn_architecture'"
          variant="outline-secondary"
          :toggle-class="{ menuButton: !dark, menuButtonDark: dark }"
          :split-class="{
            menuButton: !dark,
            menuButtonDark: dark,
            'w-75': true,
          }"
          split
          right
          size="sm"
        >
          <template #button-content>
            <span @click="change_UI_mode('architecture')"> Architecture </span>
          </template>

          <b-dropdown-item-button
            v-for="arch in arch_available"
            @click="load_arch_select(arch)"
          >
            {{ arch.name }}
          </b-dropdown-item-button>
        </b-dropdown> -->

        <!-- button_assembly -->
        <b-button
          v-if="item === 'btn_assembly'"
          class="menuButton text-truncate"
          size="sm"
          variant="outline-secondary"
          id="assembly_btn_sim"
          @click="change_UI_mode('assembly')"
        >
          <font-awesome-icon :icon="['fas', 'hashtag']" />
          Assembly
        </b-button>

        <!-- button_simulator -->
        <b-button
          v-if="item === 'btn_simulator'"
          class="menuButton"
          size="sm"
          variant="outline-secondary"
          id="sim_btn_arch"
          @click="change_UI_mode('simulator')"
          icon=""
        >
          <font-awesome-icon :icon="['fas', 'gears']" />
          Simulator
        </b-button>

        <!-- button_edit_architecture -->
        <b-button
          v-if="item === 'btn_edit_architecture'"
          class="menuButton"
          size="sm"
          variant="outline-secondary"
          id="edit_btn_arch"
          v-b-modal.edit_architecture
        >
          <font-awesome-icon :icon="['fas', 'pen-to-square']" />
          Edit Architecture
        </b-button>

        <!-- button_save_architecture -->
        <b-button
          v-if="item === 'btn_save_architecture'"
          class="menuButton"
          size="sm"
          variant="outline-secondary"
          id="save_btn_arch"
          v-b-modal.save_architecture
        >
          <font-awesome-icon :icon="['fas', 'download']" />
          Save Architecture
        </b-button>

        <!-- dropdown_assembly_file -->
        <b-dropdown
          v-if="item === 'dropdown_assembly_file'"
          size="sm"
          class="d-grid gap-2"
          :toggle-class="{ menuButton: !dark, menuButtonDark: dark }"
          :split-class="{ menuButton: !dark, menuButtonDark: dark }"
          variant="outline-secondary"
        >
          <template #button-content>
            <font-awesome-icon :icon="['fas', 'file']" />
            File
          </template>

          <b-dropdown-item @click="new_assembly">
            <font-awesome-icon :icon="['far', 'file']" />
            New
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.load_assembly>
            <font-awesome-icon :icon="['fas', 'upload']" />
            Load
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.save_assembly>
            <font-awesome-icon :icon="['fas', 'download']" />
            Save
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.examples-assembly>
            <font-awesome-icon :icon="['fas', 'file-lines']" />
            Examples
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.make_uri>
            <font-awesome-icon :icon="['fas', 'link']" />
            Get code as URI
          </b-dropdown-item>
        </b-dropdown>

        <!-- assembler dropdown split button -->

        <b-dropdown
          v-if="item === 'btn_compile'"
          variant="outline-secondary"
          :toggle-class="{ menuButton: !dark, menuButtonDark: dark }"
          :split-class="{
            menuButton: !dark,
            menuButtonDark: dark,
            'w-75': true,
          }"
          split
          right
          size="sm"
          :id="'compile_assembly'"
        >
          <template #button-content>
            <span @click="assembly_compiler">
              <font-awesome-icon :icon="['fas', 'right-to-bracket']" />
              {{
                "Assemble" +
                (selectedCompilerLabel
                  ? " (" + selectedCompilerLabel + ")"
                  : "")
              }}
              <b-spinner small v-if="compiling" class="ms-3" />
            </span>
          </template>

          <b-dropdown-item-button
            v-for="option in compilerOptions"
            :key="option.value"
            @click="selectedCompiler = option.value"
          >
            {{ option.text }}
          </b-dropdown-item-button>
        </b-dropdown>

        <!-- dropdown_library -->
        <b-dropdown
          v-if="item === 'dropdown_library'"
          size="sm"
          class="d-grid gap-2"
          :toggle-class="{ menuButton: !dark, menuButtonDark: dark }"
          :split-class="{ menuButton: !dark, menuButtonDark: dark }"
          variant="outline-secondary"
        >
          <template #button-content>
            <font-awesome-icon :icon="['fas', 'book']" />
            Library
          </template>

          <!-- We'll deal with this later -->
          <!-- <b-dropdown-item v-b-modal.save_binary>
            <font-awesome-icon :icon="['fas', 'square-plus']" />
            Create
          </b-dropdown-item> -->
          <b-dropdown-item v-b-modal.load_binary>
            <font-awesome-icon :icon="['fas', 'upload']" />
            Load Library
          </b-dropdown-item>
          <b-dropdown-item @click="removeLibrary">
            <font-awesome-icon :icon="['fas', 'trash-can']" />
            Remove
          </b-dropdown-item>
        </b-dropdown>

        <!-- button_reset -->
        <b-tooltip v-if="item === 'btn_reset'">
          <template #target>
            <b-button
              class="actionsGroup h-100 text-truncate"
              size="sm"
              variant="outline-secondary"
              accesskey="x"
              @click="reset(true)"
              :disabled="reset_disable"
            >
              <font-awesome-icon :icon="['fas', 'power-off']" />
              Reset
            </b-button>
          </template>

          {{ this.accesskey_prefix }}X
        </b-tooltip>

        <!-- button_instruction -->
        <b-tooltip v-if="item === 'btn_instruction'">
          <template #target>
            <b-button
              class="actionsGroup h-100 text-truncate"
              size="sm"
              variant="outline-secondary"
              accesskey="a"
              @click="execute_instruction"
              :disabled="instruction_disable"
            >
              <font-awesome-icon :icon="['fas', 'forward-step']" />
              Inst.
            </b-button>
          </template>

          {{ this.accesskey_prefix }}A
        </b-tooltip>

        <!-- button_run -->
        <b-tooltip v-if="item === 'btn_run'">
          <template #target>
            <b-button
              id="playExecution"
              class="actionsGroup h-100 text-truncate"
              size="sm"
              variant="outline-secondary"
              @click="execute_program"
              accesskey="r"
              :disabled="run_disable"
            >
              <font-awesome-icon :icon="['fas', 'play']" />
              Run
            </b-button>
          </template>

          {{ this.accesskey_prefix }}R
        </b-tooltip>

        <!-- button_flash -->
        <b-button
          v-if="item === 'btn_flash'"
          class="actionsGroup h-100"
          size="sm"
          variant="outline-secondary"
          v-b-modal.flash
        >
          <font-awesome-icon :icon="['fab', 'usb']" />
          Flash
        </b-button>

        <!-- button_stop -->
        <b-tooltip v-if="item === 'btn_stop'">
          <template #target>
            <b-button
              class="actionsGroup h-100"
              size="sm"
              variant="outline-secondary"
              accesskey="c"
              @click="stop_execution"
              :disabled="stop_disable"
              id="stop_execution"
            >
              <font-awesome-icon :icon="['fas', 'stop']" />
              Stop
            </b-button>
          </template>

          {{ this.accesskey_prefix }}C
        </b-tooltip>

        <!-- button_examples -->
        <b-button
          v-if="item == 'btn_examples'"
          class="menuButton h-100 text-truncate"
          size="sm"
          variant="outline-secondary"
          v-b-modal.examples-simulator
        >
          <font-awesome-icon :icon="['fas', 'file-lines']" />
          Examples
        </b-button>

        <!-- button_calculator -->
        <b-button
          v-if="item == 'btn_calculator'"
          class="menuButton h-100 text-truncate"
          size="sm"
          variant="outline-secondary"
          v-b-modal.calculator
        >
          <font-awesome-icon :icon="['fas', 'calculator']" />
          Calculator
        </b-button>

        <!-- button_configuration -->
        <b-button
          v-if="item == 'btn_configuration'"
          class="menuButton h-100 text-truncate"
          size="sm"
          variant="outline-secondary"
          id="conf_btn_sim"
          v-b-modal.configuration
        >
          <font-awesome-icon :icon="['fas', 'gears']" />
          Configuration
        </b-button>

        <!-- button_information -->

        <b-popover
          v-if="item === 'btn_information'"
          :click="true"
          :close-on-hide="true"
          :delay="{ show: 0, hide: 0 }"
          position="auto"
        >
          <template #target>
            <b-button
              class="infoButton text-truncate"
              size="sm"
              variant="outline-secondary"
              id="info"
            >
              <font-awesome-icon :icon="['fas', 'circle-info']" />
              Info
            </b-button>
          </template>

          <div class="d-grid gap-2">
            <b-button
              class="infoButton text-truncate"
              href="https://creatorsim.github.io/"
              target="_blank"
              size="sm"
              variant="outline-secondary"
              @click="help_event('general_help')"
            >
              <font-awesome-icon :icon="['fas', 'circle-question']" />
              Help
            </b-button>

            <b-button
              class="infoButton"
              v-if="show_instruction_help"
              id="inst_ass"
              v-b-toggle.sidebar_help
              size="sm"
              variant="outline-secondary"
              @click="help_event('instruction_help')"
            >
              <font-awesome-icon :icon="['fas', 'book']" />
              Instruction Help
            </b-button>

            <b-button
              class="menuButton"
              size="sm"
              variant="outline-secondary"
              v-b-modal.notifications
            >
              <font-awesome-icon :icon="['fas', 'bell']" />
              Notifications
            </b-button>
          </div>
        </b-popover>
      </b-col>
    </b-row>
  </b-container>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/bootstrap";

// scoped makes classes not work on b-dropdown, a workaround is to use
// `:deep(.my-class)`, but it doesn't work well with themes: if we apply the
// `:deep` selector a theme, it will affect the rest, so it doesn't work
// (see https://github.com/bootstrap-vue-next/bootstrap-vue-next/issues/2774)

// the workaround to the workaround is to just use class bindings

:deep(.menuButton),
.menuButton {
  background-color: #f8f9fa;
}
:deep(.menuButtonDark),
.menuButtonDark {
  background-color: #212529;
  color: $secondary;
}
:deep(.menuButtonDark:hover),
.menuButtonDark:hover {
  background-color: #424649;
}

.actionsGroup {
  background-color: #e0e0e0;
}

.infoButton {
  background-color: #d4db17;
}

[data-bs-theme="dark"] {
  .menuButton {
    background-color: #212529;
    color: $secondary;
  }
  .menuButton:hover {
    background-color: #424649;
  }

  .actionsGroup {
    background-color: #363636;
  }

  .actionsGroup:hover {
    background-color: #424649;
  }
  .infoButton {
    background-color: #a3a815;
    color: #f5f5f5;
  }
  .infoButton:hover {
    background-color: #424649;
  }
}
</style>
