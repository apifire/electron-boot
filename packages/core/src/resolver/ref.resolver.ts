import {InjectModeEnum, IResolver, IResolverInstance} from "../interface";
import {ResolverFactory} from "../factory";
import {KEYS} from "../constant";

/**
 * 引用
 */
export class ManagedReference implements IResolverInstance {
  type = KEYS.REF_ELEMENT;
  name: string;
  injectMode: InjectModeEnum;
  args?: any;
}

/**
 * 解析ref对象
 */
export class RefResolver implements IResolver{
  constructor(readonly factory:ResolverFactory) {
  }

  get type():string{
    return KEYS.REF_ELEMENT
  }

  resolve(instance: IResolverInstance,originName: string): any {
    const mr = instance as ManagedReference
    if (
      mr.injectMode === InjectModeEnum.Class &&
      !(this.factory.context.parent??this.factory.context).hasDefinition(mr.name)
    ){

    }
    return this.factory.context.get(mr.name,mr.args,{
      originName
    })
  }

  async resolveAsync(managed: IResolverInstance,originName: string): Promise<any> {
    const mr = managed as ManagedReference
    if (
      mr.injectMode === InjectModeEnum.Class &&
      !(this.factory.context.parent??this.factory.context).hasDefinition(mr.name)
    ){

    }
    return this.factory.context.getAsync(mr.name,mr.args,{
      originName
    })
  }
}