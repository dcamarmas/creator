
function load_architecture ( arch_str )
{
    var ret = {} ;

    arch_obj = JSON.parse(arch_str) ;
    ret = load_arch_select(arch_obj) ;

    return ret ;
}

function assembly_compile ( code )
{
    var ret = {} ;

    code_assembly = code ;
    ret = assembly_compiler() ;
    if (ret.status == "error")
    {
        var mess = compileError[ret.errorcode] ;
        ret.msg = mess.mess1 + ret.token + mess.mess2 ;
    }
    if (ret.status == "ok")
    {
        ret.msg = 'Compilation completed successfully' ;
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

function print_state ( )
{
    var elto_value  = null ;
    var elto_dvalue = null ;
    var elto_string = null ;

    var ret = {} ;
    ret.msg = "" ;
    ret.status = "ok" ;

    for (var i=0; i<architecture.components.length; i++) 
    {
        for (var j=0; j<architecture.components[i].elements.length; j++) 
        {
            elto_value  = architecture.components[i].elements[j].value ;
            elto_dvalue = architecture.components[i].elements[j].default_value ;

            if (elto_value != elto_dvalue) 
            {
                elto_string = elto_value.toString() ;
                if (architecture.components[i].type == "integer") {
                    elto_string = "0x" + elto_value.toString(16) ;
                }

                ret.msg = ret.msg + architecture.components[i].elements[j].name + ":" + elto_string + "; ";
            }
        }
    }

    return ret ;
}


//
// Module interface
//

module.exports.load_architecture = load_architecture ;
module.exports.assembly_compile  = assembly_compile ;
module.exports.execute_program   = execute_program ;
module.exports.print_state       = print_state ;

