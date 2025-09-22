/*
 * SPDX-FileCopyrightText: 2015-2025 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Apache-2.0
 *  Panic handler wrapper in order to simulate ecalls in CREATOR using Espressif family
 *  Author: Elisa Utrilla Arroyo
 *  
 */


#include "riscv/rvruntime-frames.h"
#include "esp_private/panic_internal.h"
#include "esp_private/panic_reason.h"
#include "hal/wdt_hal.h"
#include "soc/timer_group_struct.h"
#include "soc/timer_group_reg.h"
#include "esp_rom_sys.h"
#include "esp_attr.h" 
#include <ctype.h>
#include "rom/uart.h"
#include "esp_task_wdt.h"

#define POOL_CAPACITY 65536  // 64 KB poolç
char memory_pool[POOL_CAPACITY];
int current_offset = 0;

void disable_all_hw_watchdogs() {
    // TG0
    TIMERG0.wdtwprotect.val = 0x50D83AA1;
    TIMERG0.wdtconfig0.val = 0;
    TIMERG0.wdtwprotect.val = 0;

    // TG1
    TIMERG1.wdtwprotect.val = 0x50D83AA1;
    TIMERG1.wdtconfig0.val = 0;
    TIMERG1.wdtwprotect.val = 0;
}

extern void esp_panic_handler(panic_info_t *info);
volatile bool g_override_ecall = true;

void __real_esp_panic_handler(panic_info_t *info);


void return_from_panic_handler(RvExcFrame *frm) __attribute__((noreturn));
// -------------Read int from UART0
static char buffer_int[16];
static int idx = 0;

int read_buffer_int(){
    unsigned char c = '\0';

    uart_rx_one_char(&c);
    //Is an space?? Finish it!!
        if (c == '\n' || c == '\r') {
            buffer_int[idx++] = '\0';
            esp_rom_printf("\n"); //echo
            if (idx > 0) //Buffer has things
            {
                idx = 0;
                return 0;
            }
            else{   return -1;  }
            
        }
    //Number: wait until another num comes up OR a \n
        if (isdigit(c)) {
            if (idx < sizeof(buffer_int) - 1) {  
                buffer_int[idx] = c;
                esp_rom_printf("%c", c);
                idx++;
                return -1;
            }
        }
    //TODO: Protocol for char instead of number
        
        return -1;
}
int read_int(){
    int value = 0;
    int i = -1;
    int sum = 0;
    while (i == -1){
        i =   read_buffer_int();
        if (i == -1){
            //
            for (int x =1;x< 1000; x++){
                sum ++;

            }
        }      
    }
    // Transform into number
    for (int z = 0; buffer_int[z] != '\0'; z++) {
            value = value * 10 + (buffer_int[z] - '0');
    }
    memset(buffer_int, 0, sizeof(buffer_int));  
    return value;

}
//------------- Read char from UART0
char read_buffer_char(){
    unsigned char c = '\0';
    //esp_rom_printf("Value: %c",c);

    uart_rx_one_char(&c);
    if (c != '\0') {
        esp_rom_printf("%c", c);
        return c;
    }
    else{ return '\0'; }
    
    return -1;
}

char read_char() {
    char value = '\0';
    int sum =0;
    while (value == '\0'){
        value =   read_buffer_char(); 
        if (value == '\0'){
            for (int x =1;x< 1000; x++){
                sum ++;

            }
        }
    }
    return value;
}
//------------- Read string from UART0
int read_buffer_string(char *dest, int length){
    unsigned char c = '\0';

    uart_rx_one_char(&c);
    //Is an space?? Finish it!!
    if (c == '\n' || c == '\r') {
        dest[idx++] = '\0';
        esp_rom_printf("\n"); //echo
        if (idx > 0 || idx >= length) //Buffer has things or surpass the length
        {
            idx = 0;
            return 0;
        }
        else{   return -1;  }
        
    }
    //Wait until another char comes
     if (c != '\0') {
        if (idx < length) {  
                dest[idx] = c;
                esp_rom_printf("%c", c);
                idx++;
                return -1;
        }
    }
    //TODO: Protocol for char instead of number
        
        return -1;
}

void read_string(char *dest, int length) {
    int value = 0;
    int i = -1;
    int sum = 0;
    while (i == -1){
        i =   read_buffer_string(dest,length);
        if (i == -1){
            //
            for (int x =1;x< 1000; x++){
                sum ++;

            }
        }      
    } 
}

IRAM_ATTR void __wrap_esp_panic_handler(panic_info_t *info)
{
    RvExcFrame *frm = (RvExcFrame *)info->frame;
    if ((frm->mcause == 0x0000000b || frm->mcause == 0x00000008) && g_override_ecall == true) { //Only catches Ecall syscalls
        disable_all_hw_watchdogs();
        int cause = frm->a7;
        //esp_rom_printf("Causa del panic (a7): %d\n", cause);
        switch (cause) {
            case 1: { //Print int
                int value = frm->a0;
                esp_rom_printf("%d\n", value);
                break;
            }
            case 2: { //Print float TODO
                esp_rom_printf("\033[1;31mFloat number operations not registered yet\033[0m\n");
                break;
            }
            case 3: { //Print double TODO
                esp_rom_printf("\033[1;31mDouble number operations not registered yet\033[0m\n");
                break;
            }
            case 4: { //Print string
                char* cadena = (char*) frm->a0;
                esp_rom_printf("%s\n", cadena);
                break;
            }
            case 5: { // Read int
                int number_read = read_int();
                frm->a0 = number_read;
                break;
            }
            case 6:{ // Read float TODO
                esp_rom_printf("\033[1;31mFloat number operations not registered yet\033[0m\n");
                break;
            }
            case 7:{  //Read double  TODO
                esp_rom_printf("\033[1;31mDouble number operations not registered yet\033[0m\n");
                break;
            }
            case 8:{ //Read string
                char* dest = (char*) frm->a0;
                int length = frm->a1; 
                read_string(dest,length);
                break;
            }
            case 9: {  // sbrk
                int increment = frm->a0;
                if (current_offset + increment > POOL_CAPACITY || current_offset + increment < 0) {
                    frm->a0 = -1; // Offlimits
                    esp_rom_printf("\033[31;1mSBRK: Memory exhausted\033[0m\n");
                } else {
                    char *prev_brk = &memory_pool[current_offset];
                    current_offset += increment;
                    frm->a0 = (int)prev_brk; 
                }
                break;
            }
            case 10: { //exit
                break;
            }
            case 11:{  //Print char
                char caract = (char) frm->a0;
                esp_rom_printf("%c\n", caract);
                break;
            } 
            case 12:{ //Read char
                char char_leido = read_char();
                frm->a0 = char_leido;
                break;
            }
            default:
                esp_rom_printf("Not an ecall registered\n");
                break;
        }


        //frm->mepc = frm->ra;
        if (cause == 10)
        {
            frm->mepc = frm->ra;
        }
        else
        {
            frm->mepc += 4;
        }
        
        return_from_panic_handler(frm);
    } else {
        __real_esp_panic_handler(info); //Other fatal errors are treated as usual
    }
}