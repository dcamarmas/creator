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

				var uielto_register_int = {

				props:      {
											register:					{ type: Object, required: true },
											component:  			{ type: Object, required: true },
											representation:  	{ type: String, required: true }
										},

				methods: 		{
										/*Popover functions*/
							      popoverId(i){
							          return 'popoverValueContent' + i;
							      }
				},

				template:   ' <b-button class="btn btn-outline-secondary btn-block btn-sm registers h-100" ' +
										'           :id="popoverId(register.name + \'Int\')" ' +
										'           onclick="creator_ga(\'data\', \'data.view\', \'data.view.registers_details\');">' +
										'   <span class="text-truncate">{{register.name[0]}}</span> ' +
										'   <b-badge class="regValue registerValue" ' +
										'            v-if="(((register.value).toString(2)).padStart(register.nbits, \'0\')).charAt(0) == 1 && representation==\'dec\'">' +
										'     {{parseInt(register.value.toString(10))-0x100000000}}' +
										'   </b-badge>' +
										' ' +
										'    <b-badge class="regValue registerValue" ' +
										'             v-if="(((register.value).toString(2)).padStart(register.nbits, \'0\')).charAt(0) == 0 && representation==\'dec\'">' +
										'     {{(register.value).toString(10)}}' +
										'   </b-badge>' +
										' ' +
										' 	<b-badge  class="regValue registerValue"' +
										'           v-if="representation==\'hex\'">' +
										'   	{{(((register.value).toString(16)).padStart(register.nbits/4, "0")).toUpperCase()}}' +
										' 	</b-badge>' +
										' </b-button>' +
										' ' +
										' <popover-register-int :target="popoverId(register.name + \'Int\')" ' +
										'                       :component="component"' +
										'                       :register="register">' +
										' </popover-register-int>'
			
				}

				Vue.component('register-int', uielto_register_int) ;

