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