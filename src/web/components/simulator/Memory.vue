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
import { defineComponent, type PropType } from "vue"

import { main_memory } from "@/core/core"
import { type Device, devices } from "@/core/executor/devices.mts"
import type { StackFrame } from "@/core/memory/StackTracker.mjs"
import HexViewer from "./HexViewer.vue"
import type { Memory } from "@/core/memory/Memory.mjs"

export default defineComponent({
  props: {
    dark: { type: Boolean, required: true },
    selectedSegment: { type: String, required: true },
    caller_frame: Object as PropType<StackFrame>,
    callee_frame: Object as PropType<StackFrame>,
  },

  components: { HexViewer },

  data() {
    return {
      main_memory: main_memory as Memory,
      devices: devices as Map<string, Device>,
    }
  },

  computed: {
    // sync w/ root
    segment: {
      get() {
        return this.selectedSegment
      },
      set(value: string) {
        ; (this.$root as any).memory_segment = value
      },
    },
  },
})
</script>

<template>
  <div class="memory-container">
    <HexViewer 
      ref="hexviewer" 
      :main_memory="main_memory as Memory" 
      :devices="devices as Map<string, Device>"
      :segment="segment" 
    />
  </div>
</template>

<style scoped>
.memory-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>

