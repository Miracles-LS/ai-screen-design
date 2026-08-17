/*市面上撤销重做常见的实现方案有以下两种
1、备忘录模式：原理是将修改后的内容进行深拷贝后存起来，也就是存快照。缺点：比较浪费空间。因为需要将修改后的所有内容都存起来，很占内存。
2、命令模式【优选】：是保存修改操作的基础信息，例如记录修改的元素，修改了该元素的什么属性，修改前的值是什么，修改后的值是什么。
 => {target:某个数据,key:某个数据的key值,newValue:新值, oldValue:老值}

 本项目用的就是命令模式
 */
import { setValue, getValue } from '@/utils'

// shallowReactive 只关心浅层数据变化，index或length的变化，数组里面元素发生变动不会关心，这么处理的好处是节约性能。
const undoStack = shallowReactive([])
const redoStack = shallowReactive([])
// 撤销栈的最大容量，超出则从头部删除
const MAX_HISTORY_LENGTH = 2

export function useUndoRedo() {
  const canUndo = computed(() => {
    return undoStack.length > 0
  })
  const canRedo = computed(() => redoStack.length > 0)

  // 当前要开始记录批量操作的数组
  let activeBatch = null

  // 开始按批次处理，记录批量操作，也就是将记录添加到当前批量操作的数组中（activeBatch）
  // 【组件聚焦时开始记录，组件失焦时结束记录】————其实就是每当一个组件开始编辑时，给这个组件编辑的所有操作都可以生成一个批量操作数组，不编辑这个组件时就结束当前组件的批量操作。
  function startBatch() {
    activeBatch = []
  }

  // 这批批量操作已处理完，将当前记录的批量操作数组添加到撤销栈内
  function commitBatch() {
    if (activeBatch?.length > 0) {
      pushRecord(activeBatch)
    }
    activeBatch = null
  }

  // 如果撤销栈已超出最大值，则把撤销栈最前面的第一条记录移除掉，也就是撤销不回第一条记录了。控制栈的存储大小
  // 没有超出最大值则记录到栈内
  function pushRecord(record) {
    undoStack.push(record)
    if (undoStack.length > MAX_HISTORY_LENGTH) {
      undoStack.shift()
    }
  }

  // 修改属性的操作，并记录到撤销记录，方便后续的撤销和回退操作。
  function applyChange(target, key: string, newValue) {
    // 改变之前的旧值
    const oldValue = getValue(target, key)
    // 如果新值和老值是一样的，则不需要执行修改函数
    if (oldValue === newValue) return
    const record = {
      target,
      key,
      oldValue,
      newValue,
    }
    if (activeBatch) {
      // 当前是对同一个组件的批量操作
      // 1、先判断当前批量操作数组中是否有相同要修改的target和key
      const _record = activeBatch.find(item => item.target === target && item.key === key)
      if (_record) {
        // 2、如果有，只需要将那条记录修改后的newValue一直更新为最新要修改的值，这样要修改的相同target记录永远只会存在一条。在执行撤销操作时直接从最新值回退到初始值，节约代码执行性能。
        _record.newValue = newValue
      } else {
        // 3、如果没有，也就是第一次修改，则就把操作记录到批量操作的栈里
        activeBatch.push(record)
      }
    } else {
      // 不是在批量操作，则只添加一个操作到撤销栈内
      pushRecord([record])
    }
    setValue(target, key, newValue)
    // 每一次赋值都重新将回退的记录清空。回退的记录只会保存每一次撤销的操作
    redoStack.length = 0
  }

  // 撤销操作
  function undo() {
    const records = undoStack.pop()
    if (!records) return
    // 将records数据进行反转再添加进数据
    // toReversed()：这是新js的新api，原api reverse()会修改原数组的结构，toReversed不会修改元素组结构，返回结果为新数组。
    records.toReversed().forEach(record => {
      const { target, key, oldValue } = record
      // 撤销就是恢复到上一次的旧值
      setValue(target, key, oldValue)
    })

    // 放入回退的栈中
    redoStack.push(records)
  }

  // 回退操作
  function redo() {
    const records = redoStack.pop()
    if (!records) return
    records.forEach(record => {
      const { target, key, newValue } = record
      // 回退就是恢复到上一次的新值
      setValue(target, key, newValue)
    })

    // 放入撤销的栈中
    pushRecord(records)
  }

  return {
    canUndo,
    canRedo,
    applyChange,
    undo,
    redo,
    startBatch,
    commitBatch,
  }
}
