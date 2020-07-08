/*
 *  Copyright 2018-2019 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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


/********************
 * Global variables *
 ********************/

/*Architecture editor*/

/*Available architectures*/
var architecture_available = [];
/*New architectures*/
var load_architectures_available = [];
var load_architectures = [];
/*Architectures card background*/
var back_card = [];
/*Load architecture*/
var architecture = {components:[], instructions:[], directives:[], memory_layout:[]};
var architecture_hash = [];
/*Components form select*/
var componentsTypes = [
  { text: 'Integer', value: 'integer' },
  { text: 'Floating point', value: 'floating point' },
  { text: 'Control', value: 'control' },
];
/*Intructions form select*/
var instructionsTypes = [
  { text: 'Arithmetic integer', value: 'Arithmetic integer' },
  { text: 'Arithmetic floating point', value: 'Arithmetic floating point' },
  { text: 'Logic', value: 'Logic' },
  { text: 'Transfer between registers', value: 'Transfer between registers' },
  { text: 'Memory access', value: 'Memory access' },
  { text: 'Comparison', value: 'Comparison' },
  { text: 'I/O', value: 'I/O' },
  { text: 'Syscall', value: 'Syscall' },
  { text: 'Control', value: 'Control' },
  { text: 'Function call', value: 'Function call' },
  { text: 'Conditional bifurcation', value: 'Conditional bifurcation' },
  { text: 'Unconditional bifurcation', value: 'Unconditional bifurcation' },
  { text: 'Other', value: 'Other' },
];
/*Directives form select*/
var actionTypes = [
  { text: 'Data Segment', value: 'data_segment' },
  { text: 'Code Segment', value: 'code_segment' },
  { text: 'Global Symbol', value: 'global_symbol' },
  { text: 'Byte', value: 'byte' },
  { text: 'Half Word', value: 'half_word' },
  { text: 'Word', value: 'word' },
  { text: 'Double Word', value: 'double_word' },
  { text: 'Float', value: 'float' },
  { text: 'Double', value: 'double' },
  { text: 'Space', value: 'space' },
  { text: 'ASCII not finished in null', value: 'ascii_not_null_end' },
  { text: 'ASCII finished in null', value: 'ascii_null_end' },
  { text: 'Align', value: 'align' },
  { text: 'Baling', value: 'baling'},
];


/*Compilator*/

/*Codemirror*/
var textarea_assembly_editor;
/*Assembly code textarea*/
var code_assembly = '';
/*Compilation index*/
var tokenIndex = 0;
/*Instructions memory address*/
var address;
/*Data memory address*/
var data_address;
/*Stack memory address*/
var stack_address;
/*Backup memory address*/
var backup_stack_address;
var backup_data_address;
/*Pending instructions and pending tags*/
var pending_instructions = [];
var pending_tags = [];
/*Global functions*/
var extern = [];
/*Error code messages*/
var compileError = [
  { mess1: "Empty label", mess2: "" },
  { mess1: "Repeated tag: ", mess2: "" },
  { mess1: "Instruction '", mess2: "' not found" },
  { mess1: "Incorrect sintax --> ", mess2: "" },
  { mess1: "Register '", mess2: "' not found" },
  { mess1: "Immediate number '", mess2: "' is too big" },
  { mess1: "Immediate number '", mess2: "' is not valid" },
  { mess1: "Tag '", mess2: "' is not valid" },
  { mess1: "Address '", mess2: "' is too big" },
  { mess1: "Address '", mess2: "' is not valid" },
  { mess1: "This field '", mess2: "' must start with a '('" },
  { mess1: "This field '", mess2: "' must end with a ')'" },
  { mess1: "This field is too small to encode in binary '", mess2: "" },
  { mess1: "This field is too small to encode in binary '", mess2: "" },
  { mess1: "Incorrect pseudoinstruction definition ", mess2: "" },
  { mess1: "Invalid directive: ", mess2: "" },
  { mess1: "Invalid data: ", mess2: " The data must be a number" }, 
  { mess1: 'The string of characters must start with "', mess2: "" }, 
  { mess1: "Number '", mess2: "' is too big" },
  { mess1: "Number '", mess2: "' is empty" },
  { mess1: "The text segment should start with '", mess2: "'" },
  { mess1: "The data must be aligned", mess2: "" },
  { mess1: "The number should be positive '", mess2: "'" },
  { mess1: "Empty directive", mess2: "" },
  { mess1: "After the comma you should go a blank --> ", mess2: "" },
  { mess1: "Incorrect sintax", mess2: "" },
  { mess1: "Syntax error near line: ", mess2: "" },
];
/*Promise*/
let promise;


/*Simulator*/

/*Displayed notifications*/
var notifications = [];
/*Available examples*/
var example_available = [];
/*Execution*/
var executionIndex = 0;
var runExecution = false;
var iter1 = 1;
var executionInit = 1;
/*Keyboard*/
var consoleMutex = false;
var mutexRead = false;
var newExecution = true;
/*Memory*/
var memory_hash = ["data_memory", "instructions_memory", "stack_memory"];
var memory = {data_memory: [], instructions_memory: [], stack_memory: []};
var unallocated_memory = [];
/*Instructions memory*/
var instructions = [];
var instructions_tag = [];
var instructions_binary = [];
/*Data memory*/
var data = [];
var data_tag = [];
/*Binary*/
var code_binary = '';
var update_binary = '';
/*Stats*/
var totalStats = 0;
var stats = [
  { type: 'Arithmetic integer', number_instructions: 0, percentage: 0, abbreviation: "AI" },
  { type: 'Arithmetic floating point', number_instructions: 0, percentage: 0, abbreviation: "AFP" },
  { type: 'Logic', number_instructions: 0, percentage: 0, abbreviation: "Log" },
  { type: 'Transfer between registers', number_instructions: 0, percentage: 0, abbreviation: "Trans" },
  { type: 'Memory access', number_instructions: 0, percentage: 0, abbreviation: "Mem" },
  { type: 'Comparison', number_instructions: 0, percentage: 0, abbreviation: "Comp" },
  { type: 'I/O', number_instructions: 0, percentage: 0, abbreviation: "I/O" },
  { type: 'Syscall', number_instructions: 0, percentage: 0, abbreviation: "Sys" },
  { type: 'Control', number_instructions: 0, percentage: 0, abbreviation: "Ctrl" },
  { type: 'Function call', number_instructions: 0, percentage: 0, abbreviation: "FC" },
  { type: 'Conditional bifurcation', number_instructions: 0, percentage: 0, abbreviation: "CB" },
  { type: 'Unconditional bifurcation', number_instructions: 0, percentage: 0, abbreviation: "UB" },
  { type: 'Other', number_instructions: 0, percentage: 0, abbreviation: "Oth" },
];


//
// Load architecture
//


/*String to Bigint number*/
function bigInt_deserialize(object)
{
    var auxObject = object;

    for (var i = 0; i < auxObject.components.length; i++)
    {
      if (auxObject.components[i].type != "floating point")
      {
        for (var j = 0; j < auxObject.components[i].elements.length; j++)
	{
             var aux = auxObject.components[i].elements[j].value;
             var auxBigInt = bigInt(parseInt(aux) >>> 0, 10).value;
             auxObject.components[i].elements[j].value = auxBigInt;

             if (auxObject.components[i].double_precision != true)
	     {
               var aux = auxObject.components[i].elements[j].default_value;
               var auxBigInt = bigInt(parseInt(aux) >>> 0, 10).value;
               auxObject.components[i].elements[j].default_value = auxBigInt;
             }
        }
      }
    }

    return auxObject;
}


/*Bigint number to string*/
function bigInt_serialize(object)
{
    var auxObject = jQuery.extend(true, {}, object);

    for (var i = 0; i < architecture.components.length; i++)
    {
      if (architecture.components[i].type != "floating point")
	 {
           for (var j = 0; j < architecture.components[i].elements.length; j++)
	   {
                var aux = architecture.components[i].elements[j].value;
                var auxString = aux.toString();
                auxObject.components[i].elements[j].value = auxString;

                if (architecture.components[i].double_precision != true)
		{
                    var aux = architecture.components[i].elements[j].default_value;
                    var auxString = aux.toString();
                    auxObject.components[i].elements[j].default_value = auxString;
                }
           }
         }
    }

    return auxObject;
}


//
// Load architecture
//


//
// Console.log
//

var creator_debug = false ;

function console_log ( msg )
{
	if (creator_debug) {
	    console.log(msg) ;
	}
}


//
// Compiler
//

/*Compile assembly code*/
function packCompileError( err_code, err_msg, err_ti )
{
  var ret = {} ;

  ret.status     = "error" ;
  ret.errorcode  = err_code ;
  ret.token      = err_msg;
  ret.type       = "danger" ;
  ret.tokenIndex = tokenIndex ;

  return ret ;
}

/*Places the pointer in the first position*/
function first_token()
{
        var assembly = textarea_assembly_editor.getValue();
        var index = tokenIndex;

        while(((assembly.charAt(index) == ':') || (assembly.charAt(index) == '\t') || (assembly.charAt(index) == '\n') || (assembly.charAt(index) == ' ') || (assembly.charAt(index) == '\r') || (assembly.charAt(index) == '#')) && (index < assembly.length)){
          while(((assembly.charAt(index) == ':') || (assembly.charAt(index) == '\t') || (assembly.charAt(index) == '\n') || (assembly.charAt(index) == ' ') || (assembly.charAt(index) == '\r')) && (index < assembly.length)){
            index++;
          }

          if(assembly.charAt(index) == '#'){
            while((assembly.charAt(index) != '\n') && (index < assembly.length)){
              index++;
            }

            while(((assembly.charAt(index) == ':') || (assembly.charAt(index) == '\t') || (assembly.charAt(index) == '\n') || (assembly.charAt(index) == ' ') || (assembly.charAt(index) == '\r')) && (index < assembly.length)){
              index++;
            }
          }
        }

        tokenIndex = index;
}

/*Read token*/
function get_token()
{
        var assembly = textarea_assembly_editor.getValue();
        var index = tokenIndex;

        if(index >= assembly.length){
          return null;
        }

        console_log(assembly.charAt(index));
        console_log(index);

        if(assembly.charAt(index) == "'"){
          index++;
          while(assembly.charAt(index) != "'" && index < assembly.length){
            console_log(assembly.charAt(index));
            console_log(index);
            index++;
          }
          index++;

          console_log(assembly.substring(tokenIndex, index));
          console_log(index);
          console_log(assembly.substring(tokenIndex, index));
          return assembly.substring(tokenIndex, index);
        }

        if(assembly.charAt(index) == '"'){
          index++;
          while(assembly.charAt(index) != '"' && index < assembly.length){
            console_log(assembly.charAt(index));
            console_log(index);
            index++;
          }
          index++;

          console_log(assembly.substring(tokenIndex, index));
          console_log(index);
          console_log(assembly.substring(tokenIndex, index));
          return assembly.substring(tokenIndex, index);
        }



        if((assembly.charAt(index) == '(') || (assembly.charAt(index) == '[') || (assembly.charAt(index) == '{')){
          index++;
        }

        while((assembly.charAt(index) != ',') && (assembly.charAt(index) != '(') && (assembly.charAt(index) != ')') && (assembly.charAt(index) != '[') && (assembly.charAt(index) != ']') && (assembly.charAt(index) != '{') && (assembly.charAt(index) != '}') && (assembly.charAt(index) != ':') && (assembly.charAt(index) != '#') && (assembly.charAt(index) != '\t') && (assembly.charAt(index) != '\n') && (assembly.charAt(index) != ' ') && (assembly.charAt(index) != '\r') && (index < assembly.length)){
          index++;
        }

        var res;
        if((assembly.charAt(index) == ':') || (assembly.charAt(index) == ')') || (assembly.charAt(index) == ']') || (assembly.charAt(index) == '}')){
          res = assembly.substring(tokenIndex, index) + assembly.charAt(index);
        }
        else{
          res = assembly.substring(tokenIndex, index);
        }

        return res;
}

/*Places the pointer in the start of next token*/
function next_token()
{
        var assembly = textarea_assembly_editor.getValue();
        var index = tokenIndex;

        console_log(assembly.charAt(index));
        if(assembly.charAt(index) == "'"){
          index++;
          while(assembly.charAt(index) != "'" && index < assembly.length){
            console_log(assembly.charAt(index));
            index++;
          }
          index++;
        }

        if(assembly.charAt(index) == '"'){
          index++;
          while(assembly.charAt(index) != '"' && index < assembly.length){
            console_log(assembly.charAt(index));
            index++;
          }
          index++;
        }

        if((assembly.charAt(index) == '(') || (assembly.charAt(index) == '[') || (assembly.charAt(index) == '{')){
          index++;
        }

        while((assembly.charAt(index) != ',') && (assembly.charAt(index) != '(') && (assembly.charAt(index) != ')') && (assembly.charAt(index) != '[') && (assembly.charAt(index) != ']') && (assembly.charAt(index) != '{') && (assembly.charAt(index) != '}') && (assembly.charAt(index) != ':') && (assembly.charAt(index) != '#') && (assembly.charAt(index) != '\t') && (assembly.charAt(index) != '\n') && (assembly.charAt(index) != ' ') && (assembly.charAt(index) != '\r') && (index < assembly.length)){
          index++;
        }

        while(((assembly.charAt(index) == ',') || (assembly.charAt(index) == '(') || (assembly.charAt(index) ==')') || (assembly.charAt(index) == '[') || (assembly.charAt(index) == ']') || (assembly.charAt(index) == '{') || (assembly.charAt(index) == '}') || (assembly.charAt(index) == ':') || (assembly.charAt(index) == '\t') || (assembly.charAt(index) == '\n') || (assembly.charAt(index) == ' ') || (assembly.charAt(index) == '\r') || (assembly.charAt(index) == '#')) && (index < assembly.length)){

          while(((assembly.charAt(index) ==',') || (assembly.charAt(index) ==')') || (assembly.charAt(index) == ']') || (assembly.charAt(index) == '}') || (assembly.charAt(index) == ':') || (assembly.charAt(index) == '\t') || (assembly.charAt(index) == '\n') || (assembly.charAt(index) == ' ') || (assembly.charAt(index) == '\r')) && (index < assembly.length)){
            index++;
          }

          if((assembly.charAt(index) =='(') || (assembly.charAt(index) == '[') || (assembly.charAt(index) == '{')){
            break;
          }

          if(assembly.charAt(index) == '#'){
            while((assembly.charAt(index) != '\n') && (index < assembly.length)){
              index++;
            }

            while(((assembly.charAt(index) == '(') || (assembly.charAt(index) ==')') || (assembly.charAt(index) == '[') || (assembly.charAt(index) == ']') || (assembly.charAt(index) == '{') || (assembly.charAt(index) == '}') || (assembly.charAt(index) == ':') || (assembly.charAt(index) == '\t') || (assembly.charAt(index) == '\n') || (assembly.charAt(index) == ' ') || (assembly.charAt(index) == '\r')) && (index < assembly.length)){
              index++;
            }
          }
        }
        tokenIndex = index;
}

/*Compile assembly code*/
function assembly_compiler()
{
	var ret = {
          update: "",
          status: "ok"
        } ;


	// TODO: move UI to caller
	
        show_loading();
        promise = new Promise((resolve, reject) => {
          setTimeout(function(){
            instructions = [];
            instructions_tag = [];
            pending_instructions = [];
            pending_tags = [];
            memory[memory_hash[0]] = [];
            data_tag = [];
            instructions_binary =[];
            memory[memory_hash[1]] = [];
            extern = [];
            memory[memory_hash[2]] = [];
            data = [];
            executionInit = 1;
            mutexRead = false;

            if(update_binary.instructions_binary != null){
              for(var i = 0; i < update_binary.instructions_binary.length; i++){
                instructions.push(update_binary.instructions_binary[i]);
                if(i == 0){
                  instructions[instructions.length-1].hide = false;
                  if(update_binary.instructions_binary[i].globl == false){
                    instructions[instructions.length-1].Label = "";
                  }
                }
                else if(update_binary.instructions_binary[i].globl == false){
                  instructions[instructions.length-1].Label = "";
                  instructions[instructions.length-1].hide = true;
                }
                else if(update_binary.instructions_binary[i].globl == null){
                  instructions[instructions.length-1].hide = true;
                }
                else{
                  instructions[instructions.length-1].hide = false;
                }

                address = parseInt(instructions[instructions.length-1].Address, 16) + 4;
              }
            }
            else{
              address = parseInt(architecture.memory_layout[0].value);
            }

            var numBinaries = instructions.length;


            /*Allocation of memory addresses*/
            architecture.memory_layout[4].value = backup_stack_address;
            architecture.memory_layout[3].value = backup_data_address;
            data_address = parseInt(architecture.memory_layout[2].value);
            stack_address = parseInt(architecture.memory_layout[4].value);

            architecture.components[1].elements[29].value = bigInt(stack_address).value;
            architecture.components[0].elements[0].value = bigInt(address).value;
            architecture.components[1].elements[29].default_value = bigInt(stack_address).value;
            architecture.components[0].elements[0].default_value = bigInt(address).value;

            /*Reset stats*/
            totalStats = 0;
            for (var i = 0; i < stats.length; i++){
              stats[i].percentage = 0;
              stats[i].number_instructions = 0;
            }

            align = 0;
            var empty = false;

            /*Save a backup in the cache memory*/
            if (typeof(Storage) !== "undefined") {
              var auxObject = jQuery.extend(true, {}, architecture);

              var auxArchitecture = bigInt_serialize(auxObject);
              var auxArch = JSON.stringify(auxArchitecture, null, 2);

              var date = new Date();
              var auxDate = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+" - "+date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
              console_log(app._data.architecture_name);
              localStorage.setItem("arch_name", app._data.architecture_name);
              localStorage.setItem("architecture_copy", auxArch);
              localStorage.setItem("assembly_copy", textarea_assembly_editor.getValue());
              localStorage.setItem("date_copy", auxDate);
            }

            /*Start of compilation*/
            first_token();

            if(get_token() == null){
              hide_loading();
              show_notification('Please enter the assembly code before compiling', 'danger') ;
              return -1;
            }

            token = get_token();
            console_log(token)

            while(!empty){
              token = get_token();
              console_log(token)

              if(token == null){
                empty = true;
                break;
              }

              var change = false;

              for(var i = 0; i < architecture.directives.length; i++){
                if(token == architecture.directives[i].name){
                  switch(architecture.directives[i].action){
                    case "data_segment":
                      console_log("data_segment")
                      var result = data_segment_compiler();
                      if(result == 0){
                        change = true;
                      }
                      if(result == -1){
                        tokenIndex = 0;
                        instructions = [];
                        pending_instructions = [];
                        pending_tags = [];
                        memory[memory_hash[0]] = [];
                        data_tag = [];
                        instructions_binary = [];
                        memory[memory_hash[1]] = [];
                        memory[memory_hash[2]] = [];
                        data = [];
                        extern = [];
                        app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
                        app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
                        app._data.memory[memory_hash[2]] = memory[memory_hash[2]];
                        app._data.instructions = instructions;
                        hide_loading();
                        return -1;
                      }
                      break;
                    case "code_segment":
                      console_log("code_segment")
                      var result = code_segment_compiler();
                      if(result == 0){
                        change = true;
                      }
                      if(result == -1){
                        tokenIndex = 0;
                        instructions = [];
                        pending_instructions = [];
                        pending_tags = [];
                        memory[memory_hash[0]] = [];
                        data_tag = [];
                        instructions_binary = [];
                        memory[memory_hash[1]] = [];
                        extern = [];
                        memory[memory_hash[2]] = [];
                        data = [];
                        app._data.instructions = instructions;
                        app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
                        app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
                        app._data.memory[memory_hash[2]] = memory[memory_hash[2]];
                        hide_loading();
                        return -1;
                      }
                      break;
                    case "global_symbol":

                      var isGlobl = true;
                      app.next_token();

                      while(isGlobl){
                        token = get_token();

                        re = new RegExp(",", "g");
                        token = token.replace(re, "");

                        console_log(token)
                        extern.push(token);
                        change = true;

                        app.next_token();
                        token = get_token();

                        console_log(token)

                        for(var z = 0; z < architecture.directives.length; z++){
                          if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                            isGlobl = false;
                          }
                        }
                      }

                      break;
                    default:
                      console_log("default")
                      empty = true;
                      break;
                  }
                }

                else if(i== architecture.directives.length-1 && token != architecture.directives[i].name && change == false && token != null){
                  empty = true;
                  app.compileError(15, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                  hide_loading();
                  tokenIndex = 0;
                  return -1;
                } 
              }
            }

            var found = false;

            if(update_binary.instructions_binary != null){
              for(var j = 0; j<instructions.length; j++){
                if(instructions[j].Label != ""){
                  for(var i = 0; i<update_binary.instructions_tag.length; i++){
                    if(instructions[j].Label == update_binary.instructions_tag[i].tag){
                      update_binary.instructions_tag[i].addr = instructions[j].Address;
                    }
                  }
                }
              }
            }

            /*Check pending instructions*/
            for(var i = 0; i < pending_instructions.length; i++){
              var exit = 0;
              var signatureParts = pending_instructions[i].signature;
              var signatureRawParts = pending_instructions[i].signatureRaw;
              var instructionParts = (pending_instructions[i].instruction).split(' ');
              console_log(instructionParts);
              for (var j = 0; j < signatureParts.length && exit == 0; j++){
                if(signatureParts[j] == "inm-signed" || signatureParts[j] == "inm-unsigned" || signatureParts[j] == "address"){
                  for (var z = 0; z < instructions.length && exit == 0; z++){
                    if(instructions[z].Label == instructionParts[j]){
                      var addr = instructions[z].Address;
                      var bin = parseInt(addr, 16).toString(2);
                      var startbit = pending_instructions[i].startBit;
                      var stopbit = pending_instructions[i].stopBit;

                      instructionParts[j] = addr;
                      var newInstruction = "";
                      for (var w = 0; w < instructionParts.length; w++) {
                        if(w == instructionParts.length-1){
                          newInstruction = newInstruction + instructionParts[w];
                        }
                        else{
                          newInstruction = newInstruction + instructionParts[w] + " ";
                        }
                      }
                      for (var w = 0; w < instructions.length && exit == 0; w++) {
                        var aux = "0x" + (pending_instructions[i].address).toString(16);
                        if(aux == instructions[w].Address){
                          instructions[w].loaded = newInstruction;
                        }
                      }

                      for (var w = 0; w < instructions.length && exit == 0; w++) {
                        var aux = "0x" + (pending_instructions[i].address).toString(16);
                        if(aux == instructions[w].Address){
                          instructions[w].loaded = newInstruction;
                          var fieldsLength = startbit - stopbit + 1;
                          console_log(w)
                          console_log(numBinaries)
                          console_log(w - numBinaries)
                          instructions_binary[w - numBinaries].loaded = instructions_binary[w - numBinaries].loaded.substring(0, instructions_binary[w - numBinaries].loaded.length - (startbit + 1)) + bin.padStart(fieldsLength, "0") + instructions_binary[w - numBinaries].loaded.substring(instructions_binary[w - numBinaries].loaded.length - stopbit, instructions_binary[w - numBinaries].loaded.length);
                          exit = 1;
                        }
                      }
                    }
                  }

                  for (var z = 0; z < memory[memory_hash[0]].length && exit == 0; z++){
                    for (var p = 0; p < memory[memory_hash[0]][z].Binary.length && exit == 0; p++){
                      if(instructionParts[j] == memory[memory_hash[0]][z].Binary[p].Tag){
                        var addr = (memory[memory_hash[0]][z].Binary[p].Addr);
                        var bin = parseInt(addr, 16).toString(2);
                        var startbit = pending_instructions[i].startBit;
                        var stopbit = pending_instructions[i].stopBit;

                        instructionParts[j] = "0x" + addr.toString(16);
                        var newInstruction = "";
                        for (var w = 0; w < instructionParts.length; w++) {
                          if(w == instructionParts.length-1){
                            newInstruction = newInstruction + instructionParts[w];
                          }
                          else{
                            newInstruction = newInstruction + instructionParts[w] + " ";
                          }
                        }
                        for (var w = 0; w < instructions.length && exit == 0; w++) {
                          var aux = "0x" + (pending_instructions[i].address).toString(16);
                          if(aux == instructions[w].Address){
                            instructions[w].loaded = newInstruction;
                          }
                        }

                        for (var w = 0; w < instructions.length && exit == 0; w++) {
                          var aux = "0x" + (pending_instructions[i].address).toString(16);
                          if(aux == instructions[w].Address){
                            instructions[w].loaded = newInstruction;
                            var fieldsLength = startbit - stopbit + 1;
                            instructions_binary[w - numBinaries].loaded = instructions_binary[w - numBinaries].loaded.substring(0, instructions_binary[w - numBinaries].loaded.length - (startbit + 1)) + bin.padStart(fieldsLength, "0") + instructions_binary[w - numBinaries].loaded.substring(instructions_binary[w - numBinaries].loaded.length - stopbit, instructions_binary[w - numBinaries].loaded.length);
                            exit = 1;
                          }
                        }

                      }
                    }
                  }

                  if(exit == 0 && isNaN(instructionParts[j]) == true){
                    app.compileError(7, instructionParts[j], pending_instructions[i].line);
                    tokenIndex = 0;
                    instructions = [];
                    pending_instructions = [];
                    pending_tags = [];
                    memory[memory_hash[0]] = [];
                    data_tag = [];
                    instructions_binary = [];
                    memory[memory_hash[1]] = [];
                    memory[memory_hash[2]] = [];
                    data = [];
                    extern = [];
                    app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
                    app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
                    app._data.memory[memory_hash[2]] = memory[memory_hash[2]];
                    app._data.instructions = instructions;
                    hide_loading();
                    return -1;
                  }
                }

                if(signatureParts[j] == "offset_words"){
                  for (var z = 0; z < instructions.length && exit == 0; z++){
                    if(instructions[z].Label == instructionParts[j]){
                      var addr = instructions[z].Address;
                      //var bin = parseInt(addr, 16).toString(2);
                      var startbit = pending_instructions[i].startBit;
                      var stopbit = pending_instructions[i].stopBit;

                      addr = ((addr - pending_instructions[i].address)/4)-1;
                      console_log(instructionParts);
                      console_log(addr);
                      var bin = parseInt(addr).toString(2);
                      console_log(bin);

                      instructionParts[j] = addr;
                      var newInstruction = "";
                      for (var w = 0; w < instructionParts.length; w++) {
                        if(w == instructionParts.length-1){
                          newInstruction = newInstruction + instructionParts[w];
                        }
                        else{
                          newInstruction = newInstruction + instructionParts[w] + " ";
                        }
                      }
                      for (var w = 0; w < instructions.length && exit == 0; w++) {
                        var aux = "0x" + (pending_instructions[i].address).toString(16);
                        if(aux == instructions[w].Address){
                          instructions[w].loaded = newInstruction;
                        }
                      }

                      for (var w = 0; w < instructions.length && exit == 0; w++) {
                        var aux = "0x" + (pending_instructions[i].address).toString(16);
                        if(aux == instructions[w].Address){
                          instructions[w].loaded = newInstruction;
                          var fieldsLength = startbit - stopbit + 1;
                          console_log(w);
                          console_log(numBinaries);
                          console_log(w - numBinaries);
                          console_log(bin.padStart(fieldsLength, "0"));
                          instructions_binary[w - numBinaries].loaded = instructions_binary[w - numBinaries].loaded.substring(0, instructions_binary[w - numBinaries].loaded.length - (startbit + 1)) + bin.padStart(fieldsLength, "0") + instructions_binary[w - numBinaries].loaded.substring(instructions_binary[w - numBinaries].loaded.length - stopbit, instructions_binary[w - numBinaries].loaded.length);
                          exit = 1;
                        }
                      }
                    }
                  }

                  if(exit == 0){
                    app.compileError(7, instructionParts[j], pending_instructions[i].line);
                    tokenIndex = 0;
                    instructions = [];
                    pending_instructions = [];
                    pending_tags = [];
                    memory[memory_hash[0]] = [];
                    data_tag = [];
                    instructions_binary = [];
                    memory[memory_hash[1]] = [];
                    memory[memory_hash[2]] = [];
                    data = [];
                    extern = [];
                    app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
                    app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
                    app._data.memory[memory_hash[2]] = memory[memory_hash[2]];
                    app._data.instructions = instructions;
                    hide_loading();
                    return -1;
                  }
                }

                if(signatureParts[j] == "offset_bytes"){
                  for (var z = 0; z < instructions.length && exit == 0; z++){
                    if(instructions[z].Label == instructionParts[j]){
                      var addr = instructions[z].Address;
                      var bin = parseInt(addr, 16).toString(2);
                      var startbit = pending_instructions[i].startBit;
                      var stopbit = pending_instructions[i].stopBit;

                      addr = ((addr - pending_instructions[i].address))-1;

                      instructionParts[j] = addr;
                      var newInstruction = "";
                      for (var w = 0; w < instructionParts.length; w++) {
                        if(w == instructionParts.length-1){
                          newInstruction = newInstruction + instructionParts[w];
                        }
                        else{
                          newInstruction = newInstruction + instructionParts[w] + " ";
                        }
                      }
                      for (var w = 0; w < instructions.length && exit == 0; w++) {
                        var aux = "0x" + (pending_instructions[i].address).toString(16);
                        if(aux == instructions[w].Address){
                          instructions[w].loaded = newInstruction;
                        }
                      }

                      for (var w = 0; w < instructions.length && exit == 0; w++) {
                        var aux = "0x" + (pending_instructions[i].address).toString(16);
                        if(aux == instructions[w].Address){
                          instructions[w].loaded = newInstruction;
                          var fieldsLength = startbit - stopbit + 1;
                          console_log(w)
                          console_log(numBinaries)
                          console_log(w - numBinaries)
                          instructions_binary[w - numBinaries].loaded = instructions_binary[w - numBinaries].loaded.substring(0, instructions_binary[w - numBinaries].loaded.length - (startbit + 1)) + bin.padStart(fieldsLength, "0") + instructions_binary[w - numBinaries].loaded.substring(instructions_binary[w - numBinaries].loaded.length - stopbit, instructions_binary[w - numBinaries].loaded.length);
                          exit = 1;
                        }
                      }
                    }
                  }

                  if(exit == 0){
                    app.compileError(7, instructionParts[j], pending_instructions[i].line);
                    tokenIndex = 0;
                    instructions = [];
                    pending_instructions = [];
                    pending_tags = [];
                    memory[memory_hash[0]] = [];
                    data_tag = [];
                    instructions_binary = [];
                    memory[memory_hash[1]] = [];
                    memory[memory_hash[2]] = [];
                    data = [];
                    extern = [];
                    app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
                    app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
                    app._data.memory[memory_hash[2]] = memory[memory_hash[2]];
                    app._data.instructions = instructions;
                    hide_loading();
                    return -1;
                  }
                }









              }
            }

            /*Enter the binary in the text segment*/
            if(update_binary.instructions_binary != null){
              for (var i = 0; i < update_binary.instructions_binary.length; i++){
                var hex = app.bin2hex(update_binary.instructions_binary[i].loaded);
                var auxAddr = parseInt(update_binary.instructions_binary[i].Address, 16);
                var label = update_binary.instructions_binary[i].Label;
                var hide;

                if(i == 0){
                  hide = false;
                  if(update_binary.instructions_binary[i].globl == false){
                    label = "";
                  }
                }
                else if(update_binary.instructions_binary[i].globl == false){
                  label = "";
                  hide = true;
                }
                else if(update_binary.instructions_binary[i].globl == null){
                  hide = true;
                }
                else{
                  hide = false;
                }

                for(var a = 0; a < hex.length/2; a++){
                  if(auxAddr % 4 == 0){
                    memory[memory_hash[1]].push({Address: auxAddr, Binary: [], Value: "********", hide: hide});
                    if(label == ""){
                      label=null;
                    }

                    if(a == 0){
                      (memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary).push({Addr: (auxAddr), DefBin: "**", Bin: "**", Tag: label},);
                    }
                    else{
                      (memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary).push({Addr: (auxAddr), DefBin: "**", Bin: "**", Tag: null},);
                    }

                    auxAddr++;
                  }
                  else{
                    if(a == 0){
                      console_log(label);
                      (memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary).splice(auxAddr%4, 1, {Addr: (auxAddr), DefBin: "**", Bin: "**", Tag: label},);
                    }
                    else{
                      (memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary).splice(auxAddr%4, 1, {Addr: (auxAddr), DefBin: "**", Bin: "**", Tag: null},);
                    }

                    auxAddr++;
                  }
                }

                if(memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary.length < 4){
                  var num_iter = 4 - memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary.length;
                  for(var b = 0; b < num_iter; b++){
                    (memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary).push({Addr: (auxAddr + (b + 1)), DefBin: "**", Bin: "**", Tag: null},);
                  }
                }

                app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
              }
            }

            /*Enter the compilated instructions in the text segment*/
            for (var i = 0; i < instructions_binary.length; i++){
              var hex = app.bin2hex(instructions_binary[i].loaded);
              var auxAddr = parseInt(instructions_binary[i].Address, 16);
              var label = instructions_binary[i].Label;
              var binNum = 0;

              if(update_binary.instructions_binary != null){
                binNum = update_binary.instructions_binary.length
              }

              for(var a = 0; a < hex.length/2; a++){
                if(auxAddr % 4 == 0){
                  memory[memory_hash[1]].push({Address: auxAddr, Binary: [], Value: instructions[i + binNum].loaded, hide: false});
                  if(label == ""){
                    label=null;
                  }
                  if(a == 0){
                    (memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary).push({Addr: (auxAddr), DefBin: hex.substring(hex.length-(2+(2*a)), hex.length-(2*a)), Bin: hex.substring(hex.length-(2+(2*a)), hex.length-(2*a)), Tag: label},);
                  }
                  else{
                    (memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary).push({Addr: (auxAddr), DefBin: hex.substring(hex.length-(2+(2*a)), hex.length-(2*a)), Bin: hex.substring(hex.length-(2+(2*a)), hex.length-(2*a)), Tag: null},);
                  }

                  auxAddr++;
                }
                else{
                  if(a == 0){
                    console_log(label);
                    (memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary).splice(auxAddr%4, 1, {Addr: (auxAddr), DefBin: hex.substring(hex.length-(2+(2*a)), hex.length-(2*a)), Bin: hex.substring(hex.length-(2+(2*a)), hex.length-(2*a)), Tag: label},);
                  }
                  else{
                    (memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary).splice(auxAddr%4, 1, {Addr: (auxAddr), DefBin: hex.substring(hex.length-(2+(2*a)), hex.length-(2*a)), Bin: hex.substring(hex.length-(2+(2*a)), hex.length-(2*a)), Tag: null},);
                  }

                  auxAddr++;
                }
              }

              if(memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary.length < 4){
                var num_iter = 4 - memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary.length;
                for(var b = 0; b < num_iter; b++){
                  (memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary).push({Addr: (auxAddr + (b + 1)), DefBin: "00", Bin: "00", Tag: null},);
                }
              }
              app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
            }


            /*Check for overlap*/
            if(memory[memory_hash[0]].length > 0){
              if(memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary[3].Addr > architecture.memory_layout[3].value){
                tokenIndex = 0;
                instructions = [];
                pending_instructions = [];
                pending_tags = [];
                memory[memory_hash[0]] = [];
                data_tag = [];
                instructions_binary = [];
                memory[memory_hash[1]] = [];
                extern = [];
                memory[memory_hash[2]] = [];
                data = [];
                app._data.instructions = instructions;
                app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
                app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
                app._data.memory[memory_hash[2]] = memory[memory_hash[2]];

                show_notification('Data overflow', 'danger') ;
                hide_loading();
                return -1;
              }
            }

            if(memory[memory_hash[1]].length > 0){
              if(memory[memory_hash[1]][memory[memory_hash[1]].length-1].Binary[3].Addr > architecture.memory_layout[1].value){
                tokenIndex = 0;
                instructions = [];
                pending_instructions = [];
                pending_tags = [];
                memory[memory_hash[0]] = [];
                data_tag = [];
                instructions_binary = [];
                memory[memory_hash[1]] = [];
                extern = [];
                memory[memory_hash[2]] = [];
                data = [];
                app._data.instructions = instructions;
                app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
                app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
                app._data.memory[memory_hash[2]] = memory[memory_hash[2]];

                show_notification('Instruction overflow', 'danger') ;
                hide_loading();
                return -1;
              }
            }

            /*Save binary*/
            for(var i = 0; i < instructions_binary.length; i++){
              if(extern.length == 0 && instructions_binary[i].Label != ""){
                instructions_binary[i].Label = instructions_binary[i].Label + "_symbol";
                instructions_binary[i].globl = false;
              }
              else{
                for(var j = 0; j < extern.length; j++){
                  if(instructions_binary[i].Label != extern[j] && j == extern.length-1 && instructions_binary[i].Label != ""){
                    instructions_binary[i].Label = instructions_binary[i].Label + "_symbol";
                    instructions_binary[i].globl = false;
                    break;
                  }
                  else if(instructions_binary[i].Label == extern[j]){
                    instructions_binary[i].globl = true;
                    break;
                  }
                }
              } 
            }

            /*Save tags*/
            for(var i = 0; i < instructions_tag.length; i++){
              if(extern.length == 0 && instructions_tag[i].tag != ""){
                instructions_tag[i].tag = instructions_tag[i].tag + "_symbol";
                instructions_tag[i].globl = false;
                break;
              }
              else{
                for(var j = 0; j < extern.length; j++){
                  if(instructions_tag[i].tag != extern[j] && j == extern.length-1 && instructions_tag[i].tag != ""){
                    instructions_tag[i].tag = instructions_tag[i].tag + "_symbol";
                    instructions_tag[i].globl = false;
                    break;
                  }
                  else if(instructions_tag[i].tag == extern[j]){
                    instructions_tag[i].globl = true;
                    break;
                  }
                }
              } 
            }

            app._data.instructions = instructions;

            /*Initialize stack*/
            memory[memory_hash[2]].push({Address: stack_address, Binary: [], Value: null, DefValue: null, reset: false, unallocated: false});
            
            for(var i = 0; i<4; i++){
              (memory[memory_hash[2]][memory[memory_hash[2]].length-1].Binary).push({Addr: stack_address + i, DefBin: "00", Bin: "00", Tag: null},);
            }

            app._data.memory[memory_hash[2]] = memory[memory_hash[2]];

            show_notification('Compilation completed successfully', 'success') ;

            tokenIndex = 0;
            
            app.reset();

            address = architecture.memory_layout[0].value;
            data_address = architecture.memory_layout[2].value;
            stack_address = architecture.memory_layout[4].value;

            hide_loading();

            resolve("0");

          }, 25);
        });
}


/*Compile data segment*/
function data_segment_compiler()
{
	var ret = {
          update: "",
          status: "ok"
        } ;


	// TODO: move UI to caller


        var existsData = true;

        next_token();

        while(existsData){
          token = get_token();
          console_log(token);

          var label = "";

          if(token == null){
            break;
          }

          console_log(token)

          var found = false;

          if(token.search(/\:$/) != -1){
            if(token.length == 1){
              app.compileError(0, "", textarea_assembly_editor.posFromIndex(tokenIndex).line);
              hide_loading();
              return -1;
            }

            for(var i = 0; i < data_tag.length; i++){
              console_log(data_tag[i].tag);
              console_log(token.substring(0,token.length-1))
              if(data_tag[i].tag == token.substring(0,token.length-1)){
                app.compileError(1, token.substring(0,token.length-1), textarea_assembly_editor.posFromIndex(tokenIndex).line);
                hide_loading();
                return -1;
              }
            }

            for(var i = 0; i < instructions.length; i++){
              if(instructions[i].Label == token.substring(0,token.length-1)){
                app.compileError(1, token.substring(0,token.length-1), textarea_assembly_editor.posFromIndex(tokenIndex).line);
                hide_loading();
                return -1;
              } 
            }

            label = token.substring(0,token.length-1);
            next_token();
            token = get_token();
          }

          for(var j = 0; j < architecture.directives.length; j++){
            if(token == architecture.directives[j].name){
              switch(architecture.directives[j].action){
                case "byte":
                  var isByte = true;

                  next_token();

                  while(isByte){
                    token = get_token();

                    if(token == null){
                      app.compileError(23,"", textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      app.compileError(24, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");

                    console_log("byte")
                    console_log(token)

                    var auxToken;
                    var auxTokenString;

                    if(token.match(/^\'(.*?)\'$/)){
                      var re = /^\'(.*?)\'$/;
                      console_log(re);
                      var match = re.exec(token);
                      console_log(match);
                      var asciiCode;

                      console_log(match[1]);

                      if(token.search(/^\'\\n\'$/) != -1){
                        asciiCode = 10;
                      }
                      else if(token.search(/^\'\\t\'$/) != -1){
                        asciiCode = 9;
                      }
                      else{
                        asciiCode = match[1].charCodeAt(0);
                      }

                      console_log(asciiCode);
                      auxTokenString = asciiCode.toString(16);
                    }
                    else if(token.match(/^0x/)){
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if(value[1].search(re) == -1){
                        app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }

                      auxTokenString = value[1].padStart(2*architecture.directives[j].size, "0");
                      if(value[1].length == 0){
                        app.compileError(19, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }

                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        app.compileError(18, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[0-9-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxToken = parseInt(token) >>> 0;
                      auxTokenString = (auxToken.toString(16).substring(auxToken.toString(16).length-2*architecture.directives[j].size, auxToken.toString(16).length)).padStart(2*architecture.directives[j].size, "0");
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        app.compileError(18, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    
                    console_log(auxTokenString)

                    if(data_compiler(auxTokenString, architecture.directives[j].size, label, (parseInt(auxTokenString, 16) >> 0), "byte") == -1){
                      return -1;
                    }

                    label = null;

                    console_log(memory[memory_hash[0]]);
                    console_log("byte Terminado");

                    next_token();
                    token = get_token();

                    console_log(token);

                    for(var z = 0; z < architecture.directives.length; z++){
                      if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        isByte = false;
                      }
                    }
                  }

                  j=0;

                  break;
                case "half_word":
                  console_log("half_word")

                  var ishalf = true;

                  next_token();

                  while(ishalf){
                    token = get_token();

                    if(token == null){
                      app.compileError(23,"", textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      app.compileError(24, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");

                    console_log("half_word");
                    console_log(token);

                    var auxToken;
                    var auxTokenString;
                    if(token.match(/^0x/)){
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if(value[1].search(re) == -1){
                        app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }

                      auxTokenString = value[1].padStart(2*architecture.directives[j].size, "0");

                      if(value[1].length == 0){
                        app.compileError(19, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        app.compileError(18, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[0-9-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxToken = parseInt(token) >>> 0;
                      auxTokenString = (auxToken.toString(16).substring(auxToken.toString(16).length-2*architecture.directives[j].size, auxToken.toString(16).length)).padStart(2*architecture.directives[j].size, "0");
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        app.compileError(18, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    
                    console_log(auxTokenString)

                    if(data_compiler(auxTokenString, architecture.directives[j].size, label, (parseInt(auxTokenString, 16) >> 0), "half") == -1){
                      return -1;
                    }

                    label = null;

                    console_log(memory[memory_hash[0]]);
                    console_log("half Terminado");

                    next_token();
                    token = get_token();

                    console_log(token);

                    for(var z = 0; z < architecture.directives.length; z++){
                      if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        ishalf = false;
                      }
                    }
                  }

                  j=0;

                  break;
                case "word":
                  var isWord = true;

                  next_token();

                  while(isWord){
                    console_log("word")

                    token = get_token();

                    if(token == null){
                      app.compileError(23,"", textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      app.compileError(24, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");

                    console_log(token);

                    var auxToken;
                    var auxTokenString;
                    if(token.match(/^0x/)){
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if(value[1].search(re) == -1){
                        app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }

                      auxTokenString = value[1].padStart(2*architecture.directives[j].size, "0");
                      if(value[1].length == 0){
                        app.compileError(19, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        app.compileError(18, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[0-9-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxToken = parseInt(token) >>> 0;
                      auxTokenString = (auxToken.toString(16).substring(auxToken.toString(16).length-2*architecture.directives[j].size, auxToken.toString(16).length)).padStart(2*architecture.directives[j].size, "0");
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        app.compileError(18, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    
                    console_log(auxTokenString);

                    if(data_compiler(auxTokenString, architecture.directives[j].size, label, (parseInt(auxTokenString, 16)) >> 0, "word") == -1){
                      return -1;
                    }

                    label = null;

                    console_log(memory[memory_hash[0]]);
                    console_log("word Terminado");

                    next_token();
                    token = get_token();

                    console_log(token);

                    for(var z = 0; z < architecture.directives.length; z++){
                      if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){

                        isWord = false;
                      }
                    }
                    console_log(memory[memory_hash[0]]);
                  }

                  j=0;

                  break;
                case "double_word":
                  var isDoubleWord = true;

                  next_token();

                  while(isDoubleWord){
                    console_log("word");

                    token = get_token();

                    if(token == null){
                      app.compileError(23,"", textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      app.compileError(24, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");

                    console_log(token);

                    var auxToken;
                    var auxTokenString;
                    if(token.match(/^0x/)){
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if(value[1].search(re) == -1){
                        app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }

                      auxTokenString = value[1].padStart(2*architecture.directives[j].size, "0");
                      if(value[1].length == 0){
                        app.compileError(19, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        app.compileError(18, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[0-9-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxToken = parseInt(token) >>> 0;
                      auxTokenString = (auxToken.toString(16).substring(auxToken.toString(16).length-2*architecture.directives[j].size, auxToken.toString(16).length)).padStart(2*architecture.directives[j].size, "0");
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        app.compileError(18, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    
                    if(data_compiler(auxTokenString, architecture.directives[j].size, label, (parseInt(auxTokenString, 16) >> 0), "double_word") == -1){
                      return -1;
                    }

                    label = null;

                    console_log(memory[memory_hash[0]]);
                    console_log("double word Terminado");

                    next_token();
                    token = get_token();

                    console_log(token);

                    for(var z = 0; z < architecture.directives.length; z++){
                      if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        isDoubleWord = false;
                      }
                    }
                    console_log(memory[memory_hash[0]]);
                  }

                  j=0;

                  break;
                case "float":
                  var isFloat = true;

                  next_token();

                  while(isFloat){
                    console_log("float");

                    token = get_token();

                    if(token == null){
                      app.compileError(23,"", textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      app.compileError(24, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");

                    console_log(token);

                    var auxToken;
                    var auxTokenString;
                    if(token == "-Inf" || token == "-inf" || token == "-Infinity" || token == "-infinity"){
                      token = "-Infinity";
                      auxTokenString = "FF800000";
                    }
                    else if(token == "Inf" || token == "+Inf" || token == "inf" || token == "+inf" || token == "Infinity" || token == "+Infinity" || token == "infinity" || token == "+infinity"){
                      token = "+Infinity";
                      auxTokenString = "7F800000";
                    }
                    else if(token == "NaN" || token == "nan"){
                      token = "NaN";
                      auxTokenString = "7FC00000";
                    }
                    else if(token.match(/^0x/)){
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if(value[1].search(re) == -1){
                        app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }

                      auxTokenString = value[1].padStart(2*architecture.directives[j].size, "0");
                      if(value[1].length == 0){
                        app.compileError(19, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        app.compileError(18, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                      token = app.hex2float(token);
                    }
                    else{
                      var re = new RegExp("[\+e0-9.-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxToken = parseFloat(token, 10);
                      auxTokenString = (app.bin2hex(app.float2bin(auxToken))).padStart(2*architecture.directives[j].size, "0");
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        app.compileError(18, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    
                    console_log(auxTokenString);

                    if(data_compiler(auxTokenString, architecture.directives[j].size, label, token, "float") == -1){
                      return -1;
                    }

                    label = null;

                    console_log(memory[memory_hash[0]]);
                    console_log("float Terminado");

                    next_token();
                    token = get_token();

                    console_log(token);

                    for(var z = 0; z < architecture.directives.length; z++){
                      if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        isFloat = false;
                      }
                    }
                    console_log(memory[memory_hash[0]]);
                  }

                  j=0;

                  break;
                case "double":
                  var isDouble = true;

                  next_token();

                  while(isDouble){
                    console_log("double");

                    token = get_token();

                    if(token == null){
                      app.compileError(23,"", textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      app.compileError(24, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp(",", "g")
                    token = token.replace(re, "");

                    console_log(token);

                    var auxToken;
                    var auxTokenString;
                    if(token == "-Inf" || token == "-inf" || token == "-Infinity" || token == "-infinity"){
                      token = "-Infinity";
                      auxTokenString = "FFF0000000000000";
                    }
                    else if(token == "Inf" || token == "+Inf" || token == "inf" || token == "+inf" || token == "Infinity" || token == "+Infinity" || token == "infinity" || token == "+infinity"){
                      token = "+Infinity";
                      auxTokenString = "7FF0000000000000";
                    }
                    else if(token == "NaN" || token == "nan"){
                      token = "NaN";
                      auxTokenString = "7FF8000000000000";
                    }
                    else if(token.match(/^0x/)){
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if(value[1].search(re) == -1){
                        app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }

                      auxTokenString = value[1].padStart(2*architecture.directives[j].size, "0");
                      if(value[1].length == 0){
                        app.compileError(19, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        app.compileError(18, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                      token = app.hex2double(token);
                    }
                    else{
                      var re = new RegExp("[\+e0-9.-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxToken = parseFloat(token, 10);console_log(auxTokenString);
                      auxTokenString = (app.bin2hex(app.double2bin(auxToken))).padStart(2*architecture.directives[j].size, "0");
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        app.compileError(18, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    
                    console_log(auxTokenString);

                    if(data_compiler(auxTokenString, architecture.directives[j].size, label, token, "float") == -1){
                      return -1;
                    }

                    label = null;

                    console_log(memory[memory_hash[0]]);
                    console_log("double Terminado");

                    next_token();
                    token = get_token();

                    console_log(token);

                    for(var z = 0; z < architecture.directives.length; z++){
                      if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        isDouble = false;
                      }
                    }
                    console_log(memory[memory_hash[0]]);
                  }

                  j=0;

                  break;
                case "ascii_not_null_end":
                  console_log("ascii_not_null_end");

                  var isAscii = true;
                  var nextToken = 1;

                  next_token();

                  while(isAscii){
                    console_log("ascii_not_null_end");

                    token = get_token();
                    console_log(token);

                    string = token;

                    re = new RegExp('^"');
                    string = string.replace(re, "");
                    console_log(string);
                    re = new RegExp('"$');
                    string = string.replace(re, "");
                    console_log(string);

                    if(token == null){
                      break;
                    }

                    /*re = new RegExp('(.)","(.)');
                    if(token.search(re) != -1){
                      app.compileError(24, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    console_log(token);

                    re = new RegExp(",", "g");
                    token = token.replace(re, "");

                    re = new RegExp('^"');
                    console_log(re);
                    if(token.search(re) == -1){
                      app.compileError(17, "", textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    var string = "";
                    var final = false;

                    re = new RegExp('"$');
                    console_log(re);
                    console_log(token);
                    if(token.search(re) == -1){
                      string = token.substring(1, token.length);
                    }
                    else{
                      string = token.substring(1, token.length-1);
                      final = true;
                    }
                    
                    while(final == false){
                      next_token();
                      token = get_token();
                      console_log(token);

                      if(token == null){
                        break;
                      }

                      re = new RegExp('(.)","(.)');
                      console_log(re);
                      if(token.search(re) != -1){
                        app.compileError(24, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }

                      console_log(token);

                      re = new RegExp(",", "g")
                      token = token.replace(re, "");

                      re = new RegExp('^"');
                      console_log(re);
                      if(token.search(re) != -1 && final == false){
                        string = string + " ";
                        final = true;
                      }

                      re = new RegExp('"$');
                      console_log(re);
                      if(token.search(re) != -1 && final == false){
                        final = true;
                        string = string + " " + token.substring(0, token.length-1);
                      }

                      if(final == false){
                        string = string + " " + token;
                        final = false;
                      }
                    }*/

                    console_log(string);

                    for(var i = 0; i < string.length; i++){
                      console_log(string.length);
                      if((data_address % align) != 0 && i == 0 && align != 0){
                        while((data_address % align) != 0){
                          if(data_address % 4 == 0){
                            memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: null, DefValue: null, reset: false, type: "ascii"});
                            (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: data_address, DefBin: "00", Bin: "00", Tag: null},);
                            data_address++;
                          }
                          else if(memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary.length == 4){
                            data_address++;
                          }
                          else{
                            (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: data_address, DefBin: "00", Bin: "00", Tag: null},);
                            data_address++;
                          }
                        }
                      }

                      if(data_address % 4 == 0){
                        memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: string.charAt(i), DefValue: string.charAt(i), reset: false, type: "ascii"});

                        if(i == 0){
                          (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address), DefBin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Bin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Tag: label},);
                          if(label != null){
                            data_tag.push({tag: label, addr: data_address});
                          }
                          label = null;
                        }
                        else{
                          (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address), DefBin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Bin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Tag: null},);
                        }

                        data_address++;
                      
                      }
                      else{
                        if(i == 0){
                          (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).splice(data_address%4, 1, {Addr: (data_address), DefBin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Bin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Tag: label},);
                          memory[memory_hash[0]][memory[memory_hash[0]].length-1].Value = string.charAt(i) + " " + memory[memory_hash[0]][memory[memory_hash[0]].length-1].Value;
                          memory[memory_hash[0]][memory[memory_hash[0]].length-1].DefValue = string.charAt(i) + " " + memory[memory_hash[0]][memory[memory_hash[0]].length-1].DefValue;
                          if(label != null){
                            data_tag.push({tag: label, addr: data_address});
                          }
                          label = null;
                        }
                        else{
                          (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).splice(data_address%4, 1, {Addr: (data_address), DefBin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Bin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Tag: null},);
                          memory[memory_hash[0]][memory[memory_hash[0]].length-1].Value = string.charAt(i) + " " + memory[memory_hash[0]][memory[memory_hash[0]].length-1].Value;
                          memory[memory_hash[0]][memory[memory_hash[0]].length-1].DefValue = string.charAt(i) + " " + memory[memory_hash[0]][memory[memory_hash[0]].length-1].DefValue;
                        }
                        data_address++;
                      }
                    }
                    console_log(memory[memory_hash[0]]);

                    if(memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary.length < 4){
                      var num_iter = 4 - memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary.length;
                      for(var i = 0; i < num_iter; i++){
                        (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address + (i)), DefBin: "00", Bin: "00", Tag: null},);
                      }
                    }

                    console_log("ascii_not_null_end Terminado");

                    if(nextToken == 1){
                      next_token();
                      token = get_token();
                    }

                    nextToken = 1;

                    console_log(token);

                    for(var z = 0; z < architecture.directives.length; z++){
                      if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        isAscii = false;
                      }
                    }
                    console_log(memory[memory_hash[0]]);
                  }

                  j=0;

                  break;
                case "ascii_null_end":
                  console_log("ascii_null_end");
                  
                  var isAscii = true;
                  var nextToken = 1;

                  next_token();

                  while(isAscii){
                    console_log("ascii_null_end")

                    token = get_token();
                    console_log(token);

                    if(token == null){
                      break;
                    }

                    string = token;

                    re = new RegExp('^"');
                    string = string.replace(re, "");
                    console_log(string);
                    re = new RegExp('"$');
                    string = string.replace(re, "");
                    console_log(string);

                    /*re = new RegExp('(.)","(.)');
                    if(token.search(re) != -1){
                      app.compileError(24, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    re = new RegExp(",", "g")
                    token = token.replace(re, "");

                    re = new RegExp('^"');
                    console_log(re)
                    if(token.search(re) == -1){
                      app.compileError(17, "", textarea_assembly_editor.posFromIndex(tokenIndex).line);
                      hide_loading();
                      return -1;
                    }

                    var string = "";
                    var final = false;
                    
                    re = new RegExp('"$');
                    console_log(re);
                    console_log(token);
                    if(token.search(re) == -1){
                      string = token.substring(1, token.length);
                    }
                    else{
                      string = token.substring(1, token.length-1);
                      final = true;
                    }
                    
                    while(final == false){
                      next_token();
                      token = get_token();
                      console_log(token);
                      if(token == null){
                        break;
                      }

                      re = new RegExp('(.)","(.)');
                      console_log(re);
                      if(token.search(re) != -1){
                        app.compileError(24, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                        hide_loading();
                        return -1;
                      }

                      re = new RegExp(",", "g")
                      token = token.replace(re, "");

                      re = new RegExp('^"');
                      console_log(re);
                      if(token.search(re) != -1 && final == false){
                        string = string + " ";
                        final = true;
                      }

                      re = new RegExp('"$');
                      console_log(re);
                      if(token.search(re) != -1 && final == false){
                        final = true;
                        string = string + " " + token.substring(0, token.length-1);
                      }

                      if(final == false){
                        string = string + " " + token;
                        final = false;
                      }
                    }

                    string = string;*/

                    console_log(string);

                    for(var i = 0; i < string.length + 1; i++){
                      console_log(string.length);
                      if((data_address % align) != 0 && i == 0 && align != 0){
                        while((data_address % align) != 0){
                          if(data_address % 4 == 0){
                            memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: null, DefValue: null, reset: false, type: "ascii"});
                            (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: data_address, DefBin: "00", Bin: "00", Tag: null},);
                            data_address++;
                          }
                          else if(memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary.length == 4){
                            data_address++;
                          }
                          else{
                            (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: data_address, DefBin: "00", Bin: "00", Tag: null},);
                            data_address++;
                          }
                        }
                      }

                      if(data_address % 4 == 0){
                        memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: string.charAt(i), DefValue: string.charAt(i), reset: false, type: "ascii"});

                        if(i < string.length){
                          if(i == 0){
                            (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address), DefBin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Bin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Tag: label},);
                            if(label != null){
                              data_tag.push({tag: label, addr: data_address});
                            }
                            label = null;
                          }
                          else{
                            (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address), DefBin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Bin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Tag: null},);
                          }
                        }
                        else{
                          (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address), DefBin: "00", Bin: "00", Tag: null},);
                        }

                        data_address++;
                      }
                      else{
                        if(i < string.length){
                          if(i == 0){
                            (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).splice(data_address%4, 1, {Addr: (data_address), DefBin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Bin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Tag: label},);
                            memory[memory_hash[0]][memory[memory_hash[0]].length-1].Value = string.charAt(i) + " " + memory[memory_hash[0]][memory[memory_hash[0]].length-1].Value;
                            memory[memory_hash[0]][memory[memory_hash[0]].length-1].DefValue = string.charAt(i) + " " + memory[memory_hash[0]][memory[memory_hash[0]].length-1].DefValue;
                            if(label != null){
                              data_tag.push({tag: label, addr: data_address});
                            }
                            label = null;
                          }
                          else{
                            (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).splice(data_address%4, 1, {Addr: (data_address), DefBin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Bin: (string.charCodeAt(i).toString(16)).padStart(2, "0"), Tag: null},);
                            memory[memory_hash[0]][memory[memory_hash[0]].length-1].Value = string.charAt(i) + " " + memory[memory_hash[0]][memory[memory_hash[0]].length-1].Value;
                            memory[memory_hash[0]][memory[memory_hash[0]].length-1].DefValue = string.charAt(i) + " " + memory[memory_hash[0]][memory[memory_hash[0]].length-1].DefValue;
                          }
                        }
                        else{
                          (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).splice(data_address%4, 1, {Addr: (data_address), DefBin: "00", Bin: "00", Tag: null},);
                        }

                        data_address++;
                      }
                    }

                    console_log(memory[memory_hash[0]]);

                    if(memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary.length < 4){
                      var num_iter = 4 - memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary.length;
                      for(var i = 0; i < num_iter; i++){
                        (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address + (i)), DefBin: "00", Bin: "00", Tag: null},);
                      }
                    }

                    console_log("ascii_null_end Terminado");

                    if(nextToken == 1){
                      next_token();
                      token = get_token();
                    }

                    nextToken = 1;

                    console_log(token);

                    for(var z = 0; z < architecture.directives.length; z++){
                      if(token == architecture.directives[z].name || token == null || token.search(/\:$/) != -1){
                        isAscii = false;
                      }
                    }
                    console_log(memory[memory_hash[0]]);
                  }

                  j=0;

                  break;
                case "space":
                  console_log("space");

                  var string = "";

                  next_token();
                  token = get_token();
                  console_log(token);
                  console_log(label);

                  if(token == null){
                    app.compileError(23,"", textarea_assembly_editor.posFromIndex(tokenIndex).line);
                    hide_loading();
                    return -1;
                  }

                  var re = new RegExp("[0-9-]{"+token.length+"}","g");
                  if(token.search(re) == -1){
                    app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                    hide_loading();
                    return -1;
                  }

                  if(parseInt(token) < 0){
                    app.compileError(22, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                    hide_loading();
                    return -1;
                  }

                  var auxToken = parseInt(token) * architecture.directives[j].size;

                  for(var i = 0; i < auxToken; i++){
                    if((data_address % align) != 0 && i == 0 && align != 0){
                      while((data_address % align) != 0){
                        if(data_address % 4 == 0){
                          memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: null, DefValue: null, reset: false, type: "space"});
                          (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: data_address, DefBin: "00", Bin: "00", Tag: null},);
                          data_address++;
                        }
                        else if(memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary.length == 4){
                          data_address++;
                        }
                        else{
                          (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: data_address, DefBin: "00", Bin: "00", Tag: null},);
                          data_address++;
                        }
                      }
                    }

                    if(data_address % 4 == 0){
                      memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: string, DefValue: "", reset: false, type: "space"});

                      if(i == 0){
                        (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address), DefBin: "00", Bin: "00", Tag: label},);
                        if(label != null){
                          data_tag.push({tag: label, addr: data_address});
                        }
                        label = null;
                      }
                      else{
                        (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address), DefBin: "00", Bin: "00", Tag: null},);
                      }

                      data_address++;
                    }
                    else{
                      if(i == 0){
                        (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).splice(data_address%4, 1, {Addr: (data_address), DefBin: "00", Bin: "00", Tag: label},);
                        if(label != null){
                          data_tag.push({tag: label, addr: data_address});
                        }
                        label = null;
                      }
                      else{
                        (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).splice(data_address%4, 1, {Addr: (data_address), DefBin: "00", Bin: "00", Tag: null},);
                      }

                      data_address++;
                    }
                  }

                  console_log(memory[memory_hash[0]]);

                  if(memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary.length < 4){
                    var num_iter = 4 - memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary.length;
                    for(var i = 0; i < num_iter; i++){
                      (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address + (i)), DefBin: "00", Bin: "00", Tag: null},);
                    }
                  }

                  next_token();
                  token = get_token();

                  console_log("space Terminado");

                  break;
                case "align":
                case "balign":
                  console_log("[b]align");
                  let pow_mode = token == "align";

                  next_token();
                  token = get_token();
                  console_log(token);

                  if(token == null){
                    app.compileError(23,"", textarea_assembly_editor.posFromIndex(tokenIndex).line);
                    hide_loading();
                    return -1;
                  }

                  var re = new RegExp("[0-9-]{"+token.length+"}","g");
                  if(token.search(re) == -1){
                    app.compileError(16, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                    hide_loading();
                    return -1;
                  }

                  if(parseInt(token) < 0){
                    app.compileError(22, token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                    hide_loading();
                    return -1;
                  }

                  console_log(align);
                  align = pow_mode ? Math.pow(2, parseInt(token)) : token;
                  console_log(align);

                  next_token();
                  token = get_token();

                  console_log("align Terminado");

                  break;
                default:
                  console_log("Default");
                  existsData = false;
                  break;
              }
            }

            else if(j== architecture.directives.length-1 && token != architecture.directives[j].name && token != null && token.search(/\:$/) == -1){
              app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
              return 0;
            }
          
          }
        }
        app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
        return 0;
}

/* Stores a data in data memory */
function data_compiler(value, size, dataLabel, DefValue, type)
{
	var ret = {
          update: "",
          status: "ok"
        } ;


	// TODO: move UI to caller


        for(var i = 0; i < (value.length/2); i++)
	{
          if ((data_address % align) != 0 && i == 0 && align != 0)
	  {
            while((data_address % align) != 0){
              if(data_address % 4 == 0){
                memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: null, DefValue: null, reset: false, type: type});
                (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: data_address, DefBin: "00", Bin: "00", Tag: null},);
                data_address++;
              }
              else if(memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary.length == 4){
                data_address++;
              }
              else{
                (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: data_address, DefBin: "00", Bin: "00", Tag: null},);
                data_address++;
              }
            }
          }

          if(data_address % size != 0 && i == 0){
            app.compileError(21, "", textarea_assembly_editor.posFromIndex(tokenIndex).line);
            hide_loading();
            return -1;
          }

          if(data_address % 4 == 0){
            console_log(DefValue);
            memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: DefValue, DefValue: DefValue, reset: false, type: type});

            if(i == 0){
              (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address), DefBin: value.substring(value.length-(2+(2*i)), value.length-(2*i)), Bin: value.substring(value.length-(2+(2*i)), value.length-(2*i)), Tag: dataLabel},);
              if(dataLabel != null){
                data_tag.push({tag: dataLabel, addr: data_address});
              }
              dataLabel = null;
            }
            else{
              (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address), DefBin: value.substring(value.length-(2+(2*i)), value.length-(2*i)), Bin: value.substring(value.length-(2+(2*i)), value.length-(2*i)), Tag: null},);
            }

            data_address++;
          }
          else{
            if(value.length <= 4 && i == 0){
              console_log(DefValue);
              memory[memory_hash[0]][memory[memory_hash[0]].length-1].Value = DefValue + " " + memory[memory_hash[0]][memory[memory_hash[0]].length-1].Value;
              memory[memory_hash[0]][memory[memory_hash[0]].length-1].DefValue = DefValue + " " + memory[memory_hash[0]][memory[memory_hash[0]].length-1].DefValue;
            }

            if(i == 0){
              (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).splice(data_address%4, 1, {Addr: (data_address), DefBin: value.substring(value.length-(2+(2*i)), value.length-(2*i)), Bin: value.substring(value.length-(2+(2*i)), value.length-(2*i)), Tag: dataLabel},);
              if(dataLabel != null){
                data_tag.push({tag: dataLabel, addr: data_address});
              }
              dataLabel = null;
            }
            else{
              (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).splice(data_address%4, 1, {Addr: (data_address), DefBin: value.substring(value.length-(2+(2*i)), value.length-(2*i)), Bin: value.substring(value.length-(2+(2*i)), value.length-(2*i)), Tag: null},);
              console_log(memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary[data_address%4]);
            }
            data_address++;
          }
        }
        console_log(memory[memory_hash[0]])

        if(memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary.length < 4){
          var num_iter = 4 - memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary.length;
          for(var i = 0; i < num_iter; i++){
            (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: (data_address + i), DefBin: "00", Bin: "00", Tag: null},);
          }
        }
}

/*Compile text segment*/
function code_segment_compiler()
{
	var ret = {
          update: "",
          status: "ok"
        } ;


	// TODO: move UI to caller


        var existsInstruction = true;

        next_token();
        var instInit = tokenIndex;

        while(existsInstruction){
          token = get_token();

          for(var i = 0; i < architecture.directives.length; i++){
            if(token == architecture.directives[i].name && architecture.directives[i].action == "global_symbol"){
              next_token(); // .globl *main* 
              next_token(); 
              token = get_token();
            }
            else if(token == architecture.directives[i].name){
              app._data.instructions = instructions;
              console_log(token);
              for(var i = 0; i < instructions.length; i++){
                if(instructions[i].Label != ""){
                  instructions_tag.push({tag: instructions[i].Label, addr: parseInt(instructions[i].Address, 16)});
                }
              }

              return 0;
            }
          }

          var label = "";
          var validTagPC = true;

          if(token == null){
            break;
          }

          console_log(token);

          var found = false;
          var end = false;

          if(token.search(/\:$/) != -1){
            if(token.length == 1){
              app.compileError(0, "", textarea_assembly_editor.posFromIndex(tokenIndex).line);
              hide_loading();
              return -1;
            }

            for(var i = 0; i < memory[memory_hash[0]].length; i++){
              for(var j = 0; j < memory[memory_hash[0]][i].Binary.length; j++){
                if(memory[memory_hash[0]][i].Binary[j].Tag == token.substring(0,token.length-1)){
                  app.compileError(1, token.substring(0,token.length-1), textarea_assembly_editor.posFromIndex(tokenIndex).line);
                  hide_loading();
                  return -1;
                }
              }
            }

            for(var i = 0; i < instructions.length; i++){
              if(instructions[i].Label == token.substring(0,token.length-1)){
                app.compileError(1, token.substring(0,token.length-1), textarea_assembly_editor.posFromIndex(tokenIndex).line);
                hide_loading();
                return -1;
              } 
            }

            label = token.substring(0,token.length-1);
            next_token();
            instInit = tokenIndex;
            token = get_token();

            if(token != null){
              var re = new RegExp(",+$");
              token = token.replace(re, "");
            }
            else{
              var instIndex;
              for (var i = 0; i < architecture.instructions.length; i++) {
                if(architecture.instructions[i].name == "nop"){
                  instIndex = i;
                }
              }
              app.instruction_compiler("nop", "nop", label, textarea_assembly_editor.posFromIndex(tokenIndex).line, false, 0, instInit, instIndex, false);
              end = true;
              found = true;
            }
          }

          var re = new RegExp(",+$");

          if(token != null){
            token = token.replace(re, "");
            console_log(token)
            var stopFor = false;
          }
          

          for(var i = 0; i < architecture.instructions.length && stopFor == false && end == false; i++){
            if(architecture.instructions[i].name != token){
              continue;
            }

            else{
              var instruction = "";
              var userInstruction = "";

              var numFields = 0;
              found = true;

              for (var j = 0; j < architecture.instructions[i].fields.length; j++){
                if(architecture.instructions[i].fields[j].type != "cop"){
                  numFields++;
                }
              }
              console_log(numFields);

              instruction = instruction + token;
              userInstruction = userInstruction + token;

              //var new_ins = 0;

              for (var j = 0; j < numFields - 1; j++){
                next_token();
                token = get_token();
                console_log(token);

                if(token != null){
                  var re = new RegExp(",+$");
                  token = token.replace(re, "");
                  /*for(var a = 0; a < architecture.instructions.length; a++){
                    if(architecture.instructions[a].name == token){
                      new_ins = 1;
                    }
                  }
                  if(new_ins == 0){
                    instruction = instruction + " " + token;
                    userInstruction = userInstruction + " " + token;
                  }*/
                  instruction = instruction + " " + token;
                  userInstruction = userInstruction + " " + token;
                }  

                /*if(new_ins == 1){
                  break;
                }*/
              }

              console_log(instruction);
              console_log(label);

              var result = app.instruction_compiler(instruction, userInstruction, label, textarea_assembly_editor.posFromIndex(tokenIndex).line, false, 0, instInit, i, false);

              if(result == -1){
                hide_loading();
                return -1;
              }

              /*if (new_ins == 0){
                next_token();
              }
              new_ins = 0;*/
              next_token();
              instInit = tokenIndex; //PRUEBA
              stopFor = true;
            }
          }

          if(!found){
            var resultPseudo = -3;
            var instruction = "";
            var numToken = 0;
            var exists = false;
            var inst = token;

            console_log(token)

            for (var i = 0; i < architecture.pseudoinstructions.length && exists == false; i++){
              if(architecture.pseudoinstructions[i].name == token){
                numToken = architecture.pseudoinstructions[i].fields.length;
                console_log(numToken)
                exists = true;
                instruction = instruction + token;

                for (var i = 0; i < numToken; i++){
                  next_token();
                  token = get_token();

                  if(token != null){
                    var re = new RegExp(",+$");
                    token = token.replace(re, "");
                  }

                  instruction = instruction + " " + token;
                }
                resultPseudo = app.pseudoinstruction_compiler(instruction, label, textarea_assembly_editor.posFromIndex(tokenIndex).line);
                console_log(resultPseudo);
              }
            }

            if(resultPseudo == -3){
              for (var i = 0; i < architecture.components.length; i++){
                for (var j = 0; j < architecture.components[i].elements.length; j++){
                  var re = new RegExp(architecture.components[i].elements[j].name);
                  if(token.search(re) != -1){
                    app.compileError(26, (textarea_assembly_editor.posFromIndex(tokenIndex).line) + 1, textarea_assembly_editor.posFromIndex(tokenIndex).line);

                    existsInstruction = false;
                    tokenIndex = 0;
                    instructions = [];
                    pending_instructions = [];
                    pending_tags = [];
                    memory[memory_hash[0]] = [];
                    data_tag = [];
                    instructions_binary = [];
                    memory[memory_hash[1]] = [];
                    extern = [];
                    memory[memory_hash[2]] = [];
                    data = [];
                    app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
                    memory[memory_hash[1]] = memory[memory_hash[1]];
                    memory[memory_hash[2]] = memory[memory_hash[2]];
                    app._data.instructions = instructions;
                    hide_loading();
                    return -1;
                  }
                }          
              }


              app.compileError(2, token, textarea_assembly_editor.posFromIndex(tokenIndex).line); //PRUEBA para dar error con mas detalle

              existsInstruction = false;
              tokenIndex = 0;
              instructions = [];
              pending_instructions = [];
              pending_tags = [];
              memory[memory_hash[0]] = [];
              data_tag = [];
              instructions_binary = [];
              memory[memory_hash[1]] = [];
              extern = [];
              memory[memory_hash[2]] = [];
              data = [];
              app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
              memory[memory_hash[1]] = memory[memory_hash[1]];
              memory[memory_hash[2]] = memory[memory_hash[2]];
              app._data.instructions = instructions;
              hide_loading();
              return -1;
            }

            if(resultPseudo == -2){
              //app.compileError(2, token, textarea_assembly_editor.posFromIndex(tokenIndex).line); //PRUEBA para dar error con mas detalle

              existsInstruction = false;
              tokenIndex = 0;
              instructions = [];
              pending_instructions = [];
              pending_tags = [];
              memory[memory_hash[0]] = [];
              data_tag = [];
              instructions_binary = [];
              memory[memory_hash[1]] = [];
              extern = [];
              memory[memory_hash[2]] = [];
              data = [];
              app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
              memory[memory_hash[1]] = memory[memory_hash[1]];
              memory[memory_hash[2]] = memory[memory_hash[2]];
              app._data.instructions = instructions;
              hide_loading();
              return -1;
            }

            if(resultPseudo == -1){
              app.compileError(25, "", textarea_assembly_editor.posFromIndex(tokenIndex).line);
              existsInstruction = false;
              tokenIndex = 0;
              instructions = [];
              pending_instructions = [];
              pending_tags = [];
              memory[memory_hash[0]] = [];
              data_tag = [];
              instructions_binary = [];
              memory[memory_hash[1]] = [];
              extern = [];
              memory[memory_hash[2]] = [];
              data = [];
              app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
              memory[memory_hash[1]] = memory[memory_hash[1]];
              memory[memory_hash[2]] = memory[memory_hash[2]];
              app._data.instructions = instructions;
              hide_loading();
              return -1;
            }

            next_token();
            instInit = tokenIndex; //PRUEBA

          }
        }

        token = get_token();
        console_log(token);

        app._data.instructions = instructions;

        for(var i = 0; i < instructions.length; i++){
          if(instructions[i].Label != ""){
            instructions_tag.push({tag: instructions[i].Label, addr: parseInt(instructions[i].Address, 16)});
          }
        }

        return 0;
}


