<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import MonacoEditor from '@/components/MonacoEditor/index.vue'
import { deepClone } from '@/utils'
import { Icon } from '@iconify/vue'
import { fetchData } from '@/composables/useDataSource.ts'
import type { MaterialEvent } from '@/schema/material.ts'
import { ElMessage } from 'element-plus'
import { getMaterialEventOptions } from '@/materials'

defineOptions({
  name: 'NodeEvents',
})

const editorStore = useEditorStore()
const { selectedNode, nodes } = storeToRefs(editorStore)

const dispatchEventValue = ref()
// 处理 触发事件级联表的数据
const dispatchOptions = computed(() => {
  return nodes.value?.map(node => {
    return {
      label: node.name,
      value: node.id,
      children: node.events?.map(event => {
        return {
          label: event.title,
          value: event.name,
        }
      }),
    }
  })
})

const activeEvent = ref()

const eventOptions = computed(() => {
  return getMaterialEventOptions(selectedNode.value.type)
})

/*
 * 深拷贝事件列表
 * */
const data = ref(deepClone(selectedNode.value.events) || [])

// 选中事件，获取当前选中的事件配置
function selectEvent(event: MaterialEvent) {
  activeEvent.value = event
}

// 新增事件
function onAdd() {
  data.value.push({
    title: '',
    name: '未命名',
    type: '',
    code: '',
  })
  // 新增后选中新增那一项
  selectEvent(data.value.at(-1))
}

// 删除事件
function onRemoveEvent(name: string) {
  data.value = data.value.filter(item => item.name !== name)
  selectEvent(null)
}

// 复制节点id
async function copyNodeId(id: string) {
  // 只支持在 https 或 本地开发环境下。其他环境需要做兼容处理
  await navigator.clipboard.writeText(id)
  ElMessage.success('复制成功')
}

// 选中对应事件后，自动在函数体中插入响应代码
function insertDispatchCode(values: string[]) {
  // value 是多维数组，第一层是 node id ，第二层是 event name
  const [id, name] = values
  const code = `\n$context.dispatch('${id}', '${name}')`
  activeEvent.value.code += code
  nextTick(() => {
    dispatchEventValue.value = []
  })
}

defineExpose({
  save() {
    // 更新页面事件
    editorStore.updateNodes(selectedNode.value.id, {
      ...selectedNode.value,
      events: data.value,
    })
  },
})
</script>

<template>
  <div class="node-event-container">
    <div class="node-event-sidebar">
      <el-button type="primary" size="small" @click="onAdd">新增</el-button>
      <div
        class="node-event-item"
        :class="{ active: item.name === activeEvent?.name }"
        v-for="item in data"
        :key="item.name"
        @click="selectEvent(item)"
      >
        <!--    左侧栏显示title    -->
        <span>{{ item.title }}</span>
        <span @click.stop="onRemoveEvent(item.name)">
          <Icon icon="mdi:remove"></Icon>
        </span>
      </div>
    </div>
    <div class="node-event-content">
      <el-form v-if="activeEvent" label-width="70">
        <div class="flex mb-15">
          <el-select class="flex-1 mr-10" placeholder="选中快捷复制节点 ID" @change="copyNodeId">
            <el-option
              v-for="node in nodes"
              :key="node.id"
              :value="node.id"
              :label="node.name"
            ></el-option>
          </el-select>
          <el-cascader
            class="flex-1"
            placeholder="选中快捷插入触发的事件"
            :options="dispatchOptions"
            @change="insertDispatchCode"
            v-model="dispatchEventValue"
          ></el-cascader>
        </div>
        <el-form-item label="标题">
          <el-input v-model="activeEvent.title"></el-input>
        </el-form-item>
        <el-form-item label="函数名">
          <el-input v-model="activeEvent.name"></el-input>
        </el-form-item>
        <el-form-item label="事件类型">
          <!--    allow-create 允许自定义输入事件      -->
          <el-select v-model="activeEvent.type" allow-create filterable>
            <el-option-group v-for="group in eventOptions" :key="group.label" :label="group.label">
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="函数体">
          <div class="function-content flex flex-col w-full bg-[#1e1e1e]">
            <div class="flex-none pl-30">
              function {{ activeEvent.name }} ( $context, $node, $payload )&nbsp;&nbsp;{
            </div>
            <MonacoEditor class="flex-1" v-model="activeEvent.code" lang="javascript" />
            <div class="flex-none pl-30">}</div>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.node-event-container {
  height: 600px;
  display: flex;
  gap: 20px;
  .node-event-sidebar {
    width: 200px;
    border: 1px solid var(--border-color);
    padding: 10px;
    overflow: auto;

    .node-event-item {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      background-color: bg-mix(80);
      margin-top: 10px;
      cursor: pointer;
      &.active {
        background-color: var(--active-bg-color);
      }
    }
  }
  .node-event-content {
    flex: 1;
    border: 1px solid var(--border-color);
    padding: 15px;
    overflow: auto;
    .function-content {
      font-family: Consolas, 'Courier New', monospace;
    }
  }
}
</style>
