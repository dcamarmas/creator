
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


//
// Module interface
//

module.exports.load_architecture = load_architecture ;
module.exports.assembly_compile = assembly_compile ;

