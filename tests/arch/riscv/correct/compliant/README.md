This directory contains a minimal example using the rv64 toolchain. The startup.S file is a simple
assembly file with a few instructions. The provided Makefile will assemble the startup.S file and
link it with the linker script to produce a binary file. The binary file can be run in the spike
simulator. Additionally, the Makefile will call the python script "toCreatorBinary.py" to convert
the .elf file to a creator "binary" file, which can be executed on the creator simulator. To launch the compiled binary in CREATOR, a loader script is necessary to set the program counter to the start of the binary.