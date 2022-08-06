import {Configuration} from './types';
import {ViteDevServer} from 'vite';
import {spawn} from 'child_process';
import {AddressInfo} from 'net';

const tscWatchClient = require("tsc-watch/client")
const watch = new tscWatchClient()

export async function bootstrap(config:Configuration,server:ViteDevServer){
  const electronPath = require("electron")
  const { config:ViteConfig } = server

  const address = server.httpServer.address() as AddressInfo

  watch.on('started', () => {
    console.log('Compilation started');
  });

  watch.on('first_success', () => {
    console.log('First success!');
  });

  watch.on('success', () => {
    server.printUrls()
    const env = Object.assign(process.env,{
      VITE_LOCAL_SERVER_URL:(server.resolvedUrls?.local[0].length>0) ? (server.resolvedUrls?.local[0]): "",
      VITE_NETWORK_SERVER_URL:(server.resolvedUrls?.network[0].length>0) ? (server.resolvedUrls?.network[0]): ""
    })
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