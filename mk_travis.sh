#!/bin/bash
#set -x

#
# MIPS
#

echo " MIPS examples:"
MIPS_TEST="002 003 004 005 006 007 008 011 012 020 021 023 024 025 026 030 031"
for I in $MIPS_TEST;
do
  echo " * ./mips/correct/example$I... "
  ./creator.sh -a ./architecture/MIPS-32-like.json -s ./travis/mips/correct/test-mips-$I.s -o min | grep "PC" > ./travis/mips/correct/test-mips-$I.out
done

echo " MIPS common errors:"
MIPS_TEST="001 002 003 004 005 006 007 008 009 010 011 031 032 033 034 035 037 039 040 041 042 043 044 045 046 047 048 049"
for I in $MIPS_TEST;
do
  echo " * ./mips/error/error$I... "
  ./creator.sh -a ./architecture/MIPS-32-like.json -s ./travis/mips/error/testerror-mips-$I.s -o min > ./travis/mips/error/testerror-mips-$I.out
done


#
# RISC-V
#

echo " RISC-V:"
RV_TEST="002 003 004 005 006 007 008 011 012"
for I in $RV_TEST;
do
  echo " * ./riscv/correct/example$I... "
  ./creator.sh -a ./architecture/RISC-V-like.json -s ./travis/riscv/correct/test-riscv-$I.s -o min | grep "PC" > ./travis/riscv/correct/test-riscv-$I.out
done

