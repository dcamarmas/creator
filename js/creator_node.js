
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

function assembly_compile ( code )
{
    var ret = {} ;

    code_assembly = code ;
    ret = assembly_compiler() ;
    switch (ret.status)
    {
        case "error":
             var mess = compileError[ret.errorcode] ;
             ret.msg = mess.mess1 + ret.token + mess.mess2 ;
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
            if(architecture.components[i].double_precision == true){
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
              elto_dvalue = hex2double("0x" + aux_value)
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
            if (architecture.components[i].type == "floating point") {
              if(architecture.components[i].double_precision == false){
                elto_string = "0x" + bin2hex(float2bin(elto_value)) ;
              }
              if (architecture.components[i].double_precision == true) {
                elto_string = "0x" + bin2hex(double2bin(elto_value)) ;
              }
            }
            ret.msg = ret.msg + c_name + "[" + e_name + "]:" + elto_string + "; ";
        }
    }

    // dump memory
    for (var i in memory)
    {
        for (var j=0; j<memory[i].length; j++)
        {
            elto_value  = memory[i][j].Binary[3].Bin    + memory[i][j].Binary[2].Bin +
                          memory[i][j].Binary[1].Bin    + memory[i][j].Binary[0].Bin ;
            elto_dvalue = memory[i][j].Binary[3].DefBin + memory[i][j].Binary[2].DefBin +
                          memory[i][j].Binary[1].DefBin + memory[i][j].Binary[0].DefBin ;

            if (elto_value != elto_dvalue)
            {
                elto_string = "0x" + elto_value ;
                ret.msg = ret.msg + "memory[0x" + memory[i][j].Address.toString(16) + "]" + ":" + elto_string + "; ";
            }
        }
    }

    return ret ;
}

function compare_states ( ref_state, alt_state )
{
    var ret = {
                'status': 'ok',
                'msg':    ''
              } ;

    // 1) check equals
    ref_state = ref_state.trim() ;
    alt_state = alt_state.trim() ;

    if (ref_state == alt_state) {
        ret.msg = "Equals" ;
        return ret ;
    }

    // 2) check m_alt included within m_ref
    var m_ref = {} ;
    ref_state.split(';').map(function(i) {
			         var parts = i.split(':') ;
                                 if (parts.length != 2) {
                                     return ;
                                 }

			         m_ref[parts[0].trim()] = parts[1].trim() ;
                             }) ;
    var m_alt = {} ;
    alt_state.split(';').map(function(i) {
			         var parts = i.split(':') ;
                                 if (parts.length != 2) {
                                     return ;
                                 }

			         m_alt[parts[0].trim()] = parts[1].trim() ;
                             }) ;

    ret.msg = "Different: " ;
    for (elto in m_ref) 
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
    if (ret.status != "ko")
        ret.msg = "Equals" ;

    return ret ;
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

