import {attachClassMetadata} from "./default.manager";
import {ROUTER_ACTION_KEY} from "../constant";

/**
 * 路由配置信息
 */
export interface RouterOption {
  /**
   * 路由路径，匹配路径
   */
  path?: string;
  /**
   * 路由别名
   */
  routerName?: string;
  /**
   * 装饰器附加方法
   */
  method?: string;
}
/**
 * 默认的参数信息
 */
const defaultOption: RouterOption = {
  path: "/",
  routerName: null,
};

/**
 * RequestMapping装饰器
 * @param path
 * @param option
 * @constructor
 */
export const Action = (path:string,option: RouterOption = defaultOption): MethodDecorator => {
  path = path || option.path || "/"
  const routerName = option.routerName;
  return (target, propertyKey, descriptor) => {
    attachClassMetadata(
      ROUTER_ACTION_KEY,
      {
        path,
        routerName,
        method: propertyKey,
      } as RouterOption,
      target
    );
    return descriptor;
  };
};