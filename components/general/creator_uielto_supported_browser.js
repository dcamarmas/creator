
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

  var uielto_browser = {

    props:      {
                  id:          { type: String, required: true }
                },

    data:       function () {
                  return {

                  }
                },

    methods:    {

                },

    template:   '<b-modal  :id ="id" title="Browser not supported" hide-footer>' +
                '  <span class="h6">You are using an unsupported browser, please use one of the following:</span>' +
                '  <br>' +
                '  <b-list-group>' +
                '' +
                '    <b-list-group-item class="d-flex justify-content-between align-items-center">' +
                '      Google Chrome 70+' +
                '      <b-badge pill class="browserBadge">' +
                '        <b-img src="./images/chrome.png" ' +
                '               class="shadow broserIcon" ' +
                '               rounded="circle" ' +
                '               fluid alt="Responsive image">' +
                '        </b-img>' +
                '      </b-badge>' +
                '    </b-list-group-item>' +
                ' ' +
                '    <b-list-group-item class="d-flex justify-content-between align-items-center">' +
                '      Mozilla Firefox 60+' +
                '      <b-badge pill class="browserBadge">' +
                '        <b-img src="./images/firefox.png" ' +
                '               class="shadow broserIcon" ' +
                '               rounded="circle" ' +
                '               fluid alt="Responsive image">' +
                '        </b-img>' +
                '      </b-badge>' +
                '    </b-list-group-item>' +
                ' ' +
                '    <b-list-group-item class="d-flex justify-content-between align-items-center">' +
                '      Apple Safari 12+' +
                '      <b-badge pill class="browserBadge">' +
                '        <b-img src="./images/safari.png" ' +
                '               class="shadow broserIcon" ' +
                '               rounded="circle"' +
                '               fluid alt="Responsive image">' +
                '        </b-img>' +
                '      </b-badge>' +
                '    </b-list-group-item>' +
                '' +
                '  </b-list-group>' +
                '</b-modal>'
  }

  Vue.component('supported-browser', uielto_browser) ;