/*
 *  Copyright 2018-2021 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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
                             version:         	{ type: String, required: true },
                             architecture_name: { type: String, required: true }
                          },

              template:   '	<b-navbar toggleable="sm" class="header my-0 mx-1 py-0 px-2">' +
													'	  <b-navbar-brand class="p-0 m-0" href=".">' +
													'	      <div class="container">' +
													'	        <div class="row">' +
													'	          <div class="headerText col-auto my-0 py-0 pr-1 text-uppercase">' +
													'				      <h1>Creator <b-badge pill variant="secondary">{{version}}</b-badge></h1>' +
													'			      </div>' +
													'	          <div class="headerText col-auto my-0 p-0 ml-2">{{architecture_name}}</div>' +
													'	          <div class="w-100"></div>' +
													'	          <div class="headerName col-auto my-0 py-0 font-weight-bold mx-1">' +
													'	            didaCtic and geneRic assEmbly progrAmming simulaTOR' +
													'	          </div>' +
													'	        </div>' +
													'	      </div>' +
													'	  </b-navbar-brand>' +
													'	' +
													'	  <b-navbar-toggle target="nav_collapse" aria-label="Open/Close more information"></b-navbar-toggle>' +
													'	' +
													'	  <b-collapse is-nav id="nav_collapse">' +
													'	    <b-navbar-nav class="ml-auto">' +
													'	      <b-nav-item class="mb-0 pb-0 nopadding" target="_blank" href=\'https://www.arcos.inf.uc3m.es/\'>' +
													'	      	<img alt="ARCOS" class="nopadding headerLogo" src="./images/arcos.svg">' +
													'	      </b-nav-item>' +
													'	' +
													'	      <b-nav-item class="mb-0 pb-0 nopadding" target="_blank" href=\'https://www.inf.uc3m.es/\'>' +
													'	      	<img alt="Computer Science and Engineering Departament" ' +
													'	             class="nopadding headerLogo" ' +
													'	             src="./images/dptoinf.png">' +
													'	      </b-nav-item>' +
													'	    </b-navbar-nav>' +
													'	  </b-collapse>' +
													'	</b-navbar>'
       	}

        Vue.component('navbar-creator', uielto_navbar) ;


