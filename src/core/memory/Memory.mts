import { readFileSync } from "node:fs";

export class Memory {
    private size: number;
    private bitsPerByte: number;
    private maxByteValue: number;
    private buffer: ArrayBuffer;
    private uint8View: Uint8Array;

    constructor(sizeInBytes: number, bitsPerByte: number = 8) {
        if (bitsPerByte < 1 || bitsPerByte > 32) {
            throw new Error("bitsPerByte must be between 1 and 32");
        }

        this.size = sizeInBytes;
        this.bitsPerByte = bitsPerByte;
        this.maxByteValue =
            bitsPerByte === 32 ? 0xffffffff : (1 << bitsPerByte) - 1;

        // Calculate storage needed: we need enough 8-bit bytes to store all the custom bytes
        const bitsNeeded = sizeInBytes * bitsPerByte;
        const storageBytes = Math.ceil(bitsNeeded / 8);

        this.buffer = new ArrayBuffer(storageBytes);
        this.uint8View = new Uint8Array(this.buffer);

        this.uint8View.fill(0);
    }

    zeroOut(): void {
        this.uint8View.fill(0);
    }

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

    // Load ROM data into memory (assumes data uses same byte size)
    loadROM(romData: Uint8Array, offset: bigint = 0n): void {
        if (this.bitsPerByte !== 8) {
            throw new Error(
                "loadROM only supports 8-bit bytes. Use loadCustomROM for other byte sizes.",
            );
        }
        this.uint8View.set(romData, Number(offset));
    }

    // Load ROM data with custom byte size
    loadCustomROM(romData: number[], offset: bigint = 0n): void {
        for (let i = 0; i < romData.length; i++) {
            this.write(offset + BigInt(i), romData[i]);
        }
    }

    // Load binary file from disk into memory
    loadBinaryFile(filePath: string, offset: bigint = 0n): void {
        const fileData = readFileSync(filePath);
        this.loadROM(new Uint8Array(fileData), offset);
    }

    // Read n bytes starting from address
    readBytes(address: bigint, count: number): number[] {
        const result: number[] = [];
        for (let i = 0; i < count; i++) {
            result.push(this.read(BigInt(address) + BigInt(i)));
        }
        return result;
    }

    // Fast dump memory state (stores raw buffer + metadata)
    dump(): { buffer: Uint8Array; bitsPerByte: number; size: number } {
        return {
            buffer: new Uint8Array(this.uint8View),
            bitsPerByte: this.bitsPerByte,
            size: this.size,
        };
    }

    // Fast restore memory state from buffer dump
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

    // Get byte size information
    getBitsPerByte(): number {
        return this.bitsPerByte;
    }

    getMaxByteValue(): number {
        return this.maxByteValue;
    }
}
