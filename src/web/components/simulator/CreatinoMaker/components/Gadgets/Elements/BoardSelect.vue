<script setup>
import { ref } from 'vue'
const emit = defineEmits(['select'])

const boardFiles = [
  'esp32.svg',
  'esp32c3devkit2.svg',
]

const images = boardFiles.map((filename, index) => ({
  id: index + 1,
  url: `/boards/${filename}`,
  name: filename.replace('.svg', '').toUpperCase(),
  base: filename.replace('.svg', ''),
}))

const selected = ref(null)
function selectBoard(board) {
  selected.value = board
  console.log("Selected board:",board.base)
  emit('select', board.base)
}
function close() {
  console.log("Closing")
  emit('close-select')
}

// Detecta modo oscuro por clase en body o app
const isDark = ref(document.body.classList.contains('dark-mode') || document.querySelector('#app-main')?.classList.contains('dark-mode'))

function updateDarkMode() {
  isDark.value = document.body.classList.contains('dark-mode') || document.querySelector('#app-main')?.classList.contains('dark-mode')
}
</script>

<template>
   <div class="menu-panel bg-white border rounded-3 shadow-sm p-3" :class="{ 'bg-dark text-light': isDark }">
    <h5>Selecciona una placa</h5>
    <div class="board-list">
      <div
        v-for="board in images"
        :key="board.id"
        class="board-item"
        @click="selectBoard(board)"
        :class="{ selected: selected && selected.id === board.id }"
      >
        <img :src="board.url" :alt="board.name" />
        <span>{{ board.name }}</span>
      </div>
    </div>
    <button class="btn btn-secondary mt-2" @click="close">Cerrar</button>
  </div>
</template>

<style>
.modal-board-select {
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 1.2rem;
  min-width: 580px;      /* Más ancho */
  max-width: 98vw;
  box-shadow: 0 2px 24px rgba(0,0,0,0.18);
  text-align: center;
}
.board-list {
  display: flex;
  gap: 2.5rem;           /* Más separación */
  justify-content: center;
  margin: 2rem 0;
  flex-wrap: wrap;
}
.board-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 1rem;
  transition: border 0.2s, background 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;          /* Más ancho */
}
.board-item.selected,
.board-item:hover {
  border: 2.5px solid #0d6efd;
  background: #f0f8ff;
}
.board-item img {
  width: 250px;          /* Imagen más grande */
  height: 250px;
  object-fit: contain;
  margin-bottom: 1rem;
}
</style>
