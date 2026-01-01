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
import { defineComponent, type PropType } from "vue";
import type { MemoryLayout } from "@/core/core";
import { toHex } from "@/web/utils.mjs";

export default defineComponent({
  props: {
    memory_layout: { type: Object as PropType<MemoryLayout>, required: true },
    inverted: { type: Boolean, default: true },
    showGaps: { type: Boolean, default: true },
    clickable: { type: Boolean, default: false },
  },

  emits: ["segment-click"],

  computed: {
    // Get memory layout segments sorted by address for display
    memoryLayoutSegments(): Array<{
      name: string;
      start: number;
      end: number;
      variant: string;
    }> {
      const segments: Array<{
        name: string;
        start: number;
        end: number;
        variant: string;
      }> = [];

      // Get all segments from memory_layout
      for (const [name, { start, end }] of Object.entries(this.memory_layout)) {
        const startNum = Number(start);
        const endNum = Number(end);

        // Only include segments with non-zero size
        if (endNum > startNum) {
          segments.push({
            name,
            start: startNum,
            end: endNum,
            variant: this.getSegmentVariant(name),
          });
        }
      }

      // Sort by start address
      return segments.sort((a, b) => a.start - b.start);
    },

    // Get segments in display order (respecting invert toggle)
    displayMemoryLayoutSegments(): Array<{
      name: string;
      start: number;
      end: number;
      variant: string;
    }> {
      return this.inverted
        ? this.memoryLayoutSegments.slice()
        : this.memoryLayoutSegments.slice().reverse();
    },
  },

  methods: {
    toHex,

    getSegmentVariant(name: string): string {
      const segmentName = name.replace(/^\.+/, "");
      switch (segmentName) {
        case "ktext":
        case "text":
          return "info";
        case "kdata":
        case "data":
          return "warning";
        case "stack":
          return "success";
        default:
          return "secondary";
      }
    },

    formatGapSize(bytes: number): string {
      if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB gap`;
      } else if (bytes >= 1024) {
        return `${(bytes / 1024).toFixed(1)} KB gap`;
      } else {
        return `${bytes} B gap`;
      }
    },

    handleSegmentClick(segmentName: string) {
      if (this.clickable) {
        this.$emit("segment-click", segmentName);
      }
    },
  },
});
</script>

<template>
  <div class="memory-layout-diagram">
    <div class="memory-layout-container">
      <!-- High/Low Addresses Label -->
      <div
        class="address-label"
        :class="inverted ? 'low-address' : 'high-address'"
      >
        {{ inverted ? "Low Addresses" : "High Addresses" }}
      </div>

      <!-- All memory segments dynamically generated -->
      <div class="memory-layout-segments">
        <template
          v-for="(segment, index) in displayMemoryLayoutSegments"
          :key="segment.name"
        >
          <!-- Gap indicator between non-contiguous segments -->
          <template v-if="showGaps">
            <!-- High to Low: current segment's end < previous segment's start means there's a gap -->

            <div
              v-if="
                !inverted &&
                index > 0 &&
                displayMemoryLayoutSegments[index - 1] &&
                segment.end <
                  (displayMemoryLayoutSegments[index - 1]?.start || 0) - 1
              "
              class="memory-segment segment-secondary segment-empty"
            >
              <div class="segment-name">...</div>

              <div class="segment-addresses">
                <div class="segment-gap-size">
                  {{
                    formatGapSize(
                      (displayMemoryLayoutSegments[index - 1]?.start || 0) -
                        segment.end,
                    )
                  }}
                </div>
              </div>
            </div>

            <!-- Low to High: current segment's start > previous segment's end means there's a gap -->

            <div
              v-if="
                inverted &&
                index > 0 &&
                displayMemoryLayoutSegments[index - 1] &&
                segment.start >
                  (displayMemoryLayoutSegments[index - 1]?.end || 0) + 1
              "
              class="memory-segment segment-secondary segment-empty"
            >
              <div class="segment-name">...</div>

              <div class="segment-addresses">
                <div class="segment-gap-size">
                  {{
                    formatGapSize(
                      segment.start -
                        (displayMemoryLayoutSegments[index - 1]?.end || 0),
                    )
                  }}
                </div>
              </div>
            </div>
          </template>

          <!-- Data/Heap growth arrow -->
          <!-- When NOT inverted (high→low): arrow ABOVE data, pointing UP -->
          <!-- When inverted (low→high): arrow BELOW data, pointing DOWN -->
          <div
            v-if="segment.name.toLowerCase().includes('data') && !inverted"
            class="growth-indicator-row data-growth"
          >
            <div class="growth-label">Heap grows</div>

            <div class="growth-arrow">↑</div>
          </div>

          <!-- Stack growth arrow -->
          <!-- When NOT inverted (high→low): arrow BELOW stack, pointing DOWN -->
          <!-- When inverted (low→high): arrow ABOVE stack, pointing UP -->
          <div
            v-if="segment.name.toLowerCase().includes('stack') && inverted"
            class="growth-indicator-row stack-growth"
          >
            <div class="growth-arrow">↑</div>

            <div class="growth-label">Stack grows</div>
          </div>

          <!-- Actual segment -->
          <div
            class="memory-segment"
            :class="[`segment-${segment.variant}`, { clickable }]"
            @click="handleSegmentClick(segment.name)"
          >
            <div class="segment-addresses segment-address-top">
              0x{{
                (inverted ? segment.start : segment.end)
                  .toString(16)
                  .toUpperCase()
                  .padStart(8, "0")
              }}
            </div>

            <div class="segment-content">
              <div class="segment-name">
                {{
                  segment.name.startsWith(".")
                    ? segment.name
                    : `.${segment.name}`
                }}
              </div>
            </div>

            <div class="segment-addresses segment-address-bottom">
              0x{{
                (inverted ? segment.end : segment.start)
                  .toString(16)
                  .toUpperCase()
                  .padStart(8, "0")
              }}
            </div>
          </div>

          <!-- Stack growth arrow -->
          <!-- When NOT inverted (high→low): arrow BELOW stack, pointing DOWN -->
          <!-- When inverted (low→high): arrow ABOVE stack, pointing UP -->
          <div
            v-if="segment.name.toLowerCase().includes('stack') && !inverted"
            class="growth-indicator-row stack-growth"
          >
            <div class="growth-arrow">↓</div>

            <div class="growth-label">Stack grows</div>
          </div>

          <!-- Data/Heap growth arrow -->
          <!-- When NOT inverted (high→low): arrow ABOVE data, pointing UP -->
          <!-- When inverted (low→high): arrow BELOW data, pointing DOWN -->
          <div
            v-if="segment.name.toLowerCase().includes('data') && inverted"
            class="growth-indicator-row data-growth"
          >
            <div class="growth-label">Heap grows</div>

            <div class="growth-arrow">↓</div>
          </div>
        </template>
      </div>

      <!-- Low/High Addresses Label -->
      <div
        class="address-label"
        :class="inverted ? 'high-address' : 'low-address'"
      >
        {{ inverted ? "High Addresses" : "Low Addresses" }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.memory-layout-diagram {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 12px 0;
}

.memory-layout-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
}

.address-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: rgba(0, 0, 0, 0.6);
  margin: 4px 0;
  padding: 4px 12px;
  position: relative;
}

.address-label.high-address {
  margin-top: 0;
  margin-bottom: 8px;
}

.address-label.low-address {
  margin-top: 8px;
  margin-bottom: 0;
}

.memory-layout-segments {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  border-left: 2px solid rgba(0, 0, 0, 0.3);
  border-right: 2px solid rgba(0, 0, 0, 0.3);
}

.memory-segment {
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 0;
  transition: all 0.2s ease;
  border: 1.5px solid rgba(0, 0, 0, 0.3);
  border-left: none;
  border-right: none;
  font-family:
    "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New",
    monospace;
  min-height: 50px;
  position: relative;
}

.memory-segment.clickable {
  cursor: pointer;
}

.memory-segment.clickable:not(.segment-empty):hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.memory-segment.segment-empty {
  cursor: default;
  opacity: 0.5;
  border-style: dashed;
  border-left: none;
  border-right: none;
  min-height: 30px;
  justify-content: center;
  align-items: center;
}

.memory-segment.segment-empty:hover {
  transform: none;
  box-shadow: none;
}

.segment-address-top {
  padding: 3px 12px;
  font-size: 0.7rem;
  font-weight: 600;
  background-color: rgba(0, 0, 0, 0.05);
  text-align: center;
}

.segment-address-bottom {
  padding: 3px 12px;
  font-size: 0.7rem;
  font-weight: 600;
  background-color: rgba(0, 0, 0, 0.05);
  text-align: center;
}

.segment-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
}

.segment-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.9);
  opacity: 0.95;
  text-align: center;
}

.segment-addresses {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.9);
  opacity: 0.95;
  font-weight: 500;
}

.segment-gap-size {
  font-size: 0.75rem;
  opacity: 0.7;
  font-style: italic;
  text-align: center;
}

/* Growth Indicators */
.growth-indicator-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
  padding: 8px 0;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  opacity: 0.7;
  background-color: rgba(0, 0, 0, 0.02);
}

.growth-arrow {
  font-size: 1.8rem;
  line-height: 1;
  font-weight: bold;
  animation: pulse 2s ease-in-out infinite;
}

.growth-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

.memory-segment.segment-info {
  background-color: rgba(23, 162, 184, 0.15);
}

.memory-segment.segment-warning {
  background-color: rgba(255, 193, 7, 0.15);
}

.memory-segment.segment-success {
  background-color: rgba(40, 167, 69, 0.15);
}

.memory-segment.segment-secondary {
  background-color: rgba(108, 117, 125, 0.15);
}

[data-bs-theme="dark"] {
  .address-label {
    color: rgba(255, 255, 255, 0.6);
  }

  .memory-layout-segments {
    border-left-color: rgba(255, 255, 255, 0.4);
    border-right-color: rgba(255, 255, 255, 0.4);
  }

  .segment-address-top,
  .segment-address-bottom {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .segment-name {
    color: rgba(255, 255, 255, 0.9);
  }

  .segment-addresses {
    color: rgba(255, 255, 255, 0.9);
  }

  .growth-indicator-row {
    color: rgba(255, 255, 255, 0.7);
    background-color: rgba(255, 255, 255, 0.02);
  }

  .memory-segment.segment-info {
    background-color: rgba(23, 162, 184, 0.25);
  }

  .memory-segment.segment-warning {
    background-color: rgba(255, 193, 7, 0.25);
  }

  .memory-segment.segment-success {
    background-color: rgba(40, 167, 69, 0.25);
  }

  .memory-segment.segment-secondary {
    background-color: rgba(108, 117, 125, 0.25);
  }
}
</style>
