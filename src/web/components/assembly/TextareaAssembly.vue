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
import Codemirror from "vue-codemirror6"
import { vim, Vim } from "@replit/codemirror-vim"
import {
  StreamLanguage,
  HighlightStyle,
  syntaxHighlighting,
  defaultHighlightStyle,
} from "@codemirror/language"
import { gas } from "@codemirror/legacy-modes/mode/gas"
import { tags } from "@lezer/highlight"
import { EditorView } from "codemirror"

import { creator_ga } from "@/core/utils/creator_ga.mjs"

import PopoverShortcuts from "./PopoverShortcuts.vue"

export default {
  props: {
    browser: { type: String, required: true },
    assembly_code: { type: String, required: true },
    vim_mode: { type: Boolean, required: true },
    vim_custom_keybinds: { type: Array, required: true },
  },

  components: {
    PopoverShortcuts,
    Codemirror,
  },

  setup() {
    const lang = StreamLanguage.define(gas) // GNU Assembler

    return { lang }
  },

  mounted() {
    this.syncVim(this.vim_mode)

    // this.$refs.textarea.editor.focus()
  },

  computed: {
    vimActive: {
      get() {
        return this.vim_mode
      },
      set(value) {
        this.$root.vim_mode = value
        this.syncVim(value)

        localStorage.setItem("conf_vim_mode", value)

        // Google Analytics
        creator_ga(
          "configuration",
          "configuration.vim_mode",
          "configuration.vim_mode." + value,
        )
      },
    },
    code: {
      // sync with App's
      get() {
        return this.assembly_code
      },
      set(value) {
        this.$root.assembly_code = value
      },
    },

    extensions() {
      const extensions = [
        // basicSetup covers most of the required extensions

        // fixed height editor
        EditorView.theme({
          "&": { height: "650px" },
          ".cm-scroller": { overflow: "auto" },
        }),
      ]

      // vim mode
      if (this.vimActive) {
        extensions.push(vim()) // add extension

        // load custom keybinds
        for (const { mode, lhs, rhs } of this.vim_custom_keybinds) {
          Vim.map(lhs, rhs, mode)
        }

        // map Vim commands to functions
        Vim.defineEx("write", "w", () => this.assemble())
        Vim.defineEx("xit", "x", () => this.assemble())
      }

      return extensions
    },
  },
  methods: {
    /**
     * Loads the user's custom configuration for Vim
     */
    loadVimCustomConfig() {
      for (const { mode, lhs, rhs } of this.vim_custom_keybinds) {
        Vim.map(lhs, rhs, mode)
      }
    },

    assemble() {
      // I know, this line also breaks my heart, and I wrote it
      this.$root.$refs.assemblyView.$refs.toolbar.$refs.btngroup1
        .at(0)
        .assembly_compiler()
    },

    syncVim(value) {
      if (value) {
        this.extensions.push(vim()) // add extension
        this.loadVimCustomConfig()

        // map Vim commands to functions
        Vim.defineEx("write", "w", () => this.assemble())
        Vim.defineEx("xit", "x", () => this.assemble())
      } else {
        // remove extension
        this.extensions.pop()
      }
    },

    toggleVim() {
      this.vimActive = !this.vimActive
    },

    /**
     * Codemirror callback for when component is ready
     */
    handleReady({ view, _state }) {
      // focus on editor
      view.focus()
    },
  },
}
</script>

<template>
  <PopoverShortcuts
    target="assemblyInfo"
    :vim_mode="vimActive"
    :browser="browser"
  />

  <b-button
    class="actionsGroup"
    variant="outline-secondary"
    size="sm"
    :pressed="vimActive"
    @click="toggleVim()"
    title="Enable Vim mode"
  >
    <font-awesome-icon icon="fa-brands fa-vimeo-v" /> Vim
  </b-button>

  <br />
  <br />

  <font-awesome-icon id="assemblyInfo" icon="circle-info" />&nbsp;
  <span class="h5">Assembly:</span>

  <Codemirror
    ref="textarea"
    class="codeArea"
    v-model="code"
    basic
    placeholder="Assembly code..."
    @ready="handleReady"
    :lang="lang"
    :autofocus="true"
    :tab="true"
    :tab-size="4"
    :wrap="true"
    :extensions="extensions"
  />
</template>

<style lang="scss" scoped>
.codeArea {
  border: 1px solid #eee;
  font-size: 0.85em;
}
</style>
