
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

  var uielto_loading = {
    
    template:   ' <div>' +
                '   <div id="spinnerBack" class="spinnerBack" ref="spinnerBack"></div>' +
                '' +
                '   <div id="spinner" class="spinner">' +
                '     <div class="spinnerBox">' +
                '       <b-spinner variant="primary" class="spinnerIcon"></b-spinner>' +
                '     </div>' +
                '' +
                '     <div>' +
                '       <span class="text-primary">' +
                '         <strong>Loading...</strong>' +
                '       </span>' +
                '     </div>' +
                '   </div>' +
                '' +
                ' </div>'
  }

  Vue.component('spinner-loading', uielto_loading) ;