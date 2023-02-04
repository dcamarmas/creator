<html>
 <h1 align="center">CREATOR (https://creatorsim.github.io/)</h1>
</html>


## CREATOR instruction description API (CAPI)


### Exceptions

* capi_raise (msg) &rarr; Show an error message.
  ```javascript
  capi_raise('Problem detected :-(') ;
  ```

* capi_arithmetic_overflow ( op1, op2, res_u ) &rarr; Checks if there is some arithmetic overflow.
  ```javascript
  var isover = capi_arithmetic_overflow(rs1, inm, rs1+inm);
  if (isover)
       { capi_raise('Integer Overflow'); }
  else { rd = rs1 + inm; }
  ```

* capi_bad_align ( addr, type ) &rarr; Checks if address is aligned for this architecture.
  ```javascript
  var isnotalign = capi_bad_align(rs1+inm, 'd');
  if (isnotalign) { capi_raise('The memory must be align'); }
  ```


### Memory access

* capi_mem_write ( destination_address, value2store, byte_or_half_or_word, reg_name ) &rarr; Store a value into an address.
  ```javascript
  capi_mem_write(base+off+4, val, 'w', rt_name);
  ```

* capi_mem_read ( source_address, byte_or_half_or_word, reg_name ) &rarr; Read a value from an address.
  ```javascript
  capi_mem_read(0x12345, 'b', rt_name) ;
  ```


### Syscalls

* capi_exit () &rarr; System call to stop the execution.

* capi_print_int ( register_id ) &rarr; System call for printing an integer.

* capi_print_float ( register_id ) &rarr; System call for printing a float.

* capi_print_double ( register_id ) &rarr; System call for printing a double.

* capi_print_char ( register_id ) &rarr; System call for printing a char.

* capi_print_string ( register_id ) &rarr; System call for printing a string.

* capi_read_int ( register_id ) &rarr;  System call for reading an integer.

* capi_read_float ( register_id ) &rarr; System call for reading a float.

* capi_read_double ( register_id ) &rarr; System call for reading a double.

* capi_read_char ( register_id ) &rarr; System call for reading a char.

* capi_read_string ( register_id, register_id_2 ) &rarr; System call for reading a string.

* capi_sbrk ( value1, value2 ) &rarr; System call for allocating memory.

* capi_get_clk_cycles ( ) &rarr; Get CLK Cylces.
  
#### Syscall examples (ecall RISC-V)  
  
  ```javascript
  switch(a7) {
    case 1:  capi_print_int('a0');
             break;
    case 2:  capi_print_float('fa0');
             break;
    case 3:  capi_print_double('fa0');
             break;
    case 4:  capi_print_string('a0');
             break;
    case 5:  capi_read_int('a0');
             break;
    case 6:  capi_read_float('fa0');
             break;
    case 7:  capi_read_double('fa0');
             break;
    case 8:  capi_read_string('a0', 'a1');
             break;
    case 9:  capi_sbrk('a0', 'a0');
             break;
    case 10: capi_exit();
             break;
    case 11: capi_print_char('a0');
             break;
    case 12: capi_read_char('a0');
             break;
  }
  ```


### Check stack

* capi_callconv_begin ( addr ) &rarr; Save current state at the CPU that must be preserved by calling convention.
  ```javascript
  capi_callconv_begin(inm)
  ```

* capi_callconv_end () &rarr; Checks if the current state at the CPU is the same as when capi_callconv_begin was called.
  ```javascript
  capi_callconv_end();
  ```


### Draw stack

* capi_drawstack_begin ( addr ) &rarr; It updates in the User Interface the current stack trace.
  ```javascript
  capi_drawstack_begin(inm);
  ```

* capi_drawstack_end () &rarr; It updates in the User Interface the current stack trace.
  ```javascript
  capi_drawstack_end() ;
  ```


### Representation

* capi_int2uint ( value ) &rarr; Signed integer to unsigned integer
  ```javascript
  capi_int2uint(5) ;
  ```

* capi_uint2int ( value ) &rarr; Unsigned integer to signed integer.
  ```javascript
  capi_uint2int(5) ;
  ```
  
* capi_uint2float32 ( value ) &rarr; Unsigned integer to simple precision IEEE754.
  ```javascript
  capi_uint2float32(5) ;
  ```
  
* capi_float322uint ( value ) &rarr; Simple precision IEEE754 to unsigned integer.
  ```javascript
  capi_float322uint(5) ;
  ```
  
* capi_uint2float64 ( value0, value1 ) &rarr; Unsigned integer to double precision IEEE754.
  ```javascript
  capi_uint2float64 ( value0, value1 )
  ```

* capi_float642uint ( value ) &rarr; Double precision IEEE754 to unsigned integer.
  ```javascript
  capi_float642uint(5) ;
  ```
  
* capi_float2bin ( f ) &rarr; Simple precision IEEE754 to binary.
  ```javascript
  capi_float2bin(5) ;
  let a = capi_float2bin(rs1);
  ```
  
* capi_split_double ( reg, index ) &rarr; Given a double precision IEEE 754 value, get the 32-bits most significant (index=1) bits or the least significant bits (index=0).
  ```javascript
  var val = capi_split_double(ft, 0);
  ```

* capi_check_ieee ( sign, exponent, mantissa ) &rarr; Indicates the type of an IEEE value:
  * 0 &rarr; -infinite
  * 1 &rarr; -normalized number
  * 2 &rarr; -non-normalized number
  * 3 &rarr; -0
  * 4 &rarr; +0
  * 5 &rarr; +normalized number
  * 6 &rarr; +non-normalized number
  * 7 &rarr; +inf
  * 8 &rarr; -NaN
  * 9 &rarr; +NaN
  
  <br />
  
  ```javascript
  rd = capi_check_ieee(parseInt(a[0]), parseInt(a.slice(1,9), 2), parseInt(a.slice(10), 2));
  ```



