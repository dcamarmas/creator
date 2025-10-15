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
import { useModal } from "bootstrap-vue-next"

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

  setup() {
    // this HAS to be defined here
    // as we can have various of these components almost simultaneately (when
    // transitioning from simulator to assembly, for example), we'll set an ID
    // for the URI modal that is based on this component's own ID
    const { show, hide } = useModal()

    return { showLink: show, hide }
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

    assemble() {
      // this is horrible, because this component can also be a child
      // component of assemblyView but, as we always start at the simulatorView,
      // the component always exists in both views
      ;(this.$root as any).$refs.simulatorView?.$refs.toolbar?.$refs.btngroup1
        ?.at(0)
        ?.assembly_compiler()

      // update table execution UI
      // FIXME: this doesn't update shit
      ;(this.$root as any).$refs.simulatorView?.$refs.toolbar.$refs.btngroup1
        .at(0)
        ?.execution_UI_reset()
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
      this.hide()

      try {
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error("Failed to load example")
        }

        const code = await response.text()
        ;(this.$root as any).assembly_code = code

        if (assemble) {
          // TODO: re-enable when fixed
          // this.assemble()
        }

        // we change to the assembly view bc I'm not able to update the
        // execution table (see assemble()) when that's fixed, delete this
        ;(this.$root as any).creator_mode = "assembly"

        show_notification(
          " The selected example has been loaded correctly",
          "success",
        )

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
  <b-modal :id="id" title="Available examples" no-footer scrollable>
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
      class="w-100 mb-3"
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
      There are no examples at the moment.
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
              showLink(`${id}_uri`)
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
