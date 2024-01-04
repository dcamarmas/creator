
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

  var uielto_info = {

    props:      {
                  target:                 { type: String, required: true },
                  show_instruction_help:  { type: Boolean, required: true }
                },

    methods:    {
                  closePopover(){
                    this.$root.$emit('bv::hide::popover')
                  }
                },

    template:   ' <b-popover :target="target" triggers="click blur">' +
                '   <template v-slot:title>' +
                '     <b-button @click="closePopover" class="close" aria-label="Close">' +
                '       <span class="d-inline-block" aria-hidden="true">&times;</span>' +
                '     </b-button>' +
                '     <br>' +
                '   </template>' +
                ' ' +
                '   <b-button class="btn btn-outline-secondary btn-sm btn-block infoButton" ' +
                '             href=\'https://creatorsim.github.io/\' ' +
                '             target="_blank" ' +
                '             onclick="creator_ga(\'send\', \'event\', \'help\', \'help.general_help\', \'help.general_help\');">' +
                '     <span class="fas fa-question-circle" ></span> ' +
                '     Help' +
                '   </b-button>' +
                ' ' +
                '   <b-button class="btn btn-outline-secondary btn-block btn-sm h-100 infoButton" v-if="show_instruction_help==\'true\'"' +
                '             id="inst_ass" v-b-toggle.sidebar_help' +
                '             onclick="creator_ga(\'send\', \'event\', \'help\', \'help.instruction_help\', \'help.instruction_help\');">' +
                '     <span class="fas fa-book"></span>' +
                '     Instruction Help' +
                '   </b-button>' +
                ' ' +
                '   <b-button class="btn btn-outline-secondary btn-sm btn-block buttonBackground h-100" ' +
                '             v-b-modal.notifications>' +
                '     <span class="fas fa-bell"></span> ' +
                '     Show Notifications' +
                '   </b-button>' +
                ' </b-popover>'
  }

  Vue.component('popover-info', uielto_info) ;