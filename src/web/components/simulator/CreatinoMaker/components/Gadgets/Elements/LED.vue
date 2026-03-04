<template>
  <div
    class="led-component"
    :id="id"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown="handleMouseDown"
    ref="ledRef"
  >
    <div :style="{ transform: `${flipped ? 'scaleX(-1)' : ''} rotate(${rotation}deg)` }">
      <wokwi-led :color="ledColor" :value="ledState ? false : ''" />

      <svg
        width="50"
        height="50"
        style="position: absolute; top: 0; left: 0; pointer-events: none;"
      >
        <!-- Patita izquierda -->
        <rect
          x="12"
          y="40"
          width="5"
          height="5"
          fill="rgba(255, 0, 0, 0.3)"
          style="cursor: pointer; pointer-events: auto;"
          @click.stop="handlePinClick('left')"
          ref="leftPinRef"
        />
        <!-- Patita derecha -->
        <rect
          x="22"
          y="40"
          width="5"
          height="5"
          fill="rgba(255, 0, 0, 0.3)"
          style="cursor: pointer; pointer-events: auto;"
          @click.stop="handlePinClick('right')"
          ref="rightPinRef"
        />
        <!-- Botón Config -->
        <circle
          cx="40"
          cy="10"
          r="8"
          fill="transparent"
          style="cursor: pointer; pointer-events: auto;"
          ref="configButtonRef"
          @click="handleConfigClick"
        />
        <text
          x="40"
          y="14"
          text-anchor="middle"
          alignment-baseline="middle"
          font-size="12"
          fill="white"
          style="pointer-events: none;"
        >
          ⚙️
        </text>
      </svg>
    </div>
  </div>

  <!-- Teleport fuera del bloque principal, con v-if afuera -->
  <Teleport to="#overlay-container" v-if="showConfigMenu">
    <ConfigMenu
      :style="{
      position: 'absolute',
      left: (configMenuPosition.x  + 20) + 'px',
      top: (configMenuPosition.y + 50) + 'px',
      zIndex: 10000,
      pointerEvents: 'auto',
      transform: 'scale(1.5)'
    }"
      @update:modelValue="handleColor"
      @flip="handleFlip"
      @rotate="handleRotate"
      @delete="emit('delete', id)"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, defineExpose,nextTick, watch} from 'vue'
import ConfigMenu from './ConfigMenu.vue'

const showConfigMenu = ref(false)
const configMenuPosition = ref({ x: 10, y: 10 })
const configButtonRef = ref<SVGCircleElement | null>(null)
const ledRef = ref<HTMLElement | null>(null);

// Props
const props = defineProps<{
  position: { x: number; y: number };
  ledState: boolean;
  id: string;
  selectedPin: string | null;
  connections: Array<{ pinName: string; ledPin: 'left' | 'right' }> | [];
  ledColor: string; 
  flipped : boolean;
  rotation: number
}>();

const ledColor = ref(props.ledColor || 'red')
const rotation = ref(props.rotation || 0)
const flipped = ref(props.flipped || false)
const leftPinRef = ref<SVGRectElement | null>(null)
const rightPinRef = ref<SVGRectElement | null>(null)

watch(() => props.rotation, (newStatus) => {
  rotation.value = newStatus
})
watch(() => props.flipped, (newStatus) => {
  flipped.value = newStatus
})
watch(() => props.ledColor, (newColor) => {
  ledColor.value = newColor
})

function getPinCoords() {
  const left = leftPinRef.value?.getBoundingClientRect()
  const right = rightPinRef.value?.getBoundingClientRect()
  return {
    left,
    right
  }
}
defineExpose({ getPinCoords })

const emit = defineEmits<{
  (e: 'handleMouseDown', event: MouseEvent, id: string): void
  (e: 'handlePinClick', side: 'left' | 'right'): void
  (e: 'update:modelValue', color: string): void 
  (e: 'delete', id: string): void
  (e: 'updateState', state: { flipped: boolean; rotation: number, color: string }): void
}>()
function handleFlip() {
  flipped.value = !flipped.value
  emit('updateState', { flipped: flipped.value, rotation: rotation.value, color: ledColor.value })
}
function handleColor(color) {
  ledColor.value = color
  console.log('Color changed to:', ledColor.value)
  emit('updateState', { flipped: flipped.value, rotation: rotation.value, color: ledColor.value  })
}
function handleRotate() {
  rotation.value = (rotation.value + 90) % 360
  emit('updateState', { flipped: flipped.value, rotation: rotation.value, color: ledColor.value  })
}

function handleMouseDown(e: MouseEvent) {
  emit('handleMouseDown', e, 'led')
}
function handlePinClick(side: 'left' | 'right') {
  console.log(`Pin ${side} clicked`)
  emit('handlePinClick',side)
}

function handleConfigClick(event: MouseEvent) {
  event.stopPropagation()
  showConfigMenu.value = !showConfigMenu.value

  if (showConfigMenu.value) {
    nextTick(() => {
      if (configButtonRef.value) {
        const rect = configButtonRef.value.getBoundingClientRect()
        configMenuPosition.value = {
          x: rect.left + 30,
          y: rect.top
        }
        console.log('Absolute config menu position:', configMenuPosition.value)
      }
    })
  }
}




// function handleConfigClick(event: MouseEvent) {
//   event.stopPropagation()
//   showConfigMenu.value = !showConfigMenu.value

//   if (showConfigMenu.value && configButtonRef.value) {
//     //TODO: ¿Movemos el menú según lo pida el alumno?
//     configMenuPosition.value = {
//       x: 50,
//       y: 0,     
//     }

//     console.log('Relative config menu position:', configMenuPosition.value)
//   }
// }


</script>

  <style scoped>
  .led-component {
    position: absolute;
    cursor: pointer;
  }
  </style>