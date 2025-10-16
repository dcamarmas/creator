<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
                    Alejandro Calderon Mateos, Luis Daniel Casais Mezquida

This file is part of CREATOR.

CREATOR is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

CREATOR is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
-->

<!-- TODO: this whole thing needs to be redone... -->

<script lang="ts">
import { defineComponent } from "vue"

import { console_log, show_notification } from "@/web/utils.mjs"
import {
  hex2float,
  float2bin,
  bin2hex,
  hex2double,
  double2bin,
} from "@/core/utils/utils.mjs"
import { creator_ga } from "@/core/utils/creator_ga.mjs"

export default defineComponent({
  props: {
    id: { type: String, required: true },
  },

  data() {
    return {
      bits: 32,
      bits_options: [
        { text: "32 Bits", value: 32 },
        { text: "64 Bits", value: 64 },
      ],

      calculator: {
        bits: 32,
        hexadecimal: "",
        sign: "",
        exponent: "",
        mantissa: "",
        mantissaDec: 0,
        exponentDec: "",
        decimal: "",
        variant32: "primary",
        variant64: "outline-primary",
        lengthHexadecimal: 8,
        lengthSign: 1,
        lengthExponent: 8,
        lengthMantissa: 23,
      },
    }
  },

  methods: {
    getDebounceTime() {
      // Determines the refresh timeout depending on the device being used
      if (screen.width > 768) {
        return 500
      } else {
        return 1000
      }
    },

    /*Change bits of calculator*/
    changeBitsCalculator() {
      if (this.bits === 32) {
        this.calculator.bits = 32
        this.calculator.variant32 = "primary"
        this.calculator.variant64 = "outline-primary"
        this.calculator.lengthHexadecimal = 8
        this.calculator.lengthSign = 1
        this.calculator.lengthExponent = 8
        this.calculator.lengthMantissa = 23
      }
      if (this.bits === 64) {
        this.calculator.bits = 64
        this.calculator.variant64 = "primary"
        this.calculator.variant32 = "outline-primary"
        this.calculator.lengthHexadecimal = 16
        this.calculator.lengthSign = 1
        this.calculator.lengthExponent = 11
        this.calculator.lengthMantissa = 52
      }
      this.calculator.hexadecimal = ""
      this.calculator.sign = ""
      this.calculator.exponent = ""
      this.calculator.mantissa = ""
      this.calculator.decimal = ""
      this.calculator.sign = ""
      this.calculator.exponentDec = ""
      this.calculator.mantissaDec = 0
    },

    /*Calculator functionality*/
    // eslint-disable-next-line max-lines-per-function
    calculatorFunct(index: number) {
      let float
      let binary

      switch (index) {
        case 0:
          console_log(
            this.calculator.hexadecimal.padStart(this.calculator.bits / 4, "0"),
          )
          const hex = this.calculator.hexadecimal.padStart(
            this.calculator.bits / 4,
            "0",
          )

          if (this.calculator.bits === 32) {
            const re = /[0-9A-Fa-f]{8}/g
            if (!re.test(hex)) {
              show_notification("Character not allowed", "danger")

              this.calculator.sign = ""
              this.calculator.exponent = ""
              this.calculator.mantissa = ""
              this.calculator.exponentDec = ""
              this.calculator.mantissaDec = 0
              this.calculator.decimal = ""

              return
            }

            float = hex2float("0x" + hex)
            console_log(hex2float("0x" + hex))
            binary = float2bin(float).padStart(this.calculator.bits, "0")

            this.calculator.decimal = float
            this.calculator.sign = binary.substring(0, 1)
            this.calculator.exponent = binary.substring(1, 9)
            this.calculator.mantissa = binary.substring(9, 32)
            this.calculator.exponentDec = parseInt(
              bin2hex(this.calculator.exponent),
              16,
            )
            this.calculator.mantissaDec = 0

            let j = 0
            for (let i = 0; i < this.calculator.mantissa.length; i++) {
              j--
              this.calculator.mantissaDec +=
                parseInt(this.calculator.mantissa.charAt(i), 10) * 2 ** j
            }

            /* Google Analytics */
            creator_ga("send", "event", "calculator.32.hex")
            creator_ga("send", "event", "calculator.32.0x" + hex)
          }
          if (this.calculator.bits === 64) {
            const re = /[0-9A-Fa-f]{16}/g
            if (!re.test(hex)) {
              show_notification("Character not allowed", "danger")

              this.calculator.sign = ""
              this.calculator.exponent = ""
              this.calculator.mantissa = ""
              this.calculator.exponentDec = ""
              this.calculator.mantissaDec = 0
              this.calculator.decimal = ""

              return
            }

            float = hex2double("0x" + hex)
            binary = double2bin(float)

            this.calculator.decimal = float
            this.calculator.sign = binary.substring(0, 1)
            this.calculator.exponent = binary.substring(1, 12)
            this.calculator.mantissa = binary.substring(12, 64)
            this.calculator.exponentDec = parseInt(
              bin2hex(this.calculator.exponent),
              16,
            )
            this.calculator.mantissaDec = 0

            let j = 0
            for (let i = 0; i < this.calculator.mantissa.length; i++) {
              j--
              this.calculator.mantissaDec +=
                parseInt(this.calculator.mantissa.charAt(i), 10) * 2 ** j
            }

            /* Google Analytics */
            creator_ga("send", "event", "calculator.64.hex")
            creator_ga("send", "event", "calculator.64.0x" + hex)
          }

          break
        case 1:
          if (this.calculator.bits === 32) {
            this.calculator.sign = this.calculator.sign.padStart(1, "0")
            this.calculator.exponent = this.calculator.exponent.padStart(8, "0")
            this.calculator.mantissa = this.calculator.mantissa.padStart(
              23,
              "0",
            )

            const binary =
              this.calculator.sign +
              this.calculator.exponent +
              this.calculator.mantissa
            console_log(binary)

            const re = /[0-1]{32}/g
            if (!re.test(binary)) {
              show_notification("Character not allowed", "danger")

              this.calculator.hexadecimal = ""
              this.calculator.decimal = ""
              this.calculator.exponentDec = ""
              this.calculator.mantissaDec = 0
              return
            }

            const float = hex2float("0x" + bin2hex(binary))
            const hexadecimal = bin2hex(binary)

            this.calculator.decimal = float
            this.calculator.hexadecimal = hexadecimal.padStart(
              this.calculator.bits / 4,
              "0",
            )
            this.calculator.exponentDec = parseInt(
              bin2hex(this.calculator.exponent),
              16,
            )
            this.calculator.mantissaDec = 0

            let j = 0
            for (let i = 0; i < this.calculator.mantissa.length; i++) {
              j--
              this.calculator.mantissaDec +=
                parseInt(this.calculator.mantissa.charAt(i), 10) * 2 ** j
            }

            /*Google Analytics*/
            creator_ga("send", "event", "calculator.32.bin")
            creator_ga("send", "event", "calculator.32." + binary)
          }
          if (this.calculator.bits === 64) {
            this.calculator.sign = this.calculator.sign.padStart(1, "0")
            this.calculator.exponent = this.calculator.exponent.padStart(
              11,
              "0",
            )
            this.calculator.mantissa = this.calculator.mantissa.padStart(
              52,
              "0",
            )

            const binary =
              this.calculator.sign +
              this.calculator.exponent +
              this.calculator.mantissa

            const re = /[0-1]{64}/g
            if (!re.test(binary)) {
              show_notification("Character not allowed", "danger")

              this.calculator.hexadecimal = ""
              this.calculator.decimal = ""
              this.calculator.exponentDec = parseInt(
                bin2hex(this.calculator.exponent),
                16,
              )
              this.calculator.mantissaDec = 0

              let j = 0
              for (let i = 0; i < this.calculator.mantissa.length; i++) {
                j--
                this.calculator.mantissaDec +=
                  parseInt(this.calculator.mantissa.charAt(i), 10) * 2 ** j
              }
              return
            }

            double = hex2double("0x" + bin2hex(binary))
            const hexadecimal = bin2hex(binary)

            this.calculator.decimal = double
            this.calculator.hexadecimal = hexadecimal.padStart(
              this.calculator.bits / 4,
              "0",
            )

            /*Google Analytics*/
            creator_ga("send", "event", "calculator.64.bin")
            creator_ga("send", "event", "calculator.64." + binary)
          }

          break
        case 2:
          if (this.calculator.decimal.indexOf(",") !== -1) {
            this.calculator.decimal = this.calculator.decimal.replace(",", ".")
          }

          float = parseFloat(this.calculator.decimal)
          let hexadecimal

          if (this.calculator.bits === 32) {
            hexadecimal = bin2hex(float2bin(float))
            binary = float2bin(float)

            console_log(hexadecimal)

            this.calculator.hexadecimal = hexadecimal.padStart(
              this.calculator.bits / 4,
              "0",
            )
            this.calculator.sign = binary.substring(0, 1)
            this.calculator.exponent = binary.substring(1, 9)
            this.calculator.mantissa = binary.substring(9, 32)
            this.calculator.exponentDec = parseInt(
              bin2hex(this.calculator.exponent),
              16,
            )
            this.calculator.mantissaDec = 0

            let j = 0
            for (let i = 0; i < this.calculator.mantissa.length; i++) {
              j--
              this.calculator.mantissaDec +=
                parseInt(this.calculator.mantissa.charAt(i), 10) * 2 ** j
            }

            /*Google Analytics*/
            creator_ga("send", "event", "calculator.32.dec")
            creator_ga(
              "send",
              "event",
              "calculator.32." + this.calculator.decimal,
            )
          }

          if (this.calculator.bits === 64) {
            hexadecimal = bin2hex(double2bin(float))
            binary = double2bin(float)

            this.calculator.hexadecimal = hexadecimal.padStart(
              this.calculator.bits / 4,
              "0",
            )
            this.calculator.sign = binary.substring(0, 1)
            this.calculator.exponent = binary.substring(1, 12)
            this.calculator.mantissa = binary.substring(12, 64)
            this.calculator.exponentDec = parseInt(
              bin2hex(this.calculator.exponent),
              16,
            )
            this.calculator.mantissaDec = 0

            let j = 0
            for (let i = 0; i < this.calculator.mantissa.length; i++) {
              j--
              this.calculator.mantissaDec +=
                parseInt(this.calculator.mantissa.charAt(i), 10) * 2 ** j
            }

            /* Google Analytics */
            creator_ga("send", "event", "calculator.64.dec")
            creator_ga(
              "send",
              "event",
              "calculator.64." + this.calculator.decimal,
            )
          }
          break
        default:
      }
    },
  },
})
</script>

<template>
  <b-modal :id="id" title="Floating Point Calculator" no-footer size="lg">
    <b-container fluid align-h="center" class="mx-0 px-0">
      <b-row
        cols-xl="2"
        cols-lg="2"
        cols-md="1"
        cols-sm="1"
        cols-xs="1"
        cols="1"
        align-h="center"
      >
        <b-col>
          <b-form-group v-slot="{ ariaDescribedby }">
            <b-form-radio-group
              class="w-100"
              v-model="bits"
              :options="bits_options"
              button-variant="outline-primary"
              size="sm"
              :aria-describedby="ariaDescribedby"
              name="radios-btn-default"
              buttons
              @input="changeBitsCalculator"
            />
          </b-form-group>
        </b-col>
      </b-row>
    </b-container>

    <b-container fluid align-h="start" class="mx-0 px-0">
      <b-row cols="1" align-h="start">
        <b-col lg="6" offset-lg="2" class="pt-3">
          <b-form-input
            class="form-control form-control-sm"
            v-model="calculator.hexadecimal"
            @change="calculatorFunct(0)"
            placeholder="Enter hexadecimal number"
            :maxlength="calculator.lengthHexadecimal"
            title="Hexadecimal"
          />
        </b-col>
      </b-row>
    </b-container>

    <b-container fluid align-h="start" class="mx-0 px-0">
      <b-row cols="1" align-h="start">
        <b-col lg="8" offset-lg="1" class="p-1">
          <b-img
            class="calculatorImg"
            src="@/web/assets/img/calculator.webp"
            fluid
            alt="calculator"
          />
        </b-col>
      </b-row>
    </b-container>

    <b-container fluid align-h="start" class="mx-0 px-0">
      <b-row cols="3" align-h="start">
        <b-col lg="1" cols="2" offset-lg="1" class="p-1">
          <b-form-input
            class="form-control form-control-sm"
            v-model="calculator.sign"
            @change="calculatorFunct(1)"
            placeholder="Enter sign"
            :maxlength="calculator.lengthSign"
            title="Sign"
          />
        </b-col>
        <b-col lg="3" cols="4" class="p-1">
          <b-form-input
            class="form-control form-control-sm"
            v-model="calculator.exponent"
            @change="calculatorFunct(1)"
            placeholder="Enter exponent"
            :maxlength="calculator.lengthExponent"
            title="Exponent"
          />
        </b-col>
        <b-col lg="4" cols="6" class="p-1">
          <b-form-input
            class="form-control form-control-sm"
            v-model="calculator.mantissa"
            @change="calculatorFunct(1)"
            placeholder="Enter mantissa"
            :maxlength="calculator.lengthMantissa"
            title="Mantisa"
          />
        </b-col>
      </b-row>
    </b-container>

    <b-container fluid align-h="start" class="mx-0 px-0 text-center">
      <b-row cols="4" align-h="start">
        <b-col lg="1" cols="2" offset-lg="1" class="p-1">
          <font-awesome-icon :icon="['fas', 'down-long']" class="p-1" />
          <br />
          <span class="h5">
            -1<sup>{{ calculator.sign }}</sup> *
          </span>
        </b-col>
        <b-col lg="3" cols="4" class="p-1">
          <font-awesome-icon :icon="['fas', 'down-long']" class="p-1" />
          <br />
          <span class="h5" v-if="calculator.bits == 32">
            2
            <sup v-if="calculator.exponent == '' || calculator.exponent != 0">
              {{ calculator.exponentDec }}-127
            </sup>
            <sup
              v-if="
                calculator.exponent !== '' &&
                calculator.exponent === 0 &&
                calculator.mantissa !== 0
              "
            >
              {{ calculator.exponentDec }}-126
            </sup>
            *
          </span>
          <span class="h5" v-if="calculator.bits === 64">
            2
            <sup v-if="calculator.exponent == '' || calculator.exponent != 0">
              {{ calculator.exponentDec }}-1023
            </sup>
            <sup
              v-if="
                calculator.exponent !== '' &&
                calculator.exponent === 0 &&
                calculator.mantissa !== 0
              "
            >
              {{ calculator.exponentDec }}-1022
            </sup>
            *
          </span>
        </b-col>
        <b-col lg="4" cols="6" class="p-1">
          <font-awesome-icon :icon="['fas', 'down-long']" />
          <br />
          <span class="h6"> {{ calculator.mantissaDec }} = </span>
        </b-col>
        <b-col lg="3" cols="12" class="pt-4">
          <b-form-input
            class="form-control form-control-sm"
            v-model="calculator.decimal"
            @change="calculatorFunct(2)"
            placeholder="Enter decimal number"
            title="Decimal"
          />
        </b-col>
      </b-row>
    </b-container>

    <b-container fluid align-h="center" class="mx-0 px-0">
      <b-row cols="1" align-h="center">
        <b-col class="pt-2">
          <b-button size="sm" variant="primary">Convert</b-button>
        </b-col>
      </b-row>
    </b-container>
  </b-modal>
</template>

<style lang="scss" scoped>
.calculatorImg {
  width: 100%;
}
</style>
