import {saveClassMetadata} from "./default.manager";
import {CONFIGURATION_KEY} from "../constant";
import {IComponentInfo} from "../interface";


/**
 * 组件配置参数
 */
export interface ConfigurationOptions {
  // 组件的命名空间
  namespace?:string
  // 导入的额外模块
  imports?:Array<string|IComponentInfo|{Configuration:any}>
  // 导入的对象
  importObjects?:Record<string, unknown>
  // 导入的配置文件
  importConfigs?: Array<{[environmentName:string]:Record<string, any>}>
    | Record<string, any>
  // 过滤参数
  detectorOptions?: Record<string, any>;
}

/**
 * 组件配置装饰器
 * @param options 参数信息
 * @constructor
 */
export const Configuration = (options:ConfigurationOptions={}):ClassDecorator=>{
  return target => {
    saveClassMetadata(CONFIGURATION_KEY,options,target)
  }
}