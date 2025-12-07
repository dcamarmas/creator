# Managing interrupts in CREATOR

Interrupts are handled in the `execute_instruction()` function, after
fetching the instruction.
Interrupts are marked as enabled through the `interruptsEnabled`
flag in status, and checked through the `checkinterrupt()` function (which
uses the architecture-defined `check`).

When an interrupt is detected, and interrupts are enabled, the
`handleInterrupt()` function is executed. This function changes the
execution mode to `ExecutionMode.Kernel`, stores the `program_counter`
register in the `exception_program_counter` register, and jumps to the
interruption handler address obtained through the architecture-defined
`get_handler_addr`. Finally, it clears the interruption through the
architechitecture-defined `clear`.

The execution mode change is required for the execution of privileged
instructions (see [Privileged instructions in CREATOR](privileged.md)).


## Architecture definition
For interrupts to be managed correctly, the architecture definition file
must include the following properties:
- `interrupts.enabled: boolean`: Controls whether interrupts are enabled
by default.
- `interrupts.check: string`: JS code to be executed in order
to check whether an interrupt happened. It must return a
`InterruptType` (if an interrupt happened) or `null` (if it didn't).
- `interrupts.is_enabled: string`: JS code to be executed in order to
check whether interrupts are enabled.
- `interrupts.enable: string`: JS code to be executed in order
to enable interrupts.
- `interrupts.disable: string`: JS code to be executed in order
to disable interrupts.
- `interrupts.get_handler_addr: string`: JS code to be executed in order
to obtain the interrupt handler address.
- `interrupts.clear: string`: JS code to be executed in order
to clear an interrupt.
- `interrupts.create: (InterruptType) => null`: JS arrow
(lambda) function to be executed in order to set an interrupt given an
interrupt type.


## API

### Functions
The following functions, belonging to
[`core/executor/interrupts.mts`](../src/core/executor/interrupts.mts), were implemented:
- `enableInterrupts(null) -> null`: Enables interrupts by calling
`architecture.interrupts.enable`.
- `disableInterrupts(null) -> null`: Disables interrupts by calling
`architecture.interrupts.disable`.
- `checkInterrupt(null) -> null`: Checks whether interrupts are enabled
- `handleInterrupt(null) -> null`: Handles an interrupt.

### Enums
- `InterruptType`
    - `Software`
    - `Timer`
    - `External`
    - `EnvironmentCall`
- `ExecutionMode`
    - `User`
    - `Kernel`


### Variables
The variables that control the interrupts are stored in `core:status`:
- `status.interrupts_enabled: bool`: status of the interrupts.
- `status.execution_mode: ExecutionMode`: current execution mode.


## Example: Interrupts in RISC-V
An example of RISC-V with interruptions can be found in the
[`RISC_V_RV32IMFD_Interrupts.json`](../architecture/RISC_V_RV32IMFD_Interrupts.json)
file.

### Interrupt mechanism
In RISC-V, when an interrupt happens, a bit is set in the `MIP` (_Machine
Interrupt Pending_) control register.
Depending on the type of interrupt, it sets a different bit. For example:
- Bit `3` (`MSIP`) is set to indicate a _software_ interrupt
- Bit `11` (`MEIP`) is set to indicate an _external_ interrupt

Therefore, `check` must read these values in order to determine the
type of the interrupt.

Then, the value of the current instruction is stored in the `MEPC` control
register (tagged as `exception_program_counter`). The value for the interrupt
handler is stored in the `MTVEC` control register, where bits `1` and `0` (MODE)
determine the vector mode, and the rest of the register encodes the base address
(BASE).  
The different modes are:
- `0` (direct): All traps set `pc` to the base address
- `1` (vectored): Asynchronous interrupts set `pc` to $BASE+4\times cause$

Here we implemented the _direct_ mode, meaning that `MTVEC` holds `0x00000000`,
the address of the handler.

> [!NOTE]
> As we'll see in [Interrupt handling](#interrupt-handling), this requires the
> handling routine to be at the start of the text (`.text`) segment.
Also, the cause of the interrupt is stored in the `MCAUSE` (_Machine Cause_).
This control register is divided into bit `31`, which holds the interrupt type,
and the rest of the bits, each bit corresponding to a specific exception code.
Some of the most used are:
- `0`-`3` (`0x00000008`): Machine software interrupt
- `0`-`8` (`0x00000100`): Machine external interrupt - `1`-`11` (`0x80000800`):
Environment call from U-mode

Therefore, in the case of the `ecall` instruction, bit `3` of `MIP` and bit 8 of
`MCAUSE` are set.

### Interrupt enabling
The `MIE` control register is in charge, together with `MSTATUS`, of
enabling/disabling interrupt types. The types use the same bits as in the `MIP`
register.


### Interrupt handling
A full example of handling an environment call is provided in
[`examples/riscv-interrupts/ex0.s`](../examples/riscv-interrupts/ex0.s).

First, we need to talk about some new privileged instructions:

- `mret`: This instruction is used to return from an interrupt, which saves the
`MEPC` to the `PC`, clears the interrupt by clearing bits `3` and `11` in `MIP`,
and resetting `MCAUSE` to `0`. It also changes the execution mode back to
`ExecutionMode.User` (U-mode)
- `csrrw`: This instruction switches the values of a control register and a user
register. It's mainly used to store the values of user registers while handling
the interrupt, as we can't operate with control registers. The `MSCRATCH`
control register is provided in order to add an extra register.

Reference: [The RISC-V Instruction Set Manual Volume II: Privileged
Architecture](https://github.com/riscv/riscv-isa-manual/), chapters 3.1, 3.3.1
and 3.3.2.




### Implemented features
Here is the table of implemented RISC-V features:

| Chapter                                   | Feature                                                                   | Status             | Notes                                                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------- | :----------------: | ---------------------------------------------------------------------------------------------------------------------------- |
| I.7.1                                     | CSR Instructions                                                          | :white_check_mark: | Only `csrrw`, and without checking for register `x0`                                                                         |
| II.3.1.1 - II.3.1.5                       | Processor and ISA information (`misa`, `mvendorid`, etc.)                 | :x:                |                                                                                                                              |
| II.3.1.6                                  | `mstatus`/`mstatush`                                                      | :white_check_mark: | Only _Privilege and Global Interrupt-Enable_ (chapter II.3.1.6.1). Only `mstatus`, as only the 32-bit version is implemented |
| II.3.1.7, II.3.1.9, II.3.1.13 - II.3.1.16 | Interrupts (`mtvec`, `mip`, `mie`, `mscratch`, `mepc`, `mcause`)     | :white_check_mark: | No `mtval`                                                                                                                   |
| II.3.1.8                                  | Trap Delegation                                                           | :x:                |                                                                                                                              |
| II.3.1.10                                 | Hardware performance Monitor                                              | :x:                |                                                                                                                              |
| II.3.1.11 - II.3.1.12                     | Counters                                                                  | :x:                |                                                                                                                              |
| II.3.2.1 - II.3.3.2                       | Environmen Calls and Trap-return                                          | :white_check_mark: | Not breakpoints                                                                                                              |
| II.3.1.17 - II.3.2, II.3.6 - II.3.7       | Environment, Security and Memory                                          | :x:                |                                                                                                                              |
| II.10                                     | Supervisor-Level ISA                                                      | :x:                |                                                                                                                              |
| II.4 - II.9, II.11 - II.18                | Volume II Extensions                                                      | :x:                |                                                                                                                              |