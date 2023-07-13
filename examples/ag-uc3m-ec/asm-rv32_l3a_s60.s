
#
# CREATOR (https://creatorsim.github.io/creator/)
#

.text
 main: 

         # int a=1; 
         # int b=2;
         # 
         # main () 
         # {
         #   if (a < b) {
         #      a = b;
         #   }
         #   ...
         # }

         li  t1, 1
         li  t2, 2

 if_1:   blt t1, t2, then_1 
         j fin_1

 then_1: mv t1, t2 

 fin_1:  # ...

