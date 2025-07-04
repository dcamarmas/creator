# AUX library to make .o object for arduino
.text
.global cr_ecall
cr_ecall:
    jr ra
.global cr_initArduino
cr_initArduino:
    jr ra
.global cr_digitalRead
cr_digitalRead:
    ret  
.globl cr_pinMode
cr_pinMode:
    ret
.globl cr_digitalWrite
cr_digitalWrite:
    ret 
#Analog
.globl cr_analogRead
cr_analogRead:
    ret
.globl cr_analogReadResolution
cr_analogReadResolution:
    ret
.globl cr_analogWrite
cr_analogWrite:
    ret               
# Maths
.globl cr_map
cr_map:
    jr ra
.globl cr_constrain
cr_constrain:
    jr ra
.globl cr_abs
cr_abs:
    ret
.globl cr_max    
cr_max:           
    jr ra
.globl cr_min    
cr_min:
    jr ra
.globl cr_pow                       
cr_pow:
   jr ra
.globl cr_bit
cr_bit:
    ret
.globl cr_bitClear    
cr_bitClear:
    ret
.globl cr_bitRead
cr_bitRead:
    ret
.globl cr_bitSet
cr_bitSet:
    ret
.globl cr_bitWrite  
cr_bitWrite:
    ret
.globl cr_highByte    
cr_highByte: 
    ret 
.globl cr_lowByte     
cr_lowByte: 
    ret                        
# Float
.globl cr_sqrt
cr_sqrt:
    jr ra
.globl cr_sq  
cr_sq:
   jr ra
.globl cr_cos   
cr_cos:
   jr ra 
.globl cr_sin  
cr_sin:
   jr ra
.globl cr_tan 
cr_tan:
   jr ra
# Interrupts
.global cr_attachInterrupt
cr_attachInterrupt:
    ret
.global cr_detachInterrupt
cr_detachInterrupt:
    ret
.global cr_digitalPinToInterrupt
cr_digitalPinToInterrupt:
    ret
.global cr_pulseIn
cr_pulseIn:
    ret
.global cr_pulseInLong
cr_pulseInLong:
    ret
.global cr_shiftIn
cr_shiftIn:
    ret
.global cr_shiftOut
cr_shiftOut:
    ret                           
.globl cr_interrupts     
cr_interrupts:
    ret
.globl cr_nointerrupts      
cr_nointerrupts:
    ret     
# Characters
.globl cr_isDigit
cr_isDigit:
    ret      
.globl cr_isAlpha
cr_isAlpha:
    ret
.globl cr_isAlphaNumeric
cr_isAlphaNumeric:
    ret
.globl cr_isAscii
cr_isAscii:
    ret
.globl cr_isControl
cr_isControl: 
    ret 
.globl cr_isPunct
cr_isPunct: 
    ret
.globl cr_isHexadecimalDigit
cr_isHexadecimalDigit:
    ret    
.globl cr_isUpperCase
cr_isUpperCase:
    ret 
.globl cr_isLowerCase
cr_isLowerCase:
    ret               
.globl cr_isPrintable
cr_isPrintable:
    ret 
.globl cr_isGraph
cr_isGraph:
    ret
.globl cr_isSpace
cr_isSpace: 
    ret
.globl cr_isWhiteSpace
cr_isWhitespace:
    ret                                   
# Delay 
.globl cr_delay
cr_delay:
    jr ra             # Retorna al programa principal
.globl cr_delayMicroseconds
cr_delayMicroseconds:
    jr ra   
.globl cr_randomSeed
cr_randomSeed:
    jr ra             
.globl cr_random
cr_random:
    jr ra
.globl cr_serial_available
cr_serial_available:
    jr ra
.globl cr_serial_availableForWrite
cr_serial_availableForWrite:
    jr ra
.globl cr_serial_begin
cr_serial_begin:
    jr ra
.globl cr_serial_end
cr_serial_end: 
    jr ra
.globl cr_serial_find
cr_serial_find: 
    jr ra
.globl cr_serial_findUntil
cr_serial_findUntil: 
    jr ra 
.globl cr_serial_flush
cr_serial_flush:
    jr ra
.globl cr_serial_parseFloat
cr_serial_parseFloat: 
    jr ra
.globl cr_serial_parseInt
cr_serial_parseInt: 
    jr ra
.globl cr_serial_printf
cr_serial_printf:
    ret                       
.globl cr_serial_read
cr_serial_read: 
    ret    
.globl cr_serial_readBytes
cr_serial_readBytes: 
    ret
.global cr_serial_readBytesUntil    
cr_serial_readBytesUntil:
    jr ra
.global cr_serial_readString  
cr_serial_readString:
    jr ra
.global cr_serial_readStringUntil  
cr_serial_readStringUntil: 
    jr ra  
.global cr_serial_write    
cr_serial_write:
    jr ra      
       