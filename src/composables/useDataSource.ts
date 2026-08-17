import type { DataSourceSchema } from '@/schema/page.ts'
import axios from 'axios'
import { getValue } from '@/utils'

export function useDataSource(dataId: Ref<string>) {
  let timer

  let loading = ref(false)
  let error = ref()

  // 全局注入的所有组件数据源
  const dataSources = inject<Ref<DataSourceSchema[]>>('dataSource')

  // 通过注入的所有组件数据源，遍历找到当前正在编辑的组件的数据源，并暴露给外部使用
  /*
   * source:
   *  id
   *  type = static | api
   *  name
   *  data
   * */
  const source = computed(() => {
    return dataSources.value.find(item => item.id === dataId.value)
  })

  // 当前正在编辑的图表组件需要的数据源
  let data = ref()

  // 拿到当前正在编辑的图表组件需要的数据源——用于修改当前图表组件 options 的 dataset
  async function loadData(params?: Record<string, any>) {
    // 取消上一次的定时任务
    clearTimeout(timer)
    if (!source.value) return
    if (source.value.type === 'api') {
      const url = source.value.url
      //  接口请求（利用 mockjs 模拟后端请求数据）
      try {
        // 请求之前，设置loading
        loading.value = true
        data.value = await fetchData(source.value, params)
      } catch (e) {
        error.value = e
      } finally {
        // 请求回来了，取消loading
        loading.value = false
        if (source.value.interval) {
          timer = setTimeout(() => {
            loadData()
          }, source.value.interval)
        }
      }
    } else {
      //  静态数据
      data.value = source.value?.data
    }
  }

  onBeforeMount(() => {
    // 组件销毁之前清理掉定时器
    clearTimeout(timer)
  })

  // 只要数据源发生变化，立即调用 loadData
  watch(
    source,
    () => {
      loadData()
    },
    { immediate: true }
  )

  return {
    data,
    loading,
    error,
    refresh: loadData,
  }
}

// 请求缓存map
// 用于判断是否同时触发了同一请求（url，params，method 都一样），若存在相同请求，限制不重复请求，直接复用
// { "url:'/api/data,params:{a:1},methods:'get'": promise,... }
const requestMap = {}
export async function fetchData(source: DataSourceSchema, otherParams?: Record<string, any>) {
  // 从当前浏览器的url中获取url参数
  const search = new URLSearchParams(location.search)
  // 将获取到的参数转换为对象
  const params = Object.fromEntries(search.entries())
  const queryParams = {
    // 这是写死在代码里的预设参数
    ...source.params,
    // url上带的传参优先级高，可以覆盖预设参数
    ...params,
    // 外部手动调用refresh的传参，优先级更高
    otherParams,
  }
  // 请求方法不同，请求体参数不同
  const paramsKey = source.method === 'get' ? 'params' : 'data'
  const config = {
    url: source.url,
    data: params,
    [paramsKey]: queryParams,
  }
  const key = JSON.stringify(config)
  if (requestMap[key]) {
    // 有缓存，直接返回，不请求了
    return requestMap[key]
  }
  // 没请求过，直接发送请求
  const promise = axios
    .request(config)
    .then(res => {
      return getValue(res.data, source.responsePath)
    })
    .finally(() => {
      delete requestMap[key]
    })
  requestMap[key] = promise
  return promise
}
