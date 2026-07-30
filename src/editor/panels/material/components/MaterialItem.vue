<script setup lang="ts">
defineOptions({
  name: 'MaterialItem',
})

const props = defineProps(['material'])

// 组件开始拖拽事件发送消息给画布
function onDragStart(e: DragEvent) {
  e.dataTransfer?.setData('schema', JSON.stringify(props.material.schema))
}
</script>

<template>
  <div class="material-item" draggable="true" @dragstart="onDragStart">
    <div class="title">{{ material.name }}</div>
    <div class="icon">
      <Icon :icon="material.icon" width="80"></Icon>
    </div>
  </div>
</template>

<style scoped lang="scss">
.material-item {
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: bg-mix(40);
  cursor: pointer;
  margin-top: 10px;
  transition: all 300ms ease-in-out;
  &:hover {
    transform: translateY(-2px);
    border-color: var(--highlight-color);
  }

  .title {
    font-size: 12px;
    font-weight: 700;
  }

  .icon {
    margin-top: 10px;
    flex: 1;
    display: flex;
    justify-content: center;
    border: 1px solid var(--border-color);
    border-radius: 4px;
  }
}
</style>
