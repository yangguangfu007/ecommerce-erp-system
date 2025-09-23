import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 导航项接口
export interface NavigationItem {
  id: string
  title: string
  path?: string
  icon?: string
  children?: NavigationItem[]
  permissions?: string[]
  roles?: string[]
  badge?: string | number
  disabled?: boolean
  external?: boolean
  target?: '_blank' | '_self'
}

// 面包屑项接口
export interface BreadcrumbItem {
  title: string
  path?: string
  icon?: string
}

export function useNavigation() {
  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()

  // 状态
  const activeMenuId = ref<string>('')
  const expandedMenus = ref<string[]>([])
  const navigationHistory = ref<string[]>([])

  // 导航配置
  const navigationConfig: NavigationItem[] = [
    {
      id: 'dashboard',
      title: '仪表板',
      path: '/dashboard',
      icon: 'Dashboard'
    },
    {
      id: 'user-management',
      title: '用户管理',
      icon: 'User',
      permissions: ['user:view'],
      children: [
        {
          id: 'user-list',
          title: '用户列表',
          path: '/users',
          permissions: ['user:view']
        },
        {
          id: 'role-management',
          title: '角色管理',
          path: '/roles',
          permissions: ['role:view']
        }
      ]
    },
    {
      id: 'product-management',
      title: '商品管理',
      icon: 'Goods',
      permissions: ['product:view'],
      children: [
        {
          id: 'product-list',
          title: '商品列表',
          path: '/products',
          permissions: ['product:view']
        },
        {
          id: 'product-import',
          title: '商品导入',
          path: '/products/import',
          permissions: ['product:import']
        }
      ]
    },
    {
      id: 'order-management',
      title: '订单管理',
      icon: 'Document',
      permissions: ['order:view'],
      children: [
        {
          id: 'order-list',
          title: '订单列表',
          path: '/orders',
          permissions: ['order:view']
        }
      ]
    },
    {
      id: 'inventory-management',
      title: '库存管理',
      icon: 'Box',
      permissions: ['inventory:view'],
      children: [
        {
          id: 'inventory-list',
          title: '库存列表',
          path: '/inventory',
          permissions: ['inventory:view']
        },
        {
          id: 'inventory-alerts',
          title: '库存预警',
          path: '/inventory/alerts',
          permissions: ['inventory:alert']
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
        },
        {
          id: 'logistics-exceptions',
          title: '异常处理',
          path: '/logistics/exceptions',
          permissions: ['logistics:exception']
        }
      ]
    },
    {
      id: 'store-management',
      title: '店铺管理',
      icon: 'Shop',
      path: '/stores',
      permissions: ['store:view']
    },
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
      id: 'notification-management',
      title: '通知管理',
      icon: 'Bell',
      permissions: ['notification:view'],
      children: [
        {
          id: 'notification-list',
          title: '通知列表',
          path: '/notifications',
          permissions: ['notification:view']
        },
        {
          id: 'notification-stats',
          title: '发送统计',
          path: '/notifications/send-stats',
          permissions: ['notification:stats']
        }
      ]
    },
    {
      id: 'report-management',
      title: '报表管理',
      icon: 'DataAnalysis',
      permissions: ['report:view'],
      children: [
        {
          id: 'report-generation',
          title: '报表生成',
          path: '/reports',
          permissions: ['report:view']
        },
        {
          id: 'data-filter-query',
          title: '数据查询',
          path: '/reports/data-filter-query',
          permissions: ['report:query']
        }
      ]
    },
    {
      id: 'system-monitor',
      title: '系统监控',
      icon: 'Monitor',
      path: '/monitor',
      permissions: ['system:monitor']
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

  // 计算属性
  const visibleNavigation = computed(() => {
    return filterNavigationByPermissions(navigationConfig)
  })

  const currentBreadcrumb = computed(() => {
    return generateBreadcrumb(route.path)
  })

  const currentPageTitle = computed(() => {
    return route.meta?.title as string || '未知页面'
  })

  // 过滤导航项（根据权限）
  const filterNavigationByPermissions = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
      // 检查权限
      if (item.permissions && !userStore.hasAnyPermission(item.permissions)) {
        return false
      }

      // 检查角色
      if (item.roles && !item.roles.some(role => userStore.hasRole(role))) {
        return false
      }

      // 递归过滤子项
      if (item.children) {
        item.children = filterNavigationByPermissions(item.children)
        // 如果所有子项都被过滤掉，且当前项没有路径，则隐藏当前项
        if (item.children.length === 0 && !item.path) {
          return false
        }
      }

      return true
    })
  }

  // 生成面包屑
  const generateBreadcrumb = (path: string): BreadcrumbItem[] => {
    const breadcrumb: BreadcrumbItem[] = [
      { title: '首页', path: '/dashboard', icon: 'House' }
    ]

    // 查找匹配的导航项
    const findNavItem = (items: NavigationItem[], targetPath: string): NavigationItem | null => {
      for (const item of items) {
        if (item.path === targetPath) {
          return item
        }
        if (item.children) {
          const found = findNavItem(item.children, targetPath)
          if (found) {
            return found
          }
        }
      }
      return null
    }

    // 查找路径层级
    const findPathHierarchy = (items: NavigationItem[], targetPath: string, hierarchy: NavigationItem[] = []): NavigationItem[] | null => {
      for (const item of items) {
        const currentHierarchy = [...hierarchy, item]
        
        if (item.path === targetPath) {
          return currentHierarchy
        }
        
        if (item.children) {
          const found = findPathHierarchy(item.children, targetPath, currentHierarchy)
          if (found) {
            return found
          }
        }
      }
      return null
    }

    const hierarchy = findPathHierarchy(navigationConfig, path)
    if (hierarchy) {
      hierarchy.forEach(item => {
        if (item.path !== '/dashboard') { // 避免重复添加首页
          breadcrumb.push({
            title: item.title,
            path: item.path,
            icon: item.icon
          })
        }
      })
    }

    return breadcrumb
  }

  // 导航到指定路径
  const navigateTo = async (path: string, external = false) => {
    if (external) {
      window.open(path, '_blank')
      return
    }

    try {
      // 记录导航历史
      if (route.path !== path) {
        navigationHistory.value.push(route.path)
        // 限制历史记录长度
        if (navigationHistory.value.length > 10) {
          navigationHistory.value.shift()
        }
      }

      await router.push(path)
    } catch (error) {
      console.error('导航失败:', error)
      ElMessage.error('页面跳转失败')
    }
  }

  // 返回上一页
  const goBack = () => {
    if (navigationHistory.value.length > 0) {
      const previousPath = navigationHistory.value.pop()
      if (previousPath) {
        router.push(previousPath)
      }
    } else {
      router.back()
    }
  }

  // 切换菜单展开状态
  const toggleMenu = (menuId: string) => {
    const index = expandedMenus.value.indexOf(menuId)
    if (index > -1) {
      expandedMenus.value.splice(index, 1)
    } else {
      expandedMenus.value.push(menuId)
    }
  }

  // 检查菜单是否展开
  const isMenuExpanded = (menuId: string) => {
    return expandedMenus.value.includes(menuId)
  }

  // 检查菜单是否激活
  const isMenuActive = (item: NavigationItem) => {
    if (item.path && route.path === item.path) {
      return true
    }
    
    if (item.children) {
      return item.children.some(child => 
        child.path && route.path.startsWith(child.path)
      )
    }
    
    return false
  }

  // 获取菜单徽章
  const getMenuBadge = (item: NavigationItem) => {
    // 根据业务逻辑动态计算徽章数量
    switch (item.id) {
      case 'platform-management':
        // 平台管理：显示连接异常的平台数量
        return getPlatformErrorCount()
      case 'platform-config':
        // 平台配置：显示需要配置的平台数量
        return getPlatformConfigNeededCount()
      case 'platform-list':
        // 平台列表：显示连接状态异常的平台数量
        return getPlatformConnectionIssueCount()
      case 'logistics-management':
        // 物流管理：显示物流异常数量
        return getLogisticsExceptionCount()
      case 'shipping-labels':
        // 面单管理：显示待处理面单数量
        return getPendingShippingLabelsCount()
      case 'logistics-list':
        // 物流列表：显示物流异常数量
        return getLogisticsIssueCount()
      case 'system-settings':
        // 系统设置：显示系统异常数量
        return getSystemExceptionCount()
      case 'system-logs':
        // 系统日志：显示系统错误日志数量
        return getSystemErrorLogCount()
      case 'system-config':
        // 系统配置：显示需要配置的系统项数量
        return getSystemConfigNeededCount()
      default:
        return item.badge
    }
  }

  // 获取平台连接异常数量
  const getPlatformErrorCount = () => {
    // 这里应该从store或API获取实际数据
    // 暂时返回模拟数据 - 模拟有1个平台连接异常
    const errorCount = 1
    return errorCount > 0 ? errorCount : undefined
  }

  // 获取需要配置的平台数量
  const getPlatformConfigNeededCount = () => {
    // 这里应该从store或API获取实际数据
    // 暂时返回模拟数据 - 模拟有2个平台需要配置
    const configNeededCount = 2
    return configNeededCount > 0 ? configNeededCount : undefined
  }

  // 获取平台连接状态异常数量
  const getPlatformConnectionIssueCount = () => {
    // 这里应该从store或API获取实际数据
    // 暂时返回模拟数据 - 模拟有1个平台连接异常
    const issueCount = 1
    return issueCount > 0 ? issueCount : undefined
  }

  // 获取物流异常数量
  const getLogisticsExceptionCount = () => {
    // 这里应该从store或API获取实际数据
    // 暂时返回模拟数据 - 模拟有3个物流异常
    const exceptionCount = 3
    return exceptionCount > 0 ? exceptionCount : undefined
  }

  // 获取待处理面单数量
  const getPendingShippingLabelsCount = () => {
    // 这里应该从store或API获取实际数据
    // 暂时返回模拟数据 - 模拟有5个待处理面单
    const pendingCount = 5
    return pendingCount > 0 ? pendingCount : undefined
  }

  // 获取物流问题数量
  const getLogisticsIssueCount = () => {
    // 这里应该从store或API获取实际数据
    // 暂时返回模拟数据 - 模拟有2个物流问题
    const issueCount = 2
    return issueCount > 0 ? issueCount : undefined
  }

  // 获取系统异常数量
  const getSystemExceptionCount = () => {
    // 这里应该从store或API获取实际数据
    // 暂时返回模拟数据 - 模拟有1个系统异常
    const exceptionCount = 1
    return exceptionCount > 0 ? exceptionCount : undefined
  }

  // 获取系统错误日志数量
  const getSystemErrorLogCount = () => {
    // 这里应该从store或API获取实际数据
    // 暂时返回模拟数据 - 模拟有8个错误日志
    const errorLogCount = 8
    return errorLogCount > 0 ? errorLogCount : undefined
  }

  // 获取需要配置的系统项数量
  const getSystemConfigNeededCount = () => {
    // 这里应该从store或API获取实际数据
    // 暂时返回模拟数据 - 模拟有3个配置项需要设置
    const configNeededCount = 3
    return configNeededCount > 0 ? configNeededCount : undefined
  }

  // 初始化导航状态
  const initNavigation = () => {
    // 根据当前路由设置激活菜单
    updateActiveMenu()
    
    // 自动展开包含当前路由的菜单
    autoExpandCurrentMenu()
  }

  // 更新激活菜单
  const updateActiveMenu = () => {
    const findActiveMenu = (items: NavigationItem[]): string | null => {
      for (const item of items) {
        if (item.path && route.path === item.path) {
          return item.id
        }
        if (item.children) {
          const activeChild = findActiveMenu(item.children)
          if (activeChild) {
            return activeChild
          }
        }
      }
      return null
    }

    const activeId = findActiveMenu(navigationConfig)
    if (activeId) {
      activeMenuId.value = activeId
    }
  }

  // 自动展开当前菜单
  const autoExpandCurrentMenu = () => {
    const findParentMenu = (items: NavigationItem[], targetPath: string, parentId?: string): string | null => {
      for (const item of items) {
        if (item.path === targetPath && parentId) {
          return parentId
        }
        if (item.children) {
          const found = findParentMenu(item.children, targetPath, item.id)
          if (found) {
            return found
          }
        }
      }
      return null
    }

    const parentMenuId = findParentMenu(navigationConfig, route.path)
    if (parentMenuId && !expandedMenus.value.includes(parentMenuId)) {
      expandedMenus.value.push(parentMenuId)
    }
  }

  // 监听路由变化
  watch(route, () => {
    updateActiveMenu()
    autoExpandCurrentMenu()
  }, { immediate: true })

  // 监听用户权限变化
  watch(() => userStore.userPermissions, () => {
    // 权限变化时重新计算可见导航
    console.log('用户权限已更新，重新计算导航菜单')
  }, { deep: true })

  return {
    // 状态
    activeMenuId,
    expandedMenus,
    navigationHistory,
    
    // 计算属性
    visibleNavigation,
    currentBreadcrumb,
    currentPageTitle,
    
    // 方法
    navigateTo,
    goBack,
    toggleMenu,
    isMenuExpanded,
    isMenuActive,
    getMenuBadge,
    initNavigation,
    generateBreadcrumb,
    filterNavigationByPermissions
  }
}