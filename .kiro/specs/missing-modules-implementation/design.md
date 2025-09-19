# 缺失功能模块补全设计文档

## 概述

本设计文档基于需求文档，详细描述了如何实现缺失功能模块的补全。主要包括导航菜单结构优化、页面布局统一、组件规范化以及交互体验提升等方面的设计方案。

## 架构

### 整体架构设计

```
前端架构层次：
├── 布局层 (Layout Layer)
│   ├── MainLayout.vue - 主布局组件
│   ├── 导航菜单系统 - 侧边栏菜单
│   ├── 页面头部系统 - 统一头部布局
│   └── 通知系统 - 实时通知管理
├── 页面层 (Page Layer)
│   ├── 平台管理页面组
│   ├── 物流管理页面组
│   ├── 通知中心页面组
│   └── 系统设置页面组
├── 组件层 (Component Layer)
│   ├── 业务组件 - 特定功能组件
│   ├── 通用组件 - 可复用组件
│   └── 基础组件 - UI基础组件
└── 服务层 (Service Layer)
    ├── API服务 - 后端接口调用
    ├── 状态管理 - Pinia stores
    └── 工具函数 - 通用工具
```

### 导航系统架构

```
导航系统组成：
├── useNavigation.ts - 导航逻辑组合函数
├── NavigationConfig - 菜单配置数据
├── MenuRenderer - 菜单渲染组件
├── BreadcrumbNav - 面包屑导航组件
└── PermissionGuard - 权限控制守卫
```

## 组件和接口

### 1. 导航菜单组件设计

#### NavigationMenu 组件

```typescript
// 导航菜单项接口
interface NavigationItem {
  id: string
  title: string
  path?: string
  icon?: string
  children?: NavigationItem[]
  permissions?: string[]
  badge?: string | number
  disabled?: boolean
  external?: boolean
}

// 导航菜单组件属性
interface NavigationMenuProps {
  items: NavigationItem[]
  collapsed: boolean
  activeMenuId: string
  expandedMenus: string[]
}

// 导航菜单事件
interface NavigationMenuEvents {
  onMenuClick: (item: NavigationItem) => void
  onMenuToggle: (menuId: string) => void
  onMenuExpand: (menuId: string, expanded: boolean) => void
}
```

#### 菜单配置更新

```typescript
// 更新后的导航配置
const navigationConfig: NavigationItem[] = [
  // ... 其他菜单项
  {
    id: 'platform-management',
    title: '平台管理',
    icon: 'Connection',
    permissions: ['platform:view'],
    children: [
      {
        id: 'platform-list',
        title: '平台列表',
        path: '/platforms',
        permissions: ['platform:view']
      },
      {
        id: 'platform-config',
        title: '平台配置',
        path: '/platforms/config',
        permissions: ['platform:config']
      }
    ]
  },
  {
    id: 'logistics-management',
    title: '物流管理',
    icon: 'Van',
    permissions: ['logistics:view'],
    children: [
      {
        id: 'logistics-list',
        title: '物流列表',
        path: '/logistics',
        permissions: ['logistics:view']
      },
      {
        id: 'shipping-labels',
        title: '面单管理',
        path: '/logistics/shipping-labels',
        permissions: ['logistics:label']
      }
    ]
  },
  {
    id: 'notification-center',
    title: '通知中心',
    icon: 'Bell',
    path: '/notifications',
    permissions: ['notification:view']
  },
  {
    id: 'system-settings',
    title: '系统设置',
    icon: 'Setting',
    permissions: ['system:setting'],
    children: [
      {
        id: 'system-config',
        title: '系统配置',
        path: '/settings',
        permissions: ['system:setting']
      },
      {
        id: 'system-logs',
        title: '系统日志',
        path: '/settings/logs',
        permissions: ['system:log']
      }
    ]
  }
]
```

### 2. 页面头部组件设计

#### PageHeader 组件

```typescript
// 页面头部组件属性
interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  showRefresh?: boolean
  showHelp?: boolean
  actions?: ActionButton[]
  breadcrumb?: BreadcrumbItem[]
}

// 操作按钮接口
interface ActionButton {
  key: string
  label: string
  icon?: string
  type?: 'primary' | 'default' | 'danger'
  loading?: boolean
  disabled?: boolean
  permissions?: string[]
}

// 页面头部事件
interface PageHeaderEvents {
  onBack: () => void
  onRefresh: () => void
  onHelp: () => void
  onAction: (key: string) => void
}
```

#### 使用示例

```vue
<template>
  <PageHeader
    title="平台管理"
    subtitle="管理电商平台连接和配置"
    :show-refresh="true"
    :actions="headerActions"
    @refresh="handleRefresh"
    @action="handleAction"
  />
</template>

<script setup lang="ts">
const headerActions = [
  {
    key: 'add',
    label: '添加平台',
    icon: 'Plus',
    type: 'primary',
    permissions: ['platform:create']
  },
  {
    key: 'export',
    label: '导出数据',
    icon: 'Download',
    permissions: ['platform:export']
  }
]
</script>
```

### 3. 数据表格组件设计

#### DataTable 组件

```typescript
// 表格列配置接口
interface TableColumn {
  key: string
  title: string
  dataIndex: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: any, index: number) => VNode
  permissions?: string[]
}

// 表格组件属性
interface DataTableProps {
  columns: TableColumn[]
  dataSource: any[]
  loading?: boolean
  pagination?: PaginationConfig
  selection?: SelectionConfig
  actions?: TableAction[]
  emptyText?: string
  size?: 'small' | 'default' | 'large'
}

// 分页配置
interface PaginationConfig {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  pageSizeOptions?: string[]
}

// 选择配置
interface SelectionConfig {
  type: 'checkbox' | 'radio'
  selectedRowKeys: (string | number)[]
  onChange: (selectedRowKeys: (string | number)[], selectedRows: any[]) => void
}
```

### 4. 表单组件设计

#### FormBuilder 组件

```typescript
// 表单字段配置接口
interface FormField {
  name: string
  label: string
  type: 'input' | 'select' | 'textarea' | 'date' | 'upload' | 'switch'
  required?: boolean
  rules?: ValidationRule[]
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  span?: number
  permissions?: string[]
}

// 表单构建器属性
interface FormBuilderProps {
  fields: FormField[]
  model: Record<string, any>
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelWidth?: string
  size?: 'small' | 'default' | 'large'
  readonly?: boolean
}

// 验证规则接口
interface ValidationRule {
  required?: boolean
  message?: string
  pattern?: RegExp
  validator?: (rule: any, value: any) => Promise<void>
}
```

### 5. 通知系统设计

#### NotificationService

```typescript
// 通知类型枚举
enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

// 通知数据接口
interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  content: string
  read: boolean
  createdAt: string
  actions?: NotificationAction[]
}

// 通知操作接口
interface NotificationAction {
  key: string
  label: string
  type?: 'primary' | 'default'
  handler: () => void
}

// 通知服务类
class NotificationService {
  // 获取通知列表
  async getNotifications(params: {
    page: number
    size: number
    type?: NotificationType
    read?: boolean
  }): Promise<{ items: NotificationItem[], total: number }>

  // 标记为已读
  async markAsRead(ids: string[]): Promise<void>

  // 删除通知
  async deleteNotifications(ids: string[]): Promise<void>

  // 获取未读数量
  async getUnreadCount(): Promise<number>

  // 实时通知推送
  onNotification(callback: (notification: NotificationItem) => void): void
}
```

## 数据模型

### 1. 平台管理数据模型

```typescript
// 平台信息接口
interface Platform {
  id: string
  name: string
  type: 'WALMART' | 'AMAZON' | 'EBAY'
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR'
  config: PlatformConfig
  lastSyncTime?: string
  createdAt: string
  updatedAt: string
}

// 平台配置接口
interface PlatformConfig {
  apiKey: string
  apiSecret: string
  endpoint: string
  storeId?: string
  additionalParams?: Record<string, any>
}

// 平台状态统计
interface PlatformStats {
  totalPlatforms: number
  activePlatforms: number
  errorPlatforms: number
  lastSyncTime: string
}
```

### 2. 物流管理数据模型

```typescript
// 物流订单接口
interface LogisticsOrder {
  id: string
  orderNumber: string
  trackingNumber?: string
  carrier: string
  status: 'PENDING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'EXCEPTION'
  shippingAddress: Address
  estimatedDelivery?: string
  actualDelivery?: string
  createdAt: string
  updatedAt: string
}

// 面单信息接口
interface ShippingLabel {
  id: string
  orderId: string
  labelUrl: string
  trackingNumber: string
  carrier: string
  weight: number
  dimensions: Dimensions
  cost: number
  createdAt: string
}

// 地址接口
interface Address {
  name: string
  phone: string
  address1: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
}

// 尺寸接口
interface Dimensions {
  length: number
  width: number
  height: number
  unit: 'cm' | 'inch'
}
```

### 3. 通知数据模型

```typescript
// 通知模板接口
interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  title: string
  content: string
  variables: string[]
  enabled: boolean
  createdAt: string
  updatedAt: string
}

// 通知规则接口
interface NotificationRule {
  id: string
  name: string
  event: string
  conditions: RuleCondition[]
  templateId: string
  recipients: string[]
  enabled: boolean
  createdAt: string
}

// 规则条件接口
interface RuleCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains'
  value: any
}
```

### 4. 系统设置数据模型

```typescript
// 系统配置接口
interface SystemConfig {
  id: string
  category: string
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json'
  description: string
  editable: boolean
  updatedAt: string
}

// 系统日志接口
interface SystemLog {
  id: string
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  message: string
  module: string
  userId?: string
  ip?: string
  userAgent?: string
  createdAt: string
}

// 系统状态接口
interface SystemStatus {
  services: ServiceStatus[]
  database: DatabaseStatus
  cache: CacheStatus
  queue: QueueStatus
  lastCheck: string
}

// 服务状态接口
interface ServiceStatus {
  name: string
  status: 'UP' | 'DOWN' | 'DEGRADED'
  responseTime: number
  lastCheck: string
}
```

## 错误处理

### 错误处理策略

```typescript
// 错误类型枚举
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

// 错误信息接口
interface ErrorInfo {
  type: ErrorType
  code: string
  message: string
  details?: any
  timestamp: string
}

// 错误处理服务
class ErrorHandler {
  // 处理API错误
  handleApiError(error: any): ErrorInfo {
    // 根据错误类型进行分类处理
    // 返回标准化的错误信息
  }

  // 显示错误提示
  showError(error: ErrorInfo): void {
    // 根据错误类型选择合适的提示方式
    // 支持toast、modal、页面提示等
  }

  // 错误恢复建议
  getRecoveryActions(error: ErrorInfo): RecoveryAction[] {
    // 根据错误类型提供恢复建议
    // 如重试、刷新、联系管理员等
  }
}

// 恢复操作接口
interface RecoveryAction {
  key: string
  label: string
  handler: () => void
}
```

### 全局错误边界

```vue
<!-- ErrorBoundary.vue -->
<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <el-icon class="error-icon"><Warning /></el-icon>
      <h3>页面出现错误</h3>
      <p>{{ errorMessage }}</p>
      <div class="error-actions">
        <el-button @click="retry">重试</el-button>
        <el-button @click="goHome">返回首页</el-button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const hasError = ref(false)
const errorMessage = ref('')
const router = useRouter()

onErrorCaptured((error) => {
  hasError.value = true
  errorMessage.value = error.message || '未知错误'
  console.error('Error captured:', error)
  return false
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  // 重新加载当前页面
  window.location.reload()
}

const goHome = () => {
  router.push('/dashboard')
}
</script>
```

## 测试策略

### 单元测试

```typescript
// 导航组合函数测试
describe('useNavigation', () => {
  test('should filter navigation by permissions', () => {
    const mockUserStore = {
      hasAnyPermission: vi.fn().mockReturnValue(true)
    }
    
    const { visibleNavigation } = useNavigation()
    
    expect(visibleNavigation.value).toHaveLength(expectedLength)
    expect(mockUserStore.hasAnyPermission).toHaveBeenCalled()
  })

  test('should generate correct breadcrumb', () => {
    const { generateBreadcrumb } = useNavigation()
    const breadcrumb = generateBreadcrumb('/platforms/config')
    
    expect(breadcrumb).toEqual([
      { title: '首页', path: '/dashboard' },
      { title: '平台管理', path: '/platforms' },
      { title: '平台配置', path: '/platforms/config' }
    ])
  })
})
```

### 组件测试

```typescript
// 页面头部组件测试
describe('PageHeader', () => {
  test('should render title and actions', () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: '测试标题',
        actions: [
          { key: 'add', label: '添加', type: 'primary' }
        ]
      }
    })

    expect(wrapper.find('.page-title').text()).toBe('测试标题')
    expect(wrapper.find('.action-button').exists()).toBe(true)
  })

  test('should emit action event when button clicked', async () => {
    const wrapper = mount(PageHeader, {
      props: {
        title: '测试标题',
        actions: [{ key: 'add', label: '添加' }]
      }
    })

    await wrapper.find('.action-button').trigger('click')
    expect(wrapper.emitted('action')).toEqual([['add']])
  })
})
```

### 集成测试

```typescript
// 导航集成测试
describe('Navigation Integration', () => {
  test('should navigate to correct page when menu clicked', async () => {
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [router, pinia]
      }
    })

    const menuItem = wrapper.find('[data-menu-id="platform-list"]')
    await menuItem.trigger('click')

    expect(router.currentRoute.value.path).toBe('/platforms')
  })

  test('should show correct active menu state', async () => {
    await router.push('/platforms/config')
    
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [router, pinia]
      }
    })

    const activeMenu = wrapper.find('.nav-item.active')
    expect(activeMenu.exists()).toBe(true)
  })
})
```

### E2E测试

```typescript
// 端到端测试
describe('Platform Management E2E', () => {
  test('should complete platform configuration flow', async () => {
    // 登录
    await page.goto('/login')
    await page.fill('[data-test="username"]', 'admin')
    await page.fill('[data-test="password"]', 'admin123')
    await page.click('[data-test="login-button"]')

    // 导航到平台管理
    await page.click('[data-menu-id="platform-management"]')
    await page.click('[data-submenu-id="platform-config"]')

    // 添加平台配置
    await page.click('[data-test="add-platform"]')
    await page.fill('[data-test="platform-name"]', '测试平台')
    await page.selectOption('[data-test="platform-type"]', 'WALMART')
    await page.fill('[data-test="api-key"]', 'test-api-key')
    await page.click('[data-test="save-button"]')

    // 验证结果
    await expect(page.locator('.success-message')).toBeVisible()
    await expect(page.locator('[data-test="platform-list"]')).toContainText('测试平台')
  })
})
```

## 性能优化

### 代码分割

```typescript
// 路由懒加载
const routes = [
  {
    path: '/platforms',
    component: () => import('@/views/platforms/PlatformManagement.vue')
  },
  {
    path: '/platforms/config',
    component: () => import('@/views/platforms/PlatformConfig.vue')
  }
]

// 组件懒加载
const LazyDataTable = defineAsyncComponent(() => 
  import('@/components/common/DataTable.vue')
)
```

### 状态管理优化

```typescript
// 使用 Pinia 进行状态管理
export const usePlatformStore = defineStore('platform', () => {
  const platforms = ref<Platform[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 缓存策略
  const cache = new Map<string, { data: any, timestamp: number }>()
  const CACHE_DURATION = 5 * 60 * 1000 // 5分钟

  const fetchPlatforms = async (force = false) => {
    const cacheKey = 'platforms'
    const cached = cache.get(cacheKey)
    
    if (!force && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      platforms.value = cached.data
      return
    }

    loading.value = true
    try {
      const data = await platformApi.getPlatforms()
      platforms.value = data
      cache.set(cacheKey, { data, timestamp: Date.now() })
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    platforms: readonly(platforms),
    loading: readonly(loading),
    error: readonly(error),
    fetchPlatforms
  }
})
```

### 虚拟滚动

```vue
<!-- 大数据量表格虚拟滚动 -->
<template>
  <div class="virtual-table">
    <VirtualList
      :items="tableData"
      :item-height="50"
      :container-height="400"
      v-slot="{ item, index }"
    >
      <TableRow :data="item" :index="index" />
    </VirtualList>
  </div>
</template>
```

这个设计文档涵盖了所有需求的技术实现方案，包括组件设计、数据模型、错误处理、测试策略和性能优化等方面。