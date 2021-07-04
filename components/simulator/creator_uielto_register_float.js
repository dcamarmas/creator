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

				var uielto_register_float = {

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

				template: ' <b-button class="btn btn-outline-secondary btn-block btn-sm registers h-100" ' +
									'           :id="popoverId(register.name + \'FP\')" ' +
									'           onclick="creator_ga(\'data\', \'data.view\', \'data.view.registers_details\');">' +
									'   <span class="text-truncate">{{register.name[0]}}</span>  ' +
									'   <b-badge class="registerValue"' +
									'			v-if="representation==\'dec\'">' +
									'     {{register.value}}' +
									'   </b-badge>' +
									' ' +
									' 	<b-badge class="registerValue"' +
									'			v-if="representation==\'hex\'">' +
									'   	{{bin2hex(float2bin(register.value))}}' +
									' 	</b-badge>' +
									' </b-button>-->' +
									' ' +
									' <popover-register-float :target="popoverId(register.name + \'FP\')" ' +
									'                         :component="component"' +
									'                         :register="register">' +
									' </popover-register-float>'
			
				}

				Vue.component('register-float', uielto_register_float) ;

