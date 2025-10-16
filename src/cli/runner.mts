/* eslint-disable max-lines-per-function */
import fs from "node:fs";
import process from "node:process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as creator from "../core/core.mjs";
import { step } from "../core/executor/executor.mjs";
import { logger } from "../core/utils/creator_logger.mjs";
import { keyboardBuffer } from "../core/capi/arch/z80.mjs";

/**
 * Parses command-line arguments using yargs.
 */
function parseArguments() {
    return yargs(hideBin(process.argv))
        .usage("Usage: $0 --architecture <arch_file> --bin <binary_file>")
        .option("architecture", {
            alias: "a",
            type: "string",
            description: "Path to the architecture YAML file",
            demandOption: true, // This makes the argument required
        })
        .option("bin", {
            alias: "b",
            type: "string",
            description: "Path to a binary file to load into memory",
            demandOption: true, // Require a binary file
        })
        .help().argv;
}

/**
 * The main function to set up and run the emulator.
 */
async function main() {
    const argv = await parseArguments();

    logger.disable();
    creator.initCAPI();

    // --- Setup Host Input Listener (stdin) ---
    // The callback will be executed by the Deno
    // event loop whenever a key is pressed.
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        process.stdin.on("data", function (key) {
            // On Ctrl+C, restore terminal state and exit.
            if (key === "\u0003") {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.exit();
            }

            // Push the character code into the shared buffer.
            let charCode = key.charCodeAt(0);
            // Z80 program only has to deal with one standard code.
            if (charCode === 127) {
                charCode = 8; // Convert DEL (0x7f) to BS (0x08)
            }
            keyboardBuffer.push(BigInt(charCode)); // Store as BigInt for the CAPI
        });
    }

    // --- 1. Load the Architecture ---
    try {
        const architectureFile = fs.readFileSync(argv.architecture, "utf8");
        const ret = creator.loadArchitecture(architectureFile);
        if (ret.status !== "ok") {
            console.error(`Error loading architecture: ${ret.token}.`);
            process.exit(1);
        }
        console.log(`Architecture loaded from: ${argv.architecture}`);
    } catch (err) {
        console.error(
            `Failed to read architecture file at: ${argv.architecture}`,
        );
        console.error(err);
        process.exit(1);
    }

    // --- 2. Prepare the Emulator State ---
    creator.reset();

    // Load the user-provided program into memory.
    try {
        const programBytes = fs.readFileSync(argv.bin);
        creator.main_memory.loadROM(new Uint8Array(programBytes), 0n);
        console.log(`Program loaded from binary file: ${argv.bin}`);
    } catch (err) {
        console.error(`Failed to read binary file at: ${argv.bin}`);
        console.error(err);
        process.exit(1);
    }

    // --- 3. Run the Emulation Loop ---
    const INSTRUCTIONS_PER_CHUNK = 100; // Run 1k instructions before yielding to the event loop.
    let totalInstructions = 0;
    function runEmulationCycle() {
        if (creator.status.execution_index === -2) {
            console.log("\nProgram execution halted.");
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
                process.stdin.pause();
            }
            process.exit(0);
        }

        try {
            for (let i = 0; i < INSTRUCTIONS_PER_CHUNK; i++) {
                let pc_value = creator.getRegisterInfo("PC").value;
                // const breakpoint = 0x0E4D;
                // if (creator.getRegisterInfo("PC").value === BigInt(breakpoint)) {
                //     console.log(
                //         `Breakpoint hit at PC = 0x${breakpoint.toString(16).padStart(4, "0").toUpperCase()}`,
                //     );
                //     // for each element in in creator.getRegistersByBank("int_registers").elements, print:
                //     // name[0], value
                //     creator
                //         .getRegistersByBank("int_registers")
                //         .elements.forEach(reg => {
                //             console.log(
                //                 `${reg.name[0]}: 0x${reg.value.toString(16)}`,
                //             );
                //         });
                //     process.exit(0);
                // }

                // if (totalInstructions === 1000000) {
                //     process.exit(0);
                // }
                // if (totalInstructions === 0) {
                //     creator
                //         .getRegistersByBank("int_registers")
                //         .elements.forEach(reg => {
                //             console.log(
                //                 `    ${reg.name[0]}: 0x${reg.value.toString(16)}`,
                //             );
                //         });
                // }
                const ret = step();
                // if (totalInstructions > 0) {
                //     creator
                //         .getRegistersByBank("int_registers")
                //         .elements.forEach(reg => {
                //             console.log(
                //                 `    ${reg.name[0]}: 0x${reg.value.toString(16)}`,
                //             );
                //         });
                // }
                if (ret.error) {
                    console.error(ret.msg);
                    process.exit(1);
                }
                totalInstructions++;
                console.log(
                    totalInstructions,
                    pc_value.toString(16).padStart(4, "0").toUpperCase(),
                    ret.instructionData.asm,
                    "|",
                    ret.instructionData.machineCode,
                );
                if (creator.status.execution_index === -2) {
                    break;
                }
            }
        } catch (error) {
            console.error(
                "\nAn error occurred during emulation:",
                error.message,
            );
            process.exit(1);
        }

        // Yield to the Deno event loop to allow I/O events to be processed.
        setTimeout(runEmulationCycle, 0);
    }

    // Start the asynchronous emulation loop.
    runEmulationCycle();
}

// Start the main function.
main();
