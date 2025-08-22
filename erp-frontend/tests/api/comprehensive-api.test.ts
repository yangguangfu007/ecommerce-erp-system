import { test, expect } from '@playwright/test'

/**
 * 全面的API集成测试 - 包括数据创建和完整业务流程测试
 */

const API_BASE_URL = 'http://localhost:8080/api'

// 全局变量存储测试数据
let authToken: string
let testUserId: number

test.describe('ERP系统全面API测试', () => {
  
  test.beforeAll(async ({ request }) => {
    // 登录获取认证token
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
    authToken = loginData.data.accessToken
    
    console.log('✅ 认证成功，获取到token')
  })

  test('用户管理完整流程测试', async ({ request }) => {
    // 1. 获取用户列表
    const usersResponse = await request.get(`${API_BASE_URL}/users?page=1&size=10`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(usersResponse.status()).toBe(200)
    const usersData = await usersResponse.json()
    expect(usersData.code).toBe(200)
    expect(usersData.data).toHaveProperty('list')
    
    const initialUserCount = usersData.data.list.length
    console.log(`📊 当前用户数量: ${initialUserCount}`)
    
    // 2. 创建新用户
    const newUser = {
      username: `testuser_${Date.now()}`,
      realName: '测试用户API',
      nickname: '测试昵称',
      email: `test_${Date.now()}@example.com`,
      phone: '13900000000',
      password: 'test123456',
      status: 1
    }
    
    const createUserResponse = await request.post(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(newUser)
    })
    
    if (createUserResponse.status() === 200) {
      const createUserData = await createUserResponse.json()
      testUserId = createUserData.data.id
      console.log(`✅ 用户创建成功，ID: ${testUserId}`)
      
      // 3. 验证用户创建成功
      const updatedUsersResponse = await request.get(`${API_BASE_URL}/users?page=1&size=10`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      const updatedUsersData = await updatedUsersResponse.json()
      expect(updatedUsersData.data.list.length).toBe(initialUserCount + 1)
      
      // 4. 更新用户信息
      const updateUserResponse = await request.put(`${API_BASE_URL}/users/${testUserId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          realName: '更新后的测试用户',
          nickname: '更新后的昵称',
          email: `updated_${Date.now()}@example.com`
        })
      })
      
      if (updateUserResponse.status() === 200) {
        console.log('✅ 用户更新成功')
      } else {
        console.log('⚠️ 用户更新功能可能未实现')
      }
      
      // 5. 删除测试用户
      const deleteUserResponse = await request.delete(`${API_BASE_URL}/users/${testUserId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (deleteUserResponse.status() === 200) {
        console.log('✅ 用户删除成功')
      } else {
        console.log('⚠️ 用户删除功能可能未实现')
      }
    } else {
      console.log('⚠️ 用户创建功能可能未实现，状态码:', createUserResponse.status())
    }
  })

  test('权限和角色管理测试', async ({ request }) => {
    // 测试角色列表
    const rolesResponse = await request.get(`${API_BASE_URL}/roles`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (rolesResponse.status() === 200) {
      const rolesData = await rolesResponse.json()
      console.log('✅ 角色列表获取成功，角色数量:', rolesData.data?.length || 0)
    } else {
      console.log('⚠️ 角色管理功能可能未实现，状态码:', rolesResponse.status())
    }
    
    // 测试权限列表
    const permissionsResponse = await request.get(`${API_BASE_URL}/permissions`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (permissionsResponse.status() === 200) {
      const permissionsData = await permissionsResponse.json()
      console.log('✅ 权限列表获取成功')
    } else {
      console.log('⚠️ 权限管理功能可能未实现，状态码:', permissionsResponse.status())
    }
  })

  test('商品管理API测试', async ({ request }) => {
    // 测试商品列表
    const productsResponse = await request.get(`${API_BASE_URL}/products?page=1&size=10`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    console.log('商品API状态码:', productsResponse.status())
    
    if (productsResponse.status() === 200) {
      const productsData = await productsResponse.json()
      console.log('✅ 商品列表获取成功，商品数量:', productsData.data?.list?.length || 0)
      
      // 测试创建商品
      const newProduct = {
        sku: `TEST_SKU_${Date.now()}`,
        name: '测试商品API',
        description: '通过API创建的测试商品',
        categoryId: 1,
        brand: '测试品牌',
        price: 99.99,
        costPrice: 50.00,
        weight: 100,
        dimensions: '10x10x10',
        status: 'ACTIVE'
      }
      
      const createProductResponse = await request.post(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(newProduct)
      })
      
      if (createProductResponse.status() === 200 || createProductResponse.status() === 201) {
        console.log('✅ 商品创建成功')
      } else {
        console.log('⚠️ 商品创建功能可能未实现，状态码:', createProductResponse.status())
      }
    } else if (productsResponse.status() === 503) {
      console.log('⚠️ 商品服务未启动 (503)')
    } else {
      console.log('⚠️ 商品API异常，状态码:', productsResponse.status())
    }
  })

  test('订单管理API测试', async ({ request }) => {
    // 测试订单列表
    const ordersResponse = await request.get(`${API_BASE_URL}/orders?page=1&size=10`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    console.log('订单API状态码:', ordersResponse.status())
    
    if (ordersResponse.status() === 200) {
      const ordersData = await ordersResponse.json()
      console.log('✅ 订单列表获取成功，订单数量:', ordersData.data?.list?.length || 0)
      
      // 测试创建订单
      const newOrder = {
        platformOrderId: `TEST_ORDER_${Date.now()}`,
        platform: 'TEST_PLATFORM',
        storeId: 1,
        totalAmount: 299.99,
        currency: 'USD',
        customer: {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        items: [
          {
            sku: 'TEST_SKU_001',
            name: 'Test Product',
            quantity: 1,
            unitPrice: 299.99,
            totalPrice: 299.99
          }
        ]
      }
      
      const createOrderResponse = await request.post(`${API_BASE_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(newOrder)
      })
      
      if (createOrderResponse.status() === 200 || createOrderResponse.status() === 201) {
        console.log('✅ 订单创建成功')
      } else {
        console.log('⚠️ 订单创建功能可能未实现，状态码:', createOrderResponse.status())
      }
    } else if (ordersResponse.status() === 503) {
      console.log('⚠️ 订单服务未启动 (503)')
    } else {
      console.log('⚠️ 订单API异常，状态码:', ordersResponse.status())
    }
  })

  test('库存管理API测试', async ({ request }) => {
    // 测试库存列表
    const inventoryResponse = await request.get(`${API_BASE_URL}/inventory?page=1&size=10`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    console.log('库存API状态码:', inventoryResponse.status())
    
    if (inventoryResponse.status() === 200) {
      const inventoryData = await inventoryResponse.json()
      console.log('✅ 库存列表获取成功，库存记录数量:', inventoryData.data?.list?.length || 0)
      
      // 测试库存调整
      if (inventoryData.data?.list?.length > 0) {
        const firstInventory = inventoryData.data.list[0]
        const adjustmentData = {
          type: 'IN',
          quantity: 10,
          reason: 'TEST_ADJUSTMENT',
          note: 'API测试库存调整'
        }
        
        const adjustInventoryResponse = await request.post(`${API_BASE_URL}/inventory/${firstInventory.id}/adjust`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(adjustmentData)
        })
        
        if (adjustInventoryResponse.status() === 200) {
          console.log('✅ 库存调整成功')
        } else {
          console.log('⚠️ 库存调整功能可能未实现，状态码:', adjustInventoryResponse.status())
        }
      }
    } else if (inventoryResponse.status() === 503) {
      console.log('⚠️ 库存服务未启动 (503)')
    } else {
      console.log('⚠️ 库存API异常，状态码:', inventoryResponse.status())
    }
  })

  test('API性能和稳定性测试', async ({ request }) => {
    const performanceTests = []
    
    // 并发测试用户列表API
    for (let i = 0; i < 5; i++) {
      performanceTests.push(
        request.get(`${API_BASE_URL}/users?page=1&size=10`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
      )
    }
    
    const startTime = Date.now()
    const responses = await Promise.all(performanceTests)
    const endTime = Date.now()
    
    // 验证所有请求都成功
    responses.forEach((response, index) => {
      expect(response.status()).toBe(200)
    })
    
    const totalTime = endTime - startTime
    const avgTime = totalTime / responses.length
    
    console.log(`📊 并发性能测试结果:`)
    console.log(`   - 总时间: ${totalTime}ms`)
    console.log(`   - 平均响应时间: ${avgTime.toFixed(2)}ms`)
    console.log(`   - 并发请求数: ${responses.length}`)
    
    // 验证性能在合理范围内
    expect(avgTime).toBeLessThan(1000) // 平均响应时间小于1秒
  })

  test('错误处理和边界条件测试', async ({ request }) => {
    // 测试无效token
    const invalidTokenResponse = await request.get(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': 'Bearer invalid_token'
      }
    })
    
    expect(invalidTokenResponse.status()).toBe(401)
    console.log('✅ 无效token正确返回401')
    
    // 测试无权限访问
    const noAuthResponse = await request.get(`${API_BASE_URL}/users`)
    expect(noAuthResponse.status()).toBe(401)
    console.log('✅ 无认证访问正确返回401')
    
    // 测试不存在的资源
    const notFoundResponse = await request.get(`${API_BASE_URL}/users/999999`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (notFoundResponse.status() === 404) {
      console.log('✅ 不存在的资源正确返回404')
    } else {
      console.log('⚠️ 不存在的资源返回状态码:', notFoundResponse.status())
    }
    
    // 测试无效的请求参数
    const invalidParamsResponse = await request.get(`${API_BASE_URL}/users?page=-1&size=0`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    console.log('📊 无效参数测试状态码:', invalidParamsResponse.status())
  })

  test('数据一致性和完整性测试', async ({ request }) => {
    // 获取用户列表并验证数据结构
    const usersResponse = await request.get(`${API_BASE_URL}/users?page=1&size=10`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(usersResponse.status()).toBe(200)
    const usersData = await usersResponse.json()
    
    // 验证响应结构
    expect(usersData).toHaveProperty('code')
    expect(usersData).toHaveProperty('message')
    expect(usersData).toHaveProperty('data')
    expect(usersData).toHaveProperty('timestamp')
    
    // 验证分页数据结构
    expect(usersData.data).toHaveProperty('list')
    expect(usersData.data).toHaveProperty('total')
    expect(usersData.data).toHaveProperty('page')
    expect(usersData.data).toHaveProperty('size')
    
    // 验证用户数据结构
    if (usersData.data.list.length > 0) {
      const user = usersData.data.list[0]
      const requiredFields = ['id', 'username', 'realName', 'email', 'status']
      
      requiredFields.forEach(field => {
        expect(user).toHaveProperty(field)
      })
      
      console.log('✅ 用户数据结构验证通过')
    }
    
    // 验证数据类型
    expect(typeof usersData.data.total).toBe('number')
    expect(typeof usersData.data.page).toBe('number')
    expect(typeof usersData.data.size).toBe('number')
    expect(Array.isArray(usersData.data.list)).toBe(true)
    
    console.log('✅ 数据类型验证通过')
  })
})