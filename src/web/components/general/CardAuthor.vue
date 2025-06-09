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
<style lang="scss" scoped>
.authorName {
  height: 6vh;
}
</style>

<script>
export default {
  props: {
    author_img: { type: String, required: true },
    author_alt: { type: String, required: true },
    author_full_name: { type: String, required: true },
    author_href_linked: { type: String, required: false },
    author_href_rgate: { type: String, required: false },
    author_href_github: { type: String, required: false },
  },
}
</script>

<template>
  <!-- <b-card :img-src="author_img" :img-alt="author_alt" img-top> -->
  <b-card>
    <template #img>
      <!-- we do this to use the custom class -->
      <b-img class="author-img" :src="author_img" :alt="author_alt" />
    </template>
    <b-card-text>
      <div class="authorName">
        <span class="h6">{{ author_full_name }}</span>
      </div>
      <hr />
      <a aria-label="linkedin" target="_blank" :href="author_href_linked">
        <span class="fab fa-linkedin"></span>
        linkedin
      </a>
      <hr />
      <a aria-label="r-gate" target="_blank" :href="author_href_rgate">
        <span class="fab fa-researchgate"></span>
        r-gate
      </a>
      <hr />
      <a aria-label="github" target="_blank" :href="author_href_github">
        <span class="fab fa-github"></span>
        github
      </a>
    </b-card-text>
  </b-card>
</template>

<style lang="scss" scoped>
// easter egg: evil mode
[data-bs-theme="dark"] {
  .author-img {
    filter: invert(88%) hue-rotate(160deg);
  }
}
</style>
