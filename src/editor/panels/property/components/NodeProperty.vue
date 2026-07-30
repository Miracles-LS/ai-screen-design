<script setup lang="ts">
import { getMaterialSetter } from '@/materials'
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import FormCreate from '@/editor/panels/property/components/FormCreate.vue'

defineOptions({
  name: 'NodeProperty',
})

const editorStore = useEditorStore()
const { selectedNode } = storeToRefs(editorStore)

const setters = getMaterialSetter(selectedNode.value.type)

const layoutSetters = [
  {
    type: 'number',
    label: '宽度',
    key: 'layout.width',
    span: 12,
  },
  {
    type: 'number',
    label: '高度',
    key: 'layout.height',
    span: 12,
  },
  {
    type: 'number',
    label: 'X',
    key: 'layout.x',
    span: 12,
  },
  {
    type: 'number',
    label: 'Y',
    key: 'layout.y',
    span: 12,
  },
]

const active = ref('node')
</script>

<template>
  <div class="node-property">
    <el-collapse v-model="active" accordion>
      <el-collapse-item title="布局属性" name="layout">
        <FormCreate :setters="layoutSetters" :formData="selectedNode"></FormCreate>
      </el-collapse-item>
      <el-collapse-item title="组件属性" name="node">
        <FormCreate :setters="setters" :formData="selectedNode"></FormCreate>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped lang="scss">
.node-property {
  :deep(.el-collapse) {
    --el-collapse-border-color: var(--el-border-color-lighter);
    --el-collapse-header-height: 48px;
    --el-collapse-header-bg-color: transparent;
    --el-collapse-header-text-color: var(--el-text-color-primary);
    --el-collapse-header-font-size: 13px;
    --el-collapse-content-bg-color: transparent;
    --el-collapse-content-font-size: 13px;
    --el-collapse-content-text-color: var(--el-text-color-primary);
    border-top: 1px solid var(--el-collapse-border-color);
    border-bottom: 1px solid var(--el-collapse-border-color);
    .el-collapse-item__title {
      padding-left: 20px;
    }
  }
}
</style>
