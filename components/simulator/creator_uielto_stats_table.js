
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

  var uielto_stats_table = {

  props:      {
                stats:       { type: Array,  required: true }
              },
              
  data:       function () {
                return {
                  /*Stats table fields*/
                  statsFields: {
                    type: {
                      label: 'Type',
                      sortable: true
                    },
                    number_instructions: {
                      label: 'Number of instructions',
                      sortable: true
                    },
                    percentage: {
                      label: 'Percentage',
                      sortable: true
                    }
                  }
                }
              },

  template:   ' <b-table striped ' +
              '  small ' +
              '  hover ' +
              '  :items="stats" ' +
              '  :fields="statsFields" ' +
              '  class="stats text-center px-0">' +
              ' <b-table>'

  }

  Vue.component('table-stats', uielto_stats_table) ;