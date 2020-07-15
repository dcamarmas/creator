#!/bin/bash

# welcome
echo ""
echo "  CREATOR packer"
echo " ----------------"
echo ""
echo "  Requirements:"
echo "  * terser, colors, yargs, readline-sync"
npm install terser jshint colors yargs readline-sync
echo ""
if [ $# -gt 0 ]; then
     set -x
fi


# skeleton
echo "  Packing:"
echo "  * min.creator_web.js..."
cat js/creator_compiler.js \
    js/creator_executor.js \
    js/creator_bigint.js \
    js/creator_ui.js \
    js/creator_preload.js \
    js/app.js > js/creator_web.js
terser -o js/min.creator_web.js js/creator_web.js
rm -fr js/creator_web.js

echo "  * min.creator_node.js..."
cat js/creator_compiler.js \
    js/creator_executor.js \
    js/creator_bigint.js \
    js/creator_node.js > js/min.creator_node.js


# the end
echo ""
echo "  CREATOR packed (if no error was shown)."
echo ""

