/*Botones modos*/
$(".assembly_btn").click(function(){
  $("#simulator").hide();
  $("#assembly").show();
  $("#architecture_menu").hide();
});

$(".simulator_btn").click(function(){
  $("#simulator").show();
  $("#assembly").hide();
  $("#architecture_menu").hide();
});

$(".arch_btn").click(function(){
  $("#simulator").hide();
  $("#assembly").hide();
  $("#architecture_menu").show();
});

/*Selector de modo de datos*/
$("#memory_btn").click(function(){
  $("#registers").hide();
  $("#memory").show();
  $("#stats").hide();
  app._data.nameReg = 'Registers';
});

$("#selectData").click(function(){
  $("#registers").show();
  $("#memory").hide();
  $("#stats").hide();
  app._data.nameReg = 'Registers';
});

$("#stats_btn").click(function(){
  $("#registers").hide();
  $("#memory").hide();
  $("#stats").show();
  app._data.nameReg = 'Registers';
});