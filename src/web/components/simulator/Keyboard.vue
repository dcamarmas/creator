<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos

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
import { execution_mode, status } from "@/core/core.mjs"

export default {
  props: {
    keyboard: { type: String, required: true },
    enter: [Boolean, null],
  },

  computed: {
    keyboard_value: {
      // sync with App's
      get() {
        return this.keyboard
      },
      set(value) {
        this.$root.keyboard = value
      },
    },
  },

  methods: {
    /*Empty keyboard and display*/
    consoleClear() {
      this.keyboard_value = ""
      this.$root.display = ""
    },

    // getDebounceTime() {
    //   // Determines the refresh timeout depending on the device being used
    //   if (screen.width > 768) {
    //     return 500
    //   } else {
    //     return 1000
    //   }
    // },

    /*Console mutex*/
    consoleEnter() {
      if (this.keyboard_value !== "") {
        status.run_program = execution_mode
      }
    },

    /*Stop user interface refresh*/
    //   debounce: _.debounce(function (param, e) {
    //     console_log(param)
    //     console_log(e)

    //     e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    //     let re = /'/g
    //     e = e.replace(re, '"')
    //     re = /[\f]/g
    //     e = e.replace(re, "\\f")
    //     re = /[\n]/g
    //     e = e.replace(re, "\\n")
    //     re = /[\r]/g
    //     e = e.replace(re, "\\r")
    //     re = /[\t]/g
    //     e = e.replace(re, "\\t")
    //     re = /[\v]/g
    //     e = e.replace(re, "\\v")

    //     if (e === "") {
    //       this[param] = null
    //       return
    //     }

    //     console_log("this." + param + "= '" + e + "'")

    //     eval("this." + param + "= '" + e + "'")

    //     this.$root.$forceUpdate()
    //   }, getDebounceTime()),
  },
}
</script>

<template>
  <div>
    <b-container fluid align-h="start" class="mx-0 px-0">
      <b-row cols="2" align-h="start">
        <b-col cols="1">
          <font-awesome-icon icon="fa-solid fa-keyboard" class="consoleIcon" />
        </b-col>
        <b-col lg="11" cols="12">
          <!-- <b-form-textarea
            id="textarea_keyboard"
            v-on:input="debounce('local_keyboard', $event)"
            :value="keyboard_value"
            rows="5"
            no-resize
            :state="enter"
            title="Keyboard"
          /> -->
          <b-form-textarea
            id="textarea_keyboard"
            v-model="keyboard_value"
            :state="enter"
            rows="5"
          />
        </b-col>
      </b-row>
    </b-container>

    <b-container fluid align-h="end" class="mx-0 px-0">
      <b-row cols="3" align-h="end" class="">
        <b-col>
          <b-button
            variant="outline-secondary"
            class="btn-block menuGroup keyboardButton"
            @click="consoleClear"
          >
            <font-awesome-icon icon="fa-solid fa-broom" />
            Clear
          </b-button>
        </b-col>
        <b-col>
          <b-button
            id="enter_keyboard"
            variant="outline-secondary"
            class="menuGroup keyboardButton"
            @click="consoleEnter"
          >
            <font-awesome-icon
              icon="fa-solid fa-level-down-alt"
              class="enterIcon"
            />
            Enter
          </b-button>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style lang="scss" scoped>
.keyboardButton {
  margin-top: 5%;
  float: right;
}

.enterIcon {
  transform: rotate(90deg);
}
</style>
