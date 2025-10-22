/**
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos,
 *                      Diego Camarmas Alonso
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
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
};

/**
 * @typedef {Object} RegisterUpdatedEvent
 * @property {number} indexComp - Index of the register bank
 * @property {number} indexElem - Index of the register element
 */

/**
 * @typedef {Object} CoreEvents
 * @property {RegisterUpdatedEvent} register-updated - Emitted when a register value is updated
 * @property {void} registers-reset - Emitted when all registers are reset
 * @property {void} stats-updated - Emitted when statistics are updated
 * @property {void} step-about-to-execute - Emitted just before a step is executed (to clear register highlighting)
 */

/**
 * Global event emitter for CREATOR core events
 * Used to notify UI layers (web, future mobile app, etc.) about core state changes
 * CLI version simply doesn't subscribe to these events
 */
export const coreEvents = mitt();
