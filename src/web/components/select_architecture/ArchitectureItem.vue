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
<script setup lang="ts">
interface AvailableArch {
  name: string;
  alias: string[];
  file?: string;
  img?: string;
  alt?: string;
  id: string;
  examples: string[];
  description: string;
  guide?: string;
  available: boolean;
  default?: boolean;
  definition?: string;
}

interface Props {
  arch: AvailableArch;
  selected?: boolean;
  mobile?: boolean;
}

interface Emits {
  (e: "select"): void;
  (e: "delete"): void;
}

withDefaults(defineProps<Props>(), {
  selected: false,
  mobile: false,
});

const emit = defineEmits<Emits>();

function handleSelect() {
  emit("select");
}

function handleDelete(event: Event) {
  event.stopPropagation();
  emit("delete");
}
</script>

<template>
  <div
    class="arch-item"
    :class="{
      selected: selected,
      custom: !arch.default,
      mobile: mobile,
    }"
    @click="handleSelect"
  >
    <div class="arch-logo">
      <img
        :src="`img/logos/${arch.img}` || 'img/logos/default.webp'"
        :alt="arch.alt"
      />
    </div>

    <div class="arch-info">
      <div class="arch-header">
        <h3 class="arch-name">{{ arch.name }}</h3>

        <div class="arch-badges">
          <span v-if="!arch.default" class="badge custom-badge">Custom</span>
        </div>
      </div>

      <p class="arch-description">{{ arch.description }}</p>
    </div>

    <div class="arch-actions">
      <button
        v-if="!arch.default"
        class="action-button delete-button"
        @click="handleDelete"
        :title="mobile ? 'Delete' : 'Delete custom architecture'"
      >
        <font-awesome-icon :icon="['fas', 'trash-can']" />
      </button>
      <div class="select-indicator">
        <font-awesome-icon :icon="['fas', 'chevron-right']" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.arch-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: rgba(var(--bs-secondary-rgb), 0.05);
  border: 2px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;

  &:hover:not(.mobile) {
    background-color: rgba(var(--bs-primary-rgb), 0.08);
    border-color: rgba(var(--bs-primary-rgb), 0.3);
  }

  &.selected {
    background-color: rgba(var(--bs-primary-rgb), 0.15);
    border-color: var(--bs-primary);
    box-shadow: 0 4px 12px rgba(var(--bs-primary-rgb), 0.2);
  }

  // Mobile specific styles
  &.mobile {
    background-color: transparent;
    border: none;
    color: #6c757d;
    padding: 1rem;
    margin-bottom: 0.5rem;

    [data-bs-theme="dark"] & {
      color: #adb5bd;
    }

    &:active {
      color: #2196f3;
      background-color: rgba(33, 150, 243, 0.08);
      transform: scale(0.98);

      [data-bs-theme="dark"] & {
        color: #64b5f6;
        background-color: rgba(100, 181, 246, 0.12);
      }
    }
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

  .arch-item.mobile & {
    width: 48px;
    height: 48px;
    padding: 0.375rem;
  }
}

.arch-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .arch-item.mobile & {
    gap: 0.25rem;
  }
}

.arch-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.arch-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--bs-body-color);

  .arch-item.mobile & {
    font-size: 1rem;
    line-height: 1.3;
    color: inherit;
  }
}

.arch-badges {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.badge {
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &.custom-badge {
    background-color: rgba(var(--bs-warning-rgb), 0.2);
    color: var(--bs-warning);
    border: 1px solid rgba(var(--bs-warning-rgb), 0.4);
  }
}

.arch-description {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(var(--bs-body-color-rgb), 0.7);
  line-height: 1.4;

  .arch-item.mobile & {
    font-size: 0.85rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
    color: var(--bs-body-color-secondary);
  }
}

.arch-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  color: rgba(var(--bs-body-color-rgb), 0.6);

  &:hover {
    background-color: rgba(var(--bs-danger-rgb), 0.15);
    color: var(--bs-danger);
  }

  &:active {
    transform: scale(0.95);
  }

  .arch-item.mobile & {
    &:active {
      background-color: rgba(var(--bs-danger-rgb), 0.2);
      color: var(--bs-danger);
    }
  }
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

  .arch-item:hover:not(.mobile) & {
    background-color: var(--bs-primary);
    color: white;
  }

  .arch-item.mobile & {
    background-color: transparent;
    color: var(--bs-body-color-secondary);
    opacity: 0.6;
    font-size: 0.9rem;
  }

  .arch-item.mobile:active & {
    color: #2196f3;
    opacity: 1;

    [data-bs-theme="dark"] & {
      color: #64b5f6;
    }
  }
}

// Dark Theme
[data-bs-theme="dark"] {
  .arch-item:not(.mobile) {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);

    &:hover {
      background-color: rgba(var(--bs-primary-rgb), 0.15);
      border-color: rgba(var(--bs-primary-rgb), 0.5);
    }

    &.selected {
      background-color: rgba(var(--bs-primary-rgb), 0.25);
    }
  }
}

// Touch-friendly mobile adjustments
@media (hover: none) and (pointer: coarse) {
  .arch-item.mobile {
    min-height: 72px;
    padding: 1.25rem;

    .arch-logo {
      width: 50px;
      height: 50px;
      padding: 0.4rem;
    }

    .arch-name {
      font-size: 1rem;
    }

    .arch-description {
      font-size: 0.85rem;
    }
  }
}

// Responsive adjustments for small mobile screens
@media (max-width: 480px) {
  .arch-item.mobile {
    padding: 0.875rem;
    margin-bottom: 0.25rem;

    .arch-logo {
      width: 44px;
      height: 44px;
      padding: 0.35rem;
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
