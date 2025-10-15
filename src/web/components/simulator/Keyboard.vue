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
import { execution_mode, status } from "@/core/core.mjs"
import { defineComponent } from "vue"

export default defineComponent({
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
      set(value: string) {
        ;(this.$root as any).keyboard = value
      },
    },
  },

  methods: {
    /*Empty keyboard and display*/
    consoleClear() {
      this.keyboard_value = ""
      ;(this.$root as any).display = ""
    },

    /*Console mutex*/
    consoleEnter() {
      if (this.keyboard_value !== "") {
        status.run_program = execution_mode
      }
    },
  },
})
</script>

<template>
  <div>
    <b-container fluid align-h="start" class="mx-0 px-0">
      <b-row cols="2" align-h="start">
        <b-col cols="1">
          <font-awesome-icon
            size="3x"
            :icon="['fas', 'keyboard']"
            class="consoleIcon"
          />
        </b-col>
        <b-col lg="11" cols="12">
          <b-form-textarea
            id="textarea_keyboard"
            v-model="keyboard_value"
            :state="enter"
            rows="5"
          />
        </b-col>
      </b-row>
    </b-container>

    <b-row fluid align-h="end">
      <b-col cols="auto">
        <b-button-group>
          <b-button
            variant="outline-secondary"
            class="menuGroup keyboardButton"
            @click="consoleClear"
          >
            <font-awesome-icon :icon="['fas', 'broom']" />
            Clear
          </b-button>
          <b-button
            id="enter_keyboard"
            variant="outline-secondary"
            class="menuGroup keyboardButton"
            @click="consoleEnter"
          >
            <font-awesome-icon
              :icon="['fas', 'turn-down']"
              style="transform: rotate(90deg)"
            />
            Enter
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>
  </div>
</template>

<style lang="scss" scoped>
.keyboardButton {
  margin-top: 5%;
  float: right;
}
</style>
