/**
 * 测试工具函数
 * 提供测试中常用的工具和 mock 函数
 */

import { vi } from 'vitest'

// Mock document 对象
export const mockDocument = {
  documentElement: {
    setAttribute: vi.fn(),
    className: 'existing-class theme-light',
    lang: 'zh-CN'
  }
}

// Mock window 对象
export const mockWindow = {
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  sessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
}

// 设置全局 mock
export const setupGlobalMocks = () => {
  // Mock document
  Object.defineProperty(global, 'document', {
    value: mockDocument,
    writable: true
  })

  // Mock window
  Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true
  })

  // Mock localStorage
  Object.defineProperty(global, 'localStorage', {
    value: mockWindow.localStorage,
    writable: true
  })

  // Mock sessionStorage
  Object.defineProperty(global, 'sessionStorage', {
    value: mockWindow.sessionStorage,
    writable: true
  })
}

// 清理 mock
export const cleanupMocks = () => {
  vi.clearAllMocks()
  mockDocument.documentElement.className = 'existing-class theme-light'
  mockDocument.documentElement.lang = 'zh-CN'
}