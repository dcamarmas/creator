
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

  var uielto_instructions_new = {

    props:      {
                  id:                             { type: String, required: true } 
                },

    data:       function () {
                  return {
                    //Intructions form select
                    instructions_types =  [
                                            { text: 'Arithmetic floating point',  value: 'Arithmetic floating point' },
                                            { text: 'Arithmetic integer',         value: 'Arithmetic integer' },
                                            { text: 'Comparison',                 value: 'Comparison' },
                                            { text: 'Conditional bifurcation',    value: 'Conditional bifurcation' },
                                            { text: 'Control',                    value: 'Control' },
                                            { text: 'Function call',              value: 'Function call' },
                                            { text: 'I/O',                        value: 'I/O' },
                                            { text: 'Logic',                      value: 'Logic' },
                                            { text: 'Memory access',              value: 'Memory access' },
                                            { text: 'Other',                      value: 'Other' },
                                            { text: 'Syscall',                    value: 'Syscall' },
                                            { text: 'Transfer between registers', value: 'Transfer between registers' },
                                            { text: 'Unconditional bifurcation',  value: 'Unconditional bifurcation' },
                                          ],

                    //Allow instruction with fractioned fields
                    fragmet_data:["inm-signed", "inm-unsigned", "address", "offset_bytes", "offset_words"],

                    //Instruction field number
                    number_fields: "1",

                    //Intructions form
                    instruction: {
                      name: '',
                      type: '',
                      co: '',
                      cop: '',
                      nwords: 1,
                      help: '',
                      properties: [],
                      clk_cycles: 1,
                      separated: [],
                      fields: [{name: '', type: '', startbit: '', stopbit: '', valueField: ''}],
                      signature: '',
                      signatureRaw: '',
                      signature_definition: '',
                      definition: '',
                    },

                    //Modal pagination
                    instruction_page: 1,
                    instruction_page_link: ['#Principal', '#Fields', '#Syntax', '#Definition', '#Help'],

                    //Show Modal
                    show_modal: false,
                  }
                },

    methods:    {
                  //Check all fields of new instruction
                  new_instructions_verify(evt)
                  {
                    evt.preventDefault();
                    var empty = 0;

                    //Verify CO
                    if (typeof(this.instruction.co) !== 'object')
                    {
                      for (var i = 0; i < this.instruction.co.length; i++)
                      {
                        if (this.instruction.co.charAt(i) != "0" && this.instruction.co.charAt(i) != "1")
                        {
                          show_notification('The value of co must be binary', 'danger') ;
                          return;
                        }
                      }
                    }
                    else
                    {
                      for (let val in this.instruction.co)
                      {
                        if (!/^[01]+$/.test(val))
                        {
                          show_notification('The value of co must be binary', 'danger') ;
                          return;
                        }
                      }
                    }

                    //Verify COP
                    var aux_cop = "";

                    for (var i = 1; i < this.number_fields; i++)
                    {
                      if (this.instruction.fields[i].type == 'cop')
                      {
                        if (!this.instruction.fields[i].valueField)
                        {
                          empty = 1;
                        }
                        else 
                        {
                          if ((this.instruction.fields[i].valueField).length != (this.instruction.fields[i].startbit - this.instruction.fields[i].stopbit + 1))
                          {
                            show_notification('The length of cop should be ' + (this.instruction.fields[i].startbit - this.instruction.fields[i].stopbit + 1) + ' binary numbers', 'danger') ;
                            return;
                          }

                          for (var j = 0; j < (this.instruction.fields[i].valueField).length; j++)
                          {
                            if (this.instruction.fields[i].valueField.charAt(j) != "0" && this.instruction.fields[i].valueField.charAt(j) != "1")
                            {
                              show_notification('The value of cop must be binary', 'danger') ;
                              return;
                            }
                          }
                        }
                        aux_cop = aux_cop + this.instruction.fields[i].valueField;
                      }
                    }

                    this.instruction.cop = aux_cop;

                    //Verify instruction fields
                    for (var i = 0; i < this.number_fields; i++)
                    {
                      for (var j = i + 1; j < this.number_fields; j++)
                      {
                        if (this.instruction.fields[i].name == this.instruction.fields[j].name)
                        {
                          show_notification('Field name repeated', 'danger') ;
                          return;
                        }
                      }

                      if(!this.instruction.fields[i].name || !this.instruction.fields[i].type || (!this.instruction.fields[i].startbit && this.instruction.fields[i].startbit != 0) || (!this.instruction.fields[i].stopbit && this.instruction.fields[i].stopbit != 0))
                      {
                        empty = 1;
                      }
                    }

                    //Verify empty fields
                    if (!this.instruction.name || !this.instruction.type || !this.instruction.co || !this.instruction.nwords || !this.instruction.clk_cycles || !this.number_fields || !this.instruction.signature_definition || !this.instruction.definition || empty == 1)
                    {
                      show_notification('Please complete all fields', 'danger') ;
                      return;
                    }

                    //Verify fields values
                    if ((typeof(this.instruction.co) != 'object' && isNaN(this.instruction.co)) || (typeof(this.instruction.co) === 'object' && this.instruction.co.some(val => isNaN(val))))
                    {
                      show_notification('The field co must be numbers', 'danger') ;
                      return;
                    }
                    else if(isNaN(this.instruction.cop))
                    {
                      show_notification('The field cop must be numbers', 'danger') ;
                      return;
                    }
                    else if(typeof(this.instruction.co) != 'object' && (this.instruction.co).length != (this.instruction.fields[0].startbit - this.instruction.fields[0].stopbit + 1))
                    {
                      show_notification('The length of co should be ' + (this.instruction.fields[0].startbit - this.instruction.fields[0].stopbit + 1) + ' binary numbers', 'danger');
                      return;
                    } 
                    else if (typeof(this.instruction.co) === 'object' && this.instruction.co.some((val, ind) => val.length !== app.instruction.fields[0].startbit[ind] - app.instruction.fields[0].stopbit[ind] +1))
                    {
                      show_notification('The length of co don\'t match with the desription', 'danger');
                      return;
                    }
                    else {
                      //Verify repeat instruction
                      var ex_cop = false;
                      for (var i = 1; i < this.number_fields; i++)
                      {
                        if (this.instruction.fields[i].type == 'cop'){
                          ex_cop = true;
                        }
                      }

                      for (var i = 0; i < architecture.instructions.length; i++){
                        if ((this.instruction.co == architecture.instructions[i].co) && (i!= this.index) && (ex_cop == false))
                        {
                          if (((!this.instruction.cop) || (ex_cop != true)))
                          {
                            show_notification('The instruction already exists', 'danger') ;
                            return;
                          }
                        }
                      }

                      let aux_cop = (() => this.instruction.co instanceof Array ? this.formInstrucion.co.join("") : this.instruction.co)() + this.instruction.cop;

                      for (var i = 0; i < architecture.instructions.length && ex_cop == true ; i++)
                      {
                        if ((aux_cop == architecture.instructions[i].cop) && (!aux_cop == false) && (i != this.index))
                        {
                          show_notification('The instruction already exists', 'danger') ;
                          return;
                        }
                      }

                      this.new_instruction(ex_cop);
                    }
                  },

                  
                  //Create a new instruction
                  new_instruction(ex_cop)
                  {
                    this.show_modal = false;

                    //Generate new signature
                    this.generate_signature();
                    var signature = this.instruction.signature;
                    var signatureRaw = this.instruction.signatureRaw;

                    //Verify is cop exist
                    if(ex_cop == false){
                      this.instruction.cop='';
                    }

                    //Create new instruction object
                    var new_instruction = {
                      name: this.instruction.name,
                      type: this.instruction.type,
                      co: this.instruction.co,
                      cop: this.instruction.cop,
                      help: this.instruction.help,
                      properties: this.instruction.properties,
                      nwords: this.instruction.nwords,
                      clk_cycles: this.instruction.clk_cycles,
                      signature_definition: this.instruction.signature_definition,
                      signature: signature, 
                      signatureRaw: signatureRaw,
                      fields: [],
                      definition: this.instruction.definition,
                      separated:[]
                    };

                    //Add the new instruction
                    architecture.instructions.push(new_instruction);

                    //Add the new instruction fields and separated
                    for (var i = 0; i < this.number_fields; i++)
                    {
                      //Separated
                      if (typeof(this.instruction.fields[i].startbit) === 'object'){
                        this.instruction.separated[i] = true;
                      }
                      else{
                        this.instruction.separated[i] = false;
                      }

                      //New field
                      var new_field = { name: this.instruction.fields[i].name, 
                                        type: this.instruction.fields[i].type,
                                        startbit: parseInt(this.instruction.fields[i].startbit),
                                        stopbit: parseInt(this.instruction.fields[i].stopbit),
                                        field_value: this.instruction.fields[i].valueField
                                      };

                      architecture.instructions[architecture.instructions.length-1].fields.push(new_field);
                    }
                  },

                  //Verify new number of fields
                  change_number_fields()
                  {
                    //Top limit
                    if(this.number_fields > (this.instruction.nwords * 32)){
                      this.number_fields = (this.instruction.nwords * 32);
                    }

                    //Lower limit
                    if(this.number_fields < 1){
                      this.number_fields = 1;
                    }

                    //Add fields
                    if(this.number_fields > this.instruction.fields.length)
                    {
                      var diff = this.number_fields - this.instruction.fields.length;
                      for (var i = 0; i < diff; i++)
                      {
                        var new_field = {name: '', type: '', startbit: '', stopbit: '', valueField: ''};
                        this.instruction.fields.push(new_field);
                      }
                    }

                    //Delete fields
                    if(this.number_fields < this.instruction.fields.length)
                    {
                      var diff = this.instruction.fields.length - this.number_fields;
                      for (var i = 0; i < diff; i++) {
                        this.instruction.fields.splice(-1,1);
                      }
                    }
                  },

                  //Generate the different instruction signature
                  generate_signature(){
                    var signature = this.instruction.signature_definition;

                    //Signature definition cleaning
                    var re = new RegExp("^ +");
                    this.instruction.signature_definition= this.instruction.signature_definition.replace(re, "");

                    re = new RegExp(" +", "g");
                    this.instruction.signature_definition = this.instruction.signature_definition.replace(re, " ");

                    //New signature generation
                    re = new RegExp("^ +");
                    signature= signature.replace(re, "");

                    re = new RegExp(" +", "g");
                    signature = signature.replace(re, " ");

                    for (var i = 0; i < this.number_fields; i++)
                    {
                      re = new RegExp("[Ff]"+i, "g");

                      if(i == 0){
                        signature = signature.replace(re, this.instruction.name);
                      }
                      else{
                        signature = signature.replace(re, this.instruction.fields[i].type);
                      }
                    }

                    re = new RegExp(" ", "g");
                    signature = signature.replace(re , ",");

                    //New raw signature generation
                    var signatureRaw = this.instruction.signature_definition;

                    re = new RegExp("^ +");
                    signatureRaw= signatureRaw.replace(re, "");

                    re = new RegExp(" +", "g");
                    signatureRaw = signatureRaw.replace(re, " ");

                    for (var i = 0; i < this.number_fields; i++)
                    {
                      re = new RegExp("[Ff]"+i, "g");
                      signatureRaw = signatureRaw.replace(re, this.instruction.fields[i].name);
                    }

                    this.instruction.signature = signature;
                    this.instruction.signatureRaw = signatureRaw;
                  },

                  //Change to separate field
                  change_to_separate_field(val, pos)
                  {
                    if (val)
                    {
                      this.instruction.fields[pos].startbit = [0];
                      this.instruction.fields[pos].stopbit = [0];
                      if (this.instruction.fields[pos].type == 'co')
                      {
                        this.instruction.co = ['0'];
                      }
                    } 
                    else
                    {
                      this.instruction.fields[pos].startbit = 0;
                      this.instruction.fields[pos].stopbit = 0;
                      if (this.instruction.fields[pos].type == 'co')
                      {
                        this.instruction.co = '0';
                      }
                    }
                  },

                  //Add new separate value
                  add_separate_values(pos)
                  {
                    this.instruction.fields[pos].startbit.push(0);
                    this.instruction.fields[pos].stopbit.push(0);
                    if (this.instruction.fields[pos].type == 'co')
                    {
                      this.instruction.co.push('0');
                    }
                  },

                  //Less new separate value
                  less_separate_values(pos)
                  {
                    this.instruction.fields[pos].startbit.pop();
                    this.instruction.fields[pos].stopbit.pop();
                    if (this.instruction.fields[pos].type == 'co')
                    {
                      this.instruction.co.pop();
                    }
                  },


                  /*******************/
                  /* Modal Functions */
                  /*******************/

                  //Pagination bar names
                  link_generator (pageNum)
                  {
                    return this.instruction_page_link[pageNum - 1]
                  },

                  page_generator (pageNum)
                  {
                    return this.instruction_page_link[pageNum - 1].slice(1)
                  },

                  //Clean instruction form
                  clean_form()
                  {
                    this.instruction_page = 1;

                    //Instruction
                    this.instruction.name = '';
                    this.instruction.type = '';
                    this.instruction.co = '';
                    this.instruction.cop = '';
                    this.instruction.nwords = 1;
                    this.instruction.separated = [];
                    this.instruction.clk_cycles = 1;
                    this.instruction.properties = [];
                    this.number_fields = "1";
                    this.instruction.fields = [{name: '', type: '', startbit: '', stopbit: '', valueField: ''}];
                    this.instruction.signature ='';
                    this.instruction.signatureRaw = '';
                    this.instruction.signature_definition = '';
                    this.instruction.definition = '';
                    this.instruction.help = '';
                  },

                  //Form validator
                  valid(value)
                  {
                    if(parseInt(value) != 0)
                    {
                      if(!value){
                        return false;
                      }
                      else{
                        return true;
                      }
                    }
                    else{
                      return true;
                    }
                  },
                },

    template:   '<b-modal :id ="id" ' +
                '         size="lg" ' +
                '         title = "New Instruction" ' +
                '         ok-title="Save" ' +
                '         @ok="new_instructions_verify" ' +
                '         v-model="show_modal" ' +
                '         @hidden="clean_form">' +
                '  <b-form>' +
                '' +
                '    <!-- Page 1 -->' +
                '    <div id="newInstForm1" v-if="instruction_page == 1">' +
                '      <b-form-group label="Name:">' +
                '        <b-form-input type="text" ' +
                '                      v-model="instruction.name" ' +
                '                      required ' +
                '                      placeholder="Enter name" ' +
                '                      :state="valid(instruction.name)" ' +
                '                      size="sm" ' +
                '                      title="Intruction name">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Type:">' +
                '        <b-form-select v-model="instruction.type" ' +
                '                       :options="instructions_types" ' +
                '                       :state="valid(instruction.type)" ' +
                '                       size="sm"' +
                '                       title="Instruction type">' +
                '        </b-form-select>' +
                '      </b-form-group>' +
                '      <b-form-group label="Number of Words:">' +
                '        <b-form-input type="number" ' +
                '                      min="1" ' +
                '                      v-model="instruction.nwords" ' +
                '                      required ' +
                '                      placeholder="Enter nwords" ' +
                '                      :state="valid(instruction.nwords)" ' +
                '                      size="sm" ' +
                '                      title="Intruction size">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="CLK Cycles:">' +
                '        <b-form-input type="number" ' +
                '                      min="1" ' +
                '                      v-model="instruction.clk_cycles" ' +
                '                      required ' +
                '                      placeholder="Enter CLK Cycles" ' +
                '                      :state="valid(instruction.clk_cycles)" ' +
                '                      size="sm" ' +
                '                      title="Intruction size">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Number of fields: (Including co and cop)">' +
                '        <b-form-input type="text" ' +
                '                      min="1" ' +
                '                      :max="32 * instruction.nwords" ' +
                '                      min="0"' +
                '                      v-model="number_fields" ' +
                '                      required' +
                '                      placeholder="Enter number of fields" ' +
                '                      :state="valid(number_fields)" ' +
                '                      size="sm" ' +
                '                      @change="change_number_fields()" ' +
                '                      title="Intruction fields">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Properties:">' +
                '        <b-form-checkbox-group v-model="instruction.properties">' +
                '          <b-form-checkbox value="enter_subrutine">Enter Subrutine</b-form-checkbox>' +
                '          <b-form-checkbox value="exit_subrutine">Exit Subrutine</b-form-checkbox>' +
                '        </b-form-checkbox-group>' +
                '      </b-form-group>' +
                '      <div class="d-none">' +
                '        <b-form-input type="text" ' +
                '                      v-model="number_fields" ' +
                '                      title="Intruction fields">' +
                '        </b-form-input>' +
                '      </div>' +
                '    </div>' +
                '' +
                '    <!-- Page 2 -->' +
                '    <div id="editInstForm2" v-if="instruction_page == 2">' +
                '      <div class="col-lg-14 col-sm-14 row">' +
                '        <div class="col-lg-1 col-1 fields">' +
                '          ' +
                '        </div>' +
                '        <div class="col-lg-2 col-2 fields">' +
                '          <span class="h6">Name:</span>' +
                '        </div>' +
                '        <div class="col-lg-2 col-2 fields">' +
                '          <span class="h6">Type</span>' +
                '        </div>' +
                '        <div class="col-lg-1 col-1 fields">' +
                '          <span class="h6">Break</span>' +
                '        </div>' +
                '        <div class="col-lg-2 col-2 fields">' +
                '          <span class="h6">Start Bit</span>' +
                '        </div>' +
                '        <div class="col-lg-2 col-2 fields">' +
                '          <span class="h6">End Bit</span>' +
                '        </div>' +
                '        <div class="col-lg-2 col-2 fields">' +
                '' +
                '        </div>' +
                '      </div>' +
                '' +
                '' +
                '      <div v-if="isNaN(parseInt(number_fields)) == false">' +
                '        <div v-for="i in parseInt(number_fields)">' +
                '          <div class="col-lg-14 col-sm-14 row">' +
                '            <div class="col-lg-1 col-1 fields">' +
                '              <span class="h6">Field {{i-1}}</span>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                <b-form-input type="text" ' +
                '                              v-model="instruction.fields[i-1].name" ' +
                '                              required ' +
                '                              :state="valid(instruction.fields[i-1].name)" ' +
                '                              size="sm" ' +
                '                              v-if="(i-1) != 0" ' +
                '                              title="Field name">' +
                '                </b-form-input>' +
                '                <b-form-input type="text" ' +
                '                              v-model="instruction.fields[i-1].name=instruction.name" ' +
                '                              required ' +
                '                              size="sm" ' +
                '                              v-if="(i-1) == 0" ' +
                '                              disabled ' +
                '                              title="Field name">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                <b-form-select v-model="instruction.fields[i-1].type" ' +
                '                               required ' +
                '                               :state="valid(instruction.fields[i-1].type)" ' +
                '                               size="sm" ' +
                '                               v-if="(i-1) != 0"' +
                '                               title="Field type">' +
                '                  <option value="INT-Reg">INT-Reg</option>' +
                '                  <option value="SFP-Reg">SFP-Reg</option>' +
                '                  <option value="DFP-Reg">DFP-Reg</option>' +
                '                  <option value="Ctrl-Reg">Ctrl-Reg</option>' +
                '                  <option value="inm-signed">inm-signed</option>' +
                '                  <option value="inm-unsigned">inm-unsigned</option>' +
                '                  <option value="address">address</option>' +
                '                  <option value="offset_bytes">Offset Bytes</option>' +
                '                  <option value="offset_words">Offset Words</option>' +
                '                  <option value="cop" :disabled="instruction.cop!=\'\'">cop</option>' +
                '                </b-form-select>' +
                '                <b-form-input type="text" ' +
                '                              v-model="instruction.fields[i-1].type=\'co\'"' +
                '                              required ' +
                '                              size="sm" ' +
                '                              v-if="(i-1) == 0" ' +
                '                              disabled>' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                '            <div class="col-lg-1 col-1 fields">' +
                '              <b-form-checkbox :id="\'fragment-\'+ i"' +
                '                               v-model="instruction.separated[i-1]"' +
                '                               @change="change_to_separate_field($event, i-1)"' +
                '                               v-if="typeof(instruction.separated) !== \'undefined\' && fragmet_data.indexOf(instruction.fields[i-1].type) !== -1"' +
                '                               class="ml-3">' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                <b-form-input type="number" ' +
                '                              min="0" ' +
                '                              :max="32 * instruction.nwords - 1" ' +
                '                              min="0" ' +
                '                              v-model="instruction.fields[i-1].startbit" ' +
                '                              required ' +
                '                              :state="valid(instruction.fields[i-1].startbit)" ' +
                '                              size="sm" ' +
                '                              v-if="typeof(instruction.fields[i-1].startbit) !== \'object\'" ' +
                '                              title="Field start bit">' +
                '                </b-form-input>' +
                '                <b-form-input v-if="typeof(instruction.fields[i-1].startbit) === \'object\'"' +
                '                              v-for="(j, ind) in instruction.fields[i-1].startbit"' +
                '                              type="number" ' +
                '                              min="0" ' +
                '                              :max="32 * instruction.nwords - 1"' +
                '                              min="0" ' +
                '                              v-model="instruction.fields[i-1].startbit[ind]" ' +
                '                              required' +
                '                              :state="valid(j)" ' +
                '                              size="sm"' +
                '                              class="mb-2"' +
                '                              title="Field start bit">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                <b-form-input type="number" ' +
                '                              min="0" ' +
                '                              :max="32 * instruction.nwords - 1" ' +
                '                              min="0" ' +
                '                              v-model="instruction.fields[i-1].stopbit" ' +
                '                              required ' +
                '                              :state="valid(instruction.fields[i-1].stopbit)" ' +
                '                              size="sm"' +
                '                              v-if="typeof(instruction.fields[i-1].stopbit) !== \'object\'"' +
                '                              title="Field end bit">' +
                '                </b-form-input>' +
                '                <b-form-input v-if="typeof(instruction.fields[i-1].startbit) === \'object\'"' +
                '                              v-for="(j, ind) in instruction.fields[i-1].stopbit"' +
                '                              type="number" ' +
                '                              min="0" ' +
                '                              :max="32 * instruction.nwords - 1"' +
                '                              min="0" ' +
                '                              v-model="instruction.fields[i-1].stopbit[ind]" ' +
                '                              required' +
                '                              :state="valid(j)" ' +
                '                              size="sm"' +
                '                              class="mb-2"' +
                '                              title="Field end bit">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields" v-if="instruction.fields[i-1].type == \'co\'">' +
                '              <b-form-group>' +
                '                <b-form-input v-if="typeof(instruction.fields[i-1].startbit) !== \'object\'"' + 
                '                              type="text" ' +
                '                              v-model="instruction.co" ' +
                '                              required ' +
                '                              :state="valid(instruction.co)" ' +
                '                              size="sm" ' +
                '                              title="Instruction CO">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '              <b-form-group v-if="typeof(instruction.fields[i-1].startbit) === \'object\'"' + 
                '                            v-for="(j, ind) in instruction.fields[i-1].stopbit">' +
                '                <b-form-input type="text" ' +
                '                              v-model="instruction.co[ind]" required ' +
                '                              :state="valid(instruction.co[ind])" ' +
                '                              size="sm">' +
                '                </b-form-input>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields" v-if="instruction.fields[i-1].type == \'cop\'">' +
                '              <b-form-group>' +
                '                <b-form-input type="text" ' +
                '                              v-model="instruction.fields[i-1].valueField" ' +
                '                              required ' +
                '                              :state="valid(instruction.fields[i-1].valueField)" ' +
                '                              size="sm" ' +
                '                              title="Field value">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields"' +
                '                 v-if="typeof(instruction.separated) !== \'undefined\' && instruction.separated[i-1]">' +
                '                <b-button variant="primary" ' +
                '                          @click="add_separate_values(i-1)" ' +
                '                          size="sm">' +
                '                   + ' +
                '                </b-button>' +
                '                <b-button v-if="instruction.fields[i-1].startbit.length > 1" ' +
                '                          variant="danger" ' +
                '                          size="sm"  ' +
                '                          @click="less_separate_values(i-1)">' +
                '                  - ' +
                '                </b-button>' +
                '            </div>' +
                '          </div>' +
                '        </div>' +
                '      </div>' +
                '    </div>' +
                '' +
                '' +
                '    <!-- Page 3 -->' +
                '    <div id="newInstForm3" v-if="instruction_page == 3">' +
                '      <b-form-group label="Assembly Syntax Definition:">' +
                '        <b-form-input type="text" ' +
                '                      v-model="instruction.signature_definition" ' +
                '                      placeholder="Example: F0 F2 F1 (F3)" ' +
                '                      required ' +
                '                      :state="valid(instruction.signature_definition)" ' +
                '                      v-on:change="generate_signature()" ' +
                '                      size="sm" ' +
                '                      title="Syntax">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Detailed Syntax:">' +
                '        <b-form-input type="text" ' +
                '                      v-model="instruction.signature" ' +
                '                      disabled ' +
                '                      required ' +
                '                      size="sm" ' +
                '                      title="Detailed syntax">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Assembly Syntax:">' +
                '        <b-form-input type="text" ' +
                '                      v-model="instruction.signatureRaw" ' +
                '                      disabled ' +
                '                      size="sm" ' +
                '                      title="Assembly syntax">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '    </div>' +
                '' +
                '    <!-- Page 4 -->' +
                '    <div id="newInstForm4" v-if="instruction_page == 4">' +
                '      <b-form-group label="Assembly Definition:">' +
                '        <b-form-textarea v-model="instruction.definition" ' +
                '                         placeholder="Example: reg1=reg2+reg3" ' +
                '                         :state="valid(instruction.definition)" ' +
                '                         :rows="4" ' +
                '                         title="Instruction Definition">' +
                '        </b-form-textarea>' +
                '      </b-form-group>' +
                '    </div>' +
                '' +
                '    <!-- Page 5 -->' +
                '    <div id="newInstForm5" v-if="instruction_page == 5">' +
                '      <b-form-group label="Assembly help:">' +
                '        <b-form-textarea v-model="instruction.help" ' +
                '                         placeholder="Example: reg1=reg2+reg3" ' +
                '                         :rows="4" ' +
                '                         title="Instruction help">' +
                '        </b-form-textarea>' +
                '      </b-form-group>' +
                '    </div>' +
                '  </b-form>' +
                '  <hr>' +
                '  <b-pagination-nav size="sm" ' +
                '                    align="center" ' +
                '                    base-url="#" ' +
                '                    :number-of-pages="5" ' +
                '                    v-model="instruction_page" ' +
                '                    :link-gen="link_generator" ' +
                '                    :page-gen="page_generator">' +
                '  </b-pagination-nav>' +
                '</b-modal >'

  }

  Vue.component('instructions-new', uielto_instructions_new);