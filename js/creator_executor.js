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

// todo: draw_info y draw_space añadirlo a ret...
function packExecute(error, err_msg, err_type, draw)
{
    var ret = {} ;

    ret.error    = error ;
    ret.msg      = err_msg ;
    ret.type     = err_type ;
    ret.draw     = draw ;

    return ret ;
}

function executeInstruction()
{
    return packExecute(false, null, null, null) ;
}

function executeProgramOneShot()
{
    var ret = null;

    for (var i=0; i<10000000; i++)
    {
       ret = executeInstruction();

       if (ret.error == true){
           return ret;
       }
       if (executionIndex < -1) {
           return ret;
       }
    }

  //return packExecute(true, '"ERROR:" Infinite loop', null, null) ;
    return packExecute(false, '', null, null) ;
}

/*Read register value*/
function readRegister(indexComp, indexElem)
{
        if(architecture.components[indexComp].elements[indexElem].properties[0] != "read" && architecture.components[indexComp].elements[indexElem].properties[1] != "read"){
          show_notification('The register '+ architecture.components[indexComp].elements[indexElem].name +' cannot be read', 'danger') ;
          instructions[executionIndex]._rowVariant = 'danger';
          executionIndex = -1;
          return;
        }

        if(architecture.components[indexComp].type == "control" || architecture.components[indexComp].type == "integer"){
          console_log(parseInt((architecture.components[indexComp].elements[indexElem].value).toString()));
          return parseInt((architecture.components[indexComp].elements[indexElem].value).toString());
        }
        if(architecture.components[indexComp].type == "floating point"){
          return parseFloat((architecture.components[indexComp].elements[indexElem].value).toString());
        }
}

/*Write value in register*/
function writeRegister(value, indexComp, indexElem)
{
        if (value == null) {
            return;
        }

        if ((architecture.components[indexComp].type == "integer") ||
            (architecture.components[indexComp].type == "control"))
        {
            if ((architecture.components[indexComp].elements[indexElem].properties[0] != "write") &&
                (architecture.components[indexComp].elements[indexElem].properties[1] != "write"))
            {
                show_notification('The register '+ architecture.components[indexComp].elements[indexElem].name +' cannot be written', 'danger') ;
                instructions[executionIndex]._rowVariant = 'danger';
                executionIndex = -1;
                return;
            }

            architecture.components[indexComp].elements[indexElem].value = bigInt(parseInt(value) >>> 0).value;

            var buttonDec = '#popoverValueContent' + architecture.components[indexComp].elements[indexElem].name  + "Int";
            var buttonHex = '#popoverValueContent' + architecture.components[indexComp].elements[indexElem].name;

            $(buttonDec).attr("class", "btn btn-outline-secondary btn-block btn-sm modRegister");
            $(buttonHex).attr("class", "btn btn-outline-secondary btn-block btn-sm modRegister");

            setTimeout(function() {
              $(buttonDec).attr("class", "btn btn-outline-secondary btn-block btn-sm registers");
              $(buttonHex).attr("class", "btn btn-outline-secondary btn-block btn-sm registers");
            }, 500);
        }

        else if (architecture.components[indexComp].type =="floating point")
        {
          if (architecture.components[indexComp].double_precision == false)
          {
            if (architecture.components[indexComp].elements[indexElem].properties[0] != "write" && architecture.components[indexComp].elements[indexElem].properties[1] != "write")
            {
                show_notification('The register '+ architecture.components[indexComp].elements[indexElem].name +' cannot be written', 'danger') ;
                return;
            }

            architecture.components[indexComp].elements[indexElem].value = parseFloat(value);

            this.updateDouble(indexComp, indexElem);

            var buttonDec = '#popoverValueContent' + architecture.components[indexComp].elements[indexElem].name + "FP";
            var buttonHex = '#popoverValueContent' + architecture.components[indexComp].elements[indexElem].name;

            $(buttonDec).attr("style", "background-color:#c2c2c2;");
            $(buttonHex).attr("style", "background-color:#c2c2c2;");

            setTimeout(function() {
              $(buttonDec).attr("style", "background-color:#f5f5f5;");
              $(buttonHex).attr("style", "background-color:#f5f5f5;");
            }, 500);
          }

          else if (architecture.components[indexComp].double_precision == true)
          {
            if (architecture.components[indexComp].elements[indexElem].properties[0] != "write" && architecture.components[indexComp].elements[indexElem].properties[1] != "write")
            {
	        show_notification('The register '+ architecture.components[indexComp].elements[indexElem].name +' cannot be written', 'danger') ;
                return;
            }

            architecture.components[indexComp].elements[indexElem].value = parseFloat(value);

            this.updateSimple(indexComp, indexElem);

            var buttonDec = '#popoverValueContent' + architecture.components[indexComp].elements[indexElem].name + "DFP";
            var buttonHex = '#popoverValueContent' + architecture.components[indexComp].elements[indexElem].name;

            $(buttonDec).attr("style", "background-color:#c2c2c2;");
            $(buttonHex).attr("style", "background-color:#c2c2c2;");

            setTimeout(function() {
              $(buttonDec).attr("style", "background-color:#f5f5f5;");
              $(buttonHex).attr("style", "background-color:#f5f5f5;");
            }, 500);
          }
        }
}

/*Read memory value*/
function readMemory(addr, type)
{
        var memValue = '';
        var index;

	if (type == "d") {
		debugger; // TODO: Really George? :-)

          if((parseInt(addr, 16) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr, 16) == architecture.memory_layout[0].value || parseInt(addr, 16) == architecture.memory_layout[1].value){
            show_notification('Segmentation fault. You tried to read in the text segment', 'danger') ;
            instructions[executionIndex]._rowVariant = 'danger';
            executionIndex = -1;
            return;
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
                //return bigInt(memValue, 16).value;
		return parseInt(memValue, 16);
              }
            }
          }
	return 0;



	}
        if (type == "w"){
          if((parseInt(addr, 16) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr, 16) == architecture.memory_layout[0].value || parseInt(addr, 16) == architecture.memory_layout[1].value){
            show_notification('Segmentation fault. You tried to read in the text segment', 'danger') ;
            instructions[executionIndex]._rowVariant = 'danger';
            executionIndex = -1;
            return;
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
                //return bigInt(memValue, 16).value;
                return parseInt(memValue,16);
              }
            }
          }
          //return bigInt(0).value;
          return 0;
        }

        if (type == "h"){
          if((parseInt(addr, 16) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr, 16) == architecture.memory_layout[0].value || parseInt(addr, 16) == architecture.memory_layout[1].value){
            show_notification('Segmentation fault. You tried to read in the text segment', 'danger') ;
            instructions[executionIndex]._rowVariant = 'danger';
            executionIndex = -1;
            return;
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
                  //return bigInt(memValue, 16).value;
                  return parseInt(memValue,16);
                }
                else{
                  for (var z = 2; z < memory[index][i].Binary.length; z++){
                    memValue = memory[index][i].Binary[z].Bin + memValue;
                  }
                  //return bigInt(memValue, 16).value;
                  return parseInt(memValue,16);
                }
              }
            }
          }
          //return bigInt(0).value;
          return 0;
        }

        if (type == "b"){
          if((parseInt(addr, 16) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr, 16) == architecture.memory_layout[0].value || parseInt(addr, 16) == architecture.memory_layout[1].value){
            show_notification('Segmentation fault. You tried to read in the text segment', 'danger') ;
            instructions[executionIndex]._rowVariant = 'danger';
            executionIndex = -1;
            return;
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
                //return bigInt(memValue, 16).value;
                return parseInt(memValue,16);
              }
            }
          }
          //return bigInt(0).value;
          return 0;
        }
}

/*Write value in memory*/
function writeMemory(value, addr, type)
{
        if (value == null) {
            return;
        }

        var memValue = (value.toString(16)).padStart(8, "0");
        var index;

        if (type == "w"){
          if((parseInt(addr, 16) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr, 16) == architecture.memory_layout[0].value || parseInt(addr, 16) == architecture.memory_layout[1].value){
            show_notification('Segmentation fault. You tried to write in the text segment', 'danger') ;
            instructions[executionIndex]._rowVariant = 'danger';
            executionIndex = -1;
            return;
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
                //memory[index][i].Value = parseInt(memValue, 16);
                if(memory[index][i].type == "float"){
                  memory[index][i].Value = this.hex2float("0x" + memValue);
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
                  memory[index][i].Value = this.hex2float("0x" + memValue);
                }
                else{
                  memory[index][i].Value = (parseInt(memValue, 16) >> 0);
                }

                app._data.memory[index] = memory[index];
                return;
              }
            }
          }

          for (var i = 0; i < memory[index].length; i++){
            if(memory[index][i].Address > parseInt(addr, 16)){
              var aux_addr = parseInt(addr, 16) - (parseInt(addr, 16)%4);
              memory[index].splice(i, 0, {Address: aux_addr, Binary: [], Value: (parseInt(memValue, 16) >> 0), DefValue: null, reset: false});
              var charIndex = memValue.length-1;
              for (var z = 0; z < 4; z++){
                (memory[index][i].Binary).push({Addr: aux_addr + z, DefBin: "00", Bin: memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase(), Tag: null},);
                charIndex = charIndex - 2;
              }
              app._data.memory[index] = memory[index];
              return;
            }
            else if(i == memory[index].length-1){
              var aux_addr = parseInt(addr, 16) - (parseInt(addr, 16)%4);
              memory[index].push({Address: aux_addr, Binary: [], Value: (parseInt(memValue, 16) >> 0), DefValue: null, reset: false});
              var charIndex = memValue.length-1;
              for (var z = 0; z < 4; z++){
                (memory[index][i+1].Binary).push({Addr: aux_addr + z, DefBin: "00", Bin: memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase(), Tag: null},);
                charIndex = charIndex - 2;
              }
              app._data.memory[index] = memory[index];
              return;
            }
          }

          if(memory[index].length == 0){
            var aux_addr = parseInt(addr, 16) - (parseInt(addr, 16)%4);
            memory[index].push({Address: aux_addr, Binary: [], Value: (parseInt(memValue, 16) >> 0), DefValue: null, reset: false});
            var charIndex = memValue.length-1;
            for (var z = 0; z < 4; z++){
              (memory[index][memory[index].length-1].Binary).push({Addr: aux_addr + z, DefBin: "00", Bin: memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase(), Tag: null},);
              charIndex = charIndex - 2;
            }
            app._data.memory[index] = memory[index];
            return;
          }
        }

        if (type == "h"){
          if((parseInt(addr, 16) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr, 16) == architecture.memory_layout[0].value || parseInt(addr, 16) == architecture.memory_layout[1].value){
            show_notification('Segmentation fault. You tried to write in the text segment', 'danger') ;
            instructions[executionIndex]._rowVariant = 'danger';
            executionIndex = -1;
            return;
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
                  var charIndex = memValue.length-1;
                  for (var z = 0; z < memory[index][i].Binary.length - 2; z++){
                    memory[index][i].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                    charIndex = charIndex - 2;
                  }

                  memory[index][i].Value = null;
                  for (var z = 3; z < 4; z=z-2){
                    memory[index][i].Value = memory[index][i].Value + (parseInt((memory[index][i].Binary[z].Bin + memory[index][i].Binary[z-1].Bin), 16) >> 0) + " ";
                  }
                  app._data.memory[index] = memory[index];
                  return;
                }
                else{
                  var charIndex = memValue.length-1;
                  for (var z = 2; z < memory[index][i].Binary.length; z++){
                    memory[index][i].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                    charIndex = charIndex - 2;
                  }
                  app._data.memory[index] = memory[index];
                  return;
                }
              }
            }
          }

          for (var i = 0; i < memory[index].length; i++){
            if(memory[index][i].Address > parseInt(addr, 16)){
              var aux_addr = parseInt(addr, 16) - (parseInt(addr, 16)%4);
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
                    app._data.memory[index] = memory[index];
                    return;
                  }
                }
              }
              return;
            }
            else if(i == memory[index].length-1){
              var aux_addr = parseInt(addr, 16) - (parseInt(addr, 16)%4);
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
                    app._data.memory[index] = memory[index];
                    return;
                  }
                }
              }
              return;
            }
          }

          if(memory[index].length == 0){
            var aux_addr = parseInt(addr, 16) - (parseInt(addr, 16)%4);
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
                  app._data.memory[index] = memory[index];
                  return;
                }
              }
            }
            return;
          }
        }

        if (type == "b"){
          if((parseInt(addr, 16) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr, 16) == architecture.memory_layout[0].value || parseInt(addr, 16) == architecture.memory_layout[1].value){
            show_notification('Segmentation fault. You tried to write in the text segment', 'danger') ;
            instructions[executionIndex]._rowVariant = 'danger';
            executionIndex = -1;
            return;
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
            if(memory[index][i].Address > parseInt(addr, 16)){
              var aux_addr = parseInt(addr, 16) - (parseInt(addr, 16)%4);
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
              var aux_addr = parseInt(addr, 16) - (parseInt(addr, 16)%4);
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
            var aux_addr = parseInt(addr, 16) - (parseInt(addr, 16)%4);
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
        if(stackLimit != null){
          if(stackLimit <= architecture.memory_layout[3].value && stackLimit >= architecture.memory_layout[2].value){
            show_notification('Segmentation fault. You tried to write in the data segment', 'danger') ;
            instructions[executionIndex]._rowVariant = 'danger';
            executionIndex = -1;
            return;
          }
          else if(stackLimit <= architecture.memory_layout[1].value && stackLimit >= architecture.memory_layout[0].value){
            show_notification('Segmentation fault. You tried to write in the text segment', 'danger') ;
            instructions[executionIndex]._rowVariant = 'danger';
            executionIndex = -1;
            return;
          }
          else{
            if(stackLimit < architecture.memory_layout[4].value){
              var diff = architecture.memory_layout[4].value - stackLimit;
              var auxStackLimit = stackLimit;

              for (var i = 0; i < (diff/4); i++){
                if(unallocated_memory.length > 0){
                  memory[memory_hash[2]].splice(i, 0, unallocated_memory[unallocated_memory.length-1]);
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
function syscall ( action, indexComp, indexElem, indexComp2, indexElem2 )
{
        switch(action){
          case "print_int":
            var value = architecture.components[indexComp].elements[indexElem].value;
            app._data.display = app._data.display + (parseInt(value.toString()) >> 0);
            break;
          case "print_float":
            var value = architecture.components[indexComp].elements[indexElem].value;
            app._data.display = app._data.display + value;
            break;
          case "print_double":
            var value = architecture.components[indexComp].elements[indexElem].value;
            app._data.display = app._data.display + value;
            break;
          case "print_string":
            var addr = architecture.components[indexComp].elements[indexElem].value;
            var index;

            if((parseInt(addr) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr) == architecture.memory_layout[0].value || parseInt(addr) == architecture.memory_layout[1].value){
              show_notification('Segmentation fault. You tried to write in the text segment', 'danger') ;
              instructions[executionIndex]._rowVariant = 'danger';
              executionIndex = -1;
              this.keyboard = "";
              return;
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
                    for (var k = j; k < memory[index][i].Binary.length; k++){
                      console_log(parseInt(memory[index][i].Binary[k].Bin, 16));
                      console_log(String.fromCharCode(parseInt(memory[index][i].Binary[k].Bin, 16)));
                      app._data.display = app._data.display + String.fromCharCode(parseInt(memory[index][i].Binary[k].Bin, 16));
                      if(memory[index][i].Binary[k].Bin == 0){
                        return
                      }
                      else if(i == memory[index].length-1 && k == memory[index][i].Binary.length-1){
                        return;
                      }
                      j=0;
                    }
                  }
                }
              }
            }

            break;
          case "read_int":
            mutexRead = true;
            app._data.enter = false;

            console_log(mutexRead);
            if(newExecution == true){
              this.keyboard = "";
              consoleMutex = false;
              mutexRead = false;
              app._data.enter = null;

	      			show_notification('The data has been uploaded', 'info') ;

              if(runExecution == false){
                this.executeProgram();
              }

              return;
            }

            if(consoleMutex == false){
              setTimeout(this.syscall, 1000, "read_int", indexComp, indexElem, indexComp2, indexElem2);
            }
            else{
              var value = parseInt(this.keyboard);
              console_log(value);
              writeRegister(value, indexComp, indexElem);
              this.keyboard = "";
              consoleMutex = false;
              mutexRead = false;
              app._data.enter = null;

		    			show_notification('The data has been uploaded', 'info') ;

              if(executionIndex >= instructions.length){
                for (var i = 0; i < instructions.length; i++){
                  instructions[i]._rowVariant = '';
                }

                executionIndex = -2;
                show_notification('The execution of the program has finished', 'success') ;
                return;
              }
              else if(runExecution == false){
                this.executeProgram();
              }
              break;
            }

            break;
          case "read_float":
            mutexRead = true;
            app._data.enter = false;
            console_log(mutexRead);
            if(newExecution == true){
              this.keyboard = "";
              consoleMutex = false;
              mutexRead = false;
              app._data.enter = null;

		    			show_notification('The data has been uploaded', 'info') ;

              if(runExecution == false){
                this.executeProgram();
              }

              return;
            }

            if(consoleMutex == false){
              setTimeout(this.syscall, 1000, "read_float", indexComp, indexElem, indexComp2, indexElem2);
            }
            else{
              var value = parseFloat(this.keyboard, 10);
              console_log(value);
              writeRegister(value, indexComp, indexElem);
              this.keyboard = "";
              consoleMutex = false;
              mutexRead = false;
              app._data.enter = null;

		    			show_notification('The data has been uploaded', 'info') ;

              if(executionIndex >= instructions.length){
                for (var i = 0; i < instructions.length; i++) {
                  instructions[i]._rowVariant = '';
                }

                executionIndex = -2;
                show_notification('The execution of the program has finished', 'success') ;
                return;
              }
              else if(runExecution == false){
                this.executeProgram();
              }

              break;
            }

            break;
          case "read_double":
            mutexRead = true;
            app._data.enter = false;
            console_log(mutexRead);
            if(newExecution == true){
              this.keyboard = "";
              consoleMutex = false;
              mutexRead = false;
              app._data.enter = null;

		    			show_notification('The data has been uploaded', 'info') ;

              if(runExecution == false){
                this.executeProgram();
              }

              return;
            }

            if(consoleMutex == false){
              setTimeout(this.syscall, 1000, "read_double", indexComp, indexElem, indexComp2, indexElem2);
            }
            else{
              var value = parseFloat(this.keyboard, 10);
              console_log(value);
              writeRegister(value, indexComp, indexElem);
              this.keyboard = "";
              consoleMutex = false;
              mutexRead = false;
              app._data.enter = null;

		    			show_notification('The data has been uploaded', 'info') ;

              if(executionIndex >= instructions.length){
                for (var i = 0; i < instructions.length; i++) {
                  instructions[i]._rowVariant = '';
                }

                executionIndex = -2;
                show_notification('The execution of the program has finished', 'success') ;
                return;
              }
              else if(runExecution == false){
                this.executeProgram();
              }

              break;
            }

            break;
          case "read_string":
            mutexRead = true;
            app._data.enter = false;
            console_log(mutexRead);
            if(newExecution == true){
              this.keyboard = "";
              consoleMutex = false;
              mutexRead = false;
              app._data.enter = null;

		    			show_notification('The data has been uploaded', 'info') ;

              if(runExecution == false){
                this.executeProgram();
              }

              return;
            }

            if(consoleMutex == false){
              setTimeout(this.syscall, 1000, "read_string", indexComp, indexElem, indexComp2, indexElem2);
            }
            else{
              var addr = architecture.components[indexComp].elements[indexElem].value;
              var value = "";
              var valueIndex = 0;

              for (var i = 0; i < architecture.components[indexComp2].elements[indexElem2].value && i < this.keyboard.length; i++){
                value = value + this.keyboard.charAt(i);
              }

              console_log(value);

              var auxAddr = data_address;
              var index;

              if((parseInt(addr) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr) == architecture.memory_layout[0].value || parseInt(addr) == architecture.memory_layout[1].value){
                show_notification('Segmentation fault. You tried to write in the text segment', 'danger') ;
                instructions[executionIndex-1]._rowVariant = 'danger';
                executionIndex = -1;
                this.keyboard = "";
                return;
              }

              if((parseInt(addr) > architecture.memory_layout[2].value && parseInt(addr) < architecture.memory_layout[3].value) ||  parseInt(addr) == architecture.memory_layout[2].value || parseInt(addr) == architecture.memory_layout[3].value){
                index = memory_hash[0];
              }

              if((parseInt(addr) > architecture.memory_layout[4].value && parseInt(addr) < architecture.memory_layout[5].value) ||  parseInt(addr) == architecture.memory_layout[4].value || parseInt(addr) == architecture.memory_layout[5].value){
                index = memory_hash[2];
              }

              for (var i = 0; i < memory[index].length && this.keyboard.length > 0; i++){
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

              if(valueIndex == value.length){
                this.keyboard = "";
                consoleMutex = false;
                mutexRead = false;
                app._data.enter = null;

		      			show_notification('The data has been uploaded', 'info') ;

                if(executionIndex >= instructions.length){
                  for (var i = 0; i < instructions.length; i++) {
                    instructions[i]._rowVariant = '';
                  }

                  executionIndex = -2;
                  show_notification('The execution of the program has finished', 'success') ;
                  return;
                }
                else if(runExecution == false){
                  this.executeProgram();
                }

                return;
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

              app._data.memory[index] = memory[index];

              this.keyboard = "";
              consoleMutex = false;
              mutexRead = false;
              app._data.enter = null;

		    			show_notification('The data has been uploaded', 'info') ;

              if(executionIndex >= instructions.length){
                for (var i = 0; i < instructions.length; i++) {
                  instructions[i]._rowVariant = '';
                }

                executionIndex = -2;
                show_notification('The execution of the program has finished', 'success') ;
                return;
              }
              else if(runExecution == false){
                this.executeProgram();
              }

              break;
            }

            break;
          case "sbrk":
            var aux_addr = architecture.memory_layout[3].value;

            if((architecture.memory_layout[3].value+parseInt(architecture.components[indexComp].elements[indexElem].value)) >= architecture.memory_layout[4].value){
		    			show_notification('Not enough memory for data segment', 'danger') ;
              instructions[executionIndex]._rowVariant = 'danger';
              executionIndex = -1;
              return;
            }

            for (var i = 0; i < ((parseInt(architecture.components[indexComp].elements[indexElem].value))/4); i++){
              memory[memory_hash[0]].push({Address: aux_addr, Binary: [], Value: null, DefValue: null, reset: true});
              for (var z = 0; z < 4; z++){
                (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: aux_addr, DefBin: "00", Bin: "00", Tag: null},);
                aux_addr++;
              }
            }

            app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
            architecture.memory_layout[3].value = aux_addr-1;
            this.architecture.memory_layout[3].value = aux_addr-1;

            break;
          case "exit":
            executionIndex = instructions.length + 1;
            break;
          case "print_char":
            var aux = architecture.components[indexComp].elements[indexElem].value;
            var aux2 = aux.toString(16);
            var length = aux2.length;

            var value = aux2.substring(length-2, length);
            this.display = this.display + String.fromCharCode(parseInt(value, 16));
            break;
          case "read_char":
            mutexRead = true;
            app._data.enter = false;
            console_log(mutexRead);
            if(newExecution == true){
              this.keyboard = "";
              consoleMutex = false;
              mutexRead = false;
              app._data.enter = null;

		    			show_notification('The data has been uploaded', 'info') ;

              if(runExecution == false){
                this.executeProgram();
              }

              return;
            }
            if(consoleMutex == false){
              setTimeout(this.syscall, 1000, "read_char", indexComp, indexElem, indexComp2, indexElem2);
            }
            else{
              var value = (this.keyboard).charCodeAt(0);
              writeRegister(value, indexComp, indexElem);
              this.keyboard = "";
              consoleMutex = false;
              mutexRead = false;
              app._data.enter = null;

		    			show_notification('The data has been uploaded', 'info') ;

              console_log(mutexRead);

              if(executionIndex >= instructions.length){
                for (var i = 0; i < instructions.length; i++){
                  instructions[i]._rowVariant = '';
                }

                executionIndex = -2;
                show_notification('The execution of the program has finished', 'success') ;
                return;
              }
              else if(runExecution == false){
                this.executeProgram();
              }

              break;
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
          for (var i = 0; i < instructions.length; i++) {
            instructions[i]._rowVariant = '';
          }
          executionIndex = 0;
          executionInit = 1;

          /*Reset stats*/
          totalStats=0;
          for (var i = 0; i < stats.length; i++){
            stats[i].percentage = 0;
            stats[i].number_instructions = 0;
          }

          /*Reset console*/
          mutexRead = false;
          newExecution = true;

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

          unallocated_memory = [];
          app._data.unallocated_memory = unallocated_memory;

          for (var i = 0; i < instructions.length; i++) {
            if(instructions[i].Label == "main"){
              instructions[i]._rowVariant = 'success';
            }
          }
}

