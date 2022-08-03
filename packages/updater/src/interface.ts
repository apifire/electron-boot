import {AllPublishOptions, ProgressInfo, PublishConfiguration, UpdateInfo} from "builder-util-runtime";

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
  autoCheck:boolean
  force:boolean
}

/**
 * 应用状态
 */
export interface EventData {
  eventType:EventType,
  updateInfo?:UpdateInfo
  progressInfo?:ProgressInfo
  errorInfo?:ErrorInfo
  downloadedInfo?:DownloadedInfo
}

/**
 * 错误信息
 */
export interface ErrorInfo {
  message:string
  error:Error
}

/**
 * 下载完毕的信息
 */
export interface DownloadedInfo {
  [key:string]:any
}
/**
 * 状态枚举
 */
export enum EventType {
  error=-1,
  checking =1,
  available,
  noAvailable,
  progress,
  downloaded
}