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
import type { Instruction } from "@/core/core"

import InstructionEncoding from "./InstructionEncoding.vue"

export default defineComponent({
  props: {
    instructions: { type: Array as PropType<Instruction[]>, required: true },
  },

  components: { InstructionEncoding },

  data() {
    return {
      // Instructions table fields
      instructions_fields: [
        { key: "name", sortable: true, label: "Mnemonic", thClass: "col-name" },
        { key: "signatureRaw", label: "Syntax", thClass: "col-syntax" },
        { key: "encoding", label: "Encoding", thClass: "col-encoding" },
        { key: "nwords", label: "Words", thClass: "col-nwords" },
        { key: "clk_cycles", label: "Cycles", thClass: "col-cycles" },
      ],

      // Search and filter
      searchTerm: "",
      selectedProperty: "all",
    }
  },

  computed: {
    availableProperties() {
      const props = new Set<string>()
      this.instructions.forEach(inst => {
        inst.properties?.forEach(p => props.add(p))
      })
      return Array.from(props).sort()
    },

    filteredInstructions() {
      return this.instructions.filter(inst => {
        const matchesSearch = !this.searchTerm ||
          inst.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          inst.signature_pretty.toLowerCase().includes(this.searchTerm.toLowerCase())

        const matchesProperty = this.selectedProperty === "all" ||
          inst.properties?.includes(this.selectedProperty)

        return matchesSearch && matchesProperty
      })
    },
  },

  methods: {
  },
})
</script>

<template>


  <div class="instructions-container">
    <!-- Search Bar -->
    <div class="instruction-toolbar">
      <b-row class="align-items-center">
        <b-col>
          <b-form-input v-model="searchTerm" placeholder="Search instructions..." size="sm" />
        </b-col>
        <b-col class="text-end">
          <b-badge variant="primary" pill>
            {{ filteredInstructions.length }} / {{ instructions.length }}
          </b-badge>
        </b-col>
      </b-row>
    </div>

    <!-- Instruction set table -->
    <b-table small :items="filteredInstructions" :fields="instructions_fields" class="instructions-table" hover responsive>
      <!-- Name column with monospace font -->
      <template v-slot:cell(name)="row">
        <div>
          <code class="instruction-name">{{ row.item.name }}</code>
          <div v-if="row.item.properties && row.item.properties.length > 0" class="properties-container">
            <b-badge v-for="property in row.item.properties" :key="property" class="property-badge" pill variant="info">
              {{ property }}
            </b-badge>
          </div>
        </div>
      </template>

      <!-- Syntax column -->
      <template v-slot:cell(signatureRaw)="row">
        <span class="syntax-text">{{ row.item.signature_pretty }}</span>
      </template>

      <!-- Encoding visualization -->
      <template v-slot:cell(encoding)="row">
        <InstructionEncoding :instruction="row.item" />
      </template>
    </b-table>
  </div>

</template><style lang="scss" scoped>
.instructions-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.instruction-toolbar {
  flex-shrink: 0;
  background-color: transparent;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
}

.instructions-table {
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
      min-width: 100px;
    }

    &.col-syntax {
      min-width: 200px;
    }

    &.col-encoding {
      min-width: 300px;
    }

    &.col-nwords,
    &.col-cycles {
      min-width: 60px;
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

.instruction-name {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.9);
  background: rgba(0, 0, 0, 0.04);
  padding: 2px 6px;
  border-radius: 3px;
}

.syntax-text {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 0.8125rem;
  color: rgba(0, 0, 0, 0.7);
}

.properties-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.property-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 2px 6px;
  background-color: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 3px;
}

[data-bs-theme="dark"] {
  .instruction-toolbar {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }

  .instructions-table {
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

  .instruction-name {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.08);
  }

  .syntax-text {
    color: rgba(255, 255, 255, 0.7);
  }

  .property-badge {
    background-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
