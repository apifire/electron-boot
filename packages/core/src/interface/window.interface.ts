import {BrowserWindow} from "electron"


export interface IBrowserWindow {
  // 获取实例
  getInstance():BrowserWindow
  // 当前窗口的名称
  name:string
  // 运行方法
  createWindow():void
}
/**
 * window模块
 */
export interface WindowModule {
  // 命名空间
  namespace?:string
  // 窗口类
  target:any
  // 是否是主窗口，并且主窗口只有一个
  main?:boolean
  // 窗口实例
  instance?:IBrowserWindow
}