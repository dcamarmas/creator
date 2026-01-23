ENTRY(_main)

MEMORY
{
  /* Definir la región de memoria para el código */
  text_mem (rx) : ORIGIN = 0x0000000000000000, LENGTH = 0x0000000000020000
  data_mem (rw) : ORIGIN = 0x0000000000020000, LENGTH = 0x00001FFFFFFE0000
  bss_mem  (rw) : ORIGIN = 0x0000400000000000, LENGTH = 0x0000200000000000
  heap_mem (rw) : ORIGIN = 0x0000600000000000, LENGTH = 0x0000200000000000
}

SECTIONS
{
  /* Sección de código de inicialización */
  .text.init : { *(.text.init) } > text_mem

  /* Alineación de la siguiente sección */
  . = ALIGN(0x1000);

  /* Sección .text desde 0x00000000 */
  .text : {
    *(.text)
  } > text_mem

  /* Sección .data desde 0x0000200000000000 */
  .data : {
    *(.data)
  } > data_mem

  /* Sección .bss desde 0x0000400000000000 */
  .bss : {
    *(.bss)

    /* tohost y fromhost ubicados dentro de la sección .bss */
    . = ALIGN(0x1000);   /* Alinear a 4 KB */
    PROVIDE(tohost = .); /* Marca la dirección de tohost */
    . += 8;              /* Reserva 8 bytes para tohost */
    PROVIDE(fromhost = .); /* Marca la dirección de fromhost */
    . += 8;              /* Reserva 8 bytes para fromhost */
  } > bss_mem

  /* Sección .heap desde 0x0000600000000000 */
  .heap : {
    *(.heap)
  } > heap_mem

  /* Marca el final del programa */
  _end = .;
}
