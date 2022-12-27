/*
 *  Copyright 2018-2023 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

  var uielto_new_architecture = {

    props:      {

                },

    data:       function () {
                  return {
                    
                  }
                },

    methods:    {
                  //Create a new architecture
                  new_arch()
                  {
                    //Refresh UI
                    uielto_toolbar_btngroup.methods.change_UI_mode('simulator');
                    uielto_data_view_selector.methods.change_data_view('registers', 'int');
                    hide_loading();
                  }
                },

    template:   '<b-card no-body class="overflow-hidden arch_card architectureCard">' +
                '  <b-row no-gutters' +
                '         @click="new_arch">' +
                '    <b-col sm="12" class="center w-100 my-2">' +
                '      <b-card-img src="./images/new_icon.png" ' +
                '                  alt="new icon" ' +
                '                  thumbnail fluid'+ 
                '                  class="w-75 rounded-0 architectureImg">' +
                '      </b-card-img>' +
                '    </b-col>' +
                '' +
                '    <b-col sm="12">' +
                '      <b-card-body title="New Architecture"' +
                '                   title-tag="h2" >' +
                '        <b-card-text class="justify">' +
                '          Allows you to define an architecture from scratch.' +
                '        </b-card-text>' +
                '      </b-card-body>' +
                '    </b-col>' +
                '  </b-row>' +
                '</b-card>'
  }

  Vue.component('new-architecture', uielto_new_architecture) ;