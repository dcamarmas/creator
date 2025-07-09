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
import { architecture, memory_hash, REGISTERS } from "@/core/core.mjs"
import {
  creator_memory_update_space_view,
  creator_memory_update_row_view,
} from "@/core/memory/memoryViewManager.mjs"
import { chunks, range } from "@/core/utils/utils.mjs"

export default {
  props: {
    main_memory: { type: Object, required: true },
    memory_segment: { type: String, required: true },
    // track_stack_names: { type: Array, required: true }, // TODO: optional
    // callee_subrutine: { type: String, required: true }, // TODO: optional
    // caller_subrutine: { type: String, required: true }, // TODO: optional
    // stack_total_list: { type: Number, required: true },
    // main_memory_busy: { type: Boolean, required: true },
    // memory_layout: { type: Object, required: true },
    // end_callee: { type: Number, required: true },
  },

  data() {
    return {
      architecture,

      memFields: [{ key: "Tag", label: "" }, "Address", "Binary", "Value"],
      row_info: null,
      spaceView: false,
      spaceItem: null,
      selected_stack_view: null,
      memorySegments: this.main_memory.getMemorySegments(),

      ctrl_register_tags: [
        "program_counter",
        "stack_pointer",
        "frame_pointer",
        "global_pointer",
      ],

      render: 0n, // dummy variable to force refresh the memory table
      render_tag: 0n, // dummy variable to force refresh the memory tags
    }
  },

  methods: {
    /**
     * Refreshes the memory table
     */
    refresh() {
      // refreshes children components with `:key="render"`
      this.render++
    },

    /**
     * Refreshes the memory tags
     */
    refresh_tags() {
      // refreshes children components with `:key="render_tag"`
      this.render_tag++
    },

    /**
     * Filters which rows to show, depending on the data segment
     */
    filter(row, _filter) {
      const segment = this.memorySegments.get(this.memory_segment)
      if (segment === undefined) return false

      return row.start >= segment.startAddress && row.end <= segment.endAddress
    },

    // TODO: generic and include modal
    select_data_type(record, index) {
      this.row_info = { index, addr: record.addr - 3, size: record.size }

      if (this.memory_segment === "instructions_memory") {
        return
      }

      if (this.memory_segment === "data_memory") {
        if (this.check_tag_null(record.hex)) {
          //app.$refs['space_modal'].show(); // TODO: vue bidirectional updates
          this.$root.$emit("bv::show::modal", "space_modal")
        }
      }

      if (this.memory_segment === "stack_memory") {
        //app.$refs['stack_modal'].show(); // TODO: vue bidirectional updates
        this.$root.$emit("bv::show::modal", "stack_modal")
      }
    },

    change_space_view() {
      creator_memory_update_space_view(
        this.selected_space_view,
        memory_hash[1],
        this.row_info,
      )
    },

    hide_space_modal() {
      this.selected_space_view = null
    },

    change_stack_view() {
      creator_memory_update_row_view(
        this.selected_stack_view,
        memory_hash[2],
        this.row_info,
      )
    },

    hide_stack_modal() {
      this.selected_stack_view = null
    },

    check_tag_null(record) {
      for (let i = 0; i < record.length; i++) {
        if (record[i].tag !== null) {
          return true
        }
      }

      return false
    },

    get_classes(item) {
      return {
        h6Sm: this.memory_segment !== "stack",
        "h6Sm text-secondary":
          item.start < this.$root.end_callee &&
          Math.abs(item.start - this.$root.end_callee) <
            this.$root.stack_total_list * 4,
        "h6Sm text-success":
          item.start < this.$root.begin_callee &&
          item.start >= this.$root.end_callee,
        "h6Sm text-blue-funny":
          item.start < this.$root.begin_caller &&
          item.start >= this.$root.end_caller,
        h6Sm: item.start >= this.$root.begin_caller,
      }
    },

    /**
     *
     * Transforms a value into a hextring.
     *
     * @param {number} value
     * @param {number} padding Padding, in bytes
     *
     * @returns {string}
     */
    toHex(value, padding) {
      return value
        .toString(16)
        .padStart(padding * 2, "0")
        .toUpperCase()
    },

    /**
     *
     * Transforms a value into a hextring.
     *
     * @param {number} value
     * @param {number} padding Padding, in bytes
     *
     * @returns {string}
     */
    toBin(value, padding) {
      return value.toString(2).padStart(padding * 8, "0")
    },

    /**
     * Computes what values are stored in a set of bytes, according to the type.
     *
     * @param {number[]} bytes
     * @param {string} type
     *
     * @returns {string[]} Array of the same length as `bytes`, with the value
     * stored in the corresponding byte, that is, the first byte for all cases
     * except the string, where its a char value per byte.
     */
    computeHumanValues(bytes, type) {
      const values = new Array(bytes.length)
      const view = new DataView(new Uint8Array(bytes).buffer)

      switch (type) {
        case "byte":
          // unsigned integer
          values[0] = view.getUint8()
          return values

        case "half":
          values[0] = view.getUint16()
          return values

        case "word":
        case "signed":
          values[0] = view.getInt32()
          return values

        case "unsigned":
          values[0] = view.getUint32()
          return values

        case "dword":
          values[0] = view.getInt64()

          return values

        case "float32":
          values[0] = view.getFloat32()
          return values

        case "float64":
          values[0] = view.getFloat64()
          return values

        case "string":
          return bytes.map(b => String.fromCharCode(b))

        case "padding":
        case "space":
        default:
          return values
      }
    },

    /**
     * Checks if any of the special control registers are pointing to this
     * address, and returns its types and names.
     *
     * @param {Number} addr Adress to check
     *
     * @returns {Array<{type: string, name: string}>}
     */
    get_pointers(addr) {
      return REGISTERS.flatMap(bank =>
        bank.elements
          .filter(
            register =>
              // check it's one of the control registers
              register.properties.some(p =>
                this.ctrl_register_tags.includes(p),
              ) &&
              // check value is correct
              (register.value & 0xfffffffcn) === (BigInt(addr) & 0xfffffffcn),
          )
          .map(reg => ({
            type: reg.properties.find(p => this.ctrl_register_tags.includes(p)),
            name: reg.name[1] || reg.name[0],
          })),
      )
    },

    // I'd _like_ for these to be a computed method but, as none of the
    // dependencies are reactive, as we're calling
    // `this.main_memory.getWritten()`, computed caching comes into play and not
    // even force updating works.
    main_memory_items() {
      const mem = this.main_memory.getWritten()
      const addresses = this.main_memory.getWrittenAddresses()

      // ensure full words
      // why do we do this? because we don't want to hold the whole simulator
      // memory array in memory, so we just get the written values, but there
      // might be gaps, bytes that were not written
      mem
        // find missing addresses
        .reduce((missing, byte) => {
          // for each start of word address, check the bytes of the full word
          // are present
          if (byte.addr % 4 === 0) {
            range(byte.addr, byte.addr + 4).forEach(addr => {
              if (!addresses.includes(addr)) missing.push(addr)
            })
          }

          // do the same for the end of the word
          // FIXME: we _shouldn't_ need this, as memory is _supposed_ to be
          // aligned... but currently there's a problem with zero-terminated
          // strings (the last zero is not marked as a written value). When the
          // compiler is updated, remove this.
          if (byte.addr % 4 === 3) {
            range(byte.addr - 3, byte.addr + 1).forEach(addr => {
              if (!addresses.includes(addr)) missing.push(addr)
            })
          }

          return missing
        }, [])
        // fill the missing addresses
        .forEach(a => {
          mem.splice(mem.findIndex(b => b.addr === a - 1) + 1, 0, {
            addr: a,
            value: 0,
          })
        })

      // set human values, depending on hints
      let i = 0
      while (i < mem.length) {
        const hint = this.hints().find(h => h.address === mem.at(i).addr)
        if (hint === undefined) {
          i++
          continue
        }

        const bytes = mem.slice(i, i + hint.size).map(b => b.value)

        // compute human values and store them in memory
        this.computeHumanValues(bytes, hint.type).forEach(
          (b, j) => (mem[i + j].human = b),
        )

        i += hint.size
      }

      return (
        // group bytes by words
        chunks(mem, this.main_memory.getWordSize()).map(bytes => ({
          start: bytes.at(0).addr,
          end: bytes.at(-1).addr,
          bytes: bytes.map(b => ({
            addr: b.addr,
            value: b.value,
            tag: this.hints().find(h => h.address === b.addr)?.tag,
            human: b.human,
          })),
        }))
      )
    },

    hints() {
      return this.main_memory
        .getAllHints()
        .map(({ address, tag, type, sizeInBits }) => ({
          address: Number(address),
          tag,
          type,
          size: sizeInBits / this.main_memory.getBitsPerByte(),
        }))
    },
  },
}
</script>

<template>
  <div :key="render">
    <b-container fluid align-h="between" class="mx-0 px-0">
      <b-row align-v="start" cols="1">
        <b-col class="mx-0 pl-0 pr-2" style="min-height: 35vh !important">
          <b-table
            sticky-header
            striped
            ref="table"
            small
            hover
            :items="main_memory_items()"
            :fields="memFields"
            :filter-function="filter"
            filter=" "
            class="memory_table align-items-start"
            @row-clicked="
              (item, _index, _event) => {
                spaceItem = item
                spaceView = true
              }
            "
          >
            <template #table-busy>
              <div class="text-center text-primary my-2">
                <b-spinner class="align-middle" />
                <strong> Running...</strong>
              </div>
            </template>

            <!-- control register badges -->

            <template v-slot:cell(Tag)="row">
              <!--
              OK, here we go...
              I'd _like_ to prevent doing this. I HATE doing this, but good ol'
              Vue makes me do this, as I found no other way.

              We want the badges to automatically update, right? It _should_ be
              as easy as using the method and that's it, but no... Vue doesn't
              like this. Maybe it's because the method depends on row.item.addr,
              and that doesn't change when registers change, so nothing updates.

              The "hack" I found is adding another horrible line in the
              updateRegisterUI function to force update these components every
              time we update a register. It's hacky, its inefficient, and it's
              plain ugly, but it works.
              -->
              <div :key="render_tag">
                <div
                  v-for="{ type, name } of get_pointers(row.item.start)"
                  :key="type"
                >
                  <b-badge
                    class="border border-info shadow memoryTag"
                    :variant="type === 'program_counter' ? 'success' : 'info'"
                  >
                    {{ name }}
                  </b-badge>
                  <font-awesome-icon icon="fa-solid fa-right-long" />
                </div>
              </div>
            </template>

            <!-- address -->

            <template v-slot:cell(Address)="row">
              <div class="pt-3">
                <span v-bind:class="get_classes(row.item)">
                  0x{{ toHex(row.item.start, 4) }} - 0x{{
                    toHex(row.item.end, 4)
                  }}
                </span>
              </div>
            </template>

            <!-- binary representation -->

            <template v-slot:cell(Binary)="row">
              <div class="pt-3" />
              <span
                v-bind:class="get_classes(row.item)"
                v-for="byte in row.item.bytes"
                :key="byte.addr"
              >
                <!-- tag -->
                <b-badge
                  pill
                  variant="info"
                  class="border border-info shadow binaryTag"
                  style="top: -2vh !important"
                  v-if="byte.tag"
                >
                  {{ byte.tag }}
                </b-badge>

                <!-- byte -->
                <span :class="{ memoryBorder: byte.tag }">
                  {{ toHex(byte.value, 1) }}
                </span>

                &nbsp;
              </span>
            </template>

            <!-- value -->

            <template v-slot:cell(Value)="row">
              <div class="pt-3" />
              <span
                v-bind:class="get_classes(row.item)"
                style="white-space: pre-wrap"
              >
                {{
                  row.item.bytes
                    .map(byte => byte.human) // get human values
                    .filter(x => x) // remove `undefined`s
                    .join(", ")
                }}
              </span>
            </template>
          </b-table>
        </b-col>
      </b-row>

      <!-- TODO: Stack -->
      <!-- <b-row align-v="end">
        <b-col>
          <div
            class="col-lg-12 col-sm-12 row mx-0 px-2 border"
            v-if="memory_segment == 'stack_memory'"
          >
            <span class="col-lg-12 col-sm-12 my-1">
              <span>Stack memory areas: </span>
              <span class="fas fa-search-plus" id="stack_funct_popover" />
            </span>

            <span
              class="badge badge-white border border-secondary text-secondary mx-1 col"
            >
              Free <br />
              stack
            </span>
            <span
              class="badge badge-white border border-secondary text-success mx-1"
            >
              Callee: <br />{{ callee_subrutine }}
            </span>
            <span
              class="badge badge-white border border-secondary text-info mx-1"
              v-if="track_stack_names.length > 1"
            >
              Caller: <br />{{ caller_subrutine }}
            </span>
            <span
              class="badge badge-white border border-secondary text-dark mx-1"
              v-if="track_stack_names.length > 2"
              align-v="center"
            >
              <b>&bull;&bull;&bull;<br />{{ track_stack_names.length - 2 }}</b>
            </span>
            <span
              class="badge badge-white border border-secondary text-dark mx-1"
            >
              System <br />stack
            </span>

            <b-popover
              target="stack_funct_popover"
              triggers="hover"
              placement="top"
            >
              <span>0x000...</span>
              <b-list-group class="my-2">
                <b-list-group-item
                  v-for="(item, index) in track_stack_names.slice().reverse()"
                >
                  <span class="text-success" v-if="index == 0">{{ item }}</span>
                  <span class="text-info" v-if="index == 1">{{ item }}</span>
                  <span class="text-dark" v-if="index > 1">{{ item }}</span>
                </b-list-group-item>
              </b-list-group>
              <span>0xFFF...</span>
            </b-popover>
          </div>
        </b-col>
      </b-row> -->
    </b-container>

    <!-- Modals -->

    <b-modal
      id="space_modal"
      v-if="spaceItem"
      responsive
      no-footer
      centered
      :title="`Space view for 0x${toHex(spaceItem.start, 1)}`"
      v-model="spaceView"
    >
      <b-table-simple small responsive bordered>
        <b-tbody>
          <b-tr>
            <b-td>Hexadecimal</b-td>
            <b-td>
              <b-badge class="registerPopover">
                0x{{ spaceItem.bytes.map(b => toHex(b.value, 1)).join("") }}
              </b-badge>
            </b-td>
          </b-tr>
          <b-tr>
            <b-td>Binary</b-td>
            <b-td>
              <b-badge
                class="registerPopover me-1"
                v-for="byte of spaceItem.bytes.map(b => toBin(b.value, 1))"
              >
                {{ byte }}
              </b-badge>
            </b-td>
          </b-tr>
          <b-tr>
            <b-td>Chars</b-td>
            <b-td>
              <b-badge
                class="registerPopover me-1"
                v-for="char of computeHumanValues(
                  spaceItem.bytes.map(b => b.value),
                  'string',
                )"
              >
                {{ char }}
              </b-badge>
            </b-td>
          </b-tr>
          <b-tr>
            <b-td>Signed</b-td>
            <b-td>
              <b-badge class="registerPopover">
                {{
                  computeHumanValues(
                    spaceItem.bytes.map(b => b.value),
                    "signed",
                  ).at(0)
                }}
              </b-badge>
            </b-td>
          </b-tr>
          <b-tr>
            <b-td>Unsigned</b-td>
            <b-td>
              <b-badge class="registerPopover">
                {{
                  computeHumanValues(
                    spaceItem.bytes.map(b => b.value),
                    "unsigned",
                  ).at(0)
                }}
              </b-badge>
            </b-td>
          </b-tr>
          <b-tr>
            <b-td>IEEE 754 (32 bits)</b-td>
            <b-td>
              <b-badge class="registerPopover">
                {{
                  computeHumanValues(
                    spaceItem.bytes.map(b => b.value),
                    "float32",
                  ).at(0)
                }}
              </b-badge>
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
    </b-modal>

    <!-- <b-modal
      id="stack_modal"
      size="sm"
      title="Select stack word view:"
      @hidden="hide_stack_modal"
      @ok="change_stack_view"
    >
      <b-form-radio v-model="selected_stack_view" value="sig_int">
        Signed Integer
      </b-form-radio>
      <b-form-radio v-model="selected_stack_view" value="unsig_int">
        Unsigned Integer
        </b-form-radio>
      <b-form-radio v-model="selected_stack_view" value="float">
        Float
      </b-form-radio>
      <b-form-radio v-model="selected_stack_view" value="char">
        Char
      </b-form-radio>
    </b-modal> -->
  </div>
</template>

<style lang="scss" scoped>
.memory_table {
  max-height: 49vh;
  padding-left: 1vw;
  cursor: pointer;
}

.table-mem-wrapper-scroll-y {
  display: block;
  max-height: 75vh;
  overflow-y: auto;
  -ms-overflow-style: -ms-autohiding-scrollbar;
}

.memoryBorder {
  border: 1px solid gray;
}

.memoryTag {
  float: left;
  position: relative;
  left: -0.7vw;
}

.binaryTag {
  position: relative;
  top: -9px;
}

.table-inst-wrapper-scroll-y {
  display: block;
  max-height: 90vh;
  overflow-y: auto;
  -ms-overflow-style: -ms-autohiding-scrollbar;
}

.text-blue-funny {
  color: #00bcfe;
}

.registerPopover {
  background-color: #ceecf5;
  font-family: monospace;
  font-weight: normal;
}
</style>
