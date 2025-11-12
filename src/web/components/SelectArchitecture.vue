<script setup lang="ts">
import { ref, computed } from 'vue'
import { type BvTriggerableEvent } from 'bootstrap-vue-next'

import DeleteArchitecture from './select_architecture/DeleteArchitecture.vue'
import { loadDefaultArchitecture, loadCustomArchitecture, show_notification } from '@/web/utils.mjs'
import { initCAPI } from '@/core/capi/initCAPI.mts'
import { architecture } from '@/core/core'

interface AvailableArch {
  name: string
  alias: string[]
  file?: string
  img?: string
  alt?: string
  id: string
  examples: string[]
  description: string
  guide?: string
  available: boolean
  default?: boolean
  definition?: string
}

interface Props {
  arch_available: AvailableArch[]
  browser: string
  os: string
  dark: boolean
  windowHeight: number
}

interface Emits {
  (e: 'select-architecture', arch_name: string): void
  (e: 'architecture-deleted', arch_name: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const archToDelete = ref<string | null>(null)
const hoveredArch = ref<string | null>(null)
const selectedArch = ref<string | null>(null)

// Delete modal control
const showDeleteModal = ref(false)

// Load custom architecture modal
const showLoadModal = ref(false)
const customArchName = ref('')
const customArchDescription = ref('')
const customArchFile = ref<File | null>(null)

const availableArchitectures = computed(() =>
  props.arch_available.filter(arch => arch.available)
)

const handleSelectArchitecture = async (arch: AvailableArch) => {
  selectedArch.value = arch.name
  
  if (arch.default) {
    await loadDefaultArchitecture(arch as any)
  } else {
    loadCustomArchitecture(arch as any)
  }
  
  const pluginName = architecture.config.plugin
  initCAPI(pluginName)
  
  emit('select-architecture', arch.name)
}

const handleDeleteArchitecture = (arch_name: string) => {
  archToDelete.value = arch_name
  showDeleteModal.value = true
}

const handleArchitectureDeleted = (arch_name: string) => {
  emit('architecture-deleted', arch_name)
}

const openLoadArchModal = () => {
  showLoadModal.value = true
}

const loadCustomArch = (event: BvTriggerableEvent) => {
  event.preventDefault()

  if (!customArchFile.value || !customArchName.value) {
    show_notification('Please provide both a name and a file', 'danger')
    return
  }

  const reader = new FileReader()
  reader.onload = _event => {
    const archDefinition = reader.result as string

    const newArchitecture: AvailableArch = {
      name: customArchName.value,
      alias: [],
      id: `select_conf${customArchName.value}`,
      examples: [],
      description: customArchDescription.value,
      definition: archDefinition,
      available: true,
      default: false,
    }

    // Add to localStorage
    const customArchs = JSON.parse(localStorage.getItem('customArchitectures') || '[]')
    customArchs.unshift(newArchitecture)
    localStorage.setItem('customArchitectures', JSON.stringify(customArchs))

    // Load architecture
    loadCustomArchitecture(newArchitecture)

    // Notify architecture has been selected
    emit('select-architecture', customArchName.value)

    // Close modal and clean form
    showLoadModal.value = false
    customArchName.value = ''
    customArchDescription.value = ''
    customArchFile.value = null
  }

  reader.onerror = () => show_notification('Error loading file', 'danger')
  reader.readAsText(customArchFile.value)
}
</script>

<template>
  <div class="architecture-selector" :class="{ dark: dark }">
    <div class="selector-container">

      <!-- Architecture List -->
      <div class="architecture-list">
        <!-- Default Architectures -->
        <div 
          v-for="arch in availableArchitectures" 
          :key="arch.id"
          class="arch-item"
          :class="{ 
            selected: selectedArch === arch.name,
            custom: !arch.default
          }"
          @click="handleSelectArchitecture(arch)"
          @mouseenter="hoveredArch = arch.name"
          @mouseleave="hoveredArch = null"
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
              @click.stop="handleDeleteArchitecture(arch.name)"
              title="Delete custom architecture"
            >
              <font-awesome-icon :icon="['fas', 'trash-can']" />
            </button>
            <div class="select-indicator">
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </div>
          </div>
        </div>

        <!-- Load Custom Architecture Button -->
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
            <p class="arch-description">Import your own architecture definition file (.yml)</p>
          </div>

          <div class="arch-actions">
            <div class="select-indicator">
              <font-awesome-icon :icon="['fas', 'plus']" />
            </div>
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

/* Header */
.selector-header {
  flex-shrink: 0;
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--bs-body-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  svg {
    color: var(--bs-primary);
    font-size: 1.25rem;
  }
}

.subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(var(--bs-body-color-rgb), 0.7);
  font-weight: 400;
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

/* Architecture Item */
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

  &:hover {
    background-color: rgba(var(--bs-primary-rgb), 0.08);
    border-color: rgba(var(--bs-primary-rgb), 0.3);
  }

  &.selected {
    background-color: rgba(var(--bs-primary-rgb), 0.15);
    border-color: var(--bs-primary);
    box-shadow: 0 4px 12px rgba(var(--bs-primary-rgb), 0.2);
  }

  &.load-custom {
    border-style: dashed;
    
    &:hover {
      border-style: solid;
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

  &.load-logo {
    background-color: rgba(var(--bs-primary-rgb), 0.1);
    
    svg {
      font-size: 2rem;
      color: var(--bs-primary);
    }
  }
}

.arch-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

  &.guide-badge {
    background-color: rgba(var(--bs-info-rgb), 0.2);
    color: var(--bs-info);
    border: 1px solid rgba(var(--bs-info-rgb), 0.4);
  }
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
  .selector-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .arch-item {
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

  .arch-logo {

    &.load-logo {
      background-color: rgba(var(--bs-primary-rgb), 0.2);
    }
  }
}
</style>
