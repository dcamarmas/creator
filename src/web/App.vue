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
import { BOrchestrator, useToast } from "bootstrap-vue-next"

import package_json from "/package.json" // package info
import arch_available from "/architecture/available_arch.json"

import {
  notifications,
  show_notification,
  loadDefaultArchitecture,
  loadExample,
} from "./utils.mjs"

import { set_debug, status, initCAPI } from "@/core/core.mjs"
import { stats } from "@/core/executor/stats.mts"

import { instructions } from "@/core/assembler/assembler.mjs"

import { creator_ga } from "@/core/utils/creator_ga.mjs"

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

const creatorASCII = `
 ██████╗██████╗ ███████╗ █████╗ ████████╗ ██████╗ ██████╗
██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗
██║     ██████╔╝█████╗  ███████║   ██║   ██║   ██║██████╔╝
██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║   ██║██╔══██╗
╚██████╗██║  ██║███████╗██║  ██║   ██║   ╚██████╔╝██║  ██║
 ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
  didaCtic and geneRic assEmbly progrAmming simulaTOR
`

export default {
  name: "app",
  components: {
    BOrchestrator,
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
  },

  /************
   * Vue Data *
   ************/

  setup() {
    // BV Composeables, such as these, should only be used inside setup
    const createToast = useToast().create // shows a toast notification

    return { createToast }
  },

  data() {
    return {
      /********************/
      /* Global Variables */
      /********************/

      //
      // General information
      //

      // Version Number
      version: package_json.version,
      simulatorViewKey: 0, // Add a key for SimulatorView to force re-render

      // Architecture name and guide
      architecture_name: "",
      architecture_guide: "",

      // Accesskey
      os: "",
      browser: "",

      // Displayed notifications
      notifications, //TODO: copy or only in app?

      // window size
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,

      //
      // Current view
      //

      creator_mode: "select_architecture",

      //
      // Configuration
      //

      // Default architecture
      default_architecture:
        localStorage.getItem("conf_default_architecture") || "none",

      // Stack total list values
      stack_total_list:
        parseInt(localStorage.getItem("conf_stack_total_list"), 10) || 40,

      // Notification speed
      notification_time:
        parseInt(localStorage.getItem("conf_notification_time"), 10) || 1500,

      // Instruction help size
      instruction_help_size:
        parseInt(localStorage.getItem("conf_instruction_help_size"), 10) || 33,

      // Auto Scroll
      autoscroll: (a => {
        return a === null ? true : a === "true"
      })(localStorage.getItem("conf_autoscroll")), // if null, set to true, else respect the value

      // Backup
      backup: (a => {
        return a === null ? true : a === "true"
      })(localStorage.getItem("conf_backup")), // if null, set to true, else respect the value

      // Font size
      font_size: 15,

      // Debug
      c_debug: false,

      // Dark Mode
      dark: (a => {
        return a === null ? null : a === "true"
      })(localStorage.getItem("conf_dark_mode")), // if null (no localStorage), set to null, else cast to bool

      vim_mode: localStorage.getItem("conf_vim_mode") === "true",

      vim_custom_keybinds:
        JSON.parse(localStorage.getItem("conf_vim_custom_keybinds")) || [],

      /*************************/
      /* Architecture Selector */
      /*************************/

      //
      // Available architectures
      //

      /****************/
      /* Architecture */
      /****************/

      // Architecture edit code
      arch_code: "",

      /************/
      /* Assembly */
      /************/

      //
      // Code error modal
      //

      assemblyError: "",

      //
      // Assembly code
      //

      assembly_code: "",

      /*************/
      /* Simulator */
      /*************/

      //
      // Execution
      //

      // Instructions
      instructions,

      //
      // Data view
      //

      // we must store this data in the root, bc it resets when re-mounting a
      // component (in this case, RegisterFile)
      data_mode: "int_registers",
      reg_representation_int: "signed",
      reg_representation_float: "ieee32",
      reg_name_representation: "alias",
      memory_segment: "data",

      // Stack
      callee_frame: undefined,
      caller_frame: undefined,
      stack_pointer: 0,

      //
      // Stats
      //

      stats,
      stat_representation: "graphic",
      stat_type: "instructions",

      //
      // Display and keyboard
      //

      display: "",
      keyboard: "",
      enter: null, // defines the state of the keyboard: no keyboard read pending (null), keyboard pending (false), or keyboard success (true)

      //
      // Flash
      //

      target_ports: {
        Win: "rfc2217://host.docker.internal:4000?ign_set_control",
        Mac: "/dev/cu.usbserial-210",
        Linux: "/dev/ttyUSB0",
      },

      lab_url: "",
      result_email: "",
      target_board: "",
      target_port: "",
      flash_url: "http://localhost:8080",
    }
  },

  computed: {
    arch_available() {
      const architectures = arch_available.map(a => ({ ...a, default: true }))
      const customArchs = JSON.parse(
        localStorage.getItem("customArchitectures"),
      )

      if (customArchs) {
        architectures.push(...customArchs)
      }

      return architectures
    },
  },

  /************************
   * Created vue instance *
   ************************/
  created() {
    this.os = this.detect_os()
    this.browser = this.detect_browser()
    this.target_port = this.get_target_port()
  },

  /************************
   * Mounted vue instance *
   ************************/
  mounted() {
    // Preload following URL params
    this.loadFromURI()

    // set config
    this.set_dark_mode()
    set_debug(this.c_debug)
    initCAPI()

    // listener for window size changes
    window.addEventListener("resize", this.resizeHandler)

    console.log(creatorASCII)
  },

  unmounted() {
    window.removeEventListener("resize", this.resizeHandler)
  },

  /***************
   * Vue methods *
   ***************/

  methods: {
    /*******************
     * General methods *
     *******************/

    /**
     * Detects the operating system being used
     *
     * @return  {String | Null} `"Win"`, `"Mac"`, or `"Linux"`
     */
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

    /**
     * Detects the browser being used
     *
     * @returns  {String | Null} `"Chrome"`, `"Firefox"`, or `"Safari"`
     */
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

    // Verify if dark mode was activated from cache
    set_dark_mode() {
      if (this.dark === null) {
        // detect prefered color scheme
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          this.dark = true
        } else {
          this.dark = false
        }
      }

      // set dark mode (w/ bootstrap color themes)
      document.documentElement.setAttribute(
        "data-bs-theme",
        this.dark ? "dark" : "light",
      )
    },

    /**
     * Loads the application from a custom URI (generated by MakeURI)
     */
    loadFromURI() {
      // get parameters
      const params = new URL(window.location).searchParams

      const architecture_name = params.get("architecture")
      const asm = params.get("asm")
      const desired_set = params.get("example_set")
      const desired_example = params.get("example")

      if (architecture_name === null) {
        // no URI or incomplete URI
        return
      }

      // load architecture
      const arch = arch_available.find(
        arch =>
          arch.name === decodeURI(architecture_name) ||
          arch.alias.includes(decodeURI(architecture_name)),
      )
      if (arch === undefined) {
        show_notification(
          `'${architecture_name}' architecture not found`,
          "danger",
          this,
        )
        return
      }

      this.architecture_name = arch.name

      // I'm going to do what's called a "pro gamer move"
      // In the underlaying function, as it belongs to a JS module, we can't
      // access Vue components. We solve this by storing the root component
      // (App) in `document.app` once its mounted. But in this point of the
      // code, App is still not mounted, so `document.app` is undefined.
      // The hack is to pass the component to the function so it can use it.
      loadDefaultArchitecture(arch, this)

      // load assembly code
      if (asm !== null) {
        this.assembly_code = decodeURI(asm)

        // TODO: compile. It doesn't update the table execution, so...
        // this.$root.$refs.selectArchitectureView.$refs.toolbar.$refs.btngroup1
        //   .at(0)
        //   .assembly_compiler()

        // go directly to assembly view
        // FIXME: as we can't compile (see above), we go to the assembly view,
        // when we should go to simulator view
        this.creator_mode = "assembly"
      }

      // load example code
      if (desired_set !== null && desired_example !== null) {
        loadExample(
          arch.name,
          decodeURI(desired_set),
          decodeURI(desired_example),
          this,
        )
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

      if (status.execution_index !== -1) {
        instructions[status.execution_index]._rowVariant = "danger"
      }

      /* Google Analytics */
      creator_ga("execute", "execute.exception", "execute.exception." + error)
    },

    //Get target por by SO
    get_target_port() {
      return this.target_ports[this.os] ?? ""
    },

    resizeHandler(_e) {
      this.windowHeight = window.innerHeight
      this.windowWidth = window.innerWidth
    },
  },
}
</script>

<template>
  <!-- for showing bootstrap stuff from JS -->
  <BOrchestrator />

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
    <FormConfiguration
      id="configuration"
      v-model:arch_available="arch_available"
      v-model:default_architecture="default_architecture"
      v-model:stack_total_list="stack_total_list"
      v-model:autoscroll="autoscroll"
      v-model:backup="backup"
      v-model:instruction_help_size="instruction_help_size"
      v-model:notification_time="notification_time"
      v-model:dark="dark"
      v-model:c_debug="c_debug"
      v-model:vim_custom_keybinds="vim_custom_keybinds"
      v-model:vim_mode="vim_mode"
    />

    <!-- Information modals -->

    <!-- Notification modal -->
    <UIeltoNotifications id="notifications" :notifications="notifications" />

    <!-- Institutions modal -->
    <UIeltoInstitutions id="institutions" />

    <!-- About modal -->
    <UIeltoAbout id="about" :dark="dark" />

    <!-- Instruction Help sidebar -->
    <!-- we don't want to load this unless we have selected an architecture -->
    <SidebarInstructionHelp
      v-if="architecture_name !== ''"
      id="sidebar_help"
      :architecture_name="architecture_name"
      :instruction_help_size="instruction_help_size"
    />

    <!-- Backup modal -->
    <UIeltoBackup id="copy" @load-architecture="creator_mode = 'assembly'" />
  </header>

  <!----------------------->
  <!-- Select architecture -->
  <!----------------------->

  <SelectArchitecture
    v-if="creator_mode === 'select_architecture'"
    :arch_available="arch_available"
    :browser="browser"
    :os="os"
    :dark="dark"
    :window-height="windowHeight"
    ref="selectArchitectureView"
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
    v-if="creator_mode === 'architecture'"
    :architecture_name="architecture_name"
    :arch_available="arch_available"
    :arch_code="arch_code"
    :browser="browser"
    :os="os"
    :dark="dark"
  />

  <!------------------->
  <!-- Assembly view -->
  <!------------------->
  <AssemblyView
    v-if="creator_mode === 'assembly'"
    :architecture_name="architecture_name"
    :arch_available="arch_available"
    :browser="browser"
    :os="os"
    :assembly_code="assembly_code"
    :assembly_error="assemblyError"
    :vim_mode="vim_mode"
    :vim_custom_keybinds="vim_custom_keybinds"
    :dark="dark"
    ref="assemblyView"
  />

  <!-------------------->
  <!-- Simulator view -->
  <!-------------------->

  <SimulatorView
    v-if="creator_mode === 'simulator'"
    ref="simulatorView"
    :data_mode="data_mode"
    :reg_representation_int="reg_representation_int"
    :reg_representation_float="reg_representation_float"
    :reg_name_representation="reg_name_representation"
    :stat_representation="stat_representation"
    :stat_type="stat_type"
    :memory_segment="memory_segment"
    :architecture_name="architecture_name"
    :arch_available="arch_available"
    :instructions="instructions"
    :enter="enter"
    :browser="browser"
    :os="os"
    :window-height="windowHeight"
    :window-width="windowWidth"
    :display="display"
    :keyboard="keyboard"
    :dark="dark"
    :key="simulatorViewKey"
    :callee_frame="callee_frame"
    :caller_frame="caller_frame"
    :assembly_code="assembly_code"
    :lab_url="lab_url"
    :result_email="result_email"
    :target_board="target_board"
    :target_port="target_port"
    :flash_url="flash_url"
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

  .buttonBackground {
    background-color: #fafafa;
    color: #6c757d;
  }

  #chart {
    margin: 35px auto;
    padding: 0;
  }

  .apexcharts-legend-text tspan:nth-child(1) {
    font-weight: lighter;
    fill: #999;
  }

  .apexcharts-legend-text tspan:nth-child(3) {
    font-weight: bold;
  }

  .fields {
    padding: 1%;
  }

  // for some reason this doesn't affect sub-components
  [data-bs-theme="dark"] {
    .buttonBackground {
      background-color: #212529;
      color: #818a8d;
    }
    .buttonBackground:hover {
      background-color: #424649;
    }
  }
}
</style>
