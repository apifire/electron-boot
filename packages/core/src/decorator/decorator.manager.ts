import {INJECT_CLASS_KEY_PREFIX, INJECT_CLASS_METHOD_KEY_PREFIX, INJECT_METHOD_KEY_PREFIX} from "../constant";
import {IModuleStore} from "../interface";
import {GroupModeType, ObjectIdentifier} from "../types";

/**
 * 装饰管理器
 */
export class DecoratorManager implements IModuleStore{
  // 数据存储
  private storeMap = new Map()
  // 补充map的get
  get(key:any):any{
    return this.storeMap.get(key)
  }
  // 补充map的set
  set(key:any,value:any){
    this.storeMap.set(key, value)
  }
  /**
   * 清除storeMap
   */
  clear(){
    this.storeMap.clear()
  }
  /**
   * 存储容器
   */
  public container:IModuleStore|null=null

  /**
   * 获取存储模块
   * @param key
   */
  public listModule(key: ObjectIdentifier): any {
    if (this.container) {
      return this.container.listModule(key);
    }
    return Array.from(this.storeMap.get(key) as ArrayLike<any> || []);
  }



  /**
   * 保存模块
   * @param key 存储key
   * @param module 存储模块
   */
  public saveModule(key: ObjectIdentifier, module: any) {
    if (this.container){
      return this.container.saveModule(key,module)
    }
    if (!this.storeMap.has(key)){
      this.storeMap.set(key,new Set())
    }
    this.storeMap.get(key).add(module)
  }

  /**
   * 重置模块
   * @param key
   */
  public resetModule(key: string | symbol) {
    this.storeMap.set(key,new Set())
  }

  /**
   * 绑定容器
   * @param container
   */
  public bindContainer(container?:IModuleStore){
    this.container = container
    this.container?.transformModule(this.storeMap)
  }

  /**
   * 保存元数据
   * @param decoratorNameKey 修饰key
   * @param data 数据信息
   * @param target 目标类
   * @param propertyName 属性名称
   */
  saveMetadata<T>(decoratorNameKey:ObjectIdentifier,data:any,target:T,propertyName?:ObjectIdentifier){
    if (propertyName){
      const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey,propertyName)
      DecoratorManager.saveMetadata(INJECT_CLASS_KEY_PREFIX,target,dataKey,data)
    }else{
      const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey)
      DecoratorManager.saveMetadata(INJECT_CLASS_KEY_PREFIX,target,dataKey,data)
    }
  }

  /**
   * 获取元数据
   * @param decoratorNameKey
   * @param target
   * @param propertyName
   */
  getMetadata<T>(
    decoratorNameKey:ObjectIdentifier,
    target:T,
    propertyName?:any
  ){
    if (propertyName){
      const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey,propertyName)
      return DecoratorManager.getMetadata(INJECT_CLASS_KEY_PREFIX,target,dataKey)
    }else{
      const dataKey = `${DecoratorManager.getDecoratorClassKey(
        decoratorNameKey
      )}`
      return DecoratorManager.getMetadata(INJECT_CLASS_KEY_PREFIX,target,dataKey)
    }
  }

  /**
   * 附加特性属数据到类
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   * @param groupBy
   * @param groupMode
   */
  attachMetadata(
    decoratorNameKey: ObjectIdentifier,
    data,
    target,
    propertyName?: string,
    groupBy?: string,
    groupMode?: GroupModeType
  ) {
    if (propertyName) {
      const dataKey = DecoratorManager.getDecoratorMethod(
        decoratorNameKey,
        propertyName
      );
      DecoratorManager.attachMetadata(
        INJECT_METHOD_KEY_PREFIX,
        target,
        dataKey,
        data,
        groupBy,
        groupMode
      );
    } else {
      const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey);
      DecoratorManager.attachMetadata(
        INJECT_CLASS_KEY_PREFIX,
        target,
        dataKey,
        data,
        groupBy,
        groupMode
      );
    }
  }


  /**
   * save property data to class
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   */
  savePropertyDataToClass(
    decoratorNameKey: ObjectIdentifier,
    data,
    target,
    propertyName
  ) {
    const dataKey = DecoratorManager.getDecoratorClassMethodKey(
      decoratorNameKey,
      propertyName
    );
    DecoratorManager.saveMetadata(
      INJECT_CLASS_METHOD_KEY_PREFIX,
      target,
      dataKey,
      data
    );
  }

  /**
   * 将特性数据附加到类
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   * @param groupBy
   */
  attachPropertyDataToClass(
    decoratorNameKey: ObjectIdentifier,
    data,
    target,
    propertyName,
    groupBy?: string
  ) {
    const dataKey = DecoratorManager.getDecoratorClassMethodKey(
      decoratorNameKey,
      propertyName
    );
    DecoratorManager.attachMetadata(
      INJECT_CLASS_METHOD_KEY_PREFIX,
      target,
      dataKey,
      data,
      groupBy
    );
  }

  /**
   * 从类中获取属性数据
   * @param decoratorNameKey
   * @param target
   * @param propertyName
   */
  getPropertyDataFromClass(
    decoratorNameKey: ObjectIdentifier,
    target,
    propertyName
  ) {
    const dataKey = DecoratorManager.getDecoratorClassMethodKey(
      decoratorNameKey,
      propertyName
    );
    return DecoratorManager.getMetadata(
      INJECT_CLASS_METHOD_KEY_PREFIX,
      target,
      dataKey
    );
  }


  /**
   * list property data from class
   * @param decoratorNameKey
   * @param target
   */
  listPropertyDataFromClass(decoratorNameKey: ObjectIdentifier, target) {
    const originMap = DecoratorManager.getMetadata(
      INJECT_CLASS_METHOD_KEY_PREFIX,
      target,
      undefined
    );
    const res = [];
    for (const [key, value] of originMap) {
      if (
        key.indexOf(
          DecoratorManager.getDecoratorClassMethodPrefix(decoratorNameKey)
        ) !== -1
      ) {
        res.push(value);
      }
    }
    return res;
  }

  // =======================静态方法======================


  /**
   * 保存元数据到target
   * @param metaKey 元数据存储键
   * @param target 存储目标
   * @param dataKey 数据键
   * @param data 存储数据
   */
  public static saveMetadata(metaKey:string,target:any,dataKey:string,data:any){
    // 过滤掉object.create(null)
    if (typeof target==="object" && target.constructor){
      target = target.constructor
    }
    let m:Map<string,any>
    // 如果在target上存在了metaKey的元数据
    if (Reflect.hasOwnMetadata(metaKey,target)){
      m = Reflect.getMetadata(metaKey,target)
    }else{
      m = new Map<string,any>
    }
    // 元数据
    m.set(dataKey,data)
    // 在target上定义元数据
    Reflect.defineMetadata(metaKey,m,target)
  }

  /**
   * 从指定target取出指定元数据key和数据key的元数据信息
   * @param metaKey 元数据key
   * @param target 元数据存储类
   * @param dataKey 数据key
   */
  public static getMetadata<T>(metaKey:string,target:T,dataKey:string){
    // 过滤掉工厂方法
    if (typeof target==="object" && target?.constructor){
      target = target.constructor as any
    }
    let m:Map<string,any>
    if (!Reflect.hasOwnMetadata(metaKey, target)) {
      m = new Map<string, any>();
      Reflect.defineMetadata(metaKey, m, target);
    } else {
      m = Reflect.getMetadata(metaKey, target);
    }
    if (!dataKey){
      return m
    }
    return m.get(dataKey)
  }

  /**
   * 将元数据附加到类
   * @param metaKey 元数据key
   * @param target 目标类
   * @param dataKey 数据key
   * @param data 数据
   * @param groupBy 分组
   * @param groupMode 分组模式
   */
  static attachMetadataToClass(metaKey: string,target: Object,dataKey: string,data: any,groupBy?: string|symbol,groupMode: GroupModeType = 'one') {
    // filter Object.create(null)
    if (typeof target === 'object' && target.constructor) {
      target = target.constructor;
    }

    let m: Map<string, any>;
    if (Reflect.hasOwnMetadata(metaKey, target)) {
      m = Reflect.getMetadata(metaKey, target);
    } else {
      m = new Map<string, any>();
    }

    if (!m.has(dataKey)) {
      if (groupBy) {
        m.set(dataKey, {});
      } else {
        m.set(dataKey, []);
      }
    }
    if (groupBy) {
      if (groupMode === 'one') {
        m.get(dataKey)[groupBy] = data;
      } else {
        if (m.get(dataKey)[groupBy]) {
          m.get(dataKey)[groupBy].push(data);
        } else {
          m.get(dataKey)[groupBy] = [data];
        }
      }
    } else {
      m.get(dataKey).push(data);
    }
    Reflect.defineMetadata(metaKey, m, target);
  }

  /**
   *
   * @param metaKey
   * @param target
   * @param dataKey
   * @param data
   * @param groupBy
   * @param groupMode
   */
  public static attachMetadata(
      metaKey: string,
      target: any,
      dataKey: string,
      data: any,
      groupBy?: string,
      groupMode: GroupModeType = 'one'
  ) {
    // filter Object.create(null)
    if (typeof target === 'object' && target.constructor) {
      target = target.constructor;
    }

    let m: Map<string, any>;
    if (Reflect.hasOwnMetadata(metaKey, target)) {
      m = Reflect.getMetadata(metaKey, target);
    } else {
      m = new Map<string, any>();
    }

    if (!m.has(dataKey)) {
      if (groupBy) {
        m.set(dataKey, {});
      } else {
        m.set(dataKey, []);
      }
    }
    if (groupBy) {
      if (groupMode === 'one') {
        m.get(dataKey)[groupBy] = data;
      } else {
        if (m.get(dataKey)[groupBy]) {
          m.get(dataKey)[groupBy].push(data);
        } else {
          m.get(dataKey)[groupBy] = [data];
        }
      }
    } else {
      m.get(dataKey).push(data);
    }
    Reflect.defineMetadata(metaKey, m, target);
  }

  // ================================获取key相关==================================

  /**
   * 获取类修饰存储key
   * @param decoratorNameKey 修饰名
   */
  public static getDecoratorClassKey(decoratorNameKey:ObjectIdentifier):string{
    return decoratorNameKey.toString() + "_CLASS"
  }

  /**
   * 获取类方法存储键
   * @param decoratorNameKey
   * @param methodKey
   */
  public static getDecoratorClassMethodKey(decoratorNameKey: ObjectIdentifier,methodKey: ObjectIdentifier) {
    return (
        DecoratorManager.getDecoratorClassMethodPrefix(decoratorNameKey) +
        ':' +
        methodKey.toString()
    );
  }

  /**
   * 获取额外属性存储键
   * @param decoratorNameKey
   */
  public static getDecoratorClassExtendedKey(decoratorNameKey: ObjectIdentifier) {
    return decoratorNameKey.toString() + '_EXT';
  }

  /**
   * 类的方法装饰器前缀
   * @param decoratorNameKey
   */
  public static getDecoratorClassMethodPrefix(decoratorNameKey: ObjectIdentifier) {
    return decoratorNameKey.toString() + '_CLS_METHOD';
  }

  /**
   * 获取方法装饰器存储键
   * @param decoratorNameKey 装饰器名
   */
  public static getDecoratorMethodKey(decoratorNameKey:ObjectIdentifier):string{
    return decoratorNameKey.toString()+"_METHOD"
  }

  /**
   * 获取方法定义
   * @param decoratorNameKey 装饰器名称键
   * @param methodKey 方法键
   */
  public static getDecoratorMethod(decoratorNameKey:ObjectIdentifier,methodKey:ObjectIdentifier):string{
    return DecoratorManager.getDecoratorMethodKey(decoratorNameKey)+
      "-"+
      (methodKey.toString())
  }
}