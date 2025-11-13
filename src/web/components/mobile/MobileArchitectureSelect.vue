<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
                    Alejandro Calderon Mateos, Jorge Ramos Santana

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
import ArchitectureItem from "../select_architecture/ArchitectureItem.vue"
import DeleteArchitecture from "../select_architecture/DeleteArchitecture.vue"
import { useArchitectureSelect } from '@/web/composables/useArchitectureSelect'
import { useArchitectureUpload, type AvailableArch } from '@/web/composables/useArchitectureUpload'

export default defineComponent({
  components: {
    ArchitectureItem,
    DeleteArchitecture,
  },

  props: {
    arch_available: { type: Array as PropType<AvailableArch[]>, required: true },
    dark: { type: [Boolean, null], required: true },
  },

  emits: [
    "select-architecture", // architecture has been selected
    "architecture-deleted", // custom architecture has been deleted
  ],

  setup(_props, { emit }) {
    // Use composables for shared logic
    const {
      archToDelete,
      showDeleteModal,
      handleSelectArchitecture,
      handleDeleteArchitecture,
      handleArchitectureDeleted,
    } = useArchitectureSelect(
      (arch_name: string) => emit("select-architecture", arch_name),
      (arch_name: string) => emit("architecture-deleted", arch_name)
    )

    const {
      showLoadModal,
      customArchName,
      customArchDescription,
      customArchFile,
      openLoadArchModal,
      loadCustomArch,
    } = useArchitectureUpload((arch_name: string) => emit('select-architecture', arch_name))

    return {
      archToDelete,
      showDeleteModal,
      handleSelectArchitecture,
      handleDeleteArchitecture,
      handleArchitectureDeleted,
      showLoadModal,
      customArchName,
      customArchDescription,
      customArchFile,
      openLoadArchModal,
      loadCustomArch,
    }
  },

  computed: {
    availableArchitectures() {
      return this.arch_available.filter(arch => arch.available)
    },
  },
})
</script>

<template>
  <div class="mobile-arch-select">
    <div class="mobile-arch-header">
      <h2 class="arch-title">
        <font-awesome-icon :icon="['fas', 'microchip']" />
        Select Architecture
      </h2>
      <p class="arch-subtitle">Choose an architecture to start programming</p>
    </div>

    <div class="mobile-arch-list">
      <!-- Architecture Items -->
      <ArchitectureItem
        v-for="arch in availableArchitectures"
        :key="arch.id"
        :arch="arch"
        :mobile="true"
        @select="handleSelectArchitecture(arch)"
        @delete="handleDeleteArchitecture(arch.name)"
      />

      <!-- Load Custom Architecture Button -->
      <div 
        class="arch-item load-custom"
        @click="openLoadArchModal"
      >
        <div class="arch-logo load-logo">
          <font-awesome-icon :icon="['fas', 'file-import']" />
        </div>
        
        <div class="arch-info">
          <h3 class="arch-name">Load Custom Architecture</h3>
          <p class="arch-description">Import your own architecture definition file (.yml)</p>
        </div>

        <div class="arch-actions">
          <div class="select-indicator">
            <font-awesome-icon :icon="['fas', 'plus']" />
          </div>
        </div>
      </div>
    </div>

    <!-- Load Custom Architecture Modal -->
    <b-modal 
      v-model="showLoadModal" 
      title="Load Custom Architecture" 
      @ok="loadCustomArch"
    >
      <b-form>
        <b-form-group label="Architecture Name" label-for="arch-name">
          <b-form-input
            id="arch-name"
            v-model="customArchName"
            placeholder="Enter architecture name"
            required
          />
        </b-form-group>

        <b-form-group label="Description" label-for="arch-description">
          <b-form-textarea
            id="arch-description"
            v-model="customArchDescription"
            placeholder="Enter architecture description"
            rows="3"
          />
        </b-form-group>

        <b-form-group label="Architecture File" label-for="arch-file">
          <b-form-file
            id="arch-file"
            v-model="customArchFile"
            accept=".yml"
            placeholder="Choose a .yml file..."
            required
          />
        </b-form-group>
      </b-form>
    </b-modal>

    <!-- Delete Architecture Modal -->
    <DeleteArchitecture 
      id="modal-delete-arch-mobile" 
      v-model="showDeleteModal"
      :arch="archToDelete"
      @architecture-deleted="handleArchitectureDeleted"
    />
  </div>
</template>

<style lang="scss" scoped>
.mobile-arch-select {
  position: fixed;
  top: env(safe-area-inset-top);
  left: 0;
  right: 0;
  bottom: env(safe-area-inset-bottom); // Full height with safe area
  background-color: var(--bs-body-bg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none; // Prevent text selection on mobile

  // Dark mode support
  [data-bs-theme="dark"] & {
    background-color: hsl(214, 9%, 12%);
  }
}

.mobile-arch-header {
  padding: 1.5rem 1rem 1rem;
  text-align: center;
  border-bottom: 1px solid var(--bs-border-color);

  .arch-title {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--bs-body-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;

    svg {
      color: var(--bs-primary);
    }
  }

  .arch-subtitle {
    margin: 0;
    font-size: 0.95rem;
    color: var(--bs-body-color-secondary);
    opacity: 0.8;
  }
}

.mobile-arch-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }

  [data-bs-theme="dark"] & {
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

/* Load Custom Architecture Item */
.arch-item.load-custom {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: transparent;
  border: 2px dashed rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  color: #6c757d;
  margin-bottom: 0.5rem;
  
  [data-bs-theme="dark"] & {
    color: #adb5bd;
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:active {
    color: #2196f3;
    background-color: rgba(33, 150, 243, 0.08);
    border-color: rgba(33, 150, 243, 0.3);
    border-style: solid;
    transform: scale(0.98);

    [data-bs-theme="dark"] & {
      color: #64b5f6;
      background-color: rgba(100, 181, 246, 0.12);
    }
  }
}

.load-logo {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  border-radius: 8px;
  
  svg {
    font-size: 1.5rem;
    color: var(--bs-primary);
  }
}

.arch-logo {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
}

.arch-info {
  flex: 1;
  min-width: 0;

  .arch-name {
    margin: 0 0 0.25rem;
    font-size: 1rem;
    font-weight: 600;
    color: inherit;
    line-height: 1.3;
  }

  .arch-description {
    margin: 0;
    font-size: 0.85rem;
    color: var(--bs-body-color-secondary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
  }
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
  color: var(--bs-body-color-secondary);
  opacity: 0.6;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  .arch-item:active & {
    color: #2196f3;
    opacity: 1;

    [data-bs-theme="dark"] & {
      color: #64b5f6;
    }
  }
}

// Touch-friendly interactions
@media (hover: none) and (pointer: coarse) {
  .arch-item.load-custom {
    min-height: 72px;
    padding: 1.25rem;

    .load-logo {
      width: 50px;
      height: 50px;
    }

    .arch-name {
      font-size: 1rem;
    }

    .arch-description {
      font-size: 0.85rem;
    }
  }
}

// Responsive adjustments
@media (max-width: 480px) {
  .mobile-arch-header {
    padding: 1rem 0.75rem 0.75rem;

    .arch-title {
      font-size: 1.3rem;
    }

    .arch-subtitle {
      font-size: 0.9rem;
    }
  }

  .mobile-arch-list {
    padding: 0.25rem;
  }

  .arch-item.load-custom {
    padding: 0.875rem;
    margin-bottom: 0.25rem;

    .load-logo {
      width: 44px;
      height: 44px;
    }

    .arch-name {
      font-size: 0.95rem;
    }

    .arch-description {
      font-size: 0.8rem;
    }

    .select-indicator {
      font-size: 0.8rem;
    }
  }
}
</style>