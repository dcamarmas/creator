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
import { defineComponent } from "vue"

/* Codemirror */
import Codemirror from "vue-codemirror6"
import {
  EditorView,
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  highlightActiveLineGutter,
} from "@codemirror/view"
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
} from "@codemirror/language"
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"
import { searchKeymap } from "@codemirror/search"
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete"
import { tags as t } from "@lezer/highlight"
import { createTheme } from "@uiw/codemirror-themes"
import { yaml } from "@codemirror/lang-yaml"

import { architecture, reset, loadArchitecture } from "@/core/core.mjs"
import { show_notification, storeBackup } from "@/web/utils.mjs"

export default defineComponent({
  props: {
    id: { type: String, required: true },
    arch_code: { type: String, required: true },
    dark: { type: Boolean, required: true },
  },

  components: {
    Codemirror,
  },

  setup() {
    const lang = yaml()

    return { lang }
  },

  computed: {
    architecture_value: {
      // sync w/ App's
      get() {
        return this.arch_code
      },
      set(value: string) {
        ;(this.$root as any).arch_code = value
      },
    },

    extensions() {
      return [
        // modified basicSetup

        // A gutter with code folding markers
        foldGutter(),
        // Replace non-printable characters with placeholders
        highlightSpecialChars(),
        // The undo history
        history(),
        // Replace native cursor/selection with our own
        drawSelection(),
        // Show a drop cursor when dragging over the editor
        dropCursor(),
        // Re-indent lines when typing specific input
        indentOnInput(),
        // Highlight syntax with a default style
        syntaxHighlighting(defaultHighlightStyle),
        // Highlight matching brackets near cursor
        bracketMatching(),
        // Automatically close brackets
        closeBrackets(),
        // Style the current line specially
        highlightActiveLine(),
        // Style the gutter for current line specially
        highlightActiveLineGutter(),
        keymap.of([
          // Closed-brackets aware backspace
          ...closeBracketsKeymap,
          // A large set of basic bindings
          ...defaultKeymap,
          // Search-related keys
          ...searchKeymap,
          // Redo/undo keys
          ...historyKeymap,
          // Code folding bindings
          ...foldKeymap,
        ]),

        // FIXME: dark theme is horrible, because the keys are in blue (#0000cc)
        // and have too little contrast. I tried, but wasn't able to change it
        // with a theme, as I can't find the hightlight group for them.
        // Therefore, light theme it is
        createTheme({
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
          // it _should_ be this hightlight group...
          styles: [{ tag: t.definition(t.propertyName), color: "#ffff00" }],
        }),

        // fixed height editor
        EditorView.theme({
          "&": { height: "650px" },
          ".cm-scroller": { overflow: "auto" },
        }),
      ]
    },
  },

  methods: {
    // save edited architecture
    arch_edit_save() {
      try {
        loadArchitecture(this.architecture_value)
      } catch {
        show_notification(
          "Architecture not edited. Architecture format is incorrect",
          "danger",
        )
        return
      }

      // update architecture data
      ;(this.$root as any).architecture_name = architecture.config.name
      ;(this.$root as any).architecture = architecture

      // reset execution
      ;(this.$root as any).instructions = []
      reset()

      show_notification("Architecture edited correctly", "success")

      storeBackup()
    },
  },
})
</script>

<template>
  <b-modal
    :id="id"
    size="xl"
    title="Edit Architecture"
    ok-title="Save"
    @ok="arch_edit_save"
  >
    <Codemirror
      ref="textarea"
      class="codeArea"
      placeholder="Architecture definition..."
      v-model="architecture_value"
      autofocus
      wrap
      tab
      :tab-size="2"
      :lang="lang"
      :extensions="extensions"
      @ready="
        ({ view }: { view: EditorView }) => {
          view.focus()
        }
      "
    />
  </b-modal>
</template>

<style lang="scss" scoped>
.codeArea {
  border: 1px solid #eee;
  font-size: 0.85em;
}
</style>
