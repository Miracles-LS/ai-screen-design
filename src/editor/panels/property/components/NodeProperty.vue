<script setup lang="ts">
import { getMaterialSetter } from '@/materials'
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import FormCreate from '@/editor/panels/property/components/FormCreate.vue'
import { Icon } from '@iconify/vue'
import MonacoEditor from '@/components/MonacoEditor/index.vue'
import DataSource from '@/editor/panels/property/components/DataSource.vue'
import NodeEvents from '@/editor/panels/property/components/NodeEvents.vue'

defineOptions({
  name: 'NodeProperty',
})

const editorStore = useEditorStore()
const { selectedNode } = storeToRefs(editorStore)

const setters = computed(() => {
  return getMaterialSetter(selectedNode.value.type)
})

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
// json抽屉
const jsonVisible = ref(false)
// 事件弹窗
const eventVisible = ref(false)

const jsonText = ref('')

const activeTab = ref('property')

const nodeEventsRef = useTemplateRef('nodeEventsRef')

function previewJson() {
  // stringify 后面的传参是为了格式化代码
  jsonText.value = JSON.stringify(selectedNode.value, null, 2)
  jsonVisible.value = true
}

function onConfirm() {
  // 拿到新节点
  const newNode = JSON.parse(jsonText.value)
  // 更新 nodes
  editorStore.updateNodes(selectedNode.value.id, {
    ...newNode,
    // id和type不能被用户任意修改，沿用原组件id和type
    id: selectedNode.value.id,
    type: selectedNode.value.type,
  })
  jsonVisible.value = false
}

// 保存datasource编辑代码面板
function onSave() {
  //   这里调用DataSourceManager暴露的方法
  nodeEventsRef.value.save()
  eventVisible.value = false
}
</script>

<template>
  <div class="node-property">
    <div class="node-title">
      <span>{{ selectedNode.name }}</span>
      <span class="flex">
        <el-tooltip content="组件事件" placement="bottom" effect="dark">
          <span class="cursor-pointer mr-20" @click="eventVisible = true">
            <Icon icon="codicon:symbol-event"></Icon>
          </span>
        </el-tooltip>
        <el-tooltip content="组件配置" placement="bottom" effect="dark">
          <span class="cursor-pointer" @click="previewJson">
            <Icon icon="si:json-duotone"></Icon>
          </span>
        </el-tooltip>
      </span>
    </div>

    <el-tabs v-model="activeTab" stretch>
      <el-tab-pane label="屬性" name="property">
        <el-collapse v-model="active" accordion>
          <el-collapse-item title="布局属性" name="layout">
            <FormCreate :setters="layoutSetters" :formData="selectedNode"></FormCreate>
          </el-collapse-item>
          <el-collapse-item title="组件属性" name="node">
            <FormCreate :setters="setters" :formData="selectedNode"></FormCreate>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
      <el-tab-pane label="数据源" name="data-source">
        <DataSource />
      </el-tab-pane>
    </el-tabs>

    <!--预览 json-->
    <el-drawer destroy-on-close v-model="jsonVisible" title="编辑 JSON" size="800">
      <MonacoEditor v-model="jsonText" />
      <template #footer>
        <el-button @click="jsonVisible = false">取消</el-button>
        <el-button type="primary" @click="onConfirm">确认</el-button>
      </template>
    </el-drawer>

    <!--事件配置-->
    <el-dialog destroy-on-close title="事件配置" width="800" v-model="eventVisible">
      <NodeEvents ref="nodeEventsRef" />
      <template #footer>
        <el-button @click="eventVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.node-property {
  .node-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    padding: 0 20px;
    font-weight: 600;
    background: bg-mix(20);
  }

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
