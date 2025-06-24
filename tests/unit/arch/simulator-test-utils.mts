import * as creator from "../../../src/core/core.mjs";
import { readRegister } from "../../../src/core/register/registerOperations.mjs";
import {
    crex_findReg_bytag,
    crex_findReg,
} from "../../../src/core/register/registerLookup.mjs";
import { step } from "../../../src/core/executor/executor.mjs";
import { logger } from "../../../src/core/utils/creator_logger.mjs";
import { assertEquals } from "https://deno.land/std/assert/mod.ts";

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
 * Load architecture configuration from file path
 * @param filePath - Path to the YAML architecture configuration file
 * @returns Architecture configuration content
 */
async function loadArchitectureConfig(filePath: string): Promise<string> {
    const archPath = new URL(filePath, import.meta.url);
    return await Deno.readTextFile(archPath);
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
): Promise<{
    archResult: ArchResult;
    compileResult: CompileResult;
}> {
    logger.disable();

    // Load architecture configuration from file
    const architectureConfigContent = await loadArchitectureConfig(yamlPath);

    // Load architecture
    const archResult = creator.newArchitectureLoad(
        architectureConfigContent,
    ) as ArchResult;
    if (archResult.status !== "ok") {
        throw new Error(
            `Failed to load architecture from ${yamlPath}: ${archResult.token}`,
        );
    }

    // Compile assembly code
    const compileResult = creator.assembly_compile(
        testAssembly,
        false,
    ) as CompileResult;
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
 * Cleanup function to reset simulator state
 */
export function cleanupSimulator(): void {
    creator.reset();
}

export interface ExpectedState {
    registers?: Record<string, bigint>;
    memory?: Record<string, bigint>; // Use string keys for memory addresses
    display?: string;
    keyboard?: string;
}

/**
 * Verifies the simulator state
 * @param expected - Object containing expected values for registers, memory, display, and keyboard
 * @param customMessages - Optional custom error messages for each assertion type
 */
export function assertSimulatorState(
    expected: ExpectedState,
    customMessages?: {
        registerPrefix?: string;
        memoryPrefix?: string;
        displayMessage?: string;
        keyboardMessage?: string;
    },
): void {
    const messages = {
        registerPrefix: customMessages?.registerPrefix || "",
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
        for (const [regName, expectedValue] of Object.entries(
            expected.registers,
        )) {
            const actualValue = getRegisterValue(regName);
            const message = messages.registerPrefix
                ? `${messages.registerPrefix} - ${regName} should contain 0x${expectedValue.toString(16)}`
                : `${regName} should contain 0x${expectedValue.toString(16)}`;

            assertEquals(actualValue, expectedValue, message);
        }
    }

    // Assert memory values
    if (expected.memory) {
        for (const [addressStr, expectedValue] of Object.entries(
            expected.memory,
        )) {
            const address = BigInt(addressStr);
            const actualValue = getByteAtAddress(address);
            const message = messages.memoryPrefix
                ? `${messages.memoryPrefix} - Memory at 0x${address.toString(16)} should be 0x${expectedValue.toString(16)}`
                : `Memory at 0x${address.toString(16)} should be 0x${expectedValue.toString(16)}`;

            assertEquals(actualValue, expectedValue, message);
        }
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
