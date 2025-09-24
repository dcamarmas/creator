
let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(`util`);

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_2.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_export_2.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
/**
 * Method used to render colors in error messages
 * @enum {0 | 1 | 2}
 */
module.exports.Color = Object.freeze({
    /**
     * Use HTML tags, intended for display in browsers
     */
    Html: 0, "0": "Html",
    /**
     * Use ANSI escape codes, intended for display in terminals
     */
    Ansi: 1, "1": "Ansi",
    /**
     * Disable all formatting, using only plain text
     */
    Off: 2, "2": "Off",
});
/**
 * General category of a compiled data element
 * @enum {0 | 1 | 2 | 3}
 */
module.exports.DataCategoryJS = Object.freeze({
    /**
     * Element represents a number
     */
    Number: 0, "0": "Number",
    /**
     * Element represents a string
     */
    String: 1, "1": "String",
    /**
     * Element represents a reserved amount of space initialized to 0
     */
    Space: 2, "2": "Space",
    /**
     * Element represents padding that was added to align values
     */
    Padding: 3, "3": "Padding",
});

const ArchitectureJSFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_architecturejs_free(ptr >>> 0, 1));
/**
 * r" Architecture definition
 */
class ArchitectureJS {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ArchitectureJS.prototype);
        obj.__wbg_ptr = ptr;
        ArchitectureJSFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ArchitectureJSFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_architecturejs_free(ptr, 0);
    }
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
     * @param {string} json
     * @returns {ArchitectureJS}
     */
    static from_json(json) {
        const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.architecturejs_from_json(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ArchitectureJS.__wrap(ret[0]);
    }
    /**
     * Converts the architecture to a pretty printed string for debugging
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.architecturejs_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
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
     * @param {string} src
     * @param {number} reserved_offset
     * @param {string} labels
     * @param {boolean} library
     * @param {Color} color
     * @returns {CompiledCodeJS}
     */
    compile(src, reserved_offset, labels, library, color) {
        const ptr0 = passStringToWasm0(src, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(labels, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.architecturejs_compile(this.__wbg_ptr, ptr0, len0, reserved_offset, ptr1, len1, library, color);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return CompiledCodeJS.__wrap(ret[0]);
    }
    /**
     * Generate a `JSON` schema
     * @returns {string}
     */
    static schema() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.architecturejs_schema();
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
module.exports.ArchitectureJS = ArchitectureJS;

const CompiledCodeJSFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_compiledcodejs_free(ptr >>> 0, 1));
/**
 * Assembly compilation output
 */
class CompiledCodeJS {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CompiledCodeJS.prototype);
        obj.__wbg_ptr = ptr;
        CompiledCodeJSFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CompiledCodeJSFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_compiledcodejs_free(ptr, 0);
    }
    /**
     * Compiled instructions to execute
     * @returns {InstructionJS[]}
     */
    get instructions() {
        const ret = wasm.__wbg_get_compiledcodejs_instructions(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Compiled data to add to the data segment
     * @returns {DataJS[]}
     */
    get data() {
        const ret = wasm.__wbg_get_compiledcodejs_data(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Symbol table for labels
     * @returns {LabelJS[]}
     */
    get label_table() {
        const ret = wasm.__wbg_get_compiledcodejs_label_table(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Converts the compiled code to a pretty printed string for debugging
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.compiledcodejs_toString(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
module.exports.CompiledCodeJS = CompiledCodeJS;

const DataJSFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_datajs_free(ptr >>> 0, 1));
/**
 * Compiled data wrapper
 */
class DataJS {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(DataJS.prototype);
        obj.__wbg_ptr = ptr;
        DataJSFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DataJSFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_datajs_free(ptr, 0);
    }
    /**
     * Address of the data element
     * @returns {bigint}
     */
    address() {
        const ret = wasm.datajs_address(this.__wbg_ptr);
        return ret;
    }
    /**
     * Labels pointing to this data element
     * @returns {string[]}
     */
    labels() {
        const ret = wasm.datajs_labels(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
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
     * @param {boolean} human
     * @returns {string}
     */
    value(human) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.datajs_value(this.__wbg_ptr, human);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Precise type of the data element
     * @returns {string}
     */
    type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.datajs_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * General category of the data element
     * @returns {DataCategoryJS}
     */
    data_category() {
        const ret = wasm.datajs_data_category(this.__wbg_ptr);
        return ret;
    }
    /**
     * Size of the data element in bytes
     * @returns {bigint}
     */
    size() {
        const ret = wasm.datajs_size(this.__wbg_ptr);
        return ret;
    }
}
module.exports.DataJS = DataJS;

const InstructionJSFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_instructionjs_free(ptr >>> 0, 1));
/**
 * Compiled instruction wrapper
 */
class InstructionJS {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(InstructionJS.prototype);
        obj.__wbg_ptr = ptr;
        InstructionJSFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        InstructionJSFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_instructionjs_free(ptr, 0);
    }
    /**
     * Address of the instruction in hexadecimal (`0xABCD`)
     * @returns {string}
     */
    get address() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_instructionjs_address(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Address of the instruction in hexadecimal (`0xABCD`)
     * @param {string} arg0
     */
    set address(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_instructionjs_address(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Labels pointing to this instruction
     * @returns {string[]}
     */
    get labels() {
        const ret = wasm.__wbg_get_instructionjs_labels(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Labels pointing to this instruction
     * @param {string[]} arg0
     */
    set labels(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_instructionjs_labels(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Translated instruction to a simplified syntax
     * @returns {string}
     */
    get loaded() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_instructionjs_loaded(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Translated instruction to a simplified syntax
     * @param {string} arg0
     */
    set loaded(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_instructionjs_loaded(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Instruction encoded in binary
     * @returns {string}
     */
    get binary() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_instructionjs_binary(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Instruction encoded in binary
     * @param {string} arg0
     */
    set binary(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_instructionjs_binary(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Instruction in the code
     * @returns {string}
     */
    get user() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_instructionjs_user(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Instruction in the code
     * @param {string} arg0
     */
    set user(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_instructionjs_user(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.InstructionJS = InstructionJS;

const LabelJSFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_labeljs_free(ptr >>> 0, 1));
/**
 * Label table entry wrapper
 */
class LabelJS {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(LabelJS.prototype);
        obj.__wbg_ptr = ptr;
        LabelJSFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LabelJSFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_labeljs_free(ptr, 0);
    }
    /**
     * Name of the label
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_labeljs_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Name of the label
     * @param {string} arg0
     */
    set name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_instructionjs_address(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Address to which the label points
     * @returns {bigint}
     */
    get address() {
        const ret = wasm.__wbg_get_labeljs_address(this.__wbg_ptr);
        return ret;
    }
    /**
     * Address to which the label points
     * @param {bigint} arg0
     */
    set address(arg0) {
        wasm.__wbg_set_labeljs_address(this.__wbg_ptr, arg0);
    }
    /**
     * Whether the label is local to the file (`false`) or global
     * @returns {boolean}
     */
    get global() {
        const ret = wasm.__wbg_get_labeljs_global(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Whether the label is local to the file (`false`) or global
     * @param {boolean} arg0
     */
    set global(arg0) {
        wasm.__wbg_set_labeljs_global(this.__wbg_ptr, arg0);
    }
}
module.exports.LabelJS = LabelJS;

module.exports.__wbg_BigInt_470dd987b8190f8e = function(arg0) {
    const ret = BigInt(arg0);
    return ret;
};

module.exports.__wbg_BigInt_ddea6d2f55558acb = function() { return handleError(function (arg0) {
    const ret = BigInt(arg0);
    return ret;
}, arguments) };

module.exports.__wbg_String_0a7a65e4c87a9a2a = function(arg0) {
    const ret = String(arg0);
    return ret;
};

module.exports.__wbg_call_359af57880ff6188 = function() { return handleError(function (arg0, arg1) {
    const ret = arg0.call(arg1);
    return ret;
}, arguments) };

module.exports.__wbg_datajs_new = function(arg0) {
    const ret = DataJS.__wrap(arg0);
    return ret;
};

module.exports.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
};

module.exports.__wbg_eval_e10dc02e9547f640 = function() { return handleError(function (arg0, arg1) {
    const ret = eval(getStringFromWasm0(arg0, arg1));
    return ret;
}, arguments) };

module.exports.__wbg_instructionjs_new = function(arg0) {
    const ret = InstructionJS.__wrap(arg0);
    return ret;
};

module.exports.__wbg_labeljs_new = function(arg0) {
    const ret = LabelJS.__wrap(arg0);
    return ret;
};

module.exports.__wbg_new_8a6f238a6ece86ea = function() {
    const ret = new Error();
    return ret;
};

module.exports.__wbg_newnoargs_177cedd42cb6a2bc = function() { return handleError(function (arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return ret;
}, arguments) };

module.exports.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

module.exports.__wbg_toString_2f76f493957b63da = function(arg0, arg1, arg2) {
    const ret = arg1.toString(arg2);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

module.exports.__wbindgen_debug_string = function(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

module.exports.__wbindgen_init_externref_table = function() {
    const table = wasm.__wbindgen_export_2;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
};

module.exports.__wbindgen_lt = function(arg0, arg1) {
    const ret = arg0 < arg1;
    return ret;
};

module.exports.__wbindgen_neg = function(arg0) {
    const ret = -arg0;
    return ret;
};

module.exports.__wbindgen_number_new = function(arg0) {
    const ret = arg0;
    return ret;
};

module.exports.__wbindgen_string_get = function(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

module.exports.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

const path = require('path').join(__dirname, 'creator_compiler_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

wasm.__wbindgen_start();

