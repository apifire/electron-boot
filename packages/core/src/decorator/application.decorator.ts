import {IFileDetector} from "../interface";
import {saveClassMetadata} from "./default.manager";
import {APPLICATION_BOOT_KEY} from "../constant";
import {isFunction} from "../utils";

/**
 * 启动注入装饰器参数
 */
export interface ElectronBootOptions {
  [customPropertyKey: string]: any;
  // 扫描文件路径
  scanDir?:string
  // 渲染页面路径
  rendererDir?:string
  // 要导入的模块
  imports?:any[]
  // 要导入的配置文件
  importConfigs?:any[]
  // 预加载模块
  preloadModules?:any[]
  // 文件扫描器
  moduleDetector?: 'file' | IFileDetector | false;
  // 忽略扫描配置
  ignore?: string[];
}
/**
 * 应用启动装饰器
 * @constructor
 */
export const ElectronBootApplication = (opts?:ElectronBootOptions):ClassDecorator =>{
  return target => {
    // 保存类元数据
    saveClassMetadata(APPLICATION_BOOT_KEY,opts,target)
    // 执行类的main方法
    target["main"] && isFunction(target["main"]) && target["main"](process.argv.slice(2))
  }
}