<template>
  <div class="menu-panel" :class="{ 'bg-dark text-light': isDark }">
    <!-- Component List -->
    <div v-for="category in filteredCategories" :key="category.name" class="category-block">
      <div class="category-title fw-bold fs-6 mb-1">{{ category.name }}</div>
      <hr class="my-2" />
      <div class="category-divider"></div>
      <div class="flex-col" style="position: relative;">
        <button
          v-for="item in category.items"
          :key="item.label"
          class="btn btn-primary btn-80 d-flex align-items-center justify-content-center mb-1"
          type="button"
          @click="item.label === 'Examples' ? (showExamplesDropdown = !showExamplesDropdown) : handleFile(item.label)"
        >
          <fa-icon :icon="item.icon" class="icon-separated" />
          <span>{{ item.label }}</span>
        </button>
        <!-- Dropdown para archivos de ejemplo -->
      <div
        v-if="showExamplesDropdown"
          class="dropdown-menu show category-block w-100"
          :class="{ 'bg-dark text-light': isDark }"
          style="position: absolute; left: 0; top: 100%; width: 100%; z-index: 2000; box-shadow: 0 4px 16px rgba(0,0,0,0.2);"
      >
        <button
          v-for="example in exampleFiles"
          :key="example.file"
          class="btn btn-primary btn-80 d-flex align-items-center justify-content-center mb-1"
          type="button"
          @click="handleExampleFile(example.file)"
        >
          {{ example.label }}
        </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed , onMounted, onBeforeUnmount} from 'vue'

const emit = defineEmits(['file-action']);

function handleFile(label) {
  switch(label) {
    case 'Save':
      emit('file-action', 'save')
      break;
    case 'Upload':
      emit('file-action', 'upload')
      break;
  }
}

function handleExampleFile(file) {
  showExamplesDropdown.value = false
  console.log("Example file selected:", file)
  emit('file-action', { type: 'example', file })
}

const search = ref('')

const categories = ref([
  {
    name: 'File',
    items: [
      { label: 'Upload', icon: 'upload'  },
      { label: 'Save', icon: 'download' },
      { label: 'Examples', icon: 'infinity' },
    ],
  },
])
const exampleFiles = [
  { label: 'Semaphore', file: 'examples/semaphore.json' },
  { label: 'Blink', file: 'examples/blink.json' },
  { label: 'Buzzer', file: 'examples/buzzer.json' },
  // { label: 'Contador', file: 'counter.json' }
]
const showExamplesDropdown = ref(false)

const filteredCategories = computed(() => {
  if (!search.value) return categories.value
  return categories.value.map(cat => ({
    ...cat,
    items: cat.items.filter(item => item.label.toLowerCase().includes(search.value.toLowerCase())),
  })).filter(cat => cat.items.length > 0)
})

// Modo noche
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
.w-80 {
  width: 80% !important;
  max-height: 300px;
  overflow-y: auto;
  background: #fff !important;           /* Bootstrap bg-white */
  border-radius: 0.75rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 0.75rem;
  font-size: 1rem;
  color: #212529;                        /* Bootstrap text-dark */
  border: 1px solid #dee2e6;             /* Bootstrap border */
}

.menu-panel {
  width: 280px !important; /* o el ancho que prefieras */
  max-height: 300px;
  overflow-y: auto;
  border-radius: 0.75rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #dee2e6;
}


/* Botón azul, centrado, 80% ancho */
.btn-80 {
  width: 80% !important;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: center; /* Centra el contenido del botón */
}
.flex-col {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: center; /* Centra los botones en el modal */
}

.icon-separated, .fa-icon, .me-2 {
  margin-right: 0.5rem;
  min-width: 1.25rem;
  text-align: center;
}

/* Switch slider styles */
.switch {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 20px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #adb5bd;             /* Bootstrap secondary */
  transition: .4s;
  border-radius: 20px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}
.slider-sep {
  margin-left: 1rem;
}
.switch input:checked + .slider {
  background-color: #007bff;             /* Bootstrap primary */
}
.switch input:checked + .slider:before {
  transform: translateX(18px);
}
.moon-icon {
  font-size: 1.2rem;
  margin-right: 1rem;
}
.darkmode-switch-row {
  margin-top: 0.3rem;
  margin-right: 3rem;
  border-radius: 0.375rem;
}
</style>
