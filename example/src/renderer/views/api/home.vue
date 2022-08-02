<template>
  <div class="app-api-detail">
    <button @click="btnClick">按钮</button>
  </div>
</template>
<script lang="ts">
import {defineComponent} from "vue";
import {ipcRenderer as ipc} from "electron"

export default defineComponent({
  name:"api.home",
  setup(props,{emit}){
    const btnClick = async () => {
      await ipc.invoke("/main/windowAction",{})
    }
    return {
      btnClick
    }
  }
})
</script>
<style lang="scss"></style>
