import {Configuration, ElectronContainer} from "@electron-boot/core";
import * as defaultConfig from "./config.default"
import {UpdaterService} from "./service/updater.service";

@Configuration({
  namespace:"updater",
  importConfigs:[
    {
      default: defaultConfig
    }
  ]
})
export class UpdaterConfiguration {
  async onReady(container:ElectronContainer){
    await container.getAsync(UpdaterService,[container])
  }
}