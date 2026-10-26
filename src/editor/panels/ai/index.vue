<script setup lang="ts">
import MessageList from './components/MessageList.vue'
import { useStream } from '@langchain/vue'
import { deleteThreadId, getThreadId, setThreadId } from './thread-storage.ts'
import { Icon } from '@iconify/vue'
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import { getAllMaterialSchema } from '@/materials'
import { CanvasSchema, DataSourceSchema } from '@/editor/schema/common.ts'
import { deepClone } from '@/utils'
import { toJSONSchema } from '@/utils/agent-schema.ts'
import { SCHEMA_VERSION } from '@/schema/version.ts'
/* 使用 Vite 的 ?raw 导入类型文件，就能拿到源文件的内容（纯字符串），而不是编译后的代码
   ?raw 导入的值是 TypeScript 源码字符串；后端把它作为提示词发给模型，事件运行时执行的仍是生成的 JavaScript。
*/
import contextTypes from '@/runtime/context-Types.ts?raw'

defineOptions({
  name: 'AiPanel',
})

const message = ref('')

const editorStore = useEditorStore()
const { page, selectedNodeIds } = storeToRefs(editorStore)
const activeRunId = ref<string>(null)
const {
  messages,
  submit,
  isLoading,
  stop,
  client,
  // values 是 langgraph 后端返回的所有 State 数据
  values: langgraphState,
} = useStream({
  apiUrl: 'http://localhost:2024',
  assistantId: 'screen_design_agent',
  transport: 'sse', //默认是sse,也可修改此属性为 websocket。则切换为 websocket 模式
  // 如果本地已经保存过会话 ID，通过设置这个属性，传入历史对话的会话 ID，就能继续使用原来的会话。
  threadId: getThreadId(),
  // 创建新会话后，langchain/vue 会创建一个新的会话 ID，从这个 onThreaId 回调函数能够拿到会话ID。这里将新的会话 ID 写入 localStorage。
  onThreadId: setThreadId,
  onCreated({ runId }) {
    // 创建会话时，会自动创建一个执行id，也就是runId。
    activeRunId.value = runId
  },
})

console.log('messages ==> ', messages)

const editPlan = computed(() => langgraphState.value.editPlan as any)

// 是否展示任务进度折叠面板
const showStep = ref(false)

watch(editPlan, newVal => {
  showStep.value = !!newVal.length
})

const methodMap = {
  add_node: 'addNode',
  update_node: 'updateNodes',
  remove_node: 'removeNode',
  add_data_source: 'addDataSource',
  update_data_source: 'updateDataSource',
}

// 监听 state中 action 发生变化后，调用编辑器已有的 addNode() 方法
watch(
  () => langgraphState.value.actions,
  (actions: any) => {
    console.log('actions ==> ', actions)
    if (!actions.length) return
    // 后端通知前端新增节点后，调用编辑器已有的 addNode() 方法
    for (const action of actions) {
      const actionNode = deepClone(toRaw(action.node))
      // toRaw 是获取被处理成响应式对象的原始数据/对象
      // deepClone 防止新增或修改后的数据导致原始数据被修改，影响由源数据处理过后的响应式数据受影响。所以这里直接进行深拷贝处理
      const method = methodMap[action.type]
      editorStore[method](actionNode)
      if (action.type === 'add_node') {
        editorStore.selectNode(actionNode.id)
      }
    }
  }
)

// 提交用户消息，发起对话
function onSubmit() {
  if (isLoading.value || !message.value) return
  showStep.value = false
  // @ts-ignore
  const version = langgraphState.value.schema?.version
  const requestBody: Record<string, any> = {}
  if (version !== SCHEMA_VERSION) {
    requestBody.schema = {
      version: SCHEMA_VERSION,
      materials: getAllMaterialSchema(),
      canvas: toJSONSchema(CanvasSchema),
      dataSourceSchema: toJSONSchema(DataSourceSchema),
      contextTypes,
    }
  }
  submit({
    // 这里面提交的数据结构和 后端项目 agent-server/agent/state.ts 文件里面的 new StateSchema() 方法里面定义的数据格式保持一致。
    messages: [
      {
        type: 'human',
        content: message.value,
      },
    ],
    page: page.value,
    selectedNodeIds: selectedNodeIds.value,
    dataSources: editorStore.dataSources.map(({ id, name, type, dataDescription }) => ({
      id,
      name,
      type,
      dataDescription,
    })),
    ...requestBody,
  })
  message.value = ''
}

// 输入框按enter事件
function onKeydown(e: KeyboardEvent) {
  // isComposing 判断当前是否是在中文输入法，true表示是，false表示否
  if (e.shiftKey || e.isComposing) return
  onSubmit()
  e.preventDefault()
}

// AI正在回复的停止功能
async function onStop() {
  // 用户停止消息后继续发送消息，需要取消掉上次执行的任务，直接按照用户接下来发送的最新消息进行响应回复。相当于回滚了上次发送的用户消息。
  await client.runs.cancel(getThreadId(), activeRunId.value, true, 'rollback')
}

// 删除当前会话记录
async function onDelete() {
  const id = getThreadId()
  deleteThreadId()
  // 删除 langgraph 后端项目中保存的 会话记录。
  // 会话记录存在  agent-server/.langgraph_api/.langgraphjs_ops.json 中。
  // 其中 .langgraphjs_api.store.json 保存的事长期记忆。.langgraphjs_api.checkpointer.json 存的是会话快照
  id && (await client.threads.delete(id))
  location.reload()
}
</script>

<template>
  <div class="ai-panel h-full select-text">
    <div class="p-20 flex flex-col h-full">
      <el-tooltip content="删除当前会话" placement="bottom" effect="dark">
        <span class="cursor-pointer translate-z-1" style="width: 3%" @click="onDelete">
          <Icon icon="fluent-mdl2:delete"></Icon>
        </span>
      </el-tooltip>
      <MessageList
        class="message-list flex-1"
        :messages="messages"
        :isLoading="isLoading"
      ></MessageList>
      <el-collapse v-if="showStep">
        <el-collapse-item>
          <template #title>
            <div class="pl-20 collapse-title">任务进度</div>
          </template>
          <el-steps
            class="pl-20"
            direction="vertical"
            :active="langgraphState.currentTaskIndex"
            finish-status="success"
            :space="40"
          >
            <el-step v-for="(task, index) in editPlan" :key="index" :title="task.title"></el-step>
          </el-steps>
        </el-collapse-item>
      </el-collapse>
      <footer class="flex flex-col flex-none gap-10">
        <el-input type="textarea" :rows="4" v-model="message" @keydown.enter="onKeydown"></el-input>
        <el-button v-if="!isLoading" type="primary" @click="onSubmit" :loading="isLoading">
          发送
        </el-button>
        <el-button v-else type="danger" @click="onStop">停止</el-button>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-panel,
.collapse-title {
  background: bg-mix(40);
}
.collapse-title {
  position: relative;
}
</style>
