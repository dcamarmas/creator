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

import readline from "node:readline";
import process from "node:process";
import { Buffer } from "node:buffer";
import { cliState } from "./state.mts";
import { clearConsole, colorText, CREATOR_ASCII } from "./display.mts";
import { displayHelp } from "./utils.mts";
import {
    handleStepCommand,
    handleUnstepCommand,
    handleRunCommand,
    handleContinueCommand,
    handlePauseCommand,
    handleNurCommand,
    handleResetCommand,
    handleInstructionsCommand,
    handleBreakpointCommand,
    handleBreakpointAtCurrentPC,
    handleRegCommand,
    handleMemCommand,
    handleHexViewCommand,
    handleStackCommand,
    handleSnapshotCommand,
    handleRestoreCommand,
    handleAboutCommand,
    handleAliasCommand,
} from "./commands/index.mts";

/**
 * Apply alias substitution to a command
 */
function applyAlias(
    cmd: string,
    args: string[],
): { cmd: string; args: string[] } {
    const alias = cliState.config.aliases[cmd];
    if (!alias) {
        return { cmd, args };
    }

    const aliasTokens = alias.trim().split(/\s+/);
    const aliasCmd = aliasTokens[0];
    const aliasArgs = aliasTokens.concat(args.slice(1));

    return { cmd: aliasCmd!, args: aliasArgs };
}

/**
 * Helper function to determine if a command should auto-list after execution
 */
function shouldAutoListAfterCommand(cmd: string): boolean {
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

/**
 * Handle until command - run until address
 */
function handleUntilCommand(args: string[]): void {
    if (args.length < 2) {
        console.log("Usage: until <address>");
        return;
    }
    handleBreakpointCommand(args);
    handleRunCommand(["run"]);
    handleBreakpointAtCurrentPC();
}

/**
 * Process a single command
 * Returns true if the CLI should exit
 */
export function processCommand(cmd: string, args: string[]): boolean {
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
            let limit: number | undefined;
            if (args.length > 1) {
                const arg = args[1];
                if (arg === "--limit" && args.length > 2) {
                    limit = parseInt(args[2]!, 10);
                } else if (!isNaN(Number(arg))) {
                    limit = parseInt(arg!, 10);
                }
            }
            handleInstructionsCommand(limit);
            break;
        }
        case "reset":
            handleResetCommand();
            break;
        case "clear":
            clearConsole();
            break;
        case "help":
            displayHelp();
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

/**
 * Start the interactive CLI mode
 */
export function interactiveMode(
    onReady?: (redrawPrompt: () => void) => void,
): void {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "CREATOR> ",
    });

    // Function to redraw the prompt
    const redrawPrompt = () => {
        rl.prompt(true);
    };

    const keyboardShortcutsEnabled =
        cliState.config.settings.keyboard_shortcuts !== undefined
            ? cliState.config.settings.keyboard_shortcuts
            : true;

    const autoListAfterShortcuts =
        cliState.config.settings.auto_list_after_shortcuts !== undefined
            ? cliState.config.settings.auto_list_after_shortcuts
            : false;

    console.log(colorText("Type 'help' for available commands.", "32"));
    if (cliState.accessible) {
        console.log(
            "You are in accessible mode, with special formatting for screen readers.",
        );
    }

    // Notify caller that the interface is ready, passing the redraw function
    onReady?.(redrawPrompt);

    if (keyboardShortcutsEnabled) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        process.stdin.on("data", (key: Buffer) => {
            const keyStr = key.toString();

            if (keyStr === "\r" || keyStr === "\n" || keyStr === "\r\n") {
                return;
            }

            if (
                cliState.config.shortcuts &&
                cliState.config.shortcuts[keyStr]
            ) {
                const cmd = cliState.config.shortcuts[keyStr];

                if (cmd === "break") {
                    handleBreakpointAtCurrentPC();
                } else if (cmd === "clear") {
                    clearConsole();
                } else {
                    processCommand(cmd, [cmd]);
                }

                if (autoListAfterShortcuts && shouldAutoListAfterCommand(cmd)) {
                    clearConsole();
                    handleInstructionsCommand();
                }
            }
        });
    }

    rl.prompt();

    rl.on("line", line => {
        const args = line.trim().split(/\s+/);
        const cmd = args[0]!.toLowerCase();

        try {
            if (processCommand(cmd, args)) {
                if (keyboardShortcutsEnabled) {
                    process.stdin.setRawMode(false);
                }
                rl.close();
                return;
            }
        } catch (error) {
            console.error(`Error: ${(error as Error).message}`);
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

/**
 * Display the welcome banner
 */
export function displayWelcomeBanner(): void {
    clearConsole();
    if (!cliState.accessible) {
        console.log(CREATOR_ASCII);
    }
}
