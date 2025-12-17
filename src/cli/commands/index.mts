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

// Re-export all command handlers from their respective modules

export {
    handleStepCommand,
    handleUnstepCommand,
    handleRunCommand,
    handleContinueCommand,
    handlePauseCommand,
    handleNurCommand,
    handleResetCommand,
} from "./execution.mts";

export {
    handleInstructionsCommand,
    handleBreakpointCommand,
    handleBreakpointAtCurrentPC,
    findInstructionByAddressOrLabel,
    toggleBreakpoint,
} from "./instructions.mts";

export { handleRegCommand } from "./registers.mts";

export { handleMemCommand, handleHexViewCommand } from "./memory.mts";

export { handleStackCommand } from "./stack.mts";

export { handleSnapshotCommand, handleRestoreCommand } from "./snapshot.mts";

export { handleAboutCommand, handleAliasCommand } from "./info.mts";
