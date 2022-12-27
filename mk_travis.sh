#!/bin/bash
#set -x

#
# MIPS
#

echo " MIPS examples:"
MIPS_TEST="002 003 004 005 006 007 008 011 012 021 022 023 024 025 026 027 028 029 030 031 032 033 034 035 036"
for I in $MIPS_TEST;
do
  echo " * ./travis/mips/correct/examples/test_mips_example_$I..."
  ./creator.sh -a ./architecture/MIPS-32.json -s ./travis/mips/correct/examples/test_mips_example_$I.s -o min > ./travis/mips/correct/examples/test_mips_example_$I.out
done

echo " MIPS syscalls:"
MIPS_TEST="001 002 003 004 009 010 011"
for I in $MIPS_TEST;
do
  echo " * ./travis/mips/correct/syscalls/test_mips_syscalls_$I... "
  ./creator.sh -a ./architecture/MIPS-32.json -s ./travis/mips/correct/syscalls/test_mips_syscall_$I.s -o min > ./travis/mips/correct/syscalls/test_mips_syscall_$I.out
done

echo " MIPS compile common errors:"
MIPS_TEST="001 002 003 004 005 006 007 008 009 014 015 016 017 018 019 021 022 023 030"
for I in $MIPS_TEST;
do
  echo " * ./mips/error/compiler/test_mips_error_compiler_$I... "
  ./creator.sh -a ./architecture/MIPS-32.json -s ./travis/mips/error/compiler/test_mips_error_compiler_$I.s -o min > ./travis/mips/error/compiler/test_mips_error_compiler_$I.out
done






echo " MIPS passing convention:"
MIPS_TEST="001 002 003 004 005 006 007 008 009 010 011 012 013 014 015 016 017 018 019 020 021 022 023 024 025 026 027 028 029 030 031 032"
for I in $MIPS_TEST;
do
  echo " * ./mips/sentinel/test_mips_sentinels_$I... "
  ./creator.sh -a ./architecture/MIPS-32.json -s ./travis/mips/sentinel/test_mips_sentinels_$I.s -o min > ./travis/mips/sentinel/test_mips_sentinels_$I.out
done


#
# RISC-V
#

echo " RISC-V:"
RV_TEST="002 003 004 005 006 007 008 011 012"
for I in $RV_TEST;
do
  echo " * ./riscv/correct/example$I... "
  ./creator.sh -a "./architecture/RISC-V (RV32IMFD).json" -s ./travis/riscv/correct/test-riscv-$I.s -o min > ./travis/riscv/correct/test-riscv-$I.out
done

