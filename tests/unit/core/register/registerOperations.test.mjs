import {
    assertEquals,
    assertThrows,
    assert,
} from "https://deno.land/std/assert/mod.ts";
import {
    readRegister,
    writeRegister,
} from "../../../../src/core/register/registerOperations.mjs";
import { architecture } from "../../../../src/core/core.mjs";
import {
    bi_intToBigInt,
    bi_floatToBigInt,
    bi_doubleToBigInt,
} from "../../../../src/core/utils/bigint.mjs";

function setupArchitecture() {
    architecture.components = [
        {
            name: "Integer Registers",
            type: "int_registers",
            elements: [
                {
                    name: ["x1"],
                    value: bi_intToBigInt(10),
                    properties: ["read", "write"],
                },
                {
                    name: ["x2"],
                    value: bi_intToBigInt(20),
                    properties: ["read"],
                },
            ],
        },
        {
            name: "Floating Point Registers",
            type: "fp_registers",
            double_precision: false,
            elements: [
                {
                    name: ["f1"],
                    value: bi_floatToBigInt(1.5),
                    properties: ["read", "write"],
                },
            ],
        },
        {
            name: "Double Precision Registers",
            type: "fp_registers",
            double_precision: true,
            double_precision_type: "linked",
            elements: [
                {
                    name: ["d1"],
                    value: bi_doubleToBigInt(3.14159),
                    properties: ["read", "write"],
                },
            ],
        },
    ];
}

Deno.test("readRegister - reads integer register value", () => {
    setupArchitecture();
    const value = readRegister(0, 0);
    assertEquals(value, 10n);
});

Deno.test("readRegister - reads float register value", () => {
    setupArchitecture();
    const value = readRegister(1, 0);
    assert(Math.abs(value - 1.5) < 0.0001);
});

Deno.test("readRegister - reads double register value", () => {
    setupArchitecture();
    const value = readRegister(2, 0);
    assert(Math.abs(value - 3.14159) < 0.00001);
});

Deno.test("writeRegister - writes integer register value", () => {
    setupArchitecture();
    writeRegister(30n, 0, 0);
    assertEquals(architecture.components[0].elements[0].value, 30n);
});

Deno.test("writeRegister - writes float register value", () => {
    setupArchitecture();
    writeRegister(2.5, 1, 0);
    const value = readRegister(1, 0);
    assert(Math.abs(value - 2.5) < 0.0001);
});

Deno.test("writeRegister - writes double register value", () => {
    setupArchitecture();
    writeRegister(6.28318, 2, 0);
    const value = readRegister(2, 0);
    assert(Math.abs(value - 6.28318) < 0.00001);
});

Deno.test("writeRegister - throws error for read-only register", () => {
    setupArchitecture();
    assertThrows(() => writeRegister(50n, 0, 1), Error, /cannot be written/);
});

Deno.test("writeRegister - handles null value", () => {
    setupArchitecture();
    writeRegister(null, 0, 0);
    // If we reach here, no exception was thrown
    assert(true);
});

Deno.test("writeRegister - maintains register properties", () => {
    setupArchitecture();
    writeRegister(30n, 0, 0);
    assertEquals(architecture.components[0].elements[0].properties, [
        "read",
        "write",
    ]);
});

Deno.test("Register Types - handles SFP-Reg type", () => {
    setupArchitecture();
    writeRegister(2.5, 2, 0, "SFP-Reg");
    const value = readRegister(2, 0, "SFP-Reg");
    assert(Math.abs(value - 2.5) < 0.0001);
});

Deno.test("Register Types - handles DFP-Reg type", () => {
    setupArchitecture();
    writeRegister(3.14159, 2, 0, "DFP-Reg");
    const value = readRegister(2, 0, "DFP-Reg");
    assert(Math.abs(value - 3.14159) < 0.00001);
});
