<!--
Copyright 2018-2025 CREATOR Team.

This file is part of CREATOR.

CREATOR is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

CREATOR is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
-->
<script setup lang="ts">
import { ref, computed, onMounted, watch, type PropType } from "vue";
import {
  set_execution_mode,
  status,
  guiVariables,
  instructions_packed,
  reset as coreReset,
  getPC,
} from "@/core/core.mjs";
import {
  instructions as coreInstructions,
  setInstructions,
} from "@/core/assembler/assembler.mjs";
import { step } from "@/core/executor/executor.mjs";
import { creator_ga } from "@/core/utils/creator_ga.mjs";
import { packExecute } from "@/core/utils/utils.mjs";
import { show_notification } from "@/web/utils.mjs";
import type { Instruction } from "@/core/assembler/assembler";

const props = defineProps({
  instructions: {
    type: Array as PropType<Instruction[]>,
    required: true,
  },
  autoscroll: {
    type: Boolean,
    default: false,
  },
  os: {
    type: String,
    required: true,
  },
  browser: {
    type: String,
    required: true,
  },
  dark: {
    type: Boolean,
    default: false,
  },
});

// Button state
const reset_disable = ref(true);
const instruction_disable = ref(false);
const run_disable = ref(false);
const stop_disable = ref(true);

// Computed properties
const instruction_values = computed({
  get() {
    return props.instructions;
  },
  set(value: Instruction[]) {
    setInstructions(value);
  },
});

const accesskey_prefix = computed(() => {
  if (props.os === "Mac") {
    return "^ ⌥ ";
  } else {
    switch (props.browser) {
      case "Chrome":
        return "Alt+";
      case "Firefox":
        return "Alt+Shift+";
      default:
        return "???";
    }
  }
});

// Lifecycle
onMounted(() => {
  // Enable execution buttons only if there are instructions to execute
  const prepared_for_execution = props.instructions.length > 0;

  if (status.run_program !== 3) {
    run_disable.value = !prepared_for_execution;
    reset_disable.value = !prepared_for_execution;
    instruction_disable.value = !prepared_for_execution;
  }
});

// Watch for changes in instructions to update button states
watch(
  () => props.instructions.length,
  newLength => {
    const prepared_for_execution = newLength > 0;

    if (status.run_program !== 3) {
      run_disable.value = !prepared_for_execution;
      reset_disable.value = !prepared_for_execution;
      instruction_disable.value = !prepared_for_execution;
    }
  },
);

// Methods
function execution_UI_update(ret: ExecutionResult | undefined) {
  if (ret === undefined) {
    return;
  }

  const root = (document as any).app;

  /* MEMORY */
  root?.$refs.simulatorView?.$refs.memory?.refresh();

  /* STATS */
  root?.$refs.simulatorView?.$refs.stats?.refresh();

  /* EXECUTION TABLE */
  const currentPC = getPC();
  const previousPC = guiVariables.previous_PC;
  const keep_highlighted = guiVariables.keep_highlighted;

  for (let i = 0; i < instruction_values.value.length; i++) {
    instruction_values.value[i]!._rowVariant = "";

    switch (BigInt(instruction_values.value[i]!.Address)) {
      case keep_highlighted:
        instruction_values.value[i]!._rowVariant = "warning";
        break;
      case previousPC:
        instruction_values.value[i]!._rowVariant = "info";
        break;
      case currentPC:
        instruction_values.value[i]!._rowVariant = "success";
        break;
      default:
        break;
    }
  }

  // Auto-scroll
  if (
    props.autoscroll &&
    status.run_program !== 1 &&
    props.instructions.length > 0
  ) {
    if (
      status.execution_index >= 0 &&
      status.execution_index < props.instructions.length
    ) {
      let row = status.execution_index + 1;
      if (status.execution_index + 1 === props.instructions.length) {
        row = status.execution_index;
      }

      const rowElement = document.querySelector(
        "#inst_table__row_" + props.instructions[row]!.Address,
      ) as HTMLElement;
      const tableElement = document.querySelector(".instructions_table");

      if (rowElement && tableElement) {
        const rowPos = rowElement.offsetTop;
        const tableHeight = tableElement.clientHeight;

        tableElement.scrollTo({
          top: rowPos - tableHeight / 2,
          behavior: "smooth",
        });
      }
    } else {
      const tableElement = document.querySelector(".instructions_table");

      if (tableElement) {
        tableElement.scrollTo({
          top: tableElement.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }
}

function execution_UI_reset() {
  const draw: ExecutionDraw = {
    space: [],
    info: [],
    success: [],
    warning: [],
    danger: [],
    flash: [],
  };

  for (let i = 0; i < props.instructions.length; i++) {
    draw.space.push(i);
  }

  draw.success.push(status.execution_index);

  execution_UI_update(packExecute(false, null, null, draw));

  // Ensure buttons are enabled if there are instructions
  const prepared_for_execution = props.instructions.length > 0;
  if (prepared_for_execution && status.run_program !== 3) {
    reset_disable.value = false;
    instruction_disable.value = false;
    run_disable.value = false;
    stop_disable.value = true;
  }
}

function reset() {
  creator_ga("execute", "execute.reset", "execute.reset");

  const root = (document as any).app;

  // UI: reset I/O
  root.keyboard = "";
  root.display = "";
  root.enter = null;

  // Reset button status
  reset_disable.value = false;
  instruction_disable.value = false;
  run_disable.value = false;
  stop_disable.value = true;

  coreReset();

  execution_UI_reset();
}

function execute_instruction() {
  creator_ga("execute", "execute.instruction", "execute.instruction");

  set_execution_mode(0);

  let ret;
  try {
    ret = step() as unknown as ExecutionResult;
  } catch (err: any) {
    console.error("Execution error:", err);
    show_notification(`Execution error: ${err.message || err}`, "danger");

    if (
      status.execution_index >= 0 &&
      status.execution_index < instruction_values.value.length
    ) {
      instruction_values.value[status.execution_index]!._rowVariant = "danger";
    }

    status.execution_index = -1;
    status.error = true;

    execution_UI_update({ error: true, msg: err.message || err });
    return;
  }

  if (status.run_program === 3) {
    instruction_disable.value = true;
    run_disable.value = true;
  }

  if (typeof ret === "undefined") {
    console.log("Something weird happened :-S");
  }

  if (ret.msg) {
    show_notification(ret.msg, ret.type!);
  }

  if (ret.draw !== null) {
    execution_UI_update(ret);
  }
}

function execute_program() {
  creator_ga("execute", "execute.run", "execute.run");

  set_execution_mode(1);

  if (status.run_program === 0) {
    status.run_program = 1;
  }

  if (props.instructions.length === 0) {
    show_notification("No instructions in memory", "danger");
    status.run_program = 0;
    return;
  }
  if (status.execution_index < -1) {
    show_notification("The program has finished", "warning");
    status.run_program = 0;
    return;
  }
  if (status.execution_index === -1) {
    show_notification("The program has finished with errors", "danger");
    status.run_program = 0;
    return;
  }

  // Change buttons status
  reset_disable.value = true;
  instruction_disable.value = true;
  run_disable.value = true;
  stop_disable.value = false;

  execute_program_packed();
}

function execute_program_packed() {
  let ret = undefined;

  for (let i = 0; i < instructions_packed && status.execution_index >= 0; i++) {
    if (
      status.run_program === 0 ||
      status.run_program === 3 ||
      (coreInstructions[status.execution_index]?.Break === true &&
        status.run_program !== 2)
    ) {
      execution_UI_update(ret);

      reset_disable.value = false;
      instruction_disable.value = false;
      run_disable.value = false;
      stop_disable.value = true;

      if (coreInstructions[status.execution_index]?.Break === true) {
        status.run_program = 2;
      }
      return;
    } else {
      if (status.run_program === 2) {
        status.run_program = 1;
      }

      try {
        ret = step() as unknown as ExecutionResult;
      } catch (err: any) {
        console.error("Execution error:", err);
        show_notification(`Execution error: ${err.message || err}`, "danger");

        if (
          status.execution_index >= 0 &&
          status.execution_index < instruction_values.value.length
        ) {
          instruction_values.value[status.execution_index]!._rowVariant =
            "danger";
        }

        status.run_program = 0;
        status.execution_index = -1;
        status.error = true;

        execution_UI_update({ error: true, msg: err.message || err });

        reset_disable.value = false;
        instruction_disable.value = true;
        run_disable.value = true;
        stop_disable.value = true;

        return;
      }

      if (typeof ret === "undefined") {
        console.log("Something weird happened :-S");
        status.run_program = 0;

        execution_UI_update(ret);

        reset_disable.value = false;
        instruction_disable.value = true;
        run_disable.value = true;
        stop_disable.value = true;

        return;
      }

      if (ret.msg) {
        show_notification(ret.msg, ret.type!);

        execution_UI_update(ret);

        reset_disable.value = false;
        instruction_disable.value = true;
        run_disable.value = true;
        stop_disable.value = true;
      }
    }
  }

  if (status.execution_index >= 0) {
    setTimeout(execute_program_packed, 15, ret);
  } else {
    execution_UI_update(ret);
    reset_disable.value = false;
    instruction_disable.value = true;
    run_disable.value = true;
    stop_disable.value = true;
  }
}

function stop_execution() {
  status.run_program = 0;

  // Only enable step and run if execution hasn't finished
  const execution_finished =
    status.execution_index < 0 || status.run_program === 3;

  reset_disable.value = false;
  instruction_disable.value = execution_finished;
  run_disable.value = execution_finished;
  stop_disable.value = true;
}

// Expose methods to parent components
defineExpose({
  execution_UI_reset,
  reset,
});
</script>

<template>

  <div class="button-group">
     <button
      class="sim-button"
      :class="{ 'sim-button-dark': dark }"
      accesskey="x"
      :disabled="reset_disable"
      :title="`${accesskey_prefix}X`"
      @click="reset()"
    >
       <font-awesome-icon :icon="['fas', 'power-off']" class="icon-spacing" />
      <span class="button-text">Reset</span> </button
    > <button
      class="sim-button"
      :class="{ 'sim-button-dark': dark }"
      accesskey="a"
      :disabled="instruction_disable"
      :title="`${accesskey_prefix}A`"
      @click="execute_instruction"
    >
       <font-awesome-icon
        :icon="['fas', 'forward-step']"
        class="icon-spacing"
      /> <span class="button-text">Step</span> </button
    > <button
      id="playExecution"
      class="sim-button"
      :class="{ 'sim-button-dark': dark }"
      accesskey="r"
      :disabled="run_disable"
      :title="`${accesskey_prefix}R`"
      @click="execute_program"
    >
       <font-awesome-icon :icon="['fas', 'play']" class="icon-spacing" /> <span
        class="button-text"
        >Run</span
      > </button
    > <button
      id="stop_execution"
      class="sim-button"
      :class="{ 'sim-button-dark': dark }"
      accesskey="c"
      :disabled="stop_disable"
      :title="`${accesskey_prefix}C`"
      @click="stop_execution"
    >
       <font-awesome-icon :icon="['fas', 'stop']" class="icon-spacing" /> <span
        class="button-text"
        >Stop</span
      > </button
    >
  </div>

</template>

<style lang="scss" scoped>
// Button group with gap spacing
.button-group {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

// Custom simulator button styles
.sim-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  min-width: 16px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  font-size: 0.8125rem;
  font-family: inherit;
  color: rgba(0, 0, 0, 0.8);
  background-color: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  user-select: none;

  &:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.3);
  }

  &:focus-visible {
    outline: 2px solid rgba(0, 0, 0, 0.5);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.sim-button-dark {
    color: rgba(255, 255, 255, 0.9);
    background-color: rgba(255, 255, 255, 0.1);

    &:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.15);
    }

    &:active:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.3);
    }

    &:focus-visible {
      outline-color: rgba(255, 255, 255, 0.5);
    }
  }
}

// Icon spacing
.icon-spacing {
  margin-right: 0.5rem;
}
</style>

