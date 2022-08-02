import {ElectronApplication, ElectronBootApplication} from "@electron-boot/core";
import * as updater from "@electron-boot/updater"

@ElectronBootApplication({
    imports:[
        updater
    ]
})
export class ApiTestApplication {
    public static async main(...args:string[]){
        await ElectronApplication.run(ApiTestApplication,args)
    }
}