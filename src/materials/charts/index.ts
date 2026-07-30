import type { MaterialDefinition } from '@/schema/material.ts'

const barMaterial: MaterialDefinition = {
  name: '柱状图',
  icon: 'fluent-color:list-bar-16',
  group: 'charts',
  setters: [],
  schema: {
    //   DSL
    type: 'charts',
    name: '柱状图',
    layout: {
      x: 0,
      y: 0,
      width: 300,
      height: 200,
    },
    props: {
      options: {},
    },
  },
}

export function install(register: Function) {
  return register(barMaterial)
}
