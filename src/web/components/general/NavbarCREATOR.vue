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
import { defineComponent } from "vue"

import ToolbarBtngroup from "./ToolbarBtngroup.vue"

export default defineComponent({
  props: {
    version: { type: String, required: true },
    architecture_name: { type: String, required: true },
    creator_mode: { type: String, required: false, default: "" },
    browser: { type: String, required: false },
    os: { type: String, required: false },
    dark: { type: Boolean, required: false, default: false },
    arch_available: { type: Array, required: false },
    assembly_code: { type: String, required: false },
    show_instruction_help: { type: Boolean, default: false },
    instructions: Array,
  },
  data() {
    return {
      openDropdown: null, // Track which dropdown is currently open
      hoverSwitchEnabled: false, // Enable hover switching after clicking
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
    handleEscapeKey(event) {
      if (event.key === 'Escape' && this.openDropdown) {
        this.closeAllDropdowns()
      }
    },
    handleDocumentClick(event) {
      // Check if click is outside any dropdown
      const isDropdownClick = event.target.closest('.dropdown, .nav-item-dropdown')
      if (!isDropdownClick) {
        this.hoverSwitchEnabled = false
        this.openDropdown = null
      }
    },
    handleDropdownShow(dropdownId) {
      // Close any other open dropdown
      if (this.openDropdown && this.openDropdown !== dropdownId) {
        this.closeDropdown(this.openDropdown)
      }
      this.openDropdown = dropdownId
      this.hoverSwitchEnabled = true
    },
    handleDropdownHide(dropdownId) {
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
    handleDropdownHover(dropdownId) {
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
        const dropdown = this.$refs[refName]
        if (dropdown) {
          // Bootstrap Vue Next dropdowns have a hide method
          if (typeof dropdown.hide === 'function') {
            dropdown.hide()
          }
          // Also try closing via internal state
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
    closeDropdown(dropdownId) {
      const dropdown = this.$refs[dropdownId]
      if (dropdown) {
        if (typeof dropdown.hide === 'function') {
          dropdown.hide()
        } else if (dropdown.$el) {
          const toggleBtn = dropdown.$el.querySelector('.dropdown-toggle')
          if (toggleBtn && toggleBtn.getAttribute('aria-expanded') === 'true') {
            toggleBtn.click()
          }
        }
      }
    },
    openDropdownById(dropdownId) {
      const dropdown = this.$refs[dropdownId]
      if (dropdown) {
        if (typeof dropdown.show === 'function') {
          dropdown.show()
        } else if (dropdown.$el) {
          const toggleBtn = dropdown.$el.querySelector('.dropdown-toggle')
          if (toggleBtn && toggleBtn.getAttribute('aria-expanded') === 'false') {
            toggleBtn.click()
          }
        }
      }
    },
  },
  components: { ToolbarBtngroup },
})
</script>

<template>
  <b-navbar toggleable="lg" class="header px-2 py-0">
    <!-- Creator Dropdown Menu -->
    <b-navbar-nav>
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

        <b-dropdown-item v-if="architecture_name">
          <font-awesome-icon :icon="['fas', 'microchip']" class="me-2" />
          <strong>{{ architecture_name }}</strong>
        </b-dropdown-item>
        
        <b-dropdown-divider v-if="architecture_name" />

        <b-dropdown-item href=".">
          <font-awesome-icon :icon="['fas', 'home']" class="me-2" />
          Home
        </b-dropdown-item>

        <b-dropdown-item href="https://creatorsim.github.io/" target="_blank">
          <font-awesome-icon :icon="['fas', 'globe']" class="me-2" />
          Website
        </b-dropdown-item>

        <b-dropdown-item href="https://github.com/creatorsim/creator" target="_blank">
          <font-awesome-icon :icon="['fab', 'github']" class="me-2" />
          GitHub
        </b-dropdown-item>
        
        <b-dropdown-divider />

        <b-dropdown-item v-b-modal.configuration>
          <font-awesome-icon :icon="['fas', 'gears']" class="me-2" />
          Settings...
        </b-dropdown-item>
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
          right 
          class="navMenu helpMenu" 
          no-caret
          no-animation
          ref="helpDropdown"
          @show="handleDropdownShow('helpDropdown')"
          @hide="handleDropdownHide('helpDropdown')"
          @mouseenter="handleDropdownHover('helpDropdown')"
        >
          <b-dropdown-item
            href="https://creatorsim.github.io/"
            target="_blank"
            @click="$root.$emit('help_event', 'general_help')"
          >
            <font-awesome-icon :icon="['fas', 'circle-question']" class="me-2" />
            Help
          </b-dropdown-item>

          <b-dropdown-item
            v-if="show_instruction_help"
            v-b-toggle.sidebar_help
            @click="$root.$emit('help_event', 'instruction_help')"
          >
            <font-awesome-icon :icon="['fas', 'book']" class="me-2" />
            Instruction Help
          </b-dropdown-item>

          <b-dropdown-item v-b-modal.notifications>
            <font-awesome-icon :icon="['fas', 'bell']" class="me-2" />
            Notifications
          </b-dropdown-item>

          <b-dropdown-divider />

          <b-dropdown-item
            href="https://docs.google.com/forms/d/e/1FAIpQLSdFbdy5istZbq2CErZs0cTV85Ur8aXiIlxvseLMhPgs0vHnlQ/viewform?usp=header"
            target="_blank"
          >
            <font-awesome-icon :icon="['fas', 'star']" class="me-2" />
            Feedback
          </b-dropdown-item>

          <b-dropdown-item
            href="https://docs.google.com/forms/d/e/1FAIpQLSfSclv1rKqBt5aIIP3jfTGbdu8m_vIgEAaiqpI2dGDcQFSg8g/viewform?usp=header"
            target="_blank"
          >
            <font-awesome-icon :icon="['fas', 'lightbulb']" class="me-2" />
            Suggestions
          </b-dropdown-item>

          <b-dropdown-divider />

          <b-dropdown-item v-b-modal.institutions>
            <font-awesome-icon :icon="['fas', 'building-columns']" class="me-2" />
            Community
          </b-dropdown-item>

          <b-dropdown-item v-b-modal.about>
            <font-awesome-icon :icon="['fas', 'address-card']" class="me-2" />
            About Us
          </b-dropdown-item>
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
      </b-navbar-nav>

    </b-collapse>
  </b-navbar>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/bootstrap";

.header {
  width: 100%;
  align-items: center;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  min-height: 40px !important;
  max-height: 40px !important;
  padding-top: 0;
  padding-bottom: 0;
  
  :deep(.navbar-nav) {
    align-items: center;
    min-height: 40px;
    max-height: 40px;
  }
  
  :deep(.nav-item),
  :deep(.nav-item-dropdown) {
    display: flex;
    align-items: center;
    height: 40px;
  }
}

.headerText {
  color: #2196f3;
  margin: 0;
  padding: 0;
  font-size: 0.9375rem;
  line-height: 1;
  font-weight: 700;
  white-space: nowrap;
}

.version-badge {
  font-size: 0.6em;
  color: #6c757d;
  font-weight: 400;
  margin-left: 0.3em;
}

.headerName {
  color: #6c757d;
  font-size: 0.5em;
  font-weight: 400;
}

.headerLogo {
  height: 4vh;
}

.linkButton {
  background-color: transparent;
  color: #6c757d;
  border: none;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}

.linkButton:hover {
  background-color: #e9ecef;
  color: #495057;
}

// Navigation menu dropdown
:deep(.navMenu) {
  display: flex;
  align-items: center;
  height: 40px;
  
  .dropdown-toggle {
    color: #495057;
    font-size: 0.9375rem;
    padding: 0.25rem 0.625rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    height: 32px;
  }
  
  .dropdown-toggle:hover {
    color: #2196f3;
  }
  
  // Special styling for creator menu
  &.creator-menu {
    .dropdown-toggle {
      background: none !important;
      border: none !important;
      
      &::after {
        display: none; // Hide default dropdown caret
      }
      
      &:hover {
        background: none !important;
        .headerText {
          color: #1976d2;
        }
      }
    }
  }
  
  // Modern dropdown menu styling
  .dropdown-menu {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1);
    padding: 0.5rem 0;
    margin-top: 0.25rem;
    min-width: 200px;
  }
  
  .dropdown-item {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    color: #495057;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    
    &:hover {
      background-color: #f8f9fa;
      color: #2196f3;
      padding-left: 1.25rem;
    }
    
    &:active {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    svg {
      width: 1rem;
    }
    
  }
  
  .dropdown-divider {
    margin: 0.5rem 0;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
}

// Button separator (visual divider between menus and buttons)
.button-separator {
  width: 1px;
  height: 30px;
  background-color: #dee2e6;
  margin: 0 0.75rem;
}

// Compile button styling (prominent)
.compile-item {
  display: flex;
  align-items: center;
  height: 40px;
  
  :deep(.compact-mode) {
    padding: 0;
    display: flex;
    align-items: center;
  }
  
  :deep(.assemble-dropdown) {
    .btn-group {
      display: flex;
      white-space: nowrap;
      height: 32px;
    }
    
    .btn {
      padding: 0.25rem 0.5rem;
      font-size: 0.8125rem;
      line-height: 1.2;
      height: 32px;
      display: flex;
      align-items: center;
    }
    
    .assemble-button-content {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      white-space: nowrap;
    }
    
    .assemble-text {
      display: inline-block;
      min-width: max-content;
    }
    
    .dropdown-toggle-split {
      padding-left: 0.25rem;
      padding-right: 0.25rem;
    }
  }
}



// Configuration button styling (navbar right side)
:deep(.navbar-nav) {
  > .compact-mode {
    display: flex;
    align-items: center;
    height: 40px;
    
    .btn {
      height: 32px !important;
      padding: 0.25rem 0.5rem;
      font-size: 0.8125rem;
      line-height: 1.2;
      display: flex;
      align-items: center;
    }
  }
}

[data-bs-theme="dark"] {
  .header {
    background-color: #1a1a1a;
    border-bottom: 1px solid #333;
  }
  .version-badge {
    color: #adb5bd;
  }
  .headerName {
    color: #adb5bd;
  }
  .linkButton {
    background-color: transparent;
    color: #adb5bd;
    border: none;
  }
  .linkButton:hover {
    background-color: #2d2d2d;
    color: #ced4da;
  }
  
  .button-separator {
    background-color: #333;
  }
  
  :deep(.navMenu),
  :deep(.creator-menu),
  :deep(.helpMenu) {
    .dropdown-toggle {
      color: #ced4da;
    }
    
    .dropdown-toggle:hover {
      color: #64b5f6;
    }
    
    // Dark mode dropdown styling
    .dropdown-menu {
      background-color: #2d2d2d;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.1);
    }
    
    .dropdown-item {
      color: #ced4da;
      
      &:hover {
        background-color: #3a3a3a;
        color: #64b5f6;
      }
      
      &:active {
        background-color: #1e3a5f;
        color: #90caf9;
      }
    }
    
    .dropdown-divider {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
  
  // Special override for creator menu text color
  :deep(.creator-menu) {
    .dropdown-toggle:hover {
      .headerText {
        color: #64b5f6;
      }
    }
  }
}
</style>
