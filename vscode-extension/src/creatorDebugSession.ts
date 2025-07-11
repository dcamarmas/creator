import {
    DebugSession,
    InitializedEvent,
    TerminatedEvent,
    StoppedEvent,
    ContinuedEvent,
    OutputEvent,
    Thread,
    StackFrame,
    Source,
    Handles,
    Breakpoint,
} from "vscode-debugadapter";
import { DebugProtocol } from "vscode-debugprotocol";
import * as fs from "node:fs";
import * as path from "node:path";
import { Buffer } from "node:buffer";
import { CreatorRpcClient } from "./creatorRpcClient";

// Simple logging utility using OutputEvent for debug console
interface LoggingSession {
    sendEvent(event: OutputEvent): void;
}

let debugSessionInstance: LoggingSession | null = null;

const log = {
    setSession: (session: LoggingSession) => {
        debugSessionInstance = session;
    },
    info: (message: string) => {
        if (debugSessionInstance) {
            debugSessionInstance.sendEvent(
                new OutputEvent(`[INFO] ${message}\n`, "console"),
            );
        }
    },
    warn: (message: string) => {
        if (debugSessionInstance) {
            debugSessionInstance.sendEvent(
                new OutputEvent(`[WARN] ${message}\n`, "console"),
            );
        }
    },
    error: (message: string, error?: unknown) => {
        if (debugSessionInstance) {
            debugSessionInstance.sendEvent(
                new OutputEvent(
                    `[ERROR] ${message} ${error ? String(error) : ""}\n`,
                    "console",
                ),
            );
        }
    },
};

interface CreatorLaunchRequestArguments
    extends DebugProtocol.LaunchRequestArguments {
    program: string;
    architectureFile?: string;
    rpcServerUrl?: string;
}

interface CallStackFrame {
    address: string;
    functionName: string;
    lineNumber: number;
    instruction: string;
}

interface MemoryHint {
    hint: string;
    offset: number;
    sizeInBits?: number;
}

export class CreatorDebugSession extends DebugSession {
    private static THREAD_ID = 1;
    private rpcClient: CreatorRpcClient;
    private sourceLines: string[] = [];
    private addressToLineMap = new Map<string, number>();
    private lineToAddressMap = new Map<number, string>();
    private breakpoints = new Set<number>();
    private variableHandles = new Handles<string>();
    private isRunning = false;
    private programPath: string = "";
    private lastDisplayContent: string = "";
    private callStack: CallStackFrame[] = [];
    private functionLabels = new Map<string, string>(); // address -> function name
    private lastPC: string = "";

    constructor() {
        super();
        this.rpcClient = new CreatorRpcClient();
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);

        // Set up logging session
        log.setSession(this);
    }

    protected initializeRequest(
        response: DebugProtocol.InitializeResponse,
        args: DebugProtocol.InitializeRequestArguments,
    ): void {
        response.body = response.body || {};

        // Set the capabilities of this debug adapter
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsEvaluateForHovers = true;
        response.body.supportsStepBack = false;
        response.body.supportsDataBreakpoints = false;
        response.body.supportsCompletionsRequest = false;
        response.body.supportsCancelRequest = false;
        response.body.supportsBreakpointLocationsRequest = false;
        response.body.supportsStepInTargetsRequest = false;
        response.body.supportsGotoTargetsRequest = false;
        response.body.supportsModulesRequest = false;
        response.body.supportsRestartRequest = false;
        response.body.supportsExceptionOptions = false;
        response.body.supportsValueFormattingOptions = true;
        response.body.supportsExceptionInfoRequest = false;
        response.body.supportTerminateDebuggee = true;
        response.body.supportSuspendDebuggee = false;
        response.body.supportsDelayedStackTraceLoading = false;
        response.body.supportsLoadedSourcesRequest = false;
        response.body.supportsLogPoints = false;
        response.body.supportsTerminateThreadsRequest = false;
        response.body.supportsSetVariable = false;
        response.body.supportsRestartFrame = false;
        response.body.supportsSteppingGranularity = false;
        response.body.supportsInstructionBreakpoints = true;
        response.body.supportsReadMemoryRequest = true;
        response.body.supportsWriteMemoryRequest = false;

        this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected async launchRequest(
        response: DebugProtocol.LaunchResponse,
        args: CreatorLaunchRequestArguments,
    ): Promise<void> {
        try {
            // Set up RPC client
            if (args.rpcServerUrl) {
                this.rpcClient = new CreatorRpcClient(args.rpcServerUrl);
            }

            // Check server connectivity
            const isAlive = await this.rpcClient.isServerAlive();
            if (!isAlive) {
                throw new Error("CREATOR RPC server is not running");
            }

            // Store the program path for source mapping
            this.programPath = args.program;

            // Load assembly source
            if (!fs.existsSync(args.program)) {
                throw new Error(`Assembly file not found: ${args.program}`);
            }

            const assemblySource = fs.readFileSync(args.program, "utf8");
            this.sourceLines = assemblySource.split("\n");

            // Load architecture and compile
            let architecturePath: string;
            if (args.architectureFile) {
                // Use user-selected architecture file
                architecturePath = args.architectureFile;
            } else {
                // Fallback to default RISC-V
                architecturePath = this.getArchitecturePath("RISC-V");
            }
            await this.rpcClient.loadArchitecture(architecturePath, []);

            const compileResult =
                await this.rpcClient.compileAssembly(assemblySource);
            if (compileResult.status !== "ok") {
                throw new Error(
                    `Compilation failed: ${compileResult.msg || "Unknown error"}`,
                );
            }

            // Build source-to-instruction mapping
            await this.buildSourceMapping();

            this.sendResponse(response);
            this.sendEvent(
                new StoppedEvent("entry", CreatorDebugSession.THREAD_ID),
            );
        } catch (error: unknown) {
            response.success = false;
            response.message = String(error);
            this.sendResponse(response);
            this.sendEvent(new TerminatedEvent());
        }
    }

    private getArchitecturePath(architecture: string): string {
        const architectureMap: Record<string, string> = {
            "RISC-V": "../architecture/RISCV/RV32IMFD.yml",
            MIPS: "../architecture/MIPS/MIPS32.yml",
            Z80: "../architecture/miniZ80.yml",
        };
        return architectureMap[architecture] || architectureMap["RISC-V"];
    }

    private async buildSourceMapping(): Promise<void> {
        const instructions = await this.rpcClient.getInstructions();
        this.addressToLineMap.clear();
        this.lineToAddressMap.clear();
        this.functionLabels.clear();

        log.info(
            `Building source mapping with ${instructions.length} instructions`,
        );

        // Map each instruction with a non-empty "user" field to the next matching source line
        let lastMatchedLine = 0;
        function stripComments(s: string): string {
            return s.split(/[#/]{1,2}/)[0].trim();
        }
        for (let i = 0; i < instructions.length; i++) {
            const instr = instructions[i];
            if (instr.user && instr.user.trim() !== "") {
                // Remove comments and normalize whitespace
                const userText = stripComments(instr.user).replace(/\s+/g, " ");
                let found = false;
                for (
                    let lineIdx = lastMatchedLine;
                    lineIdx < this.sourceLines.length;
                    lineIdx++
                ) {
                    let srcLine = stripComments(
                        this.sourceLines[lineIdx],
                    ).replace(/\s+/g, " ");
                    // Allow for label prefixes (e.g., "label: addi sp, sp, -16")
                    if (srcLine.includes(userText)) {
                        this.addressToLineMap.set(instr.address, lineIdx);
                        this.lineToAddressMap.set(lineIdx, instr.address);
                        lastMatchedLine = lineIdx + 1;
                        found = true;
                        log.info(
                            `Mapped instruction at address ${instr.address} to line ${lineIdx + 1}: ${this.sourceLines[lineIdx]} [user: "${instr.user}"]`,
                        );
                        // Optionally, map function labels if the line is a label
                        if (srcLine.endsWith(":")) {
                            const labelName = srcLine
                                .substring(0, srcLine.length - 1)
                                .trim();
                            if (/[a-zA-Z]/.test(labelName)) {
                                this.functionLabels.set(
                                    instr.address,
                                    labelName,
                                );
                            }
                        }
                        break;
                    }
                }
                if (!found) {
                    log.warn(
                        `Could not map instruction at address ${instr.address} with user text "${instr.user}"`,
                    );
                }
            } else {
                // Pseudoinstruction expansion: map to previous matched line
                if (i > 0) {
                    const prevAddr = instructions[i - 1].address;
                    const prevLine = this.addressToLineMap.get(prevAddr);
                    if (prevLine !== undefined) {
                        this.addressToLineMap.set(instr.address, prevLine);
                        log.info(
                            `Mapped expanded instruction at address ${instr.address} to line ${prevLine + 1} (pseudoinstruction expansion)`,
                        );
                    }
                }
            }
        }

        log.info(
            `Address to line mapping: ${JSON.stringify(Array.from(this.addressToLineMap.entries()))}`,
        );
        log.info(
            `Line to address mapping: ${JSON.stringify(Array.from(this.lineToAddressMap.entries()))}`,
        );
        log.info(
            `Function labels: ${JSON.stringify(Array.from(this.functionLabels.entries()))}`,
        );
    }

    protected setBreakPointsRequest(
        response: DebugProtocol.SetBreakpointsResponse,
        args: DebugProtocol.SetBreakpointsArguments,
    ): void {
        const path = args.source.path;
        const clientLines = args.lines || [];

        // Clear existing breakpoints from RPC server
        this.breakpoints.forEach(lineIndex => {
            const address = this.lineToAddressMap.get(lineIndex);
            if (address) {
                this.rpcClient
                    .setBreakpoint(undefined, address, false)
                    .catch((error: unknown) => {
                        log.error("Failed to clear breakpoint:", error);
                    });
            }
        });

        // Clear local breakpoints
        this.breakpoints.clear();

        // Convert client lines to our internal format and set breakpoints
        const breakpoints: Breakpoint[] = clientLines.map(line => {
            const lineIndex = line - 1; // Convert to 0-based
            this.breakpoints.add(lineIndex);

            // Set breakpoint via RPC if we have an address mapping
            const address = this.lineToAddressMap.get(lineIndex);
            if (address) {
                this.rpcClient
                    .setBreakpoint(undefined, address, true)
                    .then(() => {
                        log.info(
                            `Breakpoint set at address ${address}, line ${line}`,
                        );
                    })
                    .catch((error: unknown) => {
                        log.error("Failed to set breakpoint:", error);
                    });
            } else {
                log.warn(`No address mapping found for line ${line}`);
            }

            return new Breakpoint(true, line);
        });

        response.body = {
            breakpoints,
        };
        this.sendResponse(response);
    }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        response.body = {
            threads: [new Thread(CreatorDebugSession.THREAD_ID, "main")],
        };
        this.sendResponse(response);
    }

    protected async stackTraceRequest(
        response: DebugProtocol.StackTraceResponse,
        _args: DebugProtocol.StackTraceArguments,
    ): Promise<void> {
        try {
            const context = await this.rpcClient.getExecutionContext();
            this.updateCallStack(context);

            const stackFrames: StackFrame[] = [];

            // ALWAYS create the first frame from the current PC location
            if (context.currentInstruction) {
                const currentAddress = context.currentInstruction.address;
                const currentLineNumber =
                    this.addressToLineMap.get(currentAddress);
                const currentFunctionName =
                    this.functionLabels.get(currentAddress) || "main";

                // Only add a stack frame if the current address maps to a source line
                if (currentLineNumber !== undefined) {
                    const currentFrame = new StackFrame(
                        0,
                        `${currentFunctionName}: ${context.currentInstruction.asm}`,
                        new Source(
                            path.basename(this.programPath),
                            this.programPath,
                        ),
                        currentLineNumber + 1, // Convert to 1-based
                        0,
                    );
                    stackFrames.push(currentFrame);

                    // Add the rest of the call stack (excluding the current frame if it's already in the call stack)
                    for (let i = 0; i < this.callStack.length; i++) {
                        const frame = this.callStack[i];

                        // Skip the current frame if it's already added above
                        if (frame.address === currentAddress) {
                            continue;
                        }

                        const stackFrame = new StackFrame(
                            stackFrames.length, // Use current length as frame ID
                            `${frame.functionName}: ${frame.instruction}`,
                            new Source(
                                path.basename(this.programPath),
                                this.programPath,
                            ),
                            frame.lineNumber + 1, // Convert to 1-based
                            0,
                        );
                        stackFrames.push(stackFrame);
                    }
                }
                // If the PC is not mapped to a code line (e.g., in .data), do not highlight any line.
            }

            response.body = {
                stackFrames,
                totalFrames: stackFrames.length,
            };
            this.sendResponse(response);
        } catch (error: unknown) {
            response.success = false;
            response.message = String(error);
            this.sendResponse(response);
        }
    }

    /**
     * Update the call stack based on the current execution context
     */
    private updateCallStack(context: {
        currentInstruction?: { address: string; asm: string };
    }): void {
        if (!context.currentInstruction) {
            return;
        }

        const currentPC = context.currentInstruction.address;
        const currentInstruction = context.currentInstruction.asm.toLowerCase();
        const lineNumber = this.addressToLineMap.get(currentPC);
        const functionName = this.functionLabels.get(currentPC) || "main";

        // Check if this is a completely different location (indicates a jump happened)
        const pcChanged = this.lastPC !== "" && this.lastPC !== currentPC;

        // Detect function calls (jal, jalr with link, call instructions)
        if (CreatorDebugSession.isCallInstruction(currentInstruction)) {
            // For function calls, push the call site to call stack
            if (lineNumber !== undefined) {
                // Push the calling location to stack (before the jump)
                const callerPC = this.lastPC;
                const callerLine = this.addressToLineMap.get(callerPC);
                const callerFunction =
                    this.functionLabels.get(callerPC) || "main";

                if (callerLine !== undefined && callerPC !== "") {
                    this.callStack.unshift({
                        address: callerPC,
                        functionName: callerFunction,
                        lineNumber: callerLine,
                        instruction: `call ${functionName}`,
                    });
                }
            }
        }
        // Detect returns (ret, jr ra, etc.)
        else if (CreatorDebugSession.isReturnInstruction(currentInstruction)) {
            // Pop from call stack when returning
            if (this.callStack.length > 0) {
                this.callStack.shift();
            }
        }
        // Handle any other location changes (jumps, branches, etc.)
        else if (pcChanged && lineNumber !== undefined) {
            // Update the current frame location regardless of how we got here
            if (this.callStack.length > 0) {
                const currentFrame = this.callStack[0];
                currentFrame.address = currentPC;
                currentFrame.lineNumber = lineNumber;
                currentFrame.instruction = context.currentInstruction.asm;
                currentFrame.functionName = functionName;
            } else {
                // Initialize call stack if empty
                this.callStack.push({
                    address: currentPC,
                    functionName,
                    lineNumber,
                    instruction: context.currentInstruction.asm,
                });
            }
        }
        // Initialize call stack if empty and we have location info
        else if (this.callStack.length === 0 && lineNumber !== undefined) {
            this.callStack.push({
                address: currentPC,
                functionName,
                lineNumber,
                instruction: context.currentInstruction.asm,
            });
        }

        this.lastPC = currentPC;

        // Debug logging
        log.info(
            `PC: ${currentPC}, Instruction: ${currentInstruction}, Line: ${lineNumber}, Function: ${functionName}`,
        );
        if (pcChanged) {
            log.info(`PC changed from ${this.lastPC} to ${currentPC}`);
            if (CreatorDebugSession.isJumpOrBranch(currentInstruction)) {
                log.info(
                    `Detected jump/branch instruction: ${currentInstruction}`,
                );
            }
        }
    }

    /**
     * Check if instruction is a function call
     */
    private static isCallInstruction(instruction: string): boolean {
        const callPatterns = [
            /^jal\s+ra,/, // RISC-V jump and link to ra (function call)
            /^jalr\s+ra,/, // RISC-V jump and link register to ra
            /^call\s+/, // RISC-V pseudo-instruction for call
            /^bl\s+/, // ARM branch with link
            /^blx\s+/, // ARM branch with link and exchange
            /^jsr\s+/, // 68k/others jump to subroutine
            /^bsr\s+/, // 68k/others branch to subroutine
        ];

        return callPatterns.some(pattern => pattern.test(instruction));
    }

    /**
     * Check if instruction is a function return
     */
    private static isReturnInstruction(instruction: string): boolean {
        const returnPatterns = [
            /^ret$/, // RISC-V return (pseudo-instruction)
            /^jr\s+ra$/, // RISC-V jump register to return address
            /^jalr\s+x0,\s*ra/, // RISC-V explicit return
            /^jalr\s+zero,\s*ra/, // RISC-V explicit return with zero
            /^jalr\s+x0,\s*0\(ra\)/, // RISC-V explicit return with offset
            /^bx\s+lr$/, // ARM return
            /^pop\s+.*pc/, // ARM return via pop
            /^rts$/, // 68k/others return from subroutine
            /^ret$/, // x86 return
        ];

        return returnPatterns.some(pattern => pattern.test(instruction));
    }

    /**
     * Check if instruction is a jump or branch (but not a call/return)
     */
    private static isJumpOrBranch(instruction: string): boolean {
        const jumpPatterns = [
            /^j\s+/, // RISC-V unconditional jump
            /^jr\s+(?!ra)/, // RISC-V jump register (but not return)
            /^jal\s+x0,/, // RISC-V jump without linking
            /^beq\s+/, // RISC-V branch equal
            /^bne\s+/, // RISC-V branch not equal
            /^blt\s+/, // RISC-V branch less than
            /^bge\s+/, // RISC-V branch greater equal
            /^bltu\s+/, // RISC-V branch less than unsigned
            /^bgeu\s+/, // RISC-V branch greater equal unsigned
            /^b\s+/, // ARM unconditional branch
            /^beq\s+/, // ARM branch equal
            /^bne\s+/, // ARM branch not equal
            /^bmi\s+/, // ARM branch minus
            /^bpl\s+/, // ARM branch plus
        ];

        return jumpPatterns.some(pattern => pattern.test(instruction));
    }

    protected async scopesRequest(
        response: DebugProtocol.ScopesResponse,
        args: DebugProtocol.ScopesArguments,
    ): Promise<void> {
        const scopes = [
            {
                name: "Registers",
                variablesReference: this.variableHandles.create("registers"),
                expensive: false,
            },
            {
                name: "Memory",
                variablesReference: this.variableHandles.create("memory"),
                expensive: true,
            },
        ];

        response.body = {
            scopes,
        };
        this.sendResponse(response);
    }

    protected async variablesRequest(
        response: DebugProtocol.VariablesResponse,
        args: DebugProtocol.VariablesArguments,
    ): Promise<void> {
        const variables: DebugProtocol.Variable[] = [];
        const handle = this.variableHandles.get(args.variablesReference);

        try {
            if (handle === "registers") {
                // Get all register bank types
                const registerBankTypes = [
                    "int_registers",
                    "ctrl_registers",
                    "fp_registers",
                ];

                for (const bankType of registerBankTypes) {
                    try {
                        const registerBank =
                            await this.rpcClient.getRegisterBank(bankType);

                        // Add a section header for each register bank
                        variables.push({
                            name: `--- ${bankType.replace("_", " ").toUpperCase()} ---`,
                            value: "",
                            variablesReference: 0,
                        });

                        // Add all registers from this bank
                        for (const reg of registerBank.registers) {
                            variables.push({
                                name: reg.name,
                                value: `0x${reg.value}`,
                                variablesReference: 0,
                            });
                        }
                    } catch (error) {
                        // If a register bank doesn't exist or fails to load, just skip it
                        log.warn(
                            `Failed to load register bank ${bankType}: ${error}`,
                        );
                    }
                }
            } else if (handle === "memory") {
                const pc = await this.rpcClient.getPC();
                const pcAddr = parseInt(pc.value, 16);

                // Get memory with hints for better display
                try {
                    const memoryWithHints =
                        await this.rpcClient.getMemoryWithHints(
                            `0x${pcAddr.toString(16)}`,
                            32, // Show 32 bytes by default
                        );

                    for (const entry of memoryWithHints.entries) {
                        const displayValue = entry.value;
                        let description = "";

                        // Add hints to the description if available
                        if (entry.hints.length > 0) {
                            const hintDescriptions = entry.hints.map(
                                (hint: MemoryHint) => {
                                    const shortHint = hint.hint
                                        .replace("<", "")
                                        .replace(">", "");
                                    const sizeInfo = hint.sizeInBits
                                        ? ` (${hint.sizeInBits}b)`
                                        : "";
                                    const offsetInfo =
                                        entry.hints.length > 1
                                            ? ` @+${hint.offset}`
                                            : "";
                                    return `${shortHint}${sizeInfo}${offsetInfo}`;
                                },
                            );
                            description = ` // ${hintDescriptions.join(", ")}`;
                        }

                        variables.push({
                            name: entry.address,
                            value: `${displayValue}${description}`,
                            variablesReference: 0,
                        });
                    }
                } catch {
                    // Fallback to basic memory display
                    for (let i = 0; i < 8; i++) {
                        const addr = pcAddr + i * 4;
                        try {
                            const memory = await this.rpcClient.getMemory(
                                `0x${addr.toString(16)}`,
                                4,
                            );
                            variables.push({
                                name: `0x${addr.toString(16).toUpperCase()}`,
                                value: `0x${memory.data.join("")}`,
                                variablesReference: 0,
                            });
                        } catch {
                            // Skip failed memory reads
                        }
                    }
                }
            }
        } catch (error: unknown) {
            log.error("Failed to get variables:", error);
        }

        response.body = {
            variables,
        };
        this.sendResponse(response);
    }

    protected async continueRequest(
        response: DebugProtocol.ContinueResponse,
        args: DebugProtocol.ContinueArguments,
    ): Promise<void> {
        this.isRunning = true;
        this.sendEvent(new ContinuedEvent(CreatorDebugSession.THREAD_ID));

        try {
            // Continue execution until breakpoint or completion
            let stepCount = 0;
            const maxSteps = 10000; // Safety limit

            while (stepCount < maxSteps && this.isRunning) {
                // Execute one step
                await this.rpcClient.executeStep();
                stepCount++;

                // Get the new context after the step
                const context = await this.rpcClient.getExecutionContext();

                // Check for completion or error first
                if (context.completed || context.error) {
                    this.isRunning = false;
                    await this.updateConsoleOutput();
                    this.sendEvent(new TerminatedEvent());
                    break;
                }

                // Update call stack
                this.updateCallStack(context);

                // Check if current instruction has breakpoint
                if (context.currentInstruction?.address) {
                    const lineNumber = this.addressToLineMap.get(
                        context.currentInstruction.address,
                    );
                    if (
                        lineNumber !== undefined &&
                        this.breakpoints.has(lineNumber)
                    ) {
                        this.isRunning = false;
                        await this.updateConsoleOutput();
                        this.sendEvent(
                            new StoppedEvent(
                                "breakpoint",
                                CreatorDebugSession.THREAD_ID,
                            ),
                        );
                        break;
                    }
                }

                // Update console output periodically
                if (stepCount % 10 === 0) {
                    await this.updateConsoleOutput();
                }
            }

            if (stepCount >= maxSteps && this.isRunning) {
                this.isRunning = false;
                this.sendEvent(
                    new StoppedEvent("pause", CreatorDebugSession.THREAD_ID),
                );
            }
        } catch (error: unknown) {
            log.error("Continue execution failed:", error);
            this.isRunning = false;
            this.sendEvent(
                new StoppedEvent("exception", CreatorDebugSession.THREAD_ID),
            );
        }

        response.body = { allThreadsContinued: false };
        this.sendResponse(response);
    }

    protected async nextRequest(
        response: DebugProtocol.NextResponse,
        _args: DebugProtocol.NextArguments,
    ): Promise<void> {
        try {
            // Get current state before step
            const beforeContext = await this.rpcClient.getExecutionContext();
            log.info(
                `Before step - PC: ${beforeContext.pc}, completed: ${beforeContext.completed}, error: ${beforeContext.error}`,
            );

            // Execute the step
            const stepResult = await this.rpcClient.executeStep();
            log.info(`Step result: ${JSON.stringify(stepResult)}`);

            // Get state after step
            const afterContext = await this.rpcClient.getExecutionContext();
            log.info(
                `After step - PC: ${afterContext.pc}, completed: ${afterContext.completed}, error: ${afterContext.error}`,
            );

            // Update call stack
            this.updateCallStack(afterContext);

            // Check for console output changes
            await this.updateConsoleOutput();

            // Check if program has completed or errored
            if (afterContext.completed || afterContext.error) {
                this.sendEvent(new TerminatedEvent());
            } else {
                this.sendEvent(
                    new StoppedEvent("step", CreatorDebugSession.THREAD_ID),
                );
            }
        } catch (error: unknown) {
            log.error("Step execution failed:", error);
            this.sendEvent(
                new StoppedEvent("exception", CreatorDebugSession.THREAD_ID),
            );
        }

        this.sendResponse(response);
    }

    protected async stepInRequest(
        response: DebugProtocol.StepInResponse,
        args: DebugProtocol.StepInArguments,
    ): Promise<void> {
        // For assembly, step in is the same as step over
        await this.nextRequest(
            response as DebugProtocol.NextResponse,
            args as DebugProtocol.NextArguments,
        );
    }

    protected async stepOutRequest(
        response: DebugProtocol.StepOutResponse,
        args: DebugProtocol.StepOutArguments,
    ): Promise<void> {
        // For assembly, step out is the same as step over
        await this.nextRequest(
            response as DebugProtocol.NextResponse,
            args as DebugProtocol.NextArguments,
        );
    }

    protected async pauseRequest(
        response: DebugProtocol.PauseResponse,
        args: DebugProtocol.PauseArguments,
    ): Promise<void> {
        this.isRunning = false;
        this.sendEvent(
            new StoppedEvent("pause", CreatorDebugSession.THREAD_ID),
        );
        this.sendResponse(response);
    }

    protected async disconnectRequest(
        response: DebugProtocol.DisconnectResponse,
        args: DebugProtocol.DisconnectArguments,
    ): Promise<void> {
        await this.rpcClient.reset();
        this.sendResponse(response);
    }

    protected async terminateRequest(
        response: DebugProtocol.TerminateResponse,
        args: DebugProtocol.TerminateArguments,
    ): Promise<void> {
        await this.rpcClient.reset();
        this.sendEvent(new TerminatedEvent());
        this.sendResponse(response);
    }

    protected configurationDoneRequest(
        response: DebugProtocol.ConfigurationDoneResponse,
        args: DebugProtocol.ConfigurationDoneArguments,
    ): void {
        super.configurationDoneRequest(response, args);
    }

    /**
     * Check for changes in the CREATOR display and send output events
     */
    private async updateConsoleOutput(): Promise<void> {
        try {
            const state = await this.rpcClient.getState();
            const currentDisplay = state.status.display || "";

            // Only send output if display content has changed
            if (currentDisplay !== this.lastDisplayContent) {
                const newContent = currentDisplay.substring(
                    this.lastDisplayContent.length,
                );
                if (newContent) {
                    this.sendEvent(new OutputEvent(newContent, "stdout"));
                }
                this.lastDisplayContent = currentDisplay;
            }
        } catch (error) {
            // Silently fail - console output is not critical
        }
    }

    // Custom methods for external control
    public async stepOver(): Promise<void> {
        if (!this.isRunning) {
            const request = {
                arguments: { threadId: CreatorDebugSession.THREAD_ID },
            };
            const response = {} as DebugProtocol.NextResponse;
            await this.nextRequest(response, request.arguments);
        }
    }

    public async continue(): Promise<void> {
        if (!this.isRunning) {
            const request = {
                arguments: { threadId: CreatorDebugSession.THREAD_ID },
            };
            const response = {} as DebugProtocol.ContinueResponse;
            await this.continueRequest(response, request.arguments);
        }
    }

    public async reset(): Promise<void> {
        this.isRunning = false;
        await this.rpcClient.reset();
        // Clear breakpoints, call stack, and rebuild mapping
        this.breakpoints.clear();
        this.callStack = [];
        this.lastPC = "";
        await this.buildSourceMapping();
        this.sendEvent(
            new StoppedEvent("entry", CreatorDebugSession.THREAD_ID),
        );
    }

    public async terminate(): Promise<void> {
        this.isRunning = false;
        await this.rpcClient.reset();
        this.sendEvent(new TerminatedEvent());
    }

    protected override async evaluateRequest(
        response: DebugProtocol.EvaluateResponse,
        args: DebugProtocol.EvaluateArguments,
    ): Promise<void> {
        try {
            // Check if this is a hover request for a register
            if (args.context === "hover") {
                const expression = args.expression.trim();

                // Try to get register value
                const registerValue = await this.getRegisterValue(expression);
                if (registerValue !== null) {
                    response.body = {
                        result: `0x${registerValue}`,
                        type: "register",
                        variablesReference: 0,
                    };
                    this.sendResponse(response);
                    return;
                }
            }

            // If not a register or not found, return error
            response.success = false;
            response.message = `Unable to evaluate '${args.expression}'`;
            this.sendResponse(response);
        } catch (error: unknown) {
            response.success = false;
            response.message = `Evaluation error: ${error}`;
            this.sendResponse(response);
        }
    }

    /**
     * Try to get the value of a register by name, checking common naming patterns
     */
    private async getRegisterValue(name: string): Promise<string | null> {
        try {
            // Try direct register lookup first
            const result = await this.rpcClient.getRegister(name);
            return result.value;
        } catch (_error) {
            return null;
        }
    }

    protected override async readMemoryRequest(
        response: DebugProtocol.ReadMemoryResponse,
        args: DebugProtocol.ReadMemoryArguments,
    ): Promise<void> {
        try {
            const address = args.memoryReference;
            const count = args.count || 16;
            const offset = args.offset || 0;

            // Calculate the actual address to read from
            const actualAddress = `0x${(parseInt(address, 16) + offset).toString(16)}`;

            const memory = await this.rpcClient.getMemory(actualAddress, count);

            // Convert the data array to a base64 encoded string
            const buffer = Buffer.from(
                memory.data.map((hex: string) => parseInt(hex, 16)),
            );
            const base64Data = buffer.toString("base64");

            response.body = {
                address: actualAddress,
                data: base64Data,
                unreadableBytes: 0,
            };

            this.sendResponse(response);
        } catch (error: unknown) {
            response.success = false;
            response.message = `Failed to read memory: ${error instanceof Error ? error.message : String(error)}`;
            this.sendResponse(response);
        }
    }
}
