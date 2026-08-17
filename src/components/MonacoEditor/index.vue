<script setup lang="ts">
import { editor } from 'monaco-editor'
// import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
// import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
// import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

defineOptions({
  name: 'MonacoEditor',
})

// window.MonacoEnvironment = {
//   getWorker(_, label) {
//     if (label === 'json') return new JsonWorker()
//     if (label === 'typescript' || label === 'javascript') return new TsWorker()
//     return new EditorWorker()
//   },
// }

const editorElement = ref()

// 从外部接收编辑器的自定义配置
const props = defineProps<{ lang?: string }>()

// 从外部接收编辑器里面的内容
const modelValue = defineModel<string>()

let instance
onMounted(() => {
  // 创建编辑器的实例
  instance = editor.create(editorElement.value, {
    value: modelValue.value,
    theme: 'vs-dark',
    language: props.lang || 'json',
    fontSize: 14,
    tabSize: 2,
    // 自适应父节点的宽高
    automaticLayout: true,
  })
  // 监听编辑器里面的内容更新，实时更新modelvalue的值
  instance.onDidChangeModelContent(() => {
    modelValue.value = instance.getValue()
  })
  onBeforeMount(() => {
    // 组件销毁
    instance.dispose()
  })
})

watch(modelValue, newVale => {
  if (newVale === instance.getValue()) return
  instance.setValue(newVale)
})
</script>

<template>
  <div class="editor-container" ref="editorElement"></div>
</template>

<style scoped lang="scss">
.editor-container {
  width: 100%;
  min-height: 500px;
  height: 100%;
}
</style>
