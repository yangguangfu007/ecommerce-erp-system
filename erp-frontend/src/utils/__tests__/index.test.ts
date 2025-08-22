import { describe, it, expect } from 'vitest'
import { formatDate, formatCurrency, debounce, throttle } from '@/utils/index'

describe('工具函数测试', () => {
  describe('formatDate', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      expect(formatDate(date)).toBe('2024-01-01')
      expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toMatch(/2024-01-01 \d{2}:\d{2}:\d{2}/)
    })

    it('应该处理无效日期', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
    })
  })

  describe('formatCurrency', () => {
    it('应该正确格式化货币', () => {
      expect(formatCurrency(1234.56)).toBe('¥1,234.56')
      expect(formatCurrency(0)).toBe('¥0.00')
      expect(formatCurrency(-100)).toBe('-¥100.00')
    })

    it('应该支持自定义货币符号', () => {
      expect(formatCurrency(100, '$')).toBe('$100.00')
    })
  })

  describe('debounce', () => {
    it('应该正确防抖', (done) => {
      let count = 0
      const debouncedFn = debounce(() => {
        count++
      }, 100)

      // 快速调用多次
      debouncedFn()
      debouncedFn()
      debouncedFn()

      // 立即检查，应该还没有执行
      expect(count).toBe(0)

      // 等待防抖时间后检查
      setTimeout(() => {
        expect(count).toBe(1)
        done()
      }, 150)
    })
  })

  describe('throttle', () => {
    it('应该正确节流', (done) => {
      let count = 0
      const throttledFn = throttle(() => {
        count++
      }, 100)

      // 快速调用多次
      throttledFn()
      throttledFn()
      throttledFn()

      // 立即检查，应该执行了一次
      expect(count).toBe(1)

      // 等待节流时间后再次调用
      setTimeout(() => {
        throttledFn()
        expect(count).toBe(2)
        done()
      }, 150)
    })
  })
})