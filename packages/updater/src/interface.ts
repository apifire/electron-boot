import {AllPublishOptions, PublishConfiguration} from "builder-util-runtime";

/**
 * 设置配置文件的类型声明
 */
declare module "@electron-boot/core" {
  interface ElectronBootConfig {
    autoUpdater?:AutoUpdate
  }
}
/**
 * 应用升级配置
 */
export interface AutoUpdate {
  options:PublishConfiguration | AllPublishOptions | string,
  force:boolean
}

export enum Status {
  error=-1,
  available=1,
  noAvailable,
  downloading,
  downloaded
}