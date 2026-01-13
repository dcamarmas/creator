<template>
  <div class="menu-panel" :class="{ 'bg-dark text-light': isDark }" style="width:220px;max-height:300px;overflow-y:auto;">
    <!-- Search Bar -->
    <div class="p-2">
      <input
        v-model="search"
        type="text"
        placeholder="Search..."
        class="form-control"
      />
    </div>

    <!-- Component List -->
    <div v-for="category in filteredCategories" :key="category.name" class="category-block">
      <div class="category-title fw-bold fs-6 mb-1">{{ category.name }}</div>
      <div class="category-divider"></div>
      <div class="flex-col">
        <button
          v-for="item in category.items"
          :key="item.label"
          class="btn btn-light d-flex align-items-center mb-2"
          type="button"
          @click="handleAddGadget(item.label)"
        >
          <img :src="item.icon" alt="" class="icon-separated" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['add-gadget']);


function handleAddGadget(label) {
  emit('add-gadget', label)
}

const search = ref('')
const baseUrl = window.location.origin;
const categories = ref([
  {
    name: 'Basic',
    items: [
      { label: 'LED', icon: `${baseUrl}/public/maker/icons/led.svg`  },
      { label: 'BUTTON', icon: `${baseUrl}/public/maker/icons/button.svg` },
      { label: 'BUZZER', icon: `${baseUrl}/public/maker/icons/buzzer.svg` },
    ],
  },
])

const filteredCategories = computed(() => {
  if (!search.value) return categories.value
  return categories.value.map(cat => ({
    ...cat,
    items: cat.items.filter(item => item.label.toLowerCase().includes(search.value.toLowerCase())),
  })).filter(cat => cat.items.length > 0)
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

<style scoped>
.menu-panel {
  width: 340px !important;
  max-height: 500px;
  overflow-y: auto;
  background: #fff !important;                /* Bootstrap bg-white */
  border-radius: 1rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding-bottom: 2.5rem;
  font-size: 1.1rem;
  color: #212529;                             /* Bootstrap text-dark */
  border: 1px solid #dee2e6;                  /* Bootstrap border */
}

/* .category-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #212529;
  margin-bottom: 0.3rem;
} */

.menu-panel.bg-dark input[type="text"] {
  background: #23272b !important;
  color: #f8f9fa !important;
  border: 1px solid #495057 !important;
}

.p-2 input[type="text"] {
  height: 1.6rem;           /* más bajo */
  width: 90%;               /* más angosto */
  font-size: 0.95rem;       /* texto más pequeño */
  margin-top: 0.5rem;       /* menos espacio arriba */
  padding: 0.4rem !important; /* menos padding */
  background: #f8f9fa;
  color: #212529;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
}

.category-divider {
  border-bottom: 1px solid #dee2e6;
  margin: 0 1.5rem 0.5rem 1.5rem;
}

.flex-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-light {
  text-align: left;
  color: #212529 !important;
  background: #f8f9fa !important;
  border: 1px solid #ced4da !important;
  font-size: 1rem !important;
  display: flex;
  align-items: center;
  border-radius: 0.375rem;
  transition: background 0.2s, color 0.2s;
  padding: 0.4rem 0.6rem;
}

.btn-light:hover, .btn-light:focus {
  background-color: #e2e6ea !important;
  color: #212529 !important;
}

.icon-separated {
  margin-right: 0.5rem;
  min-width: 1.25rem;
  width: 1.25rem;
  height: 1.25rem;
  text-align: center;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 3px;
}
</style>