
# CREATOR instruction description API (CAPI)


## Exceptions

* capi_raise(msg)
  ```javascript
  capi_raise('problem detected: ') ;
  ```
  ** Show a error message.

* capi_arithmetic_overflow ( op1, op2, res_u )
  ```javascript
  capi_arithmetic_overflow(10, 20, 30) ;
  ```
  ** Checks if there is some arithmetic overflow (result 30 is not in range).

* capi_bad_align ( addr, type )
  ```javascript
  capi_bad_align(0x12345, 'b') ;
  ```
  ** Checks if address is aligned for this architecture.


## Memory access

* capi_mem_write ( destination_address, value2store, byte_or_half_or_word )
  ```javascript
  capi_mem_write(0x12345, 100, 'b') ;
  ```
  ** Store a value into an address.

* capi_mem_read ( source_address, byte_or_half_or_word )
  ```javascript
  capi_mem_read(0x12345, 'b') ;
  ```
  ** Read a value from an address


## Syscalls

* capi_exit ()
  ```javascript
  capi_exit() ;
  ```
  ** System call to stop the execution.

* capi_print_int ( register_id )
  ```javascript
  capi_print_int(5) ;
  ```
  ** System call for printing an integer.

* capi_print_float ( register_id )
  ```javascript
  capi_print_float(5) ;
  ```
  ** System call for printing a float.

* capi_print_double ( register_id )
  ```javascript
  capi_print_double(5) ;
  ```
  ** System call for printing a double.

* capi_print_char ( register_id )
  ```javascript
  capi_print_char(2) ;
  ```
  ** System call for printing a char.

* capi_print_string ( register_id )
  ```javascript
  capi_print_string(2) ;
  ```
  ** System call for printing a string.

* capi_read_int ( register_id )
  ```javascript
  var n = capi_read_int(5) ;
  ```
  ** System call for reading an integer.

* capi_read_float ( register_id )
  ```javascript
  var n = capi_read_float(5) ;
  ```
  ** System call for reading a float.

* capi_read_double ( register_id )
  ```javascript
  var n = capi_read_double(5) ;
  ```
  ** System call for reading a double.

* capi_read_char ( register_id )
  ```javascript
  var n = capi_read_char(2) ;
  ```
  ** System call for reading a char.

* capi_read_string ( register_id, register_id_2 )
  ```javascript
  var n = capi_read_string(2, 3) ;
  ```
  ** System call for reading a string.

* capi_sbrk ( value1, value2 )
  ```javascript
  var n = capi_sbrk(2, 3) ;
  ```
  ** System call for allocating memory.

* capi_get_power_consumption ( )
  ```javascript
  var pw = capi_get_power_consumption() ;
  ```
  ** Get power consumption.


## Check stack

* capi_callconv_begin ( addr )
  ```javascript
  capi_callconv_begin ( addr )
  ```
  ** Description.

* capi_callconv_end ()
  ```javascript
  capi_callconv_end ()
  ```
  ** Description.

* capi_callconv_memAction ( action, addr, reg_name, type )
  ```javascript
  capi_callconv_memAction('read', 0x12345, 5, 'b') ;
  ```
  ** Description.


## Draw stack

* capi_drawstack_begin ( addr )
  ```javascript
  capi_drawstack_begin(0x12345) ;
  ```
  ** Description

* capi_drawstack_end ()
  ```javascript
  capi_drawstack_end() ;
  ```
  ** Description


## Representation

* capi_split_double ( reg, index )
  ```javascript
  capi_split_double(2, 1) ;
  ```
  ** Description

* capi_uint2float32 ( value )
  ```javascript
  capi_uint2float32(5) ;
  ```
  ** Description

* capi_float322uint ( value )
  ```javascript
  capi_float322uint(5) ;
  ```
  ** Description

* capi_int2uint ( value )
  ```javascript
  capi_int2uint(5) ;
  ```
  ** Description

* capi_uint2int ( value )
  ```javascript
  capi_uint2int(5) ;
  ```
  ** Description

* capi_uint2float64 ( value0, value1 )
  ```javascript
  capi_uint2float64 ( value0, value1 )
  ```
  ** Description

* capi_float642uint ( value )
  ```javascript
  capi_float642uint(5) ;
  ```
  ** Description

* capi_check_ieee ( s, e, m )
  ```javascript
  capi_check_ieee( s, e, m ) ;
  ```
  ** Description

* capi_float2bin ( f )
  ```javascript
  capi_float2bin(5) ;
  ```
  ** Description

