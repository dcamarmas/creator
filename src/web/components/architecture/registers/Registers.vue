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

import { toHex } from "@/web/utils.mjs";
import type { Register } from "@/core/core";

export default defineComponent({
  props: {
    registers: { type: Array as PropType<Register[]>, required: true },
    register_file_index: { type: Number, required: true },
  },

  methods: { toHex },
});
</script>

<style lang="scss" scoped>
@import "bootstrap/scss/bootstrap";

.registers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.75rem 0;
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  @media (min-width: 1600px) {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

.register-card {
  background: var(--bs-body-bg);
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.375rem;
  padding: 1rem;
  transition: box-shadow 0.15s ease-in-out;

  &:hover {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }

  [data-bs-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.125);
    background: var(--bs-body-bg);
  }
}

.register-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.register-names {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--bs-body-color);
  word-break: break-word;
}

.register-id {
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  font-weight: 500;
}

.register-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.register-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  font-weight: 500;
}

.info-value {
  font-size: 0.875rem;
  color: var(--bs-body-color);
  font-weight: 600;
}

.register-properties {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.property-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background-color: rgba(0, 123, 255, 0.1);
  color: #007bff;
  border: 1px solid rgba(0, 123, 255, 0.2);

  [data-bs-theme="dark"] & {
    background-color: rgba(0, 123, 255, 0.2);
    color: #4dabf7;
    border-color: rgba(0, 123, 255, 0.3);
  }
}
</style>

<template>
  <div class="registers-grid" v-if="registers.length > 0">
    <div
      v-for="(register, index) in registers"
      :key="index"
      class="register-card"
    >
      <div class="register-header">
        <div class="register-names">{{ register.name.join(" / ") }}</div>

        <div class="register-id">#{{ index }}</div>
      </div>

      <div class="register-details">
        <div class="register-info">
          <span class="info-label">Bits:</span>
          <span class="info-value">{{ register.nbits }}</span>
        </div>

        <div class="register-info">
          <span class="info-label">Default:</span>
          <span class="info-value font-monospace"
            >0x{{ toHex(register.default_value, 4) }}</span
          >
        </div>
      </div>

      <div
        class="register-properties"
        v-if="register.properties && register.properties.length > 0"
      >
        <b-badge
          v-for="property in register.properties"
          :key="property"
          pill
          variant="primary"
          class="property-badge"
        >
          {{ property }}
        </b-badge>
      </div>
    </div>
  </div>
</template>
