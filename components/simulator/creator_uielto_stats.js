/*
 *  Copyright 2018-2021 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

				var uielto_stats = {

				props:      {
											data_mode:   { type: String, required: true },
											stats: 			 { type: Array,  required: true },
											stats_value: { type: Number, required: true },
										},

				data: 			function () {
					return {
						stat_representation: 'graphic',
						stat_representation_options:  [
																						{ text: 'Graphic', value: 'graphic' },
																						{ text: 'Table', value: 'table' }
																					]
					}
				},

				template:   ' <div class="col-lg-12 col-sm-12" id="stats" v-if="data_mode == \'stats\'"> ' +
										'   <div class="col-lg-12 col-sm-12 px-0"> ' +
										'     <b-form-group label="Stats view:" v-slot="{ ariaDescribedby }">' +
										'       <b-form-radio-group' +
										'         id="btn-radios-1"' +
										'         class="w-50"' +
										'         v-model="stat_representation"' +
										'         :options="stat_representation_options"' +
										'         button-variant="outline-secondary"' +
										'         size="sm"' +
										'         :aria-describedby="ariaDescribedby"' +
										'         name="radios-btn-default"' +
										'         buttons' +
										'       ></b-form-radio-group>' +
										'     </b-form-group>' +
										' ' +
										'     <plot-stats :stats_value="stats_value" v-if="stat_representation == \'graphic\'"></plot-stats>  ' +
										'     <table-stats :stats="stats" v-if="stat_representation == \'table\'"></table-stats> ' +
										' ' +
										'   </div> ' +
										' </div>'
			
				}

				Vue.component('stats', uielto_stats) ;

