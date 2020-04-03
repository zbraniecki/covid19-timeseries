<template>
  <div id="menu">
    <select @change="setView">
      <option v-for="item of viewList" :key="item" :value="item">
        {{ item }}
      </option>
    </select>
    <select multiple @change="setSelectedRegions">
      <option v-for="region of regionList" :key="region.id" :value="region.id">
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
    }
  },
  methods: {
    setView(e) {
      this.$store.commit("setView", e.target.value)
    },
    setSelectedRegions(e) {
      const values = Array.from(e.target.selectedOptions).map(v=>v.value);
      this.$store.commit("setSelectedRegions", values);
    }
  }
};
</script>

<style scoped>
select {
  width: 100%;
}
</style>

