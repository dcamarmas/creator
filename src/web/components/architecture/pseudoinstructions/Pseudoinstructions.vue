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
import type { PseudoInstruction } from "@/core/core"

import PseudoinstructionFields from "./PseudoinstructionFields.vue"

export default defineComponent({
  props: {
    pseudoinstructions: {
      type: Array as PropType<PseudoInstruction[]>,
      required: true,
    },
  },

  components: { PseudoinstructionFields },

  data() {
    return {
      // Pseudoinstructions table fields
      pseudoinstructions_fields: [
        { key: "name", sortable: true },
        { key: "nwords" },
        { key: "signatureRaw", label: "Instruction syntax" },
        { key: "fields" },
        { key: "definition" },
      ],

      modal_field_pseudoinstruction: {
        name: "",
        index: 0,
      },
    }
  },

  methods: {
    //Show pseudoinstruction fields modal
    view_pseudoinstruction_modal(name: string, index: number) {
      this.modal_field_pseudoinstruction = {
        name,
        index,
      }
    },
  },
})
</script>

<template>
  <!-- Pseudontruction fields -->
  <PseudoinstructionFields
    id="fields_pseudoinstructions"
    :name="modal_field_pseudoinstruction.name"
    :index="modal_field_pseudoinstruction.index"
    :pseudoinstruction="
      pseudoinstructions[modal_field_pseudoinstruction.index]!
    "
  />

  <!-- Pseudoinstruction set table -->
  <b-table
    small
    :items="pseudoinstructions"
    :fields="pseudoinstructions_fields"
    class="text-center mt-3"
    sticky-header="78vh"
  >
    <!-- For each pseudoinstruction -->

    <template v-slot:cell(signatureRaw)="row">
      {{ row.item.signature_definition }}
    </template>

    <template v-slot:cell(fields)="row">
      <b-button
        @click.stop="view_pseudoinstruction_modal(row.item.name, row.index)"
        v-b-toggle.fields_pseudoinstructions
        variant="outline-secondary"
        size="sm"
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
        title="Pseudoinstruction Definition"
      />
    </template>
  </b-table>
</template>
