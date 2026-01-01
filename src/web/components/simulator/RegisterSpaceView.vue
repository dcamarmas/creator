<!--
Copyright 2018-2026 CREATOR Team.

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
<script lang="ts">
import { REGISTERS } from "@/core/core";

import { writeRegister } from "@/core/register/registerOperations.mjs";
import { crex_findReg } from "@/core/register/registerLookup.mjs";
import { creator_ga } from "@/core/utils/creator_ga.mjs";
import { show_notification } from "@/web/utils.mjs";
import { float2bin, double2bin } from "@/core/utils/utils.mjs";
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  props: {
    id: { type: String, required: true },
    item: {
      type: [Object, null] as PropType<RegisterDetailsItem | null>,
      required: true,
    },
  },

  // emits: ["update:show"],

  data() {
    return {
      newValue: "",
      precision: "single",
    };
  },

  computed: {
    doublePrecision(): boolean {
      // TODO
      return false;
    },

    // sync w/ parent
    // showValue: {
    //   get() {
    //     return this.show
    //   },
    //   set(value) {
    //     this.$emit("update:show", value)
    //   },
    // },
  },

  methods: {
    updateRegister(name: string, type: string, doublePrecision: boolean) {
      const reg = crex_findReg(name);
      const regSize =
        REGISTERS[reg.indexComp!]!.elements[reg.indexElem!]!.nbits;

      // compute value to store
      let value;
      if (["int_registers", "ctrl_registers"].includes(type)) {
        // eslint-disable-next-line radix
        const newValue = parseInt(this.newValue);
        if (isNaN(newValue)) {
          show_notification(
            `Invalid input: ${this.newValue} is not a number`,
            "danger",
          );
          return;
        }

        value = BigInt.asUintN(regSize, BigInt(newValue));
        // TODO: for RISC-V, use CAPI.RISCV.toBigInt
      } else if (type === "fp_registers") {
        const newValue = parseFloat(this.newValue);
        if (isNaN(newValue)) {
          show_notification(
            `Invalid input: ${this.newValue} is not a number`,
            "danger",
          );
          return;
        }

        if (doublePrecision) {
          value = BigInt.asUintN(
            regSize,
            BigInt(parseInt(double2bin(newValue), 2)),
          );
        } else {
          value = BigInt.asUintN(
            regSize,
            BigInt(parseInt(float2bin(newValue), 2)),
          );
        }
      }
      // write and reset
      writeRegister(value!, reg.indexComp!, reg.indexElem!);
      this.newValue = "";
      // this.showValue = false // close popup

      // Google Analytics
      creator_ga("data", "data.change", "data.change.register_value");
      creator_ga("data", "data.change", "data.change.register_value_" + name);
    },
  },
});
</script>

<template>
  <b-modal
    :id="id"
    responsive
    no-footer
    centered
    :title="`Space view for ${item?.name.join(' | ')}`"
  >
    <b-table-simple v-if="item" small responsive bordered>
      <b-tbody>
        <b-tr>
          <b-td>Hexadecimal</b-td>
          <b-td>
            <b-badge class="registerPopover"> {{ item.hex }} </b-badge>
          </b-td>
        </b-tr>
        <b-tr>
          <b-td>Binary</b-td>
          <b-td>
            <b-badge class="registerPopover"> {{ item.bin }} </b-badge>
          </b-td>
        </b-tr>
        <b-tr v-if="item.type !== 'fp_registers'">
          <b-td>Signed</b-td>
          <b-td>
            <b-badge class="registerPopover"> {{ item.signed }} </b-badge>
          </b-td>
        </b-tr>
        <b-tr v-if="item.type !== 'fp_registers'">
          <b-td>Unsigned</b-td>
          <b-td>
            <b-badge class="registerPopover"> {{ item.unsigned }} </b-badge>
          </b-td>
        </b-tr>
        <b-tr v-if="item.type !== 'fp_registers'">
          <b-td>Char</b-td>
          <b-td>
            <b-badge class="registerPopover"> {{ item.char }} </b-badge>
          </b-td>
        </b-tr>
        <b-tr>
          <b-td>IEEE 754 (32 bits)</b-td>
          <b-td>
            <b-badge class="registerPopover"> {{ item.ieee32 }} </b-badge>
          </b-td>
        </b-tr>
        <b-tr>
          <b-td>IEEE 754 (64 bits)</b-td>
          <b-td>
            <b-badge class="registerPopover"> {{ item.ieee64 }} </b-badge>
          </b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>

    <!-- Edit value -->
    <b-container v-if="item" fluid align-h="center" class="mx-0">
      <b-row align-h="center" :cols="doublePrecision ? 3 : 2">
        <b-col>
          <b-form-input
            v-model="newValue"
            type="text"
            size="sm"
            title="New Register Value"
            placeholder="Enter new value"
          />
        </b-col>
        <b-col v-if="doublePrecision">
          <b-form-select v-model="precision" size="sm" block>
            <b-form-select-option value="simple">
              Simple Precision
            </b-form-select-option>
            <b-form-select-option value="double" active>
              Double Precision
            </b-form-select-option>
          </b-form-select>
        </b-col>
        <b-col>
          <b-button
            class="w-100"
            variant="primary"
            size="sm"
            @click="
              updateRegister(
                item.name.at(0)!,
                item.type,
                precision === 'double',
              )
            "
          >
            Update
          </b-button>
        </b-col>
      </b-row>
    </b-container>
  </b-modal>
</template>
