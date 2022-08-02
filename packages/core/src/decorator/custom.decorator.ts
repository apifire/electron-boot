import {createCustomPropertyDecorator, saveObjectDefinition} from "./default.manager";
import {ScopeEnum} from "../interface";
import {CONFIG_KEY} from "../constant";

/**
 * 初始化装饰器
 * @constructor
 */
export function Init(): MethodDecorator {
  return function (target: any, propertyKey: string) {
    saveObjectDefinition(target, { initMethod: propertyKey });
  };
}

/**
 * 销毁装饰器
 * @constructor
 */
export function Destroy(): MethodDecorator {
  return function (target: any, propertyKey: string) {
    saveObjectDefinition(target, {
      destroyMethod: propertyKey,
    });
  };
}

/**
 * 类作用域
 * @param scope
 * @param scopeOptions
 * @constructor
 */
export function Scope(
  scope: ScopeEnum,
  scopeOptions?: { allowDowngrade?: boolean }
): ClassDecorator {
  return function (target: any): void {
    saveObjectDefinition(target, { scope, ...scopeOptions });
  };
}

/**
 * 配置注入
 * @param identifier
 * @constructor
 */
export const Config = (identifier?: string): PropertyDecorator=> {
  return createCustomPropertyDecorator(CONFIG_KEY, {
    identifier,
  });
}
