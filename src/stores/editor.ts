import { defineStore } from 'pinia'

import type { MaterialSchema } from '@/schema/material.ts'
import type { PageSchema } from '@/schema/page.ts'
import { toRef } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const pannelVisable = reactive({
    // 物料面板是否可见
    material: true,
    // 图层面板是否可见
    layer: true,
    // 属性面板是否可见
    property: true,
  })

  const page = ref<PageSchema>({
    canvas: {
      width: 1920,
      height: 1080,
      backgroundColor: '#0e121b',
    },
    nodes: <MaterialSchema[]>[],
  })

  // 当前画布的配置
  const canvas = toRef(page.value, 'canvas')

  // 当前画布中显示的所有组件列表
  const nodes = toRef(page.value, 'nodes')

  // 当前(多选)选中的组件节点id数组（可单选，多选）
  const selectedNodeIds = ref([])

  // 当前(单选)选中的组件节点id
  // 多选的情况下为null
  const selectedNodeId = computed(() => {
    return selectedNodeIds.value.length === 1 ? selectedNodeIds.value[0] : null
  })

  // 当前选中的组件节点
  const selectedNode = computed(() => {
    return nodes.value.find(node => node.id === selectedNodeId.value)
  })

  // 给画布组件列表新增新的组件节点
  function addNode(node: MaterialSchema) {
    nodes.value.push(node)
  }

  // 设置当前选中（单选）的组件/node节点
  function selectNode(id: string) {
    selectedNodeIds.value = [id]
  }

  // 多选选中的node节点id数组
  function selectNodes(ids: string[]) {
    selectedNodeIds.value = ids
  }

  // 通过节点id找到对应的node节点
  function findNodeById(id: string) {
    return nodes.value.find(node => node.id === id)
  }

  // 清除当前选中的node节点
  function clearSelectedNode() {
    selectedNodeIds.value = []
  }

  /*  以下是鼠标右键操作集合  */
  // 复制节点
  function copyNode(node: MaterialSchema) {
    const newNode = JSON.parse(JSON.stringify(node))
    newNode.id = crypto.randomUUID()
    newNode.layout.x += 20
    newNode.layout.y += 20
    addNode(newNode)
    selectNode(newNode.id)
  }
  // 移除节点
  function removeNode(node: MaterialSchema) {
    nodes.value = nodes.value.filter(item => item.id !== node.id)
    selectedNodeIds.value = selectedNodeIds.value.filter(id => id !== node.id)
  }
  // 置顶节点
  function moveNodeTop(node: MaterialSchema) {
    // [a,b,c,d] => [c,a,b,d]
    // 先找到要移除的 node 的 index，再根据原 index 位置把元素剔除，最后再将该元素插入到数组的第一项，即为置顶
    const index = nodes.value.findIndex(item => item.id === node.id)
    nodes.value.splice(index, 1)
    nodes.value.unshift(node)
  }
  // 置底节点
  function moveNodeBottom(node: MaterialSchema) {
    // [a,b,c,d] => [a,b,d,c]
    // 先找到要移除的 node 的 index，再根据原 index 位置把元素剔除，最后再将该元素插入到数组的最后一项，即为置底
    const index = nodes.value.findIndex(item => item.id === node.id)
    nodes.value.splice(index, 1)
    nodes.value.push(node)
  }
  // 锁定节点
  function toggleNodeLock(node: MaterialSchema) {
    node.locked = !node.locked
  }

  return {
    pannelVisable,
    page,
    canvas,
    nodes,
    selectedNodeId,
    selectedNodeIds,
    selectedNode,
    addNode,
    selectNode,
    selectNodes,
    findNodeById,
    clearSelectedNode,
    copyNode,
    removeNode,
    moveNodeTop,
    moveNodeBottom,
    toggleNodeLock,
  }
})
