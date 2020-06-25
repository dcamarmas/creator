
function load_architecture ( arch_str )
{
    var ret = {} ;

    if (typeof bigInt === "undefined") {
        bigInt = BigInt ;
    }

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


function execute_program ()
{
    var ret = {} ;

    if (typeof bigInt === "undefined") {
        bigInt = BigInt ;
    }

    ret = executeProgramOneShot() ;
    if (ret.error === true) 
    {
        ret.status = "ko" ;
        return ret ;
    }

    ret.status = "ok" ;
    return ret ;
}

function print_state ()
{
    var ret = {} ;

    if (typeof bigInt === "undefined") {
        bigInt = BigInt ;
    }

    ret.msg = "" ;
    for (var i = 0; i < architecture.components.length; i++) {
        for (var j = 0; j <  architecture.components[i].elements.length; j++) {
            if(architecture.components[i].elements[j].default_value != architecture.components[i].elements[j].value){
                ret.msg = ret.msg + architecture.components[i].elements[j].name + ":" + architecture.components[i].elements[j].value.toString() + "; ";
            }
        }
    }

    ret.status = "ok" ;
    return ret ;
}


//
// Module interface
//

module.exports.load_architecture = load_architecture ;
module.exports.assembly_compile = assembly_compile ;
module.exports.execute_program = execute_program ;
module.exports.print_state = print_state ;

