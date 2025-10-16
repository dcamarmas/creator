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
import { defineComponent, type PropType } from "vue"

export default defineComponent({
  props: {
    id: { type: String, required: true },
    notifications: {
      type: Array as PropType<CREATORNotification[]>,
      required: true,
    },
  },
})
</script>

<template>
  <b-modal :id="id" title="Notifications" scrollable no-footer>
    <span class="h6" v-if="notifications.length === 0">
      There are no notifications at the moment
    </span>

    <b-alert
      :model-value="true"
      :variant="notif.color"
      v-for="notif in notifications.toReversed()"
    >
      <span class="h6">
        <font-awesome-icon
          icon="fa-solid fa-info-circle"
          v-if="notif.color === 'info'"
        />
        <font-awesome-icon
          icon="fa-solid fa-circle-exclamation"
          v-if="notif.color === 'danger'"
        />
        <font-awesome-icon
          icon="fa-solid fa-exclamation-triangle"
          v-if="notif.color === 'warning'"
        />
        <font-awesome-icon
          icon="fa-solid fa-circle-check"
          v-if="notif.color === 'success'"
        />

        {{ notif.date }} - {{ notif.time }}

        <br />

        {{ notif.mess }}
      </span>
    </b-alert>
  </b-modal>
</template>
