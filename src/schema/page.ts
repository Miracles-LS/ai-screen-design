import type { MaterialSchema } from './material.ts'

interface CanvasSchema {
  width: number
  height: number
  backgroundColor: string
}

export interface DataSourceSchema {
  /*
   * 数据源类型
   * static => 静态数据
   * api => 动态数据，也就是接口请求回来的数据
   * */
  type: 'static' | 'api'
  id: string
  name: string
  data: any
  // api接口请求地址
  url?: string
  // api接口请求方法
  method?: 'get' | 'post'
  // 响应路径。当接口响应的数据有多层数据嵌套时，可以通过输入此值来定位到最终要获取的数据对象
  // 例如 data:{ list:[] } 想直接获得 list 的值，可以在此写 'data.list'
  responsePath?: string
  // api接口请求的轮询时间，毫秒
  interval?: number
  // api接口请求的默认参数
  params?: Record<string, any>
}

export interface PageSchema {
  id?: string
  canvas: CanvasSchema
  nodes: MaterialSchema[]
  dataSources: DataSourceSchema[]
}
