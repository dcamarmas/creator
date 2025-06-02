The assembler source code is located at `https://github.com/ALVAROPING1/CreatorCompiler`.

To compile for DENO:
deno run -A jsr:@deno/wasmbuild

To compile for WEB:
cargo build --release

And place the generated files inside either `src/core/compiler/deno` or `src/core/compiler/web`.
