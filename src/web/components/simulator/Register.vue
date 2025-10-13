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

<script>
import { creator_ga } from "@/core/utils/creator_ga.mjs"

import { bi_BigIntTofloat, bi_BigIntTodouble } from "@/core/utils/bigint.mjs"
import {
  hex2float,
  hex2double,
  bin2hex,
  float2bin,
  float2int_v2,
  double2int_v2,
} from "@/core/utils/utils.mjs"

export default {
  props: {
    type: { type: String, required: true },
    register: { type: Object, required: true },
    double_precision_type: { type: [String, null], required: true },
    name_representation: { type: String, required: true },
    value_representation: { type: String, required: true },
  },

  emits: ["register-details"],

  data() {
    return {
      render: 0n, // dummy variable to force components with this as key to refresh
      glow: false, // whether the button is glowing or not
    }
  },

  computed: {
    popoverId() {
      return "popoverValueContent" + this.register.name[0]
    },

    reg_name() {
      switch (this.name_representation) {
        case "logical":
          return this.register.name[0]
        case "alias":
          if (typeof this.register.name[1] === "undefined") {
            return this.register.name[0]
          }

          return this.register.name
            .slice(1, this.register.name.length)
            .join(" | ")
        case "all":
          return this.register.name.join(" | ")

        default:
          return ""
      }
    },
  },

  methods: {
    creator_ga,

    refresh() {
      // refreshes children components with `:key="render"`
      this.render++
      // make it glow
      this.glow = true
      setTimeout(() => {
        this.glow = false
      }, 500)
    },

    // I'd like for this to be a computed property, but it won't work because
    // ✨ computed caching ✨
    reg_value() {
      let ret = this.show_value().toString()
      if (ret.length > 8) {
        ret = ret.slice(0, 8) + "..."
      }
      return ret
    },

    // TODO: move to utils
    is_positive(value, nbits) {
      return value.toString(2).padStart(nbits, "0").charAt(0) === "0"
    },

    show_value(representation = this.value_representation) {
      let ret

      switch (representation) {
        case "signed":
          if (this.type === "ctrl_registers" || this.type === "int_registers") {
            if (this.is_positive(this.register.value, this.register.nbits)) {
              ret = this.register.value.toString(10)
            } else {
              ret = (
                this.register.value - 2n ** BigInt(this.register.nbits)
              ).toString(10)
            }
          } else if (this.double_precision_type === null) {
            ret = float2int_v2(bi_BigIntTofloat(this.register.value))
          } else {
            ret = double2int_v2(bi_BigIntTodouble(this.register.value))
          }
          break

        case "unsigned":
          if (this.type === "ctrl_registers" || this.type === "int_registers") {
            ret = parseInt(this.register.value.toString(10), 10) >>> 0
          } else if (this.double_precision_type === null) {
            ret = float2int_v2(bi_BigIntTofloat(this.register.value)) >>> 0
          } else {
            ret = double2int_v2(bi_BigIntTodouble(this.register.value)) >>> 0
          }
          break

        case "ieee32":
          if (this.type === "ctrl_registers" || this.type === "int_registers") {
            ret = hex2float(
              "0x" + this.register.value.toString(16).padStart(8, "0"),
            )
          } else {
            ret = bi_BigIntTofloat(this.register.value)
          }
          break

        case "ieee64":
          if (this.type === "ctrl_registers" || this.type === "int_registers") {
            ret = hex2double(
              "0x" + this.register.value.toString(16).padStart(16, "0"),
            )
          } else {
            ret = bi_BigIntTodouble(this.register.value)
          }
          break

        case "hex":
          if (this.type === "ctrl_registers" || this.type === "int_registers") {
            ret = this.register.value
              .toString(16)
              .padStart(this.register.nbits / 4, "0")
              .toUpperCase()
          } else if (this.double_precision_type !== null) {
            ret = bin2hex(float2bin(bi_BigIntTofloat(this.register.value)))
          } else {
            ret = bin2hex(double2bin(bi_BigIntTodouble(this.register.value)))
          }
          break

        case "bin":
          if (this.type === "ctrl_registers" || this.type === "int_registers") {
            ret = this.register.value
              .toString(2)
              .padStart(this.register.nbits, "0")
          } else if (this.double_precision_type !== null) {
            ret = float2bin(bi_BigIntTofloat(this.register.value))
          } else {
            ret = double2bin(bi_BigIntTodouble(this.register.value))
          }
          break

        case "char":
          ret = String.fromCharCode(Number(this.register.value))

          break

        default:
          return "N/A"
      }

      if (this.double_precision_type === "linked") {
        ret = ret.toString()

        if (ret.length > 10) {
          return ret.slice(0, 8) + "..."
        }
      }

      return ret
    },
  },
}
</script>

<template>
  <b-button
    class="registers w-100 h-100"
    variant="outline-secondary"
    size="sm"
    :class="{ registers: !glow, 'registers-glow': glow }"
    :id="popoverId"
    :key="render"
    @click="
      () => {
        this.$emit('register-details', {
          name: this.register.name,
          type: this.type,
          hex: this.show_value('hex'),
          bin: this.show_value('bin'),
          signed: this.show_value('signed'),
          unsigned: this.show_value('unsigned'),
          char: this.show_value('char'),
          ieee32: this.show_value('ieee32'),
          ieee64: this.show_value('ieee64'),
        })
        creator_ga('data', 'data.view', 'data.view.registers_details')
      }
    "
  >
    <span class="text-truncate">{{ reg_name }}</span>
    &nbsp;
    <transition>
      <b-badge class="registerValue">
        {{ reg_value() }}
      </b-badge>
    </transition>
  </b-button>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/bootstrap";

.registers {
  background-color: #f8f9fa;
  font-size: 1.03em;
}

.registers-glow {
  background-color: #c2c2c2;
  font-size: 1.03em;
}

.registerValue {
  background-color: #ceecf5;
  color: black;
  font-family: monospace;
  font-weight: normal;
}

[data-bs-theme="dark"] {
  .registers {
    background-color: #343a40;
    color: $secondary;
  }

  .registers:hover {
    background-color: #4d5154;
  }

  .registers-glow {
    background-color: #4d5154;
  }
}
</style>
