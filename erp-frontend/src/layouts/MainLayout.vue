<template>
  <div class="app-container" data-test="main-layout" :class="{ 'sidebar-collapsed': isCollapse }">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-left">
        <button class="sidebar-toggle" data-test="nav-toggle" @click="toggleSidebar">
          <el-icon>
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
        </button>
        <img src="/logo.svg" alt="ERP系统" class="logo">
        <h1 class="system-title">电商ERP管理系统</h1>
      </div>
      
      <div class="header-right">
        <div class="header-search">
          <input 
            type="text" 
            placeholder="搜索功能..." 
            class="search-input"
            v-model="searchKeyword"
            @keyup.enter="handleSearch"
          >
          <el-icon class="search-icon">
            <Search />
          </el-icon>
        </div>
        
        <div class="header-notifications">
          <button class="notification-btn" @click="showNotifications">
            <el-icon>
              <Bell />
            </el-icon>
            <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
          </button>
        </div>

        <!-- 主题切换器 -->
        <ThemeSwitcher />
        
        <div class="header-user" data-test="user-avatar" @click="toggleUserDropdown">
          <img :src="userStore.user?.avatar || '/logo-mini.svg'" alt="用户头像" class="user-avatar">
          <span class="user-name">{{ userStore.user?.nickname || '管理员' }}</span>
          <div class="user-dropdown" :class="{ show: showUserDropdown }">
            <a href="#" @click.prevent="handleUserCommand('profile')">个人资料</a>
            <a href="#" @click.prevent="handleUserCommand('settings')">系统设置</a>
            <a href="#" @click.prevent="handleUserCommand('logout')">退出登录</a>
          </div>
        </div>
      </div>
    </header>

    <!-- 侧边菜单 -->
    <aside class="app-sidebar" :class="{ show: showSidebarMobile }">
      <nav class="sidebar-nav">
        <ul class="nav-menu">
          <li 
            v-for="item in menuRoutes" 
            :key="item.id"
            class="nav-item"
            :class="{ 
              active: isActiveRoute(item),
              'has-submenu': item.children && item.children.length > 0,
              expanded: navigation.isMenuExpanded(item.id)
            }"
          >
            <!-- 主菜单项 -->
            <a 
              v-if="!item.children || item.children.length === 0"
              :href="item.path" 
              class="nav-link" 
              :data-menu-id="item.id"
              @click.prevent="handleMenuClick(item)"
            >
              <el-icon v-if="item.icon">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.title }}</span>
              <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
            </a>
            
            <!-- 有子菜单的项 -->
            <a 
              v-else
              href="#" 
              class="nav-link" 
              :data-menu-id="item.id"
              @click.prevent="toggleSubmenu(item.id)"
            >
              <el-icon v-if="item.icon">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.title }}</span>
              <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
              <el-icon class="submenu-arrow">
                <ArrowDown />
              </el-icon>
            </a>
            
            <!-- 子菜单 -->
            <ul v-if="item.children && item.children.length > 0" class="submenu">
              <li v-for="child in item.children" :key="child.id">
                <a 
                  :href="child.path" 
                  :data-submenu-id="child.id"
                  :class="{ active: isActiveRoute(child) }"
                  @click.prevent="handleMenuClick(child)"
                >
                  {{ child.title }}
                  <span v-if="child.badge" class="nav-badge">{{ child.badge }}</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 主内容区域 -->
    <main class="app-main">
      <!-- 面包屑导航 -->
      <BreadcrumbNav 
        :show-home="true"
        :auto-generate="true"
        :compact="false"
        class="main-breadcrumb"
      />

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </main>

    <!-- 移动端侧边栏遮罩 -->
    <div 
      class="sidebar-overlay" 
      :class="{ show: showSidebarMobile }"
      @click="closeSidebarMobile"
    ></div>

    <!-- 通知抽屉 -->
    <el-drawer
      v-model="notificationDrawer"
      title="通知中心"
      direction="rtl"
      size="400px"
    >
      <div class="notification-list">
        <el-empty v-if="notifications.length === 0" description="暂无通知" />
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
        >
          <div class="notification-content">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.content }}</p>
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
          </div>
          <el-button
            v-if="!notification.read"
            type="text"
            size="small"
            @click="markAsRead(notification.id)"
          >
            标记已读
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { useNavigation } from '@/composables/useNavigation'
import { ElMessage, ElMessageBox } from 'element-plus'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import ThemeSwitcher from '@/components/business/ThemeSwitcher.vue'
import {
  Expand,
  Fold,
  Bell,
  ArrowDown,
  Search
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()
const navigation = useNavigation()

// 响应式数据
const isCollapse = ref(false)
const showSidebarMobile = ref(false)
const showUserDropdown = ref(false)
const notificationDrawer = ref(false)
const notificationCount = ref(3) // 模拟通知数量
const notifications = ref<any[]>([])
const searchKeyword = ref('')
const expandedMenus = ref<string[]>([])

// 计算属性
const activeMenu = computed(() => route.path)

const menuRoutes = computed(() => {
  // 使用导航组合式函数获取可见导航
  return navigation.visibleNavigation.value
})

// 方法
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
  // 在移动端，切换侧边栏显示
  if (window.innerWidth <= 768) {
    showSidebarMobile.value = !showSidebarMobile.value
  }
}

const closeSidebarMobile = () => {
  showSidebarMobile.value = false
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const toggleSubmenu = (menuName: string) => {
  navigation.toggleMenu(menuName)
}

const isActiveRoute = (routeItem: any) => {
  return navigation.isMenuActive(routeItem)
}

const handleMenuClick = (routeItem: any) => {
  if (routeItem.path) {
    navigation.navigateTo(routeItem.path, routeItem.external)
  }
  // 在移动端点击菜单后关闭侧边栏
  if (window.innerWidth <= 768) {
    showSidebarMobile.value = false
  }
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    // TODO: 实现搜索功能
    ElMessage.info(`搜索: ${searchKeyword.value}`)
  }
}

const showNotifications = () => {
  notificationDrawer.value = true
  // TODO: 加载通知数据
  if (notifications.value.length === 0) {
    // 模拟通知数据
    notifications.value = [
      {
        id: 1,
        title: '库存预警',
        content: '商品 iPhone 15 库存不足，当前库存：5',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: '新订单',
        content: '收到新订单 #12345，请及时处理',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        title: '系统更新',
        content: '系统将在今晚 23:00 进行维护更新',
        read: true,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    ]
  }
}

const handleUserCommand = async (command: string) => {
  showUserDropdown.value = false
  
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await userStore.logout()
        router.push('/login')
        ElMessage.success('已退出登录')
      } catch (error) {
        // 用户取消
      }
      break
  }
}

const markAsRead = (notificationId: number) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification && !notification.read) {
    notification.read = true
    notificationCount.value = Math.max(0, notificationCount.value - 1)
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 处理点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.header-user')) {
    showUserDropdown.value = false
  }
}

// 处理窗口大小变化
const handleResize = () => {
  if (window.innerWidth > 768) {
    showSidebarMobile.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  
  // 初始化导航系统
  navigation.initNavigation()
  
  // 调试：输出用户状态
  console.log('MainLayout mounted - 用户登录状态:', userStore.isLoggedIn)
  console.log('MainLayout mounted - 用户信息:', userStore.user)
  console.log('MainLayout mounted - 用户权限:', userStore.userPermissions)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
})

// 监听路由变化
watch(route, (newRoute) => {
  // 自动展开当前路由对应的菜单
  const parentRoute = menuRoutes.value.find(route => 
    route.children && route.children.some((child: any) => 
      newRoute.path.startsWith(child.path)
    )
  )
  if (parentRoute && !expandedMenus.value.includes(parentRoute.name as string)) {
    expandedMenus.value.push(parentRoute.name as string)
  }
}, { immediate: true })

// 监听用户状态变化
watch(() => userStore.user, (newUser) => {
  console.log('用户状态变化:', newUser)
  if (newUser) {
    console.log('用户权限:', newUser.permissions)
  }
}, { immediate: true, deep: true })
</script>

<style scoped>
/* 主应用容器 - 参考 HTML 原型 layout.css */
.app-container {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main";
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--header-height) 1fr;
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏收起状态 */
.app-container.sidebar-collapsed {
  grid-template-columns: var(--sidebar-collapsed-width) 1fr;
}

/* 顶部导航栏 */
.app-header {
  grid-area: header;
  background: var(--bg-color-primary);
  border-bottom: 1px solid var(--border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  box-shadow: var(--box-shadow-light);
  z-index: var(--z-index-top);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

/* Logo和标题 */
.logo {
  height: 32px;
  width: auto;
}

.system-title {
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-primary);
  margin: 0;
}

/* 侧边栏切换按钮 */
.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--border-radius-base);
  background: transparent;
  color: var(--text-color-regular);
  cursor: pointer;
  transition: var(--transition-base);
}

.sidebar-toggle:hover {
  background: var(--bg-color-secondary);
  color: var(--primary-color);
}

/* 搜索框 */
.header-search {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 200px;
  height: 32px;
  padding: 0 var(--spacing-md) 0 var(--spacing-xxxl);
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius-base);
  background: var(--bg-color-secondary);
  font-size: var(--font-size-small);
  transition: var(--transition-border);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-color-primary);
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  color: var(--text-color-placeholder);
  font-size: var(--font-size-small);
  pointer-events: none;
}

/* 通知按钮 */
.notification-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--border-radius-base);
  background: transparent;
  color: var(--text-color-regular);
  cursor: pointer;
  transition: var(--transition-base);
}

.notification-btn:hover {
  background: var(--bg-color-secondary);
  color: var(--primary-color);
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--danger-color);
  color: var(--text-color-white);
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  border-radius: var(--border-radius-round);
}

/* 用户信息 */
.header-user {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-base);
  cursor: pointer;
  transition: var(--transition-base);
}

.header-user:hover {
  background: var(--bg-color-secondary);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-circle);
  object-fit: cover;
}

.user-name {
  font-size: var(--font-size-small);
  color: var(--text-color-regular);
}

/* 用户下拉菜单 */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 120px;
  background: var(--bg-color-primary);
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-base);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: var(--transition-md-fade);
  z-index: var(--z-index-popper);
}

.user-dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-dropdown a {
  display: block;
  padding: var(--spacing-md);
  color: var(--text-color-regular);
  font-size: var(--font-size-small);
  text-decoration: none;
  transition: var(--transition-base);
}

.user-dropdown a:hover {
  background: var(--bg-color-secondary);
  color: var(--primary-color);
}

/* 侧边栏 */
.app-sidebar {
  grid-area: sidebar;
  background: var(--bg-color-dark);
  overflow-y: auto;
  transition: var(--transition-base);
}

/* 侧边栏导航 */
.sidebar-nav {
  padding: var(--spacing-lg) 0;
}

.nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-bottom: var(--spacing-xs);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-xl);
  color: var(--text-color-light);
  font-size: var(--font-size-base);
  text-decoration: none;
  transition: var(--transition-base);
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color-white);
}

.nav-item.active .nav-link {
  background: var(--primary-color);
  color: var(--text-color-white);
}

.nav-link :deep(.el-icon) {
  width: 20px;
  text-align: center;
  font-size: var(--font-size-base);
}

.submenu-arrow {
  margin-left: auto;
  transition: var(--transition-base);
}

.nav-item.expanded .submenu-arrow {
  transform: rotate(180deg);
}

/* 导航徽章 */
.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  margin-left: auto;
  background: var(--danger-color);
  color: var(--text-color-white);
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border-radius: var(--border-radius-round);
  white-space: nowrap;
}

.nav-badge.warning {
  background: var(--warning-color);
}

.nav-badge.success {
  background: var(--success-color);
}

.nav-badge.info {
  background: var(--info-color);
}

/* 子菜单 */
.submenu {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
}

.nav-item.expanded .submenu {
  max-height: 200px;
}

.submenu li {
  margin: 0;
}

.submenu a {
  display: block;
  padding: var(--spacing-sm) var(--spacing-xl) var(--spacing-sm) 60px;
  color: var(--text-color-light);
  font-size: var(--font-size-small);
  text-decoration: none;
  transition: var(--transition-base);
}

.submenu a:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color-white);
}

.submenu a.active {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-color-white);
  font-weight: var(--font-weight-medium);
}

/* 主内容区域 */
.app-main {
  grid-area: main;
  background: var(--bg-color-secondary);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 面包屑导航 */
.main-breadcrumb {
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--bg-color-primary);
  border-bottom: 1px solid var(--border-color-light);
}

/* 页面内容 */
.page-content {
  flex: 1;
  padding: var(--spacing-xl);
  width: 100%;
  min-height: calc(100vh - var(--header-height) - 60px);
}

/* 侧边栏遮罩 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-index-modal) - 1);
  opacity: 0;
  visibility: hidden;
  transition: var(--transition-fade);
}

.sidebar-overlay.show {
  opacity: 1;
  visibility: visible;
}

/* 通知列表样式 */
.notification-list {
  padding: 16px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #f5f5f5;
}

.notification-item.unread {
  background-color: #f0f9ff;
}

.notification-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
}

.notification-content p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

/* Web端优先的响应式布局 */
@media (min-width: 1200px) {
  .page-content {
    max-width: 1400px;
    padding: var(--spacing-xxl);
  }
  
  .main-breadcrumb {
    padding: var(--spacing-lg) var(--spacing-xxl);
  }
  
  .header-search .search-input {
    width: 300px;
  }
}

@media (max-width: 1024px) {
  .page-content {
    max-width: 100%;
    padding: var(--spacing-xl);
  }
}

@media (max-width: 768px) {
  .app-container {
    grid-template-areas: 
      "header"
      "main";
    grid-template-columns: 1fr;
    grid-template-rows: var(--header-height) 1fr;
  }
  
  .app-sidebar {
    position: fixed;
    top: var(--header-height);
    left: -100%;
    width: var(--sidebar-width);
    height: calc(100vh - var(--header-height));
    z-index: var(--z-index-modal);
    transition: var(--transition-base);
  }
  
  .app-sidebar.show {
    left: 0;
  }
  
  .header-search {
    display: none;
  }
  
  .page-content {
    padding: var(--spacing-lg);
  }
  
  .main-breadcrumb {
    padding: var(--spacing-md) var(--spacing-lg);
  }
}

/* 侧边栏收起状态样式 */
.sidebar-collapsed .nav-link span {
  display: none;
}

.sidebar-collapsed .submenu-arrow {
  display: none;
}

.sidebar-collapsed .submenu {
  display: none;
}

.sidebar-collapsed .nav-link {
  justify-content: center;
  padding: var(--spacing-md);
}

/* 页面切换动画 */
.app-main {
  transition: opacity 0.2s ease;
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .nav-link {
    color: #fff;
  }
  
  .nav-link:hover {
    color: #fff;
    background: #0066cc;
  }
  
  .nav-item.active .nav-link {
    background: #0066cc;
    color: #fff;
  }
}
</style>