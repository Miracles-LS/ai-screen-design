import { createNode } from '@/materials'
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import { debounce } from '@/utils'
import type { MaterialSchema } from '@/schema/material.ts'

export function useCanvasRuler({ canvasRootRef, moveableRef, selectedTarget }) {
  const editorStore = useEditorStore()

  const { canvas } = storeToRefs(editorStore)
  // 标尺卡的缩放
  const sketchRuleScale = ref(1)
  // 标尺卡的配置设置
  const palette = {
    bgColor: '#1f2937',
    longfgColor: '#6b7280',
    fontColor: '#9ca3af',
    fontShadowColor: '#0e8da7',
    shadowColor: 'rgba(14, 141, 167, 0.14)',
    lineColor: '#22c55e',
    lineType: 'solid',
    lockLineColor: '#4b5563',
    borderColor: '#374151',
    hoverBg: '#111827',
    hoverColor: '#ffffff',
  }
  // 初始化水平标尺上的参考线
  const sketchRulerLines = ref({ h: [], v: [] })
  const rectWidth = ref(1000)
  const rectHeight = ref(800)

  // 画布的宽高，sketchRuler会根据画布的宽高自适应设置缩放比例。
  const canvasWidth = computed(() => {
    return canvas.value.width
  })
  const canvasHeight = computed(() => {
    return canvas.value.height
  })
  const canvasStyle = computed(() => {
    return {
      width: canvasWidth.value + 'px',
      height: canvasHeight.value + 'px',
      backgroundColor: canvas.value.backgroundColor,
    }
  })

  // 防抖设置CanvasRoot组件的宽高
  const onRootResize = debounce(rect => {
    rectWidth.value = rect.width
    rectHeight.value = rect.height
  }, 100)

  onMounted(() => {
    const { width, height } = canvasRootRef.value.getBoundingClientRect()
    rectWidth.value = width
    rectHeight.value = height

    // 监听CanvasRoot组件的宽高变化，动态设置标尺卡的宽高
    const ob = new ResizeObserver(entries => {
      const entry = entries[0]
      const rect = entry.contentRect
      // rectWidth.value = rect.width
      // rectHeight.value = rect.height
      onRootResize(rect)
    })
    ob.observe(canvasRootRef.value)

    // 组件销毁的声明周期也可写在声明周期内
    onUnmounted(() => {
      // 断开组件事件监听
      ob?.disconnect()
    })
  })

  // 标尺卡的缩放事件监听
  function onRulerZoomChange() {
    moveableRef.value.updateRect()
  }

  // 画布接收拖拽的组件schema
  function onDrop(e: DragEvent) {
    const data: string | undefined = e.dataTransfer?.getData('schema')
    const node = data ? createNode(JSON.parse(data)) : null
    // 设置拖拽后的位置为鼠标当前位置
    node.layout.x = e.offsetX - node?.layout.width / 2
    node.layout.y = e.offsetY - node?.layout.height / 2
    node && editorStore.addNode(node)
    editorStore.selectNode(node?.id)
    // region 因为有watch监听处理了selectedTarget的值，所以这里去掉
    // nextTick(() => {
    //   // 通过当前组件的实例去查找当前页面中对应nodeId的元素，并赋予给moveable组件，这样就能实现一拖拉到画布就能有resize边框
    //   selectedTarget.value = vm.proxy.$el.querySelector(`[data-node-id='${node?.id}']`)
    // })
    // endregion
  }

  // 策略模式
  const commandMap = {
    copy: () => editorStore.copyNode(editorStore.selectedNode),
    remove: () => editorStore.removeNode(editorStore.selectedNode),
    // 因为css处理了数据顺序反转，所以这里的置顶和置底操作也需要反转
    moveBottom: () => editorStore.moveNodeTop(editorStore.selectedNode),
    moveTop: () => editorStore.moveNodeBottom(editorStore.selectedNode),
    toggleLock: () => {
      editorStore.toggleNodeLock(editorStore.selectedNode)
      selectedTarget.value = []
    },
  }
  // 右键菜单点击后的事件处理
  function onDropdownCommand(command: string) {
    commandMap[command]()
  }

  // 处理组件在画布上显示的位置和大小
  function getNodeStyle(node: MaterialSchema, index: number) {
    return {
      width: node.layout.width + 'px',
      height: node.layout.height + 'px',
      left: node.layout.x + 'px',
      top: node.layout.y + 'px',
      zIndex: index + 1,
    }
  }

  return {
    canvasWidth,
    canvasHeight,
    canvasStyle,
    rectWidth,
    rectHeight,
    sketchRulerLines,
    sketchRuleScale,
    palette,
    getNodeStyle,
    onRulerZoomChange,
    onDrop,
    onDropdownCommand,
  }
}
