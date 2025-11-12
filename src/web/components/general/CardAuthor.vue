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
    horizontal: { type: Boolean, default: false },
  },
})
</script>

<template>
  <!-- Horizontal Layout -->
  <b-card v-if="horizontal" class="card-horizontal">
    <b-row no-gutters class="align-items-center">
      <b-col cols="4" class="card-img-col">
        <b-img
          class="author-img"
          :src="imgSrc"
          :alt="`${dark ? 'evil_' : ''}${imgAlt}`"
          fluid
        />
      </b-col>
      <b-col cols="8">
        <b-card-body class="py-2 px-3">
          <div class="author-info">
            <h6 class="mb-2 fw-bold">{{ fullName }}</h6>
            <div class="social-links d-flex flex-column gap-1">
              <b-link
                v-if="linkedin"
                underline-opacity="0"
                underline-opacity-hover="75"
                aria-label="linkedin"
                target="_blank"
                :href="`https://www.linkedin.com/in/${linkedin}`"
                class="social-link"
              >
                <font-awesome-icon :icon="['fab', 'linkedin']" size="sm" class="me-1" />
                <span class="social-text">LinkedIn</span>
              </b-link>

              <b-link
                v-if="rgate"
                underline-opacity="0"
                underline-opacity-hover="75"
                aria-label="researchgate"
                target="_blank"
                :href="`https://www.researchgate.net/profile/${rgate}`"
                class="social-link"
              >
                <font-awesome-icon :icon="['fab', 'researchgate']" size="sm" class="me-1" />
                <span class="social-text">R-Gate</span>
              </b-link>

              <b-link
                v-if="github"
                underline-opacity="0"
                underline-opacity-hover="75"
                aria-label="github"
                target="_blank"
                :href="`https://github.com/${github}`"
                class="social-link"
              >
                <font-awesome-icon :icon="['fab', 'github']" size="sm" class="me-1" />
                <span class="social-text">GitHub</span>
              </b-link>
            </div>
          </div>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>

  <!-- Vertical Layout -->
  <b-card v-else>
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
// Vertical card layout - consistent image sizing
.card:not(.card-horizontal) {
  .author-img {
    width: 100%;
    height: 200px;
    object-fit: contain;
    object-position: center;
  }
}

// easter egg: evil mode
[data-bs-theme="dark"] {
  .author-img {
    filter: invert(100%) hue-rotate(160deg);
  }
}

// Horizontal card layout
.card-horizontal {
  .card-img-col {
    display: flex;
    align-items: center;
    padding: 0;
    
    .author-img {
      width: 100%;
      height: 100%;
      min-height: 140px;
      object-fit: cover;
      object-position: center;
      border-radius: 0.375rem 0 0 0.375rem;
    }
  }

  .author-info {
    h6 {
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
    }
  }

  .social-links {
    font-size: 0.85rem;
  }

  .social-link {
    display: flex;
    align-items: center;
    
    .social-text {
      font-size: 0.8rem;
    }
  }
}
</style>
