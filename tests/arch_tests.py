import os
import subprocess
import sys
import time
import argparse
import asyncio

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Test categories with their patterns
test_categories = {
    # RISC-V Tests
    "riscv_examples": {
        "numbers": [2, 3, 4, 5, 6, 7, 8, 11, 12],
        "path": os.path.join(SCRIPT_DIR, "arch/riscv/correct/examples/test_riscv_example"),
        "arch": os.path.join(SCRIPT_DIR, "../architecture/RISCV/RV32IMFD.yml")
    },
    "riscv_libraries": {
        "numbers": range(1, 2),
        "path": os.path.join(SCRIPT_DIR, "arch/riscv/correct/libraries/test_riscv_libraries"),
        "has_lib": True,
        "arch": os.path.join(SCRIPT_DIR, "../architecture/RISCV/RV32IMFD.yml")
    },
    "riscv_syscalls": {
        "numbers": [1, 2, 3, 4, 9, 10, 11],
        "path": os.path.join(SCRIPT_DIR, "arch/riscv/correct/syscalls/test_riscv_syscall"),
        "arch": os.path.join(SCRIPT_DIR, "../architecture/RISCV/RV32IMFD.yml")
    },
    "riscv_execution_errors": {
        "numbers": range(3, 10),
        "path": os.path.join(SCRIPT_DIR, "arch/riscv/error/executor/test_riscv_error_executor"),
        "arch": os.path.join(SCRIPT_DIR, "../architecture/RISCV/RV32IMFD.yml")
    },
    "riscv_passing_convention": {
        "numbers": range(1, 37),
        "path": os.path.join(SCRIPT_DIR, "arch/riscv/sentinel/test_riscv_sentinels"),
        "arch": os.path.join(SCRIPT_DIR, "../architecture/RISCV/RV32IMFD.yml")
    },
    "riscv_instructions": {
            "numbers": [i for i in range(1, 66) if i != 13],
            "path": os.path.join(SCRIPT_DIR, "arch/riscv/instructions/test_riscv_instruction"),
            "arch": os.path.join(SCRIPT_DIR, "../architecture/RISCV/RV32IMFD.yml")
        },
    # MIPS Tests
    "mips_examples": {
        "numbers": [2, 3, 4, 5, 6, 7, 8, 11, 12],
        "path": os.path.join(SCRIPT_DIR, "arch/mips/correct/examples/test_mips_example"),
        "arch": os.path.join(SCRIPT_DIR, "../architecture/MIPS_32.json")
    },
    "mips_libraries": {
        "numbers": range(1, 2),
        "path": os.path.join(SCRIPT_DIR, "arch/mips/correct/libraries/test_mips_libraries"),
        "has_lib": True,
        "arch": os.path.join(SCRIPT_DIR, "../architecture/MIPS_32.json")
    },
    "mips_syscalls": {
        "numbers": [1, 2, 3, 4, 9, 10, 11],
        "path": os.path.join(SCRIPT_DIR, "arch/mips/correct/syscalls/test_mips_syscall"),
        "arch": os.path.join(SCRIPT_DIR, "../architecture/MIPS_32.json")
    },
    "mips_compile_errors": {
        "numbers": [1, 2, 3, 4, 5, 6, 7, 8, 9, 14, 15, 16, 17, 18, 19, 21, 22, 23, 30],
        "path": os.path.join(SCRIPT_DIR, "arch/mips/error/compiler/test_mips_error_compiler"),
        "arch": os.path.join(SCRIPT_DIR, "../architecture/MIPS_32.json")
    },
    "mips_execution_errors": {
        "numbers": range(1, 10),
        "path": os.path.join(SCRIPT_DIR, "arch/mips/error/executor/test_mips_error_executor"),
        "arch": os.path.join(SCRIPT_DIR, "../architecture/MIPS_32.json")
    },
    "mips_passing_convention": {
        "numbers": range(1, 36),
        "path": os.path.join(SCRIPT_DIR, "arch/mips/sentinel/test_mips_sentinels"),
        "arch": os.path.join(SCRIPT_DIR, "../architecture/MIPS_32.json")
    },
    "mips_instructions": {
        "numbers": range(1, 68),
        "path": os.path.join(SCRIPT_DIR, "arch/mips/instructions/test_mips_instruction"),
        "arch": os.path.join(SCRIPT_DIR, "../architecture/MIPS_32.json")
    }
}
    
file_cache = {}


class Colors:
    """ANSI color codes"""
    RESET = "\033[0m"
    RED = "\033[91m"
    GREEN = "\033[92m"

class ColorFormatter:
    """Format strings with colors"""
    use_colors = True

    @staticmethod
    def error(text):
        return f"{Colors.RED}{text}{Colors.RESET}" if ColorFormatter.use_colors else text
    
    @staticmethod
    def success(text):
        return f"{Colors.GREEN}{text}{Colors.RESET}" if ColorFormatter.use_colors else text

def create_diff(expected, actual):
    expected_lines, actual_lines = [], []
    for paragraph in expected.split('\n'):
        for line in paragraph.split(';'):
            line = line.strip()
            if line:
                expected_lines.append(line + ';')
    for paragraph in actual.split('\n'):
        for line in paragraph.split(';'):
            line = line.strip()
            if line:
                actual_lines.append(line + ';')
    width = 50
    output = []
    output.append("┌" + "─" * width + "┬" + "─" * width + "┐")
    output.append("│ " + "EXPECTED".ljust(width-1) + "│ " + "ACTUAL".ljust(width-1) + "│")
    output.append("├" + "─" * width + "┼" + "─" * width + "┤")
    from itertools import zip_longest
    for exp, act in zip_longest(expected_lines, actual_lines, fillvalue=""):
        exp = exp[:width-2].ljust(width-2) if exp else " ".ljust(width-2)
        act = act[:width-2].ljust(width-2) if act else " ".ljust(width-2)
        if exp.strip() != act.strip():
            exp = ColorFormatter.error(exp)
            act = ColorFormatter.error(act)
        output.append(f"│ {exp} │ {act} │")
    output.append("└" + "─" * width + "┴" + "─" * width + "┘")
    return "\n".join(output)

def read_file(path):
    if path in file_cache:
        return file_cache[path]
    with open(path, 'r') as f:
        data = f.read()
    file_cache[path] = data
    return data

async def run_single_test(args):
    """Run a single test with given arguments"""
    test_num, base_path, lib_path, arch = args
    test_num_str = f"{test_num:03d}"
    
    cmd = ["deno", "run", "--unstable-node-globals", "-A", os.path.join(SCRIPT_DIR, "../src/cli/creator.mts"),
               "-a", arch,
               "-s", f"{base_path}_{test_num_str}.s",
               "-o", "min"]
    
    if lib_path:
        cmd.extend(["-l", f"{lib_path}_{test_num_str}.o"])
     
    try:
        # Run command and capture output directly
        result = await asyncio.to_thread(subprocess.run, cmd, capture_output=True, text=True, check=True)
        output = result.stdout.lower()
        
        # Compare with expected
        expected_file = f"{base_path}_{test_num_str}.out"
        expected = read_file(expected_file).lower()
        if output == expected:
            return (test_num_str, True, None)
        else:
            return (test_num_str, False, (expected, output))
    except Exception as e:
        return (test_num_str, False, str(e))

async def run_test_category(category_name, test_numbers, base_path, arch, lib_path=None):
    """Run tests for a specific category using the provided process pool"""
    error = 0
    passed = 0
    failed = 0
    
    # Prepare args for parallel execution
    tasks = [run_single_test((num, base_path, lib_path, arch)) for num in test_numbers]
    
    # Use asyncio.gather for better resource management
    results = await asyncio.gather(*tasks)
    
    # Process results
    for test_num, success, error_msg in results:
        if success:
            passed += 1
        else:
            print(f"[TEST] {category_name} - {base_path}_{test_num}: ", end="")
            print(ColorFormatter.error("FAIL"))
            if isinstance(error_msg, tuple):
                expected, actual = error_msg
                print("      Output difference found:")
                print("      " + create_diff(expected, actual).replace('\n', '\n      '))
            else:
                print(f"      Error details: {error_msg}")
            failed += 1
            error = 1
            
    return error, passed, failed

def get_available_categories():
    """Returns lists of available architectures and their categories"""
    categories = {
        "riscv": [
            "examples", "libraries", "syscalls", "compile_errors",
            "execution_errors", "passing_convention", "instructions"
        ],
        "mips": [
            "examples", "libraries", "syscalls", "compile_errors",
            "execution_errors", "passing_convention", "instructions"
        ]
    }
    return categories

def filter_test_categories(test_categories, arch=None, category=None):
    """Filter test categories based on architecture and category"""
    filtered = {}
    
    for cat_name, config in test_categories.items():
        # Split category name into arch and type (e.g., 'riscv_examples' -> 'riscv', 'examples')
        cat_arch, cat_type = cat_name.split('_', 1)
        
        # Filter by architecture
        if arch and arch not in cat_arch:
            continue
            
        # Filter by category
        if category and category not in cat_type:
            continue
            
        filtered[cat_name] = config
        
    return filtered

async def run_all_tests(arch=None, category=None, output_file=None):
    if output_file:
        ColorFormatter.use_colors = False
    
    start_time = time.time()
    error = 0
    total_passed = 0
    total_failed = 0
    category_results = {}

    # Capture output for file writing
    output_lines = []
    def print_output(*args, **kwargs):
        line = " ".join(str(arg) for arg in args)
        if output_file:
            output_lines.append(line)
        print(*args, **kwargs)


    filtered_categories = filter_test_categories(test_categories, arch, category)
    
    if not filtered_categories:
        print("No test categories match the specified filters.")
        return 1

    for category, config in filtered_categories.items():
        try:
            cat_error, passed, failed = await run_test_category(
                category,
                config["numbers"],
                config["path"],
                config["arch"],
                config["path"] if config.get("has_lib") else None
            )
            category_results[category] = (passed, failed)
            error |= cat_error
            total_passed += passed
            total_failed += failed
        except Exception as e:
            print_output(f"Error running category {category}: {str(e)}")
            error = 1
            continue

    
    print_output("\n╔═════════════════════════════════════════════════════════════════════════╗")
    print_output("║ Test Results By Category                                                ║")
    print_output("╠═══════════════════════════════════════╦════════════╦════════════╦═══════╣")
    print_output("║ Category                              ║   Passed   ║   Failed   ║ Total ║")
    print_output("╠═══════════════════════════════════════╬════════════╬════════════╬═══════╣")
    
    for category, (passed, failed) in sorted(category_results.items()):
        total = passed + failed
        passed_str = ColorFormatter.success(f"{passed:^10}") if passed > 0 else f"{passed:^10}"
        failed_str = ColorFormatter.error(f"{failed:^10}") if failed > 0 else f"{failed:^10}"
        print_output(f"║   {category:<35} ║ {passed_str} ║ {failed_str} ║ {total:^6}║")
    
    print_output("╠═══════════════════════════════════════╩════════════╩════════════╩═══════╣")
    print_output(f"║ Total Tests: {total_passed + total_failed:<59}║")
    total_passed_str = ColorFormatter.success(total_passed)
    total_failed_str = ColorFormatter.error(total_failed) if total_failed > 0 else ColorFormatter.success(total_failed)
    print_output(f"║ Total Passed: {total_passed_str:<67}║")
    print_output(f"║ Total Failed: {total_failed_str:<67}║")
    duration = time.time() - start_time
    time_str = f"Total Time: {duration:.2f} seconds"
    padding = 72 - len(time_str)
    print_output(f"║ {time_str}{' ' * padding}║")
    print_output("╚═════════════════════════════════════════════════════════════════════════╝")
    
    return error

def main():
    original_dir = os.getcwd()
    os.chdir(SCRIPT_DIR)
    
    try:
        categories = get_available_categories()
        
        parser = argparse.ArgumentParser(description='Run CREATOR tests with filtering options')
        parser.add_argument('--arch', choices=['riscv', 'mips'],
                          help='Filter tests by architecture (riscv or mips)')
        parser.add_argument('--category', choices=set().union(*categories.values()),
                          help='Filter tests by category (e.g., examples, syscalls, etc.)')
        parser.add_argument('--list', action='store_true',
                          help='List available architectures and categories')
        parser.add_argument('--nocolor', action='store_true',
                          help='Disable colored output')

        args = parser.parse_args()

        if args.list:
            print("\nAvailable test categories:")
            for arch, cats in categories.items():
                print(f"\n{arch.upper()}:")
                for cat in cats:
                    print(f"  - {cat}")
            return 0

        return asyncio.run(run_all_tests(args.arch, args.category, args.nocolor))
    finally:
        os.chdir(original_dir)

if __name__ == "__main__":
    sys.exit(main())