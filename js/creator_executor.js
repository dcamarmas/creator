/*
 *  Copyright 2018-2020 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

function packExecute ( error, err_msg, err_type, draw )
{
    var ret = {} ;

    ret.error    = error ;
    ret.msg      = err_msg ;
    ret.type     = err_type ;
    ret.draw     = draw ;

    return ret ;
}

function executeInstruction ( )
{
  var draw = {
                space:   [],
                info:    [],
                success: [],
                danger:  [],
                flash:   []
              } ;

  console_log(mutexRead);
  newExecution = false;

  do {
    console_log(executionIndex);
    console_log(architecture.components[0].elements[0].value);

    if (instructions.length == 0) {
        return packExecute(true, 'No instructions in memory', 'danger', null);
    }
    if (executionIndex < -1) {
        return packExecute(true, 'The program has finished', 'danger', null);
    }
    if (executionIndex == -1) {
        return packExecute(true, 'The program has finished with errors', 'danger', null);
    }
    else if (mutexRead == true) {
             return packExecute(false, '', 'info', null);
         }

    /*Search a main tag*/
    if (executionInit == 1) 
    {
        for (var i = 0; i < instructions.length; i++) {
          if (instructions[i].Label == "main") {
              //draw.success.push(executionIndex) ;
              architecture.components[0].elements[0].value = bi_intToBigInt(instructions[i].Address, 10);
              executionInit = 0;
              break;
          }
          else if(i == instructions.length-1){
            executionIndex = -1;
            return packExecute(true, 'Label "main" not found', 'danger', null);
          }
        }
    }

    var error = 0;
    var index;

    for (var i = 0; i < instructions.length; i++)
    {
      if (parseInt(instructions[i].Address, 16) == architecture.components[0].elements[0].value) {
          executionIndex = i;

          console_log(instructions[executionIndex].hide)
          console_log(executionIndex)
          console_log(instructions[i].Address)

          if (instructions[executionIndex].hide == false) {
              draw.info.push(executionIndex);
          }
        }
        else{
          if (instructions[executionIndex].hide == false) {
              draw.space.push(i);
          }
        }
    }

    var instructionExec = instructions[executionIndex].loaded;
    var instructionExecParts = instructionExec.split(' ');

    var signatureDef;
    var signatureParts;
    var signatureRawParts;
    var nwords;
    var auxDef;
    var binary;

    /*Search the instruction to execute*/
    for (var i = 0; i < architecture.instructions.length; i++) {
      var auxSig = architecture.instructions[i].signatureRaw.split(' ');
      var type;
      var auxIndex;

      var coStartbit;
      var coStopbit;

      var numCop = 0;
      var numCopCorrect = 0;

      for (var y = 0; y < architecture.instructions[i].fields.length; y++) {
      	if(architecture.instructions[i].fields[y].type == "co"){
					coStartbit = 31 - parseInt(architecture.instructions[i].fields[y].startbit);
      		coStopbit = 32 - parseInt(architecture.instructions[i].fields[y].stopbit);
      	}
      }

      if(architecture.instructions[i].co == instructionExecParts[0].substring(coStartbit,coStopbit)){
        if(architecture.instructions[i].cop != null && architecture.instructions[i].cop != ''){
          for (var j = 0; j < architecture.instructions[i].fields.length; j++){
            if (architecture.instructions[i].fields[j].type == "cop") {
              numCop++;
              if(architecture.instructions[i].fields[j].valueField == instructionExecParts[0].substring(((architecture.instructions[i].nwords*31) - architecture.instructions[i].fields[j].startbit), ((architecture.instructions[i].nwords*32) - architecture.instructions[i].fields[j].stopbit))){
                numCopCorrect++;
              }
            }
          }
          if(numCop == numCopCorrect){
            auxDef = architecture.instructions[i].definition;
            nwords = architecture.instructions[i].nwords;
            binary = true;
            auxIndex = i;
            break;
          }
        }
        else{
          auxDef = architecture.instructions[i].definition;
          nwords = architecture.instructions[i].nwords;
          binary = true;
          type = architecture.instructions[i].type;
          auxIndex = i;
          break;
        }
      }

      if(architecture.instructions[i].name == instructionExecParts[0] && instructionExecParts.length == auxSig.length){
        type = architecture.instructions[i].type;
        signatureDef = architecture.instructions[i].signature_definition;

        signatureDef = signatureDef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        re = new RegExp("[fF][0-9]+", "g");
        signatureDef = signatureDef.replace(re, "(.*?)");

        re = new RegExp(",", "g");
        var signature = architecture.instructions[i].signature.replace(re, " ");

        re = new RegExp(signatureDef+"$");
        var match = re.exec(signature);
        var signatureParts = [];
        for(var j = 1; j < match.length; j++){
          signatureParts.push(match[j]);
        }

        match = re.exec(architecture.instructions[i].signatureRaw);
        var signatureRawParts = [];
        for(var j = 1; j < match.length; j++){
          signatureRawParts.push(match[j]);
        }

        console_log(signatureParts);
        console_log(signatureRawParts);

        auxDef = architecture.instructions[i].definition;
        nwords = architecture.instructions[i].nwords;
        binary = false;
        break;
      }
    }

    /*Increase PC*/
    architecture.components[0].elements[0].value = architecture.components[0].elements[0].value + bi_intToBigInt(nwords * 4,10) ;
    console_log(auxDef);

    // preload
    if (typeof instructions[executionIndex].preload === "undefined"){

      if(binary == false){
        re = new RegExp(signatureDef+"$");
        var match = re.exec(instructionExec);
        instructionExecParts = [];

        for(var j = 1; j < match.length; j++){
          instructionExecParts.push(match[j]);
        }

        console_log(instructionExecParts);

        /*Replace the value with the name of the register*/
        for (var i = 1; i < signatureRawParts.length; i++){
          /*if(signatureParts[i] == "inm"){
            var re = new RegExp(signatureRawParts[i],"g");
            auxDef = auxDef.replace(re, "bi_intToBigInt(" + instructionExecParts[i] + ",10)");
          }
          else{
            var re = new RegExp(signatureRawParts[i],"g");
            auxDef = auxDef.replace(re, instructionExecParts[i]);
          }*/

          var re1 = new RegExp('([^A-Za-z])'+signatureRawParts[i]+'([^A-Za-z])');
          var re2 = new RegExp('^'+signatureRawParts[i]+'([^A-Za-z])');
          var re3 = new RegExp('([^A-Za-z])'+signatureRawParts[i]+'$');

          var prevSearchIndex;

          console_log(re1);
          console_log(re2);
          console_log(re3);

          while(auxDef.search(re1) != -1 || auxDef.search(re2) != -1 || auxDef.search(re3) != -1 && (auxDef.search(re1) != prevSearchIndex || auxDef.search(re2) != prevSearchIndex || auxDef.search(re3) != prevSearchIndex)){
            console_log(signatureRawParts[i])
            if(signatureParts[i] == "INT-Reg" || signatureParts[i] == "SFP-Reg" || signatureParts[i] == "DFP-Reg" || signatureParts[i] == "Ctrl-Reg"){
              re = new RegExp("[0-9]{" + instructionExecParts[i].length + "}");
              if(instructionExecParts[i].search(re) != -1){
                var re = new RegExp('([^A-Za-z])'+signatureRawParts[i]+'([^A-Za-z])');

                if (auxDef.search(re) != -1){
                  match = re.exec(auxDef);
                  console_log(match)
                  auxDef = auxDef.replace(re, match[1] + "R" + instructionExecParts[i] + match[2]);
                }

                var re = new RegExp('^'+signatureRawParts[i]+'([^A-Za-z])');

                if (auxDef.search(re) != -1){
                  match = re.exec(auxDef);
                  console_log(match)
                  auxDef = auxDef.replace(re,"R" + instructionExecParts[i] + match[1]);
                }

                var re = new RegExp('([^A-Za-z])'+signatureRawParts[i]+'$');

                if (auxDef.search(re) != -1){
                  match = re.exec(auxDef);
                  console_log(match)
                  auxDef = auxDef.replace(re, match[1] + "R" + instructionExecParts[i]);
                }
              }
              else{
                var re = new RegExp('([^A-Za-z])'+signatureRawParts[i]+'([^A-Za-z])');

                if (auxDef.search(re) != -1){
                  match = re.exec(auxDef);
                  console_log(match)
                  auxDef = auxDef.replace(re, match[1] + instructionExecParts[i] + match[2]);
                }

                var re = new RegExp('^'+signatureRawParts[i]+'([^A-Za-z])');

                if (auxDef.search(re) != -1){
                  match = re.exec(auxDef);
                  console_log(match)
                  auxDef = auxDef.replace(re, instructionExecParts[i] + match[1]);
                }

                var re = new RegExp('([^A-Za-z])'+signatureRawParts[i]+'$');

                if (auxDef.search(re) != -1){
                  match = re.exec(auxDef);
                  console_log(match)
                  auxDef = auxDef.replace(re, match[1] + instructionExecParts[i]);
                }
              }
            }
            else{
              var re = new RegExp('([^A-Za-z])'+signatureRawParts[i]+'([^A-Za-z])');

              if (auxDef.search(re) != -1){
                prevSearchIndex = auxDef.search(re);
                match = re.exec(auxDef);
                console_log(match)
                auxDef = auxDef.replace(re, match[1] + instructionExecParts[i] + match[2]);
              }

              var re = new RegExp('^'+signatureRawParts[i]+'([^A-Za-z])');

              if (auxDef.search(re) != -1){
                prevSearchIndex = auxDef.search(re);
                match = re.exec(auxDef);
                console_log(match)
                auxDef = auxDef.replace(re, instructionExecParts[i] + match[1]);
              }

              var re = new RegExp('([^A-Za-z])'+signatureRawParts[i]+'$');

              if (auxDef.search(re) != -1){
                prevSearchIndex = auxDef.search(re);
                match = re.exec(auxDef);
                console_log(match)
                auxDef = auxDef.replace(re, match[1] + instructionExecParts[i]);
              }
            }
            var re1 = new RegExp('([^A-Za-z])'+signatureRawParts[i]+'([^A-Za-z])');
            var re2 = new RegExp('^'+signatureRawParts[i]+'([^A-Za-z])');
            var re3 = new RegExp('([^A-Za-z])'+signatureRawParts[i]+'$');
          }
        }
      }

      if(binary == true){
        console_log("Binary");

        for (var j = 0; j < architecture.instructions[auxIndex].fields.length; j++){
          console_log(instructionExecParts[0]);
          console_log(architecture.instructions[auxIndex].fields.length);
          if(architecture.instructions[auxIndex].fields[j].type == "INT-Reg" || architecture.instructions[auxIndex].fields[j].type == "SFP-Reg" || architecture.instructions[auxIndex].fields[j].type == "DFP-Reg" || architecture.instructions[auxIndex].fields[j].type == "Ctrl-Reg") {
            console_log(instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit)));

            for (var z = 0; z < architecture.components.length; z++){
              console_log(architecture.components[z].type)
              if(architecture.components[z].type == "control" && architecture.instructions[auxIndex].fields[j].type == "Ctrl-Reg"){
                for (var w = 0; w < architecture.components[z].elements.length; w++){
                  var auxLength = ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit) - ((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit);
                  console_log(auxLength);
                  console_log((w.toString(2)).padStart(auxLength, "0"));
                  if((w.toString(2)).padStart(auxLength, "0") == instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))){

                  }
                }
              }
              if(architecture.components[z].type == "integer" && architecture.instructions[auxIndex].fields[j].type == "INT-Reg"){
                for (var w = 0; w < architecture.components[z].elements.length; w++){
                  var auxLength = ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit) - ((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit);
                  console_log(auxLength);
                  console_log((w.toString(2)).padStart(auxLength, "0"));
                  if((w.toString(2)).padStart(auxLength, "0") == instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))){
                    var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
                    auxDef = auxDef.replace(re, architecture.components[z].elements[w].name);
                  }
                }
              }
              if(architecture.components[z].type == "floating point" && architecture.components[z].double_precision == false && architecture.instructions[auxIndex].fields[j].type == "SFP-Reg"){
                for (var w = 0; w < architecture.components[z].elements.length; w++){
                  var auxLength = ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit) - ((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit);
                  console_log(auxLength);
                  console_log((w.toString(2)).padStart(auxLength, "0"));
                  if((w.toString(2)).padStart(auxLength, "0") == instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))){
                    var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
                    auxDef = auxDef.replace(re, architecture.components[z].elements[w].name);
                  }
                }
              }
              if(architecture.components[z].type == "floating point" && architecture.components[z].double_precision == true && architecture.instructions[auxIndex].fields[j].type == "DFP-Reg"){
                for (var w = 0; w < architecture.components[z].elements.length; w++){
                  var auxLength = ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit) - ((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit);
                  console_log(auxLength);
                  console_log((w.toString(2)).padStart(auxLength, "0"));
                  if((w.toString(2)).padStart(auxLength, "0") == instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))){
                    var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
                    auxDef = auxDef.replace(re, architecture.components[z].elements[w].name);
                  }
                }
              }
            }
          }
          /*if(architecture.instructions[auxIndex].fields[j].type == "inm-signed"){
            var value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
            var valueSign = value.charAt(0);
            var newValue =  value.padStart(32, valueSign) ;
            newValue = parseInt(newValue, 2) ;
            var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
            auxDef = auxDef.replace(re, newValue >> 0);
          }*/
          if(architecture.instructions[auxIndex].fields[j].type == "inm-signed"){
          	var value = "";
          	if(architecture.instructions[auxIndex].separated && architecture.instructions[auxIndex].separated[j] == true){
          		for (var sep_index = 0; sep_index < architecture.instructions[auxIndex].fields[j].startbit.length; sep_index++) {
          			value = value + instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit[sep_index]), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit[sep_index]))
          		}
          	}
          	else{
          		value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
          	}
          	var valueSign = value.charAt(0);
            var newValue =  value.padStart(32, valueSign) ;
            newValue = parseInt(newValue, 2) ;
            var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
            auxDef = auxDef.replace(re, newValue >> 0);
          }
          /*if(architecture.instructions[auxIndex].fields[j].type == "inm-unsigned"){
            var value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
            newValue = parseInt(newValue, 2) ;
            var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
            auxDef = auxDef.replace(re, newValue >> 0);
          }*/
          if(architecture.instructions[auxIndex].fields[j].type == "inm-unsigned"){
          	var value = "";
          	if(architecture.instructions[auxIndex].separated && architecture.instructions[auxIndex].separated[j] == true){
          		for (var sep_index = 0; sep_index < architecture.instructions[auxIndex].fields[j].startbit.length; sep_index++) {
          			value = value + instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit[sep_index]), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit[sep_index]))
          		}
          	}
          	else{
          		value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
          	}
            newValue = parseInt(newValue, 2) ;
            var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
            auxDef = auxDef.replace(re, newValue >> 0);
          }
          /*if(architecture.instructions[auxIndex].fields[j].type == "address"){
            var value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
            var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
            auxDef = auxDef.replace(re, parseInt(value, 2));
          }*/
          if(architecture.instructions[auxIndex].fields[j].type == "address"){
						var value = "";
          	if(architecture.instructions[auxIndex].separated && architecture.instructions[auxIndex].separated[j] == true){
          		for (var sep_index = 0; sep_index < architecture.instructions[auxIndex].fields[j].startbit.length; sep_index++) {
          			value = value + instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit[sep_index]), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit[sep_index]))
          		}
          	}
          	else{
          		value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
          	}
          	var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
            auxDef = auxDef.replace(re, parseInt(value, 2));
          }
          /*if(architecture.instructions[auxIndex].fields[j].type == "offset_words"){
            var value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
            var valueSign = value.charAt(0);
            var newValue =  value.padStart(32, valueSign) ;
            newValue = parseInt(newValue, 2) ;
//danger
            var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
            auxDef = auxDef.replace(re, newValue >> 0);
          }*/
					if(architecture.instructions[auxIndex].fields[j].type == "offset_words"){
						var value = "";
          	if(architecture.instructions[auxIndex].separated && architecture.instructions[auxIndex].separated[j] == true){
          		for (var sep_index = 0; sep_index < architecture.instructions[auxIndex].fields[j].startbit.length; sep_index++) {
          			value = value + instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit[sep_index]), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit[sep_index]))
          		}
          	}
          	else{
          		value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
          	}
          	var valueSign = value.charAt(0);
            var newValue =  value.padStart(32, valueSign) ;
            newValue = parseInt(newValue, 2) ;
//danger
            var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
            auxDef = auxDef.replace(re, newValue >> 0);
          }
          /*if(architecture.instructions[auxIndex].fields[j].type == "offset_bytes"){
            var value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
            var valueSign = value.charAt(0);
            var newValue =  value.padStart(32, valueSign) ;
            newValue = parseInt(newValue, 2) ;
//danger
            var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
            auxDef = auxDef.replace(re, newValue >> 0);
          }*/
          if(architecture.instructions[auxIndex].fields[j].type == "offset_bytes"){
            var value = "";
          	if(architecture.instructions[auxIndex].separated &&  architecture.instructions[auxIndex].separated[j] == true){
          		for (var sep_index = 0; sep_index < architecture.instructions[auxIndex].fields[j].startbit.length; sep_index++) {
          			value = value + instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit[sep_index]), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit[sep_index]))
          		}
          	}
          	else{
          		value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
          	}
          	var valueSign = value.charAt(0);
            var newValue =  value.padStart(32, valueSign) ;
            newValue = parseInt(newValue, 2) ;
//danger
            var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
            auxDef = auxDef.replace(re, newValue >> 0);
          }
        }
      }

      console_log(auxDef);

      /*Syscall*/
      var compIndex;
      var elemIndex;
      var compIndex2;
      var elemIndex2;

      console_log(auxDef);

      re = /print_int\((.*?)\)/;
      if (auxDef.search(re) != -1){
        match = re.exec(auxDef);
        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(match[1] == architecture.components[i].elements[j].name){
              compIndex = i;
              elemIndex = j;
            }
          }
        }
        auxDef = auxDef.replace(re, "syscall('print_int',"+compIndex+" , "+elemIndex+", null, null, true)");
      }

      re = /print_float\((.*?)\)/;
      if (auxDef.search(re) != -1){
        match = re.exec(auxDef);
        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(match[1] == architecture.components[i].elements[j].name){
              compIndex = i;
              elemIndex = j;
            }
          }
        }
        auxDef = auxDef.replace(re, "syscall('print_float',"+compIndex+" , "+elemIndex+", null, null, true)");
      }


      re = /print_double\((.*?)\)/;
      if (auxDef.search(re) != -1){
        match = re.exec(auxDef);
        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(match[1] == architecture.components[i].elements[j].name){
              compIndex = i;
              elemIndex = j;
            }
          }
        }
        auxDef = auxDef.replace(re, "syscall('print_double',"+compIndex+" , "+elemIndex+", null, null, true)");
      }

      re = /print_string\((.*?)\)/;
      if (auxDef.search(re) != -1){
        match = re.exec(auxDef);
        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(match[1] == architecture.components[i].elements[j].name){
              compIndex = i;
              elemIndex = j;
            }
          }
        }
        auxDef = auxDef.replace(re, "syscall('print_string',"+compIndex+" , "+elemIndex+", null, null, true)");
      }

      re = /read_int\((.*?)\)/;
      if (auxDef.search(re) != -1){
        match = re.exec(auxDef);
        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(match[1] == architecture.components[i].elements[j].name){
              compIndex = i;
              elemIndex = j;
            }
          }
        }
        auxDef = auxDef.replace(re, "syscall('read_int',"+compIndex+" , "+elemIndex+", null, null, true)");
      }

      re = /read_float\((.*?)\)/;
      if (auxDef.search(re) != -1){
        match = re.exec(auxDef);
        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(match[1] == architecture.components[i].elements[j].name){
              compIndex = i;
              elemIndex = j;
            }
          }
        }
        auxDef = auxDef.replace(re, "syscall('read_float',"+compIndex+" , "+elemIndex+", null, null, true)");
      }

      re = /read_double\((.*?)\)/;
      if (auxDef.search(re) != -1){
        match = re.exec(auxDef);
        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(match[1] == architecture.components[i].elements[j].name){
              compIndex = i;
              elemIndex = j;
            }
          }
        }
        auxDef = auxDef.replace(re, "syscall('read_double',"+compIndex+" , "+elemIndex+", null, null, true)");
      }

      re = /read_string\((.*?)\)/;
      if (auxDef.search(re) != -1){
        match = re.exec(auxDef);
        re = new RegExp(" ", "g");
        match[1] = match[1].replace(re, "");


        var auxMatch = match[1].split(',');

        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(auxMatch[0] == architecture.components[i].elements[j].name){
              compIndex = i;
              elemIndex = j;
            }
          }
        }

        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(auxMatch[1] == architecture.components[i].elements[j].name){
              compIndex2 = i;
              elemIndex2 = j;
            }
          }
        }
        re = /read_string\((.*?)\)/
        auxDef = auxDef.replace(re, "syscall('read_string',"+compIndex+" , "+elemIndex+","+compIndex2+" , "+elemIndex2+", true)");
      }

      re = /sbrk\((.*?)\)/
      if (auxDef.search(re) != -1){
        match = re.exec(auxDef);
        re = new RegExp(" ", "g");
        match[1] = match[1].replace(re, "");


        var auxMatch = match[1].split(',');

        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(auxMatch[0] == architecture.components[i].elements[j].name){
              compIndex = i;
              elemIndex = j;
            }
          }
        }

        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(auxMatch[1] == architecture.components[i].elements[j].name){
              compIndex2 = i;
              elemIndex2 = j;
            }
          }
        }
        re = /sbrk\((.*?)\)/
        auxDef = auxDef.replace(re, "syscall('sbrk',"+compIndex+" , "+elemIndex+","+compIndex2+" , "+elemIndex2+", true)");
      }

      re = /exit\((.*?)\)/;
      auxDef = auxDef.replace(re, "syscall('exit', null, null, null, null)");

      re = /print_char\((.*?)\)/;
      if (auxDef.search(re) != -1){
        match = re.exec(auxDef);
        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(match[1] == architecture.components[i].elements[j].name){
              compIndex = i;
              elemIndex = j;
            }
          }
        }
        auxDef = auxDef.replace(re, "syscall('print_char',"+compIndex+" , "+elemIndex+", null, null, true)");
      }

      re = /read_char\((.*?)\)/
      if (auxDef.search(re) != -1){
        match = re.exec(auxDef);
        for (var i = 0; i < architecture.components.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if(match[1] == architecture.components[i].elements[j].name){
              compIndex = i;
              elemIndex = j;
            }
          }
        }
        auxDef = auxDef.replace(re, "syscall('read_char',"+compIndex+" , "+elemIndex+", null, null, true)");
      }

      console_log(auxDef);

      /*Divides a double into two parts*/
      re = /splitDouble\((.*)\)/;
      while (auxDef.search(re) != -1){
        var match = re.exec(auxDef);
        match[1] = match[1].replace(";", ",");
        auxDef = auxDef.replace(re, "divDouble(" + match [1] + ")");
      }

      console_log(auxDef);

      /*Replaces the name of the register with its variable*/
      var regIndex = 0;
      var regNum = 0;

      for (var i = 0; i < architecture.components.length; i++){
        if(architecture.components[i].type == "integer"){
          regNum = architecture.components[i].elements.length-1;
        }
        for (var j = architecture.components[i].elements.length-1; j >= 0; j--){
          /*TODO: Conflicto RISC-V*/
          var re;
          let myMatch, isMatch=false;
          /*Write in the register*/

           /*TODO: Conflicto RISC-V*/

          re = new RegExp( "(?:\\W|^)(((" + architecture.components[i].elements[j].name+") *=)[^=])", "g");
          while ((myMatch = re.exec(auxDef)) != null) {
              auxDef = auxDef.replace(myMatch[2], "reg"+regIndex + "=")
              auxDef = "var reg"+ regIndex +"= null\n"+ auxDef+"\nwriteRegister(reg"+ regIndex+", "+i+", "+j+");";
              myMatch.index=0;
              isMatch = true;
          }  
    if (isMatch) regIndex++;

		/*    re = new RegExp(architecture.components[i].elements[j].name+" *=[^=]");
          if (auxDef.search(re) != -1){
            re = new RegExp(architecture.components[i].elements[j].name+" *=","g");

            auxDef = auxDef.replace(re, "reg"+ regIndex+"=");
            auxDef = "var reg" + regIndex + "=null;\n" + auxDef;
            auxDef = auxDef + "\n writeRegister(reg"+regIndex+","+i+" ,"+j+");"
            regIndex++;
          }
	  */


          if(architecture.components[i].type == "integer"){
            re = new RegExp("R"+regNum+" *=[^=]");
            if (auxDef.search(re) != -1){
              re = new RegExp("R"+regNum+" *=","g");
              auxDef = auxDef.replace(re, "var reg"+ regIndex+"=");
              auxDef = "var reg" + regIndex + "=null\n" + auxDef;
              auxDef = auxDef + "\n writeRegister(reg"+regIndex+","+i+" ,"+j+");"
              regIndex++;
            }
          }

          /*Read in the register*/
          re = new RegExp("([^a-zA-Z0-9])" + architecture.components[i].elements[j].name + "(?!\.name)");
          while(auxDef.search(re) != -1){
            var match = re.exec(auxDef);
            auxDef = auxDef.replace(re, match[1] + "readRegister("+i+" ,"+j+")");
          }

          if(architecture.components[i].type == "integer"){
            re = new RegExp("R"+regNum+"[^0-9]|[\\s]","g");
            if(auxDef.search(re) != -1){
              re = new RegExp("R"+regNum,"g");
              auxDef = auxDef.replace(re, "readRegister("+i+" ,"+j+")");
            }
          }

          if(architecture.components[i].type == "integer"){
            regNum--;
          }
        }
      }

      /*Leave the name of the register*/
      re = new RegExp("\.name","g");
      auxDef = auxDef.replace(re, "");

      console_log(auxDef);

      /*Check if stack limit was modify*/
      re = /check_stack_limit\((.*)\)/;
      if (auxDef.search(re) != -1){
        var match = re.exec(auxDef);
        var args = match[1].split(";");
        re = new RegExp(" +", "g");
        for (var i = 0; i < args.length; i++) {
          args[i] = args[i].replace(re, "");
        }
        re = /check_stack_limit\((.*)\)/;
        auxDef = auxDef.replace(re, "");
        auxDef = auxDef + "\n\nif('"+args[0]+"'=='"+args[1]+"'){\n\tif(("+args[2]+") != architecture.memory_layout[4].value){\n\t\twriteStackLimit("+args[2]+")\n\t}\n}";
      }

      console_log(auxDef);

      /*Check if stack limit was modify*/
      re = /assert\((.*)\)/;
      if (auxDef.search(re) != -1){
        var match = re.exec(auxDef);
        var args = match[1].split(";");
        auxDef = auxDef.replace(re, "");
        auxDef = "var exception = 0;\nif("+ args[0] +"){}else{exception=app.exception("+ args[1] +");}\nif(exception==0){" + auxDef + "}";
      }

      console_log(auxDef);

      /*Write in memory*/
      re = /MP.([whbd]).\[(.*?)\] *=/;
      while (auxDef.search(re) != -1){
        var match = re.exec(auxDef);
        var auxDir;
        //eval("auxDir="+match[2]);

        re = /MP.[whbd].\[(.*?)\] *=/;
        auxDef = auxDef.replace(re, "dir=");
        auxDef = "var dir=null\n" + auxDef;
        auxDef = auxDef + "\n writeMemory(dir"+","+match[2]+",'"+match[1]+"');"
        re = /MP.([whb]).\[(.*?)\] *=/;
      }

      re = new RegExp("MP.([whbd]).(.*?) *=");
      while (auxDef.search(re) != -1){
        var match = re.exec(auxDef);
        re = new RegExp("MP."+match[1]+"."+match[2]+" *=");
        auxDef = auxDef.replace(re, "dir=");
        auxDef = "var dir=null\n" + auxDef;
        auxDef = auxDef + "\n writeMemory(dir,"+match[2]+",'"+match[1]+"');"
        re = new RegExp("MP.([whbd]).(.*?) *=");
      }

      re = /MP.([whbd]).\[(.*?)\]/;
      while (auxDef.search(re) != -1){
        var match = re.exec(auxDef);
        var auxDir;
        //eval("auxDir="+match[2]);
        re = /MP.[whbd].\[(.*?)\]/;
        auxDef = auxDef.replace(re, "readMemory("+match[2]+", '"+match[1]+"')");
        re = /MP.([whbd]).\[(.*?)\]/;
      }

      re = new RegExp("MP.([whbd]).([0-9]*[a-z]*[0-9]*)");
      while (auxDef.search(re) != -1){
        var match = re.exec(auxDef);
        re = new RegExp("MP."+match[1]+"."+match[2]);
        auxDef = auxDef.replace(re, "readMemory("+match[2]+",'"+match[1]+"')");
        re = new RegExp("MP.([whb]).([0-9]*[a-z]*[0-9]*)");
      }

      console_log(auxDef);

      // preload instruction
			eval("instructions[" + executionIndex + "].preload = function(elto) { " + 
	        "try {\n" +
	           auxDef.replace(/this./g,"elto.") + "\n" +
	        "}\n" +
	        "catch(e){\n" +
	        "  return e;\n" +
        	"}\n" +
	        " }; ") ;        
    }


    try{
      var result = instructions[executionIndex].preload(this);
      if (result.error) {
          return result;
      }
    }
    catch(e)
    {
        if (e instanceof SyntaxError) 
        {
            console_log("Error");
            error = 1;
            draw.danger.push(executionIndex) ;
            executionIndex = -1;
            return packExecute(true, 'The definition of the instruction contains errors, please review it', 'danger', null);
        }
    }

    /*Refresh stats*/
    for (var i = 0; i < stats.length; i++){
      if(type == stats[i].type){
        stats[i].number_instructions++;
        stats_value[i] ++;
        totalStats++;
        if (typeof app !== "undefined")
            app._data.totalStats++;
      }
    }
    for (var i = 0; i < stats.length; i++){
         stats[i].percentage = ((stats[i].number_instructions/totalStats)*100).toFixed(2);
    }

    /*Execution error*/
    if (executionIndex == -1){
       error = 1;
       return packExecute(false, '', 'info', null); //CHECK
       //return;
    }

    /*Next instruction to execute*/
    if (error != 1 && executionIndex < instructions.length)
    {
      for (var i = 0; i < instructions.length; i++){
        if (parseInt(instructions[i].Address, 16) == architecture.components[0].elements[0].value) {
            executionIndex = i;
            draw.success.push(executionIndex) ;
            break;
        }
        else if (i == instructions.length-1 && mutexRead == true){
                 executionIndex = instructions.length+1;
        }
        else if (i == instructions.length-1){
                 draw.space.push(executionIndex) ;
                 executionIndex = instructions.length+1;
        }
      }
    }

    if (executionIndex >= instructions.length && mutexRead == true)
    {
      for (var i = 0; i < instructions.length; i++) {
        draw.space.push(i);
      }
      draw.info=[];
      return packExecute(false, 'The execution of the program has finished', 'success', draw); //CHECK
    }
    else if(executionIndex >= instructions.length && mutexRead == false)
    {
      for (var i = 0; i < instructions.length; i++){
           draw.space.push(i) ;
      }
      draw.info=[];
      executionIndex = -2;
      return packExecute(false, 'The execution of the program has finished', 'success', draw);
    }
    else{
      if(error != 1){
        draw.success.push(executionIndex);
      }
    }
    console_log(executionIndex) ;
  }
  while(instructions[executionIndex].hide == true) ;

  return packExecute(false, null, null, draw) ;
}

function executeProgramOneShot ( limit_n_instructions )
{
    var ret = null;

    // execute program
    for (var i=0; i<limit_n_instructions; i++)
    {
       ret = executeInstruction();

       if (ret.error == true){
           return ret;
       }
       if (executionIndex < -1) {
           return ret;
       }
    }

    return packExecute(true, '"ERROR:" number of instruction limit reached :-(', null, null) ;
}

/*Read register value*/
function readRegister ( indexComp, indexElem )
{
	    var draw = {
		  space: [] ,
		  info: [] ,
		  success: [] ,
		  danger: [],
		  flash: []
		} ;

      if ((architecture.components[indexComp].elements[indexElem].properties[0] != "read") && 
          (architecture.components[indexComp].elements[indexElem].properties[1] != "read"))
      {
	    for (var i = 0; i < instructions.length; i++) {
		 draw.space.push(i);
	    }

	    draw.danger.push(executionIndex);

            executionIndex = -1;

            throw packExecute(true, 'The register '+ architecture.components[indexComp].elements[indexElem].name +' cannot be read', 'danger', draw);    
        }

        if ((architecture.components[indexComp].type == "control") || 
            (architecture.components[indexComp].type == "integer"))
        {
            console_log(parseInt((architecture.components[indexComp].elements[indexElem].value).toString()));
            return parseInt((architecture.components[indexComp].elements[indexElem].value).toString());
        }

        if (architecture.components[indexComp].type == "floating point")
        {
            return parseFloat((architecture.components[indexComp].elements[indexElem].value).toString());
        }
}

/*Write value in register*/
function writeRegister ( value, indexComp, indexElem )
{

	  var draw = {
	    space: [] ,
	    info: [] ,
	    success: [] ,
	    danger: [],
	    flash: []
	  } ;

        if (value == null) {
            return;
        }

        if ((architecture.components[indexComp].type == "integer") ||
            (architecture.components[indexComp].type == "control"))
        {
            if ((architecture.components[indexComp].elements[indexElem].properties[0] != "write") &&
                (architecture.components[indexComp].elements[indexElem].properties[1] != "write"))
            {
/*
                show_notification('The register '+ architecture.components[indexComp].elements[indexElem].name +' cannot be written', 'danger') ;
                instructions[executionIndex]._rowVariant = 'danger';
                executionIndex = -1;
                return;
*/
	        for (var i = 0; i < instructions.length; i++) {
	  	     draw.space.push(i);
	        }
	        draw.danger.push(executionIndex);

	        executionIndex = -1;
	        throw packExecute(true, 'The register '+ architecture.components[indexComp].elements[indexElem].name +' cannot be written', 'danger', draw);
            }

            architecture.components[indexComp].elements[indexElem].value = bi_intToBigInt(value,10);

            if (typeof window !== "undefined")
            {
              var buttonDec = '#popoverValueContent' + architecture.components[indexComp].elements[indexElem].name  + "Int";
              var buttonHex = '#popoverValueContent' + architecture.components[indexComp].elements[indexElem].name;

              $(buttonDec).attr("class", "btn btn-outline-secondary btn-block btn-sm modRegister");
              $(buttonHex).attr("class", "btn btn-outline-secondary btn-block btn-sm modRegister");

              setTimeout(function() {
                $(buttonDec).attr("class", "btn btn-outline-secondary btn-block btn-sm registers");
                $(buttonHex).attr("class", "btn btn-outline-secondary btn-block btn-sm registers");
              }, 500);
            }
        }

        else if (architecture.components[indexComp].type =="floating point")
        {
          if (architecture.components[indexComp].double_precision == false)
          {
            if (architecture.components[indexComp].elements[indexElem].properties[0] != "write" && architecture.components[indexComp].elements[indexElem].properties[1] != "write")
            {
                throw packExecute(true, 'The register '+ architecture.components[indexComp].elements[indexElem].name +' cannot be written', 'danger', null);
            }

            architecture.components[indexComp].elements[indexElem].value = parseFloat(value);

            updateDouble(indexComp, indexElem);

            if (typeof window !== "undefined")
            {
              var buttonDec = '#popoverValueContent' + architecture.components[indexComp].elements[indexElem].name + "FP";
              var buttonHex = '#popoverValueContent' + architecture.components[indexComp].elements[indexElem].name;

              $(buttonDec).attr("style", "background-color:#c2c2c2;");
              $(buttonHex).attr("style", "background-color:#c2c2c2;");

              setTimeout(function() {
                $(buttonDec).attr("style", "background-color:#f5f5f5;");
                $(buttonHex).attr("style", "background-color:#f5f5f5;");
              }, 500);
            }
          }

          else if (architecture.components[indexComp].double_precision == true)
          {
            if (architecture.components[indexComp].elements[indexElem].properties[0] != "write" && architecture.components[indexComp].elements[indexElem].properties[1] != "write")
            {
              /*
              	        show_notification('The register '+ architecture.components[indexComp].elements[indexElem].name +' cannot be written', 'danger') ;
                              return;
              */
              throw packExecute(true, 'The register '+ architecture.components[indexComp].elements[indexElem].name +' cannot be written', 'danger', null);
            }

            architecture.components[indexComp].elements[indexElem].value = parseFloat(value);
            updateSimple(indexComp, indexElem);

            if (typeof window !== "undefined")
            {
                  var buttonDec = '#popoverValueContent' + architecture.components[indexComp].elements[indexElem].name + "DFP";
                  var buttonHex = '#popoverValueContent' + architecture.components[indexComp].elements[indexElem].name;

                  $(buttonDec).attr("style", "background-color:#c2c2c2;");
                  $(buttonHex).attr("style", "background-color:#c2c2c2;");

                  setTimeout(function() {
                    $(buttonDec).attr("style", "background-color:#f5f5f5;");
                    $(buttonHex).attr("style", "background-color:#f5f5f5;");
                  }, 500);
            } // if

          }
        }
}

/*Read memory value*/
function readMemory ( addr, type )
{
        var memValue = '';
        var index;
	  var draw = {
	    space: [] ,
	    info: [] ,
	    success: [] ,
	    danger: [],
	    flash: []
	  } ;


	if (type == "d") {
	    debugger;

          if((parseInt(addr, 16) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr, 16) == architecture.memory_layout[0].value || parseInt(addr, 16) == architecture.memory_layout[1].value){
	    draw.danger.push(executionIndex);
            executionIndex = -1;
            throw packExecute(true, 'Segmentation fault. You tried to read in the text segment', 'danger', null);
          }
          if((parseInt(addr, 16) > architecture.memory_layout[2].value && parseInt(addr) < architecture.memory_layout[3].value) ||  parseInt(addr, 16) == architecture.memory_layout[2].value || parseInt(addr, 16) == architecture.memory_layout[3].value) index = memory_hash[0];

          if((parseInt(addr, 16) > architecture.memory_layout[4].value && parseInt(addr) < architecture.memory_layout[5].value) ||  parseInt(addr, 16) == architecture.memory_layout[4].value || parseInt(addr, 16) == architecture.memory_layout[5].value) index = memory_hash[2];

          for (var i = 0; i < memory[index].length; i++){
            for (var j = 0; j < memory[index][i].Binary.length; j++){
              var aux = "0x"+(memory[index][i].Binary[j].Addr).toString(16);
              if(aux == addr || memory[index][i].Binary[j].Tag == addr){
		for (let k = 0; k<2; k++)
			for (var z = 0; z < memory[index][i].Binary.length; z++)
				  memValue = memory[index][k].Binary[z].Bin + memValue;
                //return bi_intToBigInt(memValue, 16) ;
		return parseInt(memValue, 16);
              }
            }
          }
	return 0;
	}

        if (type == "w"){
          if((parseInt(addr, 16) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr, 16) == architecture.memory_layout[0].value || parseInt(addr, 16) == architecture.memory_layout[1].value){
	    draw.danger.push(executionIndex);
            executionIndex = -1;
            throw packExecute(true, 'Segmentation fault. You tried to read in the text segment', 'danger', null);
          }

          if((parseInt(addr, 16) > architecture.memory_layout[2].value && parseInt(addr) < architecture.memory_layout[3].value) ||  parseInt(addr, 16) == architecture.memory_layout[2].value || parseInt(addr, 16) == architecture.memory_layout[3].value){
            index = memory_hash[0];
          }

          if((parseInt(addr, 16) > architecture.memory_layout[4].value && parseInt(addr) < architecture.memory_layout[5].value) ||  parseInt(addr, 16) == architecture.memory_layout[4].value || parseInt(addr, 16) == architecture.memory_layout[5].value){
            index = memory_hash[2];
          }

          for (var i = 0; i < memory[index].length; i++){
            for (var j = 0; j < memory[index][i].Binary.length; j++){
              var aux = "0x"+(memory[index][i].Binary[j].Addr).toString(16);
              if(aux == addr || memory[index][i].Binary[j].Tag == addr){
                for (var z = 0; z < memory[index][i].Binary.length; z++){
                  memValue = memory[index][i].Binary[z].Bin + memValue;
                }
                //return bi_intToBigInt(memValue, 16) ;
                return parseInt(memValue,16);
              }
            }
          }
          //return bi_intToBigInt(0,10) ;
          return 0;
        }

        if (type == "h"){
          if((parseInt(addr, 16) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr, 16) == architecture.memory_layout[0].value || parseInt(addr, 16) == architecture.memory_layout[1].value){
	    draw.danger.push(executionIndex);
            executionIndex = -1;
            throw packExecute(true, 'Segmentation fault. You tried to read in the text segment', 'danger', null);
          }

          if((parseInt(addr, 16) > architecture.memory_layout[2].value && parseInt(addr) < architecture.memory_layout[3].value) ||  parseInt(addr, 16) == architecture.memory_layout[2].value || parseInt(addr, 16) == architecture.memory_layout[3].value){
            index = memory_hash[0];
          }

          if((parseInt(addr, 16) > architecture.memory_layout[4].value && parseInt(addr) < architecture.memory_layout[5].value) ||  parseInt(addr, 16) == architecture.memory_layout[4].value || parseInt(addr, 16) == architecture.memory_layout[5].value){
            index = memory_hash[2];
          }

          for (var i = 0; i < memory[index].length; i++){
            for (var j = 0; j < memory[index][i].Binary.length; j++){
              var aux = "0x"+(memory[index][i].Binary[j].Addr).toString(16);
              if(aux == addr || memory[index][i].Binary[j].Tag == addr){
                if(j < 2){
                  for (var z = 0; z < memory[index][i].Binary.length -2; z++){
                    memValue = memory[index][i].Binary[z].Bin + memValue;
                  }
                  //return bi_intToBigInt(memValue, 16) ;
                  return parseInt(memValue,16);
                }
                else{
                  for (var z = 2; z < memory[index][i].Binary.length; z++){
                    memValue = memory[index][i].Binary[z].Bin + memValue;
                  }
                  //return bi_intToBigInt(memValue, 16) ;
                  return parseInt(memValue,16);
                }
              }
            }
          }
          //return bi_intToBigInt(0,10) ;
          return 0;
        }

        if (type == "b"){
          if((parseInt(addr, 16) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr, 16) == architecture.memory_layout[0].value || parseInt(addr, 16) == architecture.memory_layout[1].value){
	    draw.danger.push(executionIndex);
            executionIndex = -1;
            throw packExecute(true, 'Segmentation fault. You tried to read in the text segment', 'danger', null);
          }

          if((parseInt(addr, 16) > architecture.memory_layout[2].value && parseInt(addr) < architecture.memory_layout[3].value) ||  parseInt(addr, 16) == architecture.memory_layout[2].value || parseInt(addr, 16) == architecture.memory_layout[3].value){
            index = memory_hash[0];
          }

          if((parseInt(addr, 16) > architecture.memory_layout[4].value && parseInt(addr) < architecture.memory_layout[5].value) ||  parseInt(addr, 16) == architecture.memory_layout[4].value || parseInt(addr, 16) == architecture.memory_layout[5].value){
            index = memory_hash[2];
          }

          for (var i = 0; i < memory[index].length; i++){
            for (var j = 0; j < memory[index][i].Binary.length; j++){
              var aux = "0x"+(memory[index][i].Binary[j].Addr).toString(16);
              if(aux == addr || memory[index][i].Binary[j].Tag == addr){
                memValue = memory[index][i].Binary[j].Bin + memValue;
                //return bi_intToBigInt(memValue, 16) ;
                return parseInt(memValue,16);
              }
            }
          }
          //return bi_intToBigInt(0,10) ;
          return 0;
        }
}

/*Write value in memory*/
function writeMemory ( value, addr, type )
{
	  var draw = {
	    space: [] ,
	    info: [] ,
	    success: [] ,
	    danger: [],
	    flash: []
	  } ;

        if (value == null) {
            return;
        }

        var memValue = (value.toString(16)).padStart(8, "0");
        var index;

        if (type == "w"){
          if((addr > architecture.memory_layout[0].value && addr < architecture.memory_layout[1].value) ||  addr == architecture.memory_layout[0].value || addr == architecture.memory_layout[1].value){
	    			draw.danger.push(executionIndex);
            executionIndex = -1;
            throw packExecute(true, 'Segmentation fault. You tried to read in the text segment', 'danger', null);
          }

          if((addr > architecture.memory_layout[2].value && addr < architecture.memory_layout[3].value) ||  addr == architecture.memory_layout[2].value || addr == architecture.memory_layout[3].value){
            index = memory_hash[0];
          }

          if((addr > architecture.memory_layout[4].value && addr < architecture.memory_layout[5].value) ||  addr == architecture.memory_layout[4].value || addr == architecture.memory_layout[5].value){
            index = memory_hash[2];
          }

          for (var i = 0; i < memory[index].length; i++){
            for (var j = 0; j < memory[index][i].Binary.length; j++){
              var aux = "0x"+(memory[index][i].Binary[j].Addr).toString(16);
              if(aux == addr || memory[index][i].Binary[j].Tag == addr){
                //memory[index][i].Value = parseInt(memValue, 16);
                if(memory[index][i].type == "float"){
                  memory[index][i].Value = hex2float("0x" + memValue);
                }
                else{
                  memory[index][i].Value = (parseInt(memValue, 16) >> 0);
                }

                var charIndex = memValue.length-1;
                for (var z = 0; z < memory[index][i].Binary.length; z++){
                  memory[index][i].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                  charIndex = charIndex - 2;
                }
                //memory[index][i].Value = parseInt(memValue, 16);

                if(memory[index][i].type == "float"){
                  memory[index][i].Value = hex2float("0x" + memValue);
                }
                else{
                  memory[index][i].Value = (parseInt(memValue, 16) >> 0);
                }

                if (typeof app !== "undefined")
                    app._data.memory[index] = memory[index];
                return;
              }
            }
          }

          for (var i = 0; i < memory[index].length; i++){
            if(memory[index][i].Address > addr){
              var aux_addr = addr - (addr%4);
              memory[index].splice(i, 0, {Address: aux_addr, Binary: [], Value: (parseInt(memValue, 16) >> 0), DefValue: null, reset: false});
              var charIndex = memValue.length-1;
              for (var z = 0; z < 4; z++){
                (memory[index][i].Binary).push({Addr: aux_addr + z, DefBin: "00", Bin: memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase(), Tag: null},);
                charIndex = charIndex - 2;
              }
              if (typeof app !== "undefined")
                  app._data.memory[index] = memory[index];
              return;
            }
            else if(i == memory[index].length-1){
              var aux_addr = addr - (addr%4);
              memory[index].push({Address: aux_addr, Binary: [], Value: (parseInt(memValue, 16) >> 0), DefValue: null, reset: false});
              var charIndex = memValue.length-1;
              for (var z = 0; z < 4; z++){
                (memory[index][i+1].Binary).push({Addr: aux_addr + z, DefBin: "00", Bin: memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase(), Tag: null},);
                charIndex = charIndex - 2;
              }
              if (typeof app !== "undefined")
                  app._data.memory[index] = memory[index];
              return;
            }
          }

          if(memory[index].length == 0){
            var aux_addr = addr - (addr%4);
            memory[index].push({Address: aux_addr, Binary: [], Value: (parseInt(memValue, 16) >> 0), DefValue: null, reset: false});
            var charIndex = memValue.length-1;
            for (var z = 0; z < 4; z++){
              (memory[index][memory[index].length-1].Binary).push({Addr: aux_addr + z, DefBin: "00", Bin: memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase(), Tag: null},);
              charIndex = charIndex - 2;
            }
            if (typeof app !== "undefined")
                app._data.memory[index] = memory[index];
            return;
          }
        }

        if (type == "h"){
          if((addr > architecture.memory_layout[0].value && addr < architecture.memory_layout[1].value) ||  addr == architecture.memory_layout[0].value || addr == architecture.memory_layout[1].value){
	    draw.danger.push(executionIndex);
            executionIndex = -1;
            throw packExecute(true, 'Segmentation fault. You tried to read in the text segment', 'danger', null);
          }

          if((addr > architecture.memory_layout[2].value && addr < architecture.memory_layout[3].value) ||  addr == architecture.memory_layout[2].value || addr == architecture.memory_layout[3].value){
            index = memory_hash[0];
          }

          if((addr > architecture.memory_layout[4].value && addr < architecture.memory_layout[5].value) ||  addr == architecture.memory_layout[4].value || addr == architecture.memory_layout[5].value){
            index = memory_hash[2];
          }

          for (var i = 0; i < memory[index].length; i++){
            for (var j = 0; j < memory[index][i].Binary.length; j++){
              var aux = "0x"+(memory[index][i].Binary[j].Addr).toString(16);
              if(aux == addr || memory[index][i].Binary[j].Tag == addr){
                 if(j < 2){
                  var charIndex = memValue.length-1;
                  for (var z = 0; z < memory[index][i].Binary.length - 2; z++){
                    memory[index][i].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                    charIndex = charIndex - 2;
                  }

                  memory[index][i].Value = null;
                  for (var z = 3; z < 4; z=z-2){
                    memory[index][i].Value = memory[index][i].Value + (parseInt((memory[index][i].Binary[z].Bin + memory[index][i].Binary[z-1].Bin), 16) >> 0) + " ";
                  }
                  if (typeof app !== "undefined")
                      app._data.memory[index] = memory[index];
                  return;
                }
                else{
                  var charIndex = memValue.length-1;
                  for (var z = 2; z < memory[index][i].Binary.length; z++){
                    memory[index][i].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                    charIndex = charIndex - 2;
                  }
                  if (typeof app !== "undefined")
                      app._data.memory[index] = memory[index];
                  return;
                }
              }
            }
          }

          for (var i = 0; i < memory[index].length; i++){
            if(memory[index][i].Address > addr){
              var aux_addr = addr - (addr%4);
              memory[index].splice(i, 0, {Address: aux_addr, Binary: [], Value: null, DefValue: null, reset: false});
              var charIndex = memValue.length-1;
              for (var z = 0; z < 4; z++){
                (memory[index][i].Binary).push({Addr: aux_addr + z, DefBin: "00", Bin: "00", Tag: null},);
              }
              for (var j = 0; j < memory[index][i].Binary.length; j++){
                var aux = "0x"+(memory[index][i].Binary[j].Addr).toString(16);
                if(aux == addr || memory[index][i].Binary[j].Tag == addr){
                   if(j < 2){
                    var charIndex = memValue.length-1;
                    for (var z = 0; z < memory[index][i].Binary.length - 2; z++){
                      memory[index][i].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                      charIndex = charIndex - 2;
                    }
                    memory[index][i].Value = "0 " + (parseInt(memValue, 16) >> 0);
                    if (typeof app !== "undefined")
                        app._data.memory[index] = memory[index];
                    return;
                  }
                  else{
                    var charIndex = memValue.length-1;
                    for (var z = 2; z < memory[index][i].Binary.length; z++){
                      memory[index][i].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                      charIndex = charIndex - 2;
                    }
                    memory[index][i].Value = (parseInt(memValue, 16) >> 0) + " 0";
                    if (typeof app !== "undefined")
                        app._data.memory[index] = memory[index];
                    return;
                  }
                }
              }
              return;
            }
            else if(i == memory[index].length-1){
              var aux_addr = addr - (addr%4);
              memory[index].push({Address: aux_addr, Binary: [], Value: null, DefValue: null, reset: false});
              var charIndex = memValue.length-1;
              for (var z = 0; z < 4; z++){
                (memory[index][i+1].Binary).push({Addr: aux_addr + z, DefBin: "00", Bin: "00", Tag: null},);
              }
              for (var j = 0; j < memory[index][i+1].Binary.length; j++){
                var aux = "0x"+(memory[index][i+1].Binary[j].Addr).toString(16);
                if(aux == addr || memory[index][i+1].Binary[j].Tag == addr){
                   if(j < 2){
                    var charIndex = memValue.length-1;
                    for (var z = 0; z < memory[index][i+1].Binary.length - 2; z++){
                      memory[index][i+1].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                      charIndex = charIndex - 2;
                    }
                    memory[index][i+1].Value = "0 " + (parseInt(memValue, 16) >> 0);
                    if (typeof app !== "undefined")
                        app._data.memory[index] = memory[index];
                    return;
                  }
                  else{
                    var charIndex = memValue.length-1;
                    for (var z = 2; z < memory[index][i].Binary.length; z++){
                      memory[index][i+1].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                      charIndex = charIndex - 2;
                    }
                    memory[index][i+1].Value = parseInt(memValue, 16) + " 0";
                    if (typeof app !== "undefined")
                        app._data.memory[index] = memory[index];
                    return;
                  }
                }
              }
              return;
            }
          }

          if(memory[index].length == 0){
            var aux_addr = addr - (addr%4);
            memory[index].push({Address: aux_addr, Binary: [], Value: null, DefValue: null, reset: false});
            var charIndex = memValue.length-1;
            for (var z = 0; z < 4; z++){
              (memory[index][memory[index].length-1].Binary).push({Addr: aux_addr + z, DefBin: "00", Bin: "00", Tag: null},);
            }
            for (var j = 0; j < memory[index][memory[index].length-1].Binary.length; j++){
              var aux = "0x"+(memory[index][memory[index].length-1].Binary[j].Addr).toString(16);
              if(aux == addr || memory[index][memory[index].length-1].Binary[j].Tag == addr){
                 if(j < 2){
                  var charIndex = memValue.length-1;
                  for (var z = 0; z < memory[index][memory[index].length-1].Binary.length - 2; z++){
                    memory[index][memory[index].length-1].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                    charIndex = charIndex - 2;
                  }
                  memory[index][memory[index].length-1].Value = "0 " + (parseInt(memValue, 16) >> 0);
                  if (typeof app !== "undefined")
                      app._data.memory[index] = memory[index];
                  return;
                }
                else{
                  var charIndex = memValue.length-1;
                  for (var z = 2; z < memory[index][i].Binary.length; z++){
                    memory[index][memory[index].length-1].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                    charIndex = charIndex - 2;
                  }
                  memory[index][memory[index].length-1].Value = (parseInt(memValue, 16) >> 0) + " 0";
                  if (typeof app !== "undefined")
                      app._data.memory[index] = memory[index];
                  return;
                }
              }
            }
            return;
          }
        }

        if (type == "b"){
          if((addr > architecture.memory_layout[0].value && addr < architecture.memory_layout[1].value) ||  addr == architecture.memory_layout[0].value || addr == architecture.memory_layout[1].value){
	    draw.danger.push(executionIndex);
            executionIndex = -1;
            throw packExecute(true, 'Segmentation fault. You tried to read in the text segment', 'danger', null);
          }

          if((addr > architecture.memory_layout[2].value && addr < architecture.memory_layout[3].value) ||  addr == architecture.memory_layout[2].value || addr == architecture.memory_layout[3].value){
            index = memory_hash[0];
          }

          if((addr > architecture.memory_layout[4].value && addr < architecture.memory_layout[5].value) ||  addr == architecture.memory_layout[4].value || addr == architecture.memory_layout[5].value){
            index = memory_hash[2];
          }

          for (var i = 0; i < memory[index].length; i++){
            for (var j = 0; j < memory[index][i].Binary.length; j++){
              var aux = "0x"+(memory[index][i].Binary[j].Addr).toString(16);
              if(aux == addr || memory[index][i].Binary[j].Tag == addr){
                var charIndex = memValue.length-1;
                memory[index][i].Binary[j].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                memory[index][i].Value = null;
                for (var z = 3; z < 4; z--){
                  memory[index][i].Value = memory[index][i].Value + parseInt(memory[index][i].Binary[z].Bin, 16) + " ";
                }
                return;
              }
            }
          }

          for (var i = 0; i < memory[index].length; i++){
            if(memory[index][i].Address > addr){
              var aux_addr = addr - (addr%4);
              memory[index].splice(i, 0, {Address: aux_addr, Binary: [], Value: null, DefValue: null, reset: false});
              var charIndex = memValue.length-1;
              for (var z = 0; z < 4; z++){
                (memory[index][i].Binary).push({Addr: aux_addr + z, DefBin: "00", Bin: "00", Tag: null},);
              }
              for (var j = 0; j < memory[index][i].Binary.length; j++){
                var aux = "0x"+(memory[index][i].Binary[j].Addr).toString(16);
                if(aux == addr || memory[index][i].Binary[j].Tag == addr){
                  var charIndex = memValue.length-1;
                  memory[index][i].Binary[j].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                  for (var z = 3; z < 4; z--){
                    memory[index][i+1].Value = memory[index][i+1].Value + parseInt(memory[index][i+1].Binary[z].Bin, 16) + " ";
                  }
                  return;
                }
              }
              return;
            }
            else if(i == memory[index].length-1){
              var aux_addr = addr - (addr%4);
              memory[index].push({Address: aux_addr, Binary: [], Value: null, DefValue: null, reset: false});
              var charIndex = memValue.length-1;
              for (var z = 0; z < 4; z++){
                (memory[index][i+1].Binary).push({Addr: aux_addr + z, DefBin: "00", Bin: "00", Tag: null},);
              }
              for (var j = 0; j < memory[index][i+1].Binary.length; j++){
                var aux = "0x"+(memory[index][i+1].Binary[j].Addr).toString(16);
                if(aux == addr || memory[index][i+1].Binary[j].Tag == addr){
                  var charIndex = memValue.length-1;
                  memory[index][i+1].Binary[j].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                  for (var z = 3; z < 4; z--){
                    memory[index][i+1].Value = memory[index][i+1].Value + parseInt(memory[index][i+1].Binary[z].Bin, 16) + " ";
                  }
                  return;
                }
              }
              return;
            }
          }

          if(memory[index].length == 0){
            var aux_addr = addr - (addr%4);
            memory[index].push({Address: aux_addr, Binary: [], Value: null, DefValue: null, reset: false});
            var charIndex = memValue.length-1;
            for (var z = 0; z < 4; z++){
              (memory[index][memory[index].length-1].Binary).push({Addr: aux_addr + z, DefBin: "00", Bin: "00", Tag: null},);
            }
            for (var j = 0; j < memory[index][memory[index].length-1].Binary.length; j++){
              var aux = "0x"+(memory[index][memory[index].length-1].Binary[j].Addr).toString(16);
              if(aux == addr || memory[index][memory[index].length-1].Binary[j].Tag == addr){
                var charIndex = memValue.length-1;
                memory[index][memory[index].length-1].Binary[j].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                for (var z = 3; z < 4; z--){
                  memory[index][memory[index].length-1].Value = memory[index][memory[index].length-1].Value + parseInt(memory[index][memory[index].length-1].Binary[z].Bin, 16) + " ";
                }
                return;
              }
            }
            return;
          }
        }
}

/*Modify the stack limit*/
function writeStackLimit ( stackLimit )
{
	  var draw = {
	    space: [] ,
	    info: [] ,
	    success: [] ,
	    danger: [],
	    flash: []
	  } ;

        if(stackLimit != null){
          if(stackLimit <= architecture.memory_layout[3].value && stackLimit >= architecture.memory_layout[2].value){
	    draw.danger.push(executionIndex);
            executionIndex = -1;
            throw packExecute(true, 'Segmentation fault. You tried to read in the text segment', 'danger', null);
          }
          else if(stackLimit <= architecture.memory_layout[1].value && stackLimit >= architecture.memory_layout[0].value){
	    draw.danger.push(executionIndex);
            executionIndex = -1;
            throw packExecute(true, 'Segmentation fault. You tried to read in the text segment', 'danger', null);
          }
          else{
            if(stackLimit < architecture.memory_layout[4].value){
              var diff = architecture.memory_layout[4].value - stackLimit;
              var auxStackLimit = stackLimit;

              for (var i = 0; i < (diff/4); i++){
                if(unallocated_memory.length > 0){
                  memory[memory_hash[2]].splice(0, 0, unallocated_memory[unallocated_memory.length-1]);
                  memory[memory_hash[2]][0].unallocated = false;
                  unallocated_memory.splice(unallocated_memory.length-1, 1);
                }
                else{
                  memory[memory_hash[2]].splice(i, 0,{Address: auxStackLimit, Binary: [], Value: null, DefValue: null, reset: true, unallocated: false});
                  for (var z = 0; z < 4; z++){
                    (memory[memory_hash[2]][i].Binary).push({Addr: auxStackLimit, DefBin: "00", Bin: "00", Tag: null},);
                    auxStackLimit++;
                  }
                }
              }
            }
            else if(stackLimit > architecture.memory_layout[4].value){
              var diff = stackLimit - architecture.memory_layout[4].value;
              for (var i = 0; i < (diff/4); i++){
                unallocated_memory.push(memory[memory_hash[2]][0]);
                unallocated_memory[unallocated_memory.length-1].unallocated = true;
                if (typeof app !== "undefined")
                    app._data.unallocated_memory = unallocated_memory;
                memory[memory_hash[2]].splice(0, 1);
                if(unallocated_memory.length > 20){
                  unallocated_memory.splice(0, 15);
                }
              }
            }

            architecture.memory_layout[4].value = stackLimit;

          }
        }
}

/*Syscall*/
function syscall ( action, indexComp, indexElem, indexComp2, indexElem2, first_time)
{
	  var draw = {
	    space: [] ,
	    info: [] ,
	    success: [] ,
	    danger: [],
	    flash: []
	  } ;

        switch(action)
        {
          case "print_int":
               var value   = architecture.components[indexComp].elements[indexElem].value;
               var val_int = parseInt(value.toString()) >> 0 ;

               if (typeof app !== "undefined")
                    app._data.display += val_int ;
               else process.stdout.write(val_int + '\n') ;

               display += val_int ;
               break;

          case "print_float":
               var value = architecture.components[indexComp].elements[indexElem].value;

               if (typeof app !== "undefined")
                    app._data.display += value;
               else process.stdout.write(value + '\n') ;

               display += value ;
               break;

          case "print_double":
               var value = architecture.components[indexComp].elements[indexElem].value;

               if (typeof app !== "undefined")
                    app._data.display += value;
               else process.stdout.write(value + '\n') ;

               display += value ;
               break;

          case "print_string":
               var addr = architecture.components[indexComp].elements[indexElem].value;
               var index;

               if((parseInt(addr) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr) == architecture.memory_layout[0].value || parseInt(addr) == architecture.memory_layout[1].value){
                 executionIndex = -1;
                 if (typeof app !== "undefined")
                  app._data.keyboard = "";
                 return packExecute(true, 'Segmentation fault. You tried to write in the text segment', 'danger', null);
               }

               if((parseInt(addr) > architecture.memory_layout[2].value && parseInt(addr) < architecture.memory_layout[3].value) ||  parseInt(addr) == architecture.memory_layout[2].value || parseInt(addr) == architecture.memory_layout[3].value){
                 index = memory_hash[0];
               }

               if((parseInt(addr) > architecture.memory_layout[4].value && parseInt(addr) < architecture.memory_layout[5].value) ||  parseInt(addr) == architecture.memory_layout[4].value || parseInt(addr) == architecture.memory_layout[5].value){
                 index = memory_hash[2];
               }

            for (var i = 0; i < memory[index].length; i++){
              for (var j = 0; j < memory[index][i].Binary.length; j++){
                var aux = "0x"+(memory[index][i].Binary[j].Addr).toString(16);
                if(aux == addr){
                  for (var i; i < memory[index].length; i++){
                    for (var k = j; k < memory[index][i].Binary.length; k++)
                    {
                      console_log(parseInt(memory[index][i].Binary[k].Bin, 16));
                      console_log(String.fromCharCode(parseInt(memory[index][i].Binary[k].Bin, 16)));

                      if (memory[index][i].Binary[k].Bin == "00") {
                          return packExecute(false, 'printed', 'info', null);
                      }

                      if (typeof app !== "undefined")
                           app._data.display += String.fromCharCode(parseInt(memory[index][i].Binary[k].Bin, 16));
                      else process.stdout.write(String.fromCharCode(parseInt(memory[index][i].Binary[k].Bin, 16)));

                      display += String.fromCharCode(parseInt(memory[index][i].Binary[k].Bin, 16));

                      if (i == memory[index].length-1 && k == memory[index][i].Binary.length-1) {
                          return packExecute(false, 'printed', 'info', null);
                      }

                      j=0;
                    }
                  }
                }
              }
            }

               break;

          case "read_int":

                // CL
                if (typeof app === "undefined") 
                {
                  var readlineSync = require('readline-sync') ;
                  var keystroke    = readlineSync.question(' $> ') ;
                  var value        = parseInt(keystroke) ;

                  keyboard = keyboard + " " + value;

                  writeRegister(value, indexComp, indexElem);
                  return packExecute(false, 'The data has been uploaded', 'danger', null);
                }

                if (first_time == true) {
	            document.getElementById('enter_keyboard').scrollIntoView();
	        }

                // UI
                mutexRead = true;
                app._data.enter = false;
    
                console_log(mutexRead);
                if (newExecution == true) {
                    app._data.keyboard = "";
                    consoleMutex  = false;
                    mutexRead     = false;
                    app._data.enter = null;
    
    	            	show_notification('The data has been uploaded', 'info') ;
    
                    if (runProgram == false) {
                        app.executeProgram();
                    }
    
                    return packExecute(false, 'The data has been uploaded', 'danger', null);
                }
    
                if (consoleMutex == false) {
                    setTimeout(syscall, 1000, "read_int", indexComp, indexElem, indexComp2, indexElem2, false);
                }
                else {
                  var value = parseInt(app._data.keyboard);
                  console_log(value);
                  writeRegister(value, indexComp, indexElem);
                  app._data.keyboard = "";
                  consoleMutex = false;
                  mutexRead = false;
                  app._data.enter = null;
    
    		  				show_notification('The data has been uploaded', 'info') ;
    
                  if (executionIndex >= instructions.length)
                  {
                     for (var i = 0; i < instructions.length; i++) {
                          draw.space.push(i) ;
                     }
                     executionIndex = -2;
                     return packExecute(true, 'The execution of the program has finished', 'success', null);
                  }
                  else if (runProgram == false) {
                           app.executeProgram();
                  }
                }
    
                break;

          case "read_float":

                // CL
                if (typeof app === "undefined") 
                {
								    var readlineSync = require('readline-sync') ;
								    var keystroke    = readlineSync.question(' $> ') ;
                    var value        = parseFloat(keystroke) ;

                    keyboard = keyboard + " " + value;

                    writeRegister(value, indexComp, indexElem);
                    return packExecute(false, 'The data has been uploaded', 'danger', null);
                }

                if(first_time == true){
	                document.getElementById('enter_keyboard').scrollIntoView();
	              }

                mutexRead = true;
                app._data.enter = false;
                console_log(mutexRead);
                if(newExecution == true){
                  app._data.keyboard = "";
                  consoleMutex = false;
                  mutexRead = false;
                  app._data.enter = null;
    
    		  				show_notification('The data has been uploaded', 'info') ;
    
                  if (runProgram == false){
                      app.executeProgram();
                  }
    
                  return;
                }
    
                if (consoleMutex == false) {
                    setTimeout(syscall, 1000, "read_float", indexComp, indexElem, indexComp2, indexElem2, false);
                }
                else{
                  var value = parseFloat(app._data.keyboard, 10);
                  console_log(value);
                  writeRegister(value, indexComp, indexElem);
                  app._data.keyboard = "";
                  consoleMutex = false;
                  mutexRead = false;
                  app._data.enter = null;
    
    		  				show_notification('The data has been uploaded', 'info') ;
    
                  if(executionIndex >= instructions.length){
                    for (var i = 0; i < instructions.length; i++) {
                         draw.space.push(i) ;
                    }
    
                    executionIndex = -2;
                    return packExecute(true, 'The execution of the program has finished', 'success', null);
                  }
                  else if (runProgram == false){
                           app.executeProgram();
                  }
                }
    
                break;

          case "read_double":

                // CL
                if (typeof app === "undefined") 
                {
								    var readlineSync = require('readline-sync') ;
								    var keystroke    = readlineSync.question(' $>  ') ;
						        var value        = parseFloat(keystroke) ;

						        keyboard = keyboard + " " + value;

                    writeRegister(value, indexComp, indexElem);
                    return packExecute(false, 'The data has been uploaded', 'danger', null);
                }

                if(first_time == true){
	                document.getElementById('enter_keyboard').scrollIntoView();
	              }

                mutexRead = true;
                app._data.enter = false;
                console_log(mutexRead);
                if(newExecution == true){
                  app._data.keyboard = "";
                  consoleMutex = false;
                  mutexRead = false;
                  app._data.enter = null;
    
    		  				show_notification('The data has been uploaded', 'info') ;
    
                  if (runProgram == false){
                      app.executeProgram();
                  }
    
                  return;
                }
    
                if (consoleMutex == false) {
                    setTimeout(syscall, 1000, "read_double", indexComp, indexElem, indexComp2, indexElem2, false);
                }
                else{
                  var value = parseFloat(app._data.keyboard, 10);
                  console_log(value);
                  writeRegister(value, indexComp, indexElem);
                  app._data.keyboard = "";
                  consoleMutex = false;
                  mutexRead = false;
                  app._data.enter = null;
    
    		  				show_notification('The data has been uploaded', 'info') ;
    
                  if(executionIndex >= instructions.length){
                    for (var i = 0; i < instructions.length; i++) {
                         draw.space.push(i) ;
                    }
    
                    executionIndex = -2;
                    return packExecute(true, 'The execution of the program has finished', 'success', null);
                  }
                  else if (runProgram == false){
                           app.executeProgram();
                  }
    
                  break;
                }
    
                break;

          case "read_string":

               // CL
              if (typeof app === "undefined") 
              {
							    var readlineSync = require('readline-sync') ;
							    keystroke        = readlineSync.question(' $> ') ;
									var value = "";

                  for (var i = 0; i < architecture.components[indexComp2].elements[indexElem2].value && i < keystroke.length; i++) {
                       value = value + keystroke.charAt(i);
                  }

                  keyboard = keyboard + " " + value;

                  var addr = architecture.components[indexComp].elements[indexElem].value;
                  var valueIndex = 0;
                  var auxAddr = data_address;
                  var index;

                  var ret = read_string_into_memory(keystroke, value, addr, valueIndex, auxAddr, index);
                  if (ret.status != 'ok') {
                    return ret ;
                	}

                  return packExecute(false, 'The data has been uploaded', 'danger', null);
              }

              if(first_time == true){
                document.getElementById('enter_keyboard').scrollIntoView();
              }

               mutexRead = true;

               app._data.enter = false;
               console_log(mutexRead);
               if (newExecution == true)
               {
                   app._data.keyboard = "";
                   consoleMutex = false;
                   mutexRead = false;
                   if (typeof app !== "undefined")
                       app._data.enter = null;
    
                   if (window.document)
    	 	   					show_notification('The data has been uploaded', 'info') ;
    
                   if (runProgram == false){
                       if (typeof app !== "undefined")
                           app.executeProgram();
                   }
    
                   return;
                }
    
                if (consoleMutex == false){
                    setTimeout(syscall, 1000, "read_string", indexComp, indexElem, indexComp2, indexElem2, false);
                }
                else {
                  var keystroke = '' ;
                  keystroke = app.keyboard ;
                  

                  var value = "";
                  for (var i = 0; i < architecture.components[indexComp2].elements[indexElem2].value && i < keystroke.length; i++) {
                       value = value + keystroke.charAt(i);
                  }
                  console_log(value);
    
                  var addr = architecture.components[indexComp].elements[indexElem].value;
                  var valueIndex = 0;
                  var auxAddr = data_address;
                  var index;

                  var ret = read_string_into_memory(keystroke, value, addr, valueIndex, auxAddr, index);
                  if (ret.status != 'ok') {
                      return ret ;
               	  }

                  app._data.memory[index] = memory[index];
                  app.keyboard = "";
                  app._data.enter = null;
                  

                  consoleMutex = false;
                  mutexRead = false;
    

    		      		show_notification('The data has been uploaded', 'info') ;
    
                  if (executionIndex >= instructions.length)
                  {
                      for (var i = 0; i < instructions.length; i++) {
                           draw.space.push(i) ;
                      }
                      executionIndex = -2;
                      return packExecute(true, 'The execution of the program has finished', 'success', null);
                  }
                  else if (runProgram == false){
                    app.executeProgram();
                  }
                }
    
                break;

          case "sbrk":

                var aux_addr = architecture.memory_layout[3].value + 1;
    
                if ((architecture.memory_layout[3].value+parseInt(architecture.components[indexComp].elements[indexElem].value)) >= architecture.memory_layout[4].value) {
                    executionIndex = -1;
                    return packExecute(true, 'Not enough memory for data segment', 'danger', null);
                }
    
                for (var i = 0; i < ((parseInt(architecture.components[indexComp].elements[indexElem].value))/4); i++){
                  memory[memory_hash[0]].push({Address: aux_addr, Binary: [], Value: null, DefValue: null, reset: true});

                  if(i==0){
                    architecture.components[indexComp2].elements[indexElem2].value = aux_addr;
                  }

                  for (var z = 0; z < 4; z++){
                    (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: aux_addr, DefBin: "00", Bin: "00", Tag: null},);
                    aux_addr++;
                  }
                }
    
                if (typeof app !== "undefined")
                    app._data.memory[memory_hash[0]] = memory[memory_hash[0]];

                architecture.memory_layout[3].value = aux_addr-1;

                if (typeof app !== "undefined")
                    app.architecture.memory_layout[3].value = aux_addr-1;
                break;

          case "exit":
                executionIndex = instructions.length + 1;
                break;

          case "print_char":
                var aux    = architecture.components[indexComp].elements[indexElem].value;
                var aux2   = aux.toString(16);
                var length = aux2.length;
    
                var value = aux2.substring(length-2, length) ;
                    value = String.fromCharCode(parseInt(value, 16)) ;

                if (typeof app !== "undefined")
                     app._data.display += value ;
                else process.stdout.write(value) ;

                display += value ;
                break;

          case "read_char":

               // CL
               if (typeof app === "undefined") 
               {
							 	   var readlineSync = require('readline-sync') ;
							 	   var keystroke    = readlineSync.question(' read char> ') ;
                   var value        = keystroke.charCodeAt(0);

                   keyboard = keyboard + " " + value;

                   writeRegister(value, indexComp, indexElem);
                   return packExecute(false, 'The data has been uploaded', 'danger', null);
               }

               if (first_time == true) {
                   document.getElementById('enter_keyboard').scrollIntoView();
               }

               mutexRead = true;
               app._data.enter = false;
               console_log(mutexRead);

               if (newExecution == true) {
                   app._data.keyboard = "";
                   consoleMutex = false;
                   mutexRead = false;
                   app._data.enter = null;
    
    		   show_notification('The data has been uploaded', 'info') ;
    
                   if (runProgram == false){
                       app.executeProgram();
                   }
    
                   return;
                }

                if(consoleMutex == false){
                  setTimeout(syscall, 1000, "read_char", indexComp, indexElem, indexComp2, indexElem2, false);
                }
                else{
                  var value = (app._data.keyboard).charCodeAt(0);
                  writeRegister(value, indexComp, indexElem);
                  app._data.keyboard = "";
                  consoleMutex = false;
                  mutexRead = false;
                  app._data.enter = null;
    
   		  show_notification('The data has been uploaded', 'info') ;
    
                  console_log(mutexRead);
    
                  if(executionIndex >= instructions.length){
                    for (var i = 0; i < instructions.length; i++){
                         draw.space.push(i) ;
                    }
    
                    executionIndex = -2;
                    return packExecute(true, 'The execution of the program has finished', 'success', null);
                  }
                  else if (runProgram == false) {
                           app.executeProgram();
                  }
                }

                break;
        }
			}

			/*Divides a double into two parts*/
			function divDouble(reg, index)
			{
			  var value = bin2hex(double2bin(reg));
			  console_log(value);
			  if(index == 0){
			    return "0x" + value.substring(0,8);
			  }
			  if(index == 1) {
			    return "0x" + value.substring(8,16);
			  }
			}

			/*Reset execution*/
			function reset ()
			{
          executionIndex = 0;
          executionInit = 1;

          /*Reset stats*/
          totalStats = 0 ;
          if (typeof app !== "undefined")
              app._data.totalStats = 0 ;
          for (var i = 0; i < stats.length; i++){
            stats[i].percentage = 0;
            stats[i].number_instructions = 0;
            stats_value[i] = 0;
          }

          /*Reset console*/
          mutexRead    = false ;
          newExecution = true ;
          keyboard = '' ;
          display  = '' ;

          for (var i = 0; i < architecture_hash.length; i++) {
            for (var j = 0; j < architecture.components[i].elements.length; j++) {
              if(architecture.components[i].double_precision == false){
                architecture.components[i].elements[j].value = architecture.components[i].elements[j].default_value;
              }

              else{
                var aux_value;
                var aux_sim1;
                var aux_sim2;

                for (var a = 0; a < architecture_hash.length; a++) {
                  for (var b = 0; b < architecture.components[a].elements.length; b++) {
                    if(architecture.components[a].elements[b].name == architecture.components[i].elements[j].simple_reg[0]){
                      aux_sim1 = app.bin2hex(app.float2bin(architecture.components[a].elements[b].default_value));
                    }
                    if(architecture.components[a].elements[b].name == architecture.components[i].elements[j].simple_reg[1]){
                      aux_sim2 = app.bin2hex(app.float2bin(architecture.components[a].elements[b].default_value));
                    }
                  }
                }

                aux_value = aux_sim1 + aux_sim2;
                architecture.components[i].elements[j].value = app.hex2double("0x" + aux_value);
              }
            }
          }

          architecture.memory_layout[4].value = backup_stack_address;
          architecture.memory_layout[3].value = backup_data_address;

          // reset memory
          for (var i = 0; i < memory[memory_hash[0]].length; i++) {
            if(memory[memory_hash[0]][i].reset == true){
              memory[memory_hash[0]].splice(i, 1);
              i--;
            }
            else{
              memory[memory_hash[0]][i].Value = memory[memory_hash[0]][i].DefValue;
              for (var j = 0; j < memory[memory_hash[0]][i].Binary.length; j++) {
                memory[memory_hash[0]][i].Binary[j].Bin = memory[memory_hash[0]][i].Binary[j].DefBin;
              }
            }
          }

          for (var i = 0; i < memory[memory_hash[2]].length; i++) {
            if(memory[memory_hash[2]][i].reset == true){
              memory[memory_hash[2]].splice(i, 1);
              i--;
            }
            else{
              memory[memory_hash[2]][i].Value = memory[memory_hash[2]][i].DefValue;
              for (var j = 0; j < memory[memory_hash[2]][i].Binary.length; j++) {
                memory[memory_hash[2]][i].Binary[j].Bin = memory[memory_hash[2]][i].Binary[j].DefBin;
              }
            }
          }

          // reset unallocate_memory
          unallocated_memory = [];
          if (typeof app !== "undefined")
              app._data.unallocated_memory = unallocated_memory;

          return true ;
}



function read_string_into_memory(keystroke, value, addr, valueIndex, auxAddr, index,){

	var ret = {
          errorcode: "",
          token: "",
          type: "",
          update: "",
          status: "ok"
        } ;
    
  if((parseInt(addr) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr) == architecture.memory_layout[0].value || parseInt(addr) == architecture.memory_layout[1].value){
    executionIndex = -1;
    if (typeof app !== "undefined")
        app.keyboard = "";
    return packExecute(true, 'Segmentation fault. You tried to read in the text segment', 'danger', null);
  }

  if((parseInt(addr) > architecture.memory_layout[2].value && parseInt(addr) < architecture.memory_layout[3].value) ||  parseInt(addr) == architecture.memory_layout[2].value || parseInt(addr) == architecture.memory_layout[3].value){
    index = memory_hash[0];
  }

  if((parseInt(addr) > architecture.memory_layout[4].value && parseInt(addr) < architecture.memory_layout[5].value) ||  parseInt(addr) == architecture.memory_layout[4].value || parseInt(addr) == architecture.memory_layout[5].value){
    index = memory_hash[2];
  }

  for (var i = 0; i < memory[index].length && keystroke.length > 0; i++){
    for (var j = 0; j < memory[index][i].Binary.length; j++){
      var aux = "0x"+(memory[index][i].Binary[j].Addr).toString(16);
      if(aux == addr){
        for (var j = j; j < memory[index][i].Binary.length && valueIndex < value.length; j++){
          memory[index][i].Binary[j].Bin = (value.charCodeAt(valueIndex)).toString(16);
          auxAddr = memory[index][i].Binary[j].Addr;
          valueIndex++;
          addr++;
        }

        memory[index][i].Value = "";
        for (var j = 0; j < memory[index][i].Binary.length; j++){
          memory[index][i].Value = String.fromCharCode(parseInt(memory[index][i].Binary[j].Bin, 16)) + " " + memory[index][i].Value;
        }

        if((i+1) < memory[index].length && valueIndex < value.length){
          i++;
          for (var j = 0; j < memory[index][i].Binary.length && valueIndex < value.length; j++){
            memory[index][i].Binary[j].Bin = (value.charCodeAt(valueIndex)).toString(16);
            auxAddr = memory[index][i].Binary[j].Addr;
            valueIndex++;
            addr++;
          }

          memory[index][i].Value = "";
          for (var j = 0; j < memory[index][i].Binary.length; j++){
            memory[index][i].Value = String.fromCharCode(parseInt(memory[index][i].Binary[j].Bin, 16)) + " " + memory[index][i].Value;
          }

        }
        else if(valueIndex < value.length){
          data_address = auxAddr;
          memory[index].push({Address: data_address, Binary: [], Value: null, DefValue: null, reset: false});
          i++;
          for (var z = 0; z < 4; z++){
            if(valueIndex < value.length){
              (memory[index][i].Binary).push({Addr: data_address, DefBin: (value.charCodeAt(valueIndex)).toString(16), Bin: (value.charCodeAt(valueIndex)).toString(16), Tag: null},);
              valueIndex++;
              data_address++;
            }
            else{
              (memory[index][i].Binary).push({Addr: data_address, DefBin: "00", Bin: "00", Tag: null},);
              data_address++;
            }
          }

          memory[index][i].Value = "";
          for (var j = 0; j < memory[index][i].Binary.length; j++){
            memory[index][i].Value = String.fromCharCode(parseInt(memory[index][i].Binary[j].Bin, 16)) + " " + memory[index][i].Value;
          }
        }
      }
    }
  }

  if (valueIndex == value.length)
  {
     if (typeof app !== "undefined")
         app.keyboard = "";

     consoleMutex = false;
     mutexRead = false;

     if (typeof app !== "undefined")
         app._data.enter = null;

    if (window.document)
show_notification('The data has been uploaded', 'info') ;

    if (executionIndex >= instructions.length)
    {
        for (var i = 0; i < instructions.length; i++) {
             draw.space.push(i) ;
        }
        executionIndex = -2;
        return packExecute(true, 'The execution of the program has finished', 'success', null);
    }
    else if (runProgram == false){
             if (typeof app !== "undefined")
                 app.executeProgram();
    }

    return ret;
  }

  var auxAddr = parseInt(addr);

  while(valueIndex < value.length){
    memory[index].push({Address: auxAddr, Binary: [], Value: "", DefValue: "", reset: false});
    for (var z = 0; z < 4; z++){
      if(valueIndex > value.length-1){
        (memory[index][i].Binary).push({Addr: auxAddr, DefBin: "00", Bin: "00", Tag: null},);
      }
      else{
        (memory[index][i].Binary).push({Addr: auxAddr, DefBin: "00", Bin: (value.charCodeAt(valueIndex)).toString(16), Tag: null},);
        memory[index][i].Value = value.charAt(valueIndex) + " " + memory[index][i].Value;
      }
      auxAddr++;
      valueIndex++;
    }
    i++;
  }

  return ret;
}



/*Modifies double precision registers according to simple precision registers*/
function updateDouble(comp, elem){
  for (var j = 0; j < architecture.components.length; j++) {
    for (var z = 0; z < architecture.components[j].elements.length && architecture.components[j].double_precision == true; z++) {
      if(architecture.components[j].elements[z].simple_reg[0] == architecture.components[comp].elements[elem].name){
        var simple = bin2hex(float2bin(architecture.components[comp].elements[elem].value));
        var double = bin2hex(double2bin(architecture.components[j].elements[z].value)).substr(8, 15);
        var newDouble = simple + double;

        architecture.components[j].elements[z].value = hex2double("0x"+newDouble);
      }
      if(architecture.components[j].elements[z].simple_reg[1] == architecture.components[comp].elements[elem].name){
        var simple = bin2hex(float2bin(architecture.components[comp].elements[elem].value));
        var double = bin2hex(double2bin(architecture.components[j].elements[z].value)).substr(0, 8);
        var newDouble = double + simple;

        architecture.components[j].elements[z].value = hex2double("0x"+newDouble);
      }
    }
  }
}

/*Modifies single precision registers according to double precision registers*/
function updateSimple(comp, elem){
  var part1 = bin2hex(double2bin(architecture.components[comp].elements[elem].value)).substr(0, 8);
  var part2 = bin2hex(double2bin(architecture.components[comp].elements[elem].value)).substr(8, 15);

  for (var j = 0; j < architecture.components.length; j++) {
    for (var z = 0; z < architecture.components[j].elements.length; z++) {
      if(architecture.components[j].elements[z].name == architecture.components[comp].elements[elem].simple_reg[0]){
        architecture.components[j].elements[z].value = hex2float("0x"+part1);
      }
      if(architecture.components[j].elements[z].name == architecture.components[comp].elements[elem].simple_reg[1]){
        architecture.components[j].elements[z].value = hex2float("0x"+part2);
      }
    }
  }
}
