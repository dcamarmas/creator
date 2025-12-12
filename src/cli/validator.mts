/**
 *  Copyright 2018-2025 CREATOR Team.
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

import * as creator from "../core/core.mjs";
import { step } from "../../src/core/executor/executor.mjs";
import { crex_findReg } from "../../src/core/register/registerLookup.mjs";
import { readRegister } from "../../src/core/register/registerOperations.mjs";
import { raise } from "@/core/capi/validation.mjs";
import { ARCH as RISCV } from "@/core/capi/arch/riscv.mjs";
import { coreEvents, CoreEventTypes } from "@/core/events.mjs";

interface ExpectedState {
    registers?: { [name: string]: number };
    floatRegisters?: { [name: string]: number };
    memory?: { [address: string]: number };
    display?: string;
}

export interface Validator {
    maxCycles: number;
    floatThreshold: number;
    sentinel: boolean;
    state: ExpectedState;
}

/**
 * Execute N instruction steps
 * @param n - Maximum number of steps to execute
 * @returns Combined execution result
 */
export function executeN(n: number): { error: boolean; msg: string } {
    let ret = { msg: "", error: false };

    for (let i = 0; i < n; i++) {
        ret = step();

        if (ret.error || creator.status.execution_index === -2) {
            break;
        }
    }

    return ret;
}

interface SentinelEvent {
    functionName: string;
    message: string;
    ok: boolean;
}

/**
 * Validates the execution of a program.
 *
 * @param expected Final desired state
 * @param maxCycles Maximum number of cycles to execute
 * @param floatThreshold Threshold for floating point comparisons
 * @param sentinel Whether to error on sentinel warnings
 */
export function validate(
    expected: ExpectedState,
    maxCycles: number,
    floatThreshold?: number,
    sentinel: boolean = true,
): { error: boolean; msg: string } {
    // subscribe to sentinel events
    const sentinelErrors: SentinelEvent[] = [];
    coreEvents.on(CoreEventTypes.SENTINEL_ERROR, (event: unknown) => {
        sentinelErrors.push(event as SentinelEvent);
    });

    // execute program
    const ret = executeN(maxCycles);
    if (ret.error) {
        return ret;
    }

    // validate registers
    if (expected.registers) {
        for (const [regName, expectedValue] of Object.entries(
            expected.registers,
        )) {
            const reg = crex_findReg(regName);
            if (!reg) {
                raise(`Invalid register name '${regName}'`);
            }
            const actualValue = readRegister(reg.indexComp, reg.indexElem);
            if (actualValue !== BigInt(expectedValue)) {
                return {
                    error: true,
                    msg: `${regName} should contain 0x${expectedValue.toString(16)}, contains 0x${actualValue.toString(16)}`,
                };
            }
        }
    }

    if (expected.floatRegisters) {
        for (const [regName, expectedValue] of Object.entries(
            expected.floatRegisters,
        )) {
            const reg = crex_findReg(regName);
            if (!reg) {
                raise(`Invalid register name '${regName}'`);
            }

            const actualValue = readRegister(reg.indexComp, reg.indexElem);

            if (floatThreshold) {
                // transform to float
                const actualValueFloat = Number(
                    RISCV.toJSNumberD(actualValue)[0],
                );
                const expectedValueFloat = Number(
                    RISCV.toJSNumberD(actualValue)[0],
                );
                if (
                    Math.abs(actualValueFloat - expectedValueFloat) >
                    floatThreshold
                ) {
                    return {
                        error: true,
                        msg: `${regName} should contain ${expectedValueFloat}, contains ${actualValueFloat}`,
                    };
                }
            } else if (actualValue !== BigInt(expectedValue)) {
                return {
                    error: true,
                    msg: `${regName} should contain 0x${expectedValue.toString(16)}, contains ${actualValue.toString(16)}`,
                };
            }
        }
    }

    // validate memory
    if (expected.memory) {
        for (const [address, expectedValue] of Object.entries(
            expected.memory,
        )) {
            const actualValue = BigInt(
                creator.main_memory.read(BigInt(address)),
            );
            if (actualValue !== BigInt(expectedValue)) {
                return {
                    error: true,
                    msg: `Address ${address} should contain 0x${expectedValue.toString(16)}, contains 0x${actualValue.toString(16)}`,
                };
            }
        }
    }

    // validate display
    if (expected.display && expected.display !== creator.status.display) {
        return {
            error: true,
            msg: `Display buffer should contain ${expected.display}, contains ${creator.status.display}`,
        };
    }

    // check sentinel
    if (sentinel && sentinelErrors.length > 0) {
        return {
            error: true,
            msg:
                `Found ${sentinelErrors.length} sentinel errors:\n` +
                sentinelErrors.map(e => e.message).join("\n"),
        };
    }

    return { msg: "", error: false };
}
