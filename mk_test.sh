#!/bin/bash
#set -x

for I in $(seq 1 1 11)
do
  echo "Testing example$I..."
  ./node/creator.sh ./architecture/MIPS-32-like.json ./examples/MIPS/example$I.txt
  echo ""
done

