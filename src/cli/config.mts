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

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import process from "node:process";
import type { ConfigType } from "./types.mts";

// Default config path
export const CONFIG_PATH = path.join(
    process.env.HOME || ".",
    ".config",
    "creator",
    "config.yml",
);

// Default configuration
export const DEFAULT_CONFIG: ConfigType = {
    settings: {
        max_states: 0,
        accessible: false,
        keyboard_shortcuts: true,
        auto_list_after_shortcuts: true,
    },
    aliases: {},
    shortcuts: {},
};

/**
 * Load configuration from YAML file
 * Creates default config if file doesn't exist
 */
export function loadConfiguration(configPath: string = CONFIG_PATH): ConfigType {
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
