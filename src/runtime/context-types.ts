// 这份类型既供前端使用，也会以原文发送给事件生成节点。
// 生成的 event.code 是 JavaScript 函数体。

// node 节点，具体这里只是做占位，具体以物料的 schema 为准，物料 schema 里有 props、style、events 等字段。
type RuntimeNode = any

export interface RuntimeContext {
  /*
   * getNode方法：获取节点。
   * 用法：getNode('123') => {'id':123,...}
   *   需要传参 id，该方法返回 node，node的类型为 MaterialSchema 或 undefined
   * */
  getNode(id: string): RuntimeNode | undefined
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

/** 当前正在触发的事件可使用的页面运行时 API。 */
declare const $context: RuntimeContext
/** 当前触发事件的节点。 */
declare const $node: RuntimeNode
/** 当前事件携带的数据；具体内容由物料 eventOptions 的 payload 描述。 */
declare const $payload: unknown
