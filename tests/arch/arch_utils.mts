import { assertSnapshot } from "jsr:@std/testing/snapshot";
import * as path from "jsr:@std/path";
import fs from "node:fs";
import {
    executeStep,
    loadArchitecture,
    compileAssembly,
} from "../unit/arch/simulator-test-utils.mts";
import { testKeyboard } from "../../src/core/executor/IO.mjs";
import * as creator from "../../src/core/core.mjs";
import { coreEvents, CoreEventTypes } from "../../src/core/events.mts";
import { logger } from "../../src/core/utils/creator_logger.mjs";

export const ARCH = {
    riscv: "RISCV/RV32IMFD.yml",
    riscv64: "RISCV/RV64IMFD.yml",
    mips: "MIPS32.yml",
    simple8: "simple8.yml",
};

const PREFIX = path.fromFileUrl(import.meta.url + "/../../../");

/**
 * Executes a group of execution snapshot tests
 * @param archPath - Path to the YAML architecture configuration file, from the architectures folder
 * @param dir - Path to the directory with the assembly files
 * @param keyboard - Map of test file name to its corresponding keyboard input. Unspecified files
 * use an empty input
 * @param expect_error - Set of test file names that are expected to throw errors during execution
 */
export function execution_tests(
    archPath: string,
    dir: string,
    keyboard: Map<string, string[]> = new Map(),
    expect_error: Set<string> = new Set(),
): void {
    logger.disable();
    const ARCH_PATH = "architecture/" + archPath;
    loadArchitecture(ARCH_PATH);
    const DIR = `${PREFIX}tests/arch/${dir}`;
    testKeyboard.enable = true;
    for (const file of fs.globSync("*.s", { cwd: DIR })) {
        Deno.test(`${dir}/${file}`, async t => {
            const errors = expect_error.has(file);
            // Record passing convention errors
            const sentinel_errors: { function: string; msg: string }[] = [];
            coreEvents.on(CoreEventTypes.SENTINEL_ERROR, e =>
                sentinel_errors.push({
                    function: e.functionName,
                    msg: e.message,
                }),
            );

            // Compile code
            const path = `${DIR}/${file}`;
            const testAssembly = fs.readFileSync(path, "utf8");
            await compileAssembly(testAssembly);

            // Setup keyboard input if specified
            testKeyboard.data = keyboard.get(file) || [];

            // Execute code
            let result = { output: "", error: false };
            const instruction_errors: { i: number; error: string }[] = [];
            for (let i = 0; i < 1000; i++) {
                try {
                    result = executeStep();
                    if (result.error || creator.status.execution_index === -2)
                        break;
                } catch (e) {
                    if (errors)
                        instruction_errors.push({
                            i,
                            error: (e as Error).message,
                        });
                    else throw e;
                }
            }

            // Save state
            const memory = creator.main_memory
                .getWritten()
                .map(d => [d.addr, d.value])
                .filter(x => x[1] !== 0);

            const registers = creator.REGISTERS.flatMap(r => r.elements)
                .filter(r => r.value !== r.default_value)
                .map(r => [r.name.join(","), "0x" + r.value.toString(16)]);

            const state = {
                error: result.error === false ? false : result.output,
                memory: Object.fromEntries(memory),
                registers: Object.fromEntries(registers),
                display: creator.status.display,
                keyboard: creator.status.keyboard,
                sentinel_errors,
                ...(errors ? { instruction_errors } : {}),
            };

            await assertSnapshot(t, state, {
                path: `${PREFIX}/tests/arch/__snapshots__/${dir}/${file}.snap`,
            });
        });
    }
}
