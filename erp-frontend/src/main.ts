import './assets/main.css'
import './styles/theme.scss'
import './styles/web-layout.css'

import { createApp } from 'vue'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { initializeStores } from './stores/config'
const app = createApp(App)

// 初始化状态管理
initializeStores(app, {
  persistence: {
    enabled: true,
    storage: localStorage,
    prefix: 'erp-store',
    serialize: JSON.stringify,
    deserialize: JSON.parse
  },
  debug: {
    enabled: import.meta.env.DEV,
    logActions: true,
    logMutations: true,
    logSubscriptions: false,
    maxLogEntries: 100
  }
})

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(ElementPlus)

// 挂载应用
app.mount('#app')

// 初始化主题系统
setTimeout(async () => {
  const { useThemeStore } = await import('./stores/theme')
  const themeStore = useThemeStore()
  themeStore.initTheme()
  
  // 在开发环境中暴露全局变量用于调试
  if (import.meta.env.DEV) {
    const { useUserStore } = await import('./stores/user')
    ;(window as any).$router = router
    ;(window as any).$userStore = useUserStore()
    ;(window as any).$themeStore = themeStore
    console.log('🚀 调试变量已暴露到window对象: $router, $userStore, $themeStore')
  }
}, 100)
