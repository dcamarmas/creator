
#
# ARCOS.INF.UC3M.ES
# BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)
#


.data
   .align 2 # .align x -> 2^x = a qué se alinean los datos (2^2 = a 4 bytes)
   matriz: .word 0x00, 0x01, 0x02
           .word 0x10, 0x11, 0x12

   matriz2: .space    2500 # "25x25x4"
#  matriz3: .space 1000000 # "500x500x4"


.text
.globl main

# Función rellenar (int A[][], int M, int N). 
# IN
#   * M representa el número de filas y 
#   * N el número de columnas.
# DOES
#   * Inicializa todos los valores de la matriz A a cero. 
# OUT
#   * Si todo va bien devuelve 0.

rellenar: # $a0 <- primero parámetro => A
          # $a1 <- segundo parámetro => M
          # $a2 <- tercero parámetro => N
          # $a3 <- cuarto parámetro  x
      
         # for (i=0; i<M; i++)         
         li $t0, 0            # i = $t0
   for1: bge $t0, $a1, finfor1 # (i >= M) ir a finfor1
         # for (j=0; j<N; j++)
         li $t1, 0            # j = $t1
   for2: bge $t1, $a2, finfor2 # (i >= N) ir a finfor1
            # i*N + j                # "cuantos elementos dejo atrás"
            # (i*N + j) * 4          # "cuantos bytes hay desde el inicio de matriz"
            # matriz + (i*N + j) * 4 # dirección del elemento (i,j)
            #             
            # dirección del elemento (i,j)
            mul  $t3, $t0, $a2 # i*N
            add  $t3, $t3, $t1 # + j
            mul  $t3, $t3, 4   # * 4
            add  $t3, $a0, $t3 # matriz + (i*N+j)...
            # matriz[i][j] = 0
            sw $zero, ($t3) # memoria[$t3] = 0
           #
         addi $t1, $t1, 1
         b for2
finfor2: # fin for (j=0...
         addi $t0, $t0, 1
         b for1
finfor1: # ...

           # return ok
           li $v0, 0
           jr $ra # return
      
           # return ko
fin_error: li $v0, -1
           jr $ra      
    

# Función Main ( void ). 
# IN
#
# DOES
#   * Llama a rellenar(matriz, 2, 3).
# OUT
#

main: 
      # invocar a Init: 1) paso de parámetros + 2) jal
      la $a0, matriz
      li $a1, 2
      li $a2, 3
      jal rellenar # RA <- PC
                   # PC <- Init
      
      


