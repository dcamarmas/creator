import { readFileSync, writeFileSync } from "fs";

// Read the test file
const filePath =
    "/Users/jorge/clones/creatorV/tests/unit/core/memory/memory.test.mjs";
let content = readFileSync(filePath, "utf-8");

// Pattern 1: new Memory(size, bitsPerByte) -> new Memory({ sizeInBytes: size, bitsPerByte: bitsPerByte })
content = content.replace(
    /new Memory\((\d+), (\d+)\)/g,
    "new Memory({ sizeInBytes: $1, bitsPerByte: $2 })",
);

// Pattern 2: new Memory(size) -> new Memory({ sizeInBytes: size })
content = content.replace(
    /new Memory\((\d+)\)/g,
    "new Memory({ sizeInBytes: $1 })",
);

// Special patterns with wordSize and endianness - need to handle these manually
// Let's also update some specific patterns we can identify

// Pattern 3: Some tests might have { sizeInBytes: x, bitsPerByte: y, wordSize: z }
// These should be left as-is since they're already using the config object

// Write the updated content back
writeFileSync(filePath, content);

console.log("Updated Memory constructor calls to use config object syntax");
