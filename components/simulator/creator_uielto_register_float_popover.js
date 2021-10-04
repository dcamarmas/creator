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

				var uielto_register_float_popover = {

				props:      {
											target:           { type: String, required: true },
											component:        { type: Object, required: true },
											register:  	      { type: Object, required: true }
										},

				data: 			function () {
											return {
												/*Register form*/
      									newValue: ''
											}
										},

				methods: 		{
											closePopover(){
												this.$root.$emit('bv::hide::popover')
											},

											/*Update a new register value*/
											updateReg(comp, elem, type, precision){
												for (var i = 0; i < architecture.components[comp].elements.length; i++) {
													if(type == "integer" || type == "control"){
														if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^0x/)){
															var value = this.newValue.split("x");
															if(value[1].length * 4 > architecture.components[comp].elements[i].nbits){
																value[1] = value[1].substring(((value[1].length * 4) - architecture.components[comp].elements[i].nbits)/4, value[1].length)
															}
															architecture.components[comp].elements[i].value = bi_intToBigInt(value[1], 16);
														}
														else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^(\d)+/)){
															architecture.components[comp].elements[i].value = bi_intToBigInt(this.newValue,10);
														}
														else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^-/)){
															architecture.components[comp].elements[i].value = bi_intToBigInt(this.newValue,10);
														}
													}
													else if(type =="floating point"){
														if(precision == false){
															if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^0x/)){
																architecture.components[comp].elements[i].value = hex2float(this.newValue);
																updateDouble(comp, i);
															}
															else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^(\d)+/)){
																architecture.components[comp].elements[i].value = parseFloat(this.newValue, 10);
																updateDouble(comp, i);
															}
															else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^-/)){
																architecture.components[comp].elements[i].value = parseFloat(this.newValue, 10);
																updateDouble(comp, i);
															}
														}

														else if(precision == true){
															if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^0x/)){
																architecture.components[comp].elements[i].value = hex2double(this.newValue);
																updateSimple(comp, i);
															}
															else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^(\d)+/)){
																architecture.components[comp].elements[i].value = parseFloat(this.newValue, 10);
																updateSimple(comp, i);
															}
															else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^-/)){
																architecture.components[comp].elements[i].value = parseFloat(this.newValue, 10);
																updateSimple(comp, i)
															}
														}
													}
												}
												this.newValue = '';

												/* Google Analytics */
												creator_ga('data', 'data.change', 'data.change.register_value');
												creator_ga('data', 'data.change', 'data.change.register_value_' + elem);
											},

											/*Stop user interface refresh*/
								      debounce: _.debounce(function (param, e) {
								        console_log(param);
								        console_log(e);

								        e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
								        var re = new RegExp("'","g");
								        e = e.replace(re, '"');
								        re = new RegExp("[\f]","g");
								        e = e.replace(re, '\\f');
								        re = new RegExp("[\n\]","g");
								        e = e.replace(re, '\\n');
								        re = new RegExp("[\r]","g");
								        e = e.replace(re, '\\r');
								        re = new RegExp("[\t]","g");
								        e = e.replace(re, '\\t');
								        re = new RegExp("[\v]","g");
								        e = e.replace(re, '\\v');

								        if(e == ""){
								          this[param] = null;
								          return;
								        }

								        console_log("this." + param + "= '" + e + "'");

								        eval("this." + param + "= '" + e + "'");

								        app.$forceUpdate();
								      }, getDebounceTime())

										},

				template:   	'<b-popover :target="target" ' +
											'           triggers="click blur">' +
											'  <template v-slot:title>' +
											'    <b-button @click="closePopover" class="close" aria-label="Close">' +
											'      <span class="d-inline-block" aria-hidden="true">&times;</span>' +
											'    </b-button>' +
											'    {{register.name.join(\' | \')}}' +
											'  </template>' +
											'' +
											'  <table class="table table-bordered table-sm popoverText">' +
											'    <tbody>' +
											'      <tr>' +
											'        <td>Hex.</td>' +
											'        <td>' +
											'          <b-badge class="registerPopover">' +
											'            {{"0x"+ bin2hex(float2bin(register.value))}}' +
											'          </b-badge>' +
											'        </td>' +
											'      </tr>' +
											'      <tr>' +
											'        <td>Binary</td>' +
											'        <td>' +
											'          <b-badge class="registerPopover">' +
											'            {{float2bin(register.value)}}' +
											'        </b-badge>' +
											'      </td>' +
											'      </tr>' +
											'      <tr>' +
											'        <td>Signed</td>' +
											'        <td>' +
											'          <b-badge class="registerPopover">' +
											//'            {{parseInt(register.value.toString(), 10) >> 0}}' +
											'              {{float2int_v2(register.value) >> 0}}' + 
											'          </b-badge>' +
											'        </td>' +
											'      </tr>' +
											'      <tr>' +
											'        <td>Unsig.</td>' +
											'        <td>' +
											'          <b-badge class="registerPopover">' +
											//'            {{parseInt(register.value.toString(), 10) >>> 0}}' +
											'              {{float2int_v2(register.value)  >>> 0}}' + 
											'          </b-badge>' +
											'        </td>' +
											'      </tr>' +
											'      <tr>' +
											'        <td>IEEE 754</td>' +
											'        <td>' +
											'          <b-badge class="registerPopover">' +
											'            {{register.value}}' +
											'          </b-badge>' +
											'        </td>' +
											'      </tr>' +
											'    </tbody>' +
											'  </table>' +
											'' +
											'  <div class="col-lg-12 col-sm-12 row mx-0">' +
											'    <div class="col-lg-6 col-sm-6 popoverFooter">' +
											'      <b-form-input v-on:input="debounce(\'newValue\', $event)" ' +
											'                    :value="newValue" ' +
											'                    type="text" ' +
											'                    size="sm" ' +
											'                    title="New Register Value" ' +
											'                    placeholder="Enter new value">' +
											'      </b-form-input>' +
											'    </div>' +
											'    <div class="col-lg-6 col-sm-6 popoverFooter">' +
											'      <b-button class="btn btn-primary btn-block btn-sm" ' +
											'                @click="updateReg(component.index, register.name, architecture.components[component.index].type, architecture.components[component.index].double_precision)">' +
											'        Update' +
											'      </b-button>' +
											'    </div>' +
											'  </div>' +
											'</b-popover>'
			
				}

				Vue.component('popover-register-float', uielto_register_float_popover)
