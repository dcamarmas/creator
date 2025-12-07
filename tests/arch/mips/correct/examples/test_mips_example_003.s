
#
# Creator (https://creatorsim.github.io/creator/)
#

.data
	w1:		.word 14
    b1:		.byte 120

    .align 1
    h1:		.half 22
    w2:		.space 4
    b2:		.space 1

    .align 1
    h2:		.space 2

.text
main:
	
    la $t0, w1		#w1 address -> $t0
    la $t1, b1		#b1 address -> $t1
    la $t2, h1		#h1 address -> $t2
    
    lw $t3, ($t0)	#Memory[$t0] -> $t3
    lw $t4, w1		#Memory[w1]  -> $t4
    
    lb $t5, ($t1)	#Memory[$t1] -> $t5
    lb $t6, b1		#Memory[b1]  -> $t6
    
    lh $t7, ($t2)	#Memory[$t2] -> $t7
    lh $t8, h1		#Memory[h1]  -> $t8
    
    sw $t3, w2		#$t3 -> Memory[w2]
    sb $t5, b2		#$t5 -> Memory[b2]
    sh $t7, h2		#$t7 -> Memory[h2]
    