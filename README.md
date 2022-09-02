
<html>
 <h1 align="center">CREATOR: <br>didaCtic and geneRic assEmbly progrAmming simulaTOR</h1>
 <h2 align="center"> https://creatorsim.github.io/ </h2>
 <h1 align="center"><img alt="Image of Yaktocat" width="700vw" src="https://creatorsim.github.io/images/user_mode/execute_program.PNG"></h1>
</html>

## Authors
* :technologist: Diego Camarmas Alonso (Main Coordinator)
* :technologist: Lucas Elvira Martín (RISC-V and several improvements)
* :technologist: Elías Del Pozo Puñal (Beta Tester)
* :technologist: Félix García Carballeira 
* :technologist: Alejandro Calderón Mateos


## CREATOR project
 
| Source Code                             | Documentation                  | Creator                                | 
|-----------------------------------------|--------------------------------|----------------------------------------| 
| https://github.com/creatorsim/creator/  |  https://creatorsim.github.io/ |  https://creatorsim.github.io/creator/ | 

### :mag_right:	 Checks:

[![Build Status](https://travis-ci.com/dcamarmas/creator.svg?branch=master)](https://travis-ci.com/dcamarmas/creator)
[![Generic badge](https://img.shields.io/badge/achecker-WCAG%202.0%20(Level%20AAA)-green.svg)](https://shields.io/)

### :microscope:	 Nightly build:

| GitHub Repository | Source Code                             | Creator                                | 
|-------------------|-----------------------------------------|----------------------------------------| 
| Diego             | https://github.com/dcamarmas/creator/   |  https://dcamarmas.github.io/creator/  | 
| Alejandro         | https://github.com/acaldero/creator/    |  https://acaldero.github.io/creator/   | 


## Examples included in CREATOR

#### :point_right:	 RISC-V

| Description                | Link                                                                                         |
|----------------------------|----------------------------------------------------------------------------------------------| 
| Data Storage               | https://dcamarmas.github.io/creator/?architecture=RISC-V&example_set=default_rv&example=e1   |
| ALU operations             | https://dcamarmas.github.io/creator/?architecture=RISC-V&example_set=default_rv&example=e2   |
| Store/Load Data in Memory  | https://dcamarmas.github.io/creator/?architecture=RISC-V&example_set=default_rv&example=e3   |
| FPU operations             | https://dcamarmas.github.io/creator/?architecture=RISC-V&example_set=default_rv&example=e4   |
| Loop                       | https://dcamarmas.github.io/creator/?architecture=RISC-V&example_set=default_rv&example=e5   |
| Branch                     | https://dcamarmas.github.io/creator/?architecture=RISC-V&example_set=default_rv&example=e6   |
| Loop + Memory              | https://dcamarmas.github.io/creator/?architecture=RISC-V&example_set=default_rv&example=e7   |
| Copy of matrices           | https://dcamarmas.github.io/creator/?architecture=RISC-V&example_set=default_rv&example=e8   |
| I/O Syscalls               | https://dcamarmas.github.io/creator/?architecture=RISC-V&example_set=default_rv&example=e9   |
| I/O Syscalls + Strings     | https://dcamarmas.github.io/creator/?architecture=RISC-V&example_set=default_rv&example=e10  |
| Subrutines                 | https://dcamarmas.github.io/creator/?architecture=RISC-V&example_set=default_rv&example=e11  |
| Factorial                  | https://dcamarmas.github.io/creator/?architecture=RISC-V&example_set=default_rv&example=e12  |

#### :point_right:	 MIPS

| Description                | Link                                                                                       |
|----------------------------|--------------------------------------------------------------------------------------------|
| Data Storage               | https://dcamarmas.github.io/creator/?architecture=MIPS-32&example_set=default&example=e1   |
| ALU operations             | https://dcamarmas.github.io/creator/?architecture=MIPS-32&example_set=default&example=e2   |
| Store/Load Data in Memory  | https://dcamarmas.github.io/creator/?architecture=MIPS-32&example_set=default&example=e3   |
| FPU operations             | https://dcamarmas.github.io/creator/?architecture=MIPS-32&example_set=default&example=e4   |
| Loop                       | https://dcamarmas.github.io/creator/?architecture=MIPS-32&example_set=default&example=e5   |
| Branch                     | https://dcamarmas.github.io/creator/?architecture=MIPS-32&example_set=default&example=e6   |
| Loop + Memory              | https://dcamarmas.github.io/creator/?architecture=MIPS-32&example_set=default&example=e7   |
| Copy of matrices           | https://dcamarmas.github.io/creator/?architecture=MIPS-32&example_set=default&example=e8   |
| I/O Syscalls               | https://dcamarmas.github.io/creator/?architecture=MIPS-32&example_set=default&example=e9   |
| I/O Syscalls + Strings     | https://dcamarmas.github.io/creator/?architecture=MIPS-32&example_set=default&example=e10  |
| Subrutines                 | https://dcamarmas.github.io/creator/?architecture=MIPS-32&example_set=default&example=e11  |
| Factorial                  | https://dcamarmas.github.io/creator/?architecture=MIPS-32&example_set=default&example=e12  |


## ChangeLog

### :atom: 3.1.x:
- [x] User Interface:
     * Example set added
     * The Instruction help width can be now configure from the configuration modal
     * Clarification on intitial CREATOR page
     * Better responsive behaviour on different screen sizes
     * Power consumption added
- [x] Modular design:
     * Interface based on Vue components for all UI elements in CREATOR
     * Simulated main memory reworked
     * Architecture improved


### :atom: 3.0.x:
- [x] Several minor RISC-V improvements
- [x] More modular design:
     * Initial user interface based on Vue components
     * Improved modular design on execution engine
- [x] Improved instruction definitions:
     * New CREATOR API for instruction definitions
     * Support for helping on check Stack Calling Conventions
       * Checking saved registers on stack are restored
       * Colored stack
       * SP and FP pointers are shown on the memory stack detail panel

### :atom: 2.1.x:
- [x] **RISC-V** supported (Thanks to Lucas Elvira Martín @luck5941)
- [x] CREATOR **accessibility improved** up to WCAG 2.0 (Level AAA)
- [X] **Command line version** of CREATOR: 
     * Help:
       * ./creator.sh -h
     * Example: creator compiles and executes the example2.txt, showing the final state:
       * ./creator.sh -a architecture/MIPS-32.json -s examples/MIPS/example2.txt
     * Example: save final state into 'salida.txt' file:
       * ./creator.sh -a ./architecture/MIPS-32.json -s ./examples/MIPS/example2.txt -o min > salida.txt
     * Example: compare final state and the state saved on 'salida.txt' file:
       * ./creator.sh -a ./architecture/MIPS-32.json -s ./examples/MIPS/example2.txt -o min -r salida.txt
- [x] Creator now accepts three GET values:
     * Preload the MIPS architecture:
       * https://creatorsim.github.io/creator/?architecture=MIPS-32
     * Preload example 'e3' from example set 'uc3m-ec':
       * https://creatorsim.github.io/creator/?example_set=uc3m-ec&example=e3
- [x] Bootstrap-vue upgraded up to v2.15.0

