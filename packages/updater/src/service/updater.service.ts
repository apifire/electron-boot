import {Autowired, Config, Init, Provide, Scope, ScopeEnum, WindowService} from "@electron-boot/core";
import {AutoUpdate} from "../interface";

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



    this.isReady = true
  }

  checkUpdate(){

  }
}