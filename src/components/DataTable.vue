<template>
  <table cellspacing="0" cellpadding="0">
    <thead>
      <tr class="name">
        <th></th>
        <th v-for="region in selectedRegions" :key="region.id" colspan="2">{{ region.displayName }}</th>
      </tr>
      <tr v-for="item in activeMetaRows" :key="item.id" :class="item.id">
        <th>{{ item.name }}:</th>
        <th v-for="value in item.values" :key="value" colspan="2">{{ value }}</th>
      </tr>
      <tr>
        <th>Δ Day</th>
        <template v-for="_ in selectedRegions">
          <th class="date">Date</th>
          <th class="value">#</th>
        </template>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in dataRows" :key="row.relDay" :class="{ log: row.relDay < 0 }">
        <td class="relDay">
          <a v-bind:name="'day' + row.relDay" class="target" :ref="'day' + row.relDay"></a>
          {{ row.relDay }}
        </td>
        <template v-for="date of row.dates">
          <template v-if="date">
            <td
              v-bind:class="{ date, today: date.isToday, normalized: date.normalized }"
            >{{ date.date }}</td>
            <td
              class="value"
              v-bind:style="date.normalized ? {} : { backgroundColor: date.color }"
              :class="{ normalized: date.normalized }"
            >{{ date.value }}</td>
          </template>
          <template v-else>
            <td class="empty"></td>
            <td class="empty"></td>
          </template>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script>
import helpers from "@/helpers/index.ts";

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

const dtf = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "numeric"
});
const nf = new Intl.NumberFormat(undefined);

export default {
  name: "data-table",
  computed: {
    selectedRegions() {
      return this.$store.getters.selectedRegions;
    },
    activeMetaRows() {
      const selectedRegions = this.$store.getters.selectedRegions;

      const values = {};

      for (const idx in selectedRegions) {
        const region = selectedRegions[idx];
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
      const dataType = this.$store.state.selection.dataTypes[0];

      let maxDepth = 0;
      let max = 0;

      for (const region of selectedRegions) {
        const normIndexes = normalizedIndexes[region.id];
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

      const maxColor = [255, 0, 0];
      const maxValue = 100000;

      for (let idx = 0; idx < maxDepth + max; idx++) {
        const relDay = idx - maxDepth;

        const dates = [];

        for (const region of selectedRegions) {
          const normIndexes = normalizedIndexes[region.id];
          const relFirstValue =
            normIndexes.relativeZero - normIndexes.firstValue;
          const regIdx = normIndexes.relativeZero + relDay;
          if (relDay + relFirstValue < 0 || regIdx >= region.dates.length) {
            dates.push(null);
            continue;
          } else {
            const date = region.dates[regIdx];
            const colorValue = date.value[dataType] / maxValue;
            dates.push({
              date: dtf.format(date.date),
              value: nf.format(date.value[dataType]),
              color: helpers.interpolateColor(
                [255, 255, 255],
                maxColor,
                colorValue
              ),
              isToday: helpers.isToday(date.date),
              normalized: relDay == 0
            });
          }
        }

        result.push({
          relDay,
          dates
        });
      }

      return result;
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
  /* Bug in Chrome prevents sticky header from being positioned properly. */
  /* margin-bottom: 100vh; */
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

table thead tr:nth-child(1) th {
  font-size: 1.1em;
  color: black;
  padding: 10px 10px;
  white-space: nowrap;
}

table tbody td.relDay {
  text-align: center;
}

table tbody tr.log {
  /* Bug in Chrome prevents sticky header from being positioned properly. */
  display: none;
  opacity: 0.5;
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
  top: -78px;
  visibility: hidden;
}
</style>
