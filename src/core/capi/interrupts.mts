/**
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
 *                      Alejandro Calderon Mateos, Luis Daniel Casais Mezquida
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
 *
 */

import { status, guiVariables } from "../core.mjs";
import {
    ExecutionMode,
    InterruptType,
    makeInterrupt,
} from "../executor/interrupts.mts";

export const INTERRUPTS = {
    setUserMode: () => {
        status.execution_mode = ExecutionMode.User;
        guiVariables.keep_highlighted = -1n; // Stop keeping the interrupted instruction highlighted
    },

    setKernelMode: () => {
        status.execution_mode = ExecutionMode.Kernel;
    },

    make: makeInterrupt,

    Type: InterruptType,

    // TODO: enable/disable interrupts
};
