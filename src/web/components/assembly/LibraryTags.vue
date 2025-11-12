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
import { loadedLibrary } from "@/core/core.mjs"
import { coreEvents } from "@/core/events.mjs"

export default {
  props: {
    id: { type: String, required: true },
  },
  
  data() {
    return {
      // Use a reactive trigger to force re-computation when library changes
      libraryVersion: 0,
    }
  },
  
  computed: {
    libraryLoaded() {
      // Access libraryVersion to make this reactive to library changes
      return this.libraryVersion >= 0 && loadedLibrary && Object.keys(loadedLibrary).length !== 0
    },
    
    libraryTags() {
      // Access libraryVersion to make this reactive to library changes
      if (this.libraryVersion < 0 || !this.libraryLoaded) {
        return []
      }
      return loadedLibrary?.instructions_tag?.filter(t => t.globl) || []
    },
    
    libraryName() {
      // Access libraryVersion to make this reactive to library changes
      return this.libraryVersion >= 0 ? (loadedLibrary?.name || "Library") : "Library"
    },
  },
  
  mounted() {
    // Listen for library load/remove events
    coreEvents.on("library-loaded", this.onLibraryChange)
    coreEvents.on("library-removed", this.onLibraryChange)
  },
  
  beforeUnmount() {
    // Clean up event listeners
    coreEvents.off("library-loaded", this.onLibraryChange)
    coreEvents.off("library-removed", this.onLibraryChange)
  },
  
  methods: {
    onLibraryChange() {
      // Increment version to trigger computed property re-computation
      this.libraryVersion++
    },
  },
}
</script>

<template>
  <b-modal 
    :id="id" 
    :title="`${libraryName} Tags`" 
    size="md"
    ok-only
    ok-title="Close"
  >
    <div v-if="!libraryLoaded" class="text-center text-muted py-4">
      <font-awesome-icon :icon="['fas', 'book']" size="2x" class="mb-3" />
      <p>No library loaded</p>
    </div>
    
    <div v-else-if="libraryTags.length === 0" class="text-center text-muted py-4">
      <font-awesome-icon :icon="['fas', 'tags']" size="2x" class="mb-3" />
      <p>No tags found in the loaded library</p>
    </div>
    
    <b-list-group v-else>
      <b-list-group-item 
        v-for="tag of libraryTags" 
        :key="tag.tag"
        class="d-flex justify-content-between align-items-center"
      >
        <div>
          <b-badge pill variant="primary" class="me-2">
            {{ tag.tag }}
          </b-badge>
          <span v-if="tag.description" class="text-muted small">
            {{ tag.description }}
          </span>
        </div>
      </b-list-group-item>
    </b-list-group>
  </b-modal>
</template>

<style lang="scss" scoped>
.list-group-item {
  border-left: none;
  border-right: none;
  
  &:first-child {
    border-top: none;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

[data-bs-theme="dark"] {
  .text-muted {
    color: #adb5bd !important;
  }
}
</style>
