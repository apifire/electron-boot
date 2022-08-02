export interface IpcRequest {
  _symbol:symbol  // 当前请求唯一id
  method: 'get' | 'post' | 'delete' | 'put' | 'head' | 'patch' | 'all' // 请求类型
  url: string     // 请求地址
  data: any // 请求数据
}