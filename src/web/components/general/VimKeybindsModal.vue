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

import { Vim } from "@replit/codemirror-vim"

export default defineComponent({
  props: {
    id: { type: String, required: true },
    title: { type: String, required: true },
    selected_vim_keybind: { type: [Number, null], required: true },
    vim_custom_keybinds: {
      type: Array as PropType<VimKeybind[]>,
      required: true,
    },
    type: { type: String, required: true }, // 'new' or 'edit'
  },

  emits: [
    // parent variables that will be updated
    "update:vim_custom_keybinds",
  ],

  data() {
    return {
      newVimKeybind: {
        mode: "normal",
        lhs: "",
        rhs: "",
      },
    }
  },

  computed: {
    // placeholder for editing a vim keybind
    // we create a copy bc we don't want to sync the value automatically, we
    // want to wait for confirmation from the user to execute
    // modifySelectedVimKeybind
    modifiedVimKeybind() {
      // copy selected keybind
      return { ...this.vim_custom_keybinds_value[this.selected_vim_keybind!]! }
    },

    keybind() {
      return this.type === "new" ? this.newVimKeybind : this.modifiedVimKeybind
    },

    // modifying this will modify the parent
    vim_custom_keybinds_value: {
      get() {
        return this.vim_custom_keybinds
      },
      set(value: VimKeybind[]) {
        this.$emit("update:vim_custom_keybinds", value)
      },
    },
  },

  methods: {
    modifySelectedVimKeybind(mode: string, lhs: string, rhs: string) {
      Vim.unmap(
        this.vim_custom_keybinds_value[this.selected_vim_keybind!]!.lhs,
        this.vim_custom_keybinds_value[this.selected_vim_keybind!]!.mode,
      )
      Vim.map(lhs, rhs, mode)

      this.vim_custom_keybinds_value.splice(
        this.selected_vim_keybind!,
        1,
        { ...this.modifiedVimKeybind }, // copy
      )
    },

    addVimKeybind(mode: string, lhs: string, rhs: string) {
      Vim.map(lhs, rhs, mode)

      this.vim_custom_keybinds_value.push({
        mode,
        lhs,
        rhs,
      })

      this.resetNewKeybind()
    },

    resetNewKeybind() {
      this.newVimKeybind = {
        mode: "normal",
        lhs: "",
        rhs: "",
      }
    },
  },
})
</script>

<template>
  <b-modal
    :id="id"
    centered
    :title="title"
    @ok="
      (type === 'new' ? addVimKeybind : modifySelectedVimKeybind)(
        keybind.mode,
        keybind.lhs,
        keybind.rhs,
      )
    "
    @cancel="resetNewKeybind"
  >
    <b-form class="d-flex flex-row align-items-center flex-wrap">
      <!-- v-if="type === 'new' || selected_vim_keybind !== null" -->
      <div class="col-4">
        <b-form-select
          class="col-lg-2"
          v-model="keybind.mode"
          :options="[
            { text: 'NORMAL', value: 'normal' },
            { text: 'INSERT', value: 'insert' },
            { text: 'VISUAL', value: 'visual' },
          ]"
        />
      </div>
      <label class="col-form-label visually-hidden" for="inline-form-input-lhs">
        lhs
      </label>
      <div class="col-4">
        <b-form-floating-label label="LHS" label-for="vim-form-input-lhs">
          <b-form-input
            class="font-monospace"
            v-model="keybind.lhs"
            id="vim-form-input-lhs"
          />
        </b-form-floating-label>
      </div>

      <div class="col-4">
        <b-form-floating-label label="RHS" label-for="vim-form-input-rhs">
          <b-form-input
            class="font-monospace"
            v-model="keybind.rhs"
            id="vim-form-input-rhs"
          />
        </b-form-floating-label>
      </div>
    </b-form>
  </b-modal>
</template>
