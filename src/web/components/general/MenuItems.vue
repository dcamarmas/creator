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
<script setup lang="ts">
import { type PropType } from "vue";
import { creator_ga } from "@/core/utils/creator_ga.mjs";

defineProps({
  items: {
    type: Array as PropType<string[]>,
    required: true,
  },
  architectureName: {
    type: String,
    required: false,
  },
  architectureGuide: {
    type: String,
    required: false,
  },
});

const emit = defineEmits(["item-clicked"]);

function help_event(event: string) {
  creator_ga("send", `help.${event}`, `help.${event}`);
}

function handleItemClick() {
  emit("item-clicked");
}
</script>

<template>
  <template v-for="(item, index) in items" :key="index">
    <!-- Architecture info -->
    <b-dropdown-item v-if="item === 'btn_architecture_info'" disabled>
      <font-awesome-icon :icon="['fas', 'microchip']" class="me-2" />
      <strong>{{ architectureName }}</strong>
    </b-dropdown-item>

    <!-- Divider -->
    <b-dropdown-divider v-if="item === 'divider'" />

    <!-- Home -->
    <b-dropdown-item v-if="item === 'btn_home'" href=".">
      <font-awesome-icon :icon="['fas', 'home']" class="me-2" /> Home
    </b-dropdown-item>

    <!-- Website -->
    <b-dropdown-item
      v-if="item === 'btn_website'"
      href="https://creatorsim.github.io/"
      target="_blank"
    >
      <font-awesome-icon :icon="['fas', 'globe']" class="me-2" /> Project
      Website
    </b-dropdown-item>

    <!-- GitHub -->
    <b-dropdown-item
      v-if="item === 'btn_github'"
      href="https://github.com/creatorsim/creator"
      target="_blank"
    >
      <font-awesome-icon :icon="['fab', 'github']" class="me-2" /> GitHub
    </b-dropdown-item>

    <!-- Configuration -->
    <b-dropdown-item
      v-if="item === 'btn_configuration'"
      v-b-modal.configuration
      @click="handleItemClick"
    >
      <font-awesome-icon :icon="['fas', 'gears']" class="me-2" /> Settings...
    </b-dropdown-item>

    <!-- Help -->
    <b-dropdown-item
      v-if="item === 'btn_help'"
      href="https://creatorsim.github.io/"
      target="_blank"
      @click="
        help_event('general_help');
        handleItemClick();
      "
    >
      <font-awesome-icon :icon="['fas', 'circle-question']" class="me-2" /> Help
    </b-dropdown-item>

    <!-- Architecture Guide (if available) -->
    <b-dropdown-item
      v-if="item === 'btn_architecture_guide'"
      :href="architectureGuide"
      target="_blank"
      @click="
        help_event('architecture_guide');
        handleItemClick();
      "
    >
      <font-awesome-icon :icon="['fas', 'file-pdf']" class="me-2" /> {{ architectureName }} Guide
    </b-dropdown-item>

    <!-- Notifications -->
    <b-dropdown-item
      v-if="item === 'btn_notifications'"
      v-b-modal.notifications
      @click="handleItemClick"
    >
      <font-awesome-icon :icon="['fas', 'bell']" class="me-2" /> Notifications
    </b-dropdown-item>

    <!-- Feedback -->
    <b-dropdown-item
      v-if="item === 'btn_feedback'"
      href="https://docs.google.com/forms/d/e/1FAIpQLSdFbdy5istZbq2CErZs0cTV85Ur8aXiIlxvseLMhPgs0vHnlQ/viewform?usp=header"
      target="_blank"
    >
      <font-awesome-icon :icon="['fas', 'star']" class="me-2" /> Feedback
    </b-dropdown-item>

    <!-- Suggestions -->
    <b-dropdown-item
      v-if="item === 'btn_suggestions'"
      href="https://docs.google.com/forms/d/e/1FAIpQLSfSclv1rKqBt5aIIP3jfTGbdu8m_vIgEAaiqpI2dGDcQFSg8g/viewform?usp=header"
      target="_blank"
    >
      <font-awesome-icon :icon="['fas', 'lightbulb']" class="me-2" />
      Suggestions
    </b-dropdown-item>

    <!-- Community -->
    <b-dropdown-item
      v-if="item === 'btn_institutions'"
      v-b-modal.institutions
      @click="handleItemClick"
    >
      <font-awesome-icon :icon="['fas', 'building-columns']" class="me-2" />
      Community
    </b-dropdown-item>

    <!-- About -->
    <b-dropdown-item
      v-if="item === 'btn_about'"
      v-b-modal.about
      @click="handleItemClick"
    >
      <font-awesome-icon :icon="['fas', 'address-card']" class="me-2" /> About
      Creator
    </b-dropdown-item>

    <!-- Flash -->
    <b-dropdown-item
      v-if="item === 'btn_flash'"
      v-b-modal.flash
      @click="handleItemClick"
    >
      <font-awesome-icon :icon="['fab', 'usb']" class="me-2" /> Flash
    </b-dropdown-item>

    <!-- Calculator -->
    <b-dropdown-item
      v-if="item === 'btn_calculator'"
      v-b-modal.calculator
      @click="handleItemClick"
    >
      <font-awesome-icon :icon="['fas', 'calculator']" class="me-2" /> IEEE754
      Calculator
    </b-dropdown-item>

    <!-- Vim Mode Toggle -->
    <b-dropdown-item
      v-if="item === 'btn_vim_toggle'"
      @click="root.vim_mode = !root.vim_mode"
    >
      <font-awesome-icon :icon="['fab', 'vimeo-v']" class="me-2" /> Vim Mode
      {{ root.vim_mode ? "(On)" : "(Off)" }}
    </b-dropdown-item>
  </template>
</template>
