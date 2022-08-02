<template>
  <section class="app-main">
    <slot />
  </section>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "app-main"
});
</script>

<style lang="scss">
.app-main {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-width: 520px;
  z-index: 2;
  border-radius: 12px 0 0 12px;
  box-shadow: -2px 0 4px rgb(0 0 0 / 2%);
  background: var(--app-main-bg);
}
</style>
