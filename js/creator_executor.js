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
			return packExecute(true, 'The program has finished', 'warning', null);
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

function creator_executor_exit ( )
{
	/* Google Analytics */
	creator_ga('execute', 'execute.exit');

	// executionIndex = -1; // REASON: line 360 said that if executionIndex == -1 then throw error... :-(
        executionIndex = instructions.length + 1;
}

function reset ()
{
	/* Google Analytics */
	creator_ga('execute', 'execute.reset');

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
        memory_reset() ;

	//Stack Reset
	creator_callstack_reset();
	track_stack_reset();

	return true ;
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
	
	if (stackLimit == null) {
	    return ;
	}

	if (stackLimit <= architecture.memory_layout[3].value && stackLimit >= architecture.memory_layout[2].value)
	{
		draw.danger.push(executionIndex);
		executionIndex = -1;
		throw packExecute(true, 'Segmentation fault. You tried to read in the data segment', 'danger', null);
	}
	else if(stackLimit <= architecture.memory_layout[1].value && stackLimit >= architecture.memory_layout[0].value)
	{
		draw.danger.push(executionIndex);
		executionIndex = -1;
		throw packExecute(true, 'Segmentation fault. You tried to read in the text segment', 'danger', null);
	}
	else
	{
		creator_memory_update_stack_limit(stackLimit) ;
		track_stack_setsp(stackLimit);
		architecture.memory_layout[4].value = stackLimit;
	}
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
 * I/O
 */

function display_print ( info )
{
	if (typeof app !== "undefined")
			 app._data.display += info ;
	else process.stdout.write(info + '\n') ;

	display += info ;
}


function kbd_read_char ( keystroke, params )
{
		var value = keystroke.charCodeAt(0);
	writeRegister(value, params.indexComp, params.indexElem);

	return value ;
}

function kbd_read_int ( keystroke, params )
{
	var value = parseInt(keystroke) ;
	writeRegister(value, params.indexComp, params.indexElem);

	return value ;
}

function kbd_read_float ( keystroke, params )
{
	var value = parseFloat(keystroke, 10) ;
	writeRegister(value, params.indexComp, params.indexElem);

	return value ;
}

function kbd_read_double ( keystroke, params )
{
	var value = parseFloat(keystroke, 10) ;
	writeRegister(value, params.indexComp, params.indexElem);

	return value ;
}

function kbd_read_string ( keystroke, params )
{
	var value = "";
	var neltos = architecture.components[params.indexComp2].elements[params.indexElem2].value ;
	for (var i = 0; (i < neltos) && (i < keystroke.length); i++) {
		 value = value + keystroke.charAt(i);
	}

	var addr = architecture.components[params.indexComp].elements[params.indexElem].value ;
	creator_memory_store_string(keystroke, value, addr, 0) ;

	return value ;
}


function keyboard_read ( fn_post_read, fn_post_params )
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

		 var value = fn_post_read(keystroke, fn_post_params) ;
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
		setTimeout(keyboard_read, 1000, fn_post_read, fn_post_params);
		return;
	}

	fn_post_read(app._data.keyboard, fn_post_params) ;

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

