import {
    assertEquals,
    assertThrows,
    assertNotEquals,
} from "https://deno.land/std/assert/mod.ts";

import { Memory } from "../../../../src/core/memory/Memory.mts";

Deno.test("Memory - constructor with default 8-bit bytes", () => {
    const memory = new Memory({ sizeInBytes: 100 });
    assertEquals(memory.getBitsPerByte(), 8);
    assertEquals(memory.getMaxByteValue(), 255);
});

Deno.test("Memory - constructor with custom bits per byte", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 4 });
    assertEquals(memory.getBitsPerByte(), 4);
    assertEquals(memory.getMaxByteValue(), 15);
});

Deno.test("Memory - constructor throws error for invalid bits per byte", () => {
    assertThrows(
        () => new Memory({ sizeInBytes: 100, bitsPerByte: 0 }),
        Error,
        "bitsPerByte must be between 1 and 32",
    );
    assertThrows(
        () => new Memory({ sizeInBytes: 100, bitsPerByte: 33 }),
        Error,
        "bitsPerByte must be between 1 and 32",
    );
});

Deno.test("Memory - constructor with edge case bits per byte", () => {
    const memory1 = new Memory({ sizeInBytes: 100, bitsPerByte: 1 });
    assertEquals(memory1.getBitsPerByte(), 1);
    assertEquals(memory1.getMaxByteValue(), 1);

    const memory32 = new Memory({ sizeInBytes: 100, bitsPerByte: 32 });
    assertEquals(memory32.getBitsPerByte(), 32);
    assertEquals(memory32.getMaxByteValue(), 4294967295);
});

Deno.test("Memory - zeroOut functionality", () => {
    const memory = new Memory({ sizeInBytes: 10, bitsPerByte: 8 });
    memory.write(0n, 255);
    memory.write(5n, 128);
    memory.zeroOut();
    assertEquals(memory.read(0n), 0);
    assertEquals(memory.read(5n), 0);
});

Deno.test("Memory - read/write 8-bit bytes", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });

    memory.write(0n, 255);
    assertEquals(memory.read(0n), 255);

    memory.write(50n, 128);
    assertEquals(memory.read(50n), 128);

    memory.write(99n, 1);
    assertEquals(memory.read(99n), 1);
});

Deno.test("Memory - read/write 4-bit bytes", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 4 });

    memory.write(0n, 15);
    assertEquals(memory.read(0n), 15);

    memory.write(1n, 8);
    assertEquals(memory.read(1n), 8);

    memory.write(2n, 0);
    assertEquals(memory.read(2n), 0);
});

Deno.test("Memory - read/write 1-bit bytes", () => {
    const memory = new Memory({ sizeInBytes: 8, bitsPerByte: 1 });

    memory.write(0n, 1);
    assertEquals(memory.read(0n), 1);

    memory.write(1n, 0);
    assertEquals(memory.read(1n), 0);

    memory.write(7n, 1);
    assertEquals(memory.read(7n), 1);
});

Deno.test("Memory - read/write 16-bit bytes", () => {
    const memory = new Memory({ sizeInBytes: 10, bitsPerByte: 16 });

    memory.write(0n, 65535);
    assertEquals(memory.read(0n), 65535);

    memory.write(1n, 32768);
    assertEquals(memory.read(1n), 32768);

    memory.write(9n, 1);
    assertEquals(memory.read(9n), 1);
});

Deno.test("Memory - read throws error for out of bounds address", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });
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
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });
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
    const memory4bit = new Memory({ sizeInBytes: 100, bitsPerByte: 4 });
    assertThrows(
        () => memory4bit.write(0n, 16),
        Error,
        "Value 16 exceeds byte size (max: 15)",
    );

    const memory8bit = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });
    assertThrows(
        () => memory8bit.write(0n, 256),
        Error,
        "Value 256 exceeds byte size (max: 255)",
    );
});

Deno.test("Memory - write throws error for negative values", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });
    assertThrows(
        () => memory.write(0n, -1),
        Error,
        "Value -1 exceeds byte size (max: 255)",
    );
});

Deno.test("Memory - multiple byte values don't interfere (4-bit)", () => {
    const memory = new Memory({ sizeInBytes: 10, bitsPerByte: 4 });

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
    const memory = new Memory({ sizeInBytes: 16, bitsPerByte: 1 });

    for (let i = 0; i < 16; i++) {
        memory.write(BigInt(i), i % 2);
    }

    for (let i = 0; i < 16; i++) {
        assertEquals(memory.read(BigInt(i)), i % 2);
    }
});

Deno.test("Memory - loadROM with 8-bit memory", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });
    const romData = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]);

    memory.loadROM(romData, 10n);

    assertEquals(memory.read(10n), 0x01);
    assertEquals(memory.read(11n), 0x02);
    assertEquals(memory.read(12n), 0x03);
    assertEquals(memory.read(13n), 0x04);
    assertEquals(memory.read(14n), 0x05);
});

Deno.test("Memory - loadROM throws error for non-8-bit memory", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 4 });
    const romData = new Uint8Array([0x01, 0x02]);

    assertThrows(
        () => memory.loadROM(romData),
        Error,
        "loadROM only supports 8-bit bytes. Use loadCustomROM for other byte sizes.",
    );
});

Deno.test("Memory - loadCustomROM with various byte sizes", () => {
    const memory4bit = new Memory({ sizeInBytes: 100, bitsPerByte: 4 });
    const romData4bit = [15, 8, 3, 0, 12];

    memory4bit.loadCustomROM(romData4bit, 5n);

    assertEquals(memory4bit.read(5n), 15);
    assertEquals(memory4bit.read(6n), 8);
    assertEquals(memory4bit.read(7n), 3);
    assertEquals(memory4bit.read(8n), 0);
    assertEquals(memory4bit.read(9n), 12);
});

Deno.test("Memory - readBytes", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });
    memory.write(10n, 0x10);
    memory.write(11n, 0x20);
    memory.write(12n, 0x30);
    memory.write(13n, 0x40);

    const bytes = memory.readBytes(10n, 4);
    assertEquals(bytes, [0x10, 0x20, 0x30, 0x40]);
});

Deno.test("Memory - readBytes with 4-bit memory", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 4 });
    memory.write(5n, 15);
    memory.write(6n, 8);
    memory.write(7n, 3);

    const bytes = memory.readBytes(5n, 3);
    assertEquals(bytes, [15, 8, 3]);
});

Deno.test("Memory - dump and restore 8-bit memory", () => {
    const memory = new Memory({ sizeInBytes: 10, bitsPerByte: 8 });

    // Write some data
    memory.write(0n, 100);
    memory.write(3n, 200);
    memory.write(9n, 50);

    // Dump memory
    const dump = memory.dump();

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
    const memory = new Memory({ sizeInBytes: 8, bitsPerByte: 4 });

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
    const memory = new Memory({ sizeInBytes: 10, bitsPerByte: 8 });
    const wrongSizeDump = [1, 2, 3]; // Should be 10 elements

    assertThrows(
        () => memory.restore(wrongSizeDump),
        Error,
        "Dump metadata does not match current memory configuration",
    );
});

Deno.test("Memory - getBitsPerByte and getMaxByteValue", () => {
    const memory8 = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });
    assertEquals(memory8.getBitsPerByte(), 8);
    assertEquals(memory8.getMaxByteValue(), 255);

    const memory12 = new Memory({ sizeInBytes: 100, bitsPerByte: 12 });
    assertEquals(memory12.getBitsPerByte(), 12);
    assertEquals(memory12.getMaxByteValue(), 4095);
});

Deno.test("Memory - stress test with random values", () => {
    const memory = new Memory({ sizeInBytes: 1000, bitsPerByte: 8 });
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
    const memory4 = new Memory({ sizeInBytes: 10, bitsPerByte: 4 });
    const memory8 = new Memory({ sizeInBytes: 10, bitsPerByte: 8 });
    const memory16 = new Memory({ sizeInBytes: 10, bitsPerByte: 16 });

    memory4.write(0n, 15); // Max for 4-bit
    memory8.write(0n, 255); // Max for 8-bit
    memory16.write(0n, 65535); // Max for 16-bit

    assertEquals(memory4.read(0n), 15);
    assertEquals(memory8.read(0n), 255);
    assertEquals(memory16.read(0n), 65535);
});

Deno.test("Memory - boundary testing for complex bit patterns", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 7 }); // 7-bit bytes (127 max)

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
    const memory = new Memory({ sizeInBytes: 100000, bitsPerByte: 8 });

    // Test writing to various positions
    memory.write(0n, 0xaa);
    memory.write(50000n, 0xbb);
    memory.write(99999n, 0xcc);

    assertEquals(memory.read(0n), 0xaa);
    assertEquals(memory.read(50000n), 0xbb);
    assertEquals(memory.read(99999n), 0xcc);
});

Deno.test("Memory - sequential write/read operations", () => {
    const memory = new Memory({ sizeInBytes: 256, bitsPerByte: 8 });

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
    const memory = new Memory({ sizeInBytes: 16, bitsPerByte: 3 }); // 3-bit bytes (max value 7)

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
    const memory = new Memory({ sizeInBytes: 20, bitsPerByte: 3 });
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
    const memory = new Memory({ sizeInBytes: 15, bitsPerByte: 5 });
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
    const memory = new Memory({ sizeInBytes: 12, bitsPerByte: 6 });
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
    const memory = new Memory({ sizeInBytes: 10, bitsPerByte: 7 });
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
    const memory = new Memory({ sizeInBytes: 8, bitsPerByte: 9 });
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
    const memory = new Memory({ sizeInBytes: 6, bitsPerByte: 10 });
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
    const memory = new Memory({ sizeInBytes: 5, bitsPerByte: 11 });
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
    const memory = new Memory({ sizeInBytes: 5, bitsPerByte: 12 });
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
    const memory = new Memory({ sizeInBytes: 4, bitsPerByte: 13 });
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
    const memory = new Memory({ sizeInBytes: 3, bitsPerByte: 15 });
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
    const memory3bit = new Memory({ sizeInBytes: 20, bitsPerByte: 3 });
    const memory5bit = new Memory({ sizeInBytes: 15, bitsPerByte: 5 });
    const memory7bit = new Memory({ sizeInBytes: 10, bitsPerByte: 7 });

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
    const memory = new Memory({ sizeInBytes: 8, bitsPerByte: 5 }); // 5-bit bytes

    // Write some data
    memory.write(0n, 31);
    memory.write(1n, 15);
    memory.write(2n, 7);
    memory.write(3n, 0);
    memory.write(4n, 20);

    // Dump memory
    const dump = memory.dump();

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
    const memory = new Memory({ sizeInBytes: 10, bitsPerByte: 6 }); // 6-bit bytes (max value 63)

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
        const memory = new Memory({ sizeInBytes: 32, bitsPerByte: 3 }); // 3-bit bytes, will create many boundary crossings

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
            const memory = new Memory({ sizeInBytes: 4, bitsPerByte: bits });
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
    const memory = new Memory({ sizeInBytes: 8, bitsPerByte: 14 });
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

// Tests for splitToBytes method
Deno.test("Memory - splitToBytes with 8-bit bytes", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });

    // Test basic cases
    assertEquals(memory.splitToBytes(0n), [0]);
    assertEquals(memory.splitToBytes(255n), [255]);
    assertEquals(memory.splitToBytes(256n), [1, 0]);
    assertEquals(memory.splitToBytes(65535n), [255, 255]);
    assertEquals(memory.splitToBytes(16777215n), [255, 255, 255]);

    // Test power of 2 values
    assertEquals(memory.splitToBytes(1n), [1]);
    assertEquals(memory.splitToBytes(256n), [1, 0]);
    assertEquals(memory.splitToBytes(65536n), [1, 0, 0]);

    // Test arbitrary values
    assertEquals(memory.splitToBytes(0x1234n), [0x12, 0x34]);
    assertEquals(memory.splitToBytes(0x123456n), [0x12, 0x34, 0x56]);
});

Deno.test("Memory - splitToBytes with 4-bit bytes", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 4 });

    // Test basic cases
    assertEquals(memory.splitToBytes(0n), [0]);
    assertEquals(memory.splitToBytes(15n), [15]); // max single byte
    assertEquals(memory.splitToBytes(16n), [1, 0]); // requires 2 bytes
    assertEquals(memory.splitToBytes(255n), [15, 15]); // 4-bit: 1111 1111

    // Test boundary values
    assertEquals(memory.splitToBytes(17n), [1, 1]); // 4-bit: 0001 0001
    assertEquals(memory.splitToBytes(240n), [15, 0]); // 4-bit: 1111 0000
    assertEquals(memory.splitToBytes(170n), [10, 10]); // 4-bit: 1010 1010
});

Deno.test("Memory - splitToBytes with 1-bit bytes", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 1 });

    // Test basic cases
    assertEquals(memory.splitToBytes(0n), [0]);
    assertEquals(memory.splitToBytes(1n), [1]);
    assertEquals(memory.splitToBytes(2n), [1, 0]);
    assertEquals(memory.splitToBytes(3n), [1, 1]);
    assertEquals(memory.splitToBytes(7n), [1, 1, 1]);
    assertEquals(memory.splitToBytes(8n), [1, 0, 0, 0]);

    // Test larger values
    assertEquals(memory.splitToBytes(15n), [1, 1, 1, 1]); // binary: 1111
    assertEquals(memory.splitToBytes(31n), [1, 1, 1, 1, 1]); // binary: 11111
    assertEquals(memory.splitToBytes(255n), [1, 1, 1, 1, 1, 1, 1, 1]); // 8 ones
});

Deno.test("Memory - splitToBytes with 16-bit bytes", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 16 });

    // Test basic cases
    assertEquals(memory.splitToBytes(0n), [0]);
    assertEquals(memory.splitToBytes(65535n), [65535]); // max single 16-bit byte
    assertEquals(memory.splitToBytes(65536n), [1, 0]); // requires 2 bytes
    assertEquals(memory.splitToBytes(131071n), [1, 65535]); // 2^17 - 1

    // Test larger values
    assertEquals(memory.splitToBytes(16777215n), [255, 65535]); // 2^24 - 1
    assertEquals(memory.splitToBytes(4294967295n), [65535, 65535]); // 2^32 - 1
});

Deno.test("Memory - splitToBytes with 3-bit bytes", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 3 });

    // Test basic cases
    assertEquals(memory.splitToBytes(0n), [0]);
    assertEquals(memory.splitToBytes(7n), [7]); // max single 3-bit byte
    assertEquals(memory.splitToBytes(8n), [1, 0]); // requires 2 bytes
    assertEquals(memory.splitToBytes(15n), [1, 7]); // 3-bit: 001 111
    assertEquals(memory.splitToBytes(63n), [7, 7]); // 3-bit: 111 111

    // Test more complex values
    assertEquals(memory.splitToBytes(73n), [1, 1, 1]); // 3-bit: 001 001 001
    assertEquals(memory.splitToBytes(511n), [7, 7, 7]); // 3-bit: 111 111 111
});

Deno.test("Memory - splitToBytes with 5-bit bytes", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 5 });

    // Test basic cases
    assertEquals(memory.splitToBytes(0n), [0]);
    assertEquals(memory.splitToBytes(31n), [31]); // max single 5-bit byte
    assertEquals(memory.splitToBytes(32n), [1, 0]); // requires 2 bytes
    assertEquals(memory.splitToBytes(1023n), [31, 31]); // 5-bit: 11111 11111

    // Test specific patterns
    assertEquals(memory.splitToBytes(1024n), [1, 0, 0]); // 2^10
    assertEquals(memory.splitToBytes(1055n), [1, 0, 31]); // 1024 + 31
});

Deno.test("Memory - splitToBytes with 12-bit bytes", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 12 });

    // Test basic cases
    assertEquals(memory.splitToBytes(0n), [0]);
    assertEquals(memory.splitToBytes(4095n), [4095]); // max single 12-bit byte
    assertEquals(memory.splitToBytes(4096n), [1, 0]); // requires 2 bytes
    assertEquals(memory.splitToBytes(16777215n), [4095, 4095]); // 2^24 - 1

    // Test larger values
    assertEquals(memory.splitToBytes(16777216n), [1, 0, 0]); // 2^24
});

Deno.test("Memory - splitToBytes edge cases", () => {
    const memory8 = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });
    const memory4 = new Memory({ sizeInBytes: 100, bitsPerByte: 4 });

    // Test negative values (should throw error)
    assertThrows(
        () => memory8.splitToBytes(-1n),
        Error,
        "Value -1 cannot be negative",
    );

    assertThrows(
        () => memory4.splitToBytes(-100n),
        Error,
        "Value -100 cannot be negative",
    );
});

Deno.test("Memory - splitToBytes with large values", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });

    // Test very large values
    const largeValue = 0xffffffffn; // 2^32 - 1
    const result = memory.splitToBytes(largeValue);
    assertEquals(result, [255, 255, 255, 255]);

    // Test reconstructing value using bigint operations
    let reconstructed = 0n;
    for (let i = 0; i < result.length; i++) {
        reconstructed = (reconstructed << 8n) | BigInt(result[i]);
    }
    assertEquals(reconstructed, largeValue);
});

Deno.test("Memory - splitToBytes consistency with different byte sizes", () => {
    // Test that the same value splits consistently across different byte sizes
    const testValue = 255n;

    const memory1 = new Memory({ sizeInBytes: 100, bitsPerByte: 1 });
    const memory4 = new Memory({ sizeInBytes: 100, bitsPerByte: 4 });
    const memory8 = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });

    const result1 = memory1.splitToBytes(testValue);
    const result4 = memory4.splitToBytes(testValue);
    const result8 = memory8.splitToBytes(testValue);

    // 255 in different representations
    assertEquals(result1, [1, 1, 1, 1, 1, 1, 1, 1]); // 8 bits
    assertEquals(result4, [15, 15]); // 2 nibbles
    assertEquals(result8, [255]); // 1 byte

    // Verify all represent the same value
    assertEquals(result1.length, 8);
    assertEquals(result4.length, 2);
    assertEquals(result8.length, 1);
});

Deno.test("Memory - splitToBytes with very large bigint values", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });

    // Test values larger than Number.MAX_SAFE_INTEGER
    const veryLargeValue = 0x123456789abcdefn; // 64-bit value
    const result = memory.splitToBytes(veryLargeValue);
    assertEquals(result, [1, 35, 69, 103, 137, 171, 205, 239]); // [0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]

    // Test reconstruction
    let reconstructed = 0n;
    for (let i = 0; i < result.length; i++) {
        reconstructed = (reconstructed << 8n) | BigInt(result[i]);
    }
    assertEquals(reconstructed, veryLargeValue);

    // Test another large value
    const maxUint64 = 0xffffffffffffffffn;
    const maxResult = memory.splitToBytes(maxUint64);
    assertEquals(maxResult, [255, 255, 255, 255, 255, 255, 255, 255]);

    // Verify reconstruction of max value
    let maxReconstructed = 0n;
    for (let i = 0; i < maxResult.length; i++) {
        maxReconstructed = (maxReconstructed << 8n) | BigInt(maxResult[i]);
    }
    assertEquals(maxReconstructed, maxUint64);
});

Deno.test(
    "Memory - splitToBytes with custom byte sizes and large values",
    () => {
        // Test 12-bit bytes with very large values
        const memory12 = new Memory({ sizeInBytes: 100, bitsPerByte: 12 });
        const largeValue12 = 0x123456789n; // 36-bit value
        const result12 = memory12.splitToBytes(largeValue12);

        // 36 bits = 3 * 12-bit bytes
        // 0x123456789 = 4886718345 decimal
        // In 12-bit chunks: 0x123, 0x456, 0x789
        assertEquals(result12, [0x123, 0x456, 0x789]);

        // Test 5-bit bytes with large values
        const memory5 = new Memory({ sizeInBytes: 100, bitsPerByte: 5 });
        const largeValue5 = 0x3fffffffn; // 30-bit value (6 * 5-bit bytes)
        const result5 = memory5.splitToBytes(largeValue5);

        // All 5-bit bytes should be 31 (0x1f)
        assertEquals(result5, [31, 31, 31, 31, 31, 31]);
    },
);

// Word size and endianness tests
Deno.test("Memory - constructor with word size and default endianness", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 4,
    });
    assertEquals(memory.getWordSize(), 4);
    assertEquals(memory.getEndianness(), [3, 2, 1, 0]); // Default little-endian
});

Deno.test("Memory - constructor with custom endianness (big-endian)", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 4,
        endianness: [0, 1, 2, 3],
    });
    assertEquals(memory.getWordSize(), 4);
    assertEquals(memory.getEndianness(), [0, 1, 2, 3]);
});

Deno.test("Memory - constructor with custom endianness (mixed order)", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 4,
        endianness: [1, 0, 3, 2],
    });
    assertEquals(memory.getWordSize(), 4);
    assertEquals(memory.getEndianness(), [1, 0, 3, 2]);
});

Deno.test("Memory - constructor throws error for invalid word size", () => {
    assertThrows(
        () => new Memory({ sizeInBytes: 100, bitsPerByte: 8, wordSize: 0 }),
        Error,
        "wordSize must be at least 1",
    );

    assertThrows(
        () => new Memory({ sizeInBytes: 100, bitsPerByte: 8, wordSize: -1 }),
        Error,
        "wordSize must be at least 1",
    );
});

Deno.test(
    "Memory - constructor throws error for mismatched endianness length",
    () => {
        assertThrows(
            () =>
                new Memory({
                    sizeInBytes: 100,
                    bitsPerByte: 8,
                    wordSize: 4,
                    endianness: [0, 1, 2],
                }), // length 3, wordSize 4
            Error,
            "Endianness array length (3) must match word size (4)",
        );
    },
);

Deno.test(
    "Memory - constructor throws error for invalid endianness values",
    () => {
        assertThrows(
            () =>
                new Memory({
                    sizeInBytes: 100,
                    bitsPerByte: 8,
                    wordSize: 4,
                    endianness: [0, 1, 2, 4],
                }), // 4 is out of range
            Error,
            "Endianness array must contain all indices 0 to 3 exactly once",
        );

        assertThrows(
            () =>
                new Memory({
                    sizeInBytes: 100,
                    bitsPerByte: 8,
                    wordSize: 4,
                    endianness: [0, 1, 1, 2],
                }), // duplicate 1, missing 3
            Error,
            "Endianness array must contain all indices 0 to 3 exactly once",
        );
    },
);

Deno.test("Memory - readWord and writeWord with default little-endian", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 4,
    });
    const word = [0x12, 0x34, 0x56, 0x78];

    memory.writeWord(10n, word);
    const readWord = memory.readWord(10n);

    assertEquals(readWord, word);

    // Check individual bytes in memory (little-endian order: LSB at lowest address)
    assertEquals(memory.read(10n), 0x78); // LSB (byte 3) stored at position 0
    assertEquals(memory.read(11n), 0x56); // byte 2 stored at position 1
    assertEquals(memory.read(12n), 0x34); // byte 1 stored at position 2
    assertEquals(memory.read(13n), 0x12); // MSB (byte 0) stored at position 3
});

Deno.test("Memory - readWord and writeWord with big-endian", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 4,
        endianness: [0, 1, 2, 3],
    });
    const word = [0x12, 0x34, 0x56, 0x78];

    memory.writeWord(10n, word);
    const readWord = memory.readWord(10n);

    assertEquals(readWord, word);

    // Check individual bytes in memory (big-endian order: MSB at lowest address)
    assertEquals(memory.read(10n), 0x12); // MSB (byte 0) stored at position 0
    assertEquals(memory.read(11n), 0x34); // byte 1 stored at position 1
    assertEquals(memory.read(12n), 0x56); // byte 2 stored at position 2
    assertEquals(memory.read(13n), 0x78); // LSB (byte 3) stored at position 3
});

Deno.test("Memory - readWord and writeWord with mixed endianness", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 4,
        endianness: [1, 0, 3, 2],
    });
    const word = [0x12, 0x34, 0x56, 0x78];

    memory.writeWord(20n, word);
    const readWord = memory.readWord(20n);

    assertEquals(readWord, word);

    // Check individual bytes in memory (mixed order: [1,0,3,2])
    // endianness[i] = memory position for word position i
    // word pos 0 (0x12) -> mem pos 1, word pos 1 (0x34) -> mem pos 0, word pos 2 (0x56) -> mem pos 3, word pos 3 (0x78) -> mem pos 2
    assertEquals(memory.read(20n), 0x34); // word pos 1 stored at memory pos 0
    assertEquals(memory.read(21n), 0x12); // word pos 0 stored at memory pos 1
    assertEquals(memory.read(22n), 0x78); // word pos 3 stored at memory pos 2
    assertEquals(memory.read(23n), 0x56); // word pos 2 stored at memory pos 3
});

Deno.test("Memory - readWord and writeWord with 2-byte words", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 2,
        endianness: [1, 0],
    }); // 2-byte big-endian
    const word = [0xab, 0xcd];

    memory.writeWord(50n, word);
    const readWord = memory.readWord(50n);

    assertEquals(readWord, word);
    assertEquals(memory.read(50n), 0xcd); // byte 1 stored first
    assertEquals(memory.read(51n), 0xab); // byte 0 stored second
});

Deno.test("Memory - readWord and writeWord with custom byte sizes", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 4,
        wordSize: 3,
        endianness: [2, 1, 0],
    }); // 4-bit bytes, 3-byte words, reverse endian
    const word = [0x0a, 0x0b, 0x0c];

    memory.writeWord(30n, word);
    const readWord = memory.readWord(30n);

    assertEquals(readWord, word);
    assertEquals(memory.read(30n), 0x0c); // byte 2 stored at position 0
    assertEquals(memory.read(31n), 0x0b); // byte 1 stored at position 1
    assertEquals(memory.read(32n), 0x0a); // byte 0 stored at position 2
});

Deno.test(
    "Memory - writeWord throws error for word exceeding memory boundary",
    () => {
        const memory = new Memory({
            sizeInBytes: 10,
            bitsPerByte: 8,
            wordSize: 4,
        });
        const word = [0x12, 0x34, 0x56, 0x78];

        assertThrows(
            () => memory.writeWord(7n, word), // address 7 + wordSize 4 = 11 > memory size 10
            Error,
            "Word at address 7 with size 4 exceeds memory size 10",
        );

        assertThrows(
            () => memory.writeWord(10n, word), // address 10 + wordSize 4 = 14 > memory size 10
            Error,
            "Word at address 10 with size 4 exceeds memory size 10",
        );
    },
);

Deno.test(
    "Memory - readWord throws error for word exceeding memory boundary",
    () => {
        const memory = new Memory({
            sizeInBytes: 10,
            bitsPerByte: 8,
            wordSize: 4,
        });

        assertThrows(
            () => memory.readWord(7n), // address 7 + wordSize 4 = 11 > memory size 10
            Error,
            "Word at address 7 with size 4 exceeds memory size 10",
        );

        assertThrows(
            () => memory.readWord(10n), // address 10 + wordSize 4 = 14 > memory size 10
            Error,
            "Word at address 10 with size 4 exceeds memory size 10",
        );
    },
);

Deno.test("Memory - writeWord throws error for wrong word array length", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 4,
    });

    assertThrows(
        () => memory.writeWord(0n, [0x12, 0x34, 0x56]), // length 3, expected 4
        Error,
        "Word array length (3) must match word size (4)",
    );

    assertThrows(
        () => memory.writeWord(0n, [0x12, 0x34, 0x56, 0x78, 0x9a]), // length 5, expected 4
        Error,
        "Word array length (5) must match word size (4)",
    );
});

Deno.test(
    "Memory - writeWord throws error for byte values exceeding byte size",
    () => {
        const memory = new Memory({
            sizeInBytes: 100,
            bitsPerByte: 4,
            wordSize: 4,
        }); // 4-bit bytes, max value 15

        assertThrows(
            () => memory.writeWord(0n, [10, 16, 5, 3]), // 16 > 15 (max for 4-bit)
            Error,
            "Word byte 1 value 16 exceeds byte size (max: 15)",
        );

        assertThrows(
            () => memory.writeWord(0n, [10, 5, -1, 3]), // -1 < 0
            Error,
            "Word byte 2 value -1 exceeds byte size (max: 15)",
        );
    },
);

Deno.test("Memory - word operations with single-byte words", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 1,
    });
    const word = [0xff];

    memory.writeWord(25n, word);
    const readWord = memory.readWord(25n);

    assertEquals(readWord, word);
    assertEquals(memory.read(25n), 0xff);
});

Deno.test("Memory - word operations with large words", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 8,
    }); // 8-byte words
    const word = [0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef];

    memory.writeWord(10n, word);
    const readWord = memory.readWord(10n);

    assertEquals(readWord, word);

    // Verify each byte (little-endian: bytes stored in reverse order)
    const expectedBytes = [0xef, 0xcd, 0xab, 0x89, 0x67, 0x45, 0x23, 0x01]; // reversed
    for (let i = 0; i < 8; i++) {
        assertEquals(memory.read(BigInt(10 + i)), expectedBytes[i]);
    }
});

Deno.test("Memory - multiple word operations don't interfere", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 4,
    });
    const word1 = [0x11, 0x22, 0x33, 0x44];
    const word2 = [0xaa, 0xbb, 0xcc, 0xdd];
    const word3 = [0x55, 0x66, 0x77, 0x88];

    memory.writeWord(0n, word1);
    memory.writeWord(10n, word2);
    memory.writeWord(20n, word3);

    assertEquals(memory.readWord(0n), word1);
    assertEquals(memory.readWord(10n), word2);
    assertEquals(memory.readWord(20n), word3);
});

Deno.test("Memory - word operations mixed with byte operations", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 4,
    });
    const word = [0x12, 0x34, 0x56, 0x78];

    // Write word (stored as little-endian: [0x78, 0x56, 0x34, 0x12])
    memory.writeWord(10n, word);

    // Modify individual bytes
    memory.write(11n, 0xff); // modifies word position 2 (0x56 -> 0xff)
    memory.write(13n, 0x00); // modifies word position 0 (0x12 -> 0x00)

    // Read word should reflect changes
    const modifiedWord = memory.readWord(10n);
    assertEquals(modifiedWord, [0x00, 0x34, 0xff, 0x78]); // pos 0=0x00, pos 1=0x34, pos 2=0xff, pos 3=0x78

    // Write individual bytes
    memory.write(15n, 0xaa);
    memory.write(16n, 0xbb);
    memory.write(17n, 0xcc);
    memory.write(18n, 0xdd);

    // Read as word (little-endian reverses the byte order)
    const assembledWord = memory.readWord(15n);
    assertEquals(assembledWord, [0xdd, 0xcc, 0xbb, 0xaa]); // reversed due to little-endian
});

Deno.test(
    "Memory - endianness affects only word operations, not individual bytes",
    () => {
        const memory = new Memory({
            sizeInBytes: 100,
            bitsPerByte: 8,
            wordSize: 4,
            endianness: [0, 1, 2, 3],
        }); // big-endian

        // Write individual bytes
        memory.write(0n, 0x12);
        memory.write(1n, 0x34);
        memory.write(2n, 0x56);
        memory.write(3n, 0x78);

        // Read as word (should apply endianness)
        // With big-endian [0,1,2,3], word position i reads from memory position i
        const word = memory.readWord(0n);
        assertEquals(word, [0x12, 0x34, 0x56, 0x78]); // same order as written

        // Read individual bytes (should not be affected by endianness)
        assertEquals(memory.read(0n), 0x12);
        assertEquals(memory.read(1n), 0x34);
        assertEquals(memory.read(2n), 0x56);
        assertEquals(memory.read(3n), 0x78);
    },
);

Deno.test(
    "Memory - word operations with non-standard byte sizes and endianness",
    () => {
        const memory = new Memory({
            sizeInBytes: 50,
            bitsPerByte: 6,
            wordSize: 3,
            endianness: [2, 0, 1],
        }); // 6-bit bytes, 3-byte words, custom endianness
        const word = [0x20, 0x15, 0x3f]; // All values valid for 6-bit bytes (max 63)

        memory.writeWord(5n, word);
        const readWord = memory.readWord(5n);

        assertEquals(readWord, word);

        // Check memory layout according to endianness [2, 0, 1]
        // word[0] (0x20) -> memory[endianness[0]] = memory[2] = memory[7]
        // word[1] (0x15) -> memory[endianness[1]] = memory[0] = memory[5]
        // word[2] (0x3f) -> memory[endianness[2]] = memory[1] = memory[6]
        assertEquals(memory.read(5n), 0x15); // word[1] at relative position 0
        assertEquals(memory.read(6n), 0x3f); // word[2] at relative position 1
        assertEquals(memory.read(7n), 0x20); // word[0] at relative position 2
    },
);

Deno.test("Memory - dump and restore preserves word configuration", () => {
    const memory = new Memory({
        sizeInBytes: 20,
        bitsPerByte: 8,
        wordSize: 4,
        endianness: [3, 2, 1, 0],
    });
    const word = [0x12, 0x34, 0x56, 0x78];

    memory.writeWord(0n, word);

    // Dump and restore
    const dump = memory.dump();
    memory.zeroOut();
    memory.restore(dump);

    // Verify word configuration is preserved
    assertEquals(memory.getWordSize(), 4);
    assertEquals(memory.getEndianness(), [3, 2, 1, 0]);

    // Verify word data is preserved
    const restoredWord = memory.readWord(0n);
    assertEquals(restoredWord, word);
});

Deno.test("Memory - getEndianness returns copy, not reference", () => {
    const originalEndianness = [3, 2, 1, 0];
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 4,
        endianness: originalEndianness,
    });

    const endianness1 = memory.getEndianness();
    const endianness2 = memory.getEndianness();

    // Modify returned arrays
    endianness1[0] = 99;
    endianness2[1] = 88;

    // Original should be unchanged
    assertEquals(memory.getEndianness(), originalEndianness);

    // Different calls should return independent arrays
    assertNotEquals(endianness1, endianness2);
});

Deno.test("Memory - stress test with word operations", () => {
    const memory = new Memory({
        sizeInBytes: 1000,
        bitsPerByte: 8,
        wordSize: 4,
        endianness: [1, 3, 0, 2],
    }); // Custom endianness
    const testWords = new Map();

    // Write random words
    for (let i = 0; i < 100; i++) {
        const addr = BigInt(Math.floor(Math.random() * 250) * 4); // Align to word boundaries
        const word = [
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
        ];
        memory.writeWord(addr, word);
        testWords.set(addr, word);
    }

    // Verify all words
    for (const [addr, expectedWord] of testWords) {
        const actualWord = memory.readWord(addr);
        assertEquals(actualWord, expectedWord);
    }
});

Deno.test(
    "Memory - getUsedAddresses returns empty array for empty memory",
    () => {
        const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });
        const usedAddresses = memory.getUsedAddresses();
        assertEquals(usedAddresses, []);
    },
);

Deno.test("Memory - getUsedAddresses with 8-bit memory", () => {
    const memory = new Memory({ sizeInBytes: 100, bitsPerByte: 8 });

    memory.write(5n, 123);
    memory.write(10n, 255);
    memory.write(7n, 0); // Zero value - shouldn't be included
    memory.write(50n, 42);
    memory.write(25n, 1);

    const usedAddresses = memory.getUsedAddresses();
    assertEquals(usedAddresses, [50n, 25n, 10n, 5n]); // Sorted highest to lowest, no address 7
});

Deno.test("Memory - getUsedAddresses with custom byte sizes", () => {
    const memory = new Memory({ sizeInBytes: 50, bitsPerByte: 12 }); // 12-bit bytes

    memory.write(0n, 1000);
    memory.write(25n, 4095); // Max 12-bit value
    memory.write(15n, 0); // Zero - shouldn't be included
    memory.write(10n, 500);

    const usedAddresses = memory.getUsedAddresses();
    assertEquals(usedAddresses, [25n, 10n, 0n]); // Sorted highest to lowest, no address 15
});

Deno.test("Memory - getUsedAddresses with 4-bit memory", () => {
    const memory = new Memory({ sizeInBytes: 20, bitsPerByte: 4 });

    memory.write(3n, 15); // Max 4-bit value
    memory.write(0n, 8);
    memory.write(8n, 0); // Zero - shouldn't be included
    memory.write(12n, 1);
    memory.write(19n, 7);

    const usedAddresses = memory.getUsedAddresses();
    assertEquals(usedAddresses, [19n, 12n, 3n, 0n]); // Sorted highest to lowest, no address 8
});

Deno.test("Memory - getUsedAddresses after zeroOut", () => {
    const memory = new Memory({ sizeInBytes: 50, bitsPerByte: 8 });

    memory.write(5n, 100);
    memory.write(20n, 200);
    memory.write(35n, 50);

    // Before zeroOut
    let usedAddresses = memory.getUsedAddresses();
    assertEquals(usedAddresses, [35n, 20n, 5n]);

    // After zeroOut
    memory.zeroOut();
    usedAddresses = memory.getUsedAddresses();
    assertEquals(usedAddresses, []);
});

Deno.test("Memory - getUsedAddresses with word operations", () => {
    const memory = new Memory({
        sizeInBytes: 100,
        bitsPerByte: 8,
        wordSize: 4,
    });

    // Write a word
    memory.writeWord(10n, [0x12, 0x34, 0x56, 0x78]);

    // Write individual bytes
    memory.write(0n, 0xff);
    memory.write(5n, 0); // Zero - shouldn't be included
    memory.write(50n, 0xaa);

    const usedAddresses = memory.getUsedAddresses();
    assertEquals(usedAddresses, [50n, 13n, 12n, 11n, 10n, 0n]); // Word writes to addresses 10-13
});

Deno.test("Memory - getUsedAddresses stress test", () => {
    const memory = new Memory({ sizeInBytes: 1000, bitsPerByte: 8 });
    const expectedAddresses = [];

    // Write to random addresses
    const testAddresses = [5, 15, 100, 250, 500, 750, 999];
    for (const addr of testAddresses) {
        memory.write(BigInt(addr), addr % 256);
        if (addr % 256 !== 0) {
            // Only include non-zero values
            expectedAddresses.push(BigInt(addr));
        }
    }

    // Write zero to some addresses (shouldn't be included)
    memory.write(25n, 0);
    memory.write(300n, 0);

    const usedAddresses = memory.getUsedAddresses();
    expectedAddresses.sort((a, b) => {
        if (a > b) return -1;
        if (a < b) return 1;
        return 0;
    }); // Sort highest to lowest
    assertEquals(usedAddresses, expectedAddresses);
});
