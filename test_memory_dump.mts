#!/usr/bin/env -S deno run --allow-net --allow-read

import { CreatorRpcClient } from "./vscode-extension/src/creatorRpcClient.ts";

async function testMemoryDump() {
    const client = new CreatorRpcClient("http://localhost:8080");

    try {
        // Load architecture
        console.log("Loading RISC-V architecture...");
        await client.loadArchitecture("../architecture/RISCV/RV32IMFD.yml");

        // Compile assembly
        console.log("Compiling assembly...");
        const assembly = await Deno.readTextFile("./test_memory.s");
        await client.compileAssembly(assembly);

        // Execute a few steps to load data into memory
        console.log("Executing steps...");
        for (let i = 0; i < 5; i++) {
            await client.executeStep();
        }

        // Get memory dump
        console.log("\nGetting memory dump...");
        const memoryDump = await client.getMemoryDump();

        console.log("Memory Dump:");
        console.log(`- Word size: ${memoryDump.wordSize}`);
        console.log(
            `- Highest address: 0x${memoryDump.highestAddress.toString(16)}`,
        );
        console.log(`- Written addresses: ${memoryDump.addresses.length}`);
        console.log(`- Hints: ${memoryDump.hints.length}`);

        // Show first few memory entries
        console.log("\nFirst 10 memory entries:");
        for (let i = 0; i < Math.min(10, memoryDump.addresses.length); i++) {
            const addr = memoryDump.addresses[i];
            const value = memoryDump.values[i];
            console.log(
                `  0x${addr.toString(16).padStart(8, "0")}: 0x${value.toString(16).padStart(2, "0")} (${value})`,
            );
        }

        // Show hints
        if (memoryDump.hints.length > 0) {
            console.log("\nMemory hints:");
            for (const hint of memoryDump.hints) {
                console.log(
                    `  ${hint.address}: ${hint.hint}${hint.sizeInBits ? ` (${hint.sizeInBits} bits)` : ""}`,
                );
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

testMemoryDump();
