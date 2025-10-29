<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
                    Alejandro Calderon Mateos, Luis Daniel Casais Mezquida

This file is part of CREATOR.

CREATOR is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

CREATOR is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without   max-width: 100%;
}

.bottom-nav-item {
  display: flex;ranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
-->

<script lang="ts">
import { defineComponent, type PropType, ref, onMounted, onUnmounted } from "vue"

import ToolbarBtngroup from "./ToolbarBtngroup.vue"
import SentinelErrorsDropdown from "../simulator/SentinelErrorsDropdown.vue"
import type { Instruction } from "@/core/assembler/assembler"
import type { BDropdown } from "bootstrap-vue-next"
import { coreEvents, CoreEventTypes } from "@/core/events.mjs"

export default defineComponent({
  props: {
    version: { type: String, required: true },
    architecture_name: { type: String, required: true },
    creator_mode: { type: String, required: false, default: "" },
    browser: { type: String, required: false },
    os: { type: String, required: false },
    dark: { type: Boolean, required: false, default: false },
    arch_available: { type: Array as PropType<AvailableArch[]>, required: false },
    assembly_code: { type: String, required: false },
    show_instruction_help: { type: Boolean, default: false },
    instructions: Array as PropType<Instruction[]>,
  },

  components: {
    ToolbarBtngroup,
    SentinelErrorsDropdown,
  },

  setup() {
    const sentinelDropdownRef = ref<InstanceType<typeof SentinelErrorsDropdown> | null>(null)

    const handleSentinelError = (event: unknown) => {
      const errorEvent = event as { functionName: string; message: string; ok: boolean }
      if (sentinelDropdownRef.value) {
        sentinelDropdownRef.value.checkForErrors(
          { ok: errorEvent.ok, msg: errorEvent.message },
          errorEvent.functionName
        )
      }
    }

    onMounted(() => {
      coreEvents.on(CoreEventTypes.SENTINEL_ERROR, handleSentinelError)
    })

    onUnmounted(() => {
      coreEvents.off(CoreEventTypes.SENTINEL_ERROR, handleSentinelError)
    })

    return {
      sentinelDropdownRef,
    }
  },

  data() {
    return {
      openDropdown: null as string | null, // Track which dropdown is currently open
      hoverSwitchEnabled: false, // Enable hover switching after clicking
      mobileView: 'code' as 'code' | 'instructions' | 'data' | 'architecture' | 'settings', // Track current mobile view
    }
  },
  computed: {
    showViewMenu() {
      return ['architecture', 'assembly', 'simulator'].includes(this.creator_mode)
    },
    showFileMenu() {
      return this.creator_mode === 'assembly'
    },
    showArchitectureMenu() {
      return this.creator_mode === 'architecture'
    },
    showExecuteMenu() {
      return this.creator_mode === 'simulator'
    },
    showCompileButton() {
      return this.creator_mode === 'assembly'
    },
    showLibraryMenu() {
      return this.creator_mode === 'assembly'
    },

    // Hide mobile navbar when selecting architecture
    showMobileNavbar() {
      return this.creator_mode !== 'select_architecture'
    },
  },
  mounted() {
    // Listen for escape key to close dropdowns
    document.addEventListener('keydown', this.handleEscapeKey)
    // Listen for clicks outside to disable hover switching
    document.addEventListener('click', this.handleDocumentClick)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscapeKey)
    document.removeEventListener('click', this.handleDocumentClick)
  },
  methods: {
    handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && this.openDropdown) {
        this.closeAllDropdowns()
      }
    },
    handleDocumentClick(event: MouseEvent) {
      // Check if click is outside any dropdown
      const isDropdownClick = event.target!.closest('.dropdown, .nav-item-dropdown')
      if (!isDropdownClick) {
        this.hoverSwitchEnabled = false
        this.openDropdown = null
      }
    },
    handleDropdownShow(dropdownId: string) {
      // Close any other open dropdown
      if (this.openDropdown && this.openDropdown !== dropdownId) {
        this.closeDropdown(this.openDropdown)
      }
      this.openDropdown = dropdownId
      this.hoverSwitchEnabled = true
    },
    handleDropdownHide(dropdownId: string) {
      if (this.openDropdown === dropdownId) {
        this.openDropdown = null
        // Small delay before disabling hover switch
        setTimeout(() => {
          if (!this.openDropdown) {
            this.hoverSwitchEnabled = false
          }
        }, 100)
      }
    },
    handleDropdownHover(dropdownId: string) {
      // Only switch if hover switching is enabled and a different dropdown is open
      if (this.hoverSwitchEnabled && this.openDropdown && this.openDropdown !== dropdownId) {
        // Close current dropdown and open the hovered one
        this.closeDropdown(this.openDropdown)
        setTimeout(() => {
          this.openDropdownById(dropdownId)
        }, 50)
      }
    },
    closeAllDropdowns() {
      // Close all dropdowns by triggering their hide methods
      const dropdownRefs = [
        'creatorDropdown',
        'viewDropdown', 
        'fileDropdown',
        'architectureDropdown',
        'libraryDropdown',
        'toolsDropdown',
        'helpDropdown'
      ]
      
      dropdownRefs.forEach(refName => {
        const dropdown = this.$refs[refName] as InstanceType<typeof BDropdown>
        if (dropdown) {
          if (dropdown.$el) {
            const toggleBtn = dropdown.$el.querySelector('.dropdown-toggle')
            if (toggleBtn && toggleBtn.getAttribute('aria-expanded') === 'true') {
              toggleBtn.click()
            }
          }
        }
      })
      
      this.openDropdown = null
      this.hoverSwitchEnabled = false
    },
    closeDropdown(dropdownId: string) {
      const dropdown = this.$refs[dropdownId] as InstanceType<typeof BDropdown>
      if (dropdown) {
        if (dropdown.$el) {
          const toggleBtn = dropdown.$el.querySelector('.dropdown-toggle')
          if (toggleBtn && toggleBtn.getAttribute('aria-expanded') === 'true') {
            toggleBtn.click()
          }
        }
      }
    },
    openDropdownById(dropdownId: string) {
      const dropdown = this.$refs[dropdownId] as InstanceType<typeof BDropdown>
      if (dropdown) {
        if (dropdown.$el) {
          const toggleBtn = dropdown.$el.querySelector('.dropdown-toggle')
          if (toggleBtn && toggleBtn.getAttribute('aria-expanded') === 'false') {
            toggleBtn.click()
          }
        }
      }
    },
    setMobileView(view: 'code' | 'instructions' | 'data' | 'architecture' | 'settings') {
      this.mobileView = view
      // Emit event so parent components can react to view changes
      this.$emit('mobile-view-change', view)
    },
  },
})
</script>

<template>
  <!-- Top navbar (hidden on mobile, shown on tablet+) -->
  <b-navbar toggleable="md" class="header py-3 top-navbar">
    <!-- Creator Dropdown Menu -->
    <b-navbar-nav class="creator-brand">
      <b-nav-item-dropdown 
        class="navMenu creator-menu" 
        no-caret
        no-animation
        ref="creatorDropdown"
        @show="handleDropdownShow('creatorDropdown')"
        @hide="handleDropdownHide('creatorDropdown')"
        @mouseenter="handleDropdownHover('creatorDropdown')"
      >
        <template #button-content>
          <span class="headerText text-uppercase">
            Creator
            <!-- <span class="version-badge">{{ version }}</span> -->
          </span>
        </template>

        <ToolbarBtngroup
          v-if="architecture_name"
          :group="['btn_architecture_info', 'divider']"
          :browser="browser"
          :os="os"
          :dark="dark"
          :architecture_name="architecture_name"
          dropdown-mode
          ref="creatorGroup1"
        />
        <ToolbarBtngroup
          :group="['btn_home', 'btn_website', 'btn_github', 'divider', 'btn_configuration']"
          :browser="browser"
          :os="os"
          :dark="dark"
          dropdown-mode
          ref="creatorGroup2"
        />
      </b-nav-item-dropdown>
    </b-navbar-nav>

    <b-navbar-toggle
      target="nav_collapse"
      aria-label="Open/Close menu"
    />
    
    <b-collapse is-nav id="nav_collapse">
      <!-- Main menu (left side) -->
      <b-navbar-nav class="me-auto">
        <!-- View Menu -->
        <b-nav-item-dropdown 
          v-if="showViewMenu" 
          text="View" 
          class="navMenu" 
          no-caret
          no-animation
          ref="viewDropdown"
          @show="handleDropdownShow('viewDropdown')"
          @hide="handleDropdownHide('viewDropdown')"
          @mouseenter="handleDropdownHover('viewDropdown')"
        >
          <ToolbarBtngroup
            :group="['btn_assembly']"
            :browser="browser"
            :os="os"
            :dark="dark"
            dropdown-mode
            ref="viewGroup2"
          />
          <ToolbarBtngroup
            :group="['btn_simulator']"
            :browser="browser"
            :os="os"
            :dark="dark"
            dropdown-mode
            ref="viewGroup3"
          />
          <ToolbarBtngroup
            :group="['btn_architecture']"
            :browser="browser"
            :os="os"
            :dark="dark"
            :architectures="arch_available"
            dropdown-mode
            ref="viewGroup1"
          />
        </b-nav-item-dropdown>

        <!-- File Menu (Assembly View) -->
        <b-nav-item-dropdown 
          v-if="showFileMenu" 
          text="File" 
          class="navMenu" 
          no-caret
          no-animation
          ref="fileDropdown"
          @show="handleDropdownShow('fileDropdown')"
          @hide="handleDropdownHide('fileDropdown')"
          @mouseenter="handleDropdownHover('fileDropdown')"
        >
          <ToolbarBtngroup
            :group="['dropdown_assembly_file']"
            :browser="browser"
            :os="os"
            :dark="dark"
            :assembly_code="assembly_code"
            dropdown-mode
            ref="fileGroup"
          />
        </b-nav-item-dropdown>

        <!-- Architecture Menu (Architecture View)-->
        <b-nav-item-dropdown 
          v-if="showArchitectureMenu" 
          text="Architecture" 
          class="navMenu" 
          no-caret
          no-animation
          ref="architectureDropdown"
          @show="handleDropdownShow('architectureDropdown')"
          @hide="handleDropdownHide('architectureDropdown')"
          @mouseenter="handleDropdownHover('architectureDropdown')"
        >
          <ToolbarBtngroup
            :group="['btn_edit_architecture', 'btn_save_architecture']"
            :browser="browser"
            :os="os"
            :dark="dark"
            dropdown-mode
            ref="archGroup"
          />
        </b-nav-item-dropdown>

        <!-- Library Menu (Assembly View) -->
        <b-nav-item-dropdown 
          v-if="showLibraryMenu" 
          text="Library" 
          class="navMenu" 
          no-caret
          no-animation
          ref="libraryDropdown"
          @show="handleDropdownShow('libraryDropdown')"
          @hide="handleDropdownHide('libraryDropdown')"
          @mouseenter="handleDropdownHover('libraryDropdown')"
        >
          <ToolbarBtngroup
            :group="['dropdown_library', 'btn_library_tags']"
            :browser="browser"
            :os="os"
            :dark="dark"
            dropdown-mode
            ref="libraryGroup"
          />
        </b-nav-item-dropdown>

        <!-- Tools Menu (Simulator View) -->
        <b-nav-item-dropdown 
          v-if="showExecuteMenu" 
          text="Tools" 
          class="navMenu" 
          no-caret
          no-animation
          ref="toolsDropdown"
          @show="handleDropdownShow('toolsDropdown')"
          @hide="handleDropdownHide('toolsDropdown')"
          @mouseenter="handleDropdownHover('toolsDropdown')"
        >
          <ToolbarBtngroup
            :group="['btn_flash', 'btn_calculator']"
            :browser="browser"
            :os="os"
            :dark="dark"
            dropdown-mode
            ref="toolsGroup"
          />
        </b-nav-item-dropdown>

        <!-- Help Menu -->
        <b-nav-item-dropdown 
          text="Help" 
          class="navMenu" 
          no-caret
          no-animation
          ref="helpDropdown"
          @show="handleDropdownShow('helpDropdown')"
          @hide="handleDropdownHide('helpDropdown')"
          @mouseenter="handleDropdownHover('helpDropdown')"
        >
          <ToolbarBtngroup
            :group="show_instruction_help ? ['btn_help', 'btn_instruction_help', 'btn_notifications', 'divider'] : ['btn_help', 'btn_notifications', 'divider']"
            :browser="browser"
            :os="os"
            :dark="dark"
            dropdown-mode
            ref="helpGroup1"
          />
          <ToolbarBtngroup
            :group="['btn_feedback', 'btn_suggestions', 'divider', 'btn_institutions', 'btn_about']"
            :browser="browser"
            :os="os"
            :dark="dark"
            dropdown-mode
            ref="helpGroup2"
          />
        </b-nav-item-dropdown>

        <!-- Separator for buttons -->
        <div v-if="showExecuteMenu || showCompileButton" class="button-separator"></div>

        <!-- Compile Button (Assembly View) -->
        <b-nav-item v-if="showCompileButton" class="compile-item">
          <ToolbarBtngroup
            :group="['btn_assemble', 'btn_assemble_and_run', 'btn_vim_toggle']"
            :browser="browser"
            :os="os"
            :dark="dark"
            :show_instruction_help="show_instruction_help"
            :instructions="instructions"
            compact
            ref="compileGroup"
          />
        </b-nav-item>

        <!-- Execute Controls (Simulator View) -->
        <b-nav-item v-if="showExecuteMenu" class="execute-controls">
          <ToolbarBtngroup
            :group="['btn_reset', 'btn_instruction', 'btn_run', 'btn_stop']"
            :browser="browser"
            :os="os"
            :dark="dark"
            :instructions="instructions"
            compact
            ref="executeGroup"
          />
        </b-nav-item>

        <!-- Sentinel Errors Dropdown (Simulator View Only) -->
        <SentinelErrorsDropdown
          v-if="showExecuteMenu"
          ref="sentinelDropdownRef"
          :dark="dark"
          class="ms-auto"
        />
      </b-navbar-nav>

    </b-collapse>
  </b-navbar>

  <!-- Mobile bottom navbar (shown only on mobile) -->
  <nav v-if="showMobileNavbar" class="mobile-bottom-navbar">
    <div class="bottom-nav-container">
      <!-- Code Tab -->
      <button 
        class="bottom-nav-item"
        :class="{ 'active': mobileView === 'code' }"
        @click="setMobileView('code')"
        aria-label="Code"
      >
        <font-awesome-icon :icon="['fas', 'code']" />
        <span class="bottom-nav-label">Code</span>
      </button>

      <!-- Instructions Tab -->
      <button 
        class="bottom-nav-item"
        :class="{ 'active': mobileView === 'instructions' }"
        @click="setMobileView('instructions')"
        aria-label="Instructions"
      >
        <font-awesome-icon :icon="['fas', 'book']" />
        <span class="bottom-nav-label">Instructions</span>
      </button>

      <!-- Data Tab -->
      <button 
        class="bottom-nav-item"
        :class="{ 'active': mobileView === 'data' }"
        @click="setMobileView('data')"
        aria-label="Data"
      >
        <font-awesome-icon :icon="['fas', 'database']" />
        <span class="bottom-nav-label">State</span>
      </button>

      <!-- Architecture Tab -->
      <button 
        class="bottom-nav-item"
        :class="{ 'active': mobileView === 'architecture' }"
        @click="setMobileView('architecture')"
        aria-label="Architecture"
      >
        <font-awesome-icon :icon="['fas', 'microchip']" />
        <span class="bottom-nav-label">Architecture</span>
      </button>

      <!-- Settings Tab -->
      <button 
        class="bottom-nav-item"
        :class="{ 'active': mobileView === 'settings' }"
        @click="setMobileView('settings')"
        aria-label="Settings"
      >
        <font-awesome-icon :icon="['fas', 'cog']" />
        <span class="bottom-nav-label">Settings</span>
      </button>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/bootstrap";

// Top navbar (desktop and tablet)
.top-navbar {
  width: 100%;
  align-items: center;
  min-height: 40px !important;
  max-height: 40px !important;
  background-color: rgb(238, 238, 238);
  
  :deep(.navbar-nav) {
    align-items: center;
  }

  // Hide on mobile, show on tablet+
  @media (max-width: 767px) {
    display: none;
  }
}

// Mobile bottom navbar
.mobile-bottom-navbar {
  display: none; // Hidden on desktop
  
  // Show only on mobile
  @media (max-width: 767px) {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1030;
    background-color: rgb(238, 238, 238);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    // Safe area insets for home indicator and rounded corners
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}

.bottom-nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  max-width: 100%;
  height: 56px;

  // Reduce height on very small screens
  @media (max-width: 320px) {
    height: 48px;
    padding: 6px 0;
  }
}

.bottom-nav-dropdown {
  flex: 1;
  
  :deep(.dropdown-toggle) {
    border: none;
    width: 100%;
    padding: 0;
    
    &::after {
      display: none; // Hide dropdown arrow
    }
  }

}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  color: #6c757d;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  position: relative;
  
  svg {
    font-size: 20px;
    transition: transform 0.2s ease;
  }

  // Reduce padding and icon size on very small screens (320px and below)
  @media (max-width: 320px) {
    padding: 6px 8px;
    gap: 2px;
    
    svg {
      font-size: 18px;
    }
  }

  // Active state (selected tab)
  &.active {
    color: #2196f3;
    
    svg {
      transform: scale(1.1);
    }

    // Active indicator bar
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 3px;
      background-color: #2196f3;
      border-radius: 0 0 3px 3px;

      // Smaller width on very small screens
      @media (max-width: 320px) {
        width: 24px;
      }
    }
  }

  // Tap feedback
  &:active:not(.active) {
    color: #2196f3;
    background-color: rgba(33, 150, 243, 0.08);
    
    svg {
      transform: scale(0.95);
    }
  }
}

.bottom-nav-label {
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.2s ease;

  // Smaller font on very small screens
  @media (max-width: 320px) {
    font-size: 10px;
  }
}.creator-brand {
  // On mobile, don't collapse the Creator menu
  @media (max-width: 767px) {
    flex-shrink: 0;
  }
}

.headerText {
  color: #2196f3;
  font-weight: 700;
  font-size: 1rem;

  // Slightly smaller on mobile
  @media (max-width: 767px) {
    font-size: 0.9rem;
  }
}

// Button separator (visual divider between menus and buttons)
.button-separator {
  width: 1px;
  height: 30px;
  background-color: #dee2e6;
  margin: 0 0.75rem;
}

// Dropdown menu styling
:deep(.dropdown-menu) {
  border-radius: 8px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 6px;
  margin-top: 4px;
  min-width: 0;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

:deep(.dropdown-item) {
  border-radius: 4px;
  margin-bottom: 2px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: none;
  min-width: 0;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  // Icon styling
  .fa-icon,
  svg {
    min-height: 16px;
    min-width: 16px;
    opacity: 0.85;
  }
  
  &:hover .fa-icon,
  &:hover svg {
    opacity: 1;
  }
}

// Dropdown divider
:deep(.dropdown-divider) {
  margin: 6px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  opacity: 1;
}


[data-bs-theme="dark"] {
  .top-navbar {
    background-color: hsl(214, 9%, 12%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .headerText {
    color: #64b5f6;
  }

  .button-separator {
    background-color: rgba(255, 255, 255, 0.12);
  }

  :deep(.navbar-toggler) {
    border-color: rgba(255, 255, 255, 0.1);
    
    .navbar-toggler-icon {
      filter: invert(1);
    }
  }

  // Mobile bottom navbar in dark mode
  .mobile-bottom-navbar {
    background-color: hsl(214, 9%, 12%);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  }

  .bottom-nav-item {
    color: #adb5bd;
    
    // Active state in dark mode
    &.active {
      color: #64b5f6;
      
      &::after {
        background-color: #64b5f6;
      }
    }
    
    // Tap feedback in dark mode
    &:active:not(.active) {
      color: #64b5f6;
      background-color: rgba(100, 181, 246, 0.12);
    }
  }
}


</style>