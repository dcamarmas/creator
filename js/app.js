/*PRUEBAS*/

const instructions = [
  { Break: null, Address: "0x8000", Label: "main", assembly: "la $26 msg" },
  { Break: null, Address: "0x8004", Label: "loop1", assembly: "lb $27 ($26)" },
  { Break: null, Address: "0x8008", Label: "", assembly: "li $1 0" },
  { Break: null, Address: "0x800c", Label: "", assembly: "beq $27 $1 end1" },
]
/*Ejemplos de memoria*/
const memory = [
  { Address: "0x01003-0x01000", Binary: "61 65 6c 50", Tag: 'a', Value: null },
  { Address: "0x01007-0x01004", Binary: "61 65 6c 50", Tag: 'b', Value: 30 },
  { Address: "0x0100b-0x01008", Binary: "61 65 6c 50", Tag: 'msg', Value: "hello wold" },
  { Address: "0x0100f-0x0100c", Binary: "61 65 6c 50", Tag: 'msg2', Value: "Please, press letter '0' to end the 'echo' effect" },
]

/*Variables que indican la configuracion del procesador*/
var conf = {assembly_type: "MIPS32", num_bits: 32, num_int_reg: 32, num_fp_reg_single_precision: 32, num_fp_reg_double_precision:16}

/*Datos de los registros de control de los enteros*/
const contr_int_reg =[
  {name:"PC", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"EPC", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"CAUSE", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"BADVADDR", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"STATUS", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"HI", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"LO", nbits:"32", value:0, default_value:0, read: true, write: true},
]

/*Datos de los registros enteros*/
const int_reg = []

/*Datos de los registros de coma flotante*/
const contr_fp_reg =[
  {name:"FIR", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"FCSR", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"FCCR", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"FEXR", nbits:"32", value:0, default_value:0, read: true, write: true},
]

/*Datos de los registros de coma flotante*/
const fp_reg_single_precision=[]
const fp_reg_double_precision=[]

/*Variables q almacenan el codigo introducido*/
var code_assembly = '';
var code_micro = '';

/*Funcion que genera la estructura de datos segun el numero de registros*/
function register_generator(){
  for (var i = 0; i < conf.num_int_reg; i++) {
    int_reg.push({name:"R"+i, nbits: conf.num_bits, value:0, default_value:0, read: true, write: true});
  }
  for (var i = 0; i < conf.num_fp_reg_single_precision; i++) {
    fp_reg_single_precision.push({name:"FG"+i, nbits: conf.num_bits, value:0.0, default_value:0.0, read: true, write: true});
  }
  for (var i = 0; i < conf.num_fp_reg_double_precision; i++) {
    fp_reg_double_precision.push({name:"FP"+(i*2), nbits: conf.num_bits, value:0.0, default_value:0.0, read: true, write: true});
  }
}

function destroyClickedElement(event) {
  document.body.removeChild(event.target);
}

window.app = new Vue({
  el: "#app",
  data: {

    /*Asignacion de valores de los registros de control de los enteros*/
    reg_int_contr: contr_int_reg,
    /*Asignacion de valores de los registros enteros*/
    reg_int: int_reg,
    /*Asignacion de valores de los registros de control de los reales*/
    reg_fp_contr: contr_fp_reg,
    /*Asignacion de valores de los registros reales de simple precision*/
    reg_fp_single: fp_reg_single_precision,
    /*Asignacion de valores de los registros reales de doble precision*/
    reg_fp_double: fp_reg_double_precision,
    /*Variables donde se guardan los contenidos de los textarea*/
    text_micro: code_micro,
    text_assembly: code_assembly,
    /*Variables donde se guardan los ficheros cargados*/
    load_assembly: '',
    load_micro: '',
    /*Variables donde se guardan los nombre de los ficheros guardados*/
    save_assembly: '',
    save_micro: '',



    /*PRUEBAS*/
    instructions: instructions,
    memory:memory
  },
  computed: {
    
  },
  methods:{
    /*PRUEBA*/
    prueba (){
      this.instructions[0].age = this.instructions[0].age + 1;

      this.reg_int[0].value=this.reg_int[0].value+1;
      this.reg_fp_single[0].value=this.reg_fp_single[0].value+1.2;
    },

    /*Funcion que resetea todos los registros*/
    reset(){
      for (var i = 0; i < num_int_reg; i++) {
        int_reg[i].value = int_reg[i].default_value;
      }
      for (var i = 0; i < num_fp_reg_single_precision; i++) {
        fp_reg_single_precision[i].value = fp_reg_single_precision[i].default_value;
      }
      for (var i = 0; i < num_fp_reg_double_precision; i++) {
        fp_reg_double_precision[i].value = fp_reg_double_precision[i].default_value;
      }
    },

    read_assembly(e){
      var file;
      var reader;
      var files = document.getElementById('assembly_file').files;

      for (var i = 0; i < files.length; i++) {
        file = files[i];
        reader = new FileReader();
        reader.onloadend = onFileLoaded;
        reader.readAsBinaryString(file);
      }

      function onFileLoaded(event) {
        code_assembly = event.currentTarget.result;
      }
    },

    assembly_update(){
      this.text_assembly = code_assembly;
    },

    assembly_save(){
      var textToWrite = this.text_assembly;
      var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
      var fileNameToSaveAs = this.save_assembly + ".txt";

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

    read_micro(e){
      var file;
      var reader;
      var files = document.getElementById('micro_file').files;

      for (var i = 0; i < files.length; i++) {
        file = files[i];
        reader = new FileReader();
        reader.onloadend = onFileLoaded;
        reader.readAsBinaryString(file);
      }

      function onFileLoaded(event) {
        code_micro = event.currentTarget.result;
      }
    },

    micro_update(){
      this.text_micro = code_micro;
    },

    micro_save(){
      var textToWrite = this.text_micro;
      var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
      var fileNameToSaveAs = this.save_micro + ".txt";

      var downloadLink = document.createElement("a");
      downloadLink.download = fileNameToSaveAs;
      downloadLink.innerHTML = "My Hidden Link";

      window.URL = window.URL || window.webkitURL;

      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.onclick = destroyClickedElement;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);

      downloadLink.click();
    }
  }
})

