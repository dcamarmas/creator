ENTRY(_main)

MEMORY
{
  /* Definir la región de memoria para el código */
  text_mem  (rx) : ORIGIN = 0x80000000, LENGTH = 0x4000
  data_mem  (rw) : ORIGIN = 0x80004000, LENGTH = 0x2000
  bss_mem   (rw) : ORIGIN = 0x80006000, LENGTH = 0x3000
  heap_mem  (rw) : ORIGIN = 0x80009000, LENGTH = 0x1000
  stack_mem (rw) : ORIGIN = 0x8000A000, LENGTH = 0x1000
}



SECTIONS
{
  /* Sección de código de inicialización */
  .text.init : { *(.text.init) } > text_mem

  /* Alineación de la siguiente sección */
  . = ALIGN(0x1000);

  /* Sección .text desde 0x80000000 */
  .text : {
    *(.text)
  } > text_mem

  /* Sección .data desde 0x80001000 */
  .data : {
    *(.data)
  } > data_mem

  /* Sección .bss desde 0x80002000 */
  .bss : {
    *(.bss)

    /* tohost y fromhost ubicados dentro de la sección .bss */
    . = ALIGN(0x1000);   /* Alinear a 4 KB */
    PROVIDE(tohost = .); /* Marca la dirección de tohost */
    . += 8;              /* Reserva 8 bytes para tohost */
    PROVIDE(fromhost = .); /* Marca la dirección de fromhost */
    . += 8;              /* Reserva 8 bytes para fromhost */
  } > bss_mem

  /* Sección .heap desde 0x80005000 */
  .heap : {
    *(.heap)
  } > heap_mem

  /* Seccion .stack desde 0x80006000 */
  .stack : {
    . = ALIGN(16);
    _stack_top = .;
    . += LENGTH(stack_mem);
    _stack_bottom = .;
  } > stack_mem


  /* Marca el final del programa */
  _end = .;
}
