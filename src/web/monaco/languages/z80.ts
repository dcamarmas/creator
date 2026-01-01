/**
 * Copyright 2018-2026 CREATOR Team.
 *
 * This file is part of CREATOR.
 *
 * CREATOR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CREATOR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as monaco from "monaco-editor";

/**
 * Z80 Language Configuration
 * Defines brackets, auto-closing pairs, and surrounding pairs
 */
export const z80LanguageConfig: monaco.languages.LanguageConfiguration = {
    comments: {
        lineComment: ";",
    },
    brackets: [
        ["(", ")"],
        ["[", "]"],
    ],
    autoClosingPairs: [
        { open: "(", close: ")" },
        { open: "[", close: "]" },
        { open: "'", close: "'" },
        { open: '"', close: '"' },
    ],
    surroundingPairs: [
        { open: "(", close: ")" },
        { open: "[", close: "]" },
        { open: "'", close: "'" },
        { open: '"', close: '"' },
    ],
};

/**
 * Z80 Monarch Tokens Provider
 * Defines syntax highlighting rules specific to Z80 assembly
 */
export const z80TokensProvider: monaco.languages.IMonarchLanguage = {
    defaultToken: "",
    ignoreCase: true,

    // Z80 8-bit registers
    registers: [
        "a",
        "b",
        "c",
        "d",
        "e",
        "h",
        "l",
        "i",
        "r",
        "ixh",
        "ixl",
        "iyh",
        "iyl",
    ],

    // Z80 16-bit register pairs
    registerPairs: [
        "af",
        "bc",
        "de",
        "hl",
        "sp",
        "ix",
        "iy",
        "af'", // Alternate AF
    ],

    // Z80 flags
    flags: ["z", "nz", "c", "nc", "po", "pe", "p", "m"],

    // Z80 instructions (comprehensive list)
    instructions: [
        // Data transfer
        "ld",
        "push",
        "pop",
        "ex",
        "exx",
        "ldi",
        "ldir",
        "ldd",
        "lddr",
        // Arithmetic
        "add",
        "adc",
        "sub",
        "sbc",
        "and",
        "or",
        "xor",
        "cp",
        "inc",
        "dec",
        "daa",
        "cpl",
        "neg",
        "ccf",
        "scf",
        // Rotate and shift
        "rlca",
        "rla",
        "rrca",
        "rra",
        "rlc",
        "rl",
        "rrc",
        "rr",
        "sla",
        "sra",
        "srl",
        "sll",
        // Bit manipulation
        "bit",
        "set",
        "res",
        // Jump and call
        "jp",
        "jr",
        "djnz",
        "call",
        "ret",
        "reti",
        "retn",
        "rst",
        // I/O
        "in",
        "ini",
        "inir",
        "ind",
        "indr",
        "out",
        "outi",
        "otir",
        "outd",
        "otdr",
        // CPU control
        "nop",
        "halt",
        "di",
        "ei",
        "im",
        // Block operations
        "cpi",
        "cpir",
        "cpd",
        "cpdr",
    ],

    // Common Z80 assembler directives (RASM style)
    directives: [
        "org",
        "equ",
        "db",
        "dw",
        "ds",
        "defb",
        "defw",
        "defs",
        "byte",
        "word",
        "include",
        "incbin",
        "macro",
        "endm",
        "if",
        "ifdef",
        "ifndef",
        "else",
        "endif",
        "align",
        "fill",
        "assert",
        "print",
    ],

    tokenizer: {
        root: [
            // Comments
            [/;.*$/, "comment"],

            // Labels (word followed by colon)
            [/^\s*[a-zA-Z_][\w]*:/, "type.identifier"],

            // Directives (dot prefix)
            [
                /\.[a-zA-Z_][\w]*/,
                {
                    cases: {
                        "@directives": "keyword.directive",
                        "@default": "keyword.directive",
                    },
                },
            ],

            // Instructions
            [
                /[a-zA-Z_][\w]*/,
                {
                    cases: {
                        "@instructions": "keyword",
                        "@registers": "variable.predefined",
                        "@registerPairs": "variable.predefined",
                        "@flags": "constant.language",
                        "@directives": "keyword.directive",
                        "@default": "identifier",
                    },
                },
            ],

            // Hexadecimal numbers (various formats: 0x1234, $1234, 1234h, #1234)
            [/\$[0-9a-fA-F]+/, "number.hex"],
            [/0x[0-9a-fA-F]+/, "number.hex"],
            [/[0-9][0-9a-fA-F]*h/i, "number.hex"],
            [/#\$?[0-9a-fA-F]+/, "number.hex"],

            // Binary numbers (various formats: 0b1010, %1010, 1010b)
            [/0b[01]+/, "number.binary"],
            [/%[01]+/, "number.binary"],
            [/[01]+b/, "number.binary"],

            // Octal numbers
            [/0o[0-7]+/, "number.octal"],
            [/[0-7]+o/, "number.octal"],

            // Decimal numbers
            [/\d+/, "number"],

            // Strings
            [/"([^"\\]|\\.)*$/, "string.invalid"],
            [/'([^'\\]|\\.)*$/, "string.invalid"],
            [/"/, "string", "@string_double"],
            [/'/, "string", "@string_single"],

            // Operators and special characters
            [/[,\[\]()]/, "delimiter"],
            [/[+\-*/%]/, "operator"],
        ],

        string_double: [
            [/[^\\"]+/, "string"],
            [/\\./, "string.escape"],
            [/"/, "string", "@pop"],
        ],

        string_single: [
            [/[^\\']+/, "string"],
            [/\\./, "string.escape"],
            [/'/, "string", "@pop"],
        ],
    },
};

/**
 * Z80 Completion Provider
 * Provides intelligent code completion for Z80 assembly
 */
export function createZ80CompletionProvider(): monaco.languages.CompletionItemProvider {
    return {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            const suggestions: monaco.languages.CompletionItem[] = [];

            // Register completions
            const registers = [
                "a",
                "b",
                "c",
                "d",
                "e",
                "h",
                "l",
                "i",
                "r",
                "ixh",
                "ixl",
                "iyh",
                "iyl",
            ];
            const registerPairs = [
                "af",
                "bc",
                "de",
                "hl",
                "sp",
                "ix",
                "iy",
                "af'",
            ];

            registers.forEach(reg => {
                suggestions.push({
                    label: reg,
                    kind: monaco.languages.CompletionItemKind.Variable,
                    insertText: reg,
                    range,
                    detail: "8-bit register",
                });
            });

            registerPairs.forEach(reg => {
                suggestions.push({
                    label: reg,
                    kind: monaco.languages.CompletionItemKind.Variable,
                    insertText: reg,
                    range,
                    detail: "16-bit register pair",
                });
            });

            // Instruction completions with descriptions
            const instructionDocs: Record<string, string> = {
                ld: "Load data",
                add: "Add",
                sub: "Subtract",
                jp: "Jump",
                jr: "Jump relative",
                call: "Call subroutine",
                ret: "Return from subroutine",
                push: "Push to stack",
                pop: "Pop from stack",
                inc: "Increment",
                dec: "Decrement",
                nop: "No operation",
                halt: "Halt CPU",
            };

            Object.keys(instructionDocs).forEach(inst => {
                suggestions.push({
                    label: inst,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: inst,
                    range,
                    detail: instructionDocs[inst],
                    documentation: instructionDocs[inst],
                });
            });

            return { suggestions };
        },
    };
}

/**
 * Register Z80 language with Monaco Editor
 */
export function registerZ80Language() {
    // Register the language
    monaco.languages.register({
        id: "z80",
        extensions: [".z80", ".asm"],
        aliases: ["Z80", "z80"],
    });

    // Set language configuration
    monaco.languages.setLanguageConfiguration("z80", z80LanguageConfig);

    // Set tokens provider
    monaco.languages.setMonarchTokensProvider("z80", z80TokensProvider);

    // Register completion provider
    monaco.languages.registerCompletionItemProvider(
        "z80",
        createZ80CompletionProvider(),
    );
}
