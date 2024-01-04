
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


// load components

function load_architecture ( arch_str )
{
    var ret = {} ;

    arch_obj = JSON.parse(arch_str) ;
    ret = load_arch_select(arch_obj) ;

    return ret ;
}

function load_library ( lib_str )
{
    var ret = {
                'status': 'ok',
                'msg':    ''
              } ;

    code_binary   = lib_str ;
    update_binary = JSON.parse(code_binary) ;

    return ret ;
}

// compilation

function assembly_compile ( code )
{
    var ret = {} ;

    code_assembly = code ;
    ret = assembly_compiler() ;
    switch (ret.status)
    {
        case "error":
         var code_assembly_segment = code_assembly.split('\n') ;
         ret.msg += "\n\n" ;
         if (ret.line > 0)
             ret.msg += "  " + (ret.line+0) + " " + code_assembly_segment[ret.line - 1] + "\n" ;
             ret.msg += "->" + (ret.line+1) + " " + code_assembly_segment[ret.line] + "\n" ;
         if (ret.line < code_assembly_segment.length - 1)
             ret.msg += "  " + (ret.line+2) + " " + code_assembly_segment[ret.line + 1] + "\n" ;
             break;

        case "warning":
             ret.msg = 'warning: ' + ret.token ;
             break;

        case "ok":
             ret.msg = 'Compilation completed successfully' ;
             break;

        default:
             ret.msg = 'Unknow assembly compiler code :-/' ;
             break;
    }
    
    return ret ;
}

// execution

function execute_program ( limit_n_instructions )
{
    var ret = {} ;
    ret = executeProgramOneShot(limit_n_instructions) ;
    if (ret.error === true)
    {
        ret.status = "ko" ;
        return ret ;
    }

    ret.status = "ok" ;
    return ret ;
}

// state management

function get_state ( )
{
    var ret = {
                'status': 'ok',
                'msg':    ''
              } ;

    var c_name      = '' ;
    var e_name      = '' ;
    var elto_value  = null ;
    var elto_dvalue = null ;
    var elto_string = null ;

    // dump registers
    for (var i=0; i<architecture.components.length; i++)
    {
        c_name = architecture.components[i].name ;
        if (typeof c_name == "undefined") {
            return ret ;
        }
        c_name = c_name.split(' ').map(i => i.charAt(0)).join('').toLowerCase() ;

        for (var j=0; j<architecture.components[i].elements.length; j++)
        {
            // get value
            e_name      = architecture.components[i].elements[j].name ;
            elto_value  = architecture.components[i].elements[j].value ;

            //get default value
            if (architecture.components[i].double_precision === true && architecture.components[i].double_precision_type == "linked")
            {
                var aux_value;
                var aux_sim1;
                var aux_sim2;

                for (var a = 0; a < architecture_hash.length; a++) {
                  for (var b = 0; b < architecture.components[a].elements.length; b++) {
                    if(architecture.components[a].elements[b].name == architecture.components[i].elements[j].simple_reg[0]){
                      aux_sim1 = bin2hex(float2bin(bi_BigIntTofloat(architecture.components[a].elements[b].default_value)));
                    }
                    if(architecture.components[a].elements[b].name == architecture.components[i].elements[j].simple_reg[1]){
                      aux_sim2 = bin2hex(float2bin(bi_BigIntTofloat(architecture.components[a].elements[b].default_value)));
                    }
                  }
                }

                aux_value = aux_sim1 + aux_sim2;
                elto_dvalue = hex2double("0x" + aux_value);
            }
            else{
              elto_dvalue = architecture.components[i].elements[j].default_value ;
            }

            // skip default results
            if (typeof elto_dvalue == "undefined") {
                continue ;
            }
            if (elto_value == elto_dvalue) {
                continue ;
            }

            // value != default value => dumpt it
            elto_string = "0x" + elto_value.toString(16) ;
            if (architecture.components[i].type == "fp_registers") 
            {
                if(architecture.components[i].double_precision === false){
                  elto_string = "0x" + bin2hex(float2bin(bi_BigIntTofloat(elto_value))) ;
                }
                if (architecture.components[i].double_precision === true) {
                  elto_string = "0x" + bin2hex(double2bin(bi_BigIntTodouble(elto_value))) ;
                }
            }

            ret.msg = ret.msg + c_name + "[" + e_name + "]:" + elto_string + "; ";
        }
    }

    // dump memory
    var addrs = main_memory_get_addresses() ;
    for (var i=0; i<addrs.length; i++)
    {
      if(addrs[i] >= parseInt(architecture.memory_layout[3].value)){
        continue;
      }

      elto_value  = main_memory_read_value(addrs[i]) ;
      elto_dvalue = main_memory_read_default_value(addrs[i]) ;

      if (elto_value != elto_dvalue)
      {
        addr_string = "0x" + parseInt(addrs[i]).toString(16) ;
        elto_string = "0x" + elto_value ;
        ret.msg = ret.msg + "memory[" + addr_string + "]" + ":" + elto_string + "; ";
      }
    }
    

    // dump keyboard
    ret.msg = ret.msg + "keyboard[0x0]" + ":'" + encodeURIComponent(keyboard) + "'; ";

    // dump display
    ret.msg = ret.msg + "display[0x0]"  + ":'" + encodeURIComponent(display)  + "'; ";

    return ret ;
}

function compare_states ( ref_state, alt_state )
{
    var ret = {
                'status': 'ok',
                'msg':    ''
              } ;

    ref_state_arr = ref_state.split('\n')
      .map(function(s) { return s.replace(/^\s*|\s*$/g, ""); })
      .filter(function(x) { return x; });
    if (ref_state_arr.length > 0)
         ref_state = ref_state_arr[ref_state_arr.length-1];
    else ref_state = '' ;

    alt_state_arr = alt_state.split('\n')
      .map(function(s) { return s.replace(/^\s*|\s*$/g, ""); })
      .filter(function(x) { return x; });
    if (alt_state_arr.length > 0)
         alt_state = alt_state_arr[alt_state_arr.length-1];
    else alt_state = '' ;

    // 1) check equals
    if (ref_state == alt_state) {
        //ret.msg = "Equals" ;
        return ret ;
    }

    // 2) check m_alt included within m_ref
    var m_ref = {} ;
    if (ref_state.includes(';')) {
        ref_state.split(';').map(function(i) {
                         var parts = i.split(':') ;
                                     if (parts.length !== 2) {
                                         return ;
                                     }

                         m_ref[parts[0].trim()] = parts[1].trim() ;
                                 }) ;
    }

    var m_alt = {} ;
    if (alt_state.includes(';')) {
        alt_state.split(';').map(function(i) {
                             var parts = i.split(':') ;
                                     if (parts.length != 2) {
                                         return ;
                                     }

                         m_alt[parts[0].trim()] = parts[1].trim() ;
                                 }) ;
    }

    ret.msg = "Different: " ;
    for (var elto in m_ref)
    {
         if (m_alt[elto] != m_ref[elto])
         {
             if (typeof m_alt[elto] === "undefined")
                  ret.msg += elto + "=" + m_ref[elto] + " is not available. " ;
             else ret.msg += elto + "=" + m_ref[elto] + " is =" + m_alt[elto] + ". " ;

             ret.status = "ko" ;
         }
    }

    // last) is different...
    if (ret.status != "ko") {
        ret.msg = "" ;
    }

    return ret ;
}

// help

function help_instructions ( )
{
    var o = '' ;
    var m = null ;

    // describe instructions
    o += 'name;\t\tsignature;\t\twords;\t\ttype\n' ;
    for (var i=0; i<architecture.instructions.length; i++)
    {
         m = architecture.instructions[i] ;

         o += m.name +         ';\t' + ((m.name.length         <  7) ? '\t' : '') ;
         o += m.signatureRaw + ';\t' + ((m.signatureRaw.length < 15) ? '\t' : '') ;
         o += m.nwords +       ';\t' + ((m.nwords.length       <  7) ? '\t' : '') ;
         o += m.type + '\n' ;
    }

    return o ;
}

function help_pseudoins ( )
{
    var o = '' ;
    var m = null ;

    // describe pseudoinstructions
    o += 'name;\t\tsignature;\t\twords\n' ;
    for (var i=0; i<architecture.pseudoinstructions.length; i++)
    {
         m = architecture.pseudoinstructions[i] ;

         o += m.name +         ';\t' + ((m.name.length         <  7) ? '\t' : '') ;
         o += m.signatureRaw + ';\t' + ((m.signatureRaw.length < 15) ? '\t' : '') ;
         o += m.nwords + '\n' ;
    }

    return o ;
}


//
// Module interface
//

module.exports.load_architecture = load_architecture ;
module.exports.load_library      = load_library ;

module.exports.assembly_compile  = assembly_compile ;
module.exports.execute_program   = execute_program ;

module.exports.get_state         = get_state ;
module.exports.compare_states    = compare_states ;

module.exports.help_instructions = help_instructions ;
module.exports.help_pseudoins    = help_pseudoins ;

