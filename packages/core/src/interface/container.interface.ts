import {ObjectIdentifier} from "../types";
import EventEmitter from "events";
import {ScopeEnum} from "./decorator.interface";

/**
 * 对象创建工厂定义
 */
export interface IObjectCreator {
  load(): any;
  doConstruct(Clazz: any, args?: any, context?: IElectronContainer): any;
  doConstructAsync(
    Clazz: any,
    args?: any,
    context?: IElectronContainer
  ): Promise<any>;
  doInit(obj: any): void;
  doInitAsync(obj: any): Promise<void>;
  doDestroy(obj: any): void;
  doDestroyAsync(obj: any): Promise<void>;
}

/**
 * 对象生命周期事件
 */
export enum ObjectLifeCycleEvent {
  BEFORE_BIND = 'beforeBind',
  BEFORE_CREATED = 'beforeObjectCreated',
  AFTER_CREATED = 'afterObjectCreated',
  AFTER_INIT = 'afterObjectInit',
  BEFORE_DESTROY = 'beforeObjectDestroy',
}

/**
 * 内部管理的属性、json、ref等数据解析的实例存储
 */
export interface IResolverInstance {
  type: string;
  value?: any;
  args?: any;
}

/**
 * 解析内部管理的属性、json、ref等实例的解析器定义
 */
export interface IResolver {
  type: string;
  resolve(managed: IResolverInstance,...args:any[]): any;
  resolveAsync(managed: IResolverInstance,...args:any[]): Promise<any>;
}

/**
 * 代理工厂创建对象时的参数定义
 */
export interface ResolverFactoryCreateOptions {
  namespace?: string
  definition: IObjectDefinition
  args?: any
}

/**
 * 属性配置定义
 */
export interface IProperties {
  set(key:any,value:any)
  get(key:any):any
  getProperty(key: ObjectIdentifier, defaultValue?: any): any;
  setProperty(key: ObjectIdentifier, value: any): any;
  propertyKeys(): ObjectIdentifier[];
}

/**
 * 对象描述定义
 */
export interface IObjectDefinition {
  namespace?: string;
  creator: IObjectCreator;
  id: string;
  name: string;
  initMethod: string;
  destroyMethod: string;
  constructMethod: string;
  srcPath: string;
  path: any;
  export: string;
  dependsOn: ObjectIdentifier[];
  constructorArgs: IResolverInstance[];
  properties: IProperties;
  scope: ScopeEnum;
  isAsync(): boolean;
  isSingletonScope(): boolean;
  isRequestScope(): boolean;
  hasDependsOn(): boolean;
  hasConstructorArgs(): boolean;
  getAttr(key: ObjectIdentifier): any;
  hasAttr(key: ObjectIdentifier): boolean;
  setAttr(key: ObjectIdentifier, value: any): void;
  // 自定义装饰器的 key、propertyName
  handlerProps: Array<{
    /**
     * decorator property name set
     */
    propertyName: string;
    /**
     * decorator uuid key
     */
    key: string;
    /**
     * custom decorator set metadata
     */
    metadata: any;
  }>;
  createFrom: 'framework' | 'file' | 'module';
  allowDowngrade: boolean;
  bindHook?: (module: any, options?: IObjectDefinition) => void;
}

/**
 * 对象定义存储容器
 */
export interface IObjectDefinitionRegistry {
  readonly identifiers: ObjectIdentifier[];
  readonly count: number;
  registerDefinition(
    identifier: ObjectIdentifier,
    definition: IObjectDefinition
  );
  getSingletonDefinitionIds(): ObjectIdentifier[];
  getDefinition(identifier: ObjectIdentifier): IObjectDefinition;
  getDefinitionByName(name: string): IObjectDefinition[];
  removeDefinition(identifier: ObjectIdentifier): void;
  hasDefinition(identifier: ObjectIdentifier): boolean;
  clearAll(): void;
  hasObject(identifier: ObjectIdentifier): boolean;
  registerObject(identifier: ObjectIdentifier, target: any);
  getObject(identifier: ObjectIdentifier): any;
  getIdentifierRelation(): IIdentifierRelationShip;
  setIdentifierRelation(identifierRelation: IIdentifierRelationShip);
}

/**
 * 标识映射关系
 */
export interface IIdentifierRelationShip {
  saveClassRelation(module: any, namespace?: string);
  saveFunctionRelation(ObjectIdentifier, uuid);
  hasRelation(id: ObjectIdentifier): boolean;
  getRelation(id: ObjectIdentifier): string;
}

/**
 * 文件检测器
 */
export interface IFileDetector {
  run(container: IElectronContainer, fileDetectorOptions?: Record<string, any>);
  setExtraDetectorOptions(detectorOptions: Record<string, any>);
}

/**
 * 对象容器
 */
export interface ObjectContext {
  originName?: string;
}

/**
 * 抽象对象工厂
 */
export interface IObjectFactory {
  registry: IObjectDefinitionRegistry;
  get<T>(
    identifier: new (...args) => T,
    args?: any[],
    objectContext?: ObjectContext
  ): T;
  get<T>(
    identifier: ObjectIdentifier,
    args?: any[],
    objectContext?: ObjectContext
  ): T;
  getAsync<T>(
    identifier: new (...args) => T,
    args?: any[],
    objectContext?: ObjectContext
  ): Promise<T>;
  getAsync<T>(
    identifier: ObjectIdentifier,
    args?: any[],
    objectContext?: ObjectContext
  ): Promise<T>;
}

/**
 * 对象生命周期选项
 */
interface ObjectLifeCycleOptions {
  context: IElectronContainer;
  definition: IObjectDefinition;
}

/**
 * 对象绑定前选项
 */
export interface ObjectBeforeBindOptions extends ObjectLifeCycleOptions {
  replaceCallback: (newDefinition: IObjectDefinition) => void;
}

/**
 * 对象创建前选项
 */
export interface ObjectBeforeCreatedOptions extends ObjectLifeCycleOptions {
  constructorArgs: any[];
}

/**
 * 对象创建选项
 */
export interface ObjectCreatedOptions<T> extends ObjectLifeCycleOptions {
  replaceCallback: (ins: T) => void;
}

/**
 * 对象初始化选项
 */
export type ObjectInitOptions = ObjectLifeCycleOptions

/**
 * 对象销毁前选项
 */
export type ObjectBeforeDestroyOptions = ObjectLifeCycleOptions

/**
 * 对象生命周期
 */
export interface IObjectLifeCycle {
  onBeforeBind(fn: (Clazz: any, options: ObjectBeforeBindOptions) => void);
  onBeforeObjectCreated(
    fn: (Clazz: any, options: ObjectBeforeCreatedOptions) => void
  );
  onObjectCreated<T>(fn: (ins: T, options: ObjectCreatedOptions<T>) => void);
  onObjectInit<T>(fn: (ins: T, options: ObjectInitOptions) => void);
  onBeforeObjectDestroy<T>(
    fn: (ins: T, options: ObjectBeforeDestroyOptions) => void
  );
}

/**
 * 对象容器定义
 */
export interface IElectronContainer extends IObjectFactory,IObjectLifeCycle {
  // 父级容器
  parent: IElectronContainer
  // 标识映射关系
  identifierMapping: IIdentifierRelationShip
  // 对象创建事件
  objectCreateEventTarget: EventEmitter;
  // 准备完毕
  ready()
  // 停止方法
  stop():Promise<void>
  // 加载模块
  load(module?:any)
  // 判断是否有有指定的命名空间
  hasNamespace(namespace:string):boolean
  // 判断是否存在指定的对象定义
  hasDefinition(identifier:ObjectIdentifier):boolean
  // 容器是否存在该对象
  hasObject(identifier:ObjectIdentifier):boolean
  // 绑定类
  bind<T>(target:T,options?:Partial<IObjectDefinition>):void
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: Partial<IObjectDefinition>
  ): void;
  // 绑定对象
  bindObject(identifier: ObjectIdentifier, target: any)
  // 绑定类
  bindClass(exports, options?: Partial<IObjectDefinition>)
  // 设置文件检测器
  setFileDetector(fileDetector:IFileDetector)
  // 创建子容器
  createChild():IElectronContainer
  // 添加属性
  setAttr(key:string,value:any)
  // 获取属性
  getAttr<T>(key:string):T
}