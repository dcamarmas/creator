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

export default {
  props: {
    main_memory: { type: Object, required: true },
    memory_segment: { type: String, required: true },
    track_stack_names: { type: Array, required: true }, // TODO: optional
    callee_subrutine: { type: String, required: true }, // TODO: optional
    caller_subrutine: { type: String, required: true }, // TODO: optional
    stack_total_list: { type: Number, required: true },
    main_memory_busy: { type: Boolean, required: true },
    memory_layout: { type: Object, required: true },
    end_callee: { type: Number, required: true },
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
    }
  },

  methods: {
    /**
     * Filters which rows to show, depending on the data segment
     */
    filter(row, _filter) {
      const addr = parseInt(row.addr_begin, 16)

      switch (this.memory_segment) {
        // TODO: kernel
        // case "kinstructions_memory":
        //   return (
        //     !row.hide &&
        //     addr >= parseInt(this.memory_layout[0].value, 16) &&
        //     addr <= parseInt(this.memory_layout[1].value, 16)
        //   )

        // case "kdata_memory":
        //   return (
        //     addr >= parseInt(this.memory_layout[2].value, 16) &&
        //     addr <= parseInt(this.memory_layout[3].value, 16)
        //   )

        case "instructions_memory":
          return (
            !row.hide &&
            addr >= parseInt(this.memory_layout[0].value, 16) &&
            addr <= parseInt(this.memory_layout[1].value, 16)
          )

        case "data_memory":
          // return true
          return (
            addr >= parseInt(this.memory_layout[2].value, 16) &&
            addr <= parseInt(this.memory_layout[3].value, 16)
          )

        case "stack_memory":
          return (
            addr > parseInt(this.memory_layout[3].value, 16) &&
            Math.abs(addr - end_callee) < this.stack_total_list * 4
          )

        default:
          return false
      }
    },

    // TODO: generic and include modal
    select_data_type(record, index) {
      this.row_info = { index: index, addr: record.addr - 3, size: record.size }

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
        h6Sm:
          row.item.addr >= parseInt(architecture.memory_layout[0].value, 16) &&
          row.item.addr <= architecture.memory_layout[3].value,
        "h6Sm text-secondary ":
          row.item.addr < this.$root.end_callee &&
          Math.abs(row.item.addr - this.$root.end_callee) <
            this.stack_total_list * 4,
        "h6Sm text-success   ":
          row.item.addr < this.$root.begin_callee &&
          row.item.addr >= this.$root.end_callee,
        "h6Sm text-blue-funny":
          row.item.addr < this.$root.begin_caller &&
          row.item.addr >= this.$root.end_caller,
        "h6Sm                ": row.item.addr >= this.$root.begin_caller,
      }
    },
  },

  computed: {
    main_memory_items() {
      // memory items that will be shown
      return Object.entries(this.main_memory)
        .sort((a, b) => a[0] - b[0])
        .map(a => a[1])
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
            :busy="main_memory_busy"
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
                        (row.item.addr & 0xfffffffc)
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
                  {{ row.item.addr_begin }} - {{ row.item.addr_end }}
                </span>
              </div>
            </template>

            <!-- binary representation -->

            <template v-slot:cell(Binary)="row">
              <div class="pt-3" />
              <span
                v-bind:class="get_classes(row)"
                v-for="address in row.item.hex"
                :key="row.addr"
              >
                <!-- tag -->
                <b-badge
                  pill
                  variant="info"
                  class="border border-info shadow binaryTag"
                  style="top: -2vh !important"
                  v-if="address.tag"
                >
                  {{ address.tag }}
                </b-badge>

                <!-- byte -->
                <span v-if="address.tag" class="memoryBorder">
                  {{ address.byte.toUpperCase() }}
                </span>
                <span v-else>
                  {{ address.byte.toUpperCase() }}
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
                {{ row.item.value }}
              </span>
              <font-awesome-icon
                icon="fa-solid fa-eye"
                class="value-button"
                v-b-modal.space_modal
                v-if="row.item.eye && check_tag_null(row.item.hex)"
              />
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
