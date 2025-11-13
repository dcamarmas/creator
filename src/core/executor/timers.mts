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

import { architecture, status } from "../core.mjs";

let timerAdvance: () => void;
let timerHandler: () => void;
let timerIsEnabled: () => boolean;

export function compileTimerFunctions() {
    if (!architecture.timer) return;
    timerAdvance = new Function(architecture.timer.advance) as () => void;
    timerHandler = new Function(architecture.timer.handler) as () => void;
    timerIsEnabled = new Function(
        architecture.timer.is_enabled,
    ) as () => boolean;
}

export function handleTimer() {
    if (architecture.timer === undefined) return;
    if (!timerIsEnabled()) return;

    if (status.clkCycles % architecture.timer.tick_cycles === 0) {
        timerAdvance();
        timerHandler();
    }
}
