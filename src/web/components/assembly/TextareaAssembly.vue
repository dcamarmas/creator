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
import { PopoverShortcuts } from './PopoverShortcuts.vue'

export default {
  props: {
    browser: { type: String, required: true },
  },
  components: {
    PopoverShortcuts,
  },
}
</script>

<template>
  <div>
    <span id="assemblyInfo" class="fas fa-info-circle"></span>
    <span class="h5">Assembly:</span>

    <PopoverShortcuts target="assemblyInfo" :browser="browser" />

    <textarea
      id="textarea_assembly"
      rows="14"
      class="code-scroll-y d-none"
      title="Asembly Code"
    ></textarea>
  </div>
</template>
