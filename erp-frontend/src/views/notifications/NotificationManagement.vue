<template>
  <div class="notification-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">通知中心</h2>
        <p class="page-description">管理系统通知和消息</p>
      </div>
      <div class="header-right">
        <el-button 
          type="default" 
          :icon="Check" 
          @click="handleMarkAllRead"
          :loading="markAllLoading"
          :disabled="!hasUnreadNotifications"
        >
          全部已读
        </el-button>
        <el-button 
          type="primary" 
          :icon="Refresh" 
          @click="handleRefresh"
          :loading="refreshLoading"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-card shadow="never" class="filter-card">
        <div class="filter-row">
          <div class="filter-item">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索通知标题或内容"
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
              class="search-input"
            />
          </div>
          <div class="filter-item">
            <el-select
              v-model="filters.type"
              placeholder="通知类型"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部类型" value="" />
              <el-option label="信息通知" value="INFO" />
              <el-option label="警告通知" value="WARNING" />
              <el-option label="错误通知" value="ERROR" />
              <el-option label="成功通知" value="SUCCESS" />
              <el-option label="系统通知" value="SYSTEM" />
            </el-select>
          </div>
          <div class="filter-item">
            <el-select
              v-model="filters.status"
              placeholder="阅读状态"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部状态" value="" />
              <el-option label="未读" value="UNREAD" />
              <el-option label="已读" value="READ" />
              <el-option label="已归档" value="ARCHIVED" />
            </el-select>
          </div>
          <div class="filter-item">
            <el-select
              v-model="filters.priority"
              placeholder="优先级"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部优先级" value="" />
              <el-option label="低优先级" value="LOW" />
              <el-option label="普通" value="MEDIUM" />
              <el-option label="高优先级" value="HIGH" />
              <el-option label="紧急" value="URGENT" />
            </el-select>
          </div>
          <div class="filter-item">
            <el-button @click="handleClearFilters">清除筛选</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 批量操作区域 -->
    <div v-if="selectedCount > 0" class="batch-actions">
      <el-card shadow="never" class="batch-card">
        <div class="batch-info">
          <span>已选择 {{ selectedCount }} 项</span>
        </div>
        <div class="batch-buttons">
          <el-button 
            size="small" 
            :icon="Check"
            @click="handleBatchMarkRead"
            :loading="batchLoading"
          >
            标记已读
          </el-button>
          <el-button 
            size="small" 
            :icon="Delete"
            @click="handleBatchDelete"
            :loading="batchLoading"
            type="danger"
          >
            批量删除
          </el-button>
          <el-button size="small" @click="handleClearSelection">取消选择</el-button>
        </div>
      </el-card>
    </div>

    <!-- 通知列表 -->
    <div class="notification-list">
      <el-card shadow="never" class="list-card">
        <div v-if="isLoading && notifications.length === 0" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>
        
        <div v-else-if="notifications.length === 0" class="empty-container">
          <el-empty description="暂无通知数据" />
        </div>
        
        <div v-else class="notification-items">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="[
              'notification-item',
              notification.status === 'UNREAD' ? 'unread' : 'read',
              notification.priority.toLowerCase()
            ]"
          >
            <!-- 选择框 -->
            <div class="notification-checkbox">
              <el-checkbox
                :model-value="selectedNotificationIds.includes(notification.id)"
                @change="handleToggleSelection(notification.id)"
              />
            </div>

            <!-- 通知图标 -->
            <div class="notification-icon">
              <el-icon :class="getNotificationIconClass(notification.type)">
                <component :is="getNotificationIcon(notification.type)" />
              </el-icon>
            </div>

            <!-- 通知内容 -->
            <div class="notification-content" @click="handleNotificationClick(notification)">
              <div class="notification-header">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <div class="notification-meta">
                  <el-tag 
                    :type="getNotificationTypeTagType(notification.type)" 
                    size="small"
                  >
                    {{ getNotificationTypeLabel(notification.type) }}
                  </el-tag>
                  <el-tag 
                    v-if="notification.priority !== 'MEDIUM'"
                    :type="getPriorityTagType(notification.priority)" 
                    size="small"
                  >
                    {{ getPriorityLabel(notification.priority) }}
                  </el-tag>
                </div>
              </div>
              <p class="notification-text">{{ notification.content }}</p>
              <div class="notification-footer">
                <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                <div class="notification-status">
                  <el-icon v-if="notification.status === 'UNREAD'" class="unread-dot">
                    <CircleFilled />
                  </el-icon>
                  <span class="status-text">
                    {{ notification.status === 'UNREAD' ? '未读' : '已读' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="notification-actions">
              <el-button
                v-if="notification.status === 'UNREAD'"
                size="small"
                type="primary"
                text
                @click="handleMarkRead(notification.id)"
                :loading="markReadLoading === notification.id"
              >
                标记已读
              </el-button>
              <el-button
                size="small"
                type="danger"
                text
                @click="handleDelete(notification.id)"
                :loading="deleteLoading === notification.id"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 通知详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="通知详情"
      width="600px"
      :before-close="handleCloseDetail"
    >
      <div v-if="selectedNotification" class="notification-detail">
        <div class="detail-header">
          <div class="detail-title">
            <el-icon :class="getNotificationIconClass(selectedNotification.type)">
              <component :is="getNotificationIcon(selectedNotification.type)" />
            </el-icon>
            <h3>{{ selectedNotification.title }}</h3>
          </div>
          <div class="detail-meta">
            <el-tag 
              :type="getNotificationTypeTagType(selectedNotification.type)" 
              size="small"
            >
              {{ getNotificationTypeLabel(selectedNotification.type) }}
            </el-tag>
            <el-tag 
              v-if="selectedNotification.priority !== 'MEDIUM'"
              :type="getPriorityTagType(selectedNotification.priority)" 
              size="small"
            >
              {{ getPriorityLabel(selectedNotification.priority) }}
            </el-tag>
          </div>
        </div>
        
        <div class="detail-content">
          <p>{{ selectedNotification.content }}</p>
        </div>
        
        <div class="detail-footer">
          <div class="detail-info">
            <p><strong>创建时间：</strong>{{ formatDateTime(selectedNotification.createdAt) }}</p>
            <p v-if="selectedNotification.readAt">
              <strong>阅读时间：</strong>{{ formatDateTime(selectedNotification.readAt) }}
            </p>
            <p><strong>状态：</strong>{{ selectedNotification.status === 'UNREAD' ? '未读' : '已读' }}</p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDetail">关闭</el-button>
          <el-button
            v-if="selectedNotification?.status === 'UNREAD'"
            type="primary"
            @click="handleMarkReadFromDetail"
            :loading="markReadLoading === selectedNotification?.id"
          >
            标记已读
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Refresh, 
  Check, 
  Delete, 
  Bell, 
  Warning, 
  CircleCheck, 
  CircleClose, 
  InfoFilled,
  CircleFilled,
  Setting
} from '@element-plus/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/types'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 状态管理
const notificationStore = useNotificationStore()

// 响应式数据
const searchKeyword = ref('')
const filters = ref({
  type: '',
  status: '',
  priority: ''
})

// 加载状态
const refreshLoading = ref(false)
const markAllLoading = ref(false)
const batchLoading = ref(false)
const markReadLoading = ref<number | null>(null)
const deleteLoading = ref<number | null>(null)

// 对话框状态
const detailDialogVisible = ref(false)
const selectedNotification = ref<Notification | null>(null)

// 计算属性
const isLoading = computed(() => notificationStore.isLoading)
const notifications = computed(() => notificationStore.state.notifications)
const total = computed(() => notificationStore.state.total)
const currentPage = computed({
  get: () => notificationStore.state.currentPage,
  set: (value) => notificationStore.setPagination(value)
})
const pageSize = computed({
  get: () => notificationStore.state.pageSize,
  set: (value) => notificationStore.setPagination(currentPage.value, value)
})
const selectedNotificationIds = computed(() => notificationStore.state.selectedNotificationIds)
const selectedCount = computed(() => notificationStore.selectedCount)
const hasUnreadNotifications = computed(() => notificationStore.hasUnreadNotifications)

// 搜索防抖
let searchTimer: NodeJS.Timeout | null = null

// 监听搜索关键词变化
watch(searchKeyword, (newKeyword) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 300)
})

// 页面加载
onMounted(async () => {
  await loadNotifications()
})

// 加载通知列表
const loadNotifications = async () => {
  try {
    await notificationStore.fetchNotifications({
      keyword: searchKeyword.value,
      ...filters.value
    })
  } catch (error) {
    console.error('加载通知列表失败:', error)
    ElMessage.error('加载通知列表失败')
  }
}

// 搜索处理
const handleSearch = async () => {
  await loadNotifications()
}

// 筛选变化处理
const handleFilterChange = async () => {
  currentPage.value = 1
  await loadNotifications()
}

// 清除筛选
const handleClearFilters = async () => {
  searchKeyword.value = ''
  filters.value = {
    type: '',
    status: '',
    priority: ''
  }
  await loadNotifications()
}

// 刷新数据
const handleRefresh = async () => {
  refreshLoading.value = true
  try {
    await notificationStore.refresh()
    ElMessage.success('刷新成功')
  } catch (error) {
    console.error('刷新失败:', error)
    ElMessage.error('刷新失败')
  } finally {
    refreshLoading.value = false
  }
}

// 全部标记为已读
const handleMarkAllRead = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要将所有通知标记为已读吗？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    markAllLoading.value = true
    await notificationStore.markAllAsRead()
    ElMessage.success('全部标记为已读成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('标记全部已读失败:', error)
      ElMessage.error('标记全部已读失败')
    }
  } finally {
    markAllLoading.value = false
  }
}

// 标记单个通知为已读
const handleMarkRead = async (id: number) => {
  markReadLoading.value = id
  try {
    await notificationStore.markAsRead(id)
    ElMessage.success('标记已读成功')
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  } finally {
    markReadLoading.value = null
  }
}

// 从详情对话框标记已读
const handleMarkReadFromDetail = async () => {
  if (!selectedNotification.value) return
  
  await handleMarkRead(selectedNotification.value.id)
  if (selectedNotification.value) {
    selectedNotification.value.status = 'read'
    selectedNotification.value.readAt = new Date().toISOString()
  }
}

// 删除通知
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条通知吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    deleteLoading.value = id
    await notificationStore.deleteNotification(id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除通知失败:', error)
      ElMessage.error('删除通知失败')
    }
  } finally {
    deleteLoading.value = null
  }
}

// 切换选择状态
const handleToggleSelection = (id: number) => {
  notificationStore.toggleNotificationSelection(id)
}

// 批量标记已读
const handleBatchMarkRead = async () => {
  if (selectedNotificationIds.value.length === 0) return
  
  batchLoading.value = true
  try {
    await notificationStore.batchMarkAsRead(selectedNotificationIds.value)
    ElMessage.success(`成功标记 ${selectedNotificationIds.value.length} 条通知为已读`)
    notificationStore.clearSelection()
  } catch (error) {
    console.error('批量标记已读失败:', error)
    ElMessage.error('批量标记已读失败')
  } finally {
    batchLoading.value = false
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedNotificationIds.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedNotificationIds.value.length} 条通知吗？删除后无法恢复。`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    batchLoading.value = true
    await notificationStore.batchDeleteNotifications(selectedNotificationIds.value)
    ElMessage.success(`成功删除 ${selectedNotificationIds.value.length} 条通知`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  } finally {
    batchLoading.value = false
  }
}

// 清除选择
const handleClearSelection = () => {
  notificationStore.clearSelection()
}

// 通知点击处理
const handleNotificationClick = (notification: Notification) => {
  selectedNotification.value = notification
  detailDialogVisible.value = true
  
  // 如果是未读通知，自动标记为已读
  if (notification.status === 'UNREAD') {
    handleMarkRead(notification.id)
  }
}

// 关闭详情对话框
const handleCloseDetail = () => {
  detailDialogVisible.value = false
  selectedNotification.value = null
}

// 分页处理
const handleSizeChange = async (size: number) => {
  pageSize.value = size
  await loadNotifications()
}

const handleCurrentChange = async (page: number) => {
  currentPage.value = page
  await loadNotifications()
}

// 获取通知图标
const getNotificationIcon = (type: string) => {
  const iconMap = {
    INFO: InfoFilled,
    WARNING: Warning,
    ERROR: CircleClose,
    SUCCESS: CircleCheck,
    SYSTEM: Setting
  }
  return iconMap[type as keyof typeof iconMap] || Bell
}

// 获取通知图标样式类
const getNotificationIconClass = (type: string) => {
  const classMap = {
    INFO: 'icon-info',
    WARNING: 'icon-warning',
    ERROR: 'icon-error',
    SUCCESS: 'icon-success',
    SYSTEM: 'icon-system'
  }
  return classMap[type as keyof typeof classMap] || 'icon-default'
}

// 获取通知类型标签类型
const getNotificationTypeTagType = (type: string) => {
  const typeMap = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'danger',
    SUCCESS: 'success',
    SYSTEM: 'primary'
  }
  return typeMap[type as keyof typeof typeMap] || 'info'
}

// 获取通知类型标签文本
const getNotificationTypeLabel = (type: string) => {
  const labelMap = {
    INFO: '信息',
    WARNING: '警告',
    ERROR: '错误',
    SUCCESS: '成功',
    SYSTEM: '系统'
  }
  return labelMap[type as keyof typeof labelMap] || '未知'
}

// 获取优先级标签类型
const getPriorityTagType = (priority: string) => {
  const typeMap = {
    LOW: 'info',
    MEDIUM: 'primary',
    HIGH: 'warning',
    URGENT: 'danger'
  }
  return typeMap[priority as keyof typeof typeMap] || 'info'
}

// 获取优先级标签文本
const getPriorityLabel = (priority: string) => {
  const labelMap = {
    LOW: '低',
    MEDIUM: '普通',
    HIGH: '高',
    URGENT: '紧急'
  }
  return labelMap[priority as keyof typeof labelMap] || '普通'
}

// 格式化时间（相对时间）
const formatTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { addSuffix: true, locale: zhCN })
  } catch (error) {
    return dateString
  }
}

// 格式化日期时间（绝对时间）
const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return format(date, 'yyyy-MM-dd HH:mm:ss')
  } catch (error) {
    return dateString
  }
}
</script>

<style scoped lang="scss">
.notification-management {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    
    .header-left {
      .page-title {
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 8px 0;
      }
      
      .page-description {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin: 0;
      }
    }
    
    .header-right {
      display: flex;
      gap: 12px;
    }
  }
  
  .filter-section {
    margin-bottom: 20px;
    
    .filter-card {
      border: 1px solid var(--el-border-color-light);
      
      .filter-row {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
        
        .filter-item {
          .search-input {
            width: 300px;
          }
          
          .el-select {
            width: 150px;
          }
        }
      }
    }
  }
  
  .batch-actions {
    margin-bottom: 20px;
    
    .batch-card {
      border: 1px solid var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      
      :deep(.el-card__body) {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
      }
      
      .batch-info {
        color: var(--el-color-primary);
        font-weight: 500;
      }
      
      .batch-buttons {
        display: flex;
        gap: 8px;
      }
    }
  }
  
  .notification-list {
    .list-card {
      border: 1px solid var(--el-border-color-light);
      
      .loading-container,
      .empty-container {
        padding: 40px 0;
      }
      
      .notification-items {
        .notification-item {
          display: flex;
          align-items: flex-start;
          padding: 16px 0;
          border-bottom: 1px solid var(--el-border-color-lighter);
          transition: all 0.3s ease;
          
          &:last-child {
            border-bottom: none;
          }
          
          &:hover {
            background-color: var(--el-fill-color-lighter);
          }
          
          &.unread {
            background-color: var(--el-color-primary-light-9);
            
            .notification-title {
              font-weight: 600;
            }
          }
          
          &.urgent {
            border-left: 4px solid var(--el-color-danger);
          }
          
          &.high {
            border-left: 4px solid var(--el-color-warning);
          }
          
          .notification-checkbox {
            margin-right: 12px;
            margin-top: 4px;
          }
          
          .notification-icon {
            margin-right: 12px;
            margin-top: 4px;
            
            .el-icon {
              font-size: 20px;
              
              &.icon-info {
                color: var(--el-color-info);
              }
              
              &.icon-warning {
                color: var(--el-color-warning);
              }
              
              &.icon-error {
                color: var(--el-color-danger);
              }
              
              &.icon-success {
                color: var(--el-color-success);
              }
              
              &.icon-system {
                color: var(--el-color-primary);
              }
            }
          }
          
          .notification-content {
            flex: 1;
            cursor: pointer;
            
            .notification-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 8px;
              
              .notification-title {
                font-size: 16px;
                color: var(--el-text-color-primary);
                margin: 0;
                line-height: 1.4;
              }
              
              .notification-meta {
                display: flex;
                gap: 8px;
                margin-left: 12px;
              }
            }
            
            .notification-text {
              font-size: 14px;
              color: var(--el-text-color-regular);
              line-height: 1.5;
              margin: 0 0 12px 0;
              word-break: break-word;
            }
            
            .notification-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              
              .notification-time {
                font-size: 12px;
                color: var(--el-text-color-placeholder);
              }
              
              .notification-status {
                display: flex;
                align-items: center;
                gap: 4px;
                
                .unread-dot {
                  color: var(--el-color-primary);
                  font-size: 8px;
                }
                
                .status-text {
                  font-size: 12px;
                  color: var(--el-text-color-placeholder);
                }
              }
            }
          }
          
          .notification-actions {
            margin-left: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 4px;
          }
        }
      }
      
      .pagination-container {
        margin-top: 20px;
        display: flex;
        justify-content: center;
      }
    }
  }
  
  .notification-detail {
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      
      .detail-title {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .el-icon {
          font-size: 24px;
          
          &.icon-info {
            color: var(--el-color-info);
          }
          
          &.icon-warning {
            color: var(--el-color-warning);
          }
          
          &.icon-error {
            color: var(--el-color-danger);
          }
          
          &.icon-success {
            color: var(--el-color-success);
          }
          
          &.icon-system {
            color: var(--el-color-primary);
          }
        }
        
        h3 {
          margin: 0;
          font-size: 18px;
          color: var(--el-text-color-primary);
        }
      }
      
      .detail-meta {
        display: flex;
        gap: 8px;
      }
    }
    
    .detail-content {
      margin-bottom: 20px;
      
      p {
        font-size: 14px;
        line-height: 1.6;
        color: var(--el-text-color-regular);
        margin: 0;
        word-break: break-word;
      }
    }
    
    .detail-footer {
      .detail-info {
        p {
          margin: 8px 0;
          font-size: 14px;
          color: var(--el-text-color-regular);
          
          strong {
            color: var(--el-text-color-primary);
          }
        }
      }
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .notification-management {
    padding: 16px;
    
    .page-header {
      flex-direction: column;
      gap: 16px;
      
      .header-right {
        width: 100%;
        justify-content: flex-end;
      }
    }
    
    .filter-section {
      .filter-row {
        flex-direction: column;
        align-items: stretch;
        
        .filter-item {
          .search-input,
          .el-select {
            width: 100%;
          }
        }
      }
    }
    
    .notification-list {
      .notification-items {
        .notification-item {
          flex-direction: column;
          gap: 12px;
          
          .notification-checkbox {
            margin: 0;
          }
          
          .notification-icon {
            margin: 0;
          }
          
          .notification-actions {
            margin: 0;
            flex-direction: row;
            justify-content: flex-end;
          }
        }
      }
    }
  }
}
</style>