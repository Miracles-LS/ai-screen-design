<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useEditorStore } from '@/stores/editor.ts'
defineOptions({
  name: 'ToolbarLeft',
})
const { pannelVisable } = useEditorStore()
</script>

<template>
  <div class="flex gap-20 tool-right">
    <span
      :class="{ active: pannelVisable.material }"
      @click="pannelVisable.material = !pannelVisable.material"
    >
      <Icon icon="fluent:panel-left-28-filled"></Icon>
    </span>
    <span
      :class="{ active: pannelVisable.property }"
      @click="pannelVisable.property = !pannelVisable.property"
    >
      <Icon icon="fluent:panel-right-28-filled"></Icon>
    </span>
    <span
      :class="{ active: pannelVisable.layer }"
      @click="pannelVisable.layer = !pannelVisable.layer"
    >
      <Icon icon="fluent:layer-20-filled"></Icon>
    </span>
    <span>
      <Icon icon="majesticons:undo-line"></Icon>
    </span>
    <span>
      <Icon icon="majesticons:redo-line"></Icon>
    </span>
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
  }
}
</style>
