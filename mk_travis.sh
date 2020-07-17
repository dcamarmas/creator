#!/bin/bash
#set -x

#
# MIPS
#

echo " MIPS:"
MIPS_TEST="2 3 4 5 6 7 8 11"
for I in $MIPS_TEST;
do
   echo -n " * ./examples/MIPS/example$I: "
   ./creator.sh -a ./architecture/MIPS-32-like.json \
                -s ./examples/MIPS/example$I.txt \
                -r ./examples/MIPS/example$I.output --quiet
done


#
# RISC-V
#

echo " RISC-V:"
RV_TEST="1"
for I in $RV_TEST;
do
  echo -n " * ./examples/riscv/example$I: "
  ./creator.sh -a ./architecture/RISC-V-like.json \
               -s ./examples/riscv/example$I.txt \
               -r ./examples/riscv/example$I.output --quiet
done

