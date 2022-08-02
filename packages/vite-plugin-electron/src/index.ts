import {Plugin, ViteDevServer} from "vite";
import {Configuration} from "./types";
import {bootstrap} from "./serve";
import {build} from "./build";


export default function electron(config:Configuration):Plugin[]{
  const name = '@electron-boot/vite-plugin-electron'
  return [{
    name:`${name}:serve`,
    apply:"serve",
    configureServer(server:ViteDevServer){
      server.httpServer.on("listening",()=>{
        bootstrap(config,server)
      })
    }
  },{
    name:`${name}:build`,
    apply:"build",
    async configResolved(viteConfig) {
      await build(config,viteConfig)
    },
  }]
}