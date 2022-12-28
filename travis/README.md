## Travis Test
#### :point_right:	 RISC-V

- Correct:
  - Examples:

| Test Name              | Description               | In use                   |
|:----------------------:|:-------------------------:|:------------------------:|
| test_riscv_example_001 | Data Storage              | :heavy_multiplication_x: |
| test_riscv_example_002 | ALU operations            | :white_check_mark:       |
| test_riscv_example_003 | Store/Load Data in Memory | :white_check_mark:       |
| test_riscv_example_004 | FPU operations            | :white_check_mark:       |
| test_riscv_example_005 | Loop                      | :white_check_mark:       |
| test_riscv_example_006 | Branch                    | :white_check_mark:       |
| test_riscv_example_007 | Loop + Memory             | :white_check_mark:       |
| test_riscv_example_008 | I/O Syscalls              | :white_check_mark:       |
| test_riscv_example_009 | I/O Syscalls + Strings    | :heavy_multiplication_x: |
| test_riscv_example_011 | Subrutines                | :white_check_mark:       |
| test_riscv_example_012 | Factorial                 | :white_check_mark:       |

  - Syscalls:

| Test Name              | Description               | In use                   |
|:----------------------:|:-------------------------:|:------------------------:|
| test_riscv_syscall_001 | print_int                 | :white_check_mark:       |
| test_riscv_syscall_002 | print_float               | :white_check_mark:       |
| test_riscv_syscall_003 | print_double              | :white_check_mark:       |
| test_riscv_syscall_004 | print_string              | :white_check_mark:       |
| test_riscv_syscall_005 | read_int                  | :heavy_multiplication_x: |
| test_riscv_syscall_006 | read_float                | :heavy_multiplication_x: |
| test_riscv_syscall_007 | read_double               | :heavy_multiplication_x: |
| test_riscv_syscall_008 | read_string               | :heavy_multiplication_x: |
| test_riscv_syscall_009 | sbrk                      | :white_check_mark:       |
| test_riscv_syscall_010 | exit                      | :white_check_mark:       |
| test_riscv_syscall_011 | print_char                | :white_check_mark:       |
| test_riscv_syscall_012 | read_char                 | :heavy_multiplication_x: |

- Error:
  - Compilator:

| Test Name                     | Description                                  | In use                   |
|:-----------------------------:|:--------------------------------------------:|:------------------------:|
| test_riscv_error_compiler_001 | Tag repeated (m1)                            | :white_check_mark:       |
| test_riscv_error_compiler_002 | Instruction not found (m2)                   | :white_check_mark:       |
| test_riscv_error_compiler_003 | Incorrect syntax in an instruction (m3)      | :white_check_mark:       |
| test_riscv_error_compiler_004 | Nonexistent register (m4)                    | :white_check_mark:       |
| test_riscv_error_compiler_005 | Immediate number too large (m5)              | :white_check_mark:       |
| test_riscv_error_compiler_006 | Immediate number not valid (m6)              | :white_check_mark:       |
| test_riscv_error_compiler_007 | Invalid tag (m7)                             | :white_check_mark:       |
| test_riscv_error_compiler_008 | Address too large (m8)                       | :white_check_mark:       |
| test_riscv_error_compiler_009 | Invalid address (m9)                         | :white_check_mark:       |
| test_riscv_error_compiler_010 | Space allocation too large (m10)             | :heavy_multiplication_x: |
| test_riscv_error_compiler_014 | Incorrect directive (m14)                    | :white_check_mark:       |
| test_riscv_error_compiler_015 | Invalid value, must be a number (m15)        | :white_check_mark:       |
| test_riscv_error_compiler_016 | Character string does not begin with " (m16) | :white_check_mark:       |
| test_riscv_error_compiler_017 | Character string not ending with " (m17)     | :white_check_mark:       |
| test_riscv_error_compiler_018 | Number too large (m18)                       | :white_check_mark:       |
| test_riscv_error_compiler_019 | Empty number (m19)                           | :white_check_mark:       |
| test_riscv_error_compiler_021 | Data not aligned (m21)                       | :white_check_mark:       |
| test_riscv_error_compiler_022 | Number not po:white_check_mark:tive (m22)    | :white_check_mark:       |
| test_riscv_error_compiler_023 | Empty directive (m23)                        | :white_check_mark:       |
| test_riscv_error_compiler_030 | Empty file                                   | :white_check_mark:       |






#### :point_right:	 MPIS-32
