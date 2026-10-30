import { defineStore } from 'pinia'

import type { MaterialEvent, MaterialSchema } from '@/schema/material.ts'
import type { DataSourceSchema, PageSchema } from '@/schema/page.ts'
import { toRef } from 'vue'
import { useUndoRedo } from '@/composables/useUndoRedo.ts'

import type { EventOption } from '@/schema/material.ts'

export const useEditorStore = defineStore('editor', () => {
  const { applyChange } = useUndoRedo()

  const pannelVisable = reactive({
    // 物料面板是否可见
    material: false,
    // 图层面板是否可见
    layer: false,
    // 属性面板是否可见
    property: false,
    // ai面板是否可见
    ai: true,
  })

  const page = ref<PageSchema>({
    canvas: {
      width: 1920,
      height: 1080,
      backgroundColor: '#0e121b',
    },
    nodes: <MaterialSchema[]>[],
    dataSources: [
      {
        type: 'static',
        id: '122',
        name: '销售数据',
        dataDescription:
          'data 是一个对象数组，每个对象代表一条销售记录，包含月份和销售额字段。label 字段表示月份，value 字段表示销售额。',
        data: [
          {
            label: '一月',
            value: 100,
          },
          {
            label: '二月',
            value: 200,
          },
          {
            label: '三月',
            value: 300,
          },
        ],
      },
      {
        type: 'static',
        id: '456',
        name: '访问数据',
        dataDescription:
          'data 是一个对象数组，每个对象代表一条访问记录，包含访问月份和具体的访问量字段。label 字段表示月份，value 字段表示访问量。',
        data: [
          {
            label: '四月',
            value: 400,
          },
          {
            label: '五月',
            value: 500,
          },
          {
            label: '六月',
            value: 600,
          },
        ],
      },
      {
        type: 'api',
        id: '789',
        name: '上升趋势',
        dataDescription:
          'data 是一个对象数组，每个对象代表一条上升趋势记录，包含具体月份和具体趋势量字段。label 字段表示月份，value 字段表示趋势量。',
        url: '/api/data',
        method: 'get',
        // responsePath: 'list',
        data: [],
        // interval: 2000,
        params: {
          date: '2029-20-29',
        },
      },
    ],
  })

  // 当前画布的配置
  const canvas = toRef(page.value, 'canvas')

  // 当前画布中显示的所有组件列表
  const nodes = toRef(page.value, 'nodes')

  // 当前画布中显示的所有组件列表
  const dataSources = toRef(page.value, 'dataSources')

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

  // 通过 applyChange方法 修改 nodes.value，这样可以将操作记录到撤销栈内，实现操作的撤销和回退
  function setNodesByApplyChange(key: string, newNodes: any) {
    applyChange(nodes, key, newNodes)
  }

  // 给画布组件列表新增新的组件节点
  function addNode(node: MaterialSchema) {
    // nodes.value.push(node)
    setNodesByApplyChange('value', [...nodes.value, node])
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
    setNodesByApplyChange(
      'value',
      nodes.value.filter(item => item.id !== node.id)
    )
    // nodes.value = nodes.value.filter(item => item.id !== node.id)
    selectedNodeIds.value = selectedNodeIds.value.filter(id => id !== node.id)
  }
  // 置顶节点
  function moveNodeTop(node: MaterialSchema) {
    // [a,b,c,d] => [c,a,b,d]
    // 先找到要移除的 node 的 index，再根据原 index 位置把元素剔除，最后再将该元素插入到数组的第一项，即为置顶
    const index = nodes.value.findIndex(item => item.id === node.id)
    // toSpliced()：这是新js的新api，原api splice()会修改原数组的结构，toSpliced不会修改元素组结构，返回结果为新数组。
    const splicedNodes = nodes.value.toSpliced(index, 1)
    setNodesByApplyChange('value', [node, ...splicedNodes])
  }
  // 置底节点
  function moveNodeBottom(node: MaterialSchema) {
    // [a,b,c,d] => [a,b,d,c]
    // 先找到要移除的 node 的 index，再根据原 index 位置把元素剔除，最后再将该元素插入到数组的最后一项，即为置底
    const index = nodes.value.findIndex(item => item.id === node.id)
    const splicedNodes = nodes.value.toSpliced(index, 1)
    setNodesByApplyChange('value', [...splicedNodes, node])
  }
  // 锁定节点
  function toggleNodeLock(node: MaterialSchema) {
    // node.locked = !node.locked
    setNodesByApplyChange('locked', !node.locked)
  }

  // 通过 nodeId 更新 nodes 对应的那个 node 数据
  function updateNodes(id: string, newNode: MaterialSchema) {
    //region 兼容传参只有newNode，没有传id的情况
    if (!newNode && typeof id === 'object') {
      newNode = id
      id = newNode.id
    }
    //endregion
    // 使用map返回新列表，在新列表中做了替换
    const updatedNodes = nodes.value.map(node => (node.id === id ? newNode : node))
    // 更新新的nodes，并记录到撤销栈内
    setNodesByApplyChange('value', updatedNodes)
  }

  function setPage(newPage: PageSchema) {
    // 合并 newPage 的所有属性到 page.value 中，不能直接 page.value = newPage，因为会使
    Object.assign(page.value, newPage)
  }

  // 新增数据源
  function addDataSource(dataSource: DataSourceSchema) {
    const newDataSource = [...dataSources.value, dataSource]
    applyChange(dataSources, 'value', newDataSource)
  }

  // 更新数据源
  function updateDataSource(dataSource: DataSourceSchema) {
    if (!dataSources.value.some(item => item.id === dataSource.id)) {
      throw new Error(`数据源不存在：${dataSource.id}`)
    }
    const newDataSources = dataSources.value.map(ds => (ds.id === dataSource.id ? dataSource : ds))
    applyChange(dataSources, 'value', newDataSources)
  }

  function updateCanvas(newCanvas) {
    applyChange(canvas, 'value', newCanvas)
  }

  return {
    pannelVisable,
    page,
    canvas,
    nodes,
    dataSources,
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
    updateNodes,
    setPage,
    addDataSource,
    updateDataSource,
    updateCanvas,
  }
})
