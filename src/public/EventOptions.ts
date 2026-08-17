import type { EventOption } from '@/schema/material.ts'
/*
 * 组件的通用事件类型
 * */
// 1、组件生命周期事件配置
const LifeEventOptions: EventOption[] = [
  {
    label: '组件挂载前',
    value: 'vnodeBeforeMounted',
  },
  {
    label: '组件挂载了',
    value: 'vnodeMounted',
  },
  {
    label: '组件更新前',
    value: 'vnodeBeforeUpdate',
  },
  {
    label: '组件更新了',
    value: 'vnodeUpdated',
  },
  {
    label: '组件销前',
    value: 'vnodeBeforeUnMounted',
  },
  {
    label: '组件销毁',
    value: 'vnodeUnMounted',
  },
]

// Html 原生事件配置
const HtmlEventOptions: EventOption[] = [
  {
    label: '点击事件',
    value: 'click',
  },
  {
    label: '双击事件',
    value: 'dblclick',
  },
  {
    label: '鼠标移到组件上事件',
    value: 'mouseover',
  },
  {
    label: '鼠标离开组件事件',
    value: 'mousedown',
  },
]

export { LifeEventOptions, HtmlEventOptions }
