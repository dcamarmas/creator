<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToggle } from 'bootstrap-vue-next'

import PreloadArchitecture from './select_architecture/PreloadArchitecture.vue'
import LoadArchitecture from './select_architecture/LoadArchitecture.vue'
import DeleteArchitecture from './select_architecture/DeleteArchitecture.vue'

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
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const contactMail = 'creator.arcos.inf.uc3m.es@gmail.com'
const archToDelete = ref<string | null>(null)
const render = ref(0) // dummy variable to force components with this as key to refresh

const showDeleteModal = useToggle('modal-delete-arch').show

const refresh = () => {
  render.value++
}

const availableArchitectures = computed(() =>
  props.arch_available.filter(arch => arch.available)
)

const isFixedBottom = computed(() =>
  props.windowHeight > 800 + 160 * Math.max(3 - props.arch_available.length, 0)
)

const handleSelectArchitecture = (arch_name: string) => {
  emit('select-architecture', arch_name)
}

const handleDeleteArchitecture = (arch_name: string) => {
  archToDelete.value = arch_name
  showDeleteModal()
}
</script>

<template>
  <b-container fluid align-h="center" id="load_menu">
    <!-- Architecture menu -->
    <b-card-group deck id="load_menu_arch" :key="render">
      <!-- Preload architecture card -->
      <PreloadArchitecture
        v-for="arch in availableArchitectures"
        :key="arch.id"
        :architecture="arch"
        :dark="dark"
        @select-architecture="handleSelectArchitecture"
        @delete-architecture="handleDeleteArchitecture"
      />

      <!-- Load new architecture card -->
      <LoadArchitecture @select-architecture="handleSelectArchitecture" />
    </b-card-group>

    <!-- Delete architecture modal -->
    <DeleteArchitecture id="modal-delete-arch" :arch="archToDelete" />

  </b-container>
</template>

<style lang="scss" scoped>
#load_menu {
  height: calc(100vh - 40px); /* Account for navbar height */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Start from top instead of center */
  align-items: center;
  padding: 2rem 0;
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: hidden;
}

#load_menu_arch {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 2rem;
}

.creator-info {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  margin: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);

  &.dark {
    background: rgba(0, 0, 0, 0.8);
    color: white;
  }

  &:not(.fixed-bottom) {
    position: static;
    transform: none;
    margin-top: 2rem;
  }
}

:deep(.selectedCard) {
  border-color: var(--bs-secondary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-secondary-rgb), 0.25);
}
</style>
