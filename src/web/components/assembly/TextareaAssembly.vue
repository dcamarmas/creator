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
  data() {
    return {
      vimActive: false,
      vimCustomKeybinds: [
        // TODO: let the user specify this
        // @rajayonin's config
        { mode: "insert", lhs: "kj", rhs: "<Esc>" },
        { mode: "normal", lhs: "L", rhs: "$" },
        { mode: "visual", lhs: "L", rhs: "$" },
        { mode: "normal", lhs: "H", rhs: "_" },
        { mode: "visual", lhs: "H", rhs: "_" },
      ],
      extensions: [
        // custom highlight on top of the default style
        syntaxHighlighting(
          HighlightStyle.define([
            { tag: tags.keyword, color: "#3300aa" },
            { tag: tags.comment, fontStyle: "italic" },
          ]),
        ),
        syntaxHighlighting(defaultHighlightStyle), // this HAS to be below to be used as fallback
        // fixed height editor
        EditorView.theme({
          "&": { height: "400px" },
          ".cm-scroller": { overflow: "auto" },
        }),
      ],
    }
  },
  setup() {
    const lang = StreamLanguage.define(gas) // GNU Assembler

    return { lang }
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
    /**
     * Loads the user's custom configuration for Vim
     */
    loadVimCustomConfig() {
      for (const { mode, lhs, rhs } of this.vimCustomKeybinds) {
        Vim.map(lhs, rhs, mode)
      }
    },

    /**
     * Removes the user's custom configuration for Vim
     */
    removeVimCustomConfig() {
      for (const { mode, lhs, _ } of this.vimCustomKeybinds) {
        Vim.unmap(lhs, mode)
      }
    },
    toggleVim() {
      if (this.vimActive) {
        // remove extension
        this.extensions.pop()
      } else {
        this.extensions.push(vim()) // add extension
        this.loadVimCustomConfig()
      }

      this.vimActive = !this.vimActive
    },
  },
}
</script>

<template>
  <PopoverShortcuts target="assemblyInfo" :browser="browser" />

  <b-button
    size="sm"
    :pressed="vimActive"
    @click="toggleVim()"
    title="Enable Vim mode"
  >
    <font-awesome-icon icon="fa-brands fa-vimeo-v" /> Vim
  </b-button>

  <br />
  <br />

  <font-awesome-icon icon="circle-info" />&nbsp;
  <span class="h5">Assembly:</span>

  <Codemirror
    v-model="code"
    basic
    placeholder="Assembly code..."
    :lang="lang"
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="4"
    :wrap="true"
    :extensions="extensions"
  />
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
