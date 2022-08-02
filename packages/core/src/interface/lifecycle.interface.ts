import {IElectronContainer, IObjectLifeCycle} from "./container.interface";

/**
 * Lifecycle Definition
 * 生命周期定义
 */
export interface ILifeCycle extends Partial<IObjectLifeCycle> {
  onConfigLoad?(
    container: IElectronContainer,
  ): Promise<any>;
  onReady?(
    container: IElectronContainer,
  ): Promise<void>;
  onServerReady?(
    container: IElectronContainer,
  ): Promise<void>;
  onStop?(
    container: IElectronContainer,
  ): Promise<void>;
}