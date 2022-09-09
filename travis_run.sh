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
   ./creator.sh -a ./architecture/MIPS-32.json \
                -s ./travis/mips/correct/test-mips-$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/mips/correct/test-mips-$I.out
   if [ $? -ne 0 ]; then
       echo "Different: Error $I with different outputs...";
       error=1
   else
       echo "Equals";
   fi
   rm   /tmp/e-$I.out
done

echo ""
echo " MIPS: common errors"
MIPS_TEST="001 002 003 004 005 006 007 008 009 010 011 031 032 033 034 035 037 039 040 041 042 043 044 045 046 047 048 049"
for I in $MIPS_TEST;
do
   echo -n " * ./travis/mips/error/testerror-mips-$I: "
   ./creator.sh -a ./architecture/MIPS-32.json \
                -s ./travis/mips/error/testerror-mips-$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/mips/error/testerror-mips-$I.out
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
   echo -n " * ./travis/mips/sentinel/testsentinel-mips-$I: "
   ./creator.sh -a ./architecture/MIPS-32.json \
                -s ./travis/mips/sentinel/testsentinel-mips-$I.s -o min > /tmp/e-$I.out
   diff /tmp/e-$I.out ./travis/mips/sentinel/testsentinel-mips-$I.out
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