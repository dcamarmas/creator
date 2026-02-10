import { reactive } from "vue";
import { executionState as raw } from "./utils.mjs";

let proxy: any;

export function useExecutionState() {
  if (!proxy) 
    proxy = reactive(raw);
  
  return proxy;
}