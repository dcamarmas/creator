/*Botones menu de configuracion*/
$("#load_arch").click(function(){
  $("#load_menu_arch").show();
  $("#save_menu_arch").hide();
  $("#view_components").hide();
});

$("#save_arch").click(function(){
  $("#load_menu_arch").hide();
  $("#save_menu_arch").show();
  $("#view_components").hide();
});

$("#view_arch").click(function(){
  $("#load_menu_arch").hide();
  $("#save_menu_arch").hide();
  $("#view_components").show();
});

/*Botones menu de instrucciones*/
$("#load_assDef").click(function(){
  $("#load_instructions_set").show();
  $("#save_menu_assDef").hide();
  $("#new_instruction_set").hide();
});

$("#save_assDef").click(function(){
  $("#load_instructions_set").hide();
  $("#save_menu_assDef").show();
  $("#new_instruction_set").hide();
});

$("#new_assDef").click(function(){
  $("#load_instructions_set").hide();
  $("#save_menu_assDef").hide();
  $("#new_instruction_set").show();
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
$("#memory_btn").click(function(){
  $("#registers").hide();
  $("#memory").show();
});

$("#selectData").click(function(){
  $("#registers").show();
  $("#memory").hide();
});