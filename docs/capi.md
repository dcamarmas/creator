<html>
 <h1 align="center">CREATOR (https://creatorsim.github.io/)</h1>
</html>


## CREATOR instruction description API (CAPI)


### Exceptions

* capi_raise(msg) &rarr; Show a error message.
  ```javascript
  capi_raise('Problem detected :-(') ;
  ```

* capi_arithmetic_overflow ( op1, op2, res_u ) &rarr; Checks if there is some arithmetic overflow (result 30 is not in range).
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

* capi_mem_write ( destination_address, value2store, byte_or_half_or_word ) &rarr; Store a value into an address.
  ```javascript
  capi_mem_write(base+off+4, val, 'w');
  ```

* capi_mem_read ( source_address, byte_or_half_or_word ) &rarr; Read a value from an address
  ```javascript
  capi_mem_read(0x12345, 'b') ;
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

* capi_get_power_consumption ( ) &rarr; Get power consumption.
  
#### Syscall examples (ecall RISC-V)  
  
  ```javascript
  switch(a7){
    case 1:
    capi_print_int('a0');
    break;
    case 2:
    capi_print_float('fa0');
    break;
    case 3:
    capi_print_double('fa0');
    break;
    case 4:
    capi_print_string('a0');
    break;
    case 5:
    capi_read_int('a0');
    break;
    case 6:
    capi_read_float('fa0');
    break;
    case 7:
    capi_read_double('fa0');
    break;
    case 8:
    capi_read_string('a0', 'a1');
    break;
    case 9:
    capi_sbrk('a0', 'a0');
    break;
    case 10:
    capi_exit();
    break;
    case 11:
    capi_print_char('a0');
    break;
    case 12:
    capi_read_char('a0');
    break;
  }
  ```


### Check stack

* capi_callconv_begin ( addr ) &rarr; Description.
  ```javascript
  capi_callconv_begin(inm)
  ```

* capi_callconv_end () &rarr; Description.
  ```javascript
  capi_callconv_end();
  ```

* capi_callconv_memAction ( action, addr, reg_name, type ) &rarr; Description.
  ```javascript
  capi_callconv_memAction('write', base+off, ft_name, 'd');
  ```


### Draw stack

* capi_drawstack_begin ( addr ) &rarr; Description.
  ```javascript
  capi_drawstack_begin(inm);
  ```

* capi_drawstack_end () &rarr; Description.
  ```javascript
  capi_drawstack_end() ;
  ```


### Representation

* capi_split_double ( reg, index ) &rarr; Description.
  ```javascript
  var val = capi_split_double(ft, 0);
  ```

* capi_uint2float32 ( value ) &rarr; Description.
  ```javascript
  capi_uint2float32(5) ;
  ```

* capi_float322uint ( value ) &rarr; Description.
  ```javascript
  capi_float322uint(5) ;
  ```

* capi_int2uint ( value ) &rarr; Description.
  ```javascript
  capi_int2uint(5) ;
  ```

* capi_uint2int ( value ) &rarr; Description.
  ```javascript
  capi_uint2int(5) ;
  ```

* capi_uint2float64 ( value0, value1 ) &rarr; Description.
  ```javascript
  capi_uint2float64 ( value0, value1 )
  ```

* capi_float642uint ( value ) &rarr; Description.
  ```javascript
  capi_float642uint(5) ;
  ```

* capi_check_ieee ( s, e, m ) &rarr; Description.
  ```javascript
  rd = capi_check_ieee(parseInt(a[0]), parseInt(a.slice(1,9), 2), parseInt(a.slice(10), 2));
  ```

* capi_float2bin ( f ) &rarr; Description.
  ```javascript
  capi_float2bin(5) ;
  let a = capi_float2bin(rs1);
  ```

