import re

def parse_disassembly(input_text):
    pattern = r'[\da-f]+:\s+([\da-f]{8})\s+jalr\s+(x\d+),(-?\d+)?\(?(x\d+)\)?'
    instructions = []
    
    for line in input_text.split('\n'):
        match = re.match(pattern, line)
        if match:
            binary = format(int(match.group(1), 16), '032b')
            dest_reg = match.group(2)
            offset = match.group(3) if match.group(3) else '0'
            src_reg = match.group(4)
            
            instruction_str = f"jalr {dest_reg} {offset} ({src_reg})"
            instructions.append((binary, instruction_str))
    
    return instructions

def generate_test_file(instructions):
    template = '''import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { decode_instruction } from "../../../../../src/core/executor/decoder.mjs";
import { load_architecture, architecture } from "../../../../../src/core/core.mjs";
import fs from "node:fs";

function setupArchitecture() {
    const architecturePath = "./architecture/RISC_V_RV32IMFD.json";
    const architecture_file = fs.readFileSync(architecturePath, "utf8");
    load_architecture(architecture_file);
}

function decode_test(instruction, expected) {
    setupArchitecture();
    const result = decode_instruction(instruction);

    assertEquals(result.instructionExec, expected);
}

'''
    
    for i, (binary, assembly) in enumerate(instructions):
        test = f'''Deno.test("decode_instruction - JALR instruction {i+1}", () =>
    decode_test("{binary}", "{assembly}"),
);

'''
        template += test
    
    return template

# Read input from file
with open('main.32.dis', 'r') as f:
    input_text = f.read()

# Parse and generate tests
instructions = parse_disassembly(input_text)
test_file_content = generate_test_file(instructions)

# Write output to file
with open('jalr_decoder.test.mjs', 'w') as f:
    f.write(test_file_content)

# Print summary
print(f"Generated {len(instructions)} JALR instruction tests")