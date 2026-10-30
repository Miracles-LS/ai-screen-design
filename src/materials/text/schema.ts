// src/materials/text/schema.ts
import { NodeBaseSchema } from '@/editor/schema/common.ts'
import { z } from 'zod'

// TextSchema 继承  NodeBaseSchema，在 NodeBaseSchema 基础上继续扩展自己的属性要求
export const TextSchema = NodeBaseSchema.extend({
  // .literal('text') type 只能是 ‘text’
  type: z.literal('text').describe('文本物料类型。'),
  style: z.object({
    color: z.string().default('#fff').describe('文本颜色,默认值为 #fff。文字默认颜色为白色'),
    fontSize: z.number().default(20).describe('文本字号，默认是20px'),
  }),
  props: z.object({
    content: z
      .string()
      .describe(
        '文本物料实际展示的文字内容；真实字段是 props.content。不是显示html代码，是用户要求要显示的文字内容。'
      ),
  }),
})
