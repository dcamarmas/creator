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

import { InterruptHandlerType } from "@/core/executor/InterruptManager.mts";

/**
 * Command line argument options for the CLI
 */
export interface ArgvOptions {
    architecture: string;
    isa: string[];
    bin: string;
    library: string;
    assembly: string;
    assembler: string;
    debug: boolean;
    validate: string;
    state: string;
    accessible: boolean;
    tutorial: boolean;
    config?: string;
    interruptHandler: InterruptHandlerType;
}

/**
 * Return type for core operations
 */
export interface ReturnType {
    status?: string;
    msg?: string;
    token?: string;
    errorcode?: string;
    type?: string;
    update?: string;
    error?: boolean;
    instructionData?: {
        asm?: string;
        machineCode?: string;
        success?: boolean;
    };
}

/**
 * Instruction representation in the instruction list
 */
export interface Instruction {
    Address: string;
    Label: string | null;
    loaded: string;
    user: string;
    Break: boolean | null;
}

/**
 * Configuration file structure
 */
export interface ConfigType {
    settings: {
        max_states?: number;
        accessible?: boolean;
        keyboard_shortcuts?: boolean;
        auto_list_after_shortcuts?: boolean;
    };
    aliases: {
        [key: string]: string;
    };
    shortcuts: {
        [key: string]: string;
    };
}

/**
 * Result of executing a single step
 */
export interface StepResult {
    output: string;
    completed: boolean;
    error?: boolean;
    errormsg?: string;
}
