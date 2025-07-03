#!/usr/bin/env -S deno run --allow-net --allow-read

import { CreatorRpcClient } from "./vscode-extension/src/creatorRpcClient.ts";

async function demonstrateHexViewer() {
    const client = new CreatorRpcClient("http://localhost:8080");

    try {
        console.log("=== CREATOR Hex Viewer Demo ===\n");

        // Load architecture
        console.log("1. Loading RISC-V architecture...");
        await client.loadArchitecture("../architecture/RISCV/RV32IMFD.yml");
        console.log("   ✓ Architecture loaded\n");

        // Create a more comprehensive test program
        const assembly = `
.data
    title:      .string "CREATOR Memory Viewer Demo"
    .align 4
    
    # Different data types with hints
    numbers:    .word 0x12345678, 0x9ABCDEF0, 0xDEADBEEF, 0xCAFEBABE
    floats:     .float 3.14159, 2.71828
    doubles:    .double 1.41421356237
    
    # String data
    message:    .string "Hello, World! This is a test."
    .align 4
    
    # Byte array
    pixels:     .byte 0xFF, 0x00, 0x00, 0xFF  # Red pixel (RGBA)
                .byte 0x00, 0xFF, 0x00, 0xFF  # Green pixel
                .byte 0x00, 0x00, 0xFF, 0xFF  # Blue pixel
                .byte 0xFF, 0xFF, 0x00, 0xFF  # Yellow pixel
    
    # Mixed data
    flags:      .byte 0x01, 0x02, 0x04, 0x08
    counts:     .half 100, 200, 300, 400
    
.text
    .globl main
main:
    # Load some addresses to demonstrate memory access
    la t0, title
    la t1, numbers
    la t2, message
    la t3, pixels
    
    # Load some values
    lw t4, 0(t1)      # Load first number
    lw t5, 4(t1)      # Load second number
    
    # Load bytes
    lb t6, 0(t3)      # Load first pixel byte
    
    # Exit
    li a7, 10
    ecall
`;

        // Compile assembly
        console.log("2. Compiling assembly program...");
        await client.compileAssembly(assembly);
        console.log("   ✓ Assembly compiled\n");

        // Execute a few steps
        console.log("3. Executing program (10 steps)...");
        for (let i = 0; i < 10; i++) {
            const result = await client.executeStep();
            if (result.completed) {
                console.log(`   ✓ Program completed at step ${i + 1}`);
                break;
            }
        }
        console.log();

        // Get memory dump
        console.log("4. Getting complete memory dump...");
        const memoryDump = await client.getMemoryDump();

        console.log(`   Memory Statistics:`);
        console.log(`   - Word size: ${memoryDump.wordSize} bytes`);
        console.log(
            `   - Highest address: 0x${memoryDump.highestAddress.toString(16).toUpperCase()}`,
        );
        console.log(`   - Total bytes written: ${memoryDump.addresses.length}`);
        console.log(`   - Memory hints: ${memoryDump.hints.length}\n`);

        // Display memory regions
        console.log("5. Memory Regions:");

        // Group addresses into regions
        const regions: Map<
            string,
            { start: number; end: number; bytes: number }
        > = new Map();

        for (const addr of memoryDump.addresses) {
            const region = addr < 0x10000 ? "Code" : "Data";
            const existing = regions.get(region);
            if (existing) {
                existing.end = Math.max(existing.end, addr);
                existing.bytes++;
            } else {
                regions.set(region, { start: addr, end: addr, bytes: 1 });
            }
        }

        for (const [name, info] of regions) {
            console.log(`   ${name} Region:`);
            console.log(
                `   - Range: 0x${info.start.toString(16).padStart(8, "0")} - 0x${info.end.toString(16).padStart(8, "0")}`,
            );
            console.log(`   - Size: ${info.bytes} bytes\n`);
        }

        // Display hints
        console.log("6. Memory Hints (Labels and Types):");
        const hintsByType = new Map<string, number>();

        for (const hint of memoryDump.hints) {
            const hintType = hint.hint.match(/<(\w+)>/)?.[1] || "label";
            hintsByType.set(hintType, (hintsByType.get(hintType) || 0) + 1);
        }

        console.log("   Hint Types:");
        for (const [type, count] of hintsByType) {
            console.log(`   - ${type}: ${count} occurrences`);
        }
        console.log();

        // Show sample memory content
        console.log("7. Sample Memory Content:");

        // Find interesting addresses (with hints)
        const interestingAddresses = memoryDump.hints.slice(0, 5);

        for (const hintInfo of interestingAddresses) {
            const addr = parseInt(hintInfo.address);
            const index = memoryDump.addresses.indexOf(addr);

            if (index !== -1) {
                const bytes: number[] = [];
                const sizeInBytes = hintInfo.sizeInBits
                    ? Math.ceil(hintInfo.sizeInBits / 8)
                    : 4;

                // Collect bytes for this hint
                for (let i = 0; i < sizeInBytes && i < 16; i++) {
                    const byteIndex = memoryDump.addresses.indexOf(addr + i);
                    if (byteIndex !== -1) {
                        bytes.push(memoryDump.values[byteIndex]);
                    } else {
                        bytes.push(0);
                    }
                }

                // Format output
                const hexBytes = bytes
                    .map(b => b.toString(16).padStart(2, "0").toUpperCase())
                    .join(" ");
                const ascii = bytes
                    .map(b =>
                        b >= 32 && b <= 126 ? String.fromCharCode(b) : ".",
                    )
                    .join("");

                console.log(
                    `   0x${addr.toString(16).padStart(8, "0")}: ${hexBytes.padEnd(48, " ")} |${ascii}|`,
                );
                console.log(
                    `   └─ ${hintInfo.hint}${hintInfo.sizeInBits ? ` (${hintInfo.sizeInBits} bits)` : ""}\n`,
                );
            }
        }

        console.log("8. Hex Viewer Features:");
        console.log("   ✓ Displays all memory up to highest written address");
        console.log("   ✓ Zero bytes are dimmed for better visibility");
        console.log("   ✓ Memory hints are color-coded by type");
        console.log(
            "   ✓ Clicking on hinted bytes shows full hint information",
        );
        console.log("   ✓ Responsive layout adapts to viewport width");
        console.log(
            "   ✓ Keyboard navigation (arrows, Home, End, PageUp/Down)",
        );
        console.log("   ✓ Configurable bytes per row (8, 16, 32, 64)");
        console.log("   ✓ ASCII representation alongside hex values");

        console.log("\n=== Demo Complete ===");
        console.log("\nTo see the hex viewer in action:");
        console.log("1. Open VSCode with the CREATOR extension");
        console.log("2. Run the command: 'CREATOR: Show Memory Hex Dump'");
        console.log(
            "3. Or open test_hex_viewer.html in a browser for a standalone demo",
        );
    } catch (error) {
        console.error("Error:", error);
    }
}

demonstrateHexViewer();
