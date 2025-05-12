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
import UIeltoToolbar from "./general/UIeltoToolbar.vue"
import EditArchitecture from "./architecture/EditArchitecture.vue"
import ArchConf from "./architecture/configuration/ArchConf.vue"

export default {
  props: {
    browser: String,
    os: { type: String, required: true },
    arch_available: Array,
    architecture_name: String,
  },
  components: {
    UIeltoToolbar,
    EditArchitecture,
    ArchConf,
  },
  data() {
    return {
      // arch_code: JSON.stringify(register_value_serialize(cfg), null, 2),
    }
  },
}
</script>

<template>
  <b-container fluid align-h="center" id="architecture_menu">
    <b-row>
      <b-col>
        <!-- Navbar -->
        <UIeltoToolbar
          id="navbar_architecture"
          components="btn_assembly,btn_simulator|btn_edit_architecture,btn_save_architecture||btn_configuration,btn_information"
          :browser="browser"
          :os="os"
          :arch_available="arch_available"
        />

        <!-- Architecture navbar modals -->

        <!-- Edit architecture modal -->
        <!-- <EditArchitecture id="edit_architecture" :arch_code="arch_code" /> -->

        <!-- Save architecture modal -->
        <!-- <SaveArchitecture id="save_architecture" /> -->

        <!-- Architecture information -->
        <b-container fluid align-h="center" class="mx-0 px-0">
          <b-row>
            <b-col class="menu" id="view_components">
              <b-tabs>
                <!-- Architecture configuration -->
                <!-- <b-tab title="Architecture Info" active>
                  <ArchConf :arch_conf="architecture.arch_conf" />
                </b-tab> -->

                <!-- Memory layout -->
                <!-- <b-tab title="Memory Layout">
                  <MemoryLayout :memory_layout="architecture.memory_layout" />
                </b-tab> -->

                <!-- Register File -->
                <!-- <b-tab title="Register File">
                  <RegisterFileArch :register_file="architecture.components" />
                </b-tab> -->

                <!-- Instruction definition -->
                <!-- <b-tab title="Instructions">
                  <Instructions :instructions="architecture.instructions" /> -->

                <!-- Instructions modals -->

                <!-- Intruction fields-->
                <!-- <InstructionFields
                    id="fields_instructions"
                    :title="modal_field_instruction.title"
                    :index="modal_field_instruction.index"
                    :instruction="modal_field_instruction.instruction"
                  />
                </b-tab> -->

                <!-- Pseudoinstruction definition -->
                <!-- <b-tab title="Pseudoinstructions">
                  <Pseudoinstructions
                    :pseudoinstructions="architecture.pseudoinstructions"
                  /> -->

                <!-- Pseudoinstructions modals -->

                <!-- Pseudontruction fields -->
                <!-- <PseudoinstructionFields
                    id="fields_pseudoinstructions"
                    :title="modal_field_pseudoinstruction.title"
                    :index="modal_field_pseudoinstruction.index"
                    :pseudoinstruction="
                      modal_field_pseudoinstruction.pseudoinstruction
                    "
                  />
                </b-tab> -->

                <!-- Directives definition -->
                <!-- <b-tab title="Directives">
                  <Directives :directives="architecture.directives" />
                </b-tab> -->
              </b-tabs>
            </b-col>
          </b-row>
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>
