#
# Creator (https://creatorsim.github.io/creator/)
#
 
.data
    a: .double 34.544
    b: .double 11.443
    c: .double 665.4
    
    d: .space 24
    
.text
main:
    la $t0, a
    la $t1, b
    la $t2, c
    la $t3, d
    
    l.d $f0, 0($t0)
    l.d $f2, 0($t1)
    l.d $f10, 0($t2)
    add.d $f0, $f0, $f0
    sub.d $f4, $f10, $f0
    div.d $f12, $f10, $f2

    s.d $f0, 0($t3)
    addi $t3, $t3, 8
    s.d $f4, 0($t3)
    addi $t3, $t3, 8
    s.d $f12, 0($t3)

    li $v0, 10
    syscall
    