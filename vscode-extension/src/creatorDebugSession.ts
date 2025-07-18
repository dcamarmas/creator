import {
    DebugSession,
    InitializedEvent,
    TerminatedEvent,
    StoppedEvent,
    Thread,
    OutputEvent,
    StackFrame,
    Source,
    Handles,
    Breakpoint
} from "vscode-debugadapter";
import { DebugProtocol } from "vscode-debugprotocol";
import * as fs from "node:fs";
import * as path from "node:path";
import { debuggerEvents } from "./debuggerEvents";
import {
    CreatorRpcClient,
    ExecutionContext,
    ExecutionResult,
} from "./creatorRpcClient";

interface CreatorLaunchRequestArguments
    extends DebugProtocol.LaunchRequestArguments {
    program: string;
    architectureFile?: string;
    compiler?: string;
    rpcServerUrl?: string;
}

interface LoggingSession {
    sendEvent(event: OutputEvent): void;
}

let debugSessionInstance: LoggingSession | null = null;

const log = {
    setSession: (session: LoggingSession) => {
        debugSessionInstance = session;
    },
    info: (message: string) => {
        console.log(`[INFO] ${message}`);
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
export class CreatorDebugSession extends DebugSession {
    private static THREAD_ID = 1;
    private rpcClient: CreatorRpcClient;
    private lastDisplayContent: string = "";
    private _isStepping: boolean = false;
    private _sourceFile?: string;
    private _lastExecutionContext?: ExecutionContext;
    private sourceLines: string[] = [];
    private addressToLineMap = new Map<string, number>();
    private lineToAddressMap = new Map<number, string>();
    private functionLabels = new Map<string, string>(); // address -> function name
    private variableHandles = new Handles<string>();
    private breakpoints = new Set<number>();

    constructor() {
        super();
        this.rpcClient = new CreatorRpcClient();
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);

        debuggerEvents.on("requestMemoryRefresh", async () => {
            console.log("DebugSession received request for memory refresh.");
            await this.refreshAndEmitMemory();
        });
    }

    private async refreshAndEmitMemory(): Promise<void> {
        try {
            const memoryDump = await this.rpcClient.getMemoryDump();
            // Emit the event with the data as the payload.
            debuggerEvents.emit("memoryUpdated", memoryDump);
        } catch (error) {
            log.error("Failed to refresh and emit memory dump:", error);
            // Optionally emit an empty dump on error
            debuggerEvents.emit("memoryUpdated", {
                addresses: [],
                values: [],
                hints: [],
                wordSize: 4,
                highestAddress: 0,
            });
        }
    }
    /**
     * Send output to the debug console
     */
    private sendOutput(
        text: string,
        category: "stdout" | "stderr" | "console" = "stdout",
    ): void {
        if (text.trim()) {
            this.sendEvent(new OutputEvent(text + "\n", category));
        }
    }

    /**
     * Update console output by checking for changes in display content
     */
    private async updateConsoleOutput(): Promise<void> {
        try {
            const state = await this.rpcClient.getState();
            const currentDisplay = state.status.display;

            if (currentDisplay !== this.lastDisplayContent) {
                // Send the new content to debug console
                if (currentDisplay) {
                    this.sendOutput(currentDisplay, "stdout");
                }
                this.lastDisplayContent = currentDisplay;
            }
        } catch (error) {
            // Ignore errors in console update to avoid breaking debugging
            console.error("Failed to update console output:", error);
        }
    }

    protected override initializeRequest(
        response: DebugProtocol.InitializeResponse,
        args: DebugProtocol.InitializeRequestArguments,
    ): void {
        response.body = response.body || {};
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsEvaluateForHovers = true;
        response.body.supportsInstructionBreakpoints = true;
        response.body.supportsStepInTargetsRequest = false;
        response.body.supportsStepBack = false;
        this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected override async continueRequest(
        response: DebugProtocol.ContinueResponse,
        _args: DebugProtocol.ContinueArguments,
    ): Promise<void> {
        this.sendResponse(response);

        // If another stepping/running command is already in progress, do nothing.
        if (this._isStepping) {
            return;
        }
        this._isStepping = true; // Set the "running" state

        // Start the execution loop in the background, don't await it.
        // This allows the debug adapter to remain responsive to other requests (like 'pause').
        (async () => {
            try {
                // Loop until a stop condition is met or a pause is requested.
                // The `this._isStepping` flag can be set to false by a `pauseRequest`.
                while (this._isStepping) {
                    // Get the current execution context *before* executing the next instruction.
                    const context = await this.rpcClient.getExecutionContext();
                    this._lastExecutionContext = context;

                    // 1. Check for program completion or an error state.
                    if (context.completed || context.error) {
                        if (context.error) {
                            log.error(
                                `Execution terminated with error: ${context.error}`,
                            );
                        }
                        this.sendEvent(new TerminatedEvent());
                        break; // Exit the execution loop
                    }

                    // 2. Check if the current instruction is at a breakpoint.
                    const pcAddress = "0x" + context.pc.toUpperCase();
                    const lineIndex = this.addressToLineMap.get(pcAddress);

                    if (
                        lineIndex !== undefined &&
                        this.breakpoints.has(lineIndex)
                    ) {
                        log.info(
                            `Breakpoint hit at address ${pcAddress}, line ${lineIndex + 1}`,
                        );
                        this.sendEvent(
                            new StoppedEvent(
                                "breakpoint",
                                CreatorDebugSession.THREAD_ID,
                            ),
                        );
                        await this.refreshAndEmitMemory();
                        break; // Exit the execution loop
                    }

                    // 3. If no reason to stop, execute a single step.
                    const stepResult = await this.rpcClient.executeStep();

                    // Process any output generated by the step.
                    if (stepResult && stepResult.output) {
                        this.sendOutput(stepResult.output, "stdout");
                    }
                }
            } catch (error) {
                log.error(
                    "An error occurred during 'continue' execution:",
                    error,
                );
                this.sendEvent(
                    new StoppedEvent(
                        "exception",
                        CreatorDebugSession.THREAD_ID,
                    ),
                );
            } finally {
                // Once the loop stops (for any reason), reset the running state.
                this._isStepping = false;
                // Update the console with any final output.
                await this.updateConsoleOutput();
            }
        })();
    }

    protected override async pauseRequest(
        response: DebugProtocol.PauseResponse,
        _args: DebugProtocol.PauseArguments,
    ): Promise<void> {
        log.info("Pause request received. Halting execution.");

        // Set the flag to false. This will cause the execution loop
        // in `continueRequest` to terminate after its current iteration.
        this._isStepping = false;

        // Immediately respond to the client to acknowledge the pause request.
        this.sendResponse(response);

        // Send a 'stopped' event to the client to update the UI,
        // indicating that the execution has been paused by the user.
        this.sendEvent(new StoppedEvent("pause", CreatorDebugSession.THREAD_ID));

        // After stopping, it's a good practice to refresh the state for the UI.
        await this.refreshAndEmitMemory();
    }

    protected setBreakPointsRequest(
        response: DebugProtocol.SetBreakpointsResponse,
        args: DebugProtocol.SetBreakpointsArguments,
    ): void {
        const clientLines = args.lines || [];

        // Clear existing breakpoints from RPC server
        this.breakpoints.forEach(lineIndex => {
            const address = this.lineToAddressMap.get(lineIndex);
            if (address) {
                this.rpcClient
                    .setBreakpoint({index: lineIndex, address, enabled: false})
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
                    .setBreakpoint({index: lineIndex, address, enabled: true})
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

    protected override async launchRequest(
        response: DebugProtocol.LaunchResponse,
        args: CreatorLaunchRequestArguments,
    ): Promise<void> {
        try {
            console.log("Starting CREATOR Assembly Debugger...");
            this._sourceFile = args.program;
            log.setSession(this);

            // Set up RPC client
            if (args.rpcServerUrl) {
                this.rpcClient = new CreatorRpcClient(args.rpcServerUrl);
                console.log(`Connecting to RPC server at ${args.rpcServerUrl}`);
            }

            // Load assembly source
            if (!fs.existsSync(args.program)) {
                throw new Error(`Assembly file not found: ${args.program}`);
            }

            const assemblySource = fs.readFileSync(args.program, "utf8");
            console.log(`Loaded assembly file: ${args.program}`);
            this.sourceLines = assemblySource.split("\n");

            // Load architecture and compile
            if (!args.architectureFile) {
                throw new Error("No architecture file provided");
            }

            console.log(`Loading architecture: ${args.architectureFile}`);
            await this.rpcClient.loadArchitecture(args.architectureFile, []);

            console.log("Compiling assembly code...");
            try {
                await this.rpcClient.compileAssembly(
                    assemblySource,
                    args.compiler,
                );
            } catch (error) {
                console.error("Compilation error:", error);
                this.sendOutput(`${String(error)}`, "stderr");
                throw new Error(
                    `Compilation failed. For details, check the debug console.`,
                );
            }

            console.log("Assembly compiled successfully!");
            console.log(
                "Ready to debug. Use step commands to execute instructions.",
            );

            // Build source-to-instruction mapping
            await this.buildSourceMapping();

            this._lastExecutionContext =
                await this.rpcClient.getExecutionContext();

            this.sendResponse(response);
            this.sendEvent(
                new StoppedEvent("entry", CreatorDebugSession.THREAD_ID),
            );
        } catch (error: unknown) {
            this.sendOutput(`Launch failed: ${String(error)}`, "stderr");
            response.success = false;
            response.message = String(error);
            this.sendResponse(response);
            this.sendEvent(new TerminatedEvent());
        }
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
                    const srcLine = stripComments(
                        this.sourceLines[lineIdx],
                    ).replace(/\s+/g, " ");
                    if (srcLine.includes(userText)) {
                        this.addressToLineMap.set(instr.address, lineIdx);
                        this.lineToAddressMap.set(lineIdx, instr.address);
                        lastMatchedLine = lineIdx + 1;
                        found = true;
                        log.info(
                            `Mapped instruction at address ${instr.address} to line ${lineIdx + 1}: ${this.sourceLines[lineIdx]} [user: "${instr.user}"]`,
                        );
                        break;
                    }
                }
                if (!found) {
                    log.warn(
                        `Could not map instruction at address ${instr.address} with user text "${instr.user}"`,
                    );
                }
            } else if (i > 0) {
                // Pseudoinstruction expansion: map to previous matched line
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

    protected override async evaluateRequest(
        response: DebugProtocol.EvaluateResponse,
        args: DebugProtocol.EvaluateArguments,
    ): Promise<void> {
        try {
            // Check if this is a hover request for a register
            if (args.context === "hover") {
                const expression = args.expression.trim();

                // Try to get register value
                const registerValue =
                    await this.rpcClient.getRegister(expression);
                if (registerValue !== null) {
                    response.body = {
                        result: `0x${registerValue.value}`,
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
            }
        } catch (error: unknown) {
            log.error("Failed to get variables:", error);
        }

        response.body = {
            variables,
        };
        this.sendResponse(response);
    }

    protected override threadsRequest(
        response: DebugProtocol.ThreadsResponse,
    ): void {
        response.body = {
            threads: [new Thread(CreatorDebugSession.THREAD_ID, "main")],
        };
        this.sendResponse(response);
    }

    protected stackTraceRequest(
        response: DebugProtocol.StackTraceResponse,
        _args: DebugProtocol.StackTraceArguments,
    ): void {
        if (!this._sourceFile || !this._lastExecutionContext) {
            response.body = { stackFrames: [], totalFrames: 0 };
            this.sendResponse(response);
            return;
        }

        const context = this._lastExecutionContext;
        const pc = parseInt(context.pc, 16);

        // Use the mapping to get the correct source line
        const pcAddress = "0x" + context.pc.toUpperCase(); // Ensure consistent case
        const mappedLine = this.addressToLineMap.get(pcAddress);
        const line = mappedLine !== undefined ? mappedLine + 1 : 1; // Convert to 1-based line numbering

        const frame = new StackFrame(
            0,
            `PC: 0x${pc.toString(16)}`,
            new Source(path.basename(this._sourceFile), this._sourceFile),
            line,
            0,
        );

        response.body = {
            stackFrames: [frame],
            totalFrames: 1,
        };
        this.sendResponse(response);
    }

    protected override async nextRequest(
        response: DebugProtocol.NextResponse,
        _args: DebugProtocol.NextArguments,
    ): Promise<void> {
        const requestId = Math.random().toString(36).substr(2, 9);
        console.log(`[DEBUG-${requestId}] nextRequest started`);
        if (this._isStepping) {
            this.sendResponse(response);
            return;
        }
        this._isStepping = true;
        try {
            // Execute the step
            const stepResult =
                (await this.rpcClient.executeStep()) as ExecutionResult;

            // Check for any output from the step
            if (stepResult && stepResult.output) {
                this.sendOutput(stepResult.output, "stdout");
            }

            await this.updateConsoleOutput();

            const context = await this.rpcClient.getExecutionContext();
            this._lastExecutionContext = context;

            // Log current instruction info
            if (context.currentInstruction) {
                console.log(
                    `[DEBUG-${requestId}] Current instruction:`,
                    context.currentInstruction,
                );
            }

            this.sendResponse(response);

            if (context.completed || context.error) {
                this.sendEvent(new TerminatedEvent());
            } else {
                console.log(
                    `[DEBUG-${requestId}] Sending StoppedEvent with reason 'step'`,
                );

                this.sendEvent(
                    new StoppedEvent("step", CreatorDebugSession.THREAD_ID),
                );

                await this.refreshAndEmitMemory();
            }
        } catch (error: unknown) {
            console.error(`[DEBUG-${requestId}] Step execution failed:`, error);
            this.sendResponse(response);
            this.sendEvent(
                new StoppedEvent("exception", CreatorDebugSession.THREAD_ID),
            );
            return;
        } finally {
            this._isStepping = false;
            console.log(`[DEBUG-${requestId}] nextRequest completed`);
        }
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

    protected override async disconnectRequest(
        response: DebugProtocol.DisconnectResponse,
        args: DebugProtocol.DisconnectArguments,
    ): Promise<void> {
        try {
            await this.rpcClient.reset();
        } catch (error) {
            console.error("Error during disconnect:", error);
        }
        this.sendResponse(response);
    }

    protected override async terminateRequest(
        response: DebugProtocol.TerminateResponse,
        args: DebugProtocol.TerminateArguments,
    ): Promise<void> {
        try {
            await this.rpcClient.reset();
        } catch (error) {
            console.error("Error during terminate:", error);
        }
        this.sendEvent(new TerminatedEvent());
        this.sendResponse(response);
    }

    protected override configurationDoneRequest(
        response: DebugProtocol.ConfigurationDoneResponse,
        args: DebugProtocol.ConfigurationDoneArguments,
    ): void {
        super.configurationDoneRequest(response, args);
    }
}
