import {createCustomPropertyDecorator} from "./default.manager";
import {ObjectIdentifier} from "../types";
import {PIPELINE_IDENTIFIER} from "../constant";

/**
 * 通道
 * @param values
 * @constructor
 */
export const Pipeline = (values?:Array<ObjectIdentifier|(new (...args)=>any)>):PropertyDecorator => {
  return createCustomPropertyDecorator(PIPELINE_IDENTIFIER,{
      values,
  })
}