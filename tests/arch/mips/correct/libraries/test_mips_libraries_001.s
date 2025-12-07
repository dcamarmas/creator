 .text

    main:   
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