import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

// 主题类型定义
export type ThemeMode = 'light' | 'dark' | 'auto' | 'high-contrast' | 'blue' | 'green' | 'purple' | 'orange' | 'red'

export interface ThemeConfig {
  mode: ThemeMode
  primaryColor?: string
  autoFollowSystem?: boolean
}

// 主题配置
export const THEME_CONFIGS: Record<ThemeMode, { name: string; description: string; primaryColor: string }> = {
  light: {
    name: '浅色主题',
    description: '经典的浅色界面主题',
    primaryColor: '#409EFF'
  },
  dark: {
    name: '暗色主题', 
    description: '护眼的暗色界面主题',
    primaryColor: '#409EFF'
  },
  auto: {
    name: '跟随系统',
    description: '自动跟随系统主题设置',
    primaryColor: '#409EFF'
  },
  'high-contrast': {
    name: '高对比度',
    description: '高对比度主题，提升可访问性',
    primaryColor: '#0066CC'
  },
  blue: {
    name: '蓝色主题',
    description: '清新的蓝色主题',
    primaryColor: '#1890FF'
  },
  green: {
    name: '绿色主题',
    description: '自然的绿色主题',
    primaryColor: '#52C41A'
  },
  purple: {
    name: '紫色主题',
    description: '优雅的紫色主题',
    primaryColor: '#722ED1'
  },
  orange: {
    name: '橙色主题',
    description: '活力的橙色主题',
    primaryColor: '#FA8C16'
  },
  red: {
    name: '红色主题',
    description: '热情的红色主题',
    primaryColor: '#F5222D'
  }
}

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const currentTheme = ref<ThemeMode>('light')
  const isSystemDarkMode = ref(false)
  const themeTransition = ref(false)

  // 计算属性
  const effectiveTheme = computed(() => {
    if (currentTheme.value === 'auto') {
      return isSystemDarkMode.value ? 'dark' : 'light'
    }
    return currentTheme.value
  })

  const themeConfig = computed(() => THEME_CONFIGS[currentTheme.value])

  const isDarkMode = computed(() => {
    return effectiveTheme.value === 'dark' || 
           (currentTheme.value === 'auto' && isSystemDarkMode.value)
  })

  // 初始化主题
  const initTheme = () => {
    // 从本地存储读取主题设置
    const savedTheme = localStorage.getItem('erp-theme') as ThemeMode
    if (savedTheme && THEME_CONFIGS[savedTheme]) {
      currentTheme.value = savedTheme
    }

    // 检测系统主题
    detectSystemTheme()

    // 应用主题
    applyTheme(effectiveTheme.value)

    // 监听系统主题变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    }
  }

  // 检测系统主题
  const detectSystemTheme = () => {
    if (window.matchMedia) {
      isSystemDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  // 处理系统主题变化
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    isSystemDarkMode.value = e.matches
    if (currentTheme.value === 'auto') {
      applyTheme(effectiveTheme.value)
    }
  }

  // 应用主题
  const applyTheme = (theme: ThemeMode) => {
    const root = document.documentElement
    
    // 添加过渡效果
    if (!themeTransition.value) {
      themeTransition.value = true
      root.style.setProperty('--theme-transition', 'all 0.3s ease')
      
      setTimeout(() => {
        themeTransition.value = false
        root.style.removeProperty('--theme-transition')
      }, 300)
    }

    // 设置主题属性
    root.setAttribute('data-theme', theme)
    
    // 更新 Element Plus 主题变量
    updateElementPlusTheme(theme)
    
    // 更新页面标题栏颜色（移动端）
    updateMetaThemeColor(theme)
    
    console.log(`主题已切换到: ${THEME_CONFIGS[theme]?.name || theme}`)
  }

  // 更新 Element Plus 主题变量
  const updateElementPlusTheme = (theme: ThemeMode) => {
    const root = document.documentElement
    const config = THEME_CONFIGS[theme]
    
    if (config?.primaryColor) {
      root.style.setProperty('--el-color-primary', config.primaryColor)
    }

    // 根据主题模式更新其他颜色
    if (theme === 'dark' || (theme === 'auto' && isSystemDarkMode.value)) {
      // 暗色主题的 Element Plus 变量
      root.style.setProperty('--el-bg-color', '#1d1e1f')
      root.style.setProperty('--el-bg-color-page', '#141414')
      root.style.setProperty('--el-text-color-primary', '#e5eaf3')
      root.style.setProperty('--el-text-color-regular', '#cfd3dc')
      root.style.setProperty('--el-border-color', '#4c4d4f')
      root.style.setProperty('--el-fill-color', '#2b2b2c')
    } else {
      // 浅色主题的 Element Plus 变量
      root.style.setProperty('--el-bg-color', '#ffffff')
      root.style.setProperty('--el-bg-color-page', '#f2f3f5')
      root.style.setProperty('--el-text-color-primary', '#303133')
      root.style.setProperty('--el-text-color-regular', '#606266')
      root.style.setProperty('--el-border-color', '#dcdfe6')
      root.style.setProperty('--el-fill-color', '#f0f2f5')
    }
  }

  // 更新移动端状态栏颜色
  const updateMetaThemeColor = (theme: ThemeMode) => {
    let themeColor = '#409EFF' // 默认颜色
    
    if (theme === 'dark' || (theme === 'auto' && isSystemDarkMode.value)) {
      themeColor = '#1d1e1f'
    } else {
      const config = THEME_CONFIGS[theme]
      if (config?.primaryColor) {
        themeColor = config.primaryColor
      }
    }

    // 更新或创建 meta theme-color 标签
    let metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.name = 'theme-color'
      document.head.appendChild(metaThemeColor)
    }
    metaThemeColor.content = themeColor
  }

  // 切换主题
  const setTheme = (theme: ThemeMode) => {
    if (!THEME_CONFIGS[theme]) {
      console.warn(`未知的主题: ${theme}`)
      return
    }

    currentTheme.value = theme
    
    // 保存到本地存储
    localStorage.setItem('erp-theme', theme)
    
    // 应用主题
    applyTheme(effectiveTheme.value)
  }

  // 切换到下一个主题
  const toggleTheme = () => {
    const themes = Object.keys(THEME_CONFIGS) as ThemeMode[]
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  // 获取主题列表
  const getThemeList = () => {
    return Object.entries(THEME_CONFIGS).map(([key, config]) => ({
      value: key as ThemeMode,
      label: config.name,
      description: config.description,
      primaryColor: config.primaryColor
    }))
  }

  // 预览主题（不保存）
  const previewTheme = (theme: ThemeMode) => {
    applyTheme(theme)
  }

  // 取消预览，恢复当前主题
  const cancelPreview = () => {
    applyTheme(effectiveTheme.value)
  }

  // 监听主题变化
  watch(effectiveTheme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    // 状态
    currentTheme,
    isSystemDarkMode,
    themeTransition,
    
    // 计算属性
    effectiveTheme,
    themeConfig,
    isDarkMode,
    
    // 方法
    initTheme,
    setTheme,
    toggleTheme,
    getThemeList,
    previewTheme,
    cancelPreview,
    detectSystemTheme
  }
})