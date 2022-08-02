import {app} from "electron"

/**
 * 获取当前环境
 */
export const getCurrentEnvironment = ():string=>{
  return app.isPackaged ? "prod": "development"
}
/**
 * 判断是否时开发环境
 * @param env
 */
export const isDevelopmentEnvironment = (env:string)=>{
  return !app.isPackaged
}