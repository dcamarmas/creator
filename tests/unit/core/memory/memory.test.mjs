import {
    assertEquals,
    assertThrows,
} from "https://deno.land/std/assert/mod.ts";

import { Memory } from "../../../../src/core/memory/Memory.mts";
import { writeFileSync, unlinkSync } from "node:fs";

Deno.test("Memory - constructor with default 8-bit bytes", () => {
    const memory = new Memory(100);
    assertEquals(memory.getBitsPerByte(), 8);
    assertEquals(memory.getMaxByteValue(), 255);
});

Deno.test("Memory - constructor with custom bits per byte", () => {
    const memory = new Memory(100, 4);
    assertEquals(memory.getBitsPerByte(), 4);
    assertEquals(memory.getMaxByteValue(), 15);
});

Deno.test("Memory - constructor throws error for invalid bits per byte", () => {
    assertThrows(
        () => new Memory(100, 0),
        Error,
        "bitsPerByte must be between 1 and 32",
    );
    assertThrows(
        () => new Memory(100, 33),
        Error,
        "bitsPerByte must be between 1 and 32",
    );
});

Deno.test("Memory - constructor with edge case bits per byte", () => {
    const memory1 = new Memory(100, 1);
    assertEquals(memory1.getBitsPerByte(), 1);
    assertEquals(memory1.getMaxByteValue(), 1);

    const memory32 = new Memory(100, 32);
    assertEquals(memory32.getBitsPerByte(), 32);
    assertEquals(memory32.getMaxByteValue(), 4294967295);
});

Deno.test("Memory - zeroOut functionality", () => {
    const memory = new Memory(10, 8);
    memory.write(0n, 255);
    memory.write(5n, 128);
    memory.zeroOut();
    assertEquals(memory.read(0n), 0);
    assertEquals(memory.read(5n), 0);
});

Deno.test("Memory - read/write 8-bit bytes", () => {
    const memory = new Memory(100, 8);

    memory.write(0n, 255);
    assertEquals(memory.read(0n), 255);

    memory.write(50n, 128);
    assertEquals(memory.read(50n), 128);

    memory.write(99n, 1);
    assertEquals(memory.read(99n), 1);
});

Deno.test("Memory - read/write 4-bit bytes", () => {
    const memory = new Memory(100, 4);

    memory.write(0n, 15);
    assertEquals(memory.read(0n), 15);

    memory.write(1n, 8);
    assertEquals(memory.read(1n), 8);

    memory.write(2n, 0);
    assertEquals(memory.read(2n), 0);
});

Deno.test("Memory - read/write 1-bit bytes", () => {
    const memory = new Memory(8, 1);

    memory.write(0n, 1);
    assertEquals(memory.read(0n), 1);

    memory.write(1n, 0);
    assertEquals(memory.read(1n), 0);

    memory.write(7n, 1);
    assertEquals(memory.read(7n), 1);
});

Deno.test("Memory - read/write 16-bit bytes", () => {
    const memory = new Memory(10, 16);

    memory.write(0n, 65535);
    assertEquals(memory.read(0n), 65535);

    memory.write(1n, 32768);
    assertEquals(memory.read(1n), 32768);

    memory.write(9n, 1);
    assertEquals(memory.read(9n), 1);
});

Deno.test("Memory - read throws error for out of bounds address", () => {
    const memory = new Memory(100, 8);
    assertThrows(
        () => memory.read(100n),
        Error,
        "Address 100 exceeds memory size 100",
    );
    assertThrows(
        () => memory.read(200n),
        Error,
        "Address 200 exceeds memory size 100",
    );
});

Deno.test("Memory - write throws error for out of bounds address", () => {
    const memory = new Memory(100, 8);
    assertThrows(
        () => memory.write(100n, 10),
        Error,
        "Address 100 exceeds memory size 100",
    );
    assertThrows(
        () => memory.write(200n, 10),
        Error,
        "Address 200 exceeds memory size 100",
    );
});

Deno.test("Memory - write throws error for value exceeding byte size", () => {
    const memory4bit = new Memory(100, 4);
    assertThrows(
        () => memory4bit.write(0n, 16),
        Error,
        "Value 16 exceeds byte size (max: 15)",
    );

    const memory8bit = new Memory(100, 8);
    assertThrows(
        () => memory8bit.write(0n, 256),
        Error,
        "Value 256 exceeds byte size (max: 255)",
    );
});

Deno.test("Memory - write throws error for negative values", () => {
    const memory = new Memory(100, 8);
    assertThrows(
        () => memory.write(0n, -1),
        Error,
        "Value -1 exceeds byte size (max: 255)",
    );
});

Deno.test("Memory - multiple byte values don't interfere (4-bit)", () => {
    const memory = new Memory(10, 4);

    memory.write(0n, 15);
    memory.write(1n, 8);
    memory.write(2n, 3);
    memory.write(3n, 0);

    assertEquals(memory.read(0n), 15);
    assertEquals(memory.read(1n), 8);
    assertEquals(memory.read(2n), 3);
    assertEquals(memory.read(3n), 0);
});

Deno.test("Memory - multiple byte values don't interfere (1-bit)", () => {
    const memory = new Memory(16, 1);

    for (let i = 0; i < 16; i++) {
        memory.write(BigInt(i), i % 2);
    }

    for (let i = 0; i < 16; i++) {
        assertEquals(memory.read(BigInt(i)), i % 2);
    }
});

Deno.test("Memory - loadROM with 8-bit memory", () => {
    const memory = new Memory(100, 8);
    const romData = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]);

    memory.loadROM(romData, 10n);

    assertEquals(memory.read(10n), 0x01);
    assertEquals(memory.read(11n), 0x02);
    assertEquals(memory.read(12n), 0x03);
    assertEquals(memory.read(13n), 0x04);
    assertEquals(memory.read(14n), 0x05);
});

Deno.test("Memory - loadROM throws error for non-8-bit memory", () => {
    const memory = new Memory(100, 4);
    const romData = new Uint8Array([0x01, 0x02]);

    assertThrows(
        () => memory.loadROM(romData),
        Error,
        "loadROM only supports 8-bit bytes. Use loadCustomROM for other byte sizes.",
    );
});

Deno.test("Memory - loadCustomROM with various byte sizes", () => {
    const memory4bit = new Memory(100, 4);
    const romData4bit = [15, 8, 3, 0, 12];

    memory4bit.loadCustomROM(romData4bit, 5n);

    assertEquals(memory4bit.read(5n), 15);
    assertEquals(memory4bit.read(6n), 8);
    assertEquals(memory4bit.read(7n), 3);
    assertEquals(memory4bit.read(8n), 0);
    assertEquals(memory4bit.read(9n), 12);
});

Deno.test("Memory - loadBinaryFile", () => {
    const memory = new Memory(100, 8);
    const testData = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]);
    const testFile = "/tmp/test_memory.bin";

    // Create test file
    writeFileSync(testFile, testData);

    try {
        memory.loadBinaryFile(testFile, 20n);

        assertEquals(memory.read(20n), 0xaa);
        assertEquals(memory.read(21n), 0xbb);
        assertEquals(memory.read(22n), 0xcc);
        assertEquals(memory.read(23n), 0xdd);
    } finally {
        // Clean up test file
        unlinkSync(testFile);
    }
});

Deno.test("Memory - readBytes", () => {
    const memory = new Memory(100, 8);
    memory.write(10n, 0x10);
    memory.write(11n, 0x20);
    memory.write(12n, 0x30);
    memory.write(13n, 0x40);

    const bytes = memory.readBytes(10n, 4);
    assertEquals(bytes, [0x10, 0x20, 0x30, 0x40]);
});

Deno.test("Memory - readBytes with 4-bit memory", () => {
    const memory = new Memory(100, 4);
    memory.write(5n, 15);
    memory.write(6n, 8);
    memory.write(7n, 3);

    const bytes = memory.readBytes(5n, 3);
    assertEquals(bytes, [15, 8, 3]);
});

Deno.test("Memory - dump and restore 8-bit memory", () => {
    const memory = new Memory(10, 8);

    // Write some data
    memory.write(0n, 100);
    memory.write(3n, 200);
    memory.write(9n, 50);

    // Dump memory
    const dump = memory.dump();
    assertEquals(dump.buffer.length, 10);
    assertEquals(dump.buffer[0], 100);
    assertEquals(dump.buffer[3], 200);
    assertEquals(dump.buffer[9], 50);

    // Clear memory
    memory.zeroOut();
    assertEquals(memory.read(0n), 0);
    assertEquals(memory.read(3n), 0);
    assertEquals(memory.read(9n), 0);

    // Restore from dump
    memory.restore(dump);
    assertEquals(memory.read(0n), 100);
    assertEquals(memory.read(3n), 200);
    assertEquals(memory.read(9n), 50);
});

Deno.test("Memory - dump and restore 4-bit memory", () => {
    const memory = new Memory(8, 4);

    // Write some data
    memory.write(0n, 15);
    memory.write(3n, 8);
    memory.write(7n, 1);

    // Dump and restore
    const dump = memory.dump();
    memory.zeroOut();
    memory.restore(dump);

    assertEquals(memory.read(0n), 15);
    assertEquals(memory.read(3n), 8);
    assertEquals(memory.read(7n), 1);
});

Deno.test("Memory - restore throws error for mismatched dump size", () => {
    const memory = new Memory(10, 8);
    const wrongSizeDump = [1, 2, 3]; // Should be 10 elements

    assertThrows(
        () => memory.restore(wrongSizeDump),
        Error,
        "Dump metadata does not match current memory configuration",
    );
});

Deno.test("Memory - getBitsPerByte and getMaxByteValue", () => {
    const memory8 = new Memory(100, 8);
    assertEquals(memory8.getBitsPerByte(), 8);
    assertEquals(memory8.getMaxByteValue(), 255);

    const memory12 = new Memory(100, 12);
    assertEquals(memory12.getBitsPerByte(), 12);
    assertEquals(memory12.getMaxByteValue(), 4095);
});

Deno.test("Memory - stress test with random values", () => {
    const memory = new Memory(1000, 8);
    const testData = new Map();

    // Write random values
    for (let i = 0; i < 100; i++) {
        const addr = BigInt(Math.floor(Math.random() * 1000));
        const value = Math.floor(Math.random() * 256);
        memory.write(addr, value);
        testData.set(addr, value);
    }

    // Verify all values
    for (const [addr, expectedValue] of testData) {
        assertEquals(memory.read(addr), expectedValue);
    }
});

Deno.test("Memory - edge case: writing max values", () => {
    const memory4 = new Memory(10, 4);
    const memory8 = new Memory(10, 8);
    const memory16 = new Memory(10, 16);

    memory4.write(0n, 15); // Max for 4-bit
    memory8.write(0n, 255); // Max for 8-bit
    memory16.write(0n, 65535); // Max for 16-bit

    assertEquals(memory4.read(0n), 15);
    assertEquals(memory8.read(0n), 255);
    assertEquals(memory16.read(0n), 65535);
});

Deno.test("Memory - boundary testing for complex bit patterns", () => {
    const memory = new Memory(100, 7); // 7-bit bytes (127 max)

    memory.write(0n, 127);
    memory.write(1n, 64);
    memory.write(2n, 1);
    memory.write(3n, 0);

    assertEquals(memory.read(0n), 127);
    assertEquals(memory.read(1n), 64);
    assertEquals(memory.read(2n), 1);
    assertEquals(memory.read(3n), 0);
});

Deno.test("Memory - large memory allocation", () => {
    const memory = new Memory(100000, 8);

    // Test writing to various positions
    memory.write(0n, 0xaa);
    memory.write(50000n, 0xbb);
    memory.write(99999n, 0xcc);

    assertEquals(memory.read(0n), 0xaa);
    assertEquals(memory.read(50000n), 0xbb);
    assertEquals(memory.read(99999n), 0xcc);
});

Deno.test("Memory - sequential write/read operations", () => {
    const memory = new Memory(256, 8);

    // Write sequential values
    for (let i = 0; i < 256; i++) {
        memory.write(BigInt(i), i);
    }

    // Read and verify sequential values
    for (let i = 0; i < 256; i++) {
        assertEquals(memory.read(BigInt(i)), i);
    }
});

Deno.test("Memory - non-aligned bit boundaries (3-bit bytes)", () => {
    const memory = new Memory(16, 3); // 3-bit bytes (max value 7)

    for (let i = 0; i < 16; i++) {
        const value = i % 8; // 0-7 range for 3-bit
        memory.write(BigInt(i), value);
    }

    for (let i = 0; i < 16; i++) {
        const expectedValue = i % 8;
        assertEquals(memory.read(BigInt(i)), expectedValue);
    }
});

Deno.test("Memory - 3-bit bytes comprehensive test", () => {
    const memory = new Memory(20, 3);
    assertEquals(memory.getBitsPerByte(), 3);
    assertEquals(memory.getMaxByteValue(), 7);

    // Test all possible values for 3-bit
    for (let i = 0; i <= 7; i++) {
        memory.write(BigInt(i), i);
        assertEquals(memory.read(BigInt(i)), i);
    }

    // Test value overflow
    assertThrows(
        () => memory.write(0n, 8),
        Error,
        "Value 8 exceeds byte size (max: 7)",
    );
});

Deno.test("Memory - 5-bit bytes test", () => {
    const memory = new Memory(15, 5);
    assertEquals(memory.getBitsPerByte(), 5);
    assertEquals(memory.getMaxByteValue(), 31);

    // Test boundary values
    memory.write(0n, 0);
    memory.write(1n, 31); // max value
    memory.write(2n, 16); // middle value
    memory.write(3n, 15); // 2^4 - 1
    memory.write(4n, 17); // 2^4 + 1

    assertEquals(memory.read(0n), 0);
    assertEquals(memory.read(1n), 31);
    assertEquals(memory.read(2n), 16);
    assertEquals(memory.read(3n), 15);
    assertEquals(memory.read(4n), 17);

    // Test overflow
    assertThrows(
        () => memory.write(0n, 32),
        Error,
        "Value 32 exceeds byte size (max: 31)",
    );
});

Deno.test("Memory - 6-bit bytes test", () => {
    const memory = new Memory(12, 6);
    assertEquals(memory.getBitsPerByte(), 6);
    assertEquals(memory.getMaxByteValue(), 63);

    // Test various values
    memory.write(0n, 0);
    memory.write(1n, 63); // max value
    memory.write(2n, 32); // half max
    memory.write(3n, 1);
    memory.write(4n, 42);

    assertEquals(memory.read(0n), 0);
    assertEquals(memory.read(1n), 63);
    assertEquals(memory.read(2n), 32);
    assertEquals(memory.read(3n), 1);
    assertEquals(memory.read(4n), 42);
});

Deno.test("Memory - 7-bit bytes test", () => {
    const memory = new Memory(10, 7);
    assertEquals(memory.getBitsPerByte(), 7);
    assertEquals(memory.getMaxByteValue(), 127);

    // Test boundary values
    memory.write(0n, 0);
    memory.write(1n, 127); // max value
    memory.write(2n, 64); // half max
    memory.write(3n, 126); // max - 1
    memory.write(4n, 100); // arbitrary value

    assertEquals(memory.read(0n), 0);
    assertEquals(memory.read(1n), 127);
    assertEquals(memory.read(2n), 64);
    assertEquals(memory.read(3n), 126);
    assertEquals(memory.read(4n), 100);

    // Test overflow
    assertThrows(
        () => memory.write(0n, 128),
        Error,
        "Value 128 exceeds byte size (max: 127)",
    );
});

Deno.test("Memory - 9-bit bytes test", () => {
    const memory = new Memory(8, 9);
    assertEquals(memory.getBitsPerByte(), 9);
    assertEquals(memory.getMaxByteValue(), 511);

    // Test boundary values
    memory.write(0n, 0);
    memory.write(1n, 511); // max value
    memory.write(2n, 256); // 2^8
    memory.write(3n, 255); // 2^8 - 1
    memory.write(4n, 300); // arbitrary value

    assertEquals(memory.read(0n), 0);
    assertEquals(memory.read(1n), 511);
    assertEquals(memory.read(2n), 256);
    assertEquals(memory.read(3n), 255);
    assertEquals(memory.read(4n), 300);
});

Deno.test("Memory - 10-bit bytes test", () => {
    const memory = new Memory(6, 10);
    assertEquals(memory.getBitsPerByte(), 10);
    assertEquals(memory.getMaxByteValue(), 1023);

    // Test boundary values
    memory.write(0n, 0);
    memory.write(1n, 1023); // max value
    memory.write(2n, 512); // half max
    memory.write(3n, 1000); // close to max

    assertEquals(memory.read(0n), 0);
    assertEquals(memory.read(1n), 1023);
    assertEquals(memory.read(2n), 512);
    assertEquals(memory.read(3n), 1000);

    // Test overflow
    assertThrows(
        () => memory.write(0n, 1024),
        Error,
        "Value 1024 exceeds byte size (max: 1023)",
    );
});

Deno.test("Memory - 11-bit bytes test", () => {
    const memory = new Memory(5, 11);
    assertEquals(memory.getBitsPerByte(), 11);
    assertEquals(memory.getMaxByteValue(), 2047);

    // Test boundary values
    memory.write(0n, 0);
    memory.write(1n, 2047); // max value
    memory.write(2n, 1024); // 2^10
    memory.write(3n, 2000); // close to max

    assertEquals(memory.read(0n), 0);
    assertEquals(memory.read(1n), 2047);
    assertEquals(memory.read(2n), 1024);
    assertEquals(memory.read(3n), 2000);
});

Deno.test("Memory - 12-bit bytes test", () => {
    const memory = new Memory(5, 12);
    assertEquals(memory.getBitsPerByte(), 12);
    assertEquals(memory.getMaxByteValue(), 4095);

    // Test boundary values
    memory.write(0n, 0);
    memory.write(1n, 4095); // max value
    memory.write(2n, 2048); // half max
    memory.write(3n, 4000); // close to max

    assertEquals(memory.read(0n), 0);
    assertEquals(memory.read(1n), 4095);
    assertEquals(memory.read(2n), 2048);
    assertEquals(memory.read(3n), 4000);
});

Deno.test("Memory - 13-bit bytes test", () => {
    const memory = new Memory(4, 13);
    assertEquals(memory.getBitsPerByte(), 13);
    assertEquals(memory.getMaxByteValue(), 8191);

    // Test boundary values
    memory.write(0n, 0);
    memory.write(1n, 8191); // max value
    memory.write(2n, 4096); // 2^12
    memory.write(3n, 8000); // close to max

    assertEquals(memory.read(0n), 0);
    assertEquals(memory.read(1n), 8191);
    assertEquals(memory.read(2n), 4096);
    assertEquals(memory.read(3n), 8000);
});

Deno.test("Memory - 15-bit bytes test", () => {
    const memory = new Memory(3, 15);
    assertEquals(memory.getBitsPerByte(), 15);
    assertEquals(memory.getMaxByteValue(), 32767);

    // Test boundary values
    memory.write(0n, 0);
    memory.write(1n, 32767); // max value
    memory.write(2n, 16384); // half max

    assertEquals(memory.read(0n), 0);
    assertEquals(memory.read(1n), 32767);
    assertEquals(memory.read(2n), 16384);
});

Deno.test("Memory - uneven byte sizes with sequential operations", () => {
    const memory3bit = new Memory(20, 3);
    const memory5bit = new Memory(15, 5);
    const memory7bit = new Memory(10, 7);

    // Fill with sequential values within limits
    for (let i = 0; i < 8; i++) {
        memory3bit.write(BigInt(i), i % 8);
    }
    for (let i = 0; i < 15; i++) {
        memory5bit.write(BigInt(i), i % 32);
    }
    for (let i = 0; i < 10; i++) {
        memory7bit.write(BigInt(i), i % 128);
    }

    // Verify all values
    for (let i = 0; i < 8; i++) {
        assertEquals(memory3bit.read(BigInt(i)), i % 8);
    }
    for (let i = 0; i < 15; i++) {
        assertEquals(memory5bit.read(BigInt(i)), i % 32);
    }
    for (let i = 0; i < 10; i++) {
        assertEquals(memory7bit.read(BigInt(i)), i % 128);
    }
});

Deno.test("Memory - uneven byte sizes with dump/restore", () => {
    const memory = new Memory(8, 5); // 5-bit bytes

    // Write some data
    memory.write(0n, 31);
    memory.write(1n, 15);
    memory.write(2n, 7);
    memory.write(3n, 0);
    memory.write(4n, 20);

    // Dump memory
    const dump = memory.dump();
    // assertEquals(dump.buffer.length, 5);
    // assertEquals(dump.buffer[0], 31);
    // assertEquals(dump.buffer[1], 15);
    // assertEquals(dump.buffer[2], 7);
    // assertEquals(dump.buffer[3], 0);
    // assertEquals(dump.buffer[4], 20);

    // Clear and restore
    memory.zeroOut();
    memory.restore(dump);

    // Verify restoration
    assertEquals(memory.read(0n), 31);
    assertEquals(memory.read(1n), 15);
    assertEquals(memory.read(2n), 7);
    assertEquals(memory.read(3n), 0);
    assertEquals(memory.read(4n), 20);
});

Deno.test("Memory - uneven byte sizes with readBytes", () => {
    const memory = new Memory(10, 6); // 6-bit bytes (max value 63)

    // Write test data
    memory.write(0n, 63);
    memory.write(1n, 32);
    memory.write(2n, 16);
    memory.write(3n, 8);
    memory.write(4n, 4);

    // Read multiple bytes
    const bytes = memory.readBytes(0n, 5);
    assertEquals(bytes, [63, 32, 16, 8, 4]);
});

Deno.test(
    "Memory - stress test with 3-bit bytes and bit boundary crossings",
    () => {
        const memory = new Memory(32, 3); // 3-bit bytes, will create many boundary crossings

        // Fill memory with pattern that exercises bit boundaries
        for (let i = 0; i < 32; i++) {
            const value = (i * 3) % 8; // Pattern: 0,3,6,1,4,7,2,5,0,3,6,1...
            memory.write(BigInt(i), value);
        }

        // Verify pattern
        for (let i = 0; i < 32; i++) {
            const expected = (i * 3) % 8;
            assertEquals(memory.read(BigInt(i)), expected);
        }
    },
);

Deno.test("Memory - edge case: prime number bit sizes", () => {
    // Test with prime number bit sizes (these are especially tricky for bit alignment)
    const sizes = [3, 5, 7, 11, 13, 17, 19, 23, 29];

    sizes.forEach(bits => {
        if (bits <= 32) {
            // Stay within our constraint
            const memory = new Memory(4, bits);
            const maxValue = (1 << bits) - 1;

            assertEquals(memory.getBitsPerByte(), bits);
            assertEquals(memory.getMaxByteValue(), maxValue);

            // Test writing and reading max value
            memory.write(0n, maxValue);
            assertEquals(memory.read(0n), maxValue);

            // Test writing and reading 0
            memory.write(1n, 0);
            assertEquals(memory.read(1n), 0);

            // Test writing and reading middle value if possible
            if (maxValue > 1) {
                const midValue = Math.floor(maxValue / 2);
                memory.write(2n, midValue);
                assertEquals(memory.read(2n), midValue);
            }
        }
    });
});

Deno.test("Memory - complex bit pattern test with 14-bit bytes", () => {
    const memory = new Memory(8, 14);
    assertEquals(memory.getMaxByteValue(), 16383);

    // Test various bit patterns
    const testValues = [
        0, // All zeros
        16383, // All ones (max value)
        8192, // 10000000000000 (bit 13 set)
        4096, // 01000000000000 (bit 12 set)
        2048, // 00100000000000 (bit 11 set)
        1024, // 00010000000000 (bit 10 set)
        5461, // 01010101010101 (alternating pattern)
        10922, // 10101010101010 (opposite alternating)
    ];

    testValues.forEach((value, index) => {
        memory.write(BigInt(index), value);
        assertEquals(memory.read(BigInt(index)), value);
    });
});
