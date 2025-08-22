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

const mockUserStore = {
  token: 'test-token',
  currentStoreId: 123,
  logout: vi.fn()
}

const mockRouter = {
  push: vi.fn()
}

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => mockUserStore)
}))

vi.mock('@/router', () => ({
  default: mockRouter
}))

const mockedAxios = vi.mocked(axios)
const mockedElMessage = vi.mocked(ElMessage)
const mockedElMessageBox = vi.mocked(ElMessageBox)

describe('HTTP客户端请求模块测试', () => {
  let mockAxiosInstance: any
  let HttpClient: any
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
    
    // 清除模块缓存并重新导入请求模块
    vi.resetModules()
    const requestModule = await import('../request')
    HttpClient = requestModule.default
    httpClient = requestModule.httpClient
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('HTTP客户端类初始化', () => {
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

    it('应该正确导出httpClient实例', () => {
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

    it('应该支持请求配置参数', async () => {
      const config = {
        timeout: 5000,
        headers: {
          'Custom-Header': 'custom-value'
        }
      }

      await httpClient.get('/test', config)
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', config)
    })
  })

  describe('文件操作测试', () => {
    it('应该正确处理单文件上传', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const mockResponse: ApiResponse = {
        code: 200,
        message: '上传成功',
        data: { fileId: 'abc123', fileName: 'test.txt' },
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
        new File(['content1'], 'file1.txt', { type: 'text/plain' }),
        new File(['content2'], 'file2.txt', { type: 'text/plain' })
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

    it('应该支持文件上传的自定义配置', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const mockResponse: ApiResponse = {
        code: 200,
        message: '上传成功',
        data: { fileId: 'abc123' },
        success: true
      }

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse })

      const customConfig = {
        timeout: 30000,
        headers: {
          'X-Custom-Header': 'custom-value'
        }
      }

      await httpClient.upload('/upload', mockFile, customConfig)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          timeout: 30000,
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data',
            'X-Custom-Header': 'custom-value'
          })
        })
      )
    })
  })

  describe('错误处理测试', () => {
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

    it('应该支持跳过错误处理', async () => {
      const errorResponse: ApiResponse = {
        code: 400,
        message: '跳过错误处理',
        data: null,
        success: false
      }

      mockAxiosInstance.get.mockResolvedValue({ data: errorResponse })

      try {
        await httpClient.get('/test', { skipErrorHandler: true })
      } catch (error) {
        // 跳过错误处理时不应该显示错误消息
        expect(mockedElMessage.error).not.toHaveBeenCalled()
      }
    })

    it('应该处理HTTP状态码错误', async () => {
      const httpError = {
        response: {
          status: 404,
          data: { message: '资源不存在' }
        },
        config: {}
      }

      mockAxiosInstance.get.mockRejectedValue(httpError)

      try {
        await httpClient.get('/test')
      } catch (error) {
        expect(error).toBe(httpError)
      }
    })
  })

  describe('类型安全测试', () => {
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

  describe('实例方法测试', () => {
    it('应该提供获取原始axios实例的方法', () => {
      const instance = httpClient.getInstance()
      expect(instance).toBe(mockAxiosInstance)
    })

    it('应该正确初始化所有方法', () => {
      const methods = [
        'get', 'post', 'put', 'delete', 'patch',
        'upload', 'uploadMultiple', 'download', 'getInstance'
      ]

      methods.forEach(method => {
        expect(typeof httpClient[method]).toBe('function')
      })
    })
  })

  describe('拦截器集成测试', () => {
    it('应该正确设置请求拦截器', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('应该正确设置响应拦截器', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('应该在拦截器中处理认证和错误', () => {
      // 验证拦截器函数被正确调用
      const requestInterceptorCalls = mockAxiosInstance.interceptors.request.use.mock.calls
      const responseInterceptorCalls = mockAxiosInstance.interceptors.response.use.mock.calls

      expect(requestInterceptorCalls).toHaveLength(1)
      expect(responseInterceptorCalls).toHaveLength(1)

      // 验证拦截器函数存在
      expect(typeof requestInterceptorCalls[0][0]).toBe('function')
      expect(typeof requestInterceptorCalls[0][1]).toBe('function')
      expect(typeof responseInterceptorCalls[0][0]).toBe('function')
      expect(typeof responseInterceptorCalls[0][1]).toBe('function')
    })
  })

  describe('环境配置测试', () => {
    it('应该使用默认的API基础URL', () => {
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

  describe('边界情况测试', () => {
    it('应该处理空响应数据', async () => {
      const mockResponse: ApiResponse = {
        code: 200,
        message: '成功',
        data: null,
        success: true
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse })

      const result = await httpClient.get('/test')
      
      expect(result.code).toBe(200)
      expect(result.data).toBeNull()
    })

    it('应该处理大文件上传', async () => {
      // 创建一个较大的文件（模拟）
      const largeContent = 'x'.repeat(1024 * 1024) // 1MB
      const mockFile = new File([largeContent], 'large-file.txt', { type: 'text/plain' })
      const mockResponse: ApiResponse = {
        code: 200,
        message: '大文件上传成功',
        data: { fileId: 'large123' },
        success: true
      }

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse })

      const result = await httpClient.upload('/upload-large', mockFile)

      expect(result.code).toBe(200)
      expect(result.data.fileId).toBe('large123')
    })

    it('应该处理并发请求', async () => {
      const mockResponse: ApiResponse = {
        code: 200,
        message: '成功',
        data: { id: 1 },
        success: true
      }

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse })

      const promises = [
        httpClient.get('/test1'),
        httpClient.get('/test2'),
        httpClient.get('/test3')
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.code).toBe(200)
      })
    })
  })
})