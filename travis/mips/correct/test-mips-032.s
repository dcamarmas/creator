
#
# Creator (https://creatorsim.github.io/creator/)
#

.data

.align 2

  byte:			.byte 'a','b'

.text   
    main:
        li $v0, 11
        lw $a0, byte
        syscall
        li $t0, 5
        
        li $a0, 'c'
        syscall
        li $t0, 7
        
        li $v0, 12
        syscall
        move $t1, $v0
