<script setup lang="ts">
defineOptions({
  name: 'SelectMaterialComponent',
})

const props = defineProps(['schema'])

const cStyle = computed(() => {
  const style = props.schema.style
  return {
    ...style,
    fontSize: style.fontSize + 'px',
  }
})

function onChange(value) {
  console.log('value ==> ', value)
}
</script>

<template>
  <div>
    <el-select
      :filterable="true"
      v-model="schema.props.modelValue"
      v-bind="schema.props"
      @change="onChange"
    ></el-select>
  </div>
</template>

<style scoped lang="scss"></style>
