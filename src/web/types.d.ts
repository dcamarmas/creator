//! Custom types for the web

type RegisterDetailsItem = {
    name: string[];
    type: string;
    hex: string;
    bin: string;
    signed: string;
    unsigned: string;
    char: string;
    ieee32: string;
    ieee64: string;
};

type AvailableArch = {
    name: string;
    alias: string[];
    file?: string;
    img?: string;
    alt?: string;
    id: string;
    examples: string[];
    description: string;
    guide?: string;
    available: bool;
    default?: bool;
};

type Example = {
    name: string;
    id: string;
    url: string;
    description: string;
};

type ExampleSet = {
    description: string;
    id?: string;
    name: string;
    examples?: Example[];
    url?: string;
};

type VimKeybind = {
    // mode: "normal" | "visual" | "insert";
    mode: string;
    lhs: string;
    rhs: string;
};

type CREATORNotification = {
    color: "success" | "warning" | "danger" | "info";
    time: string;
    date: string;
    mess: string;
};

type MemoryItem = {
    start: number;
    end: number;
    bytes: {
        addr: number;
        value: number;
        tag: string | undefined;
        human: string | undefined;
    }[];
};

type ExecutionDraw = {
    space: number[];
    info: number[];
    success: number[];
    warning: number[];
    danger: number[];
    flash?: number[];
};

type ExecutionResult = {
    error: boolean;
    msg: string | null;
    type?: string | null;
    draw?: ExecutionDraw;
};
