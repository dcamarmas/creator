
#
# Creator (https://creatorsim.github.io/creator/)
#

#	Error de numero inmediato muy grande


.data
 str: 	.string "Good string"
 max: 	.word 1

.text
main:
 li x4 4294967295
   li x5 4294967296
   li x6 -2147483648
   li x7 -2147483649
