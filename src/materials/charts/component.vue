<script setup lang="ts">
import type { MaterialSchema } from '@/schema/material.ts'
import { init, type EChartsType } from 'echarts'
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import type { DataSourceSchema } from '@/schema/page.ts'
import { useDataSource } from '@/composables/useDataSource.ts'
defineOptions({
  name: 'ChartMaterial',
})

// const editorStore = useEditorStore()
// const { dataSources } = storeToRefs(editorStore)
/*
 * 数据大屏物料状态/数据来源 实际上有以下两种场景：
 * 1. 编辑数据大屏时的状态 => 编辑器在用的时候
 * 2. 预览和发布后的状态 => 渲染器在用的时候
 *
 * 所以这里 dataSources 的数据不能写死统一从 pinia 的 store 中拿，可以通过 provide 和 inject 全局注入和取出数据源的方式。
 * 由于这里是编辑物料组件的状态，所以这里是在 @/src/editor/index 页面入口处注入数据源
 * */
const props = defineProps<{ schema: MaterialSchema }>()

const chartRef = useTemplateRef('chartRef')

let chart: EChartsType = null

const dataId = computed(() => props.schema.dataId)

const { data, loading, refresh } = useDataSource(dataId)

const option = computed(() => {
  const _option = props.schema.props.option
  return {
    ..._option,
    dataset: {
      ..._option.dataset,
      // 重写 source，如果数据源中存在这份数据，就使用，否则使用自带的
      source: data.value || _option?.dataset?.source,
    },
  }
})

watch(
  option,
  newVal => {
    chart.setOption(newVal)
  },
  {
    deep: true,
  }
)

onMounted(() => {
  chart = init(chartRef.value)
  chart.setOption(option.value)

  const observer = new ResizeObserver(() => {
    // chart 这个元素发生尺寸变化后，重新渲染图表
    chart.resize()
  })
  observer.observe(chartRef.value)

  onBeforeMount(() => {
    observer.disconnect()
    chart.dispose()
  })
})

defineExpose({
  refresh,
})
</script>

<template>
  <div v-loading="loading" class="chart-material w-full h-full" ref="chartRef"></div>
</template>

<style scoped lang="scss"></style>
