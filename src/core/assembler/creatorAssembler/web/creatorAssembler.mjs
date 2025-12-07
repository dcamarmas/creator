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

import { assembleCreatorBase } from "../creatorAssemblerBase.mjs";

import wasm_web_init, {
    ArchitectureJS,
    DataCategoryJS,
} from "./wasm/creator_compiler.js";

/**
 * Web-specific assembly compiler that initializes WASM
 * @param {string} code - Assembly code to compile
 * @param {boolean} library - Whether this is a library compilation
 * @returns {Object} Compilation result
 */
export async function assembleCreator(code, library) {
    // In the web, we MUST call the default WASM initialization
    await wasm_web_init();

    // Prepare WASM modules for the base compiler
    const wasmModules = {
        ArchitectureJS,
        DataCategoryJS,
    };

    // Call the common base implementation
    return assembleCreatorBase(code, library, wasmModules);
}
