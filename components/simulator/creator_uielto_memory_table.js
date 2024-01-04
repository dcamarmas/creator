
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

  var uielto_memory = {

  props:    {
              main_memory:        { type: Array,   required: true },
              memory_segment:     { type: String,  required: true },
              track_stack_names:  { type: Array,   required: true }, // TODO: optional
              callee_subrutine:   { type: String,  required: true }, // TODO: optional
              caller_subrutine:   { type: String,  required: true }, // TODO: optional
              stack_total_list:   { type: Number,  required: true },
              main_memory_busy:   { type: Boolean, required: true }
            },

  data:     function () {
              return {
                /*Memory table fields*/
                memFields: ['Tag', 'Address', 'Binary', 'Value'],
                row_info: null,        
                selected_space_view: null,
                selected_stack_view: null,
              }
            },

  methods:  {
              /*Filter table*/
              filter ( row, filter )
              {
                var addr = parseInt(row.addr_begin);

                if ((this.memory_segment == "instructions_memory") && ((addr >= parseInt(architecture.memory_layout[0].value)) && (addr <= parseInt(architecture.memory_layout[1].value)))) {
                  if(row.hide === true){
                    return false;
                  }
                  else{
                    return true;
                  }
                }

                if ((this.memory_segment == "data_memory") && ((addr >= parseInt(architecture.memory_layout[2].value)) && (addr <= parseInt(architecture.memory_layout[3].value)))) {
                  return true;
                }

                if ((this.memory_segment == "stack_memory") && ((addr >= parseInt(architecture.memory_layout[3].value)))) {
                  return (Math.abs(addr - app._data.end_callee) < (this._props.stack_total_list * 4));
                }
              },

              // TODO: gereric and include modal
              select_data_type ( record, index )
              {
                this.row_info = { "index": index, 
                                  "addr":  record.addr - 3,
                                  "size":  record.size } ;

                if (this.memory_segment == "instructions_memory") {
                  return
                }

                if (this.memory_segment == "data_memory")
                {
                  if (this.check_tag_null(record.hex)) {
                      //app.$refs['space_modal'].show(); // TODO: vue bidirectional updates
                      this.$root.$emit('bv::show::modal', 'space_modal');
                  }
                }

                if (this.memory_segment == "stack_memory") {
                  //app.$refs['stack_modal'].show(); // TODO: vue bidirectional updates
                  this.$root.$emit('bv::show::modal', 'stack_modal');
                }
              },

              change_space_view()
              {
                 creator_memory_update_space_view(this.selected_space_view, memory_hash[0], this.row_info) ;
              },

              hide_space_modal()
              {
                  this.selected_space_view = null;
              },

              change_stack_view()
              {
                  creator_memory_update_row_view(this.selected_stack_view, memory_hash[2], this.row_info) ;
              },

              hide_stack_modal()
              {
                  this.selected_stack_view = null;
              },

              check_tag_null ( record )
              {
                for (var i = 0; i < record.length; i++) {
                  if (record[i].tag != null){
                    return true;
                  }
                }

                return false;
              },        

              get_classes ( row )
              {
                return {
                         'h6Sm                ':  ((row.item.addr >= parseInt(architecture.memory_layout[0].value)) && (row.item.addr <= (architecture.memory_layout[3].value))),
                         'h6Sm text-secondary ':  ((row.item.addr < app._data.end_callee)                           && (Math.abs(row.item.addr - app._data.end_callee) < (this._props.stack_total_list * 4))),
                         'h6Sm text-success   ':  ((row.item.addr < app._data.begin_callee)                         && (row.item.addr >= app._data.end_callee)),
                         'h6Sm text-blue-funny':  ((row.item.addr < app._data.begin_caller)                         && (row.item.addr >= app._data.end_caller)),
                         'h6Sm                ':  (row.item.addr >= app._data.begin_caller)
                        }
              }
            },
  computed: {
              main_memory_items ()
              {
                  return Object.entries(this.main_memory)
                   .sort((a, b) => a[0] - b[0])
                   .map(a => a[1])
              }
            },

  template: ' <div>' +
            ' ' +
            '   <b-container fluid align-h="between" class="mx-0 px-0">' +
            '     <b-row align-v="start" cols="1">' +
            '       <b-col class="mx-0 pl-0 pr-2" style="min-height:35vh !important;">' +
            ' ' +
            '         <b-table sticky-header ' +
            '                 striped ref="table"' +
            '                 small ' +
            '                 hover ' +
            '                 :busy="main_memory_busy"' +
            '                 :items="main_memory_items" ' +
            '                 :fields="memFields" ' +
            '                 :filter-function=filter ' +
            '                 filter=" " ' +
            '                 class="memory_table align-items-start" ' +
            '                 @row-clicked="select_data_type">' +
            ' ' +
            '           <template #table-busy>' +
            '             <div class="text-center text-primary my-2">' +
            '               <b-spinner class="align-middle"></b-spinner>' +
            '               <strong> Running...</strong>' +
            '             </div>' +
            '           </template>' +
            ' ' +
            '           <template v-slot:head(Tag)="row">' +
            '             &nbsp;' +
            '           </template>' +
            ' ' +
            '           <template v-slot:cell(Tag)="row">' +
            '             <div v-for="item in architecture_hash">' +
            '               <div v-for="item2 in architecture.components[item.index].elements">' +
            '               <b-badge variant="info" ' +
            '                        class="border border-info shadow memoryTag" ' +
            '                        v-if="item2.properties.includes(\'global_pointer\') && ((parseInt(item2.value) & 0xFFFFFFFC) == (row.item.addr & 0xFFFFFFFC))">' +
            '                 {{item2.name[0]}}' +
            '               </b-badge>' +
            '               <span class="fas fa-long-arrow-alt-right" ' +
            '                     v-if="item2.properties.includes(\'global_pointer\') && ((parseInt(item2.value) & 0xFFFFFFFC) == (row.item.addr & 0xFFFFFFFC))">' +
            '               </span>' +
            '               <b-badge variant="success" ' +
            '                        class="border border-success shadow memoryTag" ' +
            '                        v-if="item2.properties.includes(\'program_counter\') && ((parseInt(item2.value) & 0xFFFFFFFC) == (row.item.addr & 0xFFFFFFFC))">' +
            '                 {{item2.name[0]}}' +
            '               </b-badge>' +
            '               <span class="fas fa-long-arrow-alt-right" ' +
            '                     v-if="item2.properties.includes(\'program_counter\') && ((parseInt(item2.value) & 0xFFFFFFFC) == (row.item.addr & 0xFFFFFFFC))">' +
            '               </span>' +
            '               <b-badge variant="info" ' +
            '                        class="border border-info shadow memoryTag" ' +
            '                     v-if="(item2.properties.includes(\'stack_pointer\') || item2.properties.includes(\'frame_pointer\')) && ((parseInt(item2.value) & 0xFFFFFFFC) == (row.item.addr & 0xFFFFFFFC))">' +
            '                 {{item2.name[0]}}' +
            '               </b-badge>' +
            '               <span class="fas fa-long-arrow-alt-right" ' +
            '                 v-if="(item2.properties.includes(\'stack_pointer\') || item2.properties.includes(\'frame_pointer\') ) && ((parseInt(item2.value) & 0xFFFFFFFC) == (row.item.addr & 0xFFFFFFFC))">' +
            '               </span>  ' +
            '             </div>' +
            '           </div>' +
            '         </template>' +
            '      ' +
            '         <template v-slot:cell(Address)="row">' +
            '           <div class="pt-3">' +
            '             <span v-bind:class="get_classes(row)">' +
            '               {{row.item.addr_begin}} - {{row.item.addr_end}}' +
            '             </span>' +
            '           </div>' +
            '         </template>' +
            '      ' +
            '         <template v-slot:cell(Binary)="row">' +
            '           <div class="pt-3">' +
            '             <span v-bind:class="get_classes(row)">' +
            '               <span v-for="item in row.item.hex">' +
            ' ' +
            '                 <span v-if="item.tag == null">' +
            '                   {{item.byte.toUpperCase()}}' +
            '                 </span> ' +
            ' ' +
            '                 <b-badge pill variant="info" ' +
            '                          class="border border-info shadow binaryTag" ' +
            '                          style="top: -2vh !important;" ' +
            '                          v-if="item.tag != null">' +
            '                   {{item.tag}}' +
            '                 </b-badge>' +
            '                 <span v-if="item.tag != null" class="memoryBorder">' +
            '                   {{item.byte.toUpperCase()}}' +
            '                 </span> ' +
            ' ' +
            '               </span>' +
            '             </span>' +
            '           </div>' +
            '         </template>' +
            '      ' +
            '         <template v-slot:cell(Value)="row">' +
            '           <div class="pt-3">' +
            '             <span v-bind:class="get_classes(row)" style="white-space: pre-wrap;">' +
            '               {{row.item.value}}' +
            '               <span class="fas fa-eye memoryValue" ' +
            '                     v-if="row.item.eye && check_tag_null(row.item.hex)">' +
            '               </span>' +
            '             </span>' +
            '           </div>' +
            '         </template>' +
            '       </b-table>' +
            ' ' +
            '       </b-col>' +
            '     </b-row>' +
            ' ' +
            '     <b-row align-v="end">' +
            '       <b-col>' +
            ' ' +
            '         <div class="col-lg-12 col-sm-12 row mx-0 px-2 border" v-if="memory_segment == \'stack_memory\'">' + // TODO: only in stack' +
            '           <span class="col-lg-12 col-sm-12 my-1">' +
            '             <span>Stack memory areas: </span> <span class="fas fa-search-plus" id="stack_funct_popover"></span>' +
            '           </span>' +
            ' ' +
            '           <span class="badge badge-white border border-secondary text-secondary mx-1 col">Free <br>stack</span>' +
            '           <span class="badge badge-white border border-secondary text-success mx-1">Callee: <br>{{callee_subrutine}}</span>' +
            '           <span class="badge badge-white border border-secondary text-info mx-1" v-if="track_stack_names.length > 1">Caller: <br>{{caller_subrutine}}</span>' +
            '           <span class="badge badge-white border border-secondary text-dark mx-1" v-if="track_stack_names.length > 2" align-v="center"><b>&bull;&bull;&bull;<br>{{track_stack_names.length - 2}}</b></span>' +
            '           <span class="badge badge-white border border-secondary text-dark mx-1">System <br>stack</span>' +
            ' ' +
            '           <b-popover target="stack_funct_popover" triggers="hover" placement="top"> '+
            '             <span>0x000...</span>' +
            '             <b-list-group class="my-2">' +
            '               <b-list-group-item v-for="(item, index) in track_stack_names.slice().reverse()"> ' +
            '                 <span class="text-success" v-if="index == 0">{{item}}</span>' +
            '                 <span class="text-info" v-if="index == 1">{{item}}</span>' +
            '                 <span class="text-dark" v-if="index > 1">{{item}}</span>' +
            '               </b-list-group-item>' +
            '             </b-list-group>'+
            '             <span>0xFFF...</span>' +
            '           </b-popover>'+
            ' ' +
            '         </div>' +
            ' ' +
            '       </b-col>' +
            '     </b-row>' +
            '   </b-container>' +
            ' ' +
            '   <b-modal id="space_modal" ' +
            '            size="sm" ' +
            '            title="Select space view:" ' +
            '            @hidden="hide_space_modal" ' +
            '            @ok="change_space_view">' +
            '     <b-form-radio v-model="selected_space_view" value="sig_int">Signed Integer</b-form-radio>' +
            '     <b-form-radio v-model="selected_space_view" value="unsig_int">Unsigned Integer</b-form-radio>' +
            '     <b-form-radio v-model="selected_space_view" value="float">Float</b-form-radio>' +
            '     <b-form-radio v-model="selected_space_view" value="char">Char</b-form-radio>' +
            '   </b-modal>' +
            ' ' +
            '   <b-modal id="stack_modal" ' +
            '            size="sm" ' +
            '            title="Select stack word view:" ' +
            '            @hidden="hide_stack_modal" ' +
            '            @ok="change_stack_view">' +
            '     <b-form-radio v-model="selected_stack_view" value="sig_int">Signed Integer</b-form-radio>' +
            '     <b-form-radio v-model="selected_stack_view" value="unsig_int">Unsigned Integer</b-form-radio>' +
            '     <b-form-radio v-model="selected_stack_view" value="float">Float</b-form-radio>' +
            '     <b-form-radio v-model="selected_stack_view" value="char">Char</b-form-radio>' +
            '   </b-modal>' +
            ' ' +
            '  </div>'
  }

  Vue.component('table-mem', uielto_memory) ;

