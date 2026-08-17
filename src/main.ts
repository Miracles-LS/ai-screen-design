import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './styles/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/dist/index.css'
// 前端模拟请求数据，mock会拦截掉匹配到的请求，走项目里的mock/*.ts
import '@/mock/data.ts'
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
