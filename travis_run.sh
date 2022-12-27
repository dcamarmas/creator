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
   ./creator.sh -a ./architecture/MIPS-32.json \
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
echo " MIPS: syscalls"
MIPS_TEST="001 002 003 004 009 010 011"
for I in $MIPS_TEST;
do
   echo -n " * ./travis/mips/correct/syscalls/test_mips_syscall_$I..."
   ./creator.sh -a ./architecture/MIPS-32.json \
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
   ./creator.sh -a ./architecture/MIPS-32.json \
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
echo " MIPS: passing convention"
MIPS_TEST="001 002 003 004 005 006 007 008 009 010 011 012 013 014 015 016 017 018 019 020 021 022 023 024 025 026 027 028 029 030 031 032"
for I in $MIPS_TEST;
do
   echo -n " * ./travis/mips/sentinel/test_mips_sentinels_$I: "
   ./creator.sh -a ./architecture/MIPS-32.json \
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








#
# RISC-V
#

echo ""
echo " RISC-V:"
RV_TEST="002 003 004 005 006 007 008 011 012"
for I in $RV_TEST;
do
  echo -n " * ./travis/riscv/correct/test-riscv-$I: "
  ./creator.sh -a "./architecture/RISC-V (RV32IMFD).json" \
               -s ./travis/riscv/correct/test-riscv-$I.s -o min > /tmp/e-$I.out
  diff /tmp/e-$I.out ./travis/riscv/correct/test-riscv-$I.out
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

if [[ -v error ]]; then
    exit -1
fi