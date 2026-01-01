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
import { defineComponent, type PropType } from "vue";

import {
  loadDefaultArchitecture,
  loadCustomArchitecture,
} from "@/web/utils.mjs";
import { initCAPI } from "@/core/capi/initCAPI.mts";
import { architecture } from "@/core/core";

export default defineComponent({
  props: {
    architecture: { type: Object as PropType<AvailableArch>, required: true },
    dark: { type: Boolean, required: true },
  },

  emits: [
    "select-architecture", // architecture has been selected
    "delete-architecture", // architecture wants to be deleted
  ],

  data() {
    return {
      selected: false,
    };
  },

  methods: {
    /**
     * Selects an architecture by emitting the 'select-architecture' event with
     * the selected architecture's name to App (grandparent)
     */
    async select_arch() {
      if (this.architecture.default) {
        await loadDefaultArchitecture(this.architecture);
      } else {
        loadCustomArchitecture(this.architecture);
      }
      const pluginName = architecture.config.plugin;
      // Now we can initialize the CAPI with the plugin name
      initCAPI(pluginName);
      this.$emit("select-architecture", this.architecture.name); // emit to our grandparent
    },

    deleteArch() {
      this.$emit("delete-architecture", this.architecture.name);
    },
  },
});
</script>

<template>
  <b-card
    :class="{ selectedCard: selected }"
    style="cursor: pointer"
    footer-class="text-center"
    :footer-bg-variant="dark ? 'dark' : 'light-subtle'"
    @mouseover="selected = true"
    @mouseleave="selected = false"
  >
    <template #img>
      <b-img
        :src="`img/logos/${architecture.img}` || 'img/logos/default.webp'"
        :alt="architecture.alt"
        @click="select_arch"
      />
    </template>
    <b-card-title @click="select_arch"> {{ architecture.name }} </b-card-title>
    <b-card-text class="justify" @click="select_arch">
      {{ architecture.description }}
    </b-card-text>

    <!-- Delete button -->
    <template #footer v-if="!architecture.default">
      <b-button
        class="my-1 w-75 center"
        size="sm"
        variant="outline-danger"
        @click="deleteArch"
      >
        <font-awesome-icon :icon="['fas', 'trash-can']" /> Delete
      </b-button>
    </template>
  </b-card>
</template>
