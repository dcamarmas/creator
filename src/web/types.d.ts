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

/**
 * Type definition for the root Vue component (App.vue)
 * This allows proper type checking when accessing this.$root
 */
interface AppRootInstance {
    assembly_code: string;
    assemblyError: string;
    keyboard: string;
    display: string;
    enter: boolean | null;
    creator_mode: string;
    vim_mode: boolean;
    autoscroll: boolean;
    instructions: unknown[];
    $refs?: {
        simulatorView?: {
            $refs?: {
                memory?: {
                    $refs?: {
                        memory_table?: {
                            refresh: () => void;
                        };
                    };
                };
                stats?: {
                    refresh: () => void;
                };
                registerFile?: {
                    refresh: () => void;
                };
            };
        };
    };
    $emit?: (event: string, ...args: unknown[]) => void;
}
