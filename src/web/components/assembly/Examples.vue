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
import { useToggle } from "bootstrap-vue-next"

import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { show_notification } from "@/web/utils.mjs"

// import example_set from "#/examples/example_set.json"
import example_set from "../../../../examples/example_set.json"

import MakeURI from "./MakeURI.vue"

export default defineComponent({
  props: {
    id: { type: String, required: true },
    architecture_name: { type: String, required: true },
    compile: { type: Boolean, required: true },
  },

  components: { MakeURI },

  setup(props) {
    // this HAS to be defined here
    // as we can have various of these components almost simultaneately (when
    // transitioning from simulator to assembly, for example), we'll set an ID
    // for the URI modal that is based on this component's own ID
    return {
      showLink: useToggle(`${props.id}_uri`).show,
      hideModal: useToggle(props.id).hide,
    }
  },

  computed: {
    example_set_options() {
      return Object.entries(this.available_sets).map(([id, set]) => ({
        text: set.name,
        value: id,
      }))
    },
  },

  data() {
    return {
      selected_set: "default", // selected example set
      selected_example: null as string | null, // selected example id
      available_sets: {} as { [key: string]: ExampleSet }, // loaded example sets
    }
  },

  async mounted() {
    await this.loadAvailableSets()
  },

  methods: {
    async loadAvailableSets(): Promise<{ [key: string]: ExampleSet }> {
      const sets = example_set
        .filter(set => set.architecture === this.architecture_name)
        // convert sets to object ({"default": {...}, ...})
        .reduce((obj: { [key: string]: ExampleSet }, item) => {
          obj[item.id] = {
            name: item.name,
            description: item.description,
            url: item.url,
          }
          return obj
        }, {})

      // load examples
      for (const [_key, set] of Object.entries(sets)) {
        try {
          const response = await fetch(set.url!)
          if (response.ok) {
            set.examples = await response.json()
          } else {
            set.examples = []
          }
        } catch (_error) {
          set.examples = []
        }
        delete set.url
      }

      this.available_sets = sets

      return sets
    },

    get_example_set() {
      return example_set
    },

    async assemble() {
      // Import the necessary modules for compilation
      const { assembly_compile, reset, status } = await import("@/core/core.mjs")
      const { resetStats } = await import("@/core/executor/stats.mts")
      const { instructions } = await import("@/core/assembler/assembler.mjs")
      const { show_notification } = await import("@/web/utils.mjs")
      const { assemblerMap, getDefaultCompiler } = await import("@/web/assemblers")
      const { architecture } = await import("@/core/core.mjs")
      
      const root = this.$root as any

      // Reset simulator
      root.keyboard = ""
      root.display = ""
      root.enter = null
      reset()

      // Get default compiler for the architecture
      const defaultCompiler = getDefaultCompiler(architecture)
      const assemblerFn = assemblerMap[defaultCompiler]
      
      // Assemble the code
      const ret = await (assemblerFn
        ? assembly_compile(root.assembly_code, assemblerFn)
        : assembly_compile(root.assembly_code))

      // Reset stats
      resetStats()
      status.executedInstructions = 0
      status.clkCycles = 0

      // Handle results
      switch (ret.type) {
        case "error":
          // Set compilation error and show modal
          root.assemblyError = ret.msg
          root.$emit("show-assembly-error")
          break

        case "warning":
          show_notification(ret.token, ret.bgcolor)
          // Still change to simulator view on warning
          root.creator_mode = "simulator"
          // Wait for next tick to ensure simulator view is mounted, then update UI
          await this.$nextTick()
          this.updateSimulatorUI(instructions, status)
          break

        default:
          // Put rowVariant in entrypoint
          const entrypoint = instructions.at(status.execution_index)
          if (entrypoint) {
            entrypoint._rowVariant = "success"
          }
          // Change to simulator view
          root.creator_mode = "simulator"
          // Wait for next tick to ensure simulator view is mounted, then update UI
          await this.$nextTick()
          this.updateSimulatorUI(instructions, status)
          break
      }
    },

    updateSimulatorUI(_instructions: any[], _status: any) {
      // Update the simulator controls to enable buttons
      const root = this.$root as any
      const simulatorControls = root.$refs.navbar?.$refs?.simulatorControls
      
      if (simulatorControls) {
        // Call execution_UI_reset to enable buttons and update execution table
        simulatorControls.execution_UI_reset()
      }
    },

    /* Load a selected example */
    /**
     * Loads and (optionally) assembles an example
     *
     * @param url URL of the example file (.s)
     * @param assemble Set to automatically assemble the example
     */
    async load_example(url: string, assemble: boolean) {
      // close modal
      this.hideModal()

      try {
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error("Failed to load example")
        }

        const code = await response.text()
        ;(this.$root as any).assembly_code = code

        if (assemble) {
          // Assemble and switch to simulator view
          await this.assemble()
        } else {
          // Just load the code and switch to assembly view
          ;(this.$root as any).creator_mode = "assembly"
        }

        /* Google Analytics */
        creator_ga("event", "example.loading", "example.loading.url")
      } catch (_error) {
        show_notification("Failed to load example", "danger")
      }
    },
  },
})
</script>

<template>
  <b-modal :id="id" class="bottomCard" title="Available examples" no-footer centered scrollable>
    <!-- set selector -->
    <b-form-radio-group
      v-if="example_set_options.length > 0 && example_set_options.length < 3"
      class="w-100 mb-3"
      v-model="selected_set"
      :options="example_set_options"
      button-variant="outline-secondary"
      size="sm"
      buttons
    />

    <b-dropdown
      v-if="example_set_options.length > 2"
      id="examples_dropdown"
      size="sm"
    >
      <b-dropdown-item
        v-for="item in example_set_options"
        @click="selected_set = item.value"
      >
        {{ item.text }}
      </b-dropdown-item>
    </b-dropdown>

    <span
      v-if="
        example_set_options.length === 0 ||
        available_sets[selected_set]?.examples?.length === 0
      "
      class="h6"
    >
      No examples available for this architecture.
    </span>

    <!-- examples -->

    <b-list-group>
      <b-button-group
        v-for="example in available_sets[selected_set]?.examples"
        :key="example.id"
        size="sm"
        class="p-1"
      >
        <b-col cols="11">
          <b-list-group-item button @click="load_example(example.url, compile)">
            {{ example.name }}:
            {{ example.description }}
          </b-list-group-item>
        </b-col>
        <b-button
          @click="
            () => {
              selected_example = example.id
              showLink()
            }
          "
          size="sm"
        >
          <font-awesome-icon :icon="['fas', 'link']" />
        </b-button>
      </b-button-group>
    </b-list-group>
  </b-modal>

  <MakeURI
    :id="`${id}_uri`"
    :architecture_name="architecture_name"
    :example_set="selected_set"
    :example_id="selected_example!"
  />
</template>
