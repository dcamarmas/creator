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
export default {
  props: {
    memory_layout: { type: Array, required: true },
  },

  computed: {
    layout() {
      return (
        this.memory_layout
          // group in chunks of two so we get [[start0, end0], ...]
          .reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / 2)
            if (!resultArray[chunkIndex]) {
              resultArray[chunkIndex] = [] // start a new chunk
            }
            resultArray[chunkIndex].push(item)
            return resultArray
          }, [])
          // remove empty segments
          .filter(([start, end]) => end.value - start.value > 0)
      )
    },
  },

  methods: {
    /*
     * Obtains the color depending on the memory segment
     */
    getVariant(name) {
      switch (
        name.replace(/^\.+/, "") // delete leading "."
      ) {
        case "ktext":
        case "text":
          return "info"
        case "kdata":
        case "data":
          return "warning"
        case "stack":
          return "success"
        default:
          return "secondary"
      }
    },
  },
}
</script>

<template>
  <b-row class="mt-5 mx-0 px-0">
    <b-col lg="5" sm="12" />

    <!-- Memory layout sketch -->
    <b-col lg="4" sm="10">
      <b-list-group>
        <!-- main memory -->

        <b-list-group
          horizontal
          v-for="[start, end] in this.layout.slice(0, -1)"
        >
          <b-list-group-item
            :variant="getVariant(start.name.split(' ').shift())"
            class="memoryLayout font-monospace"
          >
            <br />
            .{{ start.name.split(" ").shift() }}
            <br />
            <br />
          </b-list-group-item>
          <b-list-group-item class="memoryLayout noBorder left font-monospace">
            <!-- start -->
            <span class="h6"> {{ start.value }} </span>
            <br />
            <br />
            <!-- end -->
            <span class="h6"> {{ end.value }} </span>
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
        <b-list-group-item class="memoryLayout noBorder" />
      </b-list-group>

      <!-- stack -->

      <b-list-group horizontal>
        <b-list-group-item
          variant="success"
          class="memoryLayout font-monospace"
        >
          <br />
          {{ layout.at(-1)[0].name.split(" ").shift() }}
          <br />
          <br />
        </b-list-group-item>
        <b-list-group-item class="memoryLayout noBorder left font-monospace">
          <span class="h6">
            {{ layout.at(-1)[0].value }}
          </span>
          <br />
          <br />
          <span class="h6">
            {{ layout.at(-1)[1].value }}
          </span>
        </b-list-group-item>
      </b-list-group>
    </b-col>
  </b-row>
</template>

<style lang="scss" scoped>
.memoryLayout {
  width: 100%;
  text-align: center;
}
</style>
