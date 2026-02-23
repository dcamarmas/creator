import { ref, type Ref } from 'vue';

// --- Tipado ---
export interface PinStateMap {
  [key: string]: number;
}

export interface BoardConfig {
  name: string;
  svg: string;
  pinLabels: string[][]; // Estructura de columnas [izquierda, derecha]
  initialStates: PinStateMap;
}
const baseUrl = import.meta.env.BASE_URL
// Board definition
const BOARDS: Record<string, BoardConfig> = {
  "esp32c3devkit2": {
    name: "ESP32-C3 DevKitC-02",
    svg: baseUrl + "maker/boards/esp32c3devkit2.svg",
    pinLabels: [
      ["GPIO4", "GPIO5", "GPIO6", "GPIO7", "GPIO8", "GPIO9", "GPIO30"],
      ["GPIO0", "GPIO1", "GPIO2", "GPIO3", "GPIO20", "GPIO21", "GPIO18", "GPIO19"]
    ],
    initialStates: {
      "GPIO0": 0, "GPIO1": 0, "GPIO2": 0, "GPIO3": 0, "GPIO4": 0, "GPIO5": 0,
      "GPIO6": 0, "GPIO7": 0, "GPIO8": 0, "GPIO9": 0, "GPIO10": 0, "GPIO18": 0,
      "GPIO19": 0, "GPIO20": 0, "GPIO21": 0, "GPIO30": 0
    }
  },
  "esp32c6devkit1": {
    name: "ESP32-C6 DevKit",
    svg: baseUrl + "maker/boards/esp32c6devkit1.svg",
    pinLabels: [
      ["GPIO4", "GPIO5", "GPIO6", "GPIO7", "GPIO0", "GPIO1", "GPIO8", "GPIO10", "GPIO11","GPIO2","GPIO3"],
      ["GPIO15", "GPIO23", "GPIO22", "GPIO21", "GPIO20", "GPIO19", "GPIO18", "GPIO9", "GPIO17","GPIO9","GPIO13", "GPIO12"]
    ],
    initialStates: {
      "GPIO0": 0,  "GPIO1": 0,  "GPIO2": 0,  "GPIO3": 0,  "GPIO4": 0, 
      "GPIO5": 0,  "GPIO6": 0,  "GPIO7": 0,  "GPIO8": 0,  "GPIO9": 0, 
      "GPIO10": 0, "GPIO11": 0, "GPIO12": 0, "GPIO13": 0, "GPIO15": 0, 
      "GPIO17": 0, "GPIO18": 0, "GPIO19": 0, "GPIO20": 0, "GPIO21": 0, 
      "GPIO22": 0, "GPIO23": 0
    }
  },
};

// States

// Por defecto empezamos con la ESP32
const currentBoardKey = "esp32c3devkit2"; 

export const activeBoard = ref(BOARDS[currentBoardKey]);
export const pinStates: Ref<PinStateMap> = ref({ ...BOARDS[currentBoardKey]?.initialStates });
export const pinLabels = ref(BOARDS[currentBoardKey]?.pinLabels);

// Change boards
export function switchBoard(boardKey: string) {
  if (BOARDS[boardKey]) {
    console.log(`Switching to board: ${BOARDS[boardKey].name}`);
    activeBoard.value = BOARDS[boardKey];
    pinStates.value = { ...BOARDS[boardKey].initialStates };
    pinLabels.value = BOARDS[boardKey].pinLabels;
  }
}