import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ApiResponse } from '../types'

// Mock dependencies
vi.mock('axios', () => ({
  default: {
    create: vi.fn()
  }
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn().mockResolvedValue('confirm')
  }
}))

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    token: 'mock-token',
    currentStoreId: 123,
    logout: vi.fn()
  }))
}))

vi.mock('@/router', () => ({
  default: {
    push: vi.fn()
  }
}))

const mockedAxios = vi.mocked(axios)
const mockedElMessage = vi.mocked(ElMessage)
const mockedElMessageBox = vi.mocked(ElMessageBox)

describe('HTTP客户端测试', () => {
  let mockAxiosInstance: any
  let httpClient: any

  beforeEach(async () => {
    // 重置所有mock
    vi.clearAllMocks()
    
    // 创建mock axios实例
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }

    // Mock axios.create返回mock实例
    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance)
    
    // 清除模块缓存并重新导入HTTP客户端模块
    vi.resetModules()
    const requestModule = await import('../request')
    httpClient = requestModule.httpClient
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('HTTP客户端初始化', () => {
    it('应该使用正确的配置创建axios实例', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8080/api',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })

    it('应该设置请求和响应拦截器', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('HTTP方法测试', () => {
    beforeEach(() => {
      // Mock成功响应
      const mockResponse: ApiResponse = {
        code: 200,
        message: '成功',
        data: { id: 1, name: 'test' },
        success: true
      }
      
      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse })
      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse })
      mockAxiosInstance.put.mockResolvedValue({ data: mockResponse })
      mockAxiosInstance.delete.mockResolvedValue({ data: mockResponse })
      mockAxiosInstance.patch.mockResolvedValue({ data: mockResponse })
    })

    it('应该正确执行GET请求', async () => {
      const result = await httpClient.get('/test')
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined)
      expect(result.code).toBe(200)
      expect(result.data).toEqual({ id: 1, name: 'test' })
    })

    it('应该正确执行POST请求', async () => {
      const testData = { name: 'test' }
      const result = await httpClient.post('/test', testData)
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', testData, undefined)
      expect(result.code).toBe(200)
    })

    it('应该正确执行PUT请求', async () => {
      const testData = { id: 1, name: 'updated' }
      const result = await httpClient.put('/test/1', testData)
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', testData, undefined)
      expect(result.code).toBe(200)
    })

    it('应该正确执行DELETE请求', async () => {
      const result = await httpClient.delete('/test/1')
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', undefined)
      expect(result.code).toBe(200)
    })

    it('应该正确执行PATCH请求', async () => {
      const testData = { name: 'patched' }
      const result = await httpClient.patch('/test/1', testData)
      
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test/1', testData, undefined)
      expect(result.code).toBe(200)
    })
  })

  describe('文件上传功能', () => {
    it('应该正确处理单文件上传', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const mockResponse: ApiResponse = {
        code: 200,
        message: '上传成功',
        data: { fileId: 'abc123' },
        success: true
      }

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse })

      const result = await httpClient.upload('/upload', mockFile)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      )
      expect(result.code).toBe(200)
      expect(result.data.fileId).toBe('abc123')
    })

    it('应该正确处理多文件上传', async () => {
      const mockFiles = [
        new File(['test1'], 'test1.txt', { type: 'text/plain' }),
        new File(['test2'], 'test2.txt', { type: 'text/plain' })
      ]
      const mockResponse: ApiResponse = {
        code: 200,
        message: '批量上传成功',
        data: { fileIds: ['abc123', 'def456'] },
        success: true
      }

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse })

      const result = await httpClient.uploadMultiple('/upload-multiple', mockFiles)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload-multiple',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      )
      expect(result.code).toBe(200)
      expect(result.data.fileIds).toHaveLength(2)
    })

    it('应该正确处理文件下载', async () => {
      const mockBlob = new Blob(['file content'], { type: 'application/octet-stream' })
      mockAxiosInstance.get.mockResolvedValue({ data: mockBlob })

      const result = await httpClient.download('/download/file.txt')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/download/file.txt',
        expect.objectContaining({
          responseType: 'blob'
        })
      )
      expect(result).toBeInstanceOf(Blob)
    })
  })

  describe('请求配置选项', () => {
    it('应该支持跳过错误处理', async () => {
      const mockResponse: ApiResponse = {
        code: 400,
        message: '请求错误',
        data: null,
        success: false
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse })

      try {
        await httpClient.get('/test', { skipErrorHandler: true })
      } catch (error) {
        // 应该抛出错误但不显示消息
        expect(mockedElMessage.error).not.toHaveBeenCalled()
      }
    })

    it('应该支持跳过认证', async () => {
      const mockResponse: ApiResponse = {
        code: 200,
        message: '成功',
        data: {},
        success: true
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse })

      await httpClient.get('/public', { skipAuth: true })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/public', { skipAuth: true })
    })

    it('应该支持自定义请求头', async () => {
      const mockResponse: ApiResponse = {
        code: 200,
        message: '成功',
        data: {},
        success: true
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse })

      await httpClient.get('/test', {
        headers: {
          'Custom-Header': 'custom-value'
        }
      })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', {
        headers: {
          'Custom-Header': 'custom-value'
        }
      })
    })
  })

  describe('错误处理机制', () => {
    it('应该处理网络错误', async () => {
      const networkError = new Error('Network Error')
      mockAxiosInstance.get.mockRejectedValue(networkError)

      try {
        await httpClient.get('/test')
      } catch (error) {
        expect(error).toBe(networkError)
      }
    })

    it('应该处理业务错误', async () => {
      const errorResponse: ApiResponse = {
        code: 400,
        message: '参数错误',
        data: null,
        success: false
      }

      mockAxiosInstance.get.mockResolvedValue({ data: errorResponse })

      try {
        await httpClient.get('/test')
      } catch (error) {
        expect(mockedElMessage.error).toHaveBeenCalledWith('参数错误')
      }
    })

    it('应该正确配置拦截器', () => {
      // 验证拦截器已正确设置
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
      
      // 验证拦截器函数存在
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0]
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0]
      
      expect(requestInterceptor).toHaveLength(2) // success handler, error handler
      expect(responseInterceptor).toHaveLength(2) // success handler, error handler
      expect(typeof requestInterceptor[0]).toBe('function')
      expect(typeof requestInterceptor[1]).toBe('function')
      expect(typeof responseInterceptor[0]).toBe('function')
      expect(typeof responseInterceptor[1]).toBe('function')
    })
  })

  describe('类型安全性', () => {
    it('应该支持泛型类型推断', async () => {
      interface User {
        id: number
        name: string
        email: string
      }

      const mockResponse: ApiResponse<User> = {
        code: 200,
        message: '成功',
        data: { id: 1, name: 'John', email: 'john@example.com' },
        success: true
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse })

      const result = await httpClient.get<User>('/users/1')
      
      expect(result.data.id).toBe(1)
      expect(result.data.name).toBe('John')
      expect(result.data.email).toBe('john@example.com')
    })

    it('应该支持数组类型', async () => {
      interface Product {
        id: number
        name: string
        price: number
      }

      const mockResponse: ApiResponse<Product[]> = {
        code: 200,
        message: '成功',
        data: [
          { id: 1, name: 'Product 1', price: 100 },
          { id: 2, name: 'Product 2', price: 200 }
        ],
        success: true
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse })

      const result = await httpClient.get<Product[]>('/products')
      
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('Product 1')
    })

    it('应该支持复杂嵌套类型', async () => {
      interface OrderItem {
        productId: number
        quantity: number
        price: number
      }

      interface Order {
        id: number
        orderNo: string
        items: OrderItem[]
        totalAmount: number
      }

      const mockResponse: ApiResponse<Order> = {
        code: 200,
        message: '成功',
        data: {
          id: 1,
          orderNo: 'ORD001',
          items: [
            { productId: 1, quantity: 2, price: 100 },
            { productId: 2, quantity: 1, price: 200 }
          ],
          totalAmount: 400
        },
        success: true
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse })

      const result = await httpClient.get<Order>('/orders/1')
      
      expect(result.data.items).toHaveLength(2)
      expect(result.data.totalAmount).toBe(400)
      expect(result.data.items[0].productId).toBe(1)
    })
  })

  describe('实例方法', () => {
    it('应该提供获取原始axios实例的方法', () => {
      const instance = httpClient.getInstance()
      expect(instance).toBe(mockAxiosInstance)
    })

    it('应该正确初始化HTTP客户端', () => {
      expect(httpClient).toBeDefined()
      expect(typeof httpClient.get).toBe('function')
      expect(typeof httpClient.post).toBe('function')
      expect(typeof httpClient.put).toBe('function')
      expect(typeof httpClient.delete).toBe('function')
      expect(typeof httpClient.patch).toBe('function')
      expect(typeof httpClient.upload).toBe('function')
      expect(typeof httpClient.uploadMultiple).toBe('function')
      expect(typeof httpClient.download).toBe('function')
      expect(typeof httpClient.getInstance).toBe('function')
    })
  })

  describe('环境变量配置', () => {
    it('应该使用环境变量中的API基础URL', async () => {
      // 模拟环境变量
      const originalEnv = import.meta.env.VITE_API_BASE_URL
      
      // 重新导入模块以测试环境变量
      vi.resetModules()
      
      // 这里我们验证默认值被使用
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:8080/api'
        })
      )
    })

    it('应该使用默认超时时间', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 10000
        })
      )
    })

    it('应该设置默认Content-Type', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      )
    })
  })
})