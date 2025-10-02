/* tslint:disable */
/* eslint-disable */
/**
 * Method used to render colors in error messages
 */
export enum Color {
  /**
   * Use HTML tags, intended for display in browsers
   */
  Html = 0,
  /**
   * Use ANSI escape codes, intended for display in terminals
   */
  Ansi = 1,
  /**
   * Disable all formatting, using only plain text
   */
  Off = 2,
}
/**
 * General category of a compiled data element
 */
export enum DataCategoryJS {
  /**
   * Element represents a number
   */
  Number = 0,
  /**
   * Element represents a string
   */
  String = 1,
  /**
   * Element represents a reserved amount of space initialized to 0
   */
  Space = 2,
  /**
   * Element represents padding that was added to align values
   */
  Padding = 3,
}
/**
 * r" Architecture definition
 */
export class ArchitectureJS {
  private constructor();
  free(): void;
  /**
   * Load architecture data from `JSON`
   *
   * # Parameters
   *
   * * `src`: `JSON` data to deserialize
   *
   * # Errors
   *
   * Errors if the input `JSON` data is invalid, either because it's ill-formatted or because it
   * doesn't conform to the specification
   */
  static from_json(json: string): ArchitectureJS;
  /**
   * Converts the architecture to a pretty printed string for debugging
   */
  toString(): string;
  /**
   * Compiles an assembly source according to the architecture description
   *
   * # Parameters
   *
   * * `src`: assembly code to compile
   * * `reserved_offset`: amount of bytes that should be reserved for library instructions
   * * `labels`: mapping from label names specified in the library to their addresses, in `JSON`
   * * `library`: whether the code should be compiled as a library (`true`) or not (`false`)
   * * `color`: method used to render colors in error messages
   *
   * # Errors
   *
   * Errors if the assembly code has a syntactical or semantical error, or if the `labels`
   * parameter is either an invalid `JSON` or has invalid mappings
   */
  compile(src: string, reserved_offset: number, labels: string, library: boolean, color: Color): CompiledCodeJS;
  /**
   * Generate a `JSON` schema
   */
  static schema(): string;
}
/**
 * Assembly compilation output
 */
export class CompiledCodeJS {
  private constructor();
  free(): void;
  /**
   * Converts the compiled code to a pretty printed string for debugging
   */
  toString(): string;
  /**
   * Compiled instructions to execute
   */
  readonly instructions: InstructionJS[];
  /**
   * Compiled data to add to the data segment
   */
  readonly data: DataJS[];
  /**
   * Symbol table for labels
   */
  readonly label_table: LabelJS[];
}
/**
 * Compiled data wrapper
 */
export class DataJS {
  private constructor();
  free(): void;
  /**
   * Address of the data element
   */
  address(): bigint;
  /**
   * Labels pointing to this data element
   */
  labels(): string[];
  /**
   * Value of the data element:
   *
   * * For integers/floating point values, it's their value either in hexadecimal without the
   *   `0x` prefix or as a number, depending on the `human` parameter
   * * For strings, it's their contents
   * * For empty spaces/padding, it's their size as a string
   *
   * # Parameters
   *
   * * `human`: whether to return the value as a human-readable representation or in hexadecimal
   */
  value(human: boolean): string;
  /**
   * Precise type of the data element
   */
  type(): string;
  /**
   * General category of the data element
   */
  data_category(): DataCategoryJS;
  /**
   * Size of the data element in bytes
   */
  size(): bigint;
}
/**
 * Compiled instruction wrapper
 */
export class InstructionJS {
  private constructor();
  free(): void;
  /**
   * Address of the instruction in hexadecimal (`0xABCD`)
   */
  address: string;
  /**
   * Labels pointing to this instruction
   */
  labels: string[];
  /**
   * Translated instruction to a simplified syntax
   */
  loaded: string;
  /**
   * Instruction encoded in binary
   */
  binary: string;
  /**
   * Instruction in the code
   */
  user: string;
}
/**
 * Label table entry wrapper
 */
export class LabelJS {
  private constructor();
  free(): void;
  /**
   * Name of the label
   */
  name: string;
  /**
   * Address to which the label points
   */
  address: bigint;
  /**
   * Whether the label is local to the file (`false`) or global
   */
  global: boolean;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_architecturejs_free: (a: number, b: number) => void;
  readonly architecturejs_from_json: (a: number, b: number) => [number, number, number];
  readonly architecturejs_toString: (a: number) => [number, number];
  readonly architecturejs_compile: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
  readonly architecturejs_schema: () => [number, number];
  readonly __wbg_compiledcodejs_free: (a: number, b: number) => void;
  readonly __wbg_get_compiledcodejs_instructions: (a: number) => [number, number];
  readonly __wbg_get_compiledcodejs_data: (a: number) => [number, number];
  readonly __wbg_get_compiledcodejs_label_table: (a: number) => [number, number];
  readonly compiledcodejs_toString: (a: number) => [number, number];
  readonly __wbg_labeljs_free: (a: number, b: number) => void;
  readonly __wbg_get_labeljs_name: (a: number) => [number, number];
  readonly __wbg_get_labeljs_address: (a: number) => any;
  readonly __wbg_set_labeljs_address: (a: number, b: any) => void;
  readonly __wbg_get_labeljs_global: (a: number) => number;
  readonly __wbg_set_labeljs_global: (a: number, b: number) => void;
  readonly __wbg_instructionjs_free: (a: number, b: number) => void;
  readonly __wbg_get_instructionjs_address: (a: number) => [number, number];
  readonly __wbg_set_instructionjs_address: (a: number, b: number, c: number) => void;
  readonly __wbg_get_instructionjs_labels: (a: number) => [number, number];
  readonly __wbg_set_instructionjs_labels: (a: number, b: number, c: number) => void;
  readonly __wbg_get_instructionjs_loaded: (a: number) => [number, number];
  readonly __wbg_set_instructionjs_loaded: (a: number, b: number, c: number) => void;
  readonly __wbg_get_instructionjs_binary: (a: number) => [number, number];
  readonly __wbg_set_instructionjs_binary: (a: number, b: number, c: number) => void;
  readonly __wbg_get_instructionjs_user: (a: number) => [number, number];
  readonly __wbg_set_instructionjs_user: (a: number, b: number, c: number) => void;
  readonly __wbg_datajs_free: (a: number, b: number) => void;
  readonly datajs_address: (a: number) => any;
  readonly datajs_labels: (a: number) => [number, number];
  readonly datajs_value: (a: number, b: number) => [number, number];
  readonly datajs_type: (a: number) => [number, number];
  readonly datajs_data_category: (a: number) => number;
  readonly datajs_size: (a: number) => any;
  readonly __wbg_set_labeljs_name: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
