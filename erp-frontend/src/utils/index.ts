// 工具函数库

/**
 * 格式化日期时间
 * @param date 日期对象或时间戳
 * @param format 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(
  date: Date | string | number | null | undefined,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (!date) return ''
  
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return ''
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @returns 格式化后的日期字符串 YYYY-MM-DD
 */
export function formatDate(date: Date | string | number | null | undefined, format: string = 'YYYY-MM-DD'): string {
  return formatDateTime(date, format)
}

/**
 * 格式化时间
 * @param date 日期对象或时间戳
 * @returns 格式化后的时间字符串 HH:mm:ss
 */
export function formatTime(date: Date | string | number | null | undefined): string {
  return formatDateTime(date, 'HH:mm:ss')
}

/**
 * 格式化金额
 * @param amount 金额
 * @param currency 货币符号，默认 '¥'
 * @param decimals 小数位数，默认 2
 * @returns 格式化后的金额字符串
 */
export function formatCurrency(
  amount: number,
  currency: string = '¥',
  decimals: number = 2
): string {
  if (amount < 0) {
    return '-' + currency + Math.abs(amount).toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '$&,')
  }
  return currency + amount.toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

/**
 * 格式化数字
 * @param num 数字
 * @param decimals 小数位数，默认 0
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param wait 等待时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null
  let previous = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(this, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(this, args)
      }, remaining)
    }
  }
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式（中国大陆）
 * @param phone 手机号
 * @returns 是否有效
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 本地存储工具
 */
export const storage = {
  /**
   * 设置本地存储
   * @param key 键名
   * @param value 值
   * @param expire 过期时间（毫秒）
   */
  set(key: string, value: any, expire?: number): void {
    const data = {
      value,
      expire: expire ? Date.now() + expire : null
    }
    localStorage.setItem(key, JSON.stringify(data))
  },

  /**
   * 获取本地存储
   * @param key 键名
   * @returns 存储的值
   */
  get(key: string): any {
    const item = localStorage.getItem(key)
    if (!item) return null

    try {
      const data = JSON.parse(item)
      if (data.expire && Date.now() > data.expire) {
        localStorage.removeItem(key)
        return null
      }
      return data.value
    } catch (error) {
      localStorage.removeItem(key)
      return null
    }
  },

  /**
   * 删除本地存储
   * @param key 键名
   */
  remove(key: string): void {
    localStorage.removeItem(key)
  },

  /**
   * 清空本地存储
   */
  clear(): void {
    localStorage.clear()
  }
}