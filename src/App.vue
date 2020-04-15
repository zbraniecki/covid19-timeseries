<template>
  <dashboard />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Dashboard from "@/components/Dashboard.vue";

@Component({
  components: {
    Dashboard
  }
})
export default class App extends Vue {}
</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
  display: block;
  padding: 0;
  margin: 0;
  overflow: hidden;
  font-family: Inter, X-LocaleSpecific, sans-serif;
}
</style>
