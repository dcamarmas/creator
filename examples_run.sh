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
  ./creator.sh -a ./architecture/MIPS-32-like.json -s ./examples/MIPS/example$I.txt
  echo ""
done

#
# RISC-V
#

echo " RISC-V:"
RV_TEST="1"
for I in $RV_TEST;
do
  echo " * ./examples/riscv/example$I... "
  ./creator.sh -a ./architecture/RISC-V-like.json -s ./examples/riscv/example$I.txt
  echo ""
done
