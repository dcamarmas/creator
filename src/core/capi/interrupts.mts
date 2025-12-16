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

import {
    status,
    guiVariables,
    interruptManager,
    setInterruptManager,
} from "../core.mjs";
import {
    ExecutionMode,
    InterruptHandlerType,
    InterruptType,
} from "../executor/InterruptManager.mts";

export const INTERRUPTS = {
    setUserMode: () => {
        status.execution_mode = ExecutionMode.User;
        guiVariables.keep_highlighted = -1n; // Stop keeping the interrupted instruction highlighted
    },

    setKernelMode: () => {
        status.execution_mode = ExecutionMode.Kernel;
    },

    create: (type: InterruptType) => interruptManager.create(type),
    enable: (type: InterruptType) => interruptManager.enable(type),
    globalEnable: () => interruptManager.globalEnable(),
    disable: (type: InterruptType) => interruptManager.disable(type),
    globalDisable: () => interruptManager.globalDisable(),
    isEnabled: (type: InterruptType) => interruptManager.isEnabled(type),
    isGlobalEnabled: () => interruptManager.isGlobalEnabled(),
    clear: (type: InterruptType) => interruptManager.clear(type),
    globalClear: () => interruptManager.globalClear(),

    setCREATORHandler: () => {
        setInterruptManager(
            interruptManager.switchHandler(InterruptHandlerType.CREATOR),
        );
    },

    setCustomHandler: () => {
        setInterruptManager(
            interruptManager.switchHandler(InterruptHandlerType.Custom),
        );
    },

    setHighlight: () =>
        (guiVariables.keep_highlighted = guiVariables.previous_PC),
    clearHighlight: () => (guiVariables.keep_highlighted = -1n),
};
