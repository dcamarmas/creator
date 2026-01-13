<template>
  <div
    class="buzzer-component"
    :id="id"
    :style="{ left: position.x + 'px', top: position.y + 'px', width: '20px', height: '20px' }"
    @mousedown="handleMouseDown"
    ref="buzzerRef"
  >
    <div :style="{ transform: `${flipped ? 'scaleX(-1)' : ''} rotate(${rotation}deg)` }">
      <wokwi-buzzer
        :color="buzzerColor"
        :hasSignal="isSignal"
        style="width:8px;height:8px;"
      ></wokwi-buzzer>
      <svg
        width="90"
        height="130"
        style="position: absolute; top: -30px; left: -15px; pointer-events: none;"
      >
        <!-- Patita abajo izq -->
        <rect
          x="43"
          y="115"
          width="8"
          height="8"
          fill="rgba(225, 0, 0, 0.3)"
          style="cursor: pointer; pointer-events: auto;"
          @click.stop="handlePinClick('left')"
          ref="LeftPinRef"
        />
        <!-- Patita abajo drcha -->
        <rect
          x="53"
          y="115"
          width="8"
          height="8"
          fill="rgba(255, 0, 0, 0.3)"
          style="cursor: pointer; pointer-events: auto;"
          @click.stop="handlePinClick('right')"
          ref="RightPinRef"
        />
        <!-- Botón Config -->
        <circle
          cx="25"
          cy="30"
          r="10"
          fill="transparent"
          style="cursor: pointer; pointer-events: auto;"
          ref="configButtonRef"
          @click="handleConfigClick"
        />
        <text
          x="25"
          y="30"
          text-anchor="middle"
          alignment-baseline="middle"
          font-size="15"
          fill="white"
          style="pointer-events: none;"
        >
          ⚙️
        </text>
      </svg>
    </div>
  </div>

  <Teleport to="#overlay-container" v-if="showConfigMenu">
    <ConfigMenu
      :style="{
      position: 'absolute',
      left: (configMenuPosition.x + 40) + 'px',
      top: configMenuPosition.y + 'px',
      zIndex: 10000,
      pointerEvents: 'auto',
      transform: 'scale(1.1)'
    }"
      @sound="handleSound"
      @flip="handleFlip"
      @rotate="handleRotate"
      @delete="emit('delete', id)"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, defineExpose, nextTick, watch } from 'vue'
import ConfigMenu from './ConfigMenuSound.vue'

const showConfigMenu = ref(false)
const configMenuPosition = ref({ x: 10, y: 10 })
const configButtonRef = ref<SVGCircleElement | null>(null)
const buzzerRef = ref<HTMLElement | null>(null)

const props = defineProps<{
  position: { x: number; y: number };
  id: string;
  selectedPin: string | null;
  isSignal: boolean
  connections: Array<{ pinName: string; buzzerPin: 'left' | 'right' }> | [];
  flipped: boolean;
  rotation: number
}>()

const buzzerColor = ref(props.buzzerColor || 'red')
const rotation = ref(props.rotation || 0)
const flipped = ref(props.flipped || false)
const RightPinRef = ref<SVGRectElement | null>(null)
const LeftPinRef= ref<SVGRectElement | null>(null)
const isMuted = ref(false)

watch(() => props.rotation, (newStatus) => {
  rotation.value = newStatus
})
watch(() => props.flipped, (newStatus) => {
  flipped.value = newStatus
})
watch(() => props.buzzerColor, (newColor) => {
  buzzerColor.value = newColor
})

function getPinCoords() {
  const left = LeftPinRef.value?.getBoundingClientRect()
  const right = RightPinRef.value?.getBoundingClientRect()
  return { left, right }
}
defineExpose({ getPinCoords })
function handleSound() {
  isMuted.value = !isMuted.value
  console.log('Mute toggled, isMuted:', isMuted.value)
}

const emit = defineEmits<{
  (e: 'handleMouseDown', event: MouseEvent, id: string): void
  (e: 'handlePinClick', side: 'left' | 'right'): void
  (e: 'update:modelValue', color: string): void
  (e: 'delete', id: string): void
  (e: 'updateState', state: { flipped: boolean; rotation: number, color: string }): void
}>()
function handleFlip() {
  flipped.value = !flipped.value
  emit('updateState', { flipped: flipped.value, rotation: rotation.value, color: buzzerColor.value })
}
function handleColor(color) {
  buzzerColor.value = color
  emit('updateState', { flipped: flipped.value, rotation: rotation.value, color: buzzerColor.value })
}
function handleRotate() {
  rotation.value = (rotation.value + 90) % 360
  emit('updateState', { flipped: flipped.value, rotation: rotation.value, color: buzzerColor.value })
}
function handleMouseDown(e: MouseEvent) {
  emit('handleMouseDown', e, 'buzzer')
}
function handlePinClick(side: 'upleft' | 'downleft' | 'upright' | 'downright') {
  console.log('Pin clicked:', side)
  emit('handlePinClick', side)
}
function handleConfigClick(event: MouseEvent) {
  event.stopPropagation()
  showConfigMenu.value = !showConfigMenu.value
  if (showConfigMenu.value) {
    nextTick(() => {
      if (configButtonRef.value) {
        const rect = configButtonRef.value.getBoundingClientRect()
        configMenuPosition.value = {
          x: rect.left + 40,
          y: rect.top
        }
      }
    })
  }
}
//Buzzer sounds
const buzzerAudio = ref<HTMLAudioElement | null>(null)
const audioInitialized = ref(false)

function initAudio() {
  if (!audioInitialized.value) {
    buzzerAudio.value = new Audio('/sounds/buzzer.mp3')
    buzzerAudio.value.loop = true
    audioInitialized.value = true
  }
}

// Cambia el watcher para observar la prop directamente
watch(() => props.isSignal, (newVal) => {
  console.log('Buzzer signal changed:', newVal)
  if (!isMuted.value) {
    initAudio()
    if (buzzerAudio.value) {
      if (newVal) {
        buzzerAudio.value.currentTime = 0
        buzzerAudio.value.play()
      } else {
        buzzerAudio.value.pause()
        buzzerAudio.value.currentTime = 0
      }
    }
  } else {
    // Si está muteado, siempre pausa el audio
    if (buzzerAudio.value) {
      buzzerAudio.value.pause()
      buzzerAudio.value.currentTime = 0
    }
  }
})
</script>

<style scoped>
.buzzer-component {
  position: absolute;
  cursor: pointer;
  width: 20px;
  height: 20px;
}
</style>