 .text

    main:   
        addi $s0, $ra, 0
        li  $a0, 5
        li  $a1, 10
        jal max
        li  $v0, 1
        syscall

        li  $a0, '\n'
        li  $v0, 11
        syscall

        li  $a0, 5
        li  $a1, 10
        jal min
        li  $v0, 1
        syscall

        li  $a0, '\n'
        li  $v0, 11
        syscall

        addi $ra, $s0, 0
        jr $ra
