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
  <!-- <b-container fluid class="mx-0 px-0 terminal-wrapper">
    <div ref="terminalContainer" class="terminal-container"></div>
  </b-container> -->
<div ref="layoutContainer" class="arduino-layout" @mousemove="onMouseMove" @mouseup="onMouseUp">
    <div class="left-panel" :style="{ width: splitPercent + '%' }">
      <div class="panel-header">Arduino Function Tracer</div>
      <div ref="terminalContainer" class="terminal-container"></div>
    </div>

    <div class="resizer" @mousedown="onMouseDown"></div>

<div class="right-panel" :style="{ width: (100 - splitPercent) + '%' }">
  <div class="panel-header">Hardware View</div>
  
  <div class="board-view-container">
    <div class="svg-wrapper">
      <img src="../../../../../public/maker/boards/esp32c3devkit2.svg" class="main-board-svg" />
      
      <div class="pins-column left">
        <div v-for="(val, index) in digitalPins.slice(0, 8)" :key="'L'+index" class="pin-anchor">
          <div class="reg-chip mini">
            <span class="reg-id">D{{ index }}</span>
            <span class="reg-val" :class="{ 'val-high': val }">{{ val ? 'HI' : 'LO' }}</span>
          </div>
          <div class="connector-line"></div>
        </div>
      </div>

      <div class="pins-column right">
        <div v-for="(val, index) in digitalPins.slice(8, 14)" :key="'R'+index" class="pin-anchor">
          <div class="connector-line"></div>
          <div class="reg-chip mini">
            <span class="reg-id">D{{ index + 8 }}</span>
            <span class="reg-val" :class="{ 'val-high': val }">{{ val ? 'HI' : 'LO' }}</span>
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


export default {
  props: {
    display: { type: String, required: true },
    keyboard: { type: String, required: true },
    enter: [Boolean, null],
  },

  data() {
    return {
      terminal: null,
      fitAddon: null,
      inputBuffer: "",
      inputMode: false,
      digitalPins: new Array(14).fill(false),
      splitPercent: 50, 
      isResizing: false,
    };
  },

  mounted() {
    this.initTerminal();
    coreEvents.on("arduino-terminal-write", (event) => {
      this.writeOutput(event.text);
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
        this.terminal.write(text);
      }
    },
    // Resizer methods
    onMouseDown() {
    this.isResizing = true;
    document.body.style.cursor = 'col-resize';
  },
  onMouseMove(e) {
      if (!this.isResizing) return;
      const container = this.$refs.layoutContainer;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      
      // Calculamos la posición del ratón relativa al inicio del contenedor
      const mouseX = e.clientX - rect.left;
      let newPercent = (mouseX / rect.width) * 100;

      // Límites de seguridad (10% a 90%)
      if (newPercent > 10 && newPercent < 90) {
        this.splitPercent = newPercent;
        
        // Forzamos a la terminal a ajustarse al nuevo ancho
        if (this.fitAddon) {
          this.fitAddon.fit();
        }
      }
  },
  onMouseUp() {
    this.isResizing = false;
    document.body.style.cursor = 'default';
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
  color: #000000;
  padding: 6px 10px;
  background: color-mix(in srgb, currentColor 40%, transparent);
  font-weight: bold;
  
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
  background: RGBA(var(--bs-info-rgb), var(--bs-bg-opacity, 1)) !important; /* Un azul sólido para que resalte */
  border-radius: 8px !important;
  color: white;
  font-family: "SF Mono", monospace;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.reg-id {
  color: #000 !important; /* Color azul para el nombre del pin */
  font-weight: bold;
}

.reg-val {
  font-weight: bold;
  color: #484f58; /* Gris para LOW */
}

.val-high {
  color: #00FF41 !important; /* Verde para HIGH */
  text-shadow: 0 0 5px rgba(0, 255, 65, 0.4);
}
.resizer {
  width: 6px;
  cursor: col-resize;
  background: #30363d;
  transition: background 0.2s;
  z-index: 10;
}

.resizer:hover, .resizer:active {
  background: #58a6ff; /* Se ilumina en azul al tocarlo */
}
/* Board */
.board-view-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center; /* Centra verticalmente */
  /* background-color: #1c1c1c; */
  overflow: hidden; /* Evita scrolls innecesarios */
  padding: 20px;
  position: relative;
}

/* El envoltorio que mantiene los pines y la placa juntos */
.svg-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 90%; /* Evita que toque los bordes del panel */
  max-height: 90%;
}

/* La placa SVG */
.main-board-svg {
  display: block;
  width: auto;      /* Cambiado de 100% a auto */
  max-width: 500px; /* Ajusta este valor al tamaño que desees para la placa */
  height: auto;
  user-select: none;
  
}
.pins-column {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 5;
}

.pins-column.left {
  left: -100px; /* Ajusta según la posición de los pads en tu SVG */
}

.pins-column.right {
  right: -100px; /* Ajusta según la posición de los pads en tu SVG */
}

.pin-anchor {
  display: flex;
  align-items: center;
}

</style>
