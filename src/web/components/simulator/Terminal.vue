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
  <b-container fluid class="mx-0 px-0 terminal-wrapper">
    <div ref="terminalContainer" class="terminal-container"></div>
  </b-container>
</template>

<script>
import { Terminal } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import "xterm/css/xterm.css";
import { execution_mode, status } from "@/core/core.mjs";

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
      inputMode: false, // Whether we're waiting for user input
    };
  },

  mounted() {
    this.initTerminal();
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
          fontSize: 14,
          fontFamily:
            '"Fira Code", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
          fontWeight: "400",
          fontWeightBold: "700",
          letterSpacing: 0,
          lineHeight: 1.2,
          theme: {
            background: "#0d1117",
            foreground: "#c9d1d9",
            cursor: "#58a6ff",
            cursorAccent: "#0d1117",
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

    handleInput(data) {
      // Handle special keys
      if (data === "\r") {
        // Enter key
        this.terminal.write("\r\n");
        this.submitInput();
        return;
      }

      if (data === "\u007F") {
        // Backspace
        if (this.inputBuffer.length > 0) {
          this.inputBuffer = this.inputBuffer.slice(0, -1);
          this.terminal.write("\b \b");
        }
        return;
      }

      // Add to buffer and echo to terminal
      this.inputBuffer += data;
      this.terminal.write(data);

      // Update keyboard value in real-time
      this.$root.keyboard = this.inputBuffer;
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
  },
};
</script>

<style scoped>
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
  background: #0d1117;
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
</style>
