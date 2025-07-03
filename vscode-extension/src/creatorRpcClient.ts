import axios, { AxiosInstance } from "axios";

export interface JsonRpcRequest {
    jsonrpc: "2.0";
    method: string;
    params?: any;
    id: number;
}

export interface JsonRpcResponse {
    jsonrpc: "2.0";
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    id: number;
}

export interface ExecutionContext {
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
}

export interface Instruction {
    index: number;
    address: string;
    label?: string;
    asm: string;
    user: string;
    loaded: string;
    machineCode: string;
    visible: boolean;
    hide: boolean;
    isBreakpoint?: boolean;
    isCurrentInstruction: boolean;
}

export interface Register {
    name: string;
    value: string;
    nbits: number;
}

export interface RegisterBank {
    name: string;
    type: string;
    registers: Register[];
}

export class CreatorRpcClient {
    private requestId = 1;
    private httpClient: AxiosInstance;

    constructor(private baseUrl: string = "http://localhost:8080") {
        this.httpClient = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    private async sendRequest(method: string, params?: any): Promise<any> {
        const request: JsonRpcRequest = {
            jsonrpc: "2.0",
            method,
            params,
            id: this.requestId++,
        };

        try {
            const response = await this.httpClient.post("/", request);
            const jsonResponse: JsonRpcResponse = response.data;

            if (jsonResponse.error) {
                throw new Error(
                    `RPC Error ${jsonResponse.error.code}: ${jsonResponse.error.message}`,
                );
            }

            return jsonResponse.result;
        } catch (error: any) {
            if (error.response) {
                throw new Error(
                    `HTTP ${error.response.status}: ${error.response.statusText}`,
                );
            } else if (error.request) {
                throw new Error(
                    "No response from CREATOR RPC server. Make sure it is running.",
                );
            } else {
                throw error;
            }
        }
    }

    async loadArchitecture(yamlPath: string, isaExtensions?: string[]) {
        return this.sendRequest("loadArchitecture", {
            yamlPath,
            isaExtensions,
        });
    }

    async compileAssembly(assembly: string, enableColor = false) {
        return this.sendRequest("compileAssembly", {
            assembly,
            enableColor,
        });
    }

    async executeStep() {
        return this.sendRequest("executeStep");
    }

    async executeN(steps: number) {
        return this.sendRequest("executeN", { steps });
    }

    async getExecutionContext(): Promise<ExecutionContext> {
        return this.sendRequest("getExecutionContext");
    }

    async getInstructions(): Promise<Instruction[]> {
        return this.sendRequest("getInstructions");
    }

    async getInstruction(index?: number, address?: string) {
        return this.sendRequest("getInstruction", { index, address });
    }

    async setBreakpoint(
        index?: number,
        address?: string,
        enabled: boolean = true,
    ) {
        return this.sendRequest("setBreakpoint", { index, address, enabled });
    }

    async getRegister(name: string) {
        return this.sendRequest("getRegister", { name });
    }

    async getRegisterBank(type: string): Promise<RegisterBank> {
        return this.sendRequest("getRegisterBank", { type });
    }

    async getMemory(address: string, count?: number) {
        return this.sendRequest("getMemory", { address, count });
    }

    async getMemoryWithHints(address: string, count?: number) {
        return this.sendRequest("getMemoryWithHints", { address, count });
    }

    async getMemoryHexDump(
        address: string,
        count?: number,
        bytesPerLine?: number,
    ): Promise<{ dump: string }> {
        return this.sendRequest("getMemoryHexDump", {
            address,
            count,
            bytesPerLine,
        });
    }

    async getMemoryDump(): Promise<{
        addresses: number[];
        values: number[];
        hints: Array<{
            address: string;
            hint: string;
            sizeInBits?: number;
        }>;
        wordSize: number;
        highestAddress: number;
    }> {
        return this.sendRequest("getMemoryDump", {});
    }

    async getPC() {
        return this.sendRequest("getPC");
    }

    async getState() {
        return this.sendRequest("getState");
    }

    async reset() {
        return this.sendRequest("reset");
    }

    async getStack() {
        return this.sendRequest("getStack");
    }

    async setDebug(enabled: boolean) {
        return this.sendRequest("setDebug", { enabled });
    }

    // Health check method
    async isServerAlive(): Promise<boolean> {
        try {
            await this.setDebug(false); // Simple call to test connectivity
            return true;
        } catch {
            return false;
        }
    }
}
