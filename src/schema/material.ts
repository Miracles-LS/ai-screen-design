// 布局schema 的类型约束
interface Layout {
  x: number
  y: number
  width: number
  height: number
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
}

interface SetterSchema {
  type: string
  label: string
  key: string
  [key: string]: any
}

// 物料 DSL 的类型约束
export interface MaterialDefinition {
  //region 物料元数据
  name: string
  icon: string
  group: string
  //endregion
  setters: SetterSchema[]
  schema: Omit<MaterialSchema, 'id'>
}
