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
import { show_loading, hide_loading, show_notification } from "@/web/utils.mjs";
import { architecture, load_library, load_library_sail, loadedLibrary } from "@/core/core.mjs";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    id: { type: String, required: true },
  },

  data() {
    return { 
      library: null,
      compiler: architecture.config.name
     };
  },
  computed: {
    file_accept() {
      return (this.compiler.includes("SRV") ? ".o" : ".yml");
    }
  },

  methods: {
    load() {
      // read file
      if (!this.compiler.includes("SRV")) {
        show_loading();
        const reader = new FileReader();
        reader.onload = _event => {
          try {
            load_library(reader.result as string);
          } catch (_e) {
            show_notification("Invalid library", "danger");
            return;
          }
          // this.$root.librayLoaded = true
          hide_loading();
        };
        reader.onerror = () =>
          show_notification("Error loading library", "danger");

        reader.readAsText(this.library!);
      } else {
        show_loading();
        const reader = new FileReader();
        var arrayBuffer;
        reader.onload = _event => {
          try {
            load_library_sail(new Uint8Array(reader.result), document.getElementById("binary_file").files[0].name);
          } catch (_e){
            show_notification("Fail to load library file", "danger");
          }
        };
        reader.readAsArrayBuffer(this.library!);


      }
    },
  },
});
</script>

<template>
  <b-modal
    :id="id"
    title="Load Binary"
    ok-title="Load from this File"
    @ok="load"
  >
    <p>Please select the binary file to be loaded</p>
    <b-form-file
      v-model="library"
      :state="library !== null"
      placeholder="Choose a file..."
      :accept="file_accept"
      id="binary_file"
    />
  </b-modal>
</template>
