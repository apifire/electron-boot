import {AppInfo, ElectronBootConfig, IElectronContainer} from "@electron-boot/core";
import {app, BrowserWindow, KeyboardEvent, MenuItem, MenuItemConstructorOptions} from "electron";

const isMac = process.platform === "darwin"
/**
 * 应用配置文件
 * @param appContext
 * @param appInfo
 */
export default (appContext:IElectronContainer,appInfo:AppInfo):ElectronBootConfig=>{
  return {
    menu:[
      {
        label:"apiTest",
        submenu:[
          {
            label:"关于 apiTest",
            click:()=>{
              console.log(appContext);
            }
          },
          {
            label:"当前版本:"+app.getVersion(),
            enabled:false
          },
          {
            label:"检查更新",
            click:()=>{
              console.log("点击了检查更新");
            }
          },
          {
            type:"separator"
          },
          {
            label:"服务",
            role:"services"
          },
          {
            type:"separator"
          },
          {
            label:"隐藏 apiTest",
            role:"hide",
            accelerator:"CmdOrCtrl+H"
          },
          {
            label:"隐藏其他",
            role:"hideOthers",
            accelerator:"CmdOrCtrl+Alt+H"
          },
          {
            label:"显示全部",
            role:"unhide"
          },
          {
            type:"separator"
          },
          {
            label:"退出",
            role:"quit",
            accelerator:"CmdOrCtrl+Q"
          }
        ],
      },
      {
        label: '编辑',
        submenu: [
          {
            label: '撤销',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo',
          },
          {
            label: '重做',
            accelerator: 'Shift+CmdOrCtrl+Z',
            role: 'redo',
          },
          {
            type: 'separator',
          },
          {
            label: '复制',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy',
          },
          {
            label: '剪切',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut',
          },
          {
            label: '粘贴',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste',
          },
          {
            type: 'separator',
          },
          {
            label: '全选',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectAll',
          },
        ],
      },
      {
        label:"查看",
        role:"viewMenu",
        submenu:[
          {
            label: "重载",
            role: "reload",
            accelerator: ""
          },
          {
            label: "切换全屏",
            click:(menuItem:MenuItem,browserWindow:BrowserWindow|undefined,event:KeyboardEvent)=>{
              if (browserWindow?.isFullScreen()){
                browserWindow?.setFullScreen(false)
              }else{
                browserWindow?.setFullScreen(true)
              }
            },
            accelerator: "Control+Command+F"
          },
          {
            label: "放大",
            role: "zoomIn",
          },
          {
            label: "缩小",
            role: "zoomOut"
          },
          ...(app.isPackaged?[]:[
            {
              type:"separator"
            },
            {
              label:"切换开发者工具",
              role:"toggleDevTools"
            }
          ])
        ] as MenuItemConstructorOptions[]
      },
      {
        label: '窗口',
        role: 'windowMenu',
        submenu: [
          {
            label: '最小化',
            role: 'minimize',
            accelerator: 'CmdOrCtrl+M',
          },
        ],
      },
      {
        label:"帮助",
        role:"help",
        submenu:[
          {
            label: "查看文档",
            click:()=>{

            }
          }
        ]
      }
    ],
    openDevTools: false,
    autoUpdater:{
      windows:true,
      macOs:true,
      linux:true,
      options:{
        provider:"generic",
        url:"http://kodo.qiniu.com/"
      },
      force:false
    }
  }
}
