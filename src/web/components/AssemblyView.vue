<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos

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
import TextareaAssembly from "./assembly/TextareaAssembly.vue"

export default {
  props: {
    browser: String,
    arch_available: Array,
    architecture_name: String,
    assembly_code: String,
  },
  components: { UIeltoToolbar, TextareaAssembly },
}
</script>

<template>
  <b-container fluid align-h="center" id="assembly">
    <b-row>
      <b-col>
        <!-- Navbar -->
        <UIeltoToolbar
          id="navbar_assembly"
          components="btn_architecture,btn_simulator|btn_compile|dropdown_assembly_file,dropdown_library|btn_configuration,btn_information"
          :browser="browser"
          :arch_available="arch_available"
          :assembly_code="assembly_code"
        />

        <!-- Assembly navbar modals -->

        <!-- Load assembly form -->
        <!-- <LoadAssembly id="load_assembly" /> -->

        <!-- Save assembly form -->
        <!-- <SaveAssembly id="save_assembly" /> -->

        <!-- Examples modal -->
        <!-- <Examples
          id="examples"
          ref="examples"
          :example_set_available="example_set_available"
          :example_available="example_available"
          compile="false"
          modal="examples"
        /> -->

        <!-- Get uri -->
        <!-- <MakeURI id="make_uri" /> -->

        <!-- Load binary form -->
        <!-- <LoadLibrary id="load_binary" /> -->

        <!-- Save binary form -->
        <!-- <SaveLibrary id="save_binary" /> -->

        <!-- <b-container fluid align-h="center" class="mx-0 px-0">
          <b-row cols="2">
            <b-col cols="12" id="divAssembly"> -->
        <!-- Assembly textarea-->
        <TextareaAssembly :browser="browser" />
        <!-- </b-col>

            <b-col cols="0" id="divTags" class="d-none"> -->
        <!-- Library tags-->
        <!-- <ListLibraryTags
                :instructions_tag="update_binary.instructions_tag"
              />
            </b-col>
          </b-row>
        </b-container> -->

        <!-- Compile error modal -->
        <!-- <AssemblyError
          id="modalAssemblyError"
          ref="errorAssembly"
          :modal_assembly_error="modalAssemblyError"
        /> -->
      </b-col>
    </b-row>
  </b-container>
</template>
