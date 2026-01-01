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
import Codemirror from "vue-codemirror6";
import { type LanguageSupport, StreamLanguage } from "@codemirror/language";
import { gas } from "@codemirror/legacy-modes/mode/gas";
import { EditorView } from "codemirror";
import { tags as t } from "@lezer/highlight";
import { createTheme } from "@uiw/codemirror-themes";

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
});

const creatorDarkTheme = createTheme({
  theme: "dark",
  settings: {
    // Colors aligned with Bootstrap 5 dark mode (gray-900: #212529)
    background: "#212529",
    backgroundImage: "",
    foreground: "#dee2e6",
    caret: "#dee2e6",
    selection: "#495057",
    selectionMatch: "#495057",
    lineHighlight: "#2c3034",
    gutterBorder: "1px solid #343a40",
    gutterBackground: "#1a1d21",
    gutterForeground: "#6c757d",
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
});

export default defineComponent({
  props: {
    os: { type: String, required: true },
    assembly_code: { type: String, required: true },
    height: { type: String, required: true },
    dark: { type: Boolean, required: true },
  },

  components: {
    Codemirror,
  },

  setup() {
    // GNU Assembler
    const lang = StreamLanguage.define(gas) as unknown as LanguageSupport;

    return { lang };
  },

  computed: {
    code: {
      // sync with App's
      get() {
        return this.assembly_code;
      },
      set(value: string) {
        (this.$root as any).assembly_code = value;
      },
    },

    extensions() {
      const extensions = [
        // basicSetup covers most of the required extensions

        // editor theme
        this.dark ? creatorDarkTheme : creatorLightTheme,

        EditorView.theme({
          "&": { height: this.height, width: "100%" },
          ".cm-scroller": { overflow: "auto", height: "100%" },
        }),
      ];

      return extensions;
    },
  },
});
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
