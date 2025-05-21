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
import { hide_loading, show_loading, show_notification } from "@/web/utils.mjs"
import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { load_arch_select } from "@/core/core.mjs"
import { clear_instructions } from "@/core/compiler/compiler.mjs"
import { creator_memory_clear } from "@/core/memory/memoryOperations.mjs"

import new_arch from "/architecture/new_arch.json"

export default {
  methods: {
    //Create a new architecture
    new_arch() {
      show_loading()

      //Read architecture JSON
      this.load_arch_select_aux(new_arch)

      //Refresh UI
      hide_loading()
      show_notification("New Architecture has been loaded correctly", "success")

      // Google Analytics
      creator_ga(
        "architecture",
        "architecture.loading",
        "architectures.loading.new_architecture",
      )
    },

    //Load architecture in CREATOR
    load_arch_select_aux(cfg) {
      //Load architecture
      load_arch_select(cfg)

      architecture_json = "new_arch"
      uielto_preload_architecture.data.architecture_name =
        architecture.arch_conf[0].value
      app._data.architecture = architecture
      app._data.architecture_name = architecture.arch_conf[0].value
      app._data.architecture_guide = ""
      app._data.architecture_hash = architecture_hash

      // Reset execution
      clear_instructions()
      creator_memory_clear()

      //Refresh UI
      uielto_toolbar_btngroup.methods.change_UI_mode("simulator")
      uielto_data_view_selector.methods.change_data_view("int_registers")
      app._data.render++ //Forces vue to reload a component, similar to $forceUpdate()
    },
  },
}
</script>

<template>
  <b-card no-body class="overflow-hidden arch_card architectureCard">
    <b-row no-gutters @click="new_arch">
      <b-col sm="12" class="center w-100 my-2">
        <b-card-img
          src="@/web/assets/img/new_icon.png"
          alt="new icon"
          thumbnail
          fluid
          class="w-75 rounded-0 architectureImg"
        />
      </b-col>

      <b-col sm="12">
        <b-card-body title="New Architecture" title-tag="h2">
          <b-card-text class="justify">
            Allows you to define an architecture from scratch.
          </b-card-text>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>
</template>
