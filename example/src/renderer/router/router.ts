import {RouteRecordRaw} from "vue-router";

export const dynamicRoutes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "/",
    component: () => import("/@root/layout/index.vue"),
    redirect: "/api",
    meta: {
      isKeepAlive: true
    },
    children: [
      {
        path: "/api",
        name: "api",
        component: () => import("/@root/layout/api-layout.vue"),
        redirect: "/api/home",
        children: [
          {
            path: "/api/home",
            name: "api-home",
            component: () => import("/@root/views/api/home.vue")
          }
        ]
      }
    ]
  }
];
