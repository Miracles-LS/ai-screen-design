import type { PageSchema } from '@/schema/page.ts'

// 存到 localstorage 中的 key
const SCREEN_PUBLISH = 'screen-published'

/*
 * SCREEN_PUBLISH 存储的结构
 * {
 *   ‘123’，JSON.stringify(page),
 *   ‘456’，JSON.stringify(page),
 * }
 * */

// 发布页面
export function publishPage(page: PageSchema) {
  let value: string | Record<string, PageSchema> = localStorage.getItem(SCREEN_PUBLISH)
  if (value) {
    value = JSON.parse(value)
  } else {
    value = {}
  }
  // 如果 page.id 存在，直接用，否则创建 uuid
  const id = page.id || crypto.randomUUID()
  value[id] = page
  page.id = id
  localStorage.setItem(SCREEN_PUBLISH, JSON.stringify(value))
  return id
}

// 获取发布页面的page配置
export function getPublishedPage(id: string) {
  const value = localStorage.getItem(SCREEN_PUBLISH)
  if (value) {
    const map = JSON.parse(value)
    const page = map[id]
    if (!page) {
      // localstorage 里面没有这个id
      throw new Error(`数据库里面没查到id为${id}的数据`)
    }
    return page
  }
}
