#!/bin/bash
#set -x

#
# MIPS
#

echo " MIPS examples:"
MIPS_TEST="2 3 4 5 6 7 8 11 12"
for I in $MIPS_TEST;
do
  echo " * ./examples/MIPS/example$I... "
  ./creator.sh -a ./architecture/MIPS_32.json -s ./examples/MIPS/example"$I".s
  echo ""
done

#
# RISC-V
#

echo " RISC-V:"
RV_TEST="2 3 4 5 6 7 8 11 12"
for I in $RV_TEST;
do
  echo " * ./examples/riscv/example$I... "
  ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json -s ./examples/RISCV/example"$I".s
  echo ""
done
