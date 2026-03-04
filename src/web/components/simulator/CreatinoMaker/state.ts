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

type SVGSVGElement = any;

export const svgRef = ref<SVGSVGElement | null>(null)