# 前端功能实现设计文档

## 概述

本设计文档基于现有的电商ERP系统后端API，设计完整的前端管理界面实现方案。当前系统只有基础的登录功能，所有页面都显示假数据。本设计旨在实现与后端API的完整对接，替换所有假数据，提供真实的业务功能和用户友好的管理界面。系统将采用Vue 3 + TypeScript + Element Plus技术栈，专注于Web端ERP系统，支持主流浏览器的兼容性。

## 架构设计

### 前端技术栈

- **框架**: Vue 3.4+ (Composition API)
- **语言**: TypeScript 5.0+
- **UI库**: Element Plus 2.10+
- **状态管理**: Pinia 3.0+
- **路由**: Vue Router 4.5+
- **HTTP客户端**: Axios 1.10+
- **构建工具**: Vite 7.0+
- **代码规范**: ESLint + Prettier

### 项目结构设计

```
erp-frontend/
├── src/
│   ├── api/                    # API接口层
│   │   ├── modules/           # 按模块分组的API
│   │   ├── request.ts         # Axios配置和拦截器
│   │   └── types.ts           # API类型定义
│   ├── components/            # 公共组件
│   │   ├── common/           # 通用组件
│   │   ├── business/         # 业务组件
│   │   └── charts/           # 图表组件
│   ├── composables/          # 组合式函数
│   ├── layouts/              # 布局组件
│   ├── router/               # 路由配置
│   ├── stores/               # Pinia状态管理
│   ├── styles/               # 样式文件
│   ├── types/                # TypeScript类型定义
│   ├── utils/                # 工具函数
│   └── views/                # 页面组件
│       ├── auth/             # 认证相关页面
│       ├── dashboard/        # 仪表板
│       ├── users/            # 用户管理
│       ├── products/         # 商品管理
│       ├── orders/           # 订单管理
│       ├── inventory/        # 库存管理
│       ├── platforms/        # 平台管理
│       ├── logistics/        # 物流管理
│       ├── notifications/    # 通知管理
│       └── settings/         # 系统设置
```

## 组件和接口设计

### API接口层设计

基于现有后端微服务API，设计统一的前端API调用层，支持与8个核心微服务的完整对接：

```typescript
// api/request.ts - Axios配置和拦截器
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code === 200) {
      return data
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

// API模块化设计
// api/modules/user.ts - 用户管理API
export const userApi = {
  login: (data: LoginForm) => request.post('/users/login', data),
  getUserInfo: () => request.get('/users/profile'),
  getUsers: (params: PageQuery) => request.get('/users', { params }),
  createUser: (data: CreateUserForm) => request.post('/users', data),
  updateUser: (id: number, data: UpdateUserForm) => request.put(`/users/${id}`, data),
  deleteUser: (id: number) => request.delete(`/users/${id}`),
  getRoles: () => request.get('/users/roles'),
  updateUserRoles: (userId: number, roleIds: number[]) => request.put(`/users/${userId}/roles`, { roleIds })
}

// api/modules/product.ts - 商品管理API
export const productApi = {
  getProducts: (params: ProductQuery) => request.get('/products', { params }),
  getProduct: (id: number) => request.get(`/products/${id}`),
  createProduct: (data: CreateProductForm) => request.post('/products', data),
  updateProduct: (id: number, data: UpdateProductForm) => request.put(`/products/${id}`, data),
  deleteProduct: (id: number) => request.delete(`/products/${id}`),
  batchImport: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getCategories: () => request.get('/products/categories'),
  searchProducts: (keyword: string) => request.get('/products/search', { params: { keyword } })
}
```

### 状态管理设计

使用Pinia进行全局状态管理：

```typescript
// stores/user.ts - 用户状态管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginForm } from '@/types/user'
import { login, getUserInfo } from '@/api/modules/user'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<User | null>(null)
  const permissions = ref<string[]>([])

  const isLoggedIn = computed(() => !!token.value)
  const hasPermission = (permission: string) => {
    return permissions.value.includes(permission)
  }

  const loginAction = async (loginForm: LoginForm) => {
    const result = await login(loginForm)
    token.value = result.token
    await getUserInfoAction()
  }

  const getUserInfoAction = async () => {
    const result = await getUserInfo()
    userInfo.value = result.user
    permissions.value = result.permissions
  }

  return {
    token,
    userInfo,
    permissions,
    isLoggedIn,
    hasPermission,
    loginAction,
    getUserInfoAction
  }
})
```

### 路由设计

基于权限的动态路由配置：

```typescript
// router/index.ts - 路由配置
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '仪表板', icon: 'dashboard' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'user', permission: 'user:view' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/products/ProductManagement.vue'),
        meta: { title: '商品管理', icon: 'goods', permission: 'product:view' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/orders/OrderManagement.vue'),
        meta: { title: '订单管理', icon: 'order', permission: 'order:view' }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/inventory/InventoryManagement.vue'),
        meta: { title: '库存管理', icon: 'stock', permission: 'inventory:view' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.permission && !userStore.hasPermission(to.meta.permission)) {
    next('/403')
  } else {
    next()
  }
})
```

## 数据模型设计

### TypeScript类型定义

```typescript
// types/common.ts - 通用类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageQuery {
  page: number
  size: number
  keyword?: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

// types/user.ts - 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  phone?: string
  status: number
  roles: Role[]
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: number
  name: string
  code: string
  permissions: Permission[]
}

export interface Permission {
  id: number
  name: string
  code: string
  type: string
}

// types/product.ts - 商品相关类型
export interface Product {
  id: number
  sku: string
  name: string
  category: string
  price: number
  stock: number
  status: number
  images: string[]
  attributes: ProductAttribute[]
  createdAt: string
  updatedAt: string
}

export interface ProductAttribute {
  name: string
  value: string
}

// types/order.ts - 订单相关类型
export interface Order {
  id: number
  orderNo: string
  platformOrderId: string
  status: OrderStatus
  totalAmount: number
  items: OrderItem[]
  shippingAddress: Address
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  productId: number
  sku: string
  quantity: number
  price: number
}

// types/inventory.ts - 库存相关类型
export interface Inventory {
  id: number
  sku: string
  productName: string
  totalStock: number
  availableStock: number
  reservedStock: number
  alertThreshold: number
  status: InventoryStatus
  lastUpdated: string
}

// types/platform.ts - 平台相关类型
export interface Platform {
  id: number
  name: string
  type: PlatformType
  config: PlatformConfig
  status: PlatformStatus
  lastSyncTime: string
}

export interface Store {
  id: number
  platformId: number
  name: string
  storeId: string
  config: StoreConfig
  status: StoreStatus
}
```## 数据可视化和报表设计

### 仪表板组件设计

基于ECharts实现数据可视化，提供业务关键指标的实时展示：

```typescript
// components/charts/DashboardChart.vue - 仪表板图表组件
import { defineComponent, ref, onMounted } from 'vue'
import * as echarts from 'echarts'

export default defineComponent({
  name: 'DashboardChart',
  props: {
    chartType: {
      type: String,
      required: true,
      validator: (value: string) => ['line', 'bar', 'pie', 'gauge'].includes(value)
    },
    data: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const chartRef = ref<HTMLElement>()
    let chartInstance: echarts.ECharts | null = null

    const initChart = () => {
      if (!chartRef.value) return
      
      chartInstance = echarts.init(chartRef.value)
      const option = generateChartOption(props.chartType, props.data, props.title)
      chartInstance.setOption(option)
    }

    const generateChartOption = (type: string, data: any[], title: string) => {
      const baseOption = {
        title: { text: title },
        tooltip: { trigger: 'axis' },
        legend: { data: [] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
      }

      switch (type) {
        case 'line':
          return {
            ...baseOption,
            xAxis: { type: 'category', data: data.map(item => item.name) },
            yAxis: { type: 'value' },
            series: [{
              data: data.map(item => item.value),
              type: 'line',
              smooth: true
            }]
          }
        case 'bar':
          return {
            ...baseOption,
            xAxis: { type: 'category', data: data.map(item => item.name) },
            yAxis: { type: 'value' },
            series: [{
              data: data.map(item => item.value),
              type: 'bar'
            }]
          }
        case 'pie':
          return {
            ...baseOption,
            series: [{
              name: title,
              type: 'pie',
              radius: '50%',
              data: data,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }]
          }
        default:
          return baseOption
      }
    }

    onMounted(() => {
      initChart()
    })

    return {
      chartRef
    }
  }
})
```

### 报表导出功能

```typescript
// utils/export.ts - 数据导出工具
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export class ExportUtils {
  /**
   * 导出Excel文件
   */
  static exportToExcel(data: any[], filename: string, sheetName = 'Sheet1') {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  /**
   * 导出PDF文件
   */
  static exportToPDF(data: any[], columns: string[], filename: string, title: string) {
    const doc = new jsPDF()
    
    // 添加标题
    doc.setFontSize(16)
    doc.text(title, 14, 22)
    
    // 添加表格
    doc.autoTable({
      head: [columns],
      body: data.map(item => columns.map(col => item[col])),
      startY: 30
    })
    
    doc.save(`${filename}.pdf`)
  }

  /**
   * 导出CSV文件
   */
  static exportToCSV(data: any[], filename: string) {
    const csvContent = this.convertToCSV(data)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  private static convertToCSV(data: any[]): string {
    if (!data.length) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = []
    
    // 添加表头
    csvRows.push(headers.join(','))
    
    // 添加数据行
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"')
        return `"${escaped}"`
      })
      csvRows.push(values.join(','))
    }
    
    return csvRows.join('\n')
  }
}
```

## 浏览器兼容性设计

### 主流浏览器支持

专注于Web端ERP系统，确保在主流浏览器上的良好兼容性：

```typescript
// utils/browserDetect.ts - 浏览器检测工具
export class BrowserDetect {
  static isChrome(): boolean {
    return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  }

  static isFirefox(): boolean {
    return /Firefox/.test(navigator.userAgent)
  }

  static isSafari(): boolean {
    return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)
  }

  static isEdge(): boolean {
    return /Edg/.test(navigator.userAgent)
  }

  static isIE(): boolean {
    return /MSIE|Trident/.test(navigator.userAgent)
  }

  static getSupportedFeatures() {
    return {
      webp: this.supportsWebP(),
      flexbox: this.supportsFlexbox(),
      grid: this.supportsGrid(),
      customProperties: this.supportsCustomProperties()
    }
  }

  private static supportsWebP(): boolean {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  private static supportsFlexbox(): boolean {
    return CSS.supports('display', 'flex')
  }

  private static supportsGrid(): boolean {
    return CSS.supports('display', 'grid')
  }

  private static supportsCustomProperties(): boolean {
    return CSS.supports('--custom', 'property')
  }
}
```

### CSS兼容性处理

```scss
// styles/compatibility.scss - 浏览器兼容性样式
// 支持的浏览器版本：
// Chrome 88+, Firefox 85+, Safari 14+, Edge 88+

.browser-compatibility {
  // Flexbox兼容性
  .flex-container {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
  }

  // Grid兼容性
  .grid-container {
    display: -ms-grid;
    display: grid;
    
    -ms-grid-columns: 1fr 1fr 1fr;
    grid-template-columns: repeat(3, 1fr);
    
    gap: 20px;
    -ms-grid-column-gap: 20px;
    -ms-grid-row-gap: 20px;
  }

  // 自定义属性回退
  .custom-properties {
    --primary-color: #409eff;
    color: #409eff; /* 回退值 */
    color: var(--primary-color);
  }

  // 滚动条样式（Webkit内核）
  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
      
      &:hover {
        background: #a8a8a8;
      }
    }
  }
}

// 针对特定浏览器的样式修复
@supports (-moz-appearance: none) {
  /* Firefox特定样式 */
  .firefox-fix {
    -moz-appearance: none;
  }
}

@supports (-webkit-appearance: none) {
  /* Webkit内核浏览器特定样式 */
  .webkit-fix {
    -webkit-appearance: none;
  }
}
```

### JavaScript兼容性处理

```typescript
// utils/polyfills.ts - 兼容性补丁
// 确保在较老版本浏览器中的功能正常

// Promise.allSettled polyfill (Chrome 76+, Firefox 71+)
if (!Promise.allSettled) {
  Promise.allSettled = function(promises: Promise<any>[]) {
    return Promise.all(
      promises.map(promise =>
        promise
          .then(value => ({ status: 'fulfilled', value }))
          .catch(reason => ({ status: 'rejected', reason }))
      )
    )
  }
}

// IntersectionObserver polyfill检查
export function loadIntersectionObserverPolyfill() {
  if (!('IntersectionObserver' in window)) {
    return import('intersection-observer')
  }
  return Promise.resolve()
}

// ResizeObserver polyfill检查
export function loadResizeObserverPolyfill() {
  if (!('ResizeObserver' in window)) {
    return import('@juggle/resize-observer').then(module => {
      window.ResizeObserver = module.ResizeObserver
    })
  }
  return Promise.resolve()
}
```

### 响应式布局设计

针对不同屏幕尺寸的Web端适配：

```scss
// styles/responsive.scss - Web端响应式断点
$breakpoints: (
  'sm': 768px,   // 小屏幕（平板横屏）
  'md': 992px,   // 中等屏幕（小桌面）
  'lg': 1200px,  // 大屏幕（桌面）
  'xl': 1600px   // 超大屏幕（大桌面）
);

@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// Web端布局组件
.web-layout {
  .sidebar {
    width: 200px;
    position: fixed;
    left: 0;
    top: 60px;
    height: calc(100vh - 60px);
    background: #fff;
    border-right: 1px solid #e4e7ed;
    overflow-y: auto;

    @include respond-to('md') {
      width: 250px;
    }

    @include respond-to('lg') {
      width: 280px;
    }
  }

  .main-content {
    margin-left: 200px;
    padding: 20px;
    min-height: calc(100vh - 60px);

    @include respond-to('md') {
      margin-left: 250px;
      padding: 24px;
    }

    @include respond-to('lg') {
      margin-left: 280px;
      padding: 32px;
    }
  }

  .header {
    height: 60px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    z-index: 1000;
  }
}

// 表格响应式优化
.responsive-table {
  .el-table {
    min-width: 800px; // 确保表格最小宽度
    
    @include respond-to('sm') {
      min-width: 1000px;
    }
    
    @include respond-to('lg') {
      min-width: 1200px;
    }
  }
  
  .table-container {
    overflow-x: auto;
    
    &::-webkit-scrollbar {
      height: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }
  }
}
```

## 错误处理设计

### 统一错误处理机制

```typescript
// utils/errorHandler.ts - 错误处理工具
import { ElMessage, ElNotification } from 'element-plus'

export class ErrorHandler {
  static handleApiError(error: any) {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          // 跳转到登录页
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络连接失败')
    }
  }

  static handleBusinessError(code: number, message: string) {
    switch (code) {
      case 1001:
        ElNotification.warning({
          title: '业务提醒',
          message: message
        })
        break
      case 1002:
        ElNotification.error({
          title: '业务错误',
          message: message
        })
        break
      default:
        ElMessage.error(message)
    }
  }
}
```

### 表单验证设计

```typescript
// utils/validation.ts - 表单验证规则
export const validationRules = {
  required: { required: true, message: '此字段为必填项', trigger: 'blur' },
  email: {
    type: 'email',
    message: '请输入正确的邮箱地址',
    trigger: 'blur'
  },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的手机号码',
    trigger: 'blur'
  },
  password: {
    min: 6,
    max: 20,
    message: '密码长度应在6-20位之间',
    trigger: 'blur'
  }
}
```

## 性能优化设计

### 代码分割和懒加载

```typescript
// router/index.ts - 路由懒加载
const routes = [
  {
    path: '/products',
    component: () => import(
      /* webpackChunkName: "products" */ 
      '@/views/products/ProductManagement.vue'
    )
  }
]

// 组件懒加载
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent({
  loader: () => import('@/components/HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 数据缓存策略

```typescript
// composables/useCache.ts - 数据缓存
import { ref, computed } from 'vue'

export function useCache<T>(key: string, fetcher: () => Promise<T>) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const cached = computed(() => {
    const cached = localStorage.getItem(key)
    return cached ? JSON.parse(cached) : null
  })

  const fetch = async (force = false) => {
    if (!force && cached.value) {
      data.value = cached.value
      return
    }

    loading.value = true
    error.value = null

    try {
      const result = await fetcher()
      data.value = result
      localStorage.setItem(key, JSON.stringify(result))
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetch }
}
```

### 虚拟滚动优化

```vue
<!-- components/VirtualTable.vue - 虚拟滚动表格 -->
<template>
  <div class="virtual-table" ref="containerRef">
    <div class="virtual-list" :style="{ height: totalHeight + 'px' }">
      <div
        class="virtual-item"
        v-for="item in visibleItems"
        :key="item.id"
        :style="{ transform: `translateY(${item.top}px)` }"
      >
        <slot :item="item.data" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  items: any[]
  itemHeight: number
}

const props = defineProps<Props>()
const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(0)

const totalHeight = computed(() => props.items.length * props.itemHeight)
const startIndex = computed(() => Math.floor(scrollTop.value / props.itemHeight))
const endIndex = computed(() => 
  Math.min(
    startIndex.value + Math.ceil(containerHeight.value / props.itemHeight) + 1,
    props.items.length
  )
)

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value).map((item, index) => ({
    id: startIndex.value + index,
    data: item,
    top: (startIndex.value + index) * props.itemHeight
  }))
})
</script>
```

## 国际化设计

### 多语言支持

```typescript
// i18n/index.ts - 国际化配置
import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

export default i18n
```

```json
// i18n/locales/zh-CN.json
{
  "common": {
    "confirm": "确认",
    "cancel": "取消",
    "save": "保存",
    "delete": "删除",
    "edit": "编辑",
    "search": "搜索",
    "reset": "重置",
    "submit": "提交"
  },
  "user": {
    "title": "用户管理",
    "username": "用户名",
    "email": "邮箱",
    "phone": "手机号",
    "status": "状态",
    "roles": "角色",
    "createTime": "创建时间",
    "actions": "操作"
  },
  "validation": {
    "required": "此字段为必填项",
    "email": "请输入正确的邮箱地址",
    "phone": "请输入正确的手机号码"
  }
}
```

## 主题和样式设计

### Element Plus主题定制

```scss
// styles/element-variables.scss - Element Plus主题变量
@forward 'element-plus/theme-chalk/src/common/var.scss' with (
  $colors: (
    'primary': (
      'base': #409eff,
    ),
    'success': (
      'base': #67c23a,
    ),
    'warning': (
      'base': #e6a23c,
    ),
    'danger': (
      'base': #f56c6c,
    ),
    'error': (
      'base': #f56c6c,
    ),
    'info': (
      'base': #909399,
    ),
  ),
);
```

### 响应式设计

```scss
// styles/responsive.scss - 响应式断点
$breakpoints: (
  'xs': 0,
  'sm': 576px,
  'md': 768px,
  'lg': 992px,
  'xl': 1200px,
  'xxl': 1600px
);

@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// 使用示例
.sidebar {
  width: 200px;
  
  @include respond-to('md') {
    width: 250px;
  }
  
  @include respond-to('xs') {
    width: 100%;
    position: fixed;
    z-index: 1000;
  }
}
```

## 部署和构建配置

### Vite构建配置

```typescript
// vite.config.ts - Vite配置
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'utils': ['axios', 'dayjs', 'lodash-es']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

### Docker部署配置

```dockerfile
# Dockerfile - 前端Docker配置
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf - Nginx配置
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 处理Vue Router的history模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://api-gateway:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 开发工具和规范

### 代码规范配置

```json
// .eslintrc.json - ESLint配置
{
  "extends": [
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    "vue/no-unused-components": "error"
  }
}
```

```json
// .prettierrc.json - Prettier配置
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "endOfLine": "lf"
}
```

### Git Hooks配置

```json
// package.json - Husky和lint-staged配置
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,less}": ["prettier --write"]
  }
}
```

## 测试策略

### 单元测试

使用Vitest进行组件和工具函数的单元测试：

```typescript
// tests/components/UserForm.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UserForm from '@/components/UserForm.vue'

describe('UserForm', () => {
  it('should render form fields correctly', () => {
    const wrapper = mount(UserForm)
    expect(wrapper.find('[data-test="username"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="email"]').exists()).toBe(true)
  })

  it('should validate required fields', async () => {
    const wrapper = mount(UserForm)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('此字段为必填项')
  })
})
```

### E2E测试

使用Cypress进行端到端测试：

```typescript
// cypress/e2e/user-management.cy.ts
describe('用户管理', () => {
  beforeEach(() => {
    cy.login('admin', 'password')
    cy.visit('/users')
  })

  it('应该能够查看用户列表', () => {
    cy.get('[data-test="user-table"]').should('be.visible')
    cy.get('[data-test="user-row"]').should('have.length.greaterThan', 0)
  })

  it('应该能够添加新用户', () => {
    cy.get('[data-test="add-user-btn"]').click()
    cy.get('[data-test="username"]').type('testuser')
    cy.get('[data-test="email"]').type('test@example.com')
    cy.get('[data-test="submit-btn"]').click()
    cy.contains('用户创建成功').should('be.visible')
  })
})
```

## 系统设置和配置设计

### 系统参数配置

```typescript
// types/settings.ts - 系统设置类型
export interface SystemSettings {
  id: number
  category: string
  key: string
  value: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'json'
  editable: boolean
  createdAt: string
  updatedAt: string
}

export interface SystemConfig {
  general: GeneralConfig
  notification: NotificationConfig
  security: SecurityConfig
  integration: IntegrationConfig
}

export interface GeneralConfig {
  systemName: string
  systemLogo: string
  timezone: string
  language: string
  dateFormat: string
  currency: string
}

// api/modules/settings.ts - 系统设置API
export const settingsApi = {
  getSettings: (category?: string) => request.get('/settings', { params: { category } }),
  updateSetting: (id: number, data: Partial<SystemSettings>) => 
    request.put(`/settings/${id}`, data),
  getSystemConfig: () => request.get('/settings/config'),
  updateSystemConfig: (config: Partial<SystemConfig>) => 
    request.put('/settings/config', config),
  getSystemLogs: (params: LogQuery) => request.get('/settings/logs', { params }),
  getSystemStatus: () => request.get('/settings/status'),
  backupData: () => request.post('/settings/backup'),
  restoreData: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/settings/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
```

### 系统监控组件

```vue
<!-- components/SystemMonitor.vue - 系统监控组件 -->
<template>
  <div class="system-monitor">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="monitor-card">
          <div class="monitor-item">
            <div class="monitor-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="monitor-info">
              <div class="monitor-value">{{ systemStatus.cpuUsage }}%</div>
              <div class="monitor-label">CPU使用率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="monitor-card">
          <div class="monitor-item">
            <div class="monitor-icon">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="monitor-info">
              <div class="monitor-value">{{ systemStatus.memoryUsage }}%</div>
              <div class="monitor-label">内存使用率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="monitor-card">
          <div class="monitor-item">
            <div class="monitor-icon">
              <el-icon><HardDrive /></el-icon>
            </div>
            <div class="monitor-info">
              <div class="monitor-value">{{ systemStatus.diskUsage }}%</div>
              <div class="monitor-label">磁盘使用率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="monitor-card">
          <div class="monitor-item">
            <div class="monitor-icon">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="monitor-info">
              <div class="monitor-value">{{ systemStatus.activeConnections }}</div>
              <div class="monitor-label">活跃连接</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 服务状态 -->
    <el-card class="service-status-card" style="margin-top: 20px;">
      <template #header>
        <span>服务状态</span>
      </template>
      <el-table :data="serviceStatus" style="width: 100%">
        <el-table-column prop="name" label="服务名称" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'running' ? 'success' : 'danger'">
              {{ row.status === 'running' ? '运行中' : '已停止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uptime" label="运行时间" />
        <el-table-column prop="lastCheck" label="最后检查时间" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { settingsApi } from '@/api/modules/settings'

const systemStatus = ref({
  cpuUsage: 0,
  memoryUsage: 0,
  diskUsage: 0,
  activeConnections: 0
})

const serviceStatus = ref([])
let statusInterval: NodeJS.Timeout

const fetchSystemStatus = async () => {
  try {
    const status = await settingsApi.getSystemStatus()
    systemStatus.value = status.system
    serviceStatus.value = status.services
  } catch (error) {
    console.error('获取系统状态失败:', error)
  }
}

onMounted(() => {
  fetchSystemStatus()
  // 每30秒更新一次状态
  statusInterval = setInterval(fetchSystemStatus, 30000)
})

onUnmounted(() => {
  if (statusInterval) {
    clearInterval(statusInterval)
  }
})
</script>

<style scoped>
.system-monitor {
  .monitor-card {
    .monitor-item {
      display: flex;
      align-items: center;
      
      .monitor-icon {
        font-size: 32px;
        color: #409eff;
        margin-right: 16px;
      }
      
      .monitor-info {
        .monitor-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
        }
        
        .monitor-label {
          font-size: 14px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
  }
  
  .service-status-card {
    .el-table {
      .el-tag {
        font-weight: normal;
      }
    }
  }
}
</style>
```

### 数据备份和恢复

```typescript
// composables/useBackup.ts - 备份恢复功能
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { settingsApi } from '@/api/modules/settings'

export function useBackup() {
  const backupLoading = ref(false)
  const restoreLoading = ref(false)

  const createBackup = async () => {
    try {
      await ElMessageBox.confirm(
        '确定要创建系统数据备份吗？此操作可能需要几分钟时间。',
        '确认备份',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      backupLoading.value = true
      const result = await settingsApi.backupData()
      
      // 下载备份文件
      const blob = new Blob([result], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `erp-backup-${new Date().toISOString().split('T')[0]}.sql`
      link.click()
      URL.revokeObjectURL(url)
      
      ElMessage.success('备份创建成功')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('备份创建失败')
      }
    } finally {
      backupLoading.value = false
    }
  }

  const restoreBackup = async (file: File) => {
    try {
      await ElMessageBox.confirm(
        '确定要恢复系统数据吗？此操作将覆盖现有数据，请确保已做好备份。',
        '确认恢复',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }
      )

      restoreLoading.value = true
      await settingsApi.restoreData(file)
      
      ElMessage.success('数据恢复成功，请刷新页面')
      
      // 3秒后自动刷新页面
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('数据恢复失败')
      }
    } finally {
      restoreLoading.value = false
    }
  }

  return {
    backupLoading,
    restoreLoading,
    createBackup,
    restoreBackup
  }
}
```## 性能优化设计


### 代码分割和懒加载

```typescript
// router/index.ts - 路由懒加载
const routes = [
  {
    path: '/products',
    component: () => import(
      /* webpackChunkName: "products" */ 
      '@/views/products/ProductManagement.vue'
    )
  }
]

// 组件懒加载
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent({
  loader: () => import('@/components/HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 数据缓存策略

```typescript
// composables/useCache.ts - 数据缓存
import { ref, computed } from 'vue'

export function useCache<T>(key: string, fetcher: () => Promise<T>) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const cached = computed(() => {
    const cached = localStorage.getItem(key)
    return cached ? JSON.parse(cached) : null
  })

  const fetch = async (force = false) => {
    if (!force && cached.value) {
      data.value = cached.value
      return
    }

    loading.value = true
    error.value = null

    try {
      const result = await fetcher()
      data.value = result
      localStorage.setItem(key, JSON.stringify(result))
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetch }
}
```

### 虚拟滚动优化

```vue
<!-- components/VirtualTable.vue - 虚拟滚动表格 -->
<template>
  <div class="virtual-table" ref="containerRef">
    <div class="virtual-list" :style="{ height: totalHeight + 'px' }">
      <div
        class="virtual-item"
        v-for="item in visibleItems"
        :key="item.id"
        :style="{ transform: `translateY(${item.top}px)` }"
      >
        <slot :item="item.data" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  items: any[]
  itemHeight: number
}

const props = defineProps<Props>()
const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(0)

const totalHeight = computed(() => props.items.length * props.itemHeight)
const startIndex = computed(() => Math.floor(scrollTop.value / props.itemHeight))
const endIndex = computed(() => 
  Math.min(
    startIndex.value + Math.ceil(containerHeight.value / props.itemHeight) + 1,
    props.items.length
  )
)

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value).map((item, index) => ({
    id: startIndex.value + index,
    data: item,
    top: (startIndex.value + index) * props.itemHeight
  }))
})
</script>
```

## 国际化设计

### 多语言支持

```typescript
// i18n/index.ts - 国际化配置
import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

export default i18n
```

```json
// i18n/locales/zh-CN.json
{
  "common": {
    "confirm": "确认",
    "cancel": "取消",
    "save": "保存",
    "delete": "删除",
    "edit": "编辑",
    "search": "搜索",
    "reset": "重置",
    "submit": "提交"
  },
  "user": {
    "title": "用户管理",
    "username": "用户名",
    "email": "邮箱",
    "phone": "手机号",
    "status": "状态",
    "roles": "角色",
    "createTime": "创建时间",
    "actions": "操作"
  },
  "validation": {
    "required": "此字段为必填项",
    "email": "请输入正确的邮箱地址",
    "phone": "请输入正确的手机号码"
  }
}
```## 主
题和样式设计

### Element Plus主题定制

```scss
// styles/element-variables.scss - Element Plus主题变量
@forward 'element-plus/theme-chalk/src/common/var.scss' with (
  $colors: (
    'primary': (
      'base': #409eff,
    ),
    'success': (
      'base': #67c23a,
    ),
    'warning': (
      'base': #e6a23c,
    ),
    'danger': (
      'base': #f56c6c,
    ),
    'error': (
      'base': #f56c6c,
    ),
    'info': (
      'base': #909399,
    ),
  ),
);
```

### 响应式设计

```scss
// styles/responsive.scss - 响应式断点
$breakpoints: (
  'xs': 0,
  'sm': 576px,
  'md': 768px,
  'lg': 992px,
  'xl': 1200px,
  'xxl': 1600px
);

@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// 使用示例
.sidebar {
  width: 200px;
  
  @include respond-to('md') {
    width: 250px;
  }
  
  @include respond-to('xs') {
    width: 100%;
    position: fixed;
    z-index: 1000;
  }
}
```

## 部署和构建配置

### Vite构建配置

```typescript
// vite.config.ts - Vite配置
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'utils': ['axios', 'dayjs', 'lodash-es']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

### Docker部署配置

```dockerfile
# Dockerfile - 前端Docker配置
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf - Nginx配置
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 处理Vue Router的history模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://api-gateway:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 开发工具和规范

### 代码规范配置

```json
// .eslintrc.json - ESLint配置
{
  "extends": [
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    "vue/no-unused-components": "error"
  }
}
```

```json
// .prettierrc.json - Prettier配置
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "endOfLine": "lf"
}
```

### Git Hooks配置

```json
// package.json - Husky和lint-staged配置
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,less}": ["prettier --write"]
  }
}
```

这个设计文档涵盖了前端实现的所有关键方面，包括架构设计、组件设计、状态管理、路由配置、错误处理、性能优化、国际化、主题定制、部署配置和开发规范。