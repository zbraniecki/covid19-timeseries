<template>
  <table cellspacing="0" cellpadding="0">
    <thead>
      <tr class="name">
        <th></th>
        <th class="value" v-for="region in selectedRegions" :key="region.id">
          {{ region.displayName }}
        </th>
      </tr>
      <tr class="country">
        <th>Country:</th>
        <th></th>
      </tr>
      <tr class="state">
        <th>State:</th>
        <th></th>
      </tr>
    </thead>
  </table>
</template>

<script>
export default {
  name: "data-table",
  computed: {
    selectedRegions() {
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
