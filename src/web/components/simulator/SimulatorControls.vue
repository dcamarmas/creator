<!--
Copyright 2018-2026 CREATOR Team.

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
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  type PropType,
} from "vue";
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
import { coreEvents, CoreEventTypes } from "@/core/events.mjs";

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
  mode: {
    type: String,
    default: "default",
  },
});

// Button state
const reset_disable = ref(true);
const instruction_disable = ref(false);
const run_disable = ref(false);
const stop_disable = ref(true);

const isFinished = ref(false);
const hasError = ref(false);
const errorMessage = ref("");

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

  if (status.execution_index === -2) {
    isFinished.value = true;
  } else if (status.execution_index === -1) {
    hasError.value = true;
  }

  // Subscribe to executor button update events
  coreEvents.on(
    CoreEventTypes.EXECUTOR_BUTTONS_UPDATE,
    handleButtonStateUpdate,
  );
});

onBeforeUnmount(() => {
  // Clean up event listener
  coreEvents.off(
    CoreEventTypes.EXECUTOR_BUTTONS_UPDATE,
    handleButtonStateUpdate,
  );
});

// Handler for button state updates from core
function handleButtonStateUpdate(event: any) {
  if (event.reset_disable !== undefined) {
    reset_disable.value = event.reset_disable;
  }
  if (event.instruction_disable !== undefined) {
    instruction_disable.value = event.instruction_disable;
  }
  if (event.run_disable !== undefined) {
    run_disable.value = event.run_disable;
  }
  if (event.stop_disable !== undefined) {
    stop_disable.value = event.stop_disable;
  }
}

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

  isFinished.value = false;
  hasError.value = false;
  errorMessage.value = "";

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
    errorMessage.value = `${err.message || err}`;

    if (
      status.execution_index >= 0 &&
      status.execution_index < instruction_values.value.length
    ) {
      instruction_values.value[status.execution_index]!._rowVariant = "danger";
    }

    status.execution_index = -1;
    status.error = true;
    hasError.value = true;

    execution_UI_update({ error: true, msg: err.message || err });
    return;
  }

  if (status.run_program === 3) {
    instruction_disable.value = true;
    run_disable.value = true;
  }

  // Disable buttons if program has finished (execution_index === -2)
  if (status.execution_index === -2) {
    instruction_disable.value = true;
    run_disable.value = true;
    isFinished.value = true;
  }

  if (status.execution_index === -1) {
    instruction_disable.value = true;
    run_disable.value = true;
    hasError.value = true;
    if (!errorMessage.value) {
      errorMessage.value = "The program has finished with errors";
    }
  }

  if (typeof ret === "undefined") {
    console.log("Something weird happened :-S");
  }

  if (ret.msg) {
    if (status.execution_index === -1) {
      errorMessage.value = ret.msg;
    } else {
      show_notification(ret.msg, ret.type!);
    }
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
    status.run_program = 0;
    return;
  }
  if (status.execution_index === -1) {
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
        errorMessage.value = `${err.message || err}`;

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
        hasError.value = true;

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
        if (status.execution_index === -1) {
          errorMessage.value = ret.msg;
        } else {
          show_notification(ret.msg, ret.type!);
        }

        execution_UI_update(ret);

        reset_disable.value = false;
        instruction_disable.value = true;
        run_disable.value = true;
        stop_disable.value = true;

        if (status.execution_index === -2) {
          isFinished.value = true;
        } else if (status.execution_index === -1) {
          hasError.value = true;
        }
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

    if (status.execution_index === -2) {
      isFinished.value = true;
    } else if (status.execution_index === -1) {
      hasError.value = true;
      errorMessage.value =
        ret?.msg ||
        errorMessage.value ||
        "The program has finished with errors";
    }
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
      <span class="button-text">Reset</span>
    </button>

    <div class="execution-main-controls">
      <button
        class="sim-button"
        :class="{
          'sim-button-dark': dark,
          'is-hidden': isFinished || hasError,
        }"
        accesskey="a"
        :disabled="instruction_disable || isFinished || hasError"
        :title="`${accesskey_prefix}A`"
        :tabindex="isFinished || hasError ? -1 : 0"
        @click="execute_instruction"
      >
        <font-awesome-icon
          :icon="['fas', 'forward-step']"
          class="icon-spacing"
        />
        <span class="button-text">Step</span>
      </button>

      <button
        id="playExecution"
        class="sim-button"
        :class="{
          'sim-button-dark': dark,
          'is-hidden': isFinished || hasError,
        }"
        accesskey="r"
        :disabled="run_disable || isFinished || hasError"
        :title="`${accesskey_prefix}R`"
        :tabindex="isFinished || hasError ? -1 : 0"
        @click="execute_program"
      >
        <font-awesome-icon :icon="['fas', 'play']" class="icon-spacing" />
        <span class="button-text">Run</span>
      </button>

      <button
        v-if="isFinished || hasError"
        id="executionStatusButton"
        class="sim-button big-button"
        :class="{
          'sim-button-dark': dark,
          'execution-finished': isFinished,
          'execution-error': hasError,
        }"
        :disabled="isFinished"
      >
        <font-awesome-icon
          :icon="
            isFinished ? ['fas', 'check'] : ['fas', 'triangle-exclamation']
          "
          class="icon-spacing"
        />
        <span class="button-text">{{ isFinished ? "Finished" : "Error" }}</span>
      </button>

      <b-popover
        v-if="hasError"
        target="executionStatusButton"
        triggers="click"
        placement="auto"
        teleport-to="body"
        custom-class="execution-error-popover"
      >
        <template #title>Execution Error</template>
        <div class="error-popover-content">
          {{ errorMessage }}
        </div>
      </b-popover>
    </div>

    <button
      id="stop_execution"
      class="sim-button"
      :class="{ 'sim-button-dark': dark }"
      accesskey="c"
      :disabled="stop_disable"
      :title="`${accesskey_prefix}C`"
      @click="stop_execution"
    >
      <font-awesome-icon :icon="['fas', 'stop']" class="icon-spacing" />
      <span class="button-text">Stop</span>
    </button>
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

  // Success state for execution
  &.execution-finished {
    background-color: #198754;
    color: white;
    opacity: 1 !important;

    &:hover:not(:disabled) {
      background-color: #157347;
    }

    &:active:not(:disabled) {
      background-color: #146c43;
    }

    &:focus-visible {
      outline-color: #198754;
    }
  }

  // Error state for execution
  &.execution-error {
    background-color: #dc3545;
    color: white;
    opacity: 1 !important;
    cursor: pointer;

    &:hover:not(:disabled) {
      background-color: #bb2d3b;
    }

    &:active:not(:disabled) {
      background-color: #b02a37;
    }

    &:focus-visible {
      outline-color: #dc3545;
    }
  }
}

// Icon spacing
.icon-spacing {
  margin-right: 0.5rem;
}

.execution-main-controls {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  position: relative;

  .is-hidden {
    visibility: hidden;
    pointer-events: none;
  }

  .big-button {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    justify-content: center;
    z-index: 1;
  }
}

.error-popover-content {
  max-width: 300px;
  word-wrap: break-word;
  font-size: 0.875rem;
  color: #dc3545;
  font-weight: 500;
}
</style>

<style lang="scss">
// Global style for the popover to ensure it's on top of everything
.execution-error-popover {
  z-index: 2000 !important;
}
</style>
