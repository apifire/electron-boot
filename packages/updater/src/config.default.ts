import {AutoUpdate} from "./interface";

/**
 * 默认配置
 */
export const autoUpdater = {
  autoCheck:false,
  options:{
    provider:"generic",
    url:"http://kodo.qiniu.com/"
  },
  force:false
} as AutoUpdate