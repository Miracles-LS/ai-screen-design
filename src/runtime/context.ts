/*
 * 上下文对象
 * 定义这个对象的目的是暴露一些在页面运行时（发布页面后的 /screen 页面中）可供用户操作的方法
 * */
import type { MaterialSchema } from '@/schema/material.ts'
import type { PageSchema } from '@/schema/page.ts'
import { setValue } from '@/utils'
import type { RuntimeContext } from '@/runtime/context-types.ts'

// 创建运行时上下文对象，里面提供了 getNode 方法
export function createRuntimeContext(page: Ref<PageSchema>) {
  let instanceMap = {}

  const getNode: RuntimeContext['getNode'] = id => {
    return page.value.nodes.find(node => node.id === id)
  }

  const setAttribute: RuntimeContext['setAttribute'] = (id, key, value) => {
    const node = getNode(id)
    if (!node) {
      console.warn(`没找到${id}这个节点`)
      return
    }
    setValue(node, key, value)
  }

  const setProp: RuntimeContext['setProp'] = (id, key, value) => {
    setAttribute(id, `props.${key}`, value)
  }

  const setStyle: RuntimeContext['setStyle'] = (id, key, value) => {
    setAttribute(id, `style.${key}`, value)
  }

  const registerNodeInstance: RuntimeContext['registerNodeInstance'] = instance => {
    instanceMap = instance
  }

  const trigger: RuntimeContext['trigger'] = (id, name, ...args) => {
    const instance = instanceMap[id]
    if (!instance) {
      console.warn(`没找到${id}这个组件实例`)
      return
    }
    // 假设调用了组件的 getData ,那么 getData 返回123，trigger 也返回123
    return instance[name]?.(...args)
  }

  const refreshNodesByDataId: RuntimeContext['refreshNodesByDataId'] = (dataId, ...args) => {
    const nodes = page.value.nodes.filter(node => node.dataId === dataId)
    nodes.forEach(node => {
      trigger(node.id, 'refresh', ...args)
    })
  }

  const dispatch: RuntimeContext['dispatch'] = (id, name, payload) => {
    const node = getNode(id)
    if (!node) {
      console.warn(`没找到${id}这个节点`)
      return
    }
    const event = node.events?.find(event => event.name == name)
    if (event) {
      // 找到了事件，执行handler
      event.handler?.(payload)
      return
    }
    console.warn(`没找到${event}这个事件`)
  }

  return {
    getNode,
    setAttribute,
    setProp,
    setStyle,
    registerNodeInstance,
    trigger,
    refreshNodesByDataId,
    dispatch,
  }
}
