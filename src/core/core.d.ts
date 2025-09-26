/**
 * Deno doesn't fully support "sloppy imports"
 * (https://docs.deno.com/runtime/reference/cli/unstable_flags/#--unstable-sloppy-imports),
 * which would make our lives easier by just writting in a `foo.ts` file:
 * ```ts
 * import { architecture, status } from "@/core/core";
 * ```
 *
 * Therefore, this file is currently used to annotate using JSDoc.
 */

type RegisterBank = {
    name: string;
    type: string;
    double_precision: boolean;
    elements: {
        name: string[];
        nbits: string;
        value: number;
        default_value: number;
        properties: string[];
    }[];
};

type Field = {
    name: string;
    valueField: string;
    type: string;
    startbit: number;
    stopbit: number;
    order: number;
    word: number[];
};

type Instruction = {
    name: string;
    co: string;
    template: string;
    description: string;
    separated: Array<number | string>;
    type: string;
    signature: string;
    signatureRaw: string;
    signature_definition: string;
    nwords: number;
    clk_cycles: number;
    fields: Field[];
    definition: string;
    help?: string;
};

export declare const REGISTERS: RegisterBank[];

type Architecture = {
    config: {
        name: string;
        wordSize: number;
        description: string;
        endianness: string;
        memory_alignment: string;
        main_function: string;
        passing_convention: boolean;
        comment_prefix: string;
        start_address: number;
        pc_offset: number;
        byte_size: number;
        assemblers: {
            name: string;
            description: string;
        }[];
    };
    memory_layout: {
        ktext?: { start: number; end: number };
        kdata?: { start: number; end: number };
        text: { start: number; end: number };
        data: { start: number; end: number };
        stack: { start: number; end: number };
    };
    components: RegisterBank[];
    instructions: Instruction[];
    directives: { name: string; action: string }[];
    interrupts: {
        enabled: boolean;
        enable: string;
        disable: string;
        check: string;
        clear: string;
        get_handler_addr: string;
        create: string;
    };
    timer: {
        tick_cycles: number;
        advance: string;
        handler: string;
        is_enabled: string;
        enable: string;
        disable: string;
    };
};
export declare const architecture: Architecture;

import type { ExecutionMode } from "./executor/interrupts.mts";

type Status = {
    execution_init: number;
    executedInstructions: number;
    clkCycles: number;
    run_program: number;

    keyboard: string;
    display: string;
    execution_index: number;
    virtual_PC: bigint;
    error: number;
    execution_mode: ExecutionMode;
    interrupts_enabled: boolean;
};
export declare const status: Status;

import type { Memory } from "./memory/Memory.mts";
export declare const main_memory: Memory;
export declare const main_memory_backup: Memory;

import type { StackTracker } from "./memory/StackTracker.mts";
export declare const stackTracker: StackTracker;

export declare const BYTESIZE: number;
export declare const WORDSIZE: number;
