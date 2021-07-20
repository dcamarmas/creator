#!/bin/bash
#set -x

#
# MIPS
#

echo ""
echo " MIPS: examples"
MIPS_TEST="002 003 004 005 006 007 008 011 012 020 021 023 024 025 026 030 031"
for I in $MIPS_TEST;
do
   echo -n " * ./travis/mips/correct/test-mips-$I: "
   ./creator.sh -a ./architecture/MIPS-32-like.json \
                -s ./travis/mips/correct/test-mips-$I.s \
                -r ./travis/mips/correct/test-mips-$I.out -o min | tail -1
done

echo ""
echo " MIPS: common errors"
MIPS_TEST="001 002 003 004 005 006 007 008 009 010 011 031 032 033 034 035 037 039 040 041 042 043 044 045 046 047 048 049"
for I in $MIPS_TEST;
do
   echo -n " * ./travis/mips/error/testerror-mips-$I: "
   ./creator.sh -a ./architecture/MIPS-32-like.json \
                -s ./travis/mips/error/testerror-mips-$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/mips/error/testerror-mips-$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
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
  ./creator.sh -a ./architecture/RISC-V-like.json \
               -s ./travis/riscv/correct/test-riscv-$I.s \
               -r ./travis/riscv/correct/test-riscv-$I.out -o min | tail -1
done

