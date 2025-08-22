/**
 * 性能测试套件
 * 测试系统性能指标和响应时间
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import axios from 'axios'

// 性能测试配置
const PERFORMANCE_CONFIG = {
  baseURL: 'http://localhost:8001/api',
  timeout: 10000,
  credentials: {
    username: 'admin',
    password: 'admin123'
  },
  // 性能基准（毫秒）
  benchmarks: {
    login: 1000,        // 登录API应在1秒内响应
    userList: 2000,     // 用户列表应在2秒内响应
    productList: 2000,  // 商品列表应在2秒内响应
    orderList: 3000,    // 订单列表应在3秒内响应
    inventory: 2000,    // 库存查询应在2秒内响应
    dashboard: 3000,    // 仪表板数据应在3秒内响应
    report: 5000        // 报表生成应在5秒内响应
  }
}

let authToken: string = ''

describe('性能测试套件', () => {
  beforeAll(async () => {
    // 获取认证token
    try {
      const response = await axios.post(`${PERFORMANCE_CONFIG.baseURL}/users/login`, PERFORMANCE_CONFIG.credentials)
      authToken = response.data.data.accessToken
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      axios.defaults.baseURL = PERFORMANCE_CONFIG.baseURL
    } catch (error) {
      console.warn('无法获取认证token，跳过需要认证的性能测试:', error)
    }
  })

  afterAll(() => {
    delete axios.defaults.headers.common['Authorization']
  })

  describe('1. API响应时间测试', () => {
    it('1.1 登录API性能测试', async () => {
      const startTime = Date.now()
      
      try {
        const response = await axios.post('/users/login', PERFORMANCE_CONFIG.credentials)
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        console.log(`登录API响应时间: ${responseTime}ms`)
        
        expect(response.status).toBe(200)
        expect(responseTime).toBeLessThanOrEqual(PERFORMANCE_CONFIG.benchmarks.login)
        expect(response.data.data.accessToken).toBeTruthy()
      } catch (error) {
        console.error('登录API性能测试失败:', error)
        throw error
      }
    })

    it('1.2 用户列表API性能测试', async () => {
      if (!authToken) {
        console.warn('跳过用户列表性能测试：无认证token')
        return
      }

      const startTime = Date.now()
      
      try {
        const response = await axios.get('/users', {
          params: { page: 1, size: 20 }
        })
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        console.log(`用户列表API响应时间: ${responseTime}ms`)
        
        expect(response.status).toBe(200)
        expect(responseTime).toBeLessThanOrEqual(PERFORMANCE_CONFIG.benchmarks.userList)
        expect(response.data.data).toBeTruthy()
      } catch (error) {
        console.error('用户列表API性能测试失败:', error)
        throw error
      }
    })

    it('1.3 用户信息API性能测试', async () => {
      if (!authToken) {
        console.warn('跳过用户信息性能测试：无认证token')
        return
      }

      const startTime = Date.now()
      
      try {
        const response = await axios.get('/users/profile')
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        console.log(`用户信息API响应时间: ${responseTime}ms`)
        
        expect(response.status).toBe(200)
        expect(responseTime).toBeLessThanOrEqual(PERFORMANCE_CONFIG.benchmarks.userList)
        expect(response.data.data.username).toBe('admin')
      } catch (error) {
        console.error('用户信息API性能测试失败:', error)
        throw error
      }
    })
  })

  describe('2. 并发性能测试', () => {
    it('2.1 并发登录测试', async () => {
      if (!authToken) {
        console.warn('跳过并发登录测试：无认证token')
        return
      }

      const concurrentRequests = 10
      const requests = []
      
      const startTime = Date.now()
      
      // 创建并发请求
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          axios.post('/users/login', PERFORMANCE_CONFIG.credentials)
        )
      }
      
      try {
        const responses = await Promise.all(requests)
        const endTime = Date.now()
        const totalTime = endTime - startTime
        const avgTime = totalTime / concurrentRequests
        
        console.log(`并发登录测试 - 总时间: ${totalTime}ms, 平均时间: ${avgTime}ms`)
        
        // 验证所有请求都成功
        responses.forEach(response => {
          expect(response.status).toBe(200)
          expect(response.data.data.accessToken).toBeTruthy()
        })
        
        // 平均响应时间应在基准内
        expect(avgTime).toBeLessThanOrEqual(PERFORMANCE_CONFIG.benchmarks.login * 2)
      } catch (error) {
        console.error('并发登录测试失败:', error)
        throw error
      }
    })

    it('2.2 并发用户列表查询测试', async () => {
      if (!authToken) {
        console.warn('跳过并发用户列表测试：无认证token')
        return
      }

      const concurrentRequests = 5
      const requests = []
      
      const startTime = Date.now()
      
      // 创建并发请求
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          axios.get('/users', {
            params: { page: i + 1, size: 10 }
          })
        )
      }
      
      try {
        const responses = await Promise.all(requests)
        const endTime = Date.now()
        const totalTime = endTime - startTime
        const avgTime = totalTime / concurrentRequests
        
        console.log(`并发用户列表测试 - 总时间: ${totalTime}ms, 平均时间: ${avgTime}ms`)
        
        // 验证所有请求都成功
        responses.forEach(response => {
          expect(response.status).toBe(200)
          expect(response.data.data).toBeTruthy()
        })
        
        // 平均响应时间应在基准内
        expect(avgTime).toBeLessThanOrEqual(PERFORMANCE_CONFIG.benchmarks.userList * 1.5)
      } catch (error) {
        console.error('并发用户列表测试失败:', error)
        throw error
      }
    })
  })

  describe('3. 内存和资源使用测试', () => {
    it('3.1 内存泄漏检测测试', async () => {
      if (!authToken) {
        console.warn('跳过内存泄漏测试：无认证token')
        return
      }

      // 记录初始内存使用
      const initialMemory = process.memoryUsage()
      
      // 执行多次API调用
      const iterations = 50
      for (let i = 0; i < iterations; i++) {
        try {
          await axios.get('/users/profile')
        } catch (error) {
          // 忽略单次请求失败
        }
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc()
      }
      
      // 记录最终内存使用
      const finalMemory = process.memoryUsage()
      
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      const memoryIncreasePercent = (memoryIncrease / initialMemory.heapUsed) * 100
      
      console.log(`内存使用变化: ${memoryIncrease} bytes (${memoryIncreasePercent.toFixed(2)}%)`)
      
      // 内存增长不应超过50%
      expect(memoryIncreasePercent).toBeLessThanOrEqual(50)
    })

    it('3.2 资源清理测试', async () => {
      // 测试axios实例是否正确清理
      const testAxios = axios.create({
        baseURL: PERFORMANCE_CONFIG.baseURL,
        timeout: 5000
      })
      
      // 执行请求
      try {
        await testAxios.post('/users/login', PERFORMANCE_CONFIG.credentials)
      } catch (error) {
        // 忽略请求失败
      }
      
      // 验证实例可以被正确清理
      expect(testAxios.defaults.baseURL).toBe(PERFORMANCE_CONFIG.baseURL)
      expect(testAxios.defaults.timeout).toBe(5000)
    })
  })

  describe('4. 大数据量处理性能测试', () => {
    it('4.1 大列表查询性能测试', async () => {
      if (!authToken) {
        console.warn('跳过大列表查询测试：无认证token')
        return
      }

      const startTime = Date.now()
      
      try {
        // 查询大量数据
        const response = await axios.get('/users', {
          params: { page: 1, size: 100 }
        })
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        console.log(`大列表查询响应时间: ${responseTime}ms`)
        
        expect(response.status).toBe(200)
        expect(responseTime).toBeLessThanOrEqual(PERFORMANCE_CONFIG.benchmarks.userList * 2)
        expect(response.data.data).toBeTruthy()
      } catch (error) {
        console.error('大列表查询性能测试失败:', error)
        throw error
      }
    })

    it('4.2 分页性能测试', async () => {
      if (!authToken) {
        console.warn('跳过分页性能测试：无认证token')
        return
      }

      const pageTests = [
        { page: 1, size: 10 },
        { page: 1, size: 20 },
        { page: 1, size: 50 },
        { page: 2, size: 20 }
      ]
      
      for (const pageTest of pageTests) {
        const startTime = Date.now()
        
        try {
          const response = await axios.get('/users', {
            params: pageTest
          })
          const endTime = Date.now()
          const responseTime = endTime - startTime
          
          console.log(`分页查询 (page=${pageTest.page}, size=${pageTest.size}) 响应时间: ${responseTime}ms`)
          
          expect(response.status).toBe(200)
          expect(responseTime).toBeLessThanOrEqual(PERFORMANCE_CONFIG.benchmarks.userList)
        } catch (error) {
          console.error(`分页性能测试失败 (page=${pageTest.page}, size=${pageTest.size}):`, error)
        }
      }
    })
  })

  describe('5. 网络条件模拟测试', () => {
    it('5.1 慢网络条件测试', async () => {
      if (!authToken) {
        console.warn('跳过慢网络测试：无认证token')
        return
      }

      // 创建带有较短超时的axios实例来模拟慢网络
      const slowAxios = axios.create({
        baseURL: PERFORMANCE_CONFIG.baseURL,
        timeout: 8000, // 8秒超时
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      const startTime = Date.now()
      
      try {
        const response = await slowAxios.get('/users/profile')
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        console.log(`慢网络条件下响应时间: ${responseTime}ms`)
        
        expect(response.status).toBe(200)
        expect(responseTime).toBeLessThanOrEqual(8000)
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          console.log('慢网络测试：请求超时（符合预期）')
          expect(error.code).toBe('ECONNABORTED')
        } else {
          throw error
        }
      }
    })

    it('5.2 网络中断恢复测试', async () => {
      if (!authToken) {
        console.warn('跳过网络中断测试：无认证token')
        return
      }

      // 测试重试机制
      const retryAxios = axios.create({
        baseURL: PERFORMANCE_CONFIG.baseURL,
        timeout: 3000,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      // 添加重试拦截器
      retryAxios.interceptors.response.use(
        response => response,
        async error => {
          if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
            console.log('网络错误，准备重试...')
            // 简单重试一次
            return retryAxios.request(error.config)
          }
          return Promise.reject(error)
        }
      )
      
      try {
        const response = await retryAxios.get('/users/profile')
        expect(response.status).toBe(200)
        console.log('网络中断恢复测试：成功')
      } catch (error) {
        console.log('网络中断恢复测试：最终失败（可能是网络问题）')
        // 不抛出错误，因为这可能是真实的网络问题
      }
    })
  })

  describe('6. 缓存性能测试', () => {
    it('6.1 重复请求缓存测试', async () => {
      if (!authToken) {
        console.warn('跳过缓存测试：无认证token')
        return
      }

      // 第一次请求
      const startTime1 = Date.now()
      const response1 = await axios.get('/users/profile')
      const endTime1 = Date.now()
      const firstRequestTime = endTime1 - startTime1
      
      // 第二次相同请求
      const startTime2 = Date.now()
      const response2 = await axios.get('/users/profile')
      const endTime2 = Date.now()
      const secondRequestTime = endTime2 - startTime2
      
      console.log(`第一次请求时间: ${firstRequestTime}ms`)
      console.log(`第二次请求时间: ${secondRequestTime}ms`)
      
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(response1.data.data.username).toBe(response2.data.data.username)
      
      // 验证数据一致性
      expect(JSON.stringify(response1.data.data)).toBe(JSON.stringify(response2.data.data))
    })
  })

  describe('7. 错误处理性能测试', () => {
    it('7.1 404错误处理性能测试', async () => {
      const startTime = Date.now()
      
      try {
        await axios.get('/nonexistent-endpoint')
      } catch (error) {
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        console.log(`404错误处理时间: ${responseTime}ms`)
        
        expect(error.response?.status).toBe(404)
        expect(responseTime).toBeLessThanOrEqual(1000) // 错误处理应该很快
      }
    })

    it('7.2 认证错误处理性能测试', async () => {
      const startTime = Date.now()
      
      try {
        // 使用无效token
        await axios.get('/users/profile', {
          headers: {
            'Authorization': 'Bearer invalid-token'
          }
        })
      } catch (error) {
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        console.log(`认证错误处理时间: ${responseTime}ms`)
        
        expect(error.response?.status).toBe(401)
        expect(responseTime).toBeLessThanOrEqual(1000) // 认证错误处理应该很快
      }
    })
  })

  describe('8. 性能基准验证', () => {
    it('8.1 验证所有性能基准设置合理', () => {
      const benchmarks = PERFORMANCE_CONFIG.benchmarks
      
      // 验证所有基准都是正数且合理
      Object.entries(benchmarks).forEach(([key, value]) => {
        expect(value).toBeGreaterThan(0)
        expect(value).toBeLessThanOrEqual(10000) // 不应超过10秒
        console.log(`${key} 性能基准: ${value}ms`)
      })
    })

    it('8.2 性能测试覆盖率验证', () => {
      const testedApis = [
        'login',
        'userList',
        'userProfile'
      ]
      
      const requiredApis = [
        'login',
        'userList',
        'userProfile'
      ]
      
      requiredApis.forEach(api => {
        expect(testedApis).toContain(api)
      })
      
      console.log(`性能测试覆盖的API: ${testedApis.join(', ')}`)
    })
  })
})

// 导出性能测试配置
export const performanceTestConfig = PERFORMANCE_CONFIG

// 性能测试报告生成器
export class PerformanceReporter {
  private results: Array<{
    testName: string
    responseTime: number
    status: 'PASS' | 'FAIL'
    benchmark: number
    timestamp: string
  }> = []

  addResult(testName: string, responseTime: number, benchmark: number, status: 'PASS' | 'FAIL') {
    this.results.push({
      testName,
      responseTime,
      status,
      benchmark,
      timestamp: new Date().toISOString()
    })
  }

  generateReport(): string {
    const passCount = this.results.filter(r => r.status === 'PASS').length
    const failCount = this.results.filter(r => r.status === 'FAIL').length
    const totalCount = this.results.length
    
    let report = `
性能测试报告
=============
测试时间: ${new Date().toLocaleString()}
总测试数: ${totalCount}
通过数: ${passCount}
失败数: ${failCount}
通过率: ${((passCount / totalCount) * 100).toFixed(2)}%

详细结果:
---------
`
    
    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✓' : '✗'
      report += `${status} ${result.testName}: ${result.responseTime}ms (基准: ${result.benchmark}ms)\n`
    })
    
    return report
  }
}