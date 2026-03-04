<template>
  <div
    ref="menuRef"
    :class="['config-menu', 'menu-panel', 'bg-white', 'border', 'rounded-3', 'shadow-sm', 'p-3', isDark ? 'bg-dark text-light' : 'bg-white']"
    style="width: 240px; min-height: 150px; z-index: 1000;"
  >
    <div v-for="category in filteredCategories" :key="category.name" class="mb-4">
      <div class="fw-bold fs-6 mb-2">{{ category.name }}</div>
      <hr class="my-2" />
      <div class="d-flex flex-column gap-1">
        <button
          v-for="item in category.items"
          :key="item.label"
          :ref="item.label === 'Color' ? setColorButtonRef : null"
          class="btn btn-light text-start d-flex align-items-center mb-1"
          :class="{ active: selectedItem === item.label }"
          type="button"
          @click="onItemClick(item.label)"
        >
          <fa-icon :icon="item.icon" class="me-2" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>

    <!-- Popup anclado a la posición del botón -->
    <ColorPickerPopup
      v-if="selectedItem === 'Color'"
      ref="colorPickerRef"
      :modelValue="selectedColor"
      :position="popupPosition"
      :width="menuWidth"
      @update:modelValue="onColorChange"
      @close="selectedItem = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch, defineExpose } from 'vue'
import ColorPickerPopup from './ColorPickerPopup.vue'
const menuRef = ref<HTMLElement | null>(null)
const menuWidth = ref(0)

const selectedItem = ref<string | null>(null)
const selectedColor = ref('#000000')
const popupPosition = ref({ x: 0, y: 0 })
const emit = defineEmits(['sound', 'flip', 'rotate','delete']) 

const categories = ref([
  {
    name: 'Settings',
    items: [
      { label: 'Sound', icon: 'music' },
      { label: 'Flip', icon: 'right-left' },
      { label: 'Rotate', icon: 'rotate' },
      { label: 'Delete', icon: 'trash' },
    ],
  },
])

const filteredCategories = computed(() => categories.value)

const colorButtonRef = ref<HTMLElement | null>(null)
const colorPickerRef = ref<HTMLElement | null>(null)
defineExpose({ colorPickerRef })

const setColorButtonRef = (el: HTMLElement | null) => {
  if (el) colorButtonRef.value = el
}

const isMuted = ref(false) 

const onItemClick = async (label: string) => {
  if (label === 'Sound') {
    isMuted.value = !isMuted.value
    emit('sound')
    // Cambia el icono según el estado de muteo
    categories.value.forEach(category => {
      category.items.forEach(item => {
        if (item.label === 'Sound') {
          item.icon = isMuted.value ? 'volume-xmark' : 'music'
        }
      })
    })
    return
  }
  if (label === 'Flip') {
    emit('flip') 
    return
  }
  if (label === 'Rotate') {
    emit('rotate')
    return
  }
  if (label === 'Delete') { 
    emit('delete'); 
    return 
  }
  selectedItem.value = selectedItem.value === label ? null : label
}
const onColorChange = (color: string) => {
  selectedColor.value = color
  emit('update:modelValue', color)
}

onMounted(() => {
  nextTick(() => {
    if (menuRef.value) {
      const rect = menuRef.value.getBoundingClientRect()
      menuWidth.value = rect.width
      popupPosition.value = { x: rect.left, y: rect.bottom }
    }
  })
})

// Si quieres modo oscuro automático:
const isDark = ref(document.body.classList.contains('dark-mode') || document.querySelector('#app-main')?.classList.contains('dark-mode'))

function updateDarkMode() {
  isDark.value = document.body.classList.contains('dark-mode') || document.querySelector('#app-main')?.classList.contains('dark-mode')
}

onMounted(() => {
  const observer = new MutationObserver(updateDarkMode)
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  const appMain = document.querySelector('#app-main')
  if (appMain) {
    observer.observe(appMain, { attributes: true, attributeFilter: ['class'] })
  }
  // Limpieza
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<style>
.menu-panel {
  font-size: 1rem;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.10);
  color: #212529;
  border: 1px solid #dee2e6;
}
.menu-panel.bg-dark {
  background: #23272b !important;
  color: #f8f9fa !important;
  border-color: #343a40 !important;
}
.menu-panel .btn.active,
.menu-panel .btn:active {
  background-color: #e2e6ea !important;
  color: #212529 !important;
}
.menu-panel.bg-dark .btn {
  background: #343a40 !important;
  color: #f8f9fa !important;
  border-color: #495057 !important;
}
.menu-panel.bg-dark .btn.active,
.menu-panel.bg-dark .btn:active {
  background-color: #495057 !important;
  color: #fff !important;
}
.menu-panel .btn:hover {
  background: #1e40af !important;
  color: #fff !important;
}
</style>
