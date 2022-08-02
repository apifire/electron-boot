import {Provide, Scope} from "../decorator";
import {ScopeEnum} from "../interface";
import {getCurrentEnvironment, isDevelopmentEnvironment} from "../utils";

@Provide()
@Scope(ScopeEnum.Singleton)
export class EnvironmentService {
  protected environment: string;

  public getCurrentEnvironment() {
    if (!this.environment) {
      this.environment = getCurrentEnvironment();
    }
    return this.environment;
  }

  public setCurrentEnvironment(environment: string) {
    this.environment = environment;
  }

  public isDevelopmentEnvironment() {
    return isDevelopmentEnvironment(this.environment);
  }
}