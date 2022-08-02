import {ElectronContainer} from "./container";
import {IElectronContainer} from "../interface";
import {PIPELINE_IDENTIFIER, REQUEST_CTX_KEY} from "../constant";

/**
 * 请求容器
 */
export class ElectronRequestContainer extends ElectronContainer {
  private readonly applicationContext: IElectronContainer;

  constructor(ctx, applicationContext: IElectronContainer) {
    super(applicationContext);
    this.applicationContext = applicationContext;

    // update legacy relationship
    this.registry.setIdentifierRelation(
      this.applicationContext.registry.getIdentifierRelation()
    );

    this.ctx = ctx;
    // register ctx
    this.bindObject(REQUEST_CTX_KEY, ctx);
    // register res
    this.bindObject('res', {});

    if (ctx.logger) {
      // binding contextLogger
      this.bindObject('logger', ctx.logger);
    }
  }

  init() {
    // do nothing
  }

  get<T = any>(identifier: any, args?: any): T {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }

    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition =
      this.applicationContext.registry.getDefinition(identifier);
    if (definition) {
      if (
        definition.isRequestScope() ||
        definition.id === PIPELINE_IDENTIFIER
      ) {
        // create object from applicationContext definition for requestScope
        return this.getResolverFactory().create({
          definition,
          args,
        });
      }
    }

    if (this.parent) {
      return this.parent.get(identifier, args);
    }
  }

  async getAsync<T = any>(identifier: any, args?: any): Promise<T> {
    if (typeof identifier !== 'string') {
      identifier = this.getIdentifier(identifier);
    }

    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition =
      this.applicationContext.registry.getDefinition(identifier);
    if (definition) {
      if (
        definition.isRequestScope() ||
        definition.id === PIPELINE_IDENTIFIER
      ) {
        // create object from applicationContext definition for requestScope
        return this.getResolverFactory().createAsync({
          definition,
          args,
        });
      }
    }

    if (this.parent) {
      return this.parent.getAsync<T>(identifier, args);
    }
  }

  ready() {
    // ignore other things
  }

  getContext() {
    return this.ctx;
  }
}
