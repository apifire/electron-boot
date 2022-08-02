import {Autowired, Init, Provide, Scope} from "../decorator";
import {IElectronContainer, ScopeEnum} from "../interface";
import {AspectService} from "./aspect.service";
import {ConfigService} from "./config.service";
import {DecoratorService} from "./decorator.service";
import {ALL, CONFIG_KEY} from "../constant";

@Provide()
@Scope(ScopeEnum.Singleton)
export class RuntimeService {
  @Autowired()
  configService:ConfigService
  @Autowired()
  aspectService:AspectService
  @Autowired()
  decoratorService:DecoratorService

  constructor(
    readonly applicationContext:IElectronContainer,
    readonly globalOptions
  ) {}

  @Init()
  protected async init(){
    // register base config hook
    this.decoratorService.registerPropertyHandler(
      CONFIG_KEY,
      (propertyName, meta) => {
        if (meta.identifier === ALL) {
          return this.configService.getConfiguration();
        } else {
          return this.configService.getConfiguration(
            meta.identifier ?? propertyName
          );
        }
      }
    );
    await this.aspectService.loadAspect()
  }
}