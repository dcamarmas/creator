/*
 *  Copyright 2018-2021 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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
 * Execution
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
			for (var i = 0; i < instructions.length; i++)
                        {
				if (instructions[i].Label == "main") {
					//draw.success.push(executionIndex) ;
					architecture.components[0].elements[0].value = bi_intToBigInt(instructions[i].Address, 10);
					executionInit = 0;
					break;
				}
				else if (i == instructions.length-1) {
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

					console_log(instructions[executionIndex].hide);
					console_log(executionIndex);
					console_log(instructions[i].Address);

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

		var binary;
		var auxIndex; //TODO: probar que sigue igual
		var nwords;
		var auxDef;
		var type;

		//Search the instruction to execute
		//TODO: move the instruction identification to the compiler stage, binary not
		for (var i = 0; i < architecture.instructions.length; i++) {
			var auxSig = architecture.instructions[i].signatureRaw.split(' ');

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
							if (architecture.instructions[i].fields[j].valueField == instructionExecParts[0].substring(((architecture.instructions[i].nwords*31) - architecture.instructions[i].fields[j].startbit), ((architecture.instructions[i].nwords*32) - architecture.instructions[i].fields[j].stopbit))) {
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

			if (architecture.instructions[i].name == instructionExecParts[0] && instructionExecParts.length == auxSig.length)
                        {
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
		//END TODO

		/*Increase PC*/
		//TODO: other register
		architecture.components[0].elements[0].value = architecture.components[0].elements[0].value + bi_intToBigInt(nwords * 4,10) ;
		console_log(auxDef);


		// preload
		if (typeof instructions[executionIndex].preload === "undefined")
		{
			//writeRegister and readRegister
			var readings_description = "";
			var writings_description = "";

			if (binary == true) {
				auxDef = execute_binary(auxIndex, instructionExecParts, auxDef);
			}
			else{
				//TODO: move to the compilation stage
				re = new RegExp(signatureDef+"$");
				var match = re.exec(instructionExec);
				instructionExecParts = [];

				for(var j = 1; j < match.length; j++){
					instructionExecParts.push(match[j]);
				}
				//END TODO

				console_log(instructionExecParts);

				var var_readings_definitions      = {};
				var var_readings_definitions_prev = {};
				var var_readings_definitions_name = {};
				var var_writings_definitions      = {};

				//Generate all registers, values, etc. readings
				for (var i = 1; i < signatureRawParts.length; i++)
				{
					if (signatureParts[i] == "INT-Reg" || signatureParts[i] == "SFP-Reg" || signatureParts[i] == "DFP-Reg" || signatureParts[i] == "Ctrl-Reg")
					{
						for (var j = 0; j < architecture.components.length; j++)
						{
							for (var z = architecture.components[j].elements.length-1; z >= 0; z--)
							{
								if (architecture.components[j].elements[z].name.includes(instructionExecParts[i]))
								{
									var_readings_definitions[signatureRawParts[i]]      = "var " + signatureRawParts[i] + "      = readRegister ("+j+" ,"+z+");\n";
									var_readings_definitions_prev[signatureRawParts[i]] = "var " + signatureRawParts[i] + "_prev = readRegister ("+j+" ,"+z+");\n";
									var_readings_definitions_name[signatureRawParts[i]] = "var " + signatureRawParts[i] + "_name = '" + instructionExecParts[i] + "';\n";

									re = new RegExp( "(?:\\W|^)(((" + signatureRawParts[i] +") *=)[^=])", "g");
									//If the register is in the left hand than '=' then write register always
									if(auxDef.search(re) != -1){
										var_writings_definitions[signatureRawParts[i]]  = "writeRegister("+ signatureRawParts[i] +", "+j+", "+z+");\n";
									}
									//Write register only if value is diferent
									else{
										var_writings_definitions[signatureRawParts[i]]  = "if(" + signatureRawParts[i] + " != " + signatureRawParts[i] + "_prev)" +
											                                          " { writeRegister("+ signatureRawParts[i]+" ,"+j+" ,"+z+"); }\n";
									}

								}
							}
						}
					}
					else{
						var_readings_definitions[signatureRawParts[i]] = "var " + signatureRawParts[i] + " = " + instructionExecParts[i] + ";\n";
					}
				}

				for (var elto in var_readings_definitions){
				     readings_description = readings_description + var_readings_definitions[elto];
				}
				for (var elto in var_readings_definitions_prev){
				     readings_description = readings_description + var_readings_definitions_prev[elto];
				}
				for (var elto in var_readings_definitions_name){
				     readings_description = readings_description + var_readings_definitions_name[elto];
				}
				for (var elto in var_writings_definitions){
				     writings_description = writings_description + var_writings_definitions[elto];
				}
			}

			/* writeRegister and readRegister direcly named include into the definition */
			for (var i = 0; i < architecture.components.length; i++)
			{
				for (var j = architecture.components[i].elements.length-1; j >= 0; j--)
				{
					var clean_name = clean_string(architecture.components[i].elements[j].name[0], 'reg_');
					var clean_aliases = architecture.components[i].elements[j].name.map((x)=> clean_string(x, 'reg_')).join('|');

					re = new RegExp( "(?:\\W|^)(((" + clean_aliases +") *=)[^=])", "g");
					if (auxDef.search(re) != -1){
					    writings_description = writings_description+"\nwriteRegister("+ clean_name +", "+i+", "+j+");";
					}

					re = new RegExp("([^a-zA-Z0-9])(?:" + clean_aliases + ")");
					if (auxDef.search(re) != -1){
					    readings_description = readings_description + "var " + clean_name + "      = readRegister("+i+" ,"+j+");\n";
					    readings_description = readings_description + "var " + clean_name + "_name = '" + clean_name + "';\n";
					}
				}
			}

			auxDef = "\n/* Read all instruction fields */\n" +
					readings_description +
			         "\n/* Original instruction definition */\n" +
			         	auxDef +
			         "\n\n/* Modify values */\n" +
			         	writings_description;

			// DEBUG
			console_log(" ................................. " +
			            "instructions[" + executionIndex + "]:\n" +
			            auxDef + "\n" +
			            " ................................. ");

			// preload instruction
			eval("instructions[" + executionIndex + "].preload = function(elto) { " +
			     "   try {\n" +
			 	   auxDef.replace(/this./g,"elto.") + "\n" +
			     "   }\n" +
			     "   catch(e){\n" +
			     "     throw e;\n" +
			     "   }\n" +
			     "}; ") ;
		}


		try {
			var result = instructions[executionIndex].preload(this);
			if ( (typeof result != "undefined") && (result.error) ) {
			      return result;
			}
		}
		catch ( e )
		{
                        var msg = '' ;
			if (e instanceof SyntaxError)
			     msg = 'The definition of the instruction contains errors, please review it' ;
			else msg = 'Exception on executing instruction "'+ executionIndex + '": ' + e + '\n' +
				   ' Stack trace: ' + e.stack + '\n' ;

			console_log("Error: " + e);
			error = 1;
			draw.danger.push(executionIndex) ;
			executionIndex = -1;

			return packExecute(true, msg, 'danger', null) ;
		}

	        /* Refresh stats */
                stats_update(type) ;

		/* Execution error */
		if (executionIndex == -1){
			 error = 1;
			 return packExecute(false, '', 'info', null); //CHECK
		}

		/* Next instruction to execute */
		if (error != 1 && executionIndex < instructions.length)
		{
			for (var i = 0; i < instructions.length; i++)
                        {
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
			if (error != 1) {
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

	/* Google Analytics */
	creator_ga('execute', 'execute.run');

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


/*
 * Auxiliar functions
 */

function crex_show_notification ( msg, level )
{
    if (typeof window !== "undefined")
         show_notification(msg, level);
    else console.log(level.toUpperCase() + ": " + msg);
}

function crex_findReg ( value1 )
{
    var ret = {} ;

    ret.match = 0;
    ret.compIndex = null;
    ret.elemIndex = null;

    if (value1 == "") {
        return ret;
    }

    for (var i = 0; i < architecture.components.length; i++)
    {
         for (var j = 0; j < architecture.components[i].elements.length; j++)
         {
              if (architecture.components[i].elements[j].name.includes(value1) != false)
              {
                  ret.match = 1;
                  ret.compIndex = i;
                  ret.elemIndex = j;
                  break ;
              }
         }
    }

    return ret ;
}

function crex_type2size ( type )
{
    var size = 4;

    switch (type)
    {
        case 'b':
        case 'bu':
        case 'byte':
             size = 1;
             break;

        case 'h':
        case 'hu':
        case 'half':
             size = 2;
             break;

        case 'w':
        case 'wu':
        case 'word':
             size = 4;
             break;

        case 'd':
        case 'du':
        case 'double':
             size = 8;
             break;
    }

    return size ;
}

function crex_value_by_type ( val, type )
{
    switch (type)
    {
        case 'b':
	     val = val & 0xFF ;
	     if (val & 0x80)
	         val = 0xFFFFFF00 | val ;
	     break;

        case 'bu':
	     val = ((val << 24) >> 24) ;
	     break;

        case 'h':
	     val = val & 0xFFFF ;
	     if (val & 0x8000)
	         val = 0xFFFF0000 | val ;
	     break;

        case 'hu':
	     val = ((val << 16) >> 16) ;
	     break;

        default:
	     break;
    }

    return val ;
}

function crex_replace_magic ( auxDef )
{
	// Before replace...
	console_log("Before replace: \n" + auxDef + "\n");

	/* Write in memory */
	var index = 0;
	re = /MP.([whbd]).\[(.*?)\] *=/;
	while (auxDef.search(re) != -1){
		index++;
		var match = re.exec(auxDef);
		var auxDir;
		//eval("auxDir="+match[2]);

		re = /MP.[whbd].\[(.*?)\] *=/;
		auxDef = auxDef.replace(re, "dir" + index + "=");
		auxDef = "var dir" + index + " = null;\n" + auxDef;

		auxDef = auxDef + "\n writeMemory(dir" + index +","+match[2]+",'"+match[1]+"');";
		re = /MP.([whb]).\[(.*?)\] *=/;
	}

	re = new RegExp("MP.([whbd]).(.*?) *=");
	while (auxDef.search(re) != -1){
		index++;
		var match = re.exec(auxDef);
		re = new RegExp("MP."+match[1]+"."+match[2]+" *=");
		auxDef = auxDef.replace(re, "dir" + index + " =");
		auxDef = "var dir" + index + " = null;\n" + auxDef;

		auxDef = auxDef + "\n writeMemory(dir" + index +","+match[2]+",'"+match[1]+"');";
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

	/* After replace... */
	console_log("After replace: \n" + auxDef + "\n");

	return auxDef ;
}


/*
 * Stats
 */

function stats_update ( type )
{
	for (var i = 0; i < stats.length; i++)
	{
		if (type == stats[i].type)
		{
			stats[i].number_instructions++;
			stats_value[i] ++;

			totalStats++;
			if (typeof app !== "undefined") {
			    app._data.totalStats++;
                        }
		}
	}

	for (var i = 0; i < stats.length; i++){
	     stats[i].percentage = ((stats[i].number_instructions/totalStats)*100).toFixed(2);
	}
}

function stats_reset ( )
{
	totalStats = 0 ;
	if (typeof app !== "undefined") {
	    app._data.totalStats = 0 ;
        }

	for (var i = 0; i < stats.length; i++)
        {
		stats[i].percentage = 0;

		stats[i].number_instructions = 0;
		stats_value[i] = 0;
	}
}


/*
 * Read/write register
 */

function readRegister ( indexComp, indexElem )
{
	var draw = {
		space: [] ,
		info: [] ,
		success: [] ,
		danger: [],
		flash: []
	} ;

	if ((architecture.components[indexComp].elements[indexElem].properties.includes("read") != true))
	{
		for (var i = 0; i < instructions.length; i++) {
			draw.space.push(i);
		}
		draw.danger.push(executionIndex);
		executionIndex = -1;

		throw packExecute(true, 'The register '+ architecture.components[indexComp].elements[indexElem].name.join(' | ') +' cannot be read', 'danger', draw);
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
			if ((architecture.components[indexComp].elements[indexElem].properties.includes('write') != true))
			{
				if ((architecture.components[indexComp].elements[indexElem].properties.includes('ignore_write') != false)){
					return;
				}

				for (var i = 0; i < instructions.length; i++) {
				     draw.space.push(i);
				}
				draw.danger.push(executionIndex);

				executionIndex = -1;
				throw packExecute(true, 'The register '+ architecture.components[indexComp].elements[indexElem].name.join(' | ') +' cannot be written', 'danger', draw);
			}

			architecture.components[indexComp].elements[indexElem].value = bi_intToBigInt(value,10);
			creator_callstack_writeRegister(indexComp, indexElem);

			if ((architecture.components[indexComp].elements[indexElem].properties.includes('pointer') != false) &&
					(architecture.components[indexComp].elements[indexElem].properties.includes('stack') != false)   &&
					(value != architecture.memory_layout[4].value)) {
						writeStackLimit(value);
			}

			if (typeof window !== "undefined") {
                            btn_int_glow(architecture.components[indexComp].elements[indexElem].name) ;
			}
	}

	else if (architecture.components[indexComp].type =="floating point")
	{
		if (architecture.components[indexComp].double_precision == false)
		{
			if ((architecture.components[indexComp].elements[indexElem].properties.includes('write') != true))
			{
				if ((architecture.components[indexComp].elements[indexElem].properties.includes('ignore_write') != false)){
					return;
				}
				throw packExecute(true, 'The register '+ architecture.components[indexComp].elements[indexElem].name.join(' | ') +' cannot be written', 'danger', null);
			}

			architecture.components[indexComp].elements[indexElem].value = parseFloat(value);
			creator_callstack_writeRegister(indexComp, indexElem);

			if ((architecture.components[indexComp].elements[indexElem].properties.includes('pointer') != false) &&
					(architecture.components[indexComp].elements[indexElem].properties.includes('stack') != false)   &&
					(value != architecture.memory_layout[4].value)) {
						writeStackLimit(value);
			}

			updateDouble(indexComp, indexElem);

			if (typeof window !== "undefined") {
                            btn_fp_glow(architecture.components[indexComp].elements[indexElem].name, "FP") ;
			}
		}

		else if (architecture.components[indexComp].double_precision == true)
		{
			if ((architecture.components[indexComp].elements[indexElem].properties.includes('write') != true))
			{
				if ((architecture.components[indexComp].elements[indexElem].properties.includes('ignore_write') != false)){
					return;
				}
				throw packExecute(true, 'The register '+ architecture.components[indexComp].elements[indexElem].name.join(' | ') +' cannot be written', 'danger', null);
			}

			architecture.components[indexComp].elements[indexElem].value = parseFloat(value);
			updateSimple(indexComp, indexElem);
			creator_callstack_writeRegister(indexComp, indexElem);

			if (typeof window !== "undefined") {
                            btn_fp_glow(architecture.components[indexComp].elements[indexElem].name, "DFP") ;
	                }
		}
	}
}


/*
 * Read/write memory
 */

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
				// debugger;
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

/* Write value in memory */
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
						for (var z=3; (z<4) && (z>=0); z=z-2){
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
					for (var z=3; (z<4) && (z>=0); z--){
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

/* Modify the stack limit */
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
				throw packExecute(true, 'Segmentation fault. You tried to read in the data segment', 'danger', null);
			}
			else if(stackLimit <= architecture.memory_layout[1].value && stackLimit >= architecture.memory_layout[0].value){
				draw.danger.push(executionIndex);
				executionIndex = -1;
				throw packExecute(true, 'Segmentation fault. You tried to read in the text segment', 'danger', null);
			}
			else{
				var diff = memory[memory_hash[2]][0].Address - stackLimit;
				var auxStackLimit = stackLimit;
				var newRow = 0;

				for (var i = 0; i < (diff/4); i++){
					memory[memory_hash[2]].splice(newRow, 0,{Address: auxStackLimit, Binary: [], Value: null, DefValue: null, reset: true});
					for (var z = 0; z < 4; z++){
						(memory[memory_hash[2]][newRow].Binary).push({Addr: auxStackLimit, DefBin: "00", Bin: "00", Tag: null},);
						auxStackLimit++;
					}
					newRow++;
				}

				track_stack_setsp(stackLimit);

				architecture.memory_layout[4].value = stackLimit;

			}
		}
}


/* I/O */
function display_print ( info )
{
	if (typeof app !== "undefined")
             app._data.display += info ;
	else process.stdout.write(info + '\n') ;

	display += info ;
}


function kbd_read_char ( keystroke, indexComp, indexElem )
{
        var value = keystroke.charCodeAt(0);
	writeRegister(value, indexComp, indexElem);

	return value ;
}

function kbd_read_int ( keystroke, indexComp, indexElem )
{
	var value = parseInt(keystroke) ;
	writeRegister(value, indexComp, indexElem);

	return value ;
}

function kbd_read_float ( keystroke, indexComp, indexElem )
{
	var value = parseFloat(keystroke, 10) ;
	writeRegister(value, indexComp, indexElem);

	return value ;
}

function kbd_read_double ( keystroke, indexComp, indexElem )
{
	var value = parseFloat(keystroke, 10) ;
	writeRegister(value, indexComp, indexElem);

	return value ;
}


function keyboard_read ( fn_post_read, indexComp, indexElem )
{
	var draw = {
		space: [] ,
		info: [] ,
		success: [] ,
		danger: [],
		flash: []
	} ;

	// CL
	if (typeof app === "undefined")
	{
		 var readlineSync = require('readline-sync') ;
		 var keystroke    = readlineSync.question(' > ') ;

		 var value = fn_post_read(keystroke, indexComp, indexElem) ;
	         keyboard = keyboard + " " + value;

	         return packExecute(false, 'The data has been uploaded', 'danger', null);
	}

	// UI
	mutexRead = true;
	app._data.enter = false;
	console_log(mutexRead);

	if (newExecution == true)
        {
		 app._data.keyboard = "";
		 consoleMutex    = false;
		 mutexRead       = false;
		 app._data.enter = null;

		 show_notification('The data has been uploaded', 'info') ;

		 if (runProgram == false){
		     app.executeProgram();
		 }

		 return;
	 }

	if (consoleMutex == false) {
	    setTimeout(keyboard_read, 1000, fn_post_read, indexComp, indexElem);
	    return;
	}

	fn_post_read(app._data.keyboard, indexComp, indexElem) ;

	app._data.keyboard = "";
	consoleMutex    = false;
	mutexRead       = false;
	app._data.enter = null;

	show_notification('The data has been uploaded', 'info') ;

	console_log(mutexRead);

	if (executionIndex >= instructions.length)
	{
		for (var i = 0; i < instructions.length; i++){
		     draw.space.push(i) ;
		}

		executionIndex = -2;
		return packExecute(true, 'The execution of the program has finished', 'success', null);
	}

	if (runProgram == false) {
	    app.executeProgram();
	}
}


/* Syscalls */
function crex_sbrk ( new_size )
{
	var new_addr = 0 ;
	var aux_addr = architecture.memory_layout[3].value + 1 ;

	if ((architecture.memory_layout[3].value + new_size) >= architecture.memory_layout[4].value)
	{
		executionIndex = -1 ;
		return packExecute(true, 'Not enough memory for data segment', 'danger', null) ;
	}

	for (var i = 0; i < (new_size / 4); i++)
        {
		memory[memory_hash[0]].push({Address: aux_addr, Binary: [], Value: null, DefValue: null, reset: true}) ;

		if (i == 0) {
		    new_addr = aux_addr ;
		}

		for (var z = 0; z < 4; z++) {
		     (memory[memory_hash[0]][memory[memory_hash[0]].length-1].Binary).push({Addr: aux_addr, DefBin: "00", Bin: "00", Tag: null},) ;
		     aux_addr++ ;
		}
	}

	if (typeof app !== "undefined") {
	    app._data.memory[memory_hash[0]] = memory[memory_hash[0]] ;
	}

	architecture.memory_layout[3].value = aux_addr-1 ;

	if (typeof app !== "undefined") {
	    app.architecture.memory_layout[3].value = aux_addr-1 ;
	}

        return packExecute(false, '', 'danger', new_addr) ;
}

function crex_exit ( )
{
        executionIndex = instructions.length + 1;
}

function crex_get_string_from_memory ( addr )
{
	 var index   = 0 ;
	 var ret_msg = '' ;

	 if ((parseInt(addr) > architecture.memory_layout[0].value && parseInt(addr) < architecture.memory_layout[1].value) ||  parseInt(addr) == architecture.memory_layout[0].value || parseInt(addr) == architecture.memory_layout[1].value)
	 {
		 executionIndex = -1;
		 if (typeof app !== "undefined") {
		     app._data.keyboard = "";
		 }

		 return packExecute(true, 'Segmentation fault. You tried to write in the text segment', 'danger', null);
	 }

	 if ((parseInt(addr) > architecture.memory_layout[2].value && parseInt(addr) < architecture.memory_layout[3].value) ||  parseInt(addr) == architecture.memory_layout[2].value || parseInt(addr) == architecture.memory_layout[3].value){
		 index = memory_hash[0];
	 }

	 if ((parseInt(addr) > architecture.memory_layout[4].value && parseInt(addr) < architecture.memory_layout[5].value) ||  parseInt(addr) == architecture.memory_layout[4].value || parseInt(addr) == architecture.memory_layout[5].value){
		 index = memory_hash[2];
	 }

	for (var i = 0; i < memory[index].length; i++)
        {
		for (var j = 0; j < memory[index][i].Binary.length; j++)
                {
			var aux = "0x"+(memory[index][i].Binary[j].Addr).toString(16);
			if (aux == addr)
                        {
				for (var i; i < memory[index].length; i++)
                                {
					for (var k = j; k < memory[index][i].Binary.length; k++)
					{
						console_log(parseInt(memory[index][i].Binary[k].Bin, 16));
						console_log(String.fromCharCode(parseInt(memory[index][i].Binary[k].Bin, 16)));

						if (memory[index][i].Binary[k].Bin == "00") {
						    return packExecute(false, 'printed', 'info', ret_msg);
						}

						ret_msg += String.fromCharCode(parseInt(memory[index][i].Binary[k].Bin, 16));

						if (i == memory[index].length-1 && k == memory[index][i].Binary.length-1) {
						    return packExecute(false, 'printed', 'info', ret_msg);
						}

						j=0;
					}
				}
			}
		}
	}
}

function read_string ( indexComp, indexElem, indexComp2, indexElem2 )
{
	var draw = {
		space: [] ,
		info: [] ,
		success: [] ,
		danger: [],
		flash: []
	} ;

	// CL
	if (typeof app === "undefined")
	{
		var readlineSync = require('readline-sync') ;
		keystroke        = readlineSync.question(' $> ') ;

		var value = "";
		var neltos = architecture.components[indexComp2].elements[indexElem2].value ;
		for (var i = 0; (i < neltos) && (i < keystroke.length); i++) {
		     value = value + keystroke.charAt(i);
		}

		keyboard = keyboard + " " + value;

		var addr = architecture.components[indexComp].elements[indexElem].value ;
		var ret  = read_string_into_memory(keystroke, value, addr, 0, data_address) ;
		if (ret.status != 'ok') {
		    return ret ;
		}

		return packExecute(false, 'The data has been uploaded', 'danger', null);
	}

	// UI
	mutexRead = true;
	app._data.enter = false;
	console_log(mutexRead);

	if (newExecution == true)
	{
		app._data.keyboard = "";
		consoleMutex    = false;
		mutexRead       = false;
		app._data.enter = null;

		show_notification('The data has been uploaded', 'info') ;

		if (runProgram == false) {
		    app.executeProgram();
		}

		return;
	}

	if (consoleMutex == false) {
	    setTimeout(read_string, 1000, indexComp, indexElem, indexComp2, indexElem2);
	    return ;
	}

	var keystroke = '' ;
	keystroke = app.keyboard ;

	var value = "";
	var neltos = architecture.components[indexComp2].elements[indexElem2].value ;
	for (var i = 0;(i < neltos) && (i < keystroke.length); i++) {
	     value = value + keystroke.charAt(i);
	}

	console_log(value);

	var addr = architecture.components[indexComp].elements[indexElem].value ;
	var ret = read_string_into_memory(keystroke, value, addr, 0, data_address) ;
	if (ret.status != 'ok') {
	    return ret ;
	}

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

	if (runProgram == false){
		app.executeProgram();
	}
}


/*
 *  Execute binary
 */

function execute_binary ( index, instructionExecParts, auxDef )
{
	console_log("Binary");

	for (var j = 0; j < architecture.instructions[index].fields.length; j++){
		console_log(instructionExecParts[0]);
		console_log(architecture.instructions[index].fields.length);
		if(architecture.instructions[index].fields[j].type == "INT-Reg" || architecture.instructions[index].fields[j].type == "SFP-Reg" || architecture.instructions[index].fields[j].type == "DFP-Reg" || architecture.instructions[index].fields[j].type == "Ctrl-Reg") {
			console_log(instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit)));

			for (var z = 0; z < architecture.components.length; z++){
				console_log(architecture.components[z].type)
				if(architecture.components[z].type == "control" && architecture.instructions[index].fields[j].type == "Ctrl-Reg"){
					for (var w = 0; w < architecture.components[z].elements.length; w++){
						var auxLength = ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit) - ((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit);
						console_log(auxLength);
						console_log((w.toString(2)).padStart(auxLength, "0"));
						if((w.toString(2)).padStart(auxLength, "0") == instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit))){

						}
					}
				}
				if(architecture.components[z].type == "integer" && architecture.instructions[index].fields[j].type == "INT-Reg"){
					for (var w = 0; w < architecture.components[z].elements.length; w++){
						var auxLength = ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit) - ((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit);
						console_log(auxLength);
						console_log((w.toString(2)).padStart(auxLength, "0"));
						if((w.toString(2)).padStart(auxLength, "0") == instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit))){
							var re = new RegExp(architecture.instructions[index].fields[j].name,"g");
							auxDef = auxDef.replace(re, architecture.components[z].elements[w].name[0]);
						}
					}
				}
				if(architecture.components[z].type == "floating point" && architecture.components[z].double_precision == false && architecture.instructions[index].fields[j].type == "SFP-Reg"){
					for (var w = 0; w < architecture.components[z].elements.length; w++){
						var auxLength = ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit) - ((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit);
						console_log(auxLength);
						console_log((w.toString(2)).padStart(auxLength, "0"));
						if((w.toString(2)).padStart(auxLength, "0") == instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit))){
							var re = new RegExp(architecture.instructions[index].fields[j].name,"g");
							auxDef = auxDef.replace(re, architecture.components[z].elements[w].name[0]);
						}
					}
				}
				if(architecture.components[z].type == "floating point" && architecture.components[z].double_precision == true && architecture.instructions[index].fields[j].type == "DFP-Reg"){
					for (var w = 0; w < architecture.components[z].elements.length; w++){
						var auxLength = ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit) - ((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit);
						console_log(auxLength);
						console_log((w.toString(2)).padStart(auxLength, "0"));
						if((w.toString(2)).padStart(auxLength, "0") == instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit))){
							var re = new RegExp(architecture.instructions[index].fields[j].name,"g");
							auxDef = auxDef.replace(re, architecture.components[z].elements[w].name[0]);
						}
					}
				}
			}
		}

		if(architecture.instructions[index].fields[j].type == "inm-signed"){
			var value = "";
			if(architecture.instructions[index].separated && architecture.instructions[index].separated[j] == true){
				for (var sep_index = 0; sep_index < architecture.instructions[index].fields[j].startbit.length; sep_index++) {
					value = value + instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit[sep_index]), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit[sep_index]))
				}
			}
			else{
				value = instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit))
			}
			var valueSign = value.charAt(0);
			var newValue =  value.padStart(32, valueSign) ;
			newValue = parseInt(newValue, 2) ;
			var re = new RegExp(architecture.instructions[index].fields[j].name,"g");
			auxDef = auxDef.replace(re, newValue >> 0);
		}

		if(architecture.instructions[index].fields[j].type == "inm-unsigned"){
			var value = "";
			if(architecture.instructions[index].separated && architecture.instructions[index].separated[j] == true){
				for (var sep_index = 0; sep_index < architecture.instructions[index].fields[j].startbit.length; sep_index++) {
					value = value + instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit[sep_index]), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit[sep_index]))
				}
			}
			else{
				value = instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit))
			}
			newValue = parseInt(newValue, 2) ;
			var re = new RegExp(architecture.instructions[index].fields[j].name,"g");
			auxDef = auxDef.replace(re, newValue >> 0);
		}

		if(architecture.instructions[index].fields[j].type == "address"){
			var value = "";
			if(architecture.instructions[index].separated && architecture.instructions[index].separated[j] == true){
				for (var sep_index = 0; sep_index < architecture.instructions[index].fields[j].startbit.length; sep_index++) {
					value = value + instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit[sep_index]), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit[sep_index]))
				}
			}
			else{
				value = instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit))
			}
			var re = new RegExp(architecture.instructions[index].fields[j].name,"g");
			auxDef = auxDef.replace(re, parseInt(value, 2));
		}

		if(architecture.instructions[index].fields[j].type == "offset_words"){
			var value = "";
			if(architecture.instructions[index].separated && architecture.instructions[index].separated[j] == true){
				for (var sep_index = 0; sep_index < architecture.instructions[index].fields[j].startbit.length; sep_index++) {
					value = value + instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit[sep_index]), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit[sep_index]))
				}
			}
			else{
				value = instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit))
			}
			var valueSign = value.charAt(0);
			var newValue =  value.padStart(32, valueSign) ;
			newValue = parseInt(newValue, 2) ;
			var re = new RegExp(architecture.instructions[index].fields[j].name,"g");
			auxDef = auxDef.replace(re, newValue >> 0);
		}

		if(architecture.instructions[index].fields[j].type == "offset_bytes"){
			var value = "";
			if(architecture.instructions[index].separated &&  architecture.instructions[index].separated[j] == true){
				for (var sep_index = 0; sep_index < architecture.instructions[index].fields[j].startbit.length; sep_index++) {
					value = value + instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit[sep_index]), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit[sep_index]))
				}
			}
			else{
				value = instructionExecParts[0].substring(((architecture.instructions[index].nwords*31) - architecture.instructions[index].fields[j].startbit), ((architecture.instructions[index].nwords*32) - architecture.instructions[index].fields[j].stopbit))
			}
			var valueSign = value.charAt(0);
			var newValue =  value.padStart(32, valueSign) ;
			newValue = parseInt(newValue, 2) ;
			var re = new RegExp(architecture.instructions[index].fields[j].name,"g");
			auxDef = auxDef.replace(re, newValue >> 0);
		}
	}

	return auxDef;
}



/* Reset execution */
function reset ()
{
	executionIndex = 0;
	executionInit = 1;

	/* Reset stats */
        stats_reset() ;

	/* Reset console */
	mutexRead    = false ;
	newExecution = true ;
	keyboard = '' ;
	display  = '' ;

	for (var i = 0; i < architecture_hash.length; i++)
        {
		for (var j = 0; j < architecture.components[i].elements.length; j++)
                {
			if (architecture.components[i].double_precision == false)
                        {
				architecture.components[i].elements[j].value = architecture.components[i].elements[j].default_value;
			}

			else{
				var aux_value;
				var aux_sim1;
				var aux_sim2;

				for (var a = 0; a < architecture_hash.length; a++)
                                {
					for (var b = 0; b < architecture.components[a].elements.length; b++)
                                        {
						if (architecture.components[a].elements[b].name.includes(architecture.components[i].elements[j].simple_reg[0]) != false){
							aux_sim1 = app.bin2hex(app.float2bin(architecture.components[a].elements[b].default_value));
						}
						if (architecture.components[a].elements[b].name.includes(architecture.components[i].elements[j].simple_reg[1]) != false){
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
	for (var i = 0; i < memory[memory_hash[0]].length; i++)
        {
		if (memory[memory_hash[0]][i].reset == true)
                {
			memory[memory_hash[0]].splice(i, 1);
			i--;
		}
		else {
			memory[memory_hash[0]][i].Value = memory[memory_hash[0]][i].DefValue;
			for (var j = 0; j < memory[memory_hash[0]][i].Binary.length; j++) {
				memory[memory_hash[0]][i].Binary[j].Bin = memory[memory_hash[0]][i].Binary[j].DefBin;
			}
		}
	}

	for (var i = 0; i < memory[memory_hash[2]].length; i++)
        {
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

	//Stack Reset
	creator_callstack_reset();
	track_stack_reset();

	return true ;
}


function read_string_into_memory ( keystroke, value, addr, valueIndex, auxAddr, index )
{
	var ret = {
		errorcode: "",
		token: "",
		type: "",
		update: "",
		status: "ok"
	} ;

	var index ;

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

	while (valueIndex < value.length)
	{
		memory[index].push({Address: auxAddr, Binary: [], Value: "", DefValue: "", reset: false});
		for (var z = 0; z < 4; z++)
		{
			if (valueIndex > value.length-1){
				(memory[index][i].Binary).push({Addr: auxAddr, DefBin: "00", Bin: "00", Tag: null},);
			}
			else {
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
function updateDouble(comp, elem)
{
	for (var j = 0; j < architecture.components.length; j++)
        {
		for (var z = 0; z < architecture.components[j].elements.length && architecture.components[j].double_precision == true; z++)
                {
			if (architecture.components[comp].elements[elem].name.includes(architecture.components[j].elements[z].simple_reg[0]) != false){
				var simple = bin2hex(float2bin(architecture.components[comp].elements[elem].value));
				var double = bin2hex(double2bin(architecture.components[j].elements[z].value)).substr(8, 15);
				var newDouble = simple + double;

				architecture.components[j].elements[z].value = hex2double("0x"+newDouble);
			}
			if (architecture.components[comp].elements[elem].name.includes(architecture.components[j].elements[z].simple_reg[1]) != false){
				var simple = bin2hex(float2bin(architecture.components[comp].elements[elem].value));
				var double = bin2hex(double2bin(architecture.components[j].elements[z].value)).substr(0, 8);
				var newDouble = double + simple;

				architecture.components[j].elements[z].value = hex2double("0x"+newDouble);
			}
		}
	}
}

/*Modifies single precision registers according to double precision registers*/
function updateSimple ( comp, elem )
{
	var part1 = bin2hex(double2bin(architecture.components[comp].elements[elem].value)).substr(0, 8);
	var part2 = bin2hex(double2bin(architecture.components[comp].elements[elem].value)).substr(8, 15);

	for (var j = 0; j < architecture.components.length; j++)
        {
		for (var z = 0; z < architecture.components[j].elements.length; z++)
                {
			if (architecture.components[j].elements[z].name.includes(architecture.components[comp].elements[elem].simple_reg[0]) != false) {
				architecture.components[j].elements[z].value = hex2float("0x"+part1);
			}
			if (architecture.components[j].elements[z].name.includes(architecture.components[comp].elements[elem].simple_reg[1]) != false) {
				architecture.components[j].elements[z].value = hex2float("0x"+part2);
			}
		}
	}
}

