<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos

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
export default {
  props: {
    memory_layout: { type: Array, required: true },
  },

  computed: {
    memory_layout_length() {
      return this._props.memory_layout.length
    },
  },

  methods: {
    /*
     * Obtains the color depending on the memory segment
     */
    getVariant(name) {
      // TODO
      switch (name) {
        case 'ktext':
        case 'text':
          return 'info'
        case 'kdata':
        case 'data':
          return 'warning'
        case 'stack':
          return 'success'
      }

      return 'info'
    },

    computeSize(i) {
      return this._props.memory_layout[i].value - this._props.memory_layout[i - 1].value
    },
  },
}
</script>
<template>
  <div class="col-lg-12 col-sm-12 row memoryLayoutDiv mx-0 px-0">
    <div class="col-lg-3 col-sm-12"></div>

    <!-- Memory layout sketch -->
    <div class="col-lg-6 col-sm-12">
      <b-list-group class="memoryLayout">
        <!-- main memory -->

        <b-list-group
          horizontal
          v-for="i in memory_layout_length - 2"
          v-if="i % 2 && computeSize(i) > 0"
        >
          <!-- i goes 1..n bc Vue -->
          <!--  TODO: get variant from getVariant() -->
          <b-list-group-item variant="info" class="memoryLayout">
            <br />
            .{{ memory_layout[i - 1].name.split(' ').shift() }}
            <br />
            <br />
          </b-list-group-item>
          <b-list-group-item class="memoryLayout noBorder left">
            <!-- start -->
            <span class="h6"> {{ memory_layout[i - 1].value }} </span>
            <br />
            <br />
            <!-- end -->
            <span class="h6"> {{ memory_layout[i].value }} </span>
          </b-list-group-item>
        </b-list-group>
      </b-list-group>

      <!-- empty space -->

      <b-list-group horizontal>
        <b-list-group-item variant="secondary" class="memoryLayout">
          <br />
          ...
          <br />
          <br />
        </b-list-group-item>
        <b-list-group-item class="memoryLayout noBorder"> </b-list-group-item>
      </b-list-group>

      <!-- stack -->

      <b-list-group horizontal>
        <b-list-group-item variant="success" class="memoryLayout">
          <br />
          .{{ memory_layout[memory_layout_length - 2].name.split(' ').shift() }}
          <br />
          <br />
        </b-list-group-item>
        <b-list-group-item class="memoryLayout noBorder left">
          <span class="h6"> {{ memory_layout[memory_layout_length - 2].value }} </span>
          <br />
          <br />
          <span class="h6"> {{ memory_layout[memory_layout_length - 2].value }} </span>
        </b-list-group-item>
      </b-list-group>
    </div>

    <div class="col-lg-3 col-sm-12"></div>
  </div>
</template>
