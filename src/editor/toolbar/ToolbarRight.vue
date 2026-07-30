<script setup lang="ts">
import { Icon } from '@iconify/vue'
defineOptions({
  name: 'ToolbarRight',
})
</script>

<template>
  <div class="flex gap-20 tool-right justify-end">
    <span class="active">
      <Icon icon="qlementine-icons:preview-16"></Icon>
    </span>
    <span>
      <Icon icon="si:json-duotone"></Icon>
    </span>
    <span>
      <Icon icon="entypo:publish"></Icon>
    </span>
    <span>
      <Icon icon="mdi:import"></Icon>
    </span>
    <span>
      <Icon icon="mdi:export"></Icon>
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
