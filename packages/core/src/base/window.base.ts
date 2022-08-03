import events from "events";
import {IBrowserWindow} from "../interface";
import {BrowserWindow, BrowserWindowConstructorOptions, dialog, screen} from "electron";

/**
 * 窗口基类
 */
export abstract class BaseWindow extends events implements IBrowserWindow{
  // 窗口名称
  abstract name:string
  // 默认配置信息
  protected defaultConf:BrowserWindowConstructorOptions={
    show: false,
    titleBarStyle: "default",
    focusable: true,
    center:true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      scrollBounce: process.platform === 'darwin',
    }
  }
  // 配置信息
  protected  abstract conf:BrowserWindowConstructorOptions
  // 当前窗口实例
  protected windowsInstance:BrowserWindow = null
  // 当前窗体设计时电脑的宽度
  protected BASE_WIN_WIDTH = 1920;
  // 当前窗体设计时电脑的高度
  protected BASE_WIN_HEIGHT = 1080;
  // 设计宽度
  protected DESIGN_MAIN_WIDTH:number
  // 设计高度
  protected DESIGN_MAIN_HEIGHT:number
  // 窗口打开的地址
  protected abstract url:string
  // preload地址
  protected abstract preload:string
  // 获取实例
  getInstance(): BrowserWindow {
    return this.windowsInstance
  }
  // 创建窗口
  async createWindow(){
    // 防止内存泄漏
    if (this.windowsInstance) this.windowsInstance=null
    // 计算窗口
    const rect = screen.getPrimaryDisplay().bounds;
    let size = {} as {
      width:number
      height:number
    }
    // 没有设置宽度
    if (!this.conf.width && this.DESIGN_MAIN_WIDTH) {
      size.width = Math.ceil((rect.width / this.BASE_WIN_WIDTH) * this.DESIGN_MAIN_WIDTH);
    }
    // 没有设置高度
    if (!this.conf.height && this.DESIGN_MAIN_HEIGHT){
      size.height = Math.ceil((rect.height / this.BASE_WIN_HEIGHT) * this.DESIGN_MAIN_HEIGHT);
    }
    // 重载配置
    const conf = Object.assign({},this.defaultConf,this.conf,size)
    // 如果设置preload
    if (this.preload){
      conf.webPreferences.preload = this.preload
    }
    // 创建窗口
    this.windowsInstance = new BrowserWindow(conf)
    // 初始化监听
    await this.initListener()
    // 加载地址
    await this.windowsInstance.loadURL(this.url)
  }
  // 当前窗口事件监听
  protected async initListener(){
    // html加载完毕事件
    this.windowsInstance.once("ready-to-show",()=>{
        this.emit("ready-to-show")
    })
    // 监听窗口关闭事件,防止内存泄漏
    this.windowsInstance.on("close",()=>{
      this.windowsInstance = null
    })
    // 窗口触发假死时触发
    this.windowsInstance.on("unresponsive",()=>{
      dialog.showMessageBox(this.windowsInstance,{
        type: "warning",
        title: "警告",
        buttons: ["重载","退出"],
        message:"图形化进程失去响应，是否等待期恢复？",
        noLink:true
      }).then((res)=>{
        if (res.response === 0){
          this.windowsInstance.reload()
        }else{
          this.windowsInstance.close()
        }
      })
    })
  }
}