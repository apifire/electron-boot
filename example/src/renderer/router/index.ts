import {createRouter, createWebHashHistory} from "vue-router";
import {dynamicRoutes} from "./router";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: dynamicRoutes
});

export default router;
