import TextMaterialComponent from './component.vue'
import type { MaterialDefinition } from '@/schema/material.ts'

const textMaterial: MaterialDefinition = {
  // 物料元数据
  name: '文本',
  icon: 'solar:text-bold',
  group: 'info',
  // 。。。
  // 用于文本组件属性面板的，动态表单数据生成数据格式
  setters: [
    {
      type: 'input', //利用 动态表单 的思路，最终会在属性面板上呈现 el-input 组件
      label: '内容',
      key: 'props.content',
    },
    {
      type: 'color', //利用 动态表单 的思路，最终会在属性面板上呈现 el-color-picker 组件
      label: '颜色',
      key: 'style.color',
    },
  ],
  // 用于画布面板展示的组件列表 schema 数据格式
  schema: {
    //   DSL
    type: 'text',
    name: '普通文本',
    layout: {
      x: 0,
      y: 0,
      width: 300,
      height: 50,
    },
    style: {
      color: 'red',
    },
    props: {
      content: 'hello world',
    },
  },
}

export function install(register: Function) {
  return register(textMaterial, TextMaterialComponent)
}
