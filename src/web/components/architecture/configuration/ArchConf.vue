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

const configMap = new Map<string, string>([
  ["name", "Name"],
  ["word_size", "Word Size"],
  ["description", "Description"],
  ["endianness", "Endianness"],
  ["memory_alignment", "Memory Alignment"],
  ["main_function", "Main Function"],
  ["passing_convention", "Passing Convention"],
  ["sensitive_register_name", "Sensitive Register Name"],
  ["comment_prefix", "Comment Prefix"],
  ["start_address", "Start Address"],
  ["pc_offset", "PC Offset"],
  ["byte_size", "Byte Size"],
]);

function formatValue(attr: string, value: string) {
  if (attr === "endianness") {
    if (value === "big_endian") {
      return "Big Endian";
    } else if (value === "little_endian") {
      return "Little Endian";
    }
  } else if (
    [
      "passing_convention",
      "memory_alignment",
      "sensitive_register_name",
    ].includes(attr)
  ) {
    return value ? "Enabled" : "Disabled";
  }

  return value;
}

export default defineComponent({
  props: {
    conf: { type: Object, required: true },
  },

  computed: {
    config() {
      return Object.entries(this.conf)
        .filter(([attr, _v]) => attr !== "assemblers") // no assemblers
        .map(([attr, value]) => ({
          name: configMap.get(attr),
          value: formatValue(attr, value),
        }));
    },
  },
});
</script>

<template>
  <div class="arch-config">
    <div class="config-grid">
      <div v-for="item in config" :key="item.name" class="config-item">
        <span class="config-label">{{ item.name }}</span>
        <span class="config-value">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.arch-config {
  padding: 0;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.1s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }
}

.config-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.config-value {
  font-size: 0.8125rem;
  color: rgba(0, 0, 0, 0.9);
  font-weight: 500;
  word-break: break-word;
  font-family:
    "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New",
    monospace;
}

[data-bs-theme="dark"] {
  .config-item {
    border-bottom-color: rgba(255, 255, 255, 0.05);

    &:hover {
      background: rgba(255, 255, 255, 0.02);
    }
  }

  .config-label {
    color: rgba(255, 255, 255, 0.6);
  }

  .config-value {
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
