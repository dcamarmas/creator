import fs from "node:fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as creator from "../core/core.mjs";
import { step } from "../core/executor/executor.mjs";
import { decode_instruction } from "../core/executor/decoder.mjs";
import process from "node:process";
import { logger } from "../core/utils/creator_logger.mjs";
import readline from "node:readline";
import { instructions } from "../core/compiler/compiler.mjs";

const MAX_INSTRUCTIONS = 9999;
const CLI_VERSION = "0.1.0";
let ACCESIBLE = false;
// Track the address of the previously executed instruction
let PREVIOUS_PC = "0x0";

// Utility functions
function clearConsole() {
    // Use both methods for maximum compatibility across different terminals
    console.clear();
    process.stdout.write("\x1Bc"); // ANSI escape code for clear screen
}

function colorText(text: string, colorCode: string): string {
    return !ACCESIBLE ? `\x1b[${colorCode}m${text}\x1b[0m` : text;
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

function executeStep() {
    const pc_value = creator.dumpRegister("PC");
    const { instruction, asmString } = decodeAndFormatInstruction(pc_value);

    // Store the current PC as previous PC before executing the step
    PREVIOUS_PC = "0x" + pc_value.toUpperCase();

    let ret = step();
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
    creator.newArchitectureLoad(architectureFile, false, false, isaExtensions);
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

    if (ACCESIBLE) {
        // Accessible format
        console.log("Displaying loaded instructions:");
        for (let i = 0; i < instructions.length; i++) {
            const instr = instructions[i];
            const isCurrentInstruction = instr.Address === currentPC;
            const isPreviousInstruction =
                instr.Address === PREVIOUS_PC && instr.Address !== currentPC;
            const hasBreakpoint = instr.Break === true;

            let addressLine = `Address ${instr.Address}${instr.Label ? " with label: " + instr.Label : ""}.`;
            let loadedLine = `Loaded instruction: ${instr.loaded}.`;
            let userLine = instr.user ? `User instruction: ${instr.user}.` : "";

            if (hasBreakpoint) {
                addressLine = "BREAKPOINT: " + addressLine;
            }

            if (isCurrentInstruction) {
                console.log("NEXT: " + addressLine, loadedLine, userLine);
            } else if (isPreviousInstruction) {
                console.log("CURRENT: " + addressLine, loadedLine, userLine);
            } else {
                console.log(addressLine, loadedLine, userLine);
            }
        }
    } else {
        // Tabular format
        console.log(
            "B | Address  | Label      | Loaded Instruction      | User Instruction",
        );
        console.log(
            "--|---------|------------|-------------------------|------------------------",
        );

        for (let i = 0; i < instructions.length; i++) {
            const instr = instructions[i];
            const address = instr.Address.padEnd(8);
            const label = (instr.Label || "").padEnd(11);
            const loaded = (instr.loaded || "").padEnd(23);
            const user = instr.user || "";
            const breakpointMark = instr.Break ? "●" : " ";

            let line = ` ${breakpointMark}| ${address}| ${label}| ${loaded} | ${user}`;

            // Highlight current instruction in green, previous in blue
            if (instr.Address === currentPC) {
                line = colorText(line, "32"); // Green for current instruction
            } else if (instr.Address === PREVIOUS_PC) {
                line = colorText(line, "34"); // Blue for previously executed instruction
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
    let state = creator.getState();
    // save state.msg to file
    fs.writeFileSync("state.txt", state.msg, "utf8");
    console.log("State saved to state.txt");
}

function handleBreakpointCommand(args: string[]) {
    if (args.length < 2) {
        // List all breakpoints if no address is provided
        let breakpoints = instructions.filter(instr => instr.Break === true);

        if (breakpoints.length === 0) {
            console.log("No breakpoints set.");
            return;
        }

        console.log("Current breakpoints:");
        for (const bp of breakpoints) {
            console.log(
                `  ${bp.Address}${bp.Label ? ` (${bp.Label})` : ""}: ${bp.loaded}`,
            );
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

async function handleRunCommand(args: string[]) {
    // Check if we have a number argument
    const instructionsToRun =
        args.length > 1 ? parseInt(args[1], 10) : MAX_INSTRUCTIONS;

    // Make sure it's a valid number
    if (args.length > 1 && isNaN(instructionsToRun)) {
        console.log("Invalid number of instructions");
        return;
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
                console.log(colorText("Breakpoint hit at " + currentPC, "31"));
                breakpointHit = true;
                break;
            }
        }
        if (breakpointHit) {
            break;
        }

        const { output, completed, error } = executeStep();
        console.log(output);
        iterations++;

        if (error) {
            console.error("Error during execution.");
            break;
        } else if (completed) {
            console.log("Program execution completed.");
            break;
        }
    }
}

// Interactive mode functions
async function interactiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "CREATOR> ",
    });

    if (ACCESIBLE) {
        console.log(
            colorText(
                "Interactive mode enabled. Type 'h' for available commands.",
                "32",
            ),
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

    rl.on("line", async line => {
        const args = line.trim().split(/\s+/);
        const cmd = args[0].toLowerCase();

        try {
            if (await processCommand(cmd, args)) {
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

async function processCommand(cmd: string, args: string[]): Promise<boolean> {
    switch (cmd) {
        case "step":
        case "s":
        case "":
            await handleStepCommand();
            break;
        case "run":
        case "r":
            await handleRunCommand(args);
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
        case "instructions":
        case "list":
        case "l":
            handleInstructionsCommand();
            break;
        case ".":
            await handleStepCommand();
            clearConsole();
            handleInstructionsCommand();
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
        case "quit":
        case "q":
            return true;
        default:
            console.log(`Unknown command: ${cmd}`);
            console.log("Type 'help' for available commands.");
    }
    return false;
}

function handleInsnCommand() {
    const pc_value = creator.dumpRegister("PC");
    const { instruction, asmString } = decodeAndFormatInstruction(pc_value);
    console.log(`0x${instruction} ${asmString}`);
}

async function handleStepCommand() {
    const { output, completed, error } = executeStep();
    console.log(output);
    if (error) {
        console.error("Error during execution.");
    } else if (completed) {
        console.log("Program execution completed.");
    }
}

function handleRegCommand(args: string[]) {
    if (args.length > 1) {
        const regName = args[1];
        if (!ACCESIBLE) {
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
        const count = args.length > 2 ? parseInt(args[2]) : 4;
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

    let state = creator.getState();
    try {
        fs.writeFileSync(filename, state.msg, "utf8");
        console.log(`State saved to ${filename}`);
    } catch (error) {
        console.error(`Error saving state to ${filename}: ${error.message}`);
    }
}

function displayAllRegisters() {
    if (ACCESIBLE) {
        // Use original display format for accessible mode
        for (let i = 0; i < 32; i++) {
            const regName = `x${i}`;
            const value = creator.dumpRegister(regName);
            console.log(`${regName.padEnd(3)}: 0x${value}`);
        }
        // Display PC register
        console.log(`PC: 0x${creator.dumpRegister("PC")}`);
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
    // Display memory contents in rows of 16 bytes
    for (let i = 0; i < count; i += 4) {
        const bytes = creator.dumpAddress(address + i, 4);
        if (!ACCESIBLE) {
            console.log(
                `0x${(address + i).toString(16).padStart(8, "0")}: 0x${bytes}`,
            );
        } else {
            console.log(
                `Address 0x${(address + i).toString(16).padStart(8, "0")} has value 0x${bytes}`,
            );
        }
    }
}

function displayHelp() {
    console.log("Available commands:");

    if (ACCESIBLE) {
        console.log("'step' or 's' or no command: Step one instruction.");
        console.log(
            "'run' or 'r' followed by optional number: Run n instructions or until program completes.",
        );
        console.log(
            "'break' or 'b' followed by address: Set/unset breakpoint at address. With no argument, shows all breakpoints.",
        );
        console.log(
            "'reg' followed by optional register name: Display register values.",
        );
        console.log(
            "'mem' followed by address and optional byte count: Display memory contents.",
        );
        console.log("'i': Show current instruction.");
        console.log("'instructions' or 'list': Show all loaded instructions.");
        console.log(
            "'save' or 'sv' followed by optional filename: Save current state to file.",
        );
        console.log("'help' or 'h': Show this help message.");
        console.log("'quit' or 'q': Quit the simulator.");
    } else {
        // Standard visually formatted help
        console.log(
            "  step, s                                      - Execute one instruction",
        );
        console.log(
            "  run, r [n]                                   - Run n instructions or until program completes",
        );
        console.log(
            "  break, b [addr]                  - Set/unset breakpoint at address or list all",
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
            "  instructions, list                           - Show all loaded instructions",
        );
        console.log(
            "  hexview <address> [count] [bytesPerLine]     - Hex viewer",
        );
        console.log(
            "  save, sv [filename]                          - Save current state to file",
        );
        console.log(
            "  help, h                                      - Show this help message",
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
            description: "ISA extensions to load",
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
        .option("accesible", {
            alias: "A",
            type: "boolean",
            describe:
                "Disables effects to facilitate usage with screen readers",
            default: false,
        })
        .help().argv;
}

function main() {
    // Parse command line arguments
    const argv = parseArguments();

    clearConsole();

    if (!argv.debug) {
        logger.disable();
    }
    ACCESIBLE = argv.accesible;
    if (!ACCESIBLE) {
        let creatorASCII = ` \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \r\n\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\r\n\u2588\u2588\u2551     \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\r\n\u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\r\n\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551   \u2588\u2588\u2551   \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551  \u2588\u2588\u2551\r\n \u255A\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D   \u255A\u2550\u255D    \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D  \u255A\u2550\u255D\r\n                                                          `;

        console.log(creatorASCII);
    }
    console.log(`CREATOR CLI version: ${CLI_VERSION}`);
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
            let state = creator.getState();
            let ret = creator.diffStates(referenceState, state.msg);
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
