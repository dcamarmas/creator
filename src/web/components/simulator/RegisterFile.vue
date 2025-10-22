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
import { REGISTERS } from "@/core/core.mjs"
import { coreEvents } from "@/core/events.mjs"
import { clearAllRegisterGlows } from "@/core/register/registerGlowState.mjs"

import Register from "./Register.vue"
import RegisterSpaceView from "./RegisterSpaceView.vue"
import { useToggle } from "bootstrap-vue-next"
import { defineComponent } from "vue"

export default defineComponent({
  props: {
    data_mode: { type: String, required: true },
    reg_representation_int: { type: String, required: true },
    reg_representation_float: { type: String, required: true },
    reg_name_representation: { type: String, required: true },
    dark: { type: Boolean, required: true },
  },

  components: {
    Register,
    RegisterSpaceView,
  },

  setup() {
    const { show } = useToggle("registerSpaceView")
    return { showSpaceView: show }
  },

  data() {
    return {
      register_file: REGISTERS,

      // space modal
      spaceItem: null as RegisterDetailsItem | null,
      spaceView: false,

      // collapsible state for each register bank
      collapsedBanks: {} as Record<string, boolean>,
    }
  },

  mounted() {
    // Initialize all banks as expanded
    this.register_file.forEach((bank: any) => {
      this.collapsedBanks[bank.name] = false
    })

    // Subscribe to register update events from core
    coreEvents.on("register-updated", this.onRegisterUpdated)
    coreEvents.on("registers-reset", this.onRegistersReset)
    coreEvents.on("step-about-to-execute", this.clearAllGlows)
  },

  beforeUnmount() {
    // Clean up event listeners
    coreEvents.off("register-updated", this.onRegisterUpdated)
    coreEvents.off("registers-reset", this.onRegistersReset)
    coreEvents.off("step-about-to-execute", this.clearAllGlows)
  },

  methods: {
    onRegisterUpdated(payload: any) {
      const { indexComp, indexElem } = payload
      const register = REGISTERS[indexComp]?.elements[indexElem]
      
      if (!register) return
      
      // Update the specific register component
      const refs = this.$refs[`reg${register.name[0]}`] as any
      refs?.at?.(0)?.refresh()
    },

    onRegistersReset() {
      // Refresh all register components when registers are reset
      for (const bank of REGISTERS) {
        for (const reg of bank.elements) {
          const refs = this.$refs[`reg${reg.name[0]}`] as any
          refs?.at?.(0)?.refresh()
        }
      }
    },

    clearAllGlows() {
      // Clear glow effect from all registers (called before executing next instruction)
      // Clear from persistent store
      clearAllRegisterGlows()
      
      // Clear from all currently mounted register components
      for (const bank of REGISTERS) {
        for (const reg of bank.elements) {
          const refs = this.$refs[`reg${reg.name[0]}`] as any
          refs?.at?.(0)?.clearGlow()
        }
      }
    },

    toggleBank(bankName: string) {
      this.collapsedBanks[bankName] = !this.collapsedBanks[bankName]
    },

    isBankCollapsed(bankName: string): boolean {
      return this.collapsedBanks[bankName] || false
    },
  },
})
</script>

<template>
  <b-container fluid align-h="center" class="mx-0 px-0 my-0 register-file-container">
    <b-row align-h="center" cols="1" class="register-file-content">
      <b-col v-for="bank in register_file" :key="bank.name">
        <b-container fluid>
          <!-- Register bank name with collapse button -->
          <b-row>
            <b-col>
              <button 
                class="bank-header"
                @click="toggleBank(bank.name)"
                :aria-expanded="!isBankCollapsed(bank.name)"
              >
                <font-awesome-icon 
                  :icon="['fas', isBankCollapsed(bank.name) ? 'chevron-right' : 'chevron-down']" 
                  class="collapse-icon"
                />
                <h5 class="mb-0 bank-title">
                  {{ bank.name }}
                </h5>
              </button>
            </b-col>
          </b-row>
          <!-- Collapsible register content -->
          <b-collapse :visible="!isBankCollapsed(bank.name)">
            <b-row align-h="start" cols="2" cols-sm="3" cols-md="3" cols-lg="3" cols-xl="4">
              <b-col class="p-1 mx-0" v-for="(register, regIndex) in bank.elements" :key="register.name[0]">
                <Register :type="bank.type" :double_precision="bank.double_precision" :register="register"
                  :name_representation="reg_name_representation"
                  :value_representation="reg_representation_int"
                  :indexComp="register_file.indexOf(bank)"
                  :indexElem="regIndex"
                  :ref="`reg${register.name[0]}`" @register-details="
                    (item: RegisterDetailsItem) => {
                      spaceItem = item
                      showSpaceView()
                    }
                  " />
              </b-col>
            </b-row>
          </b-collapse>
        </b-container>
      </b-col>
    </b-row>
  </b-container>

  <!-- Space view -->
  <!--
  I'd like to have this information as a popover in the register, like in
  CREATOR 5, but unfortunately this creates so many components Vue craps its
  pants, so we'll have to use a modal.
  If you'd like to check how it was before, go to Register.vue on commit
  8fddb81c.
  -->
  <RegisterSpaceView id="registerSpaceView" :item="spaceItem" />
</template>

<style scoped>
.register-file-container {
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 148, 158, 0.3) transparent;
  padding: 0;
  margin: 0;
}

.register-file-container::-webkit-scrollbar {
  width: 8px;
}

.register-file-container::-webkit-scrollbar-track {
  background: transparent;
}

.register-file-container::-webkit-scrollbar-thumb {
  background-color: rgba(139, 148, 158, 0.3);
  border-radius: 4px;
}

.register-file-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(139, 148, 158, 0.5);
}

.register-file-content {
  min-height: min-content;
}

/* Collapsible bank header - libadwaita style */
.bank-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 6px;
  transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  text-align: left;
}

.bank-header:hover {
  background-color: color-mix(in srgb, currentColor 10%, transparent);
}

.bank-header:active {
  background-color: color-mix(in srgb, currentColor 15%, transparent);
}

.bank-header:focus-visible {
  outline: 2px solid color-mix(in srgb, currentColor 50%, transparent);
  outline-offset: 2px;
}

.collapse-icon {
  font-size: 12px;
  opacity: 0.7;
  transition: transform 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.bank-title {
  flex: 1;
  font-weight: 600;
  user-select: none;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .bank-header:hover {
    background-color: color-mix(in srgb, currentColor 15%, transparent);
  }
  
  .bank-header:active {
    background-color: color-mix(in srgb, currentColor 20%, transparent);
  }
}
</style>
