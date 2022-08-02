<template>
  <div ref="container" :class="['app-scale', `${this.vertical ? 'vertical' : 'horizontal'}`]">
    <slot />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, provide, reactive, ref, toRefs, watch} from "vue";
import {appScaleItemClass, appScaleSplitClass} from "./const";
import {State} from "./interface";

export default defineComponent({
  name: "app-scale",
  props: {
    // 是否是垂直
    vertical: { type: Boolean },
    // 是否第一个元素也添加分割器
    firstSplitter: { type: Boolean },
    // 是否给分割器添加双击事件
    dblClickSplitter: { type: Boolean, default: true }
  },
  setup(props, { emit }) {
    // 为后续监听这个数值的改变
    const vertical = ref(props.vertical);
    // 获取指定变量名的元素
    const container = ref<HTMLElement | null>(null);
    // 定义变量接收数据
    const state: State = reactive({
      ready: false,
      items: [],
      touch: {
        mouseDown: false,
        dragging: false,
        activeSplitter: -1
      }
    });
    /**
     * 绑定事件
     */
    const bindEvents = () => {
      document.addEventListener("mousemove", onMouseMove, { passive: false });
      document.addEventListener("mouseup", onMouseUp);
      if ("ontouchstart" in window) {
        document.addEventListener("touchmove", onMouseMove, { passive: false });
        document.addEventListener("touchend", onMouseUp);
      }
    };
    /**
     * 解除事件绑定
     */
    const unBindEvents = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if ("ontouchstart" in window) {
        document.removeEventListener("touchmove", onMouseMove);
        document.removeEventListener("touchend", onMouseUp);
      }
    };
    /**
     * 当元素添加事件发生
     * @param item
     */
    const onItemAdd = (item: any) => {
      let index = -1;
      Array.from(item.$el.parentNode.children).some((el) => {
        if ((el as HTMLElement).className.includes(appScaleItemClass)) index++;
        return el === item.$el;
      });
      const min = parseFloat(item.minSize);
      const max = parseFloat(item.maxSize);
      state.items.splice(index, 0, {
        id: item._.uid,
        index,
        min: isNaN(min) ? 0 : min,
        max: isNaN(max) ? null : max,
        size: item.size === null ? null : parseFloat(item.size),
        givenSize: item.size,
        update: item.update
      });
      // 如果没有设置大小
      if (item.size === null) {
        (item.$el as HTMLElement).classList.add("auto");
      }
      state.items.forEach((p, i) => (p.index = i));
    };
    /**
     * 当元素被删除发生的事件
     * @param item
     */
    const onItemRemove = (item: any) => {
      const index = state.items.findIndex((p) => p.id === item._.uid);
      const removed = state.items.splice(index, 1)[0];
      state.items.forEach((p, i) => (p.index = i));
    };
    /**
     * 分割器的鼠标按下事件
     * @param event 传入的事件
     * @param splitterIndex 分割器下标
     */
    const onMouseDown = (event: MouseEvent | TouchEvent, splitterIndex: number) => {
      bindEvents();
      state.touch.mouseDown = true;
      state.touch.activeSplitter = splitterIndex;
    };
    /**
     * 分割器单击事件
     * @param event 传入事件
     * @param splitterIndex 分割器下标
     */
    const onSplitterClick = (event: MouseEvent, splitterIndex: number) => {};
    /**
     * 分割器双击事件
     * @param event 传入的事件
     * @param splitterIndex 分割器下标
     */
    const onSplitterDblClick = (event: MouseEvent, splitterIndex: number) => {};
    /**
     * 鼠标移动事件
     * @param event
     */
    const onMouseMove = (event: MouseEvent | TouchEvent) => {};
    const onMouseUp = (event: MouseEvent | TouchEvent) => {};
    /**
     * 在添加或者删除值后重新调整大小
     * @param changedPanes
     */
    const equalizeAfterAddOrRemove = (changedPanes: any) => {};
    /**
     * 更新组件的方法
     */
    const updateItemComponents = () => {
      state.items.forEach((item) => {
        let size = indexedItems.value[item.id].size;
        item.update &&
          item.update({
            [props.vertical ? "height" : "width"]: `${indexedItems.value[item.id].size}px`
          });
      });
    };
    /**
     *
     * @param target
     * @param args
     */
    const requestUpdate = ({ target, ...args }: any) => {
      const item = indexedItems.value[target._.uid];
      Object.entries(args).forEach(([key, value]) => (item[key] = value));
    };
    /**
     * 初始化item的大小
     */
    const initialItemSizing = () => {
      // 没有设置宽度的item个数
      let noDefinedSize = 0;
      state.items.forEach((item) => {
        if (!item.size) noDefinedSize++;
        if (item.max && item.size >= item.max) item.size = item.max;
        if (item.size && item.size <= item.min) item.size = item.min;
        if (noDefinedSize > 1) {
          throw new Error("app-scale is only one with no defined size item");
        }
      });
    };
    /**
     * 检查元素，如果不是<app-scale-item>元素则删除
     */
    const checkScaleItem = () => {
      const children = Array.from( container.value?.children ??  []);
      children.forEach((child) => {
        const isPaneItem = child.classList.contains(appScaleItemClass);
        const isSplitter = child.classList.contains(appScaleSplitClass);
        // 如果子元素，并且也不是分割器
        if (!isPaneItem && isSplitter) {
          // 移除元素
          child.parentNode?.removeChild(child);
          console.warn(
            "app-scale:only<app-scale-item> elements are allowed at this root of <app-scale>。One of your DOM nodes was removed."
          );
        }
      });
    };
    /**
     * 添加分割器
     * @param itemIndex
     * @param nextItemNode 分割器的下一个元素
     * @param isFirst 是否第一个也加入分割器
     */
    const addSplitter = (itemIndex: number, nextItemNode: HTMLElement, isFirst?: Boolean) => {
      const splitterIndex = itemIndex - 1;
      const elm = document.createElement("div");
      elm.classList.add(appScaleSplitClass);
      // 如果是第一个
      if (isFirst) {
        elm.onmousedown = (event) => onMouseDown(event, splitterIndex);
        if (typeof window !== "undefined" && "ontouchstart" in window) {
          elm.ontouchstart = (event) => onMouseDown(event, splitterIndex);
        }
        elm.onclick = (event) => onSplitterClick(event, splitterIndex + 1);
      }
      if (props.dblClickSplitter) {
        elm.ondblclick = (event) => onSplitterDblClick(event, splitterIndex + 1);
      }
      nextItemNode.parentNode?.insertBefore(elm, nextItemNode);
    };
    /**
     * 移除分割器元素
     * @param node
     */
    const removeSplitter = (node: HTMLElement) => {
      node.onmousedown = null;
      node.onclick = null;
      node.ondblclick = null;
      node.parentNode?.removeChild(node);
    };
    /**
     * 重新绘制分割器
     */
    const redoSplitters = () => {
      const children = Array.from(
          container.value?.children ?? []
      ) as Array<HTMLElement>;
      // 移除现有的分割器
      children.forEach((el) => {
        if (el.className.includes(appScaleSplitClass)) removeSplitter(el);
      });
      // 添加新分割器
      let itemIndex = 0;
      children.forEach((el) => {
        if (el.className.includes(appScaleItemClass)) {
          if (!itemIndex && props.firstSplitter) addSplitter(itemIndex, el, true);
          else if (itemIndex) addSplitter(itemIndex, el);
          itemIndex++;
        }
      });
    };
    // 获取所有的Item
    const indexedItems = computed(() => {
      return state.items.reduce((obj, pane) => (obj[pane.id] = pane) && obj, {});
    });
    // 获取所有的item数量
    const itemsCount = computed(() => {
      return state.items.length;
    });
    // 注入方法
    provide("onItemAdd", onItemAdd);
    provide("onItemRemove", onItemRemove);
    provide("requestUpdate", requestUpdate);
    // dom挂载后触发
    onMounted(() => {
      checkScaleItem();
      redoSplitters();
      initialItemSizing();
      emit("ready");
      state.ready = true;
    });
    // 监听item发生变化
    watch(state.items, updateItemComponents, {
      deep: true,
      immediate: false
    });
    watch(vertical, updateItemComponents);
    return {
      container,
      ...toRefs(state)
    };
  }
});
</script>

<style lang="scss">
.app-scale {
  display: flex;
  width: 100%;
  flex-direction: row;
  padding: 0;
  position: relative;

  &.vertical {
    flex-direction: column;
  }

  & .app-scale-item {
    flex-shrink: 0;
    display: flex;
    overflow: hidden;
    align-items: flex-start;
    justify-content: flex-start;

    &.auto {
      flex: 1 1 0%;
    }
  }
}
</style>
