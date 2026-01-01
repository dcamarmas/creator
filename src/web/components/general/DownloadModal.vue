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
<script lang="ts">
import { creator_ga } from "@/core/utils/creator_ga.mjs";
import { downloadToFile } from "@/web/utils.mjs";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    id: { type: String, required: true },
    title: { type: String, required: true },
    extension: { type: String, required: true },
    fileData: { type: String, required: true },
    defaultFilename: { type: String, required: true },
    type: { type: String, required: true },
  },

  data() {
    return { filename: null };
  },

  methods: {
    download() {
      downloadToFile(
        this.fileData,
        (this.filename || this.defaultFilename) + this.extension,
      );

      // Google Analytics
      creator_ga(this.type, `${this.type}.save`, `${this.type}.save`);
    },
  },
});
</script>

<template>
  <b-modal
    :id="id"
    :title="title"
    ok-title="Save to File"
    @ok="download"
    @hidden="filename = null"
  >
    <b-form class="d-flex flex-row align-items-center flex-wrap">
      <b-col> <label class=".fs-3">Filename:</label> </b-col>
      <b-col cols="8">
        <b-input-group :append="extension">
          <b-form-input
            v-model="filename"
            class="text-end"
            autofocus
            type="text"
            :placeholder="defaultFilename"
          />
        </b-input-group>
      </b-col>
    </b-form>
  </b-modal>
</template>
