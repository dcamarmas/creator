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

import { stats } from "@/core/executor/stats.mts"

import PlotStats from "./PlotStats.vue"
import TableStats from "./TableStats.vue"

export default defineComponent({
  props: {
    dark: { type: Boolean, required: true },
    representation: { type: String, required: true },
    type: { type: String, required: true },
  },

  components: {
    PlotStats,
    TableStats,
  },

  data() {
    return {
      stats,
      render: 0, // dummy variable to force components with this as key to refresh
    }
  },
  computed: {
    representation_value: {
      get() {
        return this.representation
      },

      set(value: string) {
        ;(this.$root as any).stat_representation = value
      },
    },
    type_value: {
      get() {
        return this.type
      },

      set(value: string) {
        ;(this.$root as any).stat_type = value
      },
    },
  },

  methods: {
    refresh() {
      // refreshes children components with `:key="render"`
      this.render++
    },
  },
})
</script>

<template>
  <b-container fluid align-h="center" class="mx-0 my-3 px-2">
    <b-row cols-xl="2" cols-lg="1" cols-md="2" cols-sm="1" cols-xs="1" cols="1">
      <b-col align-h="center" class="px-2">
        <div class="border m-1 py-1 px-2">
          <b-badge
            :variant="dark ? 'dark' : 'light'"
            class="h6 border my-0 groupLabelling"
          >
            Statistics
          </b-badge>
          <b-form-radio-group
            :class="{ 'w-100': true, 'mb-1': true, border: dark }"
            v-model="type_value"
            :button-variant="dark ? 'dark' : 'outline-secondary'"
            size="sm"
            buttons
          >
            <b-form-radio value="instructions">
              <font-awesome-icon :icon="['fas', 'bars']" />
              Instructions
            </b-form-radio>
            <b-form-radio value="cycles">
              <font-awesome-icon :icon="['far', 'clock']" />
              Cycles
            </b-form-radio>
          </b-form-radio-group>
        </div>
      </b-col>

      <b-col align-h="center" class="px-2">
        <div class="border m-1 py-1 px-2">
          <b-badge
            :variant="dark ? 'dark' : 'light'"
            class="h6 border my-0 groupLabelling"
          >
            Statistic representation
          </b-badge>
          <b-form-radio-group
            :class="{ 'w-100': true, 'mb-1': true, border: dark }"
            v-model="representation_value"
            :button-variant="dark ? 'dark' : 'outline-secondary'"
            size="sm"
            buttons
          >
            <b-form-radio value="graphic">
              <font-awesome-icon
                :icon="[
                  'fas',
                  `chart-${type === 'instructions' ? 'pie' : 'simple'}`,
                ]"
              />
              Graph
            </b-form-radio>
            <b-form-radio value="table">
              <font-awesome-icon :icon="['fas', 'table']" />
              Table
            </b-form-radio>
          </b-form-radio-group>
        </div>
      </b-col>
    </b-row>

    <b-row cols="1">
      <b-col align-h="center" class="px-2 my-2">
        <PlotStats
          v-if="representation_value === 'graphic'"
          :stats="stats"
          :type="type_value"
          :dark="dark"
          :key="render"
        />
        <TableStats
          v-if="representation_value === 'table'"
          :stats="stats"
          :type="type_value"
          :dark="dark"
          :key="render"
        />
      </b-col>
    </b-row>
  </b-container>
</template>
