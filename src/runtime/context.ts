/*
 * 上下文对象
 * 定义这个对象的目的是暴露一些在页面运行时（发布页面后的 /screen 页面中）可供用户操作的方法
 * */
import type { MaterialSchema } from '@/schema/material.ts'
import type { PageSchema } from '@/schema/page.ts'
import { setValue } from '@/utils'

interface RuntimeContext {
  /*
   * getNode方法：获取节点。
   * 用法：getNode('123') => {'id':123,...}
   *   需要传参 id，该方法返回 node，node的类型为 MaterialSchema 或 undefined
   * */
  getNode(id: string): MaterialSchema | undefined
  /*
   * setAttribute方法：修改节点属性。
   * 用法：setAttribute('123','props.content','你好啊')
   *   需要传参 id，属性名 key，要修改的值 value。该函数没有返回值，所以是void
   * */
  setAttribute(id: string, key: string, value: any): void
  /*
   * 更新节点的props
   * setProp('123','content','你好啊')
   * */
  setProp(id: string, key: string, value: any): void
  /*
   * 更新节点的style样式
   * setStyle('123','style','red')
   * */
  setStyle(id: string, key: string, value: any): void
  /*
   * 注册组件的实例，用于拿到实例后可执行组件实例暴露出的方法，供用户调用
   * */
  registerNodeInstance(instance: Ref<string, any>): void
  /*
   * 触发指定节点实例暴露的方法
   * 用法： trigger('123','refresh',...其余传参)。通知 id 为123的组件刷新
   * id 为 node id，name 为方法名
   * */
  trigger(id: string, name: string, ...args: any[]): any
  /*
   * 通过DataId刷新使用了同一份数据源的所有组件中的数据。
   * ...args 是剩余参数
   * */
  refreshNodesByDataId(dataId: string, ...args): void
  // 提供给组件，用来调用其他组件方法的方法
  dispatch(id: string, name: string, payload?: any): void
}

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
