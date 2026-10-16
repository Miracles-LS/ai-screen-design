<script setup lang="ts">
import { Icon } from '@iconify/vue'
import MarkdownRender from 'markstream-vue'
import 'markstream-vue/index.css'

defineOptions({
  name: 'MessageList',
})

const props = defineProps(['messages', 'isLoading'])

const visibleMessage = computed(() => {
  const lastIndex = props.messages.length - 1
  return props.messages.filter((item, index) => {
    return item.text || (lastIndex === index && props.isLoading)
  })
})

const messageContainerRef = useTemplateRef('messageContainer')
const messageListRef = useTemplateRef('messageList')
let isScroll = true

// 用户主动触发滚动事件
function onScroll() {
  const el = messageContainerRef.value
  if (!el) return
  // 判断用户当前滚动位置是否靠近列表的底部，若远离底部则不自动向下滚动。默认是让列表永远保持自动滚动到列表底部，保证用户始终看到最新内容。当滚动的位置接近底部50px的时候就触发自动滚动
  isScroll = el.scrollHeight - el.scrollTop - el.clientHeight <= 50
}

const showAiLoading = computed(() => {
  if (!props.isLoading) return false
  // 最后一条消息不是 ai 类型，且是在 loading 状态，才需要显示AI回复消息的 ... 状态
  return props.messages.at(-1)?.type !== 'ai'
})

onMounted(() => {
  const resizeObserver = new ResizeObserver(() => {
    // 监听到消息列表的高度发生变化后，自动滚动到最底部，保证用户始终能看到最新消息

    const el = messageContainerRef.value
    if (!isScroll || !el) return
    // 滚动到底部
    el.scrollTop = el.scrollHeight
  })
  if (messageListRef.value) {
    resizeObserver.observe(messageListRef.value)
  }
  onBeforeUnmount(() => {
    resizeObserver.disconnect()
  })
})
</script>

<template>
  <div
    ref="messageContainer"
    class="message-container h-full overflow-auto -m-20 p-20 pb-40"
    @scroll="onScroll"
  >
    <div ref="messageList" class="flex flex-col gap-10 overflow-auto">
      <div
        class="message-box flex messages-center gap-10 py-10"
        :class="`message-box-${message.type}`"
        v-for="message in visibleMessage"
        :key="message.id"
      >
        <el-avatar :size="30" class="flex">
          <Icon width="18" :icon="message.type === 'human' ? 'ri:user-fill' : 'ri:ai'"></Icon>
        </el-avatar>
        <div class="message-content">
          <MarkdownRender
            v-if="message.text"
            :content="message.text"
            :code-block-props="{ showCopyButton: true }"
            :render-code-blocks-as-pre="false"
            mode="chat"
            html-policy="escape"
            :final="true"
          />
          <!--
              render-code-blocks-as-pre 默认是true。使用原生的标签来渲染代码块。false的话就用 stream-diffs 来渲染代码块。

              html-policy：碰到有html标签的内容是把他当成html代码执行还是以文本的形式展示。 escape 就是当文本展示。

              final：代码块是否自闭合
              -->
          <span v-else class="typing">...</span>
        </div>
      </div>
      <div v-if="showAiLoading" class="message-box message-box-ai flex gap-10">
        <el-avatar :size="28">AI</el-avatar>
        <div class="message-content">
          <span class="typing">...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.message-box {
  .message-content {
    max-width: 85%;
    background-color: #024c50;
    padding: 8px 10px;
    border-radius: 6px 12px 12px 12px;
    .typing {
      animation: typing-animation 1s infinite ease-in-out;
    }
  }
  &-human {
    flex-direction: row-reverse;
    .message-content {
      background-color: #3a8c91;
      border-radius: 12px 6px 12px 12px;
    }
  }
  @keyframes typing-animation {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }
}
</style>
