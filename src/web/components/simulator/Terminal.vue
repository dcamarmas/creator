<template>
  <b-container fluid class="mx-0 px-0 terminal-wrapper">
    <div ref="terminalContainer" class="terminal-container"></div>
  </b-container>
</template>

<script>
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import 'xterm/css/xterm.css'
import { execution_mode, status } from "@/core/core.mjs"

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
      inputBuffer: '',
      inputMode: false, // Whether we're waiting for user input
    }
  },

  mounted() {
    this.initTerminal()
  },

  beforeUnmount() {
    // Remove window resize listener
    window.removeEventListener('resize', this.handleResize)
    
    // Dispose terminal and its addons
    if (this.terminal) {
      try {
        this.terminal.dispose()
      } catch (error) {
        console.warn('Error disposing terminal:', error)
      }
    }
    
    // Clear references
    this.terminal = null
    this.fitAddon = null
  },

  watch: {
    display(newValue, oldValue) {
      // When display changes, write to terminal
      if (this.terminal && newValue !== oldValue) {
        const diff = newValue.slice(oldValue.length)
        this.terminal.write(diff)
      }
    },
  },

  methods: {
    initTerminal() {
      // Check if container ref is available
      if (!this.$refs.terminalContainer) {
        console.warn('Terminal container not available')
        return
      }

      try {
        // Create terminal instance
        this.terminal = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          theme: {
            background: '#1e1e1e',
            foreground: '#d4d4d4',
          },
          rows: 10,
          cols: 80,
        })

        // Add addons
        this.fitAddon = new FitAddon()
        this.terminal.loadAddon(this.fitAddon)
        this.terminal.loadAddon(new WebLinksAddon())

        // Open terminal in the container
        this.terminal.open(this.$refs.terminalContainer)
        this.fitAddon.fit()

        // Handle input
        this.terminal.onData(data => {
          this.handleInput(data)
        })

        // Handle window resize
        window.addEventListener('resize', this.handleResize)
        
        // Write initial display content if any
        if (this.display) {
          this.terminal.write(this.display)
        }
      } catch (error) {
        console.error('Error initializing terminal:', error)
      }
    },

    handleInput(data) {
      // Handle special keys
      if (data === '\r') { // Enter key
        this.terminal.write('\r\n')
        this.submitInput()
        return
      }
      
      if (data === '\u007F') { // Backspace
        if (this.inputBuffer.length > 0) {
          this.inputBuffer = this.inputBuffer.slice(0, -1)
          this.terminal.write('\b \b')
        }
        return
      }
      
      // Add to buffer and echo to terminal
      this.inputBuffer += data
      this.terminal.write(data)
      
      // Update keyboard value in real-time
      this.$root.keyboard = this.inputBuffer
    },

    submitInput() {
      if (this.inputBuffer !== "") {
        this.$root.keyboard = this.inputBuffer
        status.run_program = execution_mode
        this.inputBuffer = ''
      }
    },

    clearTerminal() {
      if (this.terminal) {
        this.terminal.clear()
        this.inputBuffer = ''
        this.$root.keyboard = ""
        this.$root.display = ""
      }
    },

    handleResize() {
      if (this.fitAddon) {
        this.fitAddon.fit()
      }
    },

    // Method to write output to terminal
    writeOutput(text) {
      if (this.terminal) {
        this.terminal.write(text)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.terminal-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

.terminal-container {
  flex: 1 1 0%;
  padding: 0;
  margin: 0;
  background-color: #1e1e1e;
  width: 100%;
  min-height: 0;
  height: 100%;
  
  :deep(.xterm) {
    height: 100%;
    width: 100%;
    padding: 0;
  }
  
  :deep(.xterm-viewport) {
    overflow-y: auto !important;
  }
}

.keyboardButton {
  margin-top: 5%;
  float: right;
}
</style>