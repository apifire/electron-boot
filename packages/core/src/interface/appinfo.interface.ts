/**
 * 应该信息
 */
export interface AppInfo {
  pkg: Record<string, any>;
  name: string;
  scanDir: string;
  appDir: string;
  HOME: string;
  cache: string;
  env: string;
}