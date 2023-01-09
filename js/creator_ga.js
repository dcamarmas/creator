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


  /* 
   * Google Analytics
   */

  var is_ga_initialize = false ;

  function creator_ga ( category, action, label )
  {
    if (typeof ga !== "undefined") {
      if (is_ga_initialize == false)
      {
        ga('create', 'UA-186823627-2', 'auto') ;
        ga('set', 'transport', 'beacon') ;
        is_ga_initialize = true ;
      }

      ga('send', 'event', category, action, label) ;
    }

    if (typeof gtag !== "undefined") {

      gtag('event',
            action,
            {
              'event_category' : "creator_"+category,
              'event_label' : label
            });
    }
  }

