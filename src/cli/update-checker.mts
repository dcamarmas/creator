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
 * Update Checker Module
 *
 * This module checks for new versions of CREATOR on GitHub and displays
 * a notification if a newer version is available.
 */

import { colorText } from "./display.mts";

const GITHUB_REPO_STABLE = "creatorsim/creator";
const GITHUB_REPO_NIGHTLY = "creatorsim/creator-beta";
const CHECK_TIMEOUT = 3000; // 3 seconds timeout

type Channel = "stable" | "nightly";

/**
 * Determine channel from version string
 */
function getChannel(version: string): Channel {
    return version.startsWith("nightly-") ? "nightly" : "stable";
}

/**
 * Parse stable version (semantic versioning)
 */
function parseStableVersion(version: string): { major: number; minor: number; patch: number; prerelease?: string } | null {
    const cleanVersion = version.replace(/^v/, "");
    const match = cleanVersion.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    
    if (!match) {
        return null;
    }
    
    return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10),
        prerelease: match[4],
    };
}
/**
 * Compare stable versions
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareStableVersions(v1: ReturnType<typeof parseStableVersion>, v2: ReturnType<typeof parseStableVersion>): number {
    if (!v1 || !v2) {
        return 0;
    }
    
    // Compare major, minor, patch
    if (v1.major !== v2.major) {
        return v1.major > v2.major ? 1 : -1;
    }
    if (v1.minor !== v2.minor) {
        return v1.minor > v2.minor ? 1 : -1;
    }
    if (v1.patch !== v2.patch) {
        return v1.patch > v2.patch ? 1 : -1;
    }
    
    // Handle prerelease versions
    if (!v1.prerelease && v2.prerelease) {
        return 1; // stable > prerelease
    }
    if (v1.prerelease && !v2.prerelease) {
        return -1; // prerelease < stable
    }
    
    return 0;
}

/**
 * Fetch latest version from GitHub
 */
async function fetchLatestVersion(channel: Channel): Promise<string | null> {
    try {
        const repo = channel === "stable" ? GITHUB_REPO_STABLE : GITHUB_REPO_NIGHTLY;
        const apiUrl = channel === "stable"
            ? `https://api.github.com/repos/${repo}/releases/latest`
            : `https://api.github.com/repos/${repo}/releases/tags/nightly`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT);
        
        const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers: {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "CREATOR-CLI",
            },
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        
        // For nightly channel, create a version string from the target_commitish (commit SHA)
        if (channel === "nightly" && data.target_commitish) {
            // Use first 7 characters of commit SHA
            const shortSha = data.target_commitish.substring(0, 7);
            return `nightly-${shortSha}`;
        }
        
        return data.tag_name || data.name || null;
    } catch {
        // Silently fail - network issues shouldn't prevent CLI from working
        return null;
    }
}

/**
 * Check for updates and display notification if available
 */
export async function checkForUpdates(currentVersion: string, onUpdateDisplayed?: () => void): Promise<void> {
    try {
        const channel = getChannel(currentVersion);
        const latestVersion = await fetchLatestVersion(channel);
        
        if (!latestVersion) {
            return;
        }
        
        let hasUpdate = false;
        
        if (channel === "nightly") {
            // For nightly, just compare the names (unless current is dev)
            if (currentVersion !== latestVersion && !currentVersion.includes("dev")) {
                hasUpdate = true;
            }
        } else {
            // For stable, compare semantic versions
            const current = parseStableVersion(currentVersion);
            const latest = parseStableVersion(latestVersion);
            
            if (current && latest) {
                hasUpdate = compareStableVersions(latest, current) > 0;
            }
        }
        
        if (hasUpdate) {
            displayUpdateNotification(currentVersion, latestVersion, channel);
            onUpdateDisplayed?.();
        }
    } catch {
        // Silently fail - update check errors shouldn't affect CLI operation
    }
}

/**
 * Display update notification
 */
function displayUpdateNotification(currentVersion: string, latestVersion: string, channel: Channel): void {
    const repo = channel === "stable" ? GITHUB_REPO_STABLE : GITHUB_REPO_NIGHTLY;
    const channelName = channel === "stable" ? "Stable" : "Nightly";
    const releaseUrl = channel === "stable"
        ? `https://github.com/${repo}/releases/latest`
        : `https://github.com/${repo}/releases/tag/nightly`;
    
    console.log();
    console.log(colorText(`Update Available! (${channelName} Channel)`, "33;1")); // bold yellow
    console.log();
    console.log(colorText(`Current version: ${currentVersion}`, "2")); // dim
    console.log(colorText(`Latest version:  ${latestVersion}`, "32")); // green
    console.log();
    console.log(colorText(`Download: ${releaseUrl}`, "36")); // cyan
    console.log();
}
