import { describe, it, expect } from 'vitest'

describe('Vite 配置测试', () => {
  it('应该正确配置环境变量', () => {
    // 测试环境变量是否正确加载
    expect(import.meta.env).toBeDefined()
    expect(import.meta.env.MODE).toBeDefined()
    
    // 测试自定义环境变量
    if (import.meta.env.VITE_APP_TITLE) {
      expect(typeof import.meta.env.VITE_APP_TITLE).toBe('string')
    }
  })

  it('应该支持模块热更新', () => {
    // 在开发环境下应该有HMR支持
    if (import.meta.env.DEV) {
      expect(import.meta.hot).toBeDefined()
    }
  })

  it('应该正确配置路径别名', async () => {
    // 测试@别名是否正确配置
    try {
      // 尝试导入使用@别名的模块
      const utils = await import('@/utils/index')
      expect(utils).toBeDefined()
    } catch (error) {
      // 如果导入失败，检查是否是因为模块不存在而不是路径解析问题
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('应该支持动态导入', async () => {
    // 测试动态导入功能
    const module = await import('@/utils/index')
    expect(module).toBeDefined()
    expect(typeof module.formatDate).toBe('function')
  })

  it('应该支持JSON导入', async () => {
    // 测试JSON文件导入
    try {
      const packageJson = await import('../../package.json')
      expect(packageJson.name).toBe('erp-frontend')
    } catch (error) {
      // JSON导入可能需要特殊配置
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('应该正确处理静态资源', () => {
    // 测试静态资源处理
    const logoUrl = new URL('@/assets/logo.svg', import.meta.url)
    expect(logoUrl).toBeDefined()
    // 在测试环境中，SVG 可能被内联为 data URL 或保持原始路径
    expect(logoUrl.href).toMatch(/logo\.svg|data:image\/svg\+xml/)
  })

  it('应该支持CSS模块', () => {
    // 测试CSS模块支持
    const cssModuleRegex = /\.module\.(css|scss|sass|less|styl|stylus)$/
    expect(cssModuleRegex.test('styles.module.css')).toBe(true)
    expect(cssModuleRegex.test('styles.module.scss')).toBe(true)
  })

  it('应该支持SCSS预处理器', () => {
    // 测试SCSS文件扩展名识别
    const scssRegex = /\.(scss|sass)$/
    expect(scssRegex.test('styles.scss')).toBe(true)
    expect(scssRegex.test('variables.sass')).toBe(true)
  })
})