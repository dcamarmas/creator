/*Listado de arquitecturas disponibles*/
var architecture_available = [];

/*tabla hash de la arquitectura*/
var architecture_hash = [];

/*Arquitectura cargada*/
var architecture = {components:[
  /*{name: "Integer control registers", type: "integer", double_precision: false, elements:[
      {name:"PC", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"EPC", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"CAUSE", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"BADVADDR", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"STATUS", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"HI", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"LO", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    ]},
    {name: "Integer registers", type: "integer", double_precision: false, elements:[
      {name:"R0", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R1", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R2", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R3", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R4", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R5", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R6", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R7", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R8", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R9", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R10", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R11", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R12", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R13", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R14", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R15", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R16", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R17", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R18", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R19", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R20", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R21", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R22", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R23", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R24", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R25", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R26", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R27", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R28", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R29", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R30", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"R31", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    ]},
    {name: "Floating point control registers", type: "integer", double_precision: false, elements:[
      {name:"FIR", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"FCSR", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"FCCR", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
      {name:"FEXR", nbits:"32", value:0, default_value:0, properties: ["read", "write"]},
    ]},
    {name: "Simple floating point registers",type: "floating point", double_precision: false, elements:[
      {name:"FG0", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG1", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG2", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG3", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG4", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG5", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG6", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG7", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG8", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG9", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG10", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG11", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG12", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG13", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG14", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG15", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG16", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG17", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG18", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG19", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG20", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG21", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG22", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG23", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG24", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG25", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG26", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG27", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG28", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG29", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG30", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FG31", nbits:"32", value:0.0, default_value:0.0, properties: ["read", "write"]},
    ]},
    {name: "Double floating point registers", type: "floating point", double_precision: true, elements:[
      {name:"FP0", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP2", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP4", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP6", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP8", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP10", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP12", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP14", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP16", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP18", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP20", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP22", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP24", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP26", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP28", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
      {name:"FP30", nbits:"64", value:0.0, default_value:0.0, properties: ["read", "write"]},
    ]}*/
  ], instructions:[
    /*{name: "add", signature: "add,reg,reg,reg", signatureRaw: "add reg1 reg2 reg3", cop: "1001", fields: [
      {name: "reg 1", type: "reg", startbit: 25, stopbit: 21},
      {name: "reg 2", type: "reg", startbit: 20, stopbit: 16},
      {name: "reg 3", type: "reg", startbit: 15, stopbit: 11},
    ], definition: "reg3=reg1+reg2"},
    {name: "and", signature: "and,reg,reg,reg", signatureRaw: "add reg1 reg2 reg3", cop: "000", fields: [
      {name: "reg 1", type: "reg", startbit: 25, stopbit: 21},
      {name: "reg 2", type: "reg", startbit: 20, stopbit: 16},
      {name: "reg 3", type: "reg", startbit: 15, stopbit: 11},
    ], definition: "reg3=reg1&reg2"},*/
  ]};

var componentsTypes = [
  { text: 'Integer', value: 'integer' },
  { text: 'Floating point', value: 'floating point' },
]

var memory = [
  { Address: "0x01003-0x01000", Binary: "61 65 6c 50", Tag: 'a', Value: null },
  { Address: "0x01007-0x01004", Binary: "61 65 6c 50", Tag: 'b', Value: 30 },
  { Address: "0x0100b-0x01008", Binary: "61 65 6c 50", Tag: 'msg', Value: "hello wold" },
  { Address: "0x0100f-0x0100c", Binary: "61 65 6c 50", Tag: 'msg2', Value: "Please, press letter '0' to end the 'echo' effect" },
]

var  instructions = [
  { Break: null, Address: "0x8000", Label:"" , Pseudo: "and R0 R1 R2", Assebly: "and R0 R1 R2", _rowVariant: 'success'},
  { Break: null, Address: "0x8000", Label:"" , Pseudo: "and FG0 FG1 FG2", Assebly: "and FG0 FG1 FG2", _rowVariant: ''},
  { Break: null, Address: "0x8000", Label:"" , Pseudo: "and FP0 FP2 FP4", Assebly: "and FP0 FP2 FP4", _rowVariant: ''},
  { Break: null, Address: "0x8000", Label:"" , Pseudo: "add R1 R2 R3", Assebly: "add R1 R2 R3", _rowVariant: '' },
  { Break: null, Address: "0x8000", Label:"" , Pseudo: "add FG0 FG1 FG2", Assebly: "add FG0 FG1 FG2", _rowVariant: '' },
  { Break: null, Address: "0x8000", Label:"" , Pseudo: "add FP0 FP2 FP4", Assebly: "add FP0 FP2 FP4", _rowVariant: '' }
]

var executionIndex = 0;

/*Variables que almacenan el codigo introducido*/
var code_assembly = '';

function destroyClickedElement(event) {
  document.body.removeChild(event.target);
}

function binaryStringToInt( b ) {
    return parseInt(b, 2);
}

window.app = new Vue({
  el: "#app",
  data: {

    /*ALERTA GLOBAL*/
    alertMessaje: '',
    type: '',
    dismissSecs: 3,
    dismissCountDown: 0,

    /*ALERTA MODAL*/
    dismissSecsMod: 3,
    dismissCountDownMod: 0,

    /*PAGINA CARGA ARQUITECTURA*/
    /*Configuraciones Disponibles*/
    arch_available: architecture_available,
    /*Nombre del fichero a cargar*/
    load_arch: '',
    /*Nombre del fichero a guardar*/
    name_arch_save: '',
    /*Numero de bits de la arquitectura*/
    number_bits: 32,
    /*Asingacion de la arquitectura empleada*/
    architecture: architecture,
    /*Tabla hash arquitectura*/
    architecture_hash: architecture_hash,
    /*Listado de tipos de componentes*/
    componentsTypes:componentsTypes,
    /*Campos de la tabla de componentes*/
    archFields: ['name', 'nbits', 'value', 'default_value', 'properties', 'actions'],
    /*Edicion de la arquitectura*/
    formArchitecture: {
      name: '',
      type: '',
      defValue: '',
      properties: [],
      precision: '',
    },
    /*Edicion de un componente*/
    modalEditComponent: {
      title: '',
      element: '',
    },
    /*Borrado de un componente*/
    modalDeletComp:{
      title: '',
      element: '',
    },
    /*Nuevo elemento*/
    modalNewElement:{
      title: '',
      element: '',
    },
    /*Edicion de un elemento*/
    modalEditElement:{
      title: '',
      element: '',
    },
    /*Borrado de un elemento*/
    modalDeletElement:{
      title: '',
      element: '',
    },
    /*Nombre de la arquitectura*/
    architecture_name: '',

    
    /*PAGINA DE INSTRUCCIONES*/
    instFields: ['name', 'signature', 'signatureRaw', 'cop', 'fields', 'definition', 'actions'],
    /*Edicion de las instrucciones*/
    formInstruction: {
      name: '',
      cop: '',
      numfields: 1,
      nameField: [],
      typeField: [],
      startBitField: [],
      stopBitField: [],
      signature: '',
      signatureRaw: '',
      definition: '',
    },
    /*Barra de paginas formulario instrucciones*/
    instructionFormPage: 1,
    /*Barra de paginas formulario instrucciones parte campos*/
    fieldsFormPage:1,
    /*Variables para el selector de campos tabla*/
    fieldsSel: '',
    instSel: '',
    /*Borrado de una instruccion*/
    modalDeletInst:{
      title: '',
      element: '',
    },
    /*Edicion de una instruccion*/
    modalEditInst:{
      title: '',
      element: '',
    },


    /*CARGA Y LECTURA ENSAMBLADOR*/
    /*Variables donde se guardan los contenidos de los textarea*/
    text_assembly: code_assembly,
    /*Variables donde se guardan los ficheros cargados*/
    load_assembly: '',
    /*Variables donde se guardan los nombre de los ficheros guardados*/
    save_assembly: '',

    /*PAGINA SIMULADOR*/
    /*Nuevo valor del registro*/
    newValue: '',
    /*Registros a mostrar*/
    register_type: 'integer',
    
    /*Asignacion de valores de la tabla de memoria*/
    memory: memory,
    /*Asignacion de valores de la tabla de instrucciones*/
    instructions: instructions,

  },
  computed: {
    
  },
  methods:{
    /*ALERTA GLOBAL*/
    countDownChanged (dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },

    /*ALERTA MODAL*/
    countDownChangedMod (dismissCountDown) {
      this.dismissCountDownMod = dismissCountDown;
    },

    /*PAGINA CARGA ARQUITECTURA*/
    /*Carga las arquitecturas que hay disponibles*/
    load_arch_available(){
      $.getJSON('architecture/available_arch.json', function(cfg){
        architecture_available = cfg;
        app._data.arch_available = cfg;
      })
    },

    /*Carga la arquitectura seleccionada*/
    load_arch_select(e){
      $.getJSON('architecture/'+e+'.json', function(cfg){
        architecture = cfg;
        app._data.architecture = architecture;

        /*PREGUNTAR*/
        architecture_hash = [];
        for (var i = 0; i < architecture.components.length; i++) {
          architecture_hash.push({name: architecture.components[i].name, index: i}); 
          app._data.architecture_hash = architecture_hash;
        }

        app._data.architecture_name = e;

        $("#architecture_menu").hide();
        $("#simulator").show();
        $("#assembly_btn_arch").show();
        $("#sim_btn_arch").show();
        $("#load_arch").hide();
        $("#load_menu_arch").hide();
        $("#view_components").show();

        app._data.alertMessaje = 'The selected architecture has been loaded correctly';
        app._data.type ='success';
        app._data.dismissCountDown = app._data.dismissSecs;

      });
    },

    /*Lectura del JSON de la arquitectura seleccionada*/
    read_arch(e){
      var file;
      var reader;
      var files = document.getElementById('arch_file').files;

      for (var i = 0; i < files.length; i++) {
        file = files[i];
        reader = new FileReader();
        reader.onloadend = onFileLoaded;
        reader.readAsBinaryString(file);
      }

      function onFileLoaded(event) {
        architecture = JSON.parse(event.currentTarget.result);

        app._data.architecture = architecture;

        /*PREGUNTAR*/
        architecture_hash = [];
        for (var i = 0; i < architecture.components.length; i++) {
          architecture_hash.push({name: architecture.components[i].name, index: i}); 
          app._data.architecture_hash = architecture_hash;
        }

        $("#architecture_menu").hide();
        $("#simulator").show();
        $("#assembly_btn_arch").show();
        $("#sim_btn_arch").show();
        $("#load_arch").hide();
        $("#load_menu_arch").hide();
        $("#view_components").show();
        
        app._data.alertMessaje = 'The selected architecture has been loaded correctly';
        app._data.type ='success';
        app._data.dismissCountDown = app._data.dismissSecs;
      }
    },

    /*Guarda la arquitectura actual en un JSON*/
    arch_save(){
      var textToWrite = JSON.stringify(architecture, null, 2);
      var textFileAsBlob = new Blob([textToWrite], { type: 'text/json' });
      var fileNameToSaveAs = this.name_arch_save + ".json";

      var downloadLink = document.createElement("a");
      downloadLink.download = fileNameToSaveAs;
      downloadLink.innerHTML = "My Hidden Link";

      window.URL = window.URL || window.webkitURL;

      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.onclick = destroyClickedElement;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);

      downloadLink.click();
      app._data.alertMessaje = 'Save architecture';
      app._data.type ='success';
      app._data.dismissCountDown = app._data.dismissSecs;

    },

    resetArchitecture(arch){
      $.getJSON('architecture/'+arch+'.json', function(cfg){
        architecture.components = cfg.components;
        app._data.architecture = architecture;

        /*PREGUNTAR*/
        architecture_hash = [];
        for (var i = 0; i < architecture.components.length; i++) {
          architecture_hash.push({name: architecture.components[i].name, index: i}); 
          app._data.architecture_hash = architecture_hash;
        }

        app._data.alertMessaje = 'The architecture has been reset correctly';
        app._data.type ='success';
        app._data.dismissCountDown = app._data.dismissSecs;
      });
    },

    /*Comprueba que estan todos los campos del formulario de nuevo componente*/
    newComponentVerify(evt){
      evt.preventDefault();
      if (!this.formArchitecture.name || !this.formArchitecture.type) {
        app._data.alertMessaje = 'Please complete all fields';
        app._data.type ='danger';
        app._data.dismissCountDownMod = app._data.dismissSecsMod;
      } else {
        this.newComponent()
      }
    },

    /*Crea un nuevo componente*/
    newComponent(){
      var error = 0;
      for (var i = 0; i < architecture_hash.length; i++) {
        if(this.formArchitecture.name == architecture_hash[i].name){
          app._data.alertMessaje = 'The component already exists';
          app._data.type ='danger';
          app._data.dismissCountDownMod = app._data.dismissSecsMod;
          error = 1;
        }
      }

      if(error == 0){
        this.$refs.newComponent.hide();
        var precision = false;
        if(this.formArchitecture.precision == "precision"){
          precision = true;
        }
        var newComp = {name: this.formArchitecture.name, type: this.formArchitecture.type, double_precision: precision ,elements:[]};
        architecture.components.push(newComp);
        var newComponentHash = {name: this.formArchitecture.name, index: architecture_hash.length};
        architecture_hash.push(newComponentHash);

        this.formArchitecture.name='';
        this.formArchitecture.type='';
        this.formArchitecture.precision='';
      }
    },

    /*Muestra el modal para editar un componente*/
    editCompModal(comp, button){
      this.modalEditComponent.title = "Edit " + comp;
      this.modalEditComponent.element = comp;

      this.formArchitecture.name = comp;

      this.$root.$emit('bv::show::modal', 'modalEditComponent', button);
    },

    /*Comprueba que estan todos los campos del formulario de editar component*/
    editCompVerify(evt, comp){
      evt.preventDefault();
      if (!this.formArchitecture.name) {
        app._data.alertMessaje = 'Please complete all fields';
        app._data.type ='danger';
        app._data.dismissCountDownMod = app._data.dismissSecsMod;
      } else {
        this.editComponent(comp);
      }
    },

    /*Edita un componente*/
    editComponent(comp){
      var error = 0;
      for (var i = 0; i < architecture_hash.length; i++) {
        if((this.formArchitecture.name == architecture_hash[i].name) && (comp != this.formArchitecture.name)){
          app._data.alertMessaje = 'The component already exists';
          app._data.type ='danger';
          app._data.dismissCountDownMod = app._data.dismissSecsMod;
          error = 1;
        }
      }
      
      if(error == 0){
        this.$refs.editComponent.hide();
        for (var i = 0; i < architecture_hash.length; i++) {
          if(comp == architecture_hash[i].name){
            architecture_hash[i].name = this.formArchitecture.name;
            architecture.components[i].name = this.formArchitecture.name;
          }
        }
        this.formArchitecture.name='';
      }   
    },

    /*Muestra el modal de confirmacion de borrado de un componente*/
    delCompModal(elem, button){
      this.modalDeletComp.title = "Delete " + elem;
      this.modalDeletComp.element = elem;
      this.$root.$emit('bv::show::modal', 'modalDeletComp', button);
    },

    /*Borra un componente*/
    delComponent(comp){
      for (var i = 0; i < architecture_hash.length; i++) {
        if(comp == architecture_hash[i].name){
          architecture.components.splice(i,1);
          architecture_hash.splice(i,1);
          for (var j = 0; j < architecture_hash.length; j++){
            architecture_hash[j].index = j;
          }
        }
      }
    },

    /*Muestra el modal para nuevo un elemento*/
    newElemModal(comp, index, button){
      this.modalNewElement.title = "Edit " + comp;
      this.modalNewElement.element = comp;

      this.$root.$emit('bv::show::modal', 'modalNewElement', button);
    },

    /*Comprueba que estan todos los campos del formulario de nuevo elemento*/
    newElementVerify(evt, comp){
      evt.preventDefault();
      if (!this.formArchitecture.name || !this.formArchitecture.defValue) {
        app._data.alertMessaje = 'Please complete all fields';
        app._data.type ='danger';
        app._data.dismissCountDownMod = app._data.dismissSecsMod;
      } else {
        this.newElement(comp);
      }
    },

    /*Crea un nuevo elemento*/
    newElement(comp){
      var error = 0;
      for (var i = 0; i < architecture_hash.length; i++) {
        for (var j = 0; j < architecture.components[i].elements.length; j++){
          if(this.formArchitecture.name == architecture.components[i].elements[j].name){
            app._data.alertMessaje = 'The element already exists';
            app._data.type ='danger';
            app._data.dismissCountDownMod = app._data.dismissSecsMod;
            error = 1;
          }
        } 
      }
      if(error == 0){
        this.$refs.newElement.hide();
        for (var i = 0; i < architecture_hash.length; i++) {
          if((comp == architecture_hash[i].name)&&(architecture.components[i].type == "integer")){
            var newElement = {name:this.formArchitecture.name, nbits: this.number_bits, value: bigInt(parseInt(this.formArchitecture.defValue) >>> 0, 10).value, default_value:bigInt(parseInt(this.formArchitecture.defValue) >>> 0, 10).value, properties: this.formArchitecture.properties};
            architecture.components[i].elements.push(newElement);
            this.formArchitecture.name='';
            this.formArchitecture.defValue='';
            this.formArchitecture.properties=[];
            break;
          }
          if((comp == architecture_hash[i].name)&&(architecture.components[i].type == "floating point")&&(architecture.components[i].double_precision == false)){
            var newElement = {name:this.formArchitecture.name, nbits: this.number_bits, value: parseFloat(this.formArchitecture.defValue), default_value:parseFloat(this.formArchitecture.defValue), properties: this.formArchitecture.properties};
            architecture.components[i].elements.push(newElement);
            this.formArchitecture.name='';
            this.formArchitecture.defValue='';
            this.formArchitecture.properties=[];
            break;
          }
          if((comp == architecture_hash[i].name)&&(architecture.components[i].type == "floating point")&&(architecture.components[i].double_precision == true)){
            var newElement = {name:this.formArchitecture.name, nbits: this.number_bits*2, value: parseFloat(this.formArchitecture.defValue), default_value:parseFloat(this.formArchitecture.defValue), properties: this.formArchitecture.properties};
            architecture.components[i].elements.push(newElement);
            this.formArchitecture.name='';
            this.formArchitecture.defValue='';
            this.formArchitecture.properties=[];
            break;
          }
        }
      }
    },
    
    /*Muestra el modal de editar un elemento*/
    editElemModal(elem, comp, button){
      this.modalEditElement.title = "Edit " + elem;
      this.modalEditElement.element = elem;
      for(var j=0; j < architecture.components[comp].elements.length; j++){
        if(elem == architecture.components[comp].elements[j].name){
          this.formArchitecture.name = elem;
          this.formArchitecture.defValue = (architecture.components[comp].elements[j].default_value).toString();
          this.formArchitecture.properties = architecture.components[comp].elements[j].properties;
        }
      }
      this.$root.$emit('bv::show::modal', 'modalEditElement', button);
    },

    /*Comprueba que estan todos los campos del formulario de editar elemento*/
    editElementVerify(evt, comp){
      evt.preventDefault();
      if (!this.formArchitecture.name || !this.formArchitecture.defValue) {
        app._data.alertMessaje = 'Please complete all fields';
        app._data.type ='danger';
        app._data.dismissCountDownMod = app._data.dismissSecsMod;
      } else {
        this.editElement(comp);
      }
    },

    /*Edita un elemento*/
    editElement(comp){
      var error = 0;
      for (var i = 0; i < architecture_hash.length; i++) {
        for (var j = 0; j < architecture.components[i].elements.length; j++){
          if((this.formArchitecture.name == architecture.components[i].elements[j].name) && (comp != this.formArchitecture.name)){
            app._data.alertMessaje = 'The element already exists';
            app._data.type ='danger';
            app._data.dismissCountDownMod = app._data.dismissSecsMod;
            error = 1;
          }
        } 
      }
      if(error == 0){
        this.$refs.editElement.hide();
        for (var i = 0; i < architecture_hash.length; i++) {
          for(var j=0; j < architecture.components[i].elements.length; j++){
            if(comp == architecture.components[i].elements[j].name){
              architecture.components[i].elements[j].name = this.formArchitecture.name;
              architecture.components[i].elements[j].default_value= bigInt(parseInt(this.formArchitecture.defValue) >>> 0, 10).value;
              architecture.components[i].elements[j].properties = this.formArchitecture.properties;
            }
          }
        } 
        this.formArchitecture.name='';
        this.formArchitecture.defValue='';
        this.formArchitecture.properties=[];
      }
    },

    /*Muestra el modal para confirmar el borrado*/
    delElemModal(elem, button){
      this.modalDeletElement.title = "Delete " + elem;
      this.modalDeletElement.element = elem;
      this.$root.$emit('bv::show::modal', 'modalDeletElement', button);
    },

    /*Borra un elemento*/
    delElement(comp){
      for (var i = 0; i < architecture_hash.length; i++) {
        for(var j=0; j < architecture.components[i].elements.length; j++){
          if(comp == architecture.components[i].elements[j].name){
            architecture.components[i].elements.splice(j,1);
          }
        }
      }
    },

    /*PAGINA DE INSTRUCCIONES*/
    resetInstructions(arch){
      $.getJSON('architecture/'+arch+'.json', function(cfg){
        architecture.instructions = cfg.instructions;
        app._data.architecture = architecture;

        app._data.alertMessaje = 'The instruction set has been reset correctly';
        app._data.type ='success';
        app._data.dismissCountDown = app._data.dismissSecs;
      });
    },

    /*Comprueba que estan todos los campos del formulario de nueva instruccion*/
    newInstVerify(evt){
      evt.preventDefault();

      var vacio = 0;
      for (var i = 0; i < this.formInstruction.numfields; i++) {
        if(this.formInstruction.nameField.length <  this.formInstruction.numfields || this.formInstruction.typeField.length <  this.formInstruction.numfields || this.formInstruction.startBitField.length <  this.formInstruction.numfields || this.formInstruction.stopBitField.length <  this.formInstruction.numfields){
          vacio = 1;
        }
      }

      if (!this.formInstruction.name || !this.formInstruction.cop || !this.formInstruction.numfields || !this.formInstruction.signature || !this.formInstruction.signatureRaw || !this.formInstruction.definition || vacio == 1) {
        app._data.alertMessaje = 'Please complete all fields';
        app._data.type ='danger';
        app._data.dismissCountDownMod = app._data.dismissSecsMod;
      } else {
        this.newInstruction();
      }
    },

    /*Inserta una nueva instruccion*/
    newInstruction(){
      var error = 0;

      for (var i = 0; i < architecture.instructions.length; i++) {
        if(this.formInstruction.name == architecture.instructions[i].name){
          app._data.alertMessaje = 'The instruction already exists';
          app._data.type ='danger';
          app._data.dismissCountDownMod = app._data.dismissSecsMod;
          error = 1;
        }
      }

      if(error == 0){
        this.$refs.newInst.hide();
        var newInstruction = {name: this.formInstruction.name, signature: this.formInstruction.signature, signatureRaw: this.formInstruction.signatureRaw, cop: this.formInstruction.cop, fields: [], definition: this.formInstruction.definition};
        architecture.instructions.push(newInstruction);

        for (var i = 0; i < this.formInstruction.numfields; i++) {
          var newField = {name: this.formInstruction.nameField[i], type: this.formInstruction.typeField[i], startbit: this.formInstruction.startBitField[i], stopbit: this.formInstruction.stopBitField[i]};
          architecture.instructions[architecture.instructions.length-1].fields.push(newField);
        }

        this.formInstruction.name='';
        this.formInstruction.cop='';
        this.formInstruction.numfields=1;
        this.formInstruction.nameField=[];
        this.formInstruction.typeField=[];
        this.formInstruction.startBitField=[];
        this.formInstruction.stopBitField=[];
        this.formInstruction.signature='';
        this.formInstruction.signatureRaw='';
        this.formInstruction.definition='';
        this.fieldsFormPage = 1;
        this.instructionFormPage = 1;
      }
    },

    /*Muestra el modal de confirmacion de borrado de una instruccion*/
    delInstModal(elem, button){
      this.modalDeletInst.title = "Delete " + elem;
      this.modalDeletInst.element = elem;
      this.$root.$emit('bv::show::modal', 'modalDeletInst', button);
    },

    /*Borra una instruccion*/
    delInstruction(comp){
      for (var i = 0; i < architecture.instructions.length; i++) {
        if(comp == architecture.instructions[i].name){
          architecture.instructions.splice(i,1);
        }
      }
    },

    /*Muestra el modal de editar instruccion*/
    editInstModal(elem, button){
      this.modalEditInst.title = "Edit " + elem;
      this.modalEditInst.element = elem;
      for (var i = 0; i < architecture.instructions.length; i++) {
        if(elem == architecture.instructions[i].name){
          this.formInstruction.name = architecture.instructions[i].name;
          this.formInstruction.cop = architecture.instructions[i].cop;
          this.formInstruction.numfields = architecture.instructions[i].fields.length;
          this.formInstruction.signature = architecture.instructions[i].signature;
          this.formInstruction.definition = architecture.instructions[i].definition;
          this.formInstruction.signatureRaw = architecture.instructions[i].signatureRaw;

          for (var j = 0; j < architecture.instructions[i].fields.length; j++) {
            this.formInstruction.nameField [j]= architecture.instructions[i].fields[j].name;
            this.formInstruction.typeField[j] = architecture.instructions[i].fields[j].type;
            this.formInstruction.startBitField[j] = architecture.instructions[i].fields[j].startbit;
            this.formInstruction.stopBitField[j] = architecture.instructions[i].fields[j].stopbit;
          }

        }
      }
      this.$root.$emit('bv::show::modal', 'modalEditInst', button);
    },

    /*Comprueba que estan todos los campos del formulario de editar instruccion*/
    editInstVerify(evt, inst){
      evt.preventDefault();

      var vacio = 0;
      for (var i = 0; i < this.formInstruction.numfields; i++) {
        if(!this.formInstruction.nameField[i] || !this.formInstruction.typeField[i] || !this.formInstruction.startBitField[i] || !this.formInstruction.stopBitField[i]){
          vacio = 1;
        }
      }

      if (!this.formInstruction.name || !this.formInstruction.cop || !this.formInstruction.numfields || !this.formInstruction.signature || !this.formInstruction.signatureRaw || !this.formInstruction.definition || vacio == 1) {
        app._data.alertMessaje = 'Please complete all fields';
        app._data.type ='danger';
        app._data.dismissCountDownMod = app._data.dismissSecsMod;
      } else {
        this.editInstruction(inst);
      }
    },

    /*edita una instruccion*/
    editInstruction(comp){
      var error = 0;

      for (var i = 0; i < architecture.instructions.length; i++) {
        if((this.formInstruction.name == architecture.instructions[i].name) && (comp != this.formInstruction.name)){
          app._data.alertMessaje = 'The instruction already exists';
          app._data.type ='danger';
          app._data.dismissCountDownMod = app._data.dismissSecsMod;
          error = 1;
        }
      }

      if(error == 0){
        this.$refs.editInst.hide();
        for (var i = 0; i < architecture.instructions.length; i++){
          if(architecture.instructions[i].name == comp){
            architecture.instructions[i].name = this.formInstruction.name;
            architecture.instructions[i].signature = this.formInstruction.signature;
            architecture.instructions[i].signatureRaw = this.formInstruction.signatureRaw;
            architecture.instructions[i].cop = this.formInstruction.cop;
            architecture.instructions[i].definition = this.formInstruction.definition;

            for (var j = 0; j < this.formInstruction.numfields; j++){
              if(j < architecture.instructions[i].fields.length){
                architecture.instructions[i].fields[j].name = this.formInstruction.nameField[j];
                architecture.instructions[i].fields[j].type = this.formInstruction.typeField[j];
                architecture.instructions[i].fields[j].startbit = this.formInstruction.startBitField[j];
                architecture.instructions[i].fields[j].stopbit = this.formInstruction.stopBitField[j];
              }
              else{
                var newField = {name: this.formInstruction.nameField[j], type: this.formInstruction.typeField[j], startbit: this.formInstruction.startBitField[j], stopbit: this.formInstruction.stopBitField[j]};
                architecture.instructions[i].fields.push(newField);
              }
            }

            if(architecture.instructions[i].fields.length > this.formInstruction.numfields){
              architecture.instructions[i].fields.splice(this.formInstruction.numfields, (architecture.instructions[i].fields.length - this.formInstruction.numfields));
            }

          }
        }

        this.formInstruction.name='';
        this.formInstruction.cop='';
        this.formInstruction.numfields=1;
        this.formInstruction.nameField=[];
        this.formInstruction.typeField=[];
        this.formInstruction.startBitField=[];
        this.formInstruction.stopBitField=[];
        this.formInstruction.signature='';
        this.formInstruction.signatureRaw='';
        this.formInstruction.definition='';
        this.fieldsFormPage = 1;
        this.instructionFormPage = 1;

      }
    },

    /*PAGINA ENSAMBLADOR*/
    /*Funciones de carga y descarga de ensamblador*/
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


    /*PAGINA SIMULADOR*/
    /*Funciones de los popover*/
    popoverId(i){
      return 'popoverValueContent' + i;
    },

    /*Convierte de hexadecimal a float*/
    hex2float ( hexvalue ){
      var sign     = (hexvalue & 0x80000000) ? -1 : 1;
      var exponent = ((hexvalue >> 23) & 0xff) - 127;
      var mantissa = 1 + ((hexvalue & 0x7fffff) / 0x800000);

      var valuef = sign * mantissa * Math.pow(2, exponent);
      if (-127 == exponent)
        if (1 == mantissa)
          valuef = (sign == 1) ? "+0" : "-0" ;
        else valuef = sign * ((hexvalue & 0x7fffff) / 0x7fffff) * Math.pow(2, -126) ;
      if (128 == exponent)
        if (1 == mantissa)
          valuef = (sign == 1) ? "+Inf" : "-Inf" ;
        else valuef = "NaN" ;

      return valuef ;
    },

    hex2double ( hexvalue ){
      /*var sign     = (hexvalue & 0x8000000000000000) ? -1 : 1;
      var exponent = ((hexvalue >> 52) & 0x7ff) - 1023;
      var mantissa = 1 + ((hexvalue & 0xfffffffffffff) / 0x10000000000000);



      console.log(sign);
      console.log((hexvalue).toString(2));

      var valuef = sign * mantissa * Math.pow(2, exponent);
      if (-1023 == exponent)
        if (1 == mantissa)
          valuef = (sign == 1) ? "+0" : "-0" ;
        else valuef = sign * ((hexvalue & 0xfffffffffffff) / 0xfffffffffffff) * Math.pow(2, -1022) ;
      if (1024 == exponent)
        if (1 == mantissa)
          valuef = (sign == 1) ? "+Inf" : "-Inf" ;
        else valuef = "NaN" ;

      return valuef ;*/

      /*Cogido de github https://github.com/bartaz/ieee754-visualization licencia MIT teoria libre*/

      var value = hexvalue.split('x');
      var value_bit = '';

      for (var i = 0; i < value[1].length; i++) {
      	var aux = value[1].charAt(i);
      	aux = (parseInt(aux, 16)).toString(2).padStart(4, "0");
      	value_bit = value_bit + aux;
      }

	  	var buffer = new ArrayBuffer(8);
		  new Uint8Array( buffer ).set( value_bit.match(/.{8}/g).map( binaryStringToInt ) );
		  return new DataView( buffer ).getFloat64(0, false);


    },

    /*Convierte de hexadecimal a char*/
    hex2char8 ( hexvalue ){

    	var num_char = ((hexvalue.toString().length)-2)/2;
    	var exponent = 0;
    	var pos = 0;

      var valuec = new Array();

      for (var i = 0; i < num_char; i++) {
      	var dec_mask = (15 * Math.pow(16,exponent)) + (15 * Math.pow(16,exponent+1));
      	exponent = exponent + 2;
      	valuec[i] = String.fromCharCode((hexvalue & dec_mask) >> pos);
      	pos = pos + 8;
      }

      var characters = '';

      for (var i = valuec.length - 1; i >= 0; i--) {
        characters = characters + valuec[i] + ' ';
      }

      return  characters;
    },

    float2bin (number){
	    var i, result = "";
	    var dv = new DataView(new ArrayBuffer(4));

	    dv.setFloat32(0, number, false);

	    for (i = 0; i < 4; i++) {
	        var bits = dv.getUint8(i).toString(2);
	        if (bits.length < 8) {
	            bits = new Array(8 - bits.length).fill('0').join("") + bits;
	        }
	        result += bits;
	    }
	    return result;
    },

    double2bin(number) {
	    var i, result = "";
	    var dv = new DataView(new ArrayBuffer(8));

	    dv.setFloat64(0, number, false);

	    for (i = 0; i < 8; i++) {
	        var bits = dv.getUint8(i).toString(2);
	        if (bits.length < 8) {
	            bits = new Array(8 - bits.length).fill('0').join("") + bits;
	        }
	        result += bits;
	    }
	    return result;
		},

    bin2hex(s) {
	    var i, k, part, accum, ret = '';
	    for (i = s.length-1; i >= 3; i -= 4) {

	      part = s.substr(i+1-4, 4);
	      accum = 0;
	      for (k = 0; k < 4; k += 1) {
          if (part[k] !== '0' && part[k] !== '1') {     
              return { valid: false };
          }
          accum = accum * 2 + parseInt(part[k], 10);
	      }
	      if (accum >= 10) {
          ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
	      } else {
          ret = String(accum) + ret;
	      }
	    }

	    if (i >= 0) {
        accum = 0;
        for (k = 0; k <= i; k += 1) {
          if (s[k] !== '0' && s[k] !== '1') {
              return { valid: false };
          }
          accum = accum * 2 + parseInt(s[k], 10);
        }
        ret = String(accum) + ret;
	    }
	    return ret;
		},

    /*FUNCIONES DE GESTION DE REGISTROS*/
    /*Actualiza el valor de un registro*/
    updateReg(comp, elem, type){
      for (var i = 0; i < architecture.components[comp].elements.length; i++) {
        if(type == "integer"){
          if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^0x/)){
            var value = this.newValue.split("x");
            architecture.components[comp].elements[i].value = bigInt(value[1], 16);
          }
          else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^(\d)+/)){
            architecture.components[comp].elements[i].value = bigInt(parseInt(this.newValue) >>> 0, 10);
          }
          else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^-/)){
            architecture.components[comp].elements[i].value = bigInt(parseInt(this.newValue) >>> 0, 10);
          }
        }
        else if(type =="floating point"){
          if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^0x/)){
            architecture.components[comp].elements[i].value = this.hex2double(this.newValue);
          }
          else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^(\d)+/)){
            architecture.components[comp].elements[i].value = parseFloat(this.newValue, 10);
          }
          else if(architecture.components[comp].elements[i].name == elem && this.newValue.match(/^-/)){
            architecture.components[comp].elements[i].value = parseFloat(this.newValue, 10);
          }
        }
        
      }
      this.newValue = '';
    },


    /*FUNCIONES DE EJECUCION*/
    /*Funcion que ejecuta instruccion a instruccion*/
    executeInstruction(){
      var error = 0;
      var index;

      var instruction = instructions[executionIndex].Pseudo;

      var instructionParts = instruction.split(' ');
      var instructionObjet = [];


      /*PREGUNTAR ESTO VA EN COMPILACION*/
      /*Busca errores en la instruccion a ejecutar*/
      for (i = 0; i < architecture.instructions.length; i++) {
        if(architecture.instructions[i].name == instructionParts[0]){
          index = i;
          break;
        }
        if((architecture.instructions[i].name != instructionParts[0]) && (i == architecture.instructions.length-1)){
          error = 1;
        }
      }

      /*Busca erroes en los registros que se usan*/
      for (i = 1; i < instructionParts.length; i++){
        var valReg = 0;
        for (j = 0; j < architecture.components.length && valReg == 0; j++) {
          for (z = 0; z < architecture.components[j].elements.length; z++){
            if(instructionParts[i] == architecture.components[j].elements[z].name){
              instructionObjet.push({name: instructionParts[i], value: architecture.components[j].elements[z].value})
              valReg = 1;
              break;
            }
            if((j == architecture.components.length-1) && (z == architecture.components[j].elements.length-1) && (instructionParts[i] != architecture.components[j].elements[z].name)){
              error = 1;
            }
          }
        }
      }

      if(error == 0){
        var signatureParts = (architecture.instructions[index].signatureRaw).split(' ');

        for (i = 1; i < signatureParts.length; i++){
          eval(signatureParts[i] + " = " + instructionObjet[i-1].value);
        }

        eval(architecture.instructions[index].definition);

        var defParts = (architecture.instructions[index].definition).split('=');
        var resultIndex;
        for (i = 0; i < signatureParts.length; i++) {
          if(signatureParts[i] == defParts[0]){
            resultIndex = i;
          }
        }

        var valReg = 0;
        for (j = 0; j < architecture.components.length && valReg == 0; j++) {
          for (z = 0; z < architecture.components[j].elements.length; z++){
            if(instructionParts[resultIndex] == architecture.components[j].elements[z].name){
              if(architecture.components[j].type == "integer"){
                eval("architecture.components[j].elements[z].value = bigInt(parseInt("+defParts[0]+") >>> 0, 10).value");
              }
              if(architecture.components[j].type == "floating point"){
                eval("architecture.components[j].elements[z].value = parseFloat("+defParts[0]+", 10)");
              }
              valReg = 1;
              break;
            }
          }
        }

        instructions[executionIndex]._rowVariant = '';
        executionIndex++;
        if(executionIndex >= instructions.length){
          executionIndex = 0;
          app._data.alertMessaje = 'The execution of the program has finished';
          app._data.type ='success';
          app._data.dismissCountDown = app._data.dismissSecs;
        }
        else{
          instructions[executionIndex]._rowVariant = 'success';
        }
      }
      else{
        executionIndex = 0;
        app._data.alertMessaje = 'Invalid instruction';
        app._data.type ='danger';
        app._data.dismissCountDown = app._data.dismissSecs;
      }
    },

    /*Funcion que ejecuta todo el programa*/
    executeProgram(){
      console.log("executeProgram");
    },

    /*Funcion que resetea la ejecucion*/
    reset(){
      instructions[executionIndex]._rowVariant = '';
      executionIndex = 0;
      instructions[executionIndex]._rowVariant = 'success';
      for (var i = 0; i < architecture_hash.length; i++) {
        for (var j = 0; j < architecture.components[i].elements.length; j++) {
          architecture.components[i].elements[j].value = architecture.components[i].elements[j].default_value;
        }
      }
    },
  },
  created(){
    this.load_arch_available();
  }
})

/*Cambia la vision de los registros*/
$("#selectData").change(function(){
  var value = document.getElementById("selectData").value;
  if(value == "CPU-FP Registers"){
    app._data.register_type = 'floating point';
    $("#registers").show();
    $("#memory").hide();
  }
  if(value == "CPU-INT Registers") {
    app._data.register_type = 'integer';
    $("#registers").show();
    $("#memory").hide();
  }
});

/*Obtiene la instruccion asociada al select*/
$(document).on('click','.fieldsSel',function(){
  var id = this.id;
  var inst = id.split('-');
  app._data.instSel = inst[inst.length-1];
});