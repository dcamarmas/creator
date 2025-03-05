
/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

  var uielto_instruction_help = {
    
    props:      {
                  id:                       { type: String, required: true },
                  architecture_name:        { type: String, required: true },
                  architecture:             { type: Object, required: true },
                  architecture_guide:       { type: String, required: true },
                  instruction_help_size:    { type: Object, required: true }
                   
                },

    data:       function () {
                  return {
                    //Help Filter
                    instHelpFilter: null,

                    //Help table
                    insHelpFields: ['name']
                  }
                },

    methods:   {
                  get_width(){
                    return this._props.instruction_help_size + "vw"
                  }
                },

    template:   '<b-sidebar :id="id" sidebar-class="border-left border-info px-3 py-2" right shadow' + 
                '           title="Instruction Help"' +
                '           :width="get_width()">' +
                ' ' +
                ' <b-form-input id="filter-input"' +
                '               v-model="instHelpFilter"' +
                '               type="search"' +
                '               placeholder="Search instruction"' +
                '               size=sm' +
                ' ></b-form-input>' +
                ' ' +
                ' <br>' +
                ' <a v-if="architecture_guide !=\'\'" target="_blank" :href="architecture_guide"><span class="fas fa-file-pdf"></span> {{architecture_name}} Guide</a>' +
                ' <br>' +
                ' ' +
                ' <b-table small :items="architecture.instructions" ' +
                '                :fields="insHelpFields" ' +
                '                class="text-left help-scroll-y my-3"' +
                '                :filter="instHelpFilter"' +
                '                thead-class="d-none">' +
                ' ' +
                '   <template v-slot:cell(name)="row">' +
                '     <h4>{{row.item.name}}</h4>' +
                '     <em>{{row.item.signatureRaw}}</em>' +
                '     <br>' +
                '     {{row.item.help}}' +
                '   </template>' +
                ' ' +
                ' </b-table>' +
                ' ' +
                '</b-sidebar'
  }


  var uielto_creatino_help = {
    
    props:      {
                  id:                       { type: String, required: true },
                  architecture_name:        { type: String, required: true },
                  architecture:             { type: Object, required: true },
                  architecture_guide:       { type: String, required: true },
                  instruction_help_size:    { type: Object, required: true }
                   
                },

    data:       function () {
                  return {
                    //Help Filter
                    instHelpFilter: null,

                    //Help table
                    insHelpFields: ['name'],

                    "arduinoJson": [
                      { "name": "cr_initArduino", "help": "Starts Arduino functions"},
                      { "name": "cr_digitalRead", "help": "Reads the value from a specified digital pin" },
                      { "name": "cr_pinMode", "help": "Configures the specified pin to behave as an input or an output" },
                      { "name": "cr_digitalWrite", "help": "Writes a HIGH or LOW value to a digital pin" },
                      { "name": "cr_analogRead", "help": "Reads the value from the specified analog pin" },
                      { "name": "cr_analogReadResolution", "help": "Sets the resolution of analogRead" },
                      { "name": "cr_analogWrite", "help": "Writes an analog value (PWM wave) to a pin" },
                      { "name": "cr_map", "help": "Re-maps a number from one range to another" },
                      { "name": "cr_constrain", "help": "Constrains a number to be within a range" },
                      { "name": "cr_abs", "help": "Computes the absolute value of a number" },
                      { "name": "cr_max", "help": "Finds the maximum of two values" },
                      { "name": "cr_min", "help": "Finds the minimum of two values" },
                      { "name": "cr_pow", "help": "Computes the value of a number raised to a power" },
                      { "name": "cr_bit", "help": "Returns the value of a bit at a specific position" },
                      { "name": "cr_bitClear", "help": "Clears (sets to 0) a bit at a specified position" },
                      { "name": "cr_bitRead", "help": "Reads a bit at a specified position" },
                      { "name": "cr_bitSet", "help": "Sets a bit to 1 at a specified position" },
                      { "name": "cr_bitWrite", "help": "Writes a bit to a specified position" },
                      { "name": "cr_highByte", "help": "Returns the high byte of a word" },
                      { "name": "cr_lowByte", "help": "Returns the low byte of a word" },
                      { "name": "cr_sqrt", "help": "Computes the square root of a number" },
                      { "name": "cr_sq", "help": "Squares a number" },
                      { "name": "cr_cos", "help": "Computes the cosine of an angle" },
                      { "name": "cr_sin", "help": "Computes the sine of an angle" },
                      { "name": "cr_tan", "help": "Computes the tangent of an angle" },
                      { "name": "cr_attachInterrupt", "help": "Attaches an interrupt to a pin" },
                      { "name": "cr_detachInterrupt", "help": "Detaches an interrupt from a pin" },
                      { "name": "cr_digitalPinToInterrupt", "help": "Maps a digital pin to the corresponding interrupt number" },
                      { "name": "cr_pulseIn", "help": "Reads a pulse (either HIGH or LOW) on a pin" },
                      { "name": "cr_pulseInLong", "help": "Reads a pulse (either HIGH or LOW) on a pin, with a longer timeout" },
                      { "name": "cr_shiftIn", "help": "Shifts in a byte of data one bit at a time" },
                      { "name": "cr_shiftOut", "help": "Shifts out a byte of data one bit at a time" },
                      { "name": "cr_interrupts", "help": "Enables interrupts" },
                      { "name": "cr_nointerrupts", "help": "Disables interrupts" },
                      { "name": "cr_isDigit", "help": "Checks if a character is a digit" },
                      { "name": "cr_isAlpha", "help": "Checks if a character is alphabetic" },
                      { "name": "cr_isAlphaNumeric", "help": "Checks if a character is alphanumeric" },
                      { "name": "cr_isAscii", "help": "Checks if a character is ASCII" },
                      { "name": "cr_isControl", "help": "Checks if a character is a control character" },
                      { "name": "cr_isPunct", "help": "Checks if a character is punctuation" },
                      { "name": "cr_isHexadecimalDigit", "help": "Checks if a character is a hexadecimal digit" },
                      { "name": "cr_isUpperCase", "help": "Checks if a character is uppercase" },
                      { "name": "cr_isLowerCase", "help": "Checks if a character is lowercase" },
                      { "name": "cr_isPrintable", "help": "Checks if a character is printable" },
                      { "name": "cr_isGraph", "help": "Checks if a character has a graphical representation" },
                      { "name": "cr_isSpace", "help": "Checks if a character is a space" },
                      { "name": "cr_isWhitespace", "help": "Checks if a character is whitespace" },
                      { "name": "cr_delay", "help": "Pauses the program for the specified amount of time (in milliseconds)" },
                      { "name": "cr_delayMicroseconds", "help": "Pauses the program for the specified amount of time (in microseconds)" },
                      { "name": "cr_randomSeed", "help": "Initializes the random number generator" },
                      { "name": "cr_random", "help": "Generates a random number" },
                      { "name": "cr_serial_available", "help": "Gets the number of bytes available for reading from the serial buffer" },
                      { "name": "cr_serial_availableForWrite", "help": "Gets the number of bytes available for writing in the serial buffer" },
                      { "name": "cr_serial_begin", "help": "Sets the data rate in bits per second (baud) for serial data transmission" },
                      { "name": "cr_serial_end", "help": "Disables serial communication" },
                      { "name": "cr_serial_find", "help": "Reads data from the serial buffer until a target string is found" },
                      { "name": "cr_serial_findUntil", "help": "Reads data from the serial buffer until a target string is found or a timeout occurs" },
                      { "name": "cr_serial_flush", "help": "Waits for the transmission of outgoing serial data to complete" },
                      { "name": "cr_serial_parseFloat", "help": "Reads the next valid float from the serial buffer" },
                      { "name": "cr_serial_parseInt", "help": "Reads the next valid integer from the serial buffer" },
                      { "name": "cr_serial_read", "help": "Reads incoming serial data" },
                      { "name": "cr_serial_readBytes", "help": "Reads characters from the serial buffer into an array" },
                      { "name": "cr_serial_readBytesUntil", "help": "Reads characters from the serial buffer into an array until a terminator character is found" },
                      { "name": "cr_serial_readString", "help": "Reads characters from the serial buffer into a String" },
                      { "name": "cr_serial_readStringUntil", "help": "Reads characters from the serial buffer into a String until a terminator character is found" },
                      { "name": "cr_serial_write", "help": "Writes binary data to the serial port" }
                    ]
                  }
                },

    methods:   {
                  get_width(){
                    return this._props.instruction_help_size + "vw"
                  }
                },

    template:   '<b-sidebar :id="id" sidebar-class="border-left border-info px-3 py-2" right shadow' + 
                '           title="Arduino functions Help"' +
                '           :width="get_width()">' +
                ' ' +
                ' <b-form-input id="filter-input"' +
                '               v-model="instHelpFilter"' +
                '               type="search"' +
                '               placeholder="Search instruction"' +
                '               size=sm' +
                ' ></b-form-input>' +
                ' ' +
                ' <br>' +
                '<a target="_blank" href="https://docs.arduino.cc/language-reference/#functions"><span class="fas fa-globe"></span> Arduino Guide</a>'+
                ' <br>' +
                ' ' +
                ' <b-table small :items="arduinoJson" ' +
                '                :fields="insHelpFields" ' +
                '                class="text-left help-scroll-y my-3"' +
                '                :filter="instHelpFilter"' +
                '                thead-class="d-none">' +
                ' ' +
                '   <template v-slot:cell(name)="row">' +
                '     <h4>{{row.item.name}}</h4>' +
                '     <em>{{row.item.signatureRaw}}</em>' +
                '     <br>' +
                '     {{row.item.help}}' +
                '   </template>' +
                ' ' +
                ' </b-table>' +
                ' ' +
                '</b-sidebar'
  }
  var uielto_board_help = {
    
    props:      {
                  id:                       { type: String, required: true },
                  architecture_name:        { type: String, required: true },
                  architecture:             { type: Object, required: true },
                  architecture_guide:       { type: String, required: true },
                  instruction_help_size:    { type: Object, required: true }
                   
                },

    data:       function () {
                  return {
                    //Help Filter
                    instHelpFilter: null,

                    //Help table
                    insHelpFields: [
                      { key: 'image', label: 'Image' }
                    ],

                    // Image
                    board_info: [
                      {
                        name: "ESP32-C3 ARCHITECTURE",
                        image: "https://docs.espressif.com/projects/esp-idf/en/v5.0/esp32c3/_images/esp32-c3-devkitc-02-v1-pinout.png" 
                      },
                    ]
                  }
                },

    methods:   {
                  get_width(){
                    return this._props.instruction_help_size + "vw"
                  }
                },

    template:   '<b-sidebar :id="id" sidebar-class="border-left border-info px-3 py-2" right shadow' + 
                '           title="Board Distribution Help"' +
                '           :width="get_width()">' +
                ' ' +
                ' <br>' +
                ' <a v-if="architecture_guide !=\'\'" target="_blank" :href="architecture_guide"><span class="fas fa-file-pdf"></span> {{architecture_name}} Guide</a>' +
                ' <br>' +
                ' ' +
                ' <b-table small :items="board_info" ' +
                '                :fields="insHelpFields" ' +
                '                class="text-left help-scroll-y my-3"' +
                '                :filter="instHelpFilter"' +
                '                thead-class="d-none">' +
                '<template #cell(image)="data">'+
                '<div>'+
                ' <h5 class="font-weight-bold mb-2">{{ data.item.name }}</h5>'+
                '<img :src="data.item.image" alt="Board Image" class="img-fluid mt-2" style="max-width:300 px;"/>'+
                '    </div>'+
                '</template>'+
                ' ' +
                '   <template v-slot:cell(name)="row">' +
                '     <h4>{{row.item.name}}</h4>' +
                '     <em>{{row.item.signatureRaw}}</em>' +
                '     <br>' +
                '     {{row.item.help}}' +
                '   </template>' +
                ' ' +
                ' </b-table>' +
                ' ' +
                '</b-sidebar'
  }

  Vue.component('sidebar-creatino_help', uielto_creatino_help) ;
  Vue.component('sidebar-board_help', uielto_board_help) ;
  Vue.component('sidebar-instruction-help', uielto_instruction_help) ;