import math
import json
from elftools.elf.elffile import ELFFile
from elftools.elf.sections import SymbolTableSection
import argparse

def isElf(filepath):
    print(f"Checking if {filepath} is an ELF file...")
    try:
        with open(filepath, 'rb') as file:
            ELFFile(file)
            print("File is a valid ELF file")
            return True
    except Exception as e:
        print(f"Not an ELF file: {str(e)}")
        return False

def process_section(section, symbols, section_name):
    print(f"\nProcessing {section_name} section...")
    instructions = []
    
    if not section:
        print(f"No {section_name} section found")
        return instructions
        
    print(f"Found {section_name} section: Size={section['sh_size']}, Addr={hex(section['sh_addr'])}")
    
    # Read instructions
    data = section.data()
    for i in range(0, len(data), 4):
        addr = section['sh_addr'] + i
        instruction = int.from_bytes(data[i:i+4], byteorder='little')
        
        instruction_entry = {
            "Break": None,
            "Address": f"0x{addr:x}",
            "Label": symbols[addr]['name'] if addr in symbols else "",
            "loaded": format(instruction, '032b'),
            "user": None,
            "_rowVariant": "",
            "visible": True
        }
        
        if addr in symbols and symbols[addr]['globl']:
            instruction_entry["globl"] = True
            print(f"Global symbol found at address {hex(addr)}: {symbols[addr]['name']}")
            
        instructions.append(instruction_entry)
    
    print(f"Processed {len(instructions)} instructions from {section_name}")
    return instructions

def extract_instructions(filename):
    print(f"\nExtracting instructions from {filename}")
    with open(filename, 'rb') as f:
        elf = ELFFile(f)
        print("ELF file opened successfully")
        
        symbols = {}
        
        # Process symbols first
        print("\nProcessing symbols...")
        for section in elf.iter_sections():
            if isinstance(section, SymbolTableSection):
                print(f"Found symbol table '{section.name}' with {section.num_symbols()} entries")
                for symbol in section.iter_symbols():
                    if symbol['st_info']['type'] in ['STT_FUNC', 'STT_NOTYPE', 'STT_OBJECT']:
                        symbols[symbol['st_value']] = {
                            'name': symbol.name,
                            'size': symbol['st_size'],
                            'type': symbol['st_info']['type'],
                            'bind': symbol['st_info']['bind'],
                            'section': symbol['st_shndx'],
                            'globl': symbol['st_info']['bind'] == 'STB_GLOBAL'
                        }
                        print(f"Symbol: {symbol.name} ({symbol['st_info']['type']}) at {hex(symbol['st_value'])}")

        # Process both sections
        text_section = elf.get_section_by_name('.text')
        text_init_section = elf.get_section_by_name('.text.init')
        
        instructions = []
        instructions.extend(process_section(text_section, symbols, '.text'))
        instructions.extend(process_section(text_init_section, symbols, '.text.init'))
        
        # Sort instructions by address
        instructions.sort(key=lambda x: int(x["Address"], 16))
        
        # Create instructions_tag structure
        print("\nCreating instruction tags...")
        instructions_tag = []
        for addr, symbol_info in symbols.items():
            tag_entry = {
                "tag": symbol_info['name'],
                "addr": addr,
                "globl": symbol_info['globl']
            }
            instructions_tag.append(tag_entry)
        print(f"Created {len(instructions_tag)} instruction tags")
            
        return {
            "instructions_binary": instructions,
            "instructions_tag": instructions_tag
        }
def save_to_json(data, output_file):
    print(f"\nSaving data to {output_file}")
    try:
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully wrote {len(data['instructions_binary'])} instructions to {output_file}")
    except Exception as e:
        print(f"Error saving JSON: {str(e)}")

def main():
    parser = argparse.ArgumentParser(description='Convert ELF file to Creator Binary JSON format')
    parser.add_argument('input', help='Path to input ELF file')
    parser.add_argument('--output', '-o', default='output.o', help='Path to output JSON file (default: output.o)')
    
    args = parser.parse_args()
    elf_path = args.input
    output_path = args.output
    
    print(f"\n=== Starting ELF processing ===")
    
    if not isElf(elf_path):
        print(f"Error: {elf_path} is not an ELF file")
        return
        
    try:
        print("\nExtracting data from ELF file...")
        data = extract_instructions(elf_path)
        save_to_json(data, output_path)
        print(f"\nSuccess: Converted {elf_path} to {output_path}")
    except Exception as e:
        print(f"\nError during execution: {str(e)}")
        import traceback
        print(traceback.format_exc())

if __name__ == "__main__":
    main()