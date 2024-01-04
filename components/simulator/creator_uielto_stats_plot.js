
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

  var uielto_stats_plot = {

  /*Import Graph component*/
  components: {
                apexchart: VueApexCharts,
  },

  props:      {
                stats_value: { type: Number, required: true }
              },
              
  data:       function () {
                return {
                  
                  /*Stats Graph configure*/
                  chartOptions: {
                    colors:['red', 'blue', 'yellow', 'purple', 'green', 'orange', 'gray', 'pink', 'teal', 'black', 'lime', 'indigo', 'cyan'],
                    chart: {
                      id: 'stat_plot',
                      type: 'donut',
                    },
                    labels: ["Arithmetic floating point", "Arithmetic integer", "Comparison", "Conditional bifurcation", "Control", "Function call", "I/O", "Logic", "Memory access", "Other", "Syscall", "Transfer between registers", "Unconditional bifurcation"],
                    dataLabels: {
                      enabled: true
                    },
                    donut: {
                      labels: {
                        show: true,
                        total: {
                          show: true,
                          showAlways: true,
                          label: "Total",
                        },
                      },
                    },
                    fill: {
                      type: 'gradient',
                      gradient: {
                        shade: 'dark',
                        type: "horizontal",
                        shadeIntensity: 0.5,
                        gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
                        inverseColors: true,
                        opacityFrom: 1,
                        opacityTo: 1,
                        stops: [0, 50, 100],
                        colorStops: []
                      },
                      colors: ['red', 'blue', 'yellow', 'purple', 'green', 'orange', 'gray', 'pink', 'teal', 'black', 'lime', 'indigo', 'cyan'],
                    },
                    legend: {
                      formatter: function(val, opts) {
                        return val + " - " + opts.w.globals.series[opts.seriesIndex]
                      }
                    },
                    plotOptions: {
                      pie: {
                        donut: {
                          labels: {
                            show: true,
                            total: {
                              show: true,
                              showAlways: true,
                              color: 'black',
                              formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => {
                                  return a + b
                                }, 0)
                              }
                            }
                          }
                        }
                      }
                    },
                  },
                }
              },

  template:   ' <div class="stats px-0">' +
              '   <apexchart type="donut" ' +
              '              :options="chartOptions" ' +
              '              :series="stats_value" ' +
              '              height="150%" >' +
              '   </apexchart>' +
              ' </div>'

  }

  Vue.component('plot-stats', uielto_stats_plot) ;