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
import { coreEvents } from "@/core/events.mjs"

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
      windowWidth: 0,
    }
  },

  mounted() {
    this.windowWidth = window.innerWidth
    window.addEventListener('resize', this.updateWindowWidth)
    
    // Subscribe to stats update events from core
    coreEvents.on("stats-updated", this.onStatsUpdated)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowWidth)
    
    // Clean up event listener
    coreEvents.off("stats-updated", this.onStatsUpdated)
  },
  computed: {
    isMobile() {
      return this.windowWidth < 768
    },
    representation_value: {
      get() {
        if (this.isMobile) return 'table'
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
    onStatsUpdated() {
      this.refresh()
    },
    
    updateWindowWidth() {
      this.windowWidth = window.innerWidth
    },
    
    refresh() {
      // refreshes children components with `:key="render"`
      this.render++
    },
  },
})
</script>

<template>
  <b-container fluid align-h="center" class="mx-0 px-0 stats-container">
    <b-row cols-xl="2" cols-lg="1" cols-md="2" cols-sm="1" cols-xs="1" cols="1" class="stats-controls">
      <b-col align-h="center" class="px-2">
        <div :class="`m-1 py-1 px-2 ${!isMobile ? 'border' : ''}`">
          <b-badge
            v-if="!isMobile"
            :variant="dark ? 'dark' : 'light'"
            class="h6 border my-0 groupLabelling"
          >
            Stats
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

      <b-col align-h="center" class="px-2 d-none d-md-block">
        <div class="border m-1 py-1 px-2">
          <b-badge
            :variant="dark ? 'dark' : 'light'"
            class="h6 border my-0 groupLabelling"
          >
            Format
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

    <b-row cols="1" class="stats-content-row">
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

<style scoped>
.stats-container {
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.stats-controls {
  flex: 0 0 auto;
}

.stats-content-row {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 148, 158, 0.3) transparent;
}

.stats-content-row::-webkit-scrollbar {
  width: 8px;
}

.stats-content-row::-webkit-scrollbar-track {
  background: transparent;
}

.stats-content-row::-webkit-scrollbar-thumb {
  background-color: rgba(139, 148, 158, 0.3);
  border-radius: 4px;
}

.stats-content-row::-webkit-scrollbar-thumb:hover {
  background-color: rgba(139, 148, 158, 0.5);
}
</style>
