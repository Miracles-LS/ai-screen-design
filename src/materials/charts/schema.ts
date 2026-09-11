// src/materials/charts/schema.ts
import { JsonObjectSchema, NodeBaseSchema } from '@/editor/schema/common.ts'
import { z } from 'zod'

//region 图表 位置 的 schema
// .union() 联合类型的数组——要么是 number，要么是enum 枚举
const PositionSchema = z
  .union([z.number(), z.enum(['left', 'center', 'right'])])
  .describe('图表元素的位置，可以是像素值或左中右枚举')
//endregion

//region 图表 title 的 schema
const ChartTitleSchema = z
  .object({
    text: z.string().describe('图表标题展示的文字'),
    top: z.union([z.number(), z.string()]).optional().describe('标题距容器顶部的位置'),
    left: PositionSchema.optional().describe('标题的水平位置'),
    textStyle: JsonObjectSchema.optional().describe('ECharts 标题文字样式'),
  })
  .describe('ECharts 标题配置')
//endregion

//region 图表 图例 的 schema
const ChartLegendSchema = z
  .object({
    top: z.union([z.number(), z.string()]).describe('图例距容器顶部的位置'),
    left: PositionSchema.describe('图例的水平位置'),
    itemWidth: z.number().describe('图例标记宽度'),
    itemHeight: z.number().describe('图例标记高度'),
    show: z.boolean().describe('是否显示图例'),
    textStyle: JsonObjectSchema.describe('ECharts 图例文字样式'),
  })
  .partial()
  .describe('ECharts 图例配置')
// .partial() 表示 这个对象里面的所有属性都是可选的
//endregion

//region 图表 数据源 的 schema
const ChartDatasetSchema = z
  .object({
    source: z.array(JsonObjectSchema).describe('ECharts dataset 的行数据；每个对象代表一条记录'),
  })
  .describe('ECharts 内置数据集')
//endregion

//region 图表 grid 的 schema
const ChartGridSchema = z
  .object({
    top: z.number().describe('绘图区上边距'),
    right: z.number().describe('绘图区右边距'),
    bottom: z.number().describe('绘图区下边距'),
    left: z.number().describe('绘图区左边距'),
    containLabel: z.boolean().describe('绘图区是否包含坐标轴标签'),
  })
  .partial()
  .describe('直角坐标系绘图区配置')
//endregion

//region 图表 options 的 schema
export const ChartOptionSchema = z
  .object({
    color: z.array(z.string()).optional().describe('图表系列颜色列表'),
    title: ChartTitleSchema,
    legend: ChartLegendSchema.optional(),
    tooltip: JsonObjectSchema.optional().describe('ECharts 提示框配置'),
    dataset: ChartDatasetSchema.optional(),
    grid: ChartGridSchema.optional(),
    xAxis: JsonObjectSchema.optional().describe('ECharts X 轴配置'),
    yAxis: JsonObjectSchema.optional().describe('ECharts Y 轴配置'),
    series: z
      .array(JsonObjectSchema)
      .min(1)
      .describe('ECharts 系列列表，包含真实 type、encode 和样式'),
  })
  .describe('当前图表物料使用的 ECharts Option')
//endregion

//region 图表 config 的 schema
export const ChartConfigSchema = z
  .object({
    props: z
      .object({
        option: ChartOptionSchema,
      })
      .describe('图表物料的业务属性'),
  })
  .describe('图表物料独有的 props 配置')
//endregion

// 由于图表的 schema 是通用的。所以 z.literal(type) 的type 不像文本 schema 一样不写死。导出一个函数通过传参来处理具体哪种类型的图表
export function createChartNodeSchema(
  type: 'bar-chart' | 'line-chart' | 'area-chart' | 'pie-chart'
) {
  return NodeBaseSchema.extend({
    type: z.literal(type).describe('图表物料的注册类型'),
    props: z
      .object({
        option: ChartOptionSchema,
      })
      .describe('图表物料组件的 props 属性'),
  })
}
