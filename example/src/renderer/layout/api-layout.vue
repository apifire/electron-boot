<template>
  <app-scale style="height: 100%">
    <app-scale-item
      size="260"
      max-size="400"
      min-size="260"
      style="background: #222222"
    ></app-scale-item>
    <app-scale-item>
      <router-view></router-view>
    </app-scale-item>
  </app-scale>
</template>
<script lang="ts" setup name="api-layout">
import {AppScale, AppScaleItem} from "../components/app-scale";</script>

<style scoped></style>
