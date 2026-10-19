<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import MonacoEditor from '@/components/MonacoEditor/index.vue'
import { deepClone } from '@/utils'
import { Icon } from '@iconify/vue'
import { fetchData } from '@/composables/useDataSource.ts'

defineOptions({
  name: 'DataSourceManager',
})

const editorStore = useEditorStore()
const { dataSources } = storeToRefs(editorStore)

const activeSource = ref()

const responseText = ref()

/*
 * 深拷贝数据源
 * 1、data params 这些需要转字符串，因为 Moveable 组件绑定的数据是字符串，所以需要转
 * 2、弹框需要点击确认，才能应用到全局数据源，而不是实时修改的。为了不污染原数据源，所以直接深拷贝一份进行弹窗中编辑使用
 * */
const data = ref(
  deepClone(dataSources.value).map(item => {
    return {
      ...item,
      data: item.data ? JSON.stringify(item.data, null, 2) : undefined,
      params: item.params ? JSON.stringify(item.params, null, 2) : undefined,
    }
  })
)

// 选中数据源，获取当前选中的数据源配置
function selectDataSource(source) {
  activeSource.value = source
}

// 新增数据源
function onAdd() {
  data.value.push({
    id: crypto.randomUUID(),
    name: '未命名',
    type: 'static',
    data: '',
    params: '{}',
    dataDescription: '',
  })
  // 新增后选中新增那一项
  selectDataSource(data.value.at(-1))
}

// 删除数据源
function onRemoveDataSource(id: string) {
  data.value = data.value.filter(item => item.id !== id)
  selectDataSource(null)
}

function onRequest() {
  fetchData({
    ...activeSource.value,
    params: activeSource.value.params ? JSON.parse(activeSource.value.params) : undefined,
  }).then(res => {
    responseText.value = JSON.stringify(res, null, 2)
  })
}

defineExpose({
  save() {
    const _data = deepClone(data.value).map(item => {
      return {
        ...item,
        data: item.data ? JSON.parse(item.data) : undefined,
        params: item.params ? JSON.parse(item.params) : undefined,
      }
    })
    // 更新页面数据源
    editorStore.page.dataSources = _data
  },
})
</script>

<template>
  <div class="data-source-container">
    <div class="data-source-sidebar">
      <el-button type="primary" size="small" @click="onAdd">新增</el-button>
      <div
        class="data-source-item"
        :class="{ active: item.id === activeSource?.id }"
        v-for="item in data"
        :key="item.id"
        @click="selectDataSource(item)"
      >
        <span>{{ item.name }}</span>
        <span @click.stop="onRemoveDataSource(item.id)">
          <Icon icon="mdi:remove"></Icon>
        </span>
      </div>
    </div>
    <div class="data-source-content">
      <el-form v-if="activeSource">
        <el-form-item label="名称">
          <el-input v-model="activeSource.name"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="activeSource.type">
            <el-radio-button label="静态" value="static"></el-radio-button>
            <el-radio-button label="API" value="api"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数据描述">
          <el-input type="textarea" v-model="activeSource.dataDescription"></el-input>
        </el-form-item>
        <el-form-item label="数据" v-if="activeSource.type === 'static'">
          <MonacoEditor v-model="activeSource.data" />
        </el-form-item>
        <div v-else>
          <el-form-item label="请求地址">
            <el-input v-model="activeSource.url"></el-input>
          </el-form-item>
          <el-form-item label="请求方法">
            <el-radio-group v-model="activeSource.method">
              <el-radio-button label="GET" value="get"></el-radio-button>
              <el-radio-button label="POST" value="post"></el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="轮询周期">
            <el-input v-model="activeSource.interval"></el-input>
          </el-form-item>
          <el-form-item label="请求参数">
            <MonacoEditor v-model="activeSource.params" />
          </el-form-item>
          <el-form-item label="响应路径">
            <el-input v-model="activeSource.responsePath" />
          </el-form-item>
          <el-form-item label="请求预览">
            <el-button size="small" type="primary" @click="onRequest">点击请求</el-button>
          </el-form-item>
          <el-form-item label="预览数据">
            <MonacoEditor v-model="responseText"></MonacoEditor>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.data-source-container {
  height: 600px;
  display: flex;
  gap: 20px;
  .data-source-sidebar {
    width: 200px;
    border: 1px solid var(--border-color);
    padding: 10px;
    overflow: auto;

    .data-source-item {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      background-color: bg-mix(80);
      margin-top: 10px;
      cursor: pointer;
      &.active {
        background-color: var(--active-bg-color);
      }
    }
  }
  .data-source-content {
    flex: 1;
    border: 1px solid var(--border-color);
    padding: 15px;
    overflow: auto;
  }
}
</style>
