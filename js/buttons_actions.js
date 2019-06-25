/*
 *  Copyright 2018-2019 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 *
 */



/*Change view*/
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

/*Change data view*/
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