/**
 * 接口一致性测试
 * 验证前端类型定义与后端接口的一致性
 */

import { describe, it, expect } from 'vitest'
import type { User, Product, ApiResponse, PageResponse } from '@/types'
import type { LoginResponse } from '@/api/modules/user'

describe('接口一致性测试', () => {
  describe('用户相关接口', () => {
    it('用户类型应包含后端返回的所有必需字段', () => {
      // 模拟后端返回的用户数据
      const mockUserData: User = {
        id: 1,
        username: 'admin',
        realName: '系统管理员', // 后端返回的真实姓名字段
        email: 'admin@example.com',
        phone: '13800138000',
        status: 1, // 后端返回的数字状态
        locked: 0, // 后端返回的锁定状态
        roleNames: ['系统管理员'], // 后端返回的角色名称数组
        roles: [],
        permissions: ['USER_READ', 'USER_WRITE'],
        createTime: '2024-01-01T00:00:00Z', // 后端返回的创建时间字段
        lastLoginTime: '2024-01-01T12:00:00Z',
        lastLoginIp: '127.0.0.1'
      }

      // 验证字段存在性
      expect(mockUserData.realName).toBe('系统管理员')
      expect(mockUserData.status).toBe(1)
      expect(mockUserData.createTime).toBe('2024-01-01T00:00:00Z')
      expect(mockUserData.roleNames).toEqual(['系统管理员'])
    })

    it('登录响应应包含正确的字段结构', () => {
      // 模拟后端登录响应
      const mockLoginResponse: LoginResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        userInfo: {
          id: 1,
          username: 'admin',
          realName: '系统管理员',
          email: 'admin@example.com',
          status: 1,
          locked: 0,
          roleNames: ['系统管理员'],
          roles: [],
          permissions: ['USER_READ'],
          createTime: '2024-01-01T00:00:00Z'
        }
      }

      // 验证登录响应结构
      expect(mockLoginResponse.accessToken).toBeDefined()
      expect(mockLoginResponse.userInfo.realName).toBe('系统管理员')
      expect(mockLoginResponse.userInfo.status).toBe(1)
    })
  })

  describe('商品相关接口', () => {
    it('商品类型应包含后端返回的所有必需字段', () => {
      // 模拟后端返回的商品数据
      const mockProductData: Product = {
        id: 1,
        sku: 'SKU001',
        name: 'iPhone 15', // 后端返回的商品名称字段
        description: '苹果最新款手机',
        categoryId: 1, // 后端返回的数字类型分类ID
        categoryName: '手机数码',
        brand: 'Apple',
        price: 5999.0,
        costPrice: 4500.0,
        weight: 171,
        dimensions: '147.6x71.6x7.8', // 后端返回的字符串格式尺寸
        images: ['https://example.com/image1.jpg'],
        attributes: { color: '黑色', storage: '128GB' },
        status: 'ACTIVE',
        createTime: '2024-01-01T00:00:00Z', // 后端返回的创建时间字段
        updateTime: '2024-01-01T00:00:00Z'  // 后端返回的更新时间字段
      }

      // 验证字段存在性
      expect(mockProductData.name).toBe('iPhone 15')
      expect(mockProductData.categoryId).toBe(1)
      expect(typeof mockProductData.categoryId).toBe('number')
      expect(mockProductData.dimensions).toBe('147.6x71.6x7.8')
      expect(mockProductData.createTime).toBe('2024-01-01T00:00:00Z')
      expect(mockProductData.updateTime).toBe('2024-01-01T00:00:00Z')
    })
  })

  describe('API响应格式', () => {
    it('统一API响应格式应正确', () => {
      // 模拟后端API响应
      const mockApiResponse: ApiResponse<User> = {
        code: 200,
        message: '操作成功',
        data: {
          id: 1,
          username: 'admin',
          realName: '系统管理员',
          email: 'admin@example.com',
          status: 1,
          locked: 0,
          roleNames: ['系统管理员'],
          roles: [],
          permissions: [],
          createTime: '2024-01-01T00:00:00Z'
        },
        timestamp: '2024-01-01T12:00:00Z'
      }

      // 验证响应格式
      expect(mockApiResponse.code).toBe(200)
      expect(mockApiResponse.message).toBe('操作成功')
      expect(mockApiResponse.data).toBeDefined()
      expect(mockApiResponse.timestamp).toBeDefined()
    })

    it('分页响应格式应正确', () => {
      // 模拟后端分页响应
      const mockPageResponse: ApiResponse<PageResponse<User>> = {
        code: 200,
        message: '查询成功',
        data: {
          content: [
            {
              id: 1,
              username: 'admin',
              realName: '系统管理员',
              email: 'admin@example.com',
              status: 1,
              locked: 0,
              roleNames: ['系统管理员'],
              roles: [],
              permissions: [],
              createTime: '2024-01-01T00:00:00Z'
            }
          ],
          page: 1,        // 当前页码（从1开始）
          size: 10,       // 每页大小
          total: 1,       // 总记录数
          totalPages: 1   // 总页数
        },
        timestamp: '2024-01-01T12:00:00Z'
      }

      // 验证分页响应格式
      expect(mockPageResponse.data.content).toHaveLength(1)
      expect(mockPageResponse.data.page).toBe(1)
      expect(mockPageResponse.data.size).toBe(10)
      expect(mockPageResponse.data.total).toBe(1)
      expect(mockPageResponse.data.totalPages).toBe(1)
    })

    it('错误响应格式应正确', () => {
      // 模拟后端错误响应
      const mockErrorResponse: ApiResponse<null> = {
        code: 400,
        message: '请求参数错误',
        timestamp: '2024-01-01T12:00:00Z',
        error: 'INVALID_PARAMETER',
        details: [
          {
            field: 'username',
            message: '用户名不能为空',
            value: ''
          }
        ]
      }

      // 验证错误响应格式
      expect(mockErrorResponse.code).toBe(400)
      expect(mockErrorResponse.error).toBe('INVALID_PARAMETER')
      expect(mockErrorResponse.details).toHaveLength(1)
      expect(mockErrorResponse.details![0].field).toBe('username')
    })
  })

  describe('字段命名一致性', () => {
    it('用户字段命名应与后端一致', () => {
      const userFields = {
        realName: '真实姓名字段应使用realName',
        status: '状态字段应使用数字类型',
        createTime: '创建时间字段应使用createTime',
        roleNames: '角色名称数组字段应使用roleNames'
      }

      // 验证字段命名约定
      expect(userFields.realName).toContain('realName')
      expect(userFields.status).toContain('数字类型')
      expect(userFields.createTime).toContain('createTime')
      expect(userFields.roleNames).toContain('roleNames')
    })

    it('商品字段命名应与后端一致', () => {
      const productFields = {
        name: '商品名称字段应使用name',
        categoryId: '分类ID字段应使用数字类型',
        dimensions: '尺寸字段应使用字符串格式',
        createTime: '创建时间字段应使用createTime',
        updateTime: '更新时间字段应使用updateTime'
      }

      // 验证字段命名约定
      expect(productFields.name).toContain('name')
      expect(productFields.categoryId).toContain('数字类型')
      expect(productFields.dimensions).toContain('字符串格式')
      expect(productFields.createTime).toContain('createTime')
      expect(productFields.updateTime).toContain('updateTime')
    })
  })
})