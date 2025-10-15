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

export default defineComponent({
  props: {
    imgSrc: { type: String, required: true },
    imgAlt: { type: String, required: true },
    fullName: { type: String, required: true },
    linkedin: { type: String, required: false },
    rgate: { type: String, required: false },
    github: { type: String, required: false },
    dark: { type: Boolean, required: true },
  },
})
</script>

<template>
  <b-card>
    <template #img>
      <!-- we do this to use the custom class -->
      <b-img
        class="author-img"
        :src="imgSrc"
        :alt="`${dark ? 'evil_' : ''}${imgAlt}`"
      />
    </template>
    <b-card-text class="text-center">
      {{ fullName }}
      <hr />

      <div v-if="linkedin">
        <b-link
          underline-opacity="0"
          underline-opacity-hover="75"
          aria-label="linkedin"
          target="_blank"
          :href="`https://www.linkedin.com/in/${linkedin}`"
        >
          <font-awesome-icon :icon="['fab', 'linkedin']" />
          LinkedIn
        </b-link>
      </div>
      <br v-else />
      <hr />

      <div v-if="rgate">
        <b-link
          underline-opacity="0"
          underline-opacity-hover="75"
          aria-label="researchgate"
          target="_blank"
          :href="`https://www.researchgate.net/profile/${rgate}`"
        >
          <font-awesome-icon :icon="['fab', 'researchgate']" />
          R-Gate
        </b-link>
      </div>
      <br v-else />
      <hr />

      <div v-if="github">
        <b-link
          underline-opacity="0"
          underline-opacity-hover="75"
          aria-label="github"
          target="_blank"
          :href="`https://github.com/${github}`"
        >
          <font-awesome-icon :icon="['fab', 'github']" />
          GitHub
        </b-link>
      </div>
    </b-card-text>
  </b-card>
</template>

<style lang="scss" scoped>
// easter egg: evil mode
[data-bs-theme="dark"] {
  .author-img {
    filter: invert(100%) hue-rotate(160deg);
  }
}
</style>
