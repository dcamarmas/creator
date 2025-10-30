# Developing CREATOR

> [!WARNING]
> Make sure to initialize the [git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules).
> 
> You can either add the `--recurse-submodules` flag when doing `git clone` or
> do `git submodule update --init --recursive` once it is already cloned.



## Project Setup
This project uses [Bun](https://bun.sh) (for Web) and
[Deno](https://deno.com/) (for CLI).

> [!IMPORTANT]
> Building the assembler dependency requires installing
> [rustup](https://rustup.rs/), [Deno](https://deno.com/), and
> [wasm-pack](https://drager.github.io/wasm-pack/).

```sh
bun install  # install dependencies
bun dev:wasm  # build wasm dependencies
bun build:gateway  # bundle gateway driver (optional)
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

The resulting bundle will be saved to `dist/web/`.

> [!TIP]
> To test locally the bundle version, as it will be deployed in GitHub Pages:
> ```bash
> REPO="creatorV" bun build:web
> cd dist/web
> python -m http.server 8080
> ```
> And go to [localhost:8080/creatorV/](https://localhost:8080/creatorV/)

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
bun format <file/directory>
```

### Run Tests
Unit tests (with [Deno](https://deno.com/))
```sh
deno test -A --unstable-node-globals --parallel
```



## Backend RPC Server
This project includes a JSON RPC server that exposes the CREATOR emulator's core functionalities.

For more details, see the [RPC Server README](src/rpc/README.md).



## VS Code Setup
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


## Resources

### General
- [MDN Web Docs](https://developer.mozilla.org/)
- [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [D. Camarmas et al. - CREATOR: Simulador didáctico y genérico para la programación en ensamblador](https://zenodo.org/records/5130302)


### Web
- [Vue.js docs](https://vuejs.org/guide/)
- [BoostrapVueNext Docs](https://bootstrap-vue-next.github.io/bootstrap-vue-next/) & [Bootstrap Docs](https://getbootstrap.com/docs/)
- [Font Awesome Icons](https://fontawesome.com/search?ic=free) & [Font Awesome Docs](https://docs.fontawesome.com/)
- [vue-codemirror6](https://github.com/logue/vue-codemirror6) & [Codemirror Docs](https://codemirror.net/docs/)
- [vue3-apexcharts](https://github.com/apexcharts/vue3-apexcharts) & [ApexCharts Docs](https://apexcharts.com/docs)
- [CSS Tricks](https://css-tricks.com/)
- [`vue-tricks.md`](docs/vue-tricks.md)


### Assembler
- [A. Guerrero - Desarrollo de un Compilador Genérico de Lenguaje Ensamblador para el Simulador CREATOR](https://github.com/ALVAROPING1/TFG)
- [The Rust Programming Language](https://doc.rust-lang.org/book/title-page.html)
- [Compiler Contribution Docs](https://github.com/ALVAROPING1/CreatorCompiler/blob/master/CONTRIBUTING.md)
- [Serde (Deserialization Library) Docs](https://docs.rs/serde/)
- [Chumsky (Parser Library) Docs](https://docs.rs/chumsky)
- [Ariadne (Error Renderer Library) Docs](https://docs.rs/ariadne)