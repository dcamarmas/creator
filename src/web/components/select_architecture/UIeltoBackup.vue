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

import { loadArchitecture } from "@/core/core.mjs"
import { show_notification, formatRelativeDate } from "@/web/utils.mjs"

export default defineComponent({
  props: {
    id: { type: String, required: true },
  },

  emits: ["load-architecture"], // event to signal an architecture has been loaded

  data() {
    return {
      show_modal: localStorage.getItem("backup_timestamp") !== null,

      backup_date: new Date(
        parseInt(localStorage.getItem("backup_timestamp")!, 10),
      ),
      backup_arch_name: localStorage.getItem("backup_arch_name"),
    }
  },

  methods: {
    // Load backup from cache
    load_copy() {
      // Load architecture from cache
      ;(this.$root as any).arch_code = localStorage.getItem("backup_arch") || ""
      loadArchitecture((this.$root as any).arch_code)
      ;(this.$root as any).architecture_name =
        localStorage.getItem("backup_arch_name")

      // Load the last assembly code from cache
      ;(this.$root as any).assembly_code = localStorage.getItem("backup_asm")

      // Refresh UI
      show_notification("The backup has been loaded correctly", "success")

      this.$emit("load-architecture", this.backup_arch_name) // notify arch loaded

      this.show_modal = false
    },

    // Delete backup on cache
    remove_copy() {
      localStorage.removeItem("backup_arch_name")
      localStorage.removeItem("backup_arch")
      localStorage.removeItem("backup_asm")
      localStorage.removeItem("backup_timestamp")

      this.show_modal = false
    },

    formatRelativeDate,
  },
})
</script>

<template>
  <b-modal
    :id="id"
    v-model="show_modal"
    hide-header
    size="sm"
    no-header
    no-footer
    centered
  >
    <h6>
      A <i>{{ backup_arch_name }}</i> backup is available.
    </h6>
    <h6 class="fst-italic">
      {{ formatRelativeDate(backup_date) }}
      <br />
      ({{ backup_date.toDateString() }} &ndash;
      {{ backup_date.toLocaleTimeString() }})
    </h6>

    <b-container fluid align-h="center" class="mx-0 mt-3 px-0">
      <b-row
        cols-xl="2"
        cols-lg="2"
        cols-md="2"
        cols-sm="1"
        cols-xs="1"
        cols="1"
        align-h="center"
      >
        <b-col class="d-grid gap-2">
          <b-button variant="danger" size="sm" @click="remove_copy">
            Discard
          </b-button>
        </b-col>

        <b-col class="d-grid gap-2">
          <b-button variant="primary" size="sm" @click="load_copy">
            Load
          </b-button>
        </b-col>
      </b-row>
    </b-container>
  </b-modal>
</template>
