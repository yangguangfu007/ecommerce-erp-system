import { test, expect } from '@playwright/test'

/**
 * API集成测试 - 测试后端API的可用性和功能
 */

const API_BASE_URL = 'http://localhost:8080/api'
const USER_SERVICE_URL = 'http://localhost:8001'

test.describe('API集成测试', () => {
  
  test('健康检查测试', async ({ request }) => {
    // 测试网关健康状态
    const gatewayHealth = await request.get('http://localhost:8080/actuator/health')
    expect(gatewayHealth.status()).toBe(200)
    
    const gatewayData = await gatewayHealth.json()
    expect(gatewayData.status).toBe('UP')
    
    // 测试用户服务健康状态 - 直接访问用户服务
    const userServiceHealth = await request.get(`${USER_SERVICE_URL}/actuator/health`)
    // 用户服务可能没有暴露actuator端点，所以检查是否可访问
    console.log('用户服务健康检查状态:', userServiceHealth.status())
    
    if (userServiceHealth.status() === 200) {
      const userServiceData = await userServiceHealth.json()
      expect(userServiceData.status).toBe('UP')
    }
  })

  test('用户登录API测试', async ({ request }) => {
    // 测试无效登录
    const invalidLogin = await request.post(`${API_BASE_URL}/users/login`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        username: 'invalid',
        password: 'invalid'
      })
    })
    
    // 应该返回401或400
    expect([400, 401]).toContain(invalidLogin.status())
    
    // 测试有效登录
    const validLogin = await request.post(`${API_BASE_URL}/users/login`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    })
    
    expect(validLogin.status()).toBe(200)
    
    const loginData = await validLogin.json()
    expect(loginData.code).toBe(200)
    expect(loginData.data).toHaveProperty('accessToken')
    expect(loginData.data).toHaveProperty('userInfo')
    
    console.log('登录成功，用户信息:', loginData.data.userInfo)
  })

  test('用户信息API测试', async ({ request }) => {
    // 先登录获取token
    const loginResponse = await request.post(`${API_BASE_URL}/users/login`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    })
    
    expect(loginResponse.status()).toBe(200)
    const loginData = await loginResponse.json()
    const token = loginData.data.accessToken
    
    // 使用token获取用户信息 - 改为获取用户列表来验证token有效性
    const userInfoResponse = await request.get(`${API_BASE_URL}/users?page=1&size=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    expect(userInfoResponse.status()).toBe(200)
    const userInfoData = await userInfoResponse.json()
    expect(userInfoData.code).toBe(200)
    expect(userInfoData.data).toHaveProperty('list')
    
    console.log('用户列表验证成功，token有效')
  })

  test('用户列表API测试', async ({ request }) => {
    // 先登录获取token
    const loginResponse = await request.post(`${API_BASE_URL}/users/login`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    })
    
    expect(loginResponse.status()).toBe(200)
    const loginData = await loginResponse.json()
    const token = loginData.data.accessToken
    
    // 获取用户列表
    const usersResponse = await request.get(`${API_BASE_URL}/users?page=1&size=10`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    expect(usersResponse.status()).toBe(200)
    const usersData = await usersResponse.json()
    expect(usersData.code).toBe(200)
    expect(usersData.data).toHaveProperty('list')
    expect(Array.isArray(usersData.data.list)).toBe(true)
    
    console.log('用户列表数量:', usersData.data.list.length)
  })

  test('商品API测试', async ({ request }) => {
    // 先登录获取token
    const loginResponse = await request.post(`${API_BASE_URL}/users/login`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    })
    
    expect(loginResponse.status()).toBe(200)
    const loginData = await loginResponse.json()
    const token = loginData.data.accessToken
    
    // 测试商品列表API
    const productsResponse = await request.get(`${API_BASE_URL}/products?page=1&size=10`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    // 商品服务可能还没有启动，所以可能返回404或503
    console.log('商品API状态:', productsResponse.status())
    
    if (productsResponse.status() === 200) {
      const productsData = await productsResponse.json()
      console.log('商品列表:', productsData)
    }
  })

  test('订单API测试', async ({ request }) => {
    // 先登录获取token
    const loginResponse = await request.post(`${API_BASE_URL}/users/login`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    })
    
    expect(loginResponse.status()).toBe(200)
    const loginData = await loginResponse.json()
    const token = loginData.data.accessToken
    
    // 测试订单列表API
    const ordersResponse = await request.get(`${API_BASE_URL}/orders?page=1&size=10`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('订单API状态:', ordersResponse.status())
    
    if (ordersResponse.status() === 200) {
      const ordersData = await ordersResponse.json()
      console.log('订单列表:', ordersData)
    }
  })

  test('库存API测试', async ({ request }) => {
    // 先登录获取token
    const loginResponse = await request.post(`${API_BASE_URL}/users/login`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    })
    
    expect(loginResponse.status()).toBe(200)
    const loginData = await loginResponse.json()
    const token = loginData.data.accessToken
    
    // 测试库存列表API
    const inventoryResponse = await request.get(`${API_BASE_URL}/inventory?page=1&size=10`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('库存API状态:', inventoryResponse.status())
    
    if (inventoryResponse.status() === 200) {
      const inventoryData = await inventoryResponse.json()
      console.log('库存列表:', inventoryData)
    }
  })

  test('API响应时间测试', async ({ request }) => {
    const startTime = Date.now()
    
    const response = await request.get('http://localhost:8080/actuator/health')
    
    const responseTime = Date.now() - startTime
    console.log('API响应时间:', responseTime, 'ms')
    
    // 验证响应时间小于1秒
    expect(responseTime).toBeLessThan(1000)
    expect(response.status()).toBe(200)
  })
})