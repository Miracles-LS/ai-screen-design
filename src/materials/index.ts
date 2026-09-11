// 物料分组
import type { MaterialDefinition, MaterialSchema } from '@/schema/material.ts'

import { LifeEventOptions, HtmlEventOptions } from '@/public/EventOptions.ts'

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
const materialMap = new Map()

export function register(material: MaterialDefinition, component: Component) {
  materialItems.push(material)

  // 将物料组件通过 schema.type 的值绑定到对应的物料组件，建立关联关系
  componentMap.set(material.schema.type, component)
  // 将物料组件通过 schema.type 的值绑定到对应的属性动态表单属性数据，建立关联关系
  materialMap.set(material.schema.type, material)
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
  return materialMap.get(type)?.setters || []
}
// 通过 schema 类型名找到对应的事件下拉列表
export function getMaterialEventOptions(type: string) {
  const componentEventOptions = materialMap.get(type)?.eventOptions || []

  const cascaderEventOptions = [
    {
      label: '组件特有事件',
      options: [...componentEventOptions],
    },
    {
      label: '生命周期事件',
      options: [...LifeEventOptions],
    },
    {
      label: 'HTML原生事件',
      options: [...HtmlEventOptions],
    },
  ]

  return cascaderEventOptions
}

// 创建 schema node 节点，目前是为了给节点添加id
export function createNode(node: MaterialSchema) {
  return {
    ...node,
    id: crypto.randomUUID(),
  }
}

export function getAllMaterialSchema() {
  const list = materialItems
    .filter(material => material.configSchema)
    .map(item => {
      return {
        name: item.name,
        type: item.schema.type,
        // Zod Schema 是 JavaScript 运行时对象，不能直接作为 Graph Input 通过 http 请求传输的话得转成标准的 json，所以这发送前需要调用 toJSONSchema()，把它转换成普通 JSON
        configSchema: item.configSchema.toJSONSchema(),
      }
    })
  console.log(list)
  return list

  /*
   * 最终每个物料会得到下面这种结构：
   * {
      "name": "文本",
      "type": "text",
      "configSchema": {
        "type": "object",
        "properties": {
          "type": {
            "const": "text"
          },
          "props": {
            "type": "object",
            "properties": {
              "content": {
                "type": "string",
                "description": "文本物料实际展示的文字内容；真实字段是 props.content"
              }
            }
          }
        }
      }
    }
   *
   * */
}
