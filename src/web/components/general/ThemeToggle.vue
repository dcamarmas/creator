<!--
Copyright 2018-2026 CREATOR Team.

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
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    darkModeSetting: {
      type: String,
      required: true,
      validator: (value: string) => ["system", "dark", "light"].includes(value),
    },
  },

  emits: ["update:darkModeSetting"],

  data() {
    return {
      modes: [
        { value: "light", icon: "sun", label: "Light" },
        { value: "dark", icon: "moon", label: "Dark" },
        { value: "system", icon: "circle-half-stroke", label: "System" },
      ] as const,
    };
  },

  computed: {
    currentMode() {
      return this.modes.find(mode => mode.value === this.darkModeSetting);
    },
    nextMode() {
      const currentIndex = this.modes.findIndex(
        mode => mode.value === this.darkModeSetting,
      );
      const nextIndex = (currentIndex + 1) % this.modes.length;
      return this.modes[nextIndex]!;
    },
  },

  methods: {
    toggleTheme() {
      this.$emit("update:darkModeSetting", this.nextMode.value);
    },
  },
});
</script>

<template>
  <b-nav-item
    class="icon-button"
    @click="toggleTheme"
    :aria-label="`Switch to ${nextMode.label} mode`"
  >
    <font-awesome-icon :icon="['fas', currentMode?.icon || 'circle-half-stroke']" />
  </b-nav-item>
</template>
