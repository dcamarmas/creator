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
import { useToggle } from "bootstrap-vue-next"

import {
  assembly_compile,
  set_execution_mode,
  status,
  guiVariables,
  instructions_packed,
  reset,
  remove_library,
  getPC,
} from "@/core/core.mjs"
import { resetStats } from "@/core/executor/stats.mts"
import { instructions, setInstructions } from "@/core/assembler/assembler.mjs"
import { step } from "@/core/executor/executor.mjs"
import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { packExecute } from "@/core/utils/utils.mjs"
import { show_notification, storeBackup } from "@/web/utils.mjs"
import { rasmAssemble } from "@/core/assembler/rasm/web/rasm.mjs"
import { assembleCreator } from "@/core/assembler/creatorAssembler/web/creatorAssembler.mjs"
import type { Instruction } from "@/core/assembler/assembler"

export default defineComponent({
  props: {
    group: { type: Array, required: true },
    instructions: Array as PropType<Instruction[]>,
    browser: { type: String, required: true },
    os: { type: String, required: true },
    dark: { type: Boolean, required: true },
    architectures: {
      type: Array as PropType<AvailableArch[]>,
      required: false,
    },
    show_instruction_help: { type: Boolean, default: false },
    dropdownMode: { type: Boolean, default: false },
    architecture_name: { type: String, required: false },
    disableTooltips: { type: Boolean, default: false },
  },

  setup() {
    // BV Composeables, such as these, should only be used inside setup
    const showAssemblyError = useToggle("modalAssemblyError").show

    return { showAssemblyError }
  },

  data() {
    return {
      compiling: false,
      reset_disable: true,
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
      } as { [key: string]: object },
    }
  },
  computed: {
    /**
     * Provides typed access to the root component
     */
    root(): AppRootInstance {
      return this.$root as unknown as AppRootInstance
    },

    selectedCompilerLabel() {
      const found = this.compilerOptions.find(
        opt => opt.value === this.selectedCompiler,
      )
      return found ? found.text : ""
    },
    arch_available() {
      return this.architectures!.filter(a => a.available)
    },

    instruction_values: {
      get() {
        return this.instructions
      },
      set(value: Instruction[]) {
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
    if ((this.root as any).creator_mode === "simulator") {
      // enable execution buttons only if there are instructions to execute
      const prepared_for_execution = (this.root as any).instructions.length > 0

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
    help_event(event: string) {
      creator_ga("send", `help.${event}`, `help.${event}`)
    },

    //
    // Screen change
    //

    change_UI_mode(e: string) {
      if ((this.root as any).creator_mode !== e) {
        ;(this.root as any).creator_mode = e
      }
    },

    //
    // Assembly
    //

    new_assembly() {
      ;(this.root as any).assembly_code = ""
    },

    //Compile assembly code (just assemble, don't change view)
    async assembly_compiler_only() {
      // reset simulator
      const root = this.root as unknown as AppRootInstance
      root.keyboard = ""
      root.display = ""
      root.enter = null
      reset()

      this.compiling = true // Change buttons status

      // Assemble
      const assemblerFn = this.assembler_map[this.selectedCompiler]
      // If default, let assembly_compile use its internal default
      const ret = await (assemblerFn
        ? assembly_compile(root.assembly_code, assemblerFn)
        : assembly_compile(root.assembly_code))

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
          // Don't change view - stay in assembly mode
          break
      }
      this.compiling = false

      // Close all toast
      // app.$bvToast.hide()

      storeBackup()
    },

    //Compile assembly code (assemble and run - change to simulator view)
    async assembly_compiler() {
      // reset simulator
      this.root.keyboard = ""
      this.root.display = ""
      this.root.enter = null
      reset()

      this.compiling = true // Change buttons status

      // Assemble
      const assemblerFn = this.assembler_map[this.selectedCompiler]
      // If default, let assembly_compile use its internal default
      const ret = await (assemblerFn
        ? assembly_compile(this.root.assembly_code, assemblerFn)
        : assembly_compile(this.root.assembly_code))

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
          // Don't change view - stay in assembly mode
          break
      }
      this.compiling = false

      // Close all toast
      // app.$bvToast.hide()

      storeBackup()
    },

    // Show error message in the compilation
    compile_error(msg: string) {
      // this.change_UI_mode("assembly")

      // set compilation msg
      this.root.assemblyError = msg

      // show assembly error modal
      this.showAssemblyError()
    },

    //Remove a loaded binary
    removeLibrary() {
      // this.root.librayLoaded = false
      remove_library()
    },

    //
    // Vim mode toggle
    //

    toggleVim() {
      this.root.vim_mode = !this.root.vim_mode
      localStorage.setItem("conf_vim_mode", this.root.vim_mode.toString())
      
      // Google Analytics
      creator_ga(
        "configuration",
        "configuration.vim_mode",
        "configuration.vim_mode." + this.root.vim_mode,
      )
    },

    //
    // Library tags
    //

    // TODO: Fix library
    libraryLoaded() {
      return guiVariables.loadedLibrary && Object.keys(guiVariables.loadedLibrary).length !== 0
    },

    libraryTags() {
      if (!this.libraryLoaded()) {
        return []
      }
      return guiVariables.loadedLibrary?.instructions_tag?.filter(t => t.globl) || []
    },

    //
    // Simulator actions
    //

    /**
     * Updates the execution table UI, according to the return value of an execution.
     */
    execution_UI_update(ret: ExecutionResult | undefined) {
      // this is ugly, but it's the only way I found, because the computed
      // properties in PlotStats.vue / TableStats.vue / TableExecution.vue don't
      // react to changes done to `stats`

      if (ret === undefined) {
        return
      }

      /* MEMORY */
      ;(
        this.root as any
      ).$refs.simulatorView?.$refs.memory?.$refs?.hexviewer?.refresh()

      /* STATS */
      ;(this.root as any).$refs.simulatorView?.$refs.stats?.refresh()

      /* EXECUTION TABLE */

      // update instructions' _rowVariant depending on the result of the
      // execution

      // we use this style of loop instead of a `for (const [i, instruction] of
      // this.instruction_values.entries())` because we have to update through
      // `this.instruction_values` so the computed property is updated
      const currentPC = getPC()
      const previousPC = guiVariables.previous_PC
      const keep_highlighted = guiVariables.keep_highlighted
      for (let i = 0; i < this.instruction_values!.length; i++) {
        // _rowVariant is the color of the row
        // It's called _rowVariant because bootstrap-vue uses that name
        this.instruction_values![i]!._rowVariant = ""
        switch (BigInt(this.instruction_values![i]!.Address)) {
          case keep_highlighted:
            this.instruction_values![i]!._rowVariant = "warning"
            break

          case previousPC:
            this.instruction_values![i]!._rowVariant = "info"
            break

          case currentPC:
            this.instruction_values![i]!._rowVariant = "success"
            break

          default:
            break
        }
      }

      // Auto-scroll

      if (
        (this.root as any).autoscroll &&
        status.run_program !== 1 &&
        this.instructions!.length > 0
      ) {
        // scroll to next instruction

        if (
          status.execution_index >= 0 &&
          status.execution_index < this.instructions!.length
        ) {
          let row = status.execution_index + 1 // next instruction
          if (status.execution_index + 1 === this.instructions!.length) {
            // last instruction, use current instruction instead
            row = status.execution_index
          }

          const rowElement = document.querySelector(
            "#inst_table__row_" + this.instructions![row]!.Address,
          ) as HTMLElement
          const tableElement = document.querySelector(".instructions_table")

          if (rowElement && tableElement) {
            const rowPos = rowElement.offsetTop
            const tableHeight = tableElement.clientHeight

            tableElement.scrollTo({
              top: rowPos - tableHeight / 2,
              behavior: "smooth",
            })
          }
        } else {
          // scroll to top
          const tableElement = document.querySelector(".instructions_table")

          if (tableElement) {
            tableElement.scrollTo({
              top: tableElement.scrollHeight,
              behavior: "smooth",
            })
          }
        }
      }
    },

    /**
     * Resets the execution table's UI
     */
    execution_UI_reset() {
      const draw: ExecutionDraw = {
        space: [],
        info: [],
        success: [],
        warning: [],
        danger: [],
        flash: [],
      }

      for (let i = 0; i < this.instructions!.length; i++) {
        draw.space.push(i)
      }

      // put rowVariant in entrypoint
      draw.success.push(status.execution_index)
      // draw.success.push(this.instructions.findIndex(i => i.Address === ))

      this.execution_UI_update(packExecute(false, null, null, draw))
    },

    // Reset execution
    reset() {
      // Google Analytics
      creator_ga("execute", "execute.reset", "execute.reset")

      // UI: reset I/O
      ;(this.root as any).keyboard = ""
      ;(this.root as any).display = ""
      ;(this.root as any).enter = null

      // reset button status
      this.reset_disable = false
      this.instruction_disable = false
      this.run_disable = false
      this.stop_disable = true

      reset()

      this.execution_UI_reset()
    },

    // Execute one instruction
    execute_instruction() {
      // Google Analytics
      creator_ga("execute", "execute.instruction", "execute.instruction")

      set_execution_mode(0)

      let ret
      try {
        ret = step() as unknown as ExecutionResult
      } catch (err: any) {
        console.error("Execution error:", err)
        show_notification(`Execution error: ${err.message || err}`, "danger")

        // Mark current instruction with error
        if (
          status.execution_index >= 0 &&
          status.execution_index < this.instruction_values!.length
        ) {
          this.instruction_values![status.execution_index]!._rowVariant =
            "danger"
        }

        // Stop execution
        status.execution_index = -1
        status.error = true

        this.execution_UI_update({ error: true, msg: err.message || err })
        return
      }

      if (status.run_program === 3) {
        // mutex read
        this.instruction_disable = true
        this.run_disable = true
      }

      if (typeof ret === "undefined") {
        console.log("Something weird happened :-S")
      }

      if (ret.msg) {
        show_notification(ret.msg, ret.type!)
      }

      if (ret.draw !== null) {
        this.execution_UI_update(ret)
      }
    },

    //Execute all program
    execute_program() {
      // Google Analytics
      creator_ga("execute", "execute.run", "execute.run")

      set_execution_mode(1)

      if (status.run_program === 0) {
        status.run_program = 1
      }

      if (this.instructions!.length === 0) {
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

      this.execute_program_packed()
    },

    execute_program_packed() {
      let ret = undefined

      for (
        let i = 0;
        i < instructions_packed && status.execution_index >= 0;
        i++
      ) {
        if (
          status.run_program === 0 || // stop button pressed
          status.run_program === 3 || // wait for user input at keyboard
          (instructions[status.execution_index]?.Break === true &&
            status.run_program !== 2) // stop because a breakpoint
        ) {
          this.execution_UI_update(ret)

          //Change buttons status
          this.reset_disable = false
          this.instruction_disable = false
          this.run_disable = false
          this.stop_disable = true

          if (instructions[status.execution_index]?.Break === true) {
            status.run_program = 2 //In case breakpoint --> stop
          }
          return
        } else {
          if (status.run_program === 2) {
            status.run_program = 1
          }

          try {
            ret = step() as unknown as ExecutionResult
          } catch (err: any) {
            // Handle execution error without crashing
            console.error("Execution error:", err)
            show_notification(
              `Execution error: ${err.message || err}`,
              "danger",
            )

            // Mark current instruction with error
            if (
              status.execution_index >= 0 &&
              status.execution_index < this.instruction_values!.length
            ) {
              this.instruction_values![status.execution_index]!._rowVariant =
                "danger"
            }

            // Stop execution
            status.run_program = 0
            status.execution_index = -1
            status.error = true

            this.execution_UI_update({ error: true, msg: err.message || err })

            //Change buttons status
            this.reset_disable = false
            this.instruction_disable = false
            this.run_disable = false
            this.stop_disable = true

            return
          }

          if (typeof ret === "undefined") {
            console.log("Something weird happened :-S")
            status.run_program = 0

            this.execution_UI_update(ret)

            //Change buttons status
            this.reset_disable = false
            this.instruction_disable = false
            this.run_disable = false
            this.stop_disable = true

            return
          }

          if (ret.msg) {
            show_notification(ret.msg, ret.type!)

            this.execution_UI_update(ret)

            //Change buttons status
            this.reset_disable = false
            this.instruction_disable = false
            this.run_disable = false
            this.stop_disable = true
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
      }
    },

    //Stop program excution
    stop_execution() {
      status.run_program = 0

      //Change buttons status
      this.reset_disable = false
      this.instruction_disable = false
      this.run_disable = false
      this.stop_disable = true
    },
  },
})
</script>

<template>
  <!-- Dropdown mode: render as dropdown items -->
  <template v-if="dropdownMode">
    <template v-for="(item, index) in group" :key="index">
      <!-- button_architecture -->
      <b-dropdown-item v-if="item === 'btn_architecture'" @click="change_UI_mode('architecture')">
        <font-awesome-icon :icon="['fas', 'screwdriver-wrench']" class="me-2" />
        Architecture
      </b-dropdown-item>

      <!-- button_assembly -->
      <b-dropdown-item v-if="item === 'btn_assembly'" @click="change_UI_mode('assembly')">
        <font-awesome-icon :icon="['fas', 'hashtag']" class="me-2" />
        Assembly
      </b-dropdown-item>

      <!-- button_simulator -->
      <b-dropdown-item v-if="item === 'btn_simulator'" @click="change_UI_mode('simulator')">
        <font-awesome-icon :icon="['fas', 'gears']" class="me-2" />
        Simulator
      </b-dropdown-item>

      <!-- button_edit_architecture -->
      <b-dropdown-item v-if="item === 'btn_edit_architecture'" v-b-modal.edit_architecture>
        <font-awesome-icon :icon="['fas', 'pen-to-square']" class="me-2" />
        Edit Architecture
      </b-dropdown-item>

      <!-- button_save_architecture -->
      <b-dropdown-item v-if="item === 'btn_save_architecture'" v-b-modal.save_architecture>
        <font-awesome-icon :icon="['fas', 'download']" class="me-2" />
        Save Architecture
      </b-dropdown-item>

      <!-- dropdown_assembly_file - expand its items -->
      <template v-if="item === 'dropdown_assembly_file'">
        <b-dropdown-item @click="new_assembly">
          <font-awesome-icon :icon="['far', 'file']" class="me-2" />
          New
        </b-dropdown-item>
        <b-dropdown-item v-b-modal.load_assembly>
          <font-awesome-icon :icon="['fas', 'upload']" class="me-2" />
          Load
        </b-dropdown-item>
        <b-dropdown-item v-b-modal.save_assembly>
          <font-awesome-icon :icon="['fas', 'download']" class="me-2" />
          Save
        </b-dropdown-item>
        <b-dropdown-item v-b-modal.examples-assembly>
          <font-awesome-icon :icon="['fas', 'file-lines']" class="me-2" />
          Examples
        </b-dropdown-item>
        <b-dropdown-item v-b-modal.make_uri>
          <font-awesome-icon :icon="['fas', 'link']" class="me-2" />
          Get code as URI
        </b-dropdown-item>
      </template>

      <!-- dropdown_library - expand its items -->
      <template v-if="item === 'dropdown_library'">
        <b-dropdown-item v-b-modal.load_binary>
          <font-awesome-icon :icon="['fas', 'upload']" class="me-2" />
          Load Library
        </b-dropdown-item>
        <b-dropdown-item @click="removeLibrary">
          <font-awesome-icon :icon="['fas', 'trash-can']" class="me-2" />
          Remove Library
        </b-dropdown-item>
      </template>

      <!-- button_reset -->
      <b-dropdown-item v-if="item === 'btn_reset'" @click="reset()" :disabled="reset_disable">
        <font-awesome-icon :icon="['fas', 'power-off']" class="me-2" />
        Reset
      </b-dropdown-item>

      <!-- button_instruction -->
      <b-dropdown-item v-if="item === 'btn_instruction'" @click="execute_instruction" :disabled="instruction_disable">
        <font-awesome-icon :icon="['fas', 'forward-step']" class="me-2" />
        Step Instruction
      </b-dropdown-item>

      <!-- button_run -->
      <b-dropdown-item v-if="item === 'btn_run'" @click="execute_program" :disabled="run_disable">
        <font-awesome-icon :icon="['fas', 'play']" class="me-2" />
        Run
      </b-dropdown-item>

      <!-- button_stop -->
      <b-dropdown-item v-if="item === 'btn_stop'" @click="stop_execution" :disabled="stop_disable">
        <font-awesome-icon :icon="['fas', 'stop']" class="me-2" />
        Stop
      </b-dropdown-item>

      <!-- button_flash -->
      <b-dropdown-item v-if="item === 'btn_flash'" v-b-modal.flash :disabled="!reset_disable">
        <font-awesome-icon :icon="['fab', 'usb']" class="me-2" />
        Flash
      </b-dropdown-item>

      <!-- button_examples -->
      <b-dropdown-item v-if="item === 'btn_examples'" v-b-modal.examples>
        <font-awesome-icon :icon="['fas', 'file-lines']" class="me-2" />
        Examples
      </b-dropdown-item>

      <!-- button_calculator -->
      <b-dropdown-item v-if="item === 'btn_calculator'" v-b-modal.calculator>
        <font-awesome-icon :icon="['fas', 'calculator']" class="me-2" />
        Calculator
      </b-dropdown-item>

      <!-- button_vim_toggle -->
      <b-dropdown-item v-if="item === 'btn_vim_toggle'" @click="toggleVim">
        <font-awesome-icon :icon="['fab', 'vimeo-v']" class="me-2" />
        Vim Mode {{ root.vim_mode ? '(On)' : '(Off)' }}
      </b-dropdown-item>

      <!-- button_library_tags -->
      <b-dropdown-item v-if="item === 'btn_library_tags'" v-b-modal.library_tags>
        <font-awesome-icon :icon="['fas', 'tags']" class="me-2" />
        Library Tags
      </b-dropdown-item>

      <!-- Creator menu items -->
      <b-dropdown-item v-if="item === 'btn_architecture_info'" disabled>
        <font-awesome-icon :icon="['fas', 'microchip']" class="me-2" />
        <strong>{{ architecture_name }}</strong>
      </b-dropdown-item>

      <b-dropdown-divider v-if="item === 'divider'" />

      <b-dropdown-item v-if="item === 'btn_home'" href=".">
        <font-awesome-icon :icon="['fas', 'home']" class="me-2" />
        Home
      </b-dropdown-item>

      <b-dropdown-item v-if="item === 'btn_website'" href="https://creatorsim.github.io/" target="_blank">
        <font-awesome-icon :icon="['fas', 'globe']" class="me-2" />
        Website
      </b-dropdown-item>

      <b-dropdown-item v-if="item === 'btn_github'" href="https://github.com/creatorsim/creator" target="_blank">
        <font-awesome-icon :icon="['fab', 'github']" class="me-2" />
        GitHub
      </b-dropdown-item>

      <b-dropdown-item v-if="item === 'btn_configuration'" v-b-modal.configuration>
        <font-awesome-icon :icon="['fas', 'gears']" class="me-2" />
        Settings...
      </b-dropdown-item>

      <!-- Help menu items -->
      <b-dropdown-item v-if="item === 'btn_help'" href="https://creatorsim.github.io/" target="_blank" @click="help_event('general_help')">
        <font-awesome-icon :icon="['fas', 'circle-question']" class="me-2" />
        Help
      </b-dropdown-item>

      <b-dropdown-item v-if="item === 'btn_instruction_help'" v-b-toggle.sidebar_help @click="help_event('instruction_help')">
        <font-awesome-icon :icon="['fas', 'book']" class="me-2" />
        Instruction Help
      </b-dropdown-item>

      <b-dropdown-item v-if="item === 'btn_notifications'" v-b-modal.notifications>
        <font-awesome-icon :icon="['fas', 'bell']" class="me-2" />
        Notifications
      </b-dropdown-item>

      <b-dropdown-item v-if="item === 'btn_feedback'" href="https://docs.google.com/forms/d/e/1FAIpQLSdFbdy5istZbq2CErZs0cTV85Ur8aXiIlxvseLMhPgs0vHnlQ/viewform?usp=header" target="_blank">
        <font-awesome-icon :icon="['fas', 'star']" class="me-2" />
        Feedback
      </b-dropdown-item>

      <b-dropdown-item v-if="item === 'btn_suggestions'" href="https://docs.google.com/forms/d/e/1FAIpQLSfSclv1rKqBt5aIIP3jfTGbdu8m_vIgEAaiqpI2dGDcQFSg8g/viewform?usp=header" target="_blank">
        <font-awesome-icon :icon="['fas', 'lightbulb']" class="me-2" />
        Suggestions
      </b-dropdown-item>

      <b-dropdown-item v-if="item === 'btn_institutions'" v-b-modal.institutions>
        <font-awesome-icon :icon="['fas', 'building-columns']" class="me-2" />
        Community
      </b-dropdown-item>

      <b-dropdown-item v-if="item === 'btn_about'" v-b-modal.about>
        <font-awesome-icon :icon="['fas', 'address-card']" class="me-2" />
        About Us
      </b-dropdown-item>
    </template>
  </template>

  <!-- Normal mode: render as buttons -->
  <b-container v-else fluid class="toolbar-container">
    <b-row class="toolbar-row">
      <b-col
        class="toolbar-col"
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

<b-dropdown-item-button v-for="arch in arch_available" @click="load_arch_select(arch)">
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

        <!-- assembler dropdown split button (just assemble) -->
        <b-dropdown
          v-if="item === 'btn_assemble'"
          variant="outline-secondary"
          :toggle-class="{ menuButton: !dark, menuButtonDark: dark }"
          :split-class="{
            menuButton: !dark,
            menuButtonDark: dark,
          }"
          split
          right
          size="sm"
          :id="'assemble_only'"
          class="assemble-dropdown"
        >
          <template #button-content>
            <span @click="assembly_compiler_only" class="assemble-button-content">
              <font-awesome-icon :icon="['fas', 'hammer']" class="me-1" />
              <span class="assemble-text">Assemble ({{ selectedCompilerLabel }})</span>
              <b-spinner small v-if="compiling" class="ms-1" />
            </span>
          </template>

          <b-dropdown-item-button
            v-for="option in compilerOptions"
            :key="option.value"
            @click="selectedCompiler = option.value"
          >
            <font-awesome-icon :icon="['fas', 'check']" class="me-2" v-if="selectedCompiler === option.value" />
            <span :class="{ 'ms-4': selectedCompiler !== option.value }">{{ option.text }}</span>
          </b-dropdown-item-button>
        </b-dropdown>

        <!-- assembler and run button -->
        <b-button
          v-if="item === 'btn_assemble_and_run'"
          variant="outline-secondary"
          :class="{ menuButton: !dark, menuButtonDark: dark }"
          size="sm"
          @click="assembly_compiler"
          :disabled="compiling"
        >
          <font-awesome-icon :icon="['fas', 'right-to-bracket']" class="me-1" />
          <span class="assemble-text">Assemble & Run</span>
          <b-spinner small v-if="compiling" class="ms-1" />
        </b-button>

        <!-- vim toggle button -->
        <b-button
          v-if="item === 'btn_vim_toggle'"
          variant="outline-secondary"
          :class="{ menuButton: !dark, menuButtonDark: dark }"
          size="sm"
          @click="toggleVim"
        >
          <font-awesome-icon :icon="['fab', 'vimeo-v']" class="me-1" />
          <span class="assemble-text">Vim {{ root.vim_mode ? 'On' : 'Off' }}</span>
        </b-button>

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
        <b-button
          v-if="item === 'btn_reset'"
          variant="outline-secondary"
          :class="{ menuButton: !dark, menuButtonDark: dark }"
          size="sm"
          accesskey="x"
          @click="reset()"
          :disabled="reset_disable"
          v-b-tooltip.hover="!disableTooltips"
          :title="`${accesskey_prefix}X`"
        >
          <font-awesome-icon :icon="['fas', 'power-off']" class="me-1" />
          <span class="assemble-text">Reset</span>
        </b-button>

        <!-- button_instruction -->
        <b-button
          v-if="item === 'btn_instruction'"
          variant="outline-secondary"
          :class="{ menuButton: !dark, menuButtonDark: dark }"
          size="sm"
          accesskey="a"
          @click="execute_instruction"
          :disabled="instruction_disable"
          v-b-tooltip.hover="!disableTooltips"
          :title="`${accesskey_prefix}A`"
        >
          <font-awesome-icon :icon="['fas', 'forward-step']" class="me-1" />
          <span class="assemble-text">Step</span>
        </b-button>

        <!-- button_run -->
        <b-button
          v-if="item === 'btn_run'"
          id="playExecution"
          variant="outline-secondary"
          :class="{ menuButton: !dark, menuButtonDark: dark }"
          size="sm"
          @click="execute_program"
          accesskey="r"
          :disabled="run_disable"
          v-b-tooltip.hover="!disableTooltips"
          :title="`${accesskey_prefix}R`"
        >
          <font-awesome-icon :icon="['fas', 'play']" class="me-1" />
          <span class="assemble-text">Run</span>
        </b-button>

        <!-- button_stop -->
        <b-button
          v-if="item === 'btn_stop'"
          variant="outline-secondary"
          :class="{ menuButton: !dark, menuButtonDark: dark }"
          size="sm"
          accesskey="c"
          @click="stop_execution"
          :disabled="stop_disable"
          id="stop_execution"
          v-b-tooltip.hover="!disableTooltips"
          :title="`${accesskey_prefix}C`"
        >
          <font-awesome-icon :icon="['fas', 'stop']" class="me-1" />
          <span class="assemble-text">Stop</span>
        </b-button>
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

// Toolbar layout for navbar integration
.toolbar-container {
  padding: 0 !important;
  margin: 0 !important;
}

.toolbar-row {
  margin: 0 !important;
  display: inline-flex;
  flex-wrap: nowrap;
  gap: 0.25rem;
}

.toolbar-col {
  padding: 0 !important;
  margin: 0 !important;
  flex: none;
  width: auto;
}

// Using color-mix for semi-transparent backgrounds
.menuButton {
  min-height: 24px;
  min-width: 16px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  font-size: 0.8125rem;
  
  // Light theme colors
  color: rgba(0, 0, 0, 0.8);
  background-color: color-mix(in srgb, currentColor 10%, transparent);
  box-shadow: none;
  
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);



  &.keyboard-activating:not(:disabled),
  &:active:not(:disabled) {
    background-color: color-mix(in srgb, currentColor 30%, transparent);
  }

  &:checked {
    background-color: color-mix(in srgb, currentColor 30%, transparent);


    &.keyboard-activating:not(:disabled),
    &:active:not(:disabled) {
      background-color: color-mix(in srgb, currentColor 40%, transparent);
    }
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, currentColor 50%, transparent);
    outline-offset: 2px;
    transition: outline 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  &:disabled {
    opacity: 0.5;

    label {
      opacity: 1;
    }
  }

  // Image button variant (icon only)
  &.image-button {
    min-width: 24px;
    padding-left: 5px;
    padding-right: 5px;
  }

  // Text button variant
  &.text-button {
    padding-left: 17px;
    padding-right: 17px;
  }
}

// Dark theme variant
.menuButtonDark {
  min-height: 24px;
  min-width: 16px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  font-size: 0.8125rem;
  
  // Dark theme colors
  color: rgba(255, 255, 255, 0.9);
  background-color: color-mix(in srgb, currentColor 10%, transparent);
  box-shadow: none;
  
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover:not(:disabled) {
    background-color: color-mix(in srgb, currentColor 15%, transparent);
  }

  &.keyboard-activating:not(:disabled),
  &:active:not(:disabled) {
    background-color: color-mix(in srgb, currentColor 30%, transparent);
  }

  &:checked {
    background-color: color-mix(in srgb, currentColor 30%, transparent);

    &:hover:not(:disabled) {
      background-color: color-mix(in srgb, currentColor 35%, transparent);
    }

    &.keyboard-activating:not(:disabled),
    &:active:not(:disabled) {
      background-color: color-mix(in srgb, currentColor 40%, transparent);
    }
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, currentColor 50%, transparent);
    outline-offset: 2px;
    transition: outline 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  &:disabled {
    opacity: 0.5;

    label {
      opacity: 1;
    }
  }

  // Image button variant (icon only)
  &.image-button {
    min-width: 24px;
    padding-left: 5px;
    padding-right: 5px;
  }

  // Text button variant
  &.text-button {
    padding-left: 17px;
    padding-right: 17px;
  }
}

// Dropdown buttons need special handling due to Bootstrap Vue structure
:deep(.btn-group) {
  .menuButton,
  .menuButtonDark {
    // Split button main part
    &.btn {
      min-height: 24px;
      max-height: 32px;
      min-width: 16px;
      border-radius: 6px;
      border: none;
      font-weight: bold;
      font-size: 0.8125rem;
      box-shadow: none;
      transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    // Remove right border radius on left part of split button
    &.btn:not(.dropdown-toggle) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      margin-right: -1px;
    }

    // Remove left border radius on right part of split button (dropdown toggle)
    &.dropdown-toggle {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      margin-left: -1px;
      padding-left: 8px;
      padding-right: 8px;
    }
  }

  // Light theme dropdown buttons
  .menuButton.btn {
    color: rgba(0, 0, 0, 0.8);
    background-color: color-mix(in srgb, currentColor 10%, transparent);

    &:hover:not(:disabled) {
      background-color: color-mix(in srgb, currentColor 15%, transparent);
    }

    &:active:not(:disabled),
    &.show {
      background-color: color-mix(in srgb, currentColor 30%, transparent);
    }

    &:focus-visible {
      outline: 2px solid color-mix(in srgb, currentColor 50%, transparent);
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.5;
    }
  }

  // Dark theme dropdown buttons
  .menuButtonDark.btn {
    color: rgba(255, 255, 255, 0.9);
    background-color: color-mix(in srgb, currentColor 10%, transparent);

    &:hover:not(:disabled) {
      background-color: color-mix(in srgb, currentColor 15%, transparent);
    }

    &:active:not(:disabled),
    &.show {
      background-color: color-mix(in srgb, currentColor 30%, transparent);
    }

    &:focus-visible {
      outline: 2px solid color-mix(in srgb, currentColor 50%, transparent);
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.5;
    }
  }
}

// Dropdown item hover/active styles for dark mode
[data-bs-theme="dark"] :deep(.dropdown-item) {
  &:hover,
  &:active {
    background-color: rgba(255, 255, 255, 0.08) !important;
    color: rgba(255, 255, 255, 0.95) !important;
  }
}

// Ensure dropdown wrapper itself has proper styling
.assemble-dropdown {
  .assemble-button-content {
    display: inline-flex;
    align-items: center;
  }
}
</style>
