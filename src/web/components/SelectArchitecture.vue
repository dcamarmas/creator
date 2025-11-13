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
<script setup lang="ts">
import { ref, computed } from "vue";

import ArchitectureItem from "./select_architecture/ArchitectureItem.vue";
import DeleteArchitecture from "./select_architecture/DeleteArchitecture.vue";
import { useArchitectureSelect } from "@/web/composables/useArchitectureSelect";
import {
  useArchitectureUpload,
  type AvailableArch,
} from "@/web/composables/useArchitectureUpload";

interface Props {
  arch_available: AvailableArch[];
  browser: string;
  os: string;
  dark: boolean;
  windowHeight: number;
}

interface Emits {
  (e: "select-architecture", arch_name: string): void;
  (e: "architecture-deleted", arch_name: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const hoveredArch = ref<string | null>(null);

const availableArchitectures = computed(() =>
  props.arch_available.filter(arch => arch.available),
);

// Use composables for shared logic
const {
  selectedArch,
  archToDelete,
  showDeleteModal,
  handleSelectArchitecture,
  handleDeleteArchitecture,
  handleArchitectureDeleted,
} = useArchitectureSelect(
  arch_name => emit("select-architecture", arch_name),
  arch_name => emit("architecture-deleted", arch_name),
);

const {
  showLoadModal,
  customArchName,
  customArchDescription,
  customArchFile,
  openLoadArchModal,
  loadCustomArch,
} = useArchitectureUpload(arch_name => emit("select-architecture", arch_name));
</script>

<template>

  <div class="architecture-selector" :class="{ dark: dark }">

    <div class="selector-container">
       <!-- Architecture List -->
      <div class="architecture-list">
         <!-- Default and Custom Architectures --> <ArchitectureItem
          v-for="arch in availableArchitectures"
          :key="arch.id"
          :arch="arch"
          :selected="selectedArch === arch.name"
          @select="handleSelectArchitecture(arch)"
          @delete="handleDeleteArchitecture(arch.name)"
        /> <!-- Load Custom Architecture Button -->
        <div
          class="arch-item load-custom"
          @click="openLoadArchModal"
          @mouseenter="hoveredArch = 'load-custom'"
          @mouseleave="hoveredArch = null"
        >

          <div class="arch-logo load-logo">
             <font-awesome-icon :icon="['fas', 'file-import']" />
          </div>

          <div class="arch-info">

            <h3 class="arch-name">Load Custom Architecture</h3>

            <p class="arch-description">
               Import your own architecture definition file (.yml)
            </p>

          </div>

          <div class="arch-actions">

            <div class="select-indicator">
               <font-awesome-icon :icon="['fas', 'plus']" />
            </div>

          </div>

        </div>

      </div>

    </div>
     <!-- Load Custom Architecture Modal --> <b-modal
      v-model="showLoadModal"
      title="Load Custom Architecture"
      @ok="loadCustomArch"
      > <b-form
        > <b-form-group label="Architecture Name" label-for="arch-name"
          > <b-form-input
            id="arch-name"
            v-model="customArchName"
            placeholder="Enter architecture name"
            required
          /> </b-form-group
        > <b-form-group label="Description" label-for="arch-description"
          > <b-form-textarea
            id="arch-description"
            v-model="customArchDescription"
            placeholder="Enter architecture description"
            rows="3"
          /> </b-form-group
        > <b-form-group label="Architecture File" label-for="arch-file"
          > <b-form-file
            id="arch-file"
            v-model="customArchFile"
            accept=".yml"
            placeholder="Choose a .yml file..."
            required
          /> </b-form-group
        > </b-form
      > </b-modal
    > <!-- Delete Architecture Modal --> <DeleteArchitecture
      id="modal-delete-arch"
      v-model="showDeleteModal"
      :arch="archToDelete"
      @architecture-deleted="handleArchitectureDeleted"
    />
  </div>

</template>

<style lang="scss" scoped>
.architecture-selector {
  height: calc(100vh - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow: hidden;
  background: var(--bs-body-bg);
}

.selector-container {
  width: 100%;
  max-width: 900px;
  height: 100%;
  max-height: 1000px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Architecture List */
.architecture-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-right: 0.5rem;

  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 148, 158, 0.3) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(139, 148, 158, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(139, 148, 158, 0.5);
  }
}

/* Load Custom Architecture Item */
.arch-item.load-custom {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: rgba(var(--bs-secondary-rgb), 0.05);
  border: 2px dashed rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  &:hover {
    background-color: rgba(var(--bs-primary-rgb), 0.08);
    border-color: rgba(var(--bs-primary-rgb), 0.3);
    border-style: solid;
  }
}

.load-logo {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  border-radius: 8px;
  
  svg {
    font-size: 2rem;
    color: var(--bs-primary);
  }
}

.arch-logo {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 0.5rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.arch-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.arch-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--bs-body-color);
}

.arch-description {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(var(--bs-body-color-rgb), 0.7);
  line-height: 1.4;
}

.arch-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.select-indicator {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  color: var(--bs-primary);
  font-size: 1rem;
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);

  .arch-item:hover & {
    background-color: var(--bs-primary);
    color: white;
  }
}

/* Dark Theme */
.architecture-selector.dark {
  .arch-item.load-custom {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);

    &:hover {
      background-color: rgba(var(--bs-primary-rgb), 0.15);
      border-color: rgba(var(--bs-primary-rgb), 0.5);
    }
  }

  .load-logo {
    background-color: rgba(var(--bs-primary-rgb), 0.2);
  }
}
</style>

