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

<script>
import { ref } from "vue"
import Codemirror from "vue-codemirror6"
import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  crosshairCursor,
  lineNumbers,
  highlightActiveLineGutter,
} from "@codemirror/view"
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  StreamLanguage,
} from "@codemirror/language"
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import {
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete"
import { vim, Vim } from "@replit/codemirror-vim"
import { gas } from "@codemirror/legacy-modes/mode/gas"

import PopoverShortcuts from "./PopoverShortcuts.vue"

export default {
  props: {
    browser: { type: String, required: true },
    assembly_code: { type: String, required: true },
  },
  components: {
    PopoverShortcuts,
    Codemirror,
  },
  // eslint-disable-next-line max-lines-per-function
  data() {
    // const vimMode = new Compartment()
    return {
      vimActive: false,
      luisdaMode: false,
      lang: StreamLanguage.define(gas), // doesn't work for some GOD DAMMED REASON
      extensions: [
        // A line number gutter
        lineNumbers(),
        // // A gutter with code folding markers
        // foldGutter(),
        // Replace non-printable characters with placeholders
        highlightSpecialChars(),
        // The undo history
        history(),
        // Replace native cursor/selection with our own
        drawSelection(),
        // Show a drop cursor when dragging over the editor
        dropCursor(),
        // // Allow multiple cursors/selections
        // EditorState.allowMultipleSelections.of(true),
        // Re-indent lines when typing specific input
        indentOnInput(),
        // Highlight syntax with a default style
        syntaxHighlighting(defaultHighlightStyle),
        // Highlight matching brackets near cursor
        bracketMatching(),
        // Automatically close brackets
        closeBrackets(),
        // // Load the autocompletion system
        // autocompletion(),
        // // Allow alt-drag to select rectangular regions
        // rectangularSelection(),
        // Change the cursor to a crosshair when holding alt
        crosshairCursor(),
        // Style the current line specially
        highlightActiveLine(),
        // Style the gutter for current line specially
        highlightActiveLineGutter(),
        // Highlight text that matches the selected text
        highlightSelectionMatches(),
        keymap.of([
          // Closed-brackets aware backspace
          ...closeBracketsKeymap,
          // A large set of basic bindings
          ...defaultKeymap,
          // Search-related keys
          ...searchKeymap,
          // Redo/undo keys
          ...historyKeymap,
          // indent with tab
          // indentWithTab,
        ]),
        // javascript({ typescript: false }),
      ],
    }
  },
  computed: {
    code: {
      // sync with App's
      get() {
        return this.assembly_code
      },
      set(value) {
        this.$root.assembly_code = value
      },
    },
  },
  methods: {
    toggleVim() {
      if (this.vimActive) {
        // remove extension
        this.extensions.pop()
      } else {
        this.extensions.push(vim()) // add extension
      }

      // this.vimActive = !this.vimActive
    },
    toggleLuisdaMode() {
      // @rajayonin's custom keybindings
      if (!this.luisdaMode) {
        Vim.map("kj", "<Esc>", "insert")
        Vim.map("L", "$", "normal")
        Vim.map("L", "$", "visual")
        Vim.map("H", "_", "normal")
        Vim.map("H", "_", "visual")
      } else {
        // reset keybindings
        Vim.map("kj", "kj", "insert")
        Vim.map("L", "L", "normal")
        Vim.map("L", "L", "visual")
        Vim.map("H", "H", "normal")
        Vim.map("H", "H", "visual")
      }

      this.luisdaMode = !this.luisdaMode
    },
  },
}
</script>

<template>
  <div>
    <b-button
      v-model:pressed="vimActive"
      @click="toggleVim()"
      title="Enable Vim mode"
    >
      <font-awesome-icon icon="fa-brands fa-vimeo-v" /> Vim
    </b-button>
    <b-button
      @click="toggleLuisdaMode()"
      title="Enable Luisda Vim mode"
      v-if="vimActive"
    >
      <font-awesome-icon icon="fa-solid fa-poo-storm" />
    </b-button>

    <br />

    <span id="assemblyInfo" class="fas fa-info-circle"></span>
    <span class="h5">Assembly:</span>

    <PopoverShortcuts target="assemblyInfo" :browser="browser" />

    <!-- <textarea
      id="textarea_assembly"
      rows="14"
      class="code-scroll-y d-none"
      title="Asembly Code"
    ></textarea> -->
    <Codemirror
      v-model="code"
      placeholder="Assembly code..."
      :style="{ height: '400px' }"
      :autofocus="true"
      :tab="true"
      :tab-size="4"
      :wrap="true"
      :extensions="extensions"
    />
  </div>
</template>

<style lang="scss" scoped>
.CodeMirror {
  border: 1px solid #eee;
  height: auto;
  font-size: 0.85em;
}

.code-scroll-y {
  display: block;
  max-height: 90vh;
  overflow-y: auto;
  -ms-overflow-style: -ms-autohiding-scrollbar;
}
</style>
