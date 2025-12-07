<!--
Copyright 2018-2025 CREATOR Team.

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
import type { Instruction } from "@/core/core";

import InstructionEncoding from "./InstructionEncoding.vue";

export default defineComponent({
  props: {
    instructions: { type: Array as PropType<Instruction[]>, required: true },
  },

  components: { InstructionEncoding },

  data() {
    return {
      // Search and filter
      searchTerm: "",
      selectedProperty: "all",
      selectedType: "all",
    };
  },

  computed: {
    availableProperties() {
      const props = new Set<string>();
      this.instructions.forEach(inst => {
        inst.properties?.forEach(p => props.add(p));
      });
      return Array.from(props).sort();
    },

    availableTypes() {
      const types = new Set<string>();
      this.instructions.forEach(inst => {
        if (inst.type) {
          types.add(inst.type);
        }
      });
      return Array.from(types).sort();
    },

    filteredInstructions() {
      return this.instructions.filter(inst => {
        // Always check if instruction has the required fields
        const matchesSearch =
          !this.searchTerm ||
          (inst.name &&
            inst.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (inst.signature_pretty &&
            inst.signature_pretty
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase()));

        const matchesProperty =
          this.selectedProperty === "all" ||
          (inst.properties && inst.properties.includes(this.selectedProperty));

        const matchesType =
          this.selectedType === "all" ||
          (inst.type && inst.type === this.selectedType);

        return matchesSearch && matchesProperty && matchesType;
      });
    },
  },

  methods: {},
});
</script>

<template>
  <div class="instructions-container">
    <!-- Search Bar and Filters -->
    <div class="instruction-toolbar">
      <b-row class="align-items-center mb-2">
        <b-col>
          <b-form-input
            v-model="searchTerm"
            placeholder="Search instructions..."
            size="sm"
          />
        </b-col>
        <b-col class="text-end">
          <b-badge variant="primary" pill>
            {{ filteredInstructions.length }} / {{ instructions.length }}
          </b-badge>
        </b-col>
      </b-row>
      <b-row class="align-items-center" v-if="availableTypes.length > 0">
        <b-col cols="auto"> <span class="filter-label">Type:</span> </b-col>
        <b-col>
          <b-form-select v-model="selectedType" size="sm" class="type-filter">
            <option value="all">All Types</option>

            <option v-for="type in availableTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </b-form-select>
        </b-col>
      </b-row>
    </div>

    <!-- Instruction cards -->
    <div class="cards-wrapper">
      <div class="instruction-cards">
        <div
          v-for="(instruction, index) in filteredInstructions"
          :key="`${instruction.name}-${instruction.signature_pretty}-${index}`"
          class="instruction-card"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="header-main">
              <div class="mnemonic-section">
                <code class="instruction-name">{{ instruction.name }}</code>
                <div
                  v-if="
                    instruction.properties && instruction.properties.length > 0
                  "
                  class="properties-container"
                >
                  <b-badge
                    v-for="property in instruction.properties"
                    :key="property"
                    class="property-badge"
                    pill
                    variant="info"
                  >
                    {{ property }}
                  </b-badge>
                </div>
              </div>

              <div class="stats-section">
                <div class="stat-item">
                  <span class="stat-label">Words:</span>
                  <span class="stat-value">{{ instruction.nwords }}</span>
                </div>

                <div class="stat-item">
                  <span class="stat-label">Cycles:</span>
                  <span class="stat-value">{{ instruction.clk_cycles }}</span>
                </div>
              </div>
            </div>

            <div class="syntax-section">
              <span class="syntax-label">Syntax</span>
              <code class="syntax-text">{{
                instruction.signature_pretty
              }}</code>
            </div>

            <!-- Help Text -->
            <div v-if="instruction.help" class="description-section">
              <span class="syntax-label">Description</span>
              <div class="help-content">
                <p>{{ instruction.help }}</p>
              </div>
            </div>
          </div>

          <!-- Card Body - Encoding -->
          <div class="card-body">
            <div class="encoding-section">
              <InstructionEncoding :instruction="instruction" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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

.filter-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  white-space: nowrap;
}

.type-filter {
  max-width: 250px;
}

.cards-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 5px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

.instruction-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 16px;
  max-width: 100%;
}

.instruction-card {
  background: var(--bs-body-bg);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.mnemonic-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.instruction-name {
  font-family:
    "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New",
    monospace;
  font-weight: 600;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.9);
  background: rgba(0, 0, 0, 0.06);
  padding: 4px 8px;
  border-radius: 4px;
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

.stats-section {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: 0.6875rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.9);
  font-family:
    "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New",
    monospace;
}

.syntax-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.description-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.syntax-label {
  font-size: 0.6875rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.syntax-text {
  font-family:
    "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New",
    monospace;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.85);
  background: rgba(0, 0, 0, 0.03);
  padding: 6px 10px;
  border-radius: 4px;
  display: block;
}

.help-content {
  padding: 10px 12px;
  background: rgba(13, 110, 253, 0.04);
  border-left: 3px solid rgba(13, 110, 253, 0.4);
  border-radius: 0 4px 4px 0;

  p {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: rgba(0, 0, 0, 0.8);
    white-space: pre-wrap;
  }
}

.card-body {
  padding: 16px;
  background: var(--bs-body-bg);
}

.encoding-section {
  width: 100%;
}

// Responsive breakpoints
@media (max-width: 1400px) {
  .instruction-cards {
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  }
}

@media (max-width: 1200px) {
  .instruction-cards {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
}

@media (max-width: 768px) {
  .instruction-cards {
    grid-template-columns: 1fr;
  }

  .cards-wrapper {
    padding: 8px;
  }

  .header-main {
    flex-direction: column;
    gap: 8px;
  }

  .stats-section {
    width: 100%;
    justify-content: flex-start;
  }
}

[data-bs-theme="dark"] {
  .instruction-toolbar {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }

  .filter-label {
    color: rgba(255, 255, 255, 0.7);
  }

  .cards-wrapper {
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .instruction-card {
    border-color: rgba(255, 255, 255, 0.15);

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.25);
    }
  }

  .card-header {
    background: rgba(255, 255, 255, 0.03);
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }

  .instruction-name {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.08);
  }

  .property-badge {
    background-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }

  .stat-label {
    color: rgba(255, 255, 255, 0.6);
  }

  .stat-value {
    color: rgba(255, 255, 255, 0.95);
  }

  .syntax-label {
    color: rgba(255, 255, 255, 0.6);
  }

  .syntax-text {
    color: rgba(255, 255, 255, 0.85);
    background: rgba(255, 255, 255, 0.04);
  }

  .help-content {
    background: rgba(13, 110, 253, 0.12);
    border-left-color: rgba(13, 110, 253, 0.6);

    .help-label {
      color: rgba(100, 170, 255, 1);
    }

    p {
      color: rgba(255, 255, 255, 0.85);
    }
  }
}
</style>
