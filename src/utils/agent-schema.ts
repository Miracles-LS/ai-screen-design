import type { ZodType } from 'zod'

// 重写 zod 的 toJSONSchema 方法，删除 propertyNames 字段
export function toJSONSchema(schema: ZodType) {
  return schema.toJSONSchema({
    // override 是覆写 jsonSchema
    override({ jsonSchema }) {
      // 因为 propertyNames 这个字段千问里面的特殊字段，千问里面要求这个字段必须是对象类型。但是我们在处理 Echarts 图表属性的时候不经意加了这个字段，但是我们的zod规则是字段统一是string类型，也包括了 propertyNames 这个字段，与 千问的要求冲突了，所以这里需要删除这个字段。
      delete jsonSchema.propertyNames
    },
  })
}
