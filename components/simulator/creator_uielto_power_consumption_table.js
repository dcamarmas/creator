/*
 *  Copyright 2018-2023 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

  var uielto_power_consumption_table = {

  props:      {
                render:                  { type: Number, required: true },
                power_consumption:       { type: Array,  required: true }
              },
              
  data:       function () {
                return {
                  /*power_consumption table fields*/
                  power_consumption_fields: {
                    type: {
                      label: 'Type',
                      sortable: true
                    },
                    power_consumption: {
                      label: 'CLK Cycles',
                      sortable: true
                    },
                    percentage: {
                      label: 'Percentage',
                      sortable: true
                    }
                  }
                }
              },

  template:   ' <b-table  striped ' +
              '           small ' +
              '           hover ' +
              '           :items="power_consumption" ' +
              '           :fields="power_consumption_fields" ' +
              '           class="stats text-center px-0">' +
              ' <b-table>'

  }

  Vue.component('table-power-consumption', uielto_power_consumption_table) ;