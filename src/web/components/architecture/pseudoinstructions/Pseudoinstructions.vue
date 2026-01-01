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
import type { PseudoInstruction } from "@/core/core";

export default defineComponent({
  props: {
    pseudoinstructions: {
      type: Array as PropType<PseudoInstruction[]>,
      required: true,
    },
  },

  components: {},

  data() {
    return {
      // Pseudoinstructions table fields
      pseudoinstructions_fields: [
        { key: "name", sortable: true, thClass: "col-name" },
        { key: "signature_pretty", label: "Syntax", thClass: "col-syntax" },
        { key: "definition", label: "Expands To", thClass: "col-definition" },
      ],

      searchTerm: "",
    };
  },

  computed: {
    filteredPseudoinstructions() {
      return this.pseudoinstructions.filter(inst => {
        const matchesSearch =
          !this.searchTerm ||
          inst.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          inst.signature_pretty
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase());

        return matchesSearch;
      });
    },
  },

  methods: {},
});
</script>

<template>
  <div class="pseudoinstructions-container">
    <!-- Search Bar -->
    <div class="pseudoinstruction-toolbar">
      <b-row class="align-items-center">
        <b-col>
          <b-form-input
            v-model="searchTerm"
            placeholder="Search pseudoinstructions..."
            size="sm"
          />
        </b-col>
        <b-col class="text-end">
          <b-badge variant="primary" pill>
            {{ filteredPseudoinstructions.length }} /
            {{ pseudoinstructions.length }}
          </b-badge>
        </b-col>
      </b-row>
    </div>

    <!-- Pseudoinstruction set table -->
    <b-table
      small
      :items="filteredPseudoinstructions"
      :fields="pseudoinstructions_fields"
      class="pseudoinstructions-table"
      hover
      responsive
    >
      <!-- For each pseudoinstruction -->
      <template v-slot:cell(name)="row">
        <code class="pseudo-name">{{ row.item.name }}</code>
      </template>
      <template v-slot:cell(signature_pretty)="row">
        <span class="syntax-text">{{ row.item.signature_pretty }}</span>
      </template>
      <template v-slot:cell(definition)="row">
        <code class="definition-text">{{ row.item.definition }}</code>
      </template>
    </b-table>
  </div>
</template>

<style lang="scss" scoped>
.pseudoinstructions-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pseudoinstruction-toolbar {
  flex-shrink: 0;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
}

.pseudoinstructions-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;

  :deep(thead) {
    flex-shrink: 0;
  }

  :deep(tbody) {
    flex: 1;
    overflow-y: auto;
  }

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

    &.col-syntax {
      min-width: 200px;
    }

    &.col-definition {
      min-width: 250px;
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

.pseudo-name {
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

.syntax-text {
  font-family:
    "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New",
    monospace;
  font-size: 0.8125rem;
  color: rgba(0, 0, 0, 0.7);
}

.definition-text {
  font-family:
    "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New",
    monospace;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  background: rgba(0, 0, 0, 0.02);
  padding: 2px 6px;
  border-radius: 3px;
  display: block;
  white-space: pre-wrap;
}

[data-bs-theme="dark"] {
  .pseudoinstruction-toolbar {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }

  .pseudoinstructions-table {
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

  .pseudo-name {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.08);
  }

  .syntax-text {
    color: rgba(255, 255, 255, 0.7);
  }

  .definition-text {
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.04);
  }
}
</style>
