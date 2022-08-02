<template>
  <div class="app-wrapper">
    <div class="app-main-container">
      <windows-toolbar></windows-toolbar>
      <div class="app-main">
        <app-scale style="height: 100%">
          <app-scale-item size="74" min-size="74">
            <div class="app-aside-outer">
              <app-aside class="asideMac electron-drag" />
            </div>
          </app-scale-item>
          <app-scale-item>
            <router-view></router-view>
          </app-scale-item>
        </app-scale>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup name="layout">
import {AppScale, AppScaleItem} from "../components/app-scale";
import {AppAside} from "./components/app-aside";
import WindowsToolbar from "./components/windows-toolbar/windows-toolbar.vue";</script>
<style lang="scss">
.app-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-main-container {
  flex: 1 1;
  display: flex;
  flex-direction: row;
}

.app-main {
  display: flex;
  flex: 1 1;
  flex-direction: row;
  background: var(--app-aside-bg);
}

.asideMac {
  padding-top: 44px;
}

.app-aside-outer {
  height: 100%;
  flex: 1 1;
  display: flex;
}
</style>
