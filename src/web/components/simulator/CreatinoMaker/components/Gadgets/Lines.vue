<template>
  <svg ref="svgRef" class="connections-lines">
    <!-- Path invisible para hover -->
    <path
      v-for="(line, index) in lines"
      :key="'hover-' + index"
      :d="getPath(line.x1, line.y1, line.codoX, line.codoY, line.x2, line.y2)"
      stroke="transparent"
      stroke-width="20"
      fill="none"
      @mouseenter="hoveredLineIndex = index"
      @mouseleave="hoveredLineIndex = null"
      @click.stop="selectLine(index)"
      style="cursor: pointer"
    />

    <!-- Path visible -->
    <path
      v-for="(line, index) in lines"
      :key="line.id || index"
      :d="getPath(line.x1, line.y1, line.codoX, line.codoY, line.x2, line.y2)"
      :stroke="selectedLineIndex === index ? 'blue' : (line.stroke || lineColor)"
      :stroke-width="line.strokeWidth || 2"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Handler draggable del codo -->
    <circle
      v-for="(line, index) in lines"
      :key="'codo-' + index"
      :cx="line.codoX"
      :cy="line.codoY"
      r="7"
      data-draggable="0"
      class="diagram-wires_handle__aG38P react-draggable"
      :fill="selectedLineIndex === index ? 'blue' : (line.stroke || lineColor)"
      fill-opacity="0.5"
      :stroke="selectedLineIndex === index ? 'blue' : (line.stroke || lineColor)"
      stroke-width="2"
      style="cursor: pointer; pointer-events: all;"
      @mousedown.stop="startCodoDrag(index)"
    />
    
    <!-- Línea temporal -->
    <line
      v-if="tempLine"
      :x1="tempLine.x1"
      :y1="tempLine.y1"
      :x2="tempLine.x2"
      :y2="tempLine.y2"
      stroke="gray"
      stroke-width="1"
      stroke-dasharray="5,5"
    />
  </svg>

  <!-- Botón flotante 🎨 -->
  <button
    v-if="hoveredLineIndex !== null || selectedLineIndex !== null"
    :style="parseStyle(getButtonStyle(lines[selectedLineIndex ?? hoveredLineIndex]))"
    class="floating-button"
    @click.stop="showColorPicker = !showColorPicker"
  >
    🎨
  </button>

  <!-- Menú de configuración -->
  <ConfigMenu
    v-if="selectedLineIndex !== null"
    :style="parseStyle(getMenuStyle(lines[selectedLineIndex]))"
    :editingLineId="selectedLineId"
    @update:lineValue="updateLineProperty('stroke', $event)"
    @delete="deleteLine"
    @close="closeConfigMenu"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ConfigMenu from './Elements/ConfigLines.vue'
const lineColor = ref('black') // color inicial
const props = defineProps({
  lines: {
    type: Array,
    required: true,
    default: () => []
  },
  tempLine: {
    type: Object,
    default: null
  },
  connections: {  // Añadido para acceder a los IDs
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'delete', 'update:lineValue'])
function closeConfigMenu() {
  selectedLineIndex.value = null
  selectedLineId.value = null
  showColorPicker.value = false
}


const hoveredLineIndex = ref<number | null>(null)
const selectedLineIndex = ref<number | null>(null)
const selectedLineId = ref<string | null>(null)
const showColorPicker = ref(false)
const svgRef = ref<SVGSVGElement | null>(null)


function selectLine(index: number) {
  if (selectedLineIndex.value === index) {
    selectedLineIndex.value = null
    selectedLineId.value = null
    showColorPicker.value = false
  } else {
    selectedLineIndex.value = index
    // Usamos connections para obtener el ID completo
    selectedLineId.value = props.connections[index]?.id || null
    showColorPicker.value = false
  }
}
function updateLineProperty(prop: 'stroke' | 'strokeWidth', value: string | number) {
  const index = selectedLineIndex.value
  //console.log('Updating line property:', prop, 'with value:', value, 'at index:', index)
  console.log('Lines:', props.connections)
  if (index !== null && props.lines[index]) {
    (props.lines[index] as any)[prop] = value
    //console.log('Lines:', props.connections[index].id)
    emit('update:lineValue', {
      id: props.connections[index].id,
      property: prop,
      value
    })
  }
}


function deleteLine() {
  if (selectedLineIndex.value !== null && selectedLineId.value) {
    console.log('Deleting line with ID:', selectedLineId.value)
    emit('delete', selectedLineId.value)
    selectedLineIndex.value = null
    selectedLineId.value = null
  }
}

// Funciones de utilidad (mantenidas igual)
function handleClickOutside(event: MouseEvent) {
  if (!svgRef.value?.contains(event.target as Node) && selectedLineIndex.value == null) {
    selectedLineIndex.value = null
    selectedLineId.value = null
    showColorPicker.value = false
  }
}

function getButtonStyle(line: any) {
  // Punto medio entre x1,y1 -> codoX,codoY -> x2,y2
  // Puedes usar el codo directamente, o el promedio de los tres puntos
  const x = (line.x1 + line.codoX + line.x2) / 3;
  const y = (line.y1 + line.codoY + line.y2) / 3;
  return {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)',
    zIndex: '20'
  }
}

function getMenuStyle(line: any) {
  // Igual que arriba, pero desplazado para que no tape el botón
  const x = (line.x1 + line.codoX + line.x2) / 3;
  const y = (line.y1 + line.codoY + line.y2) / 3;
  return {
    position: 'absolute',
    left: `${x - 90}px`,
    top: `${y + 130}px`,
    transform: 'translate(-50%, -50%)',
    zIndex: '10000',
    pointerEvents: 'auto',
    transformOrigin: 'left center',
    scale: '1.5'
  }
}

function parseStyle(styleObject: Record<string, string>) {
  return Object.entries(styleObject).map(([k, v]) => `${k}: ${v}`).join('; ')
}

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number) {
  const mt = 1 - t
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  )
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
const dragging = ref<{ index: number; control: 'cx1' | 'cx2' } | null>(null);

function startDrag(index: number, control: 'cx1' | 'cx2') {
  dragging.value = { index, control };
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
}

function onDrag(e: MouseEvent) {
  if (!dragging.value) return;
  const { index, control } = dragging.value;
  const svgRect = svgRef.value?.getBoundingClientRect();
  if (!svgRect) return;
  const x = e.clientX - svgRect.left;
  const y = e.clientY - svgRect.top;
  // Actualiza el punto de control correcto
  if (control === 'cx1') {
    props.lines[index].cx1 = x;
    props.lines[index].cy1 = y;
    emit('update:lineValue', { id: props.connections[index].id, property: 'cx1', value: x });
    emit('update:lineValue', { id: props.connections[index].id, property: 'cy1', value: y });
  } else if (control === 'cx2') {
    props.lines[index].cx2 = x;
    props.lines[index].cy2 = y;
    emit('update:lineValue', { id: props.connections[index].id, property: 'cx2', value: x });
    emit('update:lineValue', { id: props.connections[index].id, property: 'cy2', value: y });
  }
}

function stopDrag() {
  dragging.value = null;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
}

const curveDragging = ref<{ index: number; t: number } | null>(null);

function startDragOnCurve(index: number, t: number) {
  curveDragging.value = { index, t };
  window.addEventListener('mousemove', onCurveDrag);
  window.addEventListener('mouseup', stopCurveDrag);
}

function onCurveDrag(e: MouseEvent) {
  if (!curveDragging.value) return;
  const { index, t } = curveDragging.value;
  const svgRect = svgRef.value?.getBoundingClientRect();
  if (!svgRect) return;
  const x = e.clientX - svgRect.left;
  const y = e.clientY - svgRect.top;

  // Calcula el nuevo punto en la curva
  const p0 = { x: props.lines[index].x1, y: props.lines[index].y1 };
  const p1 = { x: props.lines[index].cx1, y: props.lines[index].cy1 };
  const p2 = { x: props.lines[index].cx2, y: props.lines[index].cy2 };
  const p3 = { x: props.lines[index].x2, y: props.lines[index].y2 };

  const newPoint = cubicBezier(t, p0.x, p1.x, p2.x, p3.x);
  const newY = cubicBezier(t, p0.y, p1.y, p2.y, p3.y);

  // Actualiza los puntos de control según el punto arrastrado
  if (t === 0.25) {
    props.lines[index].cx1 = newPoint;
    props.lines[index].cy1 = newY;
    emit('update:lineValue', { id: props.connections[index].id, property: 'cx1', value: newPoint });
    emit('update:lineValue', { id: props.connections[index].id, property: 'cy1', value: newY });
  } else if (t === 0.75) {
    props.lines[index].cx2 = newPoint;
    props.lines[index].cy2 = newY;
    emit('update:lineValue', { id: props.connections[index].id, property: 'cx2', value: newPoint });
    emit('update:lineValue', { id: props.connections[index].id, property: 'cy2', value: newY });
  }
}

function stopCurveDrag() {
  curveDragging.value = null;
  window.removeEventListener('mousemove', onCurveDrag);
  window.removeEventListener('mouseup', stopCurveDrag);
}

const codoDragging = ref<{ index: number } | null>(null);

function startCodoDrag(index: number) {
  codoDragging.value = { index };
  window.addEventListener('mousemove', onCodoDrag);
  window.addEventListener('mouseup', stopCodoDrag);
}

function onCodoDrag(e: MouseEvent) {
  if (!codoDragging.value) return;
  const { index } = codoDragging.value;
  const svgRect = svgRef.value?.getBoundingClientRect();
  if (!svgRect) return;
  const x = e.clientX - svgRect.left;
  const y = e.clientY - svgRect.top;
  props.lines[index].codoX = x;
  props.lines[index].codoY = y;
  emit('update:lineValue', { id: props.connections[index].id, property: 'codoX', value: x });
  emit('update:lineValue', { id: props.connections[index].id, property: 'codoY', value: y });
}

function stopCodoDrag() {
  codoDragging.value = null;
  window.removeEventListener('mousemove', onCodoDrag);
  window.removeEventListener('mouseup', stopCodoDrag);
}

// Modifica getWokwiPath para usar el codo
function getPath(x1: number, y1: number, codoX: number, codoY: number, x2: number, y2: number) {
  return `M${x1},${y1} L${codoX},${codoY} L${x2},${y2}`;
}
</script>

<style scoped>
.connections-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.connections-lines path {
  pointer-events: auto;
}

.floating-button {
  color: white;
  background: #333;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 20px;
  z-index: 30;
  position: absolute;
}
</style>