<script setup lang="ts">
import { ElColorPicker, ElInput, ElInputNumber } from 'element-plus'
import { getValue, setValue } from '@/utils'

defineOptions({
  name: 'FormCreate',
})

defineProps(['setters', 'formData'])

const componentMap = {
  input: ElInput,
  number: (props, { slots, attrs }) => {
    /*
     * h函数也可动态生成组件。
     * 这里因为 el-input-number 组件想另外设置ui组件库额外的属性值，所以直接这么处理即可，不需要再二次封装el-input-number组件
     *
     * precision属性：表示数值精度为0，也就是取整数。
     */
    return h(ElInputNumber, { precision: 0, ...props }, slots)
  },
  color: ElColorPicker,
}
</script>

<template>
  <el-form class="p-20" size="small" label-width="60">
    <el-row>
      <el-col v-for="item in setters" :key="item.key" :span="item.span">
        <el-form-item :label="item.label">
          <component
            :is="componentMap[item.type]"
            :modelValue="getValue(formData, item.key)"
            @update:modelValue="
              newValue => {
                setValue(formData, item.key, newValue)
              }
            "
          ></component>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<style scoped lang="scss"></style>
