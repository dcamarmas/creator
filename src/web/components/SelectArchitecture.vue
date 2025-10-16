<script lang="ts">
import { defineComponent, type PropType } from "vue"
import { useToggle } from "bootstrap-vue-next"

import UIeltoToolbar from "./general/UIeltoToolbar.vue"
import PreloadArchitecture from "./select_architecture/PreloadArchitecture.vue"
import LoadArchitecture from "./select_architecture/LoadArchitecture.vue"
import DeleteArchitecture from "./select_architecture/DeleteArchitecture.vue"

export default defineComponent({
  props: {
    arch_available: {
      type: Array as PropType<AvailableArch[]>,
      required: true,
    },
    browser: { type: String, required: true },
    os: { type: String, required: true },
    dark: { type: Boolean, required: true },
    windowHeight: { type: Number, required: true },
  },

  emits: ["select-architecture"], // PreloadArchitecture's event, we just pass it to our parent

  components: {
    UIeltoToolbar,
    PreloadArchitecture,
    LoadArchitecture,
    DeleteArchitecture,
  },

  setup() {
    const showDeleteModal = useToggle("modal-delete-arch").show

    return { showDeleteModal }
  },

  data() {
    return {
      contactMail: "creator.arcos.inf.uc3m.es@gmail.com",
      archToDelete: null as string | null,

      render: 0, // dummy variable to force components with this as key to refresh
    }
  },

  methods: {
    refresh() {
      // refreshes children components with `:key="render"`
      this.render++
    },
  },
})
</script>

<template>
  <b-container fluid align-h="center" id="load_menu">
    <!-- Navbar -->
    <UIeltoToolbar
      id="navbar_load_architecture"
      :components="' | | |btn_configuration,btn_information'"
      :browser="browser"
      :os="os"
      :dark="dark"
      :arch_available="arch_available"
      ref="toolbar"
    />

    <!-- Architecture menu -->
    <b-card-group deck id="load_menu_arch" :key="render">
      <!-- Preload architecture card -->
      <PreloadArchitecture
        v-for="arch in arch_available.filter(a => a.available)"
        :architecture="arch"
        :dark="dark"
        @select-architecture="
          (arch_name: string) => {
            $emit('select-architecture', arch_name) // emit to our grandparent
          }
        "
        @delete-architecture="
          (arch_name: string) => {
            archToDelete = arch_name
            showDeleteModal()
          }
        "
      />

      <!-- Load new architecture card -->
      <LoadArchitecture
        @select-architecture="
          (arch_name: string) => {
            $emit('select-architecture', arch_name) // emit to our grandparent
          }
        "
      />
    </b-card-group>

    <!-- Delete architecture modal -->
    <DeleteArchitecture id="modal-delete-arch" :arch="archToDelete" />

    <!-- CREATOR Information -->
    <b-list-group
      align-h="center"
      :class="{
        'mx-3': true,
        'my-2': true,
        'fixed-bottom':
          // we put the info at the bottom, unless it overlaps w/ the
          // architecture cards
          // if we have fewer than 3 cards, the card height starts to overlap,
          // so we have to disable the fixed bottom earlier
          windowHeight > 800 + 160 * Math.max(3 - arch_available.length, 0),
      }"
    >
      <b-list-group-item class="text-center">
        <b-link
          underline-opacity="0"
          underline-opacity-hover="75"
          :href="`mailto: ${contactMail}`"
        >
          <font-awesome-icon :icon="['fas', 'envelope']" />
          {{ contactMail }}
        </b-link>
      </b-list-group-item>
    </b-list-group>
  </b-container>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/bootstrap";
:deep() {
  .selectedCard {
    border-color: $secondary;
  }
}
</style>
