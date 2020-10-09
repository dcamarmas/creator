#!/bin/bash
#set -x

#
# MIPS
#

echo " MIPS examples:"
MIPS_TEST="2 3 4 5 6 7 8 11 12 13"
for I in $MIPS_TEST;
do
  echo " * ./MIPS/correct/example$I... "
  ./creator.sh -a ./architecture/MIPS-32-like.json -s ./travis/MIPS/correct/example$I.txt -o min | grep "PC" > ./travis/MIPS/correct/example$I.output
done

echo " MIPS common errors:"
MIPS_TEST="1 2 3 4 5 6 7 8 9 10 11"
for I in $MIPS_TEST;
do
  echo " * ./MIPS/error/error$I... "
  ./creator.sh -a ./architecture/MIPS-32-like.json -s ./travis/MIPS/error/error$I.txt -o min > ./travis/MIPS/error/error$I.output
done


#
# RISC-V
#

echo " RISC-V:"
RV_TEST="1"
for I in $RV_TEST;
do
  echo " * ./riscv/correct/example$I... "
  ./creator.sh -a ./architecture/RISC-V-like.json -s ./travis/riscv/correct/example$I.txt -o min | grep "PC" > ./travis/riscv/correct/example$I.output
done

