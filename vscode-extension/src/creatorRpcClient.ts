import axios, { AxiosInstance } from "axios";

export interface JsonRpcRequest {
    jsonrpc: "2.0";
    method: string;
    params?: Record<string, unknown> | unknown[];
    id: number;
}

export interface JsonRpcResponse {
    jsonrpc: "2.0";
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
    id: number;
}

export interface ExecutionContext {
    pc: string;
    executionIndex: number;
    completed: boolean;
    error: boolean;
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
}

export interface RegisterBank {
    name: string;
    type: string;
    registers: Array<{
        name: string;
        value: string;
        nbits: number;
    }>;
}

export interface MemoryData {
    address: string;
    data: string[];
}

export interface MemoryWithHints {
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
}

export interface Instruction {
    user: string;
    index: number;
    address: string;
    label?: string;
    asm: string;
    machineCode: string;
    visible: boolean;
    isBreakpoint?: boolean;
}

export interface StackFrame {
    function: string;
    address: string;
    level: number;
}

export interface CompileResult {
    status: string;
    msg?: string;
}

export interface ExecutionResult {
    output: string;
    completed: boolean;
    error: boolean;
    instructionData?: {
        asm?: string;
        machineCode?: string;
        success?: boolean;
    };
}

export class CreatorRpcClient {
    private requestId = 1;
    private httpClient: AxiosInstance;

    constructor(private baseUrl: string = "http://localhost:8080") {
        this.httpClient = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000, // Increased timeout to 10 seconds
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    private async sendRequest(
        method: string,
        params?: Record<string, unknown> | unknown[],
    ): Promise<unknown> {
        const requestId = this.requestId++;
        const request: JsonRpcRequest = {
            jsonrpc: "2.0",
            method,
            params,
            id: requestId,
        };

        console.log(`[RPC-${requestId}] Sending request: ${method}`, params);

        try {
            const response = await this.httpClient.post("/", request);
            console.log(
                `[RPC-${requestId}] Received response for ${method}:`,
                response.data,
            );

            const jsonResponse: JsonRpcResponse = response.data;

            if (jsonResponse.error) {
                console.error(
                    `[RPC-${requestId}] RPC Error for ${method}:`,
                    jsonResponse.error,
                );
                throw new Error(
                    `RPC Error ${jsonResponse.error.code}: ${jsonResponse.error.message}`,
                );
            }

            console.log(
                `[RPC-${requestId}] Request ${method} completed successfully`,
            );
            return jsonResponse.result;
        } catch (error) {
            console.error(
                `[RPC-${requestId}] Request ${method} failed:`,
                error,
            );
            throw error;
        }
    }

    async loadArchitecture(yamlPath: string, isaExtensions?: string[]) {
        return await this.sendRequest("loadArchitecture", {
            yamlPath,
            isaExtensions,
        });
    }

    async compileAssembly(assembly: string, compiler?: string) {
        return await this.sendRequest("compileAssembly", {
            assembly,
            compiler,
        });
    }

    async executeStep() {
        console.log("[RPC-CLIENT] executeStep() called");
        const result = await this.sendRequest("executeStep");
        console.log("[RPC-CLIENT] executeStep() completed:", result);
        return result;
    }

    async getExecutionContext(): Promise<ExecutionContext> {
        console.log("[RPC-CLIENT] getExecutionContext() called");
        const result = await this.sendRequest("getExecutionContext");
        console.log("[RPC-CLIENT] getExecutionContext() completed:", result);
        return result as ExecutionContext;
    }

    async reset() {
        return await this.sendRequest("reset");
    }

    async getState(): Promise<{
        status: {
            display: string;
            keyboard: string;
            execution_index: number;
            error: number;
        };
    }> {
        return (await this.sendRequest("getState")) as {
            status: {
                display: string;
                keyboard: string;
                execution_index: number;
                error: number;
            };
        };
    }

    async loadBinary(
        filePath: string,
        offset?: string,
    ): Promise<{ status: string; msg: string }> {
        return (await this.sendRequest("loadBinary", {
            filePath,
            offset,
        })) as { status: string; msg: string };
    }

    async executeN(steps: number): Promise<ExecutionResult> {
        return (await this.sendRequest("executeN", { steps })) as ExecutionResult;
    }

    async getRegister(name: string): Promise<{ value: string }> {
        return (await this.sendRequest("getRegister", { name })) as {
            value: string;
        };
    }

    async getRegisterBank(type: string): Promise<RegisterBank> {
        return (await this.sendRequest("getRegisterBank", {
            type,
        })) as RegisterBank;
    }

    async getMemory(address: string, count?: number): Promise<MemoryData> {
        return (await this.sendRequest("getMemory", {
            address,
            count,
        })) as MemoryData;
    }

    async getMemoryWithHints(
        address: string,
        count?: number,
    ): Promise<MemoryWithHints> {
        return (await this.sendRequest("getMemoryWithHints", {
            address,
            count,
        })) as MemoryWithHints;
    }

    async getMemoryHexDump(
        address: string,
        count?: number,
        bytesPerLine?: number,
    ): Promise<{ dump: string }> {
        return (await this.sendRequest("getMemoryHexDump", {
            address,
            count,
            bytesPerLine,
        })) as { dump: string };
    }

    async getMemoryDump(): Promise<{
        addresses: number[];
        values: number[];
        hints: any[];
        wordSize: number;
        highestAddress: number;
    }> {
        return (await this.sendRequest("getMemoryDump")) as {
            addresses: number[];
            values: number[];
            hints: any[];
            wordSize: number;
            highestAddress: number;
        };
    }

    async getPC(): Promise<{ value: string }> {
        return (await this.sendRequest("getPC")) as { value: string };
    }

    async getStack(): Promise<{ frames: StackFrame[] }> {
        return (await this.sendRequest("getStack")) as { frames: StackFrame[] };
    }

    async getInstruction(params: {
        index?: number;
        address?: string;
    }): Promise<Instruction | null> {
        return (await this.sendRequest(
            "getInstruction",
            params,
        )) as Instruction | null;
    }

    async setBreakpoint(params: {
        index?: number;
        address?: string;
        enabled: boolean;
    }): Promise<{ success: boolean; instruction?: Instruction }> {
        return (await this.sendRequest("setBreakpoint", params)) as {
            success: boolean;
            instruction?: Instruction;
        };
    }

    async getInstructions(): Promise<Instruction[]> {
        return (await this.sendRequest("getInstructions")) as Instruction[];
    }

    static async getAvailableCompilers(): Promise<{
        compilers: Array<{
            name: string;
            description: string;
            displayName: string;
        }>;
        default: string;
    }> {
        // This is a static method on the server, but we need an instance to make the request
        const client = new CreatorRpcClient();
        return (await client.sendRequest("getAvailableCompilers")) as {
            compilers: Array<{
                name: string;
                description: string;
                displayName: string;
            }>;
            default: string;
        };
    }

    static async setDebug(enabled: boolean): Promise<{ status: string }> {
        // This is a static method on the server, but we need an instance to make the request
        const client = new CreatorRpcClient();
        return (await client.sendRequest("setDebug", { enabled })) as {
            status: string;
        };
    }
}
