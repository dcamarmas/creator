# Developing CREATOR
The intended development platform is Linux, although any Unix-based system should work as well.

The required dependencies are:
- Bash
- [Chromium](https://www.chromium.org/Home/) or [Firefox](https://www.mozilla.org/firefox/)-based browser
- [NodeJS](https://nodejs.org/)
- [NPM](https://www.npmjs.com/)
- [Python3](https://www.python.org/)

Any other dependencies will be specified in subfolder's READMEs.


## Folder overview

- [`architecture/`](../architecture/): Architecture definition files
  - [`available_arch.json`](../architecture/available_arch.json): List of available architectures, the ones that will appear in the frontend's startup page
  - [`new_arch.json`](../architecture/new_arch.json): Default setup for a new architecture
- [`components/`](../components/): Vue components for the Web
- [`css/`](../css/): CSS files for the Web
- [`dockers/`](../dockers/): Source for the different Docker images
- [`docs/`](../docs/): Documentation
- [`examples/`](../examples/): Assembly examples for the different architectures
  - [`example_set.json`](../examples/example_set.json): Configuration file for mapping example sets and architectures
- [`external/`](../external): Third-party libraries
- [`gateway/`](../gateway/): Source code for the ESP32 module
- [`js/`](../js/): Source files for the application
  - [`app.js`](../js/app.js): Entry point for the Web
- [`images/`](../images/): Web source images
- [`remote_lab/`](../remote_lab/): Source code for the remote lab
- [`test/`](../test/): Regression tests.


## Tooling (JS)

### Building
Building both the Web and CLI (Node) versions is done through the [`mk_min.sh`](../mk_min.sh) script.

To build:
```
npm run build
```

This will generate three files:
- `min.creator_web.js`: Website version
- `min.creator_node.js`: CLI "backend" version
- `min.creator_node.js.map`: Mappings for the CLI version, useful for [debugging](#debugging)


#### Executing
You need to run the application inside a web server. The easiest way is to set up a small HTTP server with Python:
```
npm run serve
```

This will open up the application in [localhost:8080](http://localhost:8080).



### Testing
Originally, tests were executed through the [`run_test.sh`](../run_test.sh) script, but this was deprecated in favor of the new [`test.py`](../test.py) file.

To execute them:
```
npm run test
```


### Debugging
Debugging for the Web version can be done through the use of the browser's tools, but it's only recommended for the Vue frontend.

For the "backend", or "core" functionality, the recommended way is to debug the node version, whose entry point is [`creator.js`](../creator.js).

> [!TIP]
> For [VS Code](https://code.visualstudio.com/), here is an example of [launch config](https://code.visualstudio.com/docs/editor/debugging-configuration#_launch-configurations):
> ```jsonc
> {
>   "type": "node",
>   "request": "launch",
>   "name": "Debug Creator",
>   "skipFiles": [
>     "<node_internals>/**",
>     "**/creator_logger.js"
>   ],
>   "program": "${workspaceFolder}/creator.js",
>   "preLaunchTask": "npm: build",
>   "sourceMaps": true,
>   "args": [
>     "-a", "./architecture/RISC_V_RV32IMFD.json",  // architecture definition file
>     "-s", "./test/riscv/correct/test_riscv_example_001.s",  // source file
>     // "--debug"
>   ]
> }
> ```


### Linting
Linting is done through [ESLint](https://eslint.org/). The configuration file can be found in [`eslint.config.mjs`](../eslint.config.mjs).

To lint a specific file:
```
npm run lint <file>
```

> [!NOTE]
> As this is a new addition, expect multiple linting errors and warnings.  
> This is mainly intended as a tool for new files.

> [!NOTE]
> While linting specific files, be aware that, as we're concatenating everything at build time, the linter will not be able to detect variables that are defined in other files.

> [!TIP]
> For [VS Code](https://code.visualstudio.com/) users, the recommended extension is [`dbaeumer.vscode-eslint`](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).


### Formatting
Formatting is done through [Prettier](http://prettier.io/). The configuration file can be found in [`.prettierrc.yaml`](../.prettierrc.yaml)

> [!IMPORTANT]
> This is a new addition, intended ONLY for new files.

To check the formatting for a specific file:
```
npm run format -c <file>
```

To format a specific file:
```
npm run format -w <file>
```

> [!TIP]
> For [VS Code](https://code.visualstudio.com/) users, the recommended extension is [`esbenp.prettier-vscode`](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).


## Architecture definition files
The [new compiler](https://github.com/ALVAROPING1/CreatorCompiler) allows the generation of a [JSON Schema](https://json-schema.org/), which enables features such as validation and autocompletion in some IDEs.

To generate the schema, clone the compiler repository, install `cargo` (e.g. through [rustup](https://rustup.rs/)) and execute the following command:
```
cargo run -- schema > schema.json
```

This will store the schema in a new `schema.json` file.

> [!TIP]
> For [VS Code](https://code.visualstudio.com/) users, you can [map the schema in the Workspase settings](https://code.visualstudio.com/docs/languages/json#_mapping-to-a-schema-in-the-workspace) with the following snippet:
> ```jsonc
> "json.schemas": [
>   {
>     "fileMatch": ["architecture/*.json"],
>     "url": "/path/to/schema.json"  // specify here the path
>   }
> ]
> ```