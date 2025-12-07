.data
.align 1
h1:     .half 0xF123
b1:		.byte 0xF1

.align 2
w1:		.word 0xF1231234

z1:		.zero 4
z2:		.zero 4
z3: 	.zero 4
z4:		.zero 4
z5:		.zero 4

.text
main:
# load half unsigned. mem[x4] -> x5
la x4, h1
lhu x5, 0(x4)

# try to save that back to memory. x5 -> mem[z1]. OVERFLOW
la x4, z1
sh x5, 2(x4) #offset by 2 to write on the lower half of the word

# do the same thing but with the sw instruction. Works perfectly
la x4, z2
sw x5, 0(x4)

# *---------------------*

# Now lets try with a word with its MSb set to 1 (0xF1231234)
la x4, w1
lw x5, 0(x4)

# And we save it
la x4, z3
sw x5, 0(x4)

# *---------------------*
# What about bytes?
la x4, b1
lbu x5, 0(x4)

# Now we try to save it
la x4, z5
sb x5, 3(x4)