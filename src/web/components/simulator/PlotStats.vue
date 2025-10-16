<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
                    Alejandro Calderon Mateos, Luis Daniel Casais Mezquida

This file is part of CREATOR.

CREATOR is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

CREATOR is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
-->

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import VueApexCharts from "vue3-apexcharts"
import type { ApexOptions } from "apexcharts"

import type { Stat } from "@/core/executor/stats.mts"
import { status } from "@/core/core"

export default defineComponent({
  components: {
    VueApexCharts,
  },

  props: {
    stats: { type: Map as PropType<Map<string, Stat>>, required: true },
    type: { type: String, required: true },
    dark: { type: Boolean, required: true },
  },

  // eslint-disable-next-line max-lines-per-function
  data() {
    const colors = [
      "red",
      "blue",
      "yellow",
      "purple",
      "green",
      "orange",
      "gray",
      "pink",
      "teal",
      "lime",
      "indigo",
      "cyan",
      "black",
    ]

    const labels = [...this.stats.keys()]

    return {
      /* Graph configuration */

      baseOptions: {
        colors,
        labels,
        dataLabels: {
          enabled: true,
        },
        chart: {
          background: "0", // transparent background
        },
      } as ApexOptions,

      // config for donut (instructions)
      donutOptions: {
        chart: {
          id: "stat_plot",
          type: "donut",
          background: "0", // transparent background
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
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "horizontal",
            shadeIntensity: 0.5,
            gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 100],
            colorStops: [],
          },
          colors,
        },
        legend: {
          formatter(val, opts) {
            return val + " - " + opts.w.globals.series[opts.seriesIndex]
          },
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  show: true,
                  showAlways: true,
                  formatter(w) {
                    return w.globals.seriesTotals.reduce(
                      (a: number, b: number) => {
                        return a + b
                      },
                      0,
                    )
                  },
                },
              },
            },
          },
        },
      } as ApexOptions,

      // config for bar (cycles)
      barOptions: {
        chart: {
          id: "clk_plot",
          type: "bar",
          background: "0", // transparent background
        },
        labels,
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "55%",
            endingShape: "rounded",
            distributed: true,
          },
        },
        fill: {
          opacity: 1,
        },
        legend: {
          show: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        xaxis: {
          categories: labels,
        },
        yaxis: {
          title: {
            text: "CLK Cycles",
          },
        },
        tooltip: {
          y: {
            formatter(val) {
              return "CLK Cycles: " + val
            },
          },
        },
      } as ApexOptions,
    }
  },

  computed: {
    options() {
      // we do this as a computed property so that it reacts to the `dark` and
      // `type` props
      return {
        ...this.baseOptions,
        ...(this.type === "instructions" ? this.donutOptions : this.barOptions),
        theme: {
          mode: this.dark ? "dark" : "light",
        },
      }
    },

    // FIXME: this doesn't automagically update...
    statsValues() {
      const values = Array.from(
        // for some reason I have to use the Array.from, otherwise it gives me a
        // `TypeError: this.stats.values(...).map is not a function`
        this.stats.values(),
      ).map(v => (this.type === "instructions" ? v.instructions : v.cycles))

      return this.type === "cycles" ? [{ data: values }] : values
    },

    totalExecuted() {
      return this.type === "instructions"
        ? status.executedInstructions
        : status.clkCycles
    },
  },
})
</script>

<template>
  <VueApexCharts
    :type="type === 'instructions' ? 'donut' : 'bar'"
    :options="options"
    :series="statsValues"
    height="180%"
  />

  <b-row v-if="type === 'cycles'">
    <b-list-group class="align-items-center">
      <b-list-group-item>
        Total CLK Cycles: {{ totalExecuted }}
      </b-list-group-item>
    </b-list-group>
  </b-row>
</template>
