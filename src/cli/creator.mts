/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
"use strict";

import fs from "node:fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { logger } from "../core/utils/creator_logger.mjs";
import * as creator from "../core/core.mjs";
import process from "node:process";

// Define interfaces
interface CommandLineArgs {
    debug: boolean;
    architecture: string;
    assembly: string;
    binary: string;
    library: string;
    result: string;
    describe: string;
    maxins: string;
    output: string;
    config: string;
    jsonOutput: string;
    isa: string[];
}

interface StageResult {
    status: "ok" | "ko";
    msg: string;
}

interface ProcessResult {
    Architecture: StageResult;
    Library: StageResult;
    Compile: StageResult;
    Binary: StageResult;
    Execute: StageResult;
    LastState: StageResult;
    stages: string[];
}

const creator_version = JSON.parse(
    fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
).version;

/**
 * Displays the welcome message with version information
 * @returns {string} The formatted welcome message
 */
function welcome(): string {
    return (
        "\n" +
        "CREATOR\n" +
        "-------\n" +
        "version: " +
        creator_version +
        "\n" +
        "website: https://creatorsim.github.io/\n"
    );
}

// arguments
const argv = yargs(hideBin(process.argv))
    .usage(
        welcome() +
            "\n" +
            "Usage: $0 -a <file name> -s <file name>\n" +
            "Usage: $0 -a <file name> -b <file name>\n" +
            "Usage: $0 -h",
    )
    .example([["./$0", "To show examples."]])
    .option("debug", {
        type: "boolean",
        describe: "Enable debug mode",
        default: false,
    })
    .option("architecture", {
        alias: "a",
        type: "string",
        describe: "Architecture file",
        nargs: 1,
        default: "",
    })
    .option("assembly", {
        alias: "s",
        type: "string",
        describe: "Assembly file",
        nargs: 1,
        default: "",
    })
    .option("binary", {
        alias: "b",
        type: "string",
        describe: "Binary file (JSON format)",
        nargs: 1,
        default: "",
    })
    .option("library", {
        alias: "l",
        type: "string",
        describe: "Assembly library file",
        nargs: 1,
        default: "",
    })
    .option("result", {
        alias: "r",
        type: "string",
        describe: "Result file to compare with",
        nargs: 1,
        default: "",
    })
    .option("describe", {
        type: "string",
        describe: "Help on element",
        nargs: 1,
        default: "",
    })
    .option("maxins", {
        type: "string",
        describe: "Maximum number of instructions to be executed",
        nargs: 1,
        default: "100000",
    })
    .option("output", {
        alias: "o",
        type: "string",
        describe: "Define output format",
        nargs: 1,
        default: "normal",
    })
    .option("json-output", {
        type: "string",
        describe: "Output file for JSON results",
        nargs: 1,
        default: "",
    })
    .option("isa", {
        type: "array",
        describe: "Specific ISA extensions to load (e.g. --isa I M F D)",
        default: [],
    })
    .demandOption(
        [],
        "Please provide either a config file or architecture file with assembly or binary file.",
    )
    .help("h")
    .alias("h", "help").argv as unknown as CommandLineArgs;

// Set the debug mode
creator.set_debug(argv.debug);

/**
 * Shows usage information for the CLI
 * @returns {string} The usage help text
 */
function help_usage(): string {
    return (
        "Usage:\n" +
        " * To compile and execute an assembly file on an architecture:\n" +
        "   ./creator.sh -a <architecture file name> -s <assembly file name>\n" +
        " * To load and execute a binary file directly on an architecture:\n" +
        "   ./creator.sh -a <architecture file name> -b <binary file name>\n" +
        " * Same as before but execute only 10 instructions:\n" +
        "   ./creator.sh -a <architecture file name> -s <assembly file name> --maxins 10\n" +
        " * To load only specific ISA extensions:\n" +
        "   ./creator.sh -a <architecture file name> -s <assembly file name> --isa base rv32f\n" +
        "\n" +
        " * Same as before and save the final state in a result file:\n" +
        "   ./creator.sh -a <architecture file name> -s <ok assembly file name> -o min > <result file>\n" +
        " * To compile and execute an assembly file, and check the final state with a result file:\n" +
        "   ./creator.sh -a <architecture file name> -s <assembly file name> -o min -r <result file>\n" +
        "\n" +
        " * To get a summary of the instructions/pseudoinstructions:\n" +
        "   ./creator.sh -a <architecture file name> --describe <instructions|pseudo>\n" +
        "\n" +
        " * To get more information:\n" +
        "   ./creator.sh -h\n"
    );
}

/**
 * Displays execution results in various formats
 * @param {string} output_format - Output format (NORMAL|MIN|TAB|PRETTY)
 * @param {string} stage - Current execution stage
 * @param {string} status - Status of the operation (ok|ko)
 * @param {string} msg - Message to display
 * @param {boolean} show_in_min - Whether to show in minimal output mode
 */
function show_result(
    output_format: string,
    stage: string,
    status: string,
    msg: string,
    show_in_min: boolean,
): void {
    switch (output_format) {
        case "NORMAL":
            msg = "[" + stage + "] " + msg;
            msg = msg.split("\n").join("\n[" + stage + "] ");
            console.log(msg);
            break;

        case "MIN":
            if (show_in_min) {
                console.log(msg);
            }
            break;

        case "TAB":
            process.stdout.write(status + ",\t\t");
            break;

        case "PRETTY":
            if (stage === "FinalState") {
                console.log("[" + stage + "]");
                const values = msg.split(";").filter(s => s.trim());
                values.forEach(value => {
                    console.log(value.trim());
                });
            }
            break;

        default:
            console.log("[" + stage + "] " + msg + "\n");
            break;
    }
}

/**
 * Loads and processes architecture file
 * @param {string} architecturePath - Path to architecture file
 * @returns {StageResult} Result object with status and message
 */
function loadArchitecture(architecturePath: string): StageResult {
    try {
        const architecture_file = fs.readFileSync(architecturePath, "utf8");
        const ret = creator.newArchitectureLoad(
            architecture_file,
            false,
            false,
            argv.isa, // Pass the ISA extensions array
        );

        if (ret.status !== "ok") {
            throw ret.errorcode;
        }

        // Update success message to include loaded ISAs if specified
        let message = `Architecture '${architecturePath}' loaded successfully.`;
        if (argv.isa && argv.isa.length > 0) {
            message += ` With ISA extensions: ${argv.isa.join(", ")}`;
        }

        return {
            status: "ok",
            msg: message,
        };
    } catch (e) {
        if (e instanceof Error || typeof e === "string") {
            return { status: "ko", msg: e.toString() };
        }
        return { status: "ko", msg: "Unknown error occurred" };
    }
}

/**
 * Loads and processes library file
 * @param {string} libraryPath - Path to library file
 * @returns {StageResult} Result object with status and message
 */
function loadLibrary(libraryPath: string): StageResult {
    if (!libraryPath) {
        return { status: "ok", msg: "Without library" };
    }

    try {
        const library = fs.readFileSync(libraryPath, "utf8");
        const ret = creator.load_library(library);
        if (ret.status !== "ok") {
            throw ret.msg;
        }
        return {
            status: "ok",
            msg: `Code '${libraryPath}' linked successfully.`,
        };
    } catch (e) {
        if (e instanceof Error || typeof e === "string") {
            return { status: "ko", msg: e.toString() };
        }
        return { status: "ko", msg: "Unknown error occurred" };
    }
}

/**
 * Compiles assembly code
 * @param {string} assemblyPath - Path to assembly file
 * @returns {StageResult} Result object with status and message
 */
function compileAssembly(assemblyPath: string): StageResult {
    try {
        const assembly = fs.readFileSync(assemblyPath, "utf8");
        const ret = creator.assembly_compile(assembly);
        if (ret.status !== "ok") {
            throw "\n" + ret.msg;
        }
        return {
            status: "ok",
            msg: `Code '${assemblyPath}' compiled successfully.`,
        };
    } catch (e) {
        if (e instanceof Error || typeof e === "string") {
            return { status: "ko", msg: e.toString() };
        }
        return { status: "ko", msg: "Unknown error occurred" };
    }
}

/**
 * Loads and processes binary file
 * @param {string} binaryPath - Path to binary file
 * @returns {StageResult} Result object with status and message
 */
function loadBinary(binaryPath: string): StageResult {
    try {
        const binary = fs.readFileSync(binaryPath, "utf8");
        const ret = creator.load_binary_file(binary);
        if (ret.status !== "ok") {
            throw ret.msg;
        }
        return {
            status: "ok",
            msg: `Binary file '${binaryPath}' loaded successfully.`,
        };
    } catch (e) {
        if (e instanceof Error || typeof e === "string") {
            return { status: "ko", msg: e.toString() };
        }
        return { status: "ko", msg: "Unknown error occurred" };
    }
}

/**
 * Executes the compiled program
 * @param {number} limitInstructions - Maximum number of instructions to execute
 * @returns {StageResult} Result object with status and message
 */
function executeProgram(limitInstructions: number): StageResult {
    try {
        const ret = creator.execute_program(limitInstructions);
        if (ret.status !== "ok") {
            throw `\n Error found.\n ${ret.msg}`;
        }
        return { status: "ok", msg: "Executed successfully." };
    } catch (e) {
        if (e instanceof Error || typeof e === "string") {
            return { status: "ko", msg: e.toString() };
        }
        return { status: "ko", msg: "Unknown error occurred" };
    }
}

/**
 * Compares execution results with expected results
 * @param {string} resultPath - Path to expected results file
 * @returns {StageResult | null} Result object with status and message
 */
function compareResults(resultPath: string): StageResult | null {
    if (!resultPath) return null;

    const result = fs.readFileSync(resultPath, "utf8");
    const currentState = creator.get_state();
    const comparison = creator.compare_states(result, currentState.msg);

    return {
        status: comparison.msg === "" ? "ok" : "ko",
        msg: comparison.msg === "" ? "Equals" : comparison.msg,
    };
}

/**
 * Processes a single file (assembly or binary) through all stages
 * @param {string} architecturePath - Path to architecture file
 * @param {string} libraryPath - Path to library file
 * @param {string} assemblyPath - Path to assembly file
 * @param {string} binaryPath - Path to binary file
 * @param {number} limitInstructions - Maximum number of instructions to execute
 * @param {string} resultPath - Path to result file for comparison
 * @returns {ProcessResult} Result object containing status of all stages
 */
function one_file(
    architecturePath: string,
    libraryPath: string,
    assemblyPath: string,
    binaryPath: string,
    limitInstructions: number,
    resultPath: string,
): ProcessResult {
    const result: ProcessResult = {
        Architecture: { status: "ko", msg: "Not loaded" },
        Library: { status: "ko", msg: "Not loaded" },
        Compile: { status: "ko", msg: "Not compiled" },
        Binary: { status: "ko", msg: "Not loaded" },
        Execute: { status: "ko", msg: "Not executed" },
        LastState: { status: "ko", msg: "Not equals states" },
        stages: ["Architecture"],
    };

    // Load architecture
    result.Architecture = loadArchitecture(architecturePath);
    if (result.Architecture.status === "ko") return result;

    // Check if we're in binary mode or assembly mode
    if (binaryPath) {
        // Binary mode - skip compilation and library
        result.stages.push("Binary", "Execute");
        result.Binary = loadBinary(binaryPath);
        if (result.Binary.status === "ko") return result;
    } else {
        // Assembly mode - compile and optionally link
        result.stages.push("Library", "Compile", "Execute");

        // Load library if provided
        result.Library = loadLibrary(libraryPath);
        if (result.Library.status === "ko") return result;

        // Compile assembly
        result.Compile = compileAssembly(assemblyPath);
        if (result.Compile.status === "ko") return result;
    }

    // Execute program
    result.Execute = executeProgram(limitInstructions);
    if (result.Execute.status === "ko") return result;

    // Compare results if result file provided
    if (resultPath) {
        result.stages.push("LastState");
        result.LastState = compareResults(resultPath) || {
            status: "ko",
            msg: "No comparison performed",
        };
    }

    return result;
}

/**
 * Provides detailed description of instructions or pseudo-instructions
 * @param {CommandLineArgs} argv - The command line arguments object
 * @returns {string} Description of instructions or pseudo-instructions
 */
function help_describe(argv: CommandLineArgs): string {
    // load architecture
    try {
        const architecture = fs.readFileSync(argv.architecture, "utf8");
        const ret = creator.load_architecture(architecture);
        if (ret.status !== "ok") {
            throw ret.errorcode;
        }
    } catch (e) {
        if (e instanceof Error || typeof e === "string") {
            let msg = "\n" + e.toString();
            msg = msg.split("\n").join("\n[Architecture] ");
            console.log(msg);
            process.exit(-1);
        }
    }

    // show description
    let o = "";
    if (argv.describe.toUpperCase().startsWith("INS")) {
        o = creator.help_instructions();
    }
    if (argv.describe.toUpperCase().startsWith("PSEUDO")) {
        o = creator.help_pseudoins();
    }

    return o;
}

/**
 * Handles the describe command for instructions and pseudo-instructions
 * @param {CommandLineArgs} argv - Command line arguments
 * @returns {boolean} True if describe command was handled, false otherwise
 */
function handleDescribeCommand(argv: CommandLineArgs): boolean {
    if (argv.architecture !== "" && argv.describe !== "") {
        const description = help_describe(argv);
        console.log(welcome() + "\n" + description);
        return true;
    }
    return false;
}

/**
 * Validates that required arguments are present
 *
 * @param {CommandLineArgs} argv - Command line arguments
 * @returns {boolean} True if all required arguments are present, false otherwise
 */
function validateRequiredArgs(argv: CommandLineArgs): boolean {
    if (
        argv.architecture === "" ||
        (argv.assembly === "" && argv.binary === "")
    ) {
        const usage = help_usage();
        console.log(welcome() + "\n" + usage);
        return false;
    }
    return true;
}

/**
 * Processes execution stages and displays results
 * @param {ProcessResult} ret - Results object from execution
 * @param {string} output_format - Output format type
 * @param {string} hdr - Header string for output
 * @returns {string} Updated header string
 */
function processStages(
    ret: ProcessResult,
    output_format: string,
    hdr: string,
): string {
    for (const stage of ret.stages) {
        hdr = hdr + ",\t" + stage;
        show_result(
            output_format,
            stage,
            ret[stage].status === "ok" ? "ok" : "ko",
            ret[stage].msg,
            ret[stage].status !== "ok",
        );
    }
    return hdr;
}

/**
 * Processes and displays final execution results
 * @param {ProcessResult} ret - Results object from execution
 * @param {CommandLineArgs} argv - Command line arguments
 * @param {string} output_format - Output format type
 * @param {string} hdr - Header string for output
 * @returns {string} Updated header string
 */
function processResults(
    ret: ProcessResult,
    argv: CommandLineArgs,
    output_format: string,
    hdr: string,
): string {
    if (argv.result !== "") {
        hdr += ",\tState";
        show_result(output_format, "State", "ko", ret.LastState.msg, true);
        if (ret.LastState.status !== "ok") {
            process.exit(-1);
        }
    }

    hdr += ",\tFinalState\n";
    const state = creator.get_state();
    if (argv.result === "") {
        show_result(output_format, "FinalState", "is", state.msg, true);
        console.log("");
    }
    return hdr;
}

/**
 * Processes an assembly or binary file and displays results
 * @param {CommandLineArgs} argv - Command line arguments
 * @param {string} output_format - Output format type
 * @param {number} limit_n_ins - Maximum number of instructions to execute
 */
function processFile(
    argv: CommandLineArgs,
    output_format: string,
    limit_n_ins: number,
): void {
    let hdr = "FileName";

    // Display the file being processed
    const processFile = argv.binary || argv.assembly;
    show_result(output_format, processFile, processFile, "", true);

    const ret = one_file(
        argv.architecture,
        argv.library,
        argv.assembly,
        argv.binary,
        limit_n_ins,
        argv.result,
    );

    hdr = processStages(ret, output_format, hdr);
    hdr = processResults(ret, argv, output_format, hdr);

    if (output_format === "TAB") {
        console.log(hdr);
    }
}

/**
 * Main program entry point
 * @param {CommandLineArgs} argv - Command line arguments
 * @returns {number} Exit code (0 for success, -1 for error)
 */
function main(argv: CommandLineArgs): number {
    try {
        logger.debug("Starting creator CLI");
        const limit_n_ins = parseInt(argv.maxins, 10);
        const output_format = argv.output.toUpperCase();

        // Handle describe command
        if (handleDescribeCommand(argv)) {
            return 0;
        }

        // Validate required arguments
        if (!validateRequiredArgs(argv)) {
            return 0;
        }

        // Show welcome message
        if (output_format === "NORMAL") {
            console.log(welcome());
        }

        // Process assembly file
        processFile(argv, output_format, limit_n_ins);

        return 0;
    } catch (e) {
        if (e instanceof Error || typeof e === "string") {
            console.error(e.toString());
            return -1;
        }
    }
}

// Entry point
process.exit(main(argv));
