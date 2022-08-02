import {Autowired, BaseWindow, Config, Init, Provide, Scope, ScopeEnum, WindowService} from "@electron-boot/core";
import {AutoUpdate} from "../interface";
import {app} from "electron"
import {autoUpdater} from "electron-updater";
import * as path from "path";

@Provide()
@Scope(ScopeEnum.Singleton)
export class UpdaterService{
  /**
   * 是否初始化
   * @private
   */
  private isReady = false

  /**
   * 获取配置
   * @private
   */
  @Config("autoUpdater")
  private updaterConfig:AutoUpdate

  /**
   * 设置窗口管理器
   * @private
   */
  @Autowired()
  private windowService:WindowService

  @Init()
  async init(){
    if (this.isReady) return
    // 获取配置信息
    let updateConfig = this.updaterConfig
    // 判断平台是否支持下载
    const mainWindow = this.windowService.getMainWindow()
    const version = app.getVersion()
    // 是否后台自动下载
    autoUpdater.autoDownload = updateConfig.force
    // 如果没有打包
    if (!app.isPackaged){
      autoUpdater.updateConfigPath = path.join(app.getAppPath(),"release/dev-app.update.yml")
    }
    try{
      autoUpdater.setFeedURL(updateConfig.options)
    }catch (e) {
      console.log("[autoUpdater] setFeedURL error",e)
    }
    /**
     * 正在检查更新
     */
    autoUpdater.on("checking-for-update",()=>{

    })
    autoUpdater.on("update-available",(info)=>{

    })
    autoUpdater.on("update-not-available",(info)=>{

    })
    autoUpdater.on("error",(error, message)=>{

    })
    autoUpdater.on("download-progress",(progressInfo)=>{

    })
    autoUpdater.on("update-downloaded",()=>{

    })

    this.isReady = true
  }

  /**
   * 检查是否有更新
   */
  async checkUpdate(){
    const updateCheckResult = await autoUpdater.checkForUpdates()
    this.sendStatusToWindow(this.windowService.getMainWindow(),{

    })
  }

  /**
   * 下载方法
   */
  async download(){
    await autoUpdater.downloadUpdate()
  }


  /**
   * 发送消息
   * @param mainWindow
   * @param context
   * @private
   */
  private sendStatusToWindow(mainWindow:BaseWindow,context:{}={}){
    const textJson = JSON.stringify(context)
    const channel = "/system/appUpdater"
    mainWindow.getInstance().webContents.send(channel)
  }
}