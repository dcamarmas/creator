<!--
Copyright 2018-2026 CREATOR Team.

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
<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useToggle } from "bootstrap-vue-next";

import { creator_ga } from "@/core/utils/creator_ga.mjs";
import { show_notification } from "@/web/utils.mjs";
import {
  useAssembly,
  type AssemblyResult,
} from "@/web/composables/useAssembly";

// import example_set from "#/examples/example_set.json"
import example_set from "../../../../examples/example_set.json";

import MakeURI from "./MakeURI.vue";

interface Props {
  id: string;
  architecture_name: string;
  compile: boolean;
}

const props = defineProps<Props>();

// this HAS to be defined here
// as we can have various of these components almost simultaneately (when
// transitioning from simulator to assembly, for example), we'll set an ID
// for the URI modal that is based on this component's own ID
const showLink = useToggle(`${props.id}_uri`).show;
const hideModal = useToggle(props.id).hide;

const selected_set = ref("default"); // selected example set
const selected_example = ref<string | null>(null); // selected example id
const available_sets = ref<{ [key: string]: ExampleSet }>({}); // loaded example sets

const example_set_options = computed(() =>
  Object.entries(available_sets.value).map(([id, set]) => ({
    text: set.name,
    value: id,
  })),
);

// Use assembly composable
const { assemble } = useAssembly({
  onError: (result: AssemblyResult) => {
    const root = (document as any).app;
    // Set compilation error and show modal
    root.assemblyError = result.msg;
    root.$emit("show-assembly-error");
  },
  onWarning: async (result: AssemblyResult) => {
    if (result.token && result.bgcolor) {
      show_notification(result.token, result.bgcolor);
    }
    // Still change to simulator view on warning
    const root = (document as any).app;
    root.creator_mode = "simulator";
    // Wait for next tick to ensure simulator view is mounted, then update UI
    await nextTick();
    updateSimulatorUI();
  },
  onSuccess: async () => {
    // Change to simulator view
    const root = (document as any).app;
    root.creator_mode = "simulator";
    // Wait for next tick to ensure simulator view is mounted, then update UI
    await nextTick();
    updateSimulatorUI();
  },
  emitAssemblyEvent: true, // Emit event to force instructions table refresh
});

async function loadAvailableSets(): Promise<{ [key: string]: ExampleSet }> {
  const sets = example_set
    .filter(set => set.architecture === props.architecture_name)
    // convert sets to object ({"default": {...}, ...})
    .reduce((obj: { [key: string]: ExampleSet }, item) => {
      obj[item.id] = {
        name: item.name,
        description: item.description,
        url: item.url,
      };
      return obj;
    }, {});

  // load examples
  for (const [_key, set] of Object.entries(sets)) {
    try {
      const response = await fetch(set.url!);
      if (response.ok) {
        set.examples = await response.json();
      } else {
        set.examples = [];
      }
    } catch (_error) {
      set.examples = [];
    }
    delete set.url;
  }

  available_sets.value = sets;

  return sets;
}

async function assembleExample() {
  const root = (document as any).app;

  // Get default compiler for the architecture
  await assemble(root.assembly_code);
}

function updateSimulatorUI() {
  // Update the simulator controls to enable buttons
  const root = (document as any).app;
  const simulatorControls = root.$refs.navbar?.$refs?.simulatorControls;

  if (simulatorControls) {
    // Call execution_UI_reset to enable buttons and update execution table
    simulatorControls.execution_UI_reset();
  }
}

/* Load a selected example */
/**
 * Loads and (optionally) assembles an example
 *
 * @param url URL of the example file (.s)
 * @param assemble Set to automatically assemble the example
 */
async function load_example(url: string, shouldAssemble: boolean) {
  // close modal
  hideModal();

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to load example");
    }

    const code = await response.text();
    const root = (document as any).app;
    root.assembly_code = code;

    if (shouldAssemble) {
      // Assemble and switch to simulator view
      await assembleExample();
    } else {
      // Just load the code and switch to assembly view
      root.creator_mode = "assembly";
    }

    /* Google Analytics */
    creator_ga("event", "example.loading", "example.loading.url");
  } catch (_error) {
    show_notification("Failed to load example", "danger");
  }
}

// Load available sets on mount
loadAvailableSets();
</script>

<template>
  <b-modal
    :id="id"
    class="bottomCard"
    title="Available examples"
    no-footer
    centered
    scrollable
  >
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
            {{ example.name }}: {{ example.description }}
          </b-list-group-item>
        </b-col>
        <b-button
          @click="
            () => {
              selected_example = example.id;
              showLink();
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
