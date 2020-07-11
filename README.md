# CREATOR: didaCtic and geneRic assEmbly progrAmming simulaTOR

## Authors
* Diego Camarmas Alonso
* Lucas Elvira Martín (RISC-V)


## Links

 * Stable  build:
 
| Source Code                             | Documentation                  | Creator                                | 
|-----------------------------------------|--------------------------------|----------------------------------------| 
| https://github.com/creatorsim/creator/  |  https://creatorsim.github.io/ |  https://creatorsim.github.io/creator/ | 
|-----------------------------------------|--------------------------------|----------------------------------------| 

* Nightly build:

|           | Source Code (GitHub Repository)         | Creator                                | 
|-----------|-----------------------------------------|----------------------------------------| 
| Diego     | https://github.com/dcamarmas/creator/   |  https://dcamarmas.github.io/creator/  | 
|-----------|-----------------------------------------|----------------------------------------| 
| Lucas     | https://github.com/luck5941/creator/    |  https://luck5941.github.io/creator/   | 
|-----------|-----------------------------------------|----------------------------------------| 
| Alejandro | https://github.com/acaldero/creator/    |  https://acaldero.github.io/creator/   | 
|-----------|-----------------------------------------|----------------------------------------| 


## Default Examples

 * MIPS

| Description                | Link                                                                 |
|----------------------------|----------------------------------------------------------------------|
| Data Storage               | https://dcamarmas.github.io/creator/?example_set=default&example=1   |
| ALU operations             | https://dcamarmas.github.io/creator/?example_set=default&example=2   |
| Store/Load Data in Memory  | https://dcamarmas.github.io/creator/?example_set=default&example=3   |
| FPU operations             | https://dcamarmas.github.io/creator/?example_set=default&example=4   |
| Loop                       | https://dcamarmas.github.io/creator/?example_set=default&example=5   |
| Branch                     | https://dcamarmas.github.io/creator/?example_set=default&example=6   |
| Loop + Memory              | https://dcamarmas.github.io/creator/?example_set=default&example=7   |
| Copy of matrices           | https://dcamarmas.github.io/creator/?example_set=default&example=8   |
| I/O Syscalls               | https://dcamarmas.github.io/creator/?example_set=default&example=9   |
| I/O Syscalls + Strings     | https://dcamarmas.github.io/creator/?example_set=default&example=10  |
| Subrutines                 | https://dcamarmas.github.io/creator/?example_set=default&example=11  |
|----------------------------|----------------------------------------------------------------------|

 * RISC-V

| Description                | Link                                                                  |
|----------------------------|-----------------------------------------------------------------------| 
| Subrutine                  | https://dcamarmas.github.io/creator/?example_set=default_rv&example=1 |
|----------------------------|-----------------------------------------------------------------------| 

    
## ChangeLog
1.5.x:
   * RISC-V Support (Thanks to Lucas Elvira Martín)
   * Bootstrap-vue upgraded up to v2.15.0
   * Initial support for a command line version based on nodejs
   * Creator now accepts some GET values:
     * Preload architecture:
       * https://dcamarmas.github.io/creator/?architecture=MIPS-32-like
     * Preload example from example set:
       * https://dcamarmas.github.io/creator/?example_set=snips&example=5

