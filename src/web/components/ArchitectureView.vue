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

import { architecture } from "@/core/core.mjs"

import UIeltoToolbar from "./general/UIeltoToolbar.vue"
import EditArchitecture from "./architecture/EditArchitecture.vue"
import DownloadPopup from "./general/DownloadModal.vue"
import ArchConf from "./architecture/configuration/ArchConf.vue"
import MemoryLayout from "./architecture/memory_layout/MemoryLayout.vue"
import RegisterFileArch from "./architecture/register_file/RegisterFileArch.vue"
import Instructions from "./architecture/instructions/Instructions.vue"
import Directives from "./architecture/directives/Directives.vue"
import Pseudoinstructions from "./architecture/pseudoinstructions/Pseudoinstructions.vue"

export default defineComponent({
  props: {
    browser: { type: String, required: true },
    os: { type: String, required: true },
    arch_available: Array as PropType<AvailableArch[]>,
    architecture_name: String,
    dark: { type: Boolean, required: true },
    arch_code: { type: String, required: true },
  },
  components: {
    UIeltoToolbar,
    EditArchitecture,
    DownloadPopup,
    ArchConf,
    MemoryLayout,
    RegisterFileArch,
    Instructions,
    Directives,
    Pseudoinstructions,
  },
  data() {
    return {
      architecture,
    }
  },
})
</script>

<template>
  <b-container fluid align-h="center" id="architecture_menu">
    <!-- Navbar -->
    <UIeltoToolbar
      id="navbar_architecture"
      components="btn_assembly,btn_simulator|btn_edit_architecture,btn_save_architecture||btn_configuration,btn_information"
      :browser="browser"
      :os="os"
      :dark="dark"
      :arch_available="arch_available"
    />

    <!-- Edit architecture modal -->
    <EditArchitecture
      id="edit_architecture"
      :arch_code="arch_code"
      :dark="dark"
    />

    <!-- Download architecture modal -->

    <DownloadPopup
      id="save_architecture"
      type="architecture"
      title="Download Architecture"
      extension=".yml"
      :fileData="arch_code"
      default-filename="architecture"
    />

    <!-- Architecture information -->
    <b-tabs lazy class="menu" id="view_components">
      <!-- Architecture configuration -->
      <b-tab title="Architecture Info" active>
        <ArchConf :conf="architecture.config" />
      </b-tab>

      <!-- Memory layout -->
      <b-tab title="Memory Layout">
        <MemoryLayout :memory_layout="architecture.memory_layout" />
      </b-tab>

      <!-- Register File -->
      <b-tab title="Register File">
        <RegisterFileArch :register_file="architecture.components" />
      </b-tab>

      <!-- Instruction definition -->
      <b-tab title="Instructions">
        <Instructions :instructions="architecture.instructions" />
      </b-tab>

      <!-- Pseudoinstruction definition -->
      <b-tab title="Pseudoinstructions">
        <Pseudoinstructions
          :pseudoinstructions="architecture.pseudoinstructions"
        />
      </b-tab>

      <!-- Directives definition -->
      <b-tab title="Directives">
        <Directives :directives="architecture.directives" />
      </b-tab>
    </b-tabs>
  </b-container>
</template>
