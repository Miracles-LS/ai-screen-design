<script setup lang="ts">
import { Icon } from '@iconify/vue'
import MonacoEditor from '@/components/MonacoEditor/index.vue'
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import DataSourceManager from '@/editor/toolbar/components/DataSourceManager.vue'
import { useRouter } from 'vue-router'
import { publishPage } from '@/utils/publish.ts'

defineOptions({
  name: 'ToolbarRight',
})

const editorStore = useEditorStore()
const { page } = storeToRefs(editorStore)

// 属性编辑抽屉
const visible = ref(false)
// 数据源配置弹窗
const dataSourceVisable = ref(false)

const jsonText = ref('')
const fileInputRef = ref()
const dataSourceManagerRef = ref()

const router = useRouter()

function previewJson() {
  // stringify 后面的传参是为了格式化代码
  jsonText.value = JSON.stringify(page.value, null, 2)
  visible.value = true
}

// 导出整个画布的DSL配置
function onExport() {
  const json = JSON.stringify(page.value, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  // 创建文件 blob 的 URL
  const url = URL.createObjectURL(blob)
  // 创建一个a链接，用于文件下载
  const a = document.createElement('a')
  a.href = url
  a.download = 'screen-design.json'
  document.body.appendChild(a)
  // 下载文件
  a.click()
  document.body.removeChild(a)
  //   释放掉 URL,不占内存
  URL.revokeObjectURL(url)
}

// 导入整个画布的DSL配置
function onImport() {
  fileInputRef.value.click()
}

// 导入文件--文件上传
async function onFileChange(e) {
  const file: File = e.target.files[0]
  if (!file) return
  const text = await file.text()
  try {
    const newPage = JSON.parse(text)
    editorStore.setPage(newPage)
    ElMessage.success('文件导入成功')
  } catch {
    ElMessage.error('文件导入失败，请检查文件内容是否 json 格式')
  }
}

// 确定编辑json属性
function onConfirm() {
  const newPage = JSON.parse(jsonText.value)
  editorStore.setPage(newPage)
  visible.value = false
}

// 打开datasource编辑面板
function openDatasource() {
  dataSourceVisable.value = true
}

// 保存datasource编辑代码面板
function onSave() {
  //   这里调用DataSourceManager暴露的方法
  dataSourceManagerRef.value.save()
  dataSourceVisable.value = false
}

// 预览数据大屏页面
function onPreviewPage() {
  router.push('/preview')
}

// 发布数据大屏页面
function onPublish() {
  //   暂无后端api，存到localstorage里
  const id = publishPage(page.value)
  router.push(`/screen?id=${id}`)
}
</script>

<template>
  <div class="flex gap-20 tool-right justify-end">
    <el-tooltip content="预览" placement="bottom" effect="dark">
      <span @click="onPreviewPage">
        <Icon icon="icon-park-outline:preview-open"></Icon>
      </span>
    </el-tooltip>

    <el-tooltip content="发布" placement="bottom" effect="dark">
      <span @click="onPublish">
        <Icon icon="mage:preview"></Icon>
      </span>
    </el-tooltip>

    <el-tooltip content="编辑画布 JSON" placement="bottom" effect="dark">
      <span @click="previewJson">
        <Icon icon="si:json-fill"></Icon>
      </span>
    </el-tooltip>

    <el-tooltip content="组件数据源配置" placement="bottom" effect="dark">
      <span @click="openDatasource">
        <Icon icon="mdi:database"></Icon>
      </span>
    </el-tooltip>

    <el-tooltip content="导入数据大屏配置" placement="bottom" effect="dark">
      <span @click="onImport">
        <Icon icon="mdi:import"></Icon>
      </span>
    </el-tooltip>

    <input ref="fileInputRef" v-show="false" type="file" @change="onFileChange" />

    <el-tooltip content="导出数据大屏配置" placement="bottom" effect="dark">
      <span @click="onExport">
        <Icon icon="mdi:export"></Icon>
      </span>
    </el-tooltip>

    <!--    属性编辑抽屉-->
    <el-drawer destroy-on-close v-model="visible" title="编辑 JSON" size="800">
      <MonacoEditor v-model="jsonText" />
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onConfirm">确认</el-button>
      </template>
    </el-drawer>

    <!--    数据源配置弹窗-->
    <el-dialog destroy-on-close title="数据源配置" v-model="dataSourceVisable" width="800">
      <DataSourceManager ref="dataSourceManagerRef" />
      <template #footer>
        <el-button @click="dataSourceVisable = false">取消</el-button>
        <el-button type="primary" @click="onSave">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.tool-right {
  span {
    padding: 4px;
    border: 1px solid #3b465b;
    border-radius: 4px;
    cursor: pointer;
  }
}
</style>
