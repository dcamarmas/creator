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
import { BModalOrchestrator, BToastOrchestrator } from "bootstrap-vue-next"
// import $ from "jquery"

import package_json from "/package.json" // package info
import arch_available from "/architecture/available_arch.json" // package info

import {
  notifications,
  backup_modal,
  creator_preload_fromHash,
  creator_preload_get2hash,
} from "./utils.mjs"

import {
  architecture,
  architecture_hash,
  status,
  stats,
  stats_value,
  total_clk_cycles,
  clk_cycles,
  clk_cycles_value,
  set_debug,
} from "@/core/core.mjs"


import {
  example_set_available,
  example_available,
  instructions,
} from "@/core/compiler/compiler.mjs"

import { track_stack_names } from "@/core/memory/stackTracker.mjs"

import SpinnerLoading from "./components/general/SpinnerLoading.vue"
import SupportedBrowsers from "./components/general/SupportedBrowsers.vue"
import FormConfiguration from "./components/general/FormConfiguration.vue"
import UIeltoNotifications from "./components/general/UIeltoNotifications.vue"
import NavbarCREATOR from "./components/general/NavbarCREATOR.vue"
import UIeltoInstitutions from "./components/general/UIeltoInstitutions.vue"
import UIeltoAbout from "./components/general/UIeltoAbout.vue"
import SidebarInstructionHelp from "./components/general/SidebarInstructionHelp.vue"
import UIeltoBackup from "./components/select_architecture/UIeltoBackup.vue"

import SelectArchitecture from "./components/SelectArchitecture.vue"
import ArchitectureView from "./components/ArchitectureView.vue"
import SimulatorView from "./components/SimulatorView.vue"
import AssemblyView from "./components/AssemblyView.vue"

import EditArchitecture from "./components/architecture/EditArchitecture.vue"
import SaveArchitecture from "./components/architecture/SaveArchitecture.vue"
// import ArchConf from "./components/architecture/configuration/ArchConf.vue"
// import MemoryLayout from "./components/architecture/memory_layout/MemoryLayout.vue"
// import RegisterFileArch from "./components/architecture/register_file/RegisterFileArch.vue"
// import Instructions from "./components/architecture/instructions/Instructions.vue"
// import InstructionFields from "./components/architecture/instructions/InstructionFields.vue"
// import Pseudoinstructions from "./components/architecture/pseudoinstructions/Pseudoinstructions.vue"
// import PseudoinstructionFields from "./components/architecture/pseudoinstructions/PseudoinstructionFields.vue"
// import Directives from "./components/architecture/directives/Directives.vue"
// import LoadAssembly from "./components/assembly/LoadAssembly.vue"
// import SaveAssembly from "./components/assembly/SaveAssembly.vue"
// import MakeURI from "./components/assembly/MakeURI.vue"
// import LoadLibrary from "./components/assembly/LoadLibrary.vue"
// import SaveLibrary from "./components/assembly/SaveLibrary.vue"
// import TextareaAssembly from "./components/assembly/TextareaAssembly.vue"
// import ListLibraryTags from "./components/assembly/ListLibraryTags.vue"
// import AssemblyError from "./components/assembly/AssemblyError.vue"
// import Flash from "./components/simulator/Flash.vue"
// import Examples from "./components/assembly/Examples.vue"
// import Calculator from "./components/simulator/Calculator.vue"
// import TableExecution from "./components/simulator/TableExecution.vue"
// import DataViewSelector from "./components/simulator/DataViewSelector.vue"
// import RegisterFile from "./components/simulator/RegisterFile.vue"
// import Memory from "./components/simulator/Memory.vue"
// import ClkCycles from "./components/simulator/ClkCycles.vue"
// import Monitor from "./components/simulator/Monitor.vue"
// import Keyboard from "./components/simulator/Keyboard.vue"

export default {
  name: "app",
  components: {
    BToastOrchestrator,
    BModalOrchestrator,
    SpinnerLoading,
    SupportedBrowsers,
    FormConfiguration,
    UIeltoNotifications,
    NavbarCREATOR,
    UIeltoInstitutions,
    UIeltoAbout,
    SidebarInstructionHelp,
    UIeltoBackup,

    SelectArchitecture,
    ArchitectureView,
    SimulatorView,
    AssemblyView,

    // EditArchitecture,
    // SaveArchitecture,
    // ArchConf,
    // MemoryLayout,
    // RegisterFileArch,
    // Instructions,
    // InstructionFields,
    // Pseudoinstructions,
    // PseudoinstructionFields,
    // Directives,
    // LoadAssembly,
    // SaveAssembly,
    // MakeURI,
    // LoadLibrary,
    // SaveLibrary,
    // TextareaAssembly,
    // ListLibraryTags,
    // AssemblyError,
    // Flash,
    // Examples,
    // Calculator,
    // TableExecution,
    // DataViewSelector,
    // RegisterFile,
    // Memory,
    // ClkCycles,
    // Monitor,
    // Keyboard,
  },

  /************
   * Vue Data *
   ************/
  // eslint-disable-next-line max-lines-per-function
  data() {
    return {
      first: "John",
      last: "Doe",

      /********************/
      /* Global Variables */
      /********************/

      //Forces vue to reload a component, similar to $forceUpdate()
      render: 0,

      //
      // General information
      //

      //Version Number
      version: package_json.version,

      //Architecture name and guide
      architecture_name: "",
      architecture_guide: "",

      //Accesskey
      os: "",
      browser: "",

      //Displayed notifications
      notifications, //TODO: copy or only in app?

      //
      // Current view
      //

      creator_mode: "select_architecture",

      //
      // Configuration
      //

      //Default architecture
      default_architecture:
        localStorage.getItem("conf_default_architecture") || "none",

      //Stack total list values
      stack_total_list:
        parseInt(localStorage.getItem("conf_stack_total_list"), 10) || 40,

      //Notification speed
      notification_time:
        parseInt(localStorage.getItem("conf_notification_time"), 10) || 1500,

      // Instruction help size
      instruction_help_size:
        parseInt(localStorage.getItem("conf_instruction_help_size"), 10) || 33,

      //Auto Scroll
      autoscroll: (a => {
        return a === null ? true : a === "true"
      })(localStorage.getItem("conf_autoscroll")), // if null, set to true, else respect the value

      // Font size
      font_size: 15,

      //Debug
      c_debug: false,

      //Dark Mode
      dark: (a => {
        return a === null ? null : a === "true"
      })(localStorage.getItem("conf_dark_mode")), // if null (no localStorage), set to null, else cast to bool

      /*************************/
      /* Architecture Selector */
      /*************************/

      //
      //Available architectures
      //

      arch_available, //TODO: copy or only in app?

      /****************/
      /* Architecture */
      /****************/

      //Load architecture
      architecture,
      architecture_hash,

      //Instructions fields
      modal_field_instruction: {
        //TODO: include into instruction component - modal info
        title: "",
        index: null,
        instruction: {},
      },

      //Pseudoinstruction fields
      modal_field_pseudoinstruction: {
        //TODO: include into pseudoinstruction component - modal info
        title: "",
        index: null,
        pseudoinstruction: {},
      },

      //Architecture edit code
      arch_code: "",

      /************/
      /* Assembly */
      /************/

      //
      //Available examples
      //

      example_set_available,
      example_available,

      //
      //Code error modal
      //

      modalAssemblyError: {
        code1: "",
        code2: "",
        code3: "",
        error: "",
      },

      //
      //Assembly code
      //

      assembly_code: ".text\n\tmain: li t0, 1",

      /*************/
      /* Simulator */
      /*************/

      //
      // Execution
      //

      //Instructions
      instructions,

      //
      //Data view
      //

      data_mode: "int_registers",

      //
      //Memory
      //

      // main_memory: {},
      // main_memory_busy: false,

      //Stack
      track_stack_names,
      // callee_subrutine: "",
      // caller_subrutine: "",
      // stack_pointer: 0,
      // begin_caller: 0,
      // end_caller: 0,
      // begin_callee: 0,
      // end_callee: 0,

      //
      //Stats
      //

      totalStats: status.totalStats,
      stats,
      //Stats Graph values
      stats_value,

      //
      //CLK Cycles
      //

      total_clk_cycles,
      clk_cycles,
      //CLK Cycles Graph values
      clk_cycles_value,

      //
      //Display and keyboard
      //

      display: "",
      keyboard: "",
      enter: null, // Draw text area border in read

      //
      //Flash
      //

      lab_url: "",
      result_email: "",
      target_ports: {
        Win: "rfc2217://host.docker.internal:4000?ign_set_control",
        Mac: "/dev/cu.usbserial-210",
        Linux: "/dev/ttyUSB0",
      }, //TODO: include into flash component - modal info
      target_board: "", //TODO: include into flash component - modal info
      target_port: "", //TODO: include into flash component - modal info
      flash_url: "http://localhost:8080", //TODO: include into flash component - modal info
    }
  },

  /************************
   * Created vue instance *
   ************************/
  created() {
    // uielto_preload_architecture.methods.load_arch_available()
    this.os = this.detect_os()
    this.browser = this.detect_browser()
    this.get_target_port()
  },

  /************************
   * Mounted vue instance *
   ************************/
  mounted() {
    backup_modal(this)

    //Pre-load following URL params
    const url_hash = creator_preload_get2hash(window.location)
    creator_preload_fromHash(this, url_hash)
    this.set_dark_mode()
  },

  /*************
   * Before UI *
   *************/
  beforeUpdate() {
    // uielto_configuration.methods.get_configuration()
  },

  /***************
   * Vue methots *
   ***************/

  methods: {
    /*******************
     * General methots *
     *******************/

    //Detects the operating system being used
    detect_os() {
      if (navigator.userAgent.includes("Win")) {
        return "Win"
      }
      if (navigator.userAgent.includes("Mac")) {
        return "Mac"
      }
      if (
        navigator.userAgent.includes("X11") ||
        navigator.userAgent.includes("Linux")
      ) {
        return "Linux"
      }
      return null
    },

    //Detects the browser being used
    detect_browser() {
      if (navigator.userAgent.includes("Chrome")) {
        return "Chrome"
      }
      if (navigator.userAgent.includes("Firefox")) {
        return "Firefox"
      }
      if (navigator.userAgent.includes("Safari")) {
        return "Safari"
      }
      return null
    },

    //Verify if dark mode was activated from cache
    set_dark_mode() {
      if (this.dark === null) {
        // detect prefered color scheme
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          this.dark = true
        } else {
          this.dark = false
        }
      }

      // set dark mode
      if (this.dark) {
        document.getElementsByTagName("body")[0].style =
          "filter: invert(88%) hue-rotate(160deg) !important; background-color: #111 !important;"
      } else {
        document.getElementsByTagName("body")[0].style = ""
      }
    },

    /*************/
    /* Simulator */
    /*************/

    //Exception Notification
    exception(error) {
      //TODO: Move?
      show_notification(
        "There has been an exception. Error description: '" + error,
        "danger",
      )

      if (execution_index !== -1) {
        instructions[execution_index]._rowVariant = "danger"
      }

      /* Google Analytics */
      creator_ga("execute", "execute.exception", "execute.exception." + error)
    },

    //Get target por by SO
    get_target_port() {
      this.target_port = this.target_ports[this.os]
    },
  },
};
</script>

<template>
  <!-- for showing toasts (notifications) from JS -->
  <BToastOrchestrator />

  <!-- for showing modals from JS -->
  <BModalOrchestrator />

  <!------------------------>
  <!-- General components -->
  <!------------------------>

  <!-- Loading spinner -->
  <SpinnerLoading id="loading" style="display: none" />

  <!-- Browser not supported modal -->
  <SupportedBrowsers :browser="this.browser" />

  <header>
    <!-- Navbar  -->
    <NavbarCREATOR
      :version="this.version"
      :architecture_name="this.architecture_name"
    />

    <!-- Configuration modal -->
    <!-- TODO: for some FUCKING reason these v-models don't sync -->
    <FormConfiguration
      id="configuration"
      v-model:arch_available="arch_available"
      v-model:default_architecture="default_architecture"
      v-model:stack_total_list="stack_total_list"
      v-model:autoscroll="autoscroll"
      v-model:instruction_help_size="instruction_help_size"
      v-model:notification_time="notification_time"
      v-model:dark="dark"
      v-model:c_debug="c_debug"
    />

    <!-- Information modals -->

    <!-- Notification modal -->
    <UIeltoNotifications id="notifications" :notifications="notifications" />

    <!-- Institutions modal -->
    <UIeltoInstitutions id="institutions" />

    <!-- About modal -->
    <UIeltoAbout id="about" />

    <!-- Instruction Help sidebar -->
    <SidebarInstructionHelp
      id="sidebar_help"
      :architecture_name="architecture_name"
      :architecture="architecture"
      :architecture_guide="architecture_guide"
      :instruction_help_size="instruction_help_size"
    />

    <!-- Backup modal -->
    <UIeltoBackup id="copy" />
  </header>

  <!----------------------->
  <!-- Select architecture -->
  <!----------------------->

  <SelectArchitecture
    v-if="creator_mode === 'select_architecture'"
    :arch_available="arch_available"
    :browser="browser"
    @select-architecture="
      arch_name => {
        architecture_name = arch_name
        creator_mode = 'simulator'
      }
    "
  />

  <!------------------>
  <!-- Architecture -->
  <!------------------>

  <ArchitectureView
    v-if="creator_mode == 'architecture'"
    :architecture_name="architecture_name"
    :arch_available="arch_available"
    :browser="browser"
  />

  <!------------------->
  <!-- Assembly view -->
  <!------------------->
  <AssemblyView
    v-if="creator_mode === 'assembly'"
    :architecture_name="architecture_name"
    :arch_available="arch_available"
    :browser="browser"
    :assembly_code="assembly_code"
    :modal_assembly_error="modalAssemblyError"
  />

  <!-------------------->
  <!-- Simulator view -->
  <!-------------------->

  <SimulatorView
    v-if="creator_mode == 'simulator'"
    v-model:data_mode="data_mode"
    :architecture_name="architecture_name"
    :arch_available="arch_available"
    :enter="enter"
    :browser="browser"
    :stack_total_list="stack_total_list"
  />
</template>

<style lang="scss" scoped>
:deep() {
  // applies to all sub-components
  body {
    background-color: #ffffff;
    overflow-x: hidden;
    font-size: 15px;
    height: 100vh;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .flexbox {
    display: flex;
  }

  .flexbox .stretch {
    flex: 1;
  }

  .flexbox .normal {
    flex: 0;
    margin: 0 0 0 1rem;
  }

  .flexbox div input {
    padding: 0.5em 1em;
    width: 100%;
  }

  .flexbox div button {
    padding: 0.5em 1em;
    white-space: nowrap;
  }

  .contenedor {
    display: -webkit-flex;
    display: flex;
    width: 100%;
    margin: 0px;
  }

  hr {
    height: 1px;
    background-color: #9e9e9e;
  }

  h1 {
    display: block;
    font-size: 1em;
  }

  h2 {
    display: block;
    font-size: 1.5em;
  }

  .h5 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    line-height: 1.2;
    display: inline-block;
  }

  .h6 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    line-height: 1.2;
    display: inline-block;
  }

  .h6Sm {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    line-height: 1.2;
    display: inline-block;
  }

  .noBorder {
    border-top: 0px;
    border-bottom: 0px;
    border-right: 0px;
  }

  .table td {
    vertical-align: middle;
  }

  .justify {
    text-align: justify;
  }

  .center {
    text-align: center;
  }

  .left {
    text-align: left;
  }

  .popover {
    max-width: 100%;
  }

  .infoButton {
    background-color: #d4db17;
  }

  .buttons {
    width: 100%;
    margin: 0px;
    margin-top: 1px;
    padding: 0px;
    font-size: 1em;
  }

  .menu {
    width: 100%;
    align-items: center;
    margin: 5px;
    margin-bottom: 10px;
  }

  .menuGroup {
    background-color: #fafafa;
  }

  .buttonBackground {
    background-color: white;
  }
}
</style>
