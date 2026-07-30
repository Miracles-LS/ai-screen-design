import type { OnDrag, OnDragGroup, OnResize, OnResizeGroup } from 'vue3-moveable'
import { useEditorStore } from '@/stores/editor.ts'

export function useMoveable() {
  const editorStore = useEditorStore()

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
    node.layout.x = e.left
    node.layout.y = e.top
  }

  // 编辑组件缩放的事件监听
  function onMoveableResize(e: OnResize) {
    e.target.style.width = e.width + 'px'
    e.target.style.height = e.height + 'px'
    const node = getNodeByTarget(e.target as HTMLElement)
    node.layout.width = e.width
    node.layout.height = e.height
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

  return {
    onMoveableDrag,
    onMoveableResize,
    onMoveableDragGroup,
    onMoveableResizeGroup,
  }
}
