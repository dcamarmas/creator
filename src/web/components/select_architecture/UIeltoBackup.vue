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
import { defineComponent } from "vue";

import { loadArchitecture, architecture } from "@/core/core.mjs";
import { initCAPI } from "@/core/capi/initCAPI.mts";
import { formatRelativeDate } from "@/web/utils.mjs";

export default defineComponent({
  props: {
    id: { type: String, required: true },
  },

  emits: ["load-architecture"], // event to signal an architecture has been loaded

  data() {
    return {
      show_modal: localStorage.getItem("backup_timestamp") !== null,

      backup_date: new Date(
        parseInt(localStorage.getItem("backup_timestamp")!, 10),
      ),
      backup_arch_name: localStorage.getItem("backup_arch_name"),
    };
  },

  methods: {
    // Load backup from cache
    load_copy() {
      // Load architecture from cache
      (this.$root as any).arch_code = localStorage.getItem("backup_arch") || "";
      loadArchitecture((this.$root as any).arch_code);
      (this.$root as any).architecture_name =
        localStorage.getItem("backup_arch_name");

      // Initialize CAPI with the plugin name from the loaded architecture
      const pluginName = architecture.config.plugin;
      initCAPI(pluginName);

      // Load the last assembly code from cache
      (this.$root as any).assembly_code = localStorage.getItem("backup_asm");

      this.$emit("load-architecture", this.backup_arch_name); // notify arch loaded

      this.show_modal = false;
    },

    // Delete backup on cache
    remove_copy() {
      localStorage.removeItem("backup_arch_name");
      localStorage.removeItem("backup_arch");
      localStorage.removeItem("backup_asm");
      localStorage.removeItem("backup_timestamp");

      this.show_modal = false;
    },

    formatRelativeDate,
  },
});
</script>

<template>
  <b-modal
    :id="id"
    v-model="show_modal"
    hide-header
    size="md"
    no-header
    no-footer
    centered
  >
    <div class="backup-modal-content">
      <div class="backup-header mb-3">
        <h4 class="mb-1 fw-semibold">Backup Available</h4>
        <p class="text-muted mb-0">A previous session was found</p>
      </div>

      <div class="backup-details p-3 mb-3">
        <div class="d-flex align-items-center mb-2">
          <strong class="me-2">Architecture:</strong>
          <code class="backup-arch-name">{{ backup_arch_name }}</code>
        </div>
        <div class="d-flex flex-column">
          <small class="text-muted">
            <strong>Saved:</strong> {{ formatRelativeDate(backup_date) }}
          </small>
          <small class="text-muted">
            {{ backup_date.toLocaleDateString() }} at
            {{ backup_date.toLocaleTimeString() }}
          </small>
        </div>
      </div>

      <div class="backup-actions d-flex gap-2">
        <b-button variant="outline-secondary" class="flex-fill" @click="remove_copy">

          Discard
        </b-button>
        <b-button variant="primary" class="flex-fill" @click="load_copy">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="me-1"
            viewBox="0 0 16 16"
          >
            <path
              d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
            />
            <path
              d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"
            />
          </svg>
          Restore Backup
        </b-button>
      </div>
    </div>
  </b-modal>
</template>

<style scoped>
.backup-modal-content {
  padding: 1rem;
}

.backup-header {
  text-align: center;
}

.backup-icon {
  opacity: 0.9;
}

.backup-details {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.backup-arch-name {
  background-color: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  color: #495057;
  font-size: 0.9rem;
}

.backup-actions .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1rem;
  font-weight: 500;
}

.backup-actions .btn svg {
  vertical-align: middle;
}

@media (prefers-color-scheme: dark) {
  .backup-details {
    background-color: #212529;
    border-color: #495057;
  }

  .backup-arch-name {
    background-color: #343a40;
    color: #dee2e6;
  }
}
</style>
