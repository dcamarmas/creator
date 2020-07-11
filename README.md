
<html>
 <h1 align="center">CREATOR: <br>didaCtic and geneRic assEmbly progrAmming simulaTOR</h1>
 <h2 align="center"> https://creatorsim.github.io/ </h2>
 <h1 align="center"><img alt="Image of Yaktocat" width="700vw" src="https://creatorsim.github.io/images/user_mode/execute_program.PNG"></h1>
</html>

## Authors
* Diego Camarmas Alonso
* Lucas Elvira Martín (RISC-V)


## CREATOR project
 
| Source Code                             | Documentation                  | Creator                                | 
|-----------------------------------------|--------------------------------|----------------------------------------| 
| https://github.com/creatorsim/creator/  |  https://creatorsim.github.io/ |  https://creatorsim.github.io/creator/ | 

### Nightly build:

| GitHub Repository | Source Code                     | Creator                                | 
|-------------------|-----------------------------------------|----------------------------------------| 
| Diego             | https://github.com/dcamarmas/creator/   |  https://dcamarmas.github.io/creator/  | 
| Lucas             | https://github.com/luck5941/creator/    |  https://luck5941.github.io/creator/   | 
| Alejandro         | https://github.com/acaldero/creator/    |  https://acaldero.github.io/creator/   | 


## Examples included in CREATOR

#### RISC-V

| Description                | Link                                                                 |
|----------------------------|----------------------------------------------------------------------| 
| Subrutine                  | https://dcamarmas.github.io/creator/?example_set=default_rv&example1 |

#### MIPS

| Description                | Link                                                                |
|----------------------------|---------------------------------------------------------------------|
| Data Storage               | https://dcamarmas.github.io/creator/?example_set=default&example1   |
| ALU operations             | https://dcamarmas.github.io/creator/?example_set=default&example2   |
| Store/Load Data in Memory  | https://dcamarmas.github.io/creator/?example_set=default&example3   |
| FPU operations             | https://dcamarmas.github.io/creator/?example_set=default&example4   |
| Loop                       | https://dcamarmas.github.io/creator/?example_set=default&example5   |
| Branch                     | https://dcamarmas.github.io/creator/?example_set=default&example6   |
| Loop + Memory              | https://dcamarmas.github.io/creator/?example_set=default&example7   |
| Copy of matrices           | https://dcamarmas.github.io/creator/?example_set=default&example8   |
| I/O Syscalls               | https://dcamarmas.github.io/creator/?example_set=default&example9   |
| I/O Syscalls + Strings     | https://dcamarmas.github.io/creator/?example_set=default&example10  |
| Subrutines                 | https://dcamarmas.github.io/creator/?example_set=default&example11  |

    
## ChangeLog

### 1.5.x:
- [x] **RISC-V** supported (Thanks to Lucas Elvira Martín @luck5941)
- [x] Bootstrap-vue upgraded up to v2.15.0
- [x] Creator now accepts some GET values:
     * Preload architecture:
       * https://dcamarmas.github.io/creator/?architecture=MIPS-32-like
     * Preload example from example set:
       * https://dcamarmas.github.io/creator/?example_set=snips&example=5
- [ ] Initial support for a **command line version based on NodeJS**
