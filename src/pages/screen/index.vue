<script setup lang="ts">
import ScreenRender from '@/components/ScreenRender/index.vue'
import { getPublishedPage } from '@/utils/publish.ts'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'ScreenPage',
})

const route = useRoute()

const id = route.query.id

// 从 localstorage 中获取配置。工作中从后台获取
const page = getPublishedPage(id as string)
</script>

<template>
  <ScreenRender :page="page" />
</template>
