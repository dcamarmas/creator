.data
newline: .string "\r\n"

.text

    main:   
        li  a0, 5
        li  a1, 10
        jal ra, max
        li  a7, 1
        ecall

        la  a0, newline
        li  a7, 4
        ecall

        li  a0, 5
        li  a1, 10
        jal ra, min
        li  a7, 1
        ecall

        la  a0, newline
        li  a7, 4
        ecall

        li a7, 10
        ecall
