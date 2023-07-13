
#
# CREATOR (https://creatorsim.github.io/creator/)
#


# int vec[5] ;
# ...
# 
# main () 
# {
#     vec[4] = 8;
#    
# }


.data
  .align  2       # siguiente dato alineado a 4
  vec: .zero  20  # 5 elem. * 4 bytes


.text
main:   li t2, 8
        li t1, 16
        sw t2, vec(t1)       
        # ...

