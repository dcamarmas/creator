// Test script to verify endianness implementation
import { Memory } from "./src/core/memory/Memory.mts";

// Test little-endian (default)
console.log("=== Testing Little Endian (default) ===");
const memoryLE = new Memory({ sizeInBytes: 16, bitsPerByte: 8, wordSize: 4 });
const word = [0x12, 0x34, 0x56, 0x78];
memoryLE.writeWord(0n, word);

console.log("Original word:", word);
console.log("Read back word:", memoryLE.readWord(0n));
console.log("Memory layout:");
for (let i = 0; i < 4; i++) {
    console.log(
        `  mem[${i}] = 0x${memoryLE.read(BigInt(i)).toString(16).padStart(2, "0")}`,
    );
}
console.log(
    "Expected: mem[0]=0x12, mem[1]=0x34, mem[2]=0x56, mem[3]=0x78 (little-endian)",
);

// Test big-endian
console.log("\n=== Testing Big Endian ===");
const memoryBE = new Memory({
    sizeInBytes: 16,
    bitsPerByte: 8,
    wordSize: 4,
    endianness: [3, 2, 1, 0],
});
memoryBE.writeWord(0n, word);

console.log("Original word:", word);
console.log("Read back word:", memoryBE.readWord(0n));
console.log("Memory layout:");
for (let i = 0; i < 4; i++) {
    console.log(
        `  mem[${i}] = 0x${memoryBE.read(BigInt(i)).toString(16).padStart(2, "0")}`,
    );
}
console.log(
    "Expected: mem[0]=0x78, mem[1]=0x56, mem[2]=0x34, mem[3]=0x12 (big-endian)",
);

// Test mixed endianness
console.log("\n=== Testing Mixed Endianness [1, 0, 3, 2] ===");
const memoryMixed = new Memory({
    sizeInBytes: 16,
    bitsPerByte: 8,
    wordSize: 4,
    endianness: [1, 0, 3, 2],
});
memoryMixed.writeWord(0n, word);

console.log("Original word:", word);
console.log("Read back word:", memoryMixed.readWord(0n));
console.log("Memory layout:");
for (let i = 0; i < 4; i++) {
    console.log(
        `  mem[${i}] = 0x${memoryMixed.read(BigInt(i)).toString(16).padStart(2, "0")}`,
    );
}
console.log(
    "Expected: mem[0]=0x34, mem[1]=0x12, mem[2]=0x78, mem[3]=0x56 (mixed [1,0,3,2])",
);

// Verify that read/write operations are symmetric
console.log("\n=== Symmetry Test ===");
const testCases = [
    { name: "Little Endian", endianness: [0, 1, 2, 3] },
    { name: "Big Endian", endianness: [3, 2, 1, 0] },
    { name: "Mixed", endianness: [2, 0, 1, 3] },
];

for (const testCase of testCases) {
    const memory = new Memory({
        sizeInBytes: 16,
        bitsPerByte: 8,
        wordSize: 4,
        endianness: testCase.endianness,
    });

    const originalWord = [0xaa, 0xbb, 0xcc, 0xdd];
    memory.writeWord(0n, originalWord);
    const readWord = memory.readWord(0n);

    const isSymmetric = originalWord.every((byte, i) => byte === readWord[i]);
    console.log(
        `${testCase.name}: ${isSymmetric ? "PASS" : "FAIL"} - ${originalWord} -> ${readWord}`,
    );
}
