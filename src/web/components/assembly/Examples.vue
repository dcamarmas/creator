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
import { useModal, useModalController } from "bootstrap-vue-next"

import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { show_notification } from "@/web/utils.mjs"

import example_set from "#/examples/example_set.json"

import MakeURI from "./MakeURI.vue"

export default {
  props: {
    id: { type: String, required: true },
    architecture_name: { type: String, required: true },
    compile: { type: Boolean, required: true },
  },

  components: { MakeURI },

  setup(props) {
    // this HAS to be defined here
    const { hide } = useModalController()

    // as we can have various of these components almost simultaneately (when
    // transitioning from simulator to assembly, for example), we'll set an ID
    // for the URI modal that is based on this component's own ID
    const { show } = useModal(`${props.id}_uri`)

    return { showLink: show, hide }
  },

  computed: {
    available_sets() {
      const sets = example_set
        .filter(set => set.architecture === this.architecture_name)
        // convert sets to object ({"default": {...}, ...})
        .reduce((obj, item) => {
          obj[item.id] = {
            name: item.name,
            description: item.description,
            url: item.url,
          }
          return obj
        }, {})

      // load examples
      for (const [_key, set] of Object.entries(sets)) {
        $.ajaxSetup({ async: false })
        $.getJSON(set.url, cfg => {
          set.examples = cfg
        }).fail(() => {
          set.examples = []
        })
        delete set.url
      }

      return sets
    },

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
      selected_example: null, // selected example id
    }
  },

  methods: {
    get_example_set() {
      return this.example_set
    },

    assemble() {
      // this is horrible, because this component can also be a child
      // component of assemblyView but, as we always start at the simulatorView,
      // the component always exists in both views
      this.$root.$refs.simulatorView?.$refs.toolbar?.$refs.btngroup1
        ?.at(0)
        ?.assembly_compiler()

      // update table execution UI
      // FIXME: this doesn't update shit
      this.$root.$refs.simulatorView?.$refs.toolbar.$refs.btngroup1
        .at(0)
        ?.execution_UI_reset()
    },

    /* Load a selected example */
    /**
     * Loads and (optionally) assembles an example
     *
     * @param {String} url URL of the example file (.s)
     * @param {Boolean} assemble Set to automatically assemble the example
     */
    load_example(url, assemble) {
      // close modal
      this.hide()

      $.get(url, code => {
        this.$root.assembly_code = code

        if (assemble) {
          // TODO: re-enable when fixed
          // this.assemble()
        }

        // we change to the assembly view bc I'm not able to update the
        // execution table (see assemble()) when that's fixed, delete this
        this.$root.creator_mode = "assembly"

        show_notification(
          " The selected example has been loaded correctly",
          "success",
        )

        /* Google Analytics */
        creator_ga(
          "send",
          "event",
          "example",
          "example.loading",
          "example.loading.url",
        )
      })
    },
  },
}
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
        available_sets[selected_set]?.examples.length === 0
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
    :example_id="selected_example"
  />
</template>
