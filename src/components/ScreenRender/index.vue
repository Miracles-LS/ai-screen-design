<script setup lang="ts">
import { getMaterialComponent } from '@/materials'
import type { MaterialEvent, MaterialSchema } from '@/schema/material.ts'
import type { PageSchema } from '@/schema/page.ts'
import { createRuntimeContext } from '@/runtime/context.ts'
import { runSandbox } from '@/runtime/sandbox.ts'
import { deepClone } from '@/utils/index.ts'

defineOptions({
  name: 'ScreenRender',
})

const props = defineProps<{ page: PageSchema }>()

const runtimePage = ref(deepClone(props.page))

const context = createRuntimeContext(runtimePage)

// 暂时在 window 上面加一个属性，方便测试
// @ts-ignore
// window.$context = context

const nodes = computed(() => runtimePage.value.nodes)
const dataSources = computed(() => runtimePage.value.dataSources)
const canvas = computed(() => runtimePage.value.canvas)

const scale = ref(1)
const left = ref(0)
const top = ref(0)

// 预览页面全局注入datasource配置，用于显示画布组件布局
provide('dataSource', dataSources)

const canvasStyle = computed(() => {
  return {
    width: canvas.value.width + 'px',
    height: canvas.value.height + 'px',
    backgroundColor: canvas.value.backgroundColor,
    transform: `translate(${left.value}px,${top.value}px) scale(${scale.value})`,
    transformOrigin: 'left top',
  }
})

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

function createEvents(node: MaterialSchema) {
  const listeners = {}
  const events: MaterialEvent[] = node.events || []
  events.forEach(event => {
    /*event
    *  {
          type: 'click',
          name: 'fn',
          code: 'console.log(123)',
        },
    * */
    if (event.handler) {
      // 已经存在该 event.type 的事件，直接赋值保存的函数
      listeners[event.type] = event.handler
      return
    }
    event.handler = listeners[event.type] = payload => {
      runSandbox(event.code, { $context: context, $node: node, $payload: payload })
    }
  })
  return listeners
}

function initPage() {
  // 缩放比例计算
  const scaleX = window.innerWidth / canvas.value.width
  const scaleY = window.innerHeight / canvas.value.height
  // 判断宽度和高度哪个缩放比例更小，就以那个最小的缩放比例进行等比缩放
  scale.value = Math.min(scaleX, scaleY)
  // 控制画布保持水平居中
  left.value = (window.innerWidth - canvas.value.width * scale.value) / 2
  top.value = (window.innerHeight - canvas.value.height * scale.value) / 2
}

// 获取当前组件实例
const vm = getCurrentInstance()

function registerNodeInstance() {
  const refs = {}
  for (const key in vm.refs) {
    refs[key] = vm.refs[key][0]
  }
  context.registerNodeInstance(refs)
}

onMounted(() => {
  initPage()
  registerNodeInstance()
  addEventListener('resize', initPage)

  onBeforeMount(() => {
    removeEventListener('resize', initPage)
  })
})
</script>

<template>
  <div class="preview-container">
    <div class="canvas-root" :style="canvasStyle">
      <div
        class="canvas-node"
        v-for="(node, index) in nodes"
        :key="node.id"
        :data-node-id="node.id"
        :data-node-locked="node.locked"
        :style="getNodeStyle(node, index)"
      >
        <!--    由于 components 是遍历出来的，所以此时拿到的ref也是个数组    -->
        <component
          :ref="node.id"
          :is="getMaterialComponent(node.type)"
          :schema="node"
          v-on="createEvents(node)"
        ></component>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.preview-container {
  width: 100vw;
  height: 100vh;
  .canvas-root {
    position: relative;
    .canvas-node {
      position: absolute;
    }
  }
}
</style>
