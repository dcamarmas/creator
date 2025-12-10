# CREATOR JSON RPC Server

## Overview

The CREATOR JSON RPC server provides a standardized interface to the CREATOR emulator core. It exposes the emulator's functionalities, such as loading architectures, compiling assembly code, executing programs step-by-step, and inspecting the emulator's state (registers, memory, etc.).

While the primary consumer of this RPC server is the VSCode Extension, it is designed to be a versatile backend. This allows developers to embed the CREATOR emulator into a wide range of client applications.

## Features

The RPC server exposes a comprehensive set of methods to control and interact with the emulator:

-   **Architecture Management**: Load and switch between different CPU architectures (e.g., RISC-V, MIPS) defined in YAML files.
-   **Code Compilation**: Compile assembly code using various supported assemblers (e.g., `rasm`, `sjasmplus`).
-   **Execution Control**:
    -   Execute code step-by-step.
    -   Run for a specified number of steps.
    -   Set and clear breakpoints.
    -   Reset the emulator state.
-   **State Inspection**:
    -   Read values from specific registers or entire register banks.
    -   Inspect memory contents at any address.
    -   Get the current program counter (PC).
    -   Retrieve a full snapshot of the emulator's state.
-   **Debugging**:
    -   Get the current execution context, including the current and next instructions.
    -   Retrieve a list of all instructions with their metadata.
    -   Inspect the call stack.
-   **Binary Loading**: Load pre-compiled binary files directly into memory.

## Getting Started

### Prerequisites

-   [Deno](https://deno.land/) runtime environment.

### Running the Server

1.  Navigate to the root of the `creator` project.
2.  Start the server using the following command:

    ```bash
    deno run -A src/rpc/server.mts
    ```

3.  The server will start on the port specified by the `PORT` environment variable, or `8080` by default.

    ```
    🚀 CREATOR JSON RPC Server starting on port 8080
    ```

## API Reference

The server implements the [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification). All interactions are done by sending POST requests with a JSON payload to the server's endpoint (e.g., `http://localhost:8080`).

### Example Request

```json
{
    "jsonrpc": "2.0",
    "method": "loadArchitecture",
    "params": {
        "yamlPath": "../../architecture/RISCV/RV32IMFD.yml"
    },
    "id": 1
}
```

### Available Methods

Below is a list of the available RPC methods with their parameters and expected responses.

#### `loadArchitecture`

Loads a CPU architecture from a YAML file or content.

-   **`params`**:
    -   `yamlPath` (string, optional): Path to the architecture YAML file.
    -   `yamlContent` (string, optional): The YAML content as a string.
    -   `isaExtensions` (string[], optional): Array of ISA extensions to enable.
-   **Returns**: An object with the status of the operation.

---

#### `compileAssembly`

Compiles assembly code.

-   **`params`**:
    -   `assembly` (string): The assembly code to compile.
    -   `compiler` (string, optional): The assembler to use (`default`, `sjasmplus`, `rasm`).
-   **Returns**: An object with the compilation status and messages.

---

#### `executeStep`

Executes a single instruction.

-   **`params`**: None
-   **Returns**: An object with the execution result, including any output and completion status.

---

#### `getRegister`

Retrieves the value of a specific register.

-   **`params`**:
    -   `name` (string): The name of the register.
-   **Returns**: An object containing the register's value in hexadecimal format.

---

#### `getMemory`

Reads a block of memory.

-   **`params`**:
    -   `address` (string): The starting memory address (in hex).
    -   `count` (number, optional): The number of bytes to read.
-   **Returns**: An object with the memory data.

---

*(For a complete list of methods and their detailed parameters, please refer to the `CreatorRpcServer` class in `src/rpc/server.mts`.)*

## Integrating with a Client Application

To use the RPC server in your own application, you'll need a JSON-RPC client library for your programming language of choice.

Here is a basic example of how to interact with the server using `curl`:

```bash
# 1. Load the RISC-V architecture
curl -X POST -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"loadArchitecture","params":{"yamlPath":"../../architecture/RISCV/RV32IMFD.yml"},"id":1}' \
     http://localhost:8080

# 2. Compile a simple program
curl -X POST -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"compileAssembly","params":{"assembly":".text\n main:\n\taddi x1, x0, 5"},"id":2}' \
     http://localhost:8080
º
# 3. Execute one step
curl -X POST -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"executeStep","params":{},"id":3}' \
     http://localhost:8080

# 4. Check the value of register x1
curl -X POST -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"getRegister","params":{"name":"x1"},"id":4}' \
     http://localhost:8080
```