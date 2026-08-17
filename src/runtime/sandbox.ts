/*
 * 控制组件事件配置里的函数体代码，运行在沙箱环境。
 * 目的是控制用户不影响系统上的核心代码执行。例如不能清除掉用户的cookie，localstorage 的内容等等
 */

// 全局白名单。表示沙箱环境下可以访问的全局属性
// 【想让什么属性能够使用或者访问的就往 globalKeys 里自定义增加属性名】
import { ElMessage } from 'element-plus'

const globalKeys = new Set(['console', 'Promise'])

export function runSandbox(code: string, scope: Record<string, any>): void {
  // 对象上默认都有 Symbol.unscopables 这个对象。若这个对象上有属性且值为true，则表示排除掉 这些属性，也就是访问不到这些属性
  // obj[Symbol.unscopables] = {
  //   // 排除掉b属性，也就是 obj.b 访问不到，会报错
  //   b: true,
  // }

  // 创建个代理对象
  const sandboxProxy = new Proxy(scope, {
    // 这里has方法强制返回true。
    // 目的就是控制所有语句包括在window上的属性都走代理对象的逻辑。代理对象里的方法默认会优先执行 has 方法，由于 has 方法这里强制返回了true，所以默认控制所有语句和属性默认都走 代理对象 的处理逻辑，默认执行完 has() 方法判断后再执行 get() 方法
    has() {
      return true
    },
    get(target, key) {
      // 由于访问对象上的属性默认都会优先访问 Symbol.unscopables 这个属性，所以直接过滤掉
      if (key === 'Symbol.unscopables') return
      // 判断 访问的 key 属性是否存在于 target 上，也就是当前代理对象上
      if (Object.hasOwn(target, key)) {
        return target[key as string]
      }

      //   由于强制控制了所有 js 语句都执行这里的 get()，所以需要处理这些逻辑，避免报错。
      //   例如 with 语句里面执行了 console.log ，但是 console 这个属性是挂载在 window（浏览器环境） 或 globalThis（node环境） 上才有，并非在代理对象上的，所以需要将 console 指向 对应位置，才能正常执行语句。
      if (globalKeys.has(key as string)) {
        const value = globalThis[key as string]
        // 怕访问 window 上的方法会丢失this，所以兼容处理下方法的this指向
        return typeof value === 'function' ? value.bind(globalThis) : value
      }
    },
  })

  // 创建函数（创建函数的另外一种方式）
  const fn = new Function(
    'object',
    `const asyncFn = async ()=>{
      with (object) {
        ${code}
      }
    }
    asyncFn()
    `
  )
  // 执行函数
  try {
    fn(sandboxProxy)
  } catch (e) {
    console.error(e)
    ElMessage.error('执行了未被允许的 JavaScript 语句，请修正')
  }
}
