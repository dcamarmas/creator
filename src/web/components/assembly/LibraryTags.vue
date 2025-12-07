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
<script>
import { loadedLibrary } from "@/core/core.mjs";
import { coreEvents } from "@/core/events.mjs";

export default {
  props: {
    id: { type: String, required: true },
  },

  data() {
    return {
      // Use a reactive trigger to force re-computation when library changes
      libraryVersion: 0,
    };
  },

  computed: {
    libraryLoaded() {
      // Access libraryVersion to make this reactive to library changes
      return (
        this.libraryVersion >= 0 &&
        loadedLibrary &&
        Object.keys(loadedLibrary).length !== 0
      );
    },

    libraryTags() {
      // Access libraryVersion to make this reactive to library changes
      if (this.libraryVersion < 0 || !this.libraryLoaded) {
        return [];
      }

      // YAML format: symbols is an object with symbol names as keys
      if (!loadedLibrary.symbols) {
        return [];
      }

      return Object.entries(loadedLibrary.symbols).map(([name, data]) => ({
        tag: name,
        addr: data.addr,
        globl: true,
        help: data.help,
      }));
    },

    libraryName() {
      // Access libraryVersion to make this reactive to library changes
      return this.libraryVersion >= 0
        ? loadedLibrary?.name || "Library"
        : "Library";
    },
  },

  mounted() {
    // Listen for library load/remove events
    coreEvents.on("library-loaded", this.onLibraryChange);
    coreEvents.on("library-removed", this.onLibraryChange);
  },

  beforeUnmount() {
    // Clean up event listeners
    coreEvents.off("library-loaded", this.onLibraryChange);
    coreEvents.off("library-removed", this.onLibraryChange);
  },

  methods: {
    onLibraryChange() {
      // Increment version to trigger computed property re-computation
      this.libraryVersion++;
    },
  },
};
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

    <div
      v-else-if="libraryTags.length === 0"
      class="text-center text-muted py-4"
    >
      <font-awesome-icon :icon="['fas', 'tags']" size="2x" class="mb-3" />
      <p>No tags found in the loaded library</p>
    </div>
    <b-list-group v-else>
      <b-list-group-item
        v-for="tag of libraryTags"
        :key="tag.tag"
        class="function-item"
      >
        <!-- Function signature -->
        <div class="function-signature">
          <code class="function-name">{{ tag.tag }}</code>
          <span class="function-params">(</span>
          <span
            v-if="
              tag.help?.parameters &&
              Object.keys(tag.help.parameters).length > 0
            "
            class="param-list"
          >
            <span
              v-for="(desc, param, index) in tag.help.parameters"
              :key="param"
            >
              <code class="param-name">{{ param }}</code
              ><span v-if="index < Object.keys(tag.help.parameters).length - 1"
                >,
              </span>
            </span>
          </span>
          <span class="function-params">)</span>

          <!-- Return values indicator -->
          <span
            v-if="tag.help?.returns && Object.keys(tag.help.returns).length > 0"
            class="return-indicator"
          >
            →
            <span v-for="(desc, ret, index) in tag.help.returns" :key="ret">
              <code class="return-name">{{ ret }}</code
              ><span v-if="index < Object.keys(tag.help.returns).length - 1"
                >,
              </span>
            </span>
          </span>

          <!-- Address -->
          <span class="ms-2">
            <code class="address-label"
              >@0x{{ (tag.addr || 0).toString(16).padStart(8, "0") }}</code
            >
          </span>
        </div>

        <!-- Function documentation -->
        <div v-if="tag.help" class="function-docs mt-3">
          <!-- Description -->
          <div v-if="tag.help.description" class="description mb-3">
            <div class="doc-comment">{{ tag.help.description }}</div>
          </div>
          <!-- Parameters documentation -->
          <div
            v-if="
              tag.help.parameters && Object.keys(tag.help.parameters).length > 0
            "
            class="params-section mb-2"
          >
            <div class="section-title">Parameters:</div>

            <div
              v-for="(desc, param) in tag.help.parameters"
              :key="param"
              class="param-doc"
            >
              <code class="param-name-doc">{{ param }}</code>
              <span class="param-desc">– {{ desc }}</span>
            </div>
          </div>

          <!-- Returns documentation -->
          <div
            v-if="tag.help.returns && Object.keys(tag.help.returns).length > 0"
            class="returns-section"
          >
            <div class="section-title">Returns:</div>

            <div
              v-for="(desc, ret) in tag.help.returns"
              :key="ret"
              class="return-doc"
            >
              <code class="return-name-doc">{{ ret }}</code>
              <span class="return-desc">– {{ desc }}</span>
            </div>
          </div>
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

.function-item {
  font-family:
    "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;
  padding: 1rem 1.25rem;
}

.function-signature {
  font-size: 1rem;
  line-height: 1.5;

  .function-name {
    color: #0969da;
    font-weight: 600;
    font-size: 1.1em;
    background: transparent;
  }

  .function-params {
    color: #6e7781;
  }

  .param-list {
    color: #1f2328;

    .param-name {
      color: #953800;
      font-weight: 500;
      background: transparent;
    }
  }

  .return-indicator {
    color: #6e7781;
    margin-left: 0.5rem;

    .return-name {
      color: #116329;
      font-weight: 500;
      background: transparent;
    }
  }

  .address-label {
    font-size: 0.85em;
    color: #6e7781;
    opacity: 0.8;
    background: transparent;
  }
}

.function-docs {
  margin-left: 0.25rem;
  padding-left: 1rem;
  border-left: 3px solid #d0d7de;

  .description {
    color: #57606a;
    font-style: italic;
    font-size: 0.95em;
    line-height: 1.5;
  }

  .doc-comment {
    &::before {
      content: "// ";
      color: #6e7781;
      font-weight: 600;
    }
  }

  .section-title {
    font-weight: 600;
    font-size: 0.875em;
    color: #1f2328;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .param-doc,
  .return-doc {
    margin-left: 1rem;
    margin-bottom: 0.25rem;
    font-size: 0.9em;

    .param-name-doc,
    .return-name-doc {
      color: #953800;
      font-weight: 500;
      background: transparent;
    }

    .param-desc,
    .return-desc {
      color: #57606a;
    }
  }

  .return-doc {
    .return-name-doc {
      color: #116329;
    }
  }
}

[data-bs-theme="dark"] {
  .function-signature {
    .function-name {
      color: #58a6ff;
    }

    .function-params {
      color: #8b949e;
    }

    .param-list {
      color: #e6edf3;

      .param-name {
        color: #ffa657;
      }
    }

    .return-indicator {
      color: #8b949e;

      .return-name {
        color: #7ee787;
      }
    }

    .address-label {
      color: #8b949e;
    }
  }

  .function-docs {
    border-left-color: #30363d;

    .description {
      color: #8b949e;
    }

    .doc-comment::before {
      color: #8b949e;
    }

    .section-title {
      color: #e6edf3;
    }

    .param-doc,
    .return-doc {
      .param-name-doc,
      .return-name-doc {
        color: #ffa657;
      }

      .param-desc,
      .return-desc {
        color: #8b949e;
      }
    }

    .return-doc {
      .return-name-doc {
        color: #7ee787;
      }
    }
  }
}

[data-bs-theme="dark"] {
  .text-muted {
    color: #adb5bd !important;
  }
}
</style>
