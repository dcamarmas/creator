/*
 *  Copyright 2018-2022 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
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

  var uielto_power_consumption_plot = {

  /*Import Graph component*/
  components: {
                apexchart: VueApexCharts,
  },

  props:      {
                power_consumption_value: { type: Number, required: true }
              },
              
  data:       function () {
                return {
                  //Power_consumption Graph configure
                  chartOptions: {
                    chart: {
                      id: 'graphic',
                      type: 'bar'
                    },
                    labels: ["Arithmetic integer", "Arithmetic floating point", "Logic", "Transfer between registers", "Memory access", "Comparison", "I/O", "Syscall", "Control", "Function call", "Conditional bifurcation", "Unconditional bifurcation", "Other"],
                    dataLabels: {
                      enabled: true
                    },
                    plotOptions: {
                      bar: {
                        horizontal: false,
                        columnWidth: '55%',
                        endingShape: 'rounded',
                        distributed: true,
                      },
                    },
                    fill: {
                      opacity: 1
                    },
                    legend: {
                      show: false
                    },
                    stroke: {
                      show: true,
                      width: 2,
                      colors: ['transparent']
                    },
                    xaxis: {
                      categories: ["Arithmetic integer", "Arithmetic floating point", "Logic", "Transfer between registers", "Memory access", "Comparison", "I/O", "Syscall", "Control", "Function call", "Conditional bifurcation", "Unconditional bifurcation", "Other"],
                    },
                    yaxis: {
                      title: {
                        text: 'CLK Cycles'
                      }
                    },
                    tooltip: {
                      y: {
                        formatter: function (val) {
                          return "Power Consumption: " + val
                        }
                      }
                    }
                  }
                }
              },

  template:   ' <div id="power_consumption_plot" class="stats px-0">' +
              '  <apexchart id="graphic"' +
              '             ref="power_consumption_plot"' +
              '             type="bar" ' +
              '             :options="chartOptions" ' +
              '             :series="power_consumption_value" ' +
              '             height="150%" >' +
              '   </apexchart>' +
              ' </div>'

  }

  Vue.component('plot-power-consumption', uielto_power_consumption_plot) ;