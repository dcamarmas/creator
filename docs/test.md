<html>
 <h1 align="center">CREATOR (https://creatorsim.github.io/)</h1>
</html>

## Travis Test

![example workflow](https://github.com/dcamarmas/creator/actions/workflows/node.js.yml/badge.svg)

#### :point_right:	 RISC-V

- Test checking correct behaviour:
  - RISC-V default examples:
  
    <details>
      <summary>Click to expand</summary>

      | Test Name              | Description               | In use                   |
      |:----------------------:|:-------------------------:|:------------------------:|
      | test_riscv_example_001 | Data Storage              | :heavy_multiplication_x: |
      | test_riscv_example_002 | ALU operations            | :white_check_mark:       |
      | test_riscv_example_003 | Store/Load Data in Memory | :white_check_mark:       |
      | test_riscv_example_004 | FPU operations            | :white_check_mark:       |
      | test_riscv_example_005 | Loop                      | :white_check_mark:       |
      | test_riscv_example_006 | Branch                    | :white_check_mark:       |
      | test_riscv_example_007 | Loop + Memory             | :white_check_mark:       |
      | test_riscv_example_008 | I/O Syscalls              | :heavy_multiplication_x: |
      | test_riscv_example_009 | I/O Syscalls + Strings    | :heavy_multiplication_x: |
      | test_riscv_example_011 | Subrutines                | :white_check_mark:       |
      | test_riscv_example_012 | Factorial                 | :white_check_mark:       |

    </details>

  - Libraries:
  
    <details>
      <summary>Click to expand</summary>

      | Test Name                | Description               | In use             |
      |:------------------------:|:-------------------------:|:------------------:|
      | test_riscv_libraries_001 | Min and Max               | :white_check_mark: |

    </details>

  - System calls:
  
    <details>
      <summary>Click to expand</summary>

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
      
    </details>

- Tests that force errors to check that they are detected correctly:
  - Compilation:
  
    <details>
      <summary>Click to expand</summary>

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
      | test_riscv_error_compiler_022 | Number not positive (m22)                    | :white_check_mark:       |
      | test_riscv_error_compiler_023 | Empty directive (m23)                        | :white_check_mark:       |
      | test_riscv_error_compiler_030 | Empty file                                   | :white_check_mark:       |
      
    </details>

  - Execution:
    
    <details>
      <summary>Click to expand</summary>

      | Test Name                     | Description                         | In use             |
      |:-----------------------------:|:-----------------------------------:|:------------------:|
      | test_riscv_error_executor_001 | Program without instructions        | :white_check_mark: |
      | test_riscv_error_executor_002 | main tag does not exist             | :white_check_mark: |
      | test_riscv_error_executor_003 | sp register in data segment         | :white_check_mark: |
      | test_riscv_error_executor_004 | sp register in text segment         | :white_check_mark: |
      | test_riscv_error_executor_005 | Memory writing in text segment      | :white_check_mark: |
      | test_riscv_error_executor_006 | Memory reading from text segment    | :white_check_mark: |
      | test_riscv_error_executor_007 | Memory write not aligned            | :white_check_mark: |
      | test_riscv_error_executor_008 | Memory read not aligned             | :white_check_mark: |
      | test_riscv_error_executor_009 | Write to register without permision | :white_check_mark: |
      
    </details>

  - Sentinel (tests that check the parameter passing convention):
    
    <details>
      <summary>Click to expand</summary>

      | Test Name                | Description                                                                                       | In use             |
      |:------------------------:|:-------------------------------------------------------------------------------------------------:|:------------------:|
      | test_riscv_sentinels_001 | Changing the a0 register inside test function                                                     | :white_check_mark: |
      | test_riscv_sentinels_002 | Changing the a1 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_003 | Changing the a2 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_004 | Changing the a3 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_005 | Changing the a4 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_006 | Changing the a5 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_007 | Changing the a6 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_008 | Changing the a7 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_009 | Changing the t0 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_010 | Changing the t1 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_011 | Changing the t2 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_012 | Changing the t3 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_013 | Changing the t4 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_014 | Changing the t5 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_015 | Changing the t6 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_016 | Changing the s0 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_017 | Changing the s1 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_018 | Changing the s2 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_019 | Changing the s3 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_020 | Changing the s4 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_021 | Changing the s5 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_022 | Changing the s6 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_023 | Changing the s7 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_024 | Changing the s8 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_025 | Changing the s9 register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_026 | Changing the s10 register inside the test function                                                | :white_check_mark: |
      | test_riscv_sentinels_027 | Changing the s11 register inside the test function                                                | :white_check_mark: |
      | test_riscv_sentinels_028 | Changing the ra register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_029 | Changing the sp register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_030 | Changing the gp register inside test function                                                     | :white_check_mark: |
      | test_riscv_sentinels_031 | Changing the tp register inside the test function                                                 | :white_check_mark: |
      | test_riscv_sentinels_032 | Changing the s1 register inside the test function and saving to the stack                         | :white_check_mark: |
      | test_riscv_sentinels_033 | Changing the s1 register inside the test function and saving on stack, but without restoring      | :white_check_mark: |
      | test_riscv_sentinels_034 | Changing register s1 inside the test function and saving to stack, but restoring another address  | :white_check_mark: |
      | test_riscv_sentinels_035 | Changing register s1 inside the test function and saving to stack, but restoring another size     | :white_check_mark: |
      | test_riscv_sentinels_036 | Changing of register s1 inside the test function and saving to stack, but the stack is overwritten| :white_check_mark: |
   
    </details>

  - Instructions (tests that check the instruction set):
    
    <details>
      <summary>Click to expand</summary>

      | Test Name                  | Description               | In use             |
      |:--------------------------:|:-------------------------:|:------------------:|
      | test_riscv_instruction_001 | add                       | :white_check_mark: |
      | test_riscv_instruction_002 | addi                      | :white_check_mark: |
      | test_riscv_instruction_003 | sub                       | :white_check_mark: |
      | test_riscv_instruction_004 | lui                       | :white_check_mark: |
      | test_riscv_instruction_005 | jal                       | :white_check_mark: |
      | test_riscv_instruction_006 | jalr                      | :white_check_mark: |
      | test_riscv_instruction_007 | beq                       | :white_check_mark: |
      | test_riscv_instruction_008 | bne                       | :white_check_mark: |
      | test_riscv_instruction_009 | blt                       | :white_check_mark: |
      | test_riscv_instruction_010 | bge                       | :white_check_mark: |
      | test_riscv_instruction_011 | bltu                      | :white_check_mark: |
      | test_riscv_instruction_012 | bgeu                      | :white_check_mark: |
      | test_riscv_instruction_013 | lb, lh, lw, sb, sh, sw    | :white_check_mark: |
      | test_riscv_instruction_014 | lbu, lhu                  | :white_check_mark: |
      | test_riscv_instruction_015 | slti                      | :white_check_mark: |
      | test_riscv_instruction_016 | sltiu                     | :white_check_mark: |
      | test_riscv_instruction_017 | xori                      | :white_check_mark: |
      | test_riscv_instruction_018 | ori                       | :white_check_mark: |
      | test_riscv_instruction_019 | andi                      | :white_check_mark: |
      | test_riscv_instruction_020 | div-2reg                  | :white_check_mark: |
      | test_riscv_instruction_021 | divu-2reg                 | :white_check_mark: |
      | test_riscv_instruction_022 | rotr                      | :white_check_mark: |
      | test_riscv_instruction_023 | sll                       | :white_check_mark: |
      | test_riscv_instruction_024 | slt                       | :white_check_mark: |
      | test_riscv_instruction_025 | sltu                      | :white_check_mark: |
      | test_riscv_instruction_026 | xori                      | :white_check_mark: |
      | test_riscv_instruction_027 | srl                       | :white_check_mark: |
      | test_riscv_instruction_028 | sra                       | :white_check_mark: |
      | test_riscv_instruction_029 | or                        | :white_check_mark: |
      | test_riscv_instruction_030 | and                       | :white_check_mark: |
      | test_riscv_instruction_031 | l.d y s.d                 | :white_check_mark: |
      | test_riscv_instruction_032 | mult                      | :white_check_mark: |
      | test_riscv_instruction_033 | multu                     | :white_check_mark: |
      | test_riscv_instruction_034 | mul                       | :white_check_mark: |
      | test_riscv_instruction_035 | addu                      | :white_check_mark: |
      | test_riscv_instruction_036 | addiu                     | :white_check_mark: |
      | test_riscv_instruction_037 | b                         | :white_check_mark: |
      | test_riscv_instruction_038 | div                       | :white_check_mark: |
      | test_riscv_instruction_039 | divu                      | :white_check_mark: |
      | test_riscv_instruction_040 | rem/mod                   | :white_check_mark: |
      | test_riscv_instruction_041 | modu                      | :white_check_mark: |
      | test_riscv_instruction_042 | bgt                       | :white_check_mark: |
      | test_riscv_instruction_043 | bgtu                      | :white_check_mark: |
      | test_riscv_instruction_044 | ble                       | :white_check_mark: |
      | test_riscv_instruction_045 | bleu                      | :white_check_mark: |
      | test_riscv_instruction_046 | nor                       | :white_check_mark: |
      | test_riscv_instruction_047 | nop                       | :white_check_mark: |
      | test_riscv_instruction_048 | move                      | :white_check_mark: |
      | test_riscv_instruction_049 | mthi, mtlo, mfhi, mflo    | :white_check_mark: |
      | test_riscv_instruction_050 | subu                      | :white_check_mark: |
      | test_riscv_instruction_051 | beqz                      | :white_check_mark: |
      | test_riscv_instruction_052 | bgez                      | :white_check_mark: |
      | test_riscv_instruction_053 | bgezal                    | :white_check_mark: |
      | test_riscv_instruction_054 | bgtz                      | :white_check_mark: |
      | test_riscv_instruction_055 | blez                      | :white_check_mark: |
      | test_riscv_instruction_056 | blt                       | :white_check_mark: |
      | test_riscv_instruction_057 | bnez                      | :white_check_mark: |
      | test_riscv_instruction_058 | sqrt.s/d, li.s/d          | :white_check_mark: |
      | test_riscv_instruction_059 | add.s/d                   | :white_check_mark: |
      | test_riscv_instruction_060 | sub.s/d                   | :white_check_mark: |
      | test_riscv_instruction_061 | abs.s/d                   | :white_check_mark: |
      | test_riscv_instruction_062 | mul.s/d                   | :white_check_mark: |
      | test_riscv_instruction_063 | div.s/d                   | :white_check_mark: |
      | test_riscv_instruction_064 | rsqrt.s/d                 | :white_check_mark: |
      | test_riscv_instruction_065 | cvt.s.d/d.s               | :white_check_mark: |
      | test_riscv_instruction_066 | cvt.w.d/w.s               | :white_check_mark: |
      | test_riscv_instruction_067 | cvt.s.w/cvt.d.w           | :white_check_mark: |
      
    </details>

#### :point_right:   MIPS-32

- Test checking correct behaviour:
  - MIPS-32 default examples:
  
    <details>
      <summary>Click to expand</summary>

      | Test Name             | Description               | In use                   |
      |:---------------------:|:-------------------------:|:------------------------:|
      | test_mips_example_001 | Data Storage              | :heavy_multiplication_x: |
      | test_mips_example_002 | ALU operations            | :white_check_mark:       |
      | test_mips_example_003 | Store/Load Data in Memory | :white_check_mark:       |
      | test_mips_example_004 | FPU operations            | :white_check_mark:       |
      | test_mips_example_005 | Loop                      | :white_check_mark:       |
      | test_mips_example_006 | Branch                    | :white_check_mark:       |
      | test_mips_example_007 | Loop + Memory             | :white_check_mark:       |
      | test_mips_example_008 | I/O Syscalls              | :heavy_multiplication_x: |
      | test_mips_example_009 | I/O Syscalls + Strings    | :heavy_multiplication_x: |
      | test_mips_example_011 | Subrutines                | :white_check_mark:       |
      | test_mips_example_012 | Factorial                 | :white_check_mark:       |

    </details>

  - Libraries:
  
    <details>
      <summary>Click to expand</summary>

      | Test Name               | Description               | In use             |
      |:-----------------------:|:-------------------------:|:------------------:|
      | test_mpis_libraries_001 | Min and Max               | :white_check_mark: |

    </details>

  - System calls:
  
    <details>
      <summary>Click to expand</summary>

      | Test Name             | Description               | In use                   |
      |:---------------------:|:-------------------------:|:------------------------:|
      | test_mips_syscall_001 | print_int                 | :white_check_mark:       |
      | test_mips_syscall_002 | print_float               | :white_check_mark:       |
      | test_mips_syscall_003 | print_double              | :white_check_mark:       |
      | test_mips_syscall_004 | print_string              | :white_check_mark:       |
      | test_mips_syscall_005 | read_int                  | :heavy_multiplication_x: |
      | test_mips_syscall_006 | read_float                | :heavy_multiplication_x: |
      | test_mips_syscall_007 | read_double               | :heavy_multiplication_x: |
      | test_mips_syscall_008 | read_string               | :heavy_multiplication_x: |
      | test_mips_syscall_009 | sbrk                      | :white_check_mark:       |
      | test_mips_syscall_010 | exit                      | :white_check_mark:       |
      | test_mips_syscall_011 | print_char                | :white_check_mark:       |
      | test_mips_syscall_012 | read_char                 | :heavy_multiplication_x: |
      
    </details>

- Tests that force errors to check that they are detected correctly:
  - Compilation:
  
    <details>
      <summary>Click to expand</summary>

      | Test Name                    | Description                                  | In use                   |
      |:----------------------------:|:--------------------------------------------:|:------------------------:|
      | test_mips_error_compiler_001 | Tag repeated (m1)                            | :white_check_mark:       |
      | test_mips_error_compiler_002 | Instruction not found (m2)                   | :white_check_mark:       |
      | test_mips_error_compiler_003 | Incorrect syntax in an instruction (m3)      | :white_check_mark:       |
      | test_mips_error_compiler_004 | Nonexistent register (m4)                    | :white_check_mark:       |
      | test_mips_error_compiler_005 | Immediate number too large (m5)              | :white_check_mark:       |
      | test_mips_error_compiler_006 | Immediate number not valid (m6)              | :white_check_mark:       |
      | test_mips_error_compiler_007 | Invalid tag (m7)                             | :white_check_mark:       |
      | test_mips_error_compiler_008 | Address too large (m8)                       | :white_check_mark:       |
      | test_mips_error_compiler_009 | Invalid address (m9)                         | :white_check_mark:       |
      | test_mips_error_compiler_010 | Space allocation too large (m10)             | :heavy_multiplication_x: |
      | test_mips_error_compiler_014 | Incorrect directive (m14)                    | :white_check_mark:       |
      | test_mips_error_compiler_015 | Invalid value, must be a number (m15)        | :white_check_mark:       |
      | test_mips_error_compiler_016 | Character string does not begin with " (m16) | :white_check_mark:       |
      | test_mips_error_compiler_017 | Character string not ending with " (m17)     | :white_check_mark:       |
      | test_mips_error_compiler_018 | Number too large (m18)                       | :white_check_mark:       |
      | test_mips_error_compiler_019 | Empty number (m19)                           | :white_check_mark:       |
      | test_mips_error_compiler_021 | Data not aligned (m21)                       | :white_check_mark:       |
      | test_mips_error_compiler_022 | Number not positive (m22)                    | :white_check_mark:       |
      | test_mips_error_compiler_023 | Empty directive (m23)                        | :white_check_mark:       |
      | test_mips_error_compiler_030 | Empty file                                   | :white_check_mark:       |
      
    </details>

  - Execution:
    
    <details>
      <summary>Click to expand</summary>

      | Test Name                    | Description                         | In use             |
      |:----------------------------:|:-----------------------------------:|:------------------:|
      | test_mips_error_executor_001 | Program without instructions        | :white_check_mark: |
      | test_mips_error_executor_002 | main tag does not exist             | :white_check_mark: |
      | test_mips_error_executor_003 | $sp register in data segment        | :white_check_mark: |
      | test_mips_error_executor_004 | $sp register in text segment        | :white_check_mark: |
      | test_mips_error_executor_005 | Memory writing in text segment      | :white_check_mark: |
      | test_mips_error_executor_006 | Memory reading from text segment    | :white_check_mark: |
      | test_mips_error_executor_007 | Memory write not aligned            | :white_check_mark: |
      | test_mips_error_executor_008 | Memory read not aligned             | :white_check_mark: |
      | test_mips_error_executor_009 | Write to register without permision | :white_check_mark: |
      
    </details>

  - Sentinel (tests that check the parameter passing convention):
    
    <details>
      <summary>Click to expand</summary>

      | Test Name               | Description                                                                                       | In use             |
      |:-----------------------:|:-------------------------------------------------------------------------------------------------:|:------------------:|
      | test_mips_sentinels_001 | Changing the a0 register inside test function                                                     | :white_check_mark: |
      | test_mips_sentinels_002 | Changing the a1 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_003 | Changing the a2 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_004 | Changing the a3 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_005 | Changing the fp register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_006 | Changing the gp register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_007 | Changing the k0 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_008 | Changing the k1 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_009 | Changing the ra register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_010 | Changing the s0 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_011 | Changing the s1 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_012 | Changing the s2 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_013 | Changing the s3 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_014 | Changing the s4 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_015 | Changing the s5 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_016 | Changing the s6 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_017 | Changing the s7 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_018 | Changing the sp register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_019 | Changing the t0 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_020 | Changing the t1 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_021 | Changing the t2 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_022 | Changing the t3 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_023 | Changing the t4 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_024 | Changing the t5 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_025 | Changing the t6 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_026 | Changing the t7 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_027 | Changing the t8 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_028 | Changing the t9 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_029 | Changing the v0 register inside the test function                                                 | :white_check_mark: |
      | test_mips_sentinels_030 | Changing the v1 register inside test function                                                     | :white_check_mark: |
      | test_mips_sentinels_031 | Changing the s0 register inside the test function and saving to the stack                         | :white_check_mark: |
      | test_mips_sentinels_032 | Changing the s0 register inside the test function and saving on stack, but without restoring      | :white_check_mark: |
      | test_mips_sentinels_033 | Changing register s0 inside the test function and saving to stack, but restoring another address  | :white_check_mark: |
      | test_mips_sentinels_034 | Changing register s0 inside the test function and saving to stack, but restoring another size     | :white_check_mark: |
      | test_mips_sentinels_035 | Changing of register s0 inside the test function and saving to stack, but the stack is overwritten| :white_check_mark: |
   
    </details>

  - Instructions (tests that check the instruction set):
    
    <details>
      <summary>Click to expand</summary>

      | Test Name                 | Description               | In use             |
      |:-------------------------:|:-------------------------:|:------------------:|
      | test_mips_instruction_001 | add                       | :white_check_mark: |
      | test_mips_instruction_002 | addi                      | :white_check_mark: |
      | test_mips_instruction_003 | sub                       | :white_check_mark: |
      | test_mips_instruction_004 | lui                       | :white_check_mark: |
      | test_mips_instruction_005 | jal                       | :white_check_mark: |
      | test_mips_instruction_006 | jalr                      | :white_check_mark: |
      | test_mips_instruction_007 | beq                       | :white_check_mark: |
      | test_mips_instruction_008 | bne                       | :white_check_mark: |
      | test_mips_instruction_009 | blt                       | :white_check_mark: |
      | test_mips_instruction_010 | bge                       | :white_check_mark: |
      | test_mips_instruction_011 | bltu                      | :white_check_mark: |
      | test_mips_instruction_012 | bgeu                      | :white_check_mark: |
      | test_mips_instruction_013 |  lb, lh, lw, sb, sh, sw   | :white_check_mark: |
      | test_mips_instruction_014 |  lbu, lhu                 | :white_check_mark: |
      | test_mips_instruction_015 | slti                      | :white_check_mark: |
      | test_mips_instruction_016 | sltiu                     | :white_check_mark: |
      | test_mips_instruction_017 | xori                      | :white_check_mark: |
      | test_mips_instruction_018 | ori                       | :white_check_mark: |
      | test_mips_instruction_019 | andi                      | :white_check_mark: |
      | test_mips_instruction_020 | div-2reg                  | :white_check_mark: |
      | test_mips_instruction_021 | divu-2reg                 | :white_check_mark: |
      | test_mips_instruction_022 | rotr                      | :white_check_mark: |
      | test_mips_instruction_023 | sll                       | :white_check_mark: |
      | test_mips_instruction_024 | slt                       | :white_check_mark: |
      | test_mips_instruction_025 | sltu                      | :white_check_mark: |
      | test_mips_instruction_026 | xori                      | :white_check_mark: |
      | test_mips_instruction_027 | srl                       | :white_check_mark: |
      | test_mips_instruction_028 | sra                       | :white_check_mark: |
      | test_mips_instruction_029 | or                        | :white_check_mark: |
      | test_mips_instruction_030 | and                       | :white_check_mark: |
      | test_mips_instruction_031 | l.d y s.d                 | :white_check_mark: |
      | test_mips_instruction_032 | mult                      | :white_check_mark: |
      | test_mips_instruction_033 | multu                     | :white_check_mark: |
      | test_mips_instruction_034 | mul                       | :white_check_mark: |
      | test_mips_instruction_035 | addu                      | :white_check_mark: |
      | test_mips_instruction_036 | addiu                     | :white_check_mark: |
      | test_mips_instruction_037 | b                         | :white_check_mark: |
      | test_mips_instruction_038 | div                       | :white_check_mark: |
      | test_mips_instruction_039 | divu                      | :white_check_mark: |
      | test_mips_instruction_040 | rem/mod                   | :white_check_mark: |
      | test_mips_instruction_041 | modu                      | :white_check_mark: |
      | test_mips_instruction_042 | bgt                       | :white_check_mark: |
      | test_mips_instruction_043 | bgtu                      | :white_check_mark: |
      | test_mips_instruction_044 | ble                       | :white_check_mark: |
      | test_mips_instruction_045 | bleu                      | :white_check_mark: |
      | test_mips_instruction_046 | nor                       | :white_check_mark: |
      | test_mips_instruction_047 | nop                       | :white_check_mark: |
      | test_mips_instruction_048 | move                      | :white_check_mark: |
      | test_mips_instruction_049 |  mthi, mtlo, mfhi, mflo   | :white_check_mark: |
      | test_mips_instruction_050 | subu                      | :white_check_mark: |
      | test_mips_instruction_051 | beqz                      | :white_check_mark: |
      | test_mips_instruction_052 | bgez                      | :white_check_mark: |
      | test_mips_instruction_053 | bgezal                    | :white_check_mark: |
      | test_mips_instruction_054 | bgtz                      | :white_check_mark: |
      | test_mips_instruction_055 | blez                      | :white_check_mark: |
      | test_mips_instruction_056 | blt                       | :white_check_mark: |
      | test_mips_instruction_057 | bnez                      | :white_check_mark: |
      | test_mips_instruction_058 | sqrt.s/d, li.s/d          | :white_check_mark: |
      | test_mips_instruction_059 | add.s/d                   | :white_check_mark: |
      | test_mips_instruction_060 | sub.s/d                   | :white_check_mark: |
      | test_mips_instruction_061 | abs.s/d                   | :white_check_mark: |
      | test_mips_instruction_062 | mul.s/d                   | :white_check_mark: |
      | test_mips_instruction_063 | div.s/d                   | :white_check_mark: |
      | test_mips_instruction_064 | rsqrt.s/d                 | :white_check_mark: |
      | test_mips_instruction_065 | cvt.s.d/d.s               | :white_check_mark: |
      | test_mips_instruction_066 | cvt.w.d/w.s               | :white_check_mark: |
      | test_mips_instruction_067 |  cvt.s.w/cvt.d.w          | :white_check_mark: |
      
    </details>
