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
<style lang="scss" scoped>
.browserBadge {
  background-color: transparent;
}

.broserIcon {
  height: 50px;
  width: auto;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    browser: { type: String, required: false },
  },

  data() {
    return {
      modalShow: false,
    };
  },

  methods: {
    validate_browser() {
      switch (this.browser) {
        case "Chrome":
        case "Firefox":
        case "Safari":
          return true;

        default:
          return false;
      }
    },
  },

  mounted() {
    this.modalShow = !this.validate_browser();
  },
});
</script>

<template>
   <b-modal v-model="modalShow" title="Browser not supported" no-footer
    > <span class="h6"
      > You are using an unsupported browser, please use one of the following:
      </span
    > <br /> <b-list-group
      > <b-list-group-item
        class="d-flex justify-content-between align-items-center"
        > Google Chrome 70+ <b-badge pill class="browserBadge"
          > <b-img
            src="@/web/assets/img/browsers/chrome.webp"
            class="shadow broserIcon"
            rounded="circle"
            fluid
            alt="Responsive image"
          /> </b-badge
        > </b-list-group-item
      > <b-list-group-item
        class="d-flex justify-content-between align-items-center"
        > Mozilla Firefox 60+ <b-badge pill class="browserBadge"
          > <b-img
            src="@/web/assets/img/browsers/firefox.webp"
            class="shadow broserIcon"
            rounded="circle"
            fluid
            alt="Responsive image"
          /> </b-badge
        > </b-list-group-item
      > <b-list-group-item
        class="d-flex justify-content-between align-items-center"
        > Apple Safari 12+ <b-badge pill class="browserBadge"
          > <b-img
            src="@/web/assets/img/browsers/safari.webp"
            class="shadow broserIcon"
            rounded="circle"
            fluid
            alt="Responsive image"
          /> </b-badge
        > </b-list-group-item
      > </b-list-group
    > </b-modal
  >
</template>

