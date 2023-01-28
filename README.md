
<html>
 <h1 align="center">CREATOR: <br>didaCtic and geneRic assEmbly progrAmming simulaTOR </h1>
 <h1 align="center"><img alt="Image of CREATOR" width="640vw" src="https://creatorsim.github.io/images/user_mode/execute_program.PNG"><br>https://creatorsim.github.io/</h1>
</html>

## CREATOR project

[![Build Status](https://app.travis-ci.com/creatorsim/creator.svg?branch=master)](https://app.travis-ci.com/creatorsim/creator)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/84668451decf487bbc85b13129f0ebb5)](https://www.codacy.com/gh/creatorsim/creator/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=creatorsim/creator&amp;utm_campaign=Badge_Grade)
[![Generic badge](https://img.shields.io/badge/achecker-WCAG%202.0%20(Level%20AAA)-green.svg)](https://shields.io/)

|                              | URL                                             | 
|:----------------------------:|:------------------------------------------------| 
| Creator                      | https://creatorsim.github.io/creator/           |
| Documentation                | https://creatorsim.github.io/                   | 
| Examples included            | :point_right: [RISC-V](docs/examples.md#point_right---risc-v) :point_right: [MIPS-32](docs/examples.md#point_right---mips) | 

### Source code and testing

|                              | URL                                             | 
|:----------------------------:|:------------------------------------------------| 
| Source Code                  | https://github.com/creatorsim/creator/          | 
| :clipboard:  Travis Tests    | [Description of Travis Tests](docs/travis.md)   | 
| :microscope: Nightly build   | https://dcamarmas.github.io/creator             |

### Supported Internet Browser

![Edge](https://img.shields.io/badge/Edge-0078D7?style=for-the-badge&logo=Microsoft-edge&logoColor=white)
![Firefox](https://img.shields.io/badge/Firefox-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)
![Google Chrome](https://img.shields.io/badge/Google%20Chrome-4285F4?style=for-the-badge&logo=GoogleChrome&logoColor=white)
![Safari](https://img.shields.io/badge/Safari-000000?style=for-the-badge&logo=Safari&logoColor=white)


## Authors
* :technologist: Diego Camarmas Alonso (Main Coordinator)
* :technologist: Félix García Carballeira 
* :technologist: Alejandro Calderón Mateos
* :technologist: Elías Del Pozo Puñal (Beta Tester)
* :technologist: Lucas Elvira Martín (RISC-V and several improvements)


## ChangeLog

<details open>
<summary>:atom: 3.2.x:</summary>

- [x] User Interface:
     * New link to the quick reference guide for instructions in PDF
     * The current assembly code can be shared as a simple link
- [x] Modular design:
     * Simplified pseudo-instruction forms
     * Improved memory detail panel
     * Hardware counter updated in order to know the number of clock cycles consumed since the last reset

</details>

<details>
<summary>:atom: 3.1.x:</summary>

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

</details>

<details>
<summary>:atom: 3.0.x:</summary>

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

</details>

<details>
<summary>:atom: 2.1.x:</summary>

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

</details>
