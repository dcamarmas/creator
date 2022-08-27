/*
 *  Copyright 2018-2022 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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
                                            { text: 'Arithmetic integer',         value: 'Arithmetic integer' },
                                            { text: 'Arithmetic floating point',  value: 'Arithmetic floating point' },
                                            { text: 'Logic',                      value: 'Logic' },
                                            { text: 'Transfer between registers', value: 'Transfer between registers' },
                                            { text: 'Memory access',              value: 'Memory access' },
                                            { text: 'Comparison',                 value: 'Comparison' },
                                            { text: 'I/O',                        value: 'I/O' },
                                            { text: 'Syscall',                    value: 'Syscall' },
                                            { text: 'Control',                    value: 'Control' },
                                            { text: 'Function call',              value: 'Function call' },
                                            { text: 'Conditional bifurcation',    value: 'Conditional bifurcation' },
                                            { text: 'Unconditional bifurcation',  value: 'Unconditional bifurcation' },
                                            { text: 'Other',                      value: 'Other' },
                                          ],

                    //Modal pagination
                    instruction_page: 1,
                    instruction_page_link: ['#Principal', '#Fields', '#Syntax', '#Definition', '#Help'],


                    //Intructions form
                    instruction_field: {
                      name: '',
                      type: '',
                      co: '',
                      cop: '',
                      nwords: 1,
                      help: '',
                      properties: [],
                      numfields: "1",
                      numfieldsAux: "1",
                      nameField: [],
                      typeField: [],
                      separated: [],
                      startBitField: [],
                      stopBitField: [],
                      valueField: [],
                      assignedCop: false,
                      signature: '',
                      signatureRaw: '',
                      signature_definition: '',
                      definition: '',
                    },

                    //Allow instruction with fractioned fields
                    fragmet_data:["inm-signed", "inm-unsigned", "address", "offset_bytes", "offset_words"],

                    //Show Modal
                    show_modal: false,
                  }
                },

    methods:    {
                  //Verify all fields of new instructions
                  new_instructions_verify(evt){
                    evt.preventDefault();

                    for (var i = 0; i < this.instruction_field.nameField.length; i++){
                      for (var j = i + 1; j < this.instruction_field.nameField.length; j++){
                        if (this.instruction_field.nameField[i] == this.instruction_field.nameField[j]){
                            show_notification('Field name repeated', 'danger') ;
                            return;
                        }
                      }
                    }

                    var empty = 0;
                    var auxCop = "";

                    for (var z = 1; z < this.instruction_field.numfields; z++){
                      if(this.instruction_field.typeField[z] == 'cop'){
                        if(!this.instruction_field.valueField[z]){
                          empty = 1;
                        }
                        else{
                          if((this.instruction_field.valueField[z]).length != (this.instruction_field.startBitField[z] - this.instruction_field.stopBitField[z] + 1)){
                            show_notification('The length of cop should be ' + (this.instruction_field.startBitField[z] - this.instruction_field.stopBitField[z] + 1) + ' binary numbers', 'danger') ;
                            return;
                          }

                          for (var i = 0; i < this.instruction_field.valueField[z].length; i++){
                            if (this.instruction_field.valueField[z].charAt(i) != "0" && this.instruction_field.valueField[z].charAt(i) != "1"){
                                show_notification('The value of cop must be binary', 'danger') ;
                                return;
                            }
                          }
                          auxCop = auxCop + this.instruction_field.valueField[z];
                        }
                      }
                    }

                    this.instruction_field.cop = auxCop;

                    if (typeof(this.instruction_field.co) != 'object')
                      for (var i = 0; i < this.instruction_field.co.length; i++){
                        if (this.instruction_field.co.charAt(i) != "0" && this.instruction_field.co.charAt(i) != "1"){
                            show_notification('The value of co must be binary', 'danger') ;
                            return;
                        }
                      }
                    else {
                      for (let val in this.instruction_field.co)
                          if (!/[01]+/.test(val)) {
                            show_notification('The value of co must be binary', 'danger') ;
                            return;
                          }
                    }

                    for (var i = 0; i < this.instruction_field.numfields; i++){
                      if(this.instruction_field.nameField.length <  this.instruction_field.numfields || this.instruction_field.typeField.length <  this.instruction_field.numfields || this.instruction_field.startBitField.length <  this.instruction_field.numfields || this.instruction_field.stopBitField.length <  this.instruction_field.numfields){
                        empty = 1;
                      }
                    }

                    if (!this.instruction_field.name || !this.instruction_field.type || !this.instruction_field.co || !this.instruction_field.nwords || !this.instruction_field.numfields || !this.instruction_field.signature_definition || !this.instruction_field.definition || empty == 1) {
                        show_notification('Please complete all fields', 'danger') ;
                    }
                    else if (typeof(this.instruction_field.co) != 'object' && isNaN(this.instruction_field.co)){
                             show_notification('The field co must be numbers', 'danger') ;
                    } else if (typeof(this.instruction_field.co) === 'object' && this.instruction_field.co.some(val => isNaN(val)))
                             show_notification('The field co must be numbers', 'danger') ;
                    else if(isNaN(this.instruction_field.cop)){
                             show_notification('The field cop must be numbers', 'danger') ;
                    }
                    else if(typeof(this.instruction_field.co) != 'object' && (this.instruction_field.co).length != (this.instruction_field.startBitField[0] - this.instruction_field.stopBitField[0] + 1)){
                             show_notification('The length of co should be ' + (this.instruction_field.startBitField[0] - this.instruction_field.stopBitField[0] + 1) + ' binary numbers', 'danger');
                    } else if (typeof(this.instruction_field.co) === 'object' && this.instruction_field.co.some((val, ind) => val.length !== app.instruction_field.startBitField[0][ind] - app.instruction_field.stopBitField[0][ind] +1))
                             show_notification('The length of co don\'t match with the desription', 'danger');
                    else {
                      this.new_instruction();
                    }
                  },

                  //Create a new instruction
                  new_instruction(){
                    for (var i = 0; i < architecture.instructions.length; i++){
                      if  (this.instruction_field.co == architecture.instructions[i].co){
                        if  ((!this.instruction_field.cop)){
                             show_notification('The instruction already exists', 'danger') ;
                             return;
                        }
                      }
                    }

                    let auxcop = (() => this.instruction_field.co instanceof Array ? this.formInstrucion.co.join("") : this.instruction_field.co)() + this.instruction_field.cop;

                    for (var i = 0; i < architecture.instructions.length; i++){
                      if ((auxcop == architecture.instructions[i].cop) && (!auxcop == false)){
                           show_notification('The instruction already exists', 'danger') ;
                           return;
                      }
                    }

                    this.show_modal = false;

                    //var cop = false;

                    this.generate_signature();

                    var signature = this.instruction_field.signature;
                    var signatureRaw = this.instruction_field.signatureRaw;

                    /*if(cop == false){
                      this.instruction_field.cop='';
                    }*/

                    var newInstruction = {
                      name: this.instruction_field.name,
                      type: this.instruction_field.type,
                      signature_definition: this.instruction_field.signature_definition,
                      signature: signature, signatureRaw: signatureRaw,
                      co: this.instruction_field.co,
                      cop: this.instruction_field.cop,
                      nwords: this.instruction_field.nwords,
                      properties: this.instruction_field.properties,
                      help: this.instruction_field.help,
                      fields: [],
                      definition: this.instruction_field.definition,
                      separated:[]
                    };
                    newInstruction.separated = this.instruction_field.startBitField.map((e, i) => this.instruction_field.separated[i] || false)
                    architecture.instructions.push(newInstruction);
                    for (var i = 0; i < this.instruction_field.numfields; i++){
                      var newField = { name: this.instruction_field.nameField[i], type: this.instruction_field.typeField[i],
                                       startbit: !this.instruction_field.separated[i] ? parseInt(this.instruction_field.startBitField[i]) : this.instruction_field.startBitField[i].map(val => parseInt(val)),
                                       stopbit: !this.instruction_field.separated[i] ? parseInt(this.instruction_field.stopBitField[i]) : this.instruction_field.stopBitField[i].map(val => parseInt(val)),
                                       valueField: this.instruction_field.valueField[i]
                                    };
                      architecture.instructions[architecture.instructions.length-1].fields.push(newField);
                    }
                  },

                  //Clean instruction form
                  clean_form(){
                    this.instruction_field.name = '';
                    this.instruction_field.type = '';
                    this.instruction_field.co = '';
                    this.instruction_field.cop = '';
                    this.instruction_field.nwords = 1;
                    this.instruction_field.numfields = "1";
                    this.instruction_field.numfieldsAux = "1";
                    this.instruction_field.nameField = [];
                    this.instruction_field.properties = [];
                    this.instruction_field.typeField = [];
                    this.instruction_field.startBitField = [];
                    this.instruction_field.stopBitField = [];
                    this.instruction_field.valueField = [];
                    this.instruction_field.separated = [];
                    this.instruction_field.assignedCop = false;
                    this.instruction_field.signature ='';
                    this.instruction_field.signatureRaw = '';
                    this.instruction_field.signature_definition = '';
                    this.instruction_field.definition = '';
                    this.instruction_page = 1;
                    this.instruction_field.help = '';
                  },

                  //Generate the instruction signature
                  generate_signature(){
                    var signature = this.instruction_field.signature_definition;

                    var re = new RegExp("^ +");
                    this.instruction_field.signature_definition= this.instruction_field.signature_definition.replace(re, "");

                    re = new RegExp(" +", "g");
                    this.instruction_field.signature_definition = this.instruction_field.signature_definition.replace(re, " ");

                    re = new RegExp("^ +");
                    signature= signature.replace(re, "");

                    re = new RegExp(" +", "g");
                    signature = signature.replace(re, " ");

                    for (var z = 0; z < this.instruction_field.numfields; z++){
                      re = new RegExp("[Ff]"+z, "g");

                      if(z == 0){
                        signature = signature.replace(re, this.instruction_field.name);
                      }
                      else{
                        signature = signature.replace(re, this.instruction_field.typeField[z]);
                      }
                    }

                    re = new RegExp(" ", "g");
                    signature = signature.replace(re , ",");

                    var signatureRaw = this.instruction_field.signature_definition;

                    re = new RegExp("^ +");
                    signatureRaw= signatureRaw.replace(re, "");

                    re = new RegExp(" +", "g");
                    signatureRaw = signatureRaw.replace(re, " ");

                    for (var z = 0; z < this.instruction_field.numfields; z++){
                      re = new RegExp("[Ff]"+z, "g");
                      signatureRaw = signatureRaw.replace(re, this.instruction_field.nameField[z]);
                    }

                    this.instruction_field.signature = signature;
                    this.instruction_field.signatureRaw = signatureRaw;
                  },

                  //Verify new number of fields
                  change_number_fields(type){
                    if(type == 0){
                      if(this.instruction_field.numfields > (this.instruction_field.nwords * 32)){
                        this.instruction_field.numfieldsAux = (this.instruction_field.nwords * 32);
                        this.instruction_field.numfields = (this.instruction_field.nwords * 32);
                      }
                      else if(this.instruction_field.numfields < 1){
                        this.instruction_field.numfieldsAux = 1;
                        this.instruction_field.numfields = 1;
                      }
                      else{
                        this.instruction_field.numfieldsAux = this.instruction_field.numfields;
                      }
                    }
                    if(type == 1){
                      if(this.formPseudoinstruction.numfields > (this.formPseudoinstruction.nwords * 32)){
                        this.formPseudoinstruction.numfieldsAux = (this.formPseudoinstruction.nwords * 32);
                        this.formPseudoinstruction.numfields = (this.formPseudoinstruction.nwords * 32);
                      }
                      else if(this.formPseudoinstruction.numfields < 0){
                        this.formPseudoinstruction.numfieldsAux = 0;
                        this.formPseudoinstruction.numfields = 0;
                      }
                      else{
                        this.formPseudoinstruction.numfieldsAux = this.formPseudoinstruction.numfields;
                      }
                    }
                  },

                  /**
                    * method in charge of create the array corresponent to the
                    * current position of start bit and end bit
                   */

                  change_2_separate_value( val, pos ) {
                      if (val) {
                        this.instruction_field.startBitField[pos] = [0];
                        this.instruction_field.stopBitField[pos] =[0];
                          if (this.instruction_field.typeField[pos] == 'co')
                              this.instruction_field.co = ['0'];
                      } else {
                        this.instruction_field.startBitField[pos] = 0;
                        this.instruction_field.stopBitField[pos] =0;
                          if (this.instruction_field.typeField[pos] == 'co')
                              this.instruction_field.co = '0';
                      }
                  },

                  add_fields_2_separate_values(event, pos) {
                    this.instruction_field.startBitField[pos].push(0);
                    this.instruction_field.stopBitField[pos].push(0);
                      if (this.instruction_field.typeField[pos] == 'co')
                          this.instruction_field.co.push('0')
                    app.$forceUpdate();
                  },


                  less_fields_2_separate_values(event, pos) {
                      this.instruction_field.startBitField[pos].pop();
                      this.instruction_field.stopBitField[pos].pop();
                        if (this.instruction_field.typeField[pos] == 'co')
                            this.instruction_field.co.pop()
                      app.$forceUpdate();
                  },

                  //Pagination bar names
                  link_generator (pageNum) {
                    return this.instruction_page_link[pageNum - 1]
                  },

                  page_generator (pageNum) {
                    return this.instruction_page_link[pageNum - 1].slice(1)
                  },

                  //Form validator
                  valid(value){
                    if(parseInt(value) != 0){
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

                  //Stop user interface refresh
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

                    //this[param] = e.toString();
                    app.$forceUpdate();
                  }, getDebounceTime())
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
                '                      v-on:input="debounce(\'instruction_field.name\', $event)" ' +
                '                      :value="instruction_field.name" ' +
                '                      required ' +
                '                      placeholder="Enter name" ' +
                '                      :state="valid(instruction_field.name)" ' +
                '                      size="sm" ' +
                '                      title="Intruction name">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Type:">' +
                '        <b-form-select v-model="instruction_field.type" ' +
                '                       :options="instructions_types" ' +
                '                       :state="valid(instruction_field.type)" ' +
                '                       size="sm"' +
                '                       title="Instruction type">' +
                '        </b-form-select>' +
                '      </b-form-group>' +
                '      <b-form-group label="Number of Words:">' +
                '        <b-form-input type="number" ' +
                '                      min="1" ' +
                '                      v-on:input="debounce(\'instruction_field.nwords\', $event)" ' +
                '                      :value="instruction_field.nwords" ' +
                '                      required ' +
                '                      placeholder="Enter nwords" ' +
                '                      :state="valid(instruction_field.nwords)" ' +
                '                      size="sm" ' +
                '                      title="Intruction size">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Number of fields: (Including co and cop)">' +
                '        <b-form-input type="text" ' +
                '                      min="1" ' +
                '                      :max="32 * instruction_field.nwords" ' +
                '                      v-on:input="debounce(\'instruction_field.numfields\', $event)" ' +
                '                      :value="instruction_field.numfields" ' +
                '                      required' +
                '                      placeholder="Enter number of fields" ' +
                '                      :state="valid(instruction_field.numfields)" ' +
                '                      size="sm" ' +
                '                      @change="change_number_fields(0)" ' +
                '                      title="Intruction fields">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Properties:">' +
                '        <b-form-checkbox-group v-model="instruction_field.properties">' +
                '          <b-form-checkbox value="enter_subrutine">Enter Subrutine</b-form-checkbox>' +
                '          <b-form-checkbox value="exit_subrutine">Exit Subrutine</b-form-checkbox>' +
                '        </b-form-checkbox-group>' +
                '      </b-form-group>' +
                '      <div class="d-none">' +
                '        <b-form-input type="text" ' +
                '                      v-model="instruction_field.numfieldsAux" ' +
                '                      title="Intruction fields">' +
                '        </b-form-input>' +
                '      </div>' +
                '    </div>' +
                '' +
                '    <!-- Page 2 -->' +
                '    <div id="newInstForm2" v-if="instruction_page == 2">' +
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
                '          <span class="h6">Value</span>' +
                '        </div>' +
                '      </div>' +
                '' +
                '      <div v-if="isNaN(parseInt(instruction_field.numfieldsAux)) == false">' +
                '        <div v-for="i in parseInt(instruction_field.numfieldsAux)">' +
                '          <div class="col-lg-14 col-sm-14 row">' +
                '            <div class="col-lg-1 col-1 fields">' +
                '              <span class="h6">Field {{i-1}}</span>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                <b-form-input type="text" ' +
                '                              v-on:input="debounce(\'instruction_field.nameField[\'+i+\'-1]\', $event)" ' +
                '                              :value="instruction_field.nameField[i-1]" ' +
                '                              required ' +
                '                              :state="valid(instruction_field.nameField[i-1])" ' +
                '                              size="sm" ' +
                '                              v-if="(i-1) != 0" ' +
                '                              title="Field name">' +
                '                </b-form-input>' +
                '                <b-form-input type="text" ' +
                '                              v-model="instruction_field.nameField[i-1]=instruction_field.name" ' +
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
                '                <b-form-select v-model="instruction_field.typeField[i-1]" ' +
                '                               required ' +
                '                               :state="valid(instruction_field.typeField[i-1])" ' +
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
                '                  <option value="cop" :disabled="instruction_field.assignedCop!=false">cop</option>' +
                '                </b-form-select>' +
                '                <b-form-input type="text" ' +
                '                              v-model="instruction_field.typeField[i-1]=\'co\'" ' +
                '                              required ' +
                '                              size="sm" ' +
                '                              v-if="(i-1) == 0" ' +
                '                              disabled>' +
                '                </b-form-input title="Field type">' +
                '              </b-form-group>' +
                '            </div>' +
                '          <div class="col-lg-1 col-1 fields">' +
                '              <b-form-checkbox' +
                '                  :id="\'fragment-\'+ i"' +
                '                  :value="true"' +
                '                  v-model="instruction_field.separated[i-1]"' +
                '                  @change="change_2_separate_value($event, i-1)"' +
                '                  v-if="fragmet_data.indexOf(instruction_field.typeField[i-1]) !== -1"' +
                '                  class="ml-3">' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                  <b-form-input' +
                '                     type="number"' +
                '                     min="0"' +
                '                     :max="32 * instruction_field.nwords - 1"' +
                '                     v-on:input="debounce(\'instruction_field.startBitField[\'+i+\'-1]\', $event)" ' +
                '                     :value="instruction_field.startBitField[i-1]" ' +
                '                     required ' +
                '                     :state="valid(instruction_field.startBitField[i-1])" ' +
                '                     size="sm"' +
                '                     v-if="typeof(instruction_field.startBitField[i-1]) !== \'object\'"' +
                '                     title="Field start bit">' +
                '                  </b-form-input>' +
                '                  <b-form-input' +
                '                     v-else ' +
                '                     v-for="(j, ind) in instruction_field.startBitField[i-1]"' +
                '                     type="number" ' +
                '                     min="0" ' +
                '                     :max="32 * instruction_field.nwords - 1"' +
                '                     v-on:input="debounce(\'instruction_field.startBitField[\'+i+\'-1][\'+ind+\']\', $event)"' +
                '                     :value="instruction_field.startBitField[i-1][ind]" ' +
                '                     required' +
                '                     :state="valid(j)"' +
                '                     size="sm"' +
                '                     class="mb-2"' +
                '                     title="Field start bit">' +
                '                  </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                <b-form-input' +
                '                    type="number"' +
                '                    min="0"' +
                '                    :max="32 * instruction_field.nwords - 1"' +
                '                    v-on:input="debounce(\'instruction_field.stopBitField[\'+i+\'-1]\', $event)"' +
                '                    :value="instruction_field.stopBitField[i-1]"' +
                '                    required' +
                '                    :state="valid(instruction_field.stopBitField[i-1])"' +
                '                    size="sm"' +
                '                    v-if="typeof(instruction_field.stopBitField[i-1]) !== \'object\'"' +
                '                    title="Field end bit">' +
                '                  </b-form-input>' +
                '' +
                '                  <b-form-input' +
                '                    v-else v-for="(j, ind) in instruction_field.stopBitField[i-1]"' +
                '                    type="number" min="0" :max="32 * instruction_field.nwords - 1"' +
                '                    v-on:input="debounce(\'instruction_field.stopBitField[\'+i+\'-1][\'+ind+\']\', $event)"' +
                '                    :value="instruction_field.stopBitField[i-1][ind]"' +
                '                    required' +
                '                    :state="valid(j)"' +
                '                    size="sm"' +
                '                    class="mb-2"' +
                '                    title="Field end bit">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields" v-if="instruction_field.typeField[i-1] == \'co\'">' +
                '              <b-form-group v-if="typeof(instruction_field.stopBitField[i-1]) != \'object\'">' +
                '                <b-form-input type="text" ' +
                '                              v-on:input="debounce(\'instruction_field.co\', $event)" ' +
                '                              :value="instruction_field.co" ' +
                '                              required ' +
                '                              :state="valid(instruction_field.co)" ' +
                '                              size="sm" ' +
                '                              title="Instruction CO">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '              <b-form-group v-else v-for="(j, ind) in instruction_field.stopBitField[i-1]">' +
                '                <b-form-input type="text"' +
                '                              v-on:input="debounce(\'instruction_field.co[\'+ ind + \']\', $event)"' +
                '                              :value="instruction_field.co[ind]"' +
                '                              required :state="valid(instruction_field.co[ind])"' +
                '                              size="sm"' +
                '                              title="Instruction CO">' +
                '                </b-form-input>' +
                '                  ' +
                '              </b-form-group>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields" v-if="instruction_field.typeField[i-1] == \'cop\'">' +
                '              <b-form-group>' +
                '                <b-form-input type="text" ' +
                '                              v-on:input="debounce(\'instruction_field.valueField[\'+i+\'-1]\', $event)" ' +
                '                              :value="instruction_field.valueField[i-1]" ' +
                '                              required ' +
                '                              :state="valid(instruction_field.valueField[i-1])" ' +
                '                              size="sm" ' +
                '                              title="Field value">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields" v-if="instruction_field.separated[i-1]">' +
                '                <b-button variant="primary" ' +
                '                          @click="add_fields_2_separate_values($event, i-1)" ' +
                '                          size="sm">' +
                '                   + ' +
                '                 </b-button>' +
                '                <b-button v-if="instruction_field.startBitField[i-1].length > 1" ' +
                '                          variant="danger" ' +
                '                          size="sm" ' +
                '                          @click="less_fields_2_separate_values($event, i-1)">' +
                '                   - ' +
                '                 </b-button>' +
                '            </div>' +
                '          </div>' +
                '        </div>' +
                '      </div>' +
                '    </div>' +
                '' +
                '    <!-- Page 3 -->' +
                '    <div id="newInstForm3" v-if="instruction_page == 3">' +
                '      <b-form-group label="Assembly Syntax Definition:">' +
                '        <b-form-input type="text" ' +
                '                      v-on:input="debounce(\'instruction_field.signature_definition\', $event)" ' +
                '                      :value="instruction_field.signature_definition" ' +
                '                      placeholder="Example: F0 F2 F1 (F3)" ' +
                '                      required ' +
                '                      :state="valid(instruction_field.signature_definition)" ' +
                '                      v-on:change="generate_signature()" ' +
                '                      size="sm" ' +
                '                      title="Syntax">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Detailed Syntax:">' +
                '        <b-form-input type="text" ' +
                '                      v-on:input="debounce(\'instruction_field.signature\', $event)" ' +
                '                      :value="instruction_field.signature" ' +
                '                      disabled ' +
                '                      required ' +
                '                      size="sm" ' +
                '                      title="Detailed syntax">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Assembly Syntax:">' +
                '        <b-form-input type="text" ' +
                '                      v-on:input="debounce(\'instruction_field.signatureRaw\', $event)" ' +
                '                      :value="instruction_field.signatureRaw" ' +
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
                '        <b-form-textarea v-on:input="debounce(\'instruction_field.definition\', $event)" ' +
                '                         :value="instruction_field.definition" ' +
                '                         placeholder="Example: reg1=reg2+reg3" ' +
                '                         :state="valid(instruction_field.definition)" ' +
                '                         :rows="4" ' +
                '                         title="Instruction Definition">' +
                '        </b-form-textarea>' +
                '      </b-form-group>' +
                '    </div>' +
                '' +
                '    <!-- Page 5 -->' +
                '    <div id="newInstForm5" v-if="instruction_page == 5">' +
                '      <b-form-group label="Assembly help:">' +
                '        <b-form-textarea v-on:input="debounce(\'instruction_field.help\', $event)" ' +
                '                         :value="instruction_field.help" ' +
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

  Vue.component('instructions-new', uielto_instructions_new) ;

  /*Determines the refresh timeout depending on the device being used*/
  function getDebounceTime(){
    if(screen.width > 768){
      return 500;
    }
    else{
      return 1000;
    }
  }