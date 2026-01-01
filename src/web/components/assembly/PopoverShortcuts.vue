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
    target: { type: String, required: true },
    os: { type: String, required: true },
    vim_mode: { type: Boolean, required: true },
  },

  data() {
    return {
      keybinds: {
        // take into account the modifier
        Copy: ["c"],
        Paste: ["v"],
        Cut: ["x"],
        "Select All": ["a"],
        Undo: ["z"],
        Redo: ["y"],
        "Assemble/Link": ["s"],
      },
      vim_commands: {
        "Assemble/Link": [":w", ":x"],
      },
    };
  },

  computed: {
    modifierKey() {
      return this.os === "Mac" ? "⌘ " : "Ctrl+";
    },
  },
});
</script>

<template>
  <b-popover
    :target="target"
    title="Shortcuts"
    triggers="hover focus"
    placement="bottom-end"
  >
    <div v-if="vim_mode">
      <label> Commands </label>
      <b-list-group v-if="vim_mode">
        <b-list-group-item
          class="d-flex justify-content-between align-items-center"
          v-for="[name, binds] of Object.entries(vim_commands)"
        >
          {{ name }} &nbsp;&nbsp;
          <b-badge
            variant="primary"
            class="font-monospace"
            pill
            v-for="b in binds"
          >
            {{ b }}
          </b-badge>
        </b-list-group-item>
      </b-list-group>
      <br />
      <label> INSERT mode </label>
    </div>

    <b-list-group>
      <b-list-group-item
        class="d-flex justify-content-between align-items-center"
        v-for="[name, binds] of Object.entries(keybinds)"
      >
        {{ name }} &nbsp;&nbsp;
        <b-badge variant="primary" pill v-for="b in binds">
          {{ `${modifierKey}${b.toUpperCase()}` }}
        </b-badge>
      </b-list-group-item>
    </b-list-group>
  </b-popover>
</template>
