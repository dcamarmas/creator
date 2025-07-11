/**
 * JSON RPC Server for CREATOR Emulator Integration
 *
 * This server provides a JSON RPC interface to the CREATOR emulator,
 * exposing key functionality for VSCode extension integration.
 */

import * as creator from "../src/core/core.mjs";
import { step } from "../src/core/executor/executor.mjs";
import { decode_instruction } from "../src/core/executor/decoder.mjs";
import { readRegister } from "../src/core/register/registerOperations.mjs";
import {
    crex_findReg_bytag,
    crex_findReg,
} from "../src/core/register/registerLookup.mjs";
import { logger } from "../src/core/utils/creator_logger.mjs";
import { instructions } from "../src/core/compiler/compiler.mjs";
import {
    track_stack_getFrames,
    track_stack_getNames,
    track_stack_getAllHints,
} from "../src/core/memory/stackTracker.mjs";
import fs from "node:fs";

// JSON RPC Types
interface JsonRpcRequest {
    jsonrpc: "2.0";
    method: string;
    params?: any;
    id?: number | string | null;
}

interface JsonRpcResponse {
    jsonrpc: "2.0";
    result?: any;
    error?: JsonRpcError;
    id: number | string | null;
}

interface JsonRpcError {
    code: number;
    message: string;
    data?: any;
}

// Emulator State Types
interface EmulatorState {
    registers: Record<string, string>;
    memory: Record<string, string>;
    pc: string;
    status: {
        execution_index: number;
        error: number;
        display: string;
        keyboard: string;
    };
    instructions: Array<{
        address: string;
        label?: string;
        asm: string;
        machineCode: string;
    }>;
}

interface ExecutionResult {
    output: string;
    completed: boolean;
    error: boolean;
    instructionData?: {
        asm?: string;
        machineCode?: string;
        success?: boolean;
    };
}

interface ArchitectureLoadResult {
    status: string;
    token?: string;
    errorcode?: string;
    type?: string;
    update?: string;
}

interface CompileResult {
    status: string;
    msg?: string;
}

// JSON RPC Error Codes
const RPC_ERRORS = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
    ARCHITECTURE_NOT_LOADED: -32001,
    COMPILATION_FAILED: -32002,
    EXECUTION_ERROR: -32003,
    REGISTER_NOT_FOUND: -32004,
    MEMORY_ERROR: -32005,
} as const;

class CreatorRpcServer {
    private architectureLoaded = false;
    private codeCompiled = false;

    constructor() {
        // Disable logging by default
        logger.disable();
    }

    /**
     * Load architecture from YAML file or content
     */
    async loadArchitecture(params: {
        yamlPath?: string;
        yamlContent?: string;
        isaExtensions?: string[];
    }): Promise<ArchitectureLoadResult> {
        try {
            let architectureContent: string;

            if (params.yamlPath) {
                const archPath = new URL(params.yamlPath, import.meta.url);
                architectureContent = fs.readFileSync(archPath, "utf8");
            } else if (params.yamlContent) {
                architectureContent = params.yamlContent;
            } else {
                throw new Error(
                    "Either yamlPath or yamlContent must be provided",
                );
            }

            const result = creator.newArchitectureLoad(
                architectureContent,
                false,
                false,
                params.isaExtensions || [],
            ) as ArchitectureLoadResult;

            if (result.status === "ok") {
                this.architectureLoaded = true;
                creator.reset();
            }

            return result;
        } catch (error: any) {
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Failed to load architecture: ${error.message}`,
            };
        }
    }

    /**
     * Compile assembly code
     */
    async compileAssembly(params: {
        assembly: string;
        enableColor?: boolean;
    }): Promise<CompileResult> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message:
                    "Architecture must be loaded before compiling assembly",
            };
        }

        try {
            const result = creator.assembly_compile(
                params.assembly,
                params.enableColor || false,
            ) as CompileResult;

            if (result.status === "ok") {
                this.codeCompiled = true;
                creator.reset();
            } else {
                throw {
                    code: RPC_ERRORS.COMPILATION_FAILED,
                    message: result.msg || "Assembly compilation failed",
                };
            }

            return result;
        } catch (error: any) {
            if (error.code) throw error;
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Compilation error: ${error.message}`,
            };
        }
    }

    /**
     * Load a binary file into memory
     */
    async loadBinary(params: {
        filePath: string;
        offset?: string;
    }): Promise<{ status: string; msg: string }> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded before loading binary",
            };
        }

        try {
            const offset = params.offset ? BigInt(params.offset) : 0n;
            const result = creator.loadBinaryFile(params.filePath, offset);

            if (result.status === "ok") {
                this.codeCompiled = true;
                creator.reset();
            }

            return result;
        } catch (error: any) {
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Failed to load binary: ${error.message}`,
            };
        }
    }

    /**
     * Execute a single step
     */
    async executeStep(): Promise<ExecutionResult> {
        if (!this.codeCompiled) {
            throw {
                code: RPC_ERRORS.COMPILATION_FAILED,
                message:
                    "Code must be compiled or binary loaded before execution",
            };
        }

        try {
            if (creator.status.execution_index === -2) {
                return { output: "", completed: true, error: false };
            }

            const ret = step() as {
                error?: boolean;
                msg?: string;
                output?: string;
                completed?: boolean;
                instructionData?: {
                    asm?: string;
                    machineCode?: string;
                    success?: boolean;
                };
            };

            if (ret.error) {
                return { output: "", completed: true, error: true };
            }

            return {
                output: ret.output || "",
                completed:
                    ret.completed || creator.status.execution_index === -2,
                error: ret.error || false,
                instructionData: ret.instructionData,
            };
        } catch (error: any) {
            throw {
                code: RPC_ERRORS.EXECUTION_ERROR,
                message: `Execution error: ${error.message}`,
            };
        }
    }

    /**
     * Execute N steps
     */
    async executeN(params: { steps: number }): Promise<ExecutionResult> {
        if (!this.codeCompiled) {
            throw {
                code: RPC_ERRORS.COMPILATION_FAILED,
                message:
                    "Code must be compiled or binary loaded before execution",
            };
        }

        try {
            let completed = false;
            let error = false;
            let output = "";

            for (let i = 0; i < params.steps; i++) {
                const stepResult = await this.executeStep();
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
        } catch (error: any) {
            if (error.code) throw error;
            throw {
                code: RPC_ERRORS.EXECUTION_ERROR,
                message: `Multi-step execution error: ${error.message}`,
            };
        }
    }

    /**
     * Get register value by name
     */
    async getRegister(params: { name: string }): Promise<{ value: string }> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to read registers",
            };
        }

        try {
            const reg = crex_findReg(params.name);
            if (!reg) {
                throw {
                    code: RPC_ERRORS.REGISTER_NOT_FOUND,
                    message: `Register ${params.name} not found`,
                };
            }

            const value = readRegister(reg.indexComp, reg.indexElem);
            return { value: value.toString(16) };
        } catch (error) {
            if (error.code) throw error;
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Failed to read register: ${error.message}`,
            };
        }
    }

    /**
     * Get all registers of a specific type
     */
    async getRegisterBank(params: { type: string }): Promise<{
        name: string;
        type: string;
        registers: Array<{ name: string; value: string; nbits: number }>;
    }> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to read registers",
            };
        }

        try {
            const registerBank = creator.getRegistersByBank(params.type);
            if (!registerBank) {
                throw {
                    code: RPC_ERRORS.REGISTER_NOT_FOUND,
                    message: `Register bank ${params.type} not found`,
                };
            }

            const registers = registerBank.elements.map(reg => {
                // Create display name with primary and alternative names
                const primaryName = reg.name[0];
                const alternativeNames = reg.name.slice(1);
                const displayName =
                    alternativeNames.length > 0
                        ? `${primaryName} (${alternativeNames.join(", ")})`
                        : primaryName;

                return {
                    name: displayName,
                    value: creator.dumpRegister(primaryName, "hex"),
                    nbits: reg.nbits,
                };
            });

            return {
                name: registerBank.name,
                type: registerBank.type,
                registers,
            };
        } catch (error) {
            if (error.code) throw error;
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Failed to read register bank: ${error.message}`,
            };
        }
    }

    /**
     * Get memory at specific address
     */
    async getMemory(params: {
        address: string;
        count?: number;
    }): Promise<{ address: string; data: string[] }> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to read memory",
            };
        }

        try {
            const address = BigInt(params.address);
            const count = params.count || 4;
            const data: string[] = [];

            for (let i = 0; i < count; i++) {
                const value = creator.main_memory.read(address + BigInt(i));
                if (value === undefined) {
                    throw new Error(
                        `Memory read failed at address 0x${(address + BigInt(i)).toString(16)}`,
                    );
                }
                data.push(value.toString(16).padStart(2, "0"));
            }

            return {
                address: params.address,
                data,
            };
        } catch (error) {
            throw {
                code: RPC_ERRORS.MEMORY_ERROR,
                message: `Memory read error: ${error.message}`,
            };
        }
    }

    /**
     * Get memory at specific address with hints and labels
     */
    getMemoryWithHints(params: { address: string; count?: number }): Promise<{
        address: string;
        wordSize: number;
        entries: Array<{
            address: string;
            value: string;
            hints: Array<{
                tag: string;
                type: string;
                offset: number;
                sizeInBits?: number;
            }>;
        }>;
    }> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to read memory",
            };
        }

        try {
            const startAddress = BigInt(params.address);
            const wordSize = creator.main_memory.getWordSize();
            const count = params.count || wordSize;
            const entries = this.buildMemoryEntriesWithHints(
                startAddress,
                wordSize,
                count,
            );

            return {
                address: params.address,
                wordSize,
                entries,
            };
        } catch (error: unknown) {
            throw {
                code: RPC_ERRORS.MEMORY_ERROR,
                message: `Memory read with hints error: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }

    private buildMemoryEntriesWithHints(
        startAddress: bigint,
        wordSize: number,
        count: number,
    ): Array<{
        address: string;
        value: string;
        hints: Array<{
            hint: string;
            offset: number;
            sizeInBits?: number;
        }>;
    }> {
        const entries: Array<{
            address: string;
            value: string;
            hints: Array<{
                hint: string;
                offset: number;
                sizeInBits?: number;
            }>;
        }> = [];

        // Process memory in word-sized chunks
        for (let i = 0; i < count; i += wordSize) {
            const currentAddr = startAddress + BigInt(i);
            const bytes = creator.dumpAddress(currentAddr, wordSize);
            const formattedAddr = `0x${currentAddr.toString(16).padStart(8, "0")}`;

            const hints = this.collectHintsForMemoryRange(
                currentAddr,
                wordSize,
            );

            entries.push({
                address: formattedAddr,
                value: `0x${bytes}`,
                hints,
            });
        }

        return entries;
    }

    private collectHintsForMemoryRange(
        baseAddress: bigint,
        wordSize: number,
    ): Array<{
        tag: string;
        type: string;
        offset: number;
        sizeInBits?: number;
    }> {
        const hints: Array<{
            tag: string;
            type: string;
            offset: number;
            sizeInBits?: number;
        }> = [];

        for (let j = 0; j < wordSize; j++) {
            const byteAddr = baseAddress + BigInt(j);
            const hint = creator.main_memory.getHint(byteAddr);
            if (hint) {
                hints.push({
                    tag: hint.tag,
                    type: hint.type,
                    offset: j,
                    sizeInBits: hint.sizeInBits,
                });
            }
        }

        return hints;
    }

    /**
     * Get memory dump in hex format (similar to hexview command)
     */
    getMemoryHexDump(params: {
        address: string;
        count?: number;
        bytesPerLine?: number;
    }): Promise<{ dump: string }> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to read memory",
            };
        }

        try {
            const address = parseInt(params.address, 16);
            const count = params.count || 16;
            const bytesPerLine = params.bytesPerLine || 16;

            const dump = creator.dumpMemory(address, count, bytesPerLine);

            return { dump };
        } catch (error: unknown) {
            throw {
                code: RPC_ERRORS.MEMORY_ERROR,
                message: `Memory hex dump error: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }

    /**
     * Get current program counter value
     */
    async getPC(): Promise<{ value: string }> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to read PC",
            };
        }

        try {
            const pc_reg = crex_findReg_bytag("program_counter");
            if (!pc_reg) {
                throw new Error("Program Counter register not found");
            }
            const value = readRegister(pc_reg.indexComp, pc_reg.indexElem);
            return { value: value.toString(16) };
        } catch (error) {
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Failed to read PC: ${error.message}`,
            };
        }
    }

    /**
     * Get current emulator state
     */
    async getState(): Promise<EmulatorState> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to get state",
            };
        }

        try {
            // Get PC
            const pcResult = await this.getPC();

            // Get basic registers (assuming we have integer registers)
            const registerTypes = creator.getRegisterTypes();
            const registers: Record<string, string> = {};

            for (const regType of registerTypes) {
                if (regType.includes("registers")) {
                    const bankResult = await this.getRegisterBank({
                        type: regType,
                    });
                    bankResult.registers.forEach(reg => {
                        registers[reg.name] = reg.value;
                    });
                }
            }

            // Get some memory around PC
            const memory: Record<string, string> = {};
            try {
                const pcAddr = BigInt("0x" + pcResult.value);
                const memResult = await this.getMemory({
                    address: "0x" + pcAddr.toString(16),
                    count: 16,
                });
                memory[memResult.address] = memResult.data.join("");
            } catch {
                // Memory read might fail, ignore
            }

            // Get instruction list with better debugging info
            const instructionList = instructions.map((instr, index) => ({
                address: instr.Address,
                label: instr.Label || "",
                asm: instr.loaded || instr.user || "",
                machineCode: instr.binary || instr.loaded || "",
                instructionIndex: index,
                isCurrentInstruction: index === creator.status.execution_index,
                visible: instr.visible !== false,
                hide: instr.hide || false,
            }));

            return {
                registers,
                memory,
                pc: pcResult.value,
                status: {
                    execution_index: creator.status.execution_index,
                    error: creator.status.error,
                    display: creator.status.display,
                    keyboard: creator.status.keyboard,
                },
                instructions: instructionList,
            };
        } catch (error) {
            if (error.code) throw error;
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Failed to get state: ${error.message}`,
            };
        }
    }

    /**
     * Get current execution context - maps PC to source line and instruction
     */
    async getExecutionContext(): Promise<{
        currentInstruction?: {
            index: number;
            address: string;
            label?: string;
            asm: string;
            machineCode: string;
            isBreakpoint?: boolean;
        };
        nextInstruction?: {
            index: number;
            address: string;
            label?: string;
            asm: string;
            machineCode: string;
        };
        pc: string;
        executionIndex: number;
        completed: boolean;
        error: boolean;
    }> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to get execution context",
            };
        }

        try {
            const pcResult = await this.getPC();
            const pc = BigInt("0x" + pcResult.value);
            const executionIndex = creator.status.execution_index;

            // Find current instruction by PC address
            let currentInstruction = null;
            let nextInstruction = null;

            for (let i = 0; i < instructions.length; i++) {
                const instr = instructions[i];
                const instrAddr = BigInt(instr.Address);

                if (instrAddr === pc) {
                    currentInstruction = {
                        index: i,
                        address: instr.Address,
                        label: instr.Label || undefined,
                        asm: instr.loaded || instr.user || "",
                        machineCode: instr.binary || instr.loaded || "",
                        isBreakpoint: instr.Break === true,
                    };

                    // Get next instruction
                    if (i + 1 < instructions.length) {
                        const nextInstr = instructions[i + 1];
                        nextInstruction = {
                            index: i + 1,
                            address: nextInstr.Address,
                            label: nextInstr.Label || undefined,
                            asm: nextInstr.loaded || nextInstr.user || "",
                            machineCode:
                                nextInstr.binary || nextInstr.loaded || "",
                        };
                    }
                    break;
                }
            }

            return {
                currentInstruction,
                nextInstruction,
                pc: pcResult.value,
                executionIndex,
                completed:
                    executionIndex === -2 ||
                    executionIndex >= instructions.length,
                error: creator.status.error !== 0,
            };
        } catch (error: any) {
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Failed to get execution context: ${error.message}`,
            };
        }
    }

    /**
     * Get instruction at specific index or address
     */
    async getInstruction(params: {
        index?: number;
        address?: string;
    }): Promise<{
        index: number;
        address: string;
        label?: string;
        asm: string;
        machineCode: string;
        visible: boolean;
        isBreakpoint?: boolean;
    } | null> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to get instruction",
            };
        }

        try {
            let instruction = null;
            let index = -1;

            if (params.index !== undefined) {
                index = params.index;
                if (index >= 0 && index < instructions.length) {
                    instruction = instructions[index];
                }
            } else if (params.address !== undefined) {
                const targetAddr = BigInt(params.address);
                for (let i = 0; i < instructions.length; i++) {
                    if (BigInt(instructions[i].Address) === targetAddr) {
                        instruction = instructions[i];
                        index = i;
                        break;
                    }
                }
            }

            if (!instruction) {
                return null;
            }

            return {
                index,
                address: instruction.Address,
                label: instruction.Label || undefined,
                asm: instruction.loaded || instruction.user || "",
                machineCode: instruction.binary || instruction.loaded || "",
                visible: instruction.visible !== false,
                isBreakpoint: instruction.Break === true,
            };
        } catch (error: any) {
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Failed to get instruction: ${error.message}`,
            };
        }
    }

    /**
     * Set or clear breakpoint at instruction
     */
    async setBreakpoint(params: {
        index?: number;
        address?: string;
        enabled: boolean;
    }): Promise<{ success: boolean; instruction?: any }> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to set breakpoints",
            };
        }

        try {
            let instruction = null;
            let index = -1;

            if (params.index !== undefined) {
                index = params.index;
                if (index >= 0 && index < instructions.length) {
                    instruction = instructions[index];
                }
            } else if (params.address !== undefined) {
                const targetAddr = BigInt(params.address);
                for (let i = 0; i < instructions.length; i++) {
                    if (BigInt(instructions[i].Address) === targetAddr) {
                        instruction = instructions[i];
                        index = i;
                        break;
                    }
                }
            }

            if (!instruction) {
                return { success: false };
            }

            // Set or clear breakpoint
            instruction.Break = params.enabled;

            return {
                success: true,
                instruction: {
                    index,
                    address: instruction.Address,
                    label: instruction.Label || undefined,
                    asm: instruction.loaded || instruction.user || "",
                    machineCode: instruction.binary || instruction.loaded || "",
                    isBreakpoint: instruction.Break === true,
                },
            };
        } catch (error: any) {
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Failed to set breakpoint: ${error.message}`,
            };
        }
    }

    /**
     * Get all instructions with debugging information
     */
    async getInstructions(): Promise<
        Array<{
            index: number;
            address: string;
            label?: string;
            asm: string;
            machineCode: string;
            visible: boolean;
            hide: boolean;
            isBreakpoint?: boolean;
            isCurrentInstruction: boolean;
        }>
    > {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to get instructions",
            };
        }

        try {
            const currentExecutionIndex = creator.status.execution_index;

            return instructions.map((instr, index) => ({
                index,
                address: instr.Address,
                label: instr.Label || undefined,
                asm: instr.loaded || instr.user || "",
                user: instr.user || "",
                loaded: instr.loaded || "",
                machineCode: instr.binary || instr.loaded || "",
                visible: instr.visible !== false,
                hide: instr.hide || false,
                isBreakpoint: instr.Break === true,
                isCurrentInstruction: index === currentExecutionIndex,
            }));
        } catch (error: any) {
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Failed to get instructions: ${error.message}`,
            };
        }
    }

    /**
     * Reset the emulator
     */
    async reset(): Promise<{ status: string }> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to reset",
            };
        }

        try {
            creator.reset();
            return { status: "ok" };
        } catch (error) {
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Reset failed: ${error.message}`,
            };
        }
    }

    /**
     * Get stack information
     */
    async getStack(): Promise<{
        frames: Array<{
            function: string;
            startAddress: string;
            endAddress: string;
            size: number;
        }>;
        memory: Array<{
            address: string;
            value: string;
            hint?: string;
        }>;
    }> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to get stack",
            };
        }

        try {
            const stackFrames = track_stack_getFrames();
            const stackNames = track_stack_getNames();
            const stackHints = track_stack_getAllHints();

            const frames: Array<{
                function: string;
                startAddress: string;
                endAddress: string;
                size: number;
            }> = [];

            if (stackFrames.ok && stackFrames.val.length > 0) {
                for (let i = 0; i < stackFrames.val.length; i++) {
                    const frame = stackFrames.val[i];
                    const functionName = stackNames.val[i] || "unknown";

                    frames.push({
                        function: functionName,
                        startAddress:
                            "0x" + BigInt(frame.begin_callee).toString(16),
                        endAddress:
                            "0x" + BigInt(frame.end_callee).toString(16),
                        size: frame.begin_callee - frame.end_callee,
                    });
                }
            }

            // Get stack memory if we have frames
            const memory: Array<{
                address: string;
                value: string;
                hint?: string;
            }> = [];

            if (frames.length > 0) {
                const topFrame = stackFrames.val[stackFrames.val.length - 1];
                const startAddr = BigInt(topFrame.end_callee);
                const endAddr = BigInt(topFrame.begin_callee);
                const wordSize = creator.main_memory.getWordSize();

                for (
                    let addr = startAddr;
                    addr < endAddr;
                    addr += BigInt(wordSize)
                ) {
                    try {
                        const bytes = creator.dumpAddress(addr, wordSize);
                        const value =
                            "0x" +
                            bytes.padStart(wordSize * 2, "0").toUpperCase();

                        let hint: string | undefined;
                        if (stackHints.ok) {
                            const addrString = addr.toString();
                            hint = (stackHints.val as Record<string, string>)[
                                addrString
                            ];
                        }

                        memory.push({
                            address: "0x" + addr.toString(16),
                            value,
                            hint,
                        });
                    } catch {
                        // Skip addresses that can't be read
                        break;
                    }
                }
            }

            return { frames, memory };
        } catch (error) {
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Failed to get stack: ${error.message}`,
            };
        }
    }

    /**
     * Enable or disable debug logging
     */
    async setDebug(params: { enabled: boolean }): Promise<{ status: string }> {
        try {
            creator.set_debug(params.enabled);
            return { status: "ok" };
        } catch (error) {
            throw {
                code: RPC_ERRORS.INTERNAL_ERROR,
                message: `Failed to set debug: ${error.message}`,
            };
        }
    }

    /**
     * Get complete memory dump with all written values and hints
     * This method returns only the memory addresses that have been written to,
     * making it very efficient for sparse memory spaces.
     */
    async getMemoryDump(): Promise<{
        addresses: number[];
        values: number[];
        hints: Array<{
            address: string;
            tag: string;
            type: string;
            sizeInBits?: number;
        }>;
        wordSize: number;
        highestAddress: number;
    }> {
        if (!this.architectureLoaded) {
            throw {
                code: RPC_ERRORS.ARCHITECTURE_NOT_LOADED,
                message: "Architecture must be loaded to dump memory",
            };
        }

        try {
            // Get the memory dump which contains only written addresses
            const dump = creator.main_memory.dump();

            // Find the highest written address
            let highestAddress = 0;
            for (const addr of dump.addresses) {
                if (addr > highestAddress) {
                    highestAddress = addr;
                }
            }

            return {
                addresses: dump.addresses,
                values: dump.values,
                hints: dump.hints || [],
                wordSize: creator.main_memory.getWordSize(),
                highestAddress: highestAddress,
            };
        } catch (error: any) {
            throw {
                code: RPC_ERRORS.MEMORY_ERROR,
                message: `Memory dump error: ${error.message}`,
            };
        }
    }

    /**
     * Handle JSON RPC method calls
     */
    async handleMethod(method: string, params: any): Promise<any> {
        switch (method) {
            case "loadArchitecture":
                return this.loadArchitecture(params);
            case "compileAssembly":
                return this.compileAssembly(params);
            case "loadBinary":
                return this.loadBinary(params);
            case "executeStep":
                return this.executeStep();
            case "executeN":
                return this.executeN(params);
            case "getRegister":
                return this.getRegister(params);
            case "getRegisterBank":
                return this.getRegisterBank(params);
            case "getMemory":
                return this.getMemory(params);
            case "getMemoryWithHints":
                return this.getMemoryWithHints(params);
            case "getMemoryHexDump":
                return this.getMemoryHexDump(params);
            case "getMemoryDump":
                return this.getMemoryDump();
            case "getPC":
                return this.getPC();
            case "getState":
                return this.getState();
            case "reset":
                return this.reset();
            case "getStack":
                return this.getStack();
            case "setDebug":
                return this.setDebug(params);
            case "getExecutionContext":
                return this.getExecutionContext();
            case "getInstruction":
                return this.getInstruction(params);
            case "setBreakpoint":
                return this.setBreakpoint(params);
            case "getInstructions":
                return this.getInstructions();
            default:
                throw {
                    code: RPC_ERRORS.METHOD_NOT_FOUND,
                    message: `Method '${method}' not found`,
                };
        }
    }
}

class JsonRpcHandler {
    private server = new CreatorRpcServer();

    async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
        const response: JsonRpcResponse = {
            jsonrpc: "2.0",
            id: request.id || null,
        };

        try {
            // Validate JSON RPC format
            if (request.jsonrpc !== "2.0") {
                throw {
                    code: RPC_ERRORS.INVALID_REQUEST,
                    message: "Invalid JSON RPC version",
                };
            }

            if (!request.method) {
                throw {
                    code: RPC_ERRORS.INVALID_REQUEST,
                    message: "Missing method",
                };
            }

            // Handle method call
            const result = await this.server.handleMethod(
                request.method,
                request.params,
            );
            response.result = result;
        } catch (error) {
            response.error = {
                code: error.code || RPC_ERRORS.INTERNAL_ERROR,
                message: error.message || "Internal error",
                data: error.data,
            };
        }

        return response;
    }
}

// HTTP Server
const rpcHandler = new JsonRpcHandler();

async function handleHttpRequest(request: Request): Promise<Response> {
    // Handle CORS
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return new Response("Method not allowed", {
            status: 405,
            headers: corsHeaders,
        });
    }

    try {
        const body = await request.text();
        const jsonRequest = JSON.parse(body) as JsonRpcRequest;

        const jsonResponse = await rpcHandler.handleRequest(jsonRequest);

        return new Response(JSON.stringify(jsonResponse), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
            },
        });
    } catch (error) {
        const errorResponse: JsonRpcResponse = {
            jsonrpc: "2.0",
            error: {
                code: RPC_ERRORS.PARSE_ERROR,
                message: "Parse error",
            },
            id: null,
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
            },
        });
    }
}

// Start the server
const PORT = parseInt(Deno.env.get("PORT") || "8080");

console.log(`🚀 CREATOR JSON RPC Server starting on port ${PORT}`);

const handler = (request: Request): Promise<Response> => {
    return handleHttpRequest(request);
};

Deno.serve({ port: PORT }, handler);
