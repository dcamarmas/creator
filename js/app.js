/*PRUEBAS*/

const instructions = [
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },

]

const memory = [
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },

]




/*Variables que indican la configuracion del procesador*/
var assembly_type = "MIPS32";
var num_bits = 32;
var num_int_reg = 32;
var num_fp_reg_single_precision = 32;
var num_fp_reg_double_precision = 16;

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

/*Funcion que genera la estructura de datos segun el numero de registros*/
function register_generator(){
  for (var i = 0; i < num_int_reg; i++) {
    int_reg.push({name:"R"+i, nbits: num_bits, value:0, default_value:0, read: true, write: true});
  }
  for (var i = 0; i < num_fp_reg_single_precision; i++) {
    fp_reg_single_precision.push({name:"FG"+i, nbits: num_bits, value:0.0, default_value:0.0, read: true, write: true});
  }
  for (var i = 0; i < num_fp_reg_double_precision; i++) {
    fp_reg_double_precision.push({name:"FP"+(i*2), nbits: num_bits, value:0.0, default_value:0.0, read: true, write: true});
  }
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
    text_micro: '',
    text_assembly: '',
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
    }
  }
})

