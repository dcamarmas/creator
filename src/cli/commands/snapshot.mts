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

import fs from "node:fs";
import * as creator from "../../core/core.mjs";
import { cliState } from "../state.mts";

/**
 * Handle snapshot command - save program state to file
 */
export function handleSnapshotCommand(args: string[]): void {
    if (args.length > 1) {
        const filename = args[1];
        const previousPC = { PREVIOUS_PC: cliState.previousPC };
        const state = creator.snapshot(previousPC);
        Deno.writeTextFileSync(filename!, state);
        console.log(`Snapshot saved to ${filename}`);
    } else {
        const state = creator.snapshot({ PREVIOUS_PC: cliState.previousPC });
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `snapshot-${timestamp}.json`;
        Deno.writeTextFileSync(filename, state);
        console.log(`Snapshot saved to ${filename}`);
    }
}

/**
 * Handle restore command - restore program state from file
 */
export function handleRestoreCommand(args: string[]): void {
    if (args.length > 1) {
        creator.reset();
        const filename = args[1];
        const state = fs.readFileSync(filename!, "utf8");
        creator.restore(state);
        const previousPC = JSON.parse(state).extraData.PREVIOUS_PC;
        cliState.previousPC = previousPC;
        console.log(`State restored from ${filename}`);
    } else {
        console.log("Usage: restore <filename>");
    }
}
