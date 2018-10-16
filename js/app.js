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
const int_reg =[
  {name:"R0", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R1", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R2", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R3", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R4", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R5", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R6", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R7", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R8", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R9", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R10", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R11", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R12", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R13", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R14", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R15", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R16", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R17", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R18", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R19", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R20", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R21", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R22", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R23", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R24", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R25", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R26", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R27", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R28", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R29", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R30", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"R31", nbits:"32", value:0, default_value:0, read: true, write: true},
]

/*Datos de los registros de control reales*/
const contr_fp_reg =[
  {name:"FIR", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"FCSR", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"FCCR", nbits:"32", value:0, default_value:0, read: true, write: true},
  {name:"FEXR", nbits:"32", value:0, default_value:0, read: true, write: true},
]

/*Datos de los registros reales*/
const fp_reg_single_precision=[
  {name:"FG0", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG1", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG2", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG3", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG4", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG5", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG6", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG7", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG8", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG9", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG10", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG11", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG12", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG13", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG14", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG15", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG16", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG17", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG18", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG19", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG20", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG21", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG22", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG23", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG24", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG25", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG26", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG27", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG28", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG29", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG30", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FG31", nbits:"32", value:0.0, default_value:0.0, read: true, write: true},
]

const fp_reg_double_precision=[
  {name:"FP0", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP2", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP4", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP6", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP8", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP10", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP12", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP14", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP16", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP18", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP20", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP22", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP24", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP26", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP28", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
  {name:"FP30", nbits:"64", value:0.0, default_value:0.0, read: true, write: true},
]

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



    /*PRUEBAS*/
    instructions: instructions,
    memory:memory
  },
  computed: {
    
  },
  methods:{
    prueba (){

      this.instructions[0].age = this.instructions[0].age + 1;

      //int_reg[0].value=int_reg[0].value+1;
      this.reg_int[0].value=this.reg_int[0].value+1;
      this.reg_fp_single[0].value=this.reg_fp_single[0].value+1.2;

      /*for (var i = 0; i <= 32; i++) {
        int_reg[i].value=int_reg[i].value+1;
        this.reg4= int_reg[4].value;
      }*/
    }
  }
})

