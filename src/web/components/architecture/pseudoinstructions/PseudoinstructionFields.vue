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

export default defineComponent({
  props: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    index: { type: Number, required: true },
    pseudoinstruction: {
      type: Object as PropType<PseudoInstruction>,
      required: true,
    },
  },
})
</script>

<template>
  <b-modal :id="id" size="lg" :title="`Fields of ${name}`" no-footer>
    <b-form>
      <!-- headers -->

      <div class="col-lg-12 col-sm-12 row">
        <div class="col-lg-4 col-4 fields"></div>
        <div class="col-lg-4 col-4 fields">
          <span class="h6">Name</span>
        </div>
        <div class="col-lg-4 col-4 fields">
          <span class="h6">Type</span>
        </div>
      </div>

      <div
        v-for="(field, field_index) in pseudoinstruction.fields"
        :key="field.name"
      >
        <div class="col-lg-12 col-sm-12 row">
          <div class="col-lg-4 col-4 fields">
            <span class="h6">Field {{ field_index }}</span>
          </div>
          <div class="col-lg-4 col-4 fields">
            <b-form-group>
              <b-form-input
                type="text"
                :model-value="field.name"
                readonly
                size="sm"
                title="Field name"
              />
            </b-form-group>
          </div>

          <div class="col-lg-4 col-4 fields">
            <b-form-group>
              <b-form-input
                :model-value="field.type"
                readonly
                type="text"
                size="sm"
                title="Field type"
              />
            </b-form-group>
          </div>
        </div>
      </div>
    </b-form>
  </b-modal>
</template>
