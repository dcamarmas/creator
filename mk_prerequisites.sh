#!/bin/bash

set -e
echo ""
if [ $# -gt 0 ]; then
     set -x
fi


# welcome
echo ""
echo "  CREATOR base"
echo " --------------"
echo ""

echo "  * npm"
sudo apt install npm -y

echo "  * terser, colors, yargs, readline-sync"
npm install terser jshint colors yargs readline-sync source-map-support

echo "  * rustup"
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

echo "  * wasm-pack"
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh


# the end
echo ""
echo "  CREATOR base installed (if no errors were shown)."
echo ""

