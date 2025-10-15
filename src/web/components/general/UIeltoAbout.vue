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

import authors from "@/web/assets/authors.json"

import CardAuthor from "./CardAuthor.vue"

export default defineComponent({
  props: {
    id: { type: String, required: true },
    dark: { type: Boolean, required: true },
  },
  components: { CardAuthor },

  data() {
    return {
      contactMail: "creator.arcos.inf.uc3m.es@gmail.com",
      authors,
    }
  },
})
</script>

<template>
  <b-modal :id="id" title="About us" scrollable no-footer>
    <b-card-group>
      <CardAuthor
        v-for="author in authors"
        :img-src="`img/authors/${author.id}.webp`"
        :img-alt="`author_${author.id}`"
        :full-name="author.name"
        :linkedin="author.linkedin"
        :rgate="author.rgate"
        :github="author.github"
        :dark="dark"
      />
    </b-card-group>

    <b-list-group class="my-3">
      <b-list-group-item class="text-center">
        <b-link
          underline-opacity="0"
          underline-opacity-hover="75"
          :href="`mailto: ${contactMail}`"
        >
          <font-awesome-icon :icon="['fas', 'envelope']" />
          {{ contactMail }}
        </b-link>
      </b-list-group-item>
    </b-list-group>

    <b-list-group>
      <b-list-group-item style="text-align: center">
        <b-row align-h="center" align-v="center">
          <b-col cols="4">
            <b-link target="_blank" href="https://www.arcos.inf.uc3m.es/">
              <b-img
                src="@/web/assets/img/arcos.svg"
                alt="ARCOS Group"
                class="mx-2"
              />
            </b-link>
          </b-col>
          <b-col cols="8">
            <b-link target="_blank" href="https://www.inf.uc3m.es/">
              <b-img
                src="@/web/assets/img/dptoinf.webp"
                alt="Computer Science and Engineering Departament - UC3M"
                class="ms-4 dark-white-img"
                style="width: 93%"
              />
            </b-link>
          </b-col>
        </b-row>
      </b-list-group-item>
    </b-list-group>
  </b-modal>
</template>

<style lang="scss" scoped>
[data-bs-theme="dark"] {
  .dark-white-img {
    filter: brightness(0) invert(1); // white
  }
}
</style>
