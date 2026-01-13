import { ref } from 'vue';



export const compState = ref(true);
export const positions = ref<{ id: string, position: { x: number, y: number }, compState: boolean ,   flipped: boolean,  rotation: number, color : string }[]>([
  {
    id: 'board',
    position: { x: 300, y: 100 },
    compState: true,
    flipped: false,
    rotation: 0,
    color: 'black',
  }
]);

// Dibujo de líneas
export const connections = ref<Array<{
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  fromPinId: string,
  toPinId: string,
  stroke: string,
  strokeWidth: number
}>>([]);
// Código

// const asmCode = ref([
//       "addi a0, a0, 5",
//       "jal ra, 0x104",
//       "addi a0, a0, -4000",
//       "addi a0, a0, 5",
//       "addi a1, a1, 1",
//       "jal ra, 0x108",

//     ]);
const asmCode = ref([
      "addi a0, a0, 5",
      "addi a1, a1, 1",
      "jal ra, 0x100",
      "addi a0, a0, -5",
      "addi a0, a0, 1000",
      "jal ra, 0x104",
      "addi a0, a0, -1000",
      "addi a0, a0, 5",
      "addi a1, a1, -1",
      "addi a1, a1, 0",
      "jal ra, 0x100",
    ]);

export const svgRef = ref<SVGSVGElement | null>(null)