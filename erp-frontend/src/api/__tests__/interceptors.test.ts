import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ApiResponse } from '../types'

// Mock dependencies
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn(() => Promise.resolve('confirm'))
  }
}))

const mockUserStore = {
  token: 'test-token',
  currentStoreId: 123,
  logout: vi.fn()
}

const mockRouter = {
  push: vi.fn()
}

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore
}))

vi.mock('@/router', () => ({
  default: mockRouter
}))

const mockedElMessage = vi.mocked(ElMessage)
const mockedElMessageBox = vi.mocked(ElMessageBox)

describe('API拦截器功能测试', () => {
  let requestInterceptor: any
  let responseInterceptor: any
  let handleHttpError: any
  let createRetryInterceptor: any
  let createCacheInterceptor: any
  let memoryCache: any
  let defaultRetryConfig: any

  beforeEach(async () => {
    vi.clearAllMocks()
    // 重新导入模块以确保mock生效
    const interceptorsModule = await import('../interceptors')
    requestInterceptor = interceptorsModule.requestInterceptor
    responseInterceptor = interceptorsModule.responseInterceptor
    handleHttpError = interceptorsModule.handleHttpError
    createRetryInterceptor = interceptorsModule.createRetryInterceptor
    createCacheInterceptor = interceptorsModule.createCacheInterceptor
    memoryCache = interceptorsModule.memoryCache
    defaultRetryConfig = interceptorsModule.defaultRetryConfig
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('请求拦截器测试', () => {
    it('应该添加认证token到请求头', () => {
      const config: AxiosRequestConfig = {
        url: '/test',
        headers: {}
      }

      const result = requestInterceptor.onFulfilled(config)

      expect(result.headers?.Authorization).toBe('Bearer test-token')
    })

    it('应该添加店铺ID到请求头', () => {
      const config: AxiosRequestConfig = {
        url: '/test',
        headers: {}
      }

      const result = requestInterceptor.onFulfilled(config)

      expect(result.headers?.['X-Store-Id']).toBe('123')
    })

    it('应该添加请求时间戳', () => {
      const config: AxiosRequestConfig = {
        url: '/test',
        headers: {}
      }

      const result = requestInterceptor.onFulfilled(config)

      expect(result.headers?.['X-Request-Time']).toBeDefined()
      expect(typeof result.headers?.['X-Request-Time']).toBe('string')
    })

    it('应该添加请求ID', () => {
      const config: AxiosRequestConfig = {
        url: '/test',
        headers: {}
      }

      const result = requestInterceptor.onFulfilled(config)

      expect(result.headers?.['X-Request-Id']).toBeDefined()
      expect(result.headers?.['X-Request-Id']).toMatch(/^req_\d+_[a-z0-9]+$/)
    })

    it('应该支持跳过认证', () => {
      const config: AxiosRequestConfig & { skipAuth?: boolean } = {
        url: '/public',
        headers: {},
        skipAuth: true
      }

      const result = requestInterceptor.onFulfilled(config)

      expect(result.headers?.Authorization).toBeUndefined()
    })

    it('应该处理没有token的情况', () => {
      // 临时修改mock用户store
      const originalToken = mockUserStore.token
      mockUserStore.token = ''

      const config: AxiosRequestConfig = {
        url: '/test',
        headers: {}
      }

      const result = requestInterceptor.onFulfilled(config)

      expect(result.headers?.Authorization).toBeUndefined()

      // 恢复原始token
      mockUserStore.token = originalToken
    })

    it('应该处理没有店铺ID的情况', () => {
      // 临时修改mock用户store
      const originalStoreId = mockUserStore.currentStoreId
      mockUserStore.currentStoreId = 0

      const config: AxiosRequestConfig = {
        url: '/test',
        headers: {}
      }

      const result = requestInterceptor.onFulfilled(config)

      expect(result.headers?.['X-Store-Id']).toBeUndefined()

      // 恢复原始店铺ID
      mockUserStore.currentStoreId = originalStoreId
    })

    it('应该处理请求错误', async () => {
      const error = new Error('Request failed') as AxiosError
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        await requestInterceptor.onRejected(error)
      } catch (rejectedError) {
        expect(rejectedError).toBe(error)
        expect(consoleSpy).toHaveBeenCalledWith('请求拦截器错误:', error)
      }

      consoleSpy.mockRestore()
    })
  })

  describe('响应拦截器测试', () => {
    it('应该处理成功响应', () => {
      const response: AxiosResponse<ApiResponse> = {
        data: {
          code: 200,
          message: '成功',
          data: { id: 1 },
          success: true
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      const result = responseInterceptor.onFulfilled(response)

      expect(result).toBe(response)
      expect(mockedElMessage.error).not.toHaveBeenCalled()
    })

    it('应该处理业务错误响应', async () => {
      const response: AxiosResponse<ApiResponse> = {
        data: {
          code: 400,
          message: '参数错误',
          data: null,
          success: false
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      }

      await expect(async () => {
        await responseInterceptor.onFulfilled(response)
      }).rejects.toThrow('参数错误')

      expect(mockedElMessage.error).toHaveBeenCalledWith('参数错误')
    })

    it('应该支持跳过错误处理', () => {
      const response: AxiosResponse<ApiResponse> = {
        data: {
          code: 400,
          message: '参数错误',
          data: null,
          success: false
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { skipErrorHandler: true } as any
      }

      const result = responseInterceptor.onFulfilled(response)

      expect(result).toBe(response)
      expect(mockedElMessage.error).not.toHaveBeenCalled()
    })

    it('应该处理响应错误', async () => {
      const error: AxiosError = {
        name: 'AxiosError',
        message: 'Request failed',
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({})
      }

      try {
        await responseInterceptor.onRejected(error)
      } catch (rejectedError) {
        expect(rejectedError).toBe(error)
      }
    })

    it('应该支持跳过响应错误处理', async () => {
      const error: AxiosError = {
        name: 'AxiosError',
        message: 'Request failed',
        config: { skipErrorHandler: true } as any,
        isAxiosError: true,
        toJSON: () => ({})
      }

      try {
        await responseInterceptor.onRejected(error)
      } catch (rejectedError) {
        expect(rejectedError).toBe(error)
        // 验证没有调用错误处理
        expect(mockedElMessage.error).not.toHaveBeenCalled()
      }
    })
  })

  describe('HTTP错误处理测试', () => {
    it('应该处理网络错误', () => {
      const error: AxiosError = {
        name: 'AxiosError',
        message: 'Network Error',
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({})
      }

      handleHttpError(error)

      expect(mockedElMessage.error).toHaveBeenCalledWith('网络连接失败，请检查网络设置')
    })

    it('应该处理400错误', () => {
      const error: AxiosError = {
        name: 'AxiosError',
        message: 'Bad Request',
        config: {} as any,
        response: {
          status: 400,
          data: { message: '请求参数错误' },
          statusText: 'Bad Request',
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      }

      handleHttpError(error)

      expect(mockedElMessage.error).toHaveBeenCalledWith('请求参数错误')
    })

    it('应该处理401未授权错误', async () => {
      const error: AxiosError = {
        name: 'AxiosError',
        message: 'Unauthorized',
        config: {} as any,
        response: {
          status: 401,
          data: { message: '未授权' },
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      }

      // 等待异步操作完成
      await new Promise(resolve => {
        handleHttpError(error)
        setTimeout(resolve, 0)
      })

      expect(mockedElMessageBox.confirm).toHaveBeenCalledWith(
        '登录已过期，请重新登录',
        '提示',
        expect.objectContaining({
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        })
      )
    })

    it('应该处理403权限错误', () => {
      const error: AxiosError = {
        name: 'AxiosError',
        message: 'Forbidden',
        config: {} as any,
        response: {
          status: 403,
          data: { message: '权限不足' },
          statusText: 'Forbidden',
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      }

      handleHttpError(error)

      expect(mockedElMessage.error).toHaveBeenCalledWith('没有权限访问该资源')
    })

    it('应该处理404错误', () => {
      const error: AxiosError = {
        name: 'AxiosError',
        message: 'Not Found',
        config: {} as any,
        response: {
          status: 404,
          data: { message: '资源不存在' },
          statusText: 'Not Found',
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      }

      handleHttpError(error)

      expect(mockedElMessage.error).toHaveBeenCalledWith('请求的资源不存在')
    })

    it('应该处理422验证错误', () => {
      const error: AxiosError = {
        name: 'AxiosError',
        message: 'Unprocessable Entity',
        config: {} as any,
        response: {
          status: 422,
          data: {
            errors: [
              { field: 'email', message: '邮箱格式不正确' },
              { field: 'password', message: '密码长度不能少于6位' }
            ]
          },
          statusText: 'Unprocessable Entity',
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      }

      handleHttpError(error)

      expect(mockedElMessage.error).toHaveBeenCalledWith('email: 邮箱格式不正确')
      expect(mockedElMessage.error).toHaveBeenCalledWith('password: 密码长度不能少于6位')
    })

    it('应该处理500服务器错误', () => {
      const error: AxiosError = {
        name: 'AxiosError',
        message: 'Internal Server Error',
        config: {} as any,
        response: {
          status: 500,
          data: { message: '服务器内部错误' },
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      }

      handleHttpError(error)

      expect(mockedElMessage.error).toHaveBeenCalledWith('服务器内部错误')
    })

    it('应该处理其他HTTP错误', () => {
      const error: AxiosError = {
        name: 'AxiosError',
        message: 'Unknown Error',
        config: {} as any,
        response: {
          status: 418,
          data: { message: '我是茶壶' },
          statusText: "I'm a teapot",
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      }

      handleHttpError(error)

      expect(mockedElMessage.error).toHaveBeenCalledWith('我是茶壶')
    })
  })

  describe('重试拦截器测试', () => {
    it('应该创建重试拦截器', () => {
      const retryInterceptor = createRetryInterceptor()
      expect(typeof retryInterceptor).toBe('function')
    })

    it('应该使用默认重试配置', () => {
      expect(defaultRetryConfig.retries).toBe(3)
      expect(defaultRetryConfig.retryDelay).toBe(1000)
      expect(typeof defaultRetryConfig.retryCondition).toBe('function')
    })

    it('应该正确判断重试条件', () => {
      const networkError: AxiosError = {
        name: 'AxiosError',
        message: 'Network Error',
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({})
      }

      const serverError: AxiosError = {
        name: 'AxiosError',
        message: 'Server Error',
        config: {} as any,
        response: {
          status: 500,
          data: {},
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      }

      const clientError: AxiosError = {
        name: 'AxiosError',
        message: 'Client Error',
        config: {} as any,
        response: {
          status: 400,
          data: {},
          statusText: 'Bad Request',
          headers: {},
          config: {} as any
        },
        isAxiosError: true,
        toJSON: () => ({})
      }

      expect(defaultRetryConfig.retryCondition!(networkError)).toBe(true)
      expect(defaultRetryConfig.retryCondition!(serverError)).toBe(true)
      expect(defaultRetryConfig.retryCondition!(clientError)).toBe(false)
    })
  })

  describe('缓存拦截器测试', () => {
    beforeEach(() => {
      memoryCache.clear()
    })

    it('应该创建缓存拦截器', () => {
      const cacheInterceptor = createCacheInterceptor({ ttl: 5000 })
      expect(cacheInterceptor).toHaveProperty('request')
      expect(cacheInterceptor).toHaveProperty('response')
      expect(typeof cacheInterceptor.request).toBe('function')
      expect(typeof cacheInterceptor.response).toBe('function')
    })

    it('应该正确设置和获取缓存', () => {
      const testData = { id: 1, name: 'test' }
      const cacheKey = 'test-key'
      const ttl = 5000

      memoryCache.set(cacheKey, testData, ttl)
      const cachedData = memoryCache.get(cacheKey)

      expect(cachedData).toEqual(testData)
    })

    it('应该正确处理过期缓存', (done) => {
      const testData = { id: 1, name: 'test' }
      const cacheKey = 'test-key'
      const ttl = 100 // 100ms

      memoryCache.set(cacheKey, testData, ttl)

      setTimeout(() => {
        const cachedData = memoryCache.get(cacheKey)
        expect(cachedData).toBeNull()
        done()
      }, 150)
    })

    it('应该正确清除缓存', () => {
      const testData = { id: 1, name: 'test' }
      const cacheKey = 'test-key'
      const ttl = 5000

      memoryCache.set(cacheKey, testData, ttl)
      expect(memoryCache.get(cacheKey)).toEqual(testData)

      memoryCache.clear()
      expect(memoryCache.get(cacheKey)).toBeNull()
    })
  })

  describe('拦截器集成测试', () => {
    it('应该正确导出所有拦截器功能', () => {
      expect(requestInterceptor).toBeDefined()
      expect(responseInterceptor).toBeDefined()
      expect(handleHttpError).toBeDefined()
      expect(createRetryInterceptor).toBeDefined()
      expect(createCacheInterceptor).toBeDefined()
      expect(memoryCache).toBeDefined()
      expect(defaultRetryConfig).toBeDefined()
    })

    it('应该正确处理拦截器链', () => {
      // 测试请求拦截器
      const config: AxiosRequestConfig = {
        url: '/test',
        headers: {}
      }

      const processedConfig = requestInterceptor.onFulfilled(config)
      expect(processedConfig.headers?.Authorization).toBe('Bearer test-token')

      // 测试响应拦截器
      const response: AxiosResponse<ApiResponse> = {
        data: {
          code: 200,
          message: '成功',
          data: { id: 1 },
          success: true
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: processedConfig as any
      }

      const processedResponse = responseInterceptor.onFulfilled(response)
      expect(processedResponse).toBe(response)
    })
  })
})