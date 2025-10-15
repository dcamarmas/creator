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
    version: { type: String, required: true },
    architecture_name: { type: String, required: true },
  },
})
</script>

<template>
  <b-navbar toggleable="sm" class="header px-2">
    <b-navbar-brand class="p-0 m-0" href=".">
      <!-- <b-container fluid align-h="center" class="mx-0 px-0"> -->
      <b-row cols="2" align-h="center">
        <b-col class="headerText col-auto text-uppercase">
          <h1>
            Creator
            <b-badge pill variant="secondary">{{ version }}</b-badge>
          </h1>
        </b-col>

        <b-col class="headerText col-auto my-0 p-0 ml-2">
          {{ architecture_name }}
        </b-col>
      </b-row>
      <!-- </b-container> -->

      <!-- <b-container fluid align-h="center"> -->
      <b-row cols="1" align-h="center">
        <b-col class="headerName col-auto fw-bold mx-1">
          didaCtic and geneRic assEmbly progrAmming simulaTOR
        </b-col>
      </b-row>
      <!-- </b-container> -->
    </b-navbar-brand>

    <b-navbar-toggle
      target="nav_collapse"
      aria-label="Open/Close more information"
    />
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav class="ms-auto">
        <b-nav-item
          href="https://docs.google.com/forms/d/e/1FAIpQLSdFbdy5istZbq2CErZs0cTV85Ur8aXiIlxvseLMhPgs0vHnlQ/viewform?usp=header"
          target="_blank"
        >
          <b-button size="sm" class="linkButton">
            <font-awesome-icon :icon="['fas', 'star']" />
            Feedback
          </b-button>
        </b-nav-item>

        <b-nav-item
          class="mb-0 pb-0 p-0"
          href="https://docs.google.com/forms/d/e/1FAIpQLSfSclv1rKqBt5aIIP3jfTGbdu8m_vIgEAaiqpI2dGDcQFSg8g/viewform?usp=header"
          target="_blank"
        >
          <b-button size="sm" class="linkButton">
            <font-awesome-icon :icon="['fas', 'lightbulb']" />
            Suggestions
          </b-button>
        </b-nav-item>

        <b-nav-item>
          <b-button size="sm" class="linkButton" v-b-modal.institutions>
            <font-awesome-icon :icon="['fas', 'building-columns']" />
            Community
          </b-button>
        </b-nav-item>

        <b-nav-item>
          <b-button size="sm" class="linkButton" v-b-modal.about>
            <font-awesome-icon :icon="['fas', 'address-card']" />
            About Us
          </b-button>
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/bootstrap";

.header {
  width: 100%;
  align-items: center;
  background-color: #eaeaea;
  padding-top: 0pt;
  padding-bottom: 0pt;
}

.headerText {
  color: #2196f3;
  margin: 0px;
}

.headerName {
  color: #383d41;
  font-size: 0.55em;
}

.headerLogo {
  height: 5vh;
}

.linkButton {
  background-color: white;
  color: #6c757d;
}

[data-bs-theme="dark"] {
  .header {
    background-color: #2f2f2f;
  }
  .headerName {
    color: $secondary;
  }
  .linkButton {
    background-color: #212529;
    color: $secondary;
  }
  .linkButton:hover {
    background-color: #424649;
  }
}
</style>
