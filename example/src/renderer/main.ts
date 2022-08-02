import {createApp} from "vue";
import App from "./App.vue";
import router from "./router";
import pinia from "./stores";
import "/@root/theme/index.scss"; // 引入scss

const app = createApp(App);

app.use(pinia).use(router).mount("#root");
