/**
 * Copyright 2018-2025 CREATOR Team.
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

import process from "node:process";
import { cliState } from "../state.mts";
import { clearConsole, colorText, CLI_VERSION, CREATOR_ASCII } from "../display.mts";
import { CONFIG_PATH } from "../config.mts";
import { getVersion } from "../version.mts";

/**
 * Handle about command - display version and system info
 */
export function handleAboutCommand(): void {
    clearConsole();

    const creatorVersion = getVersion();

    if (!cliState.accessible) {
        const coloredASCII = CREATOR_ASCII
            .split("\n")
            .map(line => colorText(line, "32"))
            .join("\n");
        console.log(coloredASCII);

        console.log("\n" + "╔" + "═".repeat(60) + "╗");
        console.log("║" + " CREATOR Information".padEnd(60) + "║");
        console.log("╠" + "═".repeat(60) + "╣");

        console.log(
            "║" +
                colorText(" ⚙️  CREATOR CLI Version:", "33") +
                ` ${CLI_VERSION}`.padEnd(36) +
                "║",
        );
        console.log(
            "║" +
                colorText(" 🚀 CREATOR Core Version:", "33") +
                ` ${creatorVersion}`.padEnd(35 - creatorVersion.length + " 6.0.0".length) +
                "║",
        );
        console.log(
            "║" +
                colorText(" 🔧 Deno Version:", "33") +
                ` ${Deno.version.deno}`.padEnd(43) +
                "║",
        );

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
        console.log(
            "CREATOR - didaCtic and geneRic assEmbly progrAmming simulaTOR",
        );
        console.log("\nCREATOR Information");
        console.log("CREATOR CLI Version: " + CLI_VERSION);
        console.log("CREATOR Core Version: " + creatorVersion);
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

/**
 * Handle alias command - display configured aliases
 */
export function handleAliasCommand(): void {
    if (Object.keys(cliState.config.aliases).length === 0) {
        console.log("No aliases defined.");
        return;
    }

    console.log("Current command aliases:");

    if (cliState.accessible) {
        Object.entries(cliState.config.aliases).forEach(([alias, command]) => {
            console.log(`'${alias}' > '${command}'`);
        });
    } else {
        const maxAliasLength = Math.max(
            ...Object.keys(cliState.config.aliases).map(a => a.length),
        );

        Object.entries(cliState.config.aliases)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([alias, command]) => {
                const paddedAlias = alias.padEnd(maxAliasLength);
                console.log(`  ${colorText(paddedAlias, "36")} → ${command}`);
            });
    }

    console.log("\nAliases can be defined in your config file at:");
    console.log(CONFIG_PATH);
}
