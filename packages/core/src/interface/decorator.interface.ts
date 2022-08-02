import {ObjectIdentifier} from "../types";
import {IMethodAspect} from "../decorator";

/**
 * 注入模式
 */
export enum InjectModeEnum {
  Identifier = 'Identifier',
  Class = 'Class',
  PropertyName = 'PropertyName',
}

/**
 * 注入实例的作用域
 */
export enum ScopeEnum {
  Singleton = 'Singleton',
  Request = "Request",
  Prototype = 'Prototype',
}

/**
 * 对象定义参数
 */
export interface ObjectDefinitionOptions {
  isAsync?: boolean;
  initMethod?: string;
  destroyMethod?: string;
  scope?: ScopeEnum;
  constructorArgs?: any[];
  namespace?: string;
  srcPath?: string;
  allowDowngrade?: boolean;
}

export type HandlerFunction = (
  /**
   * decorator uuid key
   */
  key: string,
  /**
   * decorator set metadata
   */
  meta: any,
  instance: any
) => any;

export type MethodHandlerFunction = (options: {
  target: new (...args) => any;
  propertyName: string;
  metadata: any;
}) => IMethodAspect;

export type ParameterHandlerFunction = (options: {
  target: new (...args) => any;
  propertyName: string;
  metadata: any;
  originArgs: Array<any>;
  originParamType: any;
  parameterIndex: number;
}) => any;

/**
 * 标记属性数据
 */
export interface TagPropsMetadata {
  key: string | number | symbol;
  value: any;
  args?: any;
}

/**
 * 服务提供者类元数据定义
 */
export interface TargetClassMetadata {
  /**
   * 类的唯一标志
   */
  id:ObjectIdentifier|undefined
  /**
   * 类唯一uuid
   */
  uuid:string
  /**
   * 原始类名
   */
  originName:string
  /**
   * 全转为小写后的名称
   */
  name:string
}

/**
 * 组件信息接口
 */
export interface IComponentInfo {
  component: any;
  enabledEnvironment?: string[];
}