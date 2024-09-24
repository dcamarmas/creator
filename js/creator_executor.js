
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




/*
 * Execution
 */

var execution_index     = 0;
var execution_mode      = 0; // 0: instruction by instruction, 1: run program
var run_program         = 0; // 0: stopped, 1: running, 2: stopped-by-breakpoint, 3: stopped-by-mutex-read
var execution_init      = 1;
var instructions_packed = 100;


function packExecute ( error, err_msg, err_type, draw )
{
  var ret = {} ;

  ret.error    = error ;
  ret.msg      = err_msg ;
  ret.type     = err_type ;
  ret.draw     = draw ;

  return ret ;
}

function execute_instruction ( )
{
  var draw = {
    space:   [],
    info:    [],
    success: [],
    warning: [],
    danger:  [],
    flash:   []
  } ;

  var error = 0;
  var index;

  do
  {
    console_log(execution_index);
    //console_log(architecture.components[0].elements[0].value); //TODO
    console_log(readRegister(0, 0));

    if (instructions.length === 0) {
      return packExecute(true, 'No instructions in memory', 'danger', null);
    }
    if (execution_index < -1) {
      return packExecute(true, 'The program has finished', 'warning', null);
    }
    if (execution_index == -1) {
      return packExecute(true, 'The program has finished with errors', 'danger', null);
    }
    else if (run_program === 3) {
      return packExecute(false, '', 'info', null);
    }

    //Search a main tag
    if (execution_init === 1)
    {
      for (var i = 0; i < instructions.length; i++)
      {
        if (instructions[i].Label == architecture.arch_conf[5].value) {
          //draw.success.push(execution_index) ;
          //architecture.components[0].elements[0].value = bi_intToBigInt(instructions[i].Address, 10); //TODO
          writeRegister(bi_intToBigInt(instructions[i].Address, 10), 0, 0);
          execution_init = 0;
          break;
        }
        else if (i == instructions.length-1) {
          execution_index = -1;
          return packExecute(true, 'Label "'+ architecture.arch_conf[5].value +'" not found', 'danger', null);
        }
      }
    }

    //Get execution index by PC
    get_execution_index (draw);


    //Ask interruption before execute intruction
    var i_reg = crex_findReg_bytag ("event_cause");
    if (i_reg.match != 0)
    {
      var i_reg_value = readRegister(i_reg.indexComp, i_reg.indexElem);
      if (i_reg_value != 0)
      {
        console.log("Interruption detected");
        //TODO: Print badget on instruction
        draw.warning.push(execution_index);

        //Save register PC (in EPC), STATUS
        var epc_reg = crex_findReg_bytag ("exception_program_counter");
        var pc_reg  = crex_findReg_bytag ("program_counter");

        var pc_reg_value = readRegister(pc_reg.indexComp, pc_reg.indexElem);
        writeRegister(pc_reg_value, epc_reg.indexComp, epc_reg.indexElem);

        //TODO: get new PC
        var handler_addres = 0;

        //Load in PC new PC (associated handler) and modify execution_index
        writeRegister(handler_addres, pc_reg.indexComp, pc_reg.indexElem);
        get_execution_index (draw);

        //Reset CAUSE register
        console.log(i_reg);
        writeRegister(0, i_reg.indexComp, i_reg.indexElem);
      }
    }


    var instructionExec = instructions[execution_index].loaded;
    var instructionExecParts = instructionExec.split(' ');

    var signatureDef;
    var signatureParts;
    var signatureRawParts;

    var binary;
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
        if(architecture.instructions[i].fields[y].type == "co")
        {
          coStartbit = 31 - parseInt(architecture.instructions[i].fields[y].startbit);
          coStopbit = 32 - parseInt(architecture.instructions[i].fields[y].stopbit);
        }
      }

      if(architecture.instructions[i].co == instructionExecParts[0].substring(coStartbit,coStopbit))
      {
        if(architecture.instructions[i].cop != null && architecture.instructions[i].cop != '')
        {
          for (var j = 0; j < architecture.instructions[i].fields.length; j++)
          {
            if (architecture.instructions[i].fields[j].type == "cop")
            {
              numCop++;
              if (architecture.instructions[i].fields[j].valueField == instructionExecParts[0].substring(((architecture.instructions[i].nwords*31) - architecture.instructions[i].fields[j].startbit), ((architecture.instructions[i].nwords*32) - architecture.instructions[i].fields[j].stopbit))) {
                numCopCorrect++;
              }
            }
          }
          if(numCop != numCopCorrect){
            continue;
          }
        }

        var instruction_loaded    = architecture.instructions[i].signature_definition;
        var instruction_fields    = architecture.instructions[i].fields;
        var instruction_nwords    = architecture.instructions[i].nwords;   

        for (var f = 0; f < instruction_fields.length; f++) 
        {
          re = new RegExp("[Ff]"+f);
          var res = instruction_loaded.search(re);

          if (res != -1)
          {
            var value = null;
            re = new RegExp("[Ff]"+f, "g");
            switch(instruction_fields[f].type)
            {
              case "co":
                value = instruction_fields[f].name;
                break;

              //TODO: unify register type by register file on architecture
              case "INT-Reg":
                var bin = instructionExec.substring(((instruction_nwords*31) - instruction_fields[f].startbit), ((instruction_nwords*32) - instruction_fields[f].stopbit));
                value = get_register_binary ("int_registers", bin);
                break; 
              case "SFP-Reg":
                var bin = instructionExec.substring(((instruction_nwords*31) - instruction_fields[f].startbit), ((instruction_nwords*32) - instruction_fields[f].stopbit));
                value = get_register_binary ("fp_registers", bin);
                break; 
              case "DFP-Reg":
                var bin = instructionExec.substring(((instruction_nwords*31) - instruction_fields[f].startbit), ((instruction_nwords*32) - instruction_fields[f].stopbit));
                value = get_register_binary ("fp_registers", bin);
                break; 
              case "Ctrl-Reg":
                var bin = instructionExec.substring(((instruction_nwords*31) - instruction_fields[f].startbit), ((instruction_nwords*32) - instruction_fields[f].stopbit));
                value = get_register_binary ("ctrl_registers", bin);
                break; 

              case "inm-signed":
              case "inm-unsigned":
              case "address":
              case "offset_bytes":
              case "offset_words":
                var bin = "";

                //Get binary
                if(architecture.instructions[i].separated && architecture.instructions[i].separated[f] === true){
                  for (var sep_index = 0; sep_index < architecture.instructions[i].fields[f].startbit.length; sep_index++) {
                    bin = bin + instructionExec.substring(((instruction_nwords*31) - instruction_fields[f].startbit[sep_index]), ((instruction_nwords*32) - instruction_fields[f].stopbit[sep_index]))
                  }
                }
                else{
                  bin = instructionExec.substring(((instruction_nwords*31) - instruction_fields[f].startbit), ((instruction_nwords*32) - instruction_fields[f].stopbit))
                }

                // value = get_number_binary(bin) ;
                value     = parseInt(bin, 2).toString(16) ;
                value_len = Math.abs(instruction_fields[f].startbit - instruction_fields[f].stopbit) ;
                value     = '0x' + value.padStart(value_len/4, '0') ;
                break; 

              default:
                break
            }
            instruction_loaded = instruction_loaded.replace(re, value);
          }
        }

        instructionExec = instruction_loaded;
        instructionExecParts = instructionExec.split(' ');

        binary = true;
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

    //Increase PC
    var pc_reg = crex_findReg_bytag ("program_counter");
    word_size = parseInt(architecture.arch_conf[1].value) / 8;
    writeRegister(readRegister(pc_reg.indexComp, pc_reg.indexElem) + (nwords * word_size), 0,0);
    console_log(auxDef);


    // preload
    if (typeof instructions[execution_index].preload === "undefined")
    {
      //writeRegister and readRegister
      var readings_description = "";
      var writings_description = "";

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

      // Generate all registers, values, etc. readings
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
                var_readings_definitions[signatureRawParts[i]]      = "var " + signatureRawParts[i] + "      = readRegister ("+j+" ,"+z+", \""+ signatureParts[i] + "\");\n"
                var_readings_definitions_prev[signatureRawParts[i]] = "var " + signatureRawParts[i] + "_prev = readRegister ("+j+" ,"+z+", \""+ signatureParts[i] + "\");\n"
                var_readings_definitions_name[signatureRawParts[i]] = "var " + signatureRawParts[i] + "_name = '" + instructionExecParts[i] + "';\n";

                re = new RegExp( "(?:\\W|^)(((" + signatureRawParts[i] +") *=)[^=])", "g");
                //If the register is in the left hand than '=' then write register always
                if(auxDef.search(re) != -1){
                  var_writings_definitions[signatureRawParts[i]]  = "writeRegister("+ signatureRawParts[i] +", "+j+", "+z+", \""+ signatureParts[i] + "\");\n";
                }
                //Write register only if value is diferent
                else{
                  var_writings_definitions[signatureRawParts[i]]  = "if(" + signatureRawParts[i] + " != " + signatureRawParts[i] + "_prev)" +
                                                                    " { writeRegister("+ signatureRawParts[i]+" ,"+j+" ,"+z+", \""+ signatureParts[i] + "\"); }\n";
                }
              }
            }
          }
        }
        else{

          /////////TODO: inm-signed
          if ( signatureParts[i] == "offset_words" )
          {
            if (instructionExecParts[i].startsWith("0x"))
            {
              var value     = parseInt(instructionExecParts[i]);
              var nbits     = 4 * (instructionExecParts[i].length - 2) ; // 0xFFC -> 12 bits
              var value_bin = value.toString(2).padStart(nbits, '0') ;   // value_bin = '111111111100'

              // TODO: replace 32 with bits in architecture...
              if (value_bin[0] == '1') {
                value_bin = ''.padStart(32 - nbits, '1') + value_bin ;   // value_bin = '1111...111' + '111111111100' ;
              }
              else {
                value_bin = ''.padStart(32 - nbits, '0') + value_bin ;   // value_bin = '0000...000' + '011111111100' ;
              }
              value = parseInt(value_bin, 2) >> 0 ;
              instructionExecParts[i] = value ;

              console_log(instructionExecParts[i]);
            }
          }
          /////////

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

      // writeRegister and readRegister direcly named include into the definition
      for (var i = 0; i < architecture.components.length; i++)
      {
        for (var j = architecture.components[i].elements.length-1; j >= 0; j--)
        {
          var clean_name = clean_string(architecture.components[i].elements[j].name[0], 'reg_');
          var clean_aliases = architecture.components[i].elements[j].name.map((x)=> clean_string(x, 'reg_')).join('|');

          re = new RegExp( "(?:\\W|^)(((" + clean_aliases +") *=)[^=])", "g");
          if (auxDef.search(re) != -1){
            re = new RegExp("(" + clean_aliases + ")");
            var reg_name = re.exec(auxDef)[0];
            clean_name = clean_string(reg_name, 'reg_');
            writings_description = writings_description+"\nwriteRegister("+ clean_name +", "+i+", "+j+", \""+ signatureParts[i] + "\");";
          }

          re = new RegExp("([^a-zA-Z0-9])(?:" + clean_aliases + ")");
          if (auxDef.search(re) != -1){
            re = new RegExp("(" + clean_aliases + ")");
            var reg_name = re.exec(auxDef)[0];
            clean_name = clean_string(reg_name, 'reg_');
            readings_description = readings_description + "var " + clean_name + "      = readRegister("+i+" ,"+j+", \""+ signatureParts[i] + "\");\n"
            readings_description = readings_description + "var " + clean_name + "_name = '" + clean_name + "';\n";
          }
        }
      }

      auxDef =  "\n/* Read all instruction fields */\n" +
                 readings_description +
                "\n/* Original instruction definition */\n" +
                 auxDef +
                "\n\n/* Modify values */\n" +
                 writings_description;

      // DEBUG
      console_log(" ................................. " +
                  "instructions[" + execution_index + "]:\n" +
                   auxDef + "\n" +
                  " ................................. ");

      // preload instruction
      eval("instructions[" + execution_index + "].preload = function(elto) { " +
           "   try {\n" +
               auxDef.replace(/this./g,"elto.") + "\n" +
           "   }\n" +
           "   catch(e){\n" +
           "     throw e;\n" +
           "   }\n" +
           "}; ") ;
    }


    try {
      var result = instructions[execution_index].preload(this);
      if ( (typeof result != "undefined") && (result.error) ) {
        return result;
      }
    }
    catch ( e )
    {
      var msg = '' ;
      if (e instanceof SyntaxError)
        msg = 'The definition of the instruction contains errors, please review it' + e.stack ; //TODO
      else msg = e.msg ;

      console_log("Error: " + e.stack);
      error = 1;
      draw.danger.push(execution_index) ;
      execution_index = -1;

      return packExecute(true, msg, 'danger', draw) ;
    }

    // Refresh stats
    stats_update(type) ;

    // Refresh power consumption
    clk_cycles_update(type) ;

    // Execution error
    if (execution_index == -1){
      error = 1;
      return packExecute(false, '', 'info', null); //CHECK
    }

    // Next instruction to execute
    if (error !== 1 && execution_index < instructions.length)
    {
      for (var i = 0; i < instructions.length; i++)
      {
        var pc_reg = crex_findReg_bytag ("program_counter");
        var pc_reg_value = readRegister(pc_reg.indexComp, pc_reg.indexElem);
        if (parseInt(instructions[i].Address, 16) == pc_reg_value) {
          execution_index = i;
          draw.success.push(execution_index) ;
          break;
        }
        else if ((i == instructions.length-1) && (run_program === 3)){
          execution_index = instructions.length+1;
        }
        else if (i == instructions.length-1){
          draw.space.push(execution_index) ;
          execution_index = instructions.length+1;
        }
      }
    }

    if ((execution_index >= instructions.length) && (run_program === 3))
    {
      for (var i = 0; i < instructions.length; i++) {
        draw.space.push(i);
      }
      draw.info=[];
      return packExecute(false, 'The execution of the program has finished', 'success', draw); //CHECK
    }
    else if ((execution_index >= instructions.length) && (run_program != 3))
    {
      for (var i = 0; i < instructions.length; i++){
        draw.space.push(i) ;
      }
      draw.info=[];
      execution_index = -2;
      return packExecute(false, 'The execution of the program has finished', 'success', draw);
    }
    else{
      if (error !== 1) {
        draw.success.push(execution_index);
      }
    }
    console_log(execution_index) ;
  }
  while(instructions[execution_index].hide === true) ;

  return packExecute(false, null, null, draw) ;
}

function executeProgramOneShot ( limit_n_instructions )
{
  var ret = null;

  // Google Analytics
  creator_ga('execute', 'execute.run');

  // execute program
  for (var i=0; i<limit_n_instructions; i++)
  {
    ret = execute_instruction();

    if (ret.error === true){
      return ret;
    }
    if (execution_index < -1) {
      return ret;
    }
  }

  return packExecute(true, '"ERROR:" number of instruction limit reached :-(', null, null) ;
}

function reset ()
{
  // Google Analytics
  creator_ga('execute', 'execute.reset');

  execution_index = 0;
  execution_init = 1;
  run_program = 0;

  // Reset stats
  stats_reset();

  //Power consumption reset
  clk_cycles_reset();

  // Reset console
  keyboard = '' ;
  display  = '' ;

  for (var i = 0; i < architecture_hash.length; i++)
  {
    for (var j = 0; j < architecture.components[i].elements.length; j++)
    {
      if (architecture.components[i].double_precision === false || (architecture.components[i].double_precision === true && architecture.components[i].double_precision_type == "extended"))
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
            if (architecture.components[a].elements[b].name.includes(architecture.components[i].elements[j].simple_reg[0]) !== false){
              aux_sim1 = bin2hex(float2bin(bi_BigIntTofloat(architecture.components[a].elements[b].default_value)));
            }
            if (architecture.components[a].elements[b].name.includes(architecture.components[i].elements[j].simple_reg[1]) !== false){
              aux_sim2 = bin2hex(float2bin(bi_BigIntTofloat(architecture.components[a].elements[b].default_value)));
            }
          }
        }

        aux_value = aux_sim1 + aux_sim2;
        architecture.components[i].elements[j].value = bi_floatToBigInt(hex2double("0x" + aux_value)); //TODO: no estoy seguro
      }
    }
  }

  architecture.memory_layout[4].value = backup_stack_address;
  architecture.memory_layout[3].value = backup_data_address;

  // reset memory
  creator_memory_reset() ;

  //Stack Reset
  creator_callstack_reset();
  track_stack_reset();

  return true ;
}

//Exit syscall
function creator_executor_exit ( error )
{
  // Google Analytics
  creator_ga('execute', 'execute.exit');

  if (error)
  {
    execution_index = -1;
  }
  else
  {
    execution_index = instructions.length + 1;
  }
}




/*
 * Auxiliar functions
 */

//Get execution index by PC
function get_execution_index ( draw )
{
  var pc_reg = crex_findReg_bytag ("program_counter");
  var pc_reg_value = readRegister(pc_reg.indexComp, pc_reg.indexElem);
  for (var i = 0; i < instructions.length; i++)
  {
    if (parseInt(instructions[i].Address, 16) == pc_reg_value) 
    {
      execution_index = i;

      console_log(instructions[execution_index].hide);
      console_log(execution_index);
      console_log(instructions[i].Address);

      if (instructions[execution_index].hide === false) {
        draw.info.push(execution_index);
      }
    }
    else{
      if (instructions[execution_index].hide === false) {
        draw.space.push(i);
      }
    }
  }

  return i;
}

function crex_show_notification ( msg, level )
{
  if (typeof window !== "undefined")
    show_notification(msg, level);
  else console.log(level.toUpperCase() + ": " + msg);
}

// Modify the stack limit
function writeStackLimit ( stackLimit )
{
  var draw = {
    space:   [],
    info:    [],
    success: [],
    warning: [],
    danger:  [],
    flash:   []
  } ;
  
  if (stackLimit == null) {
      return ;
  }
  if (stackLimit <= parseInt(architecture.memory_layout[3].value) && stackLimit >= parseInt(parseInt(architecture.memory_layout[2].value)))
  {
    draw.danger.push(execution_index);
    throw packExecute(true, 'Stack pointer cannot be placed in the data segment', 'danger', null);
  }
  else if(stackLimit <= parseInt(architecture.memory_layout[1].value) && stackLimit >= parseInt(architecture.memory_layout[0].value))
  {
    draw.danger.push(execution_index);
    throw packExecute(true, 'Stack pointer cannot be placed in the text segment', 'danger', null);
  }
  else
  {
    var diff = parseInt(architecture.memory_layout[4].value) - stackLimit ;
    if (diff > 0) {
      creator_memory_zerofill(stackLimit, diff) ;
    }

    track_stack_setsp(stackLimit);
    architecture.memory_layout[4].value = "0x" + (stackLimit.toString(16)).padStart(8, "0").toUpperCase();
  }
}


/*
 * Stats
 */

var totalStats = 0;
var stats_value = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
var stats = [
              { type: 'Arithmetic floating point', number_instructions: 0, percentage: 0 },
              { type: 'Arithmetic integer', number_instructions: 0, percentage: 0},
              { type: 'Comparison', number_instructions: 0, percentage: 0 },
              { type: 'Conditional bifurcation', number_instructions: 0, percentage: 0},
              { type: 'Control', number_instructions: 0, percentage: 0},
              { type: 'Function call', number_instructions: 0, percentage: 0},
              { type: 'I/O', number_instructions: 0, percentage: 0},
              { type: 'Logic', number_instructions: 0, percentage: 0, abbreviation: "Log"},
              { type: 'Memory access', number_instructions: 0, percentage: 0},
              { type: 'Other', number_instructions: 0, percentage: 0},
              { type: 'Syscall', number_instructions: 0, percentage: 0},
              { type: 'Transfer between registers', number_instructions: 0, percentage: 0},
              { type: 'Unconditional bifurcation', number_instructions: 0, percentage: 0},
            ];


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
 * CLK Cycles
 */

var total_clk_cycles = 0;
var clk_cycles_value =  [
                          {
                            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                          }
                        ];
var clk_cycles =  [
                    { type: 'Arithmetic floating point', clk_cycles: 0, percentage: 0 },
                    { type: 'Arithmetic integer', clk_cycles: 0, percentage: 0},
                    { type: 'Comparison', clk_cycles: 0, percentage: 0 },
                    { type: 'Conditional bifurcation', clk_cycles: 0, percentage: 0},
                    { type: 'Control', clk_cycles: 0, percentage: 0},
                    { type: 'Function call', clk_cycles: 0, percentage: 0},
                    { type: 'I/O', clk_cycles: 0, percentage: 0},
                    { type: 'Logic', clk_cycles: 0, percentage: 0, abbreviation: "Log"},
                    { type: 'Memory access', clk_cycles: 0, percentage: 0},
                    { type: 'Other', clk_cycles: 0, percentage: 0},
                    { type: 'Syscall', clk_cycles: 0, percentage: 0},
                    { type: 'Transfer between registers', clk_cycles: 0, percentage: 0},
                    { type: 'Unconditional bifurcation', clk_cycles: 0, percentage: 0},
                  ];

function clk_cycles_update ( type )
{
  for (var i = 0; i < clk_cycles.length; i++)
  {
    if (type == clk_cycles[i].type)
    {
      clk_cycles[i].clk_cycles++;

      //Update CLK Cycles plot
      clk_cycles_value[0].data[i] ++;
      
      total_clk_cycles++;
      if (typeof app !== "undefined") {
        app._data.total_clk_cycles++;
      }
    }
  }

  //CLK Cycles
  for (var i = 0; i < stats.length; i++){
    clk_cycles[i].percentage = ((clk_cycles[i].clk_cycles/total_clk_cycles)*100).toFixed(2);
  }
}

function clk_cycles_reset ( )
{
  total_clk_cycles = 0 ;
  if (typeof app !== "undefined") {
    app._data.total_clk_cycles = 0 ;
  }

  for (var i = 0; i < clk_cycles.length; i++)
  {
    clk_cycles[i].percentage = 0;

    //Update CLK Cycles plot
    clk_cycles_value[0].data[i] = 0;
  }
}


/*
 * I/O
 */

var keyboard = '' ;
var display = '' ;

//Keyboard

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
  writeRegister(value, params.indexComp, params.indexElem, "SFP-Reg");

  return value ;
}

function kbd_read_double ( keystroke, params )
{
  var value = parseFloat(keystroke, 10) ;
  writeRegister(value, params.indexComp, params.indexElem, "DFP-Reg");

  return value ;
}

function kbd_read_string ( keystroke, params )
{
  var value = "";
  var neltos = readRegister ( params.indexComp2, params.indexElem2 );
  for (var i = 0; (i < neltos) && (i < keystroke.length); i++) {
    value = value + keystroke.charAt(i);
  }

  var neltos = readRegister ( params.indexComp, params.indexElem );
  writeMemory(value, parseInt(neltos), "string") ;

  return value ;
}


function keyboard_read ( fn_post_read, fn_post_params)
{
  var draw = {
    space:   [],
    info:    [],
    success: [],
    warning: [],
    danger:  [],
    flash:   []
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
  app._data.enter = false;

  if (3 === run_program) {
    setTimeout(keyboard_read, 1000, fn_post_read, fn_post_params);
    return;
  }

  fn_post_read(app._data.keyboard, fn_post_params) ;

  app._data.keyboard = "";
  app._data.enter = null;

  show_notification('The data has been uploaded', 'info') ;

  if (execution_index >= instructions.length)
  {
    for (var i = 0; i < instructions.length; i++){
      draw.space.push(i) ;
    }

    execution_index = -2;
    return packExecute(true, 'The execution of the program has finished', 'success', null);
  }

  if (run_program === 1) {
    //uielto_toolbar_btngroup.methods.execute_program();
    $("#playExecution").trigger("click");
  }
}


/*
 *  Execute binary
 */

function get_register_binary (type, bin)
{
  for (var i = 0; i < architecture.components.length; i++)
  {
    if(architecture.components[i].type == type)
    {
      for (var j = 0; j < architecture.components[i].elements.length; j++)
      {
        var len = bin.length;
        if((j.toString(2)).padStart(len, "0") == bin){
          return architecture.components[i].elements[j].name[0];
        }
      }
    }
  }

  return null;
}


function get_number_binary (bin)
{
  return "0x" + bin2hex(bin);
}
