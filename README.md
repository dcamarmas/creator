
<html>
 <h1 align="center">CREATOR: <br>didaCtic and geneRic assEmbly progrAmming simulaTOR</h1>
 <h2 align="center"> https://creatorsim.github.io/ </h2>
 <h1 align="center"><img alt="Image of Yaktocat" width="700vw" src="https://creatorsim.github.io/images/user_mode/execute_program.PNG"></h1>
</html>

## Authors
* :technologist: Diego Camarmas Alonso
* :technologist: Lucas Elvira Martín (RISC-V)


## CREATOR project
 
| Source Code                             | Documentation                  | Creator                                | 
|-----------------------------------------|--------------------------------|----------------------------------------| 
| https://github.com/creatorsim/creator/  |  https://creatorsim.github.io/ |  https://creatorsim.github.io/creator/ | 

### :microscope:	 Nightly build:

| GitHub Repository | Source Code                     | Creator                                | 
|-------------------|-----------------------------------------|----------------------------------------| 
| Diego             | https://github.com/dcamarmas/creator/   |  https://dcamarmas.github.io/creator/  | 
| Lucas             | https://github.com/luck5941/creator/    |  https://luck5941.github.io/creator/   | 
| Alejandro         | https://github.com/acaldero/creator/    |  https://acaldero.github.io/creator/   | 


## Examples included in CREATOR

#### :point_right:	 RISC-V

| Description                | Link                                                                   |
|----------------------------|------------------------------------------------------------------------| 
| ALU operations             | https://dcamarmas.github.io/creator/?example_set=default_rv&example=e1 |
| Subrutine                  | https://dcamarmas.github.io/creator/?example_set=default_rv&example=e2 |

#### :point_right:	 MIPS

| Description                | Link                                                                 |
|----------------------------|----------------------------------------------------------------------|
| Data Storage               | https://dcamarmas.github.io/creator/?example_set=default&example=e1  |
| ALU operations             | https://dcamarmas.github.io/creator/?example_set=default&example=e2  |
| Store/Load Data in Memory  | https://dcamarmas.github.io/creator/?example_set=default&example=e3  |
| FPU operations             | https://dcamarmas.github.io/creator/?example_set=default&example=e4  |
| Loop                       | https://dcamarmas.github.io/creator/?example_set=default&example=e5  |
| Branch                     | https://dcamarmas.github.io/creator/?example_set=default&example=e6  |
| Loop + Memory              | https://dcamarmas.github.io/creator/?example_set=default&example=e7  |
| Copy of matrices           | https://dcamarmas.github.io/creator/?example_set=default&example=e8  |
| I/O Syscalls               | https://dcamarmas.github.io/creator/?example_set=default&example=e9  |
| I/O Syscalls + Strings     | https://dcamarmas.github.io/creator/?example_set=default&example=e10 |
| Subrutines                 | https://dcamarmas.github.io/creator/?example_set=default&example=e11 |
 
    
## ChangeLog

### :atom: 2.0.x:
- [x] **RISC-V** supported (Thanks to Lucas Elvira Martín @luck5941)
- [x] Bootstrap-vue upgraded up to v2.15.0
- [X] Initial command line version of CREATOR: 
     * Help:
       * ./creator.sh -h
     * Example: creator compiles and executes the example2.txt, showing the final state:
       * ./creator.sh -a architecture/MIPS-32-like.json -s examples/MIPS/example2.txt
     * Example: save final state into 'salida.txt' file:
       * ./creator.sh -a ./architecture/MIPS-32-like.json -s ./examples/MIPS/example2.txt --quiet > salida.txt
     * Example: compare final state and the state saved on 'salida.txt' file:
       * ./creator.sh -a ./architecture/MIPS-32-like.json -s ./examples/MIPS/example2.txt --quiet -r salida.txt
- [x] Creator now accepts three GET values:
     * Preload the MIPS architecture:
       * https://dcamarmas.github.io/creator/?architecture=MIPS-32-like
     * Preload example 'e3' from example set 'snips':
       * https://dcamarmas.github.io/creator/?example_set=snips&example=e3


## Badges

[![Build Status](https://travis-ci.org/dcamarmas/creator.svg?branch=master)](https://travis-ci.org/dcamarmas/creator)


