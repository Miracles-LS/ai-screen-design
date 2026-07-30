import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import type { MaterialSchema } from '@/schema/material.ts'

export function useSelection({ stageRef, moveableRef }) {
  const editorStore = useEditorStore()

  const { selectedNodeIds } = storeToRefs(editorStore)
  // 当前选中的组件dom元素，用于 Moveable 组件的 target属性传值
  const selectedTarget = shallowRef<HTMLElement[]>()

  watch(
    selectedNodeIds,
    ids => {
      selectedTarget.value = ids.map(id => {
        return stageRef.value.querySelector(`[data-node-id='${id}']:not([data-node-locked='true'])`)
      })
    },
    // flush 默认是 ‘pre’ 表示render函数执行之前运行，也就是在页面更新前执行watch函数。'post' 是指页面更新后执行watch函数，这个时候就能拿到更新后的最新dom元素
    { deep: true, flush: 'post' }
  )

  // 选中当前要移动的组件，设置选中的 nodeId 和 dom元素
  function onSelect(node: MaterialSchema, e: MouseEvent) {
    // region 因为有watch监听处理了selectedTarget的值，所以这里去掉
    // selectedTarget.value = e.currentTarget as HTMLElement
    //endregion
    //不能直接写 e.target ，因为mousedown是冒泡事件，子节点也能够触发到mousedown。只能用 e.currentTarget 来获取当前点击的元素才是最准确的。
    editorStore.selectNode(node.id)

    // 处理需要点击两次moveable元素才能实现移动效果。改为点击一次就能立马操作组件移动
    nextTick(() => {
      moveableRef.value.dragStart(e)
    })
  }

  // 清除选中的组件，即不显示可编辑的选框
  function onClearSelected() {
    // region 因为有watch监听处理了selectedTarget的值，所以这里去掉
    // selectedTarget.value = null
    // endregion
    editorStore.clearSelectedNode()
  }

  // 多选/单选 选中元素的事件监听
  function onSelectEnd(e) {
    // region 因为有watch监听处理了selectedTarget的值，所以这里去掉
    // selectedTarget.value = e.selected
    // endregion
    const ids = e.selected.map(element => element.getAttribute('data-node-id'))
    editorStore.selectNodes(ids)
  }
  return {
    selectedTarget,
    onSelect,
    onClearSelected,
    onSelectEnd,
  }
}
