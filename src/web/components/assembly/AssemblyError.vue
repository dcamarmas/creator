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

export default defineComponent({
  props: {
    id: { type: String, required: true },
    reff: { type: String, required: true },
    assembly_error: { type: String, required: true },
  },
});
</script>

<template>
   <b-modal :id="id" title="Assembly Code Error" :ref="reff" no-footer size="lg"
    >
    <div class="errorAssembly">
       <span class="font-monospace lh-1" v-html="assembly_error" />
    </div>
     </b-modal
  >
</template>

<style lang="scss" scoped>
.errorAssembly {
  padding: 3%;
  background: #000000;
  color: rgb(241, 241, 241);
  white-space: pre;
  overflow-x: auto;
  line-height: 112%;
  border-radius: 3px;
}
</style>

