import {GroupModeType, ObjectIdentifier} from "../types";
import {DecoratorManager} from "./decorator.manager";
import {camelCase, isClass, merge, randomUUID, transformTypeFromTSDesign} from "../utils";
import {InjectModeEnum, ObjectDefinitionOptions, TagPropsMetadata, TargetClassMetadata} from "../interface";
import {
  INJECT_CUSTOM_METHOD,
  INJECT_CUSTOM_PARAM,
  INJECT_CUSTOM_PROPERTY,
  INJECT_TAG,
  OBJECT_DEFINITION_CLASS,
  PRELOAD_MODULE_KEY,
  TARGETED_CLASS
} from "../constant";

// 定义全局的管理器
let manager = new DecoratorManager()
if (typeof global==="object"){
  if (global["ELECTRON_GLOBAL_DECORATOR_MANAGER"]){
    manager = global["ELECTRON_GLOBAL_DECORATOR_MANAGER"]
  }else{
    global["ELECTRON_GLOBAL_DECORATOR_MANAGER"] = manager
  }
}
/**
 * 清空绑定容器
 */
export const clearBindContainer =  () => {
  return (manager.container = null);
}
/**
 * 保存元数据
 * @param decoratorNameKey 元数据保存key
 * @param data  保存的数据
 * @param target 保存元数据的对象
 * @param merge
 */
export const saveClassMetadata = <T>(
  decoratorNameKey: ObjectIdentifier,
  data: any,
  target: T,
  merge?: boolean
): any => {
  if (merge && typeof data === 'object') {
    const originData = manager.getMetadata(decoratorNameKey, target);
    if (!originData) {
      return manager.saveMetadata(decoratorNameKey, data, target);
    }
    if (Array.isArray(originData)) {
      return manager.saveMetadata(
          decoratorNameKey,
          originData.concat(data),
          target
      );
    } else {
      return manager.saveMetadata(
          decoratorNameKey,
          Object.assign(originData, data),
          target
      );
    }
  } else {
    return manager.saveMetadata(decoratorNameKey, data, target);
  }
};

/**
 * 附加数据到类
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param groupBy
 * @param groupMode
 */
export const attachClassMetadata = (
  decoratorNameKey: ObjectIdentifier,
  data: any,
  target,
  groupBy?: string,
  groupMode?: GroupModeType
) => {
  return manager.attachMetadata(
      decoratorNameKey,
      data,
      target,
      undefined,
      groupBy,
      groupMode
  );
}

/**
 * 保存特性属性数据到类
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
export const savePropertyDataToClass = (
  decoratorNameKey: ObjectIdentifier,
  data,
  target,
  propertyName
) => {
  return manager.savePropertyDataToClass(
    decoratorNameKey,
    data,
    target,
    propertyName
  );
}

/**
 * 获取类的元数据
 * @param decoratorNameKey
 * @param target
 */
export const getClassMetadata = (
  decoratorNameKey: ObjectIdentifier,
  target
)=>{
  return manager.getMetadata(decoratorNameKey,target)
}

/**
 * 从类中获取保存数据
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 * @param useCache
 */
export const getClassExtendedMetadata = (
  decoratorNameKey: ObjectIdentifier,
  target,
  propertyName?: string,
  useCache?: boolean
)=>{
  if (useCache === undefined) {
    useCache = true;
  }
  const extKey = DecoratorManager.getDecoratorClassExtendedKey(decoratorNameKey);
  let metadata = manager.getMetadata(extKey, target, propertyName);
  if (useCache && metadata !== undefined) {
    return metadata;
  }
  const father = Reflect.getPrototypeOf(target);
  if (father && father.constructor !== Object) {
    metadata = merge(
      getClassExtendedMetadata(
        decoratorNameKey,
        father,
        propertyName,
        useCache
      ),
      manager.getMetadata(decoratorNameKey, target, propertyName)
    );
  }
  manager.saveMetadata(extKey, metadata || null, target, propertyName);
  return metadata;
}

/**
 * 将特性数据附加到类
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 * @param groupBy
 */
export const attachPropertyDataToClass = (
  decoratorNameKey: ObjectIdentifier,
  data,
  target,
  propertyName,
  groupBy?: string
) => {
  return manager.attachPropertyDataToClass(
    decoratorNameKey,
    data,
    target,
    propertyName,
    groupBy
  );
}


/**
 * 从类中获取属性数据
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 */
export const getPropertyDataFromClass = (
  decoratorNameKey: ObjectIdentifier,
  target,
  propertyName
) => {
  return manager.getPropertyDataFromClass(
    decoratorNameKey,
    target,
    propertyName
  );
}

/**
 * list property data from class
 * @param decoratorNameKey
 * @param target
 */
export const listPropertyDataFromClass = (
  decoratorNameKey: ObjectIdentifier,
  target
) => {
  return manager.listPropertyDataFromClass(decoratorNameKey, target);
}

/**
 * 保存特性数据
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
export const savePropertyMetadata = (
  decoratorNameKey: ObjectIdentifier,
  data,
  target,
  propertyName
) => {
  return manager.saveMetadata(decoratorNameKey, data, target, propertyName);
}


/**
 * 附着特性数据
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param propertyName
 */
export const attachPropertyMetadata = (
  decoratorNameKey: ObjectIdentifier,
  data,
  target,
  propertyName
) => {
  return manager.attachMetadata(decoratorNameKey, data, target, propertyName);
}

/**
 * get property data
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 */
export const getPropertyMetadata = (
  decoratorNameKey: ObjectIdentifier,
  target,
  propertyName
) => {
  return manager.getMetadata(decoratorNameKey, target, propertyName);
}


/**
 * 保存预加载模块
 * @param target
 */
export const savePreloadModule = (target) => {
  return saveModule(PRELOAD_MODULE_KEY, target);
}

/**
 * 获取预加载列表
 */
export const listPreloadModule = (): any[] => {
  return listModule(PRELOAD_MODULE_KEY);
}

/**
 * 保存模块到内部Map
 * @param decoratorNameKey
 * @param target
 */
export const saveModule =(decoratorNameKey: ObjectIdentifier, target) => {
  if (isClass(target)) {
    saveProvideId(undefined, target);
  }
  return manager.saveModule(decoratorNameKey, target);
}

/**
 * 获取指定装饰键的模块列表
 * @param decoratorNameKey
 * @param filter
 */
export const listModule = (
  decoratorNameKey: ObjectIdentifier,
  filter?: (module) => boolean
): any[] => {
  const modules = manager.listModule(decoratorNameKey);
  if (filter) {
    return modules.filter(filter);
  } else {
    return modules;
  }
}

/**
 * 重置模块数据
 * @param decoratorNameKey
 */
export const resetModule= (decoratorNameKey: ObjectIdentifier): void => {
  return manager.resetModule(decoratorNameKey);
}

/**
 * 清楚所有的模块
 */
export const clearAllModule = () => {
  return manager.clear();
}

/**
 * 保存属性注入参数
 * @param opts 参数
 */
export const savePropertyAutowired = (opts: {
  // id
  identifier: ObjectIdentifier;
  // class
  target: any;
  // propertyName
  targetKey: string;
  // 额外参数
  args?: any;
}) => {
  // 1、use identifier by user
  let identifier = opts.identifier;
  let injectMode = InjectModeEnum.Identifier;
  // 2、use identifier by class uuid
  if (!identifier) {
    const type = getPropertyType(opts.target, opts.targetKey);
    if (
      !type.isBaseType &&
      isClass(type.originDesign) &&
      isProvide(type.originDesign)
    ) {
      identifier = getProvideUUID(type.originDesign);
      injectMode = InjectModeEnum.Class;
    }
    if (!identifier) {
      // 3、use identifier by property name
      identifier = opts.targetKey;
      injectMode = InjectModeEnum.PropertyName;
    }
  }
  attachClassMetadata(
    INJECT_TAG,
    {
      targetKey: opts.targetKey, // 注入的属性名
      value: identifier, // 注入的 id
      args: opts.args, // 注入的其他参数
      injectMode,
    },
    opts.target,
    opts.targetKey
  );
}


/**
 * 获取属性注入参数
 * @param target
 * @param useCache
 */
export const getPropertyAutowired = (
  target: any,
  useCache?: boolean
): {
  [methodName: string]: TagPropsMetadata;
} => {
  return getClassExtendedMetadata(INJECT_TAG, target, undefined, useCache);
}


/**
 * save class object definition
 * @param target class
 * @param props property data
 */
export const saveObjectDefinition = (target: any, props = {}) => {
  saveClassMetadata(OBJECT_DEFINITION_CLASS, props, target, true);
  return target;
}

/**
 * get class object definition from metadata
 * @param target
 */
export const getObjectDefinition = (target: any): ObjectDefinitionOptions => {
  return getClassExtendedMetadata(OBJECT_DEFINITION_CLASS, target);
}

/**
 * 类的组件id
 * @param identifier id
 * @param target class
 */
export const saveProvideId = (identifier: ObjectIdentifier, target: any) => {
  if (isProvide(target)) {
    if (identifier) {
      const meta = getClassMetadata(TARGETED_CLASS, target);
      if (meta.id !== identifier) {
        meta.id = identifier;
        // save class id and uuid
        saveClassMetadata(TARGETED_CLASS, meta, target);
      }
    }
  } else {
    // save class id and uuid
    saveClassMetadata(
      TARGETED_CLASS,
      {
        id: identifier,
        originName: target.name,
        uuid:randomUUID(),
        name: camelCase(target.name),
      },
      target
    );
  }
  return target;
}

/**
 * 获取服务提供者的id
 * @param module
 */
export const getProvideId = (module): ObjectIdentifier => {
  const metaData = getClassMetadata(TARGETED_CLASS, module) as TargetClassMetadata;
  if (metaData && metaData.id) {
    return metaData.id;
  }
}

/**
 * 获取服务提供者名称
 * @param module
 */
export const getProvideName = (module): string => {
  const metaData = getClassMetadata(TARGETED_CLASS, module) as TargetClassMetadata;
  if (metaData && metaData.name) {
    return metaData.name;
  }
}

/**
 * 获取服务提供者的uuid
 * @param module
 */
export const getProvideUUID = (module): string => {
  const metaData = getClassMetadata(TARGETED_CLASS, module) as TargetClassMetadata;
  if (metaData && metaData.uuid) {
    return metaData.uuid;
  }
}

/**
 * 判断是否时组件
 * @param target class
 */
export const isProvide = (target: any): boolean => {
  return !!getClassMetadata(TARGETED_CLASS, target);
}


/**
 * 通过反射获取参数类型
 */
export const getMethodParamTypes = (target, methodName: string | symbol) => {
  if (isClass(target)) {
    target = target.prototype;
  }
  return Reflect.getMetadata('design:paramtypes', target, methodName);
}

/**
 * 从元数据获取属性（方法）的类型
 * @param target
 * @param methodName
 */
export const getPropertyType = (target, methodName: string | symbol) => {
  return transformTypeFromTSDesign(
    Reflect.getMetadata('design:type', target, methodName)
  );
}

/**
 * 从元数据获取方法的返回类型
 * @param target
 * @param methodName
 */
export const getMethodReturnTypes = (target, methodName: string | symbol) => {
  if (isClass(target)) {
    target = target.prototype;
  }
  return Reflect.getMetadata('design:returntype', target, methodName);
}

/**
 * 创建自定义属性注入装饰器
 * @param decoratorKey
 * @param metadata
 * @param impl default true, configuration need decoratorService.registerMethodHandler
 */
export const createCustomPropertyDecorator= (
  decoratorKey: string,
  metadata: any,
  impl = true
): PropertyDecorator => {
  return (target:any, propertyName:string) => {
    attachClassMetadata(
      INJECT_CUSTOM_PROPERTY,
      {
        propertyName,
        key: decoratorKey,
        metadata,
        impl,
      },
      target,
      propertyName
    );
  }
}

/**
 * 绑定容器
 * @param container
 */
export const bindContainer =(container) => {
  return manager.bindContainer(container);
}

/**
 * 创建自定义方法注入装饰器
 * @param decoratorKey
 * @param metadata
 * @param impl default true, configuration need decoratorService.registerMethodHandler
 */
export const createCustomMethodDecorator =  (
  decoratorKey: string,
  metadata: any,
  impl = true
): MethodDecorator => {
  return (target:any, propertyName:string, descriptor) => {
    attachClassMetadata(
      INJECT_CUSTOM_METHOD,
      {
        propertyName,
        key: decoratorKey,
        metadata,
        impl,
      },
      target
    );
  }
}

/**
 * 创建自定义参数装饰器
 * @param decoratorKey
 * @param metadata
 * @param impl default true
 */
export const createCustomParamDecorator = (
  decoratorKey: string,
  metadata: any,
  impl = true
): ParameterDecorator => {
  return (target:any, propertyName:string, parameterIndex) => {
    attachClassMetadata(
      INJECT_CUSTOM_PARAM,
      {
        key: decoratorKey,
        parameterIndex,
        propertyName,
        metadata,
        impl,
      },
      target,
      propertyName,
      'multi'
    );
  }
}


