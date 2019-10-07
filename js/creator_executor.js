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


      function reset ( )
      {
          for (var i = 0; i < instructions.length; i++) {
            instructions[i]._rowVariant = '';
          }
          executionIndex = 0;
          
          /*Reset stats*/
          totalStats=0;
          for (var i = 0; i < stats.length; i++){
            stats[i].percentage = 0;
            stats[i].number_instructions = 0;
          }

          /*Reset console*/
          mutexRead    = false;
          newExecution = true;

          for (var i = 0; i < architecture_hash.length; i++) {
            for (var j = 0; j < architecture.components[i].elements.length; j++) {
              if(architecture.components[i].double_precision == false){
                architecture.components[i].elements[j].value = architecture.components[i].elements[j].default_value;
              }

              else{
                var aux_value;
                var aux_sim1;
                var aux_sim2;

                for (var a = 0; a < architecture_hash.length; a++) {
                  for (var b = 0; b < architecture.components[a].elements.length; b++) {
                    if(architecture.components[a].elements[b].name == architecture.components[i].elements[j].simple_reg[0]){
                      aux_sim1 = bin2hex(float2bin(architecture.components[a].elements[b].default_value));
                    }
                    if(architecture.components[a].elements[b].name == architecture.components[i].elements[j].simple_reg[1]){
                      aux_sim2 = bin2hex(float2bin(architecture.components[a].elements[b].default_value));
                    }
                  }
                }

                aux_value = aux_sim1 + aux_sim2;
                architecture.components[i].elements[j].value = hex2double("0x" + aux_value);
              }
            }
          }

          architecture.memory_layout[4].value = backup_stack_address;
          architecture.memory_layout[3].value = backup_data_address;

          for (var i = 0; i < memory[memory_hash[0]].length; i++) {
            if(memory[memory_hash[0]][i].reset == true){
              memory[memory_hash[0]].splice(i, 1);
              i--;
            }
            else{
              memory[memory_hash[0]][i].Value = memory[memory_hash[0]][i].DefValue;
              for (var j = 0; j < memory[memory_hash[0]][i].Binary.length; j++) {
                memory[memory_hash[0]][i].Binary[j].Bin = memory[memory_hash[0]][i].Binary[j].DefBin;
              }
            }
          }

          for (var i = 0; i < memory[memory_hash[2]].length; i++) {
            if(memory[memory_hash[2]][i].reset == true){
              memory[memory_hash[2]].splice(i, 1);
              i--;
            }
            else{
              memory[memory_hash[2]][i].Value = memory[memory_hash[2]][i].DefValue;
              for (var j = 0; j < memory[memory_hash[2]][i].Binary.length; j++) {
                memory[memory_hash[2]][i].Binary[j].Bin = memory[memory_hash[2]][i].Binary[j].DefBin;
              }
            }
          }

          unallocated_memory = [];

          for (var i = 0; i < instructions.length; i++) {
            if(instructions[i].Label == "main"){
              instructions[i]._rowVariant = 'success';
            }
          }
      }

