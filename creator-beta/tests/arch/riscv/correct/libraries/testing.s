.text
max:
    bge a0, a1, bigger
    mv  a0, a1
bigger:
    jr  ra

min:
    ble a0, a1, minor
    mv  a0, a1
minor:
    jr  ra



    main:   
        li  a0, 5
        li  a1, 10
        jal ra, max
        li  a7, 1
        ecall

        li  a0, '\n'
        li  a7, 11
        ecall

        li  a0, 5
        li  a1, 10
        jal ra, min
        li  a7, 1
        ecall

        li  a0, '\n'
        li  a7, 11
        ecall
