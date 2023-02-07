<html>
 <h1 align="center">CREATOR (https://creatorsim.github.io/)</h1>
</html>


## CREATOR (creator.sh)


### Scripts for executing several assembly codes

* Example for executing RISC-V examples:
  ```bash
echo " RISC-V:"
RV_TEST="2 5 6"
for I in $RV_TEST;
do
  echo " * ./examples/riscv/example$I... "
  ./creator.sh -a ./architecture/RISC_V_RV32IMFD.json -s ./examples/RISCV/example"$I".txt
  echo ""
done
  ```


* Example for executing MIPS examples:
  ```bash
echo " MIPS examples:"
MIPS_TEST="2 3 4 5 6 7 8 11"
for I in $MIPS_TEST;
do
  echo " * ./examples/MIPS/example$I... "
  ./creator.sh -a ./architecture/MIPS_32.json -s ./examples/MIPS/example"$I".txt
  echo ""
done
  ```

