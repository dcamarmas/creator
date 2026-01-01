/**
 * Copyright 2018-2026 CREATOR Team.
 *
 * This file is part of CREATOR.
 *
 * CREATOR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CREATOR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * CREATOR CLI - Main Entry Point
 *
 * This is the main entry point for the CREATOR command-line interface.
 * The CLI provides an interactive environment for assembly programming
 * simulation with support for multiple architectures.
 *
 * Module Structure:
 * - types.mts      - TypeScript interfaces and types
 * - config.mts     - Configuration loading and management
 * - state.mts      - Global CLI state management
 * - display.mts    - Display utilities (colors, formatting)
 * - loader.mts     - Architecture and file loading
 * - interactive.mts - Interactive mode and command processing
 * - commands/      - Command handler implementations
 * - utils.mts      - Help display and utilities
 * - validator.mts  - Program validation
 * - tutorial.mts   - Interactive tutorial
 */

import fs from "node:fs";
import process from "node:process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import yaml from "js-yaml";
import * as creator from "../core/core.mjs";
import { logger } from "../core/utils/creator_logger.mjs";
import { InterruptHandlerType } from "@/core/executor/InterruptManager.mts";
import validatorSchema from "../../docs/schema/validator-file.json" with { type: "json" };
import { validateSchema } from "@/core/utils/schema.mts";

// CLI modules
import type { ArgvOptions } from "./types.mts";
import { loadConfiguration, CONFIG_PATH } from "./config.mts";
import { cliState } from "./state.mts";
import { loadArchitecture, loadBin, loadLibrary, assemble } from "./loader.mts";
import { interactiveMode, displayWelcomeBanner } from "./interactive.mts";
import { startTutorial } from "./tutorial.mts";
import { validate, type Validator } from "./validator.mts";
import { checkForUpdates } from "./update-checker.mts";
import { getVersion } from "./version.mts";

/**
 * Parse command line arguments
 */
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
        .option("assembler", {
            alias: "C",
            type: "string",
            describe: "Assembler backend to use (default, sjasmplus, etc)",
            default: "default",
        })
        .option("debug", {
            alias: "v",
            type: "boolean",
            describe: "Enable debug mode",
            default: false,
        })
        .option("validate", {
            type: "string",
            describe: "Validator file to load",
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
        .option("interrupt-handler", {
            choices: Object.values(InterruptHandlerType),
            describe:
                "Interrupt handler to use, either CREATOR's default handler or a custom architecture-defined one.",
            default: InterruptHandlerType.CREATOR,
        })
        .help().argv as ArgvOptions;
}

/**
 * Check terminal size and warn if too small
 */
function checkTerminalSize(): void {
    if (!process.stdout.columns || !process.stdout.rows) {
        return;
    }

    const { columns, rows } = process.stdout;
    const minColumns = 80;
    const minRows = 24;

    if (columns < minColumns || rows < minRows) {
        console.warn(
            `Warning: Terminal size ${columns}x${rows} is smaller than recommended ${minColumns}x${minRows}. ` +
                `Some output may not display correctly.`,
        );
    }
}

/**
 * Run the validator if specified
 */
function runValidator(argv: ArgvOptions): boolean {
    if (!argv.validate) {
        return false;
    }

    if (!argv.assembly) {
        console.error("You must provide an assembly file (-s <file.s>).");
        process.exit(1);
    }

    let validatorConfig;
    try {
        validatorConfig = yaml.load(
            fs.readFileSync(argv.validate, "utf8"),
        ) as Validator;
    } catch (e: unknown) {
        if (e instanceof yaml.YAMLException) {
            console.error("Invalid YAML file.");
            process.exit(1);
        } else if (e instanceof Deno.errors.NotFound) {
            console.error(`File '${argv.validate}' not found.`);
            process.exit(1);
        } else {
            throw e;
        }
    }

    if (!validateSchema(validatorConfig, validatorSchema)) {
        console.error("Invalid schema for validator config file!");
        process.exit(1);
    }

    const ret = validate(
        validatorConfig.state,
        validatorConfig.maxCycles,
        validatorConfig.floatThreshold,
        validatorConfig.sentinel,
    );

    if (ret.error) {
        console.error(ret.msg);
        process.exit(1);
    }

    return true;
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
    // Parse command line arguments
    const argv: ArgvOptions = parseArguments();

    // Load and apply configuration
    const config = loadConfiguration(argv.config);
    cliState.applyConfiguration(config);

    // Callback to redraw prompt after update notification
    let redrawPromptCallback: (() => void) | undefined;

    // Check for updates (non-blocking)
    const currentVersion = getVersion();
    checkForUpdates(currentVersion, () => {
        // Redraw prompt after showing update notification
        redrawPromptCallback?.();
    }).catch(() => {
        // Silently ignore update check errors
    });

    // Command line arguments take precedence over config
    if (argv.accessible) {
        cliState.accessible = argv.accessible;
    }

    // Configure logging
    if (!argv.debug) {
        logger.disable();
    }

    // Set interrupt handler
    creator.status.interrupt_handler = argv.interruptHandler;

    // Set tutorial mode
    cliState.tutorialMode = argv.tutorial;

    // Load architecture
    loadArchitecture(argv.architecture, argv.isa);

    // Initialize C API plugin
    creator.initCAPI(cliState.pluginName);

    // Reset binary loaded flag
    cliState.binaryLoaded = false;

    // Check if we're in tutorial mode
    if (cliState.tutorialMode) {
        creator.reset();
        startTutorial();
        return;
    }

    // Load binary or assembly files
    if (argv.bin) {
        loadBin(argv.bin);
    } else {
        if (argv.library) {
            loadLibrary(argv.library);
        }
        if (argv.assembly) {
            await assemble(argv.assembly, argv.assembler);
        }
    }

    // Run validator if specified
    if (runValidator(argv)) {
        return;
    }

    // Check terminal size
    checkTerminalSize();

    // Display welcome banner and start interactive mode
    displayWelcomeBanner();
    creator.reset();
    interactiveMode(redrawPrompt => {
        // Store the redraw callback for use by the update checker
        redrawPromptCallback = redrawPrompt;
    });
}

// Run the CLI
main();
