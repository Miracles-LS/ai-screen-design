<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import ScreenRender from '@/components/ScreenRender/index.vue'

defineOptions({
  name: 'ScreenPreview',
})

// 点击预览，从 editorStore 中获取配置
const editorStore = useEditorStore()
const { page } = storeToRefs(editorStore)
</script>

<template>
  <ScreenRender :page="page" />
</template>
