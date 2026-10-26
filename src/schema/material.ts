// 布局schema 的类型约束
import type { ZodType } from 'zod'

interface Layout {
  x: number
  y: number
  width: number
  height: number
}

export interface MaterialEvent {
  // 事件类型 click mousedown
  type: string
  // 事件名/函数名/方法名
  name: string
  // 事件标题
  title: string
  /*
   * 函数体
   * const code = 'console.log()'
   * const fn = new Function(code)
   * fn(123)
   * */
  code: string
  // 最终通过 type + code 生成的函数
  handler?: Function
  //   Function 等同于 (...args:any[])=>void 这种写法。表示函数有任意的参数（...args:any[]）和任意的返回值（void）
}

// 物料schema 的类型约束
export interface MaterialSchema {
  id?: string
  type: string
  name: string
  layout: Layout
  // Record<string, any> 表示是个对象类型，对象里面有什么内容不会限制
  style?: Record<string, any>
  props: Record<string, any>
  locked?: boolean
  // 数据源id
  dataId?: string
  events?: MaterialEvent[]
}

interface SetterSchema {
  type: string
  label: string
  key: string
  [key: string]: any
}

export interface EventOption {
  label: string
  value: string
  // 触发时机
  trigger: string
  // 事件处理函数的参数payload
  payload: string
}

// 物料 DSL 的类型约束
export interface MaterialDefinition {
  //region 物料元数据
  name: string
  icon: string
  group: string
  configSchema: ZodType
  //endregion
  setters: SetterSchema[]
  schema: Omit<MaterialSchema, 'id'>
  eventOptions?: EventOption[]
}
