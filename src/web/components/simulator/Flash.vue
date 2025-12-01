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
      downloadFile(`/gateway/${this.targetBoard}.zip`, "driver");

      //Google Analytics
      creator_ga(
        "simulator",
        "simulator.download_driver",
        "simulator.download_driver",
      );
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
        assembly: this.assembly_code,
      }).then(data => {
        this.flashing = false;
        console_log(JSON.stringify(data, null, 2), "DEBUG");
        if (
          JSON.stringify(data, null, 2).includes("Flash completed successfully")
        ) {
          show_notification("Flashing program success.", "success");
        }
        if (JSON.stringify(data, null, 2).includes("No UART port found")) {
          show_notification("Error flashing: Not found UART port", "danger");
        }
        if (
          JSON.stringify(data, null, 2).includes(
            "cr_ functions are not supported in this mode",
          )
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
        assembly: this.assembly_code,
      }).then(data => {
        this.stoprunning = false;
        console_log(JSON.stringify(data, null, 2), "DEBUG");
        if (JSON.stringify(data, null, 2).includes("Process stopped")) {
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
        assembly: this.assembly_code,
      }).then(data => {
        this.running = false;

        console_log(JSON.stringify(data, null, 2), "DEBUG");
        if (JSON.stringify(data, null, 2).includes("No UART port found")) {
          show_notification("Error: Not found UART port", "danger");
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
        assembly: this.assembly_code,
      }).then(_data => {
        this.debugging = false;
        // show_notification(_data, 'danger') ;
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
        assembly: this.assembly_code,
      }).then(data => {
        this.fullclean = false;
        console_log(JSON.stringify(data, null, 2), "DEBUG");
        if (JSON.stringify(data, null, 2).includes("Full clean done.")) {
          show_notification("Full clean done.", "success");
        }
        if (JSON.stringify(data, null, 2).includes("Nothing to clean")) {
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
        assembly: this.assembly_code,
      }).then(data => {
        this.eraseflash = false;

        //show_notification(data, 'danger')
        console_log(JSON.stringify(data, null, 2), "DEBUG");

        if (JSON.stringify(data, null, 2).includes("Erase flash done")) {
          show_notification(
            "Erase flash done. Please, unplug and plug the cable(s) again",
            "success",
          );
        }
        if (
          JSON.stringify(data, null, 2).includes(
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
  <b-modal :id="id" title="Target Board Flash" no-footer>
    <b-tabs content-class="mt-3">
      <b-tab title="Local Device" active id="flash-tab-local">
        <label for="select-local-boards">(1) Select Target Board:</label>

        <b-form-select
          id="select-local-boards"
          v-model="targetBoard"
          :options="target_boards"
          size="sm"
          class="mt-2"
        />
        <br />

        <b-tabs content-class="mt-3" v-if="targetBoard">
          <b-tab title="Prerequisites" id="flash-tab-prerequisites">
            <b-tabs content-class="mt-3">
              <b-tab
                title="Docker Windows"
                id="tab-docker-win"
                :active="os === 'Win'"
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

              <b-tab title="Native">
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

          <!-- Run -->
          <b-tab title="Run" active id="flash-tab-run">
            <label for="target-port">
              Target port (please verify the port on your computer):
            </label>
            <b-form-input
              id="target-port"
              type="text"
              v-model="targetPort"
              placeholder="Enter target port"
              size="sm"
              class="my-2"
            />
            <label for="flash-url"> Flash URL: </label>
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
