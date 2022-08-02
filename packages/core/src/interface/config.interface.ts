import _default from '../config/config.default';
import {MenuItem, MenuItemConstructorOptions} from "electron";

export type PowerPartial<T> = {
  [U in keyof T]?: T[U] extends {} ? PowerPartial<T[U]> : T[U];
};

export type ServiceFactoryConfigOption<OPTIONS> = {
  default?: PowerPartial<OPTIONS>;
  client?: PowerPartial<OPTIONS>;
  clients?: {
    [key: string]: PowerPartial<OPTIONS>;
  };
};

export type DataSourceManagerConfigOption<OPTIONS> = {
  default?: PowerPartial<OPTIONS>;
  dataSource?: {
    [key: string]: PowerPartial<{
      entities: any[],
    } & OPTIONS>;
  };
};

type ConfigType<T> = T extends (...args: any[]) => any
  ? Writable<PowerPartial<ReturnType<T>>>
  : Writable<PowerPartial<T>>;

/**
 * Get definition from config
 */
export type FileConfigOption<T, K = unknown> = K extends keyof ConfigType<T>
  ? Pick<ConfigType<T>, K>
  : ConfigType<T>;

/**
 * Make object property writeable
 */
export type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

export interface ElectronBootConfig extends FileConfigOption<typeof _default> {
  [customConfigKey: string]: unknown;
}


export interface IConfig {
  // 是否单例运行
  singleInstance:boolean
  // 菜单
  menu?:Array<(MenuItemConstructorOptions) | (MenuItem)>
  // 浏览器唤醒配置
  awakeProtocol:AwakeProtocol,
  // 托盘配置
  tray:Tray,
  // 是否启用gpu加速
  hardGpu:HardGpu,
  // 是否启动打开开发者工具
  openDevTools:boolean
}

/**
 * 浏览器唤醒配置
 */
export interface AwakeProtocol {
  protocol: string,
  args:[]
}

/**
 * 托盘配置
 */
export interface Tray {
  // 托盘显示标题
  title: string,
  // 托盘图标
  icon: string
}

/**
 * gpu加速配置
 */
export interface HardGpu {
  enable:boolean
}