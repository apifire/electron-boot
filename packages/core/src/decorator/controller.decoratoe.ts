import {saveClassMetadata, saveModule} from "./default.manager";
import {ROUTER_CONTROLLER_KEY} from "../constant";
import {Provide} from "./provide.decorator";
import {Scope} from "./custom.decorator";
import {ScopeEnum} from "../interface";

/**
 * 控制器参数信息
 */
export interface ControllerOption {
  prefix:string
  routerOptions:RouterOptions
}

/**
 * 路由参数信息
 */
export interface RouterOptions {
  sensitive?: boolean;
  alias?: string[];
  tagName?: string;
}

/**
 * 控制器装饰器参数
 * @param prefix 前缀
 * @param routerOptions 路由参数
 * @constructor
 */
export const Controller = (
  prefix:string="/",
  routerOptions:RouterOptions = {

  }
):ClassDecorator=>{
  return target => {
    saveModule(ROUTER_CONTROLLER_KEY,target)
    if (prefix){
      saveClassMetadata(
        ROUTER_CONTROLLER_KEY,
        {
          prefix,
          routerOptions
        } as ControllerOption,
        target
      )
    }
    Provide()(target)
    Scope(ScopeEnum.Request)(target)
  }
}