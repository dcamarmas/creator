import sys
import os
import shutil


# reemplaza en un archivo en ensamblador las llamadas ecall por llamadas a funciones

fin = open(sys.argv[1], "rt")
#output file to write the result to

fout = open("program1.s", "wt")
#for each line in the input file
for line in fin:
        #read replace the string and write to output file
        fout.write(line.replace('ecall', '#### \n addi sp, sp, -8 \n sw ra, 0(sp) \n jal _myecall \n lw ra, 0(sp) \n addi sp, sp, 8 \n ####'))
#close input and output files
fin.close()
fout.close()



fin = open("program1.s", "rt")
#output file to write the result to

fout = open("program2.s", "wt")
#for each line in the input file
for line in fin:
        #read replace the string and write to output file
        fout.write(line.replace('rdcycle', '#### \n addi sp, sp, -8 \n sw ra, 0(sp) \n jal _esp_cpu_set_cycle_count \n lw ra, 0(sp) \n addi sp, sp, 8 \n ####'))
#close input and output files
fin.close()
fout.close()


# prepara el archivo para lanzarse

#input file
fin = open("program2.s", "rt")

#output file to write the result to
fout = open("program.s", "wt")

#for each line in the input file

fout.write(".text\n");
fout.write(".type main, @function\n")
fout.write(".globl main\n")

for line in fin:
	#read replace the string and write to output file
	fout.write(line)
	#print(line)
#close input and output files
fin.close()
fout.close()

shutil.copy("program.s", "main")
os.remove("program.s")
os.remove("program1.s")
os.remove("program2.s")

#os.system('idf.py build')
#os.system('idf.py -p /dev/cu.usbserial-1110  flash')
#os.system('idf.py  -p /dev/cu.usbserial-1110  monitor')

