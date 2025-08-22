import { describe, it, expect } from 'vitest'
import { describe, it, expect } from 'vitest'
import type { 
  ApiResponse, 
  RequestConfig, 
  PageQuery, 
  PageResult, 
  BaseEntity
} from '../types'
import { 
  UserTypes,
  ProductTypes,
  OrderTypes,
  InventoryTypes,
  PlatformTypes,
  LogisticsTypes,
  NotificationTypes,
  SystemTypes
} from '../types'

describe('API类型定义测试', () => {
  describe('ApiResponse接口', () => {
    it('应该定义正确的基础响应结构', () => {
      const response: ApiResponse = {
        code: 200,
        message: '成功',
        data: null,
        success: true
      }

      expect(response.code).toBe(200)
      expect(response.message).toBe('成功')
      expect(response.data).toBeNull()
      expect(response.success).toBe(true)
    })

    it('应该支持泛型数据类型', () => {
      interface User {
        id: number
        name: string
        email: string
      }

      const userResponse: ApiResponse<User> = {
        code: 200,
        message: '获取用户成功',
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
        },
        success: true
      }

      expect(userResponse.data.id).toBe(1)
      expect(userResponse.data.name).toBe('John Doe')
      expect(userResponse.data.email).toBe('john@example.com')
    })

    it('应该支持数组类型数据', () => {
      interface Product {
        id: number
        name: string
        price: number
      }

      const productsResponse: ApiResponse<Product[]> = {
        code: 200,
        message: '获取商品列表成功',
        data: [
          { id: 1, name: 'Product 1', price: 100 },
          { id: 2, name: 'Product 2', price: 200 }
        ],
        success: true
      }

      expect(Array.isArray(productsResponse.data)).toBe(true)
      expect(productsResponse.data).toHaveLength(2)
      expect(productsResponse.data[0].name).toBe('Product 1')
    })

    it('应该支持嵌套对象类型', () => {
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

      const orderResponse: ApiResponse<Order> = {
        code: 200,
        message: '获取订单成功',
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

      expect(orderResponse.data.items).toHaveLength(2)
      expect(orderResponse.data.totalAmount).toBe(400)
    })

    it('应该支持可选字段', () => {
      interface UserProfile {
        id: number
        username: string
        email: string
        avatar?: string
        bio?: string
      }

      const profileResponse: ApiResponse<UserProfile> = {
        code: 200,
        message: '获取用户资料成功',
        data: {
          id: 1,
          username: 'johndoe',
          email: 'john@example.com'
          // avatar 和 bio 是可选的
        },
        success: true
      }

      expect(profileResponse.data.avatar).toBeUndefined()
      expect(profileResponse.data.bio).toBeUndefined()
    })

    it('应该支持联合类型', () => {
      type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING'

      interface Account {
        id: number
        name: string
        status: Status
      }

      const accountResponse: ApiResponse<Account> = {
        code: 200,
        message: '获取账户成功',
        data: {
          id: 1,
          name: 'Test Account',
          status: 'ACTIVE'
        },
        success: true
      }

      expect(['ACTIVE', 'INACTIVE', 'PENDING']).toContain(accountResponse.data.status)
    })
  })

  describe('RequestConfig接口', () => {
    it('应该扩展AxiosRequestConfig', () => {
      const config: RequestConfig = {
        url: '/test',
        method: 'GET',
        headers: {
          'Custom-Header': 'value'
        },
        timeout: 5000,
        skipErrorHandler: true,
        skipAuth: false
      }

      expect(config.url).toBe('/test')
      expect(config.method).toBe('GET')
      expect(config.headers?.['Custom-Header']).toBe('value')
      expect(config.timeout).toBe(5000)
      expect(config.skipErrorHandler).toBe(true)
      expect(config.skipAuth).toBe(false)
    })

    it('应该支持可选的自定义配置', () => {
      const config: RequestConfig = {
        url: '/test'
        // skipErrorHandler 和 skipAuth 是可选的
      }

      expect(config.skipErrorHandler).toBeUndefined()
      expect(config.skipAuth).toBeUndefined()
    })

    it('应该支持所有Axios配置选项', () => {
      const config: RequestConfig = {
        url: '/test',
        method: 'POST',
        data: { name: 'test' },
        params: { page: 1 },
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
        withCredentials: true,
        responseType: 'json',
        skipErrorHandler: false,
        skipAuth: true
      }

      expect(config.method).toBe('POST')
      expect(config.data).toEqual({ name: 'test' })
      expect(config.params).toEqual({ page: 1 })
      expect(config.withCredentials).toBe(true)
      expect(config.responseType).toBe('json')
    })
  })

  describe('类型推断', () => {
    it('应该正确推断返回类型', async () => {
      // 模拟API调用的类型推断
      const mockApiCall = <T>(data: T): Promise<ApiResponse<T>> => {
        return Promise.resolve({
          code: 200,
          message: '成功',
          data,
          success: true
        })
      }

      // TypeScript应该能够推断出正确的类型
      const stringResult = await mockApiCall('test string')
      const numberResult = await mockApiCall(42)
      const objectResult = await mockApiCall({ id: 1, name: 'test' })

      // 这些断言主要用于验证类型推断是否正确
      expect(stringResult).toHaveProperty('data')
      expect(numberResult).toHaveProperty('data')
      expect(objectResult).toHaveProperty('data')
    })

    it('应该支持复杂的泛型约束', () => {
      interface BaseEntity {
        id: number
        createdAt: string
        updatedAt: string
      }

      interface User extends BaseEntity {
        username: string
        email: string
      }

      interface Product extends BaseEntity {
        name: string
        price: number
      }

      const userResponse: ApiResponse<User> = {
        code: 200,
        message: '成功',
        data: {
          id: 1,
          username: 'john',
          email: 'john@example.com',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        },
        success: true
      }

      const productResponse: ApiResponse<Product> = {
        code: 200,
        message: '成功',
        data: {
          id: 1,
          name: 'Test Product',
          price: 100,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        },
        success: true
      }

      expect(userResponse.data.username).toBe('john')
      expect(productResponse.data.price).toBe(100)
    })
  })

  describe('错误响应类型', () => {
    it('应该支持错误响应结构', () => {
      const errorResponse: ApiResponse<null> = {
        code: 400,
        message: '参数错误',
        data: null,
        success: false
      }

      expect(errorResponse.code).toBe(400)
      expect(errorResponse.success).toBe(false)
      expect(errorResponse.data).toBeNull()
    })

    it('应该支持带有错误详情的响应', () => {
      interface ValidationError {
        field: string
        message: string
      }

      const validationErrorResponse: ApiResponse<ValidationError[]> = {
        code: 422,
        message: '数据验证失败',
        data: [
          { field: 'email', message: '邮箱格式不正确' },
          { field: 'password', message: '密码长度不能少于6位' }
        ],
        success: false
      }

      expect(validationErrorResponse.data).toHaveLength(2)
      expect(validationErrorResponse.data[0].field).toBe('email')
    })
  })

  describe('分页响应类型', () => {
    it('应该支持分页数据结构', () => {
      const pageResponse: ApiResponse<PageResult<UserTypes.User>> = {
        code: 200,
        message: '获取用户列表成功',
        data: {
          records: [
            { 
              id: 1, 
              username: 'user1', 
              email: 'user1@example.com',
              status: 1,
              roles: [],
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            },
            { 
              id: 2, 
              username: 'user2', 
              email: 'user2@example.com',
              status: 1,
              roles: [],
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            }
          ],
          total: 100,
          current: 1,
          size: 10,
          pages: 10
        },
        success: true
      }

      expect(pageResponse.data.records).toHaveLength(2)
      expect(pageResponse.data.total).toBe(100)
      expect(pageResponse.data.current).toBe(1)
    })

    it('应该支持分页查询参数', () => {
      const pageQuery: PageQuery = {
        page: 1,
        size: 10,
        keyword: 'test'
      }

      expect(pageQuery.page).toBe(1)
      expect(pageQuery.size).toBe(10)
      expect(pageQuery.keyword).toBe('test')
    })
  })

  describe('用户类型定义', () => {
    it('应该正确定义用户信息结构', () => {
      const user: UserTypes.User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        phone: '13800138000',
        status: 1,
        roles: [
          {
            id: 1,
            name: '管理员',
            code: 'ADMIN',
            permissions: [
              {
                id: 1,
                name: '用户管理',
                code: 'USER_MANAGE',
                type: 'MENU'
              }
            ]
          }
        ],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(user.username).toBe('testuser')
      expect(user.roles).toHaveLength(1)
      expect(user.roles[0].permissions).toHaveLength(1)
    })

    it('应该正确定义登录表单结构', () => {
      const loginForm: UserTypes.LoginForm = {
        username: 'admin',
        password: 'password123',
        captcha: 'ABCD'
      }

      expect(loginForm.username).toBe('admin')
      expect(loginForm.password).toBe('password123')
      expect(loginForm.captcha).toBe('ABCD')
    })

    it('应该正确定义登录响应结构', () => {
      const loginResponse: UserTypes.LoginResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          status: 1,
          roles: [],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        },
        permissions: ['USER_MANAGE', 'PRODUCT_MANAGE']
      }

      expect(loginResponse.token).toBe('jwt-token')
      expect(loginResponse.permissions).toHaveLength(2)
    })
  })

  describe('商品类型定义', () => {
    it('应该正确定义商品信息结构', () => {
      const product: ProductTypes.Product = {
        id: 1,
        sku: 'SKU001',
        name: '测试商品',
        category: '电子产品',
        price: 99.99,
        stock: 100,
        status: 1,
        images: ['image1.jpg', 'image2.jpg'],
        attributes: [
          { name: '颜色', value: '红色' },
          { name: '尺寸', value: 'L' }
        ],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(product.sku).toBe('SKU001')
      expect(product.attributes).toHaveLength(2)
      expect(product.images).toHaveLength(2)
    })

    it('应该正确定义商品分类结构', () => {
      const category: ProductTypes.Category = {
        id: 1,
        name: '电子产品',
        parentId: 0,
        level: 1,
        sort: 1,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(category.name).toBe('电子产品')
      expect(category.level).toBe(1)
    })
  })

  describe('订单类型定义', () => {
    it('应该正确定义订单信息结构', () => {
      const order: OrderTypes.Order = {
        id: 1,
        orderNo: 'ORD001',
        platformOrderId: 'PLAT001',
        status: OrderTypes.OrderStatus.PAID,
        totalAmount: 199.98,
        items: [
          {
            id: 1,
            productId: 1,
            sku: 'SKU001',
            quantity: 2,
            price: 99.99
          }
        ],
        shippingAddress: {
          name: '张三',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: '某某街道123号',
          zipCode: '100000'
        },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(order.orderNo).toBe('ORD001')
      expect(order.status).toBe(OrderTypes.OrderStatus.PAID)
      expect(order.items).toHaveLength(1)
    })

    it('应该正确定义订单状态枚举', () => {
      expect(OrderTypes.OrderStatus.PENDING_PAYMENT).toBe(1)
      expect(OrderTypes.OrderStatus.PAID).toBe(2)
      expect(OrderTypes.OrderStatus.SHIPPED).toBe(3)
      expect(OrderTypes.OrderStatus.COMPLETED).toBe(4)
      expect(OrderTypes.OrderStatus.CANCELLED).toBe(5)
    })
  })

  describe('库存类型定义', () => {
    it('应该正确定义库存信息结构', () => {
      const inventory: InventoryTypes.Inventory = {
        id: 1,
        sku: 'SKU001',
        productName: '测试商品',
        totalStock: 100,
        availableStock: 80,
        reservedStock: 20,
        alertThreshold: 10,
        status: InventoryTypes.InventoryStatus.NORMAL,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(inventory.sku).toBe('SKU001')
      expect(inventory.status).toBe(InventoryTypes.InventoryStatus.NORMAL)
    })

    it('应该正确定义库存状态枚举', () => {
      expect(InventoryTypes.InventoryStatus.NORMAL).toBe(1)
      expect(InventoryTypes.InventoryStatus.WARNING).toBe(2)
      expect(InventoryTypes.InventoryStatus.OUT_OF_STOCK).toBe(3)
    })

    it('应该正确定义库存调整记录结构', () => {
      const transaction: InventoryTypes.InventoryTransaction = {
        id: 1,
        sku: 'SKU001',
        type: 1,
        quantity: 10,
        beforeStock: 90,
        afterStock: 100,
        reason: '采购入库',
        operator: 'admin',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(transaction.sku).toBe('SKU001')
      expect(transaction.quantity).toBe(10)
    })
  })

  describe('平台类型定义', () => {
    it('应该正确定义平台信息结构', () => {
      const platform: PlatformTypes.Platform = {
        id: 1,
        name: '沃尔玛',
        type: PlatformTypes.PlatformType.WALMART,
        config: {
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          environment: 'sandbox'
        },
        status: PlatformTypes.PlatformStatus.ACTIVE,
        lastSyncTime: '2023-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(platform.type).toBe(PlatformTypes.PlatformType.WALMART)
      expect(platform.status).toBe(PlatformTypes.PlatformStatus.ACTIVE)
    })

    it('应该正确定义平台类型枚举', () => {
      expect(PlatformTypes.PlatformType.WALMART).toBe('WALMART')
      expect(PlatformTypes.PlatformType.AMAZON).toBe('AMAZON')
      expect(PlatformTypes.PlatformType.EBAY).toBe('EBAY')
    })

    it('应该正确定义店铺信息结构', () => {
      const store: PlatformTypes.Store = {
        id: 1,
        platformId: 1,
        name: '测试店铺',
        storeId: 'STORE001',
        config: {
          storeUrl: 'https://store.example.com'
        },
        status: PlatformTypes.StoreStatus.ACTIVE,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(store.storeId).toBe('STORE001')
      expect(store.status).toBe(PlatformTypes.StoreStatus.ACTIVE)
    })
  })

  describe('物流类型定义', () => {
    it('应该正确定义物流信息结构', () => {
      const logistics: LogisticsTypes.Logistics = {
        id: 1,
        orderNo: 'ORD001',
        trackingNumber: 'TRK001',
        carrier: '顺丰快递',
        status: LogisticsTypes.LogisticsStatus.SHIPPED,
        shippedAt: '2023-01-01T10:00:00Z',
        estimatedDeliveryAt: '2023-01-03T18:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(logistics.trackingNumber).toBe('TRK001')
      expect(logistics.status).toBe(LogisticsTypes.LogisticsStatus.SHIPPED)
    })

    it('应该正确定义物流状态枚举', () => {
      expect(LogisticsTypes.LogisticsStatus.PENDING).toBe(1)
      expect(LogisticsTypes.LogisticsStatus.SHIPPED).toBe(2)
      expect(LogisticsTypes.LogisticsStatus.IN_TRANSIT).toBe(3)
      expect(LogisticsTypes.LogisticsStatus.DELIVERED).toBe(4)
      expect(LogisticsTypes.LogisticsStatus.EXCEPTION).toBe(5)
    })

    it('应该正确定义物流轨迹结构', () => {
      const trace: LogisticsTypes.LogisticsTrace = {
        time: '2023-01-01T10:00:00Z',
        description: '快件已发出',
        location: '北京分拣中心'
      }

      expect(trace.description).toBe('快件已发出')
      expect(trace.location).toBe('北京分拣中心')
    })
  })

  describe('通知类型定义', () => {
    it('应该正确定义通知信息结构', () => {
      const notification: NotificationTypes.Notification = {
        id: 1,
        title: '库存预警',
        content: 'SKU001库存不足，请及时补货',
        type: NotificationTypes.NotificationType.INVENTORY,
        status: NotificationTypes.NotificationStatus.UNREAD,
        userId: 1,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(notification.title).toBe('库存预警')
      expect(notification.type).toBe(NotificationTypes.NotificationType.INVENTORY)
    })

    it('应该正确定义通知类型枚举', () => {
      expect(NotificationTypes.NotificationType.SYSTEM).toBe(1)
      expect(NotificationTypes.NotificationType.ORDER).toBe(2)
      expect(NotificationTypes.NotificationType.INVENTORY).toBe(3)
      expect(NotificationTypes.NotificationType.LOGISTICS).toBe(4)
    })

    it('应该正确定义通知模板结构', () => {
      const template: NotificationTypes.NotificationTemplate = {
        id: 1,
        name: '库存预警模板',
        title: '库存预警：{productName}',
        content: '商品{productName}(SKU:{sku})库存不足，当前库存：{currentStock}',
        type: NotificationTypes.NotificationType.INVENTORY,
        variables: ['productName', 'sku', 'currentStock'],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(template.variables).toHaveLength(3)
      expect(template.variables).toContain('productName')
    })
  })

  describe('系统类型定义', () => {
    it('应该正确定义系统配置结构', () => {
      const config: SystemTypes.SystemConfig = {
        key: 'system.name',
        value: 'ERP系统',
        description: '系统名称',
        type: 'string',
        editable: true
      }

      expect(config.key).toBe('system.name')
      expect(config.type).toBe('string')
    })

    it('应该正确定义系统日志结构', () => {
      const log: SystemTypes.SystemLog = {
        id: 1,
        level: 'INFO',
        message: '用户登录成功',
        module: 'USER',
        userId: 1,
        ip: '192.168.1.1',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(log.level).toBe('INFO')
      expect(log.module).toBe('USER')
    })

    it('应该正确定义系统状态结构', () => {
      const status: SystemTypes.SystemStatus = {
        cpuUsage: 45.5,
        memoryUsage: 68.2,
        diskUsage: 32.1,
        onlineUsers: 25,
        uptime: 86400
      }

      expect(status.cpuUsage).toBe(45.5)
      expect(status.onlineUsers).toBe(25)
    })
  })

  describe('基础实体类型', () => {
    it('应该正确定义基础实体结构', () => {
      const entity: BaseEntity = {
        id: 1,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      expect(entity.id).toBe(1)
      expect(entity.createdAt).toBe('2023-01-01T00:00:00Z')
      expect(entity.updatedAt).toBe('2023-01-01T00:00:00Z')
    })
  })
})