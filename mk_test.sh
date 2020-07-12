#!/bin/bash
#set -x

for I in $(seq 1 1 11)
do
  echo "Testing ./examples/MIPS/example$I..."
  ./creator.sh --arc ./architecture/MIPS-32-like.json --asm ./examples/MIPS/example$I.txt
  echo ""
done

