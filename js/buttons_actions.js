/*Botones menu de configuracion*/
$("#load_arch_default").click(function(){
  $("#available_arch").show();
  $("#load_menu_arch").hide();
  $("#save_menu_arch").hide();
  $("#new_components").hide();
});

$("#load_arch").click(function(){
  $("#available_arch").hide();
  $("#load_menu_arch").show();
  $("#save_menu_arch").hide();
  $("#new_components").hide();
});

$("#save_arch").click(function(){
  $("#available_arch").hide();
  $("#load_menu_arch").hide();
  $("#save_menu_arch").show();
  $("#new_components").hide();
});

$("#new_arch").click(function(){
  $("#available_arch").hide();
  $("#load_menu_arch").hide();
  $("#save_menu_arch").hide();
  $("#new_components").show();
});

/*Botones modos*/
$(".assDef_btn").click(function(){
  $("#simulator").hide();
  $("#assDefinition").show();
  $("#assembly").hide();
  $("#architecture_menu").hide();
});

$(".assembly_btn").click(function(){
  $("#simulator").hide();
  $("#assDefinition").hide();
  $("#assembly").show();
  $("#architecture_menu").hide();
});

$(".simulator_btn").click(function(){
  $("#simulator").show();
  $("#assDefinition").hide();
  $("#assembly").hide();
  $("#architecture_menu").hide();
});

$(".arch_btn").click(function(){
  $("#simulator").hide();
  $("#assDefinition").hide();
  $("#assembly").hide();
  $("#architecture_menu").show();
});

/*Selector de modo de datos*/
$("#selectData").change(function(){
  var value = document.getElementById("selectData").value;
  if(value == "CPU-FP Registers"){
  	$("#int_registers").hide();
		$("#fp_registers").show();
		$("#memory").hide();
  }
  if(value == "CPU-INT Registers") {
  	$("#int_registers").show();
		$("#fp_registers").hide();
		$("#memory").hide();
  }
});

$("#memory_btn").click(function(){
  $("#int_registers").hide();
  $("#fp_registers").hide();
  $("#memory").show();
});