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
import { loadDefaultArchitecture } from "@/web/utils.mjs"
import { loadCustomArchitecture } from "../../utils.mjs"

export default {
  props: {
    architecture: { type: Object, required: true },
    dark: { type: Boolean, required: true },
  },

  emits: [
    "select-architecture", // architecture has been selected
    "delete-architecture", // architecture wants to be deleted
  ],

  data() {
    return {
      selected: false,
    }
  },

  methods: {
    /**
     * Selects an architecture by emitting the 'select-architecture' event with the selected architecture's name to App (grandparent)
     * @param {Object} arch Selected architecture
     */
    select_arch() {
      if (this.architecture.default) {
        loadDefaultArchitecture(this.architecture)
      } else {
        loadCustomArchitecture(this.architecture)
      }
      this.$emit("select-architecture", this.architecture.name) // emit to our grandparent
    },
  },
}
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
        :src="`img/logos/${architecture.img}` ?? 'img/logos/default.webp'"
        :alt="architecture.alt"
        @click="select_arch"
      />
    </template>

    <b-card-title @click="select_arch">
      {{ architecture.name }}
    </b-card-title>

    <b-card-text class="justify" @click="select_arch">
      {{ architecture.description }}
    </b-card-text>

    <!-- Delete button -->
    <template #footer v-if="!architecture.default">
      <b-button
        class="my-1 w-75 center"
        size="sm"
        variant="outline-danger"
        @click="this.$emit('delete-architecture', this.architecture.name)"
      >
        <font-awesome-icon :icon="['fas', 'trash-can']" />
        Delete
      </b-button>
    </template>
  </b-card>
</template>
