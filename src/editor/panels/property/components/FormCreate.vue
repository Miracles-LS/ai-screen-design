<script setup lang="ts">
import { ElCheckbox, ElColorPicker, ElInput, ElInputNumber, ElSelect } from 'element-plus'
import { getValue, setValue } from '@/utils'
import { useUndoRedo } from '@/composables/useUndoRedo.ts'
import EditSelectOptins from '@/editor/panels/property/components/EditSelectOptins.vue'

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
  checkbox: ElCheckbox,
  select: ElSelect,
  editSelectOptions: EditSelectOptins,
}

// 为了记录撤销和回退记录，所以用一个方法包装了 setValue
const { applyChange, startBatch, commitBatch } = useUndoRedo()
</script>

<template>
  <el-form class="p-20" size="small" label-width="60">
    <el-row>
      <el-col v-for="item in setters" :key="item.key" :span="item.span">
        <el-form-item :label="item.label">
          <component
            :is="componentMap[item.type]"
            :modelValue="getValue(formData, item.key)"
            v-bind="item.props"
            @update:modelValue="
              newValue => {
                applyChange(formData, item.key, newValue)
              }
            "
            @focus="startBatch"
            @blur="commitBatch"
          ></component>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<style scoped lang="scss"></style>
