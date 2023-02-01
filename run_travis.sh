#!/bin/bash
#set -x

#
# MIPS
#

echo ""
echo " MIPS: examples"
MIPS_TEST="002 003 004 005 006 007 008 011 012"
for I in $MIPS_TEST;
do
   echo -n " * ./travis/mips/correct/examples/test_mips_example_$I..."
   ./creator.sh -a ./architecture/MIPS_32.json \
                -s ./travis/mips/correct/examples/test_mips_example_$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/mips/correct/examples/test_mips_example_$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
   else
       echo "Equals";
   fi
   rm   /tmp/e-$I.out
done

echo ""
echo " MIPS: libraries"
MIPS_TEST="001"
for I in $MIPS_TEST;
do
   echo -n " * ./travis/mips/correct/libraries/test_mips_libraries_$I..."
   ./creator.sh -a ./architecture/MIPS_32.json \
                -l ./travis/mips/correct/libraries/test_mips_libraries_$I.o \
                -s ./travis/mips/correct/libraries/test_mips_libraries_$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/mips/correct/libraries/test_mips_libraries_$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
   else
       echo "Equals";
   fi
   rm   /tmp/e-$I.out
done

echo ""
echo " MIPS: syscalls"
MIPS_TEST="001 002 003 004 009 010 011"
for I in $MIPS_TEST;
do
   echo -n " * ./travis/mips/correct/syscalls/test_mips_syscall_$I..."
   ./creator.sh -a ./architecture/MIPS_32.json \
                -s ./travis/mips/correct/syscalls/test_mips_syscall_$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/mips/correct/syscalls/test_mips_syscall_$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
   else
       echo "Equals";
   fi
   rm   /tmp/e-$I.out
done

echo ""
echo " MIPS: compile common errors"
MIPS_TEST="001 002 003 004 005 006 007 008 009 014 015 016 017 018 019 021 022 023 030"
for I in $MIPS_TEST;
do
   echo -n " * ./travis/mips/error/compiler/test_mips_error_compiler_$I: "
   ./creator.sh -a ./architecture/MIPS_32.json \
                -s ./travis/mips/error/compiler/test_mips_error_compiler_$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/mips/error/compiler/test_mips_error_compiler_$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
   else
       echo "Equals";
   fi
   rm   /tmp/e-$I.out
done

echo ""
echo " MIPS: execution common errors"
MIPS_TEST="001 002 003 004 005 006 007 008 009"
for I in $MIPS_TEST;
do
   echo -n " * ./travis/mips/error/executor/test_mips_error_executor_$I: "
   ./creator.sh -a ./architecture/MIPS_32.json \
                -s ./travis/mips/error/executor/test_mips_error_executor_$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/mips/error/executor/test_mips_error_executor_$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
   else
       echo "Equals";
   fi
   rm   /tmp/e-$I.out
done

echo ""
echo " MIPS: passing convention"
MIPS_TEST="001 002 003 004 005 006 007 008 009 010 011 012 013 014 015 016 017 018 019 020 021 022 023 024 025 026 027 028 029 030 031 032 033 034 035"
for I in $MIPS_TEST;
do
   echo -n " * ./travis/mips/sentinel/test_mips_sentinels_$I: "
   ./creator.sh -a ./architecture/MIPS_32.json \
                -s ./travis/mips/sentinel/test_mips_sentinels_$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/mips/sentinel/test_mips_sentinels_$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
   else
       echo "Equals";
   fi
   rm   /tmp/e-$I.out
done

echo ""
echo " MIPS: instructions"
MIPS_TEST="001 002 003 004 005 006 007 008 009 010 011 012 013 014 015 016 017 018 019 020 021 022 023 024 025 026 027 028 029 030 031 032 033 034 035 036 037 038 039 040 041 042 043 044 045 046 047 048 049 050 051 052 053 054 055 056 057 058 059 060 061 062 063 064 065 066 067"
for I in $MIPS_TEST;
do
   echo -n " * ./travis/mips/instructions/test_mips_instruction_$I: "
   ./creator.sh -a ./architecture/MIPS_32.json \
                -s ./travis/mips/instructions/test_mips_instruction_$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/mips/instructions/test_mips_instruction_$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
   else
       echo "Equals";
   fi
   rm   /tmp/e-$I.out
done




#
# RISC-V
#

echo ""
echo " RISC-V examples:"
RV_TEST="002 003 004 005 006 007 008 011 012"
for I in $RV_TEST;
do
  echo -n " * ./travis/riscv/correct/examples/test_riscv_example_$I: "
  ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json \
               -s ./travis/riscv/correct/examples/test_riscv_example_$I.s -o min > /tmp/e-$I.out
  diff /tmp/e-$I.out ./travis/riscv/correct/examples/test_riscv_example_$I.out
  if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
  else
       echo "Equals";
  fi
  rm   /tmp/e-$I.out
done

echo ""
echo " RISC-V libraries:"
RV_TEST="001"
for I in $RV_TEST;
do
  echo -n " * ./travis/riscv/correct/libraries/test_riscv_libraries_$I: "
  ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json \
               -l ./travis/riscv/correct/libraries/test_riscv_libraries_$I.o \
               -s ./travis/riscv/correct/libraries/test_riscv_libraries_$I.s -o min > /tmp/e-$I.out
  diff /tmp/e-$I.out ./travis/riscv/correct/libraries/test_riscv_libraries_$I.out
  if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
  else
       echo "Equals";
  fi
  rm   /tmp/e-$I.out
done

echo ""
echo " RISC-V syscalls:"
RV_TEST="001 002 003 004 009 010 011"
for I in $RV_TEST;
do
  echo -n " * ./travis/riscv/correct/syscalls/test_riscv_syscall_$I: "
  ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json \
               -s ./travis/riscv/correct/syscalls/test_riscv_syscall_$I.s -o min > /tmp/e-$I.out
  diff /tmp/e-$I.out ./travis/riscv/correct/syscalls/test_riscv_syscall_$I.out
  if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
  else
       echo "Equals";
  fi
  rm   /tmp/e-$I.out
done

echo ""
echo " RISC-V: compile common errors"
RV_TEST="001 002 003 004 005 006 007 008 009 014 015 016 017 018 019 021 022 023 030"
for I in $RV_TEST;
do
   echo -n " * ./travis/riscv/error/compiler/test_riscv_error_compiler_$I: "
   ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json \
                -s ./travis/riscv/error/compiler/test_riscv_error_compiler_$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/riscv/error/compiler/test_riscv_error_compiler_$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
   else
       echo "Equals";
   fi
   rm   /tmp/e-$I.out
done

echo ""
echo " RISC-V: execution common errors"
RV_TEST="001 002 003 004 005 006 007 008 009"
for I in $RV_TEST;
do
   echo -n " * ./travis/riscv/error/executor/test_riscv_error_executor_$I: "
   ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json \
                -s ./travis/riscv/error/executor/test_riscv_error_executor_$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/riscv/error/executor/test_riscv_error_executor_$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
   else
       echo "Equals";
   fi
   rm   /tmp/e-$I.out
done

echo ""
echo " RISC-V: passing convention"
RV_TEST="001 002 003 004 005 006 007 008 009 010 011 012 013 014 015 016 017 018 019 020 021 022 023 024 025 026 027 028 029 030 031 032 033 034 035 036"
for I in $RV_TEST;
do
   echo -n " * ./travis/riscv/sentinel/test_riscv_sentinels_$I: "
   ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json \
                -s ./travis/riscv/sentinel/test_riscv_sentinels_$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/riscv/sentinel/test_riscv_sentinels_$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
   else
       echo "Equals";
   fi
   rm   /tmp/e-$I.out
done

echo ""
echo " RISC-V: instructions"
RV_TEST="001 002 003 004 005 006 007 008 009 010 011 012 013 014 015 016 017 018 019 020 021 022 023 024 025 026 027 028 029 030 031 032 033 034 035 036 037 038 039 040 041 042 043 044 045 046 047 048 049 050 051 052 053 054 055 056 057 058 059 060 061 062 063 064 065"
for I in $RV_TEST;
do
   echo -n " * ./travis/riscv/instructions/test_riscv_instruction_$I: "
   ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json \
                -s ./travis/riscv/instructions/test_riscv_instruction_$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/riscv/instructions/test_riscv_instruction_$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
   else
       echo "Equals";
   fi
   rm   /tmp/e-$I.out
done



#
# Return
#

if [[ -n "$error" ]]; then
    echo "Error(s) found."
    exit -1
fi
