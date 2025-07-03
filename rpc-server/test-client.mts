/**
 * Test client for CREATOR JSON RPC Server
 *
 * This script demonstrates how to interact with the JSON RPC server
 * and provides examples of all available methods.
 */

interface JsonRpcRequest {
    jsonrpc: "2.0";
    method: string;
    params?: any;
    id: number;
}

interface JsonRpcResponse {
    jsonrpc: "2.0";
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    id: number;
}

class CreatorRpcClient {
    private requestId = 1;
    private baseUrl: string;

    constructor(baseUrl = "http://localhost:8080") {
        this.baseUrl = baseUrl;
    }

    private async sendRequest(method: string, params?: any): Promise<any> {
        const request: JsonRpcRequest = {
            jsonrpc: "2.0",
            method,
            params,
            id: this.requestId++,
        };

        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const jsonResponse: JsonRpcResponse = await response.json();

        if (jsonResponse.error) {
            throw new Error(
                `RPC Error ${jsonResponse.error.code}: ${jsonResponse.error.message}`,
            );
        }

        return jsonResponse.result;
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

    async loadBinary(filePath: string, offset?: string) {
        return this.sendRequest("loadBinary", {
            filePath,
            offset,
        });
    }

    async executeStep() {
        return this.sendRequest("executeStep");
    }

    async executeN(steps: number) {
        return this.sendRequest("executeN", { steps });
    }

    async getRegister(name: string) {
        return this.sendRequest("getRegister", { name });
    }

    async getRegisterBank(type: string) {
        return this.sendRequest("getRegisterBank", { type });
    }

    async getMemory(address: string, count?: number) {
        return this.sendRequest("getMemory", { address, count });
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

    async getExecutionContext() {
        return this.sendRequest("getExecutionContext");
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

    async getInstructions() {
        return this.sendRequest("getInstructions");
    }
}

// Example usage
async function testClient() {
    const client = new CreatorRpcClient();

    try {
        console.log("🧪 Testing CREATOR JSON RPC Client");
        console.log("=====================================");

        // Test 1: Load RISC-V architecture
        console.log("\n1. Loading RISC-V architecture...");
        const archResult = await client.loadArchitecture(
            "../architecture/RISCV/RV32IMFD.yml",
            ["I", "M"],
        );
        console.log("✅ Architecture loaded:", archResult);

        // Test 2: Compile simple assembly
        console.log("\n2. Compiling assembly code...");
        const assembly = `
.text
main:
    addi x1, x0, 10
    addi x2, x0, 20
    add x3, x1, x2
    nop
`;
        const compileResult = await client.compileAssembly(assembly);
        console.log("✅ Assembly compiled:", compileResult);

        // Test 3: Get initial state
        console.log("\n3. Getting initial state...");
        const initialState = await client.getState();
        console.log("✅ Initial PC:", initialState.pc);
        console.log("✅ Execution index:", initialState.status.execution_index);

        // Test 4: Execute a few steps
        console.log("\n4. Executing steps...");
        for (let i = 0; i < 3; i++) {
            const stepResult = await client.executeStep();
            console.log(`✅ Step ${i + 1}:`, stepResult.output || "No output");
            if (stepResult.completed) {
                console.log("⏹️ Execution completed");
                break;
            }
        }

        // Test 5: Check register values
        console.log("\n5. Checking register values...");
        const x1 = await client.getRegister("x1");
        const x2 = await client.getRegister("x2");
        const x3 = await client.getRegister("x3");
        console.log("✅ x1:", x1.value);
        console.log("✅ x2:", x2.value);
        console.log("✅ x3:", x3.value);

        // Test 6: Get register bank
        console.log("\n6. Getting integer register bank...");
        const intRegs = await client.getRegisterBank("int_registers");
        console.log("✅ Integer register bank:", intRegs.name);
        console.log("✅ First few registers:", intRegs.registers.slice(0, 5));

        // Test 7: Get PC
        console.log("\n7. Getting program counter...");
        const pc = await client.getPC();
        console.log("✅ PC:", pc.value);

        // Test 8: Get memory
        console.log("\n8. Getting memory content...");
        const memory = await client.getMemory("0x10000", 8);
        console.log("✅ Memory at 0x10000:", memory.data);

        // Test 9: Reset
        console.log("\n9. Resetting emulator...");
        const resetResult = await client.reset();
        console.log("✅ Reset:", resetResult);

        console.log("\n🎉 All tests completed successfully!");
    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

// Run tests if this script is executed directly
if (import.meta.main) {
    testClient();
}

export { CreatorRpcClient };
