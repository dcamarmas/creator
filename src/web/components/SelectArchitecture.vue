<script>
import UIeltoToolbar from "./general/UIeltoToolbar.vue"
import PreloadArchitecture from "./select_architecture/PreloadArchitecture.vue"
import LoadArchitecture from "./select_architecture/LoadArchitecture.vue"
// import NewArchitecture from "./select_architecture/NewArchitecture.vue"
import DeleteArchitecture from "./select_architecture/DeleteArchitecture.vue"

export default {
  props: {
    arch_available: Array,
    browser: String,
    os: { type: String, required: true },
    dark: { type: Boolean, required: true },
    windowHeight: { type: Number, required: true },
  },

  emits: ["select-architecture"], // PreloadArchitecture's event, we just pass it to our parent

  components: {
    UIeltoToolbar,
    PreloadArchitecture,
    LoadArchitecture,
    // NewArchitecture,
    DeleteArchitecture,
  },
}
</script>

<template>
  <b-container fluid align-h="center" id="load_menu">
    <b-row>
      <b-col>
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
        <b-container
          fluid
          align-h="center"
          class="mx-0 px-1"
          id="load_menu_arch"
        >
          <b-row>
            <b-col>
              <b-card-group deck>
                <!-- Preload architecture card -->
                <PreloadArchitecture
                  v-for="(item, index) in arch_available"
                  :arch_available="arch_available"
                  :architecture="item"
                  :index="index"
                  @select-architecture="
                    arch_name => {
                      this.$emit('select-architecture', arch_name) // emit to our grandparent
                    }
                  "
                />

                <!-- Load new architecture card -->
                <!-- <LoadArchitecture /> -->

                <!-- New architecture card -->
                <!-- <NewArchitecture /> -->
              </b-card-group>
            </b-col>
          </b-row>
        </b-container>

        <!-- CREATOR Information -->
        <b-list-group
          align-h="center"
          :class="{
            'mx-3': true,
            'my-2': true,
            'fixed-bottom': windowHeight > 800,
          }"
        >
          <b-list-group-item class="text-center">
            <b-link
              underline-opacity="0"
              underline-opacity-hover="75"
              href="mailto: creator.arcos.inf.uc3m.es@gmail.com"
            >
              <font-awesome-icon icon="fa-solid fa-envelope" />
              creator.arcos.inf.uc3m.es@gmail.com
            </b-link>
          </b-list-group-item>
        </b-list-group>

        <!-- Architecture selector modals -->

        <!-- Delete architecture modal -->
        <!-- <DeleteArchitecture
          id="modalDeletArch"
          :index="modal_delete_arch_index"
        /> -->
      </b-col>
    </b-row>
  </b-container>
</template>

<style lang="scss" scoped>
:deep() {
  .architectureCard {
    cursor: pointer;
    margin-bottom: 3px;
  }

  .architectureImg {
    width: 50%;
    height: auto;
  }

  .arch_delete {
    margin-top: 50%;
  }
}
</style>
