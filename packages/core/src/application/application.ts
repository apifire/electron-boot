import {bindContainer, ElectronBootOptions, getClassMetadata, listPreloadModule} from "../decorator";
import {APPLICATION_BOOT_KEY} from "../constant";
import {IElectronContainer} from "../interface";
import {ElectronContainer} from "../context";
import {DirectoryFileDetector} from "../detector";
import {
  AspectService,
  ConfigService,
  DecoratorService,
  EnvironmentService,
  InformationService,
  IpcService,
  LifeCycleService,
  RouterService,
  WindowService,
} from "../service";
import {app, BrowserWindow, dialog, ipcMain, IpcMainEvent, Menu} from "electron";
import {dirname, join} from "path";
import util from "util";
import defaultConfig from "../config/config.default";
import {release} from "os";
import {RuntimeService} from "../service/runtime.service";
import WebContents = Electron.WebContents;
import RenderProcessGoneDetails = Electron.RenderProcessGoneDetails;

const debug = util.debuglog("electron-boot:debug");
/**
 * 应用
 */
export class ElectronApplication {
  // 应用路径
  private appDir:string
  // 渲染页面路径
  private rendererDir:string
  // 扫描路径
  private scanDir: string;
  // 应用上下文
  private applicationContext: Partial<IElectronContainer> = {};
  // 配置信息
  private readonly globalOptions: ElectronBootOptions;
  /**
   * 构造函数
   * @param target
   */
  constructor(private readonly target: any) {
    // 获取配置信息
    this.globalOptions = (getClassMetadata(APPLICATION_BOOT_KEY, this.target) || {}) as ElectronBootOptions;
  }

  /**
   * 初始化
   * @private
   */
  private async initPath() {
    // 设置当前app的路径
    this.appDir = app.getAppPath()
    // 获取package.json的路径
    const packagePath = join(this.appDir,"package.json")
    // 导入package
    const packageInfo = require(packagePath)
    // 设置扫描路径
    if (!this.globalOptions.scanDir){
      // 设置扫描路径
      this.scanDir = this.globalOptions.scanDir = join(this.appDir,dirname(packageInfo.main),"main")
    }else{
      // 如果有设置scanDir
      this.scanDir = this.globalOptions.scanDir
    }
    // 设置渲染页面的路径
    if (!this.globalOptions.rendererDir){
      this.rendererDir = this.globalOptions.rendererDir = join(this.appDir,"dist","renderer")
    }
  }

  /**
   * 初始化应用上下文
   * @private
   */
  private async initApplicationContext() {
    // 初始化上下文
    const applicationContext = await this.prepareApplicationContext();

    // 初始化runtime
    await applicationContext.getAsync(RuntimeService,[applicationContext,this.globalOptions])

    // 初始化生命周期服务
    await applicationContext.getAsync(LifeCycleService, [applicationContext]);

    // 前置模块初始化
    const modules = listPreloadModule();
    for (const module of modules) {
      await applicationContext.getAsync(module);
    }

    this.applicationContext = applicationContext;
  }

  /**
   * 初始化应用上下文
   * @private
   */
  private async prepareApplicationContext(): Promise<IElectronContainer> {
    // 应用参数
    const globalOptions = this.globalOptions;

    // 打印日志
    debug(`[application]: start "prepareApplicationContext"`);
    debug(`[application]: bootstrap options=${util.inspect(globalOptions)}`);

    // app路径
    const appDir = this.appDir??""
    // 文件扫描路径
    const scanDir = this.scanDir ?? "";
    // 渲染页面路径
    const rendererDir = this.rendererDir??""
    // 创建上下文
    const applicationContext = new ElectronContainer();
    // 绑定容器
    bindContainer(applicationContext);
    global["ELECTRON_APPLICATION_CONTEXT"] = applicationContext;

    // 绑定静态变量
    applicationContext.bindObject("appDir",appDir)
    applicationContext.bindObject("rendererDir",rendererDir)
    applicationContext.bindObject("scanDir", scanDir);
    applicationContext.bindObject("app",this)

    // 如果设置了模块扫描器
    if (globalOptions.moduleDetector !== false) {
      if (globalOptions.moduleDetector === undefined || globalOptions.moduleDetector === "file") {
        applicationContext.setFileDetector(
          new DirectoryFileDetector({
            loadDir: scanDir,
            ignore: globalOptions.ignore ?? [],
          })
        );
      } else if (globalOptions.moduleDetector) {
        applicationContext.setFileDetector(globalOptions.moduleDetector);
      }
    }

    // 加载内部服务
    applicationContext.bindClass(EnvironmentService);
    applicationContext.bindClass(InformationService);
    applicationContext.bindClass(AspectService);
    applicationContext.bindClass(DecoratorService);
    applicationContext.bindClass(ConfigService);
    applicationContext.bindClass(LifeCycleService);
    applicationContext.bindClass(RuntimeService)
    applicationContext.bindClass(RouterService);
    applicationContext.bindClass(IpcService);
    applicationContext.bindClass(WindowService);

    // 前置模块
    if (globalOptions.preloadModules && globalOptions.preloadModules.length) {
      for (const preloadModule of globalOptions.preloadModules) {
        applicationContext.bindClass(preloadModule);
      }
    }

    // 初始化默认配置
    const configService = applicationContext.get(ConfigService,[applicationContext]);
    configService.add([
      {
        default: defaultConfig,
      },
    ]);

    // 初始化aop
    applicationContext.get(AspectService, [applicationContext]);

    // 初始化decorator
    applicationContext.get(DecoratorService, [applicationContext]);

    // 绑定完成后初始化window服务
    applicationContext.get(WindowService,[applicationContext])
    // 加载模块
    for (const configurationModule of [].concat(globalOptions.imports)) {
      if (configurationModule) {
        applicationContext.load(configurationModule);
      }
    }

    // 添加配置文件
    if (!globalOptions.importConfigs) {
      globalOptions.importConfigs = [join(scanDir, "config")];
    }

    debug(`[core]:current globalOptions = %j`, globalOptions);

    // 绑定代码模块
    applicationContext.ready();

    // 加载配置文件
    if (globalOptions.importConfigs) {
      if (Array.isArray(globalOptions.importConfigs)) {
        configService.add(globalOptions.importConfigs);
      } else {
        configService.addObject(globalOptions.importConfigs);
      }
    }

    // 合并配置
    configService.load();

    debug(`[core]:current config = %j`, configService.getConfiguration());

    return applicationContext;
  }

  /**
   * 初始化electron应用
   * @private
   */
  private async initElectron(){
    // 窗口服务
    const windowService = this.applicationContext.get(WindowService,[this.applicationContext])
    // 主窗口
    const mainWin = windowService.getMainWindow()
    // 设置主窗口事件监听
    mainWin.on("ready-to-show",()=>{
      mainWin.getInstance().show()
    })
    // 配置服务
    const configService = this.applicationContext.get(ConfigService)
    // 初始化ipc
    const ipcService = this.applicationContext.get(IpcService,[this.applicationContext])
    await ipcService.run()
    // 如果配置了单例运行
    if (configService.getConfiguration("singleInstance")===true){
      if (!app.requestSingleInstanceLock()){
        await this.appQuit()
        process.exit(0)
      }
    }
    // 禁用window7的gpu加速
    if (release().startsWith("6.1")) app.disableHardwareAcceleration();
    // 设置Windows 10+通知的应用程序名称
    if (process.platform === "win32") app.setAppUserModelId(app.getName());
    // 禁止安全警告
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
    // 由于9.x版本问题，需要加入该配置关闭跨域问题
    app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
    // 应用准备完毕回调
    app.whenReady().then(()=>{
      // 创建窗口
      mainWin.createWindow()
    })
    // 所有的窗口关闭事件
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') this.appQuit()
    })
    // 窗口活动事件监听
    app.on('activate', () => {
      const allWindows = BrowserWindow.getAllWindows()
      if (allWindows.length) {
        allWindows[0].focus()
      } else {
        // 创建窗口
        mainWin.createWindow()
      }
    })
    // 当渲染进程卡死是，分类进行警告操作
    app.on("render-process-gone",(event:Event,webContents:WebContents,details:RenderProcessGoneDetails)=>{
      const browserWindow=BrowserWindow.fromWebContents(webContents)
      const message = {
        title: "",
        buttons: [] as Array<string>,
        message: ""
      };
      switch (details.reason) {
        case "crashed":
          message.title = "警告";
          message.buttons = ["确定", "退出"];
          message.message = "图形化进程崩溃，是否进行软重启操作？";
          break;
        case "killed":
          message.title = "警告";
          message.buttons = ["确定", "退出"];
          message.message = "由于未知原因导致图形化进程被终止，是否进行软重启操作？";
          break;
        case "oom":
          message.title = "警告";
          message.buttons = ["确定", "退出"];
          message.message = "内存不足，是否软重启释放内存？";
          break;
        default:
          break;
      }
      dialog
        .showMessageBox(browserWindow, {
          type: "warning",
          title: message.title,
          buttons: message.buttons,
          message: message.message,
          noLink: true
        })
        .then((res) => {
          if (res.response === 0) browserWindow.reload();
          else browserWindow.close();
        });
    })
    // 新的gpu崩溃检测
    app.on("child-process-gone",(event,details)=>{
      const message = {
        title: "",
        buttons: [] as Array<string>,
        message: ""
      };
      switch (details.type) {
        case "GPU":
          switch (details.reason) {
            case "crashed":
              message.title = "警告";
              message.buttons = ["确定", "退出"];
              message.message = "硬件加速进程已崩溃，是否关闭硬件加速并重启？";
              break;
            case "killed":
              message.title = "警告";
              message.buttons = ["确定", "退出"];
              message.message = "硬件加速进程被意外终止，是否关闭硬件加速并重启？";
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }
      dialog
        .showMessageBox(mainWin.getInstance(), {
          type: "warning",
          title: message.title,
          buttons: message.buttons,
          message: message.message,
          noLink: true
        })
        .then((res) => {
          // 当显卡出现崩溃现象时使用该设置禁用显卡加速模式。
          if (res.response === 0) {
            if (details.type === "GPU") app.disableHardwareAcceleration();
            mainWin.getInstance().reload();
          } else {
            mainWin.getInstance().close();
          }
        });
    })
    // 初始化菜单
    await this.initMenu()
  }

  /**
   * 注册菜单
   * @private
   */
  private async initMenu(){
    // 获取配置
    const configService=await this.applicationContext.getAsync(ConfigService)
    // 获取配置信息
    const config = configService.getConfiguration("menu")
    // 构建菜单
    const menu = Menu.buildFromTemplate(config??[])
    // 设置菜单
    Menu.setApplicationMenu(menu)
  }

  /**
   * 设置系统级别
   * @private
   */
  private async initIpc(){
    const windowActionChannel = "/system/windowAction"
    // 窗口操作函数
    const windowActionHandle = (event:IpcMainEvent, args):any=>{
      const browserWindow= BrowserWindow.fromWebContents(event.sender)
      const result={} as any
      switch (args.type) {
        case "minimize":
          browserWindow.minimize();
          result.min = true
          return result
        case "maximize":
          if (browserWindow.isMaximized()) {
            browserWindow.unmaximize();
            result.max = false
          } else {
            browserWindow.maximize();
            result.max = true
          }
          return result
        case "close":
          browserWindow.close();
          break;
        default:
          break;
      }
    }
    // 窗口的操作
    ipcMain.on(windowActionChannel,(event:IpcMainEvent, args)=>{
      const result = windowActionHandle(event,args)
      event.returnValue = result
      event.reply(`${windowActionChannel}`,result)

    })
    ipcMain.handle(windowActionChannel,(event:IpcMainEvent,args)=>{
      return windowActionHandle(event, args)
    })
  }

  /**
   * 内部运行方法
   */
  async run(args: string[]) {
    // 初始化路径
    await this.initPath();
    // 初始化上下文
    await this.initApplicationContext();
    // 初始化electron
    await this.initElectron()
    // 设置系统级别控制
    await this.initIpc()
  }

  /**
   * 应用退出
   */
  private async beforeClose(){
    // 获取生命周期
    const lifeCycleService =await this.applicationContext.getAsync(LifeCycleService, [this.applicationContext]);
    // 停止
    await lifeCycleService.stop()
  }

  /**
   * 应用退出
   */
  async appQuit(){
    await this.beforeClose()
  }

  // 应用启动方法
  static async run(target: any, args: string[]) {
    await new ElectronApplication(target).run(args);
  }
}
