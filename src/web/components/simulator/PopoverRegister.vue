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
import { architecture } from "@/core/core.mjs"
import { hex2char8, hex2float, hex2double } from "@/core/utils/utils.mjs"
import { writeRegister } from "@/core/register/registerOperations.mjs"
import { creator_ga } from "@/core/utils/creator_ga.mjs"

export default {
  props: {
    target: { type: String, required: true },
    component: { type: Object, required: true },
    register: { type: Object, required: true },
  },

  data() {
    return {
      /*Register form*/
      architecture,
      newValue: "",
      precision: "true",
    }
  },

  methods: {
    closePopover() {
      this.$root.$emit("bv::hide::popover")
    },

    //Write the register value in the specified format
    // eslint-disable-next-line max-lines-per-function
    show_value(register, view) {
      let ret = 0

      switch (view) {
        case "hex":
          if (
            architecture.components[this.component.index].type ==
              "ctrl_registers" ||
            architecture.components[this.component.index].type ==
              "int_registers"
          ) {
            ret = register.value
              .toString(16)
              .padStart(register.nbits / 4, "0")
              .toUpperCase()
          } else {
            if (
              architecture.components[this.component.index].double_precision ===
              false
            ) {
              ret = bin2hex(float2bin(bi_BigIntTofloat(register.value)))
            } else {
              ret = bin2hex(double2bin(bi_BigIntTodouble(register.value)))
            }
          }
          break

        case "bin":
          if (
            architecture.components[this.component.index].type ==
              "ctrl_registers" ||
            architecture.components[this.component.index].type ==
              "int_registers"
          ) {
            ret = register.value.toString(2).padStart(register.nbits, "0")
          } else {
            if (
              architecture.components[this.component.index].double_precision ===
              false
            ) {
              ret = float2bin(bi_BigIntTofloat(register.value))
            } else {
              ret = double2bin(bi_BigIntTodouble(register.value))
            }
          }
          break

        case "signed":
          if (
            architecture.components[this.component.index].type ==
              "ctrl_registers" ||
            architecture.components[this.component.index].type ==
              "int_registers"
          ) {
            if (
              register.value
                .toString(2)
                .padStart(register.nbits, "0")
                .charAt(0) === 1
            ) {
              ret = parseInt(register.value.toString(10)) - 0x100000000
            }
            if (
              register.value
                .toString(2)
                .padStart(register.nbits, "0")
                .charAt(0) === 0
            ) {
              ret = register.value.toString(10)
            }
          } else {
            // ret = parseInt(register.value.toString(), 10) >> 0;
            if (
              architecture.components[this.component.index].double_precision ===
              false
            ) {
              ret = float2int_v2(bi_BigIntTofloat(register.value))
            } else {
              ret = double2int_v2(bi_BigIntTodouble(register.value))
            }
          }
          break

        case "unsigned":
          if (
            architecture.components[this.component.index].type ===
              "ctrl_registers" ||
            architecture.components[this.component.index].type ===
              "int_registers"
          ) {
            ret = parseInt(register.value.toString(10), 10) >>> 0
          } else {
            //ret = parseInt(register.value.toString(), 10) >>> 0;
            if (
              architecture.components[this.component.index].double_precision ===
              false
            ) {
              ret = float2int_v2(bi_BigIntTofloat(register.value)) >>> 0
            } else {
              ret = double2int_v2(bi_BigIntTodouble(register.value)) >>> 0
            }
          }
          break

        case "char":
          if (
            architecture.components[this.component.index].type ===
              "ctrl_registers" ||
            architecture.components[this.component.index].type ===
              "int_registers"
          ) {
            ret = hex2char8(
              register.value.toString(16).padStart(register.nbits / 4, "0"),
            )
          } else {
            if (
              architecture.components[this.component.index].double_precision ===
              false
            ) {
              ret = hex2char8(
                bin2hex(float2bin(bi_BigIntTofloat(register.value))),
              )
            } else {
              ret = hex2char8(
                bin2hex(double2bin(bi_BigIntTodouble(register.value))),
              )
            }
          }
          break

        case "ieee32":
          if (
            architecture.components[this.component.index].type ===
              "ctrl_registers" ||
            architecture.components[this.component.index].type ===
              "int_registers"
          ) {
            ret = hex2float("0x" + register.value.toString(16).padStart(8, "0"))
          } else {
            ret = bi_BigIntTofloat(register.value)
          }
          break

        case "ieee64":
          if (
            architecture.components[this.component.index].type ===
              "ctrl_registers" ||
            architecture.components[this.component.index].type ===
              "int_registers"
          ) {
            ret = hex2double(
              "0x" + register.value.toString(16).padStart(16, "0"),
            )
          } else {
            ret = bi_BigIntTodouble(register.value)
          }
          break

        default:
      }

      ret = ret.toString()

      return ret
    },

    // eslint-disable-next-line max-lines-per-function
    show_value(register) {
      let ret = 0

      switch (this.value_representation) {
        case "signed":
          if (
            architecture.components[this.component.index].type ===
              "ctrl_registers" ||
            architecture.components[this.component.index].type ===
              "int_registers"
          ) {
            if (
              register.value
                .toString(2)
                .padStart(register.nbits, "0")
                .charAt(0) === 1
            ) {
              ret = parseInt(register.value.toString(10), 10) - 0x100000000
            }
            if (
              register.value
                .toString(2)
                .padStart(register.nbits, "0")
                .charAt(0) === 0
            ) {
              ret = register.value.toString(10)
            }
          } else {
            // ret = parseInt(register.value.toString(), 10) >> 0;
            if (
              architecture.components[this.component.index].double_precision ===
              false
            ) {
              ret = float2int_v2(bi_BigIntTofloat(register.value))
            } else {
              ret = double2int_v2(bi_BigIntTodouble(register.value))
            }
          }
          break

        case "unsigned":
          if (
            architecture.components[this.component.index].type ===
              "ctrl_registers" ||
            architecture.components[this.component.index].type ===
              "int_registers"
          ) {
            ret = parseInt(register.value.toString(10), 10) >>> 0
          } else {
            //ret = parseInt(register.value.toString(), 10) >>> 0;
            if (
              architecture.components[this.component.index].double_precision ===
              false
            ) {
              ret = float2int_v2(bi_BigIntTofloat(register.value)) >>> 0
            } else {
              ret = double2int_v2(bi_BigIntTodouble(register.value)) >>> 0
            }
          }
          break

        case "ieee32":
          if (
            architecture.components[this.component.index].type ===
              "ctrl_registers" ||
            architecture.components[this.component.index].type ===
              "int_registers"
          ) {
            ret = hex2float("0x" + register.value.toString(16).padStart(8, "0"))
          } else {
            ret = bi_BigIntTofloat(register.value)
          }
          break

        case "ieee64":
          if (
            architecture.components[this.component.index].type ===
              "ctrl_registers" ||
            architecture.components[this.component.index].type ===
              "int_registers"
          ) {
            ret = hex2double(
              "0x" + register.value.toString(16).padStart(16, "0"),
            )
          } else {
            ret = bi_BigIntTodouble(register.value)
          }
          break

        case "hex":
          if (
            architecture.components[this.component.index].type ===
              "ctrl_registers" ||
            architecture.components[this.component.index].type ===
              "int_registers"
          ) {
            ret = register.value
              .toString(16)
              .padStart(register.nbits / 4, "0")
              .toUpperCase()
          } else {
            if (
              architecture.components[this.component.index].double_precision ===
              false
            ) {
              ret = bin2hex(float2bin(bi_BigIntTofloat(register.value)))
            } else {
              ret = bin2hex(double2bin(bi_BigIntTodouble(register.value)))
            }
          }
          break
        default:
      }

      if (this.component.double_precision_type === "linked") {
        ret = ret.toString()

        if (ret.length > 10) {
          return ret.slice(0, 8) + "..."
        }
      }

      return ret
    },

    show_value_truncate(register) {
      let ret = this.show_value(register).toString()
      if (ret.length > 8) {
        ret = ret.slice(0, 8) + "..."
      }
      return ret
    },

    reg_name(register) {
      switch (this.name_representation) {
        case "logical":
          return register.name[0]
        case "alias":
          if (typeof register.name[1] === "undefined") {
            return register.name[0]
          }

          return register.name.slice(1, register.name.length).join(" | ")
        case "all":
          return register.name.join(" | ")

        default:
          return ""
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.registerPopover {
  background-color: #ceecf5;
  color: black;
}

.popoverFooter {
  padding: 2px;
}

.popoverText {
  font-size: 1.2em;
}
</style>
