import { assertExecution } from "../simulator-test-utils.mts";

const testAssembly = `
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
  w3: .word 1, 2, 3, 4, 5

.text
main:
  li  $t3,  1
  li  $t4,  4
  la  $t5,  w3
  li  $t7,  0

  # loop initialization
  li  $t1,  0
  li  $t2,  5

  # loop header
loop1: beq $t1, $t2, end1     #if($t1 == $t2) --> jump to fin1

  # loop body
  mul $t6, $t1, $t4             # $t1 * $t4 -> $t6
  lw  $t6, 0($t5)               # Memory[$t5] -> $t6
  add $t7, $t7, $t6             # $t6 + $t7 -> $t7

  # loop next...
  add $t1, $t1, $t3     # $t1 + $t3 -> $t1
  addi $t5, $t5, 4
  b loop1

  # loop end
end1:
  li $v0, 10
  syscall
`;

Deno.test(
    "MIPS Array Sum Loop",
    assertExecution("MIPS32.yml", testAssembly, {
        registers: {
            PC: 0x44n,
            "1": 0x200000n, // at
            "2": 0xan, // v0
            "9": 0x5n, // t1
            "10": 0x5n, // t2
            "11": 0x1n, // t3
            "12": 0x4n, // t4
            "13": 0x200014n, // t5
            "14": 0x5n, // t6
            "15": 0xfn, // t7
        },
        display: "", // Display buffer should be empty
        keyboard: "", // Keyboard buffer should be empty
    }),
);
