
/*
 *  Copyright 2018-2024 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


  /* jshint esversion: 6 */

  var uielto_notifications = {

    props:  {
              id:            { type: String, required: true },
              notifications: { type: Array,  required: true }
            },


    template:   ' <b-modal :id ="id" ' +
                '          title="Notifications" ' +
                '          scrollable' +
                '          hide-footer>' +
                ' ' +
                '   <span class="h6" v-if="notifications.length == 0">' +
                '     There\'s no notification at the moment' +
                '   </span>' +
                ' ' +
                '   <b-alert show :variant="item.color"' +
                '            v-for="item in notifications">' +
                '     <span class="h6">' +
                '       <span class="fas fa-info-circle" v-if="item.color!=\'danger\'"></span>' +
                '       <span class="fas fa-exclamation-triangle" v-if="item.color==\'danger\'"></span> ' +
                '         {{item.mess}}' +
                '     </span>' +
                '     <span class="h6">{{item.time}}   -   {{item.date}}</span>' +
                '   </b-alert>' +
                ' ' +
                ' </b-modal>'
  }

  Vue.component('uielto-notifications', uielto_notifications) ;