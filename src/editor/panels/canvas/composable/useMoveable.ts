import type { OnDrag, OnDragGroup, OnResize, OnResizeGroup } from 'vue3-moveable'
import { useEditorStore } from '@/stores/editor.ts'
import { useUndoRedo } from '@/composables/useUndoRedo.ts'

export function useMoveable(moveableRef) {
  const editorStore = useEditorStore()
  const { applyChange, startBatch, commitBatch } = useUndoRedo()

  // 开始 move/resize 时，批量处理，记录到操作记录
  function onStart() {
    startBatch()
  }

  // 结束 move/resize 时，提交记录到撤销栈内
  function onEnd() {
    commitBatch()
  }

  // 通过dom元素找到对应的组件node节点
  function getNodeByTarget(element: HTMLElement) {
    const nodeId = element.getAttribute('data-node-id')
    return editorStore.findNodeById(nodeId)
  }

  // 移动组件的拖拽事件监听
  function onMoveableDrag(e: OnDrag) {
    e.target.style.left = e.left + 'px'
    e.target.style.top = e.top + 'px'
    const node = getNodeByTarget(e.target as HTMLElement)
    // node.layout.x = e.left
    // node.layout.y = e.top
    applyChange(node, 'layout', {
      ...node.layout,
      x: e.left,
      y: e.top,
    })
  }

  // 编辑组件缩放的事件监听
  function onMoveableResize(e: OnResize) {
    e.target.style.width = e.width + 'px'
    e.target.style.height = e.height + 'px'
    const node = getNodeByTarget(e.target as HTMLElement)
    // node.layout.width = e.width
    // node.layout.height = e.height
    applyChange(node, 'layout', {
      ...node.layout,
      width: e.width,
      height: e.height,
    })
    // resize 之后 drag 也会发生变化，需要实时再调 drag函数更新x和y的位置
    onMoveableDrag(e.drag)
  }

  // 多选组件后的组件组合拖拽事件监听
  function onMoveableDragGroup(e: OnDragGroup) {
    e.events.forEach(onMoveableDrag)
  }

  // 多选组件后的组件组合缩放事件监听
  function onMoveableResizeGroup(e: OnResizeGroup) {
    e.events.forEach(onMoveableResize)
  }

  // 监听组件的位置和大小更新后，当layout发生变化后，手动更新 moveable 选框
  watch(
    () =>
      editorStore.nodes.map(node => {
        return node.layout
      }),
    () => {
      // 手动更新的方法
      moveableRef.value.updateRect()
    },
    {
      flush: 'post',
    }
  )

  // onMounted(() => {
  //   const handler = (event: KeyboardEvent) => {
  //     if (editorStore.selectedNode) {
  //       if (event.key === 'Delete') {
  //         //   按了删除键
  //         editorStore.removeNode(editorStore.selectedNode)
  //       }
  //     }
  //   }
  //   addEventListener('keydown', handler)
  //   onBeforeUnmount(() => {
  //     removeEventListener('keydown', handler)
  //   })
  // })

  return {
    onMoveableDrag,
    onMoveableResize,
    onMoveableDragGroup,
    onMoveableResizeGroup,
    onStart,
    onEnd,
  }
}
