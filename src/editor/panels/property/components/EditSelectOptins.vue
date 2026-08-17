<script setup lang="ts">
defineOptions({
  name: 'EditSelectOptins',
})

const props = defineProps(['modelValue'])

const options = props.modelValue

function onAdd() {
  options.push({
    label: '',
    value: '',
  })
}

function onDelete(index) {
  options.splice(index, 1)
}
</script>

<template>
  <div>
    <div class="mb-10">
      <el-button size="small" type="primary" @click="onAdd">新增选项</el-button>
    </div>
    <div class="flex mb-10" v-for="(option, index) in options" :key="index">
      <div class="flex-1 mr-10">
        <el-input placeholder="选项名" v-model="option.label"></el-input>
      </div>
      <div class="flex-1 mr-5">
        <el-input placeholder="选项值" v-model="option.value"></el-input>
      </div>
      <div>
        <el-button size="small" type="danger" @click="onDelete(index)">删除</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
