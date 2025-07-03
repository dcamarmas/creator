# CREATOR JSON RPC Server

This JSON RPC server provides a standardized interface to the CREATOR emulator, enabling integration with VSCode extensions and other development tools.

## Features

- **Architecture Loading**: Load different CPU architectures (RISC-V, MIPS, Z80, etc.) from YAML files
- **Assembly Compilation**: Compile assembly code for the loaded architecture
- **Binary Loading**: Load pre-compiled binary files into memory
- **Step-by-step Execution**: Execute instructions one at a time or in batches
- **State Inspection**: Read registers, memory, and execution state
- **Stack Analysis**: Get detailed stack frame information
- **Reset and Control**: Reset the emulator and control execution

## Getting Started

### Prerequisites

- [Deno](https://deno.land/) runtime installed
- CREATOR emulator source code

### Running the Server

```bash
# Start the server on default port 8080
deno run --allow-net --allow-read rpc-server/server.mts

# Or specify a custom port
PORT=3000 deno run --allow-net --allow-read rpc-server/server.mts
```

### Testing the Server

```bash
# Run the test client
deno run --allow-net --allow-read rpc-server/test-client.mts
```

## JSON RPC API Reference

The server implements JSON RPC 2.0 specification. All requests should be sent via HTTP POST to the server endpoint.

### Request Format

```json
{
  "jsonrpc": "2.0",
  "method": "methodName",
  "params": { ... },
  "id": 1
}
```

### Response Format

```json
{
  "jsonrpc": "2.0",
  "result": { ... },
  "id": 1
}
```

### Error Format

```json
{
    "jsonrpc": "2.0",
    "error": {
        "code": -32001,
        "message": "Error description"
    },
    "id": 1
}
```

## Available Methods

### Architecture Management

#### `loadArchitecture`

Load a CPU architecture from a YAML file.

**Parameters:**

- `yamlPath` (string): Path to the architecture YAML file
- `yamlContent` (string, optional): Raw YAML content instead of file path
- `isaExtensions` (string[], optional): List of ISA extensions to load (e.g., ["I", "M", "F", "D"])

**Example:**

```json
{
    "jsonrpc": "2.0",
    "method": "loadArchitecture",
    "params": {
        "yamlPath": "../architecture/RISCV/RV32IMFD.yml",
        "isaExtensions": ["I", "M"]
    },
    "id": 1
}
```

**Response:**

```json
{
    "jsonrpc": "2.0",
    "result": {
        "status": "ok",
        "token": "The selected architecture has been loaded correctly"
    },
    "id": 1
}
```

### Code Management

#### `compileAssembly`

Compile assembly code for the loaded architecture.

**Parameters:**

- `assembly` (string): Assembly source code
- `enableColor` (boolean, optional): Enable colored output (default: false)

**Example:**

```json
{
    "jsonrpc": "2.0",
    "method": "compileAssembly",
    "params": {
        "assembly": ".text\nmain:\n    addi x1, x0, 10\n    nop"
    },
    "id": 2
}
```

#### `loadBinary`

Load a binary file into memory.

**Parameters:**

- `filePath` (string): Path to the binary file
- `offset` (string, optional): Memory offset to load the binary (hex string)

### Execution Control

#### `executeStep`

Execute a single instruction.

**Example:**

```json
{
    "jsonrpc": "2.0",
    "method": "executeStep",
    "id": 3
}
```

**Response:**

```json
{
    "jsonrpc": "2.0",
    "result": {
        "output": "0x10000 (0x00a00093) addi x1, x0, 10",
        "completed": false,
        "error": false,
        "instructionData": {
            "asm": "addi x1, x0, 10",
            "machineCode": "00a00093",
            "success": true
        }
    },
    "id": 3
}
```

#### `executeN`

Execute multiple instructions.

**Parameters:**

- `steps` (number): Number of instructions to execute

#### `reset`

Reset the emulator to initial state.

### State Inspection

#### `getRegister`

Get the value of a specific register.

**Parameters:**

- `name` (string): Register name (e.g., "x1", "t0", "sp")

**Example:**

```json
{
    "jsonrpc": "2.0",
    "method": "getRegister",
    "params": { "name": "x1" },
    "id": 4
}
```

**Response:**

```json
{
    "jsonrpc": "2.0",
    "result": { "value": "a" },
    "id": 4
}
```

#### `getRegisterBank`

Get all registers of a specific type.

**Parameters:**

- `type` (string): Register bank type (e.g., "int_registers", "fp_registers")

#### `getMemory`

Read memory at a specific address.

**Parameters:**

- `address` (string): Memory address (hex string)
- `count` (number, optional): Number of bytes to read (default: 4)

#### `getPC`

Get the current program counter value.

#### `getState`

Get the complete emulator state including registers, memory, and execution status.

**Response:**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "registers": {
      "x0": "0",
      "x1": "a",
      "x2": "14"
    },
    "memory": {
      "0x10000": "00a0009300000013"
    },
    "pc": "10008",
    "status": {
      "execution_index": 2,
      "error": 0,
      "display": "",
      "keyboard": ""
    },
    "instructions": [...]
  },
  "id": 5
}
```

#### `getStack`

Get stack frame information and memory contents.

**Response:**

```json
{
    "jsonrpc": "2.0",
    "result": {
        "frames": [
            {
                "function": "main",
                "startAddress": "0x7ffffffc",
                "endAddress": "0x7ffffff8",
                "size": 4
            }
        ],
        "memory": [
            {
                "address": "0x7ffffff8",
                "value": "0x00000000",
                "hint": "local variable"
            }
        ]
    },
    "id": 6
}
```

### Debugging

#### `setDebug`

Enable or disable debug logging.

**Parameters:**

- `enabled` (boolean): Whether to enable debug logging

## Error Codes

| Code   | Description             |
| ------ | ----------------------- |
| -32700 | Parse error             |
| -32600 | Invalid request         |
| -32601 | Method not found        |
| -32602 | Invalid params          |
| -32603 | Internal error          |
| -32001 | Architecture not loaded |
| -32002 | Compilation failed      |
| -32003 | Execution error         |
| -32004 | Register not found      |
| -32005 | Memory error            |

## Client Libraries

### TypeScript/JavaScript

See `test-client.mts` for a complete TypeScript client implementation.

```typescript
import { CreatorRpcClient } from "./rpc-server/test-client.mts";

const client = new CreatorRpcClient("http://localhost:8080");

// Load architecture
await client.loadArchitecture("../architecture/RISCV/RV32IMFD.yml", ["I", "M"]);

// Compile and execute code
await client.compileAssembly("addi x1, x0, 10\nnop");
const result = await client.executeStep();
```

### VSCode Extension Integration

The JSON RPC server is designed to integrate seamlessly with VSCode extensions:

```typescript
// In your VSCode extension
import * as vscode from "vscode";

class CreatorDebugger {
    private rpcClient: CreatorRpcClient;

    constructor() {
        this.rpcClient = new CreatorRpcClient("http://localhost:8080");
    }

    async debug(document: vscode.TextDocument) {
        // Load appropriate architecture
        await this.rpcClient.loadArchitecture(this.getArchitecturePath());

        // Compile current document
        await this.rpcClient.compileAssembly(document.getText());

        // Start debugging session
        this.startDebuggingSession();
    }
}
```

## Supported Architectures

The server supports all architectures available in CREATOR:

- **RISC-V**: RV32I, RV32IM, RV32IMFD, RV64IMFD
- **MIPS**: MIPS32
- **Z80**: Z80, miniZ80
- **6502**: 6502
- **PowerPC**: PowerPC

## Architecture Files

Architecture files are located in the `architecture/` directory:

```
architecture/
├── RISCV/
│   ├── RV32IMFD.yml
│   └── RV64IMFD.yml
├── MIPS.yml
├── Z80.yml
├── miniZ80.yml
├── 6502.yml
└── PowerPC.yml
```

## Examples

### Basic RISC-V Program

```javascript
const client = new CreatorRpcClient();

// Load RISC-V architecture with Integer and Multiplication extensions
await client.loadArchitecture("../architecture/RISCV/RV32IMFD.yml", ["I", "M"]);

// Simple program to add two numbers
const program = `
.text
main:
    addi x1, x0, 10    # x1 = 10
    addi x2, x0, 20    # x2 = 20
    add x3, x1, x2     # x3 = x1 + x2
    nop                # No operation
`;

await client.compileAssembly(program);

// Execute step by step
for (let i = 0; i < 4; i++) {
    const result = await client.executeStep();
    console.log(`Step ${i + 1}: ${result.output}`);
}

// Check final result
const x3 = await client.getRegister("x3");
console.log(`Result: ${parseInt(x3.value, 16)}`); // Should be 30
```

### Memory Inspection

```javascript
// Read memory at program start
const memory = await client.getMemory("0x10000", 16);
console.log("Program memory:", memory.data);

// Get current PC
const pc = await client.getPC();
console.log("Program Counter:", pc.value);

// Get full state
const state = await client.getState();
console.log("Execution index:", state.status.execution_index);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the GNU Lesser General Public License v3.0 - see the CREATOR project license for details.
