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

<script lang="ts">
import { defineComponent, type PropType } from "vue"

import { REGISTERS, stackTracker } from "@/core/core.mjs"
import { chunks, range } from "@/core/utils/utils.mjs"
import { toHex } from "@/web/utils.mjs"
import type { Memory } from "@/core/memory/Memory.mjs"
import type { Device } from "@/core/executor/devices.mjs"
import type { StackFrame } from "@/core/memory/StackTracker.mjs"

export default defineComponent({
  props: {
    main_memory: { type: Object as PropType<Memory>, required: true },
    devices: { type: Map as PropType<Map<string, Device>>, required: true },
    segment: { type: String, required: true },
    caller_frame: Object as PropType<StackFrame>,
    callee_frame: Object as PropType<StackFrame>,
  },

  data() {
    return {
      row_info: null,
      spaceView: false,
      spaceItem: null as MemoryItem | null,
      selected_stack_view: null,
      memorySegments: this.main_memory.getMemorySegments(),
      deviceIDs: Array.from(this.devices.keys()),

      ctrl_register_tags: [
        "program_counter",
        "stack_pointer",
        "frame_pointer",
        "global_pointer",
      ],

      render: 0, // dummy variable to force refresh the memory table
      render_tag: 0, // dummy variable to force refresh the memory tags
    }
  },

  methods: {
    toHex,

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
    mainMemoryFilter(item: MemoryItem, _filter: any) {
      const segment = this.memorySegments.get(this.segment)
      if (segment === undefined) return false

      return item.start >= segment.start && item.end <= segment.end
    },

    get_classes(item: MemoryItem) {
      return {
        h6Sm:
          this.segment !== "stack" || item.start >= this.caller_frame!.begin,
        "text-secondary":
          item.start < this.callee_frame!.end &&
          Math.abs(item.start - this.callee_frame!.end) <
            (this.$root as any).stack_total_list * 4,
        "text-success":
          item.start < this.callee_frame!.begin &&
          item.start >= this.callee_frame!.end,
        "text-info":
          item.start < this.caller_frame!.begin &&
          item.start >= this.caller_frame!.end,
      }
    },

    /**
     *
     * Transforms a value into a hextring.
     *
     * @param value
     * @param padding Padding, in bytes
     */
    toBin(value: number, padding: number): string {
      return value.toString(2).padStart(padding * 8, "0")
    },

    /**
     * Computes what values are stored in a set of bytes, according to the type.
     *
     * @param bytes
     * @param type
     *
     * @returns Array of the same length as `bytes`, with the value
     * stored in the corresponding byte, that is, the first byte for all cases
     * except the string, where its a char value per byte.
     */
    computeHumanValues(bytes: number[], type: string): string[] {
      const values = new Array(bytes.length)
      const view = new DataView(new Uint8Array(bytes).buffer)

      switch (type) {
        case "byte":
          // unsigned integer
          values[0] = view.getUint8(0)
          return values

        case "half":
          values[0] = view.getUint16(0)
          return values

        case "word":
        case "signed":
          values[0] = view.getInt32(0)
          return values

        case "unsigned":
          values[0] = view.getUint32(0)
          return values

        case "dword":
          values[0] = view.getBigInt64(0)

          return values

        case "float32":
          values[0] = view.getFloat32(0)
          return values

        case "float64":
          values[0] = view.getFloat64(0)
          return values

        case "string":
          return bytes.map(b => {
            switch (b) {
              // escape characters, such as \0, \n, etc., need to be escaped so we can show them literally
              case 0:
                return "\\0"

              case 8:
                return "\\b"

              case 9:
                return "\\t"

              case 10:
                return "\\n"

              case 12:
                return "\\f"

              case 13:
                return "\\r"

              default:
                return String.fromCharCode(b)
            }
          })

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
     * @param addr Adress to check
     *
     */
    get_pointers(addr: number): { type: string; name: string }[] {
      return REGISTERS.flatMap(bank =>
        bank.elements
          .filter(
            register =>
              // check it's one of the control registers
              register.properties.some(p =>
                this.ctrl_register_tags.includes(p),
              ) &&
              // check value is correct
              (BigInt(register.value) & 0xfffffffcn) ===
                (BigInt(addr) & 0xfffffffcn),
          )
          .map(reg => ({
            type: reg.properties.find(p =>
              this.ctrl_register_tags.includes(p),
            )!,
            name: reg.name[1] ?? reg.name[0]!,
          })),
      )
    },

    // I'd _like_ for these to be a computed method but, as none of the
    // dependencies are reactive, as we're calling
    // `this.main_memory.getWritten()`, computed caching comes into play and not
    // even force updating works.
    memory(): MemoryItem[] {
      // we show just the written memory addresses bc we don't want to store a
      // 4GiB array full of zeroes
      const mem = this.main_memory
        .getWritten()
        // we filter out the stack, we'll add it later bc not all values in the
        // stack are written values
        .filter(
          b => b.addr < Number(this.memorySegments.get("stack")!.start),
        ) as {
        addr: number
        value: number
        human?: string
      }[]
      const addresses = mem.map(b => b.addr)
      const wordSize = this.main_memory.getWordSize()

      // ensure full words
      // why do we do this? because we don't want to hold the whole simulator
      // memory array in memory, so we just get the written values, but there
      // might be gaps, bytes that were not written
      mem
        // find missing addresses
        .reduce((missing: number[], byte) => {
          // for each start of word address, check the bytes of the full word
          // are present
          if (byte.addr % wordSize === 0) {
            Array.from(range(byte.addr, byte.addr + 4)).forEach(
              (addr: number) => {
                if (!addresses.includes(addr)) missing.push(addr)
              },
            )
          }

          // do the same for the end of the word
          // FIXME: we _shouldn't_ need this, as memory is _supposed_ to be
          // aligned... but currently there's a problem with zero-terminated
          // strings (the lenght of the string does not take into account the
          // last \0). When the compiler is updated, remove this.
          if (byte.addr % wordSize === wordSize - 1) {
            Array.from(
              range(byte.addr - (wordSize - 1), byte.addr + 1),
            ).forEach((addr: number) => {
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
        const hint = this.mainMemoryHints().find(
          h => h.address === mem.at(i)!.addr,
        )
        if (hint === undefined) {
          i++
          continue
        }

        const bytes = mem.slice(i, i + hint.size).map(b => b.value)

        // compute human values and store them in memory
        this.computeHumanValues(bytes, hint.type).forEach(
          (b, j) => (mem[i + j]!.human = b),
        )

        i += hint.size
      }

      // add the stack
      for (const addr of range(this.stackTop()!, this.stackBottom()! + 1)) {
        mem.push({
          addr,
          value: this.main_memory.read(BigInt(addr)),
          // note that we don't need the "human" hints, as we'll use the last
          // written register as a hint
        })
      }

      return (
        // group bytes by words
        chunks(mem, wordSize).map(bytes => ({
          start: bytes.at(0)!.addr,
          end: bytes.at(-1)!.addr,
          bytes: bytes.map(b => ({
            addr: b.addr,
            value: b.value,
            tag: this.mainMemoryHints().find(h => h.address === b.addr)?.tag,
            human: b.human,
          })),
        }))
      )
    },

    deviceMemory(): MemoryItem[] {
      const mem = this.devices.get(this.segment)!.memory

      return chunks(mem.getAll(), mem.getWordSize()).map(bytes => ({
        start: bytes.at(0)!.addr,
        end: bytes.at(-1)!.addr,
        bytes: bytes.map((b, i, arr) => ({
          addr: b.addr,
          value: b.value,
          tag: this.deviceMemoryHints().find(x => x.address === b.addr)?.tag,
          // assume they are all words
          human:
            i === 0
              ? this.computeHumanValues(
                  arr.map(b => b.value),
                  "word",
                ).at(0)
              : undefined,
        })),
      }))
    },

    mainMemoryHints() {
      return this.main_memory
        .getAllHints()
        .map(({ address, tag, type, sizeInBits }) => ({
          address: Number(address),
          tag,
          type,
          size: sizeInBits! / this.main_memory.getBitsPerByte(),
        }))
    },

    deviceMemoryHints() {
      const device = this.devices.get(this.segment)!
      return [
        {
          address: device.ctrl_addr,
          tag: "ctrl_addr",
          size: 4,
        },
        {
          address: device.status_addr,
          tag: "status_addr",
          size: 4,
        },
      ]
    },

    stackTop() {
      return stackTracker.getCurrentFrame()?.end
    },

    stackBottom() {
      return stackTracker.getAllFrames().at(0)?.begin
    },

    getStackHint(addr: number) {
      return stackTracker.getHint(addr)
    },

    stackFrames() {
      return stackTracker.getAllFrames()
    },
  },

  computed: {
    memFields() {
      return [
        { key: "Tag", label: "" },
        "Address",
        "Binary",
        this.segment === "stack"
          ? { key: "Hint", label: "Register hint" }
          : "Value",
      ]
    },
  },
})
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
            :items="deviceIDs.includes(segment) ? deviceMemory() : memory()"
            :fields="memFields"
            :filter-function="mainMemoryFilter"
            :filter="!deviceIDs.includes(segment) ? 'yes' : undefined"
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
                  <font-awesome-icon :icon="['fas', 'right-long']" />
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
                    .filter(x => x !== undefined)
                    .join(", ")
                }}
              </span>
            </template>

            <!-- stack hints -->

            <template v-slot:cell(Hint)="row">
              <b-badge class="registerPopover">
                {{ getStackHint(row.item.start) }}
              </b-badge>
            </template>
          </b-table>
        </b-col>
      </b-row>

      <!-- stack visualizer -->

      <div v-if="segment === 'stack'" class="px-2 border">
        <span>Stack memory areas</span>

        <!-- secondary view -->
        <b-popover
          v-if="stackFrames().length > 0"
          target="stack_funct_popover"
          triggers="hover"
          placement="top"
          class="d-flex text-center"
        >
          <template #target>
            <font-awesome-icon
              :icon="['fas', 'magnifying-glass-plus']"
              id="stack_funct_popover"
              class="ms-2"
            />
          </template>

          <p class="font-monospace">0x{{ toHex(stackTop()!) }}</p>

          <b-list-group class="mb-1">
            <b-list-group-item
              v-for="(frame, index) in stackFrames().toReversed()"
              :class="{
                'text-success': index === 0,
                'text-info': index === 1,
              }"
            >
              {{ frame.name }}
            </b-list-group-item>
          </b-list-group>

          <p class="font-monospace">0x{{ toHex(stackBottom()!) }}</p>
        </b-popover>

        <!-- Free stack -->
        <b-row align-v="end" class="text-center my-1">
          <b-col cols="6" md="5" sm="2" class="border rounded ms-2">
            <!-- we use b-badge bc it makes the text smaller -->
            <b-badge variant="light" class="text-secondary">
              Free <br />
              stack
            </b-badge>
          </b-col>

          <!-- Callee -->
          <b-col v-if="stackFrames().length > 0" class="border rounded ms-1">
            <b-badge variant="light" class="text-success">
              Callee: <br />{{ callee_frame!.name }}
            </b-badge>
          </b-col>

          <!-- Caller -->
          <b-col v-if="stackFrames().length > 1" class="border rounded ms-1">
            <b-badge variant="light" class="text-info">
              Caller: <br />{{ caller_frame!.name }}
            </b-badge>
          </b-col>

          <!-- rest of frames -->
          <b-col v-if="stackFrames().length > 2" class="border rounded ms-1">
            <b-badge variant="light" class="text-secondary">
              <b>&bull;&bull;&bull;<br />{{ stackFrames().length - 2 }}</b>
            </b-badge>
          </b-col>

          <!-- System -->
          <b-col class="border rounded ms-1 me-2">
            <b-badge variant="light" class="text-body">
              System<br />stack
            </b-badge>
          </b-col>
        </b-row>
      </div>
    </b-container>

    <!-- space view -->

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
</style>
