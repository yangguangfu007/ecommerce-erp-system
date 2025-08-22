import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import type { ApiResponse, RequestConfig } from './types'

/**
 * HTTP请求客户端类
 * 提供统一的API请求配置和拦截器处理
 */
class HttpClient {
  private instance: AxiosInstance

  constructor() {
    // 创建axios实例
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 设置拦截器
    this.setupInterceptors()
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: any) => {
        const userStore = useUserStore()
        
        // 添加认证token
        if (!config.skipAuth && userStore.token) {
          config.headers.Authorization = `Bearer ${userStore.token}`
        }

        // 添加店铺ID到请求头
        if (userStore.currentStoreId) {
          config.headers['X-Store-Id'] = userStore.currentStoreId
        }

        // 添加请求时间戳
        config.headers['X-Request-Time'] = Date.now().toString()

        return config
      },
      (error: AxiosError) => {
        console.error('请求拦截器错误:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response
        
        // 统一处理业务错误
        if (data.code !== 200 && !(response.config as any).skipErrorHandler) {
          ElMessage.error(data.message || '请求失败')
          return Promise.reject(new Error(data.message))
        }

        return response
      },
      (error: AxiosError) => {
        const { response, config } = error

        // 如果配置了跳过错误处理，则不显示错误消息
        if (!(config as any)?.skipErrorHandler) {
          this.handleError(error)
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * 统一错误处理
   * @param error - Axios错误对象
   */
  private handleError(error: AxiosError): void {
    const { response } = error
    const userStore = useUserStore()

    // 网络错误
    if (!response) {
      ElMessage.error('网络连接失败，请检查网络设置')
      return
    }

    // HTTP状态码错误处理
    switch (response.status) {
      case 401:
        // 未授权，需要重新登录
        ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          userStore.logout()
          router.push('/login')
        }).catch(() => {
          // 用户取消登录
        })
        break
      case 403:
        ElMessage.error('没有权限访问该资源')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 422:
        // 数据验证错误
        const validationErrors = response.data as any
        if (validationErrors?.errors && Array.isArray(validationErrors.errors)) {
          validationErrors.errors.forEach((err: any) => {
            ElMessage.error(`${err.field}: ${err.message}`)
          })
        } else {
          ElMessage.error(validationErrors?.message || '数据验证失败')
        }
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
   * GET请求
   * @param url - 请求URL
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>>
   */
  get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, config).then(response => response.data)
  }

  /**
   * POST请求
   * @param url - 请求URL
   * @param data - 请求数据
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>>
   */
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config).then(response => response.data)
  }

  /**
   * PUT请求
   * @param url - 请求URL
   * @param data - 请求数据
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>>
   */
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config).then(response => response.data)
  }

  /**
   * DELETE请求
   * @param url - 请求URL
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>>
   */
  delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config).then(response => response.data)
  }

  /**
   * PATCH请求
   * @param url - 请求URL
   * @param data - 请求数据
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>>
   */
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, config).then(response => response.data)
  }

  /**
   * 文件上传
   * @param url - 上传URL
   * @param file - 文件对象
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>>
   */
  upload<T = any>(url: string, file: File, config?: RequestConfig): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.instance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    }).then(response => response.data)
  }

  /**
   * 批量文件上传
   * @param url - 上传URL
   * @param files - 文件数组
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>>
   */
  uploadMultiple<T = any>(url: string, files: File[], config?: RequestConfig): Promise<ApiResponse<T>> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })
    
    return this.instance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    }).then(response => response.data)
  }

  /**
   * 下载文件
   * @param url - 下载URL
   * @param config - 请求配置
   * @returns Promise<Blob>
   */
  download(url: string, config?: RequestConfig): Promise<Blob> {
    return this.instance.get(url, {
      ...config,
      responseType: 'blob'
    }).then(response => response.data)
  }

  /**
   * 获取原始axios实例
   * @returns AxiosInstance
   */
  getInstance(): AxiosInstance {
    return this.instance
  }
}

// 创建并导出HTTP客户端实例
export const httpClient = new HttpClient()

// 导出默认实例
export default httpClient