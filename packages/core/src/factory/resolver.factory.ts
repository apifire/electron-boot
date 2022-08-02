import {
    IElectronContainer,
    IObjectDefinition,
    IResolver,
    IResolverInstance,
    ObjectLifeCycleEvent,
    ResolverFactoryCreateOptions
} from "../interface";
import {ObjectIdentifier} from "../types";
import {ManagedReference, RefResolver} from "../resolver";
import * as util from "util";
import EventEmitter from "events";
import {REQUEST_CTX_KEY, REQUEST_OBJ_CTX_KEY} from "../constant";
import {
    DefinitionNotFoundException,
    ElectronBootCommonException,
    ResolverMissingException,
    SingletonInjectTempException
} from "../exception";

const debug = util.debuglog("electron-boot:resolver")
const debugLog = util.debuglog("electron-boot:debug")
/**
 * 解析工厂
 */
export class ResolverFactory {
  // 所有的解析器实例
  private _resolvers:{[key:string]:IResolver} = {}
  // 创建映射表
  private creating = new Map<string,boolean>()
  // 单例缓存
  singletonCache = new Map<ObjectIdentifier,any>()
  // 容器
  context:IElectronContainer
  // 构造器
  constructor(context:IElectronContainer) {
    // 设置上下文
    this.context = context
    // 设置ref解析器
    this._resolvers = {
      ref:new RefResolver(this)
    }
  }

  /**
   * 注册解析器
   * @param resolver
   */
  registerResolver(resolver:IResolver){
    this._resolvers[resolver.type] = resolver
  }

  /**
   * 同步代理
   * @param instance 解析器实例
   * @param originPropertyName
   */
  resolveManaged(instance:IResolverInstance,originPropertyName: string){
    const resolver = this._resolvers[instance.type]
    if (!resolver || resolver.type !== instance.type){
      throw new ResolverMissingException(instance.type);
    }
    return resolver.resolve(instance,originPropertyName)
  }

  /**
   * 异步代理
   * @param instance
   * @param originPropertyName
   */
  async resolveManagedAsync(instance:IResolverInstance,originPropertyName: string){
    const resolver = this._resolvers[instance.type]
    if (!resolver || resolver.type !== instance.type){
      throw new ResolverMissingException(instance.type);
    }
    return resolver.resolveAsync(instance,originPropertyName)
  }

  /**
   * 同步创建对象
   * @param opt
   */
  create(opt:ResolverFactoryCreateOptions):any {
    const {definition,args} = opt
    if (definition.isSingletonScope() && this.singletonCache.has(definition.id)){
      return this.singletonCache.get(definition.id)
    }
    // 如果非 null 表示已经创建 proxy
    let inst = this.createProxyReference(definition)
    if (inst){
      return inst
    }

    this.compareAndSetCreateStatus(definition)
    // 预先初始化依赖
    if (definition.hasDependsOn()){
      for (const dep of definition.dependsOn) {
        this.context.get(dep,args)
      }
    }
    debugLog(`[core]: Create id = "${definition.name}" ${definition.id}.`);

    const Clazz = definition.creator.load()

    let constructorArgs = [];
    if (args && Array.isArray(args) && args.length > 0) {
      constructorArgs = args;
    }

    this.getObjectEventTarget().emit(
      ObjectLifeCycleEvent.BEFORE_CREATED,
      Clazz,
      {
        constructorArgs,
        definition,
        context: this.context,
      }
    );

    inst = definition.creator.doConstruct(Clazz, constructorArgs, this.context);

    // binding ctx object
    if (
      definition.isRequestScope() &&
      definition.constructor.name === 'ObjectDefinition'
    ) {
      Object.defineProperty(inst, REQUEST_OBJ_CTX_KEY, {
        value: this.context.get(REQUEST_CTX_KEY),
        writable: false,
        enumerable: false,
      });
    }

    if (definition.properties) {
      const keys = definition.properties.propertyKeys() as string[];
      for (const key of keys) {
        this.checkSingletonInvokeTemp(definition, key);
        try {
          inst[key] = this.resolveManaged(definition.properties.get(key), key);
        } catch (error) {
          if (DefinitionNotFoundException.isClosePrototypeOf(error)) {
            const className = definition.path.name;
            error.updateErrorMsg(className);
          }
          this.removeCreateStatus(definition, true);
          throw error;
        }
      }
    }

    this.getObjectEventTarget().emit(ObjectLifeCycleEvent.AFTER_CREATED, inst, {
      context: this.context,
      definition,
      replaceCallback: ins => {
        inst = ins;
      },
    });

    // after properties set then do init
    definition.creator.doInit(inst);

    this.getObjectEventTarget().emit(ObjectLifeCycleEvent.AFTER_INIT, inst, {
      context: this.context,
      definition,
    });

    if (definition.isSingletonScope() && definition.id) {
      this.singletonCache.set(definition.id, inst);
    }

    // for request scope
    if (definition.isRequestScope() && definition.id) {
      this.context.bindObject(definition.id, inst);
    }
    this.removeCreateStatus(definition, true);

    return inst;
  }

  /**
   * 异步创建对象
   * @param opt
   */
  async createAsync(opt:ResolverFactoryCreateOptions):Promise<any> {
    const {definition,args} = opt
    if (definition.isSingletonScope() && this.singletonCache.has(definition.id)){
      debug(
          `id = ${definition.id}(${definition.name}) get from singleton cache.`
      );
      return this.singletonCache.get(definition.id)
    }
    // 如果非null标识已经创建proxy
    let inst = this.createProxyReference(definition)
    if (inst){
      debug(`id = ${definition.id}(${definition.name}) from proxy reference.`);
      return inst
    }
    this.compareAndSetCreateStatus(definition)
    // 预先初始化依赖
    if (definition.hasDependsOn()){
      for (const dep of definition.dependsOn) {
        debug('id = %s init depend %s.', definition.id, dep);
        await this.context.getAsync(dep,args)
      }
    }
    debugLog(`[core]: Create id = "${definition.name}" ${definition.id}.`);

    const Clazz = definition.creator.load()
    let constructorArgs = [];
    if (args && Array.isArray(args) && args.length > 0) {
      constructorArgs = args;
    }

    this.getObjectEventTarget().emit(
        ObjectLifeCycleEvent.BEFORE_CREATED,
        Clazz,
        {
          constructorArgs,
          context: this.context,
        }
    );

    inst = await definition.creator.doConstructAsync(
        Clazz,
        constructorArgs,
        this.context
    );

    if (!inst){
      this.removeCreateStatus(definition,false)
      throw new ElectronBootCommonException(
          `${definition.id} construct return undefined`
      );
    }

    // binding ctx object
    if(
        definition.isRequestScope() &&
        definition.constructor.name === 'ObjectDefinition'
    ) {
      debug('id = %s inject ctx', definition.id);
      Object.defineProperty(inst, REQUEST_OBJ_CTX_KEY, {
        value: this.context.get(REQUEST_CTX_KEY),
        writable: false,
        enumerable: false,
      });
    }

    if (definition.properties) {
      const keys = definition.properties.propertyKeys() as string[];
      for (const key of keys) {
        this.checkSingletonInvokeTemp(definition, key);
        try {
          inst[key] = await this.resolveManagedAsync(definition.properties.get(key), key);
        } catch (error) {
          if (DefinitionNotFoundException.isClosePrototypeOf(error)) {
            const className = definition.path.name;
            error.updateErrorMsg(className);
          }
          this.removeCreateStatus(definition, true);
          throw error;
        }
      }
    }

    this.getObjectEventTarget().emit(ObjectLifeCycleEvent.AFTER_CREATED, inst, {
      context: this.context,
      definition,
      replaceCallback: ins => {
        inst = ins;
      },
    });

    // after properties set then do init
    await definition.creator.doInitAsync(inst);

    this.getObjectEventTarget().emit(ObjectLifeCycleEvent.AFTER_INIT, inst, {
      context: this.context,
      definition,
    });

    if (definition.isSingletonScope() && definition.id) {
      debug(`id = ${definition.id}(${definition.name}) set to singleton cache`);
      this.singletonCache.set(definition.id, inst);
    }

    // for request scope
    if (definition.isRequestScope() && definition.id) {
      debug(`id = ${definition.id}(${definition.name}) set to register object`);
      this.context.bindObject(definition.id, inst);
    }
    this.removeCreateStatus(definition, true);

    return inst;
  }

  /**
   * 判断是否已经创建
   * @param definition
   */
  public isCreating(definition: IObjectDefinition) {
    return this.creating.has(definition.id) && this.creating.get(definition.id);
  }

  /**
   * 触发单例初始化结束事件
   * @param definition 单例定义
   * @param success 成功 or 失败
   */
  private removeCreateStatus(
    definition: IObjectDefinition,
    success: boolean
  ): boolean {
    // 如果map中存在表示需要设置状态
    if (this.creating.has(definition.id)) {
      this.creating.set(definition.id, false);
    }
    return true;
  }

  /**
   * 比较并设置创建状态
   * @param definition
   * @private
   */
  private compareAndSetCreateStatus(definition: IObjectDefinition) {
    if (
      !this.creating.has(definition.id) ||
      !this.creating.get(definition.id)
    ) {
      this.creating.set(definition.id, true);
    }
  }

  /**
   * 创建对象定义的代理访问逻辑
   * @param definition 对象定义
   */
  private createProxyReference(definition: IObjectDefinition): any {
    if (this.isCreating(definition)) {
      debug('create proxy for %s.', definition.id);
      // 非循环依赖的允许重新创建对象
      if (!this.depthFirstSearch(definition.id, definition)) {
        debug('id = %s after dfs return null', definition.id);
        return null;
      }
      // 创建代理对象
      return new Proxy(
        { __is_proxy__: true, __target_id__: definition.id },
        {
          get: (obj, prop) => {
            let target;
            if (definition.isRequestScope()) {
              target = this.context.registry.getObject(definition.id);
            } else if (definition.isSingletonScope()) {
              target = this.singletonCache.get(definition.id);
            } else {
              target = this.context.get(definition.id);
            }

            if (target) {
              if (typeof target[prop] === 'function') {
                return target[prop].bind(target);
              }
              return target[prop];
            }

            return undefined;
          },
        }
      );
    }
    return null;
  }

  /**
   * 获取对象创建通知
   * @private
   */
  private getObjectEventTarget(): EventEmitter {
    if (this.context.parent) {
      return this.context.parent.objectCreateEventTarget;
    }
    return this.context.objectCreateEventTarget;
  }

  /**
   * 遍历依赖树判断是否循环依赖
   * @param identifier 目标id
   * @param definition 定义描述
   * @param depth
   */
  public depthFirstSearch(
    identifier: string,
    definition: IObjectDefinition,
    depth?: string[]
  ): boolean {
    if (definition) {
      debug('dfs for %s == %s start.', identifier, definition.id);
      if (definition.properties) {
        const keys = definition.properties.propertyKeys() as string[];
        if (keys.indexOf(identifier) > -1) {
          debug('dfs exist in properties %s == %s.', identifier, definition.id);
          return true;
        }
        for (const key of keys) {
          if (!Array.isArray(depth)) {
            depth = [identifier];
          }
          let iden = key;
          const ref: ManagedReference = definition.properties.get(key);
          if (ref && ref.name) {
            iden =
              this.context.identifierMapping.getRelation(ref.name) ?? ref.name;
          }
          if (iden === identifier) {
            debug(
              'dfs exist in properties key %s == %s.',
              identifier,
              definition.id
            );
            return true;
          }
          if (depth.indexOf(iden) > -1) {
            debug(
              'dfs depth circular %s == %s, %s, %j.',
              identifier,
              definition.id,
              iden,
              depth
            );
            continue;
          } else {
            depth.push(iden);
            debug('dfs depth push %s == %s, %j.', identifier, iden, depth);
          }
          let subDefinition = this.context.registry.getDefinition(iden);
          if (!subDefinition && this.context.parent) {
            subDefinition = this.context.parent.registry.getDefinition(iden);
          }
          if (this.depthFirstSearch(identifier, subDefinition, depth)) {
            debug(
              'dfs exist in sub tree %s == %s subId = %s.',
              identifier,
              definition.id,
              subDefinition.id
            );
            return true;
          }
        }
      }
      debug('dfs for %s == %s end.', identifier, definition.id);
    }
    return false;
  }

  /**
   * 检查是否是临时单实例
   * @param definition
   * @param key
   * @private
   */
  private checkSingletonInvokeTemp(definition:IObjectDefinition, key) {
    if (definition.isSingletonScope()) {
      const managedRef = definition.properties.get(key);
      if (this.context.hasDefinition(managedRef?.name)) {
        const propertyDefinition = this.context.registry.getDefinition(
          managedRef.name
        );
        if (
          propertyDefinition.isRequestScope() &&
          !propertyDefinition.allowDowngrade
        ) {
          throw new SingletonInjectTempException(
            definition.path.name,
            propertyDefinition.path.name
          );
        }
      }
    }
    return true;
  }

  /**
   * 销毁缓存
   */
  async destroyCache(): Promise<void> {
    for (const key of this.singletonCache.keys()) {
      const definition = this.context.registry.getDefinition(key);
      if (definition.creator) {
        const inst = this.singletonCache.get(key);
        this.getObjectEventTarget().emit(
          ObjectLifeCycleEvent.BEFORE_DESTROY,
          inst,
          {
            context: this.context,
            definition,
          }
        );
        await definition.creator.doDestroyAsync(inst);
      }
    }
    this.singletonCache.clear();
    this.creating.clear();
  }
}