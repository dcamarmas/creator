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

  data() {
    return {
      render: 0n, // dummy variable to force components with this as key to refresh
      glow: false, // whether the button is glowing or not
    }
  },

  computed: {
    popover_id() {
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

  beforeUpdate() {
    // make it glow
    this.glow = true
    setTimeout(() => {
      this.glow = false
    }, 500)
  },

  methods: {
    refresh() {
      // refreshes children components with `:key="render"`
      this.render++
    },

    // I'd like for this to be a computed property, but it won't work because
    // ✨ computed caching ✨
    reg_value() {
      let ret = this.show_value(
        this.register,
        this.value_representation,
      ).toString()
      if (ret.length > 8) {
        ret = ret.slice(0, 8) + "..."
      }
      return ret
    },

    // TODO: move to utils
    is_positive(value, nbits) {
      return value.toString(2).padStart(nbits, "0").charAt(0) === "0"
    },

    // eslint-disable-next-line max-lines-per-function
    show_value(register, representation = this.value_representation) {
      let ret

      switch (representation) {
        case "signed":
          if (this.type === "ctrl_registers" || this.type === "int_registers") {
            if (this.is_positive(register.value, register.nbits)) {
              ret = register.value.toString(10)
            } else {
              ret = (register.value - BigInt(2 ** register.nbits)).toString(10)
            }
          } else {
            // ret = parseInt(register.value.toString(), 10) >> 0;
            if (this.double_precision_type === null) {
              ret = float2int_v2(bi_BigIntTofloat(register.value))
            } else {
              ret = double2int_v2(bi_BigIntTodouble(register.value))
            }
          }
          break

        case "unsigned":
          if (this.type === "ctrl_registers" || this.type === "int_registers") {
            ret = parseInt(register.value.toString(10), 10) >>> 0
          } else {
            //ret = parseInt(register.value.toString(), 10) >>> 0;
            if (this.double_precision_type === null) {
              ret = float2int_v2(bi_BigIntTofloat(register.value)) >>> 0
            } else {
              ret = double2int_v2(bi_BigIntTodouble(register.value)) >>> 0
            }
          }
          break

        case "ieee32":
          if (this.type === "ctrl_registers" || this.type === "int_registers") {
            ret = hex2float("0x" + register.value.toString(16).padStart(8, "0"))
          } else {
            ret = bi_BigIntTofloat(register.value)
          }
          break

        case "ieee64":
          if (this.type === "ctrl_registers" || this.type === "int_registers") {
            ret = hex2double(
              "0x" + register.value.toString(16).padStart(16, "0"),
            )
          } else {
            ret = bi_BigIntTodouble(register.value)
          }
          break

        case "hex":
          if (this.type === "ctrl_registers" || this.type === "int_registers") {
            ret = register.value
              .toString(16)
              .padStart(register.nbits / 4, "0")
              .toUpperCase()
          } else {
            if (this.double_precision_type !== null) {
              ret = bin2hex(float2bin(bi_BigIntTofloat(register.value)))
            } else {
              ret = bin2hex(double2bin(bi_BigIntTodouble(register.value)))
            }
          }
          break

        case "bin":
          if (this.type === "ctrl_registers" || this.type === "int_registers") {
            ret = register.value.toString(2).padStart(register.nbits, "0")
          } else {
            if (this.double_precision_type !== null) {
              ret = float2bin(bi_BigIntTofloat(register.value))
            } else {
              ret = double2bin(bi_BigIntTodouble(register.value))
            }
          }
          break

        case "char":
          ret = String.fromCharCode(Number(register.value))

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
    //Update a new register value
    // update_register(comp, elem, type, precision) {
    // for (let i = 0; i < architecture.components[comp].elements.length; i++) {
    //   if (type === "int_registers" || type === "ctrl_registers") {
    //     if (
    //       architecture.components[comp].elements[i].name === elem &&
    //       this.newValue.match(/^0x/)
    //     ) {
    //       const value = this.newValue.split("x")
    //       if (
    //         value[1].length * 4 >
    //         architecture.components[comp].elements[i].nbits
    //       ) {
    //         value[1] = value[1].substring(
    //           (value[1].length * 4 -
    //             architecture.components[comp].elements[i].nbits) /
    //             4,
    //           value[1].length,
    //         )
    //       }
    //       writeRegister(parseInt(value[1], 16), comp, i, "int_registers")
    //     } else if (
    //       architecture.components[comp].elements[i].name === elem &&
    //       this.newValue.match(/^(\d)+/)
    //     ) {
    //       writeRegister(parseInt(this.newValue, 10), comp, i, "int_registers")
    //     } else if (
    //       architecture.components[comp].elements[i].name === elem &&
    //       this.newValue.match(/^-/)
    //     ) {
    //       writeRegister(parseInt(this.newValue, 10), comp, i, "int_registers")
    //     }
    //   } else if (type === "fp_registers") {
    //     if (precision === false) {
    //       if (
    //         architecture.components[comp].elements[i].name === elem &&
    //         this.newValue.match(/^0x/)
    //       ) {
    //         writeRegister(hex2float(this.newValue), comp, i, "SFP-Reg")
    //       } else if (
    //         architecture.components[comp].elements[i].name === elem &&
    //         this.newValue.match(/^(\d)+/)
    //       ) {
    //         writeRegister(parseFloat(this.newValue, 10), comp, i, "SFP-Reg")
    //       } else if (
    //         architecture.components[comp].elements[i].name === elem &&
    //         this.newValue.match(/^-/)
    //       ) {
    //         writeRegister(parseFloat(this.newValue, 10), comp, i, "SFP-Reg")
    //       }
    //     } else if (precision === true) {
    //       if (
    //         architecture.components[comp].elements[i].name === elem &&
    //         this.newValue.match(/^0x/)
    //       ) {
    //         writeRegister(hex2double(this.newValue), comp, i, "DFP-Reg")
    //       } else if (
    //         architecture.components[comp].elements[i].name === elem &&
    //         this.newValue.match(/^(\d)+/)
    //       ) {
    //         writeRegister(parseFloat(this.newValue, 10), comp, i, "DFP-Reg")
    //       } else if (
    //         architecture.components[comp].elements[i].name === elem &&
    //         this.newValue.match(/^-/)
    //       ) {
    //         writeRegister(parseFloat(this.newValue, 10), comp, i, "DFP-Reg")
    //       }
    //     }
    //   }
    // }
    // this.newValue = ""
    // // Google Analytics
    // creator_ga("data", "data.change", "data.change.register_value")
    // creator_ga("data", "data.change", "data.change.register_value_" + elem)
    // },

    get_cols() {
      if (this.double_precision_type !== null) {
        return 3
      } else {
        return 2
      }
    },
    details_callback() {
      creator_ga("data", "data.view", "data.view.registers_details")
    },
  },
}
</script>

<template>
  <b-popover
    :click="true"
    :close-on-hide="false"
    :delay="{ show: 0, hide: 0 }"
    :key="render"
  >
    <template #target>
      <b-button
        class="registers w-100 h-100"
        variant="outline-secondary"
        size="sm"
        :class="{ registers: !glow, 'registers-glow': glow }"
        :id="popover_id"
        @click="details_callback"
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

    {{ register.name.join(" | ") }}

    <b-table-simple small responsive bordered>
      <b-tbody>
        <b-tr>
          <b-td>Hexadecimal</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ show_value(register, "hex") }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr>
          <b-td>Binary</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ show_value(register, "bin") }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr v-if="this.type !== 'fp_registers'">
          <b-td>Signed</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ show_value(register, "signed") }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr v-if="this.type !== 'fp_registers'">
          <b-td>Unsigned</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ show_value(register, "unsigned") }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr v-if="this.type !== 'fp_registers'">
          <b-td>Char</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ show_value(register, "char") }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr>
          <b-td>IEEE 754 (32 bits)</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ show_value(register, "ieee32") }}
            </b-badge>
          </b-td>
        </b-tr>
        <b-tr>
          <b-td>IEEE 754 (64 bits)</b-td>
          <b-td>
            <b-badge class="registerPopover">
              {{ show_value(register, "ieee64") }}
            </b-badge>
          </b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>

    <!-- <b-container fluid align-h="center" class="mx-0">
      <b-row align-h="center" :cols="get_cols()"> -->
    <!-- <b-col class="popoverFooter">
          <b-form-input
            v-model="newValue"
            type="text"
            size="sm"
            title="New Register Value"
            placeholder="Enter new value"
          />
        </b-col> -->

    <!-- <b-col v-if="double_precision !== null">
          <b-form-select v-model="precision" size="sm" block>
            <b-form-select-option value="false"
              >Simple Precision</b-form-select-option
            >
            <b-form-select-option value="true" active
              >Double Precision</b-form-select-option
            >
          </b-form-select>
        </b-col> -->

    <!-- <b-col>
          <b-button
            class="w-100"
            variant="primary"
            size="sm"
            @click="
              update_register(
                component.index,
                register.name,
                architecture.components[component.index].type,
                precision === 'true',
              )
            "
          >
            Update
          </b-button>
        </b-col> -->
    <!-- </b-row>
    </b-container> -->
  </b-popover>
</template>

<style lang="scss" scoped>
.registers {
  background-color: #f5f5f5;
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

.registerPopover {
  background-color: #ceecf5;
  font-family: monospace;
  font-weight: normal;
}

[data-bs-theme="dark"] {
  .registers {
    background-color: #343a40;
  }

  .registers:hover {
    background-color: #4d5154;
  }

  .registers-glow {
    background-color: #4d5154;
  }
}
</style>
