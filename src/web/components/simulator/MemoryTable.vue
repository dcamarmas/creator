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
import { architecture, memory_hash, architecture_hash } from "@/core/core.mjs"
import {
  creator_memory_update_space_view,
  creator_memory_update_row_view,
} from "@/core/memory/memoryViewManager.mjs"
import {
  chunks,
  hex2SignedInt,
  hex2float,
  hex2double,
} from "@/core/utils/utils.mjs"

// As currently hints are stored as a string containing the tag and the
// hint itself, we have to separate them back
function extractType(hint) {
  if (hint === undefined) return undefined

  let val = hint

  if (hint.includes(":")) {
    val = hint.split(":").at(-1)
  }

  return val.replace("<", "").replace(">", "").trim()
}

function extractTag(tag) {
  if (tag === undefined) return undefined

  if (tag.includes(":")) {
    return tag.split(":").at(0)
  }

  return undefined
}

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
      architecture_hash,
      architecture,
      /*Memory table fields*/
      memFields: ["Tag", "Address", "Binary", "Value"],
      row_info: null,
      selected_space_view: null,
      selected_stack_view: null,
      memorySegments: this.main_memory.getMemorySegments(),
    }
  },

  methods: {
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

    get_classes(row) {
      return {
        h6Sm: this.memory_segment !== "stack",
        "h6Sm text-secondary ":
          row.item.start < this.$root.end_callee &&
          Math.abs(row.item.start - this.$root.end_callee) <
            this.$root.stack_total_list * 4,
        "h6Sm text-success   ":
          row.item.start < this.$root.begin_callee &&
          row.item.start >= this.$root.end_callee,
        "h6Sm text-blue-funny":
          row.item.start < this.$root.begin_caller &&
          row.item.start >= this.$root.end_caller,
        "h6Sm                ": row.item.start >= this.$root.begin_caller,
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
     * Computes what values are stored in a set of bytes, according to the type.
     *
     * @param {number[]} bytes
     * @param {string} type
     *
     * @returns {string[]} Array of the same length as `bytes`,
     */
    computeHumanValues(bytes, type) {
      // TODO: eventually, move this logic to the architecture definition, as
      // the hints are given by the architecture

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
          values[0] = view.getInt32()
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
  },

  computed: {
    hints() {
      return this.main_memory
        .getAllHints()
        .map(({ address, hint, sizeInBits }) => ({
          address: Number(address),
          // FIXME: when hints and tags become two separate things, redo this
          // temporary fix
          tag: extractTag(hint),
          type: extractType(hint),
          size: sizeInBits / this.main_memory.getBitsPerByte(),
        }))
    },

    main_memory_items() {
      const mem = this.main_memory.getWritten()

      // set human values, depending on hints
      let i = 0
      while (i < mem.length) {
        const hint = this.hints.find(h => h.address === mem.at(i).addr)
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
            tag: this.hints.find(h => h.address === b.addr)?.tag,
            human: b.human,
          })),
        }))
      )
    },
  },
}
</script>

<template>
  <div>
    <b-container fluid align-h="between" class="mx-0 px-0">
      <b-row align-v="start" cols="1">
        <b-col class="mx-0 pl-0 pr-2" style="min-height: 35vh !important">
          <b-table
            sticky-header
            striped
            ref="table"
            small
            hover
            :items="main_memory_items"
            :fields="memFields"
            :filter-function="filter"
            filter=" "
            class="memory_table align-items-start"
            @row-clicked="select_data_type"
          >
            <template #table-busy>
              <div class="text-center text-primary my-2">
                <b-spinner class="align-middle" />
                <strong> Running...</strong>
              </div>
            </template>

            <!-- remove "Tag" column title -->
            <template v-slot:head(Tag)="_row"> &nbsp; </template>

            <!-- control register badges -->

            <template v-slot:cell(Tag)="row">
              <div v-for="bank in architecture_hash" :key="bank.index">
                <div
                  v-for="register in architecture.components[bank.index]
                    .elements"
                  :key="register.name[0]"
                >
                  <!-- program counter -->
                  <div
                    v-for="register in architecture.components[bank.index]
                      .elements"
                    :key="register.name[0]"
                  >
                    <div
                      v-if="
                        register.properties.includes('program_counter') &&
                        (parseInt(register.value) & 0xfffffffc) ==
                          (row.item.addr & 0xfffffffc)
                      "
                    >
                      <b-badge
                        variant="success"
                        class="border border-info shadow memoryTag"
                      >
                        {{ register.name[1] || register.name[0] }}
                      </b-badge>
                      <font-awesome-icon icon="fa-solid fa-right-long" />
                    </div>
                  </div>

                  <!-- pointers -->
                  <div
                    v-if="
                      (register.properties.includes('stack_pointer') ||
                        register.properties.includes('frame_pointer') ||
                        register.properties.includes('global_pointer')) &&
                      (parseInt(register.value) & 0xfffffffc) ==
                        (row.item.start & 0xfffffffc)
                    "
                  >
                    <b-badge
                      variant="info"
                      class="border border-info shadow memoryTag"
                    >
                      {{ register.name[1] || register.name[0] }}
                    </b-badge>
                    <font-awesome-icon icon="fa-solid fa-right-long" />
                  </div>
                </div>
              </div>
            </template>

            <!-- address -->

            <template v-slot:cell(Address)="row">
              <div class="pt-3">
                <span v-bind:class="get_classes(row)">
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
                v-bind:class="get_classes(row)"
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
                v-bind:class="get_classes(row)"
                style="white-space: pre-wrap"
              >
                {{
                  row.item.bytes
                    .map(byte => byte.human) // get human values
                    .filter(x => x) // remove `undefined`s
                    .join(", ")
                }}
              </span>
              <!-- <font-awesome-icon
                icon="fa-solid fa-eye"
                class="value-button"
                v-b-modal.space_modal
                v-if="row.item.eye && check_tag_null(row.item.hex)"
              /> -->
            </template>
          </b-table>
        </b-col>
      </b-row>

      <!-- Stack -->
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

    <b-modal
      id="space_modal"
      size="sm"
      title="Select space view:"
      @hidden="hide_space_modal"
      @ok="change_space_view"
    >
      <b-form-radio v-model="selected_space_view" value="sig_int">
        Signed Integer
      </b-form-radio>
      <b-form-radio v-model="selected_space_view" value="unsig_int">
        Unsigned Integer
      </b-form-radio>
      <b-form-radio v-model="selected_space_view" value="float">
        Float
      </b-form-radio>
      <b-form-radio v-model="selected_space_view" value="char">
        Char
      </b-form-radio>
    </b-modal>

    <!-- <b-modal
      id="stack_modal"
      size="sm"
      title="Select stack word view:"
      @hidden="hide_stack_modal"
      @ok="change_stack_view"
    >
      <b-form-radio v-model="selected_stack_view" value="sig_int"
        >Signed Integer</b-form-radio
      >
      <b-form-radio v-model="selected_stack_view" value="unsig_int"
        >Unsigned Integer</b-form-radio
      >
      <b-form-radio v-model="selected_stack_view" value="float"
        >Float</b-form-radio
      >
      <b-form-radio v-model="selected_stack_view" value="char"
        >Char</b-form-radio
      >
    </b-modal> -->
  </div>
</template>

<style lang="scss" scoped>
.memory_table {
  max-height: 49vh;
  padding-left: 1vw;
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

.value-button {
  float: right;
  margin-right: 5%;
}

.value-button:hover {
  cursor: pointer;
}
</style>
