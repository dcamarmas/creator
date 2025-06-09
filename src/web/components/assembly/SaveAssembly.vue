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
import { creator_ga } from "@/core/utils/creator_ga.mjs"
import { destroyClickedElement } from "@/web/utils.mjs"

export default {
  props: {
    id: { type: String, required: true },
  },

  setup() {
    const default_name = "assembly"

    return { default_name }
  },

  data() {
    return { filename: null }
  },

  methods: {
    // Save code to a local file
    download_assembly() {
      const textToWrite = this.$root.assembly_code
      const textFileAsBlob = new Blob([textToWrite], { type: "text/plain" })

      // download (using JS magic)
      const downloadLink = document.createElement("a")
      downloadLink.download = (this.filename || this.default_name) + ".s"
      downloadLink.innerHTML = "My Hidden Link"

      window.URL = window.URL || window.webkitURL

      downloadLink.href = window.URL.createObjectURL(textFileAsBlob)
      downloadLink.onclick = destroyClickedElement
      downloadLink.style.display = "none"
      document.body.appendChild(downloadLink)

      downloadLink.click()

      // reset filename
      this.filename = "assembly"

      // Google Analytics
      creator_ga("assembly", "assembly.save", "assembly.save")
    },
  },
}
</script>

<template>
  <b-modal
    :id="id"
    title="Save Assembly"
    ok-title="Save to File"
    @ok="download_assembly"
  >
    <BForm class="d-flex flex-row align-items-center flex-wrap">
      <label class="col-form-label col-lg-6">Filename:</label>
      <div class="col-lg-6">
        <b-input-group append=".s">
          <b-form-input
            v-model="filename"
            class="text-end"
            autofocus
            type="text"
            :placeholder="default_name"
          />
        </b-input-group>
      </div>
    </BForm>
  </b-modal>
</template>
