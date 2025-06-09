import { readFileSync } from "node:fs";

enum DataType {
    UINT8,
    UINT16,
    UINT32,
    UINT64,
}

class Memory {
    private size: number;
    private buffer: ArrayBuffer;
    private uint8View: Uint8Array;
    private dataView: DataView;
    private isLittleEndian: boolean;

    constructor(sizeInBytes: number, isLittleEndianDefault: boolean = true) {
        this.size = sizeInBytes;
        this.buffer = new ArrayBuffer(this.size);
        this.uint8View = new Uint8Array(this.buffer);
        this.dataView = new DataView(this.buffer);
        this.isLittleEndian = isLittleEndianDefault;

        this.uint8View.fill(0);
    }

    setEndianness(isLittleEndian: boolean): void {
        this.isLittleEndian = isLittleEndian;
    }

    read(address: bigint, type: DataType = DataType.UINT8): bigint {
        switch (type) {
            case DataType.UINT8:
                return BigInt(this.uint8View[Number(address)]);
            case DataType.UINT16:
                return BigInt(
                    this.dataView.getUint16(
                        Number(address),
                        this.isLittleEndian,
                    ),
                );
            case DataType.UINT32:
                return BigInt(
                    this.dataView.getUint32(
                        Number(address),
                        this.isLittleEndian,
                    ),
                );
            case DataType.UINT64:
                return this.dataView.getBigUint64(
                    Number(address),
                    this.isLittleEndian,
                );
            default:
                throw new Error(`Unsupported data type: ${type}`);
        }
    }

    write(
        address: bigint,
        value: bigint,
        type: DataType = DataType.UINT8,
    ): void {
        switch (type) {
            case DataType.UINT8:
                this.uint8View[Number(address)] = Number(value);
                break;
            case DataType.UINT16:
                this.dataView.setUint16(
                    Number(address),
                    Number(value),
                    this.isLittleEndian,
                );
                break;
            case DataType.UINT32:
                this.dataView.setUint32(
                    Number(address),
                    Number(value),
                    this.isLittleEndian,
                );
                break;
            case DataType.UINT64:
                this.dataView.setBigUint64(
                    Number(address),
                    value,
                    this.isLittleEndian,
                );
                break;
            default:
                throw new Error(`Unsupported data type: ${type}`);
        }
    }

    // Load ROM data into memory
    loadROM(romData: Uint8Array, offset: bigint = 0n): void {
        this.uint8View.set(romData, Number(offset));
    }

    // Load binary file from disk into memory
    loadBinaryFile(filePath: string, offset: bigint = 0n): void {
        const fileData = readFileSync(filePath);
        this.loadROM(new Uint8Array(fileData), offset);
    }
}

// Example usage
const memory = new Memory(1024 * 1024); // 1 MB of memory
memory.setEndianness(true); // Set to little-endian

// Load test.bin file into memory
memory.loadBinaryFile("./test.bin");

console.log(memory.read(0x0n, DataType.UINT8).toString(16));
console.log(memory.read(0x1n, DataType.UINT8).toString(16));
