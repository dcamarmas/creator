
/*
 *  Copyright 2018-2024 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

  var uielto_navbar = {
    
    props:      {
                   version:           { type: String, required: true },
                   architecture_name: { type: String, required: true }
                },

    data:       function () {
                  return {
                    
                  }
                },

    methods:    {
                  //Load CREATOR version from package JSON
                  load_num_version(){
                    $.getJSON('package.json', function(cfg){
                      creator_information = cfg;
                      app._data.version = cfg.version;
                    });
                  }
                },

    template:   ' <b-navbar toggleable="sm" class="header my-0 mx-1 py-0 px-2">' +
                '   <b-navbar-brand class="p-0 m-0" href=".">' +
                '' +
                '       <b-container fluid align-h="center" class="mx-0 px-0">' +
                '         <b-row cols="2" align-h="center">' +
                '           <b-col class="headerText col-auto my-0 py-0 pr-1 text-uppercase">' +
                '             <h1>Creator <b-badge pill variant="secondary">{{version}}</b-badge></h1>' +
                '           </b-col>' +
                '' +
                '           <b-col class="headerText col-auto my-0 p-0 ml-2">' +
                '             {{architecture_name}}' +
                '           </b-col>' +
                '         </b-row>' +
                '       </b-container>' +
                '' +
                '       <b-container fluid align-h="center" class="mx-0 px-0">' +
                '         <b-row cols="1" align-h="center">' +
                '           <b-col class="headerName col-auto my-0 py-0 font-weight-bold mx-1">' +
                '             didaCtic and geneRic assEmbly progrAmming simulaTOR' +
                '           </b-col>' +
                '         </b-row>' +
                '       </b-container>' +
                '   </b-navbar-brand>' +
                ' ' +
                '   <b-navbar-toggle target="nav_collapse" aria-label="Open/Close more information"></b-navbar-toggle>' +
                '     <b-collapse is-nav id="nav_collapse">' +
                '       <b-navbar-nav class="ml-auto">' +
                '         <b-nav-item class="mb-0 pb-0 p-0">' +
                '           <b-button class="btn btn-outline-secondary btn-sm btn-block buttonBackground h-100"' +
                '                     v-b-modal.about>' +
                '             <span class="fas fa-address-card"></span> ' +
                '             About us' +
                '           </b-button>' +
                '         </b-nav-item>' +
                ' ' +
                '       </b-navbar-nav>' +
                '     </b-collapse>' +
                '   </b-navbar-toggle>' +
                ' </b-navbar>'
  }

  Vue.component('navbar-creator', uielto_navbar) ;