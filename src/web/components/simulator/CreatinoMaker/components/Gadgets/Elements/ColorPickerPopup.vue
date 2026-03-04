<template>
  <Teleport to="body">
    <!-- Fondo semitransparente -->
    <div class="overlay" @click.self="$emit('close')"></div>

    <!-- Popup anclado -->
    <div
      class="color-popup border rounded-3 shadow color-picker-popup"
      :class="isDark ? 'bg-dark text-light' : 'bg-white'"
      :style="{ top: position.y + 'px', left: position.x + 'px', width: width + 'px', zIndex: 1200 }"
      @mousedown.stop
    >
      <div
        class="popup-arrow"
        :class="isDark ? 'arrow-dark' : 'arrow-light'"
      ></div>

      <div class="popup-content p-3">
        <!-- Color Picker -->
        <div class="picker-wrapper mb-3">
          <ColorPicker
            v-model:pureColor="color"
            format="hex"
            pickerType="chrome"
            :disableAlpha="false"
            :showHistory="true"
            class="colorpicker"
            :style="{
              transform: 'scale(2)',
              transformOrigin: 'top right',
            }"
            inline
          />
        </div>

        <div class="mb-3 small" :class="isDark ? 'text-light' : 'text-secondary'">
          Selected color: <span :style="{ color }">{{ color }}</span>
        </div>
        <button
          class="btn btn-primary me-2"
          @click="$emit('update:modelValue', color)"
        >
          Change Color
        </button>
        <button
          class="btn btn-outline-secondary"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

const props = defineProps<{
  modelValue: string
  position: { x: number; y: number }
  width: number
}>()

const emit = defineEmits(['update:modelValue', 'close'])

const color = computed({
  get: () => props.modelValue,
  set: value => {
    emit('update:modelValue', value)
  },
})

// Detecta modo oscuro por clase en body o app
const isDark = computed(() => {
  return document.body.classList.contains('dark-mode') ||
    document.querySelector('#app-main')?.classList.contains('dark-mode')
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 40;
}

.color-popup {
  position: fixed;
  z-index: 50;
  transform: translateY(10px);
  
}

.popup-arrow {
  position: absolute;
  top: -10px;
  left: 30px;
  width: 0;
  height: 0;
}
.arrow-light {
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #fff;
}
.arrow-dark {
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #23272b;
}

.popup-content {
  background: transparent;
  border-radius: 1rem;
  box-shadow: none;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  
}

.colorpicker {
  width: 90%;
}

.picker-wrapper {
  overflow: visible;
}
</style>
