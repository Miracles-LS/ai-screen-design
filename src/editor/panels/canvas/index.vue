<script setup lang="ts">
import { getMaterialComponent } from '@/materials'
import Moveable from 'vue3-moveable'
import Selector from 'vue3-selecto'
import SketchRuler from 'vue3-sketch-ruler'
import 'vue3-sketch-ruler/lib/style.css'
import { useEditorStore } from '@/stores/editor.ts'
import { storeToRefs } from 'pinia'
import { useCanvasRuler } from './composable/useCanvasRuler.ts'
import { useMoveable } from './composable/useMoveable.ts'
import { useSelection } from './composable/useSelection.ts'

defineOptions({
  name: 'CanvasRoot',
})

const moveableRef = useTemplateRef('moveable')
const stageRef = useTemplateRef('stage')
const canvasRootRef = useTemplateRef('canvasRoot')

const editorStore = useEditorStore()

const { nodes } = storeToRefs(editorStore)

// 获取当前组件实例
// const vm = getCurrentInstance()

// 组合式函数导入 selecto 组件相关的方法和变量
const { selectedTarget, onSelect, onClearSelected, onSelectEnd } = useSelection({
  moveableRef,
  stageRef,
})

// 组合式函数导入 画布和SketchRuler 组件相关的方法和变量
const {
  canvasWidth,
  canvasHeight,
  canvasStyle,
  rectWidth,
  rectHeight,
  sketchRulerLines,
  sketchRuleScale,
  palette,
  getNodeStyle,
  onRulerZoomChange,
  onDrop,
  onDropdownCommand,
} = useCanvasRuler({ canvasRootRef, moveableRef, selectedTarget })

// 组合式函数导入 Moveable 组件相关的方法和变量
const {
  onMoveableDrag,
  onMoveableResize,
  onMoveableDragGroup,
  onMoveableResizeGroup,
  onStart,
  onEnd,
} = useMoveable(moveableRef)
</script>

<template>
  <div class="canvas-root" ref="canvasRoot">
    <!--    标尺卡  -->
    <SketchRuler
      v-model:scale="sketchRuleScale"
      :palette="palette"
      :thick="20"
      :width="rectWidth"
      :height="rectHeight"
      :canvasWidth="canvasWidth"
      :canvasHeight="canvasHeight"
      :lines="sketchRulerLines"
      @zoomchange="onRulerZoomChange"
    >
      <!--   画布   -->
      <div
        ref="stage"
        class="canvas-stage"
        :style="canvasStyle"
        @dragover.prevent
        @drop="onDrop"
        @mousedown.self="onClearSelected"
      >
        <el-dropdown
          v-for="(node, index) in nodes"
          :key="node.id"
          trigger="contextmenu"
          @command="onDropdownCommand"
        >
          <div
            class="canvas-node"
            :data-node-id="node.id"
            :data-node-locked="node.locked"
            :style="getNodeStyle(node, index)"
            @mousedown="onSelect(node, $event)"
          >
            <component :is="getMaterialComponent(node.type)" :schema="node"></component>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="copy">复制</el-dropdown-item>
              <el-dropdown-item command="remove">移除</el-dropdown-item>
              <el-dropdown-item command="moveTop">置顶</el-dropdown-item>
              <el-dropdown-item command="moveBottom">置底</el-dropdown-item>
              <el-dropdown-item command="toggleLock">
                {{ node.locked ? '解锁' : '锁定' }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </SketchRuler>
    <!--  可支持多选组件，指定可选中的区域，区域范围内的元素均可鼠标长按出现选框而被选中  -->
    <!--    selectFromInside属性：表示选中元素时是否可选区  -->
    <Selector
      v-if="stageRef"
      :container="stageRef"
      :dragContainer="stageRef"
      :toggleContinueSelect="'shift'"
      :selectFromInside="false"
      :selectableTargets="['.canvas-node']"
      @selectEnd="onSelectEnd"
    />
    <!--  选中组件后支持移动和缩放的组件，通过dom元素注册  -->
    <Moveable
      ref="moveable"
      :target="selectedTarget"
      :draggable="true"
      @drag="onMoveableDrag"
      @dragStart="onStart"
      @dragEnd="onEnd"
      @dragGroup="onMoveableDragGroup"
      @dragGroupStart="onStart"
      @dragGroupEnd="onEnd"
      :resizable="true"
      @resize="onMoveableResize"
      @resizeStart="onStart"
      @resizeEnd="onEnd"
      @resizeGroup="onMoveableResizeGroup"
      @resizeGroupStart="onStart"
      @resizeGroupEnd="onEnd"
      :origin="false"
    />
  </div>
</template>

<style scoped lang="scss">
.canvas-root {
  position: relative;
  overflow: hidden;
  /*  为了处理 moveable 组件的选框的不会覆盖到 物料、布局、属性面板。
  *   isolation 创建新的层级上下文，相当于原 moveable 组件设置的层级关系只会作用于 .canvas-root 这个div层级内部，不会影响到  .canvas-root 外层的层级关系
  */
  isolation: isolate;
  .canvas-stage {
    position: relative;
    width: 900px;
    height: 600px;
    .canvas-node {
      position: absolute;
    }
  }
}
</style>
