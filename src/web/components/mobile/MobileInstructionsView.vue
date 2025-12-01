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
import TableExecution from "@/web/components/simulator/TableExecution.vue";
import SimulatorControls from "@/web/components/simulator/SimulatorControls.vue";
import type { Instruction } from "@/core/assembler/assembler";

export default defineComponent({
  props: {
    instructions: Array as PropType<Instruction[]>,
    enter: { type: [Boolean, null], required: true },
    browser: { type: String, required: true },
    os: { type: String, required: true },
    dark: { type: Boolean, required: true },
  },

  emits: ["reset-simulator", "show-toast"],

  components: {
    TableExecution,
    SimulatorControls,
  },

  data() {
    return {
      // Execution controls will be handled by SimulatorControls
    };
  },
});
</script>

<template>
  <div class="mobile-instructions-view">
    <!-- Header with execution controls -->
    <div class="mobile-instructions-header">
      <div class="instructions-info">
        <h3 class="instructions-title">
          <font-awesome-icon :icon="['fas', 'book']" /> Instructions
        </h3>
      </div>

      <div class="execution-controls">
        <SimulatorControls
          :browser="browser"
          :os="os"
          :dark="dark"
          :instructions="instructions!"
          :autoscroll="true"
          mode="toolbar"
          ref="executionControls"
        />
      </div>
    </div>

    <!-- Instructions table -->
    <div class="mobile-instructions-table">
      <TableExecution
        v-if="instructions && instructions.length > 0"
        :instructions="instructions"
        :enter="enter"
        ref="tableExecution"
      />
      <div v-else class="no-instructions">
        <div class="no-instructions-content">
          <font-awesome-icon
            :icon="['fas', 'book-open']"
            class="no-instructions-icon"
          />
          <h4>No Instructions</h4>

          <p>Assemble your code to see the instruction table here.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mobile-instructions-view {
  position: fixed;
  top: env(safe-area-inset-top);
  left: 0;
  right: 0;
  bottom: calc(
    56px + env(safe-area-inset-bottom)
  ); // Above mobile navbar + safe area

  // Reduce bottom spacing on very small screens to match navbar height
  @media (max-width: 320px) {
    bottom: calc(48px + env(safe-area-inset-bottom));
  }
  background-color: var(--bs-body-bg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none; // Prevent text selection on mobile

  // Dark mode support
  [data-bs-theme="dark"] & {
    background-color: hsl(214, 9%, 12%);
  }
}

.mobile-instructions-header {
  padding: 1rem;
  border-bottom: 1px solid var(--bs-border-color);
  background-color: var(--bs-body-bg);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-shrink: 0;

  .instructions-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .instructions-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--bs-body-color);
      display: flex;
      align-items: center;
      gap: 0.5rem;

      svg {
        color: var(--bs-primary);
      }
    }

    .instructions-count {
      font-size: 0.75rem;
      color: var(--bs-secondary-color);
      background-color: var(--bs-light);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      align-self: flex-start;

      [data-bs-theme="dark"] & {
        background-color: hsl(214, 9%, 20%);
        color: var(--bs-body-color);
      }
    }
  }

  .execution-controls {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.25rem;

    // Style the SimulatorControls buttons for mobile
    :deep(.btn) {
      min-height: 44px; // Touch-friendly
      min-width: 60px;
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      flex-shrink: 0;

      svg {
        font-size: 1.1rem;
      }

      &:disabled {
        opacity: 0.5;
      }
    }
  }
}

.mobile-instructions-table {
  flex: 1;
  overflow: hidden;
  position: relative;

  .no-instructions {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;

    .no-instructions-content {
      text-align: center;
      color: var(--bs-secondary-color);

      .no-instructions-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      h4 {
        margin-bottom: 0.5rem;
        color: var(--bs-body-color);
      }

      p {
        margin: 0;
        font-size: 0.9rem;
      }
    }
  }
}

// Mobile optimizations
@media (max-width: 480px) {
  .mobile-instructions-header {
    padding: 0.75rem;

    .instructions-info {
      .instructions-title {
        font-size: 1.1rem;
      }
    }

    .execution-controls {
      gap: 0.25rem;

      :deep(.btn) {
        min-width: 50px;
        padding: 0.4rem 0.3rem;

        svg {
          font-size: 1rem;
        }
      }
    }
  }
}

// Touch-friendly interactions
@media (hover: none) and (pointer: coarse) {
  .control-btn {
    min-height: 50px; // Minimum touch target
    padding: 0.6rem 0.4rem;
  }
}

// Dark mode adjustments
[data-bs-theme="dark"] {
  .mobile-instructions-view {
    .mobile-instructions-header {
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
