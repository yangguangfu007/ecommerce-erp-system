import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 路由元信息接口
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    permissions?: string[]
    roles?: string[]
    hideInMenu?: boolean
    icon?: string
  }
}

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hideInMenu: true
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: {
          title: '仪表板',
          icon: 'Dashboard',
          requiresAuth: true
        }
      },
      // 用户管理
      {
        path: '/users',
        name: 'UserManagement',
        component: () => import('@/views/users/UserManagement.vue'),
        meta: {
          title: '用户管理',
          icon: 'User',
          requiresAuth: true,
          permissions: ['user:view']
        }
      },
      {
        path: '/roles',
        name: 'RoleManagement',
        component: () => import('@/views/users/RoleManagement.vue'),
        meta: {
          title: '角色管理',
          icon: 'UserFilled',
          requiresAuth: true,
          permissions: ['role:view']
        }
      },
      // 商品管理
      {
        path: '/products',
        name: 'ProductManagement',
        component: () => import('@/views/products/ProductManagement.vue'),
        meta: {
          title: '商品管理',
          icon: 'Goods',
          requiresAuth: true,
          permissions: ['product:view']
        }
      },
      {
        path: '/products/import',
        name: 'ProductImport',
        component: () => import('@/views/products/ProductImport.vue'),
        meta: {
          title: '商品导入',
          requiresAuth: true,
          permissions: ['product:import'],
          hideInMenu: true
        }
      },
      // 库存管理
      {
        path: '/inventory',
        name: 'InventoryManagement',
        component: () => import('@/views/inventory/InventoryManagement.vue'),
        meta: {
          title: '库存管理',
          icon: 'Box',
          requiresAuth: true,
          permissions: ['inventory:view']
        }
      },
      {
        path: '/inventory/alerts',
        name: 'InventoryAlerts',
        component: () => import('@/views/inventory/InventoryAlerts.vue'),
        meta: {
          title: '库存预警',
          requiresAuth: true,
          permissions: ['inventory:alert'],
          hideInMenu: true
        }
      },
      // 订单管理
      {
        path: '/orders',
        name: 'OrderManagement',
        component: () => import('@/views/orders/OrderManagement.vue'),
        meta: {
          title: '订单管理',
          icon: 'Document',
          requiresAuth: true,
          permissions: ['order:view']
        }
      },
      {
        path: '/orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/orders/OrderDetail.vue'),
        meta: {
          title: '订单详情',
          requiresAuth: true,
          permissions: ['order:view'],
          hideInMenu: true
        }
      },
      // 物流管理
      {
        path: '/logistics',
        name: 'LogisticsManagement',
        component: () => import('@/views/logistics/LogisticsManagement.vue'),
        meta: {
          title: '物流管理',
          icon: 'Van',
          requiresAuth: true,
          permissions: ['logistics:view']
        }
      },
      {
        path: '/logistics/shipping-labels',
        name: 'ShippingLabels',
        component: () => import('@/views/logistics/ShippingLabels.vue'),
        meta: {
          title: '面单管理',
          requiresAuth: true,
          permissions: ['logistics:label'],
          hideInMenu: true
        }
      },
      {
        path: '/logistics/exceptions',
        name: 'LogisticsExceptionHandling',
        component: () => import('@/views/logistics/LogisticsExceptionHandling.vue'),
        meta: {
          title: '异常处理',
          requiresAuth: true,
          permissions: ['logistics:exception'],
          hideInMenu: true
        }
      },
      // 店铺管理
      {
        path: '/stores',
        name: 'StoreManagement',
        component: () => import('@/views/stores/StoreManagement.vue'),
        meta: {
          title: '店铺管理',
          icon: 'Shop',
          requiresAuth: true,
          permissions: ['store:view']
        }
      },
      // 平台管理
      {
        path: '/platforms',
        name: 'PlatformManagement',
        component: () => import('@/views/platforms/PlatformManagement.vue'),
        meta: {
          title: '平台管理',
          icon: 'Connection',
          requiresAuth: true,
          permissions: ['platform:view']
        }
      },
      // 通知管理
      {
        path: '/notifications',
        name: 'NotificationManagement',
        component: () => import('@/views/notifications/NotificationManagement.vue'),
        meta: {
          title: '通知管理',
          icon: 'Bell',
          requiresAuth: true,
          permissions: ['notification:view']
        }
      },
      // 通知发送与统计
      {
        path: '/notifications/send-stats',
        name: 'NotificationSendStats',
        component: () => import('@/views/notifications/NotificationSendStats.vue'),
        meta: {
          title: '通知发送与统计',
          icon: 'DataAnalysis',
          requiresAuth: true,
          permissions: ['notification:send', 'notification:stats']
        }
      },
      // 报表管理
      {
        path: '/reports',
        name: 'ReportGeneration',
        component: () => import('@/views/reports/ReportGeneration.vue'),
        meta: {
          title: '报表生成',
          icon: 'DataAnalysis',
          requiresAuth: true,
          permissions: ['report:view']
        }
      },
      {
        path: '/reports/data-filter-query',
        name: 'DataFilterQuery',
        component: () => import('@/views/reports/DataFilterQuery.vue'),
        meta: {
          title: '数据筛选查询',
          icon: 'Search',
          requiresAuth: true,
          permissions: ['report:query']
        }
      },
      // 系统监控
      {
        path: '/monitor',
        name: 'SystemMonitor',
        component: () => import('@/views/monitor/SystemMonitor.vue'),
        meta: {
          title: '系统监控',
          icon: 'Monitor',
          requiresAuth: true,
          permissions: ['system:monitor']
        }
      },
      // 系统设置
      {
        path: '/settings',
        name: 'SystemSettings',
        component: () => import('@/views/settings/SystemSettings.vue'),
        meta: {
          title: '系统设置',
          icon: 'Setting',
          requiresAuth: true,
          permissions: ['system:setting']
        }
      }
    ]
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: {
      title: '页面不存在',
      hideInMenu: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫 - 只在非测试环境中添加
if (typeof window !== 'undefined' && !import.meta.env.VITEST) {
  router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - ERP管理系统`
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    // 检查权限
    if (to.meta.permissions && to.meta.permissions.length > 0) {
      const hasPermission = userStore.hasAnyPermission(to.meta.permissions)
      if (!hasPermission) {
        ElMessage.error('没有访问权限')
        next({ name: 'Dashboard' })
        return
      }
    }

    // 检查角色
    if (to.meta.roles && to.meta.roles.length > 0) {
      const hasRole = to.meta.roles.some(role => userStore.hasRole(role))
      if (!hasRole) {
        ElMessage.error('没有访问权限')
        next({ name: 'Dashboard' })
        return
      }
    }
  }

  // 已登录用户访问登录页，重定向到首页
  if (to.name === 'Login' && userStore.isLoggedIn) {
    next({ name: 'Dashboard' })
    return
  }

  next()
  })
}

export default router
