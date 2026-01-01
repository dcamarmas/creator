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
import { defineComponent, type PropType } from "vue";
import type { Directive } from "@/core/core";

export default defineComponent({
  props: {
    directives: { type: Array as PropType<Directive[]>, required: true },
  },

  data() {
    return {
      // Directives table fields
      directivesFields: [
        { key: "name", sortable: true, thClass: "col-name" },
        { key: "action", thClass: "col-action" },
        { key: "size", thClass: "col-size" },
      ],
    };
  },
});
</script>

<template>
  <div class="directives-container">
    <b-table
      small
      :items="directives"
      :fields="directivesFields"
      class="directives-table"
      hover
      responsive
      sticky-header="100%"
    >
      <template v-slot:cell(name)="row">
        <code class="directive-name">{{ row.item.name }}</code>
      </template>
    </b-table>
  </div>
</template>

<style lang="scss" scoped>
.directives-container {
  padding: 0;
  height: 100%;
}

.directives-table {
  font-size: 0.875rem;

  :deep(thead th) {
    color: rgba(0, 0, 0, 0.8);
    font-weight: 600;
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
    border-top: none;
    border-left: none;
    border-right: none;
    padding: 8px 12px;
    font-size: 0.8125rem;

    &.col-name {
      min-width: 120px;
    }

    &.col-action {
      min-width: 200px;
    }

    &.col-size {
      min-width: 80px;
      text-align: center;
    }
  }

  :deep(tbody tr) {
    transition: background-color 0.1s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.02);
    }

    td {
      vertical-align: middle;
      padding: 8px 12px;
      border-color: rgba(0, 0, 0, 0.05);
    }
  }
}

.directive-name {
  font-family:
    "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New",
    monospace;
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.9);
  background: rgba(0, 0, 0, 0.04);
  padding: 2px 6px;
  border-radius: 3px;
}

[data-bs-theme="dark"] {
  .directives-table {
    :deep(thead th) {
      color: rgba(255, 255, 255, 0.9);
      border-bottom-color: rgba(255, 255, 255, 0.12);
    }

    :deep(tbody tr) {
      &:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      td {
        border-color: rgba(255, 255, 255, 0.05);
      }
    }
  }

  .directive-name {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.08);
  }
}
</style>
