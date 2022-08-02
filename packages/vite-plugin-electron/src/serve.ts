import {Configuration} from "./types";
import {ViteDevServer} from "vite";
import {spawn} from "child_process";
import {AddressInfo} from "net";

const tscWatchClient = require("tsc-watch/client")
const watch = new tscWatchClient()

export async function bootstrap(config:Configuration,server:ViteDevServer){
  const electronPath = require("electron")
  const { config:ViteConfig } = server

  const address = server.httpServer.address() as AddressInfo
  const env = Object.assign(process.env,{
    VITE_DEV_SERVER_HOST: address.address,
    VITE_DEV_SERVER_PORT: address.port,
  })

  watch.on('started', () => {
    console.log('Compilation started');
  });

  watch.on('first_success', () => {
    console.log('First success!');
  });

  watch.on('success', () => {
    if (process.electronApp){
      process.electronApp.removeAllListeners()
      process.electronApp.kill()
    }
    process.electronApp = spawn(electronPath,["."],{stdio:"inherit",env})
    // 在应用退出是结束进程
    process.electronApp.once("exit",process.exit)
  });

  watch.on('compile_errors', () => {
    // Your code goes here...
  });

  watch.start('--project', './tsconfig.electron.json');
}