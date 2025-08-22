import type { AxiosRequestConfig } from 'axios'

/**
 * API统一响应接口（根据后端实际实现）
 */
export interface ApiResponse<T = any> {
  /** 响应状态码 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data?: T
  /** 响应时间戳 */
  timestamp: string
  /** 错误码（仅错误时） */
  error?: string
  /** 错误详情（仅参数错误时） */
  details?: ErrorDetail[]
}

/**
 * 错误详情接口
 */
export interface ErrorDetail {
  /** 错误字段 */
  field: string
  /** 错误消息 */
  message: string
  /** 错误值 */
  value?: any
}

/**
 * 扩展的请求配置接口
 */
export interface RequestConfig extends AxiosRequestConfig {
  /** 是否跳过错误处理 */
  skipErrorHandler?: boolean
  /** 是否跳过认证 */
  skipAuth?: boolean
}

/**
 * 分页查询参数
 */
export interface PageQuery {
  /** 页码 */
  page: number
  /** 每页大小 */
  size: number
  /** 搜索关键词 */
  keyword?: string
}

/**
 * 分页响应结果（根据后端实际实现统一格式）
 */
export interface PageResult<T> {
  /** 数据列表 */
  content: T[]
  /** 当前页码（从1开始） */
  page: number
  /** 每页大小 */
  size: number
  /** 总记录数 */
  total: number
  /** 总页数 */
  totalPages: number
}

/**
 * 基础实体接口
 */
export interface BaseEntity {
  /** 主键ID */
  id: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 用户相关类型
 */
export namespace UserTypes {
  /** 用户信息（根据后端实际实现统一字段） */
  export interface User extends BaseEntity {
    /** 用户名 */
    username: string
    /** 真实姓名（统一字段名） */
    realName: string
    /** 昵称 */
    nickname?: string
    /** 邮箱 */
    email: string
    /** 手机号 */
    phone?: string
    /** 头像 */
    avatar?: string
    /** 用户状态：1-启用，0-禁用 */
    status: number
    /** 用户状态字符串：ACTIVE/INACTIVE */
    statusStr: string
    /** 锁定状态：0-未锁定，1-锁定 */
    locked: number
    /** 最后登录时间 */
    lastLoginTime?: string
    /** 最后登录IP */
    lastLoginIp?: string
    /** 角色名称数组 */
    roleNames: string[]
    /** 用户角色 */
    roles: Role[]
    /** 权限代码数组 */
    permissions: string[]
    /** 备注 */
    remark?: string
  }

  /** 角色信息 */
  export interface Role {
    /** 角色ID */
    id: number
    /** 角色名称 */
    name: string
    /** 角色编码 */
    code: string
    /** 角色权限 */
    permissions: Permission[]
  }

  /** 权限信息 */
  export interface Permission {
    /** 权限ID */
    id: number
    /** 权限名称 */
    name: string
    /** 权限编码 */
    code: string
    /** 权限类型 */
    type: string
  }

  /** 登录表单 */
  export interface LoginForm {
    /** 用户名 */
    username: string
    /** 密码 */
    password: string
    /** 验证码 */
    captcha?: string
  }

  /** 登录响应（根据后端实际实现） */
  export interface LoginResponse {
    /** 访问令牌 */
    accessToken: string
    /** 刷新令牌 */
    refreshToken: string
    /** 令牌类型（Bearer） */
    tokenType: string
    /** 过期时间（秒） */
    expiresIn: number
    /** 用户信息 */
    userInfo: User
  }
}

/**
 * 商品相关类型
 */
export namespace ProductTypes {
  /** 商品信息（根据后端实际实现统一字段） */
  export interface Product extends BaseEntity {
    /** SKU编码 */
    sku: string
    /** 商品名称（统一使用name字段） */
    name: string
    /** 商品描述 */
    description?: string
    /** 商品分类ID（数字类型） */
    categoryId: number
    /** 商品分类名称 */
    categoryName?: string
    /** 商品品牌 */
    brand?: string
    /** 商品价格 */
    price: number
    /** 成本价格 */
    costPrice?: number
    /** 商品重量 */
    weight?: number
    /** 商品尺寸（字符串格式） */
    dimensions?: string
    /** 商品图片 */
    images: string[]
    /** 商品属性 */
    attributes: Record<string, any>
    /** 商品状态（枚举类型） */
    status: ProductStatus
  }

  /** 商品状态枚举 */
  export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED'
  }

  /** 商品属性 */
  export interface ProductAttribute {
    /** 属性名称 */
    name: string
    /** 属性值 */
    value: string
  }

  /** 商品分类 */
  export interface Category extends BaseEntity {
    /** 分类名称 */
    name: string
    /** 父分类ID */
    parentId?: number
    /** 分类层级 */
    level: number
    /** 排序 */
    sort: number
  }
}

/**
 * 订单相关类型
 */
export namespace OrderTypes {
  /** 订单状态枚举 */
  export enum OrderStatus {
    /** 待支付 */
    PENDING_PAYMENT = 1,
    /** 已支付 */
    PAID = 2,
    /** 已发货 */
    SHIPPED = 3,
    /** 已完成 */
    COMPLETED = 4,
    /** 已取消 */
    CANCELLED = 5
  }

  /** 订单信息 */
  export interface Order extends BaseEntity {
    /** 订单号 */
    orderNo: string
    /** 平台订单ID */
    platformOrderId: string
    /** 订单状态 */
    status: OrderStatus
    /** 订单总金额 */
    totalAmount: number
    /** 订单商品 */
    items: OrderItem[]
    /** 收货地址 */
    shippingAddress: Address
  }

  /** 订单商品 */
  export interface OrderItem {
    /** 商品项ID */
    id: number
    /** 商品ID */
    productId: number
    /** SKU编码 */
    sku: string
    /** 商品数量 */
    quantity: number
    /** 商品价格 */
    price: number
  }

  /** 收货地址 */
  export interface Address {
    /** 收货人姓名 */
    name: string
    /** 手机号 */
    phone: string
    /** 省份 */
    province: string
    /** 城市 */
    city: string
    /** 区县 */
    district: string
    /** 详细地址 */
    detail: string
    /** 邮政编码 */
    zipCode?: string
  }
}

/**
 * 库存相关类型
 */
export namespace InventoryTypes {
  /** 库存状态枚举 */
  export enum InventoryStatus {
    /** 正常 */
    NORMAL = 1,
    /** 预警 */
    WARNING = 2,
    /** 缺货 */
    OUT_OF_STOCK = 3
  }

  /** 库存信息 */
  export interface Inventory extends BaseEntity {
    /** SKU编码 */
    sku: string
    /** 商品名称 */
    productName: string
    /** 总库存 */
    totalStock: number
    /** 可用库存 */
    availableStock: number
    /** 预留库存 */
    reservedStock: number
    /** 预警阈值 */
    alertThreshold: number
    /** 库存状态 */
    status: InventoryStatus
  }

  /** 库存调整记录 */
  export interface InventoryTransaction extends BaseEntity {
    /** SKU编码 */
    sku: string
    /** 调整类型：1-入库，2-出库，3-调整 */
    type: number
    /** 调整数量 */
    quantity: number
    /** 调整前库存 */
    beforeStock: number
    /** 调整后库存 */
    afterStock: number
    /** 调整原因 */
    reason: string
    /** 操作人 */
    operator: string
  }
}

/**
 * 平台相关类型
 */
export namespace PlatformTypes {
  /** 平台类型枚举 */
  export enum PlatformType {
    /** 沃尔玛 */
    WALMART = 'WALMART',
    /** 亚马逊 */
    AMAZON = 'AMAZON',
    /** eBay */
    EBAY = 'EBAY'
  }

  /** 平台状态枚举 */
  export enum PlatformStatus {
    /** 正常 */
    ACTIVE = 1,
    /** 异常 */
    ERROR = 2,
    /** 禁用 */
    DISABLED = 3
  }

  /** 平台信息 */
  export interface Platform extends BaseEntity {
    /** 平台名称 */
    name: string
    /** 平台类型 */
    type: PlatformType
    /** 平台配置 */
    config: PlatformConfig
    /** 平台状态 */
    status: PlatformStatus
    /** 最后同步时间 */
    lastSyncTime: string
  }

  /** 平台配置 */
  export interface PlatformConfig {
    /** API密钥 */
    apiKey: string
    /** API密钥 */
    apiSecret: string
    /** 环境：sandbox-沙箱，production-生产 */
    environment: 'sandbox' | 'production'
    /** 其他配置 */
    [key: string]: any
  }

  /** 店铺信息 */
  export interface Store extends BaseEntity {
    /** 平台ID */
    platformId: number
    /** 店铺名称 */
    name: string
    /** 店铺ID */
    storeId: string
    /** 店铺配置 */
    config: StoreConfig
    /** 店铺状态 */
    status: StoreStatus
  }

  /** 店铺配置 */
  export interface StoreConfig {
    /** 店铺URL */
    storeUrl?: string
    /** 其他配置 */
    [key: string]: any
  }

  /** 店铺状态枚举 */
  export enum StoreStatus {
    /** 正常 */
    ACTIVE = 1,
    /** 异常 */
    ERROR = 2,
    /** 禁用 */
    DISABLED = 3
  }
}

/**
 * 物流相关类型
 */
export namespace LogisticsTypes {
  /** 物流状态枚举 */
  export enum LogisticsStatus {
    /** 待发货 */
    PENDING = 1,
    /** 已发货 */
    SHIPPED = 2,
    /** 运输中 */
    IN_TRANSIT = 3,
    /** 已送达 */
    DELIVERED = 4,
    /** 异常 */
    EXCEPTION = 5
  }

  /** 物流信息 */
  export interface Logistics extends BaseEntity {
    /** 订单号 */
    orderNo: string
    /** 运单号 */
    trackingNumber: string
    /** 物流公司 */
    carrier: string
    /** 物流状态 */
    status: LogisticsStatus
    /** 发货时间 */
    shippedAt?: string
    /** 预计送达时间 */
    estimatedDeliveryAt?: string
    /** 实际送达时间 */
    deliveredAt?: string
  }

  /** 物流轨迹 */
  export interface LogisticsTrace {
    /** 时间 */
    time: string
    /** 状态描述 */
    description: string
    /** 位置 */
    location?: string
  }
}

/**
 * 通知相关类型
 */
export namespace NotificationTypes {
  /** 通知类型枚举 */
  export enum NotificationType {
    /** 系统通知 */
    SYSTEM = 1,
    /** 订单通知 */
    ORDER = 2,
    /** 库存通知 */
    INVENTORY = 3,
    /** 物流通知 */
    LOGISTICS = 4
  }

  /** 通知状态枚举 */
  export enum NotificationStatus {
    /** 未读 */
    UNREAD = 1,
    /** 已读 */
    READ = 2
  }

  /** 通知信息 */
  export interface Notification extends BaseEntity {
    /** 通知标题 */
    title: string
    /** 通知内容 */
    content: string
    /** 通知类型 */
    type: NotificationType
    /** 通知状态 */
    status: NotificationStatus
    /** 接收用户ID */
    userId: number
  }

  /** 通知模板 */
  export interface NotificationTemplate extends BaseEntity {
    /** 模板名称 */
    name: string
    /** 模板标题 */
    title: string
    /** 模板内容 */
    content: string
    /** 模板类型 */
    type: NotificationType
    /** 模板变量 */
    variables: string[]
  }
}

/**
 * 系统相关类型
 */
export namespace SystemTypes {
  /** 系统配置 */
  export interface SystemConfig {
    /** 配置键 */
    key: string
    /** 配置值 */
    value: string
    /** 配置描述 */
    description: string
    /** 配置类型 */
    type: 'string' | 'number' | 'boolean' | 'json'
    /** 是否可编辑 */
    editable: boolean
  }

  /** 系统日志 */
  export interface SystemLog extends BaseEntity {
    /** 日志级别 */
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
    /** 日志消息 */
    message: string
    /** 日志模块 */
    module: string
    /** 操作用户 */
    userId?: number
    /** 请求IP */
    ip?: string
  }

  /** 系统状态 */
  export interface SystemStatus {
    /** CPU使用率 */
    cpuUsage: number
    /** 内存使用率 */
    memoryUsage: number
    /** 磁盘使用率 */
    diskUsage: number
    /** 在线用户数 */
    onlineUsers: number
    /** 系统运行时间 */
    uptime: number
  }
}