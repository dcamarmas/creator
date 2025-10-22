<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
                    Alejandro Calderon Mateos, Luis Daniel Casais Mezquida

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
import { defineComponent, type PropType } from "vue"
import Codemirror from "vue-codemirror6"
import { vim, Vim } from "@replit/codemirror-vim"
import { type LanguageSupport, StreamLanguage } from "@codemirror/language"
import { gas } from "@codemirror/legacy-modes/mode/gas"
import { EditorView } from "codemirror"
import { keymap, type Command } from "@codemirror/view"
import { tags as t } from "@lezer/highlight"
import { createTheme } from "@uiw/codemirror-themes"

import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { assembly_compile, reset, status } from "@/core/core.mjs"
import { resetStats } from "@/core/executor/stats.mts"
import { assembleCreator } from "@/core/assembler/creatorAssembler/web/creatorAssembler.mjs"

// themes designed by @joseaverde
const creatorLightTheme = createTheme({
  theme: "light",
  settings: {
    background: "#ffffff",
    backgroundImage: "",
    foreground: "#202020",
    caret: "#222222",
    selection: "#33333340",
    selectionMatch: "#33333340",
    lineHighlight: "#8a91991a",
    gutterBorder: "1px solid #33333310",
    gutterBackground: "#f5f5f5",
    gutterForeground: "#6c6c6c",
  },
  styles: [
    { tag: t.comment, color: "#586e75", fontStyle: "italic" },
    { tag: t.variableName, color: "#2aa198", fontWeight: "bold" },
    {
      tag: [t.string, t.special(t.brace)],
      color: "#d33682",
      fontStyle: "bold",
    },
    { tag: t.number, color: "#d33682" },
    { tag: t.bool, color: "#d33682" },
    { tag: t.null, color: "#d33682" },
    { tag: t.keyword, color: "#b58900", fontWeight: "bold" },
    { tag: t.operator, color: "#b58900", fontWeight: "bold" },
    { tag: t.className, color: "#cb4b16", fontWeight: "bold" },
    { tag: t.definition(t.typeName), color: "#5c6166" },
    { tag: t.typeName, color: "#2aa198" },
    { tag: t.angleBracket, color: "#89fb98" },
    { tag: t.tagName, color: "#b58900", fontWeight: "bold" },
    { tag: t.attributeName, color: "#cb4b16" },
  ],
})

const creatorDarkTheme = createTheme({
  theme: "dark",
  settings: {
    background: "#333333",
    backgroundImage: "",
    foreground: "#ffffff",
    caret: "#f0f0f0",
    selection: "#f0f0f040",
    selectionMatch: "#f0f0f040",
    lineHighlight: "#f0f0f020",
    gutterBorder: "1px solid #ffffff10",
    gutterBackground: "#202020",
    gutterForeground: "#f0f0f0",
  },
  styles: [
    { tag: t.comment, color: "#6dceeb", fontStyle: "italic" },
    { tag: t.variableName, color: "#bdb76b", fontWeight: "bold" }, // directives (.text, etc)
    {
      tag: [t.string, t.special(t.brace)],
      color: "#ffa0a0",
      fontStyle: "bold",
    },
    { tag: t.number, color: "#ffa0a0" },
    { tag: t.bool, color: "#ffa0a0" },
    { tag: t.null, color: "#ffa0a0" },
    { tag: t.keyword, color: "#f0e68c", fontWeight: "bold" },
    { tag: t.operator, color: "#f0e68c", fontWeight: "bold" },
    { tag: t.className, color: "#ffde9b", fontWeight: "bold" },
    { tag: t.definition(t.typeName), color: "#5c6166" },
    { tag: t.typeName, color: "#bdb76b" },
    { tag: t.angleBracket, color: "#89fb98" },
    { tag: t.tagName, color: "#f0e68c", fontWeight: "bold" },
    { tag: t.attributeName, color: "#ffde9b" },
  ],
})

/**
 * Handler for the Ctrl-s keydown event that disables its default action
 */
const ctrlSHandler = (e: KeyboardEvent) => {
  if (
    e.key === "s" &&
    (navigator.userAgent.includes("Mac") ? e.metaKey : e.ctrlKey)
  ) {
    e.preventDefault()
  }
}

export default defineComponent({
  props: {
    os: { type: String, required: true },
    assembly_code: { type: String, required: true },
    vim_mode: { type: Boolean, required: true },
    vim_custom_keybinds: {
      type: Array as PropType<VimKeybind[]>,
      required: true,
    },
    height: { type: String, required: true },
    dark: { type: Boolean, required: true },
  },

  components: {
    Codemirror,
  },

  // we want to use Ctrl-s to assemble, so we disable its default action when
  // mounting the component and re-enable it when unmounting
  mounted() {
    document.addEventListener("keydown", ctrlSHandler, false)
  },

  unmounted() {
    document.removeEventListener("keydown", ctrlSHandler)
  },

  setup() {
    // GNU Assembler
    const lang = StreamLanguage.define(gas) as unknown as LanguageSupport

    return { lang }
  },

  computed: {
    vimActive: {
      get() {
        return this.vim_mode
      },
      set(value: boolean) {
        ;(this.$root as any).vim_mode = value

        localStorage.setItem("conf_vim_mode", value.toString())

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
      set(value: string) {
        ;(this.$root as any).assembly_code = value
      },
    },

    shouldAutoFocus() {
      return this.os !== 'mobile'
    },

    extensions() {
      const extensions = [
        // basicSetup covers most of the required extensions

        // editor theme
        this.dark ? creatorDarkTheme : creatorLightTheme,

        // fixed height editor — make the editor fill the available width/height
        EditorView.theme({
          "&": { height: this.height, width: "100%" },
          ".cm-scroller": { overflow: "auto", height: "100%" },
        }),

        // Ctrl-s to assemble
        keymap.of([
          { key: "Ctrl-s", mac: "Cmd-s", run: this.assemble as Command },
        ]),
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
    async assemble() {
      // Reset simulator
      this.$root.keyboard = ""
      this.$root.display = ""
      this.$root.enter = null
      reset()

      // Reset stats
      resetStats()
      status.executedInstructions = 0
      status.clkCycles = 0

      // Assemble the code
      const ret = await assembly_compile(this.$root.assembly_code, assembleCreator)

      // Handle results
      if (ret.status !== "ok") {
        this.$root.assemblyError = ret.msg
        // Trigger error modal - emit event to show error
        this.$root.$emit("show-assembly-error")
      } else {
        // Compilation successful
        this.$root.creator_mode = "simulator"
      }

      return true // Return true for keymap handler
    },
  },
})
</script>

<template>
  <Codemirror
    ref="textarea"
    class="codeArea"
    placeholder="Assembly code..."
    v-model="code"
    basic
    wrap
    tab
    :tab-size="4"
    :lang="lang"
    :extensions="extensions"
    @ready="
      ({ view }: { view: EditorView }) => {
        // Only auto-focus on desktop. On mobile it can be annoying (keyboard pops up)
        if (shouldAutoFocus) {
          view.focus()
        }
      }
    "
  />
</template>

<style lang="scss" scoped>
.codeArea {
  font-size: 0.85em;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  display: block;
}

.codeArea :deep(.cm-scroller) {
  padding: 0;
  overflow: auto;
  width: 100%;
  box-sizing: border-box;
}

.codeArea :deep(.cm-content) {
  padding: 0;
}

.codeArea :deep(.cm-editor.cm-focused) {
  outline: none;
}
</style>