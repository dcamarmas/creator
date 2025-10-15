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

import { show_notification } from "@/web/utils.mjs"

export default defineComponent({
  props: {
    id: { type: String, required: true },
    arch: { type: [String, null], required: true },
  },

  methods: {
    //Remove architecture
    removeArch(name: string) {
      // remove from root
      ;((this.$root as any).arch_available as AvailableArch[]).splice(
        ((this.$root as any).arch_available as AvailableArch[]).findIndex(
          a => a.name === name,
        ),
        1,
      )

      // remove from localstorage
      const customArchitectures = JSON.parse(
        localStorage.getItem("customArchitectures")!,
      ) as AvailableArch[]

      localStorage.setItem(
        "customArchitectures",
        JSON.stringify(
          customArchitectures.toSpliced(
            customArchitectures.findIndex(a => a.name === name),
            1,
          ),
        ),
      )
      // refresh view
      ;(this.$root as any).$refs.selectArchitectureView.refresh()

      show_notification("Architecture deleted successfully", "success")
    },
  },
})
</script>

<template>
  <b-modal
    :id="id"
    title="Delete Architecture"
    ok-variant="danger"
    ok-title="Delete"
    @ok="removeArch(arch!)"
  >
    Are you sure you want to delete the '<i>{{ arch }}</i
    >' architecture?
  </b-modal>
</template>
