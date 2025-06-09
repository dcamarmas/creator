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

<script>
import Codemirror from "vue-codemirror6"
import { EditorView } from "codemirror"
import { json } from "@codemirror/lang-json"

import {
  architecture,
  architecture_hash,
} from "@/core/core.mjs"
import { creator_memory_clear } from "@/core/memory/memoryOperations.mjs"
import { show_notification, loadArchitecture } from "@/web/utils.mjs"
import { clear_instructions } from "@/core/compiler/compiler.mjs"

export default {
  setup() {
    const lang = json()
    // fixed height editor
    const extensions = [
      EditorView.theme({
        "&": { height: "650px" },
        ".cm-scroller": { overflow: "auto" },
      }),
    ]

    return { lang, extensions }
  },
  components: {
    Codemirror,
  },

  props: {
    id: { type: String, required: true },
    arch_code: { type: String, required: true },
    dark: { type: Boolean, required: true },
  },

  computed: {
    architecture_value: {
      // sync w/ App's
      get() {
        return this.arch_code
      },
      set(value) {
        this.$root.arch_code = value
      },
    },
  },

  methods: {
    // save edited architecture
    arch_edit_save() {
      try {
        loadArchitecture(JSON.parse(this.architecture_value))
      } catch {
        show_notification(
          "Architecture not edited. JSON format is incorrect",
          "danger",
        )
        return
      }

      // update architecture data
      this.$root.architecture_name = architecture.arch_conf[0].value
      this.$root.architecture = architecture
      this.$root.architecture_hash = architecture_hash

      // reset execution
      this.$root.instructions = []
      clear_instructions()
      creator_memory_clear()

      show_notification("Architecture edited correctly", "success")
    },

    handleReady({ view, _state }) {
      // focus on editor
      view.focus()
    },
  },
}
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
      minimal
      autofocus
      wrap
      tab
      :dark="dark"
      :tab-size="2"
      :extensions="extensions"
      @ready="handleReady"
    />
    <!-- :lang="this.lang" -->
  </b-modal>
</template>

<style lang="scss" scoped>
.codeArea {
  border: 1px solid #eee;
  font-size: 0.85em;
}
</style>
