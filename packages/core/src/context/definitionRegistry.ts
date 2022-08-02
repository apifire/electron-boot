import {ObjectIdentifier} from "../types";
import {IIdentifierRelationShip, IObjectDefinition, IObjectDefinitionRegistry} from "../interface";
import {getProvideId, getProvideName, getProvideUUID} from "../decorator";

const PREFIX = '_id_default_';

/**
 * 标识关系实现
 */
class LegacyIdentifierRelation
  implements IIdentifierRelationShip
{
  private storeMap = new Map<ObjectIdentifier,string>()

  saveClassRelation(module: any, namespace?: string) {
    const ProvideId = getProvideUUID(module);
    // save uuid
    this.storeMap.set(ProvideId, ProvideId);
    if (ProvideId) {
      // save alias id
      const aliasId = getProvideId(module);
      if (aliasId) {
        // save alias Id
        this.storeMap.set(aliasId, ProvideId);
      }
      // save className alias
      this.storeMap.set(getProvideName(module), ProvideId);
      // save namespace alias
      if (namespace) {
        this.storeMap.set(namespace + ':' + getProvideName(module), ProvideId);
      }
    }
  }

  saveFunctionRelation(id: ObjectIdentifier, uuid: string) {
    this.storeMap.set(uuid, uuid);
    this.storeMap.set(id, uuid);
  }

  hasRelation(id: ObjectIdentifier): boolean {
    return this.storeMap.has(id);
  }

  getRelation(id: ObjectIdentifier): string {
    if (this.storeMap.has(id)){
      return this.storeMap.get(id)
    }else{
      return undefined
    }
  }
}

/**
 * 对象定义注册表
 */
export class ObjectDefinitionRegistry
  implements IObjectDefinitionRegistry
{
  private storeMap = new Map()
  private singletonIds:ObjectIdentifier[] = [];
  private _identifierRelation: IIdentifierRelationShip = new LegacyIdentifierRelation();

  get identifierRelation() {
    if (!this._identifierRelation) {
      this._identifierRelation = new LegacyIdentifierRelation();
    }
    return this._identifierRelation;
  }

  set identifierRelation(identifierRelation) {
    this._identifierRelation = identifierRelation;
  }

  get identifiers() {
    const ids = [];
    for (const key of this.storeMap.keys()) {
      if (key.indexOf(PREFIX) === -1) {
        ids.push(key);
      }
    }
    return ids;
  }

  get count() {
    return this.storeMap.size;
  }

  getSingletonDefinitionIds(): ObjectIdentifier[] {
    return this.singletonIds;
  }

  getDefinitionByName(name: string): IObjectDefinition[] {
    const definitions = [];
    for (const v of this.storeMap.values()) {
      const definition = v as IObjectDefinition;
      if (definition.name === name) {
        definitions.push(definition);
      }
    }
    return definitions;
  }

  registerDefinition(
    identifier: ObjectIdentifier,
    definition: IObjectDefinition
  ) {
    if (definition.isSingletonScope()) {
      this.singletonIds.push(identifier);
    }
    this.storeMap.set(identifier, definition);
  }

  getDefinition(identifier: ObjectIdentifier): IObjectDefinition {
    identifier = this.identifierRelation.getRelation(identifier) ?? identifier;
    return this.storeMap.get(identifier);
  }

  removeDefinition(identifier: ObjectIdentifier): void {
    this.storeMap.delete(identifier);
  }

  hasDefinition(identifier: ObjectIdentifier): boolean {
    identifier = this.identifierRelation.getRelation(identifier) ?? identifier;
    return this.storeMap.has(identifier);
  }

  hasObject(identifier: ObjectIdentifier): boolean {
    const temp = this.identifierRelation.getRelation(identifier)
    identifier = temp ?? identifier;
    return this.storeMap.has(PREFIX + identifier.toString());
  }

  clearAll(): void {
    this.singletonIds = [];
    this.storeMap.clear();
  }

  registerObject(identifier: ObjectIdentifier, target: any) {
    this.storeMap.set(PREFIX + identifier.toString(), target);
  }

  getObject(identifier: ObjectIdentifier): any {
    identifier = this.identifierRelation.getRelation(identifier) ?? identifier;
    return this.storeMap.get(PREFIX + identifier.toString());
  }

  getIdentifierRelation(): IIdentifierRelationShip {
    return this.identifierRelation;
  }

  setIdentifierRelation(identifierRelation: IIdentifierRelationShip) {
    this.identifierRelation = identifierRelation;
  }
}
