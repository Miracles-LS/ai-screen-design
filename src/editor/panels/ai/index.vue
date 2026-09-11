<script setup lang="ts">
import MessageList from './components/MessageList.vue'
import { useStream } from '@langchain/vue'
import { deleteThreadId, getThreadId, setThreadId } from './thread-storage.ts'
import { Icon } from '@iconify/vue'
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import { getAllMaterialSchema } from '@/materials'
import { CanvasSchema } from '@/editor/schema/common.ts'
import { deepClone } from '@/utils'

defineOptions({
  name: 'AiPanel',
})

const message = ref('')

const editorStore = useEditorStore()
const { page, selectedNodeIds } = storeToRefs(editorStore)

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
})

// 监听 state中 action 发生变化后，调用编辑器已有的 addNode() 方法
watch(
  () => langgraphState.value.action,
  (action: any) => {
    console.log('action ==> ', action)
    if (!action) return
    const actionNode = deepClone(toRaw(action.node))
    // 后端通知前端新增节点后，调用编辑器已有的 addNode() 方法
    if (action.type === 'add_node') {
      // toRaw 是获取被处理成响应式对象的原始数据/对象
      // deepClone 防止新增或修改后的数据导致原始数据被修改，影响由源数据处理过后的响应式数据受影响。所以这里直接进行深拷贝处理
      editorStore.addNode(actionNode)
      editorStore.selectNode(actionNode.id)
    } else if (action.type === 'update_node') {
      editorStore.updateNodes(actionNode.id, actionNode)
    } else if (action.type === 'delete_node') {
      editorStore.removeNode(actionNode)
    }
  }
)

function onSubmit() {
  if (isLoading.value || !message.value) return
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
    schema: {
      materials: getAllMaterialSchema(),
      canvas: CanvasSchema.toJSONSchema(),
    },
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
function onStop() {
  stop()
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
  <div class="ai-panel">
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
.ai-panel {
  background: bg-mix(40);
}
</style>
