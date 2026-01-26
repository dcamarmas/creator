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
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    id: { type: String, required: true },
  },
});
</script>

<template>
  <b-modal :id="id" title="CREATOR Usage Statistics" scrollable no-footer size="xl">
    <b-container fluid align-h="center" class="mx-0 px-0" style="height: 80vh;">
      <iframe 
          src="https://lookerstudio.google.com/embed/reporting/769b4a4c-4d22-4472-a293-2b7f20fad040/page/PjKmF" 
          frameborder="0" 
          style="border:0; width: 100%; height: 100%;" 
          allowfullscreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        >
      </iframe>
    </b-container>
  </b-modal>
</template>
