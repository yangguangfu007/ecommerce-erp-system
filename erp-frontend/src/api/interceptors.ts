import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import type { ApiResponse } from './types'

/**
 * 请求拦截器配置
 * 处理认证token、店铺ID等请求头信息
 */
export const requestInterceptor = {
  /**
   * 请求成功拦截器
   * @param config - Axios请求配置
   * @returns 处理后的请求配置
   */
  onFulfilled: (config: AxiosRequestConfig & { skipAuth?: boolean }): AxiosRequestConfig => {
    const userStore = useUserStore()
    
    // 确保headers对象存在
    if (!config.headers) {
      config.headers = {}
    }

    // 添加认证token
    if (!config.skipAuth && userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }

    // 添加店铺ID到请求头
    if (userStore.currentStoreId) {
      config.headers['X-Store-Id'] = userStore.currentStoreId.toString()
    }

    // 添加请求时间戳
    config.headers['X-Request-Time'] = Date.now().toString()

    // 添加请求ID用于追踪
    config.headers['X-Request-Id'] = generateRequestId()

    return config
  },

  /**
   * 请求失败拦截器
   * @param error - 请求错误
   * @returns 拒绝的Promise
   */
  onRejected: (error: AxiosError): Promise<AxiosError> => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
}

/**
 * 响应拦截器配置
 * 处理业务错误和HTTP状态码错误
 */
export const responseInterceptor = {
  /**
   * 响应成功拦截器
   * @param response - Axios响应对象
   * @returns 处理后的响应
   */
  onFulfilled: (response: AxiosResponse<ApiResponse>): AxiosResponse<ApiResponse> => {
    const { data, config } = response
    
    // 统一处理业务错误
    if (data.code !== 200 && !(config as any).skipErrorHandler) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message)) as any
    }

    return response
  },

  /**
   * 响应失败拦截器
   * @param error - 响应错误
   * @returns 拒绝的Promise
   */
  onRejected: (error: AxiosError): Promise<AxiosError> => {
    const { response, config } = error

    // 如果配置了跳过错误处理，则不显示错误消息
    if (!(config as any)?.skipErrorHandler) {
      handleHttpError(error)
    }

    return Promise.reject(error)
  }
}

/**
 * HTTP错误处理函数
 * @param error - Axios错误对象
 */
export function handleHttpError(error: AxiosError): void {
  const { response } = error
  const userStore = useUserStore()

  // 网络错误
  if (!response) {
    ElMessage.error('网络连接失败，请检查网络设置')
    return
  }

  // HTTP状态码错误处理
  switch (response.status) {
    case 400:
      ElMessage.error('请求参数错误')
      break
    case 401:
      // 未授权，需要重新登录
      handleUnauthorized(userStore)
      break
    case 403:
      ElMessage.error('没有权限访问该资源')
      break
    case 404:
      ElMessage.error('请求的资源不存在')
      break
    case 408:
      ElMessage.error('请求超时')
      break
    case 422:
      // 数据验证错误
      handleValidationError(response.data as any)
      break
    case 429:
      ElMessage.error('请求过于频繁，请稍后再试')
      break
    case 500:
      ElMessage.error('服务器内部错误')
      break
    case 502:
      ElMessage.error('网关错误')
      break
    case 503:
      ElMessage.error('服务暂时不可用')
      break
    case 504:
      ElMessage.error('网关超时')
      break
    default:
      ElMessage.error(response.data?.message || `请求失败 (${response.status})`)
  }
}

/**
 * 处理401未授权错误
 * @param userStore - 用户状态管理
 */
function handleUnauthorized(userStore: any): void {
  ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning',
    closeOnClickModal: false,
    closeOnPressEscape: false
  }).then(() => {
    userStore.logout()
    router.push('/login')
  }).catch(() => {
    // 用户取消登录，可以选择跳转到首页或保持当前页面
    console.log('用户取消重新登录')
  })
}

/**
 * 处理422数据验证错误
 * @param errorData - 错误数据
 */
function handleValidationError(errorData: any): void {
  if (errorData?.errors && Array.isArray(errorData.errors)) {
    // 显示所有验证错误
    errorData.errors.forEach((err: any) => {
      ElMessage.error(`${err.field}: ${err.message}`)
    })
  } else if (errorData?.message) {
    ElMessage.error(errorData.message)
  } else {
    ElMessage.error('数据验证失败')
  }
}

/**
 * 生成请求ID
 * @returns 唯一的请求ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 请求重试配置
 */
export interface RetryConfig {
  /** 重试次数 */
  retries: number
  /** 重试延迟（毫秒） */
  retryDelay: number
  /** 需要重试的HTTP状态码 */
  retryCondition?: (error: AxiosError) => boolean
}

/**
 * 默认重试配置
 */
export const defaultRetryConfig: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // 网络错误或5xx服务器错误时重试
    return !error.response || (error.response.status >= 500 && error.response.status < 600)
  }
}

/**
 * 请求重试拦截器
 * @param config - 重试配置
 * @returns 拦截器函数
 */
export function createRetryInterceptor(config: RetryConfig = defaultRetryConfig) {
  return (error: AxiosError): Promise<any> => {
    const { retries, retryDelay, retryCondition } = config
    const axiosConfig = error.config as any

    // 如果没有配置或不满足重试条件，直接拒绝
    if (!axiosConfig || !retryCondition?.(error)) {
      return Promise.reject(error)
    }

    // 初始化重试计数
    axiosConfig.__retryCount = axiosConfig.__retryCount || 0

    // 如果重试次数已达上限，拒绝请求
    if (axiosConfig.__retryCount >= retries) {
      return Promise.reject(error)
    }

    // 增加重试计数
    axiosConfig.__retryCount += 1

    // 延迟后重试
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(error.config)
      }, retryDelay)
    }).then(config => {
      // 使用原始axios实例重新发送请求
      return error.config?.adapter?.(config as any)
    })
  }
}

/**
 * 请求缓存配置
 */
export interface CacheConfig {
  /** 缓存时间（毫秒） */
  ttl: number
  /** 缓存键生成函数 */
  keyGenerator?: (config: AxiosRequestConfig) => string
}

/**
 * 简单的内存缓存实现
 */
class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>()

  set(key: string, data: any, ttl: number): void {
    const expiry = Date.now() + ttl
    this.cache.set(key, { data, expiry })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }
}

export const memoryCache = new MemoryCache()

/**
 * 创建缓存拦截器
 * @param config - 缓存配置
 * @returns 拦截器函数
 */
export function createCacheInterceptor(config: CacheConfig) {
  const { ttl, keyGenerator = defaultKeyGenerator } = config

  return {
    request: (axiosConfig: AxiosRequestConfig): AxiosRequestConfig => {
      // 只缓存GET请求
      if (axiosConfig.method?.toLowerCase() === 'get') {
        const cacheKey = keyGenerator(axiosConfig)
        const cachedData = memoryCache.get(cacheKey)
        
        if (cachedData) {
          // 返回缓存的数据
          return Promise.resolve(cachedData) as any
        }
        
        // 将缓存键添加到配置中，供响应拦截器使用
        ;(axiosConfig as any).__cacheKey = cacheKey
      }
      
      return axiosConfig
    },
    
    response: (response: AxiosResponse): AxiosResponse => {
      const cacheKey = (response.config as any).__cacheKey
      if (cacheKey && response.status === 200) {
        memoryCache.set(cacheKey, response, ttl)
      }
      return response
    }
  }
}

/**
 * 默认缓存键生成函数
 * @param config - Axios配置
 * @returns 缓存键
 */
function defaultKeyGenerator(config: AxiosRequestConfig): string {
  const { url, params } = config
  const paramStr = params ? JSON.stringify(params) : ''
  return `${url}?${paramStr}`
}