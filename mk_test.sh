#!/bin/bash
#set -x

#
# MIPS
#

echo " MIPS examples:"
MIPS_TEST="002 003 004 005 006 007 008 011 012"
for I in $MIPS_TEST;
do
  echo " * ./test/mips/correct/examples/test_mips_example_$I..."
  ./creator.sh -a ./architecture/MIPS_32.json -s ./test/mips/correct/examples/test_mips_example_"$I".s -o min > ./test/mips/correct/examples/test_mips_example_"$I".out
done

echo " MIPS libraries:"
MIPS_TEST="001"
for I in $MIPS_TEST;
do
  echo " * ./test/mips/correct/libraries/test_mips_libraries_$I..."
  ./creator.sh -a ./architecture/MIPS_32.json -s ./test/mips/correct/libraries/test_mips_libraries_"$I".s -l ./test/mips/correct/libraries/test_mips_libraries_"$I".o -o min > ./test/mips/correct/libraries/test_mips_libraries_"$I".out
done

echo " MIPS syscalls:"
MIPS_TEST="001 002 003 004 009 010 011"
for I in $MIPS_TEST;
do
  echo " * ./test/mips/correct/syscalls/test_mips_syscalls_$I... "
  ./creator.sh -a ./architecture/MIPS_32.json -s ./test/mips/correct/syscalls/test_mips_syscall_"$I".s -o min > ./test/mips/correct/syscalls/test_mips_syscall_"$I".out
done

echo " MIPS compile common errors:"
MIPS_TEST="001 002 003 004 005 006 007 008 009 014 015 016 017 018 019 021 022 023 030"
for I in $MIPS_TEST;
do
  echo " * ./test/mips/error/compiler/test_mips_error_compiler_$I... "
  ./creator.sh -a ./architecture/MIPS_32.json -s ./test/mips/error/compiler/test_mips_error_compiler_"$I".s -o min > ./test/mips/error/compiler/test_mips_error_compiler_"$I".out
done

echo " MIPS execution common errors:"
MIPS_TEST="001 002 003 004 005 006 007 008 009"
for I in $MIPS_TEST;
do
  echo " * ./test/mips/error/executor/test_mips_error_executor_$I... "
  ./creator.sh -a ./architecture/MIPS_32.json -s ./test/mips/error/executor/test_mips_error_executor_"$I".s -o min > ./test/mips/error/executor/test_mips_error_executor_"$I".out
done

echo " MIPS passing convention:"
MIPS_TEST="001 002 003 004 005 006 007 008 009 010 011 012 013 014 015 016 017 018 019 020 021 022 023 024 025 026 027 028 029 030 031 032 033 034 035"
for I in $MIPS_TEST;
do
  echo " * ./test/mips/sentinel/test_mips_sentinels_$I... "
  ./creator.sh -a ./architecture/MIPS_32.json -s ./test/mips/sentinel/test_mips_sentinels_"$I".s -o min > ./test/mips/sentinel/test_mips_sentinels_"$I".out
done

echo " MIPS instructions:"
MIPS_TEST="001 002 003 004 005 006 007 008 009 010 011 012 013 014 015 016 017 018 019 020 021 022 023 024 025 026 027 028 029 030 031 032 033 034 035 036 037 038 039 040 041 042 043 044 045 046 047 048 049 050 051 052 053 054 055 056 057 058 059 060 061 062 063 064 065 066 067"
for I in $MIPS_TEST;
do
  echo " * ./test/mips/instructions/test_mips_instruction_$I... "
  ./creator.sh -a ./architecture/MIPS_32.json -s ./test/mips/instructions/test_mips_instruction_"$I".s -o min > ./test/mips/instructions/test_mips_instruction_"$I".out
done



#
# RISC-V
#

echo " RISC-V examples:"
RV_TEST="002 003 004 005 006 007 008 011 012"
for I in $RV_TEST;
do
  echo " * ./test/riscv/correct/examples/test_riscv_example_$I... "
  ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json -s ./test/riscv/correct/examples/test_riscv_example_"$I".s -o min > ./test/riscv/correct/examples/test_riscv_example_"$I".out
done

echo " RISC-V libraries:"
RV_TEST="001"
for I in $RV_TEST;
do
  echo " * ./test/mips/correct/libraries/test_riscv_libraries_$I..."
  ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json -s ./test/riscv/correct/libraries/test_riscv_libraries_"$I".s -l ./test/riscv/correct/libraries/test_riscv_libraries_"$I".o -o min > ./test/riscv/correct/libraries/test_riscv_libraries_"$I".out
done

echo " RISC-V syscalls:"
RV_TEST="001 002 003 004 009 010 011"
for I in $RV_TEST;
do
  echo " * ./test/riscv/correct/syscalls/test_riscv_syscalls_$I... "
  ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json -s ./test/riscv/correct/syscalls/test_riscv_syscall_"$I".s -o min > ./test/riscv/correct/syscalls/test_riscv_syscall_"$I".out
done

echo " RISC-V compile common errors:"
RV_TEST="001 002 003 004 005 006 007 008 009 014 015 016 017 018 019 021 022 023 030"
for I in $RV_TEST;
do
  echo " * ./test/riscv/error/compiler/test_riscv_error_compiler_$I... "
  ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json -s ./test/riscv/error/compiler/test_riscv_error_compiler_"$I".s -o min > ./test/riscv/error/compiler/test_riscv_error_compiler_"$I".out
done

echo " RISC-V execution common errors:"
RV_TEST="001 002 003 004 005 006 007 008 009"
for I in $RV_TEST;
do
  echo " * ./test/riscv/error/executor/test_riscv_error_executor_$I... "
  ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json -s ./test/riscv/error/executor/test_riscv_error_executor_"$I".s -o min > ./test/riscv/error/executor/test_riscv_error_executor_"$I".out
done

echo " RISC-V passing convention:"
RV_TEST="001 002 003 004 005 006 007 008 009 010 011 012 013 014 015 016 017 018 019 020 021 022 023 024 025 026 027 028 029 030 031 032 033 034 035 036"
for I in $RV_TEST;
do
  echo " * ./test/riscv/sentinel/test_riscv_sentinels_$I... "
  ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json -s ./test/riscv/sentinel/test_riscv_sentinels_"$I".s -o min > ./test/riscv/sentinel/test_riscv_sentinels_"$I".out
done

echo " RISC-V instructions:"
RV_TEST="001 002 003 004 005 006 007 008 009 010 011 012 013 014 015 016 017 018 019 020 021 022 023 024 025 026 027 028 029 030 031 032 033 034 035 036 037 038 039 040 041 042 043 044 045 046 047 048 049 050 051 052 053 054 055 056 057 058 059 060 061 062 063 064 065"
for I in $RV_TEST;
do
  echo " * ./test/riscv/instructions/test_riscv_instruction_$I... "
  ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json -s ./test/riscv/instructions/test_riscv_instruction_"$I".s -o min > ./test/riscv/instructions/test_riscv_instruction_"$I".out
done