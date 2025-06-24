// Test script to verify corrected endianness implementation
import { Memory } from "./src/core/memory/Memory.mts";

console.log("=== Testing Corrected Endianness Implementation ===");

// Test default (should now be little-endian)
console.log("\n=== Default (Little Endian) ===");
const memoryDefault = new Memory({
    sizeInBytes: 16,
    bitsPerByte: 8,
    wordSize: 4,
});
console.log("Default endianness:", memoryDefault.getEndianness());

const word = [0x12, 0x34, 0x56, 0x78]; // MSB=0x12, LSB=0x78
memoryDefault.writeWord(0n, word);

console.log("Logical word:    [0x12, 0x34, 0x56, 0x78]");
console.log(
    "Read back word:  ",
    memoryDefault.readWord(0n).map(b => `0x${b.toString(16).padStart(2, "0")}`),
);
console.log("Physical memory layout:");
for (let i = 0; i < 4; i++) {
    console.log(
        `  mem[${i}] = 0x${memoryDefault.read(BigInt(i)).toString(16).padStart(2, "0")}`,
    );
}
console.log(
    "Expected little-endian: mem[0]=0x78 (LSB), mem[1]=0x56, mem[2]=0x34, mem[3]=0x12 (MSB)",
);

// Test explicit big-endian
console.log("\n=== Explicit Big Endian [0, 1, 2, 3] ===");
const memoryBE = new Memory({
    sizeInBytes: 16,
    bitsPerByte: 8,
    wordSize: 4,
    endianness: [0, 1, 2, 3],
});
memoryBE.writeWord(0n, word);

console.log("Logical word:    [0x12, 0x34, 0x56, 0x78]");
console.log(
    "Read back word:  ",
    memoryBE.readWord(0n).map(b => `0x${b.toString(16).padStart(2, "0")}`),
);
console.log("Physical memory layout:");
for (let i = 0; i < 4; i++) {
    console.log(
        `  mem[${i}] = 0x${memoryBE.read(BigInt(i)).toString(16).padStart(2, "0")}`,
    );
}
console.log(
    "Expected big-endian: mem[0]=0x12 (MSB), mem[1]=0x34, mem[2]=0x56, mem[3]=0x78 (LSB)",
);

// Test explicit little-endian
console.log("\n=== Explicit Little Endian [3, 2, 1, 0] ===");
const memoryLE = new Memory({
    sizeInBytes: 16,
    bitsPerByte: 8,
    wordSize: 4,
    endianness: [3, 2, 1, 0],
});
memoryLE.writeWord(0n, word);

console.log("Logical word:    [0x12, 0x34, 0x56, 0x78]");
console.log(
    "Read back word:  ",
    memoryLE.readWord(0n).map(b => `0x${b.toString(16).padStart(2, "0")}`),
);
console.log("Physical memory layout:");
for (let i = 0; i < 4; i++) {
    console.log(
        `  mem[${i}] = 0x${memoryLE.read(BigInt(i)).toString(16).padStart(2, "0")}`,
    );
}
console.log(
    "Expected little-endian: mem[0]=0x78 (LSB), mem[1]=0x56, mem[2]=0x34, mem[3]=0x12 (MSB)",
);

// Verify the layouts are actually different but words read back the same
console.log("\n=== Verification ===");
const defaultByte0 = memoryDefault.read(0n);
const bigEndianByte0 = memoryBE.read(0n);
const littleEndianByte0 = memoryLE.read(0n);

console.log(
    `Default (LE) mem[0]:     0x${defaultByte0.toString(16).padStart(2, "0")}`,
);
console.log(
    `Big-endian mem[0]:       0x${bigEndianByte0.toString(16).padStart(2, "0")}`,
);
console.log(
    `Little-endian mem[0]:    0x${littleEndianByte0.toString(16).padStart(2, "0")}`,
);

console.log(
    "\nPhysical layouts are different:",
    defaultByte0 !== bigEndianByte0 ? "✓" : "✗",
);
console.log(
    "Logical words are same:",
    JSON.stringify(memoryDefault.readWord(0n)) ===
        JSON.stringify(memoryBE.readWord(0n))
        ? "✓"
        : "✗",
);

// Test typical endianness understanding
console.log("\n=== Real-world Endianness Test ===");
console.log("Storing 32-bit value 0x12345678:");

// Little-endian: LSB (0x78) at lowest address
const testLE = new Memory({ sizeInBytes: 8, bitsPerByte: 8, wordSize: 4 });
testLE.writeWord(0n, [0x12, 0x34, 0x56, 0x78]);
console.log(
    "Little-endian memory: [" +
        Array.from(
            { length: 4 },
            (_, i) =>
                `0x${testLE.read(BigInt(i)).toString(16).padStart(2, "0")}`,
        ).join(", ") +
        "] (LSB first)",
);

// Big-endian: MSB (0x12) at lowest address
const testBE = new Memory({
    sizeInBytes: 8,
    bitsPerByte: 8,
    wordSize: 4,
    endianness: [0, 1, 2, 3],
});
testBE.writeWord(0n, [0x12, 0x34, 0x56, 0x78]);
console.log(
    "Big-endian memory:    [" +
        Array.from(
            { length: 4 },
            (_, i) =>
                `0x${testBE.read(BigInt(i)).toString(16).padStart(2, "0")}`,
        ).join(", ") +
        "] (MSB first)",
);
