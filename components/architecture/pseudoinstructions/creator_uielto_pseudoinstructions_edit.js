
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

  var uielto_pseudoinstructions_edit = {

        props:      {
                      id:                             { type: String, required: true },
                      title:                          { type: String, required: true },
                      index:                          { type: Number, required: true },
                      pseudoinstruction:              { type: Object, required: true },
                      number_fields:                  { type: Number, required: true }
                      
                    },

        data:       function () {
                      return {
                        //Pseudoinstruction field number
                        number_fields: "0",

                        //Modal pagination
                        pseudoinstruction_page: 1,
                        pseudoinstruction_page_link: ['#Principal', '#Fields', '#Syntax', '#Definition', '#Help'],

                        //Show Modal
                        show_modal: false,
                      }
                    },

        methods:    {
                      //Check all fields of modify pseudoinstruction
                      edit_pseudoinstruction_verify(evt)
                      {
                        evt.preventDefault();
                        var empty = 0;

                        //Verify pseudoinstruction fields
                        for (var i = 0; i < this._props.number_fields; i++)
                        {
                          for (var j = i + 1; j < this._props.number_fields; j++)
                          {
                            if (this._props.pseudoinstruction.fields[i].name == this._props.pseudoinstruction.fields[j].name)
                            {
                              show_notification('Field name repeated', 'danger') ;
                              return;
                            }
                          }

                          if(!this._props.pseudoinstruction.fields[i].name || !this._props.pseudoinstruction.fields[i].type)
                          {
                            empty = 1;
                          }
                        }

                        //Verify empty fields
                        if (!this._props.pseudoinstruction.name || !this._props.pseudoinstruction.nwords || !this._props.pseudoinstruction.signature_definition || !this._props.pseudoinstruction.definition || empty === 1) {
                          show_notification('Please complete all fields', 'danger');
                          return;
                        }

                        //Precompile definition code
                        var result = this.pseudoinstruction_definition_validator(this._props.pseudoinstruction.name, this._props.pseudoinstruction.definition, this._props.pseudoinstruction.fields);
                        if(result == -1){
                          return;
                        }

                        this.edit_pseudoinstruction();
                      },

                      

                      //Edit the pseudoinstruction
                      edit_pseudoinstruction()
                      {
                        this.show_modal = false;

                        //Generate new signature
                        this.generate_signature();

                        Object.assign(architecture.pseudoinstructions[this._props.index], this._props.pseudoinstruction);

                        show_notification('Pseudoinstruction correctly modified', 'success') ;
                      },

                      //Verify the pseudoinstruction definition
                      pseudoinstruction_definition_validator(name, definition, fields) //TODO: improve like new compiler
                      {

                        //Clean definition
                        var re = new RegExp("^\n+");
                        definition = definition.replace(re, "");

                        re = new RegExp("\n+", "g");
                        definition = definition.replace(re, "");

                        re = /{([^}]*)}/g;
                        var code = re.exec(definition);

                        //Verify definition
                        if(code != null)
                        {
                          while(code != null)
                          {
                            var instructions = code[1].split(";");
                            if (instructions.length === 1)
                            {
                              show_notification('Enter a ";" at the end of each line of code', 'danger') ;
                              return -1;
                            }

                            for (var j = 0; j < instructions.length-1; j++)
                            {
                              //Clean instruction
                              var re = new RegExp("^ +");
                              instructions[j] = instructions[j].replace(re, "");

                              re = new RegExp(" +", "g");
                              instructions[j] = instructions[j].replace(re, " ");

                              re = new RegExp(",", "g");
                              instructions[j] = instructions[j].replace(re, "");

                              var instruction_parts = instructions[j].split(" ");

                              var found = false;
                              for (var i = 0; i < architecture.instructions.length; i++)
                              {
                                if(architecture.instructions[i].name == instruction_parts[0])
                                {
                                  found = true;
                                  var number_fields = 0;
                                  var reg_id = 0;

                                  signature_def = architecture.instructions[i].signature_definition;
                                  signature_def = signature_def.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                  re = new RegExp("[fF][0-9]+", "g");
                                  signature_def = signature_def.replace(re, "(.*?)");

                                  console_log(instructions[j])

                                  re = new RegExp(signature_def+"$");
                                  if(instructions[j].search(re) == -1)
                                  {
                                    show_notification('Incorrect signature --> ' + architecture.instructions[i].signatureRaw, 'danger') ;
                                    return -1;
                                  }

                                  re = new RegExp(signature_def+"$");
                                  var match = re.exec(instructions[j]);
                                  var instruction_parts = [];
                                  for(var z = 1; z < match.length; z++){
                                    instruction_parts.push(match[z]);
                                  }

                                  re = new RegExp(",", "g");
                                  var signature = architecture.instructions[i].signature.replace(re, " ");

                                  re = new RegExp(signature_def+"$");
                                  var match = re.exec(signature);
                                  var signature_parts = [];
                                  for(var j = 1; j < match.length; j++){
                                    signature_parts.push(match[j]);
                                  }

                                  console_log(instruction_parts)
                                  console_log(signature_parts)

                                  for (var z = 1; z < signature_parts.length; z++)
                                  {
                                    if(signature_parts[z] == "INT-Reg" || signature_parts[z] == "SFP-Reg" || signature_parts[z] == "DFP-Reg" ||signature_parts[z] == "Ctrl-Reg")
                                    {
                                      console_log("REG")
                                      var found = false;

                                      var id = -1;
                                      re = new RegExp("R[0-9]+");
                                      console_log(z)
                                      if(instruction_parts[z].search(re) != -1)
                                      {
                                        re = new RegExp("R(.*?)$");
                                        match = re.exec(instruction_parts[z]);
                                        id = match[1];
                                      }

                                      for (var a = 0; a < architecture.components.length; a++)
                                      {
                                        for (var b = 0; b < architecture.components[a].elements.length; b++)
                                        {
                                          if(architecture.components[a].elements[b].name.includes(instruction_parts[z]))
                                          {
                                            found = true;
                                          }
                                          if(architecture.components[a].type == "int_registers" && reg_id == id){
                                            found = true;
                                          }
                                          if(architecture.components[a].type == "int_registers"){
                                            reg_id++;
                                          }
                                        }
                                      }

                                      for (var b = 0; b < fields.length; b++)
                                      {
                                        if(fields[b].name == instruction_parts[z]){
                                          found = true;
                                        }
                                      }

                                      if(!found)
                                      {
                                        show_notification('Register ' + instruction_parts[z] + ' not found', 'danger') ;
                                        return -1;
                                      }
                                    }

                                    if(signature_parts[z] == "inm-signed" || signature_parts[z] == "inm-unsigned" || signature_parts[z] == "offset_bytes" || signature_parts[z] == "offset_words")
                                    {
                                      //var field_length = architecture.instructions[i].fields[z].startbit - architecture.instructions[i].fields[z].stopbit + 1;
                                      if(instruction_parts[z].match(/^0x/))
                                      {
                                        var value = instruction_parts[z].split("x");
                                        if (isNaN(parseInt(instruction_parts[z], 16)) === true)
                                        {
                                          show_notification("Immediate number " + instruction_parts[z] + " is not valid", 'danger') ;
                                          return -1;
                                        }

                                        /*if(value[1].length*4 > field_length)
                                        {
                                          show_notification("Immediate number " + instruction_parts[z] + " is too big", 'danger') ;
                                          return -1;
                                        }*/
                                      }
                                      else if (instruction_parts[z].match(/^(\d)+\.(\d)+/))
                                      {
                                        if(isNaN(parseFloat(instruction_parts[z])) === true)
                                        {
                                          show_notification("Immediate number " + instruction_parts[z] + " is not valid", 'danger') ;
                                          return -1;
                                        }

                                        /*if(this.float2bin(parseFloat(instruction_parts[z])).length > field_length)
                                        {
                                          show_notification("Immediate number " + instruction_parts[z] + " is too big", 'danger') ;
                                          return -1;
                                        }*/
                                      }
                                      else if(isNaN(parseInt(instruction_parts[z]))){

                                      }
                                      else 
                                      {
                                        var aux_num = parseInt(instruction_parts[z], 10);
                                        if(isNaN(parseInt(instruction_parts[z])) === true)
                                        {
                                          show_notification("Immediate number " + instruction_parts[z] + " is not valid", 'danger') ;
                                          return -1;
                                        }

                                        /*var num_positive = Math.pow(2, field_length-1);
                                        var num_negative = num_positive * (-1);
                                        num_positive = num_positive -1;

                                        console_log(num_positive);
                                        console_log(num_negative);

                                        if(parseInt(instruction_parts[z], 10) > num_positive || parseInt(instruction_parts[z], 10) < num_negative)
                                        {
                                          show_notification("Immediate number " + instruction_parts[z] + " is too big", 'danger') ;
                                          return -1;
                                        }*/
                                      }
                                    }

                                    if(signature_parts[z] == "address")
                                    {
                                      //var field_length = architecture.instructions[i].fields[z].startbit - architecture.instructions[i].fields[z].stopbit + 1;
                                      if(instruction_parts[z].match(/^0x/))
                                      {
                                        var value = instruction_parts[z].split("x");
                                        if(isNaN(parseInt(instruction_parts[z], 16)) === true)
                                        {
                                          show_notification("Address " + instruction_parts[z] + " is not valid", 'danger') ;
                                          return -1;
                                        }

                                        /*if(value[1].length*4 > field_length)
                                        {
                                          show_notification("Address " + instruction_parts[z] + " is too big", 'danger') ;
                                          return -1;
                                        }*/
                                      }
                                    }

                                    if(!found)
                                    {
                                      show_notification('Register ' + instruction_parts[z] + ' not found', 'danger') ;
                                      return -1;
                                    }
                                  }
                                }
                              }
                              if(!found)
                              {
                                show_notification('Instruction ' + instructions[j] + ' do not exists', 'danger') ;
                                return -1;
                              }
                            }

                            definition = definition.replace(code[0], "");

                            re = /{([^}]*)}/g;
                            code = re.exec(definition);
                          }
                        }
                        else
                        {
                          var instructions = definition.split(";");
                          console_log(instructions.length)
                          if(instructions.length === 1)
                          {
                            show_notification('Enter a ";" at the end of each line of code', 'danger') ;
                            return -1;
                          }

                          for (var j = 0; j < instructions.length-1; j++)
                          {
                            var re = new RegExp("^ +");
                            instructions[j] = instructions[j].replace(re, "");

                            re = new RegExp(" +", "g");
                            instructions[j] = instructions[j].replace(re, " ");

                            re = new RegExp(",", "g");
                            instructions[j] = instructions[j].replace(re, "");

                            var instruction_parts = instructions[j].split(" ");

                            var found = false;
                            for (var i = 0; i < architecture.instructions.length; i++)
                            {
                              if(architecture.instructions[i].name == instruction_parts[0])
                              {
                                found = true;
                                var number_fields = 0;
                                var reg_id = 0;

                                signature_def = architecture.instructions[i].signature_definition;
                                signature_def = signature_def.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                re = new RegExp("[fF][0-9]+", "g");
                                signature_def = signature_def.replace(re, "(.*?)");

                                console_log(instructions[j])

                                re = new RegExp(signature_def+"$");
                                if(instructions[j].search(re) == -1)
                                {
                                  show_notification('Incorrect signature --> ' + architecture.instructions[i].signatureRaw, 'danger') ;
                                  return -1;
                                }

                                re = new RegExp(signature_def+"$");
                                var match = re.exec(instructions[j]);
                                var instruction_parts = [];
                                for(var z = 1; z < match.length; z++)
                                {
                                  instruction_parts.push(match[z]);
                                }

                                re = new RegExp(",", "g");
                                var signature = architecture.instructions[i].signature.replace(re, " ");

                                re = new RegExp(signature_def+"$");
                                var match = re.exec(signature);
                                var signature_parts = [];
                                for(var j = 1; j < match.length; j++){
                                  signature_parts.push(match[j]);
                                }

                                console_log(instruction_parts)
                                console_log(signature_parts)

                                for (var z = 1; z < signature_parts.length; z++){

                                  if(signature_parts[z] == "INT-Reg" || signature_parts[z] == "SFP-Reg" || signature_parts[z] == "DFP-Reg" ||signature_parts[z] == "Ctrl-Reg")
                                  {
                                    console_log("REG")
                                    var found = false;

                                    var id = -1;
                                    re = new RegExp("R[0-9]+");
                                    console_log(z)
                                    if(instruction_parts[z].search(re) != -1)
                                    {
                                      re = new RegExp("R(.*?)$");
                                      match = re.exec(instruction_parts[z]);
                                      id = match[1];
                                    }

                                    for (var a = 0; a < architecture.components.length; a++)
                                    {
                                      for (var b = 0; b < architecture.components[a].elements.length; b++)
                                      {
                                        if(architecture.components[a].elements[b].name.includes(instruction_parts[z]))
                                        {
                                          found = true;
                                        }
                                        if(architecture.components[a].type == "int_registers" && reg_id == id){
                                          found = true;
                                        }
                                        if(architecture.components[a].type == "int_registers"){
                                          reg_id++;
                                        }
                                      }
                                    }

                                    for (var b = 0; b < fields.length; b++)
                                    {
                                      if(fields[b].name == instruction_parts[z]){
                                        found = true;
                                      }
                                    }

                                    if(!found){
                                      show_notification('Register ' + instruction_parts[z] + ' not found', 'danger') ;
                                      return -1;
                                    }
                                  }

                                  if(signature_parts[z] == "inm-signed" || signature_parts[z] == "inm-unsigned" || signature_parts[z] == "offset_bytes" || signature_parts[z] == "offset_words")
                                  {
                                    //var field_length = architecture.instructions[i].fields[z].startbit - architecture.instructions[i].fields[z].stopbit + 1;
                                    if(instruction_parts[z].match(/^0x/))
                                    {
                                      var value = instruction_parts[z].split("x");
                                      if(isNaN(parseInt(instruction_parts[z], 16)) === true)
                                      {
                                        show_notification("Immediate number " + instruction_parts[z] + " is not valid", 'danger') ;
                                        return -1;
                                      }

                                      /*if(value[1].length*4 > field_length)
                                      {
                                        show_notification("Immediate number " + instruction_parts[z] + " is too big", 'danger') ;
                                        return -1;
                                      }*/
                                    }
                                    else if (instruction_parts[z].match(/^(\d)+\.(\d)+/))
                                    {
                                      if(isNaN(parseFloat(instruction_parts[z])) === true)
                                      {
                                        show_notification("Immediate number " + instruction_parts[z] + " is not valid", 'danger') ;
                                        return -1;
                                      }

                                      /*if(this.float2bin(parseFloat(instruction_parts[z])).length > field_length)
                                      {
                                        show_notification("Immediate number " + instruction_parts[z] + " is too big", 'danger') ;
                                        return -1;
                                      }*/
                                    }
                                    else if(isNaN(parseInt(instruction_parts[z]))){

                                    }
                                    else 
                                    {
                                      var aux_num = parseInt(instruction_parts[z], 10);
                                      if(isNaN(parseInt(instruction_parts[z])) === true)
                                      {
                                        show_notification("Immediate number " + instruction_parts[z] + " is not valid", 'danger') ;
                                        return -1;
                                      }

                                      /*var num_positive = Math.pow(2, field_length-1);
                                      var num_negative = num_positive * (-1);
                                      num_positive = num_positive -1;

                                      console_log(num_positive);
                                      console_log(num_negative);

                                      if(parseInt(instruction_parts[z], 10) > num_positive || parseInt(instruction_parts[z], 10) < num_negative){
                                        show_notification("Immediate number " + instruction_parts[z] + " is too big", 'danger') ;
                                        return -1;
                                      }*/
                                    }
                                  }

                                  if(signature_parts[z] == "address")
                                  {
                                    //var field_length = architecture.instructions[i].fields[z].startbit - architecture.instructions[i].fields[z].stopbit + 1;
                                    if(instruction_parts[z].match(/^0x/))
                                    {
                                      var value = instruction_parts[z].split("x");
                                      if(isNaN(parseInt(instruction_parts[z], 16)) == true)
                                      {
                                        show_notification("Address " + instruction_parts[z] + " is not valid", 'danger') ;
                                        return -1;
                                      }

                                      /*if(value[1].length*4 > field_length)
                                      {
                                        show_notification("Address " + instruction_parts[z] + " is too big", 'danger') ;
                                        return -1;
                                      }*/
                                    }
                                  }

                                  if(!found)
                                  {
                                    show_notification('Register ' + instruction_parts[z] + ' not found', 'danger') ;
                                    return -1;
                                  }
                                }
                              }
                            }
                            if(!found)
                            {
                              show_notification('Instruction ' + instructions[j] + ' do not exists', 'danger') ;
                              return -1;
                            }
                          }
                        }

                        return 0;
                      },

                      //Verify new number of fields
                      change_number_fields()
                      {
                        //Top limit
                        if(this._props.number_fields > (this._props.pseudoinstruction.nwords * 32)){
                          this._props.number_fields = (this._props.pseudoinstruction.nwords * 32);
                        }

                        //Lower limit
                        if(this._props.number_fields < 0){
                          this._props.number_fields = 0;
                        }

                        //Add fields
                        if(this._props.number_fields > this._props.pseudoinstruction.fields.length)
                        {
                          var diff = this._props.number_fields - this._props.pseudoinstruction.fields.length;
                          for (var i = 0; i < diff; i++)
                          {
                            var new_field = {name: '', type: ''};
                            this._props.pseudoinstruction.fields.push(new_field);
                          }
                        }

                        //Delete fields
                        if(this._props.number_fields < this._props.pseudoinstruction.fields.length)
                        {
                          var diff = this._props.pseudoinstruction.fields.length - this._props.number_fields;
                          for (var i = 0; i < diff; i++) {
                            this._props.pseudoinstruction.fields.splice(-1,1);
                          }
                        }
                      },

                      //Generate the different pseudoinstruction signature
                      generate_signature(){
                        var signature = this._props.pseudoinstruction.signature_definition;

                        //Signature definition cleaning
                        var re = new RegExp("^ +");
                        this._props.pseudoinstruction.signature_definition= this._props.pseudoinstruction.signature_definition.replace(re, "");

                        re = new RegExp(" +", "g");
                        this._props.pseudoinstruction.signature_definition = this._props.pseudoinstruction.signature_definition.replace(re, " ");

                        re = new RegExp(",", "g");
                        this._props.pseudoinstruction.signature_definition = this._props.pseudoinstruction.signature_definition.replace(re, "");

                        //New signature generation
                        re = new RegExp("^ +");
                        signature= signature.replace(re, "");

                        re = new RegExp(" +", "g");
                        signature = signature.replace(re, " ");

                        re = new RegExp(",", "g");
                        signature = signature.replace(re, "");

                        for (var i = 0; i < this._props.number_fields; i++)
                        {
                          re = new RegExp("[Ff]"+i, "g");
                          signature = signature.replace(re, this._props.pseudoinstruction.fields[i].type);
                        }

                        re = new RegExp(" ", "g");
                        signature = signature.replace(re , ",");

                        //New raw signature generation
                        var signatureRaw = this._props.pseudoinstruction.signature_definition;

                        re = new RegExp("^ +");
                        signatureRaw= signatureRaw.replace(re, "");

                        re = new RegExp(" +", "g");
                        signatureRaw = signatureRaw.replace(re, " ");

                        re = new RegExp(",", "g");
                        signatureRaw = signatureRaw.replace(re, "");

                        for (var i = 0; i < this._props.number_fields; i++)
                        {
                          re = new RegExp("[Ff]"+i, "g");
                          signatureRaw = signatureRaw.replace(re, this._props.pseudoinstruction.fields[i].name);
                        }

                        this._props.pseudoinstruction.signature = signature;
                        this._props.pseudoinstruction.signatureRaw = signatureRaw;
                      },


                      /*******************/
                      /* Modal Functions */
                      /*******************/

                      //Pagination bar names
                      link_generator (pageNum)
                      {
                        return this.pseudoinstruction_page_link[pageNum - 1]
                      },

                      page_generator (pageNum)
                      {
                        return this.pseudoinstruction_page_link[pageNum - 1].slice(1)
                      },

                      //Set original values into the form
                      reset_form()
                      {
                        this.pseudoinstruction_page = 1;
                      },

                      //Form validator
                      valid(value)
                      {
                        if(parseInt(value) !== 0)
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
                      }
                    },

        template:   '<b-modal :id ="id" ' +
                    '         size="lg" ' +
                    '         :title="title" ' +
                    '         ok-title="Save" ' +
                    '         @ok="edit_pseudoinstruction_verify" ' +
                    '         v-model="show_modal" ' +
                    '         @hidden="reset_form">' +
                    '  <b-form>' +
                    '' +
                    '    <!-- Page 1 -->' +
                    '    <div id="editPseudoinstForm1" v-if="pseudoinstruction_page == 1">' +
                    '      <b-form-group label="Name:">' +
                    '        <b-form-input type="text" ' +
                    '                      v-model="pseudoinstruction.name" ' +
                    '                      required ' +
                    '                      placeholder="Enter name" ' +
                    '                      :state="valid(pseudoinstruction.name)" ' +
                    '                      size="sm" ' +
                    '                      title="Pseudoinstruction name">' +
                    '        </b-form-input>' +
                    '      </b-form-group>' +
                    '' +
                    '      <b-form-group label="Number of Words:">' +
                    '        <b-form-input type="number" ' +
                    '                      min="1" ' +
                    '                      v-model="pseudoinstruction.nwords" ' +
                    '                      required ' +
                    '                      placeholder="Enter nwords" ' +
                    '                      :state="valid(pseudoinstruction.nwords)" ' +
                    '                      size="sm" ' +
                    '                      title="Pseudoinstruction size">' +
                    '        </b-form-input>' +
                    '      </b-form-group>' +
                    '' +
                    '      <b-form-group label="Number of fields: ">' +
                    '        <b-form-input type="text" ' +
                    '                      min="0" ' +
                    '                      :max="32 * pseudoinstruction.nwords" ' +
                    '                      v-model="number_fields" ' +
                    '                      required ' +
                    '                      placeholder="Enter number of fields" ' +
                    '                      :state="valid(number_fields)" ' +
                    '                      size="sm" ' +
                    '                      @change="change_number_fields(1)" ' +
                    '                      title="Pseudoinstruction fields">' +
                    '        </b-form-input>' +
                    '      </b-form-group>' +
                    '    </div>' +
                    '' +
                    '    <!-- Page 2 -->' +
                    '    <div id="newPseudoinstForm2" v-if="pseudoinstruction_page == 2">' +
                    '      <div class="col-lg-12 col-sm-12 row">' +
                    '        <div class="col-lg-4 col-4 fields">' +
                    '          ' +
                    '        </div>' +
                    '        <div class="col-lg-4 col-4 fields">' +
                    '          <span class="h6">Name:</span>' +
                    '        </div>' +
                    '        <div class="col-lg-4 col-4 fields">' +
                    '          <span class="h6">Type</span>' +
                    '        </div>' +
                    '      </div>' +
                    '' +
                    '      <div v-if="isNaN(parseInt(number_fields)) == false">' +
                    '        <div v-for="i in parseInt(number_fields)">' +
                    '          <div class="col-lg-12 col-sm-12 row">' +
                    '            <div class="col-lg-4 col-4 fields">' +
                    '              <span class="h6">Field {{i-1}}</span>' +
                    '            </div>' +
                    '            <div class="col-lg-4 col-4 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="text" ' +
                    '                              v-model="pseudoinstruction.fields[i-1].name" ' +
                    '                              required ' +
                    '                              :state="valid(pseudoinstruction.fields[i-1].name)" ' +
                    '                              size="sm" ' +
                    '                              title="Filed name">' +
                    '                </b-form-input>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '            <div class="col-lg-4 col-4 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-select v-model="pseudoinstruction.fields[i-1].type" ' +
                    '                               required ' +
                    '                               :state="valid(pseudoinstruction.fields[i-1].type)" ' +
                    '                               size="sm"' +
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
                    '                </b-form-select>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '          </div>' +
                    '        </div>' +
                    '      </div>' +
                    '    </div>' +
                    '    <!-- Page 3 -->' +
                    '    <div id="editPseudoinstForm3" v-if="pseudoinstruction_page == 3">' +
                    '      <b-form-group label="Pseudoinstruction Syntax Definition:">' +
                    '        <b-form-input type="text" ' +
                    '                      v-model="pseudoinstruction.signature_definition" ' +
                    '                      placeholder="Example: move $F0 $F1" ' +
                    '                      required ' +
                    '                      :state="valid(pseudoinstruction.signature_definition)" ' +
                    '                      v-on:change="generate_signature()" ' +
                    '                      size="sm" ' +
                    '                      title="Syntax">' +
                    '        </b-form-input>' +
                    '      </b-form-group>' +
                    '      <b-form-group label="Detailed Syntax:">' +
                    '        <b-form-input type="text" ' +
                    '                      v-model="pseudoinstruction.signature" ' +
                    '                      disabled ' +
                    '                      required ' +
                    '                      size="sm" ' +
                    '                      title="Detailed syntax">' +
                    '        </b-form-input>' +
                    '      </b-form-group>' +
                    '      <b-form-group label="Pseudoinstruction Syntax:">' +
                    '        <b-form-input type="text" ' +
                    '                      v-model="pseudoinstruction.signatureRaw" ' +
                    '                      disabled ' +
                    '                      size="sm" ' +
                    '                      title="Pseudoinstruction syntax">' +
                    '        </b-form-input>' +
                    '      </b-form-group>' +
                    '    </div>' +
                    '' +
                    '    <!-- Page 4 -->' +
                    '    <div id="newPseudoinstForm4" v-if="pseudoinstruction_page == 4">' +
                    '      <b-form-group label="Pseudoinstruction Definition:">' +
                    '        <b-form-textarea v-model="pseudoinstruction.definition" ' +
                    '                         placeholder="Example: add reg1 reg0 reg2" ' +
                    '                         :state="valid(pseudoinstruction.definition)" ' +
                    '                         :rows="4" ' +
                    '                         title="Pseudoinstruction Definition">' +
                    '        </b-form-textarea>' +
                    '      </b-form-group>' +
                    '    </div>' +
                    '' +
                    '    <!-- Page 5 -->' +
                    '    <div id="newPseudoinstForm5" v-if="pseudoinstruction_page == 5">' +
                    '      <b-form-group label="Pseudoinstruction help:">' +
                    '        <b-form-textarea v-model="pseudoinstruction.help" ' +
                    '                         placeholder="Example: r3 = r1 + r2" ' +
                    '                         :rows="4" ' +
                    '                         title="Pseudoinstruction help">' +
                    '        </b-form-textarea>' +
                    '      </b-form-group>' +
                    '    </div>' +
                    '' +
                    '  </b-form>' +
                    '  <hr>' +
                    '  <b-pagination-nav size="sm" ' +
                    '                    align="center" ' +
                    '                    base-url="#" ' +
                    '                    :number-of-pages="5" ' +
                    '                    v-model="pseudoinstruction_page" ' +
                    '                    :link-gen="link_generator" ' +
                    '                    :page-gen="page_generator">' +
                    '  </b-pagination-nav>' +
                    '</b-modal>'

  }

  Vue.component('pseudoinstructions-edit', uielto_pseudoinstructions_edit) ;