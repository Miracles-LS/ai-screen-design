export function debounce(fn, ms) {
  let timer
  return function (this, ...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, ms)
  }
}

/*
 * let obj = {
 *   prop:{
 *     content:1
 *   }
 * }
 *
 *  获取多层嵌套对象的具体某个key值
 *  target => obj
 *  key => 'prop.content’
 *
 *  getValue(obj,'prop.content');
 * */
export function getValue(target, key) {
  // 'props.content'
  const keys = key.split('.') // ['prop','content']
  while (keys.length) {
    const key = keys.shift() //shift() 可拿到数组的第一个元素，并改变原数组（将第一项元素剔除）
    target = target[key]
  }
  return target
}

/*
 * 设置多层嵌套对象的具体某个key值
 * setValue(obj,'prop.content',2);
 * */
export function setValue(target, key, value) {
  // 'props.content'
  const keys = key.split('.') // ['prop','content']
  const lastKey = keys.pop() //拿到最后一个key值，并改变了原数组（将最后一项元素剔除）
  const _target = getValue(target, keys.join('.'))
  _target[lastKey] = value
}
