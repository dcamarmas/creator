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

export function parseDebugSymbolsRASM(debugSymbols) {
    const symbols = {};
    const lines = debugSymbols.split("\n");
    for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length < 2) continue; // Skip invalid lines
        // In each line, the tag is the first element
        const tag = parts[0];
        // and the address is the third element, which is a hex number in the form "1234H"
        const address = parts[2];
        // Remove the "H" at the end and parse as hex
        const addressValue = parseInt(address.slice(0, -1), 16);
        if (!address) continue; // Skip lines without an address

        // Store the tag and address in the symbols object
        symbols[tag] = addressValue;
    }
    return symbols;
}

// Creates an address-to-tag mapping from a tag-to-address object
export function toTagInstructions(tagToAddress) {
    const addressToTag = {};
    for (const [tag, addr] of Object.entries(tagToAddress)) {
        addressToTag[addr] = { tag };
    }
    return addressToTag;
}
