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

  var uielto_instructions_edit = {

    props:      {
                  id:                             { type: String, required: true },
                  title:                          { type: String, required: true },
                  index:                          { type: Number, required: true },
                  instruction:                    { type: Object, required: true },
                  numfields:                      { type: Number, required: true }
                  
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

                    //Allow instruction with fractioned fields
                    fragmet_data:["inm-signed", "inm-unsigned", "address", "offset_bytes", "offset_words"],

                    //Show Modal
                    show_modal: false,
                  }
                },

    methods:    {
                  //Check all fields of modify instruction
                  edit_instructions_verify(evt, inst, co, cop){
                    evt.preventDefault();

                    for (var i = 0; i < this.instruction.nameField.length; i++){
                      for (var j = i + 1; j < this.instruction.nameField.length; j++){
                        if (this.instruction.nameField[i] == this.instruction.nameField[j]){
                          show_notification('Field name repeated', 'danger') ;
                          return;
                        }
                      }
                    }

                    var empty = 0;
                    var auxCop = "";

                    for (var z = 1; z < this.instruction.numfields; z++){
                      if (this.instruction.typeField[z] == 'cop'){
                        if (!this.instruction.valueField[z]){
                            empty = 1;
                        }
                        else {
                          if ((this.instruction.valueField[z]).length != (this.instruction.startBitField[z] - this.instruction.stopBitField[z] + 1)){
                             show_notification('The length of cop should be ' + (this.instruction.startBitField[z] - this.instruction.stopBitField[z] + 1) + ' binary numbers', 'danger') ;
                             return;
                          }

                          for (var i = 0; i < this.instruction.valueField[z].length; i++){
                            if (this.instruction.valueField[z].charAt(i) != "0" && this.instruction.valueField[z].charAt(i) != "1"){
                               show_notification('The value of cop must be binary', 'danger') ;
                               return;
                            }
                          }
                        }
                        auxCop = auxCop + this.instruction.valueField[z];
                      }
                    }

                    this.instruction.cop = auxCop;

                      if (typeof(this.instruction.co) !== 'object')
                        for (var i = 0; i < this.instruction.co.length; i++){
                          if (this.instruction.co.charAt(i) != "0" && this.instruction.co.charAt(i) != "1"){
                              show_notification('The value of co must be binary', 'danger') ;
                              return;
                          }
                        }
                      else {
                          for (let val in this.instruction.co) {
                              if (!/^[01]+$/.test(val)) {
                                  show_notification('The value of co must be binary', 'danger') ;
                                  return;
                              }
                          }
                      }

                    for (var i = 0; i < this.instruction.numfields; i++){
                      if(!this.instruction.nameField[i] || !this.instruction.typeField[i] || (!this.instruction.startBitField[i] && this.instruction.startBitField[i] != 0) || (!this.instruction.stopBitField[i] && this.instruction.stopBitField[i] != 0)){
                        empty = 1;
                      }
                    }
                    if (!this.instruction.name || !this.instruction.type || !this.instruction.co || !this.instruction.nwords || !this.instruction.numfields || !this.instruction.signature_definition || !this.instruction.definition || empty == 1) {
                      show_notification('Please complete all fields', 'danger') ;
                    }
                    if ((typeof(this.instruction.co) != 'object' && isNaN(this.instruction.co)) || (typeof(this.instruction.co) === 'object' && this.instruction.co.some(val => isNaN(val))))
                             show_notification('The field co must be numbers', 'danger') ;
                    else if(isNaN(this.instruction.cop)){
                      show_notification('The field cop must be numbers', 'danger') ;
                    }
                    else if(typeof(this.instruction.co) != 'object' && (this.instruction.co).length != (this.instruction.startBitField[0] - this.instruction.stopBitField[0] + 1)){
                             show_notification('The length of co should be ' + (this.instruction.startBitField[0] - this.instruction.stopBitField[0] + 1) + ' binary numbers', 'danger');
                    } else if (typeof(this.instruction.co) === 'object' && this.instruction.co.some((val, ind) => val.length !== app.instruction.startBitField[0][ind] - app.instruction.stopBitField[0][ind] +1))
                             show_notification('The length of co don\'t match with the desription', 'danger');
                    else {
                      this.edit_instructions(inst, co, cop);
                    }
                  },

                  //Edit the instruction
                  edit_instructions(comp, co, cop)
                  {
                    var exCop = false;

                    for (var z = 1; z < this.instruction.numfields; z++){
                      if (this.instruction.typeField[z] == 'cop'){
                          exCop = true;
                      }
                    }

                    for (var i = 0; i < architecture.instructions.length; i++){
                      if ((this.instruction.co == architecture.instructions[i].co) && (this.instruction.co != co) && (exCop == false)){
                        if (((!this.instruction.cop) || (exCop != true))){
                            show_notification('The instruction already exists', 'danger') ;
                            return;
                        }
                      }
                    }


                    let auxcop = (() => this.instruction.co instanceof Array ? this.formInstrucion.co.join("") : this.instruction.co)() + this.instruction.cop;

                    for (var i = 0; i < architecture.instructions.length && exCop == true ; i++){
                      if ((auxcop == architecture.instructions[i].cop) && (!auxcop == false) && (auxcop != cop)){
                           show_notification('The instruction already exists', 'danger') ;
                           return;
                      }
                    }

                    this.show_modal = false;

                    for (var i = 0; i < architecture.instructions.length; i++){
                      if (architecture.instructions[i].name == comp && architecture.instructions[i].co == co && architecture.instructions[i].cop == cop) {
                        architecture.instructions[i].name = this.instruction.name;
                        architecture.instructions[i].type = this.instruction.type;
                        architecture.instructions[i].co = this.instruction.co;
                        architecture.instructions[i].cop = this.instruction.cop;
                        architecture.instructions[i].nwords = this.instruction.nwords;
                        architecture.instructions[i].help = this.instruction.help;
                        architecture.instructions[i].signature_definition = this.instruction.signature_definition;
                        architecture.instructions[i].definition = this.instruction.definition;
                        architecture.instructions[i].properties = this.instruction.properties;
                        if (!architecture.instructions[i].separated)
                            architecture.instructions[i].separated =Array(this.instruction.numfields).fill(false);

                        for (var j = 0; j < this.instruction.numfields; j++) {
                          if (j < architecture.instructions[i].fields.length) {
                            architecture.instructions[i].fields[j].name = this.instruction.nameField[j];
                            architecture.instructions[i].fields[j].type = this.instruction.typeField[j];
                            architecture.instructions[i].fields[j].startbit = !this.instruction.separated[j] ? parseInt(this.instruction.startBitField[j]) : this.instruction.startBitField[j].map(val => parseInt(val));
                            architecture.instructions[i].fields[j].stopbit = !this.instruction.separated[j] ? parseInt(this.instruction.stopBitField[j]): this.instruction.stopBitField[j].map(val => parseInt(val));
                            architecture.instructions[i].fields[j].valueField = this.instruction.valueField[j];
                            /*add data to store if the field is fragmented or not.*/
                            architecture.instructions[i].separated[j] = this.instruction.separated[j];
                          }
                          else{
                            var newField = {name: this.instruction.nameField[j], type: this.instruction.typeField[j], startbit: this.instruction.startBitField[j], stopbit: this.instruction.stopBitField[j], valueField: this.instruction.valueField[j]};
                            architecture.instructions[i].fields.push(newField);
                          }
                        }

                        this.generate_signature();

                        var signature = this.instruction.signature;
                        var signatureRaw = this.instruction.signatureRaw;

                        if(exCop == false){
                          architecture.instructions[i].cop='';
                        }

                        architecture.instructions[i].signature = signature;
                        architecture.instructions[i].signatureRaw = signatureRaw;

                        if(architecture.instructions[i].fields.length > this.instruction.numfields){
                          architecture.instructions[i].fields.splice(this.instruction.numfields, (architecture.instructions[i].fields.length - this.instruction.numfields));
                        }
                        break;
                      }
                    }

                    show_notification('The instruction has been modified, please check the definition of the pseudoinstructions', 'info') ;
                  },


























                  //Generate the instruction signature
                  generate_signature(){ //TODO
                    var signature = this.instruction.signature_definition;

                    var re = new RegExp("^ +");
                    this.instruction.signature_definition= this.instruction.signature_definition.replace(re, "");

                    re = new RegExp(" +", "g");
                    this.instruction.signature_definition = this.instruction.signature_definition.replace(re, " ");

                    re = new RegExp("^ +");
                    signature= signature.replace(re, "");

                    re = new RegExp(" +", "g");
                    signature = signature.replace(re, " ");

                    for (var z = 0; z < this.instruction.numfields; z++){
                      re = new RegExp("[Ff]"+z, "g");

                      if(z == 0){
                        signature = signature.replace(re, this.instruction.name);
                      }
                      else{
                        signature = signature.replace(re, this.instruction.typeField[z]);
                      }
                    }

                    re = new RegExp(" ", "g");
                    signature = signature.replace(re , ",");

                    var signatureRaw = this.instruction.signature_definition;

                    re = new RegExp("^ +");
                    signatureRaw= signatureRaw.replace(re, "");

                    re = new RegExp(" +", "g");
                    signatureRaw = signatureRaw.replace(re, " ");

                    for (var z = 0; z < this.instruction.numfields; z++){
                      re = new RegExp("[Ff]"+z, "g");
                      signatureRaw = signatureRaw.replace(re, this.instruction.nameField[z]);
                    }

                    this.instruction.signature = signature;
                    this.instruction.signatureRaw = signatureRaw;
                  },

                  /**
                    * method in charge of create the array corresponent to the
                    * current position of start bit and end bit
                   */

                  changeToSeparateValue( val, pos ) {
                      if (val) {
                        this.instruction.startBitField[pos] = [0];
                        this.instruction.stopBitField[pos] =[0];
                          if (this.instruction.typeField[pos] == 'co')
                              this.instruction.co = ['0'];
                      } else {
                        this.instruction.startBitField[pos] = 0;
                        this.instruction.stopBitField[pos] =0;
                          if (this.instruction.typeField[pos] == 'co')
                              this.instruction.co = '0';
                      }
                  },

                  addMoreFieldsToSeparateValues(event, pos) {
                    this.instruction.startBitField[pos].push(0);
                    this.instruction.stopBitField[pos].push(0);
                      if (this.instruction.typeField[pos] == 'co')
                          this.instruction.co.push('0')
                    app.$forceUpdate();
                  },


                  lessFieldsToSeparateValues(event, pos) { //TODO
                      this.instruction.startBitField[pos].pop();
                      this.instruction.stopBitField[pos].pop();
                        if (this.instruction.typeField[pos] == 'co')
                            this.instruction.co.pop()
                      app.$forceUpdate();
                  },

                  //Verify new number of fields
                  changeNumfield(type){
                    if(type == 0){
                      if(this.instruction.numfields > (this.instruction.nwords * 32)){
                        this.instruction.numfieldsAux = (this.instruction.nwords * 32);
                        this.instruction.numfields = (this.instruction.nwords * 32);
                      }
                      else if(this.instruction.numfields < 1){
                        this.instruction.numfieldsAux = 1;
                        this.instruction.numfields = 1;
                      }
                      else{
                        this.instruction.numfieldsAux = this.instruction.numfields;
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
                },

    template:   '<b-modal size="lg" ' +
                '         :id ="id" ' +
                '         :title="title" ' +
                '         ok-title="Save" ' +
                '         @ok="edit_instructions_verify($event, element.element, element.co, element.cop)" ' +
                '         v-model="show_modal">' +
                '  <b-form>' +
                '' +
                '    <!-- Page 1 -->' +
                '    <div id="editInstForm1" v-if="instruction_page == 1">' +
                '      <b-form-group label="Name:">' +
                '        <b-form-input type="text" ' +
                '                      :value="instruction.name" ' +
                '                      required ' +
                '                      placeholder="Enter name" ' +
                '                      :state="valid(instruction.name)" ' +
                '                      size="sm" ' +
                '                      title="Instruction name">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Type:">' +
                '        <b-form-select :value="instruction.type" ' +
                '                       :options="instructions_types" ' +
                '                       :state="valid(instruction.type)" ' +
                '                       size="sm"' +
                '                       title="Instruction type">' +
                '        </b-form-select>' +
                '      </b-form-group>' +
                '      <b-form-group label="Number of Words:">' +
                '        <b-form-input type="number"' +
                '                      min="1" ' +
                '                      :value="instruction.nwords" ' +
                '                      required ' +
                '                      placeholder="Enter nwords" ' +
                '                      :state="valid(instruction.nwords)" ' +
                '                      size="sm" ' +
                '                      title="Instruction size">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Number of fields: (Including co and cop)">' +
                '        <b-form-input type="text" ' +
                '                      min="1" ' +
                '                      :max="32 * instruction.nwords" ' +
                '                      :value="numfields" ' +
                '                      required ' +
                '                      placeholder="Enter number of fields" ' +
                '                      :state="valid(numfields)" ' +
                '                      size="sm" ' +
                '                      @change="changeNumfield(0)" ' +
                '                      title="Instruction fields">' +
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
                '                      v-model="numfields" ' +
                '                      title="Instruction fields"></b-form-input>' +
                '      </div>' +
                '' +
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
                '      <div v-if="isNaN(parseInt(numfields)) == false">' +
                '        <div v-for="i in parseInt(numfields)">' +
                '          <div class="col-lg-14 col-sm-14 row">' +
                '            <div class="col-lg-1 col-1 fields">' +
                '              <span class="h6">Field {{i-1}}</span>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                <b-form-input type="text" ' +
                '                              :value="instruction.fields[i-1].name" ' +
                '                              required ' +
                '                              :state="valid(instruction.fields[i-1].name)" ' +
                '                              size="sm" ' +
                '                              v-if="(i-1) != 0" ' +
                '                              title="Field name">' +
                '                </b-form-input>' +
                '                <b-form-input type="text" ' +
                '                              v-model="instruction.fields[i-1]=instruction.name.name" ' +
                '                              required ' +
                '                              size="sm" ' +
                '                              v-if="(i-1) == 0" ' +
                '                              disabled ' +
                '                              title="Field name">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                /*'            <div class="col-lg-2 col-2 fields">' +
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
                //'                  <option value="cop" :disabled="instruction.assignedCop!=false">cop</option>' +
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
                '                               :value="true"' +
                '                               v-model="instruction.separated[i-1]"' +
                '                               @change="changeToSeparateValue($event, i-1)"' +
                '                               v-if="fragmet_data.indexOf(instruction.fields[i-1].type) !== -1"' +
                '                               class="ml-3">' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields">' +
                '              <b-form-group>' +
                '                <b-form-input type="number" ' +
                '                              min="0" ' +
                '                              :max="32 * instruction.nwords - 1" ' +
                '                              :value="instruction.fields[i-1].startbit" ' +
                '                              required ' +
                '                              :state="valid(instruction.fields[i-1].startbit)" ' +
                '                              size="sm" ' +
                '                              v-if="typeof(instruction.fields[i-1].statbit) !== \'object\'" ' +
                '                              title="Field start bit">' +
                '                </b-form-input>' +
                '                <b-form-input v-else ' +
                '                              v-for="(j, ind) in instruction.fields[i-1].startbit"' +
                '                              type="number" ' +
                '                              min="0" ' +
                '                              :max="32 * instruction.nwords - 1"' +
                '                              :value="instruction.fields[i-1].startbit[ind]" ' +
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
                '                              :value="instruction.fields[i-1].stopbit" ' +
                '                              required ' +
                '                              :state="valid(instruction.field[i-1].stopbit)" ' +
                '                              size="sm"' +
                '                              v-if="typeof(instruction.field[i-1].stopbit) !== \'object\'"' +
                '                              title="Field end bit">' +
                '                </b-form-input>' +
                '                <b-form-input v-else ' +
                '                              v-for="(j, ind) in instruction.field[i-1].stopbit"' +
                '                              type="number" ' +
                '                              min="0" ' +
                '                              :max="32 * instruction.nwords - 1"' +
                '                              :value="instruction.field[i-1].stopbit[ind]" ' +
                '                              required' +
                '                              :state="valid(j)" ' +
                '                              size="sm"' +
                '                              class="mb-2"' +
                '                              title="Field end bit">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields" v-if="instruction.field[i-1].type == \'co\'">' +
                '              <b-form-group v-if="typeof(instruction.field[i-1].stopbit) !== \'object\'">' +
                '                <b-form-input type="text" ' +
                '                              :value="instruction.co" ' +
                '                              required ' +
                '                              :state="valid(instruction.co)" ' +
                '                              size="sm" ' +
                '                              title="Instruction CO">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '              <!--<b-form-group else v-for="(j, ind) in instruction.field[i-1].stopbit">' +
                '                <b-form-input type="text" ' +
                '                              :value="instruction.co[ind]" required ' +
                '                              :state="valid(instruction.co[ind])" ' +
                '                              size="sm">' +
                '                </b-form-input>-->' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields" v-if="instruction.field[i-1].stopbit == \'cop\'">' +
                '              <b-form-group>' +
                '                <b-form-input type="text" ' +
                '                              :value="instruction.fields[i-1].valueField" ' +
                '                              required ' +
                '                              :state="valid(instruction.fields[i-1].valueField)" ' +
                '                              size="sm" ' +
                '                              title="Field value">' +
                '                </b-form-input>' +
                '              </b-form-group>' +
                '            </div>' +
                '            <div class="col-lg-2 col-2 fields" v-if="instruction.separated[i-1]">' +
                '                <b-button variant="primary" ' +
                '                          @click="addMoreFieldsToSeparateValues($event, i-1)" ' +
                '                          size="sm">' +
                '                   + ' +
                '                </b-button>' +
                '                <b-button v-if="instruction.fields[i-1]startbit.length > 1" ' +
                '                          variant="danger" ' +
                '                          size="sm"  ' +
                '                          @click="lessFieldsToSeparateValues($event, i-1)">' +
                '                  - ' +
                '                </b-button>' +
                '            </div>' +*/
                '          </div>' +
                '        </div>' +
                '      </div>' +
                '    </div>' +
                '' +
                '    <!-- Page 3 -->' +
                '    <div id="editInstForm3" v-if="instruction_page == 3">' +
                '      <b-form-group label="Instruction Syntax Definition:">' +
                '        <b-form-input type="text" ' +
                '                      :value="instruction.signature_definition" ' +
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
                '                      :value="instruction.signature" ' +
                '                      disabled ' +
                '                      required ' +
                '                      size="sm" ' +
                '                      title="Detailed syntax">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '      <b-form-group label="Instruction Syntax:">' +
                '        <b-form-input type="text" ' +
                '                      :value="instruction.signatureRaw" ' +
                '                      disabled ' +
                '                      size="sm" ' +
                '                      title="Instruction syntax">' +
                '        </b-form-input>' +
                '      </b-form-group>' +
                '    </div>' +
                '' +
                '    <!-- Page 4 -->' +
                '    <div id="editInstForm4" v-if="instruction_page == 4">' +
                '      <b-form-group label="Assembly Definition:">' +
                '        <b-form-textarea :value="instruction.definition" ' +
                '                         placeholder="Example: reg1=reg2+reg3" ' +
                '                         :state="valid(instruction.definition)" ' +
                '                         :rows="4" ' +
                '                         title="Instruction Definition">' +
                '        </b-form-textarea>' +
                '      </b-form-group>' +
                '    </div>' +
                '' +
                '    <!-- Page 5 -->' +
                '    <div id="editInstForm5" v-if="instruction_page == 5">' +
                '      <b-form-group label="Assembly help:">' +
                '        <b-form-textarea :value="instruction.help" ' +
                '                          placeholder="Example: reg1=reg2+reg3" ' +
                '                          :rows="4" ' +
                '                          title="Instruction help">' +
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
                '</b-modal>'

  }

  Vue.component('instructions-edit', uielto_instructions_edit) ;