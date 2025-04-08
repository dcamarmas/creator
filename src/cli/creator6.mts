import fs from "node:fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as creator from "../core/core.mjs";
import { reset, step } from "../core/executor/executor.mjs";
import { decode_instruction } from "../core/executor/decoder.mjs";
import process from "node:process";
import { logger } from "../core/utils/creator_logger.mjs";
import readline from "node:readline";
import { instructions } from "../core/compiler/compiler.mjs";

const MAX_INSTRUCTIONS = 9999;
const CLI_VERSION = "0.1.0";
let ACCESSIBLE = false;
// Track the address of the previously executed instruction
let PREVIOUS_PC = "0x0";
// Maximum number of states to keep for unstepping (-1 for unlimited, 0 to disable)
let MAX_STATES_TO_KEEP = 100;
// Stack to store previous states for unstepping
let previousStates: string[] = [];

// Utility functions
function clearConsole() {
    // Use both methods for maximum compatibility across different terminals
    console.clear();
    process.stdout.write("\x1Bc"); // ANSI escape code for clear screen
}

function colorText(text: string, colorCode: string): string {
    return !ACCESSIBLE ? `\x1b[${colorCode}m${text}\x1b[0m` : text;
}

function decodeAndFormatInstruction(pc_value: string) {
    const instruction = creator.dumpAddress(parseInt(pc_value, 16), 4);
    const instructionInt = parseInt(instruction, 16);
    const instructionBinary = instructionInt.toString(2).padStart(32, "0");
    const instructionASM = decode_instruction(instructionBinary);
    const instructionASMParts = instructionASM.instructionExecParts;
    const instructionASMPartsString = instructionASMParts.join(",");

    return {
        pc: pc_value,
        instruction,
        asmString: instructionASMPartsString,
    };
}

function saveCurrentState() {
    if (MAX_STATES_TO_KEEP !== 0) {
        const state = creator.snapshot({ PREVIOUS_PC });
        previousStates.push(state);
        // If we've exceeded the maximum number of states to keep, remove the oldest one
        if (
            MAX_STATES_TO_KEEP > 0 &&
            previousStates.length > MAX_STATES_TO_KEEP
        ) {
            previousStates.shift();
        }
    }
}

function executeStep() {
    // Save current state for unstepping
    saveCurrentState();

    const pc_value = creator.dumpRegister("PC");
    const { instruction, asmString } = decodeAndFormatInstruction(pc_value);

    // Store the current PC as previous PC before executing the step
    PREVIOUS_PC = "0x" + pc_value.toUpperCase();

    const ret = step();
    if (ret.error) {
        //console.error(`Error executing instruction: ${ret.msg}`);
        return { output: ``, completed: true, error: true };
    }

    return {
        output: `0x${pc_value} (0x${instruction}) ${asmString}`,
        completed: creator.status.execution_index === -2,
    };
}

function loadArchitecture(filePath: string, isaExtensions: string[]) {
    const architectureFile = fs.readFileSync(filePath, "utf8");
    const ret = creator.newArchitectureLoad(
        architectureFile,
        false,
        false,
        isaExtensions,
    );
    if (ret.status !== "ok") {
        console.error(`Error loading architecture: ${ret.token}.`);
        process.exit(1);
    }

    // console.log("Architecture loaded successfully.");
}

function loadBinary(filePath: string) {
    if (!filePath) {
        console.error("No binary file specified.");
        return;
    }

    const binaryFile = fs.readFileSync(filePath, "utf8");
    creator.load_binary_file(binaryFile);
    // console.log("Binary loaded successfully.");
}

function loadLibrary(filePath: string) {
    if (!filePath) {
        console.log("No library file specified.");
        return;
    }

    const libraryFile = fs.readFileSync(filePath, "utf8");
    creator.load_library(libraryFile);
    console.log("Library loaded successfully.");
}

function assemble(filePath: string) {
    if (!filePath) {
        console.log("No assembly file specified.");
        return;
    }
    const assemblyFile = fs.readFileSync(filePath, "utf8");
    creator.assembly_compile(assemblyFile);
}

function handleInstructionsCommand() {
    if (instructions.length === 0) {
        console.log("No instructions loaded.");
        return;
    }

    // Get current PC value
    const pc_value = creator.dumpRegister("PC");
    const currentPC = "0x" + pc_value.toUpperCase();

    if (ACCESSIBLE) {
        console.log("Displaying loaded instructions.");
        for (let i = 0; i < instructions.length; i++) {
            const instr = instructions[i];
            const isCurrentInstruction = instr.Address === currentPC;
            const isPreviousInstruction =
                instr.Address === PREVIOUS_PC && instr.Address !== currentPC;
            const hasBreakpoint = instr.Break === true;

            const addressLine = `Address ${instr.Address}${instr.Label ? " with label: " + instr.Label : ""}`;
            const loadedLine = instr.loaded
                ? `Loaded instruction: ${instr.loaded}`
                : "No instruction loaded";
            const userLine = instr.user
                ? `User instruction: ${instr.user}`
                : "";
            let statusInfo = "";

            if (hasBreakpoint) {
                statusInfo += "BREAKPOINT SET. ";
            }

            if (isCurrentInstruction) {
                statusInfo += "NEXT INSTRUCTION TO EXECUTE. ";
            } else if (isPreviousInstruction) {
                statusInfo += "CURRENTLY EXECUTING. ";
            }

            console.log(
                `${statusInfo}${addressLine}. ${loadedLine}. ${userLine}`,
            );
        }
    } else {
        // Tabular format
        console.log(
            "    B | Address | Label      | Loaded Instruction      | User Instruction",
        );
        console.log(
            "   ---|---------|------------|-------------------------|------------------------",
        );

        for (let i = 0; i < instructions.length; i++) {
            const instr = instructions[i];
            const address = instr.Address.padEnd(8);
            const label = (instr.Label || "").padEnd(11);
            const loaded = (instr.loaded || "").padEnd(23);
            const user = instr.user || "";
            const breakpointMark = instr.Break ? "●" : " ";

            // Add an arrow for the current instruction
            const currentMark = instr.Address === currentPC ? "➤" : " ";

            let line = `${currentMark}   ${breakpointMark} | ${address}| ${label}| ${loaded} | ${user}`;

            // Highlight current instruction in green, previous in blue
            if (instr.Address === currentPC) {
                line = colorText(line, "32"); // Green for current instruction
            } else if (instr.Address === PREVIOUS_PC) {
                line = colorText(line, "33"); // Blue for previously executed instruction
            } else if (instr.Break) {
                line = colorText(line, "31"); // Red for breakpoint
            }

            console.log(line);
        }
    }
}

function executeNonInteractive() {
    for (let i = 0; i < MAX_INSTRUCTIONS; i++) {
        const { output, completed, error } = executeStep();
        if (error) {
            console.error("Error during execution.");
            break;
        } else if (completed) {
            console.log("Program executed successfully.");
            break;
        }
        console.log(output);
    }
    const state = creator.getState();
    // save state.msg to file
    fs.writeFileSync("state.txt", state.msg, "utf8");
    console.log("State saved to state.txt");
}

function handleBreakpointCommand(args: string[]) {
    if (args.length < 2) {
        // List all breakpoints if no address is provided
        const breakpoints = instructions.filter(instr => instr.Break === true);

        if (breakpoints.length === 0) {
            console.log("No breakpoints set.");
            return;
        }

        if (ACCESSIBLE) {
            console.log(`${breakpoints.length} breakpoints are currently set:`);
        } else {
            console.log("Current breakpoints:");
        }

        for (const bp of breakpoints) {
            if (ACCESSIBLE) {
                console.log(
                    `Breakpoint at address ${bp.Address}${bp.Label ? ` with label ${bp.Label}` : ""}, instruction: ${bp.loaded}`,
                );
            } else {
                console.log(
                    `  ${bp.Address}${bp.Label ? ` (${bp.Label})` : ""}: ${bp.loaded}`,
                );
            }
        }
        return;
    }

    // Parse address (with or without 0x prefix)
    let address = args[1].toLowerCase();
    if (!address.startsWith("0x")) {
        address = "0x" + address;
    }

    // Find the instruction with the matching address
    const instrIndex = instructions.findIndex(
        instr => instr.Address.toLowerCase() === address,
    );

    if (instrIndex === -1) {
        console.log(`No instruction found at address ${address}`);
        return;
    }

    // Toggle breakpoint
    instructions[instrIndex].Break = !instructions[instrIndex].Break;

    // Update the instructions array used for execution
    const status = instructions[instrIndex].Break ? "set" : "removed";
    console.log(
        `Breakpoint ${status} at ${address}${
            instructions[instrIndex].Label
                ? ` (${instructions[instrIndex].Label})`
                : ""
        }: ${instructions[instrIndex].loaded}`,
    );
}

function handleRunCommand(args: string[], silent = false) {
    // Check if we have a number argument
    const instructionsToRun =
        args.length > 1 ? parseInt(args[1], 10) : MAX_INSTRUCTIONS;

    // Make sure it's a valid number
    if (args.length > 1 && isNaN(instructionsToRun)) {
        console.log("Invalid number of instructions");
        return;
    }

    if (ACCESSIBLE && args.length > 1) {
        console.log(
            `Running up to ${instructionsToRun} instructions or until completion.`,
        );
    }

    let iterations = 0;
    let breakpointHit = false;
    while (
        creator.status.execution_index !== -2 &&
        iterations < instructionsToRun &&
        breakpointHit === false
    ) {
        // Check if the current instruction has a breakpoint before executing
        const pc_value = creator.dumpRegister("PC");
        const currentPC = "0x" + pc_value.toUpperCase();

        // Find if there's a breakpoint at current PC
        for (const instr of instructions) {
            if (instr.Address === currentPC && instr.Break === true) {
                if (ACCESSIBLE) {
                    console.log(
                        `Execution paused: Breakpoint reached at address ${currentPC}`,
                    );
                } else {
                    console.log(
                        colorText("Breakpoint hit at " + currentPC, "31"),
                    );
                }
                breakpointHit = true;
                break;
            }
        }
        if (breakpointHit) {
            break;
        }

        const { output, completed, error } = executeStep();
        if (!silent) {
            console.log(output);
        }
        iterations++;

        if (error) {
            console.error("Error during execution.");
            break;
        } else if (completed) {
            console.log("Program execution completed.");
            break;
        }
    }

    if (ACCESSIBLE && !breakpointHit) {
        console.log(`Executed ${iterations} instructions.`);
    }
}

// Interactive mode functions
function handleBackInTimeCommand() {
    if (previousStates.length === 0) {
        console.log("No previous states available for unstepping.");
        return;
    }

    // loop through the previous states until no more states are remaining, or we hit a breakpoint
    let iterations = 0;
    let breakpointHit = false;
    while (previousStates.length > 0 && iterations < MAX_INSTRUCTIONS) {
        // Get the previous state
        const prevState = previousStates.pop();

        // Restore the previous state
        creator.restore(prevState);

        // Restore the previous PC from the state
        const stateData = JSON.parse(prevState);
        PREVIOUS_PC = stateData.extraData.PREVIOUS_PC;

        // Check if the current instruction has a breakpoint before executing
        const pc_value = creator.dumpRegister("PC");
        const currentPC = "0x" + pc_value.toUpperCase();

        // Find if there's a breakpoint at current PC
        for (const instr of instructions) {
            if (instr.Address === currentPC && instr.Break === true) {
                if (ACCESSIBLE) {
                    console.log(
                        `Execution paused: Breakpoint reached at address ${currentPC}`,
                    );
                } else {
                    console.log(
                        colorText("Breakpoint hit at " + currentPC, "31"),
                    );
                }
                breakpointHit = true;
                break;
            }
        }
        if (breakpointHit) {
            break;
        }

        iterations++;
    }
}

function handleSnapshotCommand(args: string[]) {
    if (args.length > 1) {
        const filename = args[1];
        // Dictionary with the previous PC
        const previousPC = { PREVIOUS_PC };
        // Add the previous PC to the state
        const state = creator.snapshot(previousPC);
        Deno.writeTextFileSync(filename, state);
        console.log(`Snapshot saved to ${filename}`);
    } else {
        const state = creator.snapshot({ PREVIOUS_PC });
        // Timestamp the snapshot
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `snapshot-${timestamp}.json`;
        // Save the snapshot to a file
        Deno.writeTextFileSync(filename, state);
        console.log(`Snapshot saved to ${filename}`);
    }
}

function handleRestoreCommand(args: string[]) {
    if (args.length > 1) {
        // First reset the state
        reset();
        const filename = args[1];
        // const filename = "snapshot.json";
        const state = fs.readFileSync(filename, "utf8");
        creator.restore(state);
        // Restore the previous PC
        const previousPC = JSON.parse(state).extraData.PREVIOUS_PC;
        PREVIOUS_PC = previousPC;
        console.log(`State restored from ${filename}`);
    } else {
        console.log("Usage: restore <filename>");
    }
}

function handleAboutCommand() {
    console.log("CREATOR CLI");
    console.log(`Version: ${CLI_VERSION}`);
    console.log(
        "CREATOR CLI is a command-line interface for the CREATOR simulator.",
    );
    console.log("Copyright (C) 2025 CREATOR Team.");
}

function handleResetCommand() {
    reset();

    // Reset the previous PC tracking
    PREVIOUS_PC = "0x0";

    // Clear the previous states when resetting
    previousStates = [];

    console.log(
        "Program state has been reset. Ready to run from the beginning.",
    );
}

function handleInsnCommand() {
    const pc_value = creator.dumpRegister("PC");
    const { instruction, asmString } = decodeAndFormatInstruction(pc_value);
    console.log(`0x${instruction} ${asmString}`);
}

function handleStepCommand() {
    const { output, completed, error } = executeStep();
    console.log(output);
    if (error) {
        console.error("Error during execution.");
    } else if (completed) {
        console.log("Program execution completed.");
    }
}

function handleUnstepCommand() {
    if (previousStates.length === 0) {
        console.log("No previous states available for unstepping.");
        return;
    }

    // Get the previous state
    const prevState = previousStates.pop();

    // Restore the previous state
    creator.restore(prevState);

    // Restore the previous PC from the state
    const stateData = JSON.parse(prevState);
    PREVIOUS_PC = stateData.extraData.PREVIOUS_PC;

    handleInsnCommand();
}

function handleConfigCommand(args: string[]) {
    if (args.length < 2) {
        console.log("Current configuration:");
        console.log(
            `  max_states: ${MAX_STATES_TO_KEEP === -1 ? "unlimited" : MAX_STATES_TO_KEEP}`,
        );
        return;
    }

    const setting = args[1].toLowerCase();

    if (setting === "max_states" && args.length > 2) {
        const value = parseInt(args[2], 10);
        if (isNaN(value)) {
            console.log(
                "Invalid value for max_states. Must be a number or -1 for unlimited.",
            );
            return;
        }

        MAX_STATES_TO_KEEP = value;
        // Clear the states if we're disabling unstepping
        if (value === 0) {
            previousStates = [];
        }
        console.log(`Set max_states to ${value === -1 ? "unlimited" : value}.`);
    } else {
        console.log("Unknown configuration setting or missing value.");
        console.log("Available settings: max_states [number|-1]");
    }
}
function displayAllRegisters() {
    if (ACCESSIBLE) {
        // Enhanced accessible display format
        console.log("Register values:");
        for (let i = 0; i < 32; i++) {
            const regName = `x${i}`;
            const value = creator.dumpRegister(regName);
            console.log(`Register ${regName} contains value 0x${value}`);
        }
        // Display PC register
        console.log(
            `Program Counter (PC) contains value 0x${creator.dumpRegister("PC")}`,
        );
    } else {
        // Display registers in groups of 4
        for (let row = 0; row < 8; row++) {
            let line = "";
            for (let col = 0; col < 4; col++) {
                const regIndex = row * 4 + col;
                const regName = `x${regIndex}`;
                const value = creator.dumpRegister(regName).padStart(8, "0");
                line += `${col > 0 ? "  " : ""}${regName.padStart(4)}: 0x${value}`;
            }
            console.log(line);
        }

        // Display PC register on its own line
        console.log(`PC: 0x${creator.dumpRegister("PC").padStart(8, "0")}`);
    }
}

function displayMemory(address, count) {
    if (ACCESSIBLE) {
        console.log(
            `Displaying ${count} bytes of memory starting at address 0x${address.toString(16)}`,
        );
    }

    // Display memory contents in rows of 16 bytes
    for (let i = 0; i < count; i += 4) {
        const bytes = creator.dumpAddress(address + i, 4);
        if (!ACCESSIBLE) {
            console.log(
                `0x${(address + i).toString(16).padStart(8, "0")}: 0x${bytes}`,
            );
        } else {
            console.log(
                `Memory address 0x${(address + i).toString(16).padStart(8, "0")} contains value 0x${bytes}`,
            );
        }
    }
}
function handleRegCommand(args: string[]) {
    if (args.length > 1) {
        const regName = args[1];
        if (!ACCESSIBLE) {
            console.log(`${regName}: 0x${creator.dumpRegister(regName)}`);
        } else {
            const value = creator.dumpRegister(regName);
            console.log(`Register ${regName} has value 0x${value}`);
        }
    } else {
        displayAllRegisters();
    }
}

function handleMemCommand(args: string[]) {
    if (args.length > 1) {
        const address = parseInt(args[1], 16);
        const count = args.length > 2 ? parseInt(args[2], 10) : 4;
        displayMemory(address, count);
    } else {
        console.log("Usage: mem <address> [count]");
    }
}

function handleHexViewCommand(args: string[]) {
    if (args.length > 1) {
        const address = parseInt(args[1], 16);
        const count = args.length > 2 ? parseInt(args[2], 10) : 16;
        const bytesPerLine = parseInt(args[3], 10) || 16;
        console.log(creator.dumpMemory(address, count, bytesPerLine));
    } else {
        console.log("Usage: hexview <address> [count]");
    }
}

function handleSaveCommand(args: string[]) {
    const filename = args.length > 1 ? args[1] : "state.txt";

    const state = creator.getState();
    try {
        fs.writeFileSync(filename, state.msg, "utf8");
        console.log(`State saved to ${filename}`);
    } catch (error) {
        console.error(`Error saving state to ${filename}: ${error.message}`);
    }
}

// eslint-disable-next-line max-lines-per-function
function displayHelp() {
    console.log("Available commands:");

    if (ACCESSIBLE) {
        console.log("'step' or 's': Execute a single instruction.");
        console.log("'unstep' or 'u': Undo the last instruction executed.");
        console.log(
            "'run' or 'r' followed by optional number: Execute multiple instructions.",
        );
        console.log(
            "'silent' or 'sr' followed by optional number: Execute multiple instructions silently.",
        );
        console.log(
            "'break' or 'b' followed by address: Toggle a breakpoint at the specified address.",
        );
        console.log(
            "'break' with no arguments: List all currently set breakpoints.",
        );
        console.log(
            "'reg' followed by register name: Display the value of a specific register.",
        );
        console.log(
            "'reg' with no arguments: Display values of all registers.",
        );
        console.log(
            "'mem' followed by address and optional count: Display memory contents.",
        );
        console.log("'insn' or 'i': Show details of the current instruction.");
        console.log("'list' or 'l': Show all loaded instructions.");
        console.log(
            "'save' followed by optional filename: Save execution state to a file.",
        );
        console.log(
            "'snapshot' or 'snap' followed by optional filename: Save a complete snapshot of the current state.",
        );
        console.log(
            "'restore' or 'rest' followed by filename: Restore a previously saved snapshot.",
        );
        console.log("'reset': Reset program to initial state.");
        console.log(
            "'config max_states <n>': Set the maximum number of states to keep for unstepping (-1 for unlimited, 0 to disable).",
        );
        console.log("'help' or 'h': Show this help message.");
        console.log("'about': Show information about the simulator.");
        console.log("'quit' or 'q': Exit the simulator.");
    } else {
        console.log(
            "  step, s                                      - Execute one instruction",
        );
        console.log(
            "  unstep, u                                    - Undo last instruction",
        );
        console.log(
            "  run, r [n]                                   - Run n instructions or until program completes",
        );
        console.log(
            "  silent, sr [n]                               - Run n instructions silently",
        );
        console.log(
            "  break, b [addr]                              - Set/unset breakpoint at address or list all",
        );
        console.log(
            "  reg [name]                                   - Display register(s)",
        );
        console.log(
            "  mem <address> [count]                        - Display memory (count in bytes)",
        );
        console.log(
            "  insn, i                                      - Show current instruction",
        );
        console.log(
            "  list, l                                      - Show all loaded instructions",
        );
        console.log(
            "  hexview <address> [count] [bytesPerLine]     - Hex viewer",
        );
        console.log(
            "  reset, rst                                   - Reset program to initial state",
        );
        console.log(
            "  save, sv [filename]                          - Save current state to file",
        );
        console.log(
            "  snapshot, snap [filename]                    - Save a complete snapshot of current state",
        );
        console.log(
            "  restore, rest <filename>                     - Restore a previously saved snapshot",
        );
        console.log(
            "  config, cfg max_states <n>                   - Set max states to keep for unstepping",
        );
        console.log(
            "  help, h                                      - Show this help message",
        );
        console.log(
            "  about                                        - Show information about the simulator",
        );
        console.log(
            "  quit, q                                      - Quit the simulator",
        );
    }
}

// eslint-disable-next-line max-lines-per-function
function parseArguments() {
    return yargs(hideBin(process.argv))
        .usage("Usage: $0 [options]")
        .option("architecture", {
            alias: "a",
            type: "string",
            description: "Architecture file to load",
            demandOption: true,
        })
        .option("isa", {
            alias: "i",
            type: "array",
            description: "ISA extensions to load (e.g. --isa I M F D)",
            default: [],
        })
        .option("binary", {
            alias: "b",
            type: "string",
            describe: "Binary file",
            nargs: 1,
            default: "",
        })
        .option("library", {
            alias: "l",
            type: "string",
            describe: "Library file",
            nargs: 1,
            default: "",
        })
        .option("assembly", {
            alias: "s",
            type: "string",
            describe: "Assembly file to assemble",
            nargs: 1,
            default: "",
        })
        .option("interactive", {
            alias: "I",
            type: "boolean",
            describe: "Run in interactive mode",
            default: false,
        })
        .option("debug", {
            alias: "v",
            type: "boolean",
            describe: "Enable debug mode",
            default: false,
        })
        .option("reference", {
            alias: "r",
            type: "string",
            describe: "Reference file to load",
            default: "",
        })
        .option("state", {
            alias: "s",
            type: "string",
            describe: "File to save the state",
            default: "",
        })
        .option("accessible", {
            alias: "A",
            type: "boolean",
            describe: "Enable accessible mode for use with screen readers",
            default: false,
        })
        .help().argv;
}
// eslint-disable-next-line max-lines-per-function
function processCommand(cmd: string, args: string[]): boolean {
    switch (cmd) {
        case "step":
        case "s":
        case "":
            handleStepCommand();
            break;
        case "unstep":
        case "u":
            handleUnstepCommand();
            break;
        case "run":
        case "r":
            handleRunCommand(args);
            break;
        case "bit":
            handleBackInTimeCommand();
            break;
        case "silent":
        case "sr":
            handleRunCommand(args, true);
            break;
        case "break":
        case "b":
            handleBreakpointCommand(args);
            break;
        case "reg":
            handleRegCommand(args);
            break;
        case "mem":
            handleMemCommand(args);
            break;
        case "hexview":
            handleHexViewCommand(args);
            break;
        case "list":
        case "l":
            handleInstructionsCommand();
            break;
        case ".":
            handleStepCommand();
            clearConsole();
            handleInstructionsCommand();
            break;
        case "reset":
        case "rst":
            handleResetCommand();
            break;
        case "help":
        case "h":
            displayHelp();
            break;
        case "insn":
        case "i":
            handleInsnCommand();
            break;
        case "save":
        case "sv":
            handleSaveCommand(args);
            break;
        case "snapshot":
        case "snap":
            handleSnapshotCommand(args);
            break;
        case "restore":
        case "rest":
            handleRestoreCommand(args);
            break;
        case "about":
            handleAboutCommand();
            break;
        case "config":
        case "cfg":
            handleConfigCommand(args);
            break;
        case "quit":
        case "q":
            return true;
        default:
            console.log(`Unknown command: ${cmd}`);
            console.log("Type 'help' for available commands.");
    }
    return false;
}

function interactiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "CREATOR> ",
    });

    if (ACCESSIBLE) {
        console.log(
            "Interactive mode enabled. Type 'help' or 'h' for available commands.",
        );
        console.log(
            "You are in accessible mode, with special formatting for screen readers.",
        );
    } else {
        console.log(
            colorText(
                "Interactive mode enabled. Type 'help' for available commands.",
                "32",
            ),
        );
    }

    rl.prompt();

    rl.on("line", line => {
        const args = line.trim().split(/\s+/);
        const cmd = args[0].toLowerCase();

        try {
            if (processCommand(cmd, args)) {
                rl.close();
                return;
            }
        } catch (error) {
            console.error(`Error executing command: ${error.message}`);
        }
        rl.prompt();
    });

    rl.on("close", () => {
        process.exit(0);
    });
}
function main() {
    // Parse command line arguments
    const argv = parseArguments();

    clearConsole();

    if (!argv.debug) {
        logger.disable();
    }

    ACCESSIBLE = argv.accessible;

    if (!ACCESSIBLE) {
        const creatorASCII = ` \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \r\n\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\r\n\u2588\u2588\u2551     \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\r\n\u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\r\n\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551   \u2588\u2588\u2551   \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551  \u2588\u2588\u2551\r\n \u255A\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D   \u255A\u2550\u255D    \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D  \u255A\u2550\u255D\r\n                                                          `;

        console.log(creatorASCII);
    }

    // Load architecture
    loadArchitecture(argv.architecture, argv.isa);
    // If binary file is provided, load it
    if (argv.binary) {
        loadBinary(argv.binary);
    } else {
        if (argv.library) {
            loadLibrary(argv.library);
        }
        if (argv.assembly) {
            assemble(argv.assembly);
        }
    }

    // Run in interactive or non-interactive mode
    if (argv.interactive) {
        interactiveMode();
    } else {
        executeNonInteractive();
        if (argv.reference) {
            const referenceState = fs.readFileSync(argv.reference, "utf8");
            const state = creator.getState();
            const ret = creator.diffStates(referenceState, state.msg);
            if (ret.status === "ok") {
                console.log("States are equal");
            }
            if (ret.status === "different") {
                console.log(ret.diff);
                // exit with error code 1
                process.exit(1);
            }
        }
    }
}

main();
