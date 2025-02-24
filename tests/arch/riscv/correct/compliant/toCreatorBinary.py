import math
import json
import logging
from elftools.elf.elffile import ELFFile
from elftools.elf.sections import SymbolTableSection
import argparse

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

def isElf(filepath):
    logging.debug("Validating ELF file: %s", filepath)
    try:
        with open(filepath, 'rb') as file:
            ELFFile(file)
            logging.debug("File validation successful: valid ELF format")
            return True
    except Exception as e:
        logging.error("ELF validation failed: %s", str(e))
        return False

def process_section(section, symbols, section_name):
    logging.info("Processing section: %s", section_name)
    instructions = []
    
    if not section:
        logging.warning("Section not found: %s", section_name)
        return instructions
        
    logging.debug("Section details - Size: %d, Address: %s", 
                 section['sh_size'], hex(section['sh_addr']))
    
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
            logging.debug("Global symbol found - Address: %s, Name: %s",
                        hex(addr), symbols[addr]['name'])
            
        instructions.append(instruction_entry)
    
    logging.info("Section processing complete - Instructions parsed: %d", len(instructions))
    return instructions

def extract_instructions(filename):
    logging.info("Initiating instruction extraction from: %s", filename)
    with open(filename, 'rb') as f:
        elf = ELFFile(f)
        logging.debug("ELF file loaded successfully")
        
        symbols = {}
        
        # Process symbols
        logging.info("Processing symbol tables")
        for section in elf.iter_sections():
            if isinstance(section, SymbolTableSection):
                logging.debug("Symbol table found: %s (entries: %d)", 
                            section.name, section.num_symbols())
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
                        logging.debug("Processed symbol - Name: %s, Type: %s, Address: %s",
                                    symbol.name, symbol['st_info']['type'], 
                                    hex(symbol['st_value']))

        # Process sections
        text_section = elf.get_section_by_name('.text')
        text_init_section = elf.get_section_by_name('.text.init')
        
        instructions = []
        instructions.extend(process_section(text_section, symbols, '.text'))
        instructions.extend(process_section(text_init_section, symbols, '.text.init'))
        
        # Sort instructions by address
        instructions.sort(key=lambda x: int(x["Address"], 16))
        
        # Create instructions_tag structure
        logging.info("Generating instruction tags")
        instructions_tag = []
        for addr, symbol_info in symbols.items():
            tag_entry = {
                "tag": symbol_info['name'],
                "addr": addr,
                "globl": symbol_info['globl']
            }
            instructions_tag.append(tag_entry)
        logging.debug("Instruction tags created: %d", len(instructions_tag))
            
        return {
            "instructions_binary": instructions,
            "instructions_tag": instructions_tag
        }

def save_to_json(data, output_file):
    logging.info("Saving output to: %s", output_file)
    try:
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        logging.info("Successfully wrote %d instructions to file",
                    len(data['instructions_binary']))
    except Exception as e:
        logging.error("Failed to save JSON file: %s", str(e))
        raise

def main():
    parser = argparse.ArgumentParser(description='Convert ELF file to Creator Binary JSON format')
    parser.add_argument('input', help='Path to input ELF file')
    parser.add_argument('--output', '-o', default='output.o', help='Path to output JSON file (default: output.o)')
    parser.add_argument('--debug', action='store_true', help='Enable debug logging')
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging()
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
    
    logging.info("Starting ELF to Creator Binary conversion")
    
    if not isElf(args.input):
        logging.error("Invalid input file: not an ELF file")
        return 1
        
    try:
        data = extract_instructions(args.input)
        save_to_json(data, args.output)
        logging.info("Conversion completed successfully")
        return 0
    except Exception as e:
        logging.error("Conversion failed: %s", str(e), exc_info=True)
        return 1

if __name__ == "__main__":
    main()