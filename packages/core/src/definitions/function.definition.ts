import {ObjectCreator} from "./object.creator";
import {
    IElectronContainer,
    IObjectCreator,
    IObjectDefinition,
    IProperties,
    IResolverInstance,
    ScopeEnum
} from "../interface";
import {ObjectIdentifier} from "../types";

class FunctionWrapperCreator extends ObjectCreator {
  doConstruct(Clazz: any, args?: any, context?: IElectronContainer): any {
    if (!Clazz) {
      return null;
    }
    return Clazz(context, args);
  }

  async doConstructAsync(
    Clazz: any,
    args?: any,
    context?: IElectronContainer
  ): Promise<any> {
    if (!Clazz) {
      return null;
    }

    return Clazz(context, args);
  }
}

export class FunctionDefinition implements IObjectDefinition {
  constructor() {
    this.creator = new FunctionWrapperCreator(this);
  }

  constructMethod: string;
  constructorArgs: IResolverInstance[] = [];
  creator: IObjectCreator;
  dependsOn: ObjectIdentifier[];
  destroyMethod: string;
  export: string;
  id: string;
  name: string;
  initMethod: string;
  srcPath: string;
  path: any;
  properties: IProperties;
  namespace = '';
  asynchronous = true;
  handlerProps = [];
  createFrom;
  allowDowngrade = false;
  // 函数工厂创建的对象默认不需要自动装配
  protected innerAutowired = false;
  protected innerScope: ScopeEnum = ScopeEnum.Singleton;

  getAttr(key: ObjectIdentifier): any {}

  hasAttr(key: ObjectIdentifier): boolean {
    return false;
  }

  hasConstructorArgs(): boolean {
    return false;
  }

  hasDependsOn(): boolean {
    return false;
  }

  isAsync(): boolean {
    return this.asynchronous;
  }

  isDirect(): boolean {
    return false;
  }

  isExternal(): boolean {
    return false;
  }

  set scope(scope: ScopeEnum) {
    this.innerScope = scope;
  }

  isSingletonScope(): boolean {
    return this.innerScope === ScopeEnum.Singleton;
  }

  isRequestScope(): boolean {
    return this.innerScope === ScopeEnum.Request;
  }

  setAttr(key: ObjectIdentifier, value: any): void {}
}
