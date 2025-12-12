/**
 * Copyright 2018-2025 CREATOR Team.
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
 * Emitted when calling convention violations are detected
 */
export interface SentinelErrorEvent {
    /** Name of the function that had violations */
    functionName: string;
    /** Full error message */
    message: string;
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
};

/**
 * Global event emitter for CREATOR core events
 * Used to notify UI layers (web, future mobile app, etc.) about core state changes
 * CLI version simply doesn't subscribe to these events
 */
// @ts-expect-error - mitt import resolution issue
export const coreEvents: Emitter<CoreEvents> = mitt();
