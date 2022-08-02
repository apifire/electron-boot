import {join} from "path";
import {getCurrentEnvironment, isDevelopmentEnvironment, safeRequire} from "../utils";
import {app} from "electron";
import {Autowired, Init, Provide, Scope} from "../decorator";
import {ScopeEnum} from "../interface";

@Provide()
@Scope(ScopeEnum.Singleton)
export class InformationService {
  private pkg: Record<string, unknown>;

  @Autowired()
  protected appDir: string;

  @Autowired()
  protected scanDir:string

  @Init()
  protected init() {
    if (this.appDir) {
      this.pkg = safeRequire(join(this.appDir, 'package.json')) || {};
    } else {
      this.pkg = {};
    }
  }

  /**
   * 获取应用路径
   */
  getAppDir(): string {
    return app.getAppPath();
  }

  /**
   * 获取js目录
   */
  getScanDir(): string {
    return this.scanDir;
  }

  /**
   * 用户home目录
   */
  getHome(): string {
    return app.getPath("home");
  }

  /**
   * 应用的pkg信息
   */
  getPkg(): any {
    return this.pkg;
  }

  /**
   * 项目名称
   */
  getProjectName(): string {
    return (this.pkg?.['name'] as string) || '';
  }

  /**
   * 获取缓存目录
   */
  getCache(): string {
    const isDevelopmentEnv = isDevelopmentEnvironment(getCurrentEnvironment());
    return isDevelopmentEnv ? this.getAppDir() : this.getHome();
  }
}