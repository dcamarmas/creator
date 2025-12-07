This assembler is disabled in the web version due to a bug that occurs when compiling the C code to WebAssembly. The program always terminates with error code 1, even when the compilation is successful.

This build was created using Emscripten, with the following configuration:

```bash
emcc -O3 -Wall -DMAX_PATH=4096 -s WASM=1 -s MODULARIZE=1 \
  -s EXPORT_NAME="SjasmPlus" \
  -s EXPORTED_FUNCTIONS='["_main"]' \
  -s EXPORTED_RUNTIME_METHODS='["FS","callMain"]' \
  -s FORCE_FILESYSTEM=1 -s ALLOW_MEMORY_GROWTH=1 -s STACK_SIZE=8MB \
  -I sjasm -I lua5.4 -I LuaBridge/Source -I crc32c \
  sjasm/*.cpp lua5.4/*.c crc32c/crc32c.cpp -o sjasmplus.js

```

Additionally, in the generated `sjasmplus.js` file, the `SjasmPlus` object needed to be exported to make it accessible in the web environment. 