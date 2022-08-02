import {saveModule} from "./default.manager";
import {APPLICATION_WINDOW} from "../constant";
import {Scope} from "./custom.decorator";
import {ScopeEnum} from "../interface";
import {Provide} from "./provide.decorator";
import {WindowModule} from "../interface/window.interface";

/**
 * 窗口参数信息
 */
export interface WindowOptions {
  namespace?:string
  main?:boolean
}

/**
 * 窗口装饰器
 * @constructor
 */
export const Window=(options?:WindowOptions):ClassDecorator=>{
  return target => {
    // 如果没有设置命名空间则设置为main
    if (!options.namespace) options.namespace = "main"
    // 保存模块，在初始化应用上下文时绑定到容器
    saveModule(APPLICATION_WINDOW,{
      target:target,
      ...options
    } as WindowModule)
    Scope(ScopeEnum.Singleton)(target)
    Provide()(target)
  }
}