/**
 * Custom Monaco Editor Themes for CREATOR
 * 
 * These themes are designed to match the original CodeMirror themes
 * created by @joseaverde
 */

import * as monaco from "monaco-editor"

export const creatorLightTheme: monaco.editor.IStandaloneThemeData = {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "586e75", fontStyle: "italic" },
    { token: "keyword.directive", foreground: "2aa198", fontStyle: "bold" },
    { token: "keyword", foreground: "b58900", fontStyle: "bold" },
    { token: "string", foreground: "d33682", fontStyle: "bold" },
    { token: "string.escape", foreground: "d33682", fontStyle: "bold" },
    { token: "number", foreground: "d33682" },
    { token: "number.hex", foreground: "d33682" },
    { token: "number.binary", foreground: "d33682" },
    { token: "variable.predefined", foreground: "2aa198", fontStyle: "bold" },
    { token: "type.identifier", foreground: "cb4b16", fontStyle: "bold" },
    { token: "identifier", foreground: "202020" },
    { token: "operator", foreground: "b58900", fontStyle: "bold" },
  ],
  colors: {
    "editor.background": "#ffffff",
    "editor.foreground": "#202020",
    "editorCursor.foreground": "#222222",
    "editor.lineHighlightBackground": "#8a91991a",
    "editor.selectionBackground": "#33333340",
    "editorLineNumber.foreground": "#6c6c6c",
    "editorLineNumber.activeForeground": "#202020",
    "editorGutter.background": "#f5f5f5",
    "editorIndentGuide.background": "#33333310",
    "editorIndentGuide.activeBackground": "#33333320",
  },
}

export const creatorDarkTheme: monaco.editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "6dceeb", fontStyle: "italic" },
    { token: "keyword.directive", foreground: "bdb76b", fontStyle: "bold" },
    { token: "keyword", foreground: "f0e68c", fontStyle: "bold" },
    { token: "string", foreground: "ffa0a0", fontStyle: "bold" },
    { token: "string.escape", foreground: "ffa0a0", fontStyle: "bold" },
    { token: "number", foreground: "ffa0a0" },
    { token: "number.hex", foreground: "ffa0a0" },
    { token: "number.binary", foreground: "ffa0a0" },
    { token: "variable.predefined", foreground: "bdb76b", fontStyle: "bold" },
    { token: "type.identifier", foreground: "ffde9b", fontStyle: "bold" },
    { token: "identifier", foreground: "ffffff" },
    { token: "operator", foreground: "f0e68c", fontStyle: "bold" },
  ],
  colors: {
    "editor.background": "#333333",
    "editor.foreground": "#ffffff",
    "editorCursor.foreground": "#f0f0f0",
    "editor.lineHighlightBackground": "#f0f0f020",
    "editor.selectionBackground": "#f0f0f040",
    "editorLineNumber.foreground": "#f0f0f0",
    "editorLineNumber.activeForeground": "#ffffff",
    "editorGutter.background": "#202020",
    "editorIndentGuide.background": "#ffffff10",
    "editorIndentGuide.activeBackground": "#ffffff20",
  },
}

/**
 * Register custom themes with Monaco Editor
 */
export function registerCreatorThemes() {
  monaco.editor.defineTheme("creator-light", creatorLightTheme)
  monaco.editor.defineTheme("creator-dark", creatorDarkTheme)
}
