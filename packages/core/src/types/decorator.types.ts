/**
 * 唯一id
 */
export type ObjectIdentifier = symbol|string
/**
 * 分组模式类型
 */
export type GroupModeType = 'one' | 'multi';
/**
 * typescript的类型定义
 */
export type TSDesignType = {
  name:string,
  originDesign: any;
  isBaseType: boolean;
}