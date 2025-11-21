<!--
Copyright 2018-2025 CREATOR Team.

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
import { defineComponent, type PropType } from "vue";
import { architecture, type Instruction } from "@/core/core";

export default defineComponent({
  props: {
    instruction: { type: Object as PropType<Instruction>, required: true },
  },

  data() {
    return {
      architecture,
    };
  },

  computed: {
    /**
     * Group fields by word for multi-word instructions
     * Handles non-contiguous fields (like RISC-V immediates)
     * Calculates word numbers from absolute bit positions
     */
    wordGroups() {
      const groups = new Map<
        number,
        Array<{
          name: string;
          type: string;
          startBit: number;
          endBit: number;
          width: number;
          value?: string;
          segmentIndex?: number;
          totalSegments?: number;
        }>
      >();

      const wordSize = this.architecture.config.word_size;

      for (let i = 0; i < this.instruction.fields.length; i++) {
        const field = this.instruction.fields[i];
        if (!field) continue;

        // Handle non-contiguous fields (arrays of startbit/stopbit)
        if (Array.isArray(field.startbit) && Array.isArray(field.stopbit)) {
          // Field has multiple non-contiguous segments
          const totalSegments = field.startbit.length;

          for (let segIdx = 0; segIdx < field.startbit.length; segIdx++) {
            const startBit = field.startbit[segIdx];
            const stopBit = field.stopbit[segIdx];

            if (startBit === undefined || stopBit === undefined) continue;

            // Calculate word number from absolute bit position
            const wordNum = Math.floor(startBit / wordSize);

            if (!groups.has(wordNum)) {
              groups.set(wordNum, []);
            }

            const width = Math.abs(stopBit - startBit) + 1;

            groups.get(wordNum)!.push({
              name: field.name,
              type: field.type,
              startBit,
              endBit: stopBit,
              width,
              value: field.value,
              segmentIndex: segIdx,
              totalSegments,
            });
          }
        } else {
          // Single startbit/stopbit value
          const startBit = Array.isArray(field.startbit)
            ? field.startbit[0]
            : field.startbit;
          const stopBit = Array.isArray(field.stopbit)
            ? field.stopbit[0]
            : field.stopbit;

          if (startBit === undefined || stopBit === undefined) continue;

          // Calculate the word number(s) this field spans
          const startWord = Math.floor(startBit / wordSize);
          const stopWord = Math.floor(stopBit / wordSize);

          if (startWord === stopWord) {
            // Field is within a single word
            if (!groups.has(startWord)) {
              groups.set(startWord, []);
            }

            const width = Math.abs(stopBit - startBit) + 1;

            groups.get(startWord)!.push({
              name: field.name,
              type: field.type,
              startBit,
              endBit: stopBit,
              width,
              value: field.value,
            });
          } else {
            // Field spans multiple words - split it up
            let currentBit = startBit;

            // Process each word the field spans
            for (let wordNum = startWord; wordNum >= stopWord; wordNum--) {
              if (!groups.has(wordNum)) {
                groups.set(wordNum, []);
              }

              // Calculate the bit range within this word
              const wordStartBit = (wordNum + 1) * wordSize - 1;
              const wordStopBit = wordNum * wordSize;

              const segmentStartBit = Math.min(currentBit, wordStartBit);
              const segmentStopBit = Math.max(stopBit, wordStopBit);

              const bitsInThisWord = segmentStartBit - segmentStopBit + 1;

              groups.get(wordNum)!.push({
                name: field.name,
                type: field.type,
                startBit: segmentStartBit,
                endBit: segmentStopBit,
                width: bitsInThisWord,
                value: field.value,
                segmentIndex: startWord - wordNum,
                totalSegments: startWord - stopWord + 1,
              });

              currentBit -= bitsInThisWord;
            }
          }
        }
      }

      // Sort blocks within each word by start bit (descending)
      groups.forEach(blocks => {
        blocks.sort((a, b) => b.startBit - a.startBit);
      });

      return groups;
    },

    /**
     * Get sorted word numbers
     */
    sortedWords(): number[] {
      return Array.from(this.wordGroups.keys()).sort((a, b) => a - b);
    },

    /**
     * Check if this is a multi-word instruction
     */
    isMultiWord(): boolean {
      return this.instruction.nwords > 1;
    },

    /**
     * Calculate the total bit width for a specific word by summing all field widths
     */
    getWordBitWidth() {
      return (wordNum: number): number => {
        const fields = this.wordGroups.get(wordNum);
        if (!fields || fields.length === 0) return 0;
        return fields.reduce((sum, field) => sum + field.width, 0);
      };
    },

    /**
     * Calculate the total bit width for single-word instructions
     */
    totalBitWidth(): number {
      return this.encodingBlocks.reduce((sum, block) => sum + block.width, 0);
    },

    /**
     * Process fields for visualization
     * Groups fields by their bit positions and creates visual blocks
     * Handles non-contiguous fields (like RISC-V immediates)
     */
    encodingBlocks() {
      const blocks: Array<{
        name: string;
        type: string;
        startBit: number;
        endBit: number;
        width: number;
        value?: string;
        segmentIndex?: number;
        totalSegments?: number;
      }> = [];

      this.instruction.fields.forEach(field => {
        // Handle non-contiguous fields (arrays of startbit/stopbit)
        if (Array.isArray(field.startbit) && Array.isArray(field.stopbit)) {
          const totalSegments = field.startbit.length;

          for (let segIdx = 0; segIdx < field.startbit.length; segIdx++) {
            const startBit = field.startbit[segIdx];
            const stopBit = field.stopbit[segIdx];

            if (startBit === undefined || stopBit === undefined) continue;
            const width = Math.abs(stopBit - startBit) + 1;

            blocks.push({
              name: field.name,
              type: field.type,
              startBit,
              endBit: stopBit,
              width,
              value: field.value,
              segmentIndex: segIdx,
              totalSegments,
            });
          }
        } else {
          // Contiguous field (normal case)
          const startBit = Array.isArray(field.startbit)
            ? field.startbit[0]
            : field.startbit;
          const stopBit = Array.isArray(field.stopbit)
            ? field.stopbit[0]
            : field.stopbit;

          if (startBit === undefined || stopBit === undefined) return;
          const width = Math.abs(stopBit - startBit) + 1;

          blocks.push({
            name: field.name,
            type: field.type,
            startBit,
            endBit: stopBit,
            width,
            value: field.value,
          });
        }
      });

      // Sort by start bit (descending for visual representation)
      return blocks.sort((a, b) => b.startBit - a.startBit);
    },

    /**
     * Get color scheme based on field type
     */
    getFieldColor() {
      return (type: string): string => {
        const colorMap: Record<string, string> = {
          co: "rgba(255, 99, 71, 0.3)", // Red for opcode
          cop: "rgba(255, 99, 71, 0.2)", // Light red for extended opcode
          reg: "rgba(54, 162, 235, 0.3)", // Blue for registers
          "imm-signed": "rgba(75, 192, 192, 0.3)", // Teal for signed immediate
          "imm-unsigned": "rgba(153, 102, 255, 0.3)", // Purple for unsigned immediate
          address: "rgba(255, 206, 86, 0.3)", // Yellow for address
          offset_bytes: "rgba(255, 159, 64, 0.3)", // Orange for byte offset
          offset_words: "rgba(255, 159, 64, 0.3)", // Orange for word offset
        };
        return colorMap[type] ?? "rgba(199, 199, 199, 0.3)";
      };
    },
  },
});
</script>

<template>

  <div class="encoding-container">
     <!-- Multi-word instruction visualization --> <template v-if="isMultiWord"
      >
      <div v-for="wordNum in sortedWords" :key="wordNum" class="word-container">

        <div class="word-label">Word {{ wordNum }}</div>
         <!-- Bit ruler for this word -->
        <div class="bit-ruler">
           <span class="bit-number">{{ getWordBitWidth(wordNum) - 1 }}</span
          > <span class="bit-spacer"></span> <span class="bit-number">0</span>
        </div>
         <!-- Encoding blocks for this word -->
        <div class="encoding-blocks">

          <div
            v-for="(block, index) in wordGroups.get(wordNum)"
            :key="`word${wordNum}-${block.name}-${index}`"
            class="encoding-block"
            :class="{
              'non-contiguous': block.totalSegments && block.totalSegments > 1,
            }"
            :style="{
              flex: block.width,
              background: getFieldColor(block.type),
            }"
            :title="
              block.totalSegments && block.totalSegments > 1
                ? `${block.name} (${block.type}): bits ${block.startBit}-${block.endBit} [segment ${block.segmentIndex! + 1}/${block.totalSegments}]`
                : `${block.name} (${block.type}): bits ${block.startBit}-${block.endBit}`
            "
          >

            <div class="block-content">
               <span class="block-name"
                > {{ block.name }} <span
                  v-if="block.totalSegments && block.totalSegments > 1"
                  class="segment-marker"
                  > [{{ block.segmentIndex! + 1 }}/{{ block.totalSegments }}]
                  </span
                > </span
              > <span class="block-bits">{{ block.width }}</span
              > <span v-if="block.value" class="block-value">{{
                block.value
              }}</span
              >
            </div>

          </div>

        </div>

      </div>
       </template
    > <!-- Single-word instruction visualization (legacy) --> <template v-else
      > <!-- Bit ruler at top -->
      <div class="bit-ruler">
         <span class="bit-number">{{ totalBitWidth - 1 }}</span
        > <span class="bit-spacer"></span> <span class="bit-number">0</span>
      </div>
       <!-- Encoding blocks -->
      <div class="encoding-blocks">

        <div
          v-for="(block, index) in encodingBlocks"
          :key="`${block.name}-${index}`"
          class="encoding-block"
          :class="{
            'non-contiguous': block.totalSegments && block.totalSegments > 1,
          }"
          :style="{
            flex: block.width,
            background: getFieldColor(block.type),
          }"
          :title="
            block.totalSegments && block.totalSegments > 1
              ? `${block.name} (${block.type}): bits ${block.startBit}-${block.endBit} [segment ${block.segmentIndex! + 1}/${block.totalSegments}]`
              : `${block.name} (${block.type}): bits ${block.startBit}-${block.endBit}`
          "
        >

          <div class="block-content">
             <span class="block-name"
              > {{ block.name }} <span
                v-if="block.totalSegments && block.totalSegments > 1"
                class="segment-marker"
                > [{{ block.segmentIndex! + 1 }}/{{ block.totalSegments }}]
                </span
              > </span
            > <span class="block-bits">{{ block.width }}</span
            > <span v-if="block.value" class="block-value">{{
              block.value
            }}</span
            >
          </div>

        </div>

      </div>
       </template
    > <!-- Legend for field types --> <!-- <div class="encoding-legend">
      <span class="legend-item" v-if="instruction.co">
        <span class="legend-color" style="background: rgba(255, 99, 71, 0.3)"></span>
        CO: {{ instruction.co }}
      </span>
      <span class="legend-item" v-if="isMultiWord">
        <span class="instruction-info">{{ instruction.nwords }} words</span>
      </span>
    </div> -->
  </div>

</template>

<style lang="scss" scoped>
.encoding-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.07);
  min-width: 280px;
}

.word-container {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-of-type {
    border-bottom: none;
  }
}

.word-label {
  font-size: 0.625rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.bit-ruler {
  display: flex;
  justify-content: space-between;
  font-size: 0.6875rem;
  color: rgba(0, 0, 0, 0.6);
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  padding: 0 2px;
  margin-bottom: 2px;

  .bit-number {
    font-weight: 600;
  }

  .bit-spacer {
    flex: 1;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.15);
    margin: 0 8px;
    align-self: center;
  }
}

.encoding-blocks {
  display: flex;
  height: 48px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.encoding-block {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(0, 0, 0, 0.15);
  position: relative;
  transition: filter 0.1s ease;
  min-width: 36px;

  &:last-child {
    border-right: none;
  }

  &:hover {
    filter: brightness(0.95);
  }

  // Visual indicator for non-contiguous fields
  &.non-contiguous {
    border: 2px dashed rgba(0, 0, 0, 0.3);
    border-right: 2px dashed rgba(0, 0, 0, 0.3);
    
    &:last-child {
      border-right: 2px dashed rgba(0, 0, 0, 0.3);
    }
  }

  .block-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px;
    text-align: center;
    width: 100%;
  }

  .block-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    
    .segment-marker {
      font-size: 0.625rem;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    }
  }

  .block-bits {
    font-size: 0.625rem;
    color: rgba(0, 0, 0, 0.5);
    font-weight: 600;
  }

  .block-value {
    font-size: 0.625rem;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    color: rgba(0, 0, 0, 0.9);
    font-weight: 700;
    background: rgba(0, 0, 0, 0.1);
    padding: 1px 4px;
    border-radius: 2px;
    margin-top: 2px;
  }
}

.encoding-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.6875rem;
  color: rgba(0, 0, 0, 0.7);
  padding-top: 4px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-weight: 600;
  }

  .legend-color {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }

  .instruction-info {
    color: rgba(0, 0, 0, 0.6);
    font-style: italic;
  }
}

[data-bs-theme="dark"] {
  .encoding-container {
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .word-container {
    border-bottom-color: rgba(255, 255, 255, 0.05);
  }

  .word-label {
    color: rgba(255, 255, 255, 0.5);
  }

  .bit-ruler {
    color: rgba(255, 255, 255, 0.6);

    .bit-spacer {
      border-bottom-color: rgba(255, 255, 255, 0.15);
    }
  }

  .encoding-blocks {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .encoding-block {
    border-right-color: rgba(255, 255, 255, 0.15);

    &:hover {
      filter: brightness(1.1);
    }

    &.non-contiguous {
      border-color: rgba(255, 255, 255, 0.4);
    }

    .block-name {
      color: rgba(255, 255, 255, 0.9);
      
      .segment-marker {
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .block-value {
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.1);
    }

    .block-bits {
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .encoding-legend {
    color: rgba(255, 255, 255, 0.7);

    .legend-color {
      border-color: rgba(255, 255, 255, 0.2);
    }

    .instruction-info {
      color: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>

