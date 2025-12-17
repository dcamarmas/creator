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

/**
 * Version Management Module
 *
 * This module determines the current version of CREATOR based on:
 * - Nightly channel: nightly-<commit-sha> (from CREATOR_COMMIT env var)
 * - Stable channel: use package.json version
 */

import packageJson from "../../package.json" with { type: "json" };

/**
 * Determine if this is a nightly build
 * Can be set via CREATOR_CHANNEL environment variable or inferred from package.json
 */
function isNightlyBuild(): boolean {
    // Check environment variable first
    const channel = Deno.env.get("CREATOR_CHANNEL")?.toLowerCase();
    if (channel === "nightly") {
        return true;
    }
    if (channel === "stable") {
        return false;
    }
    
    // Infer from package.json version
    // If version contains prerelease identifiers, treat as nightly
    return /-(beta|alpha|rc|nightly)/i.test(packageJson.version);
}

/**
 * Generate nightly version string based on commit SHA
 * Uses short commit SHA (first 7 characters)
 */
function generateNightlyVersion(): string {
    const commitSha = Deno.env.get("CREATOR_COMMIT");
    if (!commitSha) {
        // If unset, it's a dev build
        return "nightly-dev";
    }
    
    // Use first 7 characters of commit SHA (standard short SHA length)
    const shortSha = commitSha.substring(0, 7);
    return `nightly-${shortSha}`;
}

/**
 * Get the current version of CREATOR
 * 
 * - Nightly channel: Returns nightly-<commit-sha> (from CREATOR_COMMIT env var)
 * - Stable channel: Returns version from package.json
 */
export function getVersion(): string {
    if (isNightlyBuild()) {
        return generateNightlyVersion();
    }
    
    return packageJson.version;
}


