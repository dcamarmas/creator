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
export default {
  props: {
    target: { type: String, required: true },
    show_instruction_help: { type: Boolean, required: true },
  },
}
</script>

<template>
  <b-popover :target="target" triggers="click blur">
    <b-button
      class="infoButton"
      variant="outline-secondary"
      size="sm"
      href="https://creatorsim.github.io/"
      target="_blank"
      onclick="creator_ga('send', 'event', 'help', 'help.general_help', 'help.general_help');"
    >
      <font-awesome-icon icon="fa-question-circle" />
      Help
    </b-button>

    <b-button
      class="h-100 infoButton"
      variant="outline-secondary"
      size="sm"
      v-if="show_instruction_help == 'true'"
      id="inst_ass"
      v-b-toggle.sidebar_help
      onclick="creator_ga('send', 'event', 'help', 'help.instruction_help', 'help.instruction_help');"
    >
      <font-awesome-icon icon="fa-book" />
      Instruction Help
    </b-button>

    <b-button
      class="buttonBackground h-100"
      variant="outline-secondary"
      size="sm"
      v-b-modal.notifications
    >
      <span class="fas fa-bell" />
      <font-awesome-icon icon="fa-bell" />
      Show Notifications
    </b-button>
  </b-popover>
</template>
