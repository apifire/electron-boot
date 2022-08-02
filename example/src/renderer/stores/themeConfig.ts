import {defineStore} from "pinia";
import {ThemeConfigState, ThemeConfigStates} from "./interface";

export const useThemeConfig = defineStore("themeConfig", {
  state: (): ThemeConfigStates => ({
    themeConfig: {
      // 默认 primary 主题颜色
      primary: "#409eff"
    }
  }),
  actions: {
    setThemeConfig(data: ThemeConfigState) {
      this.themeConfig = data;
    }
  }
});
