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
<template>
  <div
    ref="layoutContainer"
    class="arduino-layout"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  >
    <div class="left-panel" :style="{ width: splitPercent + '%' }">
      <div class="panel-header">Arduino Function Tracer</div>
      <div ref="terminalContainer" class="terminal-container"></div>
    </div>

    <div class="resizer" @mousedown="onMouseDown"></div>

    <div class="right-panel" :style="{ width: 100 - splitPercent + '%' }">
      <div class="panel-header">Hardware View</div>
      <div class="board-selector-inline">
        <label>Board selected:</label>
        <select v-model="selectedBoard" @change="handleBoardChange">
          <option value="esp32c3devkit2">ESP32-C3 DevKit</option>
          <option value="esp32c6devkit1">ESP32-C6 DevKit</option>
        </select>
      </div>

      <div class="board-view-container">
        <div class="svg-wrapper">
          <div class="pins-column left">
            <div
              v-for="pinName in pinLabels[0]"
              :key="pinName"
              class="pin-anchor"
            >
              <div class="chip-wrapper">
                <div
                  class="reg-chip mini"
                  :class="{ 'is-interrupt-btn': interrupt[pinName] }"
                  :style="{ backgroundColor: chipStyles[pinName] }"
                  @click="
                    interrupt[pinName] ? handleInterruptClick(pinName) : null
                  "
                >
                  <span class="reg-id">{{ pinName }}</span>

                  <input
                    type="text"
                    class="reg-input"
                    :class="{ 'val-active': pinStates[pinName] > 0 }"
                    :value="pinStates[pinName]"
                    @change="updatePinValue($event, pinName)"
                    @keydown.enter="$event.target.blur()"
                    @click.stop
                  />
                </div>

                <transition name="fade">
                  <span
                    v-if="interrupt[pinName]"
                    class="danger-icon"
                    title="Interrupt"
                  >
                    ⚠️
                  </span>
                </transition>
              </div>
            </div>
          </div>

          <img
            :src="activeBoard.svg"
            class="main-board-svg"
            :style="{ width: Math.max((100 - splitPercent) * 4, 120) + 'px' }"
          />

          <div class="pins-column right">
            <div
              v-for="pinName in pinLabels[1]"
              :key="pinName"
              class="pin-anchor"
            >
              <div class="chip-wrapper">
                <div
                  class="reg-chip mini"
                  :class="{ 'is-interrupt-btn': interrupt[pinName] }"
                  :style="{ backgroundColor: chipStyles[pinName] }"
                  @click="
                    interrupt[pinName] ? handleInterruptClick(pinName) : null
                  "
                >
                  <span class="reg-id">{{ pinName }}</span>

                  <input
                    type="text"
                    class="reg-input"
                    :class="{ 'val-active': pinStates[pinName] > 0 }"
                    :value="pinStates[pinName]"
                    @change="updatePinValue($event, pinName)"
                    @keydown.enter="$event.target.blur()"
                    @click.stop
                  />
                </div>

                <transition name="fade">
                  <span
                    v-if="interrupt[pinName]"
                    class="danger-icon"
                    title="Interrupt"
                  >
                    ⚠️
                  </span>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Terminal } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import "xterm/css/xterm.css";
import { execution_mode, status } from "@/core/core.mjs";
import { coreEvents } from "@/core/events.mjs";
import {
  activeBoard,
  pinStates,
  pinLabels,
  switchBoard,
  esp32vect,
} from "../../arduino/pinstates.mjs";
import {
  writeRegister,
  readRegister,
} from "../../../core/register/registerOperations.mjs";
import { crex_findReg } from "../../../core/register/registerLookup.mjs";


export default {
  setup() {
    return {
      activeBoard,
      pinStates,
      pinLabels,
      switchBoard,
    };
  },
  props: {
    display: { type: String, required: true },
    keyboard: { type: String, required: true },
    enter: [Boolean, null],
  },

  data() {
    return {
      selectedBoard: "esp32c3devkit2",
      terminal: null,
      fitAddon: null,
      inputBuffer: "",
      inputMode: false,
      splitPercent: 50,
      isResizing: false,
      chipStyles: {},
      interrupt: {},
      isInterruptsEnabled: true,
    };
  },

  mounted() {
    this.initTerminal();
    // Terminal write
    coreEvents.on("arduino-terminal-write", event => {
      this.writeOutput(event.text);
    });
    // Change pin values
    coreEvents.on("arduino-pin-write", event => {
      const pinName = `GPIO${event.pin}`;
      if (this.pinStates.hasOwnProperty(pinName)) {
        this.pinStates[pinName] = event.value;
      }
    });
    // Reset pin values on Arduino reset
    coreEvents.on("arduino-reset", () => {
      for (const pin in this.pinStates) {
        this.pinStates[pin] = 0;
      }
      for (const pinName in this.chipStyles) {
        this.chipStyles[pinName] = "#0dcaf0";
      }
      this.interrupt = {};
      this.clearTerminal();
    });
    //Changes pin mode color
    coreEvents.on("arduino-pin-mode", event => {
      const pinName = `GPIO${event.pin}`;
      let color = "#0dcaf0";
      switch (event.mode) {
        case 0x1:
          color = "#ff6666";
          break; // INPUT
        case 0x3:
          color = "#66ff66";
          break; // OUTPUT
        case 0x4:
        case 0x5:
          color = "#0066ff";
          break; // INPUT_PULLUP
        case 0x9:
          color = "#9999ff";
          break; // INPUT_PULLDOWN
        case 0xc0:
          color = "#c2c2d6";
          break; // ANALOG
        default:
          color = "#0dcaf0";
      }

      this.chipStyles = {
        ...this.chipStyles,
        [pinName]: color,
      };
    });

    coreEvents.on("arduino-pin-interrupt", pinName => {
      if (!this.isInterruptsEnabled) return; 
      this.interrupt[pinName.pin] = true;
      esp32vect.value[pinName.position] = [
        BigInt(pinName.pin.replace(/\D/g, "")),
        pinName.isr,
        pinName.mode,
      ];
    });
    coreEvents.on("arduino-pin-detach-interrupt", pinName => {
      if (!this.isInterruptsEnabled) return; 
      delete this.interrupt[pinName.pin];
    });
    coreEvents.on("arduino-interrupts-enabled", enabled => {
      this.isInterruptsEnabled = enabled;
    });
  },

  beforeUnmount() {
    // Remove window resize listener
    window.removeEventListener("resize", this.handleResize);

    // Clear references
    this.terminal = null;
    this.fitAddon = null;
  },

  watch: {
    display(newValue, oldValue) {
      // When display changes, write to terminal
      if (this.terminal && newValue !== oldValue) {
        // If newValue is empty, clear the terminal completely
        if (newValue === "") {
          this.terminal.reset();
          this.inputBuffer = "";
        } else {
          const diff = newValue.slice(oldValue.length);
          this.terminal.write(diff);
        }
      }
    },
  },

  methods: {
    initTerminal() {
      // Check if container ref is available
      if (!this.$refs.terminalContainer) {
        console.warn("Terminal container not available");
        return;
      }

      try {
        this.terminal = new Terminal({
          cursorBlink: true,
          cursorStyle: "block",
          disableStdin: true,
          fontSize: 14,
          fontFamily:
            '"Fira Code", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
          fontWeight: "400",
          fontWeightBold: "700",
          letterSpacing: 0,
          lineHeight: 1.2,
          theme: {
            background: "#0a2c13",
            foreground: "#c9d1d9",
            cursor: "#58a6ff",
            cursorAccent: "#0a2c13",
            selectionBackground: "#1f6feb44",
            black: "#484f58",
            red: "#ff7b72",
            green: "#3fb950",
            yellow: "#d29922",
            blue: "#58a6ff",
            magenta: "#bc8cff",
            cyan: "#39c5cf",
            white: "#b1bac4",
            brightBlack: "#6e7681",
            brightRed: "#ffa198",
            brightGreen: "#56d364",
            brightYellow: "#e3b341",
            brightBlue: "#79c0ff",
            brightMagenta: "#d2a8ff",
            brightCyan: "#56d4dd",
            brightWhite: "#f0f6fc",
          },
          rows: 10,
          cols: 80,
          scrollback: 1000,
          allowTransparency: true,
        });

        // Add addons
        this.fitAddon = new FitAddon();
        this.terminal.loadAddon(this.fitAddon);

        // Open terminal in the container
        this.terminal.open(this.$refs.terminalContainer);
        this.fitAddon.fit();

        // Handle input
        this.terminal.onData(data => {
          this.handleInput(data);
        });

        // Handle window resize
        window.addEventListener("resize", this.handleResize);

        // Write initial display content if any
        if (this.display) {
          this.terminal.write(this.display);
        }
      } catch (error) {
        console.error("Error initializing terminal:", error);
      }
    },

    submitInput() {
      if (this.inputBuffer !== "") {
        this.$root.keyboard = this.inputBuffer;
        status.run_program = execution_mode;
        this.inputBuffer = "";
      }
    },

    clearTerminal() {
      if (this.terminal) {
        this.terminal.clear();
        this.inputBuffer = "";
        this.$root.keyboard = "";
        this.$root.display = "";
      }
    },

    handleResize() {
      if (this.fitAddon) {
        this.fitAddon.fit();
      }
    },

    // Method to write output to terminal
    writeOutput(text) {
      if (this.terminal) {
        this.terminal.write(`\r\n> ${text}\r\n`);
      }
    },
    // Resizer methods
    onMouseDown() {
      this.isResizing = true;
      document.body.style.cursor = "col-resize";
    },
    onMouseMove(e) {
      if (!this.isResizing) return;
      const container = this.$refs.layoutContainer;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      // Relative pos of mouse to container
      const mouseX = e.clientX - rect.left;
      let newPercent = (mouseX / rect.width) * 100;

      if (newPercent > 10 && newPercent < 90) {
        this.splitPercent = newPercent;

        // Adjust terminal size immediately for smoother experience
        if (this.fitAddon) {
          this.fitAddon.fit();
        }
      }
    },
    onMouseUp() {
      this.isResizing = false;
      document.body.style.cursor = "default";
    },
    onBoardChange() {
      // Nothing
    },
    updatePinValue(event, pinName) {
      const rawValue = event.target.value;

      const intValue = parseInt(rawValue, 10);

      if (isNaN(intValue)) {
        this.pinStates[pinName] = 0;
      } else {
        this.pinStates[pinName] = intValue;
      }

      event.target.value = this.pinStates[pinName];

    },
    handleBoardChange() {
      switchBoard(this.selectedBoard);
    },

    //Interrupts
    handleInterruptClick(pinName) {
      const pinNumber = parseInt(pinName.replace(/\D/g, ""));

      if (isNaN(pinNumber)) return;

      // Search in interrupt vector
      const targetPin = BigInt(pinNumber);
      const index = esp32vect.value.findIndex(entry => entry[0] === targetPin);

      if (index !== -1) {
        const [pin, isr, mode] = esp32vect.value[index];
        //Jump to ISR
        var ret1 = crex_findReg("pc");
        if (ret1.match === 0) {
          throw packExecute(
            true,
            "capi_arduino: register pc not found",
            "danger",
            null,
          );
        }
        var pc = BigInt.asIntN(
          32,
          readRegister(ret1.indexComp, ret1.indexElem),
        );
        //Save ra
        var ret2 = crex_findReg("ra");
        if (ret2.match === 0) {
          throw packExecute(
            true,
            "capi_arduino: register ra not found",
            "danger",
            null,
          );
        }
        writeRegister(BigInt(pc), ret2.indexComp, ret2.indexElem);
        writeRegister(BigInt(isr), ret1.indexComp, ret1.indexElem);
        coreEvents.emit("arduino-terminal-write", {
          text: `[INTERRUPT DETECTED] Jumping to ISR at 0x${isr.toString(16)}`,
        });
      }
    },
  },
};
</script>

<style scoped>
/* Terminal side */
.terminal-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(to bottom, #161b22 0%, #0d1117 100%);
  border-radius: 8px;
  overflow: hidden;
}

/* Remove border radius on mobile */
@media (max-width: 768px) {
  .terminal-wrapper {
    border-radius: 0;
  }
}

.terminal-title {
  font-size: 12px;
  font-weight: 600;
  color: #8b949e;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  letter-spacing: 0.5px;
}

.terminal-controls {
  display: flex;
  gap: 6px;
}

.terminal-btn {
  background: transparent;
  border: 1px solid rgba(240, 246, 252, 0.1);
  color: #8b949e;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.terminal-btn:hover {
  background: rgba(110, 118, 129, 0.1);
  border-color: rgba(240, 246, 252, 0.2);
  color: #c9d1d9;
}

.terminal-btn:active {
  background: rgba(110, 118, 129, 0.2);
  transform: scale(0.95);
}

.terminal-icon {
  font-size: 14px;
  line-height: 1;
}

.terminal-container {
  flex: 1;
  padding: 8px;
  background: #0a2c13;
  overflow: hidden;
  position: relative;
}

.terminal-container :deep(.xterm) {
  height: 100%;
  padding: 4px;
}

.terminal-container :deep(.xterm-viewport) {
  background-color: transparent !important;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 148, 158, 0.3) transparent;
}

.terminal-container :deep(.xterm-viewport::-webkit-scrollbar) {
  width: 8px;
}

.terminal-container :deep(.xterm-viewport::-webkit-scrollbar-track) {
  background: transparent;
}

.terminal-container :deep(.xterm-viewport::-webkit-scrollbar-thumb) {
  background-color: rgba(139, 148, 158, 0.3);
  border-radius: 4px;
}

.terminal-container :deep(.xterm-viewport::-webkit-scrollbar-thumb:hover) {
  background-color: rgba(139, 148, 158, 0.5);
}

.terminal-container :deep(.xterm-screen) {
  background-color: transparent !important;
}

/* Smooth cursor animation */
.terminal-container :deep(.xterm-cursor-layer .xterm-cursor) {
  transition: opacity 0.3s ease;
}

/* Better text rendering */
.terminal-container :deep(.xterm-rows) {
  font-feature-settings:
    "liga" 1,
    "calt" 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
/* GPIO side */
.arduino-layout {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 6px;
}

.left-panel {
  /* flex: 1; */
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.right-panel {
  /* flex: 1; */
  min-width: 0;
  border-left: 1px solid #30363d;
  display: flex;
  flex-direction: column;
}

.panel-header {
  font-family: "SF Mono" monospace;
  font-size: 0.8125rem;
  padding: 6px 10px;
  background: color-mix(in srgb, currentColor 10%, transparent);
  font-weight: bold;
}
.board-selector-container {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #020202;
}

.board-selector-inline {
  margin-top: 40px;
  margin-left: 10px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid #444;
  z-index: 10;
}

.board-selector-inline label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.board-dropdown-minimal {
  margin-left: 75px;
  border: none;
  font-weight: bold;
  outline: none;
  cursor: pointer;
}
.mini-reg-list {
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
  overflow-y: auto;
  background-color: #f0eeee !important;
  height: 100%;
}

.reg-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  background: RGBA(
    var(--bs-info-rgb),
    var(--bs-bg-opacity, 1)
  ); /* Un azul sólido para que resalte */
  border-radius: 8px !important;
  color: white;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.reg-chip.mini {
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  position: relative;
}

.reg-id {
  color: #000 !important; /* Color azul para el nombre del pin */
  font-weight: bold;
}

.reg-val {
  font-weight: bold;
  color: #484f58; /* Gris para LOW */
}

.reg-input {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid transparent;
  border-radius: 3px;
  color: #fff;
  width: 25px;
  text-align: right;
  font-size: 0.8rem;
  outline: none;
  padding: 0 2px;
  transition: all 0.2s;
  margin-left: 5px;
}

.reg-input:focus {
  border-color: #4a90e2;
  background: #34669e;
}

.val-active {
  font-weight: bold;
}
.reg-input::-webkit-inner-spin-button,
.reg-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.val-high {
  color: #00ff41 !important; /* Verde para HIGH */
  text-shadow: 0 0 5px rgba(0, 255, 65, 0.4);
}
.resizer {
  width: 6px;
  cursor: col-resize;
  background: #30363d;
  transition: background 0.2s;
  z-index: 10;
}

.resizer:hover,
.resizer:active {
  background: #58a6ff; /* Se ilumina en azul al tocarlo */
}
/* Board */
.board-view-container {
  flex: 1;
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 10px;
}

.svg-wrapper {
  display: flex;
  align-items: center; /* Alinea pines y placa al centro horizontal */
  gap: 15px; /* Espacio entre pines y placa */
  max-width: 100%;
}
.main-board-svg {
  height: auto;
  max-width: 200px;
  transition: width 0.05s linear; /* Suaviza el cambio de tamaño al arrastrar */
  user-select: none;
  flex-shrink: 1; /* Permite que la placa se encoja primero */
}
.pins-column {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0; /* Evita que los pines se aplasten */
}

.pins-column.left {
  left: 10px; /* Cambiado de negativo a positivo relativo al padding */
}

.pins-column.right {
  right: 10px; /* Cambiado de negativo a positivo relativo al padding */
}

.pin-anchor {
  display: flex;
  align-items: center;
}
/* Danger icon */
.chip-wrapper {
  display: flex;
  align-items: center; /* Centra el icono verticalmente con el chip */
  justify-content: flex-start;
  position: relative;
}

.is-interrupt-btn {
  cursor: pointer !important;
  border: 1.5px solid #ff4d4d; /* Un borde sutil rojo */
  box-shadow: 0 0 8px rgba(255, 77, 77, 0.3);
}

.is-interrupt-btn:hover {
  filter: brightness(1.1);
  transform: scale(1.05);
  box-shadow: 0 0 12px rgba(255, 77, 77, 0.5);
}

.is-interrupt-btn:active {
  transform: scale(0.98);
}

/* Evitar que el cursor de texto confunda si el chip es botón */
.is-interrupt-btn .reg-id {
  pointer-events: none;
}

.danger-icon {
  margin-left: 8px; /* Espacio a la derecha del chip */
  font-size: 14px;
  cursor: help;
  user-select: none;
  filter: drop-shadow(0 0 2px rgba(255, 0, 0, 0.5));
}

/* Animación suave para que no aparezca de golpe */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
