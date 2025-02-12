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

<!--  TODO: separate in different files -->

<script>
import SpinnerLoading from "./components/general/SpinnerLoading.vue"
import SupportedBrowsers from "./components/general/SupportedBrowsers.vue"
import FormConfiguration from "./components/general/FormConfiguration.vue"
import UIeltoNotifications from "./components/general/UIeltoNotifications.vue"
import NavbarCREATOR from "./components/general/NavbarCREATOR.vue"
import UIeltoInstitutions from "./components/general/UIeltoInstitutions.vue"
import UIeltoAbout from "./components/general/UIeltoAbout.vue"
import SidebarInstructionHelp from "./components/general/SidebarInstructionHelp.vue"
import UIeltoBackup from "./components/load_architecture/UIeltoBackup.vue"
import UIeltoToolbar from "./components/general/UIeltoToolbar.vue"
import PreloadArchitecture from "./components/load_architecture/PreloadArchitecture.vue"
import LoadArchitecture from "./components/load_architecture/LoadArchitecture.vue"
import NewArchitecture from "./components/load_architecture/NewArchitecture.vue"
import DeleteArchitecture from "./components/load_architecture/DeleteArchitecture.vue"
import EditArchitecture from "./components/architecture/EditArchitecture.vue"
import SaveArchitecture from "./components/architecture/SaveArchitecture.vue"
import ArchConf from "./components/architecture/configuration/ArchConf.vue"
import MemoryLayout from "./components/architecture/memory_layout/MemoryLayout.vue"
import RegisterFileArch from "./components/architecture/register_file/RegisterFileArch.vue"
import Instructions from "./components/architecture/instructions/Instructions.vue"
import InstructionFields from "./components/architecture/instructions/InstructionFields.vue"
import Pseudoinstructions from "./components/architecture/pseudoinstructions/Pseudoinstructions.vue"
import PseudoinstructionFields from "./components/architecture/pseudoinstructions/PseudoinstructionFields.vue"
import Directives from "./components/architecture/directives/Directives.vue"
import LoadAssembly from "./components/assembly/LoadAssembly.vue"
import SaveAssembly from "./components/assembly/SaveAssembly.vue"
import MakeURI from "./components/assembly/MakeURI.vue"
import LoadLibrary from "./components/assembly/LoadLibrary.vue"
import SaveLibrary from "./components/assembly/SaveLibrary.vue"
import TextareaAssembly from "./components/assembly/TextareaAssembly.vue"
import ListLibraryTags from "./components/assembly/ListLibraryTags.vue"
import AssemblyError from "./components/assembly/AssemblyError.vue"
import Flash from "./components/simulator/Flash.vue"
import Examples from "./components/assembly/Examples.vue"
import Calculator from "./components/simulator/Calculator.vue"
import TableExecution from "./components/simulator/TableExecution.vue"
import DataViewSelector from "./components/simulator/DataViewSelector.vue"
import RegisterFile from "./components/simulator/RegisterFile.vue"
import Memory from "./components/simulator/Memory.vue"
import ClkCycles from "./components/simulator/ClkCycles.vue"
import Monitor from "./components/simulator/Monitor.vue"
import Keyboard from "./components/simulator/Keyboard.vue"

export default {
  name: "app",
  components: {
    SpinnerLoading,
    SupportedBrowsers,
    FormConfiguration,
    UIeltoNotifications,
    NavbarCREATOR,
    UIeltoInstitutions,
    UIeltoAbout,
    SidebarInstructionHelp,
    UIeltoBackup,
    UIeltoToolbar,
    PreloadArchitecture,
    LoadArchitecture,
    NewArchitecture,
    DeleteArchitecture,
    EditArchitecture,
    SaveArchitecture,
    ArchConf,
    MemoryLayout,
    RegisterFileArch,
    Instructions,
    InstructionFields,
    Pseudoinstructions,
    PseudoinstructionFields,
    Directives,
    LoadAssembly,
    SaveAssembly,
    MakeURI,
    LoadLibrary,
    SaveLibrary,
    TextareaAssembly,
    ListLibraryTags,
    AssemblyError,
    Flash,
    Examples,
    Calculator,
    TableExecution,
    DataViewSelector,
    RegisterFile,
    Memory,
    ClkCycles,
    Monitor,
    Keyboard,
  },

  /************
   * Vue Data *
   ************/
  data() {
    return {
      /********************/
      /* Global Variables */
      /********************/

      //Forces vue to reload a component, similar to $forceUpdate()
      render: 0,

      //
      // General information
      //

      //Version Number
      version: "",

      //Architecture name and guide
      architecture_name: "",
      architecture_guide: "",

      //Accesskey
      os: "",
      browser: "",

      //Displayed notifications
      notifications: notifications, //TODO: copy or only in app?

      //
      // Current view
      //

      creator_mode: "load_architecture",

      //
      // Configuration
      //

      //Stack total list values
      default_architecture: "none",

      //Stack total list values
      stack_total_list: 40,

      //Notification speed
      notification_time: 1500,

      // Instruction help size
      instruction_help_size: 33,

      //Auto Scroll
      autoscroll: true,

      // Font size
      font_size: 15,

      //Debug
      c_debug: false,

      //Dark Mode
      dark: false,

      /*************************/
      /* Architecture Selector */
      /*************************/

      //
      //Available architectures
      //

      arch_available: architecture_available, //TODO: copy or only in app?

      //Architectures card background
      back_card: back_card, //TODO: copy or only in app?

      //Delete architecture modal
      modal_delete_arch_index: 0, //TODO: include into delete architecture component - modal info

      /****************/
      /* Architecture */
      /****************/

      //Load architecture
      architecture: architecture,
      architecture_hash: architecture_hash,

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

      example_set_available: example_set_available,
      example_available: example_available,

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

      assembly_code: "",

      /*************/
      /* Simulator */
      /*************/

      //
      // Execution
      //

      //Instructions
      instructions: instructions,

      //
      //Data view
      //

      data_mode: "int_registers",

      //
      //Memory
      //

      main_memory: {},
      main_memory_busy: false,

      //Stack
      track_stack_names: track_stack_names,
      callee_subrutine: "",
      caller_subrutine: "",
      stack_pointer: 0,
      begin_caller: 0,
      end_caller: 0,
      begin_callee: 0,
      end_callee: 0,

      //
      //Stats
      //

      totalStats: totalStats,
      stats: stats,
      //Stats Graph values
      stats_value: stats_value,

      //
      //CLK Cycles
      //

      total_clk_cycles: total_clk_cycles,
      clk_cycles: clk_cycles,
      //CLK Cycles Graph values
      clk_cycles_value: clk_cycles_value,

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
    uielto_navbar.methods.load_num_version()
    uielto_preload_architecture.methods.load_arch_available()
    this.detect_os()
    this.detect_browser()
    this.get_target_port()
  },

  /************************
   * Mounted vue instance *
   ************************/
  mounted() {
    this.validate_browser()
    uielto_backup.methods.backup_modal(this)

    //Pre-load following URL params
    const url_hash = creator_preload_get2hash(window.location)
    creator_preload_fromHash(this, url_hash)
  },

  /*************
   * Before UI *
   *************/
  beforeUpdate() {
    uielto_configuration.methods.get_configuration()
    uielto_configuration.methods.get_dark_mode()
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
        this.os = "Win"
      } else if (navigator.userAgent.includes("Mac")) {
        this.os = "Mac"
      } else if (navigator.userAgent.includes("X11")) {
        this.os = "Linux"
      } else if (navigator.userAgent.includes("Linux")) {
        this.os = "Linux"
      }
    },

    //Detects the browser being used
    detect_browser() {
      if (navigator.userAgent.includes("Mac")) {
        // why?!?!
        this.browser = "Mac"
      } else if (navigator.userAgent.includes("Chrome")) {
        this.browser = "Chrome"
      } else if (navigator.userAgent.includes("Firefox")) {
        this.browser = "Firefox"
      } else if (
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
      ) {
        // why?!?!
        this.browser = "Chrome"
      }
    },

    //Show modal if the browser is not permited
    validate_browser() {
      if (navigator.userAgent.includes("OPR")) {
        this.$root.$emit("bv::show::modal", "modalBrowser")
      } else if (navigator.userAgent.indexOf("MIE") > -1) {
        this.$root.$emit("bv::show::modal", "modalBrowser")
      } else if (navigator.userAgent.indexOf("Edge") > -1) {
        this.$root.$emit("bv::show::modal", "modalBrowser")
      } else if (navigator.userAgent.indexOf("Chrome") > -1) {
        return
      } else if (navigator.userAgent.indexOf("Safari") > -1) {
        return
      } else if (navigator.userAgent.indexOf("Firefox") > -1) {
        return
      } else {
        this.$root.$emit("bv::show::modal", "modalBrowser")
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

      if (execution_index != -1) {
        instructions[execution_index]._rowVariant = "danger"
        app._data.instructions[execution_index]._rowVariant = "danger"
      }

      /* Google Analytics */
      creator_ga("execute", "execute.exception", "execute.exception." + error)

      return
    },

    //Get target por by SO
    get_target_port() {
      this.target_port = this.target_ports[this.os]
    },
  },
};
</script>

<!-- <template>
  <p>{{ call() + baz }}</p>
  <div></div>
</template> -->

<template>
  <!------------------------>
  <!-- General components -->
  <!------------------------>

  <!-- Loading spinner -->
  <SpinnerLoading id="loading" style="display: none" />

  <!-- Browser not supported modal -->
  <SupportedBrowsers id="modalBrowser" />

  <header>
    <!-- Navbar  -->
    <NavbarCREATOR :version="version" :architecture_name="architecture_name" />

    <!-- Configuration modal -->
    <FormConfiguration
      id="configuration"
      :default_architecture="default_architecture"
      :stack_total_list="stack_total_list"
      :autoscroll="autoscroll"
      :instruction_help_size="instruction_help_size"
      :notification_time="notification_time"
      :dark="dark"
      :c_debug="c_debug"
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
  <!-- Load architecture -->
  <!----------------------->

  <b-container
    fluid
    align-h="center"
    id="load_menu"
    v-if="creator_mode == 'load_architecture'"
  >
    <b-row>
      <b-col>
        <!-- Navbar -->
        <UIeltoToolbar
          id="navbar_load_architecture"
          components=" | | |btn_configuration,btn_information"
          :browser="browser"
          :arch_available="arch_available"
        />

        <!-- Architecture menu -->
        <b-container
          fluid
          align-h="center"
          class="mx-0 px-1"
          id="load_menu_arch"
        >
          <b-row>
            <b-col>
              <b-card-group deck>
                <!-- Preload architecture card -->
                <PreloadArchitecture
                  v-for="(item, index) in arch_available"
                  :arch_available="arch_available"
                  :back_card="back_card"
                  :item="item"
                  :index="index"
                />

                <!-- Load new architecture card -->
                <LoadArchitecture />

                <!-- New architecture card -->
                <NewArchitecture />
              </b-card-group>
            </b-col>
          </b-row>
        </b-container>

        <!-- CREATOR Information -->
        <b-container fluid align-h="center" class="mx-0 px-1" id="creator_info">
          <b-row>
            <b-col>
              <b-list-group class="my-3">
                <b-list-group-item style="text-align: center">
                  <a href="mailto: creator.arcos.inf.uc3m.es@gmail.com">
                    <span class="fa-solid fa-envelope" />
                    creator.arcos.inf.uc3m.es@gmail.com
                  </a>
                </b-list-group-item>
              </b-list-group>
            </b-col>
          </b-row>
        </b-container>

        <!-- Architecture selector modals -->

        <!-- Delete architecture modal -->
        <DeleteArchitecture
          id="modalDeletArch"
          :index="modal_delete_arch_index"
        />
      </b-col>
    </b-row>
  </b-container>

  <!------------------>
  <!-- Architecture -->
  <!------------------>

  <b-container
    fluid
    align-h="center"
    id="architecture_menu"
    v-if="creator_mode == 'architecture'"
  >
    <b-row>
      <b-col>
        <!-- Navbar -->
        <UIeltoToolbar
          id="navbar_architecture"
          components="btn_assembly,btn_simulator|btn_edit_architecture,btn_save_architecture||btn_configuration,btn_information"
          :browser="browser"
          :arch_available="arch_available"
        />

        <!-- Architecture navbar modals -->

        <!-- Edit architecture modal -->
        <EditArchitecture id="edit_architecture" :arch_code="arch_code" />

        <!-- Save architecture modal -->
        <SaveArchitecture id="save_architecture" />

        <!-- Architecture information -->
        <b-container fluid align-h="center" class="mx-0 px-0">
          <b-row>
            <b-col class="menu" id="view_components">
              <b-tabs>
                <!-- Architecture configuration -->
                <b-tab title="Architecture Info" active>
                  <ArchConf :arch_conf="architecture.arch_conf" />
                </b-tab>

                <!-- Memory layout -->
                <b-tab title="Memory Layout">
                  <MemoryLayout :memory_layout="architecture.memory_layout" />
                </b-tab>

                <!-- Register File -->
                <b-tab title="Register File">
                  <RegisterFileArch :register_file="architecture.components" />
                </b-tab>

                <!-- Instruction definition -->
                <b-tab title="Instructions">
                  <Instructions :instructions="architecture.instructions" />

                  <!-- Instructions modals -->

                  <!-- Intruction fields-->
                  <InstructionFields
                    id="fields_instructions"
                    :title="modal_field_instruction.title"
                    :index="modal_field_instruction.index"
                    :instruction="modal_field_instruction.instruction"
                  />
                </b-tab>

                <!-- Pseudoinstruction definition -->
                <b-tab title="Pseudoinstructions">
                  <Pseudoinstructions
                    :pseudoinstructions="architecture.pseudoinstructions"
                  />

                  <!-- Pseudoinstructions modals -->

                  <!-- Pseudontruction fields -->
                  <PseudoinstructionFields
                    id="fields_pseudoinstructions"
                    :title="modal_field_pseudoinstruction.title"
                    :index="modal_field_pseudoinstruction.index"
                    :pseudoinstruction="
                      modal_field_pseudoinstruction.pseudoinstruction
                    "
                  />
                </b-tab>

                <!-- Directives definition -->
                <b-tab title="Directives">
                  <Directives :directives="architecture.directives" />
                </b-tab>
              </b-tabs>
            </b-col>
          </b-row>
        </b-container>
      </b-col>
    </b-row>
  </b-container>

  <!------------------->
  <!-- Assembly view -->
  <!------------------->

  <b-container
    fluid
    align-h="center"
    id="assembly"
    v-if="creator_mode === 'assembly'"
  >
    <b-row>
      <b-col>
        <!-- Navbar -->
        <UIeltoToolbar
          id="navbar_assembly"
          components="btn_architecture,btn_simulator|btn_compile|dropdown_assembly_file,dropdown_library|btn_configuration,btn_information"
          :browser="browser"
          :arch_available="arch_available"
        />

        <!-- Assembly navbar modals -->

        <!-- Load assembly form -->
        <LoadAssembly id="load_assembly" />

        <!-- Save assembly form -->
        <SaveAssembly id="save_assembly" />

        <!-- Examples modal -->
        <Examples
          id="examples"
          ref="examples"
          :example_set_available="example_set_available"
          :example_available="example_available"
          compile="false"
          modal="examples"
        />

        <!-- Get uri -->
        <MakeURI id="make_uri" />

        <!-- Load binary form -->
        <LoadLibrary id="load_binary" />

        <!-- Save binary form -->
        <SaveLibrary id="save_binary" />

        <b-container fluid align-h="center" class="mx-0 px-0">
          <b-row cols="2">
            <b-col cols="12" id="divAssembly">
              <!-- Assembly textarea-->
              <TextareaAssembly :browser="browser" />
            </b-col>

            <b-col cols="0" id="divTags" class="d-none">
              <!-- Library tags-->
              <ListLibraryTags
                :instructions_tag="update_binary.instructions_tag"
              />
            </b-col>
          </b-row>
        </b-container>

        <!-- Compile error modal -->
        <AssemblyError
          id="modalAssemblyError"
          ref="errorAssembly"
          :modal_assembly_error="modalAssemblyError"
        />
      </b-col>
    </b-row>
  </b-container>

  <!-------------------->
  <!-- Simulator view -->
  <!-------------------->

  <b-container
    fluid
    align-h="center"
    id="simulator"
    v-if="creator_mode == 'simulator'"
  >
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
        <Flash
          id="flash"
          :lab_url="lab_url"
          :result_email="result_email"
          :target_board="target_board"
          :target_port="target_port"
          :flash_url="flash_url"
        />

        <!-- Examples modal -->
        <Examples
          id="examples2"
          ref="examples2"
          :example_set_available="example_set_available"
          :example_available="example_available"
          compile="true"
          modal="examples2"
        />

        <!-- Calculator -->
        <Calculator id="calculator" />

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
              <RegisterFile
                id="register_file"
                :render="render"
                :data_mode="data_mode"
                v-if="
                  data_mode == 'int_registers' || data_mode == 'fp_registers'
                "
              />

              <!-- Memory view-->
              <Memory
                id="memory"
                :main_memory="main_memory"
                :track_stack_names="track_stack_names"
                :callee_subrutine="callee_subrutine"
                :caller_subrutine="caller_subrutine"
                :stack_total_list="stack_total_list"
                :main_memory_busy="main_memory_busy"
                v-if="data_mode == 'memory'"
              />

              <!-- Stats view--->
              Stats :stats="stats" :stats_value="stats_value" v-if="data_mode ==
              'stats'" />

              <!-- CLK Cycles view--->
              <ClkCycles
                :clk_cycles="clk_cycles"
                :clk_cycles_value="clk_cycles_value"
                :total_clk_cycles="total_clk_cycles"
                v-if="data_mode == 'clk_cycles'"
              />
            </b-col>

            <!-- Monitor & keyboard -->
            <b-col lg="12" cols="12">
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
                  <b-col>
                    <!-- Monitor -->
                    <Monitor :display="display" />
                  </b-col>

                  <b-col>
                    <!-- Keyboard -->
                    <Keyboard :keyboard="keyboard" :enter="enter" />
                  </b-col>
                </b-row>
              </b-container>
            </b-col>
          </b-row>
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>
