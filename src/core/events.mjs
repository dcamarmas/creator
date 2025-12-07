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

import mitt from "mitt";

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
};

/**
 * @typedef {Object} RegisterUpdatedEvent
 * @property {number} indexComp - Index of the register bank
 * @property {number} indexElem - Index of the register element
 */

/**
 * @typedef {Object} SentinelErrorEvent
 * @property {string} functionName - Name of the function that had violations
 * @property {string} message - Full error message
 * @property {boolean} ok - Whether the check passed (always false for error events)
 */

/**
 * @typedef {Object} CoreEvents
 * @property {RegisterUpdatedEvent} register-updated - Emitted when a register value is updated
 * @property {void} registers-reset - Emitted when all registers are reset
 * @property {void} stats-updated - Emitted when statistics are updated
 * @property {void} step-about-to-execute - Emitted just before a step is executed (to clear register highlighting)
 * @property {SentinelErrorEvent} sentinel-error - Emitted when calling convention violations are detected
 * @property {void} library-loaded - Emitted when a library is loaded
 * @property {void} library-removed - Emitted when a library is removed
 */

/**
 * Global event emitter for CREATOR core events
 * Used to notify UI layers (web, future mobile app, etc.) about core state changes
 * CLI version simply doesn't subscribe to these events
 */
export const coreEvents = mitt();
