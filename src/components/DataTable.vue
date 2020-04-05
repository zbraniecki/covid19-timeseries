<template>
  <table cellspacing="0" cellpadding="0">
    <thead>
      <tr class="name">
        <th></th>
        <th v-for="region in selectedRegions" :key="region.id" colspan="2">
          {{ region.displayName }}
        </th>
      </tr>
      <tr v-for="item in activeMetaRows" :key="item.id" :class="item.id">
        <th>{{ item.name }}:</th>
        <th v-for="value in item.values" :key="value" colspan="2">
          {{ value }}
        </th>
      </tr>
      <tr>
        <th>Δ Day</th>
        <template v-for="_ in selectedRegions">
          <th>Date</th>
          <th>#</th>
        </template>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in dataRows" :key="row.relDay">
        <td class="relDay">
          <a v-bind:name="'day' + row.relDay" class="target"></a>
          {{ row.relDay }}
        </td>
        <template v-for="date of row.dates">
          <template v-if="date">
            <td class="date">{{ date.date }}</td>
            <td class="value">{{ date.value["cases"] }}</td>
          </template>
          <template v-else>
            <td></td>
            <td></td>
          </template>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script>
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

const dtf = new Intl.DateTimeFormat(undefined, {day: "numeric", month: "numeric"});

function nFormatter(num, digits) {
  if (!num) {
    return "";
  }
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: " k" },
    { value: 1e6, symbol: " M" },
    { value: 1e9, symbol: " B" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

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
          values["population"][idx] = nFormatter(region.meta.population, 2);
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

      const result = [];
      for (const idx in selectedRegions) {
        const region = selectedRegions[idx];
        const resultIdx = normalizedIndexes[region.id];
        for (let idx2 = resultIdx; idx2 < region.dates.length - 1; idx2++) {
          const date = region.dates[idx2];
          if (!result[idx2 - resultIdx]) {
            result[idx2 - resultIdx] = {
              relDay: idx2 - resultIdx,
              dates: new Array(selectedRegions.length)
            };
          }
          result[idx2 - resultIdx].dates[idx] = {
            date: dtf.format(date.date),
            value: date.value
          };
        }
      }
      return result;
    }
  }
};
</script>

<style scoped>
table {
  border-left: 1px solid #999999;
  margin-left: 5px;
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
  font-size: 0.7em;
  color: #999999;
  padding: 0 5px;
}

table thead tr:nth-child(1) th {
  font-size: 1.0em;
  color: black;
  padding: 5px 10px;
}

table tbody td.relDay {
  text-align: center;
}

table tbody td {
  border-bottom: 1px solid #dddddd;
  padding: 0 10px;
}

table tbody td.date {
  color: #999999;
  font-weight: bold;
  font-size: 0.7em;
  text-align: right;
}

table tbody td.value {
  text-align: right;
}

</style>
