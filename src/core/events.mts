/**
 * Copyright 2018-2026 CREATOR Team.
 *
 * This file is part of CREATOR.
 *
 * CREATOR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CREATOR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 */

import mitt, { type Emitter } from "mitt";
import { ARDUINO } from "./capi/arduino.mts";

/**
 * Event types for CREATOR core events
 */
export const CoreEventTypes = {
    REGISTER_UPDATED: "register-updated",
    REGISTERS_RESET: "registers-reset",
    STATS_UPDATED: "stats-updated",
    STEP_ABOUT_TO_EXECUTE: "step-about-to-execute",
    SENTINEL_ERROR: "sentinel-error",
    LIBRARY_LOADED: "library-loaded",
    LIBRARY_REMOVED: "library-removed",
    EXECUTOR_BUTTONS_UPDATE: "executor-buttons-update",
    PAUSE_EXEC: "pause-execution",
    EXECUTOR_INSTRUCTIONS_UPDATE: "sail-instruction-update",
    ASSEMBLY_FILES_UPDATE: "assembly-files-update",
    ARDUINO_TERMINAL_WRITE: "arduino-terminal-write",
    ARDUINO_PIN_CHANGED: "arduino-pin-write",
    ARDUINO_RESET: "arduino-reset",
    ARDUINO_PIN_INTERRUPT: "arduino-pin-interrupt",
    VALIDATION_UPDATE: "update-validation",
} as const;

/**
 * Emitted when a register value is updated
 */
export interface RegisterUpdatedEvent {
    /** Index of the register bank */
    indexComp: number;
    /** Index of the register element */
    indexElem: number;
}

/**
 * Calling convention violation information
 */
export interface SentinelErrorData {
    /** ID of the rule broken */
    rule: string,
    /** Register in which the rule was broken, if applicable */
    register?: string[],
    /** Full error message */
    message: string
}

/**
 * Emitted when calling convention violations are detected
 */
export interface SentinelErrorEvent {
    /** Name of the function that had violations */
    functionName: string;
    /** Violations found on the function */
    errors: SentinelErrorData[];
    /** Whether the check passed (always false for error events) */
    ok: boolean;
}

/**
 * Emitted when executor button states should be updated
 */
export interface ExecutorButtonsUpdateEvent {
    /** Whether to disable the reset button */
    reset_disable?: boolean;
    /** Whether to disable the step button */
    instruction_disable?: boolean;
    /** Whether to disable the run button */
    run_disable?: boolean;
    /** Whether to disable the stop button */
    stop_disable?: boolean;
    /** Whether execution has finished */
    isFinished?: boolean;
    /** Whether there was an error */
    hasError?: boolean;
    /** Error message if any */
    errorMessage?: string;
}

export interface AssemblyFile {
  filename: string;
  code: string;
  to_compile: boolean;
  editing_now: boolean;
  id: number;
}

export interface AssemblyFilesUpdatedEvent {
  files: AssemblyFile[];
  currentTab: number;
}


/**
 * Core event types mapping
 */
export type CoreEvents = {
    /** Emitted when a register value is updated */
    "register-updated": RegisterUpdatedEvent;
    /** Emitted when all registers are reset */
    "registers-reset": void;
    /** Emitted when statistics are updated */
    "stats-updated": void;
    /** Emitted just before a step is executed (to clear register highlighting) */
    "step-about-to-execute": void;
    /** Emitted when calling convention violations are detected */
    "sentinel-error": SentinelErrorEvent;
    /** Emitted when a library is loaded */
    "library-loaded": void;
    /** Emitted when a library is removed */
    "library-removed": void;
    /** Emitted when executor button states should be updated */
    "executor-buttons-update": ExecutorButtonsUpdateEvent;
    /** Emitted when assembly_files state change on Creat, rename, delete and show */
    "assembly-files-update": AssemblyFilesUpdatedEvent;
    /** Emitted when the simulator sends text to the Arduino Terminal */
    "arduino-terminal-write": ArduinoTerminalWriteEvent;
    /** Emitted when a Pin changes its values */
    "arduino-pin-write": ArduinoPinChangedEvent;
    /** Emitted when a GPIO pin is read */
    "arduino-pin-read": ArduinoPinRead;
    /** Emitted when Arduino is reset */
    "arduino-reset": void;
    /** Event is emmited when a pin in pinMode has been set to a mode */
    "arduino-pin-mode":ArduinoPinMode;
    /** Event is emmited when a pin is set up in an interrupt */
    "arduino-pin-interrupt":ArduinoPinInterruptEvent;
    /** Emitted when a pin is detached from an interrupt */
    "arduino-pin-detach-interrupt": ArduinoPinDetachInterruptEvent;
        /** Emitted when the simulator requests to find a free slot in the interrupt vector table */
    "arduino-find-vector-slot": ArduinoFindSlotEvent;
    /** Emitted when the simulator requests to get the pin assigned to an interrupt vector slot */
    "arduino-get-pin-from-slot": ArduinoGetPinFromSlotEvent;
    /** Emitted when interrupts are enabled/disabled */
    "arduino-interrupts-enabled": boolean;
};
/**
 * Emitted when the simulator sends text to the Arduino Terminal
 */
export interface ArduinoTerminalWriteEvent {
    /** The text to be displayed in the terminal */
    text: string;
}
/**
 * Emitted when a Pin changes its value
 */
export interface ArduinoPinChangedEvent {
    /** The pin number */
    pin: number;
    /** The new value of the pin */
    value: number;
}

/**
 * Emitted when a Pin changes its value
 */
export interface ArduinoPinMode{
    /** The pin number */
    pin: number;
    /** The mode of the pin */
    mode: number;
}

/** 
 * Event is emmited when a pin is set up in an interrupt 
 */
export interface ArduinoPinInterruptEvent {
  /** The pin number */
  pin: string;
  isr: bigint;
  mode: bigint;
  position: bigint;   
}
/**
 * Emitted when a pin is detached from an interrupt
 */
export interface ArduinoPinDetachInterruptEvent {
    /** The pin number */
    pin: string;
}

/**
 * Event is emitted when a GPIO pin is read
 */
export interface ArduinoPinRead {
  /** The pin number */
  pin: string;

  /** Callback to return the pin value */
  callback: (value: number) => void;
}

/**
 * Event is emitted when searching a interrupt vector slot
 */ export interface ArduinoFindSlotEvent {
    /** Callback to return the found slot index */
    callback: (index: number) => void;
}

export interface ArduinoGetPinFromSlotEvent {
    position: number;
    callback: (pin: string) => void;
}



/**
 * Global event emitter for CREATOR core events
 * Used to notify UI layers (web, future mobile app, etc.) about core state changes
 * CLI version simply doesn't subscribe to these events
 */
// @ts-expect-error - mitt import resolution issue
export const coreEvents: Emitter<CoreEvents> = mitt();
