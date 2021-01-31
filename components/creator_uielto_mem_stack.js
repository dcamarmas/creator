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

        var uielto_mem_stack = {

	      data:   	  function () {
			     return {
				selected_stack_view: null,
                                mem_fields:          ['Tag', 'Address', 'Binary', 'Value']
			     }
		          },

              methods:    {
			      select_stack_type(record, index){
				app._data.row_index = index;
				this.$refs['stack_modal'].show();
			      },

			      hide_stack_modal(){
				this.selected_stack_view = null;
			      },

			      change_stack_view(){
				if(this.selected_stack_view == "sig_int"){
				  var hex = "";
				  for (var j = 0; j < 4; j++) {
				    hex = memory[memory_hash[2]][app._data.row_index].Binary[j].Bin + hex;
				  }
				  memory[memory_hash[2]][app._data.row_index].Value = parseInt(hex, 16) >> 0;
				}
				else if(this.selected_stack_view == "unsig_int"){
				  var hex = "";
				  for (var j = 0; j < 4; j++) {
				    hex = memory[memory_hash[2]][app._data.row_index].Binary[j].Bin + hex;
				  }
				  memory[memory_hash[2]][app._data.row_index].Value = parseInt(hex, 16) >>> 0;
				}
				else if(this.selected_stack_view == "float"){
				  var hex = "";
				  for (var j = 0; j < 4; j++) {
				    hex = memory[memory_hash[2]][app._data.row_index].Binary[j].Bin + hex;
				  }
				  memory[memory_hash[2]][app._data.row_index].Value = this.hex2float("0x" + hex);
				}
				else if(this.selected_stack_view == "char"){
				  var hex = "";
				  for (var j = 0; j < 4; j++) {
				    hex = memory[memory_hash[2]][app._data.row_index].Binary[j].Bin + hex;
				  }
				  memory[memory_hash[2]][app._data.row_index].Value = this.hex2char8(hex);
				}
			      }
                          },

              template:   '  <div class="col-lg-12 col-sm-12">' +
                          '    <b-table sticky-header ' +
                          '	     striped ' +
                          '	     small ' +
                          '	     hover ' +
                          '	     :items="unallocated_memory.concat(Object.values(memory)[2])" ' +
                          '	     :fields="mem_fields" ' +
                          '	     class="memory_table" ' +
                          '	     @row-clicked="select_stack_type">' +
                          '' +
                          '      <template v-slot:head(Tag)="row">' +
                          '	&nbsp;' +
                          '      </template>' +
                          '' +
                          '      <template v-slot:cell(Tag)="row">' +
                          '	<div v-for="item in architecture_hash">' +
                          '	  <div v-for="item2 in architecture.components[item.index].elements">' +
                          '	    <b-badge variant="info" ' +
                          '		     class="border border-info shadow memoryTag" ' +
                          '		     v-if="item2.properties.includes(\'pointer\') && item2.properties.includes(\'stack\') && ((parseInt(item2.value) & 0xFFFFFFFC) == (row.item.Address & 0xFFFFFFFC))">' +
                          '	      {{item2.name[0]}}' +
                          '	    </b-badge>' +
                          '	    <span class="fas fa-long-arrow-alt-right" ' +
                          '		  v-if="item2.properties.includes(\'pointer\') && item2.properties.includes(\'stack\') && ((parseInt(item2.value) & 0xFFFFFFFC) == (row.item.Address & 0xFFFFFFFC))">' +
                          '	    </span>' +
                          '' +
                          '	  </div>' +
                          '	</div>' +
                          '      </template>' +
                          '' +
                          '      <template v-slot:cell(Address)="row">' +
                          '	<span class="h6Sm text-secondary" v-if="row.item.unallocated==true">' +
                          '	  0x{{((row.item.Address + 3).toString(16)).padStart(row.item.Address.length-2, "0").toUpperCase()}} - 0x{{(row.item.Address.toString(16)).padStart(row.item.Address.length-2, "0").toUpperCase()}}' +
                          '	</span>' +
                          '	<span class="h6Sm" v-if="row.item.unallocated==false">' +
                          '	  0x{{((row.item.Address + 3).toString(16)).padStart(row.item.Address.length-2, "0").toUpperCase()}} - 0x{{(row.item.Address.toString(16)).padStart(row.item.Address.length-2, "0").toUpperCase()}}' +
                          '	</span>' +
                          '      </template>' +
                          '' +
                          '      <template v-slot:cell(Binary)="row">' +
                          '	<span class="h6Sm text-secondary" v-if="row.item.unallocated==true">' +
                          '	  <span class="memoryBorder" v-if="row.item.Binary[3].Tag != null">' +
                          '	    {{row.item.Binary[3].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <span v-if="row.item.Binary[3].Tag == null">' +
                          '	    {{row.item.Binary[3].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <b-badge pill variant="info" ' +
                          '		   class="border border-info shadow binaryTag" ' +
                          '		   v-if="row.item.Binary[3].Tag != null">' +
                          '	    {{row.item.Binary[3].Tag}}' +
                          '	  </b-badge>' +
                          '' +
                          '	  <span class="memoryBorder" v-if="row.item.Binary[2].Tag != null">' +
                          '	    {{row.item.Binary[2].Bin.toUpperCase()}' +
                          '	  </span> ' +
                          '	  <span v-if="row.item.Binary[2].Tag == null">' +
                          '	    {{row.item.Binary[2].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <b-badge pill variant="info" ' +
                          '		   class="border border-info shadow binaryTag" ' +
                          '		   v-if="row.item.Binary[1].Tag != null">' +
                          '	    {{row.item.Binary[2].Tag}}' +
                          '	  </b-badge>' +
                          '' +
                          '	  <span class="memoryBorder" v-if="row.item.Binary[1].Tag != null">' +
                          '	    {{row.item.Binary[1].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <span v-if="row.item.Binary[1].Tag == null">' +
                          '	    {{row.item.Binary[1].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <b-badge pill variant="info" ' +
                          '		   class="border border-info shadow binaryTag" ' +
                          '		   v-if="row.item.Binary[1].Tag != null">' +
                          '	    {{row.item.Binary[1].Tag}}' +
                          '	  </b-badge>' +
                          '' +
                          '	  <span class="memoryBorder" v-if="row.item.Binary[0].Tag != null">' +
                          '	    {{row.item.Binary[0].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <span v-if="row.item.Binary[0].Tag == null">' +
                          '	    {{row.item.Binary[0].Bin.toUpperCase()}}' +
                          '	  </span>' +
                          '	  <b-badge pill variant="info" ' +
                          '		   class="border border-info shadow binaryTag" ' +
                          '		   v-if="row.item.Binary[0].Tag != null">' +
                          '	    {{row.item.Binary[0].Tag}}' +
                          '	  </b-badge>' +
                          '	</span>' +
                          '' +
                          '	<span class="h6Sm" v-if="row.item.unallocated==false">' +
                          '	  <span class="memoryBorder" v-if="row.item.Binary[3].Tag != null">' +
                          '	    {{row.item.Binary[3].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <span v-if="row.item.Binary[3].Tag == null">' +
                          '	    {{row.item.Binary[3].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <b-badge pill variant="info" ' +
                          '		   class="border border-info shadow binaryTag" ' +
                          '		   v-if="row.item.Binary[3].Tag != null">' +
                          '	    {{row.item.Binary[3].Tag}}' +
                          '	  </b-badge>' +
                          '' +
                          '	  <span class="memoryBorder" v-if="row.item.Binary[2].Tag != null">' +
                          '	    {{row.item.Binary[2].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <span v-if="row.item.Binary[2].Tag == null">' +
                          '	    {{row.item.Binary[2].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <b-badge pill variant="info" ' +
                          '		   class="border border-info shadow binaryTag" ' +
                          '		   v-if="row.item.Binary[2].Tag != null">' +
                          '	    {{row.item.Binary[2].Tag}}' +
                          '	  </b-badge>' +
                          '' +
                          '	  <span class="memoryBorder" v-if="row.item.Binary[1].Tag != null">' +
                          '	    {{row.item.Binary[1].Bin.toUpperCase()}}' +
                          '	  </span>' +
                          '	  <span v-if="row.item.Binary[1].Tag == null">' +
                          '	    {{row.item.Binary[1].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <b-badge pill variant="info" ' +
                          '		   class="border border-info shadow binaryTag" ' +
                          '		   v-if="row.item.Binary[1].Tag != null">' +
                          '	    {{row.item.Binary[1].Tag}}' +
                          '	  </b-badge>' +
                          '' +
                          '	  <span class="memoryBorder" v-if="row.item.Binary[0].Tag != null">' +
                          '	    {{row.item.Binary[0].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <span v-if="row.item.Binary[0].Tag == null">' +
                          '	    {{row.item.Binary[0].Bin.toUpperCase()}}' +
                          '	  </span> ' +
                          '	  <b-badge pill variant="info" ' +
                          '		   class="border border-info shadow binaryTag" ' +
                          '		   v-if="row.item.Binary[0].Tag != null">' +
                          '	    {{row.item.Binary[0].Tag}}' +
                          '	  </b-badge>' +
                          '	</span>' +
                          '      </template>' +
                          '      <template v-slot:cell(Value)="row">' +
                          '	<span class="h6Sm text-secondary" v-if="row.item.unallocated==true">{{row.item.Value}}</span>' +
                          '	<span class="h6Sm" v-if="row.item.unallocated==false">{{row.item.Value}}</span>' +
                          '      </template>' +
                          '    </b-table>' +
                          '' +
                          '    <b-modal ref="stack_modal" ' +
                          '	     size="sm" ' +
                          '	     title="Select stack word view:" ' +
                          '	     @hidden="hide_stack_modal" ' +
                          '	     @ok="change_stack_view">' +
                          '      <b-form-radio v-model="selected_stack_view" value="sig_int">Signed Integer</b-form-radio>' +
                          '      <b-form-radio v-model="selected_stack_view" value="unsig_int">Unsigned Integer</b-form-radio>' +
                          '      <b-form-radio v-model="selected_stack_view" value="float">Float</b-form-radio>' +
                          '      <b-form-radio v-model="selected_stack_view" value="char">Char</b-form-radio>' +
                          '							  </b-modal>' +
                          '' +
                          '  </div>'
       	}

        Vue.component('card-mem-stack', uielto_mem_stack)

