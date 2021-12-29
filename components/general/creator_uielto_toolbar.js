/*
 *  Copyright 2018-2022 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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


  /* jshint esversion: 6 */

  var uielto_toolbar = {

        props:      {
                      components:                   { type: String,  required: true }
                    },

        data:       function () {
                      return {

                      }
                    },

        created()   {
                      var render_result = render(this._props.components);
                      document.getElementById('toolbar_1').innerHTML = render_result;
                    },

        template:   '<b-container fluid align-h="center" class="menu my-3 mx-0">' +
                    '  <b-row>' +
                    '    <span id="toolbar_1"></span>' +
                    //render(this._props.components) +
                    '  </b-row>' +
                    '</b-container>'

  }

  Vue.component('uielto-toolbar', uielto_toolbar) ;



  var translate = {
                    "[":                    begin_button_group,
                    "]":                    end_button_group,
                    "btn_architecture":     button_architecture,
                    "btn_assembly":         button_assembly,
                    "btn_simulator":        button_simulator,
                    "btn_reset":            button_reset,
                    "btn_instruction":      button_instruction,
                    "btn_run":              button_run,
                    "btn_stop":             button_stop,
                    "btn_examples":         button_examples,
                    "btn_calculator":       button_calculator,
                    "btn_configuration":    button_configuration,
                    "btn_information":      button_information,
                    "|":                    separator
                  };

  function render(components){

    var result = ''

    var components_array = components.split(',');

    for (var i = 0; i < components_array.length; i++) {
      if (typeof translate[components_array[i]] !== 'undefine') {
        result = result + translate[components_array[i]]();
      }
    }
    console.log(result)
    return result;
  }




  function begin_button_group(){
    return '<div class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-xs-12 px-2 py-1"><b-container fluid><b-row>'
  }

  function end_button_group(){
    return '</b-row></b-container></div>'
  }

  function separator(){
    return '<div class="w-100 d-block d-sm-none"></div>'
  }

  function button_architecture(){
    return  '<b-button class="col btn btn-outline-secondary menuGroup btn-sm arch_btn h-100 mr-1 text-truncate"' + 
            '          id="arch_btn_sim" ' +
            '          @click="change_UI_mode(\'architecture\')"> ' +
            '  <span class="fas fa-sitemap"></span> ' +
            '  Architecture' +
            '</b-button>'
  }

  function button_assembly(){
    return  '<b-button class="col btn btn-outline-secondary menuGroup btn-sm assembly_btn h-100 text-truncate"' +
            '          id="assembly_btn_sim"' +
            '          @click="change_UI_mode(\'assembly\')">' +
            '  <span class="fas fa-hashtag"></span>' +
            '  Assembly' +
            '</b-button>'
  }

  function button_simulator(){
    return ''
  }

  function button_reset(){
    return  '<b-button @click="reset(true)" ' +
            '          class="col btn btn-outline-secondary actionsGroup btn-sm h-100 mr-1 text-truncate">' +
            '  <span class="fas fa-power-off"></span>' +
            '  Reset' +
            '</b-button>'
  }

  function button_instruction(){
    return  '<b-button accesskey="a" ' +
            '          class="col btn btn-outline-secondary actionsGroup btn-sm h-100 mr-1 text-truncate" ' +
            '          @click="executeInstruction" id="inst">' +
            '  <span class="fas fa-fast-forward"></span>' +
            '  Inst.' +
            '</b-button>' +
            '<b-tooltip target="inst" title="Press [Alt] + A" v-if="browser==\'Chrome\'"></b-tooltip>' +
            '<b-tooltip target="inst" title="Press [Alt] [Shift] + A" v-if="browser==\'Firefox\'"></b-tooltip>' +
            '<b-tooltip target="inst" title="Press [Control] [Alt/Option] + A" v-if="browser==\'Mac\'"></b-tooltip>'
  }

  function button_run(){
    return  '<b-button class="col btn btn-outline-secondary actionsGroup btn-sm h-100 mr-1" ' +
            '          @click="executeProgram(true)" ' +
            '          v-if="runExecution == false" ' +
            '          id="playExecution">' +
            '  <span class="fas fa-play"></span>' +
            '  Run' +
            '</b-button>'
  }

  function button_stop(){
    return  '<b-button class="col btn btn-outline-secondary actionsGroup btn-sm h-100 text-truncate" ' +
            '          @click="stopExecution" ' +
            '          id="stopExecution"' +
            '          style="display: none">' +
            '  <span class="fas fa-stop"></span>' +
            '  Stop' +
            '</b-button>'
  }

  function button_examples(){
    return  '<b-button class="col btn btn-outline-secondary menuGroup btn-sm h-100 mr-1 text-truncate"' +
            '          v-b-modal.examples2>' +
            '  <span class="fas fa-file-alt"></span>' +
            '  Examples' +
            '</b-button>'
  }

  function button_calculator(){
    return  '<b-button class="col btn btn-outline-secondary menuGroup btn-sm h-100 text-truncate"' +
            '          v-b-modal.calculator>' +
            '  <span class="fas fa-calculator"></span>' +
            '  Calculator' +
            '</b-button>'
  }

  function button_configuration(){
    return  '<b-button class="col btn btn-outline-secondary menuGroup btn-sm h-100 mr-1 text-truncate" ' +
            '          id="conf_btn_sim" ' +
            '          v-b-modal.configuration>' +
            '  <span class="fa fa-cogs"></span>' +
            '  Configuration' +
            '</b-button>'
  }

  function button_information(){
    return  '<b-button class="col btn btn-outline-secondary btn-sm h-100 infoButton text-truncate"' +
            '          id="info_sim">' +
            '  <span class="fas fa-info-circle"></span> ' +
            '  Info' +
            '</b-button>'
  }