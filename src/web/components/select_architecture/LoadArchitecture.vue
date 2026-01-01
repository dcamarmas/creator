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
import type { BvTriggerableEvent } from "bootstrap-vue-next";
import { defineComponent } from "vue";

import {
  hide_loading,
  show_loading,
  loadCustomArchitecture,
  show_notification,
} from "@/web/utils.mjs";

export default defineComponent({
  emits: [
    "select-architecture", // architecture has been selected
  ],

  data() {
    return {
      // Form inputs
      name: "",
      description: "",
      file: null as File | null,

      selected: false,
    };
  },

  methods: {
    loadArch(event: BvTriggerableEvent) {
      // show_loading()

      event.preventDefault();

      // read file
      const reader = new FileReader();
      reader.onload = _event => {
        const archDefinition = reader.result as string;

        const architecture = {
          name: this.name,
          alias: [],
          id: `select_conf${this.name}`,
          examples: [],
          description: this.description,
          definition: archDefinition,
          available: true,
        };

        // add to localStorage
        localStorage.setItem(
          "customArchitectures",
          JSON.stringify(
            // add to the list of custom architectures
            (
              JSON.parse(localStorage.getItem("customArchitectures")!) ?? []
            ).toSpliced(0, 0, architecture),
          ),
        );

        // load architecture
        loadCustomArchitecture(architecture);

        // hide_loading()

        // notify architecture has been selected
        this.$emit("select-architecture", this.name);

        // Clean form
        this.name = "";
        this.description = "";
        this.file = null;
      };

      reader.onerror = () => show_notification("Error loading file", "danger");

      reader.readAsText(this.file!);
    },
  },
});
</script>

<template>
  <b-card
    v-b-modal.load_arch
    :class="{ selectedCard: selected }"
    title="Load Custom Architecture"
    style="cursor: pointer"
    @mouseover="selected = true"
    @mouseleave="selected = false"
  >
    <template #img>
      <b-img
        class="mt-2 w-75 load-img"
        style="padding-bottom: 1.2vh"
        placement="center"
        src="@/web/assets/img/load_icon.webp"
        alt="load icon"
      />
    </template>

    <b-card-text class="justify">
      Allows to load the definition of an already created architecture.
    </b-card-text>

    <b-modal id="load_arch" title="Load Architecture" @ok="loadArch">
      <!-- TODO: link to template arch -->
      <b-form :valid="name.length > 0 && file !== null">
        <b-form-input
          v-model="name"
          placeholder="Enter the name of the architecture"
          :state="name.length > 0"
          title="Architecture Name"
        />
        <br />
        <b-form-textarea
          v-model="description"
          placeholder="Enter a description of the architecture"
          rows="3"
          title="Architecture Description"
        />
        <br />
        <b-form-file
          v-model="file"
          placeholder="Choose a file..."
          id="arch_file"
          accept=".yml"
          :state="file !== null"
        />
      </b-form>
    </b-modal>
  </b-card>
</template>

<style lang="scss" scoped>
[data-bs-theme="dark"] {
  .load-img {
    filter: invert(70%);
  }
}
</style>
