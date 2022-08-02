/**
 * 控制器
 */
import {ConfigService} from "../service";
import {Autowired} from "../decorator";
import {IElectronContainer} from "../interface";

export class BaseController {

  @Autowired()
  private configService:ConfigService

  /**
   * 构造函数
   * @param applicationContext
   */
  constructor(readonly applicationContext:IElectronContainer) {
  }
}