import {Action, Controller, ElectronContainer} from "../../src";
import {RouterService} from "../../src/service/router.service";


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
  const service = container.get(RouterService)


  const routerList = await service.getRouterPriorityList()
  const routerList2 = await service.getFlattenRouterTable()
  const routerList3 =await service.getRouterTable()

  console.log(routerList,routerList2,routerList3);
}())
