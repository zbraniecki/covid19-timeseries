<template>
  <div id="menu">
    <select @change="setView">
      <option
        v-for="item of viewList"
        :key="item"
        :value="item"
        :selected="selectedView == item"
      >
        {{ item }}
      </option>
    </select>
    <select multiple @change="setSelectedRegions" class="regions">
      <option
        v-for="region of regionList"
        :key="region.id"
        :value="region.id"
        :selected="selectedRegions.includes(region.id)"
      >
        {{ region.displayName }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: "controls",
  computed: {
    viewList() {
      return Object.values(this.$store.state.controls.views);
    },
    regionList() {
      return this.$store.state.data;
    },
    selectedView() {
      return this.$store.state.ui.view;
    },
    selectedRegions() {
      const selectedRegions = this.$store.getters.selectedRegions;
      return selectedRegions.map(region => region.id);
    }
  },
  methods: {
    setView(e) {
      this.$store.commit("setView", e.target.value);
    },
    setSelectedRegions(e) {
      const values = Array.from(e.target.selectedOptions).map(v => v.value);
      this.$store.commit("setSelectedRegions", values);
    }
  }
};
</script>

<style scoped>
select {
  width: 100%;
}

select.regions {
  height: 500px;
}
</style>
