import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
    crex_findReg,
    crex_findReg_bytag,
} from "../../../../src/core/register/registerLookup.mjs";
import { architecture } from "../../../../src/core/core.mjs";

function setupArchitecture() {
    architecture.components = [
        {
            name: "Registers",
            elements: [
                {
                    name: ["r1", "x1"],
                    properties: ["reg", "integer"],
                },
                {
                    name: ["r2", "x2"],
                    properties: ["reg", "integer"],
                },
            ],
        },
        {
            name: "Control Registers",
            elements: [
                {
                    name: ["pc"],
                    properties: ["pc", "register"],
                },
                {
                    name: ["status"],
                    properties: ["status", "register"],
                },
            ],
        },
    ];
}

Deno.test("crex_findReg - empty string returns no match", () => {
    setupArchitecture();
    const result = crex_findReg("");
    assertEquals(result, {
        match: 0,
        indexComp: null,
        indexElem: null,
    });
});

Deno.test("crex_findReg - finds register by exact name", () => {
    setupArchitecture();
    const result = crex_findReg("r1");
    assertEquals(result, {
        match: 1,
        indexComp: 0,
        indexElem: 0,
    });
});

Deno.test("crex_findReg - finds register by alternative name", () => {
    setupArchitecture();
    const result = crex_findReg("x1");
    assertEquals(result, {
        match: 1,
        indexComp: 0,
        indexElem: 0,
    });
});

Deno.test("crex_findReg - non-existent register returns no match", () => {
    setupArchitecture();
    const result = crex_findReg("r99");
    assertEquals(result, {
        match: 0,
        indexComp: null,
        indexElem: null,
    });
});

Deno.test("crex_findReg_bytag - empty string returns no match", () => {
    setupArchitecture();
    const result = crex_findReg_bytag("");
    assertEquals(result, {
        match: 0,
        indexComp: null,
        indexElem: null,
    });
});

Deno.test("crex_findReg_bytag - finds register by property tag", () => {
    setupArchitecture();
    const result = crex_findReg_bytag("pc");
    assertEquals(result, {
        match: 1,
        indexComp: 1,
        indexElem: 0,
    });
});

Deno.test("crex_findReg_bytag - finds register by common property", () => {
    setupArchitecture();
    const result = crex_findReg_bytag("register");
    assertEquals(result, {
        match: 1,
        indexComp: 1,
        indexElem: 0,
    });
});

Deno.test("crex_findReg_bytag - non-existent property returns no match", () => {
    setupArchitecture();
    const result = crex_findReg_bytag("nonexistent");
    assertEquals(result, {
        match: 0,
        indexComp: null,
        indexElem: null,
    });
});
