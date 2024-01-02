
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

  var uielto_clk_cycles_plot = {

  /*Import Graph component*/
  components: {
                apexchart: VueApexCharts,
  },

  props:      {
                clk_cycles_value: { type: Number, required: true }
              },
              
  data:       function () {
                return {
                  //clk_cycles Graph configure
                  chartOptions: {
                    chart: {
                      id: 'clk_plot',
                      type: 'bar'
                    },
                    labels: ["Arithmetic floating point", "Arithmetic integer", "Comparison", "Conditional bifurcation", "Control", "Function call", "I/O", "Logic", "Memory access", "Other", "Syscall", "Transfer between registers", "Unconditional bifurcation"],
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
                      categories: ["Arithmetic floating point", "Arithmetic integer", "Comparison", "Conditional bifurcation", "Control", "Function call", "I/O", "Logic", "Memory access", "Other", "Syscall", "Transfer between registers", "Unconditional bifurcation"],
                    },
                    yaxis: {
                      title: {
                        text: 'CLK Cycles'
                      }
                    },
                    tooltip: {
                      y: {
                        formatter: function (val) {
                          return "CLK Cycles: " + val
                        }
                      }
                    }
                  }
                }
              },

  template:   ' <div class="stats px-0">' +
              '  <apexchart ref="clk_cycles_plot"' +
              '             type="bar" ' +
              '             :options="chartOptions" ' +
              '             :series="clk_cycles_value" ' +
              '             height="150%" >' +
              '   </apexchart>' +
              ' </div>'

  }

  Vue.component('plot-clk-cycles', uielto_clk_cycles_plot) ;