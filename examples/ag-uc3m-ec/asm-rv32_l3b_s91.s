
#
# CREATOR (https://creatorsim.github.io/creator/)
#

# // tira de caracteres (strings)
# char c1[10] ;
# char ac1[] = "hola" ;

.data
# strings
   c1:   .zero  10                    # 10 byte
   ac1:  .string  "hola"              # 5 bytes (!)
   ac2:  .byte    'h', 'o', 'l', 'a'  # 4 bytes  

