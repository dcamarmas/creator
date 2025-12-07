<!--
Copyright 2018-2025 CREATOR Team.

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
import { load_library } from "@/core/core.mjs";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    id: { type: String, required: true },
  },

  data() {
    return { library: null };
  },

  methods: {
    load() {
      // read file
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
      accept=".yml"
      id="binary_file"
    />
  </b-modal>
</template>
