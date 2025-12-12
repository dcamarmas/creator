<!--
Copyright 2018-2025 CREATOR Team.

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
import { defineComponent } from "vue";

import { REMOTELAB } from "@/web/src/remoteLab.js";
import { LOCALLAB } from "@/web/src/localGateway.js";
import { downloadFile, console_log, show_notification } from "@/web/utils.mjs";
import { creator_ga } from "@/core/utils/creator_ga.mjs";
import { instructions } from "@/core/assembler/assembler.mjs";

export default defineComponent({
  props: {
    id: { type: String, required: true },
    os: { type: String, required: true },
    lab_url: { type: String, required: true },
    result_email: { type: String, required: true },
    target_board: { type: String, required: true },
    target_port: { type: String, required: true },
    target_location: { type: String, required: true },
    flash_url: { type: String, required: true },
    assembly_code: { type: String, required: true },
  },

  computed: {
    // sync w/ root
    labURL: {
      get() {
        return this.lab_url;
      },
      set(value: string) {
        (this.$root as any).lab_url = value;
      },
    },
    resultEmail: {
      get() {
        return this.result_email;
      },
      set(value: string) {
        (this.$root as any).result_email = value;
      },
    },
    targetBoard: {
      get() {
        return this.target_board;
      },
      set(value: string) {
        (this.$root as any).target_board = value;
      },
    },
    targetPort: {
      get() {
        return this.target_port;
      },
      set(value: string) {
        (this.$root as any).target_port = value;
      },
    },
    flashURL: {
      get() {
        return this.flash_url;
      },
      set(value: string) {
        (this.$root as any).flash_url = value;
      },
    },
    targetLocation: {
      get() {
        return this.target_location;
      },
      set(value: string) {
        (this.$root as any).target_location = value;
      },
    },
  },

  watch: {
    selectedOption(newVal: string, _oldVal: string) {
      this.targetBoard = "";
      this.activeTab = false;
      // Prefill targetLocation when switching to SBC
      if (newVal === "sbc") {
        this.targetLocation = "~/creator";
      }
    },
    targetBoard(newVal: string, _oldVal: string) {
      if (!newVal) {
        this.activeTab = false;
      } else {
        this.activeTab = true;
      }
    },
  },

  data() {
    return {
      //
      // Remote Device
      //

      remote_target_boards: [
        { text: "Please select an option", value: null, disabled: true },
        { text: "ESP32-C6 (RISC-V)", value: "esp32c6" },
        { text: "ESP32-C3 (RISC-V)", value: "esp32c3" },
        { text: "ESP32-H2 (RISC-V)", value: "esp32h2" },
        // { text: "ESP32-S2 (MIPS-32)", value: "esp32s2" },
        // { text: "ESP32-S3 (MIPS-32)", value: "esp32s3" },
      ],

      request_id: -1,
      position: "",

      boards: false,
      enqueue: false,
      status: false,

      //
      // Local Device
      //

      target_boards: [
        { text: "ESP32-C6 (RISC-V)", value: "esp32c6" },
        { text: "ESP32-C3 (RISC-V)", value: "esp32c3" },
        { text: "ESP32-H2 (RISC-V)", value: "esp32h2" },
        // { text: "ESP32-S2 (MIPS-32)", value: "esp32s2" },
        // { text: "ESP32-S3 (MIPS-32)", value: "esp32s3" },
      ],

      sbc_target_boards: [
        { text: "Please select an option", value: null, disabled: true },
        { text: "SBC (RISC-V)", value: "sbcriscv" },
      ],

      selectedOption: "esp32" as "esp32" | "sbc",
      activeTab: false,

      flashing: false,
      running: false,
      debugging: false,
      fullclean: false,
      stoprunning: false,
      eraseflash: false,
      showPopup: false,
      pendingAction: null as string | null,
    };
  },

  methods: {
    //
    // Remote Device
    //

    get_boards() {
      if (this.labURL !== "") {
        REMOTELAB.get_boards(this.labURL + "/target_boards").then(data => {
          if (data !== "-1") {
            const available_boards = JSON.parse(data);

            // remove non-available boards
            this.remote_target_boards = this.remote_target_boards.filter(
              board => available_boards.includes(board.value),
            );

            this.boards = true;
          }
        });
      } else {
        this.boards = false;
      }
    },

    do_enqueue() {
      if (instructions.length === 0) {
        show_notification("Compile a program first", "warning");
        return;
      }

      if (this.resultEmail === "") {
        show_notification("Please, enter your E-mail", "danger");
        return;
      }

      REMOTELAB.enqueue(this.labURL + "/enqueue", {
        target_board: this.targetBoard,
        result_email: this.resultEmail,
        assembly: this.assembly_code,
      }).then(data => {
        if (data !== "-1") {
          this.request_id = data;
          this.enqueue = true;
          this.status = true;
          this.position = "";
          this.check_status();
        }
      });

      //Google Analytics
      creator_ga("simulator", "simulator.enqueue", "simulator.enqueue");
    },

    check_status() {
      if (this.position !== "Completed" && this.position !== "Error") {
        this.get_status();
        setTimeout(this.check_status, 20000);
      }
    },

    get_status() {
      REMOTELAB.status(this.labURL + "/status", {
        req_id: this.request_id,
      }).then(data => {
        if (data === "Completed") {
          this.enqueue = false;
        }
        if (data !== "-1") {
          if (data === "-2") {
            this.position = "Error";
            this.enqueue = false;
          } else if (!isNaN(data)) {
            this.position = "Queue position: " + data;
          } else {
            this.position = data;
          }
        }
      });
      //Google Analytics
      creator_ga("simulator", "simulator.position", "simulator.position");
    },

    do_cancel() {
      REMOTELAB.cancel(this.labURL + "/delete", {
        req_id: this.request_id,
      }).then(data => {
        if (data !== "-1") {
          this.enqueue = false;
          this.position = "Canceled";
        }
      });

      //Google Analytics
      creator_ga("simulator", "simulator.cancel", "simulator.cancel");
    },

    //
    // Local device
    //

    download_driver() {
      downloadFile(`/gateway/${this.selectedOption}.zip`, `${this.selectedOption}.zip`);

      //Google Analytics
      creator_ga(
        "simulator",
        "simulator.download_driver",
        "simulator.download_driver",
      );
    },

    download_scripts() {
      downloadFile("/gateway/openocd_scripts.zip", "openocd");

      //Google Analytics
      creator_ga(
        "simulator",
        "simulator.download_openocd",
        "simulator.download_openocd",
      );
    },

    onTabChange() {
      if (this.targetBoard.startsWith("sbc")) {
        this.targetPort = "ubuntu@127.0.0.1";
        this.targetLocation = "~/creator";
      } else {
        this.targetPort = this.$root!.target_ports[this.os] || "";
      }
    },

    do_flash() {
      if (instructions.length === 0) {
        show_notification("Compile a program first", "warning");
        return;
      }

      this.flashing = true;

      LOCALLAB.gateway_flash(this.flashURL + "/flash", {
        target_board: this.targetBoard,
        target_port: this.targetPort,
        target_location: this.targetLocation,
        assembly: this.assembly_code,
      }).then(data => {
        this.flashing = false;
        console_log(JSON.stringify(data, null, 2), "DEBUG");
        const dataStr = JSON.stringify(data, null, 2);
        
        if (dataStr.includes("TypeError: NetworkError")) {
          show_notification(
            "Gateway not available at the moment. Please, execute python3 gateway.py, check if port 8080 works fine and connect your board first",
            "danger",
          );
        }
        if (dataStr.includes("Flash completed successfully")) {
          show_notification("Flashing program success.", "success");
        }
        if (dataStr.includes("Target location is blank")) {
          show_notification("Error flashing: Blank target location", "danger");
        }
        if (dataStr.includes("Target port is blank")) {
          show_notification("Error flashing: Blank target port", "danger");
        }
        if (dataStr.includes("Unreachable host")) {
          show_notification("Error flashing: Unreachable host", "danger");
        }
        if (dataStr.includes("Problem with sending code to the SBC")) {
          show_notification(
            "Error flashing: Check if the target location exists in your SBC or if the target port user exists",
            "danger",
          );
        }
        if (dataStr.includes("No UART port found")) {
          show_notification("Error flashing: Not found UART port", "danger");
        }
        if (
          dataStr.includes("cr_ functions are not supported in this mode")
        ) {
          show_notification(
            'CREATino code in CREATOR module. Make sure the "Arduino Support" checkbox is selected',
            "danger",
          );
        }
      });

      //Google Analytics
      creator_ga("simulator", "simulator.flash", "simulator.flash");
    },

    do_stop_monitor() {
      this.stoprunning = true;

      LOCALLAB.gateway_monitor(this.flashURL + "/stopmonitor", {
        target_board: this.targetBoard,
        target_port: this.targetPort,
        target_location: this.targetLocation,
        assembly: this.assembly_code,
      }).then(data => {
        this.stoprunning = false;
        const dataStr = JSON.stringify(data, null, 2);
        console_log(dataStr, "DEBUG");
        
        if (dataStr.includes("TypeError: NetworkError")) {
          show_notification(
            "Gateway not available at the moment. Please, execute python3 gateway.py, check if port 8080 works fine and connect your board first",
            "danger",
          );
        }
        if (dataStr.includes("Target location is blank")) {
          show_notification("Error monitoring: Blank target location", "danger");
        }
        if (dataStr.includes("Target port is blank")) {
          show_notification("Error monitoring: Blank target port", "danger");
        }
        if (dataStr.includes("Unreachable host")) {
          show_notification("Error monitoring: Unreachable host", "danger");
        }
        if (dataStr.includes("Process stopped")) {
          show_notification("Process stopped.", "success");
        }
      });

      //Google Analytics
      creator_ga("simulator", "simulator.stopmonitor", "simulator.stopmonitor");
    },

    do_monitor() {
      this.running = true;
      this.stoprunning = false;

      LOCALLAB.gateway_monitor(this.flashURL + "/monitor", {
        target_board: this.targetBoard,
        target_port: this.targetPort,
        target_location: this.targetLocation,
        assembly: this.assembly_code,
      }).then(data => {
        this.running = false;
        const dataStr = JSON.stringify(data, null, 2);
        console_log(dataStr, "DEBUG");
        
        if (dataStr.includes("TypeError: NetworkError")) {
          show_notification(
            "Gateway not available at the moment. Please, execute python3 gateway.py, check if port 8080 works fine and connect your board first",
            "danger",
          );
        }
        if (dataStr.includes("No UART port found")) {
          show_notification("Error: Not found UART port", "danger");
        }
        if (dataStr.includes("No ELF file found")) {
          show_notification("Error: Built proyect not found", "danger");
        }
        if (dataStr.includes("Target location is blank")) {
          show_notification("Error flashing: Blank target location", "danger");
        }
        if (dataStr.includes("Target port is blank")) {
          show_notification("Error flashing: Blank target port", "danger");
        }
        if (dataStr.includes("Unreachable host")) {
          show_notification("Error flashing: Unreachable host", "danger");
        }
      });

      //Google Analytics
      creator_ga("simulator", "simulator.monitor", "simulator.monitor");
    },

    do_debug() {
      this.debugging = true;

      LOCALLAB.gateway_monitor(this.flashURL + "/debug", {
        target_board: this.targetBoard,
        target_port: this.targetPort,
        target_location: this.targetLocation,
        assembly: this.assembly_code,
      }).then(data => {
        this.debugging = false;
        const dataStr = JSON.stringify(data, null, 2);
        
        if (dataStr.includes("TypeError: NetworkError")) {
          show_notification(
            "Gateway not available at the moment. Please, execute python3 gateway.py, check if port 8080 works fine and connect your board first",
            "danger",
          );
        }
        if (dataStr.includes("No ELF file found in build directory")) {
          show_notification("Error: Not found proyect to debug", "danger");
        }
        if (dataStr.includes("Target location is blank")) {
          show_notification("Error debugging: Blank target location", "danger");
        }
        if (dataStr.includes("Target port is blank")) {
          show_notification("Error debugging: Blank target port", "danger");
        }
        if (dataStr.includes("Unreachable host")) {
          show_notification("Error debugging: Unreachable host", "danger");
        }
      });

      //Google Analytics
      creator_ga("simulator", "simulator.debug", "simulator.debug");
    },

    showConfirmPopup(action: string) {
      this.pendingAction = action;
      this.showPopup = true;
    },

    confirmAction() {
      this.showPopup = false;
      if (this.pendingAction === "fullclean") {
        this.do_fullclean();
      } else if (this.pendingAction === "eraseflash") {
        this.do_erase_flash();
      }
      this.pendingAction = null;
    },

    do_fullclean() {
      this.fullclean = true;

      LOCALLAB.gateway_monitor(this.flashURL + "/fullclean", {
        target_board: this.targetBoard,
        target_port: this.targetPort,
        target_location: this.targetLocation,
        assembly: this.assembly_code,
      }).then(data => {
        this.fullclean = false;
        const dataStr = JSON.stringify(data, null, 2);
        console_log(dataStr, "DEBUG");
        
        if (dataStr.includes("TypeError: NetworkError")) {
          show_notification(
            "Gateway not available at the moment. Please, execute python3 gateway.py, check if port 8080 works fine and connect your board first",
            "danger",
          );
        }
        if (dataStr.includes("Full clean done.")) {
          show_notification("Full clean done.", "success");
        }
        if (dataStr.includes("Nothing to clean")) {
          show_notification("Nothing to clean", "success");
        }
      });

      //Google Analytics
      creator_ga("simulator", "simulator.fullclean", "simulator.fullclean");
    },

    do_erase_flash() {
      this.eraseflash = true;

      LOCALLAB.gateway_monitor(this.flashURL + "/eraseflash", {
        target_board: this.targetBoard,
        target_port: this.targetPort,
        target_location: this.targetLocation,
        assembly: this.assembly_code,
      }).then(data => {
        this.eraseflash = false;
        const dataStr = JSON.stringify(data, null, 2);
        console_log(dataStr, "DEBUG");

        if (dataStr.includes("TypeError: NetworkError")) {
          show_notification(
            "Gateway not available at the moment. Please, execute python3 gateway.py, check if port 8080 works fine and connect your board first",
            "danger",
          );
        }
        if (dataStr.includes("Erase flash done")) {
          show_notification(
            "Erase flash done. Please, unplug and plug the cable(s) again",
            "success",
          );
        }
        if (dataStr.includes("Target location is blank")) {
          show_notification(
            "Error erase-flashing: Blank target location",
            "danger",
          );
        }
        if (dataStr.includes("Target port is blank")) {
          show_notification("Error erase-flashing: Blank target port", "danger");
        }
        if (dataStr.includes("Unreachable host")) {
          show_notification("Error erase-flashing: Unreachable host", "danger");
        }
        if (
          dataStr.includes(
            "Could not open /dev/ttyUSB0, the port is busy or doesn't exist",
          )
        ) {
          show_notification(
            "Error erasing flash: Hint: Check if the port is correct and ESP connected",
            "danger",
          );
        }
      });

      // Google Analytics
      creator_ga("simulator", "simulator.eraseflash", "simulator.eraseflash");
    },
  },
});
</script>

<template>
  <b-modal :id="id" scrollable title="Target Board Flash" no-footer>
    <b-tabs content-class="mt-3">
      <b-tab title="Local Device" active id="flash-tab-local">
        <div class="d-flex flex-column align-items-center my-4">
          <span style="margin-bottom: 10px; font-weight: bold">
            Select Device Type:
          </span>
          <div class="d-flex">
            <div class="form-check mx-2">
              <input
                class="form-check-input"
                type="radio"
                id="radioEspressif"
                value="esp32"
                v-model="selectedOption"
              />
              <label class="form-check-label" for="radioEspressif">
                Espressif
              </label>
            </div>
            <div class="form-check mx-2">
              <input
                class="form-check-input"
                type="radio"
                id="radioSBC"
                value="sbc"
                v-model="selectedOption"
              />
              <label class="form-check-label" for="radioSBC">SBC</label>
            </div>
          </div>
        </div>

        <label for="select-local-boards">(1) Select Target Board:</label>

        <b-form-select
          id="select-local-boards"
          v-model="targetBoard"
          :options="
            selectedOption === 'esp32' ? target_boards : sbc_target_boards
          "
          size="sm"
          class="mt-2"
          @change="onTabChange"
        />
        <br />

        <b-tabs content-class="mt-3" v-if="targetBoard && activeTab">
          <b-tab title="Prerequisites" id="flash-tab-prerequisites">
            <b-tabs content-class="mt-3">
              <b-tab
                title="Docker Windows"
                id="tab-docker-win"
                :active="os === 'Win'"
                v-if="selectedOption === 'esp32'"
              >
                (2) Install Docker Desktop (only the first time):
                <b-card class="text-left my-2 mx-4">
                  Follow the instructions from
                  <a
                    href="https://docs.docker.com/desktop/install/windows-install/"
                    target="_blank"
                  >
                    Docker's documentation
                  </a>
                </b-card>
                (3) Download esptool (only the first time):
                <b-card class="text-left my-2 mx-4">
                  Download from
                  <a
                    href="https://github.com/espressif/esptool/releases"
                    target="_blank"
                  >
                    github.com/espressif/esptool/releases
                  </a>
                </b-card>
                (4) Pull <code>creator_gateway</code> image in Docker Desktop:
                <b-card class="text-left my-2 mx-4">
                  <ol class="mb-0">
                    <li>
                      Search for <code>creatorsim/creator_gateway</code> in the
                      Docker Desktop browser
                    </li>

                    <li>Click the "Pull" button</li>
                  </ol>
                </b-card>
                (5) Run the image:
                <b-card class="text-left my-2 mx-4">
                  <ol class="mb-0">
                    <li>Click the "Run" button</li>

                    <li>Click the "Optional settings" button</li>

                    <li>Set the Host port to 8080</li>

                    <li>Click the "Run" button</li>
                  </ol>
                </b-card>
                (6) Run start_gateway script in the container bash:
                <b-card class="text-left my-2 mx-4">
                  <ol class="mb-0">
                    <li>Click the "Exec" button</li>

                    <li>Execute <code>./start_gateway.sh</code></li>
                  </ol>
                </b-card>
                (7) Run <code>esp_rfc2217_server</code> in windows cmd:
                <b-card class="text-left my-2 mx-4">
                  <ol class="mb-0">
                    <li>Execute the windows cmd in the esptool path</li>

                    <li>
                      Execute
                      <code>
                        esp_rfc2217_server -v -p 4000 &lt;targetPort&gt;
                      </code>
                    </li>
                  </ol>
                  More information in
                  <a
                    href="https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/tools/idf-docker-image.html#using-remote-serial-port"
                    target="_blank"
                  >
                    Espressiff's documentation
                  </a>
                </b-card>
              </b-tab>
              <b-tab
                title="Docker Linux/MacOS"
                id="flash-tab-docker-unix"
                :active="['Mac', 'Linux'].includes(os)"
                v-if="selectedOption === 'esp32'"
              >
                (2) Install Docker Engine (only the first time):
                <b-card class="text-left my-2 ms-4 me-4">
                  Follow the instructions from
                  <a
                    href="https://docs.docker.com/engine/install/"
                    target="_blank"
                  >
                    Docker's documentation
                  </a>
                </b-card>
                (3) Download the <code>creator_gateway</code> image:
                <b-card class="text-left my-2 mx-4">
                  <code>docker pull creatorsim/creator_gateway</code>
                </b-card>
                (4) Run the image:
                <b-card class="text-left my-2 mx-4 bash">
                  <code
                    >docker run --init -it --device=&lt;targetPort&gt; -p
                    8080:8080 --name creator_gateway creatorsim/creator_gateway
                    /bin/bash
                  </code>
                </b-card>
                (5) Run the <code>start_gateway.sh</code> script in the
                container's shell:
                <b-card class="text-left my-2 mx-4">
                  <code>./start_gateway.sh</code>
                </b-card>
              </b-tab>

              <b-tab title="Linux/MacOS" v-if="selectedOption === 'sbc'">
                (2) Setup Ubuntu in the SBC chosen and connect it to Internet:
                <b-card class="text-left my-2 mx-4">
                  <b
                    >Check if your board has canonical Ubuntu support (if not
                    founded in official SBC documentation):</b
                  >
                  <a
                    href="https://canonical-ubuntu-boards.readthedocs-hosted.com/en/latest/how-to/"
                    target="_blank"
                  >
                    Canonical Ubuntu Boards Documentation
                  </a>
                  <br /><br />
                  <b>Check the IP of your SBC:</b>
                  <div class="bash mt-2">
                    <code>ip a</code>
                  </div>
                </b-card>

                (3) Create the directory where the project will be saved:
                <b-card class="text-left my-2 mx-4">
                  <b>Create the directory:</b>
                  <div class="bash mt-2">
                    <code>mkdir -p ~/creator</code>
                  </div>
                  <b>Check if the system allows SSH:</b>
                  <div class="bash mt-2">
                    <code>systemctl status ssh</code>
                  </div>
                </b-card>

                (4) Install GDB UI in SBC:
                <b-card class="text-left my-2 mx-4">
                  <b>Create a virtual environment:</b>
                  <div class="bash mt-2">
                    <code>
                      sudo apt install python3.12-venv<br />
                      python3 -m venv ~/gdbgui-venv<br />
                      source ~/gdbgui-venv/bin/activate
                    </code>
                  </div>
                  <b>Install and adapt GDBGUI:</b>
                  <div class="bash mt-2">
                    <code>
                      sudo apt install build-essential python3-dev python3-pip
                      python3-setuptools python3-wheel gdb<br />
                      pip3 install gdbgui<br />
                      sed -i "/extra_files=get_extra_files()/a\
                      allow_unsafe_werkzeug=True,"
                      ~/gdbgui-venv/lib/python3.12/site-packages/gdbgui/server/server.py
                    </code>
                  </div>
                </b-card>

                (5) Download the driver: <br />
                <b-container align-h="center" class="d-grid mb-1">
                  <b-button
                    size="sm"
                    class="my-1 mx-3"
                    variant="outline-primary"
                    @click="download_driver"
                  >
                    <font-awesome-icon :icon="['fas', 'download']" /> Download
                    Driver
                  </b-button>
                </b-container>

                (6) Install python3 packages in your computer:
                <b-card class="text-left my-2 mx-4">
                  <code>pip3 install flask flask_cors</code>
                </b-card>

                (7) Run driver:
                <b-card class="text-left my-2 mx-4">
                  <b>Unzip the driver.zip file:</b>
                  <div class="bash mt-2">
                    <code>
                      unzip driver.zip<br />
                      cd sbc
                    </code>
                  </div>
                  <b>Execute the gateway web service:</b>
                  <br />
                  <code>python3 gateway.py</code>
                </b-card>
              </b-tab>

              <b-tab title="Native" v-if="selectedOption === 'esp32'">
                (2) Install
                <a
                  href="https://www.python.org/downloads/release/python-3913/"
                  target="_blank"
                >
                  Python 3.9
                </a>
                <b-card class="text-left my-2 mx-4">
                  <b>In Ubuntu</b> <br />
                  <code>
                    sudo apt install software-properties-common<br />
                    sudo add-apt-repository ppa:deadsnakes/ppa<br />
                    sudo apt install python3.9<br />
                  </code>
                  <!--
                  <b>Setting Python 3.9 as the default version in Ubuntu</b>
                  <br />
                  <code>
                    sudo update-alternatives --set python3 /usr/bin/python3.9
                  </code>
                  -->
                  <b>
                    With
                    <a href="https://docs.astral.sh/uv" target="_blank">uv</a>
                  </b>
                  <br />
                  <code>uv python install 3.9</code>
                </b-card>

                (3) Install ESP-IDF framework (only the first time):
                <b-card class="text-left my-2 mx-4">
                  Follow the instructions from
                  <a
                    href="https://docs.espressif.com/projects/esp-idf/en/v5.5.1/esp32/get-started/linux-macos-setup.html"
                    target="_blank"
                    >Espressif's documentation</a
                  >.<br /><br />
                  To ensure Python 3.9 is used for the installation, first
                  create a virtual environment in
                  <code>~/.espressif/python_env/idf5.3_py3.9_en</code>, and
                  activate it, before executing the <code>install.sh</code>
                  script.
                  <div class="bash mt-2">
                    <code>
                      python3.9 -m venv
                      ~/.espressif/python_env/idf5.3_py3.9_en<br />
                      source
                      ~/.espressif/python_env/idf5.3_py3.9_env/bin/activate<br />
                    </code>
                  </div>
                </b-card>

                (4) Download the driver: <br />
                <b-container align-h="center" class="d-grid mb-1">
                  <b-button
                    size="sm"
                    class="my-1 mx-3"
                    variant="outline-primary"
                    @click="download_driver"
                  >
                    <font-awesome-icon :icon="['fas', 'download']" /> Download
                    Driver
                  </b-button>
                </b-container>

                (5) Run driver:
                <b-card class="text-left my-2 mx-4">
                  Unzip the <code>driver.zip</code> file and move into the
                  driver directory associated to your board:<br />
                  <code>
                    unzip driver.zip<br />
                    cd &lt;board&gt;
                  </code>
                </b-card>
                <b-card class="text-left my-2 mx-4">
                  Install the Python dependencies:<br />
                  <code> pip3 install -r requirements.txt </code>
                </b-card>
                <b-card class="text-left my-2 mx-4">
                  <a
                    href="https://docs.espressif.com/projects/esp-idf/en/v5.5.1/esp32/get-started/linux-macos-setup.html#step-4-set-up-the-environment-variables"
                    >Load the ESP-IDF environment variables</a
                  >
                  (<code>export.sh</code>)
                </b-card>
                <b-card class="text-left my-2 mx-4">
                  Execute the gateway web service:<br />
                  <code>python3 gateway.py</code>
                </b-card>
              </b-tab>
            </b-tabs>
          </b-tab>

          <b-tab title="Debug" v-if="selectedOption === 'esp32'">
            (2) Start the environment of your choice
            <br /><br />

            (3) Connect your JTAG device
            <b-card class="text-left my-2 mx-4">
              Checkout how debugging works in your board:
              <a
                href="https://docs.espressif.com/projects/esp-idf/en/stable/esp32c3/api-guides/jtag-debugging/configure-builtin-jtag.html"
                target="_blank"
              >
                Espressif JTAG Debugging Documentation
              </a>
            </b-card>

            (4) Install OpenOCD (not necessary in Native environment):
            <b-card class="text-left my-2 mx-4">
              Install the correct openocd distribution:
              <a
                href="https://github.com/espressif/openocd-esp32/releases/tag/v0.12.0-esp32-20241016"
                target="_blank"
              >
                OpenOCD ESP32 Releases
              </a>
            </b-card>

            (5) Download openocd scripts <br />
            <b-container align-h="center" class="d-grid mb-1">
              <b-button
                size="sm"
                class="my-1 mx-3"
                variant="outline-primary"
                @click="download_scripts"
              >
                <font-awesome-icon :icon="['fas', 'download']" /> Download
                Scripts
              </b-button>
            </b-container>

            (6) Run openocd_start script:
            <b-card class="text-left my-2 mx-4">
              <code>./openocd_start.sh esp32c3</code>
            </b-card>

            (7) Open where Debug UI will be placed, as Docker cannot open pages
            in host:
            <b-card class="text-left my-2 mx-4">
              <a href="http://localhost:5000/" target="_blank">
                http://localhost:5000/
              </a>
            </b-card>
          </b-tab>

          <!-- Run -->
          <b-tab title="Run" active id="flash-tab-run">
            <div v-if="targetBoard.startsWith('sbc')">
              <label for="target-user">
                (2-1) Target User: (please verify your board user)
              </label>
              <b-form-input
                id="target-port"
                type="text"
                v-model="targetPort"
                placeholder="Enter target user"
                size="sm"
                class="my-2"
              />

              <label for="target-location">
                (2-2) Target Location: (please verify the route exists in your
                board)
              </label>
              <b-form-input
                id="target-location"
                type="text"
                v-model="targetLocation"
                size="sm"
                class="my-2"
              />
            </div>
            <div v-else>
              <label for="target-port">
                (2) Target port (please verify the port on your computer):
              </label>
              <b-form-input
                id="target-port"
                type="text"
                v-model="targetPort"
                placeholder="Enter target port"
                size="sm"
                class="my-2"
              />
            </div>
            <label for="flash-url"> (3) Flash URL: </label>
            <b-form-input
              id="flash-url"
              type="text"
              v-model="flashURL"
              placeholder="Enter flash URL"
              size="sm"
              class="my-2"
            />
            <b-container fluid align-h="center">
              <b-row align-h="center" class="mt-3">
                <!-- Columna 1: Flash, Clean y Erase Flash -->

                <b-col class="d-grid gap-3">
                  <!-- Botón Flash -->
                  <b-button
                    variant="primary"
                    @click="do_flash"
                    :pressed="flashing"
                    :disabled="
                      flashing ||
                      running ||
                      debugging ||
                      fullclean ||
                      stoprunning ||
                      eraseflash
                    "
                  >
                    <font-awesome-icon :icon="['fas', 'bolt-lightning']" />
                    <span v-if="!flashing">&nbsp;Flash</span>
                    <span v-else> &nbsp;Flashing... <b-spinner small /> </span>
                  </b-button>

                  <!-- Botón Clean -->
                  <b-button
                    class="btn btn-block"
                    variant="danger"
                    @click="showConfirmPopup('fullclean')"
                    :pressed="fullclean"
                    :disabled="
                      fullclean ||
                      flashing ||
                      running ||
                      debugging ||
                      stoprunning ||
                      eraseflash
                    "
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                    <span v-if="!fullclean">&nbsp;Clean</span>
                    <span v-else> &nbsp;Cleaning... <b-spinner small /> </span>
                  </b-button>

                  <!-- Botón Erase Flash -->
                  <b-button
                    class="btn btn-block"
                    variant="danger"
                    @click="showConfirmPopup('eraseflash')"
                    :pressed="eraseflash"
                    :disabled="
                      eraseflash ||
                      fullclean ||
                      flashing ||
                      running ||
                      debugging ||
                      stoprunning
                    "
                  >
                    <font-awesome-icon :icon="['fas', 'broom']" />
                    <span v-if="!eraseflash">&nbsp;Erase Flash</span>
                    <span v-else> &nbsp;Erasing... <b-spinner small /> </span>
                  </b-button>

                  <!-- Popup de confirmación -->
                  <b-modal
                    id="confirm-popup"
                    v-model="showPopup"
                    title="Confirm Action"
                    @ok="confirmAction"
                  >
                    This action will delete your previous work. Are you sure you
                    want to proceed?
                  </b-modal>
                </b-col>

                <!-- Columna 2: Monitor, Debug y Stop -->

                <b-col class="d-grid gap-3">
                  <!-- Botón Monitor -->
                  <b-button
                    variant="primary"
                    @click="do_monitor"
                    :pressed="running"
                    :disabled="
                      running ||
                      flashing ||
                      debugging ||
                      fullclean ||
                      stoprunning ||
                      eraseflash
                    "
                  >
                    <font-awesome-icon :icon="['fas', 'desktop']" />
                    <span v-if="!running">&nbsp;Monitor</span>
                    <span v-else> &nbsp;Running... <b-spinner small /> </span>
                  </b-button>

                  <!-- Botón Debug -->
                  <b-button
                    class="btn btn-block"
                    variant="primary"
                    @click="do_debug"
                    :pressed="debugging"
                    :disabled="
                      debugging ||
                      flashing ||
                      running ||
                      fullclean ||
                      stoprunning ||
                      eraseflash
                    "
                  >
                    <font-awesome-icon :icon="['fas', 'bug']" />
                    <span v-if="!debugging">&nbsp;Debug</span>
                    <span v-else> &nbsp;Debuging... <b-spinner small /> </span>
                  </b-button>

                  <!-- Botón Stop -->
                  <b-button
                    class="btn btn-block"
                    variant="primary"
                    @click="do_stop_monitor"
                    :pressed="stoprunning"
                    :disabled="
                      !(running || debugging) ||
                      flashing ||
                      fullclean ||
                      eraseflash
                    "
                  >
                    <font-awesome-icon :icon="['fas', 'stop']" />
                    <span v-if="!stoprunning"> Stop</span>
                    <span v-else> Stopping... <b-spinner small /> </span>
                  </b-button>
                </b-col>
              </b-row>
            </b-container>
          </b-tab>
        </b-tabs>
      </b-tab>

      <!-- Remote -->
      <!-- TODO: Uncomment when tested -->
      <!--
      <b-tab title="Remote Device" id="flash-tab-remote">
        Remote Device URL:
        <b-form-input
          type="text"
          v-model="labURL"
          placeholder="Enter remote device URL"
          size="sm"
          class="my-2"
        />

        <b-container class="d-grid mt-3">
          <b-button size="sm" variant="primary" @click="get_boards">
            <font-awesome-icon :icon="['fas', 'link']" /> Connect
          </b-button>
        </b-container>

        <b-container fluid align-h="center" class="mx-0 px-0" v-if="boards">
          <label for="select-remote-boards">(2) Select Target Board:</label>
          <b-form-select
            id="select-remote-boards"
            v-model="targetBoard"
            :options="remote_target_boards"
            size="sm"
          />
          <br />
        </b-container>

        <b-container fluid align-h="center" class="mx-0 px-0" v-if="boards">
          (3) E-mail to receive the execution results:
          <b-form-input
            type="text"
            v-model="resultEmail"
            placeholder="Enter E-mail"
            size="sm"
          />
          <br />
        </b-container>

        <div v-if="position">
          Last program status: <b>{{ position }}</b>
        </div>

        <b-container
          fluid
          align-h="center"
          class="mx-0 px-0"
          v-if="targetBoard !== '' && enqueue"
        >
          <b-button size="sm" variant="danger" @click="do_cancel">
            <font-awesome-icon :icon="['fas', 'ban']" />
            Cancel last program
          </b-button>
          <br />
        </b-container>

        <b-container
          fluid
          align-h="center"
          class="mx-0 px-0"
          v-if="targetBoard != ''"
        >
          <b-button size="sm" variant="primary" @click="do_enqueue">
            <font-awesome-icon :icon="['fas', 'paper-plane']" />
            Send program
          </b-button>
        </b-container>

        <br />

        For Teachers, you can read about how to deploy a remote laboratory in
        <a
          href="https://github.com/creatorsim/creator/blob/master/dockers/remote_lab/README.md"
        >
          our documentation</a
        >.
      </b-tab>
    -->
    </b-tabs>
  </b-modal>
</template>

<style lang="scss" scoped>
.bash {
  white-space: pre;
  overflow: auto;
}
</style>
