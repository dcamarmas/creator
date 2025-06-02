/* filepath: /Users/jorge/clones/creatorV/tests/arch/riscv/correct/compliant/riscv.ld */
OUTPUT_ARCH("riscv")
ENTRY(_start)

MEMORY
{
  /* Memory layout matching the JSON configuration */
  text_mem (rx)  : ORIGIN = 0x00000000, LENGTH = 0x00200000 /* 2MB */
  data_mem (rw)  : ORIGIN = 0x00200000, LENGTH = 0x059BFCC0 /* ~90MB */
  stack_mem (rw) : ORIGIN = 0x0FFFFFF0, LENGTH = 0x00000010 /* 16B, just for the pointer */
}

SECTIONS
{
  /* .text section - program code */
  .text : {
    *(.text.init)
    *(.text)
    *(.text.*)
  } > text_mem

  /* .rodata section - read-only data */
  .rodata : {
    *(.rodata)
    *(.rodata.*)
  } > data_mem

  /* .data section - initialized data */
  .data : {
    *(.data)
    *(.data.*)
  } > data_mem

  /* .bss section - uninitialized data */
  .bss : {
    *(.bss)
    *(.bss.*)
    *(COMMON)
  } > data_mem

  /* Stack pointer - set to the top of memory */
  PROVIDE(sp = 0x0FFFFFFC);
}