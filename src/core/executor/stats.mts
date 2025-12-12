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

import { status } from "../core.mjs";
import { coreEvents } from "../events.mts";

export type Stat = {
    instructions: number;
    cycles: number;
};

export const stats = new Map<string, Stat>([
    ["Arithmetic integer", { instructions: 0, cycles: 0 }],
    ["Arithmetic floating point", { instructions: 0, cycles: 0 }],
    ["Comparison", { instructions: 0, cycles: 0 }],
    ["Conditional bifurcation", { instructions: 0, cycles: 0 }],
    ["Control", { instructions: 0, cycles: 0 }],
    ["Function call", { instructions: 0, cycles: 0 }],
    ["I/O", { instructions: 0, cycles: 0 }],
    ["Logic", { instructions: 0, cycles: 0 }],
    ["Memory access", { instructions: 0, cycles: 0 }],
    ["Syscall", { instructions: 0, cycles: 0 }],
    ["Transfer between registers", { instructions: 0, cycles: 0 }],
    ["Unconditional bifurcation", { instructions: 0, cycles: 0 }],
    ["Other", { instructions: 0, cycles: 0 }],
]);

/**
 * Notifies UI layers about a stats update via event emission
 */
function notifyStatsUpdate(): void {
    coreEvents.emit("stats-updated");
}

/**
 * Updates the stats for a specific instruction (includes updating status).
 *
 * @param type Instruction type (see `stats` object)
 * @param [instructions=1] Number of instructions to add
 * @param [cycles=1] Number of cycles to add
 */
export function updateStats(type: string, cycles: number = 1): void {
    const currentStat = stats.get(type);
    if (currentStat === undefined) {
        throw new Error(`Invalid instruction type '${type}'`);
    }

    stats.set(type, {
        instructions: currentStat.instructions + 1,
        cycles: currentStat.cycles + cycles,
    });

    status.clkCycles += cycles;
    status.executedInstructions += 1;

    // Notify UI layers about stats update (CLI ignores, web UI listens)
    notifyStatsUpdate();
}

export function resetStats() {
    stats.forEach((_value, key, map) => {
        map.set(key, { instructions: 0, cycles: 0 });
    });
}
