import SelectMaterialComponent from './component.vue'
import type { MaterialDefinition } from '@/schema/material.ts'
import { SelectSchema } from '@/materials/select/schema.ts'

const selectMaterial: MaterialDefinition = {
  // 物料元数据
  name: '下拉框',
  icon: 'formkit:select',
  group: 'info',
  // 。。。
  configSchema: SelectSchema,
  // 用于文本组件属性面板的，动态表单数据生成数据格式
  setters: [
    {
      type: 'number', //利用 动态表单 的思路，最终会在属性面板上呈现 el-input 组件
      label: '字体大小',
      key: 'style.fontSize',
    },
    {
      type: 'color', //利用 动态表单 的思路，最终会在属性面板上呈现 el-input 组件
      label: '字体颜色',
      key: 'style.color',
    },
    {
      type: 'select', //利用 动态表单 的思路，最终会在属性面板上呈现 el-input 组件
      label: '尺寸',
      key: 'props.size',
      props: {
        options: [
          {
            label: '大',
            value: 'large',
          },
          {
            label: '中（默认）',
            value: 'default',
          },
          {
            label: '小',
            value: 'small',
          },
        ],
      },
    },
    {
      type: 'input', //利用 动态表单 的思路，最终会在属性面板上呈现 el-input 组件
      label: 'placeholder',
      key: 'props.placeholder',
    },
    {
      type: 'editSelectOptions', //利用 动态表单 的思路，最终会在属性面板上呈现 el-input 组件
      label: '配置项',
      key: 'props.options',
      props: {
        options: [
          {
            label: '选项一',
            value: 1,
          },
          {
            label: '选项二',
            value: 2,
          },
        ],
      },
    },
    {
      type: 'select', //利用 动态表单 的思路，最终会在属性面板上呈现 el-input 组件
      label: '可清空',
      key: 'props.clearable',
      props: {
        options: [
          {
            label: '是',
            value: true,
          },
          {
            label: '否',
            value: false,
          },
        ],
      },
    },
    {
      type: 'select', //利用 动态表单 的思路，最终会在属性面板上呈现 el-input 组件
      label: '可筛选',
      key: 'props.filterable',
      props: {
        options: [
          {
            label: '是',
            value: true,
          },
          {
            label: '否',
            value: false,
          },
        ],
      },
    },
    {
      type: 'select', //利用 动态表单 的思路，最终会在属性面板上呈现 el-input 组件
      label: '多选',
      key: 'props.multiple',
      props: {
        options: [
          {
            label: '是',
            value: true,
          },
          {
            label: '否',
            value: false,
          },
        ],
      },
    },
    // {
    //   type: 'select', //利用 动态表单 的思路，最终会在属性面板上呈现 el-input 组件
    //   label: '选中值',
    //   key: 'props.options.modelValue',
    //   props: 'props.options',
    // },
  ],
  // 用于画布面板展示的组件列表 schema 数据格式
  schema: {
    //   DSL
    type: 'select',
    name: '下拉框',
    layout: {
      x: 0,
      y: 0,
      width: 300,
      height: 50,
    },
    style: {
      color: '#fff',
      fontSize: 16,
    },
    props: {
      modelValue: '',
      placeholder: '请选择',
      size: 'default',
      clearable: false,
      filterable: false,
      multiple: false,
      // 下拉框的选项，用 EditSelectOptions 组件
      options: [
        {
          label: '选项一',
          value: 1,
        },
        {
          label: '选项二',
          value: 2,
        },
      ],
      events: [
        {
          type: 'change',
          name: 'fn',
          title: '下拉框选中事件',
          code: '',
        },
      ],
    },
    // 物料组件动态添加的事件列表
    // eventOptions: [],
  },
}

export function install(register: Function) {
  return register(selectMaterial, SelectMaterialComponent)
}
