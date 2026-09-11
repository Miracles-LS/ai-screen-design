const THREAD_ID_KEY = 'ai_screen_design:threadId'

// 获取对话id
export function getThreadId() {
  return localStorage.getItem(THREAD_ID_KEY)
}

// 保存对话id
export function setThreadId(threadId: string) {
  localStorage.setItem(THREAD_ID_KEY, threadId)
}

// 删除会话id
export function deleteThreadId() {
  localStorage.removeItem(THREAD_ID_KEY)
}
