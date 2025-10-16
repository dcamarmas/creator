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

export default defineComponent({
  props: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    index: { type: Number, required: true },
    instruction: { type: Object, required: true },
  },

  data() {
    return {
      // Allow instruction with fractioned fields
      fragmet_data: [
        "imm-signed",
        "imm-unsigned",
        "address",
        "offset_bytes",
        "offset_words",
      ],
    }
  },
})
</script>

<template>
  <b-modal :id="id" size="lg" :title="`Fields of ${name}`" no-footer>
    <b-form>
      <!-- headers -->

      <div class="col-lg-14 col-sm-14 row">
        <div class="col-lg-1 col-1 fields" />
        <div class="col-lg-2 col-2 fields">
          <span class="h6">Name</span>
        </div>
        <div class="col-lg-2 col-2 fields">
          <span class="h6">Type</span>
        </div>
        <div class="col-lg-1 col-1 fields">
          <span class="h6">Break</span>
        </div>
        <div class="col-lg-2 col-2 fields">
          <span class="h6">Start Bit</span>
        </div>
        <div class="col-lg-2 col-2 fields">
          <span class="h6">End Bit</span>
        </div>
        <div class="col-lg-2 col-2 fields">
          <span class="h6">Value</span>
        </div>
      </div>

      <!-- fields -->
      <div v-for="(field, field_index) in instruction.fields" :key="field.name">
        <div class="col-lg-14 col-sm-14 row">
          <div class="col-lg-1 col-1 fields">
            <span class="h6">Field {{ field_index }}</span>
          </div>

          <div class="col-lg-2 col-2 fields">
            <b-form-input
              v-if="field_index != 0"
              type="text"
              :model-value="field.name"
              readonly
              size="sm"
              title="Field name"
            />
            <b-form-input
              v-else
              type="text"
              :model-value="field.name"
              readonly
              size="sm"
              title="Field name"
            />
          </div>

          <div class="col-lg-2 col-2 fields">
            <b-form-input
              type="text"
              :model-value="field.type"
              readonly
              size="sm"
              title="Field type"
            />
          </div>

          <div
            v-if="typeof instruction.separated !== 'undefined'"
            class="col-lg-1 col-1 fields"
          >
            <b-form-checkbox
              v-if="
                fragmet_data.indexOf(instruction.separated[field_index]) !== -1
              "
              :id="'view-fragment-' + field_index"
              :model-value="instruction.separated[field_index]"
              class="ml-3"
              disabled
            />
          </div>

          <!-- start bit description -->
          <div class="col-lg-2 col-2 fields">
            <b-form-input
              v-if="typeof field.startbit !== 'object'"
              type="number"
              min="0"
              :max="32 * instruction.nwords - 1"
              :model-value="field.startbit"
              readonly
              size="sm"
              title="Field start bit"
            />
            <b-form-group v-else>
              <b-form-input
                v-for="(j, ind) in field.startbit"
                type="number"
                min="0"
                :max="32 * instruction.nwords - 1"
                :model-value="field.startbit[ind]"
                readonly
                class="mb-2"
                title="Field start bit"
              />
            </b-form-group>
          </div>

          <!-- stop bit description -->
          <div class="col-lg-2 col-2 fields">
            <b-form-input
              v-if="typeof field.stopbit !== 'object'"
              type="number"
              min="0"
              :max="32 * instruction.nwords - 1"
              :model-value="field.stopbit"
              readonly
              size="sm"
              title="Field end bit"
            />
            <b-form-group v-else>
              <b-form-input
                v-for="bit in field.stopbit"
                type="number"
                min="0"
                :max="32 * instruction.nwords - 1"
                :model-value="bit"
                readonly
                class="mb-2"
                title="Field end bit"
              />
            </b-form-group>
          </div>

          <div class="col-lg-2 col-2 fields" v-if="field.type == 'co'">
            <b-form-input
              type="text"
              :model-value="instruction.co"
              readonly
              size="sm"
              title="Instruction CO"
            />
          </div>

          <div class="col-lg-2 col-2 fields" v-if="field.type == 'cop'">
            <b-form-input
              type="text"
              :model-value="field.value"
              readonly
              size="sm"
              title="Field value"
            />
          </div>
        </div>
      </div>
    </b-form>
  </b-modal>
</template>
