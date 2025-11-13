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
import { useModal } from "bootstrap-vue-next";
import QrcodeVue from "qrcode.vue";

export default defineComponent({
  props: {
    id: { type: String, required: true },
    architecture_name: { type: String, required: true },
    assembly_code: { type: String, required: false },
    example_set: { type: String, required: false },
    example_id: { type: String, required: false },
  },

  components: {
    QrcodeVue,
  },

  setup() {
    // this HAS to be defined here
    const { hide } = useModal();
    return { hide };
  },

  data() {
    return {
      // version 32, ECL M, Alphanumeric Mode (see
      // https://www.thonky.com/qr-code-tutorial/character-capacities)
      maxQRSize: 2238,
    };
  },

  computed: {
    uri() {
      let u =
        window.location.href.split("?")[0]!.split("#")[0] +
        "?architecture=" +
        encodeURIComponent(this.architecture_name);

      if (this.assembly_code) {
        u += `&asm=${encodeURIComponent(this.assembly_code)}`;
      } else if (this.example_set && this.example_id) {
        u +=
          `&example_set=${encodeURIComponent(this.example_set)}` +
          `&example=${encodeURIComponent(this.example_id)}`;
      }

      return u;
    },
  },

  methods: {
    copyURI() {
      navigator.clipboard.writeText(this.uri);
      this.hide();
    },
  },
});
</script>

<template>
   <b-modal :id="id" title="Share via URI" no-footer class="text-center"
    > <qrcode-vue
      v-if="uri.length < maxQRSize"
      class="mb-3"
      :value="uri"
      level="M"
      :size="300"
      :margin="1"
      render-as="canvas"
    /> <b-input-group
      > <b-form-input v-model="uri" readonly /> <b-button
        variant="info"
        @click="copyURI"
        > <font-awesome-icon :icon="['fas', 'copy']" /> Copy </b-button
      > </b-input-group
    > </b-modal
  >
</template>

