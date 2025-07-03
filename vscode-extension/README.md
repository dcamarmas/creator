# CREATOR Assembly Debugger

A VSCode extension for debugging assembly programs using the CREATOR emulator. This extension provides full debugging capabilities including breakpoints, step execution, register inspection, and memory viewing.

## Features

- **Full Debugging Support**: Step through assembly code line by line
- **Breakpoint Management**: Set and clear breakpoints in assembly source
- **Register Inspection**: View and monitor register values in real-time
- **Memory Viewing**: Inspect memory contents around the program counter
- **Multi-Architecture Support**: RISC-V, MIPS, Z80, and more
- **Syntax Highlighting**: Complete syntax highlighting for assembly languages
- **Source Mapping**: Maps execution state back to original source lines

## Prerequisites

1. **CREATOR RPC Server**: The extension requires the CREATOR RPC server to be running
2. **Deno Runtime**: Required to run the CREATOR RPC server

## Setup

1. **Start the CREATOR RPC Server**:

    ```bash
    cd rpc-server
    deno run --allow-net --allow-read --allow-env server.mts
    ```

    The server will start on `http://localhost:8080` by default.

2. **Install the Extension**: Install this extension in VSCode

3. **Open an Assembly File**: Open any `.s`, `.asm`, or `.S` file

## Usage

### Starting a Debug Session

1. Open an assembly file (`.s`, `.asm`, `.S`)
2. Click the **Start CREATOR Debugging** button in the editor toolbar
3. Or use the command palette: `Creator Debugger: Start CREATOR Debugging`

### Debugging Controls

- **Step Over**: Execute one instruction (`F10`)
- **Continue**: Run until breakpoint or completion (`F5`)
- **Reset**: Reset the program to the beginning
- **Stop**: Stop the debugging session

### Setting Breakpoints

- Click in the gutter next to any line with executable code
- Breakpoints are synchronized with the CREATOR emulator

### Debug Views

The extension provides three debug views in the Debug panel:

1. **Registers**: Shows all processor registers and their current values
2. **Memory**: Displays memory contents around the program counter
3. **Instructions**: Lists all compiled instructions with execution status

### Variables and Scopes

In the Variables view, you can inspect:

- **Registers**: All processor registers with their current values
- **Memory**: Memory contents around the current execution point

## Configuration

The extension can be configured via VSCode settings:

```json
{
    "creator-debugger.rpcServerUrl": "http://localhost:8080",
    "creator-debugger.defaultArchitecture": "RISC-V",
    "creator-debugger.autoStartServer": false
}
```

### Settings

- `creator-debugger.rpcServerUrl`: URL of the CREATOR RPC server (default: `http://localhost:8080`)
- `creator-debugger.defaultArchitecture`: Default target architecture (RISC-V, MIPS, Z80, 6502, PowerPC)
- `creator-debugger.autoStartServer`: Automatically start CREATOR RPC server if not running

## Architecture Support

The extension supports multiple processor architectures:

- **RISC-V**: RV32I, RV32M, RV32F, RV32D extensions
- **MIPS**: MIPS32 instruction set
- **Z80**: Classic Z80 processor
- **6502**: MOS 6502 processor
- **PowerPC**: PowerPC instruction set

## Sample Assembly Program

Create a new file `test.s` with the following RISC-V assembly:

```assembly
.text
main:
    addi x1, x0, 10      # Load 10 into x1
    addi x2, x0, 20      # Load 20 into x2
    add x3, x1, x2       # x3 = x1 + x2 (should be 30)
    sub x4, x3, x1       # x4 = x3 - x1 (should be 20)
    nop                  # No operation
```

## Debugging Workflow

1. **Load**: The extension loads your assembly file and compiles it using CREATOR
2. **Map**: Source lines are mapped to compiled instructions for debugging
3. **Execute**: Step through instructions while monitoring registers and memory
4. **Inspect**: Use breakpoints to pause execution and examine program state

## Troubleshooting

### RPC Server Not Running

If you see "CREATOR RPC server is not running", make sure to start the server:

```bash
cd rpc-server
deno run --allow-net --allow-read --allow-env server.mts
```

### Compilation Errors

- Check your assembly syntax
- Ensure you're using the correct architecture
- Verify that required directives like `.text` are present

### Breakpoints Not Working

- Ensure breakpoints are set on lines with executable instructions
- Avoid setting breakpoints on comments, directives, or empty lines

## Extension Development

To develop or modify this extension:

1. Clone the repository
2. Install dependencies: `npm install`
3. Compile TypeScript: `npm run compile`
4. Press `F5` to launch Extension Development Host

## RPC API Reference

The extension communicates with CREATOR via JSON RPC. Key methods include:

- `loadArchitecture`: Load processor architecture
- `compileAssembly`: Compile assembly source code
- `executeStep`: Execute single instruction
- `getExecutionContext`: Get current execution state
- `setBreakpoint`: Set/clear breakpoints
- `getRegisters`: Get register values
- `getMemory`: Read memory contents

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This extension is part of the CREATOR project and follows the same license terms.

## Support

For issues and questions:

- Check the [CREATOR documentation](https://creator.herokuapp.com)
- Open an issue on the GitHub repository
- Contact the CREATOR development team
