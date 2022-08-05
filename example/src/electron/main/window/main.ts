import {app, BrowserWindowConstructorOptions, screen} from "electron";
import {Autowired, BaseWindow, ElectronContainer, Window} from "@electron-boot/core";
import {join} from "path";

@Window({
    main:true
})
export class MainWindow extends BaseWindow{
    @Autowired()
    private appDir:string
    @Autowired()
    private rendererDir:string
    // 窗口名称
    name: string = "mainWindow";
    // 设计高度
    protected DESIGN_MAIN_HEIGHT: number = 850;
    // 配置加载文件
    protected get preload():string{
        return join(this.appDir,"dist/electron/preload/main.js")
    }
    // 配置信息
    // 配置信息
    protected get conf():BrowserWindowConstructorOptions{
        const size = screen.getPrimaryDisplay().bounds ?? {
            width:1920,
            height:1080,
        }
        return {
            titleBarStyle:"hidden",
            width:1300,
            minWidth:parseInt(String(size.width * 0.5),10),
            minHeight:parseInt(String(size.height*0.55),10)
        }
    }
    // 构造函数
    constructor(readonly applicationContext:ElectronContainer) {
        super();
    }
    /**
     * 页面地址
     * @protected
     */
    protected get url(): string{
        if (app.isPackaged){
            const url = new URL("file://")
            url.pathname = join(this.rendererDir, "index.html")
            return url.href
        }else{
            return `http://${process.env.VITE_DEV_SERVER_HOST}:${process.env.VITE_DEV_SERVER_PORT}`
        }
    }
}