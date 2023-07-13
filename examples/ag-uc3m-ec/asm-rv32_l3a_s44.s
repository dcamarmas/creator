
#
# CREATOR (https://creatorsim.github.io/creator/)
#

.text
 main: 
        # float PI    = 3,1415;
        # int   radio = 4;
        # float length;

        li        t0,  0x40490E56 
        fmv.w.x   ft0, t0   # ft0 t0     
        li        t1   4    # 4 en Ca2

        # length = PI * radio;

        fcvt.s.w  ft1, t1   # 4 ieee754
        fmul.s    ft0, ft0, ft1

