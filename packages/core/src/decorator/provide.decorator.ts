import {ObjectIdentifier} from "../types";
import {saveProvideId} from "./default.manager";

/**
 * 服务提供者装饰器
 * @param identifier 唯一标识
 * @constructor
 */
export const Provide = (identifier?:ObjectIdentifier):ClassDecorator=>{
  return target => {
    return saveProvideId(identifier,target)
  }
}