import {Context, IElectronContainer, ScopeEnum} from "../interface";
import {Autowired, Provide, Scope} from "../decorator";
import {ipcMain, IpcMainEvent} from "electron";
import {RouterService} from "./router.service";
import util from "util";
import {joinURLPath} from "../utils";
import {ElectronRequestContainer} from "../context";

const debug = util.debuglog("electron-boot:debug");

@Provide()
@Scope(ScopeEnum.Singleton)
export class IpcService {
  // 默认的上下文
  private defaultContext = {}

  @Autowired()
  protected routerService:RouterService
  /**
   * 构造函数
   * @param applicationContext
   */
  constructor(readonly applicationContext: IElectronContainer ) {
  }
  /**
   * 创建请求上下文
   * @param extendCtx
   * @private
   */
  private createAnonymousContext(extendCtx?:Context):Context{
    const ctx = extendCtx || Object.create(this.defaultContext)
    if (ctx.startTime){
      ctx.startTime = Date.now()
    }
    if (!ctx.requestContext){
      ctx.requestContext = new ElectronRequestContainer(
        ctx,
        this.applicationContext
      )
      ctx.requestContext.ready()
    }
    ctx.setAttr = (key: string, value: any) => {
      ctx.requestContext.setAttr(key, value);
    };
    ctx.getAttr = <T>(key: string): T => {
      return ctx.requestContext.getAttr(key);
    };
    return ctx;
  }

  /**
   * 启动ipc服务
   */
  public async run(){
    const routerTable = await this.routerService.getRouterTable()
    const routerList = await this.routerService.getRouterPriorityList()
    for (const routerPriority of routerList) {
      // 绑定控制器
      this.applicationContext.bindClass(routerPriority.routerModule)
      // 打印加载日志
      debug(
        `Load Controller "${routerPriority.controllerId}", prefix=${routerPriority.prefix}`
      )
      // 添加路由
      const routers = routerTable.get(routerPriority.prefix)
      for (const router of routers) {
        const channel = joinURLPath(router.prefix,router.url)
        /**
         * ipc事件处理结果
         * @param event
         * @param data
         */
        const ipcResult = async (event:any,data:any)=>{
          const ctx = event as Context
          this.createAnonymousContext(ctx)
          event.requestContext = ctx.requestContext
          ctx.requestContext.bindObject("event",event)
          ctx.requestContext.bindObject("data",data)
          const controller = await event.requestContext.getAsync(router.id)
          let result
          if (typeof router.method!=="string"){
            result = await router.method(event,data)
          }else {
            result = await controller[router.method].call(controller,event,data)
          }
        }
        // 创建监听
        ipcMain.on(channel,async (event:IpcMainEvent,data:any)=>{
          const result = await ipcResult(event,data)
          event.returnValue = result
          event.reply(`${channel}`,result)
        })
        // 创建handler
        ipcMain.handle(channel,async (event:IpcMainEvent,data:any)=>{
          return await ipcResult(event, data)
        })
      }
    }
  }
}