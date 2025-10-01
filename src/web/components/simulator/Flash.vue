<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro
                    Calderon Mateos, Luis Daniel Casais Mezquida

file is part of CREATOR.

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
import { REMOTELAB } from "@/web/src/remoteLab.js"
import { LOCALLAB } from "@/web/src/localGateway.js"
import { downloadFile, console_log, show_notification } from "@/web/utils.mjs"
import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { instructions } from "@/core/assembler/assembler.mjs"

export default {
  props: {
    id: { type: String, required: true },
    os: { type: String, required: true },
    lab_url: { type: String, required: true },
    result_email: { type: String, required: true },
    target_board: { type: String, required: true },
    target_port: { type: String, required: true },
    flash_url: { type: String, required: true },
    assembly_code: { type: String, required: true },
  },

  computed: {
    // sync w/ root
    labURL: {
      get() {
        return this.lab_url
      },
      set(value) {
        this.$root.lab_url = value
      },
    },
    resultEmail: {
      get() {
        return this.result_email
      },
      set(value) {
        this.$root.result_email = value
      },
    },
    targetBoard: {
      get() {
        return this.target_board
      },
      set(value) {
        this.$root.target_board = value
      },
    },
    targetPort: {
      get() {
        return this.target_port
      },
      set(value) {
        this.$root.target_port = value
      },
    },
    flashURL: {
      get() {
        return this.flash_url
      },
      set(value) {
        this.$root.flash_url = value
      },
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
        { text: "Please select an option", value: null, disabled: true },
        { text: "ESP32-C6 (RISC-V)", value: "esp32c6" },
        { text: "ESP32-C3 (RISC-V)", value: "esp32c3" },
        { text: "ESP32-H2 (RISC-V)", value: "esp32h2" },
        // { text: "ESP32-S2 (MIPS-32)", value: "esp32s2" },
        // { text: "ESP32-S3 (MIPS-32)", value: "esp32s3" },
      ],

      flashing: false,
      running: false,
      debugging: false,
      fullclean: false,
      stoprunning: false,
      eraseflash: false,
      showPopup: false,
      pendingAction: null,
    }
  },

  methods: {
    //
    //Remote Device
    //

    // get_boards() {
    //   if (this.labURL != "") {

    //     this_env = this
    //     REMOTELAB.get_boards(this.labURL + "/target_boards").then(
    //       function (data) {
    //         if (data != "-1") {
    //           available_boards = JSON.parse(data)

    //           for (var i = 1; i < this_env.remote_target_boards.length; i++) {
    //             if (
    //               !available_boards.includes(
    //                 this_env.remote_target_boards[i]["value"],
    //               )
    //             ) {
    //               this_env.remote_target_boards.splice(i, 1)
    //               i--
    //             }
    //           }

    //           this_env.boards = true
    //         }
    //       },
    //     )
    //   } else {
    //     this.boards = false
    //   }
    // },

    // do_enqueue() {

    //   if (instructions.length == 0) {
    //     show_notification("Compile a program first", "warning")
    //     return
    //   }

    //   if (this.resultEmail == "") {
    //     show_notification("Please, enter your E-mail", "danger")
    //     return
    //   }

    //   const earg = {
    //     target_board: this.targetBoard,
    //     result_email: this.resultEmail,
    //     assembly: this.assembly_code,
    //   }

    //   this_env = this
    //   REMOTELAB.enqueue(this.labURL + "/enqueue", earg).then(function (data) {
    //     if (data != "-1") {
    //       this_env.request_id = data
    //       this_env.enqueue = true
    //       this_env.status = true
    //       this_env.position = ""
    //       this_env.check_status()
    //     }
    //   })

    //   //Google Analytics
    //   creator_ga("simulator", "simulator.enqueue", "simulator.enqueue")
    // },

    // check_status() {
    //   if (this.position != "Completed" && this.position != "Error") {
    //     this.get_status()
    //     setTimeout(this.check_status, 20000)
    //   }
    // },

    // get_status() {

    //   var parg = {
    //     req_id: this.request_id,
    //   }

    //   this_env = this
    //   REMOTELAB.status(this.labURL + "/status", parg).then(function (data) {
    //     if (data == "Completed") {
    //       this_env.enqueue = false
    //     }
    //     if (data != "-1") {
    //       if (data == "-2") {
    //         this_env.position = "Error"
    //         this_env.enqueue = false
    //       } else if (!isNaN(data)) {
    //         this_env.position = "Queue position: " + data
    //       } else {
    //         this_env.position = data
    //       }
    //     }
    //   })
    //   //Google Analytics
    //   creator_ga("simulator", "simulator.position", "simulator.position")
    // },

    // do_cancel() {

    //   var carg = {
    //     req_id: this.request_id,
    //   }

    //   this_env = this
    //   REMOTELAB.cancel(this.labURL + "/delete", carg).then(function (data) {
    //     if (data != "-1") {
    //       this_env.enqueue = false
    //       this_env.position = "Canceled"
    //     }
    //   })

    //   //Google Analytics
    //   creator_ga("simulator", "simulator.cancel", "simulator.cancel")
    // },

    //
    //Local device
    //

    download_driver() {
      downloadFile(`/gateway/${this.targetBoard}.zip`, this.targetBoard)

      //Google Analytics
      creator_ga(
        "simulator",
        "simulator.download_driver",
        "simulator.download_driver",
      )
    },

    do_flash() {
      if (instructions.length === 0) {
        show_notification("Compile a program first", "warning")
        return
      }

      this.flashing = true

      LOCALLAB.gateway_flash(this.flashURL + "/flash", {
        target_board: this.targetBoard,
        target_port: this.targetPort,
        assembly: this.assembly_code,
      }).then(data => {
        this.flashing = false
        console_log(JSON.stringify(data, null, 2), "DEBUG")
        if (
          JSON.stringify(data, null, 2).includes("Flash completed successfully")
        ) {
          show_notification("Flashing program success.", "success")
        }
        if (JSON.stringify(data, null, 2).includes("No UART port found")) {
          show_notification("Error flashing: Not found UART port", "danger")
        }
        if (
          JSON.stringify(data, null, 2).includes(
            "cr_ functions are not supported in this mode",
          )
        ) {
          show_notification(
            'CREATino code in CREATOR module. Make sure the "Arduino Support" checkbox is selected',
            "danger",
          )
        }
      })

      //Google Analytics
      creator_ga("simulator", "simulator.flash", "simulator.flash")
    },

    do_stop_monitor() {
      this.stoprunning = true

      LOCALLAB.gateway_monitor(this.flashURL + "/stopmonitor", {
        target_board: this.targetBoard,
        target_port: this.targetPort,
        assembly: this.assembly_code,
      }).then(data => {
        this.stoprunning = false
        console_log(JSON.stringify(data, null, 2), "DEBUG")
        if (JSON.stringify(data, null, 2).includes("Process stopped")) {
          show_notification("Process stopped.", "success")
        }
      })

      //Google Analytics
      creator_ga("simulator", "simulator.stopmonitor", "simulator.stopmonitor")
    },

    do_monitor() {
      this.running = true
      this.stoprunning = false

      LOCALLAB.gateway_monitor(this.flashURL + "/monitor", {
        target_board: this.targetBoard,
        target_port: this.targetPort,
        assembly: this.assembly_code,
      }).then(data => {
        this.running = false

        console_log(JSON.stringify(data, null, 2), "DEBUG")
        if (JSON.stringify(data, null, 2).includes("No UART port found")) {
          show_notification("Error: Not found UART port", "danger")
        }
      })

      //Google Analytics
      creator_ga("simulator", "simulator.monitor", "simulator.monitor")
    },

    do_debug() {
      this.debugging = true

      LOCALLAB.gateway_monitor(this.flashURL + "/debug", {
        target_board: this.targetBoard,
        target_port: this.targetPort,
        assembly: this.assembly_code,
      }).then(_data => {
        this.debugging = false
        // show_notification(_data, 'danger') ;
      })

      //Google Analytics
      creator_ga("simulator", "simulator.debug", "simulator.debug")
    },

    showConfirmPopup(action) {
      this.pendingAction = action
      this.showPopup = true
    },

    confirmAction() {
      this.showPopup = false
      if (this.pendingAction === "fullclean") {
        this.do_fullclean()
      } else if (this.pendingAction === "eraseflash") {
        this.do_erase_flash()
      }
      this.pendingAction = null
    },

    do_fullclean() {
      this.fullclean = true

      LOCALLAB.gateway_monitor(this.flashURL + "/fullclean", {
        target_board: this.targetBoard,
        target_port: this.targetPort,
        assembly: this.assembly_code,
      }).then(data => {
        this.fullclean = false
        console_log(JSON.stringify(data, null, 2), "DEBUG")
        if (JSON.stringify(data, null, 2).includes("Full clean done.")) {
          show_notification("Full clean done.", "success")
        }
        if (JSON.stringify(data, null, 2).includes("Nothing to clean")) {
          show_notification("Nothing to clean", "success")
        }
      })

      //Google Analytics
      creator_ga("simulator", "simulator.fullclean", "simulator.fullclean")
    },

    do_erase_flash() {
      this.eraseflash = true

      LOCALLAB.gateway_monitor(this.flashURL + "/eraseflash", {
        target_board: this.targetBoard,
        target_port: this.targetPort,
        assembly: this.assembly_code,
      }).then(data => {
        this.eraseflash = false

        //show_notification(data, 'danger')
        console_log(JSON.stringify(data, null, 2), "DEBUG")

        if (JSON.stringify(data, null, 2).includes("Erase flash done")) {
          show_notification(
            "Erase flash done. Please, unplug and plug the cable(s) again",
            "success",
          )
        }
        if (
          JSON.stringify(data, null, 2).includes(
            "Could not open /dev/ttyUSB0, the port is busy or doesn't exist",
          )
        ) {
          show_notification(
            "Error erasing flash: Hint: Check if the port is correct and ESP connected",
            "danger",
          )
        }
      })

      // Google Analytics
      creator_ga("simulator", "simulator.eraseflash", "simulator.eraseflash")
    },
  },
}
</script>

<template>
  <b-modal :id="id" title="Target Board Flash" hide-footer>
    <b-tabs content-class="mt-3">
      <b-tab title="Local Device">
        (1) Select Target Board:
        <b-form-select
          v-model="targetBoard"
          :options="target_boards"
          size="sm"
          title="Target board"
        />
        <br />

        <b-tabs content-class="mt-3" v-if="targetBoard">
          <b-tab title="Prerequisites">
            <b-tabs content-class="mt-3">
              <b-tab title="Docker Windows" active>
                (2) Install Docker Desktop (only the first time):
                <b-card class="text-left m-2">
                  Follow the instructions from
                  <a
                    href="https://docs.docker.com/desktop/install/windows-install/"
                    target="_blank"
                  >
                    Docker's documentation
                  </a>
                </b-card>

                (3) Download esptool (only the first time):
                <b-card class="text-left m-2">
                  Download from:
                  <a
                    href="https://github.com/espressif/esptool/releases"
                    target="_blank"
                  >
                    github.com/espressif/esptool/releases
                  </a>
                </b-card>

                (4) Pull <code>creator_gateway</code> image in Docker Desktop:
                <b-card class="text-left m-2">
                  <ol class="mb-0">
                    <li>
                      Search for <code>creatorsim/creator_gateway</code> in the
                      Docker Desktop browser
                    </li>
                    <li>Click the "Pull" button</li>
                  </ol>
                </b-card>

                (5) Run the image:
                <b-card class="text-left">
                  <ol class="mb-0">
                    <li>Click the "Run" button</li>
                    <li>Click the "Optional settings" button</li>
                    <li>Set the Host port to 8080</li>
                    <li>Click the "Run" button</li>
                  </ol>
                </b-card>
                (6) Run start_gateway script in the container bash:
                <b-card class="text-left m-2">
                  <ol class="mb-0">
                    <li>Click the "Exec" button</li>
                    <li>Execute <code>./start_gateway.sh</code></li>
                  </ol>
                </b-card>

                (7) Run esp_rfc2217_server in windows cmd:
                <b-card class="text-left m-2">
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

              <b-tab title="Docker Linux/MacOS">
                (2) Install Docker Engine (only the first time):
                <b-card class="text-left m-2">
                  Follow the instructions from
                  <a
                    href="https://docs.docker.com/engine/install/"
                    target="_blank"
                  >
                    Docker's documentation
                  </a>
                </b-card>

                (3) Download the <code>creator_gateway</code> image:
                <b-card class="text-left m-2">
                  <code>docker pull creatorsim/creator_gateway</code>
                </b-card>

                (4) Run the image:
                <b-card class="text-left m-2 bash">
                  <code
                    >docker run --init -it --device=&lt;targetPort&gt; -p
                    8080:8080 --name creator_gateway creatorsim/creator_gateway
                    /bin/bash
                  </code>
                </b-card>

                (5) Run the <code>start_gateway.sh</code> script in the
                container's shell:
                <b-card class="text-left m-2">
                  <code>./start_gateway.sh</code>
                </b-card>
              </b-tab>

              <b-tab title="Native">
                (2) Install ESP-IDF framework (only the first time):
                <b-card class="text-left m-2">
                  Follow the instructions from
                  <a
                    href="https://docs.espressif.com/projects/esp-idf/en/v5.5.1/esp32/get-started/linux-macos-setup.html"
                    target="_blank"
                  >
                    Espressif's documentation
                  </a>
                </b-card>

                (!!) (NEW) Install Python 3.9 (required version for this
                driver):<br />
                <!-- You can either install it natively or use
                <a href="https://docs.astral.sh/uv/" target="_blank">uv</a>. -->

                <b-card class="text-left m-2">
                  <b>Installing Python 3.9 in Ubuntu</b>
                  <br />
                  <code>
                    sudo apt install software-properties-common<br />
                    sudo add-apt-repository ppa:deadsnakes/ppa<br />
                    sudo apt install python3.9<br />
                  </code>
                </b-card>

                <b-card class="text-left m-2 flex-wrap bash">
                  <b>Setting Python 3.9 as the default version in Ubuntu</b>
                  <br />
                  <code>
                    sudo update-alternatives --set python3 /usr/bin/python3.9
                  </code>
                </b-card>

                (3) Install the
                <a href="https://pypi.org/project/Flask/" target="_blank">
                  flask</a
                >
                and
                <a href="https://pypi.org/project/flask-cors/" target="_blank">
                  flask-cors</a
                >
                Python packages:
                <b-card class="text-left m-2">
                  <code>pip3 install flask flask_cors</code>
                </b-card>

                (4) (NEW) Install additional packages for debug:
                <b-card class="text-left m-2">
                  <!-- Install
                  <a
                    href="https://docs.espressif.com/projects/esp-idf/en/v3.3.3/api-guides/jtag-debugging/setup-openocd-linux.html"
                    target="_blank"
                  >
                    Openocd
                  </a>
                  <br /> -->
                  Install the GDB web interface (<a
                    href="https://pypi.org/project/gdbgui/"
                    target="_blank"
                    >gdbgui</a
                  >):
                  <br />
                  <code>pip3 install gdbgui</code>
                </b-card>

                (5) Download the driver:
                <br />

                <b-container align-h="center" class="d-grid mb-1">
                  <b-button
                    size="sm"
                    class="my-1"
                    variant="outline-primary"
                    @click="download_driver"
                  >
                    <font-awesome-icon :icon="['fas', 'download']" />
                    Download Driver
                  </b-button>
                </b-container>

                (6) Run driver:
                <b-card class="text-left m-2">
                  Load the environment variable for your board:<br />
                  <code>. $HOME/esp/esp-idf/export.sh</code>
                </b-card>
                <b-card class="text-left m-2">
                  Unzip the <code>driver.zip</code> file and move into the
                  driver directory associated to your board:<br />
                  <code>
                    unzip driver.zip<br />
                    cd &lt;board&gt;
                  </code>
                </b-card>
                <b-card class="text-left m-2">
                  Execute the gateway web service:<br />
                  <code>python3 gateway.py</code>
                </b-card>
              </b-tab>
            </b-tabs>
          </b-tab>

          <!-- Run -->
          <b-tab title="Run" active>
            (2) Target Port: (please verify the port on your computer)
            <b-form-input
              type="text"
              v-model="targetPort"
              placeholder="Enter target port"
              size="sm"
              title="Target port"
              class="m-2"
            />
            <label for="range-6">(3) Flash URL:</label>
            <b-form-input
              type="text"
              v-model="flashURL"
              placeholder="Enter flash URL"
              size="sm"
              title="Flash URL"
              class="m-2"
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
                    <span v-else>
                      &nbsp;Flashing...
                      <b-spinner small />
                    </span>
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
                    <span v-else>
                      &nbsp;Cleaning...
                      <b-spinner small />
                    </span>
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
                    <span v-else>
                      &nbsp;Erasing...
                      <b-spinner small />
                    </span>
                  </b-button>

                  <!-- Popup de confirmación -->
                  <b-modal
                    id="confirm-popup"
                    v-model="showPopup"
                    title="Confirm Action"
                  >
                    <p>
                      This action will delete your previous work. Are you sure
                      you want to proceed?
                    </p>
                    <template #modal-footer>
                      <b-button variant="secondary" @click="showPopup = false">
                        Cancel
                      </b-button>
                      <b-button variant="primary" @click="confirmAction">
                        Confirm
                      </b-button>
                    </template>
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
                    <span v-else>
                      &nbsp;Running...
                      <b-spinner small />
                    </span>
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
                    <span v-else>
                      &nbsp;Debuging...
                      <b-spinner small />
                    </span>
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
                    <span v-else>
                      Stopping...
                      <b-spinner small />
                    </span>
                  </b-button>
                </b-col>
              </b-row>
            </b-container>
          </b-tab>
        </b-tabs>
      </b-tab>

      <!-- Remote -->

      <!--
      <b-tab title="Remote Device">
        <label for="range-6">(1) Remote Device URL:</label>
        <b-form-input
          type="text"
          v-model="labURL"
          placeholder="Enter remote device URL"
          size="sm"
          title="Remote remote device URL"
        >
        </b-form-input>
        <br />

        <b-button
          class="btn btn-sm btn-block"
          variant="primary"
          @click="get_boards"
        >
          <span class="fas fa-link"></span> Connect
        </b-button>
        <br v-if="!boards" />

        <b-container fluid align-h="center" class="mx-0 px-0" v-if="boards">
          <label for="range-6">(2) Select Target Board:</label>
          <b-form-select
            v-model="targetBoard"
            :options="remote_target_boards"
            size="sm"
            title="Target board"
          >
          </b-form-select>
        </b-container>
        <br />

        <b-container fluid align-h="center" class="mx-0 px-0" v-if="boards">
          (3) E-mail to receive the execution results:
          <b-form-input
            type="text"
            v-model="resultEmail"
            placeholder="Enter E-mail"
            size="sm"
            title="Result E-mail"
          />
        </b-container>
        <br />

        Last program status: <b>{{ position }}</b>

        <b-container
          fluid
          align-h="center"
          class="mx-0 px-0"
          v-if="targetBoard != '' && enqueue"
        >
          <b-button
            class="btn btn-sm btn-block"
            variant="danger"
            @click="do_cancel"
          >
            <font-awesome-icon :icon="['fas', 'ban']" />
            Cancel last program
          </b-button>
        </b-container>
        <br />

        <b-container
          fluid
          align-h="center"
          class="mx-0 px-0"
          v-if="targetBoard != ''"
        >
          <b-button
            class="btn btn-sm btn-block"
            variant="primary"
            @click="do_enqueue"
          >
            <font-awesome-icon :icon="['fas', 'paper-plane']" />
            Send program
          </b-button>
        </b-container>
        <br />
        For Teachers, you can read about how to deploy a remote laboratory in
        <a
          href="https://github.com/creatorsim/creator/blob/master/dockers/remote_lab/README.md"
        >
          our documentation.
        </a>
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
