<template>
  <div
    class="menu-panel bg-white border rounded shadow-sm p-2"
    :class="{ 'bg-dark text-light': isDark }"
    style="max-height: 150px; overflow-y: auto; width: auto; min-width: 100px;"
  >
    <div v-for="category in filteredCategories" :key="category.name" class="mb-1">
      <div class="d-flex align-items-center justify-content-between mb-1">
        <span class="fw-bold fs-6">{{ category.name }}</span>
        <button
          class="btn btn-sm p-0 border-0 bg-transparent ms-2"
          style="font-size: 1.2rem; line-height: 1; color: black;"
          @click="$emit('close')"
          aria-label="Cerrar menú"
        >
          &times;
        </button>
      </div>
      <hr class="my-1" />
      <div class="d-flex flex-row gap-1 flex-wrap">
        <button
          v-for="item in category.items"
          :key="item.label"
          :ref="item.label === 'Color' ? setColorButtonRef : null"
          class="btn btn-light btn-sm d-flex align-items-center justify-content-center mb-1"
          :class="{ active: selectedItem === item.label }"
          type="button"
          style="padding: 0.25rem 0.5rem; font-size: 0.75rem; min-width: 60px;"
          @click="onItemClick(item.label)"
        >
          <fa-icon :icon="item.icon" class="me-1" size="xs" />
          <span class="small">{{ item.label }}</span>
        </button>
      </div>
    </div>

    <!-- Popup anclado a la posición del botón -->
    <ColorPickerPopup
      v-if="selectedItem === 'Color'"
      :modelValue="selectedColor"
      :position="popupPosition"
      :width="menuWidth"
      @update:modelValue="onColorChange"
      @close="selectedItem = null"
    />
  </div>
</template>


<script setup lang="ts">
import { ref, computed, nextTick, onMounted , onBeforeUnmount} from 'vue'
import ColorPickerPopup from './ColorSelection.vue'

const menuRef = ref<HTMLElement | null>(null)
const menuWidth = ref(0)

const selectedItem = ref<string | null>(null)
const selectedColor = ref('#000000')
const popupPosition = ref({ x: 0, y: 0 })
const emit = defineEmits(['update:lineValue','delete']) 

const categories = ref([
  {
    name: 'Settings',
    items: [
      { label: 'Color', icon: 'palette' },
      { label: 'Delete', icon: 'trash' },
    ],
  },
])
const props = defineProps({
  editingLineId: {
    type: [String, Number],
    required: true,
  },
})

const filteredCategories = computed(() => categories.value)

const colorButtonRef = ref<HTMLElement | null>(null)
const setColorButtonRef = (el: HTMLElement | null) => {
  if (el) colorButtonRef.value = el
}

const onItemClick = async (label: string) => {
  selectedItem.value = selectedItem.value === label ? null : label
  if (label === 'Color' && selectedItem.value === 'Color') {
    await nextTick()
    const buttonEl = colorButtonRef.value
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect()
      popupPosition.value = {
        x: rect.right - 150,
        y: rect.top + 80,
      }
    }
  }
  if (label === 'Delete') {
    emit('delete', props.editingLineId)
    return
  }
}
const onColorChange = (color: string) => {
  selectedColor.value = color
  emit('update:lineValue', color) 
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

// Detecta modo oscuro por clase en body o app
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

<style scoped>
.menu-panel {
  width: 170px !important;
  min-height: 10px;
  background: #fff !important;
  border-radius: 0.7rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.10);
  padding: 1rem !important; /* igual que p-3 de bootstrap */
  font-size: 0.95rem;       /* igual que ConfigWork */
  z-index: 100;
  color: #212529;
  border: 1px solid #dee2e6;
}

/* Botones más pequeños */
.menu-panel .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  min-width: 0;
  min-height: 0;
  line-height: 1.1;
  margin-right: 0.1rem;
}

.fw-bold.fs-6 {
  font-size: 0.8rem !important;
}

hr.my-2 {
  margin: 0.2rem 0 !important;
}
</style>
