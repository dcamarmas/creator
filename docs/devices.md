# Devices in CREATOR
Devices in CREATOR simulate the behavior of different components that the simulator can interact with, e.g. a terminal, a hard drive, etc.

The code interacts with a device through the program memory, a device specifies a set of "special" memory addresses that can be read and written by both the code and the device.

Devices are implemented in [`core/executor/devices.mts`](../src/core/executor/devices.mts).



## Device definition
A device is defined by the following:
- An identifier (`id`), which uniquely identifies the device.
- A _control register address_ (`ctrl_addr`), which is typically used by the processor to signal an action to perform on the device.
- A _status register address_ (`status_addr`), which is typically used by the device to signal its status to the processor.
- A _data range_ (`data`), which defines a section of memory (`start` and `end`) that is shared between the processor and the device, typically for the exchange of data.
- A _handler function_ (`handler()`), which is called once per cycle, and defines the behavior of the device.
- An _enabled_ flag (`enabled`), which controls whether the device is enabled or not. If it's not, the callback is not called.

To create a new device, create a new class extending `Device` and implementing its `handler` method. Then, instantiate that object and add it to `devices` with its corresponding ID.



## Device handling
After executing each instruction, the executor calls `handleDevices()`, which executes the handlers for all enabled devices.

Typically, a device reads its control register and checks its value. If it's `0`, it exits. If it's not, it works with the other data and clears the control register when it ends by calling `reset()`.



## Implemented devices

### `ConsoleDevice`
A device for interacting with CREATOR's console.

Depending on the value stored in the control register (`ctrl_addr`), it executes one of the following:
- `1` - _print int_: Reads a word from the `data.start` address and writes it as an integer value in the console.
- `2` - _print float_: Reads a word from the `data.start` address and writes it as a float value in the console.
- `3` - _print double_: Reads a word from the `data.start` address and writes it as a float value in the console.
- `4` - _print string_: Reads the main memory address of a string from the `data.start` address and writes it in the console.
- `5` - _read int_: Reads an integer from the console and stores it as a word in `data.start`.
- `6` - _read float_: Reads a float from the console and stores it as a word in `data.start`.
- `7` - _read double_: Reads a double from the console and stores it as a word in `data.start`.
- `8` - _read string_: Reads a string from the console of the length specified in `data.start + 4` and stores it in the main memory address specified in `data.start`.
- `11` - _print char_: Reads a byte from the `data.start` address and writes it as a char in the console.
- `12` - _read char_: Reads a char from the console and stores it as a byte in `data.start`.

#### Memory addresses
- `ctrl_addr`: `0xf0000000`
- `status_addr`: `0xf0000004`
- `data`:
    - `start`: `0xf0000008`
    - `end`: `0xf000000f`


### `OSDriver`
A device to simulate system calls to a fictitious "Operating System".

Depending on the value stored in the control register (`ctrl_addr`), it executes one of the following:
- `9` - _sbrk_: Allocates a segment of main memory of the size specified in `data.start` and stores its address in `data.start`.
- `10` - _exit_: Terminates the current program's execution.

#### Memory addresses
- `ctrl_addr`: `0xf0000010`
- `status_addr`: `0xf0000014`
- `data`:
    - `start`: `0xf0000018`
    - `end`: `0xf000001f`