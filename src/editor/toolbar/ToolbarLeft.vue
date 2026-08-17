<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useEditorStore } from '@/stores/editor.ts'
import { useUndoRedo } from '@/composables/useUndoRedo.ts'
defineOptions({
  name: 'ToolbarLeft',
})
const { pannelVisable } = useEditorStore()

const { undo, redo, canUndo, canRedo } = useUndoRedo()
</script>

<template>
  <div class="flex gap-20 tool-right">
    <el-tooltip content="物料" placement="bottom" effect="dark">
      <span
        :class="{ active: pannelVisable.material }"
        @click="pannelVisable.material = !pannelVisable.material"
      >
        <Icon icon="fluent:panel-left-28-filled"></Icon>
      </span>
    </el-tooltip>

    <el-tooltip content="图层" placement="bottom" effect="dark">
      <span
        :class="{ active: pannelVisable.layer }"
        @click="pannelVisable.layer = !pannelVisable.layer"
      >
        <Icon icon="fluent:layer-20-filled"></Icon>
      </span>
    </el-tooltip>

    <el-tooltip content="属性" placement="bottom" effect="dark">
      <span
        :class="{ active: pannelVisable.property }"
        @click="pannelVisable.property = !pannelVisable.property"
      >
        <Icon icon="fluent:panel-right-28-filled"></Icon>
      </span>
    </el-tooltip>

    <el-tooltip content="撤销" placement="bottom" effect="dark">
      <span @click="undo" :class="{ disabled: !canUndo }">
        <Icon icon="majesticons:undo-line"></Icon>
      </span>
    </el-tooltip>
    <el-tooltip content="回退" placement="bottom" effect="dark">
      <span @click="redo" :class="{ disabled: !canRedo }">
        <Icon icon="ic:baseline-redo"></Icon>
      </span>
    </el-tooltip>
  </div>
</template>

<style scoped lang="scss">
.tool-right {
  span {
    padding: 4px;
    border: 1px solid #3b465b;
    border-radius: 4px;
    cursor: pointer;
    &.active {
      background-color: #42577e;
    }
    &.disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
}
</style>
