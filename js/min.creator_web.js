/*
 *  Copyright 2018-2019 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
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
  { mess1: "Empty label ", mess2: "" },
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
  { mess1: "Empty directive ", mess2: "" },
  { mess1: "After the comma you should go a blank --> ", mess2: "" },
  { mess1: "Incorrect sintax ", mess2: "" },
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
	   
	       for (var i = 0; i < auxObject.components.length; i++){
		 if(auxObject.components[i].type != "floating point"){
		   for (var j = 0; j < auxObject.components[i].elements.length; j++){
		     var aux = auxObject.components[i].elements[j].value;
		     var auxBigInt = bigInt(parseInt(aux) >>> 0, 10).value;
		     auxObject.components[i].elements[j].value = auxBigInt;
	   
		     if(auxObject.components[i].double_precision != true){
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

	    for (var i = 0; i < architecture.components.length; i++){
	      if(architecture.components[i].type != "floating point"){
		for (var j = 0; j < architecture.components[i].elements.length; j++){
		  var aux = architecture.components[i].elements[j].value;
		  var auxString = aux.toString();
		  auxObject.components[i].elements[j].value = auxString;

		  if(architecture.components[i].double_precision != true){
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

	function load_arch_select(cfg)
	{
	    var ret = {};

	    var auxArchitecture = cfg;
	    architecture = bigInt_deserialize(auxArchitecture);

	    architecture_hash = [];
	    for (var i = 0; i < architecture.components.length; i++){
	      architecture_hash.push({name: architecture.components[i].name, index: i});
	    }

	    backup_stack_address = architecture.memory_layout[4].value;
	    backup_data_address = architecture.memory_layout[3].value;

	    ret.token = "The selected architecture has been loaded correctly";
	    ret.type = "success";
	    return ret;
	}


	//
	// Console.log
	//

	  var debug = false ;

	  function console_log ( msg )
	  {
		if (debug) {
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
      function first_token(assembly)
      {
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
      function get_token(assembly)
      {
        var index = tokenIndex;

        if (index >= assembly.length){
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
      function next_token(assembly)
      {
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


      function assembly_compiler()
      {
	    var ret = {
		            update: "",
		            status: "ok"
	    } ;

            var assembly_code = code_assembly ;

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

            /*Start of compilation*/
            first_token(assembly_code);

            if(get_token(assembly_code) == null){
               return packCompileError(0, 'Please enter the assembly code before compiling', 'danger') ;
            }

            token = get_token(assembly_code);
            console_log(token)

            while(!empty){
              token = get_token(assembly_code);
              console_log(token)

              if(token == null){
                empty = true;
                break;
              }

              var change = false;
              var ret = {} ;

              for(var i = 0; i < architecture.directives.length; i++){
                if(token == architecture.directives[i].name){
                  switch(architecture.directives[i].action){
                    case "data_segment":
                      console_log("data_segment");
                      ret = data_segment_compiler();
                      if (ret.status != "ok"){
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
                          //app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
                          //app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
                          //app._data.memory[memory_hash[2]] = memory[memory_hash[2]];
                          //app._data.instructions = instructions;
                          //hide_loading();
                          return ret ;
                      }

                      change = true;
                      break;

                    case "code_segment":
                      console_log("code_segment");
                      ret = code_segment_compiler();
                      if (ret.status != "ok"){
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
                          //app._data.instructions = instructions;
                          //app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
                          //app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
                          //app._data.memory[memory_hash[2]] = memory[memory_hash[2]];
                          //hide_loading();
                          return ret ;
                      }

                      change = true;
                      break;

                    case "global_symbol":

                      var isGlobl = true;
                      next_token(assembly_code);

                      while(isGlobl){
                        token = get_token(assembly_code);

                        re = new RegExp(",", "g");
                        token = token.replace(re, "");

                        console_log(token)
                        extern.push(token);
                        change = true;

                        next_token(assembly_code);
                        token = get_token(assembly_code);

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
                  tokenIndex = 0;
                  return packCompileError(15, token, '') ;
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
                    ret = packCompileError(7, instructionParts[j], pending_instructions[i].line);
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
                    //app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
                    //app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
                    //app._data.memory[memory_hash[2]] = memory[memory_hash[2]];
                    //app._data.instructions = instructions;
                    return ret ;
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
                    ret = packCompileError(7, instructionParts[j], pending_instructions[i].line);
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
                    return ret ;
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
                    ret = packCompileError(7, instructionParts[j], pending_instructions[i].line);
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
                    return ret ;
                  }
                }
              }
            }

            /*Enter the binary in the text segment*/
            if(update_binary.instructions_binary != null){
              for (var i = 0; i < update_binary.instructions_binary.length; i++){
                var hex = bin2hex(update_binary.instructions_binary[i].loaded);
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

                //app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
              }
            }

            /*Enter the compilated instructions in the text segment*/
            for (var i = 0; i < instructions_binary.length; i++){
              var hex = bin2hex(instructions_binary[i].loaded);
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
              //app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
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

                return packCompileError(0, 'Data overflow', 'danger') ;
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

                return packCompileError(0, 'Instruction overflow', 'danger') ;
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

            /*Initialize stack*/
            memory[memory_hash[2]].push({Address: stack_address, Binary: [], Value: null, DefValue: null, reset: false, unallocated: false});
            
            for(var i = 0; i<4; i++){
              (memory[memory_hash[2]][memory[memory_hash[2]].length-1].Binary).push({Addr: stack_address + i, DefBin: "00", Bin: "00", Tag: null},);
            }

            //app._data.memory[memory_hash[2]] = memory[memory_hash[2]];

            address = architecture.memory_layout[0].value;
            data_address = architecture.memory_layout[2].value;
            stack_address = architecture.memory_layout[4].value;

            return ret ;
      }

      function data_segment_compiler()
      {
	    var ret = {
		            update: "",
		            status: "ok"
	    } ;

            var assembly_code = code_assembly ;
            var existsData = true;

        next_token(assembly_code);

        while(existsData){
          token = get_token(assembly_code);
          console_log(token);

          var label = "";

          if(token == null){
            break;
          }

          console_log(token)

          var found = false;

          if(token.search(/\:$/) != -1){
            if(token.length == 1){
              return packCompileError(0, "", '') ;
            }

            for(var i = 0; i < data_tag.length; i++){
              console_log(data_tag[i].tag);
              console_log(token.substring(0,token.length-1))
              if(data_tag[i].tag == token.substring(0,token.length-1)){
                return packCompileError(1, token.substring(0,token.length-1), '') ;
              }
            }

            for(var i = 0; i < instructions.length; i++){
              if(instructions[i].Label == token.substring(0,token.length-1)){
                return packCompileError(1, token.substring(0,token.length-1), '') ;
              } 
            }

            label = token.substring(0,token.length-1);
            next_token(assembly_code);
            token = get_token(assembly_code);
          }

          for(var j = 0; j < architecture.directives.length; j++){
            if(token == architecture.directives[j].name){
              switch(architecture.directives[j].action){
                case "byte":
                  var isByte = true;

                  next_token(assembly_code);

                  while(isByte){
                    token = get_token(assembly_code);

                    if(token == null){
                      return packCompileError(23, "", '') ;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                       return packCompileError(24, token, '') ;
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
                        return packCompileError(16, token, '') ;
                      }

                      auxTokenString = value[1].padStart(2*architecture.directives[j].size, "0");
                      if(value[1].length == 0){
                        return packCompileError(19, token, '') ;
                      }

                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        return packCompileError(18, token, '') ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[0-9-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        return packCompileError(16, token, '') ;
                      }
                      auxToken = parseInt(token) >>> 0;
                      auxTokenString = (auxToken.toString(16).substring(auxToken.toString(16).length-2*architecture.directives[j].size, auxToken.toString(16).length)).padStart(2*architecture.directives[j].size, "0");
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        return packCompileError(18, token, '') ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    
                    console_log(auxTokenString)

                    ret = data_compiler(auxTokenString, architecture.directives[j].size, label, parseInt(auxTokenString, 16)) ;
		    if (ret.status != 'ok') {
                        return ret ;
                    }

                    label = null;

                    console_log(memory[memory_hash[0]]);
                    console_log("byte Terminado");

                    next_token(assembly_code);
                    token = get_token(assembly_code);

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

                  next_token(assembly_code);

                  while(ishalf){
                    token = get_token(assembly_code);

                    if (token == null){
                        return packCompileError(23,"", '') ;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      return packCompileError(24, token, '') ;
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
                        return packCompileError(16, token, '') ;
                      }

                      auxTokenString = value[1].padStart(2*architecture.directives[j].size, "0");

                      if(value[1].length == 0){
                        return packCompileError(19, token, '') ;
                      }
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        return packCompileError(18, token, '') ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[0-9-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        return packCompileError(16, token, '') ;
                      }
                      auxToken = parseInt(token) >>> 0;
                      auxTokenString = (auxToken.toString(16).substring(auxToken.toString(16).length-2*architecture.directives[j].size, auxToken.toString(16).length)).padStart(2*architecture.directives[j].size, "0");
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        return packCompileError(18, token, '') ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    
                    console_log(auxTokenString)

                    ret = data_compiler(auxTokenString, architecture.directives[j].size, label, parseInt(auxTokenString, 16)) ;
		    if (ret.status != 'ok') {
                        return ret ;
                    }

                    label = null;

                    console_log(memory[memory_hash[0]]);
                    console_log("half Terminado");

                    next_token(assembly_code);
                    token = get_token(assembly_code);

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

                  next_token(assembly_code);

                  while(isWord){
                    console_log("word")

                    token = get_token(assembly_code);

                    if(token == null){
                      return packCompileError(23,"", '') ;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      return packCompileError(24, token, '') ;
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
                        return packCompileError(16, token, '') ;
                      }

                      auxTokenString = value[1].padStart(2*architecture.directives[j].size, "0");
                      if(value[1].length == 0){
                        return packCompileError(19, token, '') ;
                      }
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        return packCompileError(18, token, '') ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[0-9-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        return packCompileError(16, token, '') ;
                      }
                      auxToken = parseInt(token) >>> 0;
                      auxTokenString = (auxToken.toString(16).substring(auxToken.toString(16).length-2*architecture.directives[j].size, auxToken.toString(16).length)).padStart(2*architecture.directives[j].size, "0");
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        return packCompileError(18, token, '') ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    
                    console_log(auxTokenString);

                    ret = data_compiler(auxTokenString, architecture.directives[j].size, label, (parseInt(auxTokenString, 16)) >> 0) ;
		    if (ret.status != 'ok') {
                        return ret ;
                    }

                    label = null;

                    console_log(memory[memory_hash[0]]);
                    console_log("word Terminado");

                    next_token(assembly_code);
                    token = get_token(assembly_code);

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

                  next_token(assembly_code);

                  while(isDoubleWord){
                    console_log("word");

                    token = get_token(assembly_code);

                    if(token == null){
                      return packCompileError(23,"", '') ;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      return packCompileError(24, token, '') ;
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
                        return packCompileError(16, token, '') ;
                      }

                      auxTokenString = value[1].padStart(2*architecture.directives[j].size, "0");
                      if(value[1].length == 0){
                        return packCompileError(19, token, '') ;
                      }
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        return packCompileError(18, token, '') ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[0-9-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        return packCompileError(16, token, '') ;
                      }
                      auxToken = parseInt(token) >>> 0;
                      auxTokenString = (auxToken.toString(16).substring(auxToken.toString(16).length-2*architecture.directives[j].size, auxToken.toString(16).length)).padStart(2*architecture.directives[j].size, "0");
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        return packCompileError(18, token, '') ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    
                    ret = data_compiler(auxTokenString, architecture.directives[j].size, label, parseInt(auxTokenString, 16)) ;
		    if (ret.status != 'ok') {
                        return ret ;
                    }

                    label = null;

                    console_log(memory[memory_hash[0]]);
                    console_log("double word Terminado");

                    next_token(assembly_code);
                    token = get_token(assembly_code);

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

                  next_token(assembly_code);

                  while(isFloat){
                    console_log("float");

                    token = get_token(assembly_code);

                    if(token == null){
                      return packCompileError(23,"", '') ;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      return packCompileError(24, token, '') ;
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
                        return packCompileError(16, token, '') ;
                      }

                      auxTokenString = value[1].padStart(2*architecture.directives[j].size, "0");
                      if(value[1].length == 0){
                        return packCompileError(19, token, '') ;
                      }
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        return packCompileError(18, token, '') ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[\+e0-9.-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        return packCompileError(16, token, '') ;
                      }
                      auxToken = parseFloat(token, 10);
                      auxTokenString = (bin2hex(float2bin(auxToken))).padStart(2*architecture.directives[j].size, "0");
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        return packCompileError(18, token, '') ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    
                    console_log(auxTokenString);

                    ret = data_compiler(auxTokenString, architecture.directives[j].size, label, token) ;
		    if (ret.status != 'ok') {
                        return ret ;
                    }

                    label = null;

                    console_log(memory[memory_hash[0]]);
                    console_log("float Terminado");

                    next_token(assembly_code);
                    token = get_token(assembly_code);

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

                  next_token(assembly_code);

                  while(isDouble){
                    console_log("double");

                    token = get_token(assembly_code);

                    if(token == null){
                      return packCompileError(23,"", '') ;
                    }

                    re = new RegExp("([0-9A-Fa-f-]),([0-9A-Fa-f-])");
                    if(token.search(re) != -1){
                      return packCompileError(24, token, '') ;
                    }

                    re = new RegExp(",", "g")
                    token = token.replace(re, "");

                    console_log(token);

                    var auxToken;
                    var auxTokenString;
                    if(token.match(/^0x/)){
                      var value = token.split('x');

                      re = new RegExp("[0-9A-Fa-f]{"+value[1].length+"}","g");
                      if(value[1].search(re) == -1){
                        return packCompileError(16, token, '') ;
                      }

                      auxTokenString = value[1].padStart(2*architecture.directives[j].size, "0");
                      if(value[1].length == 0){
                        return packCompileError(19, token, '') ;
                      }
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        return packCompileError(18, token, '') ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    else{
                      var re = new RegExp("[\+e0-9.-]{"+token.length+"}","g");
                      if(token.search(re) == -1){
                        return packCompileError(16, token, '') ;
                      }
                      auxToken = parseFloat(token, 10);console_log(auxTokenString);
                      auxTokenString = (bin2hex(double2bin(auxToken))).padStart(2*architecture.directives[j].size, "0");
                      if(auxTokenString.length > 2*architecture.directives[j].size){
                        return packCompileError(18, token, '') ;
                      }
                      auxTokenString = auxTokenString.substring(auxTokenString.length-(2*architecture.directives[j].size), auxTokenString.length);
                    }
                    
                    console_log(auxTokenString);

                    ret = data_compiler(auxTokenString, architecture.directives[j].size, label, token) ;
		    if (ret.status != 'ok') {
                        return ret ;
                    }

                    label = null;

                    console_log(memory[memory_hash[0]]);
                    console_log("double Terminado");

                    next_token(assembly_code);
                    token = get_token(assembly_code);

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

                  next_token(assembly_code);

                  while(isAscii){
                    console_log("ascii_not_null_end");

                    token = get_token(assembly_code);
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

                    console_log(string);

                    for(var i = 0; i < string.length; i++){
                      console_log(string.length);
                      if((data_address % align) != 0 && i == 0 && align != 0){
                        while((data_address % align) != 0){
                          if(data_address % 4 == 0){
                            memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: null, DefValue: null, reset: false});
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
                        memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: string.charAt(i), DefValue: string.charAt(i), reset: false});

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
                      next_token(assembly_code);
                      token = get_token(assembly_code);
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

                  next_token(assembly_code);

                  while(isAscii){
                    console_log("ascii_null_end")

                    token = get_token(assembly_code);
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

                    console_log(string);

                    for(var i = 0; i < string.length + 1; i++){
                      console_log(string.length);
                      if((data_address % align) != 0 && i == 0 && align != 0){
                        while((data_address % align) != 0){
                          if(data_address % 4 == 0){
                            memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: null, DefValue: null, reset: false});
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
                        memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: string.charAt(i), DefValue: string.charAt(i), reset: false});

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
                      next_token(assembly_code);
                      token = get_token(assembly_code);
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

                  next_token(assembly_code);
                  token = get_token(assembly_code);
                  console_log(token);
                  console_log(label);

                  if(token == null){
                    return packCompileError(23, "", '') ;
                  }

                  var re = new RegExp("[0-9-]{"+token.length+"}","g");
                  if(token.search(re) == -1){
                    return packCompileError(16, token, '') ;
                  }

                  if(parseInt(token) < 0){
                    return packCompileError(22, token, '') ;
                  }

                  var auxToken = parseInt(token) * architecture.directives[j].size;

                  for(var i = 0; i < auxToken; i++){
                    if((data_address % align) != 0 && i == 0 && align != 0){
                      while((data_address % align) != 0){
                        if(data_address % 4 == 0){
                          memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: null, DefValue: null, reset: false});
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
                      memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: string, DefValue: "", reset: false});

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

                  next_token(assembly_code);
                  token = get_token(assembly_code);

                  console_log("space Terminado");

                  break;
                case "align":
                  console_log("align");

                  next_token(assembly_code);
                  token = get_token(assembly_code);
                  console_log(token);

                  if(token == null){
                    return packCompileError(23, "", '') ;
                  }

                  var re = new RegExp("[0-9-]{"+token.length+"}","g");
                  if(token.search(re) == -1){
                    return packCompileError(16, token, '') ;
                  }

                  if(parseInt(token) < 0){
                    return packCompileError(22, token, '') ;
                  }

                  console_log(align);
                  align = Math.pow(2, parseInt(token));
                  console_log(align);

                  next_token(assembly_code);
                  token = get_token(assembly_code);

                  console_log("align Terminado");

                  break;
                default:
                  console_log("Default");
                  existsData = false;
                  break;
              }
            }

            else if(j== architecture.directives.length-1 && token != architecture.directives[j].name && token != null && token.search(/\:$/) == -1){
              //app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
              return ret;
            }
          
          }
        }

        //app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
        return ret ;
      }

      /*Compile text segment*/
      function code_segment_compiler()
      {
	    var ret = {
		            update: "",
		            status: "ok"
	    } ;

            var assembly_code = code_assembly ;
            var existsInstruction = true;

        next_token(assembly_code);
        var instInit = tokenIndex;

        while(existsInstruction){
          token = get_token(assembly_code);

          for(var i = 0; i < architecture.directives.length; i++){
            if(token == architecture.directives[i].name && architecture.directives[i].action == "global_symbol"){
              next_token(assembly_code); // .globl *main* 
              next_token(assembly_code); 
              token = get_token(assembly_code);
            }
            else if(token == architecture.directives[i].name){
              //app._data.instructions = instructions;
              console_log(token);
              for(var i = 0; i < instructions.length; i++){
                if(instructions[i].Label != ""){
                  instructions_tag.push({tag: instructions[i].Label, addr: parseInt(instructions[i].Address, 16)});
                }
              }

              return ret ;
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
              return packCompileError(0, "", '') ;
            }

            for(var i = 0; i < memory[memory_hash[0]].length; i++){
              for(var j = 0; j < memory[memory_hash[0]][i].Binary.length; j++){
                if(memory[memory_hash[0]][i].Binary[j].Tag == token.substring(0,token.length-1)){
                  return packCompileError(1, token.substring(0,token.length-1), '') ;
                }
              }
            }

            for(var i = 0; i < instructions.length; i++){
              if(instructions[i].Label == token.substring(0,token.length-1)){
                return packCompileError(1, token.substring(0,token.length-1), '') ;
              } 
            }

            label = token.substring(0,token.length-1);
            next_token(assembly_code);
            instInit = tokenIndex;
            token = get_token(assembly_code);

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
              instruction_compiler("nop", "nop", label, false, 0, instInit, instIndex, false);
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
                next_token(assembly_code);
                token = get_token(assembly_code);
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

              var result = instruction_compiler(instruction, userInstruction, label, false, 0, instInit, i, false);

              if (result.status != 'ok'){
                  return result ;
              }

              next_token(assembly_code);
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
                  next_token(assembly_code);
                  token = get_token(assembly_code);

                  if(token != null){
                    var re = new RegExp(",+$");
                    token = token.replace(re, "");
                  }

                  instruction = instruction + " " + token;
                }
                resultPseudo = pseudoinstruction_compiler(instruction, label) ;
                console_log(resultPseudo);
              }
            }

            if(resultPseudo == -3){
              for (var i = 0; i < architecture.components.length; i++){
                for (var j = 0; j < architecture.components[i].elements.length; j++){
                  var re = new RegExp(architecture.components[i].elements[j].name);
                  if(token.search(re) != -1){
                    ret = packCompileError(26, (textarea_assembly_editor.posFromIndex(tokenIndex).line) + 1, '') ;

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
                    //app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
                    //memory[memory_hash[1]] = memory[memory_hash[1]];
                    //memory[memory_hash[2]] = memory[memory_hash[2]];
                    //app._data.instructions = instructions;
                    return ret ;
                  }
                }          
              }


              ret = packCompileError(2, token, ''); //PRUEBA para dar error con mas detalle

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
              //app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
              //memory[memory_hash[1]] = memory[memory_hash[1]];
              //memory[memory_hash[2]] = memory[memory_hash[2]];
              return ret ;
            }

            if(resultPseudo == -2){
              ret = packCompileError(2, token, ''); //PRUEBA para dar error con mas detalle

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
              //app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
              //memory[memory_hash[1]] = memory[memory_hash[1]];
              //memory[memory_hash[2]] = memory[memory_hash[2]];
              //app._data.instructions = instructions;
              return ret ;
            }

            if(resultPseudo == -1){
              ret = packCompileError(25, "", '') ;
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
              //app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
              //memory[memory_hash[1]] = memory[memory_hash[1]];
              //memory[memory_hash[2]] = memory[memory_hash[2]];
              //app._data.instructions = instructions;
              return ret ;
            }

            next_token(assembly_code);
            instInit = tokenIndex; //PRUEBA

          }
        }

        token = get_token(assembly_code);
        console_log(token);

        for(var i = 0; i < instructions.length; i++){
          if(instructions[i].Label != ""){
            instructions_tag.push({tag: instructions[i].Label, addr: parseInt(instructions[i].Address, 16)});
          }
        }

        return ret ;
      }

      /*Compile instruction*/
      function instruction_compiler (instruction, userInstruction, label, pending, pendingAddress, instInit, instIndex, isPseudo)
      {
	    var ret = {
		            update: "",
		            status: "ok"
	    } ;

            var assembly_code = code_assembly ;

        if(instIndex == null){
          instIndex = 0;
        }
        console_log(instruction);
        console_log(instIndex);
        var re = new RegExp("^ +");
        var oriInstruction = instruction.replace(re, "");

        re = new RegExp(" +", "g");
        oriInstruction = oriInstruction.replace(re, " ");

        var instructionParts = oriInstruction.split(' ');
        var validTagPC = true;
        var startBit;
        var stopBit;
        var resultPseudo = -3;

        console_log(label);

        var stopFor = false;

        for(var i = instIndex; i < architecture.instructions.length && stopFor == false; i++){
          if(architecture.instructions[i].name != instructionParts[0]){
            continue;
          }
          else{
            var auxSignature = architecture.instructions[i].signatureRaw;

            var tag = "";

            var binary = "";
            binary = binary.padStart(architecture.instructions[i].nwords * 32, "0");

            var instruction = architecture.instructions[i].signature_definition;
            var userInstruction = userInstruction;

            var signatureDef = architecture.instructions[i].signature_definition;
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

            re = new RegExp(signatureDef+"$");
            if(oriInstruction.search(re) == -1){

              if(isPseudo == false){
                console_log(get_token(assembly_code))

                tokenIndex =  instInit;
                token = get_token(assembly_code);

                console_log(token);
              }
              else{
                token = instructionParts[0];
              }

              var resultPseudo = null;
              var instruction = "";
              var numToken = 0;

              console_log(token)

              for(var i = i + 1; i < architecture.instructions.length; i++){
                if(architecture.instructions[i].name == token){

                  var index = i;
                  numToken = architecture.instructions[i].fields.length;
                  instruction = instruction + token;

                  for (var a = 1; a < numToken; a++){
                    if(architecture.instructions[i].fields[a].type != "cop"){
                      if(isPseudo == false){
                        next_token(assembly_code);
                        token = get_token(assembly_code);

                        if(token != null){
                          var re = new RegExp(",+$");
                          token = token.replace(re, "");
                        }
                      }
                      else{
                        token = instructionParts[a];
                      }

                      instruction = instruction + " " + token;
                      console_log(instruction);
                    }
                  }
                  if(isPseudo == false){
                    instruction_compiler(instruction, instruction, label, false, pending, pendingAddress, instInit, index, false);
                  }
                  else{
                    instruction_compiler(instruction, userInstruction, label, false, pending, pendingAddress, instInit, index, false);
                  }
                  return ret ;
                }
              }
              

              for (var i = 0; i < architecture.pseudoinstructions.length; i++){
                if(architecture.pseudoinstructions[i].name == token){
                  numToken = architecture.pseudoinstructions[i].fields.length;

                  instruction = instruction + token;

                  for (var i = 0; i < numToken; i++){
                    next_token(assembly_code);
                    token = get_token(assembly_code);

                    if(token != null){
                      var re = new RegExp(",+$");
                      token = token.replace(re, "");
                    }

                    instruction = instruction + " " + token;
                  }
                  console_log(instruction)
                  resultPseudo = pseudoinstruction_compiler(instruction, label) ;
                
                  console_log(resultPseudo)

		  if (resultPseudo.status == 'ok') {
                      return ret ;
                  }

                  return packCompileError(3, auxSignature, '') ;
                }
              }
            }

            if (resultPseudo == null){
                return packCompileError(3, auxSignature, '') ;
            }
            console_log(oriInstruction);
            match = re.exec(oriInstruction);
            instructionParts = [];
            if(match != null){
              for(var j = 1; j < match.length; j++){
                instructionParts.push(match[j]);
              }
            }
            else{
                return packCompileError(14, "Error instruction", '') ;
            }
            
            console_log(instructionParts);

            //PRUEBA
            re = new RegExp("[fF][0-9]+");
            while(instruction.search(re) != -1){
              re = new RegExp("[fF]([0-9]+)");
              var match = re.exec(instruction);
              re = new RegExp("[fF][0-9]+");
              instruction = instruction.replace(re, "Field"+match[1]);
            }


            for(var j = 0; j < signatureParts.length; j++){
              console_log(signatureParts[j]);
              switch(signatureParts[j]) {
                case "INT-Reg":
                  token = instructionParts[j];

                  console_log(token);

                  var id = -1;
                  re = new RegExp("[0-9]+");
                  if(token.search(re) != -1){
                    re = new RegExp("(.*?)$");
                    match = re.exec(token);
                    id = match[1];
                  }

                  var validReg = false;
                  var regNum = 0;

                  for(var a = 0; a < architecture.instructions[i].fields.length; a++){
                    if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                      for(var z = 0; z < architecture_hash.length; z++){
                        for(var w = 0; w < architecture.components[z].elements.length; w++){
                          if(token == architecture.components[z].elements[w].name && architecture.components[z].type == "integer"){
                            validReg = true;
                            regNum++;

                            fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                            var reg = w;

                            if(reg.toString(2).length > fieldsLength){
                              return packCompileError(12, token, '') ;
                            }

                            console_log(reg)
                            console_log((reg.toString(2)).padStart(fieldsLength, "0"))
                            console_log(binary)
                            console_log(binary.length)
                            console_log(architecture.instructions[i].fields[a].startbit + 1)
                            console_log(binary.length - (architecture.instructions[i].fields[a].startbit + 1))

                            binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (reg.toString(2)).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                            
                            console_log(binary);

                            //re = RegExp("[fF][0-9]+");
                            re = RegExp("Field[0-9]+");
                            instruction = instruction.replace(re, token);
                          }
                          else if(id == regNum){
                            validReg = true;

                            fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                            var reg = regNum;

                            if(reg.toString(2).length > fieldsLength){
                              return packCompileError(12, token, '') ;
                            }

                            binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (reg.toString(2)).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                            //re = RegExp("[fF][0-9]+");
                            re = RegExp("Field[0-9]+");
                            instruction = instruction.replace(re, token);
                          }
                          else if(z == architecture_hash.length-1 && w == architecture.components[z].elements.length-1 && validReg == false){
                            return packCompileError(4, token, '') ;
                          }
                          regNum++;
                        }
                      }
                    }
                  }

                  break;

                case "SFP-Reg":
                  token = instructionParts[j];

                  console_log(token);

                  var validReg = false;
                  var regNum = 0;

                  for(var a = 0; a < architecture.instructions[i].fields.length; a++){
                    if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                      for(var z = 0; z < architecture_hash.length; z++){
                        for(var w = 0; w < architecture.components[z].elements.length; w++){
                          if(token == architecture.components[z].elements[w].name && architecture.components[z].type == "floating point" && architecture.components[z].double_precision == false){
                            validReg = true;
                            regNum++;

                            fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                            var reg = regNum;

                            if(reg.toString(2).length > fieldsLength){
                              return packCompileError(12, token, '') ;
                            }

                            binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (reg.toString(2)).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                            //re = RegExp("[fF][0-9]+");
                            re = RegExp("Field[0-9]+");
                            console_log(instruction);
                            instruction = instruction.replace(re, token);
                            console_log(instruction);
                          }
                          else if(z == architecture_hash.length-1 && w == architecture.components[z].elements.length-1 && validReg == false){
                            return packCompileError(4, token, '') ;
                          }
                          if(architecture.components[z].type == "floating point" && architecture.components[z].double_precision == false){
                            regNum++;
                          }
                        }
                      }
                    }
                  }

                  break;

                case "DFP-Reg":
                  token = instructionParts[j];

                  console_log(token);

                  var validReg = false;
                  var regNum = 0;

                  for(var a = 0; a < architecture.instructions[i].fields.length; a++){
                    if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                      for(var z = 0; z < architecture_hash.length; z++){
                        for(var w = 0; w < architecture.components[z].elements.length; w++){
                          if(token == architecture.components[z].elements[w].name && architecture.components[z].type == "floating point" && architecture.components[z].double_precision == true){
                            validReg = true;
                            regNum++;

                            fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                            var reg = regNum;

                            if(reg.toString(2).length > fieldsLength){
                              return packCompileError(12, token, '') ;
                            }

                            binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (reg.toString(2)).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                            //re = RegExp("[fF][0-9]+");
                            re = RegExp("Field[0-9]+");
                            instruction = instruction.replace(re, token);
                          }
                          else if(z == architecture_hash.length-1 && w == architecture.components[z].elements.length-1 && validReg == false){
                            return packCompileError(4, token, '') ;
                          }
                          if(architecture.components[z].type == "floating point" && architecture.components[z].double_precision == true){
                            regNum++;
                          }
                        }
                      }
                    }
                  }

                  break;

                case "Ctrl-Reg":
                  token = instructionParts[j];

                  console_log(token)

                  var validReg = false;
                  var regNum = 0;

                  for(var a = 0; a < architecture.instructions[i].fields.length; a++){
                    if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                      for(var z = 0; z < architecture_hash.length; z++){
                        for(var w = 0; w < architecture.components[z].elements.length; w++){
                          if(token == architecture.components[z].elements[w].name && architecture.components[z].type == "control"){
                            validReg = true;
                            regNum++;

                            fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                            var reg = regNum;

                            if(reg.toString(2).length > fieldsLength){
                              return packCompileError(12, token, '') ;
                            }

                            binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (reg.toString(2)).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                            //re = RegExp("[fF][0-9]+");
                            re = RegExp("Field[0-9]+");
                            instruction = instruction.replace(re, token);
                          }
                          else if(z == architecture_hash.length-1 && w == architecture.components[z].elements.length-1 && validReg == false){
                            return packCompileError(4, token, '') ;
                          }
                          if(architecture.components[z].type == "control"){
                            regNum++;
                          }
                        }
                      }
                    }
                  }

                  break;

                case "inm-signed":
                  token = instructionParts[j];
                  var token_user = "";

                  console_log(token);

                  for(var a = 0; a < architecture.instructions[i].fields.length; a++){
                    if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                      fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                  
                      var inm;

                      if(token.match(/^0x/)){
                        var value = token.split("x");
                        if(value[1].length*4 > fieldsLength){
                          resultPseudo = pseudoinstruction_compiler(oriInstruction, label);

                          console_log(resultPseudo);

                          if (resultPseudo.status != 'ok'){
                              return ret ;
                          }
                        }

                        if(isNaN(parseInt(token, 16)) == true){
                          return packCompileError(6, token, '') ;
                        }

                        inm = (parseInt(token, 16)).toString(2);
                      }
                      else if (token.match(/^(\d)+\.(\d)+/)){
                        if(float2bin(parseFloat(token)).length > fieldsLength){
                          resultPseudo = pseudoinstruction_compiler(oriInstruction, label);

                          console_log(resultPseudo);

                          if (resultPseudo.status != 'ok'){
                              return ret ;
                          }
                        }

                        if(isNaN(parseFloat(token)) == true){
                          return packCompileError(6, token, '') ;
                        }

                        inm = float2bin(parseFloat(token, 16));
                      }
                      else if(token.match(/^\'(.*?)\'$/)){
                        var re = /^\'(.*?)\'$/;
                        console_log(re);
                        var match = re.exec(token);
                        console_log(match);
                        var asciiCode = match[1].charCodeAt(0);
                        console_log(asciiCode);

                        re = RegExp("Field[0-9]+");
                        instruction = instruction.replace(re, asciiCode);

                        inm = (asciiCode >>> 0).toString(2);
                      }
                      else if(isNaN(parseInt(token))){
                        validTagPC = false;
                        startBit = architecture.instructions[i].fields[a].startbit;
                        stopBit = architecture.instructions[i].fields[a].stopbit;
                      }
                      else {

                        var comNumPos = Math.pow(2, fieldsLength-1);
                        var comNumNeg = comNumPos * (-1);
                        comNumPos = comNumPos -1;

                        console_log(comNumPos);
                        console_log(comNumNeg);

                        if(parseInt(token, 10) > comNumPos || parseInt(token, 10) < comNumNeg){
                          console_log(oriInstruction)
                          console_log(label)
                          resultPseudo = pseudoinstruction_compiler(oriInstruction, label);

                          if (resultPseudo.status != 'ok'){
                              return ret ;
                          }
                        }

                        if(isNaN(parseInt(token)) == true && resultPseudo == -3){
                          return packCompileError(6, token, '') ;
                        }

                        inm = (parseInt(token, 10) >>> 0).toString(2);
                        inm = inm.substring(inm.length - fieldsLength ,inm.length);
                      }
                      if(validTagPC == true){
                        console_log(inm.length);
                        if(inm.length > (architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1)){
                          ret = packCompileError(12, token, '') ;
                        }

                        binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + inm.padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                      }
                      
                      //re = RegExp("[fF][0-9]+");
                      re = RegExp("Field[0-9]+");
                      instruction = instruction.replace(re, token);
                    }
                  }

                  break;

                case "inm-unsigned":
                  token = instructionParts[j];
                  var token_user = "";

                  console_log(token);

                  for(var a = 0; a < architecture.instructions[i].fields.length; a++){
                    if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                      fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                  
                      var inm;

                      if(token.match(/^0x/)){
                        var value = token.split("x");
                        if(value[1].length*4 > fieldsLength){
                          resultPseudo = pseudoinstruction_compiler(oriInstruction, label);

                          console_log(resultPseudo);

                          if (resultPseudo.status != 'ok'){
                              return ret ;
                          }
                        }

                        if(isNaN(parseInt(token, 16)) == true){
                          return packCompileError(6, token, '') ;
                        }

                        inm = (parseInt(token, 16)).toString(2);
                      }
                      else if (token.match(/^(\d)+\.(\d)+/)){
                        if(float2bin(parseFloat(token)).length > fieldsLength){
                          resultPseudo = pseudoinstruction_compiler(oriInstruction, label);

                          console_log(resultPseudo);

                          if (resultPseudo.status != 'ok'){
                              return ret ;
                          }
                        }

                        if(isNaN(parseFloat(token)) == true){
                          return packCompileError(6, token, '') ;
                        }

                        inm = float2bin(parseFloat(token, 16));
                      }
                      else if(token.match(/^\'(.*?)\'$/)){
                        var re = /^\'(.*?)\'$/;
                        console_log(re);
                        var match = re.exec(token);
                        console_log(match);
                        var asciiCode = match[1].charCodeAt(0);
                        console_log(asciiCode);

                        re = RegExp("Field[0-9]+");
                        instruction = instruction.replace(re, asciiCode);

                        inm = (asciiCode >>> 0).toString(2);
                      }
                      else if(isNaN(parseInt(token))){
                        validTagPC = false;
                        startBit = architecture.instructions[i].fields[a].startbit;
                        stopBit = architecture.instructions[i].fields[a].stopbit;
                      }
                      else {

                        var comNumPos = Math.pow(2, fieldsLength);

                        console_log(comNumPos);

                        if(parseInt(token, 10) > comNumPos){
                          console_log(oriInstruction) ;
                          console_log(label) ;
                          resultPseudo = pseudoinstruction_compiler(oriInstruction, label);

                          console_log(resultPseudo);

                          if(resultPseudo == -1){
                            return packCompileError(5, token, '') ;
                          }

                          if(resultPseudo == -2){
                            return packCompileError(14, "", '') ;
                          }
                        }

                        if(isNaN(parseInt(token)) == true && resultPseudo == -3){
                          return packCompileError(6, token, '') ;
                        }

                        inm = (parseInt(token, 10) >>> 0).toString(2);
                        inm = inm.substring(inm.length - fieldsLength ,inm.length);
                      }
                      if(validTagPC == true){
                        console_log(inm.length);
                        if(inm.length > (architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1)){
                          return packCompileError(12, token, '') ;
                        }

                        binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + inm.padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                      }
                      
                      //re = RegExp("[fF][0-9]+");
                      re = RegExp("Field[0-9]+");
                      instruction = instruction.replace(re, token);
                    }
                  }

                  break;

                case "address":
                  token = instructionParts[j];

                  console_log(token)

                  for(var a = 0; a < architecture.instructions[i].fields.length; a++){
                    if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                      fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;

                      if(token.match(/^0x/)){
                        var value = token.split("x");

                        if(value[1].length*4 > fieldsLength){
                          return packCompileError(8, token, '') ;
                        }

                        if(isNaN(parseInt(token, 16)) == true){
                          return packCompileError(9, token, '') ;
                        }

                        addr = (parseInt(token, 16)).toString(2);
                        binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + addr.padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                        //re = RegExp("[fF][0-9]+");
                        re = RegExp("Field[0-9]+");
                        instruction = instruction.replace(re, token);
                      }
                      else{
                        var validTag = false;
                        startBit = architecture.instructions[i].fields[a].startbit;
                        stopBit = architecture.instructions[i].fields[a].stopbit;
                      }
                    }
                  }

                  break;

                case "offset_bytes":
                  token = instructionParts[j];
                  var token_user = "";

                  console_log(token);

                  for(var a = 0; a < architecture.instructions[i].fields.length; a++){
                    if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                      fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                  
                      var inm;

                      if(token.match(/^0x/)){
                        var value = token.split("x");
                        if(value[1].length*4 > fieldsLength){
                          resultPseudo = pseudoinstruction_compiler(oriInstruction, label);

                          console_log(resultPseudo);

                          if (resultPseudo.status != 'ok'){
                              return ret ;
                          }
                        }

                        if(isNaN(parseInt(token, 16)) == true){
                          return packCompileError(6, token, '') ;
                        }

                        inm = (parseInt(token, 16)).toString(2);
                      }
                      else if (token.match(/^(\d)+\.(\d)+/)){
                        if(float2bin(parseFloat(token)).length > fieldsLength){
                          resultPseudo = pseudoinstruction_compiler(oriInstruction, label);

                          console_log(resultPseudo);

                          if (resultPseudo.status != 'ok'){
                              return ret ;
                          }
                        }

                        if(isNaN(parseFloat(token)) == true){
                          return packCompileError(6, token, '') ;
                        }

                        inm = float2bin(parseFloat(token, 16));
                      }
                      else if(isNaN(parseInt(token))){
                        validTagPC = false;
                        startBit = architecture.instructions[i].fields[a].startbit;
                        stopBit = architecture.instructions[i].fields[a].stopbit;
                      }
                      else {

                        var comNumPos = Math.pow(2, fieldsLength-1);
                        var comNumNeg = comNumPos * (-1);
                        comNumPos = comNumPos -1;

                        console_log(comNumPos);
                        console_log(comNumNeg);


                        if(parseInt(token, 10) > comNumPos || parseInt(token, 10) < comNumNeg){
                          console_log(oriInstruction) ;
                          console_log(label) ;
                          resultPseudo = pseudoinstruction_compiler(oriInstruction, label);

                          console_log(resultPseudo);

                          if (resultPseudo.status != 'ok'){
                              return ret ;
                          }
                        }

                        if(isNaN(parseInt(token)) == true && resultPseudo == -3){
                          return packCompileError(6, token, '') ;
                        }

                        inm = (parseInt(token, 10) >>> 0).toString(2);
                        inm = inm.substring(inm.length - fieldsLength ,inm.length);
                      }
                      if(validTagPC == true){
                        if(inm.length > (architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1)){
                          return packCompileError(12, token, '') ;
                        }

                        binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + inm.padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                      }
                      
                      //re = RegExp("[fF][0-9]+");
                      re = RegExp("Field[0-9]+");
                      console_log(instruction);
                      instruction = instruction.replace(re, token);
                      console_log(instruction);
                    }
                  }

                  break;

                case "offset_words":
                  token = instructionParts[j];
                  var token_user = "";

                  console_log(token);

                  for(var a = 0; a < architecture.instructions[i].fields.length; a++){
                    if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                      fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                  
                      var inm;

                      if(token.match(/^0x/)){
                        var value = token.split("x");
                        if(value[1].length*4 > fieldsLength){
                          resultPseudo = pseudoinstruction_compiler(oriInstruction, label);

                          console_log(resultPseudo);

                          if (resultPseudo.status != 'ok'){
                              return ret ;
                          }
                        }

                        if(isNaN(parseInt(token, 16)) == true){
                          return packCompileError(6, token, '') ;
                        }

                        inm = (parseInt(token, 16)).toString(2);
                      }
                      else if (token.match(/^(\d)+\.(\d)+/)){
                        if(float2bin(parseFloat(token)).length > fieldsLength){
                          resultPseudo = pseudoinstruction_compiler(oriInstruction, label);

                          console_log(resultPseudo);

                          if (resultPseudo.status != 'ok'){
                              return ret ;
                          }
                        }

                        if(isNaN(parseFloat(token)) == true){
                          return packCompileError(6, token, '') ;
                        }

                        inm = float2bin(parseFloat(token, 16));
                      }
                      else if(isNaN(parseInt(token))){
                        validTagPC = false;
                        startBit = architecture.instructions[i].fields[a].startbit;
                        stopBit = architecture.instructions[i].fields[a].stopbit;
                      }
                      else{

                        var comNumPos = Math.pow(2, fieldsLength-1);
                        var comNumNeg = comNumPos * (-1);
                        comNumPos = comNumPos -1;

                        console_log(comNumPos);
                        console_log(comNumNeg);


                        if(parseInt(token, 10) > comNumPos || parseInt(token, 10) < comNumNeg){
                          console_log(oriInstruction) ;
                          console_log(label) ;
                          resultPseudo = pseudoinstruction_compiler(oriInstruction, label);

                          console_log(resultPseudo);

                          if (resultPseudo.status != 'ok'){
                              return ret ;
                          }
                        }

                        if(isNaN(parseInt(token)) == true && resultPseudo == -3){
                          return packCompileError(6, token, '') ;
                        }

                        inm = (parseInt(token, 10) >>> 0).toString(2);
                        inm = inm.substring(inm.length - fieldsLength ,inm.length);

                      }
                      if(validTagPC == true){
                        if(inm.length > (architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1)){
                          return packCompileError(12, token, '') ;
                        }

                        binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + inm.padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                      }
                      
                      //re = RegExp("[fF][0-9]+");
                      re = RegExp("Field[0-9]+");
                      console_log(instruction);
                      instruction = instruction.replace(re, token);
                      console_log(instruction);
                    }
                  }

                  break;

                default:
                  token = instructionParts[j];

                  console_log(token);

                  for(var a = 0; a < architecture.instructions[i].fields.length; a++){
                    console_log(architecture.instructions[i].fields[a].name);
                    if(architecture.instructions[i].fields[a].name == signatureRawParts[j]){
                      fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;
                      
                      console_log((architecture.instructions[i].co).padStart(fieldsLength, "0"));

                      binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (architecture.instructions[i].co).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit), binary.length);
                      
                      console_log(binary);

                      //re = RegExp("[fF][0-9]+");
                      re = RegExp("Field[0-9]+");
                      console_log(instruction);
                      instruction = instruction.replace(re, token);
                      console_log(instruction);
                    }
                    if(architecture.instructions[i].fields[a].type == "cop"){
                      fieldsLength = architecture.instructions[i].fields[a].startbit - architecture.instructions[i].fields[a].stopbit + 1;

                      binary = binary.substring(0, binary.length - (architecture.instructions[i].fields[a].startbit + 1)) + (architecture.instructions[i].fields[a].valueField).padStart(fieldsLength, "0") + binary.substring(binary.length - (architecture.instructions[i].fields[a].stopbit ), binary.length);
                    }
                  }

                break;
              }
            }

            if(validTagPC == false && resultPseudo == -3){
              console_log("pendiente");

              var padding = "";
              padding = padding.padStart((architecture.instructions[i].nwords*32)-(binary.length), "0");
              binary = binary + padding;

              var hex = bin2hex(binary);
              var auxAddr = address;

              console_log(binary);
              console_log(bin2hex(binary));

              pending_instructions.push({address: address, instruction: instruction, signature: signatureParts, signatureRaw: signatureRawParts, Label: label, binary: binary, startBit: startBit, stopBit: stopBit, visible: true, line: tokenIndex});

              if(pending == false){
                instructions.push({ Break: null, Address: "0x" + address.toString(16), Label: label , loaded: instruction, user: userInstruction, _rowVariant: '', visible: true, hide: false});
                instructions_binary.push({ Break: null, Address: "0x" + address.toString(16), Label: label , loaded: binary, user: null, _rowVariant: '', visible: false});

                address = address + (4*architecture.instructions[i].nwords);
              }
              else{
                for(var pos = 0; pos < instructions.length; pos++){
                  if(parseInt(instructions[pos].Address, 16) > pendingAddress){
                    instructions.splice(pos, 0, { Break: null, Address: "0x" + pendingAddress.toString(16), Label: label , loaded: instruction, user: userInstruction, _rowVariant: '', visible: true, hide: false});
                    instructions_binary.splice(pos, 0, { Break: null, Address: "0x" + pendingAddress.toString(16), Label: label , loaded: binary, user: null, _rowVariant: '', visible: false});

                    auxAddr = pendingAddress;
                    break;
                  }
                }
              }

              console_log(address.toString(16));
              console_log(instructions);

              stopFor = true;
              break;
            }

            else{
              if(resultPseudo == -3){
                console_log("no pendiente")

                var padding = "";
                padding = padding.padStart((architecture.instructions[i].nwords*32)-(binary.length), "0");

                binary = binary + padding;
                var hex = bin2hex(binary);
                var auxAddr = address;

                console_log(binary);
                console_log(bin2hex(binary));

                if(pending == false){
                  instructions.push({ Break: null, Address: "0x" + address.toString(16), Label: label , loaded: instruction, user: userInstruction, _rowVariant: '', visible: true, hide: false});
                  instructions_binary.push({ Break: null, Address: "0x" + address.toString(16), Label: label , loaded: binary, user: null, _rowVariant: '', visible: false});

                  address = address + (4*architecture.instructions[i].nwords);
                }
                else{
                  for(var pos = 0; pos < instructions.length; pos++){
                    if(parseInt(instructions[pos].Address, 16) > pendingAddress){
                      instructions.splice(pos, 0, { Break: null, Address: "0x" + pendingAddress.toString(16), Label: label , loaded: instruction, user: userInstruction, _rowVariant: '', visible: true, hide: false});
                      instructions_binary.splice(pos, 0, { Break: null, Address: "0x" + pendingAddress.toString(16), Label: label , loaded: binary, user: null, _rowVariant: '', visible: false});

                      auxAddr = pendingAddress;
                      break;
                    }
                  }
                }

                stopFor = true;

                console_log(address.toString(16));
                console_log(instructions);
              }
            }
          }
        }

        return ret ;
      }

      /*Stores a data in data memory*/
      function data_compiler(value, size, dataLabel, DefValue)
      {
	    var ret = {
		            update: "",
		            status: "ok"
	    } ;

            var assembly_code = code_assembly ;

        for(var i = 0; i < (value.length/2); i++){
          if((data_address % align) != 0 && i == 0 && align != 0){
            while((data_address % align) != 0){
              if(data_address % 4 == 0){
                memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: null, DefValue: null, reset: false});
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
            return packCompileError(21, "", '') ;
          }

          if(data_address % 4 == 0){
            console_log(DefValue);
            memory[memory_hash[0]].push({Address: data_address, Binary: [], Value: DefValue, DefValue: DefValue, reset: false});

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
            console_log("padding");
          }
        }

        return ret ;
      }

      /*Compile pseudoinstructions*/
      function pseudoinstruction_compiler (instruction, label) 
      {
	    var ret = {
		            update: "",
		            status: "ok"
	    } ;

            var assembly_code = code_assembly ;

        var re = /\' \'/;
        instruction = instruction.replace(re, "'\0'");
        var re = /\'\\n\'/;
        instruction = instruction.replace(re, "10");
        console_log(instruction);
        var re = /\'\\t\'/;
        instruction = instruction.replace(re, "9");
        console_log(instruction);

        var instructionParts = instruction.split(' ');
        var found = false;

        var re = /\'\0\'/;
        instruction = instruction.replace(re, "' '");
        console_log(instruction);


        for (var i = 0; i < instructionParts.length; i++) {
          instructionParts[i] = instructionParts[i].replace(re, "' '");
        }

        console_log(instructionParts);

        for (var i = 0; i < architecture.pseudoinstructions.length; i++){
          console_log(architecture.pseudoinstructions[i].name);
          if(architecture.pseudoinstructions[i].name != instructionParts[0]){
            continue;
          }

          else{
            found = true;

            var signatureDef = architecture.pseudoinstructions[i].signature_definition;
            signatureDef = signatureDef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            re = new RegExp("[fF][0-9]+", "g");
            signatureDef = signatureDef.replace(re, "(.*?)");


            var signatureParts = architecture.pseudoinstructions[i].signature.split(',');
            var signatureRawParts = architecture.pseudoinstructions[i].signatureRaw.split(' ');
            var definition = architecture.pseudoinstructions[i].definition;

            console_log(signatureDef);
            console_log(instruction);
            console_log(instructionParts);

            if(instructionParts.length < (architecture.pseudoinstructions[i].fields.length + 1)){
              for (var j = 0; j < ((architecture.pseudoinstructions[i].fields.length + 1)-instructionParts.length ); j++){
                next_token(assembly_code);
                token = get_token(assembly_code);

                console_log(token);

                if(token != null){
                  var re = new RegExp(",+$");
                  token = token.replace(re, "");
                }

                instruction = instruction + " " + token;
              }

              instructionParts = instruction.split(' ');
            }

            console_log(instruction);

            re = new RegExp(signatureDef+"$");
            console_log(re)
            if (instruction.search(re) == -1 && i == architecture.pseudoinstructions.length-1){
                return packCompileError(5, token, '') ;
            }

            if(instruction.search(re) == -1 && i < architecture.pseudoinstructions.length-1){
              found = false;
            }

            if(found == true){
              re = /aliasDouble\((.*)\)/;
              for(var a = 0; a < architecture.pseudoinstructions[i].fields.length && definition.search(re) != -1; a++){
                re = new RegExp(architecture.pseudoinstructions[i].fields[a].name,"g");
                console_log(instructionParts[a+1]);
                instructionParts[a+1] = instructionParts[a+1].replace("$","");
                definition = definition.replace(re, instructionParts[a+1]);
              }

              /*Replace DFP of SPF*/
              re = /aliasDouble\((.*)\)/;
              console_log(re);
              while (definition.search(re) != -1){
                var match = re.exec(definition);
                var args = match[1].split(";");
                var aux = "";

                for(var b = 0; b < architecture.components[3].elements.length; b++){
                  console_log(architecture.components[3].elements[b].name); 
                  if(architecture.components[3].elements[b].name == args[0]){
                    aux = architecture.components[3].elements[b].simple_reg[args[1]];
                    console_log(aux);
                    break;
                  }
                }
                console_log(aux);

                definition = definition.replace(re, aux);
                console_log(definition);

              }

              for (var j = 1; j < signatureRawParts.length; j++){
                var aux = signatureRawParts[j].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                re = new RegExp(aux,"g");
                definition = definition.replace(re, instructionParts[j]);
              }

              re = new RegExp("\n","g");
              definition = definition.replace(re, "");

              console_log(definition);
              console_log(signatureParts);

              re = /Field.(\d).\((.*?)\).(.*?)[=<>;\s]/;
              while (definition.search(re) != -1){
                var match = re.exec(definition);
                console_log(match);

                var code;

                if(instructionParts[match[1]].match(/^\'(.*?)\'$/)){
                  var re = /^\'(.*?)\'$/;
                  console_log(re);
                  var match2 = re.exec(instructionParts[match[1]]);
                  console_log(match2);
                  var asciiCode = match2[1].charCodeAt(0);
                  console_log(asciiCode);
                  console_log("value = field('" + asciiCode +"', '(" + match[2] + ")', '" + match[3] + "')");
                  code = "value = field('" + asciiCode +"', '(" + match[2] + ")', '" + match[3] + "')";
                }
                else{
                  console_log("value = field('" + instructionParts[match[1]] +"', '(" + match[2] + ")', '" + match[3] + "')");
                  code = "value = field('" + instructionParts[match[1]] +"', '(" + match[2] + ")', '" + match[3] + "')";
                }

                var value;
                try{
                  //eval("value = field('" + instructionParts[match[1]] +"', '(" + match[2] + ")', '" + match[3] + "')");
                  eval(code);
                }
                catch(e){
                  if (e instanceof SyntaxError){
                    return packCompileError(5, token, '') ;
                  }
                }

                if(value == -1){
                    return packCompileError(5, token, '') ;
                }

                definition = definition.replace("Field." + match[1] + ".(" + match[2]+ ")." + match[3], value);
                
                re = /Field.(\d).\((.*?)\).(.*?)[;\s]/;
              }


              re = /Field.(\d).SIZE[=<>;\s]/g;
              if (definition.search(re) != -1){
                var match = re.exec(definition);
                console_log(match);

                var code;

                if(instructionParts[match[1]].match(/^\'(.*?)\'$/)){
                  var re = /^\'(.*?)\'$/;
                  console_log(re);
                  var match2 = re.exec(instructionParts[match[1]]);
                  console_log(match2);
                  var asciiCode = match2[1].charCodeAt(0);
                  console_log(asciiCode);
                  console_log("value = field('" + asciiCode +"', 'SIZE', null)");
                  code = "value = field('" + asciiCode +"', 'SIZE', null)";
                }
                else{
                  console_log("value = field('" + instructionParts[match[1]] +"', 'SIZE', null)");
                  code = "value = field('" + instructionParts[match[1]] +"', 'SIZE', null)";
                }

                var value;
                try{
                  //eval("value = field('" + instructionParts[match[1]] +"', 'SIZE', null)");
                  eval(code);
                }
                catch(e){
                  if (e instanceof SyntaxError){
                    return packCompileError(5, token, '') ;
                  }
                }

                if (value == -1){
                    return packCompileError(5, token, '') ;
                }

                console_log(value);
                console_log("Field." + match[1] + ".SIZE");

                definition = definition.replace("Field." + match[1] + ".SIZE", value);
              }

              console_log(definition);

              while(definition.match(/\'(.*?)\'/)){
                var re = /\'(.*?)\'/;
                console_log(re);
                var match2 = re.exec(instructionParts[match[1]]);
                console_log(match2);
                var asciiCode = match2[1].charCodeAt(0);
                console_log(asciiCode);
                definition = definition.replace(re, asciiCode)
              }

              console_log(definition);

              console_log(instruction);
              var re = new RegExp("'","g");
              instruction = instruction.replace(re, '"');
              console_log(instruction);

              var re = /{([^}]*)}/g;
              var code = re.exec(definition);

              if(code != null){
                while(code != null){
                  var instructions = code[1].split(";");
                  console_log(instructions);

                  for (var j = 0; j < instructions.length-1; j++){
                    var aux;
                    if(j == 0){
                      aux = "if(instruction_compiler('" + instructions[j] + "','" + instruction + "','" + label + "', false, 0, null, null, true) == -1){error = true}";
                    }
                    else{
                      aux = "if(instruction_compiler('" + instructions[j] + "','', '', false, 0, null, null, true) == -1){error = true}";
                    }
                    definition = definition.replace(instructions[j]+";", aux+";\n");
                  }
                  code = re.exec(definition);
                }
              }
              else{
                var instructions = definition.split(";");

                for (var j = 0; j < instructions.length-1; j++){
                  var aux;
                  if(j == 0){
                    aux = "if(instruction_compiler('" + instructions[j] + "','" + instruction + "','" + label + "', false, 0, null, null, true) == -1){error = true}";
                  }
                  else{
                    aux = "if(instruction_compiler('" + instructions[j] + "','', '', false, 0, null, null, true) == -1){error = true}";
                  }
                  definition = definition.replace(instructions[j]+";", aux+";\n");
                }
              }

              try{
                var error = false;
                console_log(definition);
                eval(definition);
                if (error == true){
                   return packCompileError(14, "Error pseudoinstruction", '') ;
                }

                console_log("Fin pseudo");
                return ret;
              }
              catch(e){
                if (e instanceof SyntaxError) {
                   return packCompileError(14, "Error pseudoinstruction", '') ;
                }
              }
            }

          }
        }

        if (!found){
            return packCompileError(5, token, '') ;
        }

        return ret ;
      }

      /*Get pseudoinstruction fields*/
      function field (field, action, type)
      {
        console_log(field);
        console_log(action);
        console_log(type);
        
        if(action == "SIZE"){
          console_log("SIZE");

          if(field.match(/^0x/)){
            var value = field.split("x");
            return value[1].length*4;
          }
          else if (field.match(/^(\d)+\.(\d)+/)){
            return float2bin(parseFloat(field)).length;
          }
          else {
            var numAux = parseInt(field, 10);
            return (numAux.toString(2)).length;
          }
        }

        re = /\((.*?)\)/;
        if (action.search(re) != -1){
          var match = re.exec(action);
          var bits = match[1].split(",");
          var startBit = parseInt(bits[0]);
          var endBit = parseInt(bits[1]);

          if(field.match(/^0x/) && (type == "int" || type == "float")){
            var binNum = (parseInt(field, 16).toString(2));
            binNum = binNum.padStart(32, '0');
            binNum = binNum.substring(31-startBit, 32-endBit);
            var hexNum = "0x" + bin2hex(binNum);
            return hexNum;
          }
          else if(field.match(/^0x/) && (type == "double")){
            var binNum = double2bin(hex2double(field));
            binNum = binNum.padStart(64, '0');
            binNum = binNum.substring(63-startBit, 64-endBit);
            var hexNum = "0x" + bin2hex(binNum);
            return hexNum;
          }
          else if(type == "int"){
            var binNum = (parseInt(field, 10) >>> 0).toString(2);
            binNum = binNum.padStart(32, '0');
            binNum = binNum.substring(31-startBit, 32-endBit);
            var hexNum = "0x" + bin2hex(binNum);
            return hexNum;
          }
          else if (type == "float"){
            var binNum = float2bin(parseFloat(field));
            console_log(binNum);
            binNum = binNum.padStart(32, '0');
            binNum = binNum.substring(31-startBit, 32-endBit);
            var hexNum = "0x" + bin2hex(binNum);
            return hexNum;
          }
          else if (type == "double"){
            var binNum = double2bin(parseFloat(field));
            console_log(binNum);
            binNum = binNum.padStart(64, '0');
            binNum = binNum.substring(63-startBit, 64-endBit);
            var hexNum = "0x" + bin2hex(binNum);
            return hexNum;
          }

        }

        return -1;
      }

      /*Convert double floating point number to binary*/
      function double2bin(number) {
        var i, result = "";
        var dv = new DataView(new ArrayBuffer(8));

        dv.setFloat64(0, number, false);

        for (i = 0; i < 8; i++) {
            var bits = dv.getUint8(i).toString(2);
            if (bits.length < 8) {
              bits = new Array(8 - bits.length).fill('0').join("") + bits;
            }
            result += bits;
        }

        return result;
      }

      /*Convert floating point number to binary*/
      function float2bin (number){
        var i, result = "";
        var dv = new DataView(new ArrayBuffer(4));

        dv.setFloat32(0, number, false);

        for (i = 0; i < 4; i++) {
            var bits = dv.getUint8(i).toString(2);
            if (bits.length < 8) {
              bits = new Array(8 - bits.length).fill('0').join("") + bits;
            }
            result += bits;
        }
        return result;
      }

      /*Convert binary number to hexadecimal number*/
      function bin2hex(s) {
        var i, k, part, accum, ret = '';
        for (i = s.length-1; i >= 3; i -= 4){

          part = s.substr(i+1-4, 4);
          accum = 0;
          for (k = 0; k < 4; k += 1){
            if (part[k] !== '0' && part[k] !== '1'){     
                return { valid: false };
            }
            accum = accum * 2 + parseInt(part[k], 10);
          }
          if (accum >= 10){
            ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
          } 
          else {
            ret = String(accum) + ret;
          }
        }

        if (i >= 0){
          accum = 0;
          for (k = 0; k <= i; k += 1){
            if (s[k] !== '0' && s[k] !== '1') {
                return { valid: false };
            }
            accum = accum * 2 + parseInt(s[k], 10);
          }
          ret = String(accum) + ret;
        }
        return ret;
      }

      /*Convert hexadecimal number to double floating point number*/
      function hex2double ( hexvalue ){
        var value = hexvalue.split('x');
        var value_bit = '';

        for (var i = 0; i < value[1].length; i++){
          var aux = value[1].charAt(i);
          aux = (parseInt(aux, 16)).toString(2).padStart(4, "0");
          value_bit = value_bit + aux;
        }

        var buffer = new ArrayBuffer(8);
        new Uint8Array( buffer ).set( value_bit.match(/.{8}/g).map(binaryStringToInt ));
        return new DataView( buffer ).getFloat64(0, false);
      }
   
/*
 *  Copyright 2018-2019 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
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


  /*
   * Console.log
   */

  function app_console_log(m){
    if(app._data.c_debug){
      console.log(m); 
    }
  }


  /*
   * Notifications
   */

  function show_notification ( msg, type ){
    // show notification
    app._data.alertMessage = msg ;
    app._data.type         = type ;
    app.$bvToast.toast(app._data.alertMessage, {
      variant: app._data.type,
      solid: true,
      toaster: "b-toaster-top-center",
      autoHideDelay: app._data.notificationTime,
    });

    // add notification to the notification summary
    var date = new Date();
    notifications.push({ mess: app._data.alertMessage, 
                         color: app._data.type, 
                         time: date.getHours()+":"+date.getMinutes()+":"+date.getSeconds(), 
                         date: date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear() }); 
    return true ;
  }


  /*
   * Loading...
   */

  var toHandler = null;

  function show_loading(){
    // if loading is programmed, skip
    if(toHandler != null){
      return;
    }

    // after half second show the loading spinner 
    toHandler = setTimeout(function(){
      $(".loading").show();
      toHandler = null;
    }, 500);
  }

  function hide_loading(){
    // if loading is programmed, cancel it
    if(toHandler != null){
      clearTimeout(toHandler);
      toHandler = null;
    }

    // disable loading spinner
    $(".loading").hide();
  }

/*
 *  Copyright 2018-2019 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
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



/****************
 * Vue instance *
 ****************/
try{

  window.app = new Vue({

    /*DOM ID*/
    el: "#app",


    /*Vue data*/
    data: {
      /*Global*/
      /*View*/
      creator_mode: "load_architecture",
      /*Notification speed*/
      notificationTime: 1500,
      /*Debug*/
      c_debug: false,



      /*Architecture editor*/

      /*Available architectures*/
      arch_available: architecture_available,
      /*Architectures card background*/
      back_card: back_card,
      /*Backup date*/
      date_copy: '',
      /*New architecture modal*/
      showLoadArch: false,
      /*New architecture form*/
      name_arch: '',
      description_arch: '',
      load_arch: '',
      /*Delete architecture modal*/
      modalDeletArch:{
        title: '',
        index: 0,
      },
      /*Architecture name*/
      architecture_name: '',
      /*Architecture bits*/
      number_bits: 32,
      /*Load architecture*/
      architecture: architecture,
      architecture_hash: architecture_hash,
      /*Saved file name*/
      name_arch_save: '',
      /*Advanced mode*/
      advanced_mode: true,
      /*Memory layout form*/
      memory_layout: ["", "", "", "", "", ""],
      /*Memory layout reset*/
      modalResetMem: {
        title: '',
        element: '',
      },
      /*Align memory*/
      align: false,
      /*Component table fields*/
      archFields: ['name', 'ID', 'nbits', 'default_value', 'properties', 'actions'],
      /*Components types*/
      componentsTypes: componentsTypes,
      /*Floating point registers*/
      simple_reg: [],
      /*Components reset*/
      modalResetArch: {
        title: '',
        element: '',
      },
      /*Modals components*/
      showNewComponent: false,
      showEditComponent: false,
      /*Edit component modal*/
      modalEditComponent: {
        title: '',
        element: '',
      },
      /*Delete component modal*/
      modalDeletComp:{
        title: '',
        element: '',
      },
      /*Modals elements*/
      showNewElement: false,
      showEditElement: false,
      /*New element modal*/
      modalNewElement:{
        title: '',
        element: '',
        type: '',
        double_precision: '',
        simple1: '',
        simple2: '',
      },
      /*Edit element modal*/
      modalEditElement:{
        title: '',
        element: '',
        type: '',
        double_precision: '',
        simple1: '',
        simple2: '',
      },
      /*Delete element modal*/
      modalDeletElement:{
        title: '',
        element: '',
      },
      /*Element form*/
      formArchitecture: {
        name: '',
        id: '',
        type: '',
        defValue: '',
        properties: [],
        precision: '',
      },
      /*Instructions table fields*/
      instFields: ['name', 'co', 'cop', 'nwords', 'signature', 'signatureRaw', 'fields', 'definition', 'actions'],
      /*Instructions types*/
      instructionsTypes: instructionsTypes,
      /*Instructions fields*/
      modalViewFields:{
        title: '',
        element: '',
        co: '',
        cop: '',
      },
      /*Instructions reset*/
      modalResetInst:{
        title: '',
        element: '',
      },
      /*Modals instructions*/
      showNewInstruction: false,
      showEditInstruction: false,
      /*Modal pagination*/
      instructionFormPage: 1,
      instructionFormPageLink: ['#Principal', '#Fields', '#Syntax', '#Definition'],
      /*Edit instruction modal*/
      modalEditInst:{
        title: '',
        element: '',
        co: '',
        cop: '',
      },
      /*Delete instruction modal*/
      modalDeletInst:{
        title: '',
        element: '',
        index: 0,
      },
      /*Instruction form*/
      formInstruction: {
        name: '',
        type: '',
        co: '',
        cop: '',
        nwords: 1,
        numfields: "1",
        numfieldsAux: "1",
        nameField: [],
        typeField: [],
        startBitField: [],
        stopBitField: [],
        valueField: [],
        assignedCop: false,
        signature: '',
        signatureRaw: '',
        signature_definition: '',
        definition: '',
      },
      /*Pseudoinstructions table fields*/
      pseudoinstFields: ['name', 'nwords', 'signature', 'signatureRaw', 'fields', 'definition', 'actions'],
      /*Pseudoinstructions reset*/
      modalResetPseudoinst:{
        title: '',
        element: '',
      },
      /*Modals pseudoinstructions*/
      showNewPseudoinstruction: false,
      showEditPseudoinstruction: false,
      /*Edit pseudoinstruction modal*/
      modalEditPseudoinst:{
        title: '',
        element: '',
        index: 0,
      },
      /*Delete pseudoinstruction modal*/
      modalDeletPseudoinst:{
        title: '',
        element: '',
        index: 0,
      },
      /*Pseudoinstruction form*/
      formPseudoinstruction: {
        name: '',
        nwords: 1,
        numfields: "0",
        numfieldsAux: "0",
        nameField: [],
        typeField: [],
        startBitField: [],
        stopBitField: [],
        signature: '',
        signatureRaw: '',
        signature_definition: '',
        definition: '',
      },
      /*Directives table fields*/
      directivesFields: ['name', 'action', 'size', 'actions'],
      /*Directives types*/
      actionTypes: actionTypes,
      /*Directives reset*/
      modalResetDir: {
        title: '',
        element: '',
      },
      /*Modals directives*/
      showNewDirective: false,
      showEditDirective: false,
      /*Edit directive modal*/
      modalEditDirective:{
        title: '',
        element: '',
      },
      /*Delete pseudoinstruction modal*/
      modalDeletDir:{
        title: '',
        element: '',
      },
      /*Directive form*/
      formDirective:{
        name: '',
        action: '',
        size: 0,
      },
      


      /*Compilator*/
      
      /*Available examples*/
      example_available: example_available,
      
      load_assembly: '',
      /*Saved file name*/
      save_assembly: '',
      /*Code error modal*/
      modalAssemblyError:{
        code1: '',
        code2: '',
        code3: '',
        error: '',
      },
      /*Binary code loaded*/
      name_binary_load: '',
      /*Load binary*/
      load_binary: false,
      update_binary: update_binary,
      /*Saved file name*/
      name_binary_save: '',
      /*Assembly code*/
      assembly_code: "",
      

      
      /*Simulator*/

      /*Alert toasts content*/
      alertMessage: '',
      type: '',
      /*Displayed notifications*/
      notifications: notifications,
      /*Accesskey*/
      navigator: "",
      /*Calculator*/
      calculator: {
        bits: 32,
        hexadecimal: "",
        sign: "",
        exponent: "",
        mantissa: "",
        mantisaDec: 0,
        exponentDec: "",
        decimal: "",
        variant32: "primary",
        variant64: "outline-primary",
        lengthHexadecimal: 8,
        lengthSign: 1,
        lengthExponent: 8,
        lengthMantissa: 23,
      },
      /*Run instructions*/
      instructionsPacked: 20,
      /*Run button*/
      runExecution: false,
      /*Reset button*/
      resetBut: false,
      /*Instrutions table fields*/
      archInstructions: ['Break', 'Address', 'Label', 'User Instructions', 'Loaded Instructions'],
      /*Instructions memory*/
      instructions: instructions,
      /*Register type displayed*/
      register_type: 'integer',
      /*Register select*/
      nameTabReg: 'Decimal',
      nameReg: 'INT Registers',
      register_popover: '',
      /*Data mode*/
      data_mode: 'registers',
      /*Register form*/
      newValue: '',
      /*Memory table fields*/
      memFields: ['Address', 'Binary', 'Value'],
      /*Memory*/
      memory: memory,
      unallocated_memory: unallocated_memory,
      /*Stats table fields*/
      statsFields: {
        type: {
          label: 'Type',
          sortable: true
        },
        number_instructions: {
          label: 'Number of instructions',
          sortable: true
        },
        percentage: {
          label: 'Percentage',
          sortable: true
        },
        abbreviation: {
          label: 'Abbreviation',
          sortable: false
        },
      },
      /*Stats*/
      stats: stats,
      /*Display*/
      display: '',
      /*Keyboard*/
      keyboard: '', 
      enter: null,
    },


    /*Created vue instance*/
    created(){
      this.load_arch_available();
      this.load_examples_available();
      this.detectNavigator();
    },


    /*Mounted vue instance*/
    mounted(){
      this.backupCopyModal();
      this.verifyNavigator();
    },


    /*Vue methods*/
    methods:{
      /*Generic*/
      verifyNavigator(){
        if (navigator.userAgent.indexOf("OPR") > -1) {
          this.$refs.navigator.show();
        } 
        else if (navigator.userAgent.indexOf("MIE") > -1) {
          this.$refs.navigator.show();
        }
        else if (navigator.userAgent.indexOf("Edge") > -1) {
          this.$refs.navigator.show();
        } 
        else if(navigator.userAgent.indexOf("Chrome") > -1) {
          return;
        } 
        else if (navigator.userAgent.indexOf("Safari") > -1) {
          return;
        } 
        else if (navigator.userAgent.indexOf("Firefox") > -1) {
          return
        } 
        else{
          this.$refs.navigator.show();
        }
      },
      change_UI_mode(e){
	// slow transition <any> => "architecture"
	if (e == "architecture") 
	{
	    $(".loading").show();
            setTimeout(function(){
		          app._data.creator_mode = e;
			  app.$forceUpdate();
	                  $(".loading").hide();
		       }, 50) ;
	    return ;
	}

	// fast transition <any> => <any> - "architecture"
	app._data.creator_mode = e;

	if(e == "assembly"){
	  setTimeout(function(){
	    codemirrorStart();
	    if(app._data.update_binary != ""){
	      $("#divAssembly").attr("class", "col-lg-10 col-sm-12");
	      $("#divTags").attr("class", "col-lg-2 col-sm-12");
	      $("#divTags").show();
	    }
	  },50);
	}
	else{
	  if(textarea_assembly_editor != null){
	    app._data.assembly_code = textarea_assembly_editor.getValue();
	    textarea_assembly_editor.toTextArea();
	  }
	}

	app.$forceUpdate();
      },


      /*Architecture editor*/

      /*Load the available architectures and check if exists backup*/
      load_arch_available(){
        $.getJSON('architecture/available_arch.json', function(cfg){
          architecture_available = cfg;
          
          if (typeof(Storage) !== "undefined"){
            if(localStorage.getItem("load_architectures_available") != null){
              var auxArch = localStorage.getItem("load_architectures_available");
              var aux = JSON.parse(auxArch);

              for (var i = 0; i < aux.length; i++){
                architecture_available.push(aux[i]);
                load_architectures_available.push(aux[i]);

                var auxArch2 = localStorage.getItem("load_architectures");
                var aux2 = JSON.parse(auxArch2);
                load_architectures.push(aux2[i]);
              }
            }
          }

          app._data.arch_available = architecture_available;

          for (var i = 0; i < architecture_available.length; i++){
            back_card.push({name: architecture_available[i].name , background: "default"});
          }
        });
      },
      /*Change the background of selected achitecture card*/
      change_background(name, type){
        if(type == 1){
          for (var i = 0; i < back_card.length; i++){
            if(name == back_card[i].name){
              back_card[i].background = "secondary";
            }
            else{
              back_card[i].background = "default";
            }
          }
        }
        if(type == 0){
          for (var i = 0; i < back_card.length; i++){
            back_card[i].background = "default";
          }
        }
      },
      /*Show backup modal*/
      backupCopyModal(){
        if (typeof(Storage) !== "undefined"){
          if(localStorage.getItem("architecture_copy") != null && localStorage.getItem("assembly_copy") != null && localStorage.getItem("date_copy") != null){
            this.date_copy = localStorage.getItem("date_copy");
            this.$refs.copyRef.show();
          }
        }
      },
      /*Load backup*/
      load_copy(){
        this.architecture_name = localStorage.getItem("arch_name");
        
        var auxArchitecture = JSON.parse(localStorage.getItem("architecture_copy"));
        architecture = bigInt_deserialize(auxArchitecture);

        app._data.architecture = architecture;
        app._data.assembly_code = localStorage.getItem("assembly_copy");
                  code_assembly = app._data.assembly_code ;
        //textarea_assembly_editor.setValue(localStorage.getItem("assembly_copy"));

        architecture_hash = [];
        for (var i = 0; i < architecture.components.length; i++){
          architecture_hash.push({name: architecture.components[i].name, index: i}); 
          app._data.architecture_hash = architecture_hash;
        }

        backup_stack_address = architecture.memory_layout[4].value;
        backup_data_address = architecture.memory_layout[3].value;

        this.reset();

        //$("#architecture_menu").hide();
        app.change_UI_mode('simulator');
        app.change_data_view('registers' , 'integer');
        app.$forceUpdate();
        /*$("#save_btn_arch").show();
        $("#advanced_mode").show();
        $("#assembly_btn_arch").show();
        $("#load_arch_btn_arch").hide();
        $("#sim_btn_arch").show();
        $("#load_arch").hide();
        $("#load_menu_arch").hide();
        $("#view_components").show();*/

        this.$refs.copyRef.hide();

        show_notification('The backup has been loaded correctly', 'success') ;
      },
      /*Delete backup*/
      remove_copy(){
        localStorage.removeItem("architecture_copy");
        localStorage.removeItem("assembly_copy");
        localStorage.removeItem("date_copy");
        this.$refs.copyRef.hide();
      },
      /*Load the selected architecture*/
      load_arch_select(e){
        show_loading();

        for (var i = 0; i < load_architectures.length; i++){
          if(e == load_architectures[i].id){
            var auxArchitecture = JSON.parse(load_architectures[i].architecture);
            architecture = bigInt_deserialize(auxArchitecture);

            app._data.architecture = architecture;

            architecture_hash = [];
            for (var i = 0; i < architecture.components.length; i++){
              architecture_hash.push({name: architecture.components[i].name, index: i}); 
              app._data.architecture_hash = architecture_hash;
            }

            backup_stack_address = architecture.memory_layout[4].value;
            backup_data_address = architecture.memory_layout[3].value;

            app._data.architecture_name = e;

            //$("#architecture_menu").hide();
            app.change_UI_mode('simulator');
            app.change_data_view('registers' , 'integer');
            app.$forceUpdate();
            hide_loading();

            show_notification('The selected architecture has been loaded correctly', 'success') ;
            return;
          }
        }

        $.getJSON('architecture/'+e+'.json', function(cfg){
          var auxArchitecture = cfg;
          architecture = bigInt_deserialize(auxArchitecture);
          app._data.architecture = architecture;

          architecture_hash = [];
          for (var i = 0; i < architecture.components.length; i++){
            architecture_hash.push({name: architecture.components[i].name, index: i}); 
            app._data.architecture_hash = architecture_hash;
          }

          backup_stack_address = architecture.memory_layout[4].value;
          backup_data_address = architecture.memory_layout[3].value;

          app._data.architecture_name = e;

          //$("#architecture_menu").hide();
          app.change_UI_mode('simulator');
          app.change_data_view('registers' , 'integer');
          app.$forceUpdate();
          hide_loading();

          show_notification('The selected architecture has been loaded correctly', 'success') ;
        })

        .fail(function() {
          hide_loading();
          show_notification('The selected architecture is not currently available', 'info') ;
        });
      },
      /*Read the JSON of new architecture*/
      read_arch(e){
        show_loading();

        e.preventDefault();
        if(!this.name_arch || !this.load_arch){
          hide_loading();
          show_notification('Please complete all fields', 'danger') ;
          return;
        }

        this.showLoadArch = false;

        var file;
        var reader;
        var files = document.getElementById('arch_file').files;

        for (var i = 0; i < files.length; i++){
          file = files[i];
          reader = new FileReader();
          reader.onloadend = onFileLoaded;
          reader.readAsBinaryString(file);
        }

        function onFileLoaded(event){
          architecture_available.push({name: app._data.name_arch, img: "./images/personalized_logo.png", alt: app._data.name_arch + " logo" , id:"select_conf"+app._data.name_arch , description: app._data.description_arch});
          load_architectures_available.push({name: app._data.name_arch, img: "./images/personalized_logo.png", alt: app._data.name_arch + " logo" , id:"select_conf"+app._data.name_arch , description: app._data.description_arch});
          back_card.push({name: architecture_available[architecture_available.length-1].name , background: "default"});
          load_architectures.push({id: app._data.name_arch, architecture: event.currentTarget.result});

          if (typeof(Storage) !== "undefined"){
            var auxArch = JSON.stringify(load_architectures, null, 2);
            localStorage.setItem("load_architectures", auxArch);

            auxArch = JSON.stringify(load_architectures_available, null, 2);
            localStorage.setItem("load_architectures_available", auxArch);
          }

          show_notification('The selected architecture has been loaded correctly', 'success') ;
          
          app._data.name_arch = '';
          app._data.description_arch = '';
          app._data.load_arch = '';

          hide_loading();
        }
      },
      /*Create a new architecture*/
      new_arch(){
        //$("#architecture_menu").hide();
        app.change_UI_mode('simulator');
        app.change_data_view('registers' , 'integer');
        app.$forceUpdate();
        hide_loading();
      },
      /*Check if it is a new architecture*/
      default_arch(item){
        for (var i = 0; i < load_architectures_available.length; i++) {
          if(load_architectures_available[i].name == item){
            return true;
          }
        }
        return false;
      },
      /*Show remove architecture modal*/
      modal_remove_cache_arch(index, elem, button){
        this.modalDeletArch.title = "Delete Architecture";
        this.modalDeletArch.index = index;
        this.$root.$emit('bv::show::modal', 'modalDeletArch', button);
      },
      /*Remove architecture*/
      remove_cache_arch(index){
        var id = architecture_available[index].name;

        for (var i = 0; i < load_architectures.length; i++){
          if(load_architectures[i].id == id){
            load_architectures.splice(i, 1);
          }
        }

        for (var i = 0; i < load_architectures_available.length; i++){
          if(load_architectures_available[i].name == id){
            load_architectures_available.splice(i, 1);
          }
        }

        architecture_available.splice(index, 1);

        var auxArch = JSON.stringify(load_architectures, null, 2);
        localStorage.setItem("load_architectures", auxArch);

        auxArch = JSON.stringify(load_architectures_available, null, 2);
        localStorage.setItem("load_architectures_available", auxArch);

        show_notification('Architecture deleted successfully', 'success') ;
      },
      /*Save the current architecture in a JSON file*/
      arch_save(){
        var auxObject = jQuery.extend(true, {}, architecture);
        var auxArchitecture = bigInt_serialize(auxObject);

        var textToWrite = JSON.stringify(auxArchitecture, null, 2);
        var textFileAsBlob = new Blob([textToWrite], { type: 'text/json' });
        var fileNameToSaveAs;

        if(this.name_arch_save == ''){
          fileNameToSaveAs = "architecture.json";
        }
        else{
          fileNameToSaveAs = this.name_arch_save + ".json";
        }

        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = "My Hidden Link";

        window.URL = window.URL || window.webkitURL;

        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);

        downloadLink.click();

        show_notification('Save architecture', 'success') ;
      },
      /*Change the execution mode of architecture editor*/
      change_mode(){
        if(app._data.advanced_mode == false){
          app._data.advanced_mode = true;
        }
        else{
          app._data.advanced_mode = false;
        }
      },
      /*Show reset modal of memory layout*/
      resetMemModal(elem, button){
        this.modalResetMem.title = "Reset memory layout";
        this.modalResetMem.element = elem;
        this.$root.$emit('bv::show::modal', 'modalResetMem', button);
      },
      /*Reset memory layout*/
      resetMemory(arch){
        show_loading();

        for (var i = 0; i < load_architectures.length; i++){
          if(arch == load_architectures[i].id){
            var auxArch = JSON.parse(load_architectures[i].architecture);
            var auxArchitecture = bigInt_deserialize(auxArch);

            architecture.memory_layout = auxArchitecture.memory_layout;
            app._data.architecture = architecture;

            hide_loading();
            show_notification('The memory layout has been reset correctly', 'success') ;
            
            return;
          }
        }

        $.getJSON('architecture/'+arch+'.json', function(cfg){
          var auxArchitecture = cfg;

          var auxArchitecture2 = bigInt_deserialize(auxArchitecture);
          architecture.memory_layout = auxArchitecture2.memory_layout;
          app._data.architecture = architecture;

          hide_loading();
          show_notification('The memory layout has been reset correctly', 'success') ;
        });
      },
      /*Check de memory layout changes*/
      changeMemoryLayout(){
        var auxMemoryLayout = jQuery.extend(true, {}, architecture.memory_layout);

        for(var i = 0; i < this.memory_layout.length; i++){
          if(this.memory_layout[i] != "" && this.memory_layout[i] != null){
            if(!isNaN(parseInt(this.memory_layout[i]))){
              auxMemoryLayout[i].value = parseInt(this.memory_layout[i]);
              if (auxMemoryLayout[i].value < 0) {
                  show_notification('The value can not be negative', 'danger') ;
                  return;
              }
            }
            else {
                  show_notification('The value must be a number', 'danger') ;
                  return;
            }
          }
        }

        for(var i = 0; i < 6; i++){
          /*if (i%2 == 0 && auxMemoryLayout[i].value % 4 != 0){
                show_notification('The memory must be aligned', 'danger') ;
                return;
            }*/

          for (var j = i; j < 6; j++) {
            if (auxMemoryLayout[i].value > auxMemoryLayout[j].value) {
                show_notification('The segment can not be overlap', 'danger') ;
                return;
            }
          }
        }

        for(var i = 0; i < 6; i++){
          architecture.memory_layout[i].value = auxMemoryLayout[i].value;
        }

        app._data.architecture = architecture;

        backup_stack_address = architecture.memory_layout[4].value;
        backup_data_address = architecture.memory_layout[3].value;

        for(var i = 0; i < 6; i++){
          app._data.memory_layout[i] = "";
        }
        app.$forceUpdate();
      },
      /*Register ID assigment*/
      element_id(name, type, double){
        var id = 0;
        for(var i = 0; i < architecture.components.length; i++){
          for(var j = 0; j < architecture.components[i].elements.length; j++){
            if(architecture.components[i].elements[j].name == name){
              return id;
            }
            if(architecture.components[i].type == type && architecture.components[i].double_precision == double){
              id++;
            }
          }
        }
      },
      /*Show reset modal of components*/
      resetArchModal(elem, button){
        this.modalResetArch.title = "Reset " + elem + " registers";
        this.modalResetArch.element = elem;
        this.$root.$emit('bv::show::modal', 'modalResetArch', button);
      },
      /*Reset components*/
      resetArchitecture(arch){
        show_loading();

        for (var i = 0; i < load_architectures.length; i++){
          if(arch == load_architectures[i].id){
            var auxArch = JSON.parse(load_architectures[i].architecture);
            var auxArchitecture = bigInt_deserialize(auxArch);

            architecture.components = auxArchitecture.components;
            app._data.architecture = architecture;

            architecture_hash = [];
            for (var i = 0; i < architecture.components.length; i++) {
              architecture_hash.push({name: architecture.components[i].name, index: i}); 
              app._data.architecture_hash = architecture_hash;
            }

            hide_loading();
            show_notification('The registers has been reset correctly', 'success') ;
            
            return;
          }
        }

        $.getJSON('architecture/'+arch+'.json', function(cfg){
          var auxArchitecture = cfg;

          var auxArchitecture2 = bigInt_deserialize(auxArchitecture);
          architecture.components = auxArchitecture2.components;

          app._data.architecture = architecture;

          architecture_hash = [];
          for (var i = 0; i < architecture.components.length; i++){
            architecture_hash.push({name: architecture.components[i].name, index: i}); 
            app._data.architecture_hash = architecture_hash;
          }

          hide_loading();
          show_notification('The registers has been reset correctly', 'success') ;
        });
      },

      /*Verify all field of new component*/
      newComponentVerify(evt){
        evt.preventDefault();
        if (!this.formArchitecture.name || !this.formArchitecture.type) {
            show_notification('Please complete all fields', 'danger') ;
        } 
        else{
          this.newComponent();
        }
      },
      /*Create a new component*/
      newComponent(){
        for (var i = 0; i < architecture_hash.length; i++) {
          if (this.formArchitecture.name == architecture_hash[i].name) {
              show_notification('The component already exists', 'danger') ;
              return;
          }
        }

        this.showNewComponent = false;

        var precision = false;
        if (this.formArchitecture.precision == "precision"){
            precision = true;
        }

        var newComp = {name: this.formArchitecture.name, type: this.formArchitecture.type, double_precision: precision ,elements:[]};
        architecture.components.push(newComp);
        var newComponentHash = {name: this.formArchitecture.name, index: architecture_hash.length};
        architecture_hash.push(newComponentHash);
      },
      /*Show edit component modal*/
      editCompModal(comp, index, button){
        this.modalEditComponent.title = "Edit Component";
        this.modalEditComponent.element = comp;
        this.formArchitecture.name = comp;
        this.$root.$emit('bv::show::modal', 'modalEditComponent', button);
      },
      /*Verify all field of modified component*/
      editCompVerify(evt, comp){
        evt.preventDefault();
        if (!this.formArchitecture.name) {
            show_notification('Please complete all fields', 'danger') ;
        } 
        else {
            this.editComponent(comp);
        }
      },
      /*Edit the component*/
      editComponent(comp){
        for (var i = 0; i < architecture_hash.length; i++){
          if ((this.formArchitecture.name == architecture_hash[i].name) && (comp != this.formArchitecture.name)){
              show_notification('The component already exists', 'danger') ;
              return;
          }
        }

        this.showEditComponent = false;

        for (var i = 0; i < architecture_hash.length; i++){
          if(comp == architecture_hash[i].name){
            architecture_hash[i].name = this.formArchitecture.name;
            architecture.components[i].name = this.formArchitecture.name;
          }
        }
        this.formArchitecture.name ='';
      },
      /*Show delete component modal*/
      delCompModal(elem, button){
        this.modalDeletComp.title = "Delete Component";
        this.modalDeletComp.element = elem;
        this.$root.$emit('bv::show::modal', 'modalDeletComp', button);
      },
      /*Delete the component*/
      delComponent(comp){
        for (var i = 0; i < architecture_hash.length; i++){
          if(comp == architecture_hash[i].name){
            architecture.components.splice(i,1);
            architecture_hash.splice(i,1);
            for (var j = 0; j < architecture_hash.length; j++){
              architecture_hash[j].index = j;
            }
          }
        }
      },
      /*Show new element modal*/
      newElemModal(comp, index, button){
        this.modalNewElement.title = "New element";
        this.modalNewElement.element = comp;
        this.modalNewElement.type = architecture.components[index].type;
        this.modalNewElement.double_precision = architecture.components[index].double_precision;

        this.$root.$emit('bv::show::modal', 'modalNewElement', button);

        app._data.simple_reg = [];
        for (var i = 0; i < architecture_hash.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length && architecture.components[i].type =="floating point" && architecture.components[i].double_precision == false; j++){
            app._data.simple_reg.push({ text: architecture.components[i].elements[j].name, value: architecture.components[i].elements[j].name},);
          }
        }

        var id = 0;
        for(var i = 0; i < architecture.components.length; i++){
          for(var j = 0; j < architecture.components[i].elements.length; j++){
            if(architecture.components[i].name == comp && architecture.components[i].elements.length-1 == j){
              id++;
              this.formArchitecture.id = id;
            }
            if(architecture.components[i].type == architecture.components[index].type && architecture.components[i].double_precision == architecture.components[index].double_precision){
              id++;
            }
          }
        }
      },
      /*Verify all field of new element*/
      newElementVerify(evt, comp){
        evt.preventDefault();
        if (!this.formArchitecture.name){
             show_notification('Please complete all fields', 'danger') ;
        } 
        else{
          if (!this.formArchitecture.defValue && this.formArchitecture.double_precision == false){
             show_notification('Please complete all fields', 'danger') ;
          }
          else if(isNaN(this.formArchitecture.defValue)){
             show_notification('The default value must be a number', 'danger') ;
          }
          else{
            this.newElement(comp);
          }
        }
      },

      /*Create a new element*/
      newElement(comp){
        for (var i = 0; i < architecture_hash.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if (this.formArchitecture.name == architecture.components[i].elements[j].name){
                show_notification('The element already exists', 'danger') ;
                return;
            }
          } 
        }

        this.showNewElement = false;

        for (var i = 0; i < architecture_hash.length; i++){
          if((comp == architecture_hash[i].name)&&(architecture.components[i].type == "integer")){
            var newElement = {name:this.formArchitecture.name, nbits: this.number_bits, value: bigInt(parseInt(this.formArchitecture.defValue) >>> 0, 10).value, default_value:bigInt(parseInt(this.formArchitecture.defValue) >>> 0, 10).value, properties: this.formArchitecture.properties};
            architecture.components[i].elements.push(newElement);
            break;
          }
          if((comp == architecture_hash[i].name)&&(architecture.components[i].type == "control")){
            var newElement = {name:this.formArchitecture.name, nbits: this.number_bits, value: bigInt(parseInt(this.formArchitecture.defValue) >>> 0, 10).value, default_value:bigInt(parseInt(this.formArchitecture.defValue) >>> 0, 10).value, properties: ["read", "write"]};
            architecture.components[i].elements.push(newElement);
            break;
          }
          if((comp == architecture_hash[i].name)&&(architecture.components[i].type == "floating point")&&(architecture.components[i].double_precision == false)){
            var newElement = {name:this.formArchitecture.name, nbits: this.number_bits, value: parseFloat(this.formArchitecture.defValue), default_value:parseFloat(this.formArchitecture.defValue), properties: this.formArchitecture.properties};
            architecture.components[i].elements.push(newElement);
            break;
          }
          if((comp == architecture_hash[i].name)&&(architecture.components[i].type == "floating point")&&(architecture.components[i].double_precision == true)){
            var aux_new;
            var aux_value;
            var aux_sim1;
            var aux_sim2;

            for (var a = 0; a < architecture_hash.length; a++){
              for (var b = 0; b < architecture.components[a].elements.length; b++) {
                if(architecture.components[a].elements[b].name == this.formArchitecture.simple1){
                  aux_sim1 = bin2hex(float2bin(architecture.components[a].elements[b].default_value));
                }
                if(architecture.components[a].elements[b].name == this.formArchitecture.simple2){
                  aux_sim2 = bin2hex(float2bin(architecture.components[a].elements[b].default_value));
                }
              }
            }

            aux_value = aux_sim1 + aux_sim2;
            aux_new = hex2double("0x" + aux_value);

            var newElement = {name:this.formArchitecture.name, nbits: this.number_bits*2, value: aux_new, properties: this.formArchitecture.properties};
            architecture.components[i].elements.push(newElement);
            break;
          }
        }
      },
      /*Show edit element modal*/
      editElemModal(elem, comp, button){
        this.modalEditElement.title = "Edit Element";
        this.modalEditElement.element = elem;
        this.modalEditElement.type = architecture.components[comp].type;
        this.modalEditElement.double_precision = architecture.components[comp].double_precision;

        app._data.simple_reg = [];
        for (var i = 0; i < architecture_hash.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length && architecture.components[i].type =="floating point" && architecture.components[i].double_precision == false; j++){
            app._data.simple_reg.push({ text: architecture.components[i].elements[j].name, value: architecture.components[i].elements[j].name},);
          }
        }

        for(var j=0; j < architecture.components[comp].elements.length; j++){
          if(elem == architecture.components[comp].elements[j].name){
            this.formArchitecture.name = elem;
            this.formArchitecture.properties = architecture.components[comp].elements[j].properties;
            if(this.modalEditElement.double_precision == true){
              this.formArchitecture.simple1 = architecture.components[comp].elements[j].simple_reg[0];
              this.formArchitecture.simple2 = architecture.components[comp].elements[j].simple_reg[1];
            }
            else{
              this.formArchitecture.defValue = (architecture.components[comp].elements[j].default_value).toString();
            }
          }
        }

        var id = 0;
        for(var i = 0; i < architecture.components.length; i++){
          for(var j = 0; j < architecture.components[i].elements.length; j++){
            if(architecture.components[i].elements[j].name == this.formArchitecture.name){
              this.formArchitecture.id = id;
            }
            if(architecture.components[i].type == architecture.components[comp].type && architecture.components[i].double_precision == architecture.components[comp].double_precision){
              id++;
            }
          }
        }

        this.$root.$emit('bv::show::modal', 'modalEditElement', button);
      },
      /*Check all field of modified element*/
      editElementVerify(evt, comp){
        evt.preventDefault();
        if (!this.formArchitecture.name || !this.formArchitecture.defValue) {
            show_notification('Please complete all fields', 'danger') ;
        } 
        else if(isNaN(this.formArchitecture.defValue)){
          show_notification('The default value must be a number', 'danger') ;
        }
        else {
          this.editElement(comp);
        }
      },
      /*Modify element*/
      editElement(comp){
        for (var i = 0; i < architecture_hash.length; i++){
          for (var j = 0; j < architecture.components[i].elements.length; j++){
            if ((this.formArchitecture.name == architecture.components[i].elements[j].name) && (comp != this.formArchitecture.name)){
                show_notification('The element already exists', 'danger') ;
                return;
            }
          } 
        }

        this.showEditElement = false;

        for (var i = 0; i < architecture_hash.length; i++){
          for(var j=0; j < architecture.components[i].elements.length; j++){
            if(comp == architecture.components[i].elements[j].name){
              architecture.components[i].elements[j].name = this.formArchitecture.name;
              if(architecture.components[i].type == "control" || architecture.components[i].type == "integer"){
                architecture.components[i].elements[j].default_value = bigInt(parseInt(this.formArchitecture.defValue) >>> 0, 10).value;
              }
              else{
                if(architecture.components[i].double_precision == false){
                  architecture.components[i].elements[j].default_value = parseFloat(this.formArchitecture.defValue, 10);
                }
                else{
                  
                  var aux_value;
                  var aux_sim1;
                  var aux_sim2;

                  for (var a = 0; a < architecture_hash.length; a++) {
                    for (var b = 0; b < architecture.components[a].elements.length; b++) {
                      if(architecture.components[a].elements[b].name == this.formArchitecture.simple1){
                        aux_sim1 = bin2hex(float2bin(architecture.components[a].elements[b].value));
                      }
                      if(architecture.components[a].elements[b].name == this.formArchitecture.simple2){
                        aux_sim2 = bin2hex(float2bin(architecture.components[a].elements[b].value));
                      }
                    }
                  }

                  aux_value = aux_sim1 + aux_sim2;

                  architecture.components[i].elements[j].value = hex2double("0x" + aux_value);

                  architecture.components[i].elements[j].simple_reg[0] = this.formArchitecture.simple1;
                  architecture.components[i].elements[j].simple_reg[1] = this.formArchitecture.simple2;
                }
              }
              architecture.components[i].elements[j].properties = this.formArchitecture.properties;
            }
          }
        } 
      },
      /*Show delete element modal*/
      delElemModal(elem, button){
        this.modalDeletElement.title = "Delete Element";
        this.modalDeletElement.element = elem;
        this.$root.$emit('bv::show::modal', 'modalDeletElement', button);
      },
      /*Delete the element*/
      delElement(comp){
        for (var i = 0; i < architecture_hash.length; i++){
          for(var j=0; j < architecture.components[i].elements.length; j++){
            if(comp == architecture.components[i].elements[j].name){
              architecture.components[i].elements.splice(j,1);
            }
          }
        }
      },
      /*Empty form*/
      emptyFormArch(){
        this.formArchitecture.name = '';
        this.formArchitecture.id = '';
        this.formArchitecture.type = '';
        this.formArchitecture.defValue = '';
        this.formArchitecture.properties = [];
        this.formArchitecture.precision = '';
      },
      /*Show reset instructions modal*/
      resetInstModal(elem, button){
        this.modalResetInst.title = "Reset " + elem + " instructions";
        this.modalResetInst.element = elem;
        this.$root.$emit('bv::show::modal', 'modalResetInst', button);
      },
      /*Reset instructions*/
      resetInstructions(arch){
        show_loading();

        for (var i = 0; i < load_architectures.length; i++){
          if(arch == load_architectures[i].id){
            var auxArch = JSON.parse(load_architectures[i].architecture);
            var auxArchitecture = bigInt_deserialize(auxArch);

            architecture.instructions = auxArchitecture.instructions;
            app._data.architecture = architecture;

            hide_loading();
            show_notification('The instruction set has been reset correctly', 'success') ;
            
            return;
          }
        }

        $.getJSON('architecture/'+arch+'.json', function(cfg){
          var auxArchitecture = cfg;

          var auxArchitecture2 = bigInt_deserialize(auxArchitecture);
          architecture.instructions = auxArchitecture2.instructions;

          app._data.architecture = architecture;

          hide_loading();
          show_notification('The instruction set has been reset correctly', 'success') ;
        });
      },
      /*Verify new number of fields*/
      changeNumfield(type){
        if(type == 0){
          if(this.formInstruction.numfields > (this.formInstruction.nwords * 32)){
            this.formInstruction.numfieldsAux = (this.formInstruction.nwords * 32);
            this.formInstruction.numfields = (this.formInstruction.nwords * 32);
          }
          else if(this.formInstruction.numfields < 1){
            this.formInstruction.numfieldsAux = 1;
            this.formInstruction.numfields = 1;
          }
          else{
            this.formInstruction.numfieldsAux = this.formInstruction.numfields;
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
      /*Show instruction fields modal*/
      viewFielsInst(elem, co, cop, button){
        this.modalViewFields.title = "Fields of " + elem;
        this.modalViewFields.element = elem;
        for (var i = 0; i < architecture.instructions.length; i++){
          if(elem == architecture.instructions[i].name && co == architecture.instructions[i].co && cop == architecture.instructions[i].cop){
            this.formInstruction.name = architecture.instructions[i].name;
            this.formInstruction.cop = architecture.instructions[i].cop;
            this.formInstruction.co = architecture.instructions[i].co;
            app._data.modalViewFields.co = architecture.instructions[i].co;
            app._data.modalViewFields.cop = architecture.instructions[i].cop;
            this.formInstruction.numfields = architecture.instructions[i].fields.length;
            this.formInstruction.numfieldsAux = architecture.instructions[i].fields.length;

            for (var j = 0; j < architecture.instructions[i].fields.length; j++) {
              this.formInstruction.nameField [j]= architecture.instructions[i].fields[j].name;
              this.formInstruction.typeField[j] = architecture.instructions[i].fields[j].type;
              this.formInstruction.startBitField[j] = architecture.instructions[i].fields[j].startbit;
              this.formInstruction.stopBitField[j] = architecture.instructions[i].fields[j].stopbit;
              this.formInstruction.valueField[j] = architecture.instructions[i].fields[j].valueField;
            }
          }
        }
        this.$root.$emit('bv::show::modal', 'modalViewFields', button);
      },
      /*Verify all fields of new instructions*/
      newInstVerify(evt){
        evt.preventDefault();

        for (var i = 0; i < this.formInstruction.nameField.length; i++){
          for (var j = i + 1; j < this.formInstruction.nameField.length; j++){
            if (this.formInstruction.nameField[i] == this.formInstruction.nameField[j]){
                show_notification('Field name repeated', 'danger') ;
                return;
            }
          }
        }

        var empty = 0;
        var auxCop = "";

        for (var z = 1; z < this.formInstruction.numfields; z++){
          if(this.formInstruction.typeField[z] == 'cop'){
            if(!this.formInstruction.valueField[z]){
              empty = 1;
            }
            else{
              if((this.formInstruction.valueField[z]).length != (this.formInstruction.startBitField[z] - this.formInstruction.stopBitField[z] + 1)){
                show_notification('The length of cop should be ' + (this.formInstruction.startBitField[z] - this.formInstruction.stopBitField[z] + 1) + ' binary numbers', 'danger') ;
                return;
              }

              for (var i = 0; i < this.formInstruction.valueField[z].length; i++){
                if (this.formInstruction.valueField[z].charAt(i) != "0" && this.formInstruction.valueField[z].charAt(i) != "1"){
                    show_notification('The value of cop must be binary', 'danger') ;
                    return;
                }
              }
              auxCop = auxCop + this.formInstruction.valueField[z];
            }
          }
        }

        this.formInstruction.cop = auxCop;

        for (var i = 0; i < this.formInstruction.co.length; i++){
          if (this.formInstruction.co.charAt(i) != "0" && this.formInstruction.co.charAt(i) != "1"){
              show_notification('The value of co must be binary', 'danger') ;
              return;
          }
        }

        for (var i = 0; i < this.formInstruction.numfields; i++){
          if(this.formInstruction.nameField.length <  this.formInstruction.numfields || this.formInstruction.typeField.length <  this.formInstruction.numfields || this.formInstruction.startBitField.length <  this.formInstruction.numfields || this.formInstruction.stopBitField.length <  this.formInstruction.numfields){
            empty = 1;
          }
        }

        if (!this.formInstruction.name || !this.formInstruction.type || !this.formInstruction.co || !this.formInstruction.nwords || !this.formInstruction.numfields || !this.formInstruction.signature_definition || !this.formInstruction.definition || empty == 1) {
            show_notification('Please complete all fields', 'danger') ;
        } 
        else if (isNaN(this.formInstruction.co)){
                 show_notification('The field co must be numbers', 'danger') ;
        }
        else if(isNaN(this.formInstruction.cop)){
                 show_notification('The field cop must be numbers', 'danger') ;
        }
        else if((this.formInstruction.co).length != (this.formInstruction.startBitField[0] - this.formInstruction.stopBitField[0] + 1)){
                 show_notification('The length of co should be ' + (this.formInstruction.startBitField[0] - this.formInstruction.stopBitField[0] + 1) + ' binary numbers', 'danger');
        }
        else {
          this.newInstruction();
        }
      },
      /*Create a new instruction*/
      newInstruction(){
        for (var i = 0; i < architecture.instructions.length; i++){
          if  (this.formInstruction.co == architecture.instructions[i].co){
            if  ((!this.formInstruction.cop)){
                 show_notification('The instruction already exists', 'danger') ;
                 return;
            }
          }
        }

        for (var i = 0; i < architecture.instructions.length; i++){
          if ((this.formInstruction.cop == architecture.instructions[i].cop) && (!this.formInstruction.cop == false)){
               show_notification('The instruction already exists', 'danger') ;
               return;
          }
        }

        this.showNewInstruction = false;

        //var cop = false;

        this.generateSignatureInst();

        var signature = this.formInstruction.signature;
        var signatureRaw = this.formInstruction.signatureRaw;

        /*if(cop == false){
          this.formInstruction.cop='';
        }*/

        var newInstruction = {name: this.formInstruction.name, type: this.formInstruction.type, signature_definition: this.formInstruction.signature_definition, signature: signature, signatureRaw: signatureRaw, co: this.formInstruction.co , cop: this.formInstruction.cop, nwords: this.formInstruction.nwords , fields: [], definition: this.formInstruction.definition};
        architecture.instructions.push(newInstruction);

        for (var i = 0; i < this.formInstruction.numfields; i++){
          var newField = {name: this.formInstruction.nameField[i], type: this.formInstruction.typeField[i], startbit: parseInt(this.formInstruction.startBitField[i]), stopbit: parseInt(this.formInstruction.stopBitField[i]), valueField: this.formInstruction.valueField[i]};
          architecture.instructions[architecture.instructions.length-1].fields.push(newField);
        }   
      },
      /*Show edit instruction modal*/
      editInstModal(elem, co, cop, button){
        this.modalEditInst.title = "Edit Instruction";
        this.modalEditInst.element = elem;
        for (var i = 0; i < architecture.instructions.length; i++) {
          if(elem == architecture.instructions[i].name && co == architecture.instructions[i].co && cop == architecture.instructions[i].cop){
            this.formInstruction.name = architecture.instructions[i].name;
            this.formInstruction.type = architecture.instructions[i].type;
            this.formInstruction.cop = architecture.instructions[i].cop;
            this.formInstruction.co = architecture.instructions[i].co;
            app._data.modalEditInst.co = architecture.instructions[i].co;
            app._data.modalEditInst.cop = architecture.instructions[i].cop;
            this.formInstruction.nwords = architecture.instructions[i].nwords;
            this.formInstruction.numfields = architecture.instructions[i].fields.length;
            this.formInstruction.numfieldsAux = architecture.instructions[i].fields.length;
            this.formInstruction.signature_definition= architecture.instructions[i].signature_definition;
            this.formInstruction.definition = architecture.instructions[i].definition;

            for (var j = 0; j < architecture.instructions[i].fields.length; j++) {
              this.formInstruction.nameField [j]= architecture.instructions[i].fields[j].name;
              this.formInstruction.typeField[j] = architecture.instructions[i].fields[j].type;
              this.formInstruction.startBitField[j] = architecture.instructions[i].fields[j].startbit;
              this.formInstruction.stopBitField[j] = architecture.instructions[i].fields[j].stopbit;
              this.formInstruction.valueField[j] = architecture.instructions[i].fields[j].valueField;
            }
            this.generateSignatureInst();
          }
        }
        this.$root.$emit('bv::show::modal', 'modalEditInst', button);
      },
      /*Check all fields of modify instruction*/
      editInstVerify(evt, inst, co, cop){
        evt.preventDefault();

        for (var i = 0; i < this.formInstruction.nameField.length; i++){
          for (var j = i + 1; j < this.formInstruction.nameField.length; j++){
            if (this.formInstruction.nameField[i] == this.formInstruction.nameField[j]){
              show_notification('Field name repeated', 'danger') ;
              return;
            }
          }
        }

        var empty = 0;
        var auxCop = "";

        for (var z = 1; z < this.formInstruction.numfields; z++){
          if (this.formInstruction.typeField[z] == 'cop'){
            if (!this.formInstruction.valueField[z]){
                empty = 1;
            }
            else {
              if ((this.formInstruction.valueField[z]).length != (this.formInstruction.startBitField[z] - this.formInstruction.stopBitField[z] + 1)){
                 show_notification('The length of cop should be ' + (this.formInstruction.startBitField[z] - this.formInstruction.stopBitField[z] + 1) + ' binary numbers', 'danger') ;
                 return;
              }

              for (var i = 0; i < this.formInstruction.valueField[z].length; i++){
                if (this.formInstruction.valueField[z].charAt(i) != "0" && this.formInstruction.valueField[z].charAt(i) != "1"){
                   show_notification('The value of cop must be binary', 'danger') ;
                   return;
                }
              }
            }
            auxCop = auxCop + this.formInstruction.valueField[z];
          }
        }

        this.formInstruction.cop = auxCop;

        for (var i = 0; i < this.formInstruction.co.length; i++){
          if (this.formInstruction.co.charAt(i) != "0" && this.formInstruction.co.charAt(i) != "1"){
              show_notification('The value of co must be binary', 'danger') ;
              return;
          }
        }

        for (var i = 0; i < this.formInstruction.numfields; i++){
          if(!this.formInstruction.nameField[i] || !this.formInstruction.typeField[i] || (!this.formInstruction.startBitField[i] && this.formInstruction.startBitField[i] != 0) || (!this.formInstruction.stopBitField[i] && this.formInstruction.stopBitField[i] != 0)){
            empty = 1;
          }
        }
        if (!this.formInstruction.name || !this.formInstruction.type || !this.formInstruction.co || !this.formInstruction.nwords || !this.formInstruction.numfields || !this.formInstruction.signature_definition || !this.formInstruction.definition || empty == 1) {
          show_notification('Please complete all fields', 'danger') ;
        }
        else if(isNaN(this.formInstruction.co)){
          show_notification('The field co must be numbers', 'danger') ;
        }
        else if(isNaN(this.formInstruction.cop)){
          show_notification('The field cop must be numbers', 'danger') ;
        }
        else if((this.formInstruction.co).length != (this.formInstruction.startBitField[0] - this.formInstruction.stopBitField[0] + 1)){
          show_notification('The length of co should be ' + (this.formInstruction.startBitField[0] - this.formInstruction.stopBitField[0] + 1) + ' binary numbers', 'danger') ;
        }
        else {
          this.editInstruction(inst, co, cop);
        }
      },

      /*Edit the instruction*/
      editInstruction(comp, co, cop)
      {
        var exCop = false;

        for (var z = 1; z < this.formInstruction.numfields; z++){
          if (this.formInstruction.typeField[z] == 'cop'){
              exCop = true;
          }
        }

        for (var i = 0; i < architecture.instructions.length; i++){
          if ((this.formInstruction.co == architecture.instructions[i].co) && (this.formInstruction.co != co) && (exCop == false)){
            if (((!this.formInstruction.cop) || (exCop != true))){
                show_notification('The instruction already exists', 'danger') ;
                return;
            }
          }
        }

        for (var i = 0; i < architecture.instructions.length && exCop == true ; i++){
          if ((this.formInstruction.cop == architecture.instructions[i].cop) && (!this.formInstruction.cop == false) && (this.formInstruction.cop != cop)){
               show_notification('The instruction already exists', 'danger') ;
               return;
          }
        }

        this.showEditInstruction = false;

        for (var i = 0; i < architecture.instructions.length; i++)
	{
          if (architecture.instructions[i].name == comp && architecture.instructions[i].co == co && architecture.instructions[i].cop == cop)
	  {
            architecture.instructions[i].name = this.formInstruction.name;
            architecture.instructions[i].type = this.formInstruction.type;
            architecture.instructions[i].co = this.formInstruction.co;
            architecture.instructions[i].cop = this.formInstruction.cop;
            architecture.instructions[i].nwords = this.formInstruction.nwords;
            architecture.instructions[i].signature_definition = this.formInstruction.signature_definition;
            architecture.instructions[i].definition = this.formInstruction.definition;

            for (var j = 0; j < this.formInstruction.numfields; j++)
	    {
              if (j < architecture.instructions[i].fields.length)
              {
                architecture.instructions[i].fields[j].name = this.formInstruction.nameField[j];
                architecture.instructions[i].fields[j].type = this.formInstruction.typeField[j];
                architecture.instructions[i].fields[j].startbit = parseInt(this.formInstruction.startBitField[j]);
                architecture.instructions[i].fields[j].stopbit = parseInt(this.formInstruction.stopBitField[j]);
                architecture.instructions[i].fields[j].valueField = this.formInstruction.valueField[j];
              }
              else{
                var newField = {name: this.formInstruction.nameField[j], type: this.formInstruction.typeField[j], startbit: this.formInstruction.startBitField[j], stopbit: this.formInstruction.stopBitField[j], valueField: this.formInstruction.valueField[j]};
                architecture.instructions[i].fields.push(newField);
              }
            }

            this.generateSignatureInst();

            var signature = this.formInstruction.signature;
            var signatureRaw = this.formInstruction.signatureRaw;

            if(exCop == false){
              architecture.instructions[i].cop='';
            }

            architecture.instructions[i].signature = signature;
            architecture.instructions[i].signatureRaw = signatureRaw;

            if(architecture.instructions[i].fields.length > this.formInstruction.numfields){
              architecture.instructions[i].fields.splice(this.formInstruction.numfields, (architecture.instructions[i].fields.length - this.formInstruction.numfields));
            }
          }
        }

        show_notification('The instruction has been modified, please check the definition of the pseudoinstructions', 'info') ;
      },
      /*Show delete instruction modal*/
      delInstModal(elem, index, button){
        this.modalDeletInst.title = "Delete Instruction";
        this.modalDeletInst.element = elem;
        this.modalDeletInst.index = index;
        this.$root.$emit('bv::show::modal', 'modalDeletInst', button);
      },
      /*Delete the instruction*/
      delInstruction(index){
        architecture.instructions.splice(index,1);
      },
      /*Generate the instruction signature*/
      generateSignatureInst(){
        var signature = this.formInstruction.signature_definition;

        var re = new RegExp("^ +");
        this.formInstruction.signature_definition= this.formInstruction.signature_definition.replace(re, "");

        re = new RegExp(" +", "g");
        this.formInstruction.signature_definition = this.formInstruction.signature_definition.replace(re, " ");

        re = new RegExp("^ +");
        signature= signature.replace(re, "");

        re = new RegExp(" +", "g");
        signature = signature.replace(re, " ");

        for (var z = 0; z < this.formInstruction.numfields; z++){
          re = new RegExp("[Ff]"+z, "g");

          if(z == 0){
            signature = signature.replace(re, this.formInstruction.name);
          }
          else{
            signature = signature.replace(re, this.formInstruction.typeField[z]);
          }
        }

        re = new RegExp(" ", "g");
        signature = signature.replace(re , ",");

        var signatureRaw = this.formInstruction.signature_definition;

        re = new RegExp("^ +");
        signatureRaw= signatureRaw.replace(re, "");

        re = new RegExp(" +", "g");
        signatureRaw = signatureRaw.replace(re, " ");

        for (var z = 0; z < this.formInstruction.numfields; z++){
          re = new RegExp("[Ff]"+z, "g");
          signatureRaw = signatureRaw.replace(re, this.formInstruction.nameField[z]);
        }

        this.formInstruction.signature = signature;
        this.formInstruction.signatureRaw = signatureRaw;
      },
      /*Empty instruction form*/
      emptyFormInst(){
        this.formInstruction.name = '';
        this.formInstruction.type = '';
        this.formInstruction.co = '';
        this.formInstruction.cop = '';
        this.formInstruction.nwords = 1;
        this.formInstruction.numfields = "1";
        this.formInstruction.numfieldsAux = "1";
        this.formInstruction.nameField = [];
        this.formInstruction.typeField = [];
        this.formInstruction.startBitField = [];
        this.formInstruction.stopBitField = [];
        this.formInstruction.valueField = [];
        this.formInstruction.assignedCop = false;
        this.formInstruction.signature ='';
        this.formInstruction.signatureRaw = '';
        this.formInstruction.signature_definition = '';
        this.formInstruction.definition = '';
        this.instructionFormPage = 1;
      },
      /*Show pseudoinstruction fields modal*/
      viewFielsPseudo(elem, index, button){
        this.modalViewFields.title = "Fields of " + elem;
        this.modalViewFields.element = elem;
        
        this.formPseudoinstruction.name = architecture.pseudoinstructions[index].name;
        this.formPseudoinstruction.numfields = architecture.pseudoinstructions[index].fields.length;
        this.formPseudoinstruction.numfieldsAux = architecture.pseudoinstructions[index].fields.length;

        for (var j = 0; j < architecture.pseudoinstructions[index].fields.length; j++){
          this.formPseudoinstruction.nameField[j] = architecture.pseudoinstructions[index].fields[j].name;
          this.formPseudoinstruction.typeField[j] = architecture.pseudoinstructions[index].fields[j].type;
          this.formPseudoinstruction.startBitField[j] = architecture.pseudoinstructions[index].fields[j].startbit;
          this.formPseudoinstruction.stopBitField[j] = architecture.pseudoinstructions[index].fields[j].stopbit;
        }

        this.$root.$emit('bv::show::modal', 'modalViewPseudoFields', button);
      },
      /*Show reset pseudoinstructions modal*/
      resetPseudoinstModal(elem, button){
        this.modalResetPseudoinst.title = "Reset " + elem + " pseudoinstructions";
        this.modalResetPseudoinst.element = elem;
        this.$root.$emit('bv::show::modal', 'modalResetPseudoinst', button);
      },
      /*Reset pseudoinstructions*/
      resetPseudoinstructionsModal(arch){
        show_loading();

        for (var i = 0; i < load_architectures.length; i++) {
          if(arch == load_architectures[i].id){
            var auxArch = JSON.parse(load_architectures[i].architecture);
            var auxArchitecture = bigInt_deserialize(auxArch);

            architecture.pseudoinstructions = auxArchitecture.pseudoinstructions;
            app._data.architecture = architecture;

            hide_loading();
            show_notification('The registers has been reset correctly', 'success') ;
            
            return;
          }
        }

        $.getJSON('architecture/'+arch+'.json', function(cfg){
          var auxArchitecture = cfg;

          var auxArchitecture2 = bigInt_deserialize(auxArchitecture);
          architecture.pseudoinstructions = auxArchitecture2.pseudoinstructions;

          app._data.architecture = architecture;

          hide_loading();
          show_notification('The pseudoinstruction set has been reset correctly', 'success') ;
        });
      },
      /*Check all fields of new pseudoinstruction*/
      newPseudoinstVerify(evt){
        evt.preventDefault();

        for (var i = 0; i < this.formPseudoinstruction.nameField.length; i++){
          for (var j = i + 1; j < this.formPseudoinstruction.nameField.length; j++){
            if (this.formPseudoinstruction.nameField[i] == this.formPseudoinstruction.nameField[j]){
              show_notification('Field name repeated', 'danger') ;
              return;
            }
          }
        }

        var vacio = 0;

        for (var i = 0; i < this.formPseudoinstruction.numfields; i++) {
          if(this.formPseudoinstruction.nameField.length <  this.formPseudoinstruction.numfields || this.formPseudoinstruction.typeField.length <  this.formPseudoinstruction.numfields || this.formPseudoinstruction.startBitField.length <  this.formPseudoinstruction.numfields || this.formPseudoinstruction.stopBitField.length <  this.formPseudoinstruction.numfields){
            vacio = 1;
          }
        }

        var result = this.pseudoDefValidator(this.formPseudoinstruction.name, this.formPseudoinstruction.definition, this.formPseudoinstruction.nameField);

        if(result == -1){
          return;
        }

        if (!this.formPseudoinstruction.name || !this.formPseudoinstruction.nwords || !this.formPseudoinstruction.numfields || !this.formPseudoinstruction.signature_definition || !this.formPseudoinstruction.definition || vacio == 1) {
          show_notification('Please complete all fields', 'danger') ;
        } 
        else {
          this.newPseudoinstruction();
        }
      },
      /*Create a new pseudoinstruction*/
      newPseudoinstruction(){
        this.showNewPseudoinstruction = false;

        this.generateSignaturePseudo();

        var signature = this.formPseudoinstruction.signature;
        var signatureRaw = this.formPseudoinstruction.signatureRaw;

        var newPseudoinstruction = {name: this.formPseudoinstruction.name, signature_definition: this.formPseudoinstruction.signature_definition, signature: signature, signatureRaw: signatureRaw, nwords: this.formPseudoinstruction.nwords , fields: [], definition: this.formPseudoinstruction.definition};
        architecture.pseudoinstructions.push(newPseudoinstruction);

        for (var i = 0; i < this.formPseudoinstruction.numfields; i++) {
          var newField = {name: this.formPseudoinstruction.nameField[i], type: this.formPseudoinstruction.typeField[i], startbit: this.formPseudoinstruction.startBitField[i], stopbit: this.formPseudoinstruction.stopBitField[i]};
          architecture.pseudoinstructions[architecture.pseudoinstructions.length-1].fields.push(newField);
        }
      },
      /*Show edit pseudoinstruction modal*/
      editPseudoinstModal(elem, index, button){
        this.modalEditPseudoinst.title = "Edit Pseudoinstruction";
        this.modalEditPseudoinst.element = elem;
        this.modalEditPseudoinst.index = index;
        
        this.formPseudoinstruction.name = architecture.pseudoinstructions[index].name;
        this.formPseudoinstruction.nwords = architecture.pseudoinstructions[index].nwords;
        this.formPseudoinstruction.numfields = architecture.pseudoinstructions[index].fields.length;
        this.formPseudoinstruction.numfieldsAux = architecture.pseudoinstructions[index].fields.length;
        this.formPseudoinstruction.signature_definition = architecture.pseudoinstructions[index].signature_definition;
        this.formPseudoinstruction.definition = architecture.pseudoinstructions[index].definition;

        for (var j = 0; j < architecture.pseudoinstructions[index].fields.length; j++) {
          this.formPseudoinstruction.nameField[j] = architecture.pseudoinstructions[index].fields[j].name;
          this.formPseudoinstruction.typeField[j] = architecture.pseudoinstructions[index].fields[j].type;
          this.formPseudoinstruction.startBitField[j] = architecture.pseudoinstructions[index].fields[j].startbit;
          this.formPseudoinstruction.stopBitField[j] = architecture.pseudoinstructions[index].fields[j].stopbit;
        }

        this.generateSignaturePseudo();

        this.$root.$emit('bv::show::modal', 'modalEditPseudoinst', button);
      },
      /*Check all fields of modify pseudoinstruction*/
      editPseudoinstVerify(evt, inst, index){
        evt.preventDefault();

        for (var i = 0; i < this.formPseudoinstruction.nameField.length; i++){
          for (var j = i + 1; j < this.formPseudoinstruction.nameField.length; j++){
            if (this.formPseudoinstruction.nameField[i] == this.formPseudoinstruction.nameField[j]){
              show_notification('Field name repeated', 'danger') ;
              return;
            }
          }
        }

        var vacio = 0;

        for (var i = 0; i < this.formPseudoinstruction.numfields; i++) {
          if(!this.formPseudoinstruction.nameField[i] || !this.formPseudoinstruction.typeField[i] || (!this.formPseudoinstruction.startBitField[i] && this.formPseudoinstruction.startBitField[i] != 0) || (!this.formPseudoinstruction.stopBitField[i] && this.formPseudoinstruction.stopBitField[i] != 0)){
            vacio = 1;
          }
        }

        var result = this.pseudoDefValidator(inst, this.formPseudoinstruction.definition, this.formPseudoinstruction.nameField);

        if(result == -1){
          return;
        }

        if (!this.formPseudoinstruction.name || !this.formPseudoinstruction.nwords || !this.formPseudoinstruction.numfields || !this.formPseudoinstruction.signature_definition || !this.formPseudoinstruction.definition || vacio == 1) {
          show_notification('Please complete all fields', 'danger') ;
        }
        else {
          this.editPseudoinstruction(inst, index);
        }
      },
      /*Edit the pseudoinstruction*/
      editPseudoinstruction(comp, index){

        this.showEditPseudoinstruction = false;
        
        architecture.pseudoinstructions[index].name = this.formPseudoinstruction.name;
        architecture.pseudoinstructions[index].nwords = this.formPseudoinstruction.nwords;
        architecture.pseudoinstructions[index].definition = this.formPseudoinstruction.definition;
        architecture.pseudoinstructions[index].signature_definition = this.formPseudoinstruction.signature_definition;

        for (var j = 0; j < this.formPseudoinstruction.numfields; j++){
          if(j < architecture.pseudoinstructions[index].fields.length){
            architecture.pseudoinstructions[index].fields[j].name = this.formPseudoinstruction.nameField[j];
            architecture.pseudoinstructions[index].fields[j].type = this.formPseudoinstruction.typeField[j];
            architecture.pseudoinstructions[index].fields[j].startbit = this.formPseudoinstruction.startBitField[j];
            architecture.pseudoinstructions[index].fields[j].stopbit = this.formPseudoinstruction.stopBitField[j];
          }
          else{
            var newField = {name: this.formPseudoinstruction.nameField[j], type: this.formPseudoinstruction.typeField[j], startbit: this.formPseudoinstruction.startBitField[j], stopbit: this.formPseudoinstruction.stopBitField[j]};
            architecture.pseudoinstructions[index].fields.push(newField);
          }
        }

        this.generateSignaturePseudo();

        var signature = this.formPseudoinstruction.signature;
        var signatureRaw = this.formPseudoinstruction.signatureRaw;

        architecture.pseudoinstructions[index].signature = signature;
        architecture.pseudoinstructions[index].signatureRaw = signatureRaw;

        if(architecture.pseudoinstructions[index].fields.length > this.formPseudoinstruction.numfields){
          architecture.pseudoinstructions[index].fields.splice(this.formPseudoinstruction.numfields, (architecture.pseudoinstructions[i].fields.length - this.formPseudoinstruction.numfields));
        }
      },
      /*Show delete pseudoinstruction modal*/
      delPseudoinstModal(elem, index, button){
        this.modalDeletPseudoinst.title = "Delete Pseudointruction";
        this.modalDeletPseudoinst.element = elem;
        this.modalDeletPseudoinst.index = index;
        this.$root.$emit('bv::show::modal', 'modalDeletPseudoinst', button);
      },
      /*Delete the pseudoinstruction*/
      delPseudoinstruction(index){
        architecture.pseudoinstructions.splice(index,1);
      },
      /*Verify the pseudoinstruction definition*/
      pseudoDefValidator(name, definition, fields){
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

                        if(float2bin(parseFloat(instructionParts[z])).length > fieldsLength){
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

                      if(float2bin(parseFloat(instructionParts[z])).length > fieldsLength){
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
      /*Generate the pseudoinstruction signature*/
      generateSignaturePseudo(){
        var signature = this.formPseudoinstruction.signature_definition;

        var re = new RegExp("^ +");
        this.formPseudoinstruction.signature_definition = this.formPseudoinstruction.signature_definition.replace(re, "");

        re = new RegExp(" +", "g");
        this.formPseudoinstruction.signature_definition = this.formPseudoinstruction.signature_definition.replace(re, " ");

        re = new RegExp("^ +");
        signature= signature.replace(re, "");

        re = new RegExp(" +", "g");
        signature = signature.replace(re, " ");

        for (var z = 0; z < this.formPseudoinstruction.numfields; z++) {
          re = new RegExp("[Ff]"+z, "g");

          signature = signature.replace(re, this.formPseudoinstruction.typeField[z]);
        }

        re = new RegExp(" ", "g");
        signature = signature.replace(re , ",");

        var signatureRaw = this.formPseudoinstruction.signature_definition;

        re = new RegExp("^ +");
        signatureRaw= signatureRaw.replace(re, "");

        re = new RegExp(" +", "g");
        signatureRaw = signatureRaw.replace(re, " ");

        for (var z = 0; z < this.formPseudoinstruction.numfields; z++) {
          re = new RegExp("[Ff]"+z, "g");

          signatureRaw = signatureRaw.replace(re, this.formPseudoinstruction.nameField[z]);
        }

        this.formPseudoinstruction.signature = signature;
        this.formPseudoinstruction.signatureRaw = signatureRaw;
      },
      /*Empty pseudoinstruction form*/
      emptyFormPseudo(){
        this.formPseudoinstruction.name = '';
        this.formPseudoinstruction.nwords = 1;
        this.formPseudoinstruction.numfields = "0";
        this.formPseudoinstruction.numfields = "0";
        this.formPseudoinstruction.nameField = [];
        this.formPseudoinstruction.typeField = [];
        this.formPseudoinstruction.startBitField = [];
        this.formPseudoinstruction.stopBitField = [];
        this.formPseudoinstruction.signature ='';
        this.formPseudoinstruction.signatureRaw = '';
        this.formPseudoinstruction.signature_definition = '';
        this.formPseudoinstruction.definition = '';
        this.instructionFormPage = 1;
      },
      /*Pagination bar names*/
      linkGen (pageNum) {
        return this.instructionFormPageLink[pageNum - 1]
      },
      pageGen (pageNum) {
        return this.instructionFormPageLink[pageNum - 1].slice(1)
      },
      /*Show reset directive modal*/
      resetDirModal(elem, button){
        this.modalResetDir.title = "Reset " + elem + " directives";
        this.modalResetDir.element = elem;
        this.$root.$emit('bv::show::modal', 'modalResetDir', button);
      },
      /*Reset directives*/
      resetDirectives(arch){
        show_loading();

        for (var i = 0; i < load_architectures.length; i++) {
          if(arch == load_architectures[i].id){
            var auxArch = JSON.parse(load_architectures[i].architecture);
            var auxArchitecture = bigInt_deserialize(auxArch);

            architecture.directives = auxArchitecture.directives;
            app._data.architecture = architecture;

            hide_loading();
            show_notification('The directive set has been reset correctly', 'success') ;
            return;
          }
        }

        $.getJSON('architecture/'+arch+'.json', function(cfg){
          var auxArchitecture = cfg;

          var auxArchitecture2 = bigInt_deserialize(auxArchitecture);
          architecture.directives = auxArchitecture2.directives;

          app._data.architecture = architecture;

          hide_loading();
          show_notification('The directive set has been reset correctly', 'success') ;
        });
      },
      /*Verify all fields of new directive*/
      newDirVerify(evt){
        evt.preventDefault();

        if (!this.formDirective.name || !this.formDirective.action) {
          show_notification('Please complete all fields', 'danger') ;
        } 
        else {
          if(isNaN(parseInt(this.formDirective.size)) && (this.formDirective.action == 'byte' || this.formDirective.action == 'half_word' || this.formDirective.action == 'word' || this.formDirective.action == 'double_word' || this.formDirective.action == 'float' || this.formDirective.action == 'double' || this.formDirective.action == 'space')){
            show_notification('Please complete all fields', 'danger') ;
          }
          else{
            this.newDirective();
          }
        }
      },
      /*Create new directive*/
      newDirective(){
        for (var i = 0; i < architecture.directives.length; i++) {
          if(this.formDirective.name == architecture.directives[i].name){
            show_notification('The directive already exists', 'danger') ;
            return;
          }
        }

        this.showNewDirective = false;
        if(this.formDirective.action != 'byte' && this.formDirective.action != 'half_word' && this.formDirective.action != 'word' && this.formDirective.action != 'double_word' && this.formDirective.action != 'float' && this.formDirective.action != 'double' && this.formDirective.action != 'space'){
          this.formDirective.size = null;
        }

        var newDir = {name: this.formDirective.name, action: this.formDirective.action, size: this.formDirective.size};
        architecture.directives.push(newDir);
      },
      /*Show edit directive modal*/
      editDirModal(elem, button){
        this.modalEditDirective.title = "Edit " + elem;
        this.modalEditDirective.element = elem;

        for (var i = 0; i < architecture.directives.length; i++){
          if(elem == architecture.directives[i].name){
            this.formDirective.name = architecture.directives[i].name;
            this.formDirective.action = architecture.directives[i].action;
            this.formDirective.size = architecture.directives[i].size;
          }
        }
        this.$root.$emit('bv::show::modal', 'modalEditDirective', button);
      },
      /*Verify all fields of modify directive*/
      editDirVerify(evt, name){
        evt.preventDefault();

        if (!this.formDirective.name || !this.formDirective.action) {
          show_notification('Please complete all fields', 'danger') ;
        } 
        else {
          if(isNaN(parseInt(this.formDirective.size)) && (this.formDirective.action == 'byte' || this.formDirective.action == 'half_word' || this.formDirective.action == 'word' || this.formDirective.action == 'double_word' || this.formDirective.action == 'float' || this.formDirective.action == 'double' || this.formDirective.action == 'space')){
            show_notification('Please complete all fields', 'danger') ;
          }
          else{
            this.editDirective(name);
          }
        }
      },
      /*edit directive*/
      editDirective(name){
        for (var i = 0; i < architecture.directives.length; i++) {
          if((this.formDirective.name == architecture.directives[i].name) && (name != this.formDirective.name)){
            show_notification('The directive already exists', 'danger') ;
            return;
          }
        }

        this.showEditDirective = false;

        for (var i = 0; i < architecture.directives.length; i++) {
          if(name == architecture.directives[i].name){
            architecture.directives[i].name = this.formDirective.name;
            architecture.directives[i].action = this.formDirective.action;
            if(this.formDirective.action == 'byte' || this.formDirective.action == 'half_word' || this.formDirective.action == 'word' || this.formDirective.action == 'double_word' || this.formDirective.action == 'float' || this.formDirective.action == 'double' || this.formDirective.action == 'space'){
              architecture.directives[i].size = this.formDirective.size;
            }
            else{
              architecture.directives[i].size = null;
            }
            return;
          }
        }
      },
      /*Show delete directive modal*/
      delDirModal(elem, button){
        this.modalDeletDir.title = "Delete " + elem;
        this.modalDeletDir.element = elem;
        this.$root.$emit('bv::show::modal', 'modalDeletDir', button);
      },
      /*Delete directive*/
      delDirective(comp){
        for (var i = 0; i < architecture.directives.length; i++) {
          if(comp == architecture.directives[i].name){
            architecture.directives.splice(i,1);
          }
        }
      },
      /*Empty directive form*/
      emptyFormDirective(){
        this.formDirective.name = '';
        this.formDirective.action = '';
        this.formDirective.size = 0;
      },
      /*Form validator*/
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



      /*Compilator*/

      /*Empty assembly textarea*/
      newAssembly(){
        textarea_assembly_editor.setValue("");
      },
      /*Load external assembly code*/
      read_assembly(e){
        show_loading();
        var file;
        var reader;
        var files = document.getElementById('assembly_file').files;

        for (var i = 0; i < files.length; i++){
          file = files[i];
          reader = new FileReader();
          reader.onloadend = onFileLoaded;
          reader.readAsBinaryString(file);
        }

        function onFileLoaded(event) {
          code_assembly = event.currentTarget.result;
        }
        hide_loading();
      },
      assembly_update(){
        textarea_assembly_editor.setValue(code_assembly);
      },
      /*Save assembly code in a local file*/
      assembly_save(){
        var textToWrite = textarea_assembly_editor.getValue();
        var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
        var fileNameToSaveAs;

        if(this.save_assembly == ''){
          fileNameToSaveAs = "assembly.s";
        }
        else{
          fileNameToSaveAs = this.save_assembly + ".s";
        }

        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = "My Hidden Link";

        window.URL = window.URL || window.webkitURL;

        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);

        downloadLink.click();
      },
      /*Load the available examples*/
      load_examples_available(){
        $.getJSON('examples/available_example.json', function(cfg){
          example_available = cfg;
          app._data.example_available = example_available;
        });
      },
      /*Load a selected example*/
      load_example(id){
        this.$root.$emit('bv::hide::modal', 'examples', '#closeExample');

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
          if (this.readyState == 4 && this.status == 200) {
            code_assembly = this.responseText;
            textarea_assembly_editor.setValue(code_assembly);

            show_notification(' The selected example has been loaded correctly', 'success') ;
          }
        };
        xhttp.open("GET", "examples/"+id+".txt", true);
        xhttp.send();
      },
      /*Save a binary in a local file*/
      library_save(){
        if(this.assembly_compiler() == -1){
          return;
        }
        promise.then((message) => {
          if(message == "-1"){
            return;
          }
          if(memory[memory_hash[0]].length != 0){
            show_notification('You can not enter data in a library', 'danger') ;
            return;
          }

          for (var i = 0; i < instructions_binary.length; i++){
            console_log(instructions_binary[i].Label)
            if(instructions_binary[i].Label == "main_symbol"){
              show_notification('You can not use the "main" tag in a library', 'danger') ;
              return;
            }
          }

          var aux = {instructions_binary: instructions_binary, instructions_tag: instructions_tag};

          var textToWrite = JSON.stringify(aux, null, 2);
          var textFileAsBlob = new Blob([textToWrite], { type: 'text/json' });
          var fileNameToSaveAs;

          if(this.name_binary_save == ''){
            fileNameToSaveAs = "binary.o";
          }
          else{
            fileNameToSaveAs = this.name_binary_save + ".o";
          }

          var downloadLink = document.createElement("a");
          downloadLink.download = fileNameToSaveAs;
          downloadLink.innerHTML = "My Hidden Link";

          window.URL = window.URL || window.webkitURL;

          downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
          downloadLink.onclick = destroyClickedElement;
          downloadLink.style.display = "none";
          document.body.appendChild(downloadLink);

          downloadLink.click();

          show_notification('Save binary', 'success') ;
        });
      },
      /*Load binary file*/
      library_load(e){
        var file;
        var reader;
        var files = document.getElementById('binary_file').files;

        for (var i = 0; i < files.length; i++) {
          file = files[i];
          reader = new FileReader();
          reader.onloadend = onFileLoaded;
          reader.readAsBinaryString(file);
        }

        function onFileLoaded(event) {
          code_binary = event.currentTarget.result;
        }
      },
      library_update(){
        update_binary = JSON.parse(code_binary);
        this.update_binary = update_binary;
        $("#divAssembly").attr("class", "col-lg-10 col-sm-12");
        $("#divTags").attr("class", "col-lg-2 col-sm-12");
        $("#divTags").show();
        this.load_binary = true;
      },
      /*Remove a loaded binary*/
      removeLibrary(){
        update_binary = "";
        this.update_binary = update_binary;
        $("#divAssembly").attr("class", "col-lg-12 col-sm-12");
        $("#divTags").attr("class", "col-lg-0 col-sm-0");
        $("#divTags").hide();
        this.load_binary = false;
      },

      /*Compile assembly code*/
      assembly_compiler()
      {
        show_loading();
        promise = new Promise((resolve, reject) => {

          setTimeout(function()
	  {
	    /* compile */
            code_assembly = textarea_assembly_editor.getValue();
            var ret = assembly_compiler() ;

	    /* update */
	    app._data.instructions = instructions;
	    app._data.memory[memory_hash[1]] = memory[memory_hash[1]];
	    app._data.memory[memory_hash[0]] = memory[memory_hash[0]];
	    app._data.memory[memory_hash[2]] = memory[memory_hash[2]];
            tokenIndex = 0;
            app.reset();

            /*Save a backup in the cache memory*/
            if (typeof(Storage) !== "undefined") 
            {
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

            // show error/warning
            hide_loading();

            if (ret.status == "error") {
                app.compileError(ret.errorcode, ret.token, textarea_assembly_editor.posFromIndex(tokenIndex).line);
            }
	    else if (ret.status == "warning") {
                show_notification(ret.token, ret.type) ;
            }       
	    else {
                show_notification('Compilation completed successfully', 'success') ;
            }       

            // end
            resolve("0");

          }, 25);
        });
      },

      /*Show error message in the compilation*/
      compileError(error, token, line){
        this.$root.$emit('bv::show::modal', 'modalAssemblyError');

        if (line > 0){
          this.modalAssemblyError.code1 = line + "  " + textarea_assembly_editor.getLine(line - 1);
        }
        else{
          this.modalAssemblyError.code1 = "";
        }

        this.modalAssemblyError.code2 = (line + 1) + "  " + textarea_assembly_editor.getLine(line);

        if(line < textarea_assembly_editor.lineCount() - 1){
          this.modalAssemblyError.code3 = (line + 2) + "  " + textarea_assembly_editor.getLine(line + 1);
        }
        else{
          this.modalAssemblyError.code3 = "";
        }

        this.modalAssemblyError.error = compileError[error].mess1 + token + compileError[error].mess2;
      },


      /*Simulator*/

      /*Detects the browser being used*/
      detectNavigator(){
        if(navigator.appVersion.indexOf("Mac")!=-1) {
          this.navigator = "Mac";
          return;
        }
    
        if (navigator.userAgent.search("Chrome") >= 0) {
          this.navigator = "Chrome";
        }
        else if (navigator.userAgent.search("Firefox") >= 0) {
          this.navigator = "Firefox";
        }
        else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
          this.navigator = "Chrome";
        }
      },

      /*Change bits of calculator*/
      changeBitsCalculator(index){
        if(index == 0){
          this.calculator.bits = 32;
          this.calculator.variant32 = "primary";
          this.calculator.variant64 = "outline-primary";
          this.calculator.lengthHexadecimal = 8;
          this.calculator.lengthSign = 1;
          this.calculator.lengthExponent = 8;
          this.calculator.lengthMantissa = 23;
        }
        if(index == 1){
          this.calculator.bits = 64;
          this.calculator.variant64 = "primary";
          this.calculator.variant32 = "outline-primary";
          this.calculator.lengthHexadecimal = 16;
          this.calculator.lengthSign = 1;
          this.calculator.lengthExponent = 11;
          this.calculator.lengthMantissa = 52;
        }
        this.calculator.hexadecimal = "";
        this.calculator.sign = "";
        this.calculator.exponent = "";
        this.calculator.mantissa = "";
        this.calculator.decimal = "";
        this.calculator.sign = "";
        this.calculator.exponentDec = "";
        this.calculator.mantissaDec = "";
      },
      /*Calculator functionality*/
      calculatorFunct(index){
        switch(index){
          case 0:
            console_log(this.calculator.hexadecimal.padStart((this.calculator.bits/4), "0"));
            var hex = this.calculator.hexadecimal.padStart((this.calculator.bits/4), "0");
            var float;
            var binary;

            if(this.calculator.bits == 32){
              var re = /[0-9A-Fa-f]{8}/g;
              if(!re.test(hex)){
                show_notification('Character not allowed', 'danger') ;

                this.calculator.sign = "";
                this.calculator.exponent = "";
                this.calculator.mantissa = "";
                this.calculator.exponentDec = "";
                this.calculator.mantissaDec = 0;
                this.calculator.decimal = "";

                return;
              }

              float = this.hex2float("0x" + hex);
              console_log(this.hex2float("0x" + hex));
              binary = float2bin(float).padStart(this.calculator.bits, "0");

              this.calculator.decimal = float;
              this.calculator.sign = binary.substring(0, 1);
              this.calculator.exponent = binary.substring(1, 9);
              this.calculator.mantissa = binary.substring(9, 32);
              this.calculator.exponentDec = parseInt(bin2hex(this.calculator.exponent), 16);
              this.calculator.mantissaDec = 0;

              var j = 0;
              for (var i = 0; i < this.calculator.mantissa.length; i++) {
                j--;
                this.calculator.mantissaDec = this.calculator.mantissaDec + (parseInt(this.calculator.mantissa.charAt(i)) * Math.pow(2, j))
              }
            }
            if(this.calculator.bits == 64){
              var re = /[0-9A-Fa-f]{16}/g;
              if(!re.test(hex)){
                show_notification('Character not allowed', 'danger') ;

                this.calculator.sign = "";
                this.calculator.exponent = "";
                this.calculator.mantissa = "";
                this.calculator.exponentDec = "";
                this.calculator.mantissaDec = 0;
                this.calculator.decimal = "";

                return;
              }

              float = hex2double("0x"+hex);
              binary = double2bin(float);

              this.calculator.decimal = float;
              this.calculator.sign = binary.substring(0, 1);
              this.calculator.exponent = binary.substring(1, 12);
              this.calculator.mantissa = binary.substring(12, 64);
              this.calculator.exponentDec = parseInt(bin2hex(this.calculator.exponent), 16);
              this.calculator.mantissaDec = 0;

              var j = 0;
              for (var i = 0; i < this.calculator.mantissa.length; i++) {
                j--;
                this.calculator.mantissaDec = this.calculator.mantissaDec + (parseInt(this.calculator.mantissa.charAt(i)) * Math.pow(2, j))
              }
            }

            break;
          case 1:
            if(this.calculator.bits == 32){
              this.calculator.sign = this.calculator.sign.padStart(1, "0");
              this.calculator.exponent = this.calculator.exponent.padStart(8, "0");
              this.calculator.mantissa = this.calculator.mantissa.padStart(23, "0");

              var binary = this.calculator.sign + this.calculator.exponent + this.calculator.mantissa;
              console_log(binary);

              var re = /[0-1]{32}/g;
              if(!re.test(binary)){
                show_notification('Character not allowed', 'danger') ;

                this.calculator.hexadecimal = "";
                this.calculator.decimal = "";
                this.calculator.exponentDec = "";
                this.calculator.mantissaDec = 0;
                return;
              }

              float = this.hex2float("0x" + bin2hex(binary));
              hexadecimal = bin2hex(binary);

              this.calculator.decimal = float;
              this.calculator.hexadecimal = hexadecimal.padStart((this.calculator.bits/4), "0");
              this.calculator.exponentDec = parseInt(bin2hex(this.calculator.exponent), 16);
              this.calculator.mantissaDec = 0;

              var j = 0;
              for (var i = 0; i < this.calculator.mantissa.length; i++) {
                j--;
                this.calculator.mantissaDec = this.calculator.mantissaDec + (parseInt(this.calculator.mantissa.charAt(i)) * Math.pow(2, j))
              }
            }
            if(this.calculator.bits == 64){
              this.calculator.sign = this.calculator.sign.padStart(1, "0");
              this.calculator.exponent = this.calculator.exponent.padStart(11, "0");
              this.calculator.mantissa = this.calculator.mantissa.padStart(52, "0");

              var binary = this.calculator.sign + this.calculator.exponent + this.calculator.mantissa;

              var re = /[0-1]{64}/g;
              if(!re.test(binary)){
                show_notification('Character not allowed', 'danger') ;

                this.calculator.hexadecimal = "";
                this.calculator.decimal = "";
                this.calculator.exponentDec = parseInt(bin2hex(this.calculator.exponent), 16);
                this.calculator.mantissaDec = 0;

                var j = 0;
                for (var i = 0; i < this.calculator.mantissa.length; i++) {
                  j--;
                  this.calculator.mantissaDec = this.calculator.mantissaDec + (parseInt(this.calculator.mantissa.charAt(i)) * Math.pow(2, j))
                }
                return;
              }

              double = hex2double("0x" + bin2hex(binary));
              hexadecimal = bin2hex(binary);

              this.calculator.decimal = double;
              this.calculator.hexadecimal = hexadecimal.padStart((this.calculator.bits/4), "0");
            }

            break;
          case 2:
            var float = parseFloat(this.calculator.decimal, 10);
            var binary;
            var hexadecimal;

            if(this.calculator.bits == 32){
              hexadecimal = bin2hex(float2bin(float));
              binary = float2bin(float);

              console_log(hexadecimal);

              this.calculator.hexadecimal = hexadecimal.padStart((this.calculator.bits/4), "0");
              this.calculator.sign = binary.substring(0, 1);
              this.calculator.exponent = binary.substring(1, 9);
              this.calculator.mantissa = binary.substring(9, 32);
              this.calculator.exponentDec = parseInt(bin2hex(this.calculator.exponent), 16);
              this.calculator.mantissaDec = 0;

              var j = 0;
              for (var i = 0; i < this.calculator.mantissa.length; i++) {
                j--;
                this.calculator.mantissaDec = this.calculator.mantissaDec + (parseInt(this.calculator.mantissa.charAt(i)) * Math.pow(2, j))
              }
            }

            if(this.calculator.bits == 64){
              hexadecimal = bin2hex(double2bin(float));
              binary = double2bin(float);

              this.calculator.hexadecimal = hexadecimal.padStart((this.calculator.bits/4), "0");
              this.calculator.sign = binary.substring(0, 1);
              this.calculator.exponent = binary.substring(1, 12);
              this.calculator.mantissa = binary.substring(12, 64);
              this.calculator.exponentDec = parseInt(bin2hex(this.calculator.exponent), 16);
              this.calculator.mantissaDec = 0;

              var j = 0;
              for (var i = 0; i < this.calculator.mantissa.length; i++) {
                j--;
                this.calculator.mantissaDec = this.calculator.mantissaDec + (parseInt(this.calculator.mantissa.charAt(i)) * Math.pow(2, j))
              }
            }
            break;
        }
      },
      /*Update a new register value*/
      updateReg(comp, elem, type, precision){
        for (var i = 0; i < architecture.components[comp].elements.length; i++) {
          if(type == "integer" || type == "control"){
            if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^0x/)){
              var value = this.newValue.split("x");
              if(value[1].length * 4 > architecture.components[comp].elements[i].nbits){
                value[1] = value[1].substring(((value[1].length * 4) - architecture.components[comp].elements[i].nbits)/4, value[1].length)
              }
              architecture.components[comp].elements[i].value = bigInt(value[1], 16).value;
            }
            else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^(\d)+/)){
              architecture.components[comp].elements[i].value = bigInt(parseInt(this.newValue) >>> 0, 10).value;
            }
            else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^-/)){
              architecture.components[comp].elements[i].value = bigInt(parseInt(this.newValue) >>> 0, 10).value;
            }
          }
          else if(type =="floating point"){
            if(precision == false){
              if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^0x/)){
                architecture.components[comp].elements[i].value = this.hex2float(this.newValue);
                this.updateDouble(comp, i);
              }
              else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^(\d)+/)){
                architecture.components[comp].elements[i].value = parseFloat(this.newValue, 10);
                this.updateDouble(comp, i);
              }
              else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^-/)){
                architecture.components[comp].elements[i].value = parseFloat(this.newValue, 10);
                this.updateDouble(comp, i);
              }
            }

            else if(precision == true){
              if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^0x/)){
                architecture.components[comp].elements[i].value = hex2double(this.newValue);
                this.updateSimple(comp, i);
              }
              else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^(\d)+/)){
                architecture.components[comp].elements[i].value = parseFloat(this.newValue, 10);
                this.updateSimple(comp, i);
              }
              else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^-/)){
                architecture.components[comp].elements[i].value = parseFloat(this.newValue, 10);
                this.updateSimple(comp, i)
              }
            }
          }
        }
        this.newValue = '';
      },

      /*Execute one instruction*/
      executeInstruction() 
      {
        console_log(mutexRead);
        newExecution = false;

        do{
          console_log(executionIndex);
          console_log(architecture.components[0].elements[0].value);

          if(instructions.length == 0){
            show_notification('No instructions in memory', 'danger');
            return;
          }

          if(executionIndex < -1){
            show_notification('The program has finished', app._data.type ='danger') ;
            return;
          }
          else if(executionIndex == -1){
            show_notification('The program has finished with errors', 'danger') ;
            return;
          }
          else if(mutexRead == true){
            return;
          }

          /*Search a main tag*/
          if(executionInit == 1){
            for (var i = 0; i < instructions.length; i++) {
              if(instructions[i].Label == "main"){
                instructions[executionIndex]._rowVariant = 'success';
                architecture.components[0].elements[0].value = bigInt(parseInt(instructions[i].Address, 16)).value;
                executionInit = 0;
                break;
              }
              else if(i == instructions.length-1){
                show_notification('Label "main" not found', 'danger') ;
                executionIndex = -1;
                return;
              }
            }
          }

          var error = 0;
          var index;

          for (var i = 0; i < instructions.length; i++){
            if(parseInt(instructions[i].Address, 16) == architecture.components[0].elements[0].value){
              executionIndex = i;

              console_log(instructions[executionIndex].hide)
              console_log(executionIndex)
              console_log(instructions[i].Address)

              if(instructions[executionIndex].hide == false){
                instructions[executionIndex]._rowVariant = 'info';
              }
            }
            else{
              if(instructions[executionIndex].hide == false){
                instructions[i]._rowVariant = '';
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

            var numCop = 0;
            var numCopCorrect = 0;

            if(architecture.instructions[i].co == instructionExecParts[0].substring(0,6)){
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
          architecture.components[0].elements[0].value = architecture.components[0].elements[0].value + bigInt((nwords * 4)).value;

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
                  auxDef = auxDef.replace(re, "bigInt(" + instructionExecParts[i] + ").value");
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
                if(architecture.instructions[auxIndex].fields[j].type == "inm-signed"){
                  var value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
                  var valueSign = value.charAt(0);
                  var newValue =  value.padStart(32, valueSign) ;
                  newValue = parseInt(newValue, 2) ;
                  var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
                  auxDef = auxDef.replace(re, newValue >> 0);
                }
                if(architecture.instructions[auxIndex].fields[j].type == "inm-unsigned"){
                  var value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
                  newValue = parseInt(newValue, 2) ;
                  var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
                  auxDef = auxDef.replace(re, newValue >> 0);
                }
                if(architecture.instructions[auxIndex].fields[j].type == "address"){
                  var value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
                  var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
                  auxDef = auxDef.replace(re, parseInt(value, 2));
                }
                if(architecture.instructions[auxIndex].fields[j].type == "offset_words"){
                  var value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
                  var valueSign = value.charAt(0);
                  var newValue =  value.padStart(32, valueSign) ;
                  newValue = parseInt(newValue, 2) ;
//danger
                  var re = new RegExp(architecture.instructions[auxIndex].fields[j].name,"g");
                  auxDef = auxDef.replace(re, newValue >> 0);
                }
                if(architecture.instructions[auxIndex].fields[j].type == "offset_bytes"){
                  var value = instructionExecParts[0].substring(((architecture.instructions[auxIndex].nwords*31) - architecture.instructions[auxIndex].fields[j].startbit), ((architecture.instructions[auxIndex].nwords*32) - architecture.instructions[auxIndex].fields[j].stopbit))
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
              auxDef = auxDef.replace(re, "this.syscall('print_int',"+compIndex+" , "+elemIndex+", null, null)");
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
              auxDef = auxDef.replace(re, "this.syscall('print_float',"+compIndex+" , "+elemIndex+", null, null)");
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
              auxDef = auxDef.replace(re, "this.syscall('print_double',"+compIndex+" , "+elemIndex+", null, null)");
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
              auxDef = auxDef.replace(re, "this.syscall('print_string',"+compIndex+" , "+elemIndex+", null, null)");
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
              auxDef = auxDef.replace(re, "this.syscall('read_int',"+compIndex+" , "+elemIndex+", null, null)");
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
              auxDef = auxDef.replace(re, "this.syscall('read_float',"+compIndex+" , "+elemIndex+", null, null)");
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
              auxDef = auxDef.replace(re, "this.syscall('read_double',"+compIndex+" , "+elemIndex+", null, null)");
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
              auxDef = auxDef.replace(re, "this.syscall('read_string',"+compIndex+" , "+elemIndex+","+compIndex2+" , "+elemIndex2+")");
            }

            re = /sbrk\((.*?)\)/
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
              auxDef = auxDef.replace(re, "this.syscall('sbrk',"+compIndex+" , "+elemIndex+", null, null)");
            }

            re = /exit\((.*?)\)/;
            auxDef = auxDef.replace(re, "this.syscall('exit', null, null, null, null)");

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
              auxDef = auxDef.replace(re, "this.syscall('print_char',"+compIndex+" , "+elemIndex+", null, null)");
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
              auxDef = auxDef.replace(re, "this.syscall('read_char',"+compIndex+" , "+elemIndex+", null, null)");
            }

            console_log(auxDef);

            /*Divides a double into two parts*/
            re = /splitDouble\((.*)\)/;
            while (auxDef.search(re) != -1){
              var match = re.exec(auxDef);
              match[1] = match[1].replace(";", ",");
              auxDef = auxDef.replace(re, "this.divDouble(" + match [1] + ")");
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
                var re;

                /*Write in the register*/
                re = new RegExp(architecture.components[i].elements[j].name+" *=[^=]");
                if (auxDef.search(re) != -1){
                  re = new RegExp(architecture.components[i].elements[j].name+" *=","g");

                  auxDef = auxDef.replace(re, "reg"+ regIndex+"=");
                  auxDef = "var reg" + regIndex + "=null;\n" + auxDef;
                  auxDef = auxDef + "\n this.writeRegister(reg"+regIndex+","+i+" ,"+j+");"
                  regIndex++;
                }

                if(architecture.components[i].type == "integer"){
                  re = new RegExp("R"+regNum+" *=[^=]");
                  if (auxDef.search(re) != -1){
                    re = new RegExp("R"+regNum+" *=","g");
                    auxDef = auxDef.replace(re, "var reg"+ regIndex+"=");
                    auxDef = "var reg" + regIndex + "=null\n" + auxDef;
                    auxDef = auxDef + "\n this.writeRegister(reg"+regIndex+","+i+" ,"+j+");"
                    regIndex++;
                  }
                }

                /*Read in the register*/
                re = new RegExp("([^a-zA-Z0-9])" + architecture.components[i].elements[j].name + "(?!\.name)");
                while(auxDef.search(re) != -1){
                  var match = re.exec(auxDef);
                  auxDef = auxDef.replace(re, match[1] + "this.readRegister("+i+" ,"+j+")");
                }

                if(architecture.components[i].type == "integer"){
                  re = new RegExp("R"+regNum+"[^0-9]|[\\s]","g");
                  if(auxDef.search(re) != -1){
                    re = new RegExp("R"+regNum,"g");
                    auxDef = auxDef.replace(re, "this.readRegister("+i+" ,"+j+")");
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
              auxDef = auxDef + "\n\nif('"+args[0]+"'=='"+args[1]+"'){\n\tif(("+args[2]+") != architecture.memory_layout[4].value){\n\t\tthis.writeStackLimit("+args[2]+")\n\t}\n}";
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
            re = /MP.([whb]).\[(.*?)\] *=/;
            while (auxDef.search(re) != -1){
              var match = re.exec(auxDef);
              var auxDir;
              //eval("auxDir="+match[2]);

              re = /MP.[whb].\[(.*?)\] *=/;
              auxDef = auxDef.replace(re, "dir=");
              auxDef = "var dir=null\n" + auxDef;
              auxDef = auxDef + "\n this.writeMemory(dir"+","+match[2]+",'"+match[1]+"');"
              re = /MP.([whb]).\[(.*?)\] *=/;
            }

            re = new RegExp("MP.([whb]).(.*?) *=");
            while (auxDef.search(re) != -1){
              var match = re.exec(auxDef);
              re = new RegExp("MP."+match[1]+"."+match[2]+" *=");
              auxDef = auxDef.replace(re, "dir=");
              auxDef = "var dir=null\n" + auxDef;
              auxDef = auxDef + "\n this.writeMemory(dir,"+match[2]+",'"+match[1]+"');"
              re = new RegExp("MP.([whb]).(.*?) *=");
            }

            re = /MP.([whb]).\[(.*?)\]/;
            while (auxDef.search(re) != -1){
              var match = re.exec(auxDef);
              var auxDir;
              //eval("auxDir="+match[2]);
              re = /MP.[whb].\[(.*?)\]/;
              auxDef = auxDef.replace(re, "this.readMemory("+match[2]+", '"+match[1]+"')");
              re = /MP.([whb]).\[(.*?)\]/;
            }

            re = new RegExp("MP.([whb]).([0-9]*[a-z]*[0-9]*)");
            while (auxDef.search(re) != -1){
              var match = re.exec(auxDef);
              re = new RegExp("MP."+match[1]+"."+match[2]);
              auxDef = auxDef.replace(re, "this.readMemory("+match[2]+",'"+match[1]+"')");
              re = new RegExp("MP.([whb]).([0-9]*[a-z]*[0-9]*)");
            }

            console_log(auxDef);

            // preload instruction
            eval("instructions[" + executionIndex + "].preload = function(elto) { " + auxDef.replace(/this./g,"elto.") + " }; ") ;
          }

          try{
            instructions[executionIndex].preload(this);
            //eval(auxDef);
          }
          catch(e){
            if (e instanceof SyntaxError) {
              console_log("Error");
              error = 1;
              instructions[executionIndex]._rowVariant = 'danger';
              executionIndex = -1;
              show_notification('The definition of the instruction contains errors, please review it', 'danger') ;
              return;
            }
          }

          /*Refresh stats*/
          for (var i = 0; i < stats.length; i++){
            if(type == stats[i].type){
              stats[i].number_instructions++;
              totalStats++;
            }
          }
          for (var i = 0; i < stats.length; i++){
            stats[i].percentage = (stats[i].number_instructions/totalStats)*100;
          }

          /*Execution error*/
          if(executionIndex == -1){
            error = 1;
            return;
          }

          /*Next instruction to execute*/
          if(error != 1 && executionIndex < instructions.length){
            for (var i = 0; i < instructions.length; i++){
              if(parseInt(instructions[i].Address, 16) == architecture.components[0].elements[0].value){
                executionIndex = i;
                instructions[executionIndex]._rowVariant = 'success';
                break;
              }
              else if(i == instructions.length-1 && mutexRead == true){
                executionIndex = instructions.length+1;
              }
              else if(i == instructions.length-1){
                instructions[executionIndex]._rowVariant = '';
                executionIndex = instructions.length+1;
              }
            }
          }

          console_log(executionIndex);

          if(executionIndex >= instructions.length && mutexRead == true){
            /*for (var i = 0; i < instructions.length; i++){
              instructions[i]._rowVariant = '';
            }*/
            return;
          }
          else if(executionIndex >= instructions.length && mutexRead == false){
            for (var i = 0; i < instructions.length; i++){
              instructions[i]._rowVariant = '';
            }

            executionIndex = -2;
            show_notification('The execution of the program has finished', 'success') ;
            return;
          }
          else{
            if(error != 1){
              instructions[executionIndex]._rowVariant = 'success';
            }
          }
          console_log(executionIndex);
        }
        while(instructions[executionIndex].hide == true);
      },

      /*Execute all program*/
      executeProgram(but)
      {
        app._data.runExecution = true;
        this.runExecution = false;

        if(instructions.length == 0){
          show_notification('No instructions in memory', 'danger') ;
          return;
        }

        if(executionIndex < -1){
          show_notification('The program has finished', 'danger') ;
          return;
        }
        else if(executionIndex == -1){
          show_notification('The program has finished with errors', 'danger') ;
          return;
        }

        $("#stopExecution").show();
        $("#playExecution").hide();

        this.programExecutionInst(but);
      },

      programExecutionInst(but)
      {
        for (var i=0; (i<app._data.instructionsPacked) && (executionIndex >= 0); i++)
	{
          if(mutexRead == true){
            iter1 = 1;
            $("#stopExecution").hide();
            $("#playExecution").show();
            return;
          }
          else if(instructions[executionIndex].Break == true && iter1 == 0){
            iter1 = 1;
            $("#stopExecution").hide();
            $("#playExecution").show();
            return;
          }
          else if(this.runExecution == true){
            app._data.runExecution = false;
            iter1 = 1;
            $("#stopExecution").hide();
            $("#playExecution").show();
            return;
          }
          else if(but == true && i == 0){
            app._data.resetBut = false;
          }
          else if(this.resetBut == true){
            app._data.resetBut = false;

            $("#stopExecution").hide();
            $("#playExecution").show();
            return;
          }
          else{
            this.executeInstruction();
            iter1 = 0;
          }
        }

        if(executionIndex >= 0){
          setTimeout(this.programExecutionInst, 15);
        }
        else{
          $("#stopExecution").hide();
          $("#playExecution").show();
        }
      },

      /*Stop program excution*/
      stopExecution(){
        app._data.runExecution = true;
      },

      /*Read register value*/
      readRegister(indexComp, indexElem){
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
        
      },
      /*Write value in register*/
      writeRegister(value, indexComp, indexElem){
        if(value == null){
          return;
        }

        if(architecture.components[indexComp].type == "integer" || architecture.components[indexComp].type == "control"){
          if(architecture.components[indexComp].elements[indexElem].properties[0] != "write" && architecture.components[indexComp].elements[indexElem].properties[1] != "write"){
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

        else if(architecture.components[indexComp].type =="floating point"){
          if(architecture.components[indexComp].double_precision == false){
            if(architecture.components[indexComp].elements[indexElem].properties[0] != "write" && architecture.components[indexComp].elements[indexElem].properties[1] != "write"){
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
          
          else if(architecture.components[indexComp].double_precision == true){
            if (architecture.components[indexComp].elements[indexElem].properties[0] != "write" && architecture.components[indexComp].elements[indexElem].properties[1] != "write"){
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
      },
      /*Read memory value*/
      readMemory(addr, type){
        var memValue = '';
        var index;

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
      },
      /*Write value in memory*/
      writeMemory(value, addr, type){

        if(value == null){
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
                memory[index][i].Value = parseInt(memValue, 16);
                var charIndex = memValue.length-1;
                for (var z = 0; z < memory[index][i].Binary.length; z++){
                  memory[index][i].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                  charIndex = charIndex - 2;
                }
                memory[index][i].Value = parseInt(memValue, 16);
                app._data.memory[index] = memory[index];
                return;
              }
            }
          }

          for (var i = 0; i < memory[index].length; i++){
            if(memory[index][i].Address > parseInt(addr, 16)){
              var aux_addr = parseInt(addr, 16) - (parseInt(addr, 16)%4);
              memory[index].splice(i, 0, {Address: aux_addr, Binary: [], Value: parseInt(memValue, 16), DefValue: null, reset: false});
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
              memory[index].push({Address: aux_addr, Binary: [], Value: parseInt(memValue, 16), DefValue: null, reset: false});
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
            memory[index].push({Address: aux_addr, Binary: [], Value: parseInt(memValue, 16), DefValue: null, reset: false});
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
                    memory[index][i].Value = memory[index][i].Value + parseInt((memory[index][i].Binary[z].Bin + memory[index][i].Binary[z-1].Bin), 16) + " ";
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
                    memory[index][i].Value = "0 " + parseInt(memValue, 16); 
                    app._data.memory[index] = memory[index];
                    return;
                  }
                  else{
                    var charIndex = memValue.length-1;
                    for (var z = 2; z < memory[index][i].Binary.length; z++){
                      memory[index][i].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                      charIndex = charIndex - 2;
                    }
                    memory[index][i].Value = parseInt(memValue, 16) + " 0";    
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
                    memory[index][i+1].Value = "0 " + parseInt(memValue, 16); 
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
                  memory[index][memory[index].length-1].Value = "0 " + parseInt(memValue, 16); 
                  app._data.memory[index] = memory[index];
                  return;
                }
                else{
                  var charIndex = memValue.length-1;
                  for (var z = 2; z < memory[index][i].Binary.length; z++){
                    memory[index][memory[index].length-1].Binary[z].Bin = memValue.charAt(charIndex-1).toUpperCase()+memValue.charAt(charIndex).toUpperCase();
                    charIndex = charIndex - 2;
                  }
                  memory[index][memory[index].length-1].Value = parseInt(memValue, 16) + " 0"; 
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
      },
      /*Modify the stack limit*/
      writeStackLimit(stackLimit){
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
      },
      /*Syscall*/
      syscall(action, indexComp, indexElem, indexComp2, indexElem2){
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
              this.writeRegister(value, indexComp, indexElem);
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
              this.writeRegister(value, indexComp, indexElem);
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
              this.writeRegister(value, indexComp, indexElem);
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
              this.writeRegister(value, indexComp, indexElem);
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
      },
      /*Exception Notification*/
      exception(error){
        show_notification("There is been an exception. Error description: '" + error, 'danger') ;
        instructions[executionIndex]._rowVariant = 'danger';
        executionIndex = -1;
        return;
      },
      /*Divides a double into two parts*/
      divDouble(reg, index){
            var value = bin2hex(double2bin(reg));
            console_log(value);
            if(index == 0){
              return "0x" + value.substring(0,8);
            }
            if(index == 1) {
              return "0x" + value.substring(8,16);
            }
      },

      /*Reset execution*/
      reset(){
        show_loading();
        setTimeout(function(){
          app._data.resetBut = true;
          for (var i = 0; i < instructions.length; i++) {
            instructions[i]._rowVariant = '';
          }
          executionIndex = 0;
          
          /*Reset stats*/
          totalStats=0;
          for (var i = 0; i < stats.length; i++){
            stats[i].percentage = 0;
            stats[i].number_instructions = 0;
          }

          /*Reset console*/
          app._data.keyboard = "";
          app._data.display = "";
          mutexRead = false;
          app._data.enter = null;
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
                      aux_sim1 = bin2hex(float2bin(architecture.components[a].elements[b].default_value));
                    }
                    if(architecture.components[a].elements[b].name == architecture.components[i].elements[j].simple_reg[1]){
                      aux_sim2 = bin2hex(float2bin(architecture.components[a].elements[b].default_value));
                    }
                  }
                }

                aux_value = aux_sim1 + aux_sim2;
                architecture.components[i].elements[j].value = hex2double("0x" + aux_value);
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

          hide_loading();
        }, 25);
      },
      /*Enter a breakpoint*/
      breakPoint(record, index){
        for (var i = 0; i < instructions.length; i++) {
          if(instructions[i].Address == record.Address){
            index = i;
            break;
          }
        }

        if(instructions[index].Break == null){
          instructions[index].Break = true;
          app._data.instructions[index].Break = true;
        }
        else if(instructions[index].Break == true){
          instructions[index].Break = null;
          app._data.instructions[index].Break = null;
        }
      },
      /*Console mutex*/
      consoleEnter(){
        if(this.keyboard != ""){
          consoleMutex = true;
        }
      },
      /*Empty keyboard and display*/
      consoleClear(){
        this.keyboard = "";
        this.display = "";
      },
      /*Convert hexadecimal number to floating point number*/
      hex2float ( hexvalue ){
        /*var sign     = (hexvalue & 0x80000000) ? -1 : 1;
        var exponent = ((hexvalue >> 23) & 0xff) - 127;
        var mantissa = 1 + ((hexvalue & 0x7fffff) / 0x800000);

        var valuef = sign * mantissa * Math.pow(2, exponent);
        if (-127 == exponent)
          if (1 == mantissa)
            valuef = (sign == 1) ? "+0" : "-0";
          else valuef = sign * ((hexvalue & 0x7fffff) / 0x7fffff) * Math.pow(2, -126);
        if (128 == exponent)
          if (1 == mantissa)
            valuef = (sign == 1) ? "+Inf" : "-Inf";
          else valuef = NaN;

        return valuef ;*/
        var value = hexvalue.split('x');
        var value_bit = '';

        for (var i = 0; i < value[1].length; i++){
          var aux = value[1].charAt(i);
          aux = (parseInt(aux, 16)).toString(2).padStart(4, "0");
          value_bit = value_bit + aux;
        }

        var buffer = new ArrayBuffer(4);
        new Uint8Array( buffer ).set( value_bit.match(/.{8}/g).map( binaryStringToInt ) );
        return new DataView( buffer ).getFloat32(0, false);
      },
      /*Convert hexadecimal number to char*/
      hex2char8 ( hexvalue ){
        var num_char = ((hexvalue.toString().length))/2;
        var exponent = 0;
        var pos = 0;

        var valuec = new Array();

        for (var i = 0; i < num_char; i++) {
          var auxHex = hexvalue.substring(pos, pos+2);
          valuec[i] = String.fromCharCode(parseInt(auxHex, 16));
          pos = pos + 2;
        }

        var characters = '';

        for (var i = 0; i < valuec.length; i++){
          characters = characters + valuec[i] + ' ';
        }

        return  characters;
      },

      /*Convert hexadecimal number to char*/
      bin2hex ( value ){
         return bin2hex(value) ;
      },
      hex2double ( value ){
         return hex2double(value) ;
      },
      float2bin ( value ){
         return float2bin(value) ;
      },
      double2bin ( value ){
         return double2bin(value) ;
      },

      /*Modifies double precision registers according to simple precision registers*/
      updateDouble(comp, elem){
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
      },
      /*Modifies single precision registers according to double precision registers*/
      updateSimple(comp, elem){
        var part1 = bin2hex(double2bin(architecture.components[comp].elements[elem].value)).substr(0, 8);
        var part2 = bin2hex(double2bin(architecture.components[comp].elements[elem].value)).substr(8, 15);

        for (var j = 0; j < architecture.components.length; j++) {
          for (var z = 0; z < architecture.components[j].elements.length; z++) {
            if(architecture.components[j].elements[z].name == architecture.components[comp].elements[elem].simple_reg[0]){
              architecture.components[j].elements[z].value = this.hex2float("0x"+part1);
            }
            if(architecture.components[j].elements[z].name == architecture.components[comp].elements[elem].simple_reg[1]){
              architecture.components[j].elements[z].value = this.hex2float("0x"+part2);
            }
          }
        }
      },
      /*Filter table instructions*/
      filter(row, filter){
        if(row.hide == true){
          return false;
        }
        else{
          return true;
        }
      },
      /*Popover functions*/
      popoverId(i){
        return 'popoverValueContent' + i;
      },
      closePopover(){
        this.$root.$emit('bv::hide::popover')
      },
      /*Show integer registers*/
      change_data_view(e, type){

        app._data.data_mode = e;

        if (e == "registers")
	{
          app._data.register_type = type;
          if(type == "integer"){
            app._data.nameTabReg = "Decimal";
            app._data.nameReg    = 'INT Registers';
          }
          else if(type == "floating point"){
            app._data.nameTabReg = "Real";
            app._data.nameReg    = 'FP Registers';
          }
        }

        if (e == "memory"){
          app._data.data_mode = "stats";
          setTimeout(function(){
            app.$forceUpdate();
            app._data.data_mode = e;
          }, 10);
        }

        app.$forceUpdate();
      },
      change_popover_register(e){
        app._data.register_popover = e;
        app.$forceUpdate();
      },
      /*Stop user interface refresh*/
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
  });



  /*************
   * Functions *
   *************/

  /*All modules*/

  /*Error handler*/
  Vue.config.errorHandler = function (err, vm, info) {
      show_notification('An error has ocurred, the simulator is going to restart.  \n Error: ' + err, 'danger') ;
      setTimeout(function(){
        location.reload(true)
      }, 3000);
  }

  /*Closing alert*/
  window.onbeforeunload = confirmExit;
  function confirmExit(){
    return "He's tried to get off this page. Changes may not be saved.";
  }

  /*Determines the refresh timeout depending on the device being used*/
  function getDebounceTime(){
    if(screen.width > 768){
      return 500;
    }
    else{
      return 1000;
    }
  }
  /*Stop the transmission of events to children*/
  function destroyClickedElement(event) {
    document.body.removeChild(event.target);
  }

  /*Architecture editor*/


  /*Codemirror*/
  function codemirrorStart(){
    var editor_cfg = {
      lineNumbers: true,
      autoRefresh:true
    };

    var textarea_assembly_obj = document.getElementById("textarea_assembly");

    if(textarea_assembly_obj != null){
      textarea_assembly_editor = CodeMirror.fromTextArea(textarea_assembly_obj, editor_cfg);
      textarea_assembly_editor.setOption('keyMap', 'sublime') ; // vim -> 'vim', 'emacs', 'sublime', ...
      textarea_assembly_editor.setValue(app._data.assembly_code);
      textarea_assembly_editor.setSize("auto", "550px");

      // add Ctrl-m
      /*var map = {
        'Ctrl-m': function(cm) { cm.execCommand('toggleComment'); }
      } ;
      textarea_assembly_editor.addKeyMap(map);*/
    }
  }



  /*Simulator*/

  /*Binary string to integer number*/
  function binaryStringToInt( b ) {
    return parseInt(b, 2);
  }
}
catch(e)
{
   show_notification('An error has ocurred, the simulator is going to restart.  \n Error: ' + e, 'danger') ;

   setTimeout(function(){
     location.reload(true)
   }, 3000);
}
