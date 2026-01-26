<!--
Copyright 2018-2026 CREATOR Team.

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

import { LOCALLAB } from "@/web/src/localGateway.js";
import { REMOTELAB } from "@/web/src/remoteLab.js";
import { console_log, show_notification } from "@/web/utils.mjs";
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
      // Prefill targetLocation when switching to SBC
      if (newVal === "sbc") {
        this.targetLocation = "~/creator";
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

      flashing: false,
      running: false,
      debugging: false,
      fullclean: false,
      stoprunning: false,
      eraseflash: false,
      showPopup: false,
      pendingAction: null as string | null,
      arduino_support: false,
    };
  },

  methods: {
    onTabChange() {
      if (this.targetBoard.startsWith("sbc")) {
        this.targetPort = "ubuntu@10.0.0.1";
        this.targetLocation = "~/creator";
      } else {
        this.targetPort = this.$root!.target_ports[this.os] || "";
      }
    },

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

        if (data !== -1) {
          return;
        }

        if (data === -2) {
          this.position = "Error";
          this.enqueue = false;
          return;
        }

        if (!isNaN(data)) {
          this.position = "Queue position: " + data;
          return;
        }

        this.position = data;
      });
      // Google Analytics
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
    creatinoMode(isChecked: boolean) {
      LOCALLAB.gateway_monitor(this.flashURL + "/arduinoMode", {
        state: isChecked,
      }).then(data => {
        this.eraseflash = false
        console_log(JSON.stringify(data, null, 2), "DEBUG")
      })

      // Google Analytics
      creator_ga("simulator", "simulator.arduinoMode", "simulator.arduinoMode")
    },

    handleCheckboxChange(value: boolean) {
      this.creatinoMode(value)
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
        if (dataStr.includes("cr_ functions are not supported in this mode")) {
          show_notification(
            'CREATino code in CREATOR module. Make sure the "Arduino Support" checkbox is selected',
            "danger",
          );
        }
      });

      //Google Analytics
      creator_ga("simulator", "simulator.flash", "simulator.flash");
    },

    //
    // Local device
    //

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
          show_notification(
            "Error monitoring: Blank target location",
            "danger",
          );
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
          show_notification(
            "Error erase-flashing: Blank target port",
            "danger",
          );
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
        <div class="d-flex flex-column align-items-center mt-4 mb-2">
          <span style="margin-bottom: 10px; font-weight: bold">
            Device type:
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

        <label for="select-local-boards">Target board:</label>

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

        <b-col v-if="selectedOption === 'esp32' && targetBoard" class="mb-3">
          <b-form-checkbox
          class ="mt-3"
            v-model="arduino_support"
            @change="handleCheckboxChange(arduino_support)"
          >
            <span class="checkbox-label">Enable Arduino Support</span>
          </b-form-checkbox>
        </b-col>

        <div v-if="targetBoard" class="mt-3">
          <div v-if="targetBoard.startsWith('sbc')">
            <label for="target-user">
              Target user: (please verify your board user)
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
              Target location: (please verify the route exists in your board)
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
        </div>

        <div class="mt-4 text-center">
          For instructions on how to use this feature, please refer to the
          <a
            href="https://creatorsim.github.io/creator-wiki/web/gateway.html"
            target="_blank"
            >CREATOR Gateway Documentation</a
          >.
        </div>
      </b-tab>

      <!-- Remote -->

      <b-tab title="Remote Device" id="flash-tab-remote">
        Remote Laboratory URL:
        <b-input-group class="my-2">
          <b-form-input
            type="text"
            v-model="labURL"
            placeholder="Enter remote laboratory URL"
            size="sm"
          />

          <b-button size="sm" variant="primary" @click="get_boards">
            <font-awesome-icon :icon="['fas', 'link']" /> Connect
          </b-button>
        </b-input-group>

        <b-container fluid align-h="center" class="my-2 px-0" v-if="boards">
          <label for="select-remote-boards">Target board:</label>
          <b-form-select
            id="select-remote-boards"
            v-model="targetBoard"
            :options="remote_target_boards"
            size="sm"
          />
        </b-container>

        <b-container
          fluid
          align-h="center"
          class="my-2 px-0"
          v-if="boards && targetBoard"
        >
          E-mail to receive the execution results:
          <b-form-input
            type="text"
            v-model="resultEmail"
            placeholder="Enter E-mail"
            size="sm"
          />
        </b-container>

        <div class="mt-3" v-if="position">
          Last program status: <b>{{ position }}</b>
        </div>

        <div class="mt-3">
          <!-- send button -->
          <b-button
            v-if="boards && targetBoard && !enqueue"
            class="me-1"
            size="sm"
            variant="primary"
            @click="do_enqueue"
          >
            <font-awesome-icon :icon="['fas', 'paper-plane']" />
            Send program
          </b-button>

          <!-- cancel button -->
          <b-button
            v-if="targetBoard && enqueue"
            size="sm"
            variant="danger"
            @click="do_cancel"
          >
            <font-awesome-icon :icon="['fas', 'ban']" />
            Cancel last program
          </b-button>
        </div>

        <div class="mt-4 text-center">
          For instructions on how to use this feature, please refer to the
          <a
            href="https://creatorsim.github.io/creator-wiki/web/remote-lab.html"
            target="_blank"
            >CREATOR Remote Laboratory Documentation</a
          >.
        </div>
      </b-tab>
    </b-tabs>
  </b-modal>
</template>
