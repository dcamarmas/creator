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
  },
})
</script>

<template>
  <b-modal :id="id" title="CREATOR Community" scrollable no-footer size="xl">
    <b-container fluid align-h="center" class="mx-0 px-0">
      <b-row cols="3" class="text-center" align-v="center">
        <b-col cols="4">
          <a target="_blank" href="https://www.uc3m.es/">
            <img
              alt="Universidad Carlos III de Madrid Logo"
              class="p-0"
              style="width: 100%"
              src="@/web/assets/img/institutions/uc3m.webp"
            />
          </a>
        </b-col>

        <b-col cols="4">
          <a target="_blank" href="https://www.uclm.es/">
            <img
              alt="Universidad de Castilla La - Mancha Logo"
              class="p-0"
              style="width: 55%"
              src="@/web/assets/img/institutions/uclm.webp"
            />
          </a>
        </b-col>

        <b-col cols="4">
          <a target="_blank" href="https://www.unileon.es/">
            <img
              alt="Universidad de Leon Logo"
              class="p-0"
              style="width: 75%"
              src="@/web/assets/img/institutions/unileon.webp"
            />
          </a>
        </b-col>

        <b-col cols="12">
          <b-list-group class="my-3">
            <b-list-group-item style="text-align: center">
              If you want to appear in this list, please contact us:
              <a href="mailto: creator.arcos.inf.uc3m.es@gmail.com">
                creator.arcos.inf.uc3m.es@gmail.com
              </a>
            </b-list-group-item>
          </b-list-group>
        </b-col>
      </b-row>
    </b-container>
  </b-modal>
</template>
