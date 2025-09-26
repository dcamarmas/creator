#!/usr/bin/env python3
import sys
import itertools

def get_value_from_line(line):
    """
    Extracts the part of the string after the first '|'.
    Returns the original line if '|' is not found.
    """
    try:
        # Split only once on the first '|' for efficiency and correctness
        # Then strip whitespace from the resulting value part
        return line.split('|', 1)[1].strip()
    except IndexError:
        # This handles lines that do not contain a '|'
        return line.strip()

def find_first_difference(file1_path, file2_path):
    """
    Compares two files line by line based on the content after the first '|',
    and reports the first difference found.
    
    This function is optimized for speed and memory efficiency.
    
    Args:
        file1_path (str): The path to the first file.
        file2_path (str): The path to the second file.
    """
    try:
        with open(file1_path, 'r') as f1, open(file2_path, 'r') as f2:
            # Use itertools.zip_longest for a fast, memory-efficient iteration
            for line_num, (line1, line2) in enumerate(itertools.zip_longest(f1, f2), 1):
                
                # Fast path: if raw lines are identical, continue
                if line1 == line2:
                    continue
                
                # Check for end of file, which is a difference
                if line1 is None or line2 is None:
                    print(f"Files differ at line {line_num} (different lengths):")
                    f1_content = line1.strip() if line1 is not None else "<end of file>"
                    f2_content = line2.strip() if line2 is not None else "<end of file>"
                    print(f"  File 1: {f1_content}")
                    print(f"  File 2: {f2_content}")
                    return

                # Get the relevant values to compare
                val1 = get_value_from_line(line1)
                val2 = get_value_from_line(line2)

                # If the values are different, we found our mismatch
                if val1 != val2:
                    print(f"Files differ at line {line_num}:")
                    print(f"  File 1: {line1.strip()}")
                    print(f"  File 2: {line2.strip()}")
                    return

            # If the loop completes, no relevant differences were found.
            print("Files are identical based on the comparison criteria.")

    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python compare_files_custom.py <file1.txt> <file2.txt>")
        sys.exit(1)

    file1 = sys.argv[1]
    file2 = sys.argv[2]
    
    find_first_difference(file1, file2)