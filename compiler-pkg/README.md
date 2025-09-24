# Creator Compiler

Reimplementation of the compiler used by [Creator](https://creatorsim.github.io/)
to have better performance, more helpful error messages, and a more correct output.

## Building

### Requirements

The only requirement is the rust toolchain, which can be installed through [`rustup`](https://rustup.rs/).

### Running locally (CLI)

The compiler can be built from source using `cargo build --release`, which will
place the binary in `./target/release/creator-compiler`. The `--release` flag can
be omitted to generate debug binaries. Additionally, `cargo run --release -- [<ARGS>]`
can be used as a shortcut to build and run the binary. Running the application
without arguments provides a short description of the application and subcommands,
and using `creator-compiler help <command>` provides a description and usage
instructions for each command.

The compiler currently supports 3 modes of execution:

- Print architecture specification schema to `stdout`: `creator-compiler schema`
- Validate architecture specification file: `creator-compiler validate <architecture.json>`
- Compile assembly input and print the result to `stdout`:
  `creator-compiler compile <architecture.json> <assembly.s>`
  - The `-v`/`--verbose` flag can be used to also print the parsed AST

### JS Bindings

JS bindings are supported through `wasm`. In order to build them, the code must first
be compiled into a `wasm` package with [`wasm-pack`](https://drager.github.io/wasm-pack/installer/).
This can be done using `wasm-pack build --target [web|nodejs]`, where the target
depends on if the code is being compiled for `NodeJS` or a browser. The flag `--dev`
can be added to generate a debug module with a shorter compile time by omitting optimizations.
Alternatively, the provided build script (`./build.sh`) can be used to build both targets.

After the package has been built, it can be loaded by requiring the generated `.js`
file as a module. The `js_example/` directory contains a working example of how to
use the generated package, both for the web and Node.js:

- `index.html`: entry point for the web example. Can't be directly opened in a browser
  due to [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) limitations.
  Python can be used to start a development server with `python3 -m http.server 8080`
  which allows loading the page at `localhost:8080/js_example`.
- `web.js`: main module for the web example, shows how to load the package in the web
- `node.js`: main module for the Node.js example, shows how to load the package in Node.js
- `compiler.mjs`: module responsible for interaction with the package, shows how to use the provided API
