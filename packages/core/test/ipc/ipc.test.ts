import {Action, Controller, ElectronContainer} from "../../src";
import {RouterService} from "../../src/service/router.service";
import {IpcService} from "../../src/service/ipc.service";

@Controller("/test")
export class ControllerTest {
  @Action("/test")
  async testAction(){

  }
}

@Controller("/prefix")
export class ControllerTest2{
  @Action("/test")
  async testAction2(){

  }
}


(async function(){
  const container = new ElectronContainer()
  container.bindClass(RouterService)
  container.bindClass(IpcService)
  const ipc = await container.getAsync(IpcService,[container])
  await ipc.run()
}())