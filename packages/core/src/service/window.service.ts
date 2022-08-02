import {listModule, Provide, Scope} from "../decorator";
import {IElectronContainer, ScopeEnum} from "../interface";
import {APPLICATION_WINDOW} from "../constant";
import {debuglog} from "util";
import {BaseWindow} from "../base";

const debug = debuglog("core:debug");

@Provide()
@Scope(ScopeEnum.Singleton)
export class WindowService {
  // 是否准备就绪
  private ready = false
  // 主窗口实例
  private mainWindow = null
  // 构造器
  constructor(readonly applicationContext:IElectronContainer) {
  }

  /**
   * 绑定窗口到应用上下文
   * @private
   */
  private bindWindow() {
    // 如果已经准备就绪则直接返回
    if (this.ready) return
    // 获取所有的窗口模块
    const wins = listModule(APPLICATION_WINDOW)

    debug(`[core]: Found windows length = ${wins.length}`)

    // 循环找出主窗口，如果都没有标识主窗口，则以第一个窗口为主窗口
    for (const win of wins) {
      // 如果设置了主窗口
      if (win.target){
        win.instance = this.applicationContext.get<BaseWindow>(win.target)
        win.instance && (this.mainWindow=win.instance)
      }
    }

    // 如果没有主窗口
    if (!this.mainWindow && wins.length>0){
      const win = wins[0]
      win.instance = this.applicationContext.get<BaseWindow>(win.target)
      win.instance && (this.mainWindow=win.instance)
    }

    // 当前服务准备完毕
    this.ready = true
  }

  /**
   * 获取主窗口
   */
  getMainWindow = ():BaseWindow=>{
    this.bindWindow()
    return this.mainWindow
  }
}