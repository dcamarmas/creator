type Instruction = {
    Address: string;
    Break: boolean | null;
    Label: string;
    binary: string;
    hide: boolean;
    loaded: string;
    user: string;
    visible: boolean;
    globl?: boolean;
    _rowVariant?: string;
};

export declare const instructions: Instruction[];

type InstructionTagMap = { [addr: number]: { tag: string; global: boolean } };

export declare let tag_instructions: InstructionTagMap;
