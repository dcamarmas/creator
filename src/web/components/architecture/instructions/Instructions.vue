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
import InstructionFields from "./InstructionFields.vue"

export default {
  props: {
    instructions: { type: Array, required: true },
  },

  components: { InstructionFields },

  data() {
    return {
      // Instructions table fields
      instructions_fields: [
        { key: "name", sortable: true },
        { key: "co", label: "CO" },
        { key: "cop", label: "Extended CO" },
        { key: "nwords" },
        { key: "signatureRaw", label: "Instruction syntax" },
        { key: "properties" },
        { key: "clk_cycles" },
        { key: "fields" },
        { key: "definition" },
      ],

      // instruction data
      modal_field_instruction: {
        name: "",
        index: 0,
      },
    }
  },

  methods: {
    // Show instruction fields modal
    view_instructions_modal(name, index) {
      this.modal_field_instruction = {
        name,
        index,
      }
    },
  },
}
</script>
<template>
  <InstructionFields
    id="fields_instructions"
    :name="modal_field_instruction.name"
    :index="modal_field_instruction.index"
    :instruction="instructions[modal_field_instruction.index]"
  />

  <!-- Instruction set table -->
  <b-table
    small
    :items="instructions"
    :fields="instructions_fields"
    class="text-center mt-3"
    sticky-header="78vh"
  >
    <!-- For each instruction -->

    <template v-slot:cell(properties)="row">
      <b-badge
        class="m-1"
        v-for="property in row.item.properties"
        pill
        variant="primary"
      >
        {{ property }}
      </b-badge>
    </template>

    <template v-slot:cell(signatureRaw)="row">
      {{ row.item.signatureRaw }}
      <br />
      {{ row.item.signature }}
    </template>

    <template v-slot:cell(fields)="row">
      <b-button
        @click.stop="view_instructions_modal(row.item.name, row.index)"
        variant="outline-secondary"
        size="sm"
        v-b-toggle.fields_instructions
      >
        View Fields
      </b-button>
    </template>

    <template v-slot:cell(definition)="row">
      <b-form-textarea
        v-model="row.item.definition"
        readonly
        no-resize
        rows="1"
        max-rows="4"
        title="Instruction Definition"
      >
      </b-form-textarea>
    </template>
  </b-table>
</template>
