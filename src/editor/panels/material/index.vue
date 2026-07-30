<script setup lang="ts">
import MaterialItem from '@/editor/panels/material/components/MaterialItem.vue'
import { getMaterialByGroup, getMaterialGroups } from '@/materials'

defineOptions({
  name: 'MaterialPanel',
})

// 当前选中的分组
const activeMaterialGroup = ref('info')

const materialGroup = getMaterialGroups()

const currentMaterial = computed(() => {
  return getMaterialByGroup(activeMaterialGroup.value)
})
</script>

<template>
  <div class="material-panel flex">
    <div class="nav w-50">
      <div
        :class="{ active: activeMaterialGroup == item.key }"
        v-for="item in materialGroup"
        :key="item.key"
        @click="activeMaterialGroup = item.key"
      >
        <span>
          <Icon :icon="item.icon" width="16"></Icon>
        </span>
        <span>{{ item.name }}</span>
      </div>
    </div>
    <div class="flex-1 p-10 overflow-auto">
      <MaterialItem
        class="mt-10"
        v-for="item in currentMaterial"
        :key="item.name"
        :material="item"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
//@use '@/styles/functions.scss' as *; //vite.config.ts里配置了这行代码，会默认在每个vue文件的scss代码前面都默认给你添加这行代码，所以不用每次都自己导入
.material-panel {
  background: bg-mix(20);

  .nav {
    border-right: 1px solid var(--border-color);

    div {
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: 50px;
      font-size: 12px;
      &.active {
        background: var(--active-bg-color);
      }
    }
  }
}
</style>
