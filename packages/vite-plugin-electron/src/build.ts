import {Configuration} from "./types";
import {ResolvedConfig} from "vite";

const tscWatchClient = require("tsc-watch/client")
const watch = new tscWatchClient()

export async function build(config:Configuration,viteConfig:ResolvedConfig){
  // 监听构建完毕事件
  watch.on('first_success', () => {
    watch.kill();
  });
  // 监听构建错误
  watch.on('compile_errors', () => {
    // Your code goes here...
  });
  // 启动构建electron
  watch.start('--project', './tsconfig.electron.json');
}