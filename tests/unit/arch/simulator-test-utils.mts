import * as creator from "../../../src/core/core.mjs";
import { readRegister } from "../../../src/core/register/registerOperations.mjs";
import {
    crex_findReg_bytag,
    crex_findReg,
} from "../../../src/core/register/registerLookup.mjs";
import { step } from "../../../src/core/executor/executor.mjs";
import { logger } from "../../../src/core/utils/creator_logger.mjs";
import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { RISCV } from "@/core/capi/arch/riscv.mjs";
import fs from "node:fs";
import { rasmAssemble } from "@/core/assembler/rasm/deno/rasm.mjs";
import { assembleCreator } from "@/core/assembler/creatorAssembler/deno/creatorAssembler.mjs";

export interface ArchResult {
    status: string;
    token?: string;
    errorcode?: string;
    type?: string;
    update?: string;
}

export interface CompileResult {
    status: string;
    msg?: string;
}

export interface ExecutionResult {
    output: string;
    completed: boolean;
    error: boolean;
}

const compiler_map = {
    default: assembleCreator,
    rasm: rasmAssemble,
};

/**
 * Helper function to get register value by name
 * @param regName - Register name (architecture specific, e.g., "x5" for RISC-V, "t0" for MIPS)
 * @returns Register value as bigint
 */
export function getRegisterValue(regName: string): bigint {
    const reg = crex_findReg(regName);
    if (!reg) {
        throw new Error(`Register ${regName} not found`);
    }
    return BigInt(readRegister(reg.indexComp, reg.indexElem));
}

/**
 * Helper function to get floating point register value by name
 * @param regName - Register name (architecture specific, e.g., "f0" for RISC-V, "F0" for MIPS)
 * @returns Register value as number (floating point)
 */
export function getRVFloatRegisterValue(regName: string): number {
    const reg = crex_findReg(regName);
    if (!reg) {
        throw new Error(`Register ${regName} not found`);
    }
    const value = readRegister(reg.indexComp, reg.indexElem);
    return Number(RISCV.toJSNumberD(value)[0]);
}

/**
 * Helper function to get PC value
 * @returns Program Counter value as bigint
 */
export function getPCValue(): bigint {
    const pc_reg = crex_findReg_bytag("program_counter");
    if (!pc_reg) {
        throw new Error("Program Counter register not found");
    }
    return BigInt(readRegister(pc_reg.indexComp, pc_reg.indexElem));
}

export function getByteAtAddress(address: bigint): bigint {
    const memoryValue = creator.main_memory.read(address);
    if (memoryValue === undefined) {
        throw new Error(
            `Memory read failed at address 0x${address.toString(16)}`,
        );
    }
    return BigInt(memoryValue);
}

/**
 * Setup function to initialize simulator state with architecture from YAML file
 * @param testAssembly - Assembly code to compile and load
 * @param yamlPath - Path to the YAML architecture configuration file
 * @returns Setup results including architecture and compilation status
 */
export async function setupSimulator(
    testAssembly: string,
    yamlPath: string,
    assembler: string = "default",
): Promise<{
    archResult: ArchResult;
    compileResult: CompileResult;
}> {
    logger.disable();

    // Load architecture configuration from file synchronously
    const archPath = new URL(yamlPath, import.meta.url);
    const architectureConfigContent = fs.readFileSync(archPath, "utf8");
    creator.initCAPI();

    // Load architecture
    const archResult = creator.newArchitectureLoad(
        architectureConfigContent,
    ) as ArchResult;
    if (archResult.status !== "ok") {
        throw new Error(
            `Failed to load architecture from ${yamlPath}: ${archResult.token}`,
        );
    }
    const compilerKey = assembler || "default";
    const compilerFunction = compiler_map[compilerKey];
    // Compile assembly code
    const compileResult = (await creator.assembly_compile(
        testAssembly,
        compilerFunction,
    )) as CompileResult;
    if (compileResult.status !== "ok") {
        throw new Error(`Failed to compile assembly: ${compileResult.msg}`);
    }

    creator.reset();

    return { archResult, compileResult };
}

/**
 * Execute a single instruction step
 * @returns Execution result with output, completion status, and error state
 */
export function executeStep(): ExecutionResult {
    if (creator.status.execution_index === -2) {
        // Stop processing if execution is completed
        return { output: "", completed: true, error: false };
    }

    const ret = step() as {
        error?: boolean;
        msg?: string;
        output?: string;
        completed?: boolean;
    };
    if (ret.error) {
        return { output: "", completed: true, error: true };
    }

    return {
        output: ret.output || "",
        completed: ret.completed || false,
        error: ret.error || false,
    };
}

/**
 * Execute N instruction steps
 * @param n - Maximum number of steps to execute
 * @returns Combined execution result
 */
export function executeN(n: number): ExecutionResult {
    let completed = false;
    let error = false;
    let output = "";

    for (let i = 0; i < n; i++) {
        const stepResult = executeStep();
        if (stepResult.completed) {
            completed = true;
            break;
        }
        if (stepResult.error) {
            error = true;
            break;
        }
        output += stepResult.output;
    }

    return { output, completed, error };
}

/**
 * Assert that a register contains the expected value
 * @param regName - Register name
 * @param expectedValue - Expected value as bigint
 * @param message - Custom assertion message
 */
export function assertRegisterValue(
    regName: string,
    expectedValue: bigint,
    message?: string,
): void {
    const actualValue = getRegisterValue(regName);
    const defaultMessage = `Register ${regName} should contain 0x${expectedValue.toString(16)}`;

    if (actualValue !== expectedValue) {
        throw new Error(
            message ||
                `${defaultMessage}, but got 0x${actualValue.toString(16)}`,
        );
    }
}

/**
 * Assert that a floating point register contains the expected value within threshold
 * @param regName - Register name
 * @param expectedValue - Expected value as number
 * @param threshold - Threshold for floating point comparison (default: 1e-10)
 * @param message - Custom assertion message
 */
export function assertFloatRegisterValue(
    regName: string,
    expectedValue: number,
    threshold: number = 1e-10,
    message?: string,
): void {
    const actualValue = getRVFloatRegisterValue(regName);
    const diff = Math.abs(actualValue - expectedValue);
    const defaultMessage = `Register ${regName} should contain ${expectedValue} (within threshold ${threshold})`;

    if (diff > threshold) {
        throw new Error(
            message ||
                `${defaultMessage}, but got ${actualValue} (difference: ${diff})`,
        );
    }
}

/**
 * Cleanup function to reset simulator state
 */
export function cleanupSimulator(): void {
    creator.reset();
}

export interface ExpectedState {
    registers?: Record<string, bigint>;
    floatRegisters?: Record<string, number>;
    memory?: Record<string, bigint>; // Use string keys for memory addresses
    display?: string;
    keyboard?: string;
}

/**
 * Assert register values
 */
function assertRegisters(
    expected: Record<string, bigint>,
    messagePrefix: string,
): void {
    for (const [regName, expectedValue] of Object.entries(expected)) {
        const actualValue = getRegisterValue(regName);
        const message = messagePrefix
            ? `${messagePrefix} - ${regName} should contain 0x${expectedValue.toString(16)}`
            : `${regName} should contain 0x${expectedValue.toString(16)}`;

        assertEquals(actualValue, expectedValue, message);
    }
}

/**
 * Assert floating point register values
 */
function assertFloatRegisters(
    expected: Record<string, number>,
    messagePrefix: string,
    threshold: number,
): void {
    for (const [regName, expectedValue] of Object.entries(expected)) {
        const message = messagePrefix
            ? `${messagePrefix} - ${regName} should contain ${expectedValue} (within threshold ${threshold})`
            : undefined;

        assertFloatRegisterValue(regName, expectedValue, threshold, message);
    }
}

/**
 * Assert memory values
 */
function assertMemoryValues(
    expected: Record<string, bigint>,
    messagePrefix: string,
): void {
    for (const [addressStr, expectedValue] of Object.entries(expected)) {
        const address = BigInt(addressStr);
        const actualValue = getByteAtAddress(address);
        const message = messagePrefix
            ? `${messagePrefix} - Memory at 0x${address.toString(16)} should be 0x${expectedValue.toString(16)}`
            : `Memory at 0x${address.toString(16)} should be 0x${expectedValue.toString(16)}`;

        assertEquals(actualValue, expectedValue, message);
    }
}

/**
 * Verifies the simulator state
 * @param expected - Object containing expected values for registers, memory, display, and keyboard
 * @param customMessages - Optional custom error messages for each assertion type
 * @param floatThreshold - Threshold for floating point comparisons (default: 1e-10)
 */
export function assertSimulatorState(
    expected: ExpectedState,
    customMessages?: {
        registerPrefix?: string;
        floatRegisterPrefix?: string;
        memoryPrefix?: string;
        displayMessage?: string;
        keyboardMessage?: string;
    },
    floatThreshold: number = 1e-10,
): void {
    const messages = {
        registerPrefix: customMessages?.registerPrefix || "",
        floatRegisterPrefix: customMessages?.floatRegisterPrefix || "",
        memoryPrefix: customMessages?.memoryPrefix || "",
        displayMessage:
            customMessages?.displayMessage ||
            "Display buffer should match expected value",
        keyboardMessage:
            customMessages?.keyboardMessage ||
            "Keyboard buffer should match expected value",
    };

    // Assert register values
    if (expected.registers) {
        assertRegisters(expected.registers, messages.registerPrefix);
    }

    // Assert floating point register values
    if (expected.floatRegisters) {
        assertFloatRegisters(
            expected.floatRegisters,
            messages.floatRegisterPrefix,
            floatThreshold,
        );
    }

    // Assert memory values
    if (expected.memory) {
        assertMemoryValues(expected.memory, messages.memoryPrefix);
    }

    // Assert display state
    if (expected.display !== undefined) {
        assertEquals(
            creator.status.display,
            expected.display,
            messages.displayMessage,
        );
    }

    // Assert keyboard state
    if (expected.keyboard !== undefined) {
        assertEquals(
            creator.status.keyboard,
            expected.keyboard,
            messages.keyboardMessage,
        );
    }
}
