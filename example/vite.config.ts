import vue from "@vitejs/plugin-vue";
import {rmSync} from "fs";
import {resolve} from "path";
import AutoImport from "unplugin-auto-import/vite";
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import {defineConfig} from "vite";
import vueSetupExtend from "vite-plugin-vue-setup-extend-plus";
import renderer from "vite-plugin-electron-renderer"
import electron from "@electron-boot/vite-plugin-electron"
import pkg from './package.json'

rmSync("dist", { recursive: true, force: true }); // v14.14.0

const IsWeb = process.env.BUILD_TARGET === "web";

const pathResolve = (dir: string): any => {
  return resolve(__dirname, ".", dir);
};
// 渲染项目路径
const root = pathResolve("src/renderer");
const alias: Record<string, string> = {
  "/@root": root,
  "/@store": pathResolve("src/renderer/store")
};
// https://vitejs.dev/config/
export default defineConfig({
  root,
  resolve: {
    alias
  },
  build: {
    outDir: IsWeb ? resolve("dist/web") : resolve("dist/renderer"),
    emptyOutDir: true,
    target: "esnext",
    minify: "esbuild"
  },
  base: "./",
  server: {
    host: pkg.env.VITE_DEV_SERVER_HOST,
    port: pkg.env.VITE_DEV_SERVER_PORT,
  },
  plugins: [
    electron({}),
    vue({}),
    renderer(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    vueSetupExtend()
  ],
  publicDir: resolve("static")
});
