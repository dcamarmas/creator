<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
                    Alejandro Calderon Mateos, Jorge Ramos Santana

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
import { defineComponent } from "vue"
import { stats, type Stat } from "@/core/executor/stats.mts"
import { status } from "@/core/core.mjs"
import { coreEvents } from "@/core/events.mjs"

export default defineComponent({
  props: {
    dark: { type: Boolean, required: true },
    representation: { type: String, required: true },
    type: { type: String, required: true },
  },

  data() {
    return {
      stats: stats as Map<string, Stat>,
      status,
      render: false, // toggle this to trigger reactive recalculation
      currentRepresentation: this.representation, // Local state for toggle
    }
  },

  mounted() {
    // Subscribe to stats update events from core
    coreEvents.on("stats-updated", this.onStatsUpdated)
  },

  beforeUnmount() {
    // Clean up event listener
    coreEvents.off("stats-updated", this.onStatsUpdated)
  },

  computed: {
    // Get all stats as an array for display
    statsArray(): Array<{ type: string; stat: Stat }> {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.render // Create reactive dependency
      
      const arr: Array<{ type: string; stat: Stat }> = []
      this.stats.forEach((stat, type) => {
        arr.push({ type, stat })
      })
      return arr
    },

    // Total instructions executed
    totalInstructions(): number {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.render
      return this.status.executedInstructions
    },

    // Total cycles
    totalCycles(): number {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.render
      return this.status.clkCycles
    },

    // CPI (Cycles Per Instruction)
    cpi(): string {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.render
      if (this.totalInstructions === 0) return "0.00"
      return (this.totalCycles / this.totalInstructions).toFixed(2)
    },

    // IPC (Instructions Per Cycle)
    ipc(): string {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.render
      if (this.totalCycles === 0) return "0.00"
      return (this.totalInstructions / this.totalCycles).toFixed(2)
    },

    // Filter based on type prop
    filteredStats(): Array<{ type: string; stat: Stat }> {
      // Show stats for "instruction_stats" or "instructions" (default)
      if (this.type === "instruction_stats" || this.type === "instructions") {
        return this.statsArray
      }
      return this.statsArray // Default to showing all stats
    },

    // Display value based on current representation
    displayValue(): (stat: Stat) => number {
      return (stat: Stat) => {
        // Use local state for representation
        if (this.currentRepresentation === "cycles") {
          return stat.cycles
        }
        // Default to instructions
        return stat.instructions
      }
    },

    // Get max value for progress bar calculation
    maxValue(): number {
      if (this.filteredStats.length === 0) return 1
      
      const values = this.filteredStats.map(item => this.displayValue(item.stat))
      const max = Math.max(...values)
      return max > 0 ? max : 1
    },
  },

  methods: {
    onStatsUpdated() {
      this.refresh()
    },

    refresh() {
      // Toggle to trigger computed property recalculation
      this.render = !this.render
    },

    // Calculate percentage for progress bar
    getPercentage(value: number): number {
      if (this.maxValue === 0) return 0
      return (value / this.maxValue) * 100
    },

    // Format large numbers with commas
    formatNumber(num: number): string {
      return num.toLocaleString()
    },

    // Toggle between instructions and cycles
    setRepresentation(value: string) {
      this.currentRepresentation = value
    },
  },
})
</script>

<template>
  <div class="stats-container">
    <div class="stats-content">
      <!-- Summary Section -->
      <div class="stats-summary">
        <div class="summary-card">
          <div class="summary-label">Total Instructions</div>
          <div class="summary-value">{{ formatNumber(totalInstructions) }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Cycles</div>
          <div class="summary-value">{{ formatNumber(totalCycles) }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">CPI</div>
          <div class="summary-value">{{ cpi }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">IPC</div>
          <div class="summary-value">{{ ipc }}</div>
        </div>
      </div>

      <!-- Instruction Type Statistics -->
      <div class="stats-section">
        <div class="section-header">
          <h6 class="section-title">Instruction Statistics</h6>
          <div class="view-toggle">
            <button
              class="toggle-btn"
              :class="{ active: currentRepresentation === 'instructions' }"
              @click="setRepresentation('instructions')"
            >
              Count
            </button>
            <button
              class="toggle-btn"
              :class="{ active: currentRepresentation === 'cycles' }"
              @click="setRepresentation('cycles')"
            >
              Cycles
            </button>
          </div>
        </div>

        <div class="stats-list">
          <div
            v-for="item in filteredStats"
            :key="item.type"
            class="stat-item"
          >
            <div class="stat-info">
              <div class="stat-name">{{ item.type }}</div>
              <div class="stat-value">{{ formatNumber(displayValue(item.stat)) }}</div>
            </div>
            <div class="stat-bar-container">
              <div
                class="stat-bar"
                :style="{ width: getPercentage(displayValue(item.stat)) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stats-container {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 148, 158, 0.3) transparent;
  padding: 8px;
}

.stats-container::-webkit-scrollbar {
  width: 8px;
}

.stats-container::-webkit-scrollbar-track {
  background: transparent;
}

.stats-container::-webkit-scrollbar-thumb {
  background-color: rgba(139, 148, 158, 0.3);
  border-radius: 4px;
}

.stats-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(139, 148, 158, 0.5);
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Summary Cards */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
}

.summary-card {
  padding: 8px 10px;
  border-radius: 6px;
  background-color: rgba(var(--bs-secondary-rgb), 0.08);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.summary-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--bs-body-color-rgb), 0.7);
  margin-bottom: 3px;
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
  color: rgba(var(--bs-body-color-rgb), 1);
}

/* Stats Section */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--bs-body-color-rgb), 0.8);
}

.view-toggle {
  display: flex;
  gap: 4px;
  background-color: rgba(var(--bs-secondary-rgb), 0.1);
  padding: 2px;
  border-radius: 6px;
}

.toggle-btn {
  padding: 4px 12px;
  border: none;
  background: transparent;
  color: rgba(var(--bs-body-color-rgb), 0.7);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  user-select: none;
}

.toggle-btn:hover:not(:disabled) {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  color: rgba(var(--bs-body-color-rgb), 1);
}

.toggle-btn.active {
  background-color: rgba(var(--bs-primary-rgb), 0.15);
  color: rgba(var(--bs-primary-rgb), 1);
  font-weight: 700;
}

.toggle-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Stats List */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 4px;
  background-color: rgba(var(--bs-light-rgb), 0.3);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.stat-item:hover {
  background-color: rgba(var(--bs-light-rgb), 0.5);
  border-color: rgba(0, 0, 0, 0.12);
}

.stat-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(var(--bs-body-color-rgb), 0.9);
}

.stat-value {
  font-size: 0.8rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
  color: rgba(var(--bs-primary-rgb), 1);
}

.stat-bar-container {
  width: 100%;
  height: 4px;
  background-color: rgba(var(--bs-secondary-rgb), 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(var(--bs-primary-rgb), 0.8) 0%, 
    rgba(var(--bs-primary-rgb), 1) 100%
  );
  border-radius: 2px;
  transition: width 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Dark mode adjustments */
[data-bs-theme="dark"] {
  .summary-card {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .summary-card:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }

  .summary-label {
    color: rgba(255, 255, 255, 0.7);
  }

  .summary-value {
    color: rgba(255, 255, 255, 1);
  }

  .section-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .section-title {
    color: rgba(255, 255, 255, 0.8);
  }

  .view-toggle {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .toggle-btn {
    color: rgba(255, 255, 255, 0.7);
  }

  .toggle-btn:hover:not(:disabled) {
    background-color: rgba(var(--bs-primary-rgb), 0.15);
    color: rgba(255, 255, 255, 1);
  }

  .stat-item {
    background-color: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.08);
  }

  .stat-item:hover {
    background-color: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .stat-name {
    color: rgba(255, 255, 255, 0.9);
  }

  .stat-bar-container {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .stats-container {
    padding: 6px;
  }

  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-card {
    padding: 6px 8px;
  }

  .summary-value {
    font-size: 1rem;
  }

  .section-header {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
}
</style>
