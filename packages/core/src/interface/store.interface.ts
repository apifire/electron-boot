import {ObjectIdentifier} from "../types";

/**
 * 存储接口
 */
export interface IModuleStore {
  /**
   * 获取指定key的所有数据
   * @param key
   */
  listModule(key:ObjectIdentifier):any

  /**
   * 保存数据
   * @param key
   * @param module
   */
  saveModule(key:ObjectIdentifier,module:any)

  /**
   * 转换
   * @param moduleMap
   */
  transformModule?(moduleMap:Map<ObjectIdentifier,Set<any>>)
}