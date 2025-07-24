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
import Registers from "../registers/Registers.vue"

export default {
  props: {
    register_file: { type: Array, required: true },
  },
  components: {
    Registers,
  },
}
</script>

<template>
  <!-- Register File table -->
  <div class="mt-3" />
  <!-- For each register file -->
  <b-card
    v-for="(item, index) in register_file"
    :key="item.type"
    no-body
    class="mb-1"
  >
    <b-card-header header-tag="header" class="p-1 d-grid gap-2" role="tab">
      <b-button
        block
        href="#"
        v-b-toggle="`registerfile${index}`"
        class="buttonBackground"
        variant="outline-secondary"
        size="sm"
      >
        {{ item.name }}
      </b-button>
    </b-card-header>
    <b-collapse
      :id="'registerfile' + index.toString()"
      accordion="my-accordion"
      role="tabpanel"
      class="architecture-scroll-y"
    >
      <b-card-body>
        <Registers
          :registers="register_file[index].elements"
          :register_file_index="index"
        >
        </Registers>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/bootstrap";

.architecture-scroll-y {
  display: block;
  max-height: 60vh;
  overflow-y: auto;
  -ms-overflow-style: -ms-autohiding-scrollbar;
}

[data-bs-theme="dark"] {
  .buttonBackground {
    background-color: #212529;
    color: $secondary;
  }
  .buttonBackground:hover {
    background-color: #424649;
  }
}
</style>
