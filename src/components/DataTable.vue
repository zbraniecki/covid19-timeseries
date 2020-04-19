<template>
  <table cellspacing="0" cellpadding="0" :class="{ chrome: isChrome }" :style="cssVars">
    <thead>
      <tr class="name">
        <th></th>
        <th v-for="region in nameRow" :key="region.id" colspan="2">{{ region.name }}</th>
        <th class="legend" v-if="legendColumn"></th>
      </tr>
      <tr v-for="item in activeMetaRows" :key="item.id" :class="item.id">
        <th>{{ item.name }}:</th>
        <th v-for="value in item.values" colspan="2">{{ value }}</th>
        <th class="legend" v-if="legendColumn"></th>
      </tr>
      <tr>
        <th>Δ Day</th>
        <template v-for="region in selectedRegions">
          <th class="date">Date</th>
          <th class="value">#</th>
        </template>
        <th class="legend" v-if="legendColumn"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in dataRows" :key="row.relDay" :class="{ log: row.relDay < 0 }">
        <td class="relDay" title="Click here to center">
          <a v-bind:name="'day' + row.relDay" class="target" :ref="'day' + row.relDay"></a>
          <a :href="'#day' + row.relDay">{{ row.relDay }}</a>
        </td>
        <template v-for="date of row.dates">
          <template v-if="date">
            <td
              v-bind:class="{
                date,
                today: date.isToday,
                normalized: date.normalized
              }"
            >{{ date.date }}</td>
            <td
              class="value"
              v-bind:style="
                date.normalized ? {} : { backgroundColor: date.color }
              "
              :class="{ normalized: date.normalized }"
            >{{ date.value }}</td>
          </template>
          <template v-else>
            <td class="empty"></td>
            <td class="empty"></td>
          </template>
        </template>
        <td
          class="legend"
          v-if="legendColumn"
        >{{ row.relDay == 0 ? "← Normalized relative day" : row.relDay == todayRow ? "← Today" : "" }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import helpers from "@/helpers/index.ts";
import { View, TaxonomyLevel } from "@/types";

const metaRows = [
  {
    id: "state",
    name: "State"
  },
  {
    id: "country",
    name: "Country"
  },
  {
    id: "population",
    name: "Popul."
  }
];

const dataTypeInfo = {
  cases: {
    sentiment: -1
  },
  deaths: {
    sentiment: -1
  },
  active: {
    sentiment: -1
  },
  tested: {
    sentiment: 1
  },
  recovered: {
    sentiment: 1
  },
  hospitalized: {
    sentiment: -1
  }
};

const dtf = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "numeric"
});

export default {
  name: "data-table",
  data() {
    return {
      metaRowsCount: `78px`,
      legendColumn: true,
      todayRow: 8,
    };
  },
  computed: {
    selectedRegions() {
      return this.$store.getters.selectedRegions;
    },
    nameRow() {
      const selectedRegions = this.$store.getters.selectedRegions;
      const result = new Array(selectedRegions.length);

      for (const idx in selectedRegions) {
        const region = selectedRegions[idx];
        switch (region.meta.taxonomy) {
          case TaxonomyLevel.Country: {
            result[idx] = {
              id: region.id,
              name: region.meta.country.name,
            };
            break;
          }
          case TaxonomyLevel.State: {
            result[idx] = {
              id: region.id,
              name: region.meta.state.name,
            };
            break;
          }
          case TaxonomyLevel.County: {
            result[idx] = {
              id: region.id,
              name: region.meta.county.name,
            };
            break;
          }
          case TaxonomyLevel.City: {
            result[idx] = {
              id: region.id,
              name: region.meta.city.name,
            };
            break;
          }

        }
      }
      return result;
    },
    activeMetaRows() {
      const selectedRegions = this.$store.getters.selectedRegions;

      const values = {};

      for (const idx in selectedRegions) {
        const region = selectedRegions[idx];
        switch (region.meta.taxonomy) {
          case TaxonomyLevel.Country: {
            break;
          }
          case TaxonomyLevel.State: {
            if (!values["country"]) {
              values["country"] = new Array(selectedRegions.length);
            }
            values["country"][idx] = region.meta.country.name;
            break;
          }
          case TaxonomyLevel.County: {
            if (!values["state"]) {
              values["state"] = new Array(selectedRegions.length);
            }
            values["state"][idx] = region.meta.state.name;
            if (!values["country"]) {
              values["country"] = new Array(selectedRegions.length);
            }
            values["country"][idx] = region.meta.country.name;
            break;
          }
          case TaxonomyLevel.City: {
            if (!values["state"]) {
              values["state"] = new Array(selectedRegions.length);
            }
            values["state"][idx] = region.meta.state.name;
            if (!values["country"]) {
              values["country"] = new Array(selectedRegions.length);
            }
            values["country"][idx] = region.meta.country.name;
            break;
          }
        }
        if (region.meta.population) {
          if (!values["population"]) {
            values["population"] = new Array(selectedRegions.length);
          }
          values["population"][idx] = helpers.nFormatter(
            region.meta.population,
            2
          );
        }
      }

      let rowHeight = 19;
      let rows = Object.keys(values).length + 1;
      let x = 40 + (rowHeight * rows);
      this.metaRowsCount = `-${x}px`;

      const result = [];
      for (const row of metaRows) {
        if (values[row.id]) {
          result.push({
            id: row.id,
            name: row.name,
            values: values[row.id]
          });
        }
      }
      return result;
    },
    dataRows() {
      const selectedRegions = this.$store.getters.selectedRegions;
      const normalizedIndexes = this.$store.getters.normalizedIndexes;
      const selection = this.$store.getters.selection;
      const mainDataType = selection.dataTypes[0];
      const allRegions = this.$store.getters.sortedRegions;

      let maxDepth = 0;
      let max = 0;

      for (const region of selectedRegions) {
        const normIndexes = normalizedIndexes[region.id];
        if (normIndexes.firstValue === null) {
          continue;
        }
        const relFirstValue = normIndexes.relativeZero - normIndexes.firstValue;
        if (maxDepth < relFirstValue) {
          maxDepth = relFirstValue;
        }
        const len = region.dates.length - normIndexes.relativeZero;
        if (len > max) {
          max = len;
        }
      }

      const result = [];

      let valueType = helpers.valueType(selection);
      const maxValue = valueType !== "number" ? 0.3 :
        selectedRegions.length > 0 ? helpers.getHighestValue(selectedRegions[0], selection) : 0;

      for (let idx = 0; idx < maxDepth + max; idx++) {
        const relDay = idx - maxDepth;

        const dates = [];

        for (const region of selectedRegions) {
          const normIndexes = normalizedIndexes[region.id];
          const relFirstValue =
            normIndexes.relativeZero - normIndexes.firstValue;
          const regIdx = normIndexes.relativeZero + relDay;
          if (
            relDay + relFirstValue < 0 ||
            regIdx >= region.dates.length ||
            helpers.getValue(region, regIdx, selection) === null
          ) {
            dates.push(null);
            continue;
          } else {
            const date = region.dates[regIdx].date;
            const value = helpers.getValue(region, regIdx, selection);
            const colorValue = value / maxValue;
            const sentiment =
              dataTypeInfo[mainDataType].sentiment == 1 && value > 0;
            const maxColor = sentiment ? [0, 255, 0] : [255, 0, 0];
            dates.push({
              date: dtf.format(date),
              value: helpers.formatValue(value, selection),
              color: helpers.interpolateColor(
                [255, 255, 255],
                maxColor,
                colorValue
              ),
              isToday: helpers.isToday(date),
              normalized: relDay == 0
            });
          }
        }

        result.push({
          relDay,
          dates
        });
      }

      {
        const lastRegion = selectedRegions[selectedRegions.length - 1];
        if (lastRegion) {
          const lastRegionNorm = normalizedIndexes[lastRegion.id].relativeZero;
          const lastDate = lastRegion.dates[lastRegion.dates.length - 1];
          this.todayRow = lastRegion.dates.length - lastRegionNorm - 1;
        }
      }

      return result;
    },
    isChrome() {
      return navigator.userAgent.includes("Chrome/");
    },
    cssVars() {
      return {
        '--meta-rows': this.metaRowsCount,
      }
    }
  },
  updated: function() {
    this.$nextTick(function() {
      if (this.$refs["day0"] && this.$refs["day0"][0]) {
        this.$refs["day0"][0].scrollIntoView();
      }
    });
  },
  mounted: function() {
    this.$nextTick(function() {
      if (this.$refs["day0"] && this.$refs["day0"][0]) {
        this.$refs["day0"][0].scrollIntoView();
      }
    });
  }
};
</script>

<style scoped>
table {
  border-left: 1px solid #999999;
  margin-left: 5px;
  font-size: 0.9em;
}

table:not(.chrome) {
  /* Bug in Chrome prevents sticky header from being positioned properly. */
  margin-bottom: 100vh;
}

table td:nth-child(1),
table th:nth-child(1) {
  border-right: 1px solid #999999;
}

table td:nth-of-type(2n + 1),
table th:nth-of-type(2n + 1) {
  border-right: 1px solid #999999;
}

table th[colspan="2"] {
  border-right: 1px solid #999999;
}

table th {
  border-bottom: 1px solid #999999;
  font-size: 0.8em;
  color: #999999;
  padding: 0 5px;
}

table thead {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}
table thead tr {
  height: 18px;
}
table thead tr:nth-child(1) {
  height: 40px;
}

table thead tr:nth-child(1) th {
  font-size: 1.1em;
  color: black;
  padding: 5px 10px 0px 10px;
  white-space: nowrap;
}

table tbody td.relDay {
  text-align: center;
}

table tbody tr.log {
  opacity: 0.5;
}

table.chrome tbody tr.log {
  /* Bug in Chrome prevents sticky header from being positioned properly. */
  display: none;
}

table tbody td:not(.empty) {
  border-bottom: 1px solid #dddddd;
}

table thead th {
  padding: 1px 10px;
}

table tbody td {
  padding: 3px 10px;
}

table tbody td.date,
table thead th.date {
  color: #999999;
  font-weight: bold;
  font-size: 0.7em;
  text-align: right;
}

table td.today {
  background-color: #ffffcc;
}

table td.normalized {
  background-color: rgb(221, 238, 255);
}

table tbody td.value,
table thead th.value {
  text-align: right;
}

a.target {
  display: block;
  position: relative;
  top: var(--meta-rows);
  visibility: hidden;
}
td.relDay {
  padding: 0;
}

td.relDay a[href] {
  color: black;
  text-decoration: none;
  display: inline-block;
  width: 100%;
}

td.relDay:hover {
  text-decoration: underline;
  background-color: #eeeeee;
}

th.legend,
td.legend {
  border: 0 !important;
  opacity: 0.6;
  white-space: nowrap;
}
</style>
