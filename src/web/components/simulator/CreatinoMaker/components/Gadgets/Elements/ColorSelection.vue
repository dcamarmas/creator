<template>
  <Teleport to="body">
    <!-- Fondo semitransparente -->
    <div
      class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
      :class="{ 'text-light': isDark }"
      style="z-index:1040;"
      @click.self="$emit('close')"
    ></div>

    <!-- Popup anclado -->
    <div
      class="popup position-fixed bg-white border rounded shadow p-4"
      :style="{ top: position.y + 'px', left: position.x + 'px', width: width + 'px', zIndex: 1050 }"
    >
      <!-- Flecha decorativa opcional -->
      <div style="position:absolute;top:-10px;left:30px;width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-bottom:10px solid #dee2e6;"></div>

      <div>
        <!-- Paleta de colores -->
        <div class="d-flex gap-3 justify-content-center mb-3">
          <button
            v-for="preset in presets"
            :key="preset"
            :style="{ backgroundColor: preset }"
            class="btn border border-2 rounded-circle"
            style="width:36px;height:36px;"
            @click="color = preset"
          ></button>
        </div>

        <button
          class="btn btn-primary w-100"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { Teleport } from 'vue'
const props = defineProps<{
  modelValue: string
  position: { x: number; y: number }
  width: number
}>()

const emit = defineEmits(['update:modelValue', 'close'])

const presets = ['#FF0000', '#0068ff', '#28bd00', '#ffd501', '#000000','#d4d4d4' ]

const color = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
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

<!-- No necesitas la mayoría de los estilos personalizados, Bootstrap se encarga -->
<style scoped>
/* Sombra y borde más suave para el popup */
.popup {
  border-radius: 1rem;
  border: 1px solid #dee2e6;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  background: #fff;
  min-width: 300px;
  transition: box-shadow 0.2s;
}

/* Flecha decorativa para el popup */
.popup-arrow {
  position: absolute;
  top: -10px;
  left: 30px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #dee2e6;
}

/* Botones de color: efecto de selección y hover */
.btn.rounded-circle {
  border-width: 2px;
  transition: transform 0.1s, box-shadow 0.1s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.btn.rounded-circle:focus,
.btn.rounded-circle:hover {
  outline: none;
  transform: scale(1.12);
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  border-color: #333;
}

/* Fondo oscuro del overlay */
.bg-dark.bg-opacity-50 {
  backdrop-filter: blur(2px);
}

/* Botón cerrar: margen arriba */
.btn-danger {
  margin-top: 1rem;
}

</style>
