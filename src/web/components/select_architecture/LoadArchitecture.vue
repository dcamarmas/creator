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
import {
  hide_loading,
  show_loading,
  loadCustomArchitecture,
  show_notification,
} from "@/web/utils.mjs"

export default {
  emits: [
    "select-architecture", // architecture has been selected
  ],

  data() {
    return {
      //Form inputs
      name: "",
      description: "",
      file: null,

      selected: false,
    }
  },

  methods: {
    loadArch(event) {
      // show_loading()

      event.preventDefault()

      // read file
      const reader = new FileReader()
      reader.onload = event => {
        const archDefinition = event.currentTarget.result

        // TODO: parse and verify schema

        const architecture = {
          name: this.name,
          alias: [],
          img: "/img/personalized_logo.png",
          id: `select_conf${this.name}`,
          examples: [],
          description: this.description,
          definition: archDefinition,
          available: true,
        }

        // add to localStorage
        localStorage.setItem(
          "customArchitectures",
          JSON.stringify(
            // add to the list of custom architectures
            (
              JSON.parse(localStorage.getItem("customArchitectures")) ?? []
            ).toSpliced(0, 0, architecture),
          ),
        )

        // load architecture
        loadCustomArchitecture(architecture)

        // hide_loading()

        // notify architecture has been selected
        this.$emit("select-architecture", this.name)

        // Clean form
        this.name = ""
        this.description = ""
        this.file = null
      }

      reader.onerror = () => show_notification("Error loading file", "danger")

      reader.readAsText(this.file)

      // //Verify all form fields
      // if (!this.name || !this.file) {
      //   hide_loading()
      //   show_notification("Please complete all fields", "danger")
      //   return
      // }

      // this.show_modal = false

      // //Read JSON and add the new architecture on CREATOR
      // let file
      // let reader
      // const files = document.getElementById("arch_file").files

      // //Read one or more files
      // for (let i = 0; i < files.length; i++) {
      //   file = files[i]
      //   reader = new FileReader()

      //   reader.onloadend = (function (name_arch, description_arch) {
      //     return function (e) {
      //       //Add the new architecture on CREATOR
      //       architecture_available.push({
      //         name: name_arch,
      //         img: "./images/personalized_logo.png",
      //         alt: name_arch + " logo",
      //         id: "select_conf" + name_arch,
      //         description: description_arch,
      //         available: 1,
      //       })
      //       load_architectures_available.push({
      //         name: name_arch,
      //         img: "./images/personalized_logo.png",
      //         alt: name_arch + " logo",
      //         id: "select_conf" + name_arch,
      //         description: description_arch,
      //         available: 1,
      //       })
      //       back_card.push({
      //         name: architecture_available[architecture_available.length - 1]
      //           .name,
      //         background: "default",
      //       })
      //       load_architectures.push({
      //         id: name_arch,
      //         architecture: event.currentTarget.result,
      //       })

      //       //Refresh cache values
      //       if (typeof Storage !== "undefined") {
      //         let auxArch = JSON.stringify(load_architectures, null, 2)
      //         localStorage.setItem("load_architectures", auxArch)

      //         auxArch = JSON.stringify(load_architectures_available, null, 2)
      //         localStorage.setItem("load_architectures_available", auxArch)
      //       }

      //       show_notification(
      //         "The selected architecture has been loaded correctly",
      //         "success",
      //       )
      //       hide_loading()
      //     }
      //   })(this.name, this.description)

      //   reader.readAsArrayBuffer(file)
      // }
    },
  },
}
</script>

<template>
  <b-card
    v-b-modal.load_arch
    :class="{ selectedCard: selected }"
    title="Load Custom Architecture"
    style="cursor: pointer"
    @mouseover="selected = true"
    @mouseleave="selected = false"
  >
    <template #img>
      <b-img
        class="mt-2 w-75 load-img"
        style="padding-bottom: 1.2vh"
        placement="center"
        src="@/web/assets/img/load_icon.png"
        alt="load icon"
      />
    </template>
    <b-card-text class="justify">
      Allows to load the definition of an already created architecture.
    </b-card-text>

    <b-modal id="load_arch" title="Load Architecture" @ok="loadArch">
      <!-- TODO: link to template arch -->

      <b-form :valid="name.length > 0 && file !== null">
        <b-form-input
          v-model="name"
          placeholder="Enter the name of the architecture"
          :state="name.length > 0"
          title="Architecture Name"
        />
        <br />
        <b-form-textarea
          v-model="description"
          placeholder="Enter a description of the architecture"
          rows="3"
          title="Architecture Description"
        />
        <br />
        <b-form-file
          v-model="file"
          placeholder="Choose a file..."
          id="arch_file"
          accept=".yml"
          :state="file !== null"
        />
      </b-form>
    </b-modal>
  </b-card>
</template>

<style lang="scss" scoped>
[data-bs-theme="dark"] {
  .load-img {
    filter: invert(70%);
  }
}
</style>
