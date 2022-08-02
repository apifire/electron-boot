import {app, BrowserWindowConstructorOptions} from "electron";
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
    // 设计宽度
    protected DESIGN_MAIN_WIDTH: number= 1700;
    // 设计高度
    protected DESIGN_MAIN_HEIGHT: number = 850;
    // 配置加载文件
    protected preload:string
    // 配置信息
    protected conf = {
        titleBarStyle:"hidden"
    } as BrowserWindowConstructorOptions
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