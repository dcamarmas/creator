import { readFileSync } from "node:fs";

/**
 *
 * This class provides a comprehensive memory simulation that supports:
 * - Custom byte sizes (1-32 bits per byte)
 * - Custom word sizes (any number of bytes)
 * - Flexible endianness configuration
 * - Efficient bit-level storage
 * - Word-level and byte-level operations
 *
 * ## Key Concepts
 *
 * ### Custom Byte Sizes
 * This class allows configuring any byte size from 1 to 32 bits.
 *
 * ### Endianness Configuration
 * Endianness determines the order of bytes within words. Rather than just
 * supporting little-endian and big-endian, this class allows completely
 * custom byte ordering within words.
 *
 * The endianness array specifies which word position goes to each memory position:
 * - `[0, 1, 2, 3]` = little-endian (byte 0 at position 0, byte 1 at position 1, etc.)
 * - `[3, 2, 1, 0]` = big-endian (byte 3 at position 0, byte 2 at position 1, etc.)
 * - `[1, 0, 3, 2]` = mixed endianness (bytes 1,0,3,2 at positions 0,1,2,3)
 *
 * ### Memory Layout vs Logical Structure
 * - **Physical Layout**: How bytes are actually stored in memory (affected by endianness)
 * - **Logical Structure**: How the word is represented in the program (unaffected by endianness)
 *
 * Word operations (readWord/writeWord) work with logical structure, while
 * individual byte operations (read/write) work with physical layout.
 *
 * ### Bit Packing
 * When using non-8-bit bytes, the class efficiently packs multiple custom bytes
 * into standard 8-bit storage bytes. For example, four 6-bit bytes (24 bits total)
 * are packed into three 8-bit storage bytes.
 *
 * ## Usage Examples
 *
 * @example Basic 8-bit byte memory
 * ```typescript
 * const memory = new Memory(1024); // 1024 bytes, 8 bits per byte
 * memory.write(0n, 0xFF);
 * console.log(memory.read(0n)); // 255
 * ```
 *
 * @example Custom byte size memory
 * ```typescript
 * const memory = new Memory(100, 12); // 100 12-bit "bytes", max value 4095
 * memory.write(0n, 4095);
 * console.log(memory.read(0n)); // 4095
 * ```
 *
 * @example Word operations with endianness
 * ```typescript
 * // 4-byte words with big-endian ordering
 * const memory = new Memory(100, 8, 4, [3, 2, 1, 0]);
 * const word = [0x12, 0x34, 0x56, 0x78];
 * memory.writeWord(0n, word);
 *
 * // Memory layout: [0x78, 0x56, 0x34, 0x12] (reversed)
 * console.log(memory.read(0n)); // 0x78
 * console.log(memory.read(1n)); // 0x56
 *
 * // But readWord returns original order: [0x12, 0x34, 0x56, 0x78]
 * console.log(memory.readWord(0n)); // [0x12, 0x34, 0x56, 0x78]
 * ```
 *
 * @example Mixed operations
 * ```typescript
 * const memory = new Memory(100, 8, 4);
 *
 * // Write word, read individual bytes
 * memory.writeWord(0n, [0xAA, 0xBB, 0xCC, 0xDD]);
 * console.log(memory.read(1n)); // 0xBB
 *
 * // Write individual bytes, read as word
 * memory.write(10n, 0x11);
 * memory.write(11n, 0x22);
 * memory.write(12n, 0x33);
 * memory.write(13n, 0x44);
 * console.log(memory.readWord(10n)); // [0x11, 0x22, 0x33, 0x44]
 * ```
 *
 * ## Performance Considerations
 *
 * - 8-bit byte operations use fast path with direct array access
 * - Custom byte sizes require bit manipulation
 * - Word operations are optimized for the configured endianness
 * - Memory dumps/restores are very fast using direct buffer copying
 */
export class Memory {
    /** Total number of addressable units (bytes) in memory */
    private size: number;

    /** Number of bits per addressable unit (byte). Range: 1-32 bits */
    private bitsPerByte: number;

    /** Maximum value that can be stored in a single byte */
    private maxByteValue: number;

    /** Underlying storage buffer using standard 8-bit bytes */
    private buffer: ArrayBuffer;

    /** Typed array view for efficient access to the buffer */
    private uint8View: Uint8Array;

    /** Number of bytes that constitute a word */
    private wordSize: number;

    /**
     * Endianness configuration array.
     * endianness[i] specifies which word position should be stored at memory position i.
     *
     * Examples:
     * - [0, 1, 2, 3] = little-endian (default)
     * - [3, 2, 1, 0] = big-endian
     * - [1, 0, 3, 2] = mixed/custom endianness
     */
    private endianness: number[];

    /**
     * Creates a new Memory instance with configurable byte size, word size, and endianness.
     *
     * The memory uses efficient bit-packing when bitsPerByte != 8, storing multiple
     * custom bytes within standard 8-bit storage bytes.
     *
     * @param sizeInBytes - Total number of addressable units (bytes) in memory
     * @param bitsPerByte - Number of bits per addressable unit (1-32). Default: 8
     * @param wordSize - Number of bytes that constitute a word. Default: 4
     * @param endianness - Optional array specifying byte order within words.
     *                    Must contain all indices 0 to wordSize-1 exactly once.
     *                    Default: little-endian [0, 1, 2, 3, ...]
     *
     * @throws Error if bitsPerByte is not in range 1-32
     * @throws Error if wordSize is less than 1
     * @throws Error if endianness array length doesn't match wordSize
     * @throws Error if endianness array doesn't contain valid indices
     *
     * @example Standard 8-bit memory
     * ```typescript
     * const memory = new Memory(1024); // 1KB memory
     * ```
     *
     * @example 12-bit bytes with big-endian words
     * ```typescript
     * const memory = new Memory(256, 12, 4, [3, 2, 1, 0]);
     * ```
     */
    constructor(
        sizeInBytes: number,
        bitsPerByte: number = 8,
        wordSize: number = 4,
        endianness?: number[],
    ) {
        if (bitsPerByte < 1 || bitsPerByte > 32) {
            throw new Error("bitsPerByte must be between 1 and 32");
        }

        if (wordSize < 1) {
            throw new Error("wordSize must be at least 1");
        }

        this.size = sizeInBytes;
        this.bitsPerByte = bitsPerByte;
        this.maxByteValue =
            bitsPerByte === 32 ? 0xffffffff : (1 << bitsPerByte) - 1;
        this.wordSize = wordSize;

        // Default endianness is little-endian (0, 1, 2, 3...)
        if (endianness) {
            if (endianness.length !== wordSize) {
                throw new Error(
                    `Endianness array length (${endianness.length}) must match word size (${wordSize})`,
                );
            }

            // Validate endianness array contains valid byte indices
            const sortedEndianness = [...endianness].sort();
            for (let i = 0; i < wordSize; i++) {
                if (sortedEndianness[i] !== i) {
                    throw new Error(
                        "Endianness array must contain all byte indices from 0 to wordSize-1",
                    );
                }
            }

            this.endianness = [...endianness];
        } else {
            // Default little-endian
            this.endianness = Array.from({ length: wordSize }, (_, i) => i);
        }

        // Calculate storage needed: we need enough 8-bit bytes to store all the custom bytes
        const bitsNeeded = sizeInBytes * bitsPerByte;
        const storageBytes = Math.ceil(bitsNeeded / 8);

        this.buffer = new ArrayBuffer(storageBytes);
        this.uint8View = new Uint8Array(this.buffer);

        this.uint8View.fill(0);
    }

    /**
     * Clears all memory by setting every byte to zero.
     * This operation preserves the memory configuration (size, word size, endianness).
     */
    zeroOut(): void {
        this.uint8View.fill(0);
    }

    /**
     * Reads a single byte from memory at the specified address.
     *
     * For custom byte sizes (bitsPerByte != 8), this method handles bit-level
     * extraction from the underlying 8-bit storage, including cases where
     * the custom byte spans multiple storage bytes.
     *
     * @param address - Memory address to read from (0-based)
     * @returns The byte value (0 to maxByteValue)
     *
     * @throws Error if address exceeds memory size
     *
     * @example Reading from 8-bit memory
     * ```typescript
     * const memory = new Memory(100);
     * memory.write(5n, 255);
     * console.log(memory.read(5n)); // 255
     * ```
     *
     * @example Reading from 12-bit memory
     * ```typescript
     * const memory = new Memory(100, 12);
     * memory.write(3n, 4095); // Max 12-bit value
     * console.log(memory.read(3n)); // 4095
     * ```
     */
    read(address: bigint): number {
        const addr = Number(address);
        if (addr >= this.size) {
            throw new Error(`Address ${addr} exceeds memory size ${this.size}`);
        }

        if (this.bitsPerByte === 8) {
            return this.uint8View[addr];
        }

        const bitOffset = addr * this.bitsPerByte;
        const byteIndex = Math.floor(bitOffset / 8);
        const bitIndex = bitOffset % 8;

        if (this.bitsPerByte <= 8 - bitIndex) {
            // Value fits within a single storage byte
            const mask = this.maxByteValue << (8 - bitIndex - this.bitsPerByte);
            return (
                (this.uint8View[byteIndex] & mask) >>>
                (8 - bitIndex - this.bitsPerByte)
            );
        } else {
            // Value spans multiple storage bytes
            let value = 0;
            let remainingBits = this.bitsPerByte;
            let currentByteIndex = byteIndex;
            let currentBitIndex = bitIndex;

            while (remainingBits > 0) {
                const bitsFromThisByte = Math.min(
                    remainingBits,
                    8 - currentBitIndex,
                );
                const mask =
                    ((1 << bitsFromThisByte) - 1) <<
                    (8 - currentBitIndex - bitsFromThisByte);
                const bits =
                    (this.uint8View[currentByteIndex] & mask) >>>
                    (8 - currentBitIndex - bitsFromThisByte);

                value = (value << bitsFromThisByte) | bits;
                remainingBits -= bitsFromThisByte;
                currentByteIndex++;
                currentBitIndex = 0;
            }

            return value;
        }
    }

    /**
     * Writes a single byte to memory at the specified address.
     *
     * For custom byte sizes (bitsPerByte != 8), this method handles bit-level
     * packing into the underlying 8-bit storage, including cases where
     * the custom byte spans multiple storage bytes.
     *
     * @param address - Memory address to write to (0-based)
     * @param value - Byte value to write (0 to maxByteValue)
     *
     * @throws Error if address exceeds memory size
     * @throws Error if value exceeds maxByteValue or is negative
     *
     * @example Writing to 8-bit memory
     * ```typescript
     * const memory = new Memory(100);
     * memory.write(10n, 128);
     * ```
     *
     * @example Writing to 4-bit memory
     * ```typescript
     * const memory = new Memory(100, 4);
     * memory.write(0n, 15); // Max 4-bit value
     * // memory.write(0n, 16); // Would throw error
     * ```
     */
    write(address: bigint, value: number): void {
        const addr = Number(address);
        if (addr >= this.size) {
            throw new Error(`Address ${addr} exceeds memory size ${this.size}`);
        }
        if (value > this.maxByteValue || value < 0) {
            throw new Error(
                `Value ${value} exceeds byte size (max: ${this.maxByteValue})`,
            );
        }

        if (this.bitsPerByte === 8) {
            this.uint8View[addr] = value;
            return;
        }

        const bitOffset = addr * this.bitsPerByte;
        const byteIndex = Math.floor(bitOffset / 8);
        const bitIndex = bitOffset % 8;

        if (this.bitsPerByte <= 8 - bitIndex) {
            // Value fits within a single storage byte
            const mask = this.maxByteValue << (8 - bitIndex - this.bitsPerByte);
            this.uint8View[byteIndex] =
                (this.uint8View[byteIndex] & ~mask) |
                (value << (8 - bitIndex - this.bitsPerByte));
        } else {
            // Value spans multiple storage bytes
            let remainingBits = this.bitsPerByte;
            let currentByteIndex = byteIndex;
            let currentBitIndex = bitIndex;
            let remainingValue = value;

            while (remainingBits > 0) {
                const bitsForThisByte = Math.min(
                    remainingBits,
                    8 - currentBitIndex,
                );
                const shift = remainingBits - bitsForThisByte;
                const bits =
                    (remainingValue >>> shift) & ((1 << bitsForThisByte) - 1);
                const mask =
                    ((1 << bitsForThisByte) - 1) <<
                    (8 - currentBitIndex - bitsForThisByte);

                this.uint8View[currentByteIndex] =
                    (this.uint8View[currentByteIndex] & ~mask) |
                    (bits << (8 - currentBitIndex - bitsForThisByte));

                remainingValue &= (1 << shift) - 1;
                remainingBits -= bitsForThisByte;
                currentByteIndex++;
                currentBitIndex = 0;
            }
        }
    }

    /**
     * Loads ROM data into memory starting at the specified offset.
     * This method only works with 8-bit byte memories for direct compatibility
     * with standard binary data.
     *
     * @param romData - Binary data to load
     * @param offset - Starting address offset. Default: 0
     *
     * @throws Error if memory doesn't use 8-bit bytes
     *
     * @example Loading ROM data
     * ```typescript
     * const memory = new Memory(1024);
     * const rom = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
     * memory.loadROM(rom, 0x100n);
     * ```
     */
    loadROM(romData: Uint8Array, offset: bigint = 0n): void {
        if (this.bitsPerByte !== 8) {
            throw new Error(
                "loadROM only supports 8-bit bytes. Use loadCustomROM for other byte sizes.",
            );
        }
        this.uint8View.set(romData, Number(offset));
    }

    /**
     * Loads custom ROM data into memory for non-8-bit byte configurations.
     * Each number in the array represents one memory byte using the configured byte size.
     *
     * @param romData - Array of byte values (each 0 to maxByteValue)
     * @param offset - Starting address offset. Default: 0
     *
     * @example Loading 12-bit ROM data
     * ```typescript
     * const memory = new Memory(100, 12);
     * const rom = [4095, 2048, 1024, 512]; // 12-bit values
     * memory.loadCustomROM(rom, 10n);
     * ```
     */
    loadCustomROM(romData: number[], offset: bigint = 0n): void {
        for (let i = 0; i < romData.length; i++) {
            this.write(offset + BigInt(i), romData[i]);
        }
    }

    /**
     * Loads a binary file from disk into memory.
     * Only works with 8-bit byte memories for direct file compatibility.
     *
     * @param filePath - Path to the binary file
     * @param offset - Starting address offset. Default: 0
     *
     * @throws Error if memory doesn't use 8-bit bytes
     * @throws Error if file cannot be read
     *
     * @example Loading a binary file
     * ```typescript
     * const memory = new Memory(65536);
     * memory.loadBinaryFile("program.bin", 0x8000n);
     * ```
     */
    loadBinaryFile(filePath: string, offset: bigint = 0n): void {
        const fileData = readFileSync(filePath);
        this.loadROM(new Uint8Array(fileData), offset);
    }

    /**
     * Reads multiple consecutive bytes from memory starting at the specified address.
     *
     * @param address - Starting memory address
     * @param count - Number of bytes to read
     * @returns Array of byte values
     *
     * @example Reading a sequence of bytes
     * ```typescript
     * const memory = new Memory(100);
     * memory.write(10n, 0xAA);
     * memory.write(11n, 0xBB);
     * memory.write(12n, 0xCC);
     *
     * const bytes = memory.readBytes(10n, 3);
     * console.log(bytes); // [0xAA, 0xBB, 0xCC]
     * ```
     */
    readBytes(address: bigint, count: number): number[] {
        const result: number[] = [];
        for (let i = 0; i < count; i++) {
            result.push(this.read(BigInt(address) + BigInt(i)));
        }
        return result;
    }

    /**
     * Creates a snapshot of the current memory state for fast save/restore operations.
     * The dump includes the raw storage buffer and metadata needed for restoration.
     *
     * @returns Object containing memory state data
     *
     * @example Creating and using a memory snapshot
     * ```typescript
     * const memory = new Memory(100);
     * memory.write(0n, 123);
     *
     * const snapshot = memory.dump();
     * memory.write(0n, 456); // Modify memory
     *
     * memory.restore(snapshot); // Restore original state
     * console.log(memory.read(0n)); // 123
     * ```
     */
    dump(): { buffer: Uint8Array; bitsPerByte: number; size: number } {
        return {
            buffer: new Uint8Array(this.uint8View),
            bitsPerByte: this.bitsPerByte,
            size: this.size,
        };
    }

    /**
     * Restores memory state from a previously created dump.
     * The dump must be compatible with the current memory configuration.
     *
     * @param dump - Memory state dump from dump() method
     *
     * @throws Error if dump metadata doesn't match current configuration
     *
     * @example Restoring memory state
     * ```typescript
     * const memory = new Memory(100, 8);
     * const snapshot = memory.dump();
     * // ... modify memory ...
     * memory.restore(snapshot); // Back to original state
     * ```
     */
    restore(dump: {
        buffer: Uint8Array;
        bitsPerByte: number;
        size: number;
    }): void {
        if (dump.bitsPerByte !== this.bitsPerByte || dump.size !== this.size) {
            throw new Error(
                "Dump metadata does not match current memory configuration",
            );
        }
        this.uint8View.set(dump.buffer);
    }

    /**
     * Returns the number of bits per byte in this memory configuration.
     *
     * @returns Number of bits per byte (1-32)
     */
    getBitsPerByte(): number {
        return this.bitsPerByte;
    }

    /**
     * Returns the maximum value that can be stored in a single byte.
     * This is calculated as (2^bitsPerByte - 1).
     *
     * @returns Maximum byte value (e.g., 255 for 8-bit, 15 for 4-bit)
     */
    getMaxByteValue(): number {
        return this.maxByteValue;
    }

    /**
     * Returns the number of bytes that constitute a word in this memory configuration.
     *
     * @returns Word size in bytes
     */
    getWordSize(): number {
        return this.wordSize;
    }

    /**
     * Returns a copy of the endianness configuration array.
     * The returned array is a copy to prevent external modification.
     *
     * @returns Copy of endianness array
     *
     * @example Checking endianness configuration
     * ```typescript
     * const memory = new Memory(100, 8, 4, [3, 2, 1, 0]);
     * console.log(memory.getEndianness()); // [3, 2, 1, 0]
     * ```
     */
    getEndianness(): number[] {
        return [...this.endianness];
    }

    /**
     * Returns an array of all memory addresses that contain non-zero values,
     * sorted from highest to lowest address.
     *
     * This method scans through all memory locations and identifies addresses
     * that have been written to (contain non-zero values). The returned addresses
     * are sorted in descending order for easy inspection of memory usage patterns.
     *
     * @returns Array of bigint addresses containing non-zero values, sorted highest to lowest
     *
     * @example Finding used memory addresses
     * ```typescript
     * const memory = new Memory(100);
     * memory.write(5n, 123);
     * memory.write(10n, 255);
     * memory.write(7n, 0);    // Zero value - won't be included
     * memory.write(50n, 42);
     *
     * const usedAddresses = memory.getUsedAddresses();
     * console.log(usedAddresses); // [50n, 10n, 5n]
     * ```
     *
     * @example With custom byte sizes
     * ```typescript
     * const memory = new Memory(50, 12); // 12-bit bytes
     * memory.write(0n, 1000);
     * memory.write(25n, 4095); // Max 12-bit value
     * memory.write(15n, 0);    // Zero - won't be included
     *
     * console.log(memory.getUsedAddresses()); // [25n, 0n]
     * ```
     */
    getUsedAddresses(): bigint[] {
        const usedAddresses: bigint[] = [];

        if (this.bitsPerByte === 8) {
            // Fast path for 8-bit bytes: directly scan the storage buffer
            for (let addr = 0; addr < this.size; addr++) {
                if (this.uint8View[addr] !== 0) {
                    usedAddresses.push(BigInt(addr));
                }
            }
        } else {
            // For custom byte sizes, we need to decode values
            // But we can optimize by checking storage bytes first
            const usedStorageBytes = new Set<number>();

            // First pass: find which storage bytes are non-zero
            for (let i = 0; i < this.uint8View.length; i++) {
                if (this.uint8View[i] !== 0) {
                    usedStorageBytes.add(i);
                }
            }

            // If no storage bytes are used, return empty array
            if (usedStorageBytes.size === 0) {
                return [];
            }

            // Second pass: only check addresses that could be affected by non-zero storage bytes
            for (let addr = 0; addr < this.size; addr++) {
                const bitOffset = addr * this.bitsPerByte;
                const startByteIndex = Math.floor(bitOffset / 8);
                const endByteIndex = Math.floor(
                    (bitOffset + this.bitsPerByte - 1) / 8,
                );

                // Check if any storage byte that this address spans is non-zero
                let couldBeNonZero = false;
                for (
                    let byteIdx = startByteIndex;
                    byteIdx <= endByteIndex;
                    byteIdx++
                ) {
                    if (usedStorageBytes.has(byteIdx)) {
                        couldBeNonZero = true;
                        break;
                    }
                }

                // Only do expensive read if the address could possibly be non-zero
                if (couldBeNonZero) {
                    const value = this.read(BigInt(addr));
                    if (value !== 0) {
                        usedAddresses.push(BigInt(addr));
                    }
                }
            }
        }

        // Sort addresses from highest to lowest
        usedAddresses.sort((a, b) => {
            if (a > b) return -1;
            if (a < b) return 1;
            return 0;
        });

        return usedAddresses;
    }

    /**
     * Splits a large value into bytes according to the memory's byte size configuration.
     * The result is in big-endian order (most significant byte first).
     *
     * This method is useful for converting multi-byte values into individual bytes
     * that can be stored in memory using write() operations.
     *
     * @param value - Value to split (must be non-negative)
     * @returns Array of byte values in big-endian order
     *
     * @throws Error if value is negative
     *
     * @example Splitting values with 8-bit bytes
     * ```typescript
     * const memory = new Memory(100, 8);
     * console.log(memory.splitToBytes(0x1234n)); // [0x12, 0x34]
     * console.log(memory.splitToBytes(0x123456n)); // [0x12, 0x34, 0x56]
     * ```
     *
     * @example Splitting values with 4-bit bytes
     * ```typescript
     * const memory = new Memory(100, 4);
     * console.log(memory.splitToBytes(0xABn)); // [10, 11] (0xA=10, 0xB=11)
     * console.log(memory.splitToBytes(0x123n)); // [1, 2, 3]
     * ```
     */
    splitToBytes(value: bigint): number[] {
        if (value < 0n) {
            throw new Error(`Value ${value} cannot be negative`);
        }

        // Special case for 8-bit bytes - use standard approach
        if (this.bitsPerByte === 8) {
            const bytes: number[] = [];
            let remainingValue = value;

            while (remainingValue > 0n) {
                bytes.unshift(Number(remainingValue & 0xffn));
                remainingValue >>= 8n;
            }

            return bytes.length === 0 ? [0] : bytes;
        }

        // For custom byte sizes
        const bytes: number[] = [];
        let remainingValue = value;
        const maxByteValueBigInt = BigInt(this.maxByteValue);
        const bitsPerByteBigInt = BigInt(this.bitsPerByte);

        while (remainingValue > 0n) {
            const byteValue = Number(remainingValue & maxByteValueBigInt);
            bytes.unshift(byteValue);
            remainingValue >>= bitsPerByteBigInt;
        }

        return bytes.length === 0 ? [0] : bytes;
    }

    /**
     * Reads a complete word from memory starting at the specified address.
     *
     * The method reads wordSize consecutive bytes from memory and reorders them
     * according to the endianness configuration to reconstruct the original word.
     * The returned array represents the word in logical order (as it was written).
     *
     * @param address - Starting memory address for the word
     * @returns Array of bytes representing the word in logical order
     *
     * @throws Error if word would exceed memory boundaries
     *
     * @example Reading words with different endianness
     * ```typescript
     * // Little-endian (default)
     * const memoryLE = new Memory(100, 8, 4);
     * memoryLE.writeWord(0n, [0x12, 0x34, 0x56, 0x78]);
     * console.log(memoryLE.readWord(0n)); // [0x12, 0x34, 0x56, 0x78]
     *
     * // Big-endian
     * const memoryBE = new Memory(100, 8, 4, [3, 2, 1, 0]);
     * memoryBE.writeWord(0n, [0x12, 0x34, 0x56, 0x78]);
     * console.log(memoryBE.readWord(0n)); // [0x12, 0x34, 0x56, 0x78] (same logical result)
     *
     * // But physical memory layout differs:
     * console.log(memoryLE.read(0n)); // 0x12 (LE: first byte stored first)
     * console.log(memoryBE.read(0n)); // 0x78 (BE: last byte stored first)
     * ```
     */
    readWord(address: bigint): number[] {
        const addr = Number(address);
        if (addr + this.wordSize > this.size) {
            throw new Error(
                `Word at address ${addr} with size ${this.wordSize} exceeds memory size ${this.size}`,
            );
        }

        const bytes: number[] = [];
        for (let i = 0; i < this.wordSize; i++) {
            bytes.push(this.read(BigInt(addr + i)));
        }

        // Reorder bytes according to endianness
        // endianness[i] tells us which word position should come from memory position i
        const reorderedBytes: number[] = new Array(this.wordSize);
        for (let i = 0; i < this.wordSize; i++) {
            reorderedBytes[this.endianness[i]] = bytes[i];
        }

        return reorderedBytes;
    }

    /**
     * Writes a complete word to memory starting at the specified address.
     *
     * The method takes a word as an array of bytes in logical order and stores
     * them in memory according to the endianness configuration. The endianness
     * determines the physical layout in memory while preserving the logical
     * word structure for readWord operations.
     *
     * @param address - Starting memory address for the word
     * @param word - Array of bytes representing the word in logical order
     *
     * @throws Error if word would exceed memory boundaries
     * @throws Error if word array length doesn't match configured word size
     * @throws Error if any byte value exceeds maxByteValue or is negative
     *
     * @example Writing words with different configurations
     * ```typescript
     * // Standard 4-byte word
     * const memory = new Memory(100, 8, 4);
     * memory.writeWord(0n, [0x12, 0x34, 0x56, 0x78]);
     *
     * // 2-byte word with big-endian
     * const memory16 = new Memory(100, 8, 2, [1, 0]);
     * memory16.writeWord(10n, [0xAB, 0xCD]);
     * // Physical layout: [0xCD, 0xAB] but readWord returns [0xAB, 0xCD]
     *
     * // Custom byte size with mixed endianness
     * const custom = new Memory(50, 6, 3, [2, 0, 1]);
     * custom.writeWord(5n, [32, 21, 63]); // All values ≤ 63 for 6-bit bytes
     * ```
     *
     * @example Error cases
     * ```typescript
     * const memory = new Memory(100, 4, 4); // 4-bit bytes, max value 15
     *
     * // These will throw errors:
     * // memory.writeWord(0n, [1, 2, 3]);        // Wrong length (3 vs 4)
     * // memory.writeWord(0n, [1, 2, 3, 16]);    // Value 16 > max 15
     * // memory.writeWord(98n, [1, 2, 3, 4]);    // Exceeds memory boundary
     * ```
     */
    writeWord(address: bigint, word: number[]): void {
        const addr = Number(address);
        if (addr + this.wordSize > this.size) {
            throw new Error(
                `Word at address ${addr} with size ${this.wordSize} exceeds memory size ${this.size}`,
            );
        }

        if (word.length !== this.wordSize) {
            throw new Error(
                `Word array length (${word.length}) must match word size (${this.wordSize})`,
            );
        }

        // Validate all bytes in the word
        for (let i = 0; i < word.length; i++) {
            if (word[i] > this.maxByteValue || word[i] < 0) {
                throw new Error(
                    `Word byte ${i} value ${word[i]} exceeds byte size (max: ${this.maxByteValue})`,
                );
            }
        }

        // Reorder bytes according to endianness and write to memory
        // endianness[i] tells us which word position should go to memory position i
        const bytesToWrite: number[] = new Array(this.wordSize);
        for (let i = 0; i < this.wordSize; i++) {
            bytesToWrite[i] = word[this.endianness[i]];
        }

        for (let i = 0; i < this.wordSize; i++) {
            this.write(BigInt(addr + i), bytesToWrite[i]);
        }
    }
}
