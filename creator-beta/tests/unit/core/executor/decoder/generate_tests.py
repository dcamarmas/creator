import re

def parse_disassembly(input_text):
    pattern = r'[\da-f]+:\s+([\da-f]{8})\s+fsd\s+(f\d+),(-?\d+)\((x\d+)\)'
    instructions = []
    
    for line in input_text.split('\n'):
        match = re.match(pattern, line)
        if match:
            binary = format(int(match.group(1), 16), '032b')
            src_reg = match.group(2)
            offset = match.group(3)
            base_reg = match.group(4)
            
            instruction_str = f"fsd {src_reg} {offset} ({base_reg})"
            instructions.append((binary, instruction_str))
    
    return instructions

def generate_test_file(instructions):
    template = '''import { decode_test } from "../../common.mjs";
    '''
    
    for i, (binary, assembly) in enumerate(instructions):
        test = f'''Deno.test("decode - fsd instruction {i+1}", () =>
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
with open('fsd_decoder.test.mjs', 'w') as f:
    f.write(test_file_content)

# Print summary
print(f"Generated {len(instructions)} fsd instruction tests")