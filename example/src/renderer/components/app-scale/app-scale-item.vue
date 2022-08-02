<template>
  <div ref="item" class="app-scale-item" :style="style">
    <slot />
  </div>
</template>
<script>
export default {
  name: "app-scale-item",
  inject: ["onItemAdd", "onItemRemove", "requestUpdate"],
  props: {
    size: { type: [Number, String], default: null },
    minSize: { type: [Number, String], default: null },
    maxSize: { type: [Number, String], default: null }
  },
  data: () => ({
    style: {}
  }),
  mounted() {
    this.onItemAdd(this);
  },
  beforeMount() {
    this.onItemRemove(this);
  },
  methods: {
    // 修改样式
    update(style) {
      this.style = style;
    }
  },
  computed: {
    sizeNumber() {
      return this.size || this.size === 0 ? parseFloat(this.size) : null;
    },
    minSizeNumber() {
      return parseFloat(this.minSize);
    },
    maxSizeNumber() {
      return parseFloat(this.maxSize);
    }
  },
  watch: {
    sizeNumber(size) {
      this.requestUpdate({ target: this, size });
    },
    minSizeNumber(min) {
      this.requestUpdate({ target: this, min });
    },
    maxSizeNumber(max) {
      this.requestUpdate({ target: this, max });
    }
  }
};
</script>
<style scoped></style>
