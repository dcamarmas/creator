# creatorV(I)

The next evolution of [CREATOR](https://github.com/creatorsim/creator/).


## Project Setup

This project uses [Bun](https://bun.sh) (for Web)[^1] and
[Deno](https://deno.com/) (for CLI).

[^1]: You can use any other Node.js package manager like
[npm](https://www.npmjs.com/) to install the dependencies, but we recommend Bun.
Not only for its speed and ease of use, but for its [`bun.lock`](bun.lock)
lockfile, which explicitly states the package versions.

```sh
bun install
```

### Build CREATOR Assembler

> [!IMPORTANT]
> Building the assembler requires installing [rustup](https://rustup.rs/),
> [Deno](https://deno.com/), and [wasm-pack](https://drager.github.io/wasm-pack/).

> [!IMPORTANT]
> Make sure to initialize the submodules, as they contain the assembler dependency.
> You can use either `git clone --recurse-submodules` or `git submodule update --init --recursive`.

```sh
bun dev:wasm
```

### Compile Web and Hot-Reload for Development (with [Vite](https://vite.dev/))
```sh
bun dev:web
```

### Run CLI and Hot-Reload for Development (with [Deno](https://deno.com/))
```sh
bun dev:cli
```

> [!NOTE]
> Remember to pass the extra arguments, e.g:
> ```sh
> bun dev:cli -a ./architecture/RISCV/RV32IMFD.yml -I -c creatorconfig.yml
> ```

### Building Web version for production
```sh
bun build:web
```

The resulting bundle will be saved to `dist/web/creatorV`.

> [!TIP]
> To test locally the bundle version:
> ```bash
> cd dist/web
> python -m http.server 8080
> ```
> And go to [localhost:8080/creatorV](https://localhost:8080/creatorV)

<!--
TODO: when the code is type-safe, replace build:web to:
```
"build:web": "run-p type-check \"build-only {@}\" --",
"build-only": "vite build",
```
-->

### Building CLI version
```sh
bun build:cli
```

### Lint with [ESLint](https://eslint.org/)

```sh
bun lint
```

### Format with [Prettier](https://prettier.io/)

```sh
bun format
```

### Run Tests
Unit tests (with [Deno](https://deno.com/))
```sh
deno test -A --unstable-node-globals --parallel
```


### Backend RPC Server

This project includes a JSON RPC server that exposes the CREATOR emulator's core functionalities.

For more details, see the [RPC Server README](src/rpc/README.md).


### VS Code Setup
The recommended extensions are:
- [`Vue.volar`](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [`denoland.vscode-deno`](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)
- [`dbaeumer.vscode-eslint`](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [`esbenp.prettier-vscode`](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [`redhat.vscode-yaml`](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)

#### Debugging
We provide some example [launch configurations](https://code.visualstudio.com/docs/debugtest/debugging-configuration#_launch-configurations):

##### Web
We'll need to [launch the application in DEV mode](#compile-and-hot-reload-for-development), and then attach the VS Code debugger to the Chrome instance.
```json
{
    "type": "chrome",
    "request": "launch",
    "name": "Debug Web",
    "url": "http://localhost:5173",
    "webRoot": "${workspaceFolder}"
}
```

##### CLI
```json
{
    "type": "node",
    "request": "launch",
    "name": "Debug CLI",
    "program": "${workspaceFolder}/src/cli/creator6.mts",
    "runtimeExecutable": "deno",
    "console": "integratedTerminal",
    "runtimeArgs": ["-A", "--unstable-node-globals", "--inspect-brk"],
    "experimentalNetworking": "off",
    "args": [
        "-a",
        "./architecture/RISCV/RV32IMFD.yml",
        "-s",
        "./tests/arch/riscv/correct/examples/test_riscv_example_011.s",
        "-c",
        "creatorconfig.yml",
        "-I"
    ],
    "attachSimplePort": 9229
}
```
