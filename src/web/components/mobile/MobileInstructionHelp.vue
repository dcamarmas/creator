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

// import available_arch from "#/architecture/available_arch.json"
import available_arch from "../../../../architecture/available_arch.json";
import { architecture } from "@/core/core.mjs";

export default defineComponent({
  props: {
    id: { type: String, required: true },
    architecture_name: { type: String, required: true },
  },

  data() {
    return {
      // help Filter
      instHelpFilter: "",

      // help table
      insHelpFields: ["name"],

      instructions: architecture.instructions,
    };
  },

  computed: {
    architecture_guide() {
      return available_arch.find(
        arch =>
          arch.name === this.architecture_name ||
          arch.alias.includes(this.architecture_name),
      )?.guide;
    },

    filteredInstructions() {
      if (!this.instHelpFilter) {
        return this.instructions;
      }
      const filter = this.instHelpFilter.toLowerCase();
      return this.instructions.filter(
        instruction =>
          instruction.name.toLowerCase().includes(filter) ||
          (instruction.help &&
            instruction.help.toLowerCase().includes(filter)) ||
          instruction.signature_definition.toLowerCase().includes(filter),
      );
    },
  },
});
</script>

<template>
  <b-modal
    :id="id"
    class="bottomCard"
    title="Instruction Help"
    size="lg"
    centered
    scrollable
  >
    <b-form-input
      id="filter-input-mobile"
      v-model="instHelpFilter"
      type="search"
      placeholder="Search instruction"
      size="sm"
      class="mb-3"
    />
    <a
      v-if="architecture_guide"
      target="_blank"
      :href="architecture_guide"
      class="d-block mb-3"
    >
      <font-awesome-icon :icon="['fas', 'file-pdf']" />
      {{ architecture_name }} Guide
    </a>

    <div class="instruction-list">
      <div
        v-for="instruction in filteredInstructions"
        :key="instruction.name"
        class="instruction-item mb-3 p-3 border rounded"
      >
        <h5 class="instruction-name">{{ instruction.name }}</h5>

        <p class="instruction-signature text-muted mb-2">
          <em>{{ instruction.signature_definition }}</em>
        </p>

        <p class="instruction-help">{{ instruction.help }}</p>
      </div>

      <div
        v-if="filteredInstructions.length === 0"
        class="text-center text-muted"
      >
        No instructions found matching "{{ instHelpFilter }}"
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss" scoped>
.instruction-list {
  max-height: 60vh;
  overflow-y: auto;
}

.instruction-item {
  background-color: var(--bs-body-bg);
  border-color: var(--bs-border-color) !important;

  [data-bs-theme="dark"] & {
    background-color: hsl(214, 9%, 15%);
  }

  .instruction-name {
    color: var(--bs-primary);
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .instruction-signature {
    font-family: "Courier New", monospace;
    font-size: 0.9rem;
  }

  .instruction-help {
    font-size: 0.9rem;
    line-height: 1.4;
  }
}

// Mobile optimizations
@media (max-width: 576px) {
  .instruction-item {
    padding: 0.75rem;

    .instruction-name {
      font-size: 1.1rem;
    }

    .instruction-signature {
      font-size: 0.85rem;
    }

    .instruction-help {
      font-size: 0.85rem;
    }
  }
}
</style>
