/**
 * Copyright 2018-2026 CREATOR Team.
 *
 * This file is part of CREATOR.
 *
 * CREATOR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CREATOR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * MIPS-specific helper functions for floating point operations.
 * Provides utilities for handling double precision floating point registers
 * and conversions between register pairs and JavaScript numbers.
 */
export const ARCH = {
    /**
     * Validates that a register is even (required for double precision operations).
     * @param {string} regName - The register name (e.g., "f0", "f2")
     * @throws {Error} If the register is not even
     */
    validateEvenRegister(regName) {
        const regNumber = parseInt(regName.substring(1), 10);
        if (regNumber % 2 !== 0) {
            throw new Error(
                `The register ${regName} is not even, cannot be used for double precision operations.`,
            );
        }
    },

    /**
     * Reads a double precision floating point value from a register pair.
     * @param {string} regName - The base register name (must be even, e.g., "f0")
     * @returns {number} The JavaScript number representation of the double
     */
    readDouble(regName) {
        this.validateEvenRegister(regName);

        const regNumber = parseInt(regName.substring(1), 10);
        const highReg = regName;
        const lowRegName = "f" + (regNumber + 1);

        const highValue = CAPI.REG.read(highReg);
        const lowValue = CAPI.REG.read(lowRegName);

        return CAPI.FP.uint2float64(Number(lowValue), Number(highValue));
    },

    /**
     * Writes a double precision floating point value to a register pair.
     * @param {number} value - The JavaScript number to write
     * @param {string} regName - The base register name (must be even, e.g., "f0")
     */
    writeDouble(value, regName) {
        this.validateEvenRegister(regName);

        const regNumber = parseInt(regName.substring(1), 10);
        const highReg = regName;
        const lowRegName = "f" + (regNumber + 1);

        const resultParts = CAPI.FP.float642uint(value);
        CAPI.REG.write(BigInt(resultParts[1]), highReg);
        CAPI.REG.write(BigInt(resultParts[0]), lowRegName);
    },

    /**
     * Reads two double precision values from register pairs and returns them as an array.
     * @param {string} reg1Name - First register name (must be even)
     * @param {string} reg2Name - Second register name (must be even)
     * @returns {number[]} Array containing [value1, value2]
     */
    readDoublePair(reg1Name, reg2Name) {
        return [this.readDouble(reg1Name), this.readDouble(reg2Name)];
    },

    /**
     * Writes two double precision values to register pairs.
     * @param {number} value1 - First value to write
     * @param {number} value2 - Second value to write
     * @param {string} reg1Name - First register name (must be even)
     * @param {string} reg2Name - Second register name (must be even)
     */
    writeDoublePair(value1, value2, reg1Name, reg2Name) {
        this.writeDouble(value1, reg1Name);
        this.writeDouble(value2, reg2Name);
    },

    /**
     * Performs a binary operation on two double precision values.
     * Reads from source registers, applies the operation, and writes to destination register.
     * @param {string} destReg - Destination register name (must be even)
     * @param {string} src1Reg - First source register name (must be even)
     * @param {string} src2Reg - Second source register name (must be even)
     * @param {function} operation - Binary operation function (value1, value2) => result
     */
    binaryDoubleOperation(destReg, src1Reg, src2Reg, operation) {
        const [val1, val2] = this.readDoublePair(src1Reg, src2Reg);
        const result = operation(val1, val2);
        this.writeDouble(result, destReg);
    },

    /**
     * Performs a unary operation on a double precision value.
     * Reads from source register, applies the operation, and writes to destination register.
     * @param {string} destReg - Destination register name (must be even)
     * @param {string} srcReg - Source register name (must be even)
     * @param {function} operation - Unary operation function (value) => result
     */
    unaryDoubleOperation(destReg, srcReg, operation) {
        const value = this.readDouble(srcReg);
        const result = operation(value);
        this.writeDouble(result, destReg);
    },
};
