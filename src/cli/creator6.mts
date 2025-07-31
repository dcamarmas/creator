import fs from "node:fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as creator from "../core/core.mjs";
import { step } from "../core/executor/executor.mjs";
import { decode_instruction } from "../core/executor/decoder.mjs";
import process from "node:process";
import { logger } from "../core/utils/creator_logger.mjs";
import readline from "node:readline";
import { instructions } from "../core/assembler/assembler.mjs";
import type { StackTracker, StackFrame } from "@/core/memory/StackTracker.mjs";
import { startTutorial } from "./tutorial.mts";
import yaml from "js-yaml";
import path from "node:path";
import { displayHelp } from "./utils.mts";
import { Buffer } from "node:buffer";
import { sjasmplusAssemble } from "../core/assembler/sjasmplus/deno/sjasmplus.mjs";
import { assembleCreator } from "../core/assembler/creatorAssembler/deno/creatorAssembler.mjs";
import { rasmAssemble } from "../core/assembler/rasm/deno/rasm.mjs";

const MAX_INSTRUCTIONS = 10000000000;
const CLI_VERSION = "0.1.0";
export let ACCESSIBLE = false;
// Track the address of the previously executed instruction
let PREVIOUS_PC = "0x0";
// Maximum number of states to keep for unstepping (-1 for unlimited, 0 to disable)
let MAX_STATES_TO_KEEP = 0;
// Stack to store previous states for unstepping
let previousStates: string[] = [];
// Whether tutorial mode is active
let TUTORIAL_MODE = false;
// Track if a binary file was loaded
let BINARY_LOADED = false;
// Track if execution is currently paused
let EXECUTION_PAUSED = false;
const creatorASCII = `
 ██████╗██████╗ ███████╗ █████╗ ████████╗ ██████╗ ██████╗ 
██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗
██║     ██████╔╝█████╗  ███████║   ██║   ██║   ██║██████╔╝
██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║   ██║██╔══██╗
╚██████╗██║  ██║███████╗██║  ██║   ██║   ╚██████╔╝██║  ██║
 ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
  didaCtic and geneRic assEmbly progrAmming simulaTOR
`;

interface ArgvOptions {
    architecture: string;
    isa: string[];
    bin: string;
    library: string;
    assembly: string;
    compiler: string;
    debug: boolean;
    reference: string;
    state: string;
    accessible: boolean;
    tutorial: boolean;
    config?: string; // Add config file option
}

interface ReturnType {
    status?: string;
    msg?: string;
    token?: string;
    errorcode?: string;
    type?: string;
    update?: string;
    error?: boolean;
    instructionData?: {
        asm?: string;
        machineCode?: string;
        success?: boolean;
    };
}

interface Instruction {
    Address: string;
    Label: string | null;
    loaded: string;
    user: string;
    Break: boolean;
}
interface ConfigType {
    settings: {
        max_states?: number;
        accessible?: boolean;
        keyboard_shortcuts?: boolean; // Add keyboard shortcuts setting
        auto_list_after_shortcuts?: boolean; // Add auto-list setting
    };
    aliases: {
        [key: string]: string;
    };
    shortcuts: {
        [key: string]: string;
    };
}
// Loaded config
export let CONFIG: ConfigType = { settings: {}, aliases: {}, shortcuts: {} };
// Default config path
const CONFIG_PATH = path.join(
    process.env.HOME || ".",
    ".config",
    "creator",
    "config.yml",
);

// Default configuration
const DEFAULT_CONFIG: ConfigType = {
    settings: {
        max_states: 0,
        accessible: false,
        keyboard_shortcuts: true, // Enable keyboard shortcuts by default
        auto_list_after_shortcuts: true, // Disabled by default
    },
    aliases: {},
    shortcuts: {},
};

// Function to load configuration from YAML file
function loadConfiguration(configPath: string = CONFIG_PATH): ConfigType {
    try {
        // Ensure the directory exists
        const configDir = path.dirname(configPath);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        // Check if config file exists, create default if not
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, yaml.dump(DEFAULT_CONFIG), "utf8");
            return DEFAULT_CONFIG;
        }

        // Load and parse the config file
        const configData = fs.readFileSync(configPath, "utf8");
        const config = yaml.load(configData) as ConfigType;

        // Merge with defaults to ensure all fields exist
        return {
            settings: { ...DEFAULT_CONFIG.settings, ...config.settings },
            aliases: { ...DEFAULT_CONFIG.aliases, ...config.aliases },
            shortcuts: { ...DEFAULT_CONFIG.shortcuts, ...config.shortcuts },
        };
    } catch (error) {
        console.error(
            `Error loading configuration: ${(error as Error).message}`,
        );
        return DEFAULT_CONFIG;
    }
}

// Apply configuration settings
function applyConfiguration(config: ConfigType): void {
    if (config.settings.max_states !== undefined) {
        MAX_STATES_TO_KEEP = config.settings.max_states;
    }

    if (config.settings.accessible !== undefined) {
        ACCESSIBLE = config.settings.accessible;
    }

    // If keyboard_shortcuts is undefined, leave the default (true)
    // This maintains backward compatibility with older config files
}

// Helper function to determine if a command should auto-list after execution
function shouldAutoListAfterCommand(cmd: string): boolean {
    // Commands that already provide visual output or don't modify program state
    const noAutoListCommands = [
        "list",
        "help",
        "reg",
        "mem",
        "hexview",
        "stack",
        "snapshot",
        "save",
        "alias",
        "about",
        "clear",
        "pause",
        "run",
    ];

    return !noAutoListCommands.includes(cmd);
}

// Process command with potential alias substitution
function applyAlias(
    cmd: string,
    args: string[],
): { cmd: string; args: string[] } {
    // Check if the command has an alias
    const alias = CONFIG.aliases[cmd];
    if (!alias) {
        return { cmd, args };
    }

    // Parse the alias into command and args
    const aliasTokens = alias.trim().split(/\s+/);
    const aliasCmd = aliasTokens[0];

    // Combine alias args with original args (skipping the original command)
    const aliasArgs = aliasTokens.concat(args.slice(1));

    return { cmd: aliasCmd, args: aliasArgs };
}

function clearConsole() {
    console.clear();
}

function colorText(text: string, colorCode: string): string {
    return !ACCESSIBLE ? `\x1b[${colorCode}m${text}\x1b[0m` : text;
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
    if (creator.status.execution_index === -2) {
        // Stop processing if execution is completed
        return { output: ``, completed: true, error: false };
    }
    // Save current state for unstepping
    saveCurrentState();
    // Get current PC value
    const pc_value = creator.dumpRegister("PC");

    // Store the current PC as previous PC before executing the step
    PREVIOUS_PC = "0x" + pc_value.toUpperCase();

    const ret: ReturnType = step();
    if (ret.error) {
        //console.error(`Error executing instruction: ${ret.msg}`);
        return { output: ``, completed: true, error: true };
    }

    // Get instruction data from the step result
    const instructionData = ret.instructionData;
    let instruction = "unknown";
    let asmString = "unknown";

    if (instructionData) {
        instruction = instructionData.machineCode || "unknown";
        asmString = instructionData.asm || "unknown";
    }

    return {
        output: `0x${pc_value} (0x${instruction}) ${asmString}`,
        completed: creator.status.execution_index === -2,
    };
}

function loadArchitecture(
    filePath: string,
    isaExtensions: string[],
    skipCompiler: boolean = false,
) {
    const architectureFile = fs.readFileSync(filePath, "utf8");
    const ret: ReturnType = creator.newArchitectureLoad(
        architectureFile,
        skipCompiler,
        false,
        isaExtensions,
    );
    if (ret.status !== "ok") {
        console.error(`Error loading architecture: ${ret.token}.`);
        process.exit(1);
    }

    // console.log("Architecture loaded successfully.");
}

/**
 * Loads a binary file from disk into memory.
 * Only works with 8-bit byte memories for direct file compatibility.
 *
 * @param filePath - Path to the binary file
 * @param offset - Starting address offset. Default: 0
 *
 * @throws Error if memory doesn't use 8-bit bytes
 * @throws Error if file cannot be read
 *
 * @example Loading a binary file
 * ```typescript
 * const memory = new Memory({ sizeInBytes: 65536 });
 * memory.loadBinaryFile("program.bin", 0x8000n);
 * ```
 */
function loadBinaryFile(filePath: string, offset = 0n) {
    try {
        // Load the binary file into memory
        const fileData = fs.readFileSync(filePath);
        creator.main_memory.loadROM(new Uint8Array(fileData), offset);

        // Create a new backup of memory that includes the loaded binary data
        // This ensures that reset() will restore to the state with the binary loaded
        creator.updateMainMemoryBackup(creator.main_memory.dump());

        return {
            status: "ok",
            msg: "Binary file loaded successfully",
        };
    } catch (error) {
        return {
            status: "error",
            msg: `Error loading binary file: ${(error as Error).message}`,
        };
    }
}

function loadBin(filePath: string) {
    if (!filePath) {
        console.error("No binary file specified.");
        return;
    }

    // Use the core function that handles binary loading and memory backup
    const ret = loadBinaryFile(filePath);
    if (ret.status !== "ok") {
        console.error(ret.msg);
        process.exit(1);
    }

    // Set the flag to indicate a binary was loaded
    BINARY_LOADED = true;
    console.log(ret.msg);
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
const assembler_map = {
    default: assembleCreator,
    sjasmplus: sjasmplusAssemble,
    rasm: rasmAssemble,
};
async function assemble(filePath: string, compiler?: string) {
    if (!filePath) {
        console.log("No assembly file specified.");
        return;
    }
    // get function from the compiler map, with type safety
    const compilerKey =
        compiler && compiler in assembler_map
            ? (compiler as keyof typeof assembler_map)
            : "default";
    const compilerFunction = assembler_map[compilerKey];
    const assemblyFile = fs.readFileSync(filePath, "utf8");
    const ret: ReturnType = await creator.assembly_compile(
        assemblyFile,
        compilerFunction,
    );
    if (ret && ret.status !== "ok") {
        console.error(ret.msg);
        process.exit(1);
    }
}

function handleInstructionsCommand(limit?: number) {
    if (instructions.length === 0) {
        console.log("No instructions loaded.");
        return;
    }

    // Get current PC value
    const pc_value = creator.dumpRegister("PC");
    const currentPC = "0x" + pc_value.toUpperCase();

    displayInstructionsHeader();

    const count =
        typeof limit === "number" && limit > 0
            ? Math.min(limit, instructions.length)
            : instructions.length;
    for (let i = 0; i < count; i++) {
        displayInstruction(instructions[i], currentPC);
    }
}

function displayInstructionsHeader() {
    if (BINARY_LOADED) {
        console.log(
            "    B | Address | Label      | Decoded Instruction     | Machine Code (hex)",
        );
    } else {
        console.log(
            "    B | Address | Label      | Loaded Instruction      | User Instruction",
        );
    }
    console.log(
        "   ---|---------|------------|-------------------------|------------------------",
    );
}

function displayInstruction(
    instr: Instruction,
    currentPC: string,
    hideLibrary = false,
) {
    const address = instr.Address.padEnd(8);
    const label = (instr.Label || "").padEnd(11);
    let loaded = (instr.loaded || "").padEnd(23);
    const loadedIsBinary = /^[01]+$/.test(loaded);
    const rightColumn = instr.user || "";
    const breakpointMark = instr.Break ? "●" : " ";

    // If the loaded instruction is binary, convert it to hex. This is only
    // needed when loading a library.
    if (loadedIsBinary && !BINARY_LOADED) {
        if (hideLibrary) {
            loaded = "********".padEnd(23);
        } else {
            const instructionHex = parseInt(loaded, 2).toString(16);
            loaded = `0x${instructionHex.padStart(8, "0").toUpperCase().padEnd(21)}`;
        }
    }

    // Add an arrow for the current instruction
    const currentMark = instr.Address === currentPC ? "➤" : " ";

    let line = `${currentMark}   ${breakpointMark} | ${address}| ${label}| ${loaded} | ${rightColumn}`;

    // Highlight instruction
    if (instr.Address === currentPC) {
        line = colorText(line, "32"); // Green for current instruction
    } else if (instr.Address === PREVIOUS_PC) {
        line = colorText(line, "33"); // Yellow for previously executed instruction
    } else if (instr.Break) {
        line = colorText(line, "31"); // Red for breakpoint
    }

    console.log(line);
}

function listBreakpoints() {
    const breakpoints = instructions.filter(instr => instr.Break === true);

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
}

function findInstructionByAddressOrLabel(
    userInput: string,
): { address: string; index: number } | null {
    // Normalize input
    userInput = userInput.trim();
    let address: string;

    // Check if the input already has the '0x' prefix
    if (userInput.startsWith("0x")) {
        // User explicitly provided an address
        address = userInput.toLowerCase();
    } else {
        // First try to find a matching label
        const labelMatch = instructions.find(
            instr => instr.Label === userInput,
        );

        if (labelMatch) {
            // Found a matching label, use its address
            address = labelMatch.Address.toLowerCase();
        } else {
            // No matching label found, check if it's a valid hex string
            const isValidHex = /^[0-9a-fA-F]+$/.test(userInput);

            if (isValidHex) {
                // It's a valid hex string, treat it as a hex address
                address = "0x" + userInput.toLowerCase();
            } else {
                console.log(
                    `No label or valid address found for '${userInput}'`,
                );
                return null;
            }
        }
    }

    // Find the instruction with the matching address
    const index = instructions.findIndex(
        instr => instr.Address.toLowerCase() === address.toLowerCase(),
    );

    if (index === -1) {
        console.log(`No instruction found at address ${address}`);
        return null;
    }

    return { address, index };
}

function toggleBreakpoint(index: number) {
    // Toggle breakpoint
    instructions[index].Break = !instructions[index].Break;

    // Get the instruction after toggling
    const instr = instructions[index];
    const status = instr.Break ? "set" : "removed";

    console.log(
        `Breakpoint ${status} at ${instr.Address}${
            instr.Label ? ` (${instr.Label})` : ""
        }: ${instr.loaded}`,
    );
}

function handleBreakpointCommand(args: string[]) {
    // If no arguments provided, list all breakpoints
    if (args.length < 2) {
        listBreakpoints();
        return;
    }

    // Try to find the instruction
    const result = findInstructionByAddressOrLabel(args[1]);
    if (!result) {
        return; // Error already logged in the find function
    }

    // Toggle the breakpoint
    toggleBreakpoint(result.index);
}

function handlePauseCommand() {
    EXECUTION_PAUSED = !EXECUTION_PAUSED;

    if (!EXECUTION_PAUSED) {
        // If we're resuming, continue execution
        handleRunCommand(["run"], true);
    }
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

    // If we're resuming from pause, make sure to reset the pause flag
    if (EXECUTION_PAUSED) {
        EXECUTION_PAUSED = false;
    }

    // Process instructions in chunks to allow for interruption
    const CHUNK_SIZE = 1000;
    let iterations = 0;
    let breakpointHit = false;

    // Helper function to process a single chunk
    function processChunk() {
        if (
            creator.status.execution_index === -2 ||
            iterations >= instructionsToRun ||
            breakpointHit ||
            EXECUTION_PAUSED
        ) {
            // Stop processing if execution is completed or paused
            return;
        }

        // Process a chunk of instructions
        const chunkEnd = Math.min(iterations + CHUNK_SIZE, instructionsToRun);

        while (
            iterations < chunkEnd &&
            creator.status.execution_index !== -2 &&
            !breakpointHit &&
            !EXECUTION_PAUSED
        ) {
            // Check for breakpoints
            const pc_value = creator.dumpRegister("PC");
            const currentPC = "0x" + pc_value.toUpperCase();

            // Find if there's a breakpoint at current PC
            for (const instr of instructions) {
                if (instr.Address === currentPC && instr.Break === true) {
                    console.log(
                        colorText("Breakpoint hit at " + currentPC, "31"),
                    );
                    breakpointHit = true;
                    break;
                }
            }
            if (breakpointHit) break;

            // Execute a step
            const { output, completed, error } = executeStep();
            if (!silent) {
                console.log(output);
            }
            iterations++;

            if (error) {
                console.error("Error during execution.");
                return;
            } else if (completed) {
                console.log(colorText("Program execution completed.", "32"));
                return;
            }
        }

        // Schedule the next chunk with setTimeout to properly yield to the event loop
        setTimeout(processChunk, 0);
    }

    // Start processing chunks
    processChunk();
}

function handleContinueCommand() {
    if (EXECUTION_PAUSED) {
        // Resume from paused state
        EXECUTION_PAUSED = false;
        console.log("Resuming execution...");
        handleRunCommand(["run"], false);
    } else {
        // If not paused, just step and then run
        handleStepCommand();
        handleRunCommand(["run"], false);
    }
}

// Interactive mode functions
function handleNurCommand() {
    if (previousStates.length === 0) {
        console.log(
            colorText("No previous states available for unstepping.", "31"),
        );
        return;
    }

    // loop through the previous states until no more states are remaining, or we hit a breakpoint
    let iterations = 0;
    let breakpointHit = false;
    while (previousStates.length > 0 && iterations < MAX_INSTRUCTIONS) {
        // Get the previous state
        const prevState = previousStates.pop();
        if (!prevState) break;

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
                console.log(colorText("Breakpoint hit at " + currentPC, "31"));

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
        creator.reset();
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
    clearConsole();

    if (!ACCESSIBLE) {
        // Display the ASCII art with colors
        const coloredASCII = creatorASCII
            .split("\n")
            .map(line => colorText(line, "32"))
            .join("\n");
        console.log(coloredASCII);

        // Create a fancy box for info
        console.log("\n" + "╔" + "═".repeat(60) + "╗");
        console.log("║" + " CREATOR Information".padEnd(60) + "║");
        console.log("╠" + "═".repeat(60) + "╣");

        // Application info
        console.log(
            "║" +
                colorText(" ⚙️  CREATOR CLI Version:", "33") +
                ` ${CLI_VERSION}`.padEnd(36) +
                "║",
        );
        console.log(
            "║" +
                colorText(" 🚀 CREATOR Core Version:", "33") +
                " 6.0.0".padEnd(35) +
                "║",
        );
        console.log(
            "║" +
                colorText(" 🔧 Deno Version:", "33") +
                ` ${Deno.version.deno}`.padEnd(43) +
                "║",
        );

        // System info
        console.log("╠" + "═".repeat(60) + "╣");
        console.log("║" + " System Information".padEnd(60) + "║");
        console.log("╠" + "═".repeat(60) + "╣");
        console.log(
            "║" +
                colorText(" 💻 Platform:", "32") +
                ` ${process.platform}`.padEnd(47) +
                "║",
        );
        console.log(
            "║" +
                colorText(" 🧠 Architecture:", "32") +
                ` ${process.arch}`.padEnd(43) +
                "║",
        );

        // Credits and copyright
        console.log("╠" + "═".repeat(60) + "╣");
        console.log("║" + " About".padEnd(60) + "║");
        console.log("╠" + "═".repeat(60) + "╣");
        console.log(
            "║" +
                " CREATOR is a didactic and generic assembly".padEnd(60) +
                "║",
        );
        console.log(
            "║" + " simulator built by the ARCOS group at the".padEnd(60) + "║",
        );
        console.log(
            "║" + " Carlos III de Madrid University (UC3M)".padEnd(60) + "║",
        );
        console.log(
            "║" +
                colorText(" © Copyright (C) 2025 CREATOR Team", "35").padEnd(
                    69,
                ) +
                "║",
        );
        console.log("╚" + "═".repeat(60) + "╝");
        console.log("\n");
    } else {
        // Accessible version
        console.log(
            "CREATOR - didaCtic and geneRic assEmbly progrAmming simulaTOR",
        );
        console.log("\nCREATOR Information");
        console.log("CREATOR CLI Version: " + CLI_VERSION);
        console.log("CREATOR Core Version: 6.0.0");
        console.log("Deno Version: " + Deno.version.deno);

        console.log("\nSystem Information");
        console.log("Platform: " + process.platform);
        console.log("Architecture: " + process.arch);

        console.log("\nAbout");
        console.log("CREATOR is a didactic and generic assembly simulator");
        console.log("designed for teaching computer architecture concepts.");
        console.log("Copyright (C) 2025 CREATOR Team");
    }
}

function handleResetCommand() {
    creator.reset();

    // Reset the previous PC tracking
    PREVIOUS_PC = "0x0";

    // Clear the previous states when resetting
    previousStates = [];

    console.log(colorText("Program reset.", "32"));
}

function handleInsnCommand() {
    // Get current PC value
    const pc_value = creator.dumpRegister("PC");
    const currentPC = "0x" + pc_value.toUpperCase();

    try {
        // Get the raw instruction from memory at this address
        const rawInstruction = creator.dumpAddress(parseInt(currentPC, 16), 4);
        const instruction = rawInstruction.toUpperCase();

        // Decompile binary instructions
        const instructionInt = parseInt(rawInstruction, 16);
        const instructionBinary = instructionInt.toString(2).padStart(32, "0");
        const decodedInstruction = decode_instruction(instructionBinary);

        let asmString = "unknown";
        if (
            decodedInstruction &&
            typeof decodedInstruction === "object" &&
            "instructionExecParts" in decodedInstruction
        ) {
            const parts = (
                decodedInstruction as unknown as {
                    instructionExecParts: string[];
                }
            ).instructionExecParts;
            if (Array.isArray(parts)) {
                asmString = parts.join(" ");
            }
        }

        console.log(`0x${instruction} ${asmString}`);
    } catch (_error) {
        console.log(`0x${currentPC}: Unable to decode instruction`);
    }
}

function handleStepCommand() {
    const { output, completed, error } = executeStep();
    if (output) {
        console.log(output);
    }
    if (error) {
        console.error(colorText("Error during execution.", "31"));
    } else if (completed) {
        console.log(colorText("Program execution completed.", "32"));
    }
}

function handleUnstepCommand() {
    if (previousStates.length === 0) {
        console.log(
            colorText("No previous states available for unstepping.", "31"),
        );
        return;
    }

    // Get the previous state
    const prevState = previousStates.pop();
    if (!prevState) {
        console.log(colorText("No previous state available.", "31"));
        return;
    }

    // Restore the previous state
    creator.restore(prevState);

    // Restore the previous PC from the state
    const stateData = JSON.parse(prevState);
    PREVIOUS_PC = stateData.extraData.PREVIOUS_PC;

    handleInsnCommand();
}

function handleClearCommand() {
    clearConsole();
}

function displayRegistersByBank(regType: string, format: string = "raw") {
    const registerBank = creator.getRegistersByBank(regType);

    if (!registerBank) {
        console.log(`Register type "${regType}" not found.`);
        return;
    }

    console.log(`${registerBank.name}:`);

    // Display registers in a table format
    const rowCount = Math.ceil(registerBank.elements.length / 4);

    // First, calculate max width for each column
    const maxWidths = [0, 0, 0, 0]; // For up to 4 columns
    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < 4; col++) {
            const index = row * 4 + col;
            if (index < registerBank.elements.length) {
                const reg = registerBank.elements[index];
                const primaryName = reg.name[0];
                const altNames = reg.name.slice(1).join(",");
                const displayName = altNames
                    ? `${primaryName}(${altNames})`
                    : primaryName;
                maxWidths[col] = Math.max(maxWidths[col], displayName.length);
            }
        }
    }

    for (let row = 0; row < rowCount; row++) {
        let line = "";
        for (let col = 0; col < 4; col++) {
            const index = row * 4 + col;
            if (index < registerBank.elements.length) {
                const reg = registerBank.elements[index];
                const primaryName = reg.name[0];
                const altNames = reg.name.slice(1).join(",");

                // Get the register's bit width and calculate hex digits needed
                const nbits = reg.nbits;
                const hexDigits = Math.ceil(nbits / 4);
                let value;

                const rawValue = creator.dumpRegister(
                    primaryName,
                    reg.type === "fp_registers" ? "raw" : "twoscomplement",
                );
                const floatValue = creator.dumpRegister(primaryName, "decimal");

                // Format the value based on the requested format
                if (format === "raw") {
                    value = `0x${rawValue.padStart(hexDigits, "0")}`;
                } else if (format === "decimal" || format === "dec") {
                    value = `${floatValue.toString(10)}`;
                } else {
                    console.log(`Unknown format "${format}"`);
                    return;
                }
                const displayName = altNames
                    ? `${primaryName}(${altNames})`
                    : primaryName;

                const coloredName = colorText(
                    displayName.padEnd(maxWidths[col]),
                    "36",
                );
                line += `${col > 0 ? "  " : ""}${coloredName}: ${`${value}`}`;
            }
        }
        console.log(line);
    }
}

function displayRegisterTypes() {
    const types = creator.getRegisterTypes();

    console.log("Register types:");
    types.forEach((type: string) => {
        console.log(`  ${type}`);
    });

    console.log("\nUse 'reg <type>' to show registers of a specific type");
}

function handleRegCommand(args: string[]) {
    if (args.length < 2) {
        console.log("Usage: reg <type> | reg list | reg <register> [format]");
        console.log("Use 'reg list' to see available register types");
        console.log("Format options: raw (default), number");
        return;
    }

    const cmd = args[1].toLowerCase();
    const format = args[2] || "raw";

    if (cmd === "list") {
        // Display all available register types
        displayRegisterTypes();
    } else {
        // This can either be a request for a specific register bank, or for a specific register
        const regType = args[1].toLowerCase();
        const regTypes = creator.getRegisterTypes();
        if (regTypes.includes(regType)) {
            // Display registers of a specific type
            displayRegistersByBank(cmd, format);
        } else {
            // If not a valid type, check if it's a register name
            const regName = args[1];
            const regInfo = creator.getRegisterInfo(regName);
            if (!regInfo) {
                console.log(`Register "${regName}" not found.`);
                return;
            }

            const rawValue = creator.dumpRegister(
                regName,
                regInfo.type === "fp_registers" ? "raw" : "twoscomplement",
            );
            const floatValue = creator.dumpRegister(regName, "decimal");
            console.log(`${regName}: 0x${rawValue} | ${floatValue}`);
        }
    }
}

function getHintColors(): string[] {
    // Use a highly differentiable color palette
    return [
        "93", // bright yellow
        "92", // bright green
        "96", // bright cyan
        "95", // bright magenta
        "94", // bright blue
        "91", // bright red
        "97", // bright white
        "90", // bright black/gray
    ];
}

function applyHintHighlighting(
    memValue: string,
    hintsInRange: Array<{
        hint: { tag: string; type: string; sizeInBits?: number };
        offset: number;
    }>,
    wordSize: number,
): string {
    let highlightedValue = memValue;
    const colors = getHintColors();

    // Process hints in reverse order to maintain string positions
    for (let k = hintsInRange.length - 1; k >= 0; k--) {
        const { hint, offset } = hintsInRange[k];
        if (!hint.sizeInBits) continue;

        const sizeInBytes = Math.ceil(hint.sizeInBits / 8);
        const startChar = 2 + offset * 2; // Skip "0x" and account for byte position
        const endChar = startChar + sizeInBytes * 2;

        // Only highlight if the hint fits within this word
        if (offset + sizeInBytes <= wordSize) {
            const before = highlightedValue.substring(0, startChar);
            const toHighlight = highlightedValue.substring(startChar, endChar);
            const after = highlightedValue.substring(endChar);

            const colorCode = colors[k % colors.length];
            highlightedValue =
                before + colorText(toHighlight, colorCode) + after;
        }
    }
    return highlightedValue;
}

function displayMemory(address: number, count: number) {
    // Get word size from architecture instead of hardcoding 4 bytes
    const wordSize = creator.main_memory.getWordSize();

    // Display memory contents with hints
    for (let i = 0; i < count; i += wordSize) {
        const currentAddr = address + i;
        const bytes = creator.dumpAddress(currentAddr, wordSize);
        const formattedAddr = `0x${currentAddr.toString(16).padStart(8, "0")}`;

        // Check for hints at this address and collect all hints in this word-sized range
        const hintsInRange: Array<{
            hint: { tag: string; type: string; sizeInBits?: number };
            offset: number;
        }> = [];
        for (let j = 0; j < wordSize; j++) {
            const byteAddr = BigInt(currentAddr + j);
            const hint = creator.main_memory.getHint(byteAddr);
            if (hint) {
                hintsInRange.push({ hint, offset: j });
            }
        }

        let memValue = `0x${bytes}`;
        const hintTexts: string[] = [];

        if (hintsInRange.length > 0) {
            // Sort hints by offset to process them in order
            hintsInRange.sort((a, b) => a.offset - b.offset);

            // Apply highlighting for each hint (if not in accessible mode)
            if (!ACCESSIBLE) {
                memValue = applyHintHighlighting(
                    memValue,
                    hintsInRange,
                    wordSize,
                );
            }

            // Collect all hint descriptions with matching colors
            const colors = getHintColors();
            for (let k = 0; k < hintsInRange.length; k++) {
                const { hint, offset } = hintsInRange[k];
                const tag = hint.tag || "";
                const type = hint.type || "";
                const shortHint = type && tag ? `${tag}:${type}` : type || tag;
                const sizeInfo = hint.sizeInBits
                    ? ` (${hint.sizeInBits}b)`
                    : "";
                const offsetInfo =
                    hintsInRange.length > 1 ? ` @+${offset}` : "";
                const hintText = `${shortHint}${sizeInfo}${offsetInfo}`;

                if (ACCESSIBLE) {
                    hintTexts.push(hintText);
                } else {
                    const colorCode = colors[k % colors.length];
                    hintTexts.push(colorText(hintText, colorCode));
                }
            }
        }

        let output = `${formattedAddr}: ${memValue}`;

        // Add hints if found
        if (hintTexts.length > 0) {
            const allHints = hintTexts.join(", ");
            if (ACCESSIBLE) {
                output += ` // ${allHints}`;
            } else {
                output += ` // ${allHints}`; // Hints already have individual colors
            }
        }

        console.log(output);
    }
}

function handleMemCommand(args: string[]) {
    if (args.length > 1) {
        const address = parseInt(args[1], 16);
        // Default to showing one word of memory
        const wordSize = creator.main_memory.getWordSize();
        const count = args.length > 2 ? parseInt(args[2], 10) : wordSize;
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
        console.log("Usage: hexview <address> [count] [bytesPerLine]");
    }
}

function getFrameColor(frameIndex: number, totalFrames: number): string {
    const colorCodes = ["32", "33", "36", "35", "34"]; // green, yellow, cyan, magenta, blue

    if (frameIndex === totalFrames - 1) {
        return colorCodes[0]; // green for current/top frame
    }

    return colorCodes[(frameIndex + 1) % colorCodes.length];
}

// eslint-disable-next-line max-lines-per-function
function handleStackCommand(args: string[]) {
    const stackTracker = creator.stackTracker as StackTracker; // we do this for the typing

    try {
        // Get the stack frames information
        const stackFrames = stackTracker.getAllFrames();
        const stackHints = stackTracker.getAllHints();
        const totalFrames = stackTracker.length();

        if (totalFrames === 0) {
            console.log("No stack information available.");
            return;
        }

        // 1. Display call stack hierarchy
        console.log(
            ACCESSIBLE ? "Call Stack:" : colorText("Call Stack:", "36"),
        );

        // Visual representation with indentation
        for (const [i, frame] of stackFrames.toReversed().entries()) {
            // Get function name from label or fall back to address
            const functionName = frame.name ?? "";
            const depth = totalFrames - 1 - i;
            const indent = "  ".repeat(depth);
            const frameSize: number = frame.begin - frame.end;
            const prefix = i === totalFrames - 1 ? "►" : "•";

            // Use consistent color mapping for frames
            const color = getFrameColor(i, totalFrames);

            const beginAddress = BigInt(frame.begin);
            const beginAddressHex = `0x${beginAddress.toString(16).toUpperCase()}`;
            const endAddress = BigInt(frame.end);
            const endAddressHex = `0x${endAddress.toString(16).toUpperCase()}`;

            console.log(
                colorText(
                    `${indent}${prefix} ${functionName} (${beginAddressHex} - ${endAddressHex}, ${frameSize} bytes)`,
                    color,
                ),
            );
        }

        // 2. Show stack frame details for the current (top) frame
        const stackTop = stackFrames.at(-1);

        if (stackTop === undefined) {
            // this should never happen, but it's to make the compiler happy
            return;
        }

        console.log(colorText("\nCurrent Frame Details:", "36"));

        // Get function name from label for current function
        const currentFuncName = stackTop.name ?? "";

        console.log(`Function: ${currentFuncName}`);

        const beginAddress = BigInt(stackTop.begin);
        const beginAddressHex = `0x${beginAddress.toString(16).toUpperCase()}`;
        const endAddress = BigInt(stackTop.end);
        const endAddressHex = `0x${endAddress.toString(16).toUpperCase()}`;

        console.log(`Frame: ${beginAddressHex} - ${endAddressHex}`);

        // Calculate frame size
        const frameSize = stackTop.begin - stackTop.end;
        console.log(`Size: ${frameSize} bytes`);

        if (totalFrames > 1) {
            // Get function name from label for caller
            // @ts-ignore: stackFrame should have at least two elements
            const callerFuncName = stackFrames.at(-2).name ?? "";

            const callerBeginAddress = BigInt(stackTop.begin);
            const callerBeginAddressHex = `0x${callerBeginAddress.toString(16).toUpperCase()}`;
            const callerEndAddress = BigInt(stackTop.end);
            const callerEndAddressHex = `0x${callerEndAddress.toString(16).toUpperCase()}`;

            console.log(`Caller: ${callerFuncName}`);
            console.log(
                `Caller frame: ${callerBeginAddressHex} - ${callerEndAddressHex}`,
            );
        }

        // 3. Show stack memory contents
        console.log(colorText("\nStack Memory Contents:", "36"));

        // Calculate the range to display for the entire stack, not just current frame
        // Get current stack pointer (lowest address)
        const startAddressHex = stackTop.end;
        const startAddress = BigInt(startAddressHex);

        // Find the highest address in the stack (from the bottom-most frame or top frame)
        // Use the highest begin_callee from all frames
        let stackEndAddress = startAddress;
        for (const frame of stackFrames) {
            const frameBegin = BigInt(frame.begin);
            if (frameBegin > stackEndAddress) {
                stackEndAddress = frameBegin;
            }
        }

        // If stack is very large, limit to a reasonable number of bytes
        const maxBytesToShow = args.length > 2 ? parseInt(args[2], 10) : 256;
        const actualBytesToShow = stackEndAddress - startAddress;

        // If the actual stack is larger than our limit, reduce the end address
        if (actualBytesToShow > BigInt(maxBytesToShow)) {
            stackEndAddress = startAddress + BigInt(maxBytesToShow);
        }

        // Show memory contents with frame boundary annotations
        const wordSize = creator.main_memory.getWordSize();
        for (
            let addr = startAddress;
            addr < stackEndAddress;
            addr += BigInt(wordSize)
        ) {
            const bytes = creator.dumpAddress(addr, wordSize);
            const valueStr =
                "0x" + bytes.padStart(wordSize * 2, "0").toUpperCase();
            const formattedAddr = `0x${addr.toString(16).padStart(8, "0").toUpperCase()}`;

            // Identify which frame this address belongs to and add annotations
            let annotation = "";
            let frameIndex = -1;

            // Find which frame this address belongs to
            for (const [i, frame] of stackFrames.entries()) {
                if (addr >= BigInt(frame.end) && addr < BigInt(frame.begin)) {
                    frameIndex = i;
                    break;
                }
            }

            // Check if there's a hint for this address
            if (stackHints) {
                const hint = stackHints.get(Number(addr));
                if (hint) {
                    annotation += (annotation ? ", " : "") + `"${hint}"`;
                }
            }

            // Mark stack pointer
            const stackPointer = BigInt(stackTop.end);
            if (addr === stackPointer) {
                annotation += (annotation ? ", " : "") + "← SP";
            }

            // Mark frame boundaries
            for (const frame of stackFrames) {
                // Mark frame start (at the end_callee address, which is the low address/stack pointer)
                if (addr === BigInt(frame.end)) {
                    // Get function name from label
                    annotation +=
                        (annotation ? ", " : "") +
                        `← ${frame.name} frame start`;
                }

                // Mark frame end (at the begin_callee address, which is the high address)
                if (addr === BigInt(frame.begin)) {
                    // Get function name from label
                    annotation +=
                        (annotation ? ", " : "") + `← ${frame.name} frame end`;
                }
            }

            // Color-code by frame using consistent color mapping
            let line = `${formattedAddr}: ${valueStr.padEnd(10)} ${annotation}`;
            if (frameIndex >= 0) {
                // Use the same color mapping as in the call stack
                const colorCode = getFrameColor(frameIndex, totalFrames);
                line = colorText(line, colorCode);
            }

            console.log(line);
        }
    } catch (error) {
        console.error(
            "Error retrieving stack information:",
            (error as Error).message,
        );
    }
}

function handleAliasCommand() {
    if (Object.keys(CONFIG.aliases).length === 0) {
        console.log("No aliases defined.");
        return;
    }

    console.log("Current command aliases:");

    if (ACCESSIBLE) {
        // Simple list format for accessible mode
        Object.entries(CONFIG.aliases).forEach(([alias, command]) => {
            console.log(`'${alias}' > '${command}'`);
        });
    } else {
        // Table format for standard mode
        const maxAliasLength = Math.max(
            ...Object.keys(CONFIG.aliases).map(a => a.length),
        );

        Object.entries(CONFIG.aliases)
            .sort((a, b) => a[0].localeCompare(b[0])) // Sort by alias name
            .forEach(([alias, command]) => {
                const paddedAlias = alias.padEnd(maxAliasLength);
                console.log(`  ${colorText(paddedAlias, "36")} → ${command}`);
            });
    }

    console.log("\nAliases can be defined in your config file at:");
    console.log(CONFIG_PATH);
}

function handleBreakpointAtCurrentPC() {
    // Get current PC value
    const pc_value = creator.dumpRegister("PC");
    const currentPC = "0x" + pc_value.toUpperCase();

    // Find the instruction index with this address
    const index = instructions.findIndex(
        instr => instr.Address.toLowerCase() === currentPC.toLowerCase(),
    );

    if (index === -1) {
        console.log(`No instruction found at current PC: ${currentPC}`);
        return;
    }

    // Toggle the breakpoint
    toggleBreakpoint(index);
}

function handleUntilCommand(args: string[]) {
    if (args.length < 2) {
        console.log("Usage: until <address>");
        return;
    }
    // Basically set a breakpoint, run until it hits it and then remove it
    handleBreakpointCommand(args);
    handleRunCommand(["run"]);
    handleBreakpointAtCurrentPC();
}

function parseArguments(): ArgvOptions {
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
        .option("bin", {
            alias: "b",
            type: "string",
            describe: "Binary file (alternative)",
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
        .option("compiler", {
            alias: "C",
            type: "string",
            describe: "Compiler backend to use (default, sjasmplus, etc)",
            default: "default",
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
        .option("tutorial", {
            alias: "T",
            type: "boolean",
            describe: "Start an interactive tutorial for RISC-V programming",
            default: false,
        })
        .option("config", {
            alias: "c",
            type: "string",
            describe: "Path to configuration file",
            default: CONFIG_PATH,
        })
        .help().argv as ArgvOptions;
}

function processCommand(cmd: string, args: string[]): boolean {
    // Apply alias substitution
    const resolved = applyAlias(cmd, args);
    cmd = resolved.cmd;
    args = resolved.args;
    switch (cmd) {
        case "step":
        case "":
            handleStepCommand();
            break;
        case "unstep":
            handleUnstepCommand();
            break;
        case "run":
            handleRunCommand(args);
            break;
        case "continue":
            handleContinueCommand();
            break;
        case "pause":
            handlePauseCommand();
            break;
        case "nur":
            handleNurCommand();
            break;
        case "silent":
            handleRunCommand(args, true);
            break;
        case "until":
            handleUntilCommand(args);
            break;
        case "break":
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
        case "list": {
            // Support: list [limit] or list --limit N
            let limit: number | undefined;
            if (args.length > 1) {
                const arg = args[1];
                if (arg === "--limit" && args.length > 2) {
                    limit = parseInt(args[2], 10);
                } else if (!isNaN(Number(arg))) {
                    limit = parseInt(arg, 10);
                }
            }
            handleInstructionsCommand(limit);
            break;
        }
        case "reset":
            handleResetCommand();
            break;
        case "clear":
            handleClearCommand();
            break;
        case "help":
            displayHelp();
            break;
        case "insn":
            handleInsnCommand();
            break;
        case "snapshot":
            handleSnapshotCommand(args);
            break;
        case "restore":
            handleRestoreCommand(args);
            break;
        case "about":
            handleAboutCommand();
            break;
        case "alias":
            handleAliasCommand();
            break;
        case "stack":
            handleStackCommand(args);
            break;
        case "quit":
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

    // Determine if keyboard shortcuts are enabled from config
    const keyboardShortcutsEnabled =
        CONFIG.settings.keyboard_shortcuts !== undefined
            ? CONFIG.settings.keyboard_shortcuts
            : true;

    // Determine if auto-list after shortcuts is enabled
    const autoListAfterShortcuts =
        CONFIG.settings.auto_list_after_shortcuts !== undefined
            ? CONFIG.settings.auto_list_after_shortcuts
            : false;

    console.log(colorText("Type 'help' for available commands.", "32"));
    if (ACCESSIBLE) {
        console.log(
            "You are in accessible mode, with special formatting for screen readers.",
        );
    }

    // Setup for raw mode keyboard input if shortcuts are enabled
    if (keyboardShortcutsEnabled) {
        // Configure stdin for raw mode
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        // Handle keypress events
        process.stdin.on("data", (key: Buffer) => {
            const keyStr = key.toString();

            // Skip processing Enter key (CR/LF) as a shortcut
            if (keyStr === "\r" || keyStr === "\n" || keyStr === "\r\n") {
                return; // Let readline handle Enter key
            }

            // Check if the key is a mapped shortcut
            if (CONFIG.shortcuts && CONFIG.shortcuts[keyStr]) {
                // Execute the command
                const cmd = CONFIG.shortcuts[keyStr];

                // Special case handlers for commands that need specific arguments
                if (cmd === "break") {
                    handleBreakpointAtCurrentPC();
                } else if (cmd === "clear") {
                    handleClearCommand();
                } else {
                    processCommand(cmd, [cmd]);
                }

                // Show instruction listing after the command if auto-list is enabled
                if (autoListAfterShortcuts && shouldAutoListAfterCommand(cmd)) {
                    // Clear the current line
                    clearConsole();
                    handleInstructionsCommand();
                }
            }
            // Other keys are passed through to readline
        });
    }

    rl.prompt();

    rl.on("line", line => {
        const args = line.trim().split(/\s+/);
        const cmd = args[0].toLowerCase();

        try {
            if (processCommand(cmd, args)) {
                if (keyboardShortcutsEnabled) {
                    process.stdin.setRawMode(false);
                }
                rl.close();
                return;
            }
        } catch (error) {
            console.error(
                `Error executing command: ${(error as Error).message}`,
            );
        }
        rl.prompt();
    });

    rl.on("close", () => {
        if (keyboardShortcutsEnabled) {
            process.stdin.setRawMode(false);
        }
        process.exit(0);
    });
}

function checkTerminalSize() {
    // Only check if we have access to the terminal size
    if (!process.stdout.columns || !process.stdout.rows) {
        return; // Skip size check if terminal dimensions aren't available
    }

    const { columns, rows } = process.stdout;
    const minColumns = 80; // Reduced from 95
    const minRows = 24; // Reduced from 31

    // Instead of exiting, just warn the user
    if (columns < minColumns || rows < minRows) {
        console.warn(
            `Warning: Terminal size ${columns}x${rows} is smaller than recommended ${minColumns}x${minRows}. ` +
                `Some output may not display correctly.`,
        );
    }
}

async function main() {
    // Check terminal size
    checkTerminalSize();
    // Parse command line arguments
    const argv: ArgvOptions = parseArguments();

    // Load configuration
    CONFIG = loadConfiguration(argv.config);

    // Apply configuration settings
    applyConfiguration(CONFIG);

    // Command line arguments take precedence over config
    if (argv.accessible) {
        ACCESSIBLE = argv.accessible;
    }

    if (!argv.debug) {
        logger.disable();
    }

    TUTORIAL_MODE = argv.tutorial;
    // If we load a binary, we have to skip the compiler
    // Or if we use a compiler which isn't the default one
    const skipCompiler = argv.bin !== "" || argv.compiler !== "default";

    // Load architecture
    loadArchitecture(argv.architecture, argv.isa, skipCompiler);

    // Reset BINARY_LOADED flag before loading any files
    BINARY_LOADED = false;

    // Check if we're in tutorial mode
    if (TUTORIAL_MODE) {
        creator.reset();
        startTutorial();
        return;
    }

    // If binary file is provided, load it
    if (argv.bin) {
        loadBin(argv.bin);
    } else {
        if (argv.library) {
            loadLibrary(argv.library);
        }
        if (argv.assembly) {
            await assemble(argv.assembly, argv.compiler);
        }
    }

    clearConsole();
    if (!ACCESSIBLE) {
        console.log(creatorASCII);
    }
    creator.reset();
    interactiveMode();
}

export {
    handleStepCommand,
    handleRunCommand,
    handleBreakpointCommand,
    handleRegCommand,
    handleMemCommand,
    handleInstructionsCommand,
    handleInsnCommand,
    handleStackCommand,
    handleResetCommand,
    displayHelp,
    clearConsole,
    colorText,
    processCommand,
};

main();
