/*PRUEBAS*/
const data = [
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' }
]

const instructions = [
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' },
  { isActive: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { isActive: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { isActive: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
  { isActive: true, age: 38, first_name: 'Jami', last_name: 'Carney' }
]







/*Datos de los registros de control*/
const pc ={name:"PC", nbits:"32", value:0, default_value:0};
const epc ={name:"EPC", nbits:"32", value:0, default_value:0};
const cause ={name:"CAUSE", nbits:"32", value:0, default_value:0};
const badvaddr ={name:"BADVADDR", nbits:"32", value:0, default_value:0};
const status ={name:"STATUS", nbits:"32", value:0, default_value:0};
const hi ={name:"HI", nbits:"32", value:0, default_value:0};
const lo ={name:"LO", nbits:"32", value:0, default_value:0};

/*Datos de los registros enteros*/
const int_reg =[
  {name:"R0", nbits:"32", value:0, default_value:0},
  {name:"R1", nbits:"32", value:0, default_value:0},
  {name:"R2", nbits:"32", value:0, default_value:0},
  {name:"R3", nbits:"32", value:0, default_value:0},
  {name:"R4", nbits:"32", value:0, default_value:0},
  {name:"R5", nbits:"32", value:0, default_value:0},
  {name:"R6", nbits:"32", value:0, default_value:0},
  {name:"R7", nbits:"32", value:0, default_value:0},
  {name:"R8", nbits:"32", value:0, default_value:0},
  {name:"R9", nbits:"32", value:0, default_value:0},
  {name:"R10", nbits:"32", value:0, default_value:0},
  {name:"R11", nbits:"32", value:0, default_value:0},
  {name:"R12", nbits:"32", value:0, default_value:0},
  {name:"R13", nbits:"32", value:0, default_value:0},
  {name:"R14", nbits:"32", value:0, default_value:0},
  {name:"R15", nbits:"32", value:0, default_value:0},
  {name:"R16", nbits:"32", value:0, default_value:0},
  {name:"R17", nbits:"32", value:0, default_value:0},
  {name:"R18", nbits:"32", value:0, default_value:0},
  {name:"R19", nbits:"32", value:0, default_value:0},
  {name:"R20", nbits:"32", value:0, default_value:0},
  {name:"R21", nbits:"32", value:0, default_value:0},
  {name:"R22", nbits:"32", value:0, default_value:0},
  {name:"R23", nbits:"32", value:0, default_value:0},
  {name:"R24", nbits:"32", value:0, default_value:0},
  {name:"R25", nbits:"32", value:0, default_value:0},
  {name:"R26", nbits:"32", value:0, default_value:0},
  {name:"R27", nbits:"32", value:0, default_value:0},
  {name:"R28", nbits:"32", value:0, default_value:0},
  {name:"R29", nbits:"32", value:0, default_value:0},
  {name:"R30", nbits:"32", value:0, default_value:0},
  {name:"R31", nbits:"32", value:0, default_value:0},
]

/*Datos de los registros reales*/
const fp_reg =[
  {name:"FP0", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP1", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP2", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP3", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP4", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP5", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP6", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP7", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP8", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP9", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP10", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP11", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP12", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP13", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP14", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP15", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP16", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP17", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP18", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP19", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP20", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP21", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP22", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP23", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP24", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP25", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP26", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP27", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP28", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP29", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP30", nbits:"32", value:0.0, default_value:0.0},
  {name:"FP31", nbits:"32", value:0.0, default_value:0.0},
]

function square() {
  for (var i = Things.length - 1; i >= 0; i--) {
    Things[i]
  }
}

window.app = new Vue({
  el: "#app",
  data: {

    /*Asignacion de valores de los registros de control*/
    pc: pc.value,
    epc: epc.value,
    cause: cause.value,
    badvaddr: badvaddr.value,
    status: status.value,
    hi: hi.value,
    lo:lo.value,
    /*Asignacion de valores de los registros enteros*/
    reg_int: int_reg,
    /*Asignacion de valores de los registros reales*/
    reg_fp: fp_reg,


    /*PRUEBAS*/
    data: data,
    instructions: instructions
  },
  computed: {
    
  },
  methods:{
    prueba (){
      this.data[0].age = this.data[0].age + 1;
      this.data[2].age = this.data[2].age + 1; 
      this.instructions[0].age = this.instructions[0].age + 1;

      //int_reg[0].value=int_reg[0].value+1;
      this.reg_int[0].value=this.reg_int[0].value+1;

      /*for (var i = 0; i <= 32; i++) {
        int_reg[i].value=int_reg[i].value+1;
        this.reg4= int_reg[4].value;
      }*/
    }
  }
})

