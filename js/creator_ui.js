
/*
 *  Copyright 2018-2024 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
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


  function show_notification ( msg, type )
  {
     // show notification
     var alertMessage = msg ;
     var type         = type ;
     app.$bvToast.toast(alertMessage, {
        variant: type,
        solid: true,
        toaster: "b-toaster-top-center",
        autoHideDelay: app._data.notificationTime,
        noAutoHide: (type == 'danger')
     }) ;

     // add notification to the notification summary
     var date = new Date() ;
     notifications.push({ mess: alertMessage,
                          color: type,
                          time: date.getHours()+":"+date.getMinutes()+":"+date.getSeconds(),
                          date: date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear() }) ;

     return true ;
  }


  /*
   *  Loading
   */

  var loading_handler = null;

  function show_loading()
  {
     // if loading is programmed, skip
     if (loading_handler != null) {
         return ;
     }

     // after half second show the loading spinner
     loading_handler = setTimeout(function(){
             $("#loading").show() ;
             loading_handler = null ;
          }, 500) ;
  }

  function hide_loading ( )
  {
      // if loading is programmed, cancel it
      if (loading_handler != null) {
          clearTimeout(loading_handler);
          loading_handler = null;
      }

      // disable loading spinner
      $("#loading").hide();
  }


  /*
   *  Glowing
   */

  function btn_glow ( btn_name, post_label )
  {
    if (0 == run_program)
    {
      var buttonDec = '#popoverValueContent' + btn_name + post_label ;
      var buttonHex = '#popoverValueContent' + btn_name;

      $(buttonDec).attr("style", "background-color:#c2c2c2;");
      $(buttonHex).attr("style", "background-color:#c2c2c2;");

      setTimeout(function() {
        $(buttonDec).attr("style", "");
        $(buttonHex).attr("style", "");
      }, 500);
    }
  }

