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

import { architecture } from "@/core/core.mjs"

import EditArchitecture from "./architecture/EditArchitecture.vue"
import DownloadPopup from "./general/DownloadModal.vue"
import ArchConf from "./architecture/configuration/ArchConf.vue"
import MemoryLayoutDiagram from "./architecture/memory_layout/MemoryLayoutDiagram.vue"
import RegisterFileArch from "./architecture/register_file/RegisterFileArch.vue"
import Instructions from "./architecture/instructions/Instructions.vue"
import Directives from "./architecture/directives/Directives.vue"
import Pseudoinstructions from "./architecture/pseudoinstructions/Pseudoinstructions.vue"

export default defineComponent({
  props: {
    browser: { type: String, required: true },
    os: { type: String, required: true },
    arch_available: Array as PropType<AvailableArch[]>,
    architecture_name: String,
    dark: { type: Boolean, required: true },
    arch_code: { type: String, required: true },
  },

  components: {
    EditArchitecture,
    DownloadPopup,
    ArchConf,
    MemoryLayoutDiagram,
    RegisterFileArch,
    Instructions,
    Directives,
    Pseudoinstructions,
  },

  data() {
    return {
      architecture,
      activeTab: 'instructions'
    }
  },

  computed: {
    archCodeWSchema() {
      return `# yaml-language-server: $schema=${document.URL}architecture/schema.json\n${this.arch_code}`
    },
  },

  computed: {
    archCodeWSchema() {
      return `# yaml-language-server: $schema=${document.URL}architecture/schema.json\n${this.arch_code}`
    },
  },
})
</script>

<template>
  <div class="architecture-view" id="architecture_menu">
    <!-- Edit architecture modal -->
    <EditArchitecture id="edit_architecture" :arch_code="arch_code" :dark="dark" />

    <!-- Download architecture modal -->

    <DownloadPopup
      id="save_architecture"
      type="architecture"
      title="Download Architecture"
      extension=".yml"
      :fileData="archCodeWSchema"
      default-filename="architecture"
    />
    <DownloadPopup id="save_architecture" type="architecture" title="Download Architecture" extension=".yml"
      :fileData="arch_code" default-filename="architecture" />

    <!-- Architecture information with side-by-side layout -->
    <div class="architecture-layout">
      <!-- Left Sidebar: Overview -->
      <div class="sidebar-left">
        <b-card no-body class="overview-card mb-3">

          <b-card-body class="p-3">
            <ArchConf :conf="architecture.config" />
          </b-card-body>
        </b-card>
      </div>

      <!-- Main Content Area: Instructions & ISA -->
      <div class="main-content">
        <!-- View selector as buttons -->
        <div class="architecture-view-selector">
          <div class="tabs-container">
            <!-- Instructions Tab -->
            <button
              :class="['tab', { active: activeTab === 'instructions' }]"
              @click="activeTab = 'instructions'"
            >
              <font-awesome-icon :icon="['fas', 'code']" />
              <span>Instructions</span>
            </button>

            <!-- Pseudoinstruction Tab -->
            <button
              v-if="architecture.pseudoinstructions && architecture.pseudoinstructions.length > 0"
              :class="['tab', { active: activeTab === 'pseudoinstructions' }]"
              @click="activeTab = 'pseudoinstructions'"
            >
              <font-awesome-icon :icon="['fas', 'layer-group']" />
              <span>Pseudoinstructions</span>
            </button>

            <!-- Directives Tab -->
            <button
              v-if="architecture.directives && architecture.directives.length > 0"
              :class="['tab', { active: activeTab === 'directives' }]"
              @click="activeTab = 'directives'"
            >
              <font-awesome-icon :icon="['fas', 'cogs']" />
              <span>Directives</span>
            </button>

            <!-- Memory Layout Tab -->
            <button
              :class="['tab', { active: activeTab === 'memory_layout' }]"
              @click="activeTab = 'memory_layout'"
            >
              <font-awesome-icon :icon="['fas', 'sitemap']" />
              <span>Memory Layout</span>
            </button>

            <!-- Registers Tab -->
            <button
              :class="['tab', { active: activeTab === 'registers' }]"
              @click="activeTab = 'registers'"
            >
              <font-awesome-icon :icon="['fas', 'database']" />
              <span>Registers</span>
            </button>
          </div>
        </div>

        <div class="isa-content">
          <!-- Instruction definition -->
          <div v-if="activeTab === 'instructions'">
            <Instructions :instructions="architecture.instructions" />
          </div>

          <!-- Pseudoinstruction definition -->
          <div v-if="activeTab === 'pseudoinstructions'">
            <Pseudoinstructions :pseudoinstructions="architecture.pseudoinstructions" />
          </div>

          <!-- Directives definition -->
          <div v-if="activeTab === 'directives'">
            <Directives :directives="architecture.directives" />
          </div>

          <!-- Memory Layout -->
          <div v-if="activeTab === 'memory_layout'">
            <MemoryLayoutDiagram :memory_layout="architecture.memory_layout" :inverted="true" :show-gaps="true" />
          </div>

          <!-- Registers -->
          <div v-if="activeTab === 'registers'">
            <RegisterFileArch :register_file="architecture.components" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.architecture-view {
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.architecture-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 0;
  height: 100%;
  overflow: hidden;
}

.sidebar-left {
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid rgba(0, 0, 0, 0.07);
  background-color: var(--bs-body-bg);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }

  .card {
    border-radius: 0;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);

    .card-header {
      background-color: transparent;
      border-bottom: 1px solid rgba(0, 0, 0, 0.07);
      padding: 8px 12px;
      font-weight: 600;
      font-size: 0.8125rem;

      h5,
      h6 {
        color: rgba(0, 0, 0, 0.8);
        font-size: 0.8125rem;
        font-weight: 600;
      }

      i {
        margin-right: 6px;
        font-size: 0.875rem;
      }
    }

    .card-body {
      max-height: none;
      overflow-y: auto;
      padding: 12px;
    }
  }
}

.main-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bs-body-bg);
}

.architecture-view-selector {
  width: 100%;
  user-select: none;
}

.tabs-container {
  display: flex;
  gap: 0.25rem;
  padding: 6px;
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  overflow: hidden;
}

.isa-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  > div {
    height: 100%;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 5px;

      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }
}

[data-bs-theme="dark"] {
  .sidebar-left {
    border-right-color: rgba(255, 255, 255, 0.12);

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }

    .card {
      border-bottom-color: rgba(255, 255, 255, 0.12);

      .card-header {
        border-bottom-color: rgba(255, 255, 255, 0.12);

        h5,
        h6 {
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }

  .tabs-container {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }

  .isa-content > div {
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

// Responsive breakpoints
@media (max-width: 1400px) {
  .architecture-layout {
    grid-template-columns: 280px 1fr;
  }
}

@media (max-width: 1200px) {
  .architecture-layout {
    grid-template-columns: 240px 1fr;
  }
}

@media (max-width: 992px) {
  .architecture-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .sidebar-left {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);

    .card {
      min-width: 250px;
      flex-shrink: 0;
      border-right: 1px solid rgba(0, 0, 0, 0.07);
      border-bottom: none;
    }
  }
}
</style>
