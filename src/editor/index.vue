<script setup lang="ts">
import ToolbarLeft from '@/editor/toolbar/ToolbarLeft.vue'
import ToolbarRight from '@/editor/toolbar/ToolbarRight.vue'
import { useEditorStore } from '@/stores/editor.ts'
import MaterialPanel from '@/editor/panels/material/index.vue'
import LayerPanel from '@/editor/panels/layer/index.vue'
import CanvasRoot from '@/editor/panels/canvas/index.vue'
import PropertyPanel from '@/editor/panels/property/index.vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { getPublishedPage } from '@/utils/publish.ts'
import AiPanel from '@/editor/panels/ai/index.vue'

defineOptions({
  name: 'ScreenEditor',
})

const editorStore = useEditorStore()

const route = useRoute()
const pageId = route.query.id
if (pageId) {
  // 如果 pageId 有，去查询数据库（localstorage）
  // 若url传参是这样的：/preview?id=1&id=2，则这里拿到的 query = {id:[1,2]}，所以 pageId 会报 ts 问题，给他断言成 string 就好了
  const page = getPublishedPage(pageId as string)
  editorStore.setPage(page)
}

const { dataSources } = storeToRefs(editorStore)

// 全局注入数据源。由于这里组件是属于编辑数据大屏状态，所以注入的是 pinia store的前端数据源。若是预览/发布状态 渲染的组件页面，注入的数据源应该是后端请求拿到的数据
// dataSources 此时注入的是个ref数据
provide('dataSource', dataSources)

const materialWidth = computed(() => {
  return editorStore.pannelVisable.material ? '260px' : 0
})
const layerWidth = computed(() => {
  return editorStore.pannelVisable.layer ? '160px' : 0
})
const propertyWidth = computed(() => {
  return editorStore.pannelVisable.property ? '360px' : 0
})
const aiWidth = computed(() => {
  return editorStore.pannelVisable.ai ? '460px' : 0
})
</script>

<template>
  <div class="h-screen editor select-none">
    <header class="header h-56 flex items-center px-20">
      <ToolbarLeft class="w-300" />
      <div class="flex-1 text-center">数据大屏低代码平台</div>
      <ToolbarRight class="w-300" />
    </header>
    <main class="editor-main flex">
      <!--  物料  -->
      <MaterialPanel
        class="material overflow-hidden transition-all"
        :style="{ width: materialWidth }"
      />
      <!--  图层  -->
      <LayerPanel class="layer overflow-hidden transition-all" :style="{ width: layerWidth }" />
      <!--  画布  -->
      <CanvasRoot class="canvas flex-1" />
      <!--  属性  -->
      <PropertyPanel
        class="property overflow-hidden transition-all"
        :style="{ width: propertyWidth }"
      />
      <!--  AI对话面板  -->
      <AiPanel class="ai overflow-hidden transition-all" :style="{ width: aiWidth }" />
    </main>
  </div>
</template>

<style scoped lang="scss">
.editor {
  background-color: var(--bg-color);
  .header {
    border-bottom: 1px solid var(--border-color);
  }
  .editor-main {
    height: calc(100% - 56px);
  }
  .material,
  .layer {
    border-right: 1px solid var(--border-color);
  }
  .property,
  .ai {
    border-left: 1px solid var(--border-color);
  }
}
</style>
