#!/bin/bash
#set -x

#
# MIPS
#

echo " MIPS examples:"
MIPS_TEST="2 3 4 5 6 7 8 11"
for I in $MIPS_TEST;
do
  echo " * ./examples/MIPS/example$I... "
  ./creator.sh -a ./architecture/MIPS-32-like.json -s ./examples/MIPS/example$I.txt --quiet > ./examples/MIPS/example$I.output
done

echo " MIPS common errors:"
MIPS_TEST="1 2"
for I in $MIPS_TEST;
do
  echo " * ./examples/MIPS/error$I... "
  ./creator.sh -a ./architecture/MIPS-32-like.json -s ./examples/MIPS/error$I.txt --quiet > ./examples/MIPS/error$I.output
done


#
# RISC-V
#

echo " RISC-V:"
RV_TEST="1"
for I in $RV_TEST;
do
  echo " * ./examples/riscv/example$I... "
  ./creator.sh -a ./architecture/RISC-V-like.json -s ./examples/riscv/example$I.txt --quiet > ./examples/riscv/example$I.output
done

