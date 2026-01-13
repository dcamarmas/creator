<!-- 
/*  CREATino Maker-App
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos, Elisa Utrilla Arroyo
 *
 *  file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 *
 */ -->

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onMounted, computed , onBeforeUnmount} from 'vue'
import BoardElement from './components/BoardElements/esp32c3devkit2.vue';
import * as Emulator from "@aloeminium108/risc-v-emulator";
const { Assembler, CPU } = Emulator.default;
import hookMap from './components/BoardElements/esp32c3devkit2.js';
import boardData from './components/BoardElements/esp32c3devkit2.json';
import ConnectionsLines from './components/Gadgets/Lines.vue';
import Menu from './components/Gadgets/GadgetMenu.vue';
import LEDComponent from './components/Gadgets/Elements/LED.vue';
import ButtonComponent from './components/Gadgets/Elements/Button.vue'; 
import FileMenu from './components/Gadgets/Elements/ConfigFile.vue';
import WorkMenu from './components/Gadgets/Elements/ConfigWork.vue';
import Buzzer from './components/Gadgets/Elements/Buzzer.vue';
// import JSZip from 'jszip';
import BoardSelect from './components/Gadgets/Elements/BoardSelect.vue';
// import TextareaAssembly from '@/web/components/assembly/TextareaAssembly.vue'; // Ajusta la ruta si es necesario
import { getCurrentInstance } from 'vue';
import { connections, positions, compState, svgRef } from './state.js';
const workspaceRef = ref<HTMLDivElement | null>(null);
const boardDataMutable = ref({ ...boardData });

/// -----------UNDO y REDO
const undoStack = ref<Array<{ positions: typeof positions.value, connections: typeof connections.value }>>([]);
const redoStack = ref<Array<{ positions: typeof positions.value, connections: typeof connections.value }>>([]);


const gadgetRefs = ref<Record<string, any>>({});
//Deformar líneas

// Dibujo de líneas
const tempLine = ref<{ x1: number, y1: number, x2: number, y2: number } | null>(null);
// Código

// const asmCode = ref([
//       "addi a0, a0, 5",
//       "jal ra, 0x104",
//       "addi a0, a0, -4000",
//       "addi a0, a0, 5",
//       "addi a1, a1, 1",
//       "jal ra, 0x108",

//     ]);
const asmCode = ref('');
const instance = getCurrentInstance();
const root = instance?.proxy?.$root as any; 

const draggingId = ref<string | null>(null)
const offset = reactive({ x: 0, y: 0 })
const selectedPin = ref<string | null>(null)

const showSave = ref(false);
const showUpload = ref(false);
const filename = ref('board-state');

const SCALE= ref(1.5); // empieza en 1x



function handleMouseDown(e: MouseEvent, id: string) {
  saveStateForUndo() 
  draggingId.value = id;
  const element = positions.value.find(item => item.id === id);
  if (!element) return;

  // Calcula offset relativo a la posición actual del elemento y ajusta por la escala
  offset.x = (e.clientX / SCALE.value) - element.position.x;
  offset.y = (e.clientY / SCALE.value) - element.position.y;
}

function handleFlip(id: string) {
  const led = positions.value.find(item => item.id === id);
  if (led) led.flipped = !led.flipped;
  updateConnectionsPositions()
}
function handleColor(id: string) {
  const led = positions.value.find(item => item.id === id);
  if (led) led.color = color;
}

function handleRotate(id: string) {
  const led = positions.value.find(item => item.id === id);
  if (led) led.rotation = (led.rotation + 90) % 360;
}

function handleMouseMove(e: MouseEvent) {
    if (!draggingId.value && selectedPin.value) {
    const workspaceRect = workspaceRef.value?.getBoundingClientRect();
    if (!workspaceRect) return;

    // console.log("SVG Rect:", svgRect);

    const safeId = CSS.escape(selectedPin.value);
    const pinEl = svgRef.value?.svgEl.querySelector(`#${safeId}`);
    if (!pinEl) return;
    //console.log("Pin Element:", pinEl);

    const pinRect = pinEl.getBoundingClientRect();

    const x1 = (pinRect.left + pinRect.width / 2) - workspaceRect.left;
    const y1 = (pinRect.top + pinRect.height / 2) - workspaceRect.top;

    const x2 = e.clientX - workspaceRect.left;
    const y2 = e.clientY - workspaceRect.top;

    tempLine.value = { x1, y1, x2, y2 };
  }

  // Movimiento normal de componentes
  if (!draggingId.value) return;

  const element = positions.value.find(item => item.id === draggingId.value);
  if (element) {
    // La posición se calcula dividiendo clientX/clientY por escala y restando el offset
    element.position.x = (e.clientX / SCALE.value) - offset.x;
    element.position.y = (e.clientY / SCALE.value) - offset.y;
    updateConnectionsPositions();
  }
}
function handleAddGadget(type: string) {
  saveStateForUndo() 
  if (type === 'LED') {
    const id = `led-${Date.now()}-${Math.random()}`;
    console.log("Adding LED with ID:", id);
    positions.value.push({
      id,
      position: { x: 200 + positions.value.length * 40, y: 100 }, // Espaciado simple
      compState: true,
      flipped: false,
      rotation: 0,
      color: 'red'

    });
    console.log(positions.value.length);
  }
    if (type === 'BUTTON') {
    const id = `button-${Date.now()}-${Math.random()}`;
    positions.value.push({
      id,
      position: { x: 200 + positions.value.length * 40, y: 200 },
      compState: false,
      flipped: false,
      rotation: 0,
      color: 'gray'
    });
  }
  if (type === 'BUZZER') {
    const id = `buzzer-${Date.now()}-${Math.random()}`;
    positions.value.push({
      id,
      position: { x: 200 + positions.value.length * 40, y: 200 },
      compState: false,
      flipped: false,
      rotation: 0,
      color: 'gray'
    });
  }
}
function handleLedStateChange(id: string, state: { flipped: boolean; rotation: number ,color: string}) {
  saveStateForUndo() 
  const led = positions.value.find(item => item.id === id);
  if (led) {
    led.flipped = state.flipped;
    led.rotation = state.rotation;
    led.color = state.color;
    console.log(`LED ${id} state updated:`, led);
    nextTick(() => {
      updateConnectionsPositions()
    });
  }
}
function removeLed(id: string) {
  saveStateForUndo() 
  positions.value = positions.value.filter(item => item.id !== id)
  connections.value = connections.value.filter(conn =>
  !conn.fromPinId.startsWith(id) && !conn.toPinId.startsWith(id)
)

}
function removeLine(id) {
  console.log("Removing line with ID:", id);
  connections.value = connections.value.filter(conn => conn.id !== id
)
}

function updateConnectionsPositions() {
  //console.log("Updating connection positions...");
  const workspaceRect = workspaceRef.value?.getBoundingClientRect();
  if (!workspaceRect) return;

  connections.value = connections.value.map(conn => {
    // Obtenemos el pin origen del SVG
    const svg = svgRef.value?.svgEl;
    if (!svg) return conn;

    const group = svg.querySelector<SVGElement>('#g147');
    if (!group) return conn;

    const pins = group.querySelectorAll<SVGElement>('[id]');
    const fromElement = Array.from(pins).find(el => el.id === conn.fromPinId);
    if (!fromElement) return conn;

    const toId = conn.toPinId.substring(0, conn.toPinId.lastIndexOf('-'));
    const side = conn.toPinId.substring(conn.toPinId.lastIndexOf('-') + 1);

    const toLedComponent = gadgetRefs.value[toId];
    if (!toLedComponent) return conn;

    const fromRect = fromElement.getBoundingClientRect();
    const x1 = fromRect.left + fromRect.width / 2 - workspaceRect.left;
    const y1 = fromRect.top + fromRect.height / 2 - workspaceRect.top;
    let x2 = conn.x2;
    let y2 = conn.y2;
    if (toId.includes('led') || toId.includes('buzzer') ){
      const ledValues = toLedComponent.getPinCoords();
      x2 = (side === 'left' ? ledValues.left.x : ledValues.right.x) - workspaceRect.left;
      y2 = (side === 'left' ? ledValues.left.y : ledValues.right.y) - workspaceRect.top;
    }
    else if (toId.includes('button')) {
      // side será 'upleft', 'upright', 'downleft', 'downright'
      const buttonValues = toLedComponent.getPinCoords();
      if (buttonValues && buttonValues[side]) {
        x2 = buttonValues[side].x - workspaceRect.left;
        y2 = buttonValues[side].y - workspaceRect.top;
      }
    }

    return {
      ...conn,
      x1,
      y1,
      x2,
      y2,
      strokeWidth: 2 * SCALE.value
    };
  });
}



function handlePinClick(ledId, side) {
  console.log(`Pin ${side} clicked on LED with ID: ${ledId} and selected pin: ${selectedPin.value}`);
  if (!selectedPin.value || !tempLine.value) return;

  const { x1, y1, x2, y2 } = tempLine.value;

  // Codo en el punto de quiebre (puedes ajustar la lógica)
  const codoX = x2;
  const codoY = y1;

  connections.value.push({
    id: `${ledId}-${side}-${selectedPin.value}`,
    x1,
    y1,
    x2,
    y2,
    codoX,
    codoY,
    fromPinId: selectedPin.value,
    toPinId: `${ledId}-${side}`,
    stroke: 'black',
    strokeWidth: 2 * SCALE.value,
  });
  console.log(connections.value)

  tempLine.value = null;
  selectedPin.value = null;
}

const lines = computed(() => {
  return connections.value.map(conn => ({
    x1: conn.x1,
    y1: conn.y1,
    x2: conn.x2,
    y2: conn.y2,
    codoX: conn.codoX,
    codoY: conn.codoY,
    stroke: conn.stroke,
    strokeWidth: 2 * SCALE.value
  }));
});


function handleMouseUp() {
  draggingId.value = null;
  setTimeout(() => {
    tempLine.value = null;
  }, 50); // Espera breve para dejar que el click ocurra
}
const pan = reactive({ x: 0, y: 0 });
const isPanning = ref(false);
const panStart = reactive({ x: 0, y: 0 });

function handleWorkspaceMouseDown(e: MouseEvent) {
  // Solo inicia el pan si no estás arrastrando un componente ni dibujando línea
  if (!draggingId.value && !selectedPin.value) {
    isPanning.value = true;
    panStart.x = e.clientX - pan.x;
    panStart.y = e.clientY - pan.y;
  }
}

function handleWorkspaceMouseMove(e: MouseEvent) {
  if (isPanning.value) {
    pan.x = e.clientX - panStart.x;
    pan.y = e.clientY - panStart.y;
  }
}

function handleWorkspaceMouseUp() {
  isPanning.value = false;
  updateConnectionsPositions()
}

function setupPinListeners() {
  if (!svgRef.value) return;

  // Accedemos al SVG completo
  const svg = svgRef.value.svgEl;
  if (!svg) return;

  // Buscamos el grupo donde están todos los pines
  const group = svg.querySelector<SVGElement>('#g147');
  console.log(group);
  if (!group) return;

  // Seleccionamos todos los hijos con id dentro del grupo GPIO5
  const pins = group.querySelectorAll<SVGElement>('[id]');
  
  pins.forEach(el => {
    const pinId = el.id;
    if ((boardDataMutable.value.pins as string[]).includes(pinId)) {
      // Cambiamos cursor para indicar que es clickeable
      (el as HTMLElement).style.cursor = "pointer";

      // Añadimos el click handler
      (el as HTMLElement).onclick = (e: Event) => {
        e.stopPropagation();

        if (selectedPin.value === pinId) {
          // Deseleccionar
          el.setAttribute("fill", "#ffd700");
          selectedPin.value = null;
          console.log("Out");
        } else {
          // Si había otro seleccionado, lo resetamos
          if (selectedPin.value) {
            const prev = svg.querySelector(`#${selectedPin.value}`);
            if (prev) prev.setAttribute("fill", "#ffd700");
          }
          // Seleccionamos el nuevo
          el.setAttribute("fill", "red");
          selectedPin.value = pinId;
          console.log("Selected");
        }
      };
    }
  });
}
watch(() => selectedPin.value, (newVal) => {
  console.log('selectedPin changed to:', newVal);
}, { immediate: true });

// onMounted(() => {
//   nextTick(() => {
//     setupPinListeners();
//   });
// });
watch(svgRef, async (newVal) => {
  if (newVal && newVal.svgEl) {
    await nextTick();
    setupPinListeners();
  }
});

watch(() => boardDataMutable.value.pins, () => {
  nextTick(() => {
    setupPinListeners();
  });
});
watch(positions, (newPositions) => {
  //console.log('Positions changed:', newPositions);
  updateConnectionsPositions();
}, { deep: true });

const showMenu = ref(false);
function setupMenu() {
  showMenu.value = !showMenu.value; 
}const showFile = ref(false);
function setupFile() {
  showFile.value = !showFile.value; 
}

// Workspace button

// Pantalla work

const showWork = ref(false);
function setupWork() {
  showWork.value = !showWork.value; 
}

function clearConnections() {
  const shouldClear = window.confirm("Do you want to erase all? This action cannot be undone!!");
  if (!shouldClear) {
    return;
  }

  // 2. Restaurar color de los pines en el SVG
  if (svgRef.value) {
    const group = svgRef.value.svgEl.querySelector<SVGElement>('#g147');
    if (group && boardDataMutable.value?.pins) {
      const pins = group.querySelectorAll<SVGElement>('[id]');
      pins.forEach(el => {
        const pinId = el.id;
        if ((boardDataMutable.value.pins as string[]).includes(pinId)) {
          el.setAttribute("fill", "#ffd700");
        }
      });
    }
  }

  // // 3. Eliminar LEDs que estaban conectados
  // positions.value = positions.value.filter(component => {
  //   // Si es un LED, lo eliminamos si hay alguna conexión cuyo id contenga el id del LED
  //   if (component.id.startsWith('led-')) {
  //     return !connections.value.some(conn => conn.id.includes(component.id));
  //   }
  //   return true; // mantener si no es LED
  // });a
  positions.value = positions.value.filter(component => component.id === 'board');
  connections.value = [];
  undoStack.value = [];
  redoStack.value = [];

  // 4. Resetear selección
  selectedPin.value = null;
}

function zoomIn() {
  SCALE.value += 0.5;
  if (SCALE.value > 5) SCALE.value = 5; // Limitar a 2x
  updateConnectionsPositions();
}
function zoomOut() {
  SCALE.value -= 0.5;
  if (SCALE.value < 1) SCALE.value = 1; // Limitar a 2x
  updateConnectionsPositions();
}
const showBoardSelect = ref(false)
function onWorkAction(action) {
  switch(action){
    case 'zoomin': zoomIn(); break;
    case 'zoomout': zoomOut(); break;
    case 'clean': clearConnections(); break;
    case 'undo': undo(); break;
    case 'redo': redo(); break;
    case 'dark': changeDarkMode(); break;
    case 'show': showBoardSelect.value = true; break; 
  }
}
function saveStateForUndo() {
  // Guarda una copia profunda del estado actual
  undoStack.value.push({
    positions: JSON.parse(JSON.stringify(positions.value)),
    connections: JSON.parse(JSON.stringify(connections.value)),
  });
  // Limita el tamaño del stack si quieres
  if (undoStack.value.length > 50) undoStack.value.shift();
}

function undo() {
  if (undoStack.value.length === 0) return;
  // Guarda el estado actual en el redoStack antes de deshacer
  redoStack.value.push({
    positions: JSON.parse(JSON.stringify(positions.value)),
    connections: JSON.parse(JSON.stringify(connections.value)),
  });
  const prevState = undoStack.value.pop();
  if (prevState) {
    positions.value = JSON.parse(JSON.stringify(prevState.positions));
    connections.value = JSON.parse(JSON.stringify(prevState.connections));
    updateConnectionsPositions();
  }
}
function redo() {
  if (redoStack.value.length === 0) return;
  // Guarda el estado actual en el undoStack antes de rehacer
  undoStack.value.push({
    positions: JSON.parse(JSON.stringify(positions.value)),
    connections: JSON.parse(JSON.stringify(connections.value)),
  });
  const nextState = redoStack.value.pop();
  if (nextState) {
    positions.value = JSON.parse(JSON.stringify(nextState.positions));
    connections.value = JSON.parse(JSON.stringify(nextState.connections));
    updateConnectionsPositions();
  }
}

const darkMode = ref(false);

function changeDarkMode() {
  darkMode.value = !darkMode.value;
  const app = document.getElementById('app-main');
  if (darkMode.value) {
    app?.classList.add('dark-mode');
    localStorage.setItem("conf_dark_mode", "on");
  } else {
    app?.classList.remove('dark-mode');
    localStorage.setItem("conf_dark_mode", "off");
  }
}
onMounted(() => {
  const app = document.getElementById('app-main');
  if (localStorage.getItem("conf_dark_mode") === "on") {
    darkMode.value = true;
    app?.classList.add('dark-mode');
  }
});
// Pantalla archivos
function onFileAction(action) {
  console.log("File action received:", action);
  if (action === 'save') {
    console.log("Saving board state...");
    showSave.value = true;
  }
  if (action === 'upload') {
    console.log("Uploading board state...");
    showUpload.value = true;
  }
  if (action.type == "example") {
    console.log("Loading example file:", action.file);
    loadPreloadedFile(action.file);
    }
  }

function confirmDownload() {
  showSave.value = false;
  downloadState();
}

function cancelDownload() {
  showSave.value = false;
}

function downloadState() {
  const state = {
    positions: positions.value,
    connections: connections.value,
    boardData: boardDataMutable.value, // <--- usa boardData aquí
    code: root?.assembly_code,
  };
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.value || 'board-state'}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

// Upload file 
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const content = e.target.result as string;
      const parsed = JSON.parse(content);

      // Reemplaza todo el array con uno nuevo (gatilla la reactividad en Vue)
      positions.value = (parsed.positions || []).map(p => ({
        id: p.id,
        position: p.position,
        compState: p.compState ?? true,
        flipped: p.flipped ?? false,
        rotation: p.rotation ?? 0,
        color: p.color ?? 'red'
      }));
      console.log("Positions loaded:", positions.value);

      connections.value = parsed.connections || [];
      boardDataMutable.value = parsed.boardData && parsed.boardData.pins
  ? parsed.boardData
  : { ...boardData }; // <-- fallback al boardData original si falta pins
      root.assembly_code = parsed.code || [];

      nextTick(() => {
        updateConnectionsPositions(); // Actualiza visualmente las líneas
      });

      showSave.value = false;
    } catch (err) {
      console.error('Error parsing uploaded JSON:', err);
    }
  };
  reader.readAsText(file);
}

function confirmUpload() {
  showUpload.value = false;
}

function cancelUpload() {
  showUpload.value = false;
}

//Ejemplos
function loadPreloadedFile(file) {
  fetch(file)
    .then(res => res.json())
    .then(parsed => {
      positions.value = (parsed.positions || []).map(p => ({
        id: p.id,
        position: p.position,
        compState: p.compState ?? true,
        flipped: p.flipped ?? false,
        rotation: p.rotation ?? 0,
        color: p.color ?? 'red'
      }));
      connections.value = parsed.connections || [];
      boardDataMutable.value = parsed.boardData && parsed.boardData.pins
        ? parsed.boardData
        : { ...boardData };
      asmCode.value = parsed.code || [];

      nextTick(() => {
        updateConnectionsPositions();
      });
    })
    .catch(err => {
      console.error('Error loading precargado:', err);
    });
}
function handleUpdateBoardData(newBoardData) {
  console.log("Updating board data:", newBoardData);

  // Guarda el estado para undo
  saveStateForUndo();

  // Si hay rotación, actualízala en el objeto 'board' de positions
  if (typeof newBoardData.rotation === 'number') {
    const board = positions.value.find(item => item.id === 'board');
    if (board) board.rotation = newBoardData.rotation;
  }

  // Actualiza boardDataMutable si es necesario
  boardDataMutable.value = { ...boardDataMutable.value, ...newBoardData };

  nextTick(() => {
    setupPinListeners();
  });
}
const boardComponent = ref(null)
const boardJs = ref(null)

async function handleBoardSelect(base: string) {
  // Carga dinámica de los tres archivos
  boardComponent.value = (await import(`./components/BoardElements/${base}.vue`)).default
  boardDataMutable.value = (await import(`./components/BoardElements/${base}.json`)).default
  boardJs.value = (await import(`./components/BoardElements/${base}.js`)).default
  showBoardSelect.value = false
}
// async function exportBoardAsZip() {
//   const zip = new JSZip();

//   // 1. Agrega el JSON
//   const json = JSON.stringify(boardDataMutable.value, null, 2);
//   zip.file((boardDataMutable.value?.name || 'custom-board') + '.json', json);

//   // 2. Agrega el JS
//   // Si tienes el código JS en memoria, usa esa variable.
//   // Si no, lo cargas por fetch:
//   const jsCode = await fetch('/src/components/BoardElements/emulator.js').then(res => res.text());
//   zip.file('emulator.js', jsCode);

//   // 3. Agrega el Vue
//   // Si tienes el código Vue en memoria, usa esa variable.
//   // Si no, lo cargas por fetch:
//   const vueCode = await fetch('/src/components/BoardElements/ESP32C3Dev2Board.vue').then(res => res.text());
//   zip.file('ESP32C3Dev2Board.vue', vueCode);

//   // 4. Genera y descarga el ZIP
//   const blob = await zip.generateAsync({ type: 'blob' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = (boardDataMutable.value?.name || 'custom-board') + '.zip';
//   a.click();
//   URL.revokeObjectURL(url);
// }
onMounted(() => {
  handleBoardSelect('esp32c3devkit2')
})
</script>

<template>
  <div id="app-main" class="App" @mousemove="handleMouseMove" @mouseup="handleMouseUp" style="width: 100%; height: 100%; position: relative; overflow: hidden;">
    <!-- Adjusted the size of the App container to match DataView.vue -->
    <Menu v-if="showMenu" :dark-mode="darkMode" style="position: absolute; bottom:100px; right: 100px; " @add-gadget="handleAddGadget" />
    <FileMenu v-if="showFile" style="position: absolute; top: 90px; right: 180px;" @file-action="onFileAction" />
    <WorkMenu v-if="showWork" style="position: absolute; top: 90px; left:100px; " @work-action="onWorkAction" />
        <!-- <button @click="loadPreloadedFile" style="position: absolute; top: 20px; left: 20px; z-index: 1000;">
      Cargar archivo precargado
    </button> -->

    <!-- Pantalla save -->
    <div class="modal fade show" tabindex="-1" style="display: block; z-index: 1200;" v-if="showSave" aria-modal="true" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Introduce a name for the save file:</h5>
            <button type="button" class="btn-close" @click="cancelDownload"></button>
          </div>
          <div class="modal-body">
            <input v-model="filename" class="form-control" placeholder="board-state" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" @click="confirmDownload">Confirm</button>
            <button class="btn btn-primary" @click="cancelDownload">Cancel</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showSave"></div>

    <!-- Pantalla upload -->
    <div class="modal fade show" tabindex="-1" style="display: block; z-index: 1200;" v-if="showUpload" aria-modal="true" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Upload a CREATino JSON file to load :</h5>
            <button type="button" class="btn-close" @click="cancelUpload"></button>
          </div>
          <div class="modal-body">
            <input type="file" @change="handleFileUpload" accept=".json" class="form-control" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" @click="confirmUpload">Confirm</button>
            <button class="btn btn-primary" @click="cancelUpload">Cancel</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showUpload"></div>

    <div ref="workspaceRef" 
      @mousedown="handleWorkspaceMouseDown"
      @mousemove="handleWorkspaceMouseMove"
      @mouseup="handleWorkspaceMouseUp"
      style="width: 100%; height: 95%; border: 2px solid #ccc; position: relative; margin-bottom: 1rem; overflow: hidden;">
      <!-- Elementos de zoom -->
      <div style="position: absolute; top: 20px; left: 20px; z-index: 1100; display: flex; flex-direction: column;">
        <!-- <button @click="zoomIn" style="font-size: 2rem; padding: 0.75rem 1.5rem; margin-bottom: 0.5rem;" id="menu-btn">
          <fa-icon :icon="['fas', 'magnifying-glass-plus']" style="width: 1em; height: 1em; color: white;" />
        </button>
        <button @click="zoomOut" style="font-size: 2rem; padding: 0.75rem 1.5rem;" id="menu-btn">
          <fa-icon :icon="['fas', 'magnifying-glass-minus']" style="width: 1em; height: 1em; color: white;" />
        </button> -->
        <button @click="setupWork" style="font-size: 2rem; padding: 0.75rem 1.5rem; margin-bottom: 0.5rem;" id="work-btn">
          <fa-icon :icon="['fas', 'wrench']" style="width: 1em; height: 1em; color: white;" />
        </button>
      </div>
      <div style="position: absolute; top: 20px; right: 20px; z-index: 1100; display: flex; flex-direction: column;">
        <button @click="setupFile" style="font-size: 2rem; padding: 0.75rem 1.5rem; margin-bottom: 0.5rem;" id="menu-btn">
          <fa-icon :icon="['fas', 'bars']" style="width: 1em; height: 1em; color: white;" />
        </button>
      </div>

      <div style="position: absolute; bottom: 20px; right: 20px; z-index: 1100;">
        <!-- Botones del fondo -->
        <div style="position: relative; display: inline-block;">
          <button @click="setupMenu" id="plus-btn" style="font-size: 1.5rem; padding: 0.75rem 1.5rem; margin-right: 0.5rem;">
            <fa-icon :icon="['fas', 'circle-plus']" style="width: 1em; height: 1em; color: white;" />
          </button>
          <!--<button @click="runProgram" style="font-size: 1.5rem; padding: 0.75rem 1.5rem; margin-right: 0.5rem;"> -->
            <!-- <fa-icon :icon="['fas', 'play']" style="width: 1em; height: 1em; color: white;" /> -->

          <!-- 
          </button> -->
          <!-- <button @click="exportBoardAsZip">Exportar placa como ZIP</button> -->
          <!-- <button @click="clearConnections" style="font-size: 1.5rem; padding: 0.75rem 1.5rem;">
            <fa-icon :icon="['fas', 'trash']" style="width: 1em; height: 1em; color: white;" />
          </button> -->
          <!-- <button @click="handleAddGadget('LED')" style="position: absolute; top: -80px; left: 10px;">Añadir LED</button> -->

        </div>
      </div>
      <div 
        :style="{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${SCALE})`, 
          transformOrigin: 'top left', 
          display: 'inline-block' 
        }">
        
        <component :is="boardComponent" v-if="boardComponent"
          :positions="positions"
          @handleMouseDown="handleMouseDown"
          @updateBoard="handleUpdateBoardData"
          ref="svgRef"
        />
        <LEDComponent
          v-for="led in positions.filter(item => item.id.startsWith('led-'))"
          :id="led.id"
          :position="led.position"
          :ledState="led.compState"
          :selectedPin="selectedPin?.value"
          :ledColor="led.color"
          :flipped="led.flipped"
          :rotation="led.rotation"
          :connections="connections"
          @handleMouseDown="(e) => handleMouseDown(e, led.id)"
          @handlePinClick="(side) => handlePinClick(led.id, side)"
          @delete="removeLed(led.id)"
          @flip="() => handleFlip(led.id)"
          @rotate="() => handleRotate(led.id)"
          @updateState="(state) => handleLedStateChange(led.id, state)"
          :ref="el => {
            if (el) gadgetRefs[led.id] = el;
            else delete gadgetRefs[led.id];
          }"
        />
        <ButtonComponent
          v-for="button in positions.filter(item => item.id.startsWith('button-'))"
          :id="button.id"
          :position="button.position"
          :buttonState="button.compState"
          :flipped="button.flipped"
          :rotation="button.rotation"
          :connections="connections"
          @handleMouseDown="(e) => handleMouseDown(e, button.id)"
          @handlePinClick="(side) => handlePinClick(button.id, side)"
          @delete="removeLed(button.id)"
          @flip="() => handleFlip(button.id)"
          @rotate="() => handleRotate(button.id)"
          @updateState="(state) => handleLedStateChange(button.id, state)"
          :ref="el => {
            if (el) gadgetRefs[button.id] = el;
            else delete gadgetRefs[button.id];
          }"
        />
      <Buzzer
          v-for="buzzer in positions.filter(item => item.id.startsWith('buzzer-'))"
          :key="buzzer.id"
          :id="buzzer.id"
          :position="buzzer.position"
          :isSignal="buzzer.compState"
          :flipped="buzzer.flipped"
          :rotation="buzzer.rotation"
          :connections="connections"
          @handleMouseDown="(e) => handleMouseDown(e, buzzer.id)"
          @handlePinClick="(side) => handlePinClick(buzzer.id, side)"
          @delete="removeLed(buzzer.id)"
          @flip="() => handleFlip(buzzer.id)"
          @rotate="() => handleRotate(buzzer.id)"
          @updateState="(state) => handleLedStateChange(buzzer.id, state)"
          :ref="el => {
            if (el) gadgetRefs[buzzer.id] = el;
            else delete gadgetRefs[buzzer.id];
          }"
        />
      </div>
      <!-- <ConnectionsLines
        :connections="connections"
        :svgRef="svgRef"
        :positions="positions"
        :workspaceRef="workspaceRef"
      /> -->
      <ConnectionsLines
        :connections="connections"
        :svgRef="svgRef"
        :positions="positions"
        :workspaceRef="workspaceRef"
        :tempLine="tempLine"
        :lines="lines"
        @delete="removeLine"
        @update:lineValue="changelineValue => {
          connections = connections.map(conn => {
            if (conn.id === changelineValue.id) {
              // Solo actualiza la propiedad indicada
              return { ...conn, [changelineValue.property]: changelineValue.value };
            }
            return conn;
          });
        }"
    />

    </div>

    <!-- <textarea v-model="asmCode" readonly style="width: 100%;" rows="10"></textarea> -->
  </div>
  <div id="overlay-container"
     style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2000;">
  </div>
  <teleport to="body">
  <div v-if="showBoardSelect" class="modal-backdrop" style="z-index:3000;">
    <div class="modal-center">
      <BoardSelect @select="handleBoardSelect" @close-select="showBoardSelect = false" />
      <!-- <button class="btn btn-secondary mt-2" @click="showBoardSelect = false">Cerrar</button> -->
    </div>
  </div>
</teleport>
</template>

<style>
/* --------- General --------- */
#app-main {
  background-color: transparent;
  color: #212529;
  transition: background 0.3s, color 0.3s;
}
#app-main button,
#app-main .btn {
  background: #0d6efd;
  color: #fff;
  border: 1px solid #0d6efd;
  border-radius: 0.25rem;
  transition: background 0.2s, color 0.2s;
  font-weight: 500;
  padding: 0.5rem 1rem;
  z-index: 1 !important;
}
#app-main button:hover,
#app-main .btn:hover {
  background: #0b5ed7;
  color: #fff;
}
#app-main input,
#app-main select,
#app-main textarea,
#app-main .form-control {
  background: #f8fafc;
  color: #23272b;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  /* padding: 0.375rem 0.75rem; */
  transition: background 0.2s, color 0.2s;
}

/* --------- Bootstrap Modal --------- */
.modal-content {
  background-color: #fff !important;
  color: #23272b !important;
  border-radius: 0.7rem;
  box-shadow: 0 8px 32px rgba(60,60,60,0.12);
}
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5) !important;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000 ;
}
.modal-center {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.2);
  min-width: 320px;
  max-width: 90vw;
}
.modal-footer .btn {
  background-color: #0d6efd !important;
  color: #fff !important;
  border-color: #0d6efd !important;
}
.modal-footer .btn:hover, 
.modal-footer .btn:focus {
  background-color: #0b5ed7 !important;
  border-color: #0a58ca !important;
  color: #fff !important;
}

/* --------- Modo Oscuro --------- */
.dark-mode,
.dark-mode #app-main {
  background-color: #181a1b !important;
  color: #f8f9fa !important;
}
.dark-mode #app-main button,
.dark-mode #app-main .btn {
  background: #2563eb !important;
  color: #f8f9fa !important;
  border-color: #2563eb !important;
}
.dark-mode #app-main button:hover,
.dark-mode #app-main .btn:hover {
  background: #1e40af !important;
  color: #fff !important;
}
.dark-mode #app-main input,
.dark-mode #app-main select,
.dark-mode #app-main textarea,
.dark-mode #app-main .form-control {
  background: #23272b !important;
  color: #f8f9fa !important;
  border-color: #454d55 !important;
}
.dark-mode .modal-content {
  background-color: #23272b !important;
  color: #f8f9fa !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.32);
}
.dark-mode .modal-footer .btn {
  background-color: #2563eb !important;
  color: #fff !important;
  border-color: #2563eb !important;
}
.dark-mode .modal-footer .btn:hover,
.dark-mode .modal-footer .btn:focus {
  background-color: #1e40af !important;
  border-color: #1e40af !important;
  color: #fff !important;
} 
.dark-mode .bg-white,
.dark-mode .bg-light,
.dark-mode .card,
.dark-mode .border,
.dark-mode .shadow-sm {
  background-color: #23272b !important;
  color: #f8f9fa !important;
  border-color: #343a40 !important;
}
.dark-mode hr,
.dark-mode .border,
.dark-mode .modal-content {
  border-color: #343a40 !important;
}
.dark-mode .form-check-input {
  background-color: #23272b !important;
  border-color: #495057 !important;
}
.dark-mode .form-check-input:checked {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}
.dark-mode ::placeholder,
.dark-mode .form-control::placeholder {
  color: #b0b3b8 !important;
  opacity: 1;
}
.dark-mode .modal-footer .btn {
  background-color: #2563eb !important;
  color: #fff !important;
  border-color: #2563eb !important;
}
.dark-mode .modal-footer .btn:hover,
.dark-mode .modal-footer .btn:focus {
  background-color: #1e40af !important;
  border-color: #1e40af !important;
  color: #fff !important;
}

/* Opcional: scrollbar */
.dark-mode ::-webkit-scrollbar {
  background: #23272b;
}
.dark-mode ::-webkit-scrollbar-thumb {
  background: #343a40;
}
</style>