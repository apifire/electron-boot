import {
  Autowired,
  BaseWindow,
  Config,
  ElectronApplication,
  IElectronContainer,
  Init,
  Provide,
  Scope,
  ScopeEnum,
  WindowService
} from "@electron-boot/core";
import {AutoUpdate, EventData, EventType} from "../interface";
import {app} from "electron"
import {autoUpdater} from "electron-updater";

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

  @Autowired()
  private app:ElectronApplication

  constructor(readonly applicationContext:IElectronContainer) {
  }

  @Init()
  async init(){
    if (this.isReady) return
    // 获取配置信息
    let updateConfig = this.updaterConfig
    // 判断平台是否支持下载
    const mainWindow = this.windowService.getMainWindow()
    // 是否后台自动下载
    autoUpdater.autoDownload = updateConfig.force
    // 设置下载地址
    try{
      autoUpdater.setFeedURL(updateConfig.options)
    }catch (e) {
      console.log("[autoUpdater] setFeedURL error",e)
    }
    /**
     * 正在检查更新
     */
    autoUpdater.on("checking-for-update",()=>{
      console.log("正在检查更新")
      this.sendStatusToWindow(mainWindow,{
        eventType:EventType.checking
      })
    })
    /**
     * 有可用的更
     */
    autoUpdater.on("update-available",(updateInfo)=>{
      console.log("有更新")
      this.sendStatusToWindow(mainWindow,{
        eventType:EventType.available,
        updateInfo
      })
    })
    /**
     * 没有可用的更新
     */
    autoUpdater.on("update-not-available",(updateInfo)=>{
      console.log("没有更新")
      this.sendStatusToWindow(mainWindow,{
        eventType:EventType.noAvailable,
        updateInfo
      })
    })
    /**
     * 下载出错
     */
    autoUpdater.on("error",(error, message)=>{
      this.sendStatusToWindow(mainWindow,{
        eventType:EventType.error,
        errorInfo:{
          message:message,
          error
        }
      })
    })
    /**
     * 下载进度条
     */
    autoUpdater.on("download-progress",(progressInfo)=>{
      this.sendStatusToWindow(mainWindow,{
        eventType:EventType.progress,
        progressInfo
      })
    })
    /**
     * 下载完毕
     */
    autoUpdater.on("update-downloaded",(event)=>{
      this.sendStatusToWindow(mainWindow,{
        eventType:EventType.progress,
        downloadedInfo:event
      })
      this.app.appQuit()
      autoUpdater.quitAndInstall()
    })
    /**
     * 监听app启动完毕
     */
    app.on("ready",async ()=>{
      mainWindow.on("ready-to-show",async ()=>{
        /**
         * 如果配置了自动检查更新
         */
        if (updateConfig.autoCheck) await this.checkUpdate()
      })
    })

    this.isReady = true
  }

  /**
   * 检查是否有更新
   */
  async checkUpdate(){
    return await autoUpdater.checkForUpdates()
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
  private sendStatusToWindow(mainWindow:BaseWindow,context:EventData){
    const textJson = JSON.stringify(context)
    const channel = "/system/appUpdater"
    mainWindow.getInstance().webContents.send(channel,textJson)
  }
}