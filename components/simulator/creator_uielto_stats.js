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

        var uielto_stats = {

        /*Import Graph component*/
		    components: {
		      						apexchart: VueApexCharts,
		    },

			  props:      {
											data_mode:   { type: String, required: true },
											stats: 			 { type: Array,  required: true },
											total_stats: { type: Number, required: true },
											stats_value: { type: Number, required: true },
										},
										
				data: 			function () {
											return {
          							/*Stats table fields*/
									      statsFields: {
									        type: {
									          label: 'Type',
									          sortable: true
									        },
									        number_instructions: {
									          label: 'Number of instructions',
									          sortable: true
									        },
									        percentage: {
									          label: 'Percentage',
									          sortable: true
									        }
									      },

									      /*Stats Graph configure*/
									      chartOptions: {
									        colors:['red', 'blue', 'yellow', 'purple', 'green', 'orange', 'gray', 'pink', 'teal', 'black', 'lime', 'indigo', 'cyan'],
									        chart: {
									          id: 'graphic',
									          type: 'donut',
									        },
									        labels: ["Arithmetic integer", "Arithmetic floating point", "Logic", "Transfer between registers", "Memory access", "Comparison", "I/O", "Syscall", "Control", "Function call", "Conditional bifurcation", "Unconditional bifurcation", "Other"],
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

      	template:   '	<div class="col-lg-12 col-sm-12" id="stats" v-if="data_mode == \'stats\'">' +
										'	  <div class="col-lg-12 col-sm-12">' +
										'	' +
										'	    <b-tabs content-class="mt-3">' +
										'	      <b-tab title="Ghaphic" active>' +
										'	        <div id="chart" class="stats">' +
										'	          <apexchart id="graphic" ' +
										'	                     ref="chart" ' +
										'	                     type="donut" ' +
										'	                     :options="chartOptions" ' +
										'	                     :series="stats_value" ' +
										'	                     height="150%" >' +
										'	          </apexchart>' +
										'	        </div>' +
										'	      </b-tab>' +
										'	' +
										'	      <b-tab title="Table">' +
										'	        <b-table striped ' +
										'	                 small ' +
										'	                 hover ' +
										'	                 :items="stats" ' +
										'	                 :fields="statsFields" ' +
										'	                 class="stats text-center">' +
										'	        </b-table>' +
										'	      </b-tab>' +
										'	    </b-tabs>' +
										'	  </div>' +
										'	</div>'
		  
				}

        Vue.component('stats', uielto_stats)