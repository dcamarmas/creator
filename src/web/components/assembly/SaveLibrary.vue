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
import { defineComponent } from "vue";
import { useToggle } from "bootstrap-vue-next";
import { libraryInstructions } from "@/core/assembler/assembler.mjs";
import { show_notification } from "@/web/utils.mjs";
import { assembleCreator } from "@/core/assembler/creatorAssembler/web/creatorAssembler.mjs";
import { architecture } from "@/core/core.mjs";
import yaml from "js-yaml";

export default defineComponent({
  props: {
    id: { type: String, required: true },
  },

  setup(props) {
    const { hide } = useToggle(props.id);
    const showAssemblyError = useToggle("modalAssemblyError").show;
    return { hideModal: hide, showAssemblyError };
  },

  data() {
    return {
      /*Saved file name*/
      name_binary_save: "",
      /*Symbols with their addresses*/
      symbols: [] as Array<{ name: string; addr: number }>,
      /*Help data for each symbol*/
      symbolHelp: {} as Record<
        string,
        {
          description: string;
          parameters: Record<string, string>;
          returns: Record<string, string>;
        }
      >,
      /*Binary data*/
      binaryHex: "",
      /*Compiling state*/
      compiling: false,
    };
  },

  computed: {
    /**
     * Get symbols with valid help data
     */
    validSymbols() {
      return this.symbols.filter(symbol => this.symbolHelp[symbol.name]);
    },
  },

  methods: {
    /**
     * Converts binary string to hex string
     */
    binaryToHex(binary: string): string {
      let hex = "";
      for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.substr(i, 8);
        const hexByte = parseInt(byte, 2).toString(16).padStart(2, "0");
        hex += hexByte;
      }
      return hex;
    },

    /**
     * First step: validate and prepare data
     */
    prepareLibrary() {
      // Validate we have instructions
      if (!libraryInstructions || libraryInstructions.length === 0) {
        show_notification("No instructions to save", "danger");
        return false;
      }

      // Check for main symbol (not allowed in libraries)
      for (const instruction of libraryInstructions) {
        if (instruction.Label === "main") {
          show_notification(
            'You cannot use the "main" label in a library',
            "danger",
          );
          return false;
        }
      }

      // Build binary string from all instructions
      let binaryString = "";
      const symbols: Array<{ name: string; addr: number }> = [];

      for (const instruction of libraryInstructions) {
        // Get the binary data (prefer binary over loaded)
        const instructionBinary = instruction.binary || instruction.loaded;
        if (instructionBinary) {
          binaryString += instructionBinary;
        }

        // Add symbol if instruction has a global label
        if (
          instruction.Label &&
          instruction.Label !== "" &&
          instruction.globl === true
        ) {
          const addr = parseInt(instruction.Address, 16);

          symbols.push({
            name: instruction.Label,
            addr,
          });
        }
      }

      // Convert binary to hex
      this.binaryHex = this.binaryToHex(binaryString);
      this.symbols = symbols;

      // Initialize help data for each symbol
      this.symbolHelp = {};
      for (const symbol of symbols) {
        this.symbolHelp[symbol.name] = {
          description: "",
          parameters: {},
          returns: {},
        };
      }

      return true;
    },

    /**
     * Compile the code as a library when modal is shown
     */
    async compileAsLibrary() {
      const root = (document as any).app;

      if (!root || !root.assembly_code) {
        show_notification("No assembly code to compile", "danger");
        return false;
      }

      // Check if architecture uses Creator assembler
      if (
        !architecture?.config?.assemblers?.some(
          (a: any) => a.name === "CreatorAssembler",
        )
      ) {
        show_notification(
          "Library compilation requires Creator assembler",
          "danger",
        );
        return false;
      }

      this.compiling = true;

      try {
        // Compile with library=true flag
        const ret = (await assembleCreator(root.assembly_code, true)) as any;

        this.compiling = false;

        // Check result
        if (ret.type === "error") {
          // Set compilation error and show error modal
          root.assemblyError = ret.msg;
          this.showAssemblyError();
          return false;
        }

        if (ret.type === "warning") {
          show_notification(ret.token, ret.bgcolor);
        }

        return true;
      } catch (error) {
        this.compiling = false;
        show_notification(`Compilation failed: ${error}`, "danger");
        return false;
      }
    },

    /**
     * Handle modal shown event - compile the code
     */
    async handleShown() {
      // Compile as library
      const compiled = await this.compileAsLibrary();
      if (!compiled) {
        // Close modal if compilation failed
        this.hideModal();
      } else {
        // Prepare library data after successful compilation
        this.prepareLibrary();
      }
    },

    /**
     * Handle modal OK button - save the library
     */
    handleOk(evt: any) {
      evt.preventDefault();
      this.library_save();
    },

    /**
     * Add parameter to a symbol
     */
    addParameter(symbolName: string) {
      if (!this.symbolHelp[symbolName]) return;
      // Generate a temporary unique key
      let counter = 1;
      let key = `param${counter}`;
      while (this.symbolHelp[symbolName].parameters[key] !== undefined) {
        counter++;
        key = `param${counter}`;
      }
      this.symbolHelp[symbolName].parameters[key] = "";
    },

    /**
     * Add return value to a symbol
     */
    addReturn(symbolName: string) {
      if (!this.symbolHelp[symbolName]) return;
      // Generate a temporary unique key
      let counter = 1;
      let key = `ret${counter}`;
      while (this.symbolHelp[symbolName].returns[key] !== undefined) {
        counter++;
        key = `ret${counter}`;
      }
      this.symbolHelp[symbolName].returns[key] = "";
    },

    /**
     * Update parameter name
     */
    updateParameterName(symbolName: string, oldKey: string, newKey: string) {
      if (!this.symbolHelp[symbolName]) return;
      newKey = newKey.trim();
      if (newKey === "" || newKey === oldKey) return;

      // Check if new key already exists
      if (this.symbolHelp[symbolName].parameters[newKey] !== undefined) {
        show_notification(`Parameter '${newKey}' already exists`, "warning");
        return;
      }

      const value = this.symbolHelp[symbolName].parameters[oldKey] ?? "";
      delete this.symbolHelp[symbolName].parameters[oldKey];
      this.symbolHelp[symbolName].parameters[newKey] = value;
    },

    /**
     * Update return name
     */
    updateReturnName(symbolName: string, oldKey: string, newKey: string) {
      if (!this.symbolHelp[symbolName]) return;
      newKey = newKey.trim();
      if (newKey === "" || newKey === oldKey) return;

      // Check if new key already exists
      if (this.symbolHelp[symbolName].returns[newKey] !== undefined) {
        show_notification(`Return '${newKey}' already exists`, "warning");
        return;
      }

      const value = this.symbolHelp[symbolName].returns[oldKey] ?? "";
      delete this.symbolHelp[symbolName].returns[oldKey];
      this.symbolHelp[symbolName].returns[newKey] = value;
    },

    /**
     * Remove parameter from symbol
     */
    removeParameter(symbolName: string, key: string) {
      if (!this.symbolHelp[symbolName]) return;
      delete this.symbolHelp[symbolName].parameters[key];
    },

    /**
     * Remove return from symbol
     */
    removeReturn(symbolName: string, key: string) {
      if (!this.symbolHelp[symbolName]) return;
      delete this.symbolHelp[symbolName].returns[key];
    },

    /**
     * Saves a library in the new YAML format
     */
    library_save() {
      // Build symbols object with help
      const symbolsObj: Record<string, any> = {};

      for (const symbol of this.symbols) {
        const helpData = this.symbolHelp[symbol.name];
        if (!helpData) continue;

        symbolsObj[symbol.name] = {
          addr: symbol.addr,
          help: {
            description: helpData.description || "",
            parameters: helpData.parameters,
            returns: helpData.returns,
          },
        };
      }

      // Create library object
      const library = {
        version: "1.0",
        binary: this.binaryHex,
        symbols: symbolsObj,
      };

      // Convert to YAML
      const textToWrite = yaml.dump(library, {
        indent: 2,
        lineWidth: 80,
        noRefs: true,
      });
      const textFileAsBlob = new Blob([textToWrite], { type: "text/yaml" });

      // Determine filename
      let fileNameToSaveAs;
      if (this.name_binary_save === "") {
        fileNameToSaveAs = "library.yml";
      } else {
        fileNameToSaveAs = this.name_binary_save + ".yml";
      }

      // Create download link
      const downloadLink = document.createElement("a");
      downloadLink.download = fileNameToSaveAs;
      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);

      downloadLink.click();

      // Cleanup
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(downloadLink.href);

      // Reset state
      this.name_binary_save = "";
      this.symbols = [];
      this.symbolHelp = {};
      this.binaryHex = "";

      show_notification("Library saved successfully", "success");

      // Modal will auto-close after this method completes
    },

    /**
     * Handle modal hidden event to reset state
     */
    handleHidden() {
      this.name_binary_save = "";
      this.symbols = [];
      this.symbolHelp = {};
      this.binaryHex = "";
      this.compiling = false;
    },
  },
});
</script>

<template>
  <b-modal
    :id="id"
    :title="compiling ? 'Compiling Library...' : 'Save Library'"
    ok-title="Save to File"
    :ok-disabled="compiling"
    size="lg"
    @ok="handleOk"
    @shown="handleShown"
    @hidden="handleHidden"
  >
    <!-- Compiling indicator -->
    <div v-if="compiling" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Compiling...</span>
      </div>

      <p class="mt-3">Compiling code as library...</p>
    </div>

    <!-- Library configuration form -->
    <div v-else>
      <!-- Filename input -->
      <b-form-group
        label="Library filename:"
        label-for="library-filename"
        class="mb-4"
      >
        <b-form-input
          id="library-filename"
          v-model="name_binary_save"
          type="text"
          placeholder="Enter filename (without extension)"
          title="File name"
        />
        <small class="form-text text-muted"
          >File will be saved as {{ name_binary_save || "library" }}.yml</small
        >
      </b-form-group>
      <hr class="my-4" />

      <!-- Help documentation for symbols -->
      <h6 class="mb-3">Symbol Documentation</h6>

      <p class="text-muted small mb-3">
        Configure optional help documentation for each exported symbol.
      </p>
      <b-card
        v-for="symbol in validSymbols"
        :key="symbol.name"
        :title="symbol.name"
        class="mb-3"
      >
        <!-- Description -->
        <b-form-group label="Description:" label-for="`desc-${symbol.name}`">
          <b-form-textarea
            :id="`desc-${symbol.name}`"
            v-model="symbolHelp[symbol.name]!.description"
            placeholder="Describe what this function does"
            rows="2"
          />
        </b-form-group>

        <!-- Parameters -->
        <b-form-group label="Parameters:" class="mt-3">
          <div
            v-for="(value, key) in symbolHelp[symbol.name]!.parameters"
            :key="key"
            class="d-flex mb-2 gap-2"
          >
            <b-form-input
              :model-value="key"
              placeholder="Name (e.g., a0)"
              style="flex: 0 0 100px"
              @blur="
                (e: any) =>
                  updateParameterName(
                    symbol.name,
                    key,
                    (e.target as HTMLInputElement).value,
                  )
              "
            />
            <b-form-input
              v-model="symbolHelp[symbol.name]!.parameters[key]"
              placeholder="Description (e.g., first integer)"
              class="flex-grow-1"
            />
            <b-button
              variant="danger"
              size="sm"
              @click="removeParameter(symbol.name, key)"
            >
              ✕
            </b-button>
          </div>
          <b-button
            variant="secondary"
            size="sm"
            @click="addParameter(symbol.name)"
          >
            + Add Parameter
          </b-button>
        </b-form-group>

        <!-- Returns -->
        <b-form-group label="Returns:" class="mt-3">
          <div
            v-for="(value, key) in symbolHelp[symbol.name]!.returns"
            :key="key"
            class="d-flex mb-2 gap-2"
          >
            <b-form-input
              :model-value="key"
              placeholder="Name (e.g., a0)"
              style="flex: 0 0 100px"
              @blur="
                (e: any) =>
                  updateReturnName(
                    symbol.name,
                    key,
                    (e.target as HTMLInputElement).value,
                  )
              "
            />
            <b-form-input
              v-model="symbolHelp[symbol.name]!.returns[key]"
              placeholder="Description (e.g., maximum value)"
              class="flex-grow-1"
            />
            <b-button
              variant="danger"
              size="sm"
              @click="removeReturn(symbol.name, key)"
            >
              ✕
            </b-button>
          </div>
          <b-button
            variant="secondary"
            size="sm"
            @click="addReturn(symbol.name)"
          >
            + Add Return
          </b-button>
        </b-form-group>
      </b-card>
      <p class="text-muted mt-3">
        <small>
          Note: You can leave fields empty if not needed. The library will still
          work without help documentation.
        </small>
      </p>
    </div>
  </b-modal>
</template>
