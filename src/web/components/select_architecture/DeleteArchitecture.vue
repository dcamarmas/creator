<!--
Copyright 2018-2025 CREATOR Team.

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
import { defineComponent } from "vue";

import { show_notification } from "@/web/utils.mjs";

export default defineComponent({
  props: {
    id: { type: String, required: true },
    arch: { type: [String, null], required: true },
    modelValue: { type: Boolean, default: false },
  },

  emits: ["update:modelValue", "architecture-deleted"],

  computed: {
    showModal: {
      get() {
        return this.modelValue;
      },
      set(value: boolean) {
        this.$emit("update:modelValue", value);
      },
    },
  },

  methods: {
    //Remove architecture
    removeArch(name: string) {
      // remove from localstorage
      const customArchitectures = JSON.parse(
        localStorage.getItem("customArchitectures") || "[]",
      ) as AvailableArch[];

      const updatedArchitectures = customArchitectures.filter(
        a => a.name !== name,
      );

      localStorage.setItem(
        "customArchitectures",
        JSON.stringify(updatedArchitectures),
      );

      // Close the modal
      this.$emit("update:modelValue", false);

      // Emit event to parent to notify deletion
      this.$emit("architecture-deleted", name);
    },
  },
});
</script>

<template>
   <b-modal
    :id="id"
    v-model="showModal"
    title="Delete Architecture"
    ok-variant="danger"
    ok-title="Delete"
    @ok="removeArch(arch!)"
    > Are you sure you want to delete the '<i>{{ arch }}</i
    >' architecture? </b-modal
  >
</template>

