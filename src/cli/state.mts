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

import type { ConfigType } from "./types.mts";
import { DEFAULT_CONFIG } from "./config.mts";

/**
 * Global CLI state management
 * Centralizes all mutable state for the CLI application
 */
class CLIState {
    /** Maximum instructions to execute in a single run */
    readonly MAX_INSTRUCTIONS = 10000000000;

    /** Whether accessible mode is enabled (for screen readers) */
    accessible = false;

    /** Address of the previously executed instruction */
    previousPC = "0x0";

    /** Maximum number of states to keep for unstepping (-1 for unlimited, 0 to disable) */
    maxStatesToKeep = 0;

    /** Stack to store previous states for unstepping */
    previousStates: string[] = [];

    /** Whether tutorial mode is active */
    tutorialMode = false;

    /** Track if a binary file was loaded */
    binaryLoaded = false;

    /** Track if execution is currently paused */
    executionPaused = false;

    /** Plugin name from architecture */
    pluginName: string | undefined = undefined;

    /** Loaded configuration */
    config: ConfigType = { ...DEFAULT_CONFIG };

    /**
     * Apply configuration settings to state
     */
    applyConfiguration(config: ConfigType): void {
        this.config = config;

        if (config.settings.max_states !== undefined) {
            this.maxStatesToKeep = config.settings.max_states;
        }

        if (config.settings.accessible !== undefined) {
            this.accessible = config.settings.accessible;
        }
    }

    /**
     * Reset execution state (used when resetting the program)
     */
    resetExecutionState(): void {
        this.previousPC = "0x0";
        this.previousStates = [];
        this.executionPaused = false;
    }

    /**
     * Save current state for unstepping
     */
    saveState(state: string): void {
        if (this.maxStatesToKeep !== 0) {
            this.previousStates.push(state);
            // If we've exceeded the maximum number of states to keep, remove the oldest one
            if (
                this.maxStatesToKeep > 0 &&
                this.previousStates.length > this.maxStatesToKeep
            ) {
                this.previousStates.shift();
            }
        }
    }

    /**
     * Pop the last saved state for unstepping
     */
    popState(): string | undefined {
        return this.previousStates.pop();
    }

    /**
     * Check if there are previous states available
     */
    hasPreviousStates(): boolean {
        return this.previousStates.length > 0;
    }
}

// Export singleton instance
export const cliState = new CLIState();
