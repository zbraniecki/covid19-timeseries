<template>
  <div id="dashboard">
    <main>
      <data-table id="dataTable" v-if="view == 'Table'"></data-table>
      <chart id="chart" v-else></chart>
    </main>
    <aside>
      <controls></controls>
    </aside>
  </div>
</template>

<script>
import DataTable from "@/components/DataTable.vue";
import Chart from "@/components/Chart.vue";
import Controls from "@/components/Controls.vue";

export default {
  name: "dashboard",
  components: {
    DataTable,
    Chart,
    Controls
  },
  async mounted() {
    const data = await fetch("/timeseries-converted.json");
    const json = await data.json();
    this.$store.commit("setData", json);
  },
  computed: {
    view() {
      return this.$store.state.ui.view;
    }
  }
};
</script>

<style scoped>
#dashboard {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 80% 20%;
  grid-template-rows: 100%;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
}

main {
  grid-area: 1 / 1 / 1 / 2;
}

aside {
  grid-area: 1 / 2 / 1 / 2;
}
</style>
