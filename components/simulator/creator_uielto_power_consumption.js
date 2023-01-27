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

  var uielto_power_consumption = {

  props:      {
                power_consumption:       { type: Array,  required: true },
                power_consumption_value: { type: Number, required: true },
                total_power_consumption: { type: Number, required: true },
              },

  data:       function () {
    return {
      power_consumption_representation: 'graphic',
      power_consumption_representation_options: [
                                                  { text: 'Graphic', value: 'graphic' },
                                                  { text: 'Table',   value: 'table' }
                                                ]
    }
  },

  template:   ' <b-container fluid align-h="center" class="mx-0 my-3 px-2">' +
              '   <b-row cols-xl="2" cols-lg="1" cols-md="2" cols-sm="1" cols-xs="1" cols="1">' +
              '     <b-col align-h="center" class="px-2">' +
              '       <div class="border m-1 py-1 px-2">' +
              '         <b-badge variant="light" class="h6 groupLabelling border mx-2 my-0">CLK Cycles view</b-badge>' +
              '         <b-form-group class="mb-2" v-slot="{ ariaDescribedby }">' +
              '           <b-form-radio-group' +
              '             id="btn-radios-1"' +
              '             class="w-100"' +
              '             v-model="power_consumption_representation"' +
              '             :options="power_consumption_representation_options"' +
              '             button-variant="outline-secondary"' +
              '             size="sm"' +
              '             :aria-describedby="ariaDescribedby"' +
              '             name="radios-btn-default"' +
              '             buttons' +
              '           ></b-form-radio-group>' +
              '         </b-form-group>' +
              '       </div >' +
              '     </b-col>' +
              '' +
              '     <b-col>' +
              '       <b-list-group class="align-items-center py-2 px-4">' +
              '         <b-list-group-item>Total CLK Cycles: {{total_power_consumption}}</b-list-group-item>' +
              '       </b-list-group>' +
              '     </b-col>' +
              '' +
              '   </b-row>' +
              '' +
              '   <b-row cols="1">' +
              '     <b-col align-h="center" class="px-2 my-2">' +
              '       <plot-power-consumption  :power_consumption_value="power_consumption_value" v-if="power_consumption_representation == \'graphic\'"></plot-power-consumption>  ' +
              '       <table-power-consumption :power_consumption="power_consumption" v-if="power_consumption_representation == \'table\'"></table-power-consumption> ' +
              '     </b-col>' +
              '   </b-row>' +
              ' </b-container>'

  }

  Vue.component('power-consumption', uielto_power_consumption) ;
