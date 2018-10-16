$(document).ready(function(){

	$("#simulator").show();
  $("#microcode").hide();
  $("#assembly").hide();
  
  $("#int_registers").show();
  $("#fp_registers").hide();
  $("#memory").hide();

});

$(".micro_btn").click(function(){
  $("#simulator").hide();
  $("#microcode").show();
  $("#assembly").hide();
});

$(".assembly_btn").click(function(){
  $("#simulator").hide();
  $("#microcode").hide();
  $("#assembly").show();
});

$(".simulator_btn").click(function(){
  $("#simulator").show();
  $("#microcode").hide();
  $("#assembly").hide();
});

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
    if(value == "MM-Memory") {
    	$("#int_registers").hide();
  		$("#fp_registers").hide();
  		$("#memory").show();
    }
});