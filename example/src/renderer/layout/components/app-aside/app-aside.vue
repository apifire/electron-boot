<template>
  <aside class="app-aside">
    <app-aside-header />
    <div class="app-expand-layout" style="position: relative">我是菜单部分</div>
  </aside>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import AppAsideHeader from "./app-aside-header.vue";

export default defineComponent({
  name: "app-aside",
  components: {
    AppAsideHeader
  }
});
</script>

<style lang="scss">
.app-aside {
  flex: 1 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 32px;

  & div {
    outline: none;
  }
}

.app-expand-layout {
  flex: 1 1;
  height: 0;
  flex-shrink: 0;
  overflow: hidden;
}
</style>
