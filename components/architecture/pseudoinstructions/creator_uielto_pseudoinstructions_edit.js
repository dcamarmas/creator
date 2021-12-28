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

  var uielto_pseudoinstructions_edit = {

        props:      {
                      id:                             { type: String, required: true },
                      element:                        { type: Object, required: true },
                      pseudoinstruction:              { type: Object, required: true }
                      
                    },

        data:       function () {
                      return {
                        //Modal pagination
                        pseudoinstruction_page: 1,
                        pseudoinstruction_page_link: ['#Principal', '#Fields', '#Syntax', '#Definition', '#Help'],
                        //Show Modal
                        show_modal: false,
                      }
                    },

        methods:    {
                      //Check all fields of modify pseudoinstruction
                      edit_pseudoinstruction_verify(evt, inst, index){
                        evt.preventDefault();

                        for (var i = 0; i < this.pseudoinstruction.nameField.length; i++){
                          for (var j = i + 1; j < this.pseudoinstruction.nameField.length; j++){
                            if (this.pseudoinstruction.nameField[i] == this.pseudoinstruction.nameField[j]){
                              show_notification('Field name repeated', 'danger') ;
                              return;
                            }
                          }
                        }

                        var vacio = 0;

                        for (var i = 0; i < this.pseudoinstruction.numfields; i++) {
                          if(!this.pseudoinstruction.nameField[i] || !this.pseudoinstruction.typeField[i] || (!this.pseudoinstruction.startBitField[i] && this.pseudoinstruction.startBitField[i] != 0) || (!this.pseudoinstruction.stopBitField[i] && this.pseudoinstruction.stopBitField[i] != 0)){
                            vacio = 1;
                          }
                        }

                        var result = this.pseudoinstruction_definition_validator(inst, this.pseudoinstruction.definition, this.pseudoinstruction.nameField);

                        if(result == -1){
                          return;
                        }

                        if (!this.pseudoinstruction.name || !this.pseudoinstruction.nwords || !this.pseudoinstruction.numfields || !this.pseudoinstruction.signature_definition || !this.pseudoinstruction.definition || vacio == 1) {
                          show_notification('Please complete all fields', 'danger') ;
                        }
                        else {
                          this.edit_pseudoinstruction(inst, index);
                        }
                      },

                      //Edit the pseudoinstruction
                      edit_pseudoinstruction(comp, index){

                        this.show_modal = false;

                        architecture.pseudoinstructions[index].name = this.pseudoinstruction.name;
                        architecture.pseudoinstructions[index].nwords = this.pseudoinstruction.nwords;
                        architecture.pseudoinstructions[index].definition = this.pseudoinstruction.definition;
                        architecture.pseudoinstructions[index].signature_definition = this.pseudoinstruction.signature_definition;
                        architecture.pseudoinstructions[index].help = this.pseudoinstruction.help;

                        for (var j = 0; j < this.pseudoinstruction.numfields; j++){
                          if(j < architecture.pseudoinstructions[index].fields.length){
                            architecture.pseudoinstructions[index].fields[j].name = this.pseudoinstruction.nameField[j];
                            architecture.pseudoinstructions[index].fields[j].type = this.pseudoinstruction.typeField[j];
                            architecture.pseudoinstructions[index].fields[j].startbit = this.pseudoinstruction.startBitField[j];
                            architecture.pseudoinstructions[index].fields[j].stopbit = this.pseudoinstruction.stopBitField[j];
                          }
                          else{
                            var newField = {name: this.pseudoinstruction.nameField[j], type: this.pseudoinstruction.typeField[j], startbit: this.pseudoinstruction.startBitField[j], stopbit: this.pseudoinstruction.stopBitField[j]};
                            architecture.pseudoinstructions[index].fields.push(newField);
                          }
                        }

                        this.generate_signature();

                        var signature = this.pseudoinstruction.signature;
                        var signatureRaw = this.pseudoinstruction.signatureRaw;

                        architecture.pseudoinstructions[index].signature = signature;
                        architecture.pseudoinstructions[index].signatureRaw = signatureRaw;

                        if(architecture.pseudoinstructions[index].fields.length > this.pseudoinstruction.numfields){
                          architecture.pseudoinstructions[index].fields.splice(this.pseudoinstruction.numfields, (architecture.pseudoinstructions[i].fields.length - this.pseudoinstruction.numfields));
                        }
                      },

                      //Verify the pseudoinstruction definition
                      pseudoinstruction_definition_validator(name, definition, fields){
                        var re = new RegExp("^\n+");
                        definition = definition.replace(re, "");

                        re = new RegExp("\n+", "g");
                        definition = definition.replace(re, "");

                        var newDefinition = definition;

                        re = /{([^}]*)}/g;

                        var code = re.exec(definition);

                        if(code != null)
                        {
                          while(code != null)
                          {
                            console_log(code)
                            var instructions = code[1].split(";");
                            if (instructions.length == 1){
                                show_notification('Enter a ";" at the end of each line of code', 'danger') ;
                                return -1;
                            }

                            for (var j = 0; j < instructions.length-1; j++){
                              var re = new RegExp("^ +");
                              instructions[j] = instructions[j].replace(re, "");

                              re = new RegExp(" +", "g");
                              instructions[j] = instructions[j].replace(re, " ");

                              var instructionParts = instructions[j].split(" ");

                              var found = false;
                              for (var i = 0; i < architecture.instructions.length; i++){
                                if(architecture.instructions[i].name == instructionParts[0]){
                                  found = true;
                                  var numFields = 0;
                                  var regId = 0;

                                  signatureDef = architecture.instructions[i].signature_definition;
                                  signatureDef = signatureDef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                  re = new RegExp("[fF][0-9]+", "g");
                                  signatureDef = signatureDef.replace(re, "(.*?)");

                                  console_log(instructions[j])

                                  re = new RegExp(signatureDef+"$");
                                  if(instructions[j].search(re) == -1){
                                    show_notification('Incorrect signature --> ' + architecture.instructions[i].signatureRaw, 'danger') ;
                                    return -1;
                                  }

                                  re = new RegExp(signatureDef+"$");
                                  var match = re.exec(instructions[j]);
                                  var instructionParts = [];
                                  for(var z = 1; z < match.length; z++){
                                    instructionParts.push(match[z]);
                                  }

                                  re = new RegExp(",", "g");
                                  var signature = architecture.instructions[i].signature.replace(re, " ");

                                  re = new RegExp(signatureDef+"$");
                                  var match = re.exec(signature);
                                  var signatureParts = [];
                                  for(var j = 1; j < match.length; j++){
                                    signatureParts.push(match[j]);
                                  }

                                  console_log(instructionParts)
                                  console_log(signatureParts)

                                  for (var z = 1; z < signatureParts.length; z++){

                                    if(signatureParts[z] == "INT-Reg" || signatureParts[z] == "SFP-Reg" || signatureParts[z] == "DFP-Reg" ||signatureParts[z] == "Ctrl-Reg"){
                                      console_log("REG")
                                      var found = false;

                                      var id = -1;
                                      re = new RegExp("R[0-9]+");
                                      console_log(z)
                                      if(instructionParts[z].search(re) != -1){
                                        re = new RegExp("R(.*?)$");
                                        match = re.exec(instructionParts[z]);
                                        id = match[1];
                                      }

                                      for (var a = 0; a < architecture.components.length; a++){
                                        for (var b = 0; b < architecture.components[a].elements.length; b++){
                                          if(architecture.components[a].elements[b].name == instructionParts[z]){
                                            found = true;
                                          }
                                          if(architecture.components[a].type == "integer" && regId == id){
                                            found = true;
                                          }
                                          if(architecture.components[a].type == "integer"){
                                            regId++;
                                          }
                                        }
                                      }

                                      for (var b = 0; b < fields.length; b++){
                                        if(fields[b] == instructionParts[z]){
                                          found = true;
                                        }
                                      }

                                      if(!found){
                                        show_notification('Register ' + instructionParts[z] + ' not found', 'danger') ;
                                        return -1;
                                      }
                                    }

                                    if(signatureParts[z] == "inm-signed" || signatureParts[z] == "inm-unsigned" || signatureParts[z] == "offset_bytes" || signatureParts[z] == "offset_words"){
                                      var fieldsLength = architecture.instructions[i].fields[z].startbit - architecture.instructions[i].fields[z].stopbit + 1;
                                      if(instructionParts[z].match(/^0x/)){
                                        var value = instructionParts[z].split("x");
                                        if (isNaN(parseInt(instructionParts[z], 16)) == true){
                                            show_notification("Immediate number " + instructionParts[z] + " is not valid", 'danger') ;
                                            return -1;
                                        }

                                        if(value[1].length*4 > fieldsLength){
                                          show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                                          return -1;
                                        }
                                      }
                                      else if (instructionParts[z].match(/^(\d)+\.(\d)+/)){
                                        if(isNaN(parseFloat(instructionParts[z])) == true){
                                          show_notification("Immediate number " + instructionParts[z] + " is not valid", 'danger') ;
                                          return -1;
                                        }

                                        if(this.float2bin(parseFloat(instructionParts[z])).length > fieldsLength){
                                          show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                                          return -1;
                                        }
                                      }
                                      else if(isNaN(parseInt(instructionParts[z]))){

                                      }
                                      else {
                                        var numAux = parseInt(instructionParts[z], 10);
                                        if(isNaN(parseInt(instructionParts[z])) == true){
                                          show_notification("Immediate number " + instructionParts[z] + " is not valid", 'danger') ;
                                          return -1;
                                        }

                                        /*if((numAux.toString(2)).length > fieldsLength){
                                          show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                                          return -1;
                                        }*/

                                        var comNumPos = Math.pow(2, fieldsLength-1);
                                        var comNumNeg = comNumPos * (-1);
                                        comNumPos = comNumPos -1;

                                        console_log(comNumPos);
                                        console_log(comNumNeg);

                                        if(parseInt(instructionParts[z], 10) > comNumPos || parseInt(instructionParts[z], 10) < comNumNeg){
                                          show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                                          return -1;
                                        }
                                      }
                                    }

                                    if(signatureParts[z] == "address"){
                                      var fieldsLength = architecture.instructions[i].fields[z].startbit - architecture.instructions[i].fields[z].stopbit + 1;
                                      if(instructionParts[z].match(/^0x/)){
                                        var value = instructionParts[z].split("x");
                                        if(isNaN(parseInt(instructionParts[z], 16)) == true){
                                          show_notification("Address " + instructionParts[z] + " is not valid", 'danger') ;
                                          return -1;
                                        }

                                        if(value[1].length*4 > fieldsLength){
                                          show_notification("Address " + instructionParts[z] + " is too big", 'danger') ;
                                          return -1;
                                        }
                                      }
                                    }

                                    if(!found){
                                      show_notification('Register ' + instructionParts[z] + ' not found', 'danger') ;
                                      return -1;
                                    }
                                  }
                                }
                              }
                              if(!found){
                                show_notification('Instruction ' + instructions[j] + ' do not exists', 'danger') ;
                                return -1;
                              }
                            }

                            definition = definition.replace(code[0], "");

                            re = /{([^}]*)}/g;
                            code = re.exec(definition);
                          }
                        }
                        else{
                          var instructions = definition.split(";");
                          console_log(instructions.length)
                          if(instructions.length == 1){
                            show_notification('Enter a ";" at the end of each line of code', 'danger') ;
                            return -1;
                          }

                          for (var j = 0; j < instructions.length-1; j++){
                            var re = new RegExp("^ +");
                            instructions[j] = instructions[j].replace(re, "");

                            re = new RegExp(" +", "g");
                            instructions[j] = instructions[j].replace(re, " ");

                            var instructionParts = instructions[j].split(" ");

                            var found = false;
                            for (var i = 0; i < architecture.instructions.length; i++){
                              if(architecture.instructions[i].name == instructionParts[0]){
                                found = true;
                                var numFields = 0;
                                var regId = 0;

                                signatureDef = architecture.instructions[i].signature_definition;
                                signatureDef = signatureDef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                re = new RegExp("[fF][0-9]+", "g");
                                signatureDef = signatureDef.replace(re, "(.*?)");

                                console_log(instructions[j])

                                re = new RegExp(signatureDef+"$");
                                if(instructions[j].search(re) == -1){
                                  show_notification('Incorrect signature --> ' + architecture.instructions[i].signatureRaw, 'danger') ;
                                  return -1;
                                }

                                re = new RegExp(signatureDef+"$");
                                var match = re.exec(instructions[j]);
                                var instructionParts = [];
                                for(var z = 1; z < match.length; z++){
                                  instructionParts.push(match[z]);
                                }

                                re = new RegExp(",", "g");
                                var signature = architecture.instructions[i].signature.replace(re, " ");

                                re = new RegExp(signatureDef+"$");
                                var match = re.exec(signature);
                                var signatureParts = [];
                                for(var j = 1; j < match.length; j++){
                                  signatureParts.push(match[j]);
                                }

                                console_log(instructionParts)
                                console_log(signatureParts)

                                for (var z = 1; z < signatureParts.length; z++){

                                  if(signatureParts[z] == "INT-Reg" || signatureParts[z] == "SFP-Reg" || signatureParts[z] == "DFP-Reg" ||signatureParts[z] == "Ctrl-Reg"){
                                    console_log("REG")
                                    var found = false;

                                    var id = -1;
                                    re = new RegExp("R[0-9]+");
                                    console_log(z)
                                    if(instructionParts[z].search(re) != -1){
                                      re = new RegExp("R(.*?)$");
                                      match = re.exec(instructionParts[z]);
                                      id = match[1];
                                    }

                                    for (var a = 0; a < architecture.components.length; a++){
                                      for (var b = 0; b < architecture.components[a].elements.length; b++){
                                        if(architecture.components[a].elements[b].name == instructionParts[z]){
                                          found = true;
                                        }
                                        if(architecture.components[a].type == "integer" && regId == id){
                                          found = true;
                                        }
                                        if(architecture.components[a].type == "integer"){
                                          regId++;
                                        }
                                      }
                                    }

                                    for (var b = 0; b < fields.length; b++){
                                      if(fields[b] == instructionParts[z]){
                                        found = true;
                                      }
                                    }

                                    if(!found){
                                      show_notification('Register ' + instructionParts[z] + ' not found', 'danger') ;
                                      return -1;
                                    }
                                  }

                                  if(signatureParts[z] == "inm-signed" || signatureParts[z] == "inm-unsigned" || signatureParts[z] == "offset_bytes" || signatureParts[z] == "offset_words"){
                                    var fieldsLength = architecture.instructions[i].fields[z].startbit - architecture.instructions[i].fields[z].stopbit + 1;
                                    if(instructionParts[z].match(/^0x/)){
                                      var value = instructionParts[z].split("x");
                                      if(isNaN(parseInt(instructionParts[z], 16)) == true){
                                        show_notification("Immediate number " + instructionParts[z] + " is not valid", 'danger') ;
                                        return -1;
                                      }

                                      if(value[1].length*4 > fieldsLength){
                                        show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                                        return -1;
                                      }
                                    }
                                    else if (instructionParts[z].match(/^(\d)+\.(\d)+/)){
                                      if(isNaN(parseFloat(instructionParts[z])) == true){
                                        show_notification("Immediate number " + instructionParts[z] + " is not valid", 'danger') ;
                                        return -1;
                                      }

                                      if(this.float2bin(parseFloat(instructionParts[z])).length > fieldsLength){
                                        show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                                        return -1;
                                      }
                                    }
                                    else if(isNaN(parseInt(instructionParts[z]))){

                                    }
                                    else {
                                      var numAux = parseInt(instructionParts[z], 10);
                                      if(isNaN(parseInt(instructionParts[z])) == true){
                                        show_notification("Immediate number " + instructionParts[z] + " is not valid", 'danger') ;
                                        return -1;
                                      }

                                      /*if((numAux.toString(2)).length > fieldsLength){
                                        show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                                        return -1;
                                      }*/

                                      var comNumPos = Math.pow(2, fieldsLength-1);
                                      var comNumNeg = comNumPos * (-1);
                                      comNumPos = comNumPos -1;

                                      console_log(comNumPos);
                                      console_log(comNumNeg);

                                      if(parseInt(instructionParts[z], 10) > comNumPos || parseInt(instructionParts[z], 10) < comNumNeg){
                                        show_notification("Immediate number " + instructionParts[z] + " is too big", 'danger') ;
                                        return -1;
                                      }
                                    }
                                  }

                                  if(signatureParts[z] == "address"){
                                    var fieldsLength = architecture.instructions[i].fields[z].startbit - architecture.instructions[i].fields[z].stopbit + 1;
                                    if(instructionParts[z].match(/^0x/)){
                                      var value = instructionParts[z].split("x");
                                      if(isNaN(parseInt(instructionParts[z], 16)) == true){
                                        show_notification("Address " + instructionParts[z] + " is not valid", 'danger') ;
                                        return -1;
                                      }

                                      if(value[1].length*4 > fieldsLength){
                                        show_notification("Address " + instructionParts[z] + " is too big", 'danger') ;
                                        return -1;
                                      }
                                    }
                                  }

                                  if(!found){
                                    show_notification('Register ' + instructionParts[z] + ' not found', 'danger') ;
                                    return -1;
                                  }
                                }
                              }
                            }
                            if(!found){
                              show_notification('Instruction ' + instructions[j] + ' do not exists', 'danger') ;
                              return -1;
                            }
                          }
                        }

                        return 0;
                      },
                      

                      //Clean instruction form
                      clean_form(){
                        this.pseudoinstruction.name = '';
                        this.pseudoinstruction.type = '';
                        this.pseudoinstruction.co = '';
                        this.pseudoinstruction.cop = '';
                        this.pseudoinstruction.nwords = 1;
                        this.pseudoinstruction.numfields = "1";
                        this.pseudoinstruction.numfieldsAux = "1";
                        this.pseudoinstruction.nameField = [];
                        this.pseudoinstruction.properties = [];
                        this.pseudoinstruction.typeField = [];
                        this.pseudoinstruction.startBitField = [];
                        this.pseudoinstruction.stopBitField = [];
                        this.pseudoinstruction.valueField = [];
                        this.pseudoinstruction.separated = [];
                        this.pseudoinstruction.assignedCop = false;
                        this.pseudoinstruction.signature ='';
                        this.pseudoinstruction.signatureRaw = '';
                        this.pseudoinstruction.signature_definition = '';
                        this.pseudoinstruction.definition = '';
                        this.pseudoinstruction_page = 1;
                        this.pseudoinstruction.help = '';
                      },

                      generate_signature(){
                        var signature = this.pseudoinstruction.signature_definition;

                        var re = new RegExp("^ +");
                        this.pseudoinstruction.signature_definition = this.pseudoinstruction.signature_definition.replace(re, "");

                        re = new RegExp(" +", "g");
                        this.pseudoinstruction.signature_definition = this.pseudoinstruction.signature_definition.replace(re, " ");

                        re = new RegExp("^ +");
                        signature= signature.replace(re, "");

                        re = new RegExp(" +", "g");
                        signature = signature.replace(re, " ");

                        for (var z = 0; z < this.pseudoinstruction.numfields; z++) {
                          re = new RegExp("[Ff]"+z, "g");

                          signature = signature.replace(re, this.pseudoinstruction.typeField[z]);
                        }

                        re = new RegExp(" ", "g");
                        signature = signature.replace(re , ",");

                        var signatureRaw = this.pseudoinstruction.signature_definition;

                        re = new RegExp("^ +");
                        signatureRaw= signatureRaw.replace(re, "");

                        re = new RegExp(" +", "g");
                        signatureRaw = signatureRaw.replace(re, " ");

                        for (var z = 0; z < this.pseudoinstruction.numfields; z++) {
                          re = new RegExp("[Ff]"+z, "g");

                          signatureRaw = signatureRaw.replace(re, this.pseudoinstruction.nameField[z]);
                        }

                        this.pseudoinstruction.signature = signature;
                        this.pseudoinstruction.signatureRaw = signatureRaw;
                      },

                      //Verify new number of fields
                      change_number_fields(type){
                        if(type == 0){
                          if(this.pseudoinstruction.numfields > (this.pseudoinstruction.nwords * 32)){
                            this.pseudoinstruction.numfieldsAux = (this.pseudoinstruction.nwords * 32);
                            this.pseudoinstruction.numfields = (this.pseudoinstruction.nwords * 32);
                          }
                          else if(this.pseudoinstruction.numfields < 1){
                            this.pseudoinstruction.numfieldsAux = 1;
                            this.pseudoinstruction.numfields = 1;
                          }
                          else{
                            this.pseudoinstruction.numfieldsAux = this.pseudoinstruction.numfields;
                          }
                        }
                        if(type == 1){
                          if(this.pseudoinstruction.numfields > (this.pseudoinstruction.nwords * 32)){
                            this.pseudoinstruction.numfieldsAux = (this.pseudoinstruction.nwords * 32);
                            this.pseudoinstruction.numfields = (this.pseudoinstruction.nwords * 32);
                          }
                          else if(this.pseudoinstruction.numfields < 0){
                            this.pseudoinstruction.numfieldsAux = 0;
                            this.pseudoinstruction.numfields = 0;
                          }
                          else{
                            this.pseudoinstruction.numfieldsAux = this.pseudoinstruction.numfields;
                          }
                        }
                      },

                      //Pagination bar names
                      link_generator (pageNum) {
                        return this.pseudoinstruction_page_link[pageNum - 1]
                      },

                      page_generator (pageNum) {
                        return this.pseudoinstruction_page_link[pageNum - 1].slice(1)
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
                    '         title="Edit Pseudoinstruction" ' +
                    '         ok-title="Save" ' +
                    '         @ok="edit_pseudoinstruction_verify($event, element.element, element.index)" ' +
                    '         v-model="show_modal" ' +
                    '         @hidden="clean_form">' +
                    '  <b-form>' +
                    '' +
                    '    <!-- Page 1 -->' +
                    '    <div id="editPseudoinstForm1" v-if="pseudoinstruction_page == 1">' +
                    '      <b-form-group label="Name:">' +
                    '        <b-form-input type="text" ' +
                    '                      v-on:input="debounce(\'pseudoinstruction.name\', $event)" ' +
                    '                      :value="pseudoinstruction.name" ' +
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
                    '                      v-on:input="debounce(\'pseudoinstruction.nwords\', $event)" ' +
                    '                      :value="pseudoinstruction.nwords" ' +
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
                    '                      min="1" ' +
                    '                      :max="32 * pseudoinstruction.nwords" ' +
                    '                      v-on:input="debounce(\'pseudoinstruction.numfields\', $event)" ' +
                    '                      :value="pseudoinstruction.numfields" ' +
                    '                      required ' +
                    '                      placeholder="Enter number of fields" ' +
                    '                      :state="valid(pseudoinstruction.numfields)" ' +
                    '                      size="sm" ' +
                    '                      @change="change_number_fields(1)" ' +
                    '                      title="Pseudoinstruction fields">' +
                    '        </b-form-input>' +
                    '      </b-form-group>' +
                    '' +
                    '      <div class="d-none">' +
                    '        <b-form-input type="text" ' +
                    '                      v-model="pseudoinstruction.numfieldsAux" ' +
                    '                      title="Pseudoinstruction fields">' +
                    '        </b-form-input>' +
                    '      </div>' +
                    '    </div>' +
                    '' +
                    '    <!-- Page 2 -->' +
                    '    <div id="editPseudoinstForm2" v-if="pseudoinstruction_page == 2">' +
                    '      <div class="col-lg-12 col-sm-12 row">' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          ' +
                    '        </div>' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          <span class="h6">Name:</span>' +
                    '        </div>' +
                    '        <div class="col-lg-2 col-2 fields">' +
                    '          <span class="h6">Type</span>' +
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
                    '      <div v-if="isNaN(parseInt(pseudoinstruction.numfieldsAux)) == false"> ' +
                    '        <div v-for="i in parseInt(pseudoinstruction.numfieldsAux)">' +
                    '          <div class="col-lg-12 col-sm-12 row">' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <span class="h6">Field {{i-1}}</span>' +
                    '            </div>' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="text" ' +
                    '                              v-on:input="debounce(\'pseudoinstruction.nameField[\'+i+\'-1]\', $event)" ' +
                    '                              :value="pseudoinstruction.nameField[i-1]" ' +
                    '                              required ' +
                    '                              state="valid(pseudoinstruction.nameField[i-1])" ' +
                    '                              size="sm" ' +
                    '                              title="Field name">' +
                    '                </b-form-input>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-select v-model="pseudoinstruction.typeField[i-1]" ' +
                    '                               required ' +
                    '                               :state="valid(pseudoinstruction.typeField[i-1])" ' +
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
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="number" ' +
                    '                              min="0" ' +
                    '                              :max="32 * pseudoinstruction.nwords - 1" ' +
                    '                              v-on:input="debounce(\'pseudoinstruction.startBitField[\'+i+\'-1]\', $event)" ' +
                    '                              :value="pseudoinstruction.startBitField[i-1]" ' +
                    '                              required ' +
                    '                              :state="valid(pseudoinstruction.startBitField[i-1])" ' +
                    '                              size="sm" ' +
                    '                              title="Field start bit">' +
                    '                </b-form-input>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '            <div class="col-lg-2 col-2 fields">' +
                    '              <b-form-group>' +
                    '                <b-form-input type="number" ' +
                    '                              min="0" ' +
                    '                              :max="32 * pseudoinstruction.nwords - 1" ' +
                    '                              v-on:input="debounce(\'pseudoinstruction.stopBitField[\'+i+\'-1]\', $event)" ' +
                    '                              :value="pseudoinstruction.stopBitField[i-1]" ' +
                    '                              required ' +
                    '                              :state="valid(pseudoinstruction.stopBitField[i-1])" ' +
                    '                              size="sm" ' +
                    '                              title="Field end bit">' +
                    '                </b-form-input>' +
                    '              </b-form-group>' +
                    '            </div>' +
                    '          </div>' +
                    '        </div>' +
                    '      </div>' +
                    '    </div>' +
                    '' +
                    '    <!-- Page 3 -->' +
                    '    <div id="editPseudoinstForm3" v-if="pseudoinstruction_page == 3">' +
                    '      <b-form-group label="Pseudoinstruction Syntax Definition:">' +
                    '        <b-form-input type="text" ' +
                    '                      v-on:input="debounce(\'pseudoinstruction.signature_definition\', $event)" ' +
                    '                      :value="pseudoinstruction.signature_definition" ' +
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
                    '                      v-on:input="debounce(\'pseudoinstruction.signature\', $event)" ' +
                    '                      :value="pseudoinstruction.signature" ' +
                    '                      disabled ' +
                    '                      required ' +
                    '                      size="sm" ' +
                    '                      title="Detailed syntax">' +
                    '        </b-form-input>' +
                    '      </b-form-group>' +
                    '      <b-form-group label="Pseudoinstruction Syntax:">' +
                    '        <b-form-input type="text" ' +
                    '                      v-on:input="debounce(\'pseudoinstruction.signatureRaw\', $event)" ' +
                    '                      :value="pseudoinstruction.signatureRaw" ' +
                    '                      disabled ' +
                    '                      size="sm" ' +
                    '                      title="Pseudoinstruction syntax">' +
                    '        </b-form-input>' +
                    '      </b-form-group>' +
                    '    </div>' +
                    '' +
                    '    <!-- Page 4 -->' +
                    '    <div id="editPseudoinstForm4" v-if="pseudoinstruction_page == 4">' +
                    '      <b-form-group label="Pseudoinstruction Definition:">' +
                    '        <b-form-textarea v-on:input="debounce(\'pseudoinstruction.definition\', $event)" ' +
                    '                         :value="pseudoinstruction.definition" ' +
                    '                         placeholder="Example: add reg1 reg0 reg2" ' +
                    '                         :state="valid(pseudoinstruction.definition)" ' +
                    '                         :rows="4" ' +
                    '                         title="Pseudoinstruction Definition">' +
                    '        </b-form-textarea>' +
                    '      </b-form-group>' +
                    '    </div>' +
                    '' +
                    '    <!-- Page 5 -->' +
                    '    <div id="editPseudoinstForm5" v-if="pseudoinstruction_page == 5">' +
                    '      <b-form-group label="Pseudoinstruction Help:">' +
                    '        <b-form-textarea v-on:input="debounce(\'pseudoinstruction.help\', $event)" ' +
                    '                         :value="pseudoinstruction.help" ' +
                    '                         placeholder="Example: r3 = r1 + r2" ' +
                    '                         :rows="4" ' +
                    '                         title="Pseudoinstruction help">' +
                    '        </b-form-textarea>' +
                    '      </b-form-group>' +
                    '    </div>' +
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