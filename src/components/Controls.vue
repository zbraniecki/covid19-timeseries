<template>
  <div id="menu">
    <select @change="setView">
      <option v-for="item of viewList" :key="item" :value="item">
        {{ item }}
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
    }
  },
  methods: {
    setView(e) {
      this.$store.commit("setView", e.target.value)
    }
  }
};
</script>

<style scoped></style>

