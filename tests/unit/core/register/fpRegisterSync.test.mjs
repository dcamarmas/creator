import {
    assertEquals,
    assertNotEquals,
} from "https://deno.land/std/assert/mod.ts";
import {
    updateDouble,
    updateSimple,
} from "../../../../src/core/register/fpRegisterSync.mjs";
import { architecture } from "../../../../src/core/core.mjs";
import {
    bi_doubleToBigInt,
    bi_floatToBigInt,
} from "../../../../src/core/utils/bigint.mjs";

function setupArchitecture() {
    architecture.components = [
        {
            name: "FP Single Precision",
            double_precision: false,
            elements: [
                {
                    name: ["f1", "ft1"],
                    nbits: "32",
                    value: bi_floatToBigInt(1.5),
                    default_value: 0.0,
                    properties: ["read", "write"],
                },
                {
                    name: ["f2", "ft2"],
                    nbits: "32",
                    value: bi_floatToBigInt(2.5),
                    default_value: 0.0,
                    properties: ["read", "write"],
                },
            ],
        },
        {
            name: "FP Double Precision",
            double_precision: true,
            double_precision_type: "linked",
            elements: [
                {
                    name: ["d1", "dt1"],
                    nbits: "64",
                    value: bi_doubleToBigInt(3.14159),
                    default_value: 0.0,
                    properties: ["read", "write"],
                    simple_reg: ["f1", "f2"],
                },
            ],
        },
    ];
}

Deno.test("updateDouble - first simple precision register changes", () => {
    setupArchitecture();
    const initialDoubleValue = architecture.components[1].elements[0].value;
    updateDouble(0, 0);
    const doubleValue = architecture.components[1].elements[0].value;

    assertNotEquals(doubleValue, initialDoubleValue);
    assertEquals(architecture.components[1].elements[0].nbits, "64");
    assertEquals(architecture.components[1].elements[0].properties, [
        "read",
        "write",
    ]);
});

Deno.test("updateDouble - second simple precision register changes", () => {
    setupArchitecture();
    const initialDoubleValue = architecture.components[1].elements[0].value;
    updateDouble(0, 1);
    const doubleValue = architecture.components[1].elements[0].value;

    assertNotEquals(doubleValue, initialDoubleValue);
    assertEquals(architecture.components[1].elements[0].nbits, "64");
    assertEquals(architecture.components[1].elements[0].properties, [
        "read",
        "write",
    ]);
});

Deno.test(
    "updateSimple - double precision register changes affect both simple registers",
    () => {
        setupArchitecture();
        const initialF1 = architecture.components[0].elements[0].value;
        const initialF2 = architecture.components[0].elements[1].value;

        updateSimple(1, 0);

        const updatedF1 = architecture.components[0].elements[0].value;
        const updatedF2 = architecture.components[0].elements[1].value;

        assertNotEquals(updatedF1, initialF1);
        assertNotEquals(updatedF2, initialF2);
        assertEquals(architecture.components[0].elements[0].nbits, "32");
        assertEquals(architecture.components[0].elements[0].properties, [
            "read",
            "write",
        ]);
        assertEquals(architecture.components[0].elements[1].nbits, "32");
        assertEquals(architecture.components[0].elements[1].properties, [
            "read",
            "write",
        ]);
    },
);

Deno.test("updateSimple - maintains register properties", () => {
    setupArchitecture();
    updateSimple(1, 0);

    architecture.components.forEach(component => {
        component.elements.forEach(element => {
            assertEquals(Array.isArray(element.name), true);
            assertEquals(typeof element.nbits, "string");
            assertEquals(typeof element.value, "bigint");
            assertEquals(typeof element.default_value, "number");
            assertEquals(element.properties, ["read", "write"]);
        });
    });
});
