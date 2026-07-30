// 物料分组
import type { MaterialDefinition, MaterialSchema } from '@/schema/material.ts'

const materialGroup = [
  {
    name: '图表',
    icon: 'solar:chart-bold',
    key: 'charts',
  },
  {
    name: '信息',
    icon: 'material-symbols:info',
    key: 'info',
  },
]
// 物料分组中对应的物料组件
const materialItems: MaterialDefinition[] = []

// componentMap:[
//     绑定的映射关系如下：
//    text => TextMaterial
//    bar => BarMaterial
// ]
const componentMap = new Map()

// setterMap:[
//     绑定的映射关系如下：
//    text => [{
//       type: 'input', //利用 动态表单 的思路，最终会在属性面板上呈现 el-input 组件
//       label: '内容',
//       key: 'props.content',
//     },
//     {
//       type: 'color', //利用 动态表单 的思路，最终会在属性面板上呈现 el-color-picker 组件
//       label: '颜色',
//       key: 'style.color',
//     },
//   ]
//    ....
// ]
const setterMap = new Map()

export function register(material: MaterialDefinition, component: Component) {
  materialItems.push(material)

  // 将物料组件通过 schema.type 的值绑定到对应的物料组件，建立关联关系
  componentMap.set(material.schema.type, component)
  // 将物料组件通过 schema.type 的值绑定到对应的属性动态表单属性数据，建立关联关系
  setterMap.set(material.schema.type, material.setters)
}

// vite批量处理导入所有物料组件的index.ts文件
// materialModules：[
//   映射关系如下：
//  '/text/index.ts' => ts文件代码里面的内容
//  '/charts/index.ts' => ts文件代码里面的内容
// ]
const materialModules = import.meta.glob('./*/index.ts', { eager: true })
Object.values(materialModules).forEach(module => {
  // @ts-ignore
  module.install(register)
})

// 通过group 这个唯一key找到对应的物料组件
export function getMaterialByGroup(groupName: string) {
  return materialItems.filter(item => item.group === groupName)
}

// 获取物料分组
export function getMaterialGroups() {
  return materialGroup
}

// 通过 schema 类型名找到对应的物料组件
export function getMaterialComponent(type: string) {
  return componentMap.get(type)
}

// 通过 schema 类型名找到对应的物料属性配置
export function getMaterialSetter(type: string) {
  return setterMap.get(type)
}

// 创建 schema node 节点，目前是为了给节点添加id
export function createNode(node: MaterialSchema) {
  return {
    ...node,
    id: crypto.randomUUID(),
  }
}
