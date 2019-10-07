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


  /*
   * Notifications
   */

  function show_notification ( msg, type ) 
  {
    // show notification
    app._data.alertMessage = msg ;
    app._data.type         = type ;
    app.$bvToast.toast(app._data.alertMessage, {
      variant: app._data.type,
      solid: true,
      toaster: "b-toaster-top-center",
      autoHideDelay: app._data.notificationTime,
    });

    // add notification to the notification summary
    var date = new Date();
    notifications.push({ mess: app._data.alertMessage, 
                         color: app._data.type, 
                         time: date.getHours()+":"+date.getMinutes()+":"+date.getSeconds(), 
                         date: date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear() }); 
    return true ;
  }


  /*
   * Loading...
   */

  var toHandler = null;

  function show_loading(){
    // if loading is programmed, skip
    if(toHandler != null){
      return;
    }

    // after half second show the loading spinner 
    toHandler = setTimeout(function(){
      $(".loading").show();
      toHandler = null;
    }, 500);
  }

  function hide_loading(){
    // if loading is programmed, cancel it
    if(toHandler != null){
      clearTimeout(toHandler);
      toHandler = null;
    }

    // disable loading spinner
    $(".loading").hide();
  }

