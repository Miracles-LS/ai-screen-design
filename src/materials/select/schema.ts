// src/materials/text/schema.ts
import { NodeBaseSchema } from '@/editor/schema/common.ts'
import { z } from 'zod'

// TextSchema 继承  NodeBaseSchema，在 NodeBaseSchema 基础上继续扩展自己的属性要求
export const SelectSchema = NodeBaseSchema.extend({
  // .literal('select') type 只能是 ‘select’
  type: z.literal('select').describe('文本物料类型。'),
  style: z.object({
    color: z.string().describe('文本颜色。'),
    fontSize: z.number().describe('文本字号，单位为像素。'),
  }),
  props: z.object({
    content: z.string().describe('文本物料实际展示的文字内容；真实字段是 props.content'),
  }),
})
