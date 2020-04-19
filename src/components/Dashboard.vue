<template>
  <div id="dashboard">
    <main>
      <data-table id="dataTable" v-if="presentation == tableKey"></data-table>
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
import { Presentation, TaxonomyLevel } from "@/types";

export default {
  name: "dashboard",
  components: {
    DataTable,
    Chart,
    Controls
  },
  mounted() {
    this.$store.dispatch("loadData", TaxonomyLevel.Country);
  },
  computed: {
    presentation() {
      return this.$store.getters.selection.presentation;
    },
    tableKey() {
      return Presentation.Table;
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
  overflow: auto;
}

aside {
  grid-area: 1 / 2 / 1 / 2;
}
</style>
