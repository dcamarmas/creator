#!/bin/bash
#set -x

npm install

for I in $(seq 1 1 8)
do
  echo "Testing ./examples/MIPS/example$I..."
  ./creator.sh -a ./architecture/MIPS-32-like.json -s ./examples/MIPS/example$I.txt
  echo ""
done

