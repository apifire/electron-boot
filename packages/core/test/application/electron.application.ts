import {ElectronBootApplication} from "../../src/decorator/application.decorator";
import {ControllerTest} from "../controller/controller.test";

@ElectronBootApplication({
  imports: [ControllerTest]
})
export class ElectronApplication {
  static async main(args:string[]){
    await new ElectronApplication(ElectronApplication).run(args)
  }
}