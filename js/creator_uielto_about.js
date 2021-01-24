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

        class uielto_about extends HTMLElement
        {
              // constructor
	      constructor ()
	      {
		    // parent
		    super();
	      }

              // render
	      render ( )
	      {
                  // get updated attributes
                  this.update_internal_attributes() ;

		  // set the HTML code
	  var o = '<b-card-group>' +
                  '' +
		  '  <b-card img-src="/creator/images/author_fgarcia.png" ' +
                  '          img-alt="author_fgarcia" img-top>' +
		  '  <b-card-text>' +
		  '	  <div class="authorName">' +
		  '	    <span class="h6">Félix García Carballeira</span>' +
		  '	  </div>' +
		  '	  <hr>' +
		  '	  <a aria-label="linkedin Felix"><span class="fab fa-linkedin"></span> linkedin</a>' +
		  '	  <hr>' +
		  '	  <a aria-label="r-gate Felix" target="_blank" ' +
                  '          href="https://www.researchgate.net/profile/Felix_Garcia-Carballeira">' +
		  '	  <span class="fab fa-researchgate"></span>' +
		  '	      r-gate' +
		  '	  </a>' +
		  '	  <hr>' +
		  '	  <a aria-label="GitHub Felix"><span class="fab fa-github"></span> github</a>' +
		  '  </b-card-text>' +
		  '  </b-card>' +
                  '' +
		  '  <b-card img-src="/creator/images/author_acaldero.png" ' +
                  '          img-alt="author_acaldero" img-top>' +
		  '  <b-card-text>' +
		  '	  <div class="authorName">' +
		  '	    <span class="h6">Alejandro Calderón Mateos</span>' +
		  '	  </div>' +
		  '	  <hr>' +
		  '	  <a aria-label="linkedin Alejandro" target="_blank" ' +
                  '          href="https://www.linkedin.com/in/alejandro-calderon-mateos/">' +
		  '	  <span class="fab fa-linkedin"></span> ' +
		  '	    linkedin' +
		  '	  </a>' +
		  '	  <hr>' +
		  '	  <a aria-label="r-gate Alejandro" target="_blank" ' +
                  '          href="https://www.researchgate.net/profile/Alejandro_Calderon2" >' +
		  '	  <span class="fab fa-researchgate"></span> ' +
		  '	    r-gate' +
		  '	  </a>' +
		  '	  <hr>' +
		  '	  <a aria-label="GitHub Alejandro" target="_blank" ' +
                  '          href="https://github.com/acaldero/wepsim">' +
		  '	  <span class="fab fa-github"></span> ' +
		  '	    github' +
		  '	  </a>' +
		  '   </b-card-text>' +
		  '   </b-card>' +
                  '' +
		  '   <b-card img-src="/creator/images/author_dcamarmas.png" ' +
                  '           img-alt="author_dcamarmas" img-top>' +
		  '   <b-card-text>' +
		  '	  <div class="authorName">' +
		  '	    <span class="h6">Diego Camarmas Alonso</span>' +
		  '	  </div>' +
		  '	  <hr>' +
		  '	  <a aria-label="linkedin Diego" target="_blank"' +
                  '          href="https://www.linkedin.com/in/dcamarmas">' +
		  '	  <span class="fab fa-linkedin"></span>' +
		  '	    linkedin' +
		  '	  </a>' +
		  '	  <hr>' +
		  '	  <a aria-label="r-gate Diego"><span class="fab fa-researchgate"></span> r-gate</a>' +
		  '	  <hr>' +
		  '	  <a aria-label="GitHub Diego" href="https://github.com/dcamarmas" target="_blank">' +
		  '	    <span class="fab fa-github"></span>' +
		  '	      github' +
		  '	  </a>' +
		  '   </b-card-text>' +
		  '   </b-card>' +
                  '' +
		  '</b-card-group>' ;

		  this.innerHTML = o ;
	      }

	      connectedCallback ()
	      {
		    this.render() ;
	      }

	      attributeChangedCallback (name, oldValue, newValue)
	      {
		    this.render() ;
	      }

              // attributes
              static get observedAttributes()
	      {
	            return [ 'name' ] ;
	      }

              update_internal_attributes ( )
              {
                    // name: based on https://gist.github.com/gordonbrander/2230317
                    this.name_str = this.getAttribute('name') ;
                    if (this.name_str === null) {
                        this.name_str = 'id_' + Math.random().toString(36).substr(2, 9);
                    }
              }

	      get name ( )
	      {
                   return this.getAttribute('name') ;
	      }

	      set name ( value )
	      {
                   this.setAttribute('name', value) ;
	      }
        }


        if (typeof window !== "undefined") {
  	    window.customElements.define('uielto-about', uielto_about) ;
        }

