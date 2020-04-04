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
      <tr v-for="row in dataRows">
        <td class="relDay">
          <a v-bind:name="'day' + row.relDay" class="target"></a>
          {{ row.relDay }}
        </td>
        <template v-for="date of row.dates">
          <td>{{ date.date }}</td>
          <td>{{ date.value["cases"] }}</td>
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
      return this.getSelectedRegions();
    },
    activeMetaRows() {
      const selectedRegions = this.getSelectedRegions();

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
      const selectedRegions = this.getSelectedRegions();

      const result = [];
      for (const idx in selectedRegions) {
        const region = selectedRegions[idx];
        for (const idx2 in region.dates) {
          const date = region.dates[idx2];
          if (!result[idx2]) {
            result[idx2] = {
              relDay: idx2,
              dates: new Array(selectedRegions.length)
            };
          }
          result[idx2].dates[idx] = date;
        }
      }
      return result;
    }
  },
  methods: {
    getSelectedRegions() {
      const result = [];
      for (const region of this.$store.state.data) {
        if (this.$store.state.selection.regions.includes(region.id)) {
          result.push(region);
        }
      }
      return result;
    }
  }
};
</script>

<style scoped>
table thead {
  background-color: white;
  position: sticky;
  top: 0;
  border-right: 1px solid #999999;
}

table thead tr:nth-child(1) th {
  padding-top: 10px;
  font-size: 1.4em;
  color: black;
}

table thead tr:nth-child(1) th.value {
  text-align: center;
}

table thead tr th {
  padding: 0 5px;
  text-align: center;
  border-bottom: 1px solid #dddddd;
  border-top: 1px solid #dddddd;
}

table thead tr {
  font-size: 0.7em;
  color: #999999;
}

table td.value,
table th.value {
  border-right: 1px solid #999999;
}

table td:nth-child(1),
table th:nth-child(1) {
  text-align: center;
  border-right: 1px solid black;
  border-left: 1px solid black;
}

table td.value,
table th.value {
  padding: 0 10px;
  text-align: right;
}
</style>
