<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
      <div class="logo">
        <img src="/logo.svg" alt="ERP" v-if="!isCollapse" />
        <img src="/logo-mini.svg" alt="ERP" v-else />
        <span v-if="!isCollapse">ERP管理系统</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <template v-for="route in menuRoutes" :key="route.name">
          <el-menu-item
            v-if="!route.children || route.children.length === 0"
            :index="route.path"
            @click="handleMenuClick(route)"
          >
            <el-icon v-if="route.meta?.icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <template #title>{{ route.meta?.title }}</template>
          </el-menu-item>
          
          <el-sub-menu
            v-else
            :index="route.path"
          >
            <template #title>
              <el-icon v-if="route.meta?.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ route.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children"
              :key="child.name"
              :index="child.path"
              @click="handleMenuClick(child)"
            >
              {{ child.meta?.title }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            type="text"
            @click="toggleSidebar"
            class="collapse-btn"
          >
            <el-icon>
              <Expand v-if="isCollapse" />
              <Fold v-else />
            </el-icon>
          </el-button>
          
          <!-- 面包屑导航 -->
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path"
              :to="item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 店铺切换 -->
          <el-select
            v-if="userStore.stores.length > 1"
            v-model="userStore.currentStoreId"
            @change="handleStoreChange"
            class="store-selector"
            placeholder="选择店铺"
          >
            <el-option
              v-for="store in userStore.stores"
              :key="store.id"
              :label="store.storeName"
              :value="store.id"
            />
          </el-select>

          <!-- 通知 -->
          <el-badge :value="notificationCount" :hidden="notificationCount === 0">
            <el-button type="text" @click="showNotifications">
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>

          <!-- 用户菜单 -->
          <el-dropdown @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :src="userStore.user?.avatar" :size="32">
                {{ userStore.user?.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="username">{{ userStore.user?.nickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="settings">账户设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>

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
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Expand,
  Fold,
  Bell,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const isCollapse = ref(false)
const notificationDrawer = ref(false)
const notificationCount = ref(0)
const notifications = ref<any[]>([])

// 计算属性
const activeMenu = computed(() => route.path)

const menuRoutes = computed(() => {
  return router.getRoutes()
    .filter(route => {
      // 过滤掉不需要在菜单中显示的路由
      if (route.meta?.hideInMenu) return false
      if (route.name === 'Layout') return false
      if (!route.meta?.title) return false
      
      // 检查权限
      if (route.meta?.permissions) {
        return userStore.hasAnyPermission(route.meta.permissions)
      }
      
      if (route.meta?.roles) {
        return route.meta.roles.some(role => userStore.hasRole(role))
      }
      
      return true
    })
    .filter(route => route.path !== '/' && !route.path.includes(':'))
})

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(item => ({
    title: item.meta?.title,
    path: item.path
  }))
})

// 方法
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const handleMenuClick = (route: any) => {
  if (route.path !== router.currentRoute.value.path) {
    router.push(route.path)
  }
}

const handleStoreChange = (storeId: number) => {
  userStore.switchStore(storeId)
  ElMessage.success(`已切换到店铺: ${userStore.currentStore?.storeName}`)
  // 刷新当前页面数据
  window.location.reload()
}

const showNotifications = () => {
  notificationDrawer.value = true
  // TODO: 加载通知数据
}

const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings/account')
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
  // TODO: 标记通知为已读
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
    notificationCount.value--
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString()
}

// 监听路由变化，更新面包屑
watch(route, () => {
  // 可以在这里处理路由变化的逻辑
}, { immediate: true })
</script>

<style scoped>
.main-layout {
  height: 100vh;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 0 16px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #434a50;
}

.logo img {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.sidebar-menu {
  border: none;
  background-color: #304156;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #bfcbd9;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #263445;
  color: #409eff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #409eff;
  color: white;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 16px;
}

.breadcrumb {
  margin-left: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.store-selector {
  width: 150px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #606266;
}

.main-content {
  background-color: #f0f2f5;
  padding: 16px;
}

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
</style>