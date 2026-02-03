
import { ref, type Ref } from 'vue';

export interface PinStateMap {
  [key: string]: number;
}

//TODO: more type of states (This is ESP32-C3_DevKitC-02)
export const pinStates: Ref<PinStateMap> = ref({
  "GPIO0": 0, "GPIO1": 0, "GPIO2": 0, "GPIO3": 0,
  "GPIO4": 0, "GPIO5": 0, "GPIO6": 0, "GPIO7": 0,
  "GPIO8": 0, "GPIO9": 0, "GPIO10": 0, "GPIO18": 0,
  "GPIO19": 0, "GPIO20": 0, "GPIO21": 0
});