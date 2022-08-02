import {ObjectIdentifier} from "../types";
import {IProperties} from "../interface";

export class ObjectProperties
  implements IProperties
{
  private storeMap = new Map()
  propertyKeys(): ObjectIdentifier[] {
    return Array.from(this.storeMap.keys());
  }

  set(key:any,value:any){
    return this.storeMap.set(key,value)
  }

  get(key:any):any{
    return this.storeMap.get(key)
  }

  getProperty(key: ObjectIdentifier, defaultValue?: any): any {
    if (this.storeMap.has(key)) {
      return this.storeMap.get(key);
    }

    return defaultValue;
  }

  setProperty(key: ObjectIdentifier, value: any): any {
    return this.storeMap.set(key, value);
  }
}