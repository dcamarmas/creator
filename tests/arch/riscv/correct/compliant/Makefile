all: minimal.elf

clean:
	rm -f minimal.elf minimal.o minimal.disasm minimal.map binary.o

minimal.o: minimal.S
	riscv64-unknown-elf-as -o minimal.o minimal.S

minimal.elf: minimal.o
	riscv64-unknown-elf-ld -Map=minimal.map -T riscv.ld -o minimal.elf minimal.o
	riscv64-unknown-elf-objdump -d minimal.elf > minimal.disasm
	python toCreatorBinary.py minimal.elf -o binary.o --debug