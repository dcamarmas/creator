.text
	main:
		li $t0 1
		li $t1 2
		li $t2 3

		addi $sp $sp -4
		sw $t0 4($sp)

		addi $sp $sp -4
		sw $t1 4($sp)

		addi $sp $sp -4
		sw $t2 4($sp)

		lw $t0 4($sp)
		addi $sp $sp 4

		lw $t1 4($sp)
		addi $sp $sp 4

		lw $t2 4($sp)
		addi $sp $sp 4