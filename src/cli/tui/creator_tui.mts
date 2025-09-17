import process from "node:process";
import readline from "node:readline";
import fs from "node:fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as creator from "../../core/core.mjs";
import { step } from "../../core/executor/executor.mjs";
import { decode_instruction } from "../../core/executor/decoder.mjs";
import { logger } from "../../core/utils/creator_logger.mjs";
import { instructions } from "../../core/assembler/assembler.mjs";
import yaml from "js-yaml";
import path from "node:path";
import { displayHelp } from "../utils.mts";
import type { StackTracker } from "@/core/memory/StackTracker.mjs";

// --- Constants and Configuration ---
const MAX_INSTRUCTIONS = 10000000000;
const CLI_VERSION = "0.1.0";
const TUI_VERSION = "0.1.0";
let MAX_STATES_TO_KEEP = 10; // Maximum number of states to keep for unstepping
let PREVIOUS_PC = "0x0";
let BINARY_LOADED = false;
let EXECUTION_PAUSED = false;
let previousStates: string[] = [];
// Anti-flicker settings
const RENDER_THROTTLE_MS = 50; // Minimum time between renders
let lastRenderTime = 0;
let pendingRender = false;
export let CONFIG: ConfigType = { settings: {}, aliases: {}, shortcuts: {} };

const CONFIG_PATH = path.join(
    process.env.HOME || ".",
    ".config",
    "creator",
    "config.yml",
);
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

// --- Anti-Flicker Rendering ---
// Screen buffer to collect output before rendering
let screenBuffer: string[] = [];

// Clear the terminal using ANSI escape codes
function clearScreen(): void {
    // Use ANSI escape sequence to clear screen and move cursor to home position
    process.stdout.write("\x1b[2J\x1b[0;0H");
}

// Add a line to the screen buffer
function bufferLine(line: string): void {
    screenBuffer.push(line);
}

// Flush the screen buffer to stdout
function flushBuffer(): void {
    clearScreen();
    if (screenBuffer.length > 0) {
        process.stdout.write(screenBuffer.join("\n") + "\n");
        screenBuffer = [];
    }
}

// Throttled render function to prevent too many redraws
function throttledRender(): void {
    const now = Date.now();

    // If we've rendered recently, schedule a future render
    if (now - lastRenderTime < RENDER_THROTTLE_MS) {
        if (!pendingRender) {
            pendingRender = true;
            setTimeout(() => {
                pendingRender = false;
                lastRenderTime = Date.now();
                actualRender();
            }, RENDER_THROTTLE_MS);
        }
        return;
    }

    // Otherwise render immediately
    lastRenderTime = now;
    actualRender();
}

// The actual render implementation
function actualRender(): void {
    // Clear buffer before rendering
    screenBuffer = [];

    const terminalWidth = process.stdout.columns;
    const terminalHeight = process.stdout.rows;
    const view = views[currentView];

    let sidebarWidth = Math.floor(terminalWidth * SIDEBAR_WIDTH_PERCENT);
    sidebarWidth = Math.max(MIN_SIDEBAR_WIDTH, sidebarWidth);
    let contentWidth = terminalWidth - sidebarWidth - SEPARATOR.length;

    if (contentWidth < MIN_CONTENT_WIDTH) {
        contentWidth = MIN_CONTENT_WIDTH;
        sidebarWidth = terminalWidth - contentWidth - SEPARATOR.length;
        sidebarWidth = Math.max(0, sidebarWidth);
    }

    if (sidebarWidth <= 0) {
        renderSingleColumnToBuffer();
        flushBuffer();
        return;
    }

    // Header (3 lines)
    bufferLine(
        `CREATOR TUI v${TUI_VERSION} (${terminalWidth}x${terminalHeight})`,
    );
    bufferLine(
        "Use Arrow Keys to navigate, Enter to select, Tab to switch focus. Ctrl+C to exit.",
    );
    bufferLine("Press ':' to enter command mode.");

    // Show which area is focused
    const sidebarLabel = sidebarFocused ? "[SIDEBAR]" : "Sidebar";
    const contentLabel = !sidebarFocused
        ? `[${view.title.toUpperCase()}]`
        : view.title;
    bufferLine(
        `${sidebarLabel.padEnd(sidebarWidth)}${SEPARATOR}${contentLabel}`,
    );

    const separatorLine =
        "-".repeat(sidebarWidth) +
        SEPARATOR.replace(/ /g, "-") +
        "-".repeat(contentWidth);
    bufferLine(separatorLine);

    // Available space for content (minus headers and footers)
    const availableHeight = terminalHeight - 8; // Extra line for command mode

    // Get content for the current view
    const contentLines: string[] = [];

    if (view.content) {
        contentLines.push(...view.content(contentWidth));
        contentLines.push("");
        contentLines.push("--- Options ---");
    }

    // Add options
    view.options.forEach((option, index) => {
        const prefix =
            !sidebarFocused && index === selectedOption ? " > " : "   ";
        contentLines.push(`${prefix}${option}`);
    });

    // Fill remaining space with empty lines
    while (contentLines.length < availableHeight) {
        contentLines.push("");
    }

    // Truncate if there are too many lines
    if (contentLines.length > availableHeight) {
        contentLines.splice(availableHeight);
    }

    const sidebarLines = getSidebarLines(availableHeight);

    for (let i = 0; i < availableHeight; i++) {
        const sbLine = (sidebarLines[i] || "").padEnd(sidebarWidth);
        const ctLine = (contentLines[i] || "").padEnd(contentWidth);
        bufferLine(`${sbLine}${SEPARATOR}${ctLine}`);
    }

    bufferLine(separatorLine);

    // Flush all buffered content to the screen
    flushBuffer();

    // Display command line or command error (direct write for cursor positioning)
    if (commandMode) {
        process.stdout.write("CREATOR> " + currentCommand);
    } else if (lastCommandError) {
        process.stdout.write(lastCommandError);
    }
}

// Buffered version of single column render
function renderSingleColumnToBuffer() {
    const terminalWidth = process.stdout.columns;
    const terminalHeight = process.stdout.rows;
    const view = views[currentView];

    bufferLine(`CREATOR TUI (${terminalWidth}x${terminalHeight})`);
    bufferLine("Use Arrow Keys/Enter. Ctrl+C exit. Press ':' for commands.");
    bufferLine("======================================");

    // Calculate available height for content
    const headerLines = 3;
    const footerLines = 3; // Extra line for command mode
    const optionsLines = view.options.length;
    const availableHeight =
        terminalHeight - headerLines - footerLines - optionsLines - 3; // 3 for margins

    bufferLine(`\n--- ${view.title} ---`);

    if (view.content) {
        const contentLines = view.content(terminalWidth);
        contentLines.forEach(line => bufferLine(line));

        // Fill remaining space with empty lines
        const emptyLines = Math.max(0, availableHeight - contentLines.length);
        for (let i = 0; i < emptyLines; i++) {
            bufferLine("");
        }

        bufferLine("\n--- Options ---");
    }

    view.options.forEach((option, index) => {
        const prefix = index === selectedOption ? " > " : "   ";
        bufferLine(`${prefix}${option}`);
    });
    bufferLine("\n======================================");
}

// Replace the original render function with the throttled version
function render() {
    throttledRender();
}

// --- TUI State ---
// View management
type ViewType = "instructions" | "registers" | "memory" | "stack" | "help";
let currentView: ViewType = "instructions";
let selectedOption = 0;
let sidebarFocused = false;
let sidebarSelection = 0;
const SIDEBAR_WIDTH_PERCENT = 0.15;
const MIN_SIDEBAR_WIDTH = 15;
const MIN_CONTENT_WIDTH = 30;
const SEPARATOR = " | ";

// Register view state
let currentRegisterBankIndex = 0;

// Command mode state
let commandMode = false;
let currentCommand = "";
const commandHistory: string[] = [];
let commandHistoryIndex = -1;
let lastCommandError = "";

// Content display state
let scrollOffset = 0;
let memoryViewAddress = 0;
const MEMORY_VIEW_ROWS = 16;

// --- View Definitions ---
const views = {
    instructions: {
        title: "Instructions View",
        options: ["Step", "Run", "Set Breakpoint Here"],
        actions: [
            () => executeStep(),
            () => executeRun(),
            () => toggleBreakpointAtCurrent(),
        ],
        content: width => {
            return getInstructionsContent(width);
        },
    },
    registers: {
        title: "Registers View",
        options: ["Next Bank", "Previous Bank"],
        actions: [
            () => {
                const registerTypes = creator.getRegisterTypes();
                currentRegisterBankIndex =
                    (currentRegisterBankIndex + 1) % registerTypes.length;
                render();
            },
            () => {
                const registerTypes = creator.getRegisterTypes();
                currentRegisterBankIndex =
                    (currentRegisterBankIndex - 1 + registerTypes.length) %
                    registerTypes.length;
                render();
            },
        ],
        content: width => {
            return getRegistersContent(width);
        },
    },
    memory: {
        title: "Memory View",
        options: ["Address +16", "Address -16"],
        actions: [
            () => {
                memoryViewAddress += 16;
            },
            () => {
                memoryViewAddress = Math.max(0, memoryViewAddress - 16);
            },
        ],
        content: width => {
            return getMemoryContent(width, memoryViewAddress);
        },
    },
    stack: {
        title: "Stack View",
        options: [],
        actions: [],
        content: width => {
            return getStackContent(width);
        },
    },
    help: {
        title: "Help",
        options: [],
        actions: [],
        content: width => {
            return getHelpContent(width);
        },
    },
};

// --- Helper Functions ---
function getExecutionStatus(): string {
    if (creator.status.execution_index === -2) {
        return "Completed";
    } else if (EXECUTION_PAUSED) {
        return "Paused";
    } else {
        return "Ready";
    }
}

function colorText(text: string, colorCode: string): string {
    return `\x1b[${colorCode}m${text}\x1b[0m`;
}

function executeStep() {
    saveCurrentState();

    const pc_value = creator.dumpRegister("PC");
    const { instruction, asmString } = decodeAndFormatInstruction(pc_value);

    PREVIOUS_PC = "0x" + pc_value.toUpperCase();

    const ret: ReturnType = step();
    if (ret.error) {
        lastCommandError = `Error executing instruction: ${ret.msg}`;
        setTimeout(() => {
            lastCommandError = "";
            render();
        }, 3000);
    }

    render();
}

function saveCurrentState() {
    if (MAX_STATES_TO_KEEP !== 0) {
        const state = creator.snapshot({ PREVIOUS_PC });
        previousStates.push(state);
        if (
            MAX_STATES_TO_KEEP > 0 &&
            previousStates.length > MAX_STATES_TO_KEEP
        ) {
            previousStates.shift();
        }
    }
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

function executeRun() {
    // Set a reasonable chunk size to avoid blocking the UI
    const CHUNK_SIZE = 100;
    let iterations = 0;
    let breakpointHit = false;

    // Reset pause state
    EXECUTION_PAUSED = false;

    function executeChunk() {
        if (
            creator.status.execution_index === -2 ||
            breakpointHit ||
            EXECUTION_PAUSED
        ) {
            render();
            return;
        }

        let i = 0;
        while (
            i < CHUNK_SIZE &&
            creator.status.execution_index !== -2 &&
            !breakpointHit &&
            !EXECUTION_PAUSED
        ) {
            // Check for breakpoints
            const pc_value = creator.dumpRegister("PC");
            const currentPC = "0x" + pc_value.toUpperCase();

            for (const instr of instructions) {
                if (instr.Address === currentPC && instr.Break === true) {
                    breakpointHit = true;
                    lastCommandError = `Breakpoint hit at ${currentPC}`;
                    setTimeout(() => {
                        lastCommandError = "";
                        render();
                    }, 3000);
                    break;
                }
            }

            if (breakpointHit) break;

            saveCurrentState();
            PREVIOUS_PC = currentPC;

            const ret: ReturnType = step();
            if (ret.error) {
                lastCommandError = `Error during execution: ${ret.msg}`;
                setTimeout(() => {
                    lastCommandError = "";
                    render();
                }, 3000);
                break;
            }

            iterations++;
            i++;
        }

        // Update the UI - but throttle renders during rapid execution
        const now = Date.now();
        if (now - lastRenderTime > 200) {
            // Less frequent updates during run
            render();
        }

        // Schedule next chunk if needed
        if (
            creator.status.execution_index !== -2 &&
            !breakpointHit &&
            !EXECUTION_PAUSED
        ) {
            setTimeout(executeChunk, 10);
        } else {
            // Final render when finished
            render();
        }
    }

    // Start execution
    executeChunk();
}

function toggleBreakpointAtCurrent() {
    const pc_value = creator.dumpRegister("PC");
    const currentPC = "0x" + pc_value.toUpperCase();

    const index = instructions.findIndex(
        instr => instr.Address.toLowerCase() === currentPC.toLowerCase(),
    );

    if (index === -1) {
        lastCommandError = `No instruction found at current PC: ${currentPC}`;
        setTimeout(() => {
            lastCommandError = "";
            render();
        }, 3000);
        return;
    }

    instructions[index].Break = !instructions[index].Break;
    const status = instructions[index].Break ? "set" : "removed";

    lastCommandError = `Breakpoint ${status} at ${currentPC}`;
    setTimeout(() => {
        lastCommandError = "";
        render();
    }, 2000);

    render();
}

// Find an instruction by address or label
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
                lastCommandError = `No label or valid address found for '${userInput}'`;
                setTimeout(() => {
                    lastCommandError = "";
                    render();
                }, 3000);
                return null;
            }
        }
    }

    // Find the instruction with the matching address
    const index = instructions.findIndex(
        instr => instr.Address.toLowerCase() === address.toLowerCase(),
    );

    if (index === -1) {
        lastCommandError = `No instruction found at address ${address}`;
        setTimeout(() => {
            lastCommandError = "";
            render();
        }, 3000);
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

    lastCommandError = `Breakpoint ${status} at ${instr.Address}${
        instr.Label ? ` (${instr.Label})` : ""
    }: ${instr.loaded}`;

    setTimeout(() => {
        lastCommandError = "";
        render();
    }, 3000);
}

function listBreakpoints() {
    const breakpoints = instructions.filter(instr => instr.Break === true);

    if (breakpoints.length === 0) {
        lastCommandError = "No breakpoints set.";
        setTimeout(() => {
            lastCommandError = "";
            render();
        }, 3000);
        return;
    }

    // Switch to instructions view to show the breakpoints
    currentView = "instructions";
    selectedOption = 0;
    render();

    // Format a message about breakpoints
    let message = "Breakpoints: ";
    breakpoints.forEach((bp, index) => {
        if (index > 0) message += ", ";
        message += `${bp.Address}${bp.Label ? ` (${bp.Label})` : ""}`;
        if (index >= 2 && breakpoints.length > 3) {
            message += `, and ${breakpoints.length - 3} more...`;
        }
    });

    lastCommandError = message;
    setTimeout(() => {
        lastCommandError = "";
        render();
    }, 5000);
}

// Replace the existing handleBreakpointCommand with this enhanced version
function handleBreakpointCommand(address: string) {
    // If no arguments provided, list all breakpoints
    if (!address) {
        listBreakpoints();
        return;
    }

    // Try to find the instruction
    const result = findInstructionByAddressOrLabel(address);
    if (!result) {
        return; // Error already logged in the find function
    }

    // Toggle the breakpoint
    toggleBreakpoint(result.index);

    // Make sure to refresh the display
    render();
}

// --- Content Generation Functions ---
function getInstructionsContent(width: number): string[] {
    const lines: string[] = [];

    if (instructions.length === 0) {
        lines.push("No instructions loaded.");
        return lines;
    }

    const pc_value = creator.dumpRegister("PC");
    const currentPC = "0x" + pc_value.toUpperCase();

    // Header
    if (width < 60) {
        lines.push("Addr | Instruction");
        lines.push("-----|------------");
    } else if (BINARY_LOADED) {
        lines.push(
            "B | Address | Label      | Instruction          | Machine Code",
        );
        lines.push(
            "--|---------|------------|---------------------|------------",
        );
    } else {
        lines.push(
            "B | Address | Label      | Loaded Instruction   | User Instruction",
        );
        lines.push(
            "--|---------|------------|---------------------|---------------",
        );
    }

    // Find current instruction index to center the view
    const currentIndex = instructions.findIndex(
        instr => instr.Address.toLowerCase() === currentPC.toLowerCase(),
    );

    // Calculate available height for displaying instructions
    // Reserve more space for options to ensure they're always visible
    const reservedSpace = 10; // Increased from 8 to give more room for options
    const availableHeight = Math.max(
        5,
        process.stdout.rows - reservedSpace - 8,
    ); // 8 for TUI header/footer

    // Adjust scroll offset to keep current instruction visible
    if (currentIndex !== -1) {
        if (currentIndex < scrollOffset) {
            scrollOffset = Math.max(0, currentIndex - 2);
        } else if (currentIndex >= scrollOffset + availableHeight) {
            scrollOffset = Math.max(0, currentIndex - availableHeight + 3);
        }

        // Make sure we don't scroll past the end
        const maxScrollOffset = Math.max(
            0,
            instructions.length - availableHeight,
        );
        if (scrollOffset > maxScrollOffset) {
            scrollOffset = maxScrollOffset;
        }
    }

    // Display instructions with scrolling - limit to available height
    const displayedInstructions = instructions.slice(
        scrollOffset,
        scrollOffset + availableHeight,
    );

    // Add scroll indicators if needed
    if (scrollOffset > 0) {
        lines[2] = colorText("↑ More instructions above ↑", "36");
    }

    for (const instr of displayedInstructions) {
        if (width < 60) {
            // Compact view
            const currentMark = instr.Address === currentPC ? "➤" : " ";
            const breakMark = instr.Break ? "●" : " ";
            const addr = instr.Address.slice(2, 10); // Remove 0x prefix
            const loaded = instr.loaded || "";

            let line = `${currentMark}${breakMark}${addr}| ${loaded}`;

            if (instr.Address === currentPC) {
                line = colorText(line, "32"); // Green for current
            } else if (instr.Break) {
                line = colorText(line, "31"); // Red for breakpoint
            }

            lines.push(line);
        } else {
            // Full view
            const currentMark = instr.Address === currentPC ? "➤" : " ";
            const breakMark = instr.Break ? "●" : " ";
            const address = instr.Address.padEnd(8);
            const label = (instr.Label || "").padEnd(11);
            let loaded = (instr.loaded || "").padEnd(20);
            let rightColumn = instr.user || "";

            // When binary is loaded, display machine code in hex
            if (BINARY_LOADED) {
                try {
                    const rawInstruction = creator.dumpAddress(
                        parseInt(instr.Address, 16),
                        4,
                    );
                    rightColumn = `0x${rawInstruction.toUpperCase()}`;

                    const instructionInt = parseInt(rawInstruction, 16);
                    const instructionBinary = instructionInt
                        .toString(2)
                        .padStart(32, "0");
                    const decodedInstruction =
                        decode_instruction(instructionBinary);

                    if (
                        decodedInstruction &&
                        decodedInstruction.instructionExecParts
                    ) {
                        const decompiled =
                            decodedInstruction.instructionExecParts.join(" ");
                        loaded = decompiled.padEnd(20);
                    }
                } catch (error) {
                    loaded = "???".padEnd(20);
                    const rawInstruction = creator.dumpAddress(
                        parseInt(instr.Address, 16),
                        4,
                    );
                    rightColumn = `0x${rawInstruction.toUpperCase()}`;
                }
            }

            let line = `${currentMark}${breakMark}| ${address}| ${label}| ${loaded} | ${rightColumn}`;

            if (instr.Address === currentPC) {
                line = colorText(line, "32"); // Green for current
            } else if (instr.Address === PREVIOUS_PC) {
                line = colorText(line, "33"); // Yellow for previous
            } else if (instr.Break) {
                line = colorText(line, "31"); // Red for breakpoint
            }

            lines.push(line);
        }
    }

    // Add indicator if there are more instructions below
    if (scrollOffset + displayedInstructions.length < instructions.length) {
        lines.push(colorText("↓ More instructions below ↓", "36"));
    }

    return lines;
}

function getRegistersContent(width: number): string[] {
    const lines: string[] = [];
    const registerTypes = creator.getRegisterTypes();

    if (registerTypes.length === 0) {
        lines.push("No register banks available.");
        return lines;
    }

    // Make sure our index is valid
    if (currentRegisterBankIndex >= registerTypes.length) {
        currentRegisterBankIndex = 0;
    }

    // Navigation header showing which bank is selected
    lines.push(colorText("Register Banks:", "36"));

    // Display bank selection indicator
    let bankSelector = "";
    for (let i = 0; i < registerTypes.length; i++) {
        const bank = creator.getRegistersByBank(registerTypes[i]);
        if (!bank) continue;

        if (i === currentRegisterBankIndex) {
            bankSelector += colorText(`[${bank.name}] `, "32"); // Green for selected
        } else {
            bankSelector += `${bank.name} `;
        }
    }
    lines.push(bankSelector);
    lines.push("");

    // Get the currently selected register bank
    const regType = registerTypes[currentRegisterBankIndex];
    const registerBank = creator.getRegistersByBank(regType);

    if (!registerBank) {
        lines.push("Selected register bank not available.");
        return lines;
    }

    lines.push(colorText(`${registerBank.name} Registers:`, "36"));
    lines.push("");

    const registers = registerBank.elements;

    // Determine number of columns based on width
    const cols = width >= 80 ? 4 : width >= 60 ? 3 : 2;

    // Calculate fixed column width with padding
    const colWidth = Math.floor((width - 2) / cols);

    // Calculate rows needed
    const rowCount = Math.ceil(registers.length / cols);

    // First, calculate max width for each column to align them properly
    const maxWidths = new Array(cols).fill(0);
    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            if (index < registers.length) {
                const reg = registers[index];
                const primaryName = reg.name[0];
                const altNames = reg.name.slice(1).join(",");
                const displayName = altNames
                    ? `${primaryName}(${altNames})`
                    : primaryName;
                maxWidths[col] = Math.max(maxWidths[col], displayName.length);
            }
        }
    }

    // Display registers in columns with fixed width
    for (let row = 0; row < rowCount; row++) {
        let rowText = "";

        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;

            if (index < registers.length) {
                const reg = registers[index];
                const primaryName = reg.name[0];
                const altNames = reg.name.slice(1).join(",");
                const displayName = altNames
                    ? `${primaryName}(${altNames})`
                    : primaryName;

                // Get the register's bit width and calculate hex digits needed
                const nbits = reg.nbits;
                const hexDigits = Math.ceil(nbits / 4);

                // Format depends on register type
                let value;
                if (regType === "fp_registers") {
                    value = creator
                        .dumpRegister(primaryName)
                        .padStart(hexDigits, "0");
                } else {
                    value = creator
                        .dumpRegister(primaryName, "twoscomplement")
                        .padStart(hexDigits, "0");
                }

                // Format each register with consistent fixed width
                const coloredName = colorText(
                    displayName.padEnd(maxWidths[col]),
                    "36",
                );
                const regText = `${coloredName}: 0x${value}`;
                rowText += regText.padEnd(colWidth);
            }
        }

        lines.push(rowText);
    }

    // Add keyboard shortcut hint
    lines.push("");
    lines.push(
        colorText(
            "Use 'Next Bank'/'Previous Bank' options to switch between register banks",
            "33",
        ),
    );

    return lines;
}

function getMemoryContent(width: number, address: number): string[] {
    const lines: string[] = [];

    lines.push(
        `Memory at address: 0x${address.toString(16).padStart(8, "0").toUpperCase()}`,
    );
    lines.push("----------------------------------------------------");

    const bytesPerRow = width >= 80 ? 16 : 8;

    for (let row = 0; row < MEMORY_VIEW_ROWS; row++) {
        const rowAddress = address + row * bytesPerRow;
        let hexValues = "";
        let asciiValues = "";

        for (let i = 0; i < bytesPerRow; i++) {
            try {
                const byteValue = creator.dumpAddress(rowAddress + i, 1);
                const byteInt = parseInt(byteValue, 16);

                hexValues += byteValue.padStart(2, "0") + " ";

                // ASCII representation (printable chars or dot)
                if (byteInt >= 32 && byteInt <= 126) {
                    asciiValues += String.fromCharCode(byteInt);
                } else {
                    asciiValues += ".";
                }
            } catch (error) {
                hexValues += "?? ";
                asciiValues += ".";
            }
        }

        const addrHex = rowAddress.toString(16).padStart(8, "0").toUpperCase();

        if (width >= 70) {
            lines.push(
                `0x${addrHex}: ${hexValues.padEnd(bytesPerRow * 3)} | ${asciiValues}`,
            );
        } else {
            lines.push(`0x${addrHex}: ${hexValues}`);
        }
    }

    return lines;
}

// eslint-disable-next-line max-lines-per-function
function getStackContent(width: number): string[] {
    const lines: string[] = [];

    try {
        const stackTracker = creator.stackTracker as StackTracker;
        const stackFrames = stackTracker.getAllFrames();
        const stackTop = stackFrames.at(-1);

        if (stackTop === undefined) {
            lines.push("No stack information available.");
            return lines;
        }

        // Call stack hierarchy
        lines.push(colorText("Call Stack:", "36"));
        lines.push("");

        for (const [i, frame] of stackFrames.toReversed().entries()) {
            const addressStr = frame.name ?? "";

            // Find label for address
            let functionName = "unknown";
            for (const instr of instructions) {
                if (instr.Address === addressStr && instr.Label) {
                    functionName = instr.Label;
                    break;
                }
            }

            const depth = stackFrames.length - 1 - i;
            const indent = "  ".repeat(depth);
            const frameSize = frame.begin - frame.end;
            const prefix = i === stackFrames.length - 1 ? "►" : "•";
            const color = i === stackFrames.length - 1 ? "32" : "0";

            const beginAddr = `0x${frame.begin.toString(16).toUpperCase()}`;
            const endAddr = `0x${frame.end.toString(16).toUpperCase()}`;

            let frameInfo = `${indent}${prefix} ${functionName} (${beginAddr}-${endAddr}, ${frameSize} bytes)`;

            if (width < 70) {
                // Truncate for narrow displays
                frameInfo = `${indent}${prefix} ${functionName} (${frameSize} bytes)`;
            }

            lines.push(colorText(frameInfo, color));
        }

        // Current frame details

        lines.push("");
        lines.push(colorText("Current Frame Details:", "36"));

        const currentAddrStr = stackTop.name ?? "";
        let currentFuncName = "unknown";

        for (const instr of instructions) {
            if (instr.Address === currentAddrStr && instr.Label) {
                currentFuncName = instr.Label;
                break;
            }
        }

        lines.push(`Function: ${currentFuncName}`);

        const beginAddr = `0x${stackTop.begin.toString(16).toUpperCase()}`;
        const endAddr = `0x${stackTop.end.toString(16).toUpperCase()}`;

        lines.push(`Frame: ${beginAddr} - ${endAddr}`);
        lines.push(`Size: ${stackTop.begin - stackTop.end} bytes`);

        // Stack memory contents (if space allows)
        if (width >= 60) {
            lines.push("");
            lines.push(colorText("Stack Memory Contents:", "36"));

            const startAddr = stackTop.end;
            const maxBytesToShow = 64; // Limit display size

            // Find bottom-most frame to get stack range
            const bottomFrame = stackFrames[0];
            const stackEndAddr = bottomFrame.begin;

            const bytesToShow = Math.min(
                stackEndAddr - startAddr,
                maxBytesToShow,
            );

            // Display stack memory
            for (
                let addr = startAddr;
                addr < startAddr + bytesToShow;
                addr += 4
            ) {
                try {
                    const bytes = creator.dumpAddress(addr, 4);
                    const valueStr =
                        "0x" + bytes.padStart(8, "0").toUpperCase();
                    const addrStr = `0x${addr.toString(16).padStart(8, "0").toUpperCase()}`;

                    // Check for stack pointer
                    let annotation = "";
                    if (addr === stackTop.end) {
                        annotation = "← SP";
                    }

                    // Check for frame boundaries
                    for (let i = 0; i < stackFrames.length; i++) {
                        const frame = stackFrames[i];
                        if (
                            addr === frame.end &&
                            i !== stackFrames.length - 1
                        ) {
                            let funcName = "unknown";
                            for (const instr of instructions) {
                                if (
                                    instr.Address === frame.name &&
                                    instr.Label
                                ) {
                                    funcName = instr.Label;
                                    break;
                                }
                            }

                            annotation +=
                                (annotation ? ", " : "") +
                                `← ${funcName} frame start`;
                        }

                        if (addr === frame.begin - 4) {
                            let funcName = "unknown";
                            for (const instr of instructions) {
                                if (
                                    instr.Address === frame.name &&
                                    instr.Label
                                ) {
                                    funcName = instr.Label;
                                    break;
                                }
                            }

                            annotation +=
                                (annotation ? ", " : "") +
                                `← ${funcName} frame end`;
                        }
                    }

                    // Find which frame this address belongs to for coloring
                    let frameIndex = -1;
                    for (let i = 0; i < stackFrames.length; i++) {
                        const frame = stackFrames[i];
                        const endCallee = frame.end;
                        const beginCallee = frame.begin;

                        if (addr >= endCallee && addr < beginCallee) {
                            frameIndex = i;
                            break;
                        }
                    }

                    let line = `${addrStr}: ${valueStr.padEnd(10)} ${annotation}`;

                    if (frameIndex >= 0) {
                        const colorCodes = ["32", "33", "36", "35", "34"];
                        const colorCode =
                            colorCodes[frameIndex % colorCodes.length];
                        line = colorText(line, colorCode);
                    }

                    lines.push(line);
                } catch (error) {
                    lines.push(
                        `0x${addr.toString(16).padStart(8, "0").toUpperCase()}: ????????`,
                    );
                }
            }
        }
    } catch (error) {
        lines.push(`Error retrieving stack information: ${error.message}`);
    }

    return lines;
}

function getHelpContent(width: number): string[] {
    const lines: string[] = [];

    lines.push("CREATOR TUI Help");
    lines.push("===============");
    lines.push("");

    if (width >= 70) {
        lines.push("Navigation:");
        lines.push("  - Arrow keys: Navigate menus and options");
        lines.push("  - Tab: Toggle between sidebar and main content");
        lines.push("  - Enter: Select menu option");
        lines.push("  - ':': Enter command mode");
        lines.push("");
        lines.push("Commands:");
        lines.push("  step      - Execute one instruction");
        lines.push(
            "  run       - Execute instructions until breakpoint or end",
        );
        lines.push("  break     - Set/remove breakpoint at address");
        lines.push("  reg       - Display register bank");
        lines.push("  mem       - View memory at address");
        lines.push("  reset     - Reset program state");
        lines.push("  help      - Display help information");
        lines.push("  quit      - Exit the program");
        lines.push("");
        lines.push("Views:");
        lines.push(
            "  - Instructions: View and step through program instructions",
        );
        lines.push("  - Registers: Display processor registers");
        lines.push("  - Memory: View and navigate memory contents");
        lines.push("  - Stack: View the call stack and frame information");
    } else {
        // Compact help for narrow displays
        lines.push("Navigation:");
        lines.push("  Arrows: Navigate");
        lines.push("  Tab: Toggle sidebar/content");
        lines.push("  Enter: Select option");
        lines.push("  ':': Command mode");
        lines.push("");
        lines.push("Commands:");
        lines.push("  step, run, break");
        lines.push("  reg, mem, reset");
        lines.push("  help, quit");
    }

    return lines;
}

// --- Sidebar Content ---
function getSidebarLines(height: number): string[] {
    const lines = ["Navigation", "----------"];

    // Main navigation items
    const navItems = [
        { name: "Instructions", view: "instructions" },
        { name: "Registers", view: "registers" },
        { name: "Memory", view: "memory" },
        { name: "Stack", view: "stack" },
        { name: "Help", view: "help" },
    ];

    for (let i = 0; i < navItems.length; i++) {
        let prefix = "  ";

        // Show selection indicator when sidebar is focused
        if (sidebarFocused && i === sidebarSelection) {
            prefix = " >";
        }
        // Show which view is currently active
        else if (navItems[i].view === currentView) {
            prefix = " *";
        }

        lines.push(`${prefix}${navItems[i].name}`);
    }

    // Add status information in sidebar if space allows
    if (height > 15) {
        lines.push("");
        lines.push("Status");
        lines.push("------");
        lines.push(
            `Processor: ${creator.architecture.config.name || "Not loaded"}`,
        );
        if (instructions.length > 0) {
            const pc_value = creator.dumpRegister("PC");
            lines.push(`PC: 0x${pc_value}`);
        }

        lines.push(`Exec: ${getExecutionStatus()}`);

        // Add breakpoint count
        const breakpoints = instructions.filter(instr => instr.Break === true);
        lines.push(`BPs: ${breakpoints.length}`);
    }

    // Ensure we return exactly the requested height
    while (lines.length < height) {
        lines.push("");
    }

    return lines.slice(0, height);
}

// --- Command Processing ---
function executeCommand(cmd: string): void {
    // Add to history if not empty and not duplicate
    if (
        cmd.trim() &&
        (commandHistory.length === 0 ||
            commandHistory[commandHistory.length - 1] !== cmd)
    ) {
        commandHistory.push(cmd);
    }

    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
        case "step":
        case "s":
            executeStep();
            break;
        case "run":
        case "r":
            executeRun();
            break;
        case "break":
        case "b":
            if (args.length > 0) {
                handleBreakpointCommand(args[0]);
            } else {
                // List all breakpoints when no address is provided
                listBreakpoints();
            }
            break;
        case "reset":
            handleResetCommand();
            break;
        case "list":
        case "l":
            if (currentView !== "instructions") {
                currentView = "instructions";
                selectedOption = 0;
                scrollOffset = 0;
            }
            break;
        case "reg":
            if (currentView !== "registers") {
                currentView = "registers";
                selectedOption = 0;
            }
            break;
        case "mem":
            currentView = "memory";
            selectedOption = 0;
            if (args.length > 0) {
                try {
                    memoryViewAddress = parseInt(args[0], 16);
                } catch (e) {
                    lastCommandError = `Invalid address: ${args[0]}`;
                    setTimeout(() => {
                        lastCommandError = "";
                        render();
                    }, 2000);
                }
            }
            break;
        case "help":
        case "h":
            currentView = "help";
            selectedOption = 0;
            break;
        case "quit":
        case "q":
        case "exit":
            process.exit(0);
            break;
        default:
            if (cmd.trim()) {
                lastCommandError = `Unknown command: ${command}`;
                setTimeout(() => {
                    lastCommandError = "";
                    render();
                }, 2000);
            }
            break;
    }
}

function handleResetCommand() {
    creator.reset();
    PREVIOUS_PC = "0x0";
    previousStates = [];

    lastCommandError = "Program reset.";
    setTimeout(() => {
        lastCommandError = "";
        render();
    }, 2000);

    render();
}

// --- Input Handling ---
function setupInputHandling() {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }

    // Set up handling for window resize
    process.stdout.on("resize", () => {
        // Ensure we redraw the entire screen on resize
        lastRenderTime = 0;
        render();
    });

    process.stdin.on("keypress", (str, key) => {
        if (key.ctrl && key.name === "c") {
            process.exit(0);
        }

        // Handle command mode input
        if (commandMode) {
            handleCommandModeInput(str, key);
            return;
        }

        // Enter command mode when ':' is pressed
        if (str === ":") {
            commandMode = true;
            currentCommand = "";
            commandHistoryIndex = -1;
            render();
            return;
        }

        // Handle scrolling in instructions view
        if (currentView === "instructions") {
            if (key.name === "pagedown") {
                scrollOffset = Math.min(
                    scrollOffset + 10,
                    Math.max(0, instructions.length - 10),
                );
                render();
                return;
            } else if (key.name === "pageup") {
                scrollOffset = Math.max(0, scrollOffset - 10);
                render();
                return;
            }
        }

        // Toggle focus between sidebar and content with Tab
        if (key.name === "tab") {
            sidebarFocused = !sidebarFocused;
            render();
            return;
        }

        // Escape key to go to main view
        if (key.name === "escape") {
            currentView = "instructions";
            selectedOption = 0;
            scrollOffset = 0;
            sidebarFocused = false; // Switch focus back to content
            render();
            return;
        }

        if (sidebarFocused) {
            // Handle sidebar navigation
            const sidebarOptions = 6; // Number of navigation items in sidebar

            if (key.name === "up") {
                sidebarSelection =
                    (sidebarSelection - 1 + sidebarOptions) % sidebarOptions;
                render();
            } else if (key.name === "down") {
                sidebarSelection = (sidebarSelection + 1) % sidebarOptions;
                render();
            } else if (key.name === "return") {
                // Map sidebar selection to view
                const viewMapping = [
                    "instructions",
                    "registers",
                    "memory",
                    "stack",
                    "help",
                ];
                if (sidebarSelection < viewMapping.length) {
                    currentView = viewMapping[sidebarSelection] as ViewType;
                    selectedOption = 0;
                    scrollOffset = 0;
                    sidebarFocused = false; // Switch focus back to content
                    render();
                }
            }
        } else {
            // Handle content area navigation
            const view = views[currentView];
            const numOptions = view.options.length;

            if (key.name === "up") {
                selectedOption = (selectedOption - 1 + numOptions) % numOptions;
                render();
            } else if (key.name === "down") {
                selectedOption = (selectedOption + 1) % numOptions;
                render();
            } else if (key.name === "return") {
                if (view.actions[selectedOption]) {
                    view.actions[selectedOption]();
                    render();
                }
            }
        }
    });
}

// Command mode input handler
function handleCommandModeInput(str: string, key: readline.Key): void {
    // Exit command mode with Escape
    if (key.name === "escape") {
        commandMode = false;
        render();
        return;
    }

    // Execute command with Enter
    if (key.name === "return") {
        executeCommand(currentCommand);
        commandMode = false;
        render();
        return;
    }

    // Delete last character with backspace
    if (key.name === "backspace") {
        currentCommand = currentCommand.slice(0, -1);
        render();
        return;
    }

    // Navigate command history with up/down arrows
    if (key.name === "up") {
        if (commandHistory.length > 0) {
            if (commandHistoryIndex === -1) {
                commandHistoryIndex = commandHistory.length - 1;
            } else if (commandHistoryIndex > 0) {
                commandHistoryIndex--;
            }
            currentCommand = commandHistory[commandHistoryIndex];
            render();
        }
        return;
    }

    if (key.name === "down") {
        if (commandHistoryIndex !== -1) {
            if (commandHistoryIndex < commandHistory.length - 1) {
                commandHistoryIndex++;
                currentCommand = commandHistory[commandHistoryIndex];
            } else {
                commandHistoryIndex = -1;
                currentCommand = "";
            }
            render();
        }
        return;
    }

    // Add typed character to command
    if (str && !key.ctrl && !key.meta && key.name !== "return") {
        currentCommand += str;
        render();
    }
}

// --- CREATOR Functionality ---
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
        console.error(`Error loading configuration: ${error.message}`);
        return DEFAULT_CONFIG;
    }
}

// Apply configuration settings
function applyConfiguration(config: ConfigType): void {
    if (config.settings.max_states !== undefined) {
        MAX_STATES_TO_KEEP = config.settings.max_states;
    }
}

function loadArchitecture(filePath: string, isaExtensions: string[]) {
    try {
        const architectureFile = fs.readFileSync(filePath, "utf8");
        const ret: ReturnType = creator.newArchitectureLoad(
            architectureFile,
            false,
            isaExtensions,
        );
        if (ret.status !== "ok") {
            console.error(`Error loading architecture: ${ret.token}.`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`Error loading architecture file: ${error.message}`);
        process.exit(1);
    }
}

function loadBinary(filePath: string) {
    if (!filePath) return;

    try {
        const binaryFile = fs.readFileSync(filePath, "utf8");
        creator.loadElfFile(binaryFile);
        BINARY_LOADED = true;
    } catch (error) {
        console.error(`Error loading binary file: ${error.message}`);
        process.exit(1);
    }
}

function loadLibrary(filePath: string) {
    if (!filePath) return;

    try {
        const libraryFile = fs.readFileSync(filePath, "utf8");
        creator.load_library(libraryFile);
    } catch (error) {
        console.error(`Error loading library file: ${error.message}`);
        process.exit(1);
    }
}

function assemble(filePath: string) {
    if (!filePath) return;

    try {
        const assemblyFile = fs.readFileSync(filePath, "utf8");
        const ret: ReturnType = creator.assembly_compile(assemblyFile, true);
        if (ret.status !== "ok") {
            console.error(ret.msg);
            process.exit(1);
        }
    } catch (error) {
        console.error(`Error assembling file: ${error.message}`);
        process.exit(1);
    }
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
        .option("config", {
            alias: "c",
            type: "string",
            describe: "Path to configuration file",
            default: CONFIG_PATH,
        })
        .help().argv as ArgvOptions;
}

// --- Splash Screen ---
function displaySplashScreen(): Promise<void> {
    return new Promise(resolve => {
        console.clear();

        // Terminal size
        const terminalWidth = process.stdout.columns || 80;
        const padding = " ".repeat(
            Math.max(0, Math.floor((terminalWidth - 60) / 2)),
        );
        // center the splash screen vertically
        const terminalHeight = process.stdout.rows || 24;
        const topPadding = Math.floor((terminalHeight - 10) / 2);
        for (let i = 0; i < topPadding; i++) {
            console.log("");
        }

        // ASCII Art for CREATOR
        const logo = `
        ██████╗██████╗ ███████╗ █████╗ ████████╗ ██████╗ ██████╗ 
       ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗
       ██║     ██████╔╝█████╗  ███████║   ██║   ██║   ██║██████╔╝
       ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║   ██║██╔══██╗
       ╚██████╗██║  ██║███████╗██║  ██║   ██║   ╚██████╔╝██║  ██║
       ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
         didaCtic and geneRic assEmbly progrAmming simulaTOR
       `;

        const logoLines = logo.split("\n").map(line => line.trim());
        logoLines.forEach(line => {
            console.log(padding + line.padEnd(60));
        });

        // Print application info with padding
        console.log(
            padding +
                `TUI Version: ${TUI_VERSION} | Core Version: ${CLI_VERSION}`.padEnd(
                    60,
                ),
        );
        console.log(
            padding +
                "=============================================================".padEnd(
                    60,
                ),
        );
        console.log(
            "\n" + padding + "Loading CREATOR environment...".padEnd(60),
        );
        console.log(padding + "Starting Terminal User Interface...".padEnd(60));

        // Add small delay to show splash screen (1.5 seconds)
        setTimeout(() => {
            resolve();
        }, 1500);
    });
}

// --- Main Function ---
async function main() {
    try {
        logger.disable();
        // Show splash screen first
        await displaySplashScreen();

        // Parse command line arguments
        const argv: ArgvOptions = parseArguments();

        // Load configuration
        CONFIG = loadConfiguration(argv.config);

        // Apply configuration settings
        applyConfiguration(CONFIG);

        // Load architecture
        loadArchitecture(argv.architecture, argv.isa);

        // Reset BINARY_LOADED flag before loading any files
        BINARY_LOADED = false;

        // Load program files
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

        // Reset the processor
        creator.reset();

        // Initial render (using the new buffered approach)
        render();

        // Setup input handling
        setupInputHandling();

        // Instead of a continuous interval, only trigger renders when needed
        // This prevents unnecessary screen redraws that cause flickering
        setInterval(() => {
            if (!EXECUTION_PAUSED && creator.status.execution_index !== -2) {
                // Only re-render periodically during continuous execution
                render();
            }
        }, 100);
    } catch (error) {
        console.error(`Error initializing CREATOR TUI: ${error.message}`);
        process.exit(1);
    }
}

// Start the application
main();
