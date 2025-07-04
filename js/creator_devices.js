/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos,
 *  Luis Daniel Casais Mezquida
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* DEVICES */

/**
 * A CREATOR device.
 *
 * @field {number} ctrl_addr: Address of the control register.
 * @field {number} status_addr: Address of the status register.
 * @field {Object} data: Device data range.
 * @field {number} data.start: Address of the start of the data range.
 * @field {number} data.end: Address of the end of the data range.
 * @field {boolean} [enabled=true]: Status of the device.
 *
 * @method callback: Function defining the behaviour of the device.
 *
 */
class Device {
    constructor({
        ctrl_addr,
        status_addr,
        data: { start, end },
        enabled = true,
    }) {
        this.ctrl_addr = ctrl_addr;
        this.status_addr = status_addr;
        this.data = { start: start, end: end };
        this.enabled = enabled;
    }

    /**
     * Checks whether the specified address belongs to the device.
     *
     * @param {number} addr - Address to check.
     *
     * @return {boolean} `true` if it belongs to the device, else `false`.
     *
     */
    isDeviceAddr(addr) {
        return (
            addr === this.ctrl_addr ||
            addr === this.status_addr ||
            (this.data.start <= addr && addr < this.data.end)
        );
    }

    /**
     * Resets the device by setting the control register to 0.
     *
     */
    reset() {
        writeMemory(0, this.ctrl_addr, 'w');
    }

    /**
     * Called once per cycle, if the device is enabled, defines the behaviour
     * of the device.
     *
     */
    handler() {}
}

/**
 * A device for interacting with the CREATOR console.
 *
 */
class ConsoleDevice extends Device {
    /**
     * Performs a generic console write.
     *
     * @param {string} type - Datatype to write.
     *
     */
    #write(data_addr, type) {
        creator_ga(
            'execute',
            'execute.syscall',
            'execute.syscall.print_' + type
        ); // google analytics

        display_print(full_print(readMemory(data_addr, type), null, false));
    }

    /**
     * Performs actions to prepare a console read.
     *
     * @param {string} type - Datatype to read.
     *
     */
    #prepareRead(type) {
        creator_ga(
            'execute',
            'execute.syscall',
            'execute.syscall.read_' + type
        ); // google analytics

        // scroll into keyboard input
        if (typeof document != 'undefined') {
            document.getElementById('enter_keyboard').scrollIntoView();
        }

        // stop program to wait for read
        run_program = 3;
    }

    handler() {
        switch (capi_mem_read(this.ctrl_addr, 'w')) {
            case 1: // print int
                this.#write(this.data.start, 'int');
                break;

            case 2: // print float
                this.#write(this.data.start, 'float');
                break;

            case 3: // print double
                this.#write(this.data.start, 'double');
                break;

            case 4: // print string
                this.#write(readMemory(this.data.start, 'w'), 'string');
                break;

            case 5: // read int
                this.#prepareRead('int');

                keyboard_read((keystroke, params) =>
                    writeMemory(
                        parseInt(keystroke, 10),
                        this.data.start,
                        'integer'
                    )
                ); // it's ugly, I know, but the alternative is rewriting the function

                break;

            case 6: // read float
                this.#prepareRead('float');

                keyboard_read((keystroke, params) =>
                    writeMemory(
                        parseInt(float2bin(parseFloat(keystroke)), 2),
                        this.data.start,
                        'float'
                    )
                );

                break;

            case 7: // read double
                this.#prepareRead('double');

                keyboard_read((keystroke, params) =>
                    writeMemory(
                        parseInt(double2bin(parseFloat(keystroke)), 2),
                        this.data.start,
                        'double'
                    )
                );

                break;

            case 8: {
                // read string
                this.#prepareRead('string');

                // get string addr & max length
                let addr = readMemory(this.data.start, 'word');
                let lenght = readMemory(
                    this.data.start + word_size_bytes,
                    'word'
                );

                // read & store in specified addr
                keyboard_read(
                    (keystroke, params) => {
                        writeMemory(
                            keystroke.slice(0, lenght),
                            params.addr,
                            'string'
                        );
                    },
                    {
                        // params
                        lenght: length,
                        addr: addr,
                    }
                );

                break;
            }

            case 11: // print char
                this.#write(this.data.start, 'char');
                break;

            case 12: // read char
                this.#prepareRead('char');

                keyboard_read((keystroke, params) =>
                    writeMemory(keystroke, this.data.start, 'char')
                );

                break;
        }

        this.reset();
    }
}

class OSDriver extends Device {
    handler() {
        switch (capi_mem_read(this.ctrl_addr, 'w')) {
            case 9: {
                // sbrk
                creator_ga(
                    'execute',
                    'execute.syscall',
                    'execute.syscall.sbrk'
                ); // google analytics

                // get size
                let size = readMemory(this.data.start, 'integer');
                if (size < 0) {
                    throw packExecute(
                        true,
                        'capi_syscall: negative size',
                        'danger',
                        null
                    );
                }

                // malloc
                let addr = creator_memory_alloc(size);

                // save addr
                writeMemory(addr, this.data.start, 'word');

                break;
            }

            case 10: // exit
                capi_exit();

                break;
        }

        this.reset();
    }
}

// { <id>: Device, ...}
const devices = {
    // TODO: use BigInt
    console: new ConsoleDevice({
        ctrl_addr: 0xf0000000,
        status_addr: 0xf0000004,
        data: {
            start: 0xf0000008,
            end: 0xf000000f,
        },
        enabled: true,
    }),
    os: new OSDriver({
        ctrl_addr: 0xf0000010,
        status_addr: 0xf0000014,
        data: {
            start: 0xf0000018,
            end: 0xf000001f,
        },
        enabled: true,
    }),
};

/* Memory */

/**
 * Checks if an address is a device address.
 *
 * @param {number} addr - Address to check.
 *
 * @return {string, null} ID of the device that the address belongs to, else `null`.
 */
function checkDeviceAddr(addr) {
    // TODO: precompute this???
    for (const [id, device] of Object.entries(devices)) {
        if (!device.enabled) continue;

        if (device.isDeviceAddr(addr)) return id;
    }

    return null;
}

/* Handlers */

/**
 * 'Wakes up' a device, by executing its callback function.
 *
 * @param {string} id - ID of the device.
 *
 */
function wakeDevice(id) {
    if (devices[id].enabled) devices[id].handler();
}

/**
 * Calls all the devices' handlers.
 *
 * @param {string} id - ID of the device.
 *
 */

function handleDevices() {
    for (const device of Object.values(devices)) {
        if (device.enabled) device.handler();
    }
}
