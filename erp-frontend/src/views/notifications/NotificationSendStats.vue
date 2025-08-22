<template>
  <div class="notification-send-stats">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">通知发送与统计</h2>
        <p class="page-description">管理通知发送操作和查看统计分析</p>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="showSendDialog = true"
          data-testid="send-notification-btn"
        >
          发送通知
        </el-button>
        <el-button 
          type="default" 
          :icon="Refresh" 
          @click="handleRefresh"
          :loading="refreshLoading"
          data-testid="refresh-btn"
        >
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon success">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats?.totalSent || 0 }}</div>
              <div class="stat-label">总发送量</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon primary">
              <el-icon><View /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats?.totalRead || 0 }}</div>
              <div class="stat-label">已读数量</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon warning">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats?.totalUnread || 0 }}</div>
              <div class="stat-label">未读数量</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon info">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatPercentage(stats?.readRate) }}</div>
              <div class="stat-label">阅读率</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>    <!--
 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 发送趋势图表 -->
        <el-col :xs="24" :lg="12">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="card-header">
                <h3>发送趋势</h3>
                <el-select v-model="trendPeriod" @change="handleTrendPeriodChange" size="small">
                  <el-option label="最近7天" value="7d" />
                  <el-option label="最近30天" value="30d" />
                  <el-option label="最近90天" value="90d" />
                </el-select>
              </div>
            </template>
            <div class="chart-container">
              <ChartContainer
                v-if="trendChartData"
                :data="trendChartData"
                type="line"
                height="300px"
              />
              <div v-else class="chart-loading">
                <el-skeleton :rows="3" animated />
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 渠道效果分析 -->
        <el-col :xs="24" :lg="12">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <h3>渠道效果分析</h3>
            </template>
            <div class="chart-container">
              <ChartContainer
                v-if="channelChartData"
                :data="channelChartData"
                type="pie"
                height="300px"
              />
              <div v-else class="chart-loading">
                <el-skeleton :rows="3" animated />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 发送历史记录 -->
    <div class="history-section">
      <el-card shadow="never" class="history-card">
        <template #header>
          <div class="card-header">
            <h3>发送历史</h3>
            <div class="header-actions">
              <el-input
                v-model="historySearchKeyword"
                placeholder="搜索发送记录"
                :prefix-icon="Search"
                clearable
                @input="handleHistorySearch"
                class="search-input"
              />
              <el-select v-model="historyFilters.status" placeholder="发送状态" clearable @change="handleHistoryFilterChange">
                <el-option label="全部状态" value="" />
                <el-option label="发送成功" value="SUCCESS" />
                <el-option label="发送失败" value="FAILED" />
                <el-option label="发送中" value="PENDING" />
              </el-select>
            </div>
          </div>
        </template>

        <div class="history-content">
          <el-table
            v-loading="historyLoading"
            :data="sendHistory"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="通知标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="recipientName" label="接收者" width="120" />
            <el-table-column prop="channel" label="发送渠道" width="100">
              <template #default="{ row }">
                <el-tag :type="getChannelTagType(row.channel)" size="small">
                  {{ getChannelLabel(row.channel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="发送状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sentAt" label="发送时间" width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.sentAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="readAt" label="阅读时间" width="160">
              <template #default="{ row }">
                {{ row.readAt ? formatDateTime(row.readAt) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'FAILED'"
                  size="small"
                  type="primary"
                  text
                  @click="handleResend(row)"
                  :loading="resendLoading === row.id"
                >
                  重新发送
                </el-button>
                <el-button
                  size="small"
                  type="info"
                  text
                  @click="handleViewDetail(row)"
                >
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div v-if="historyTotal > 0" class="pagination-container">
            <el-pagination
              v-model:current-page="historyCurrentPage"
              v-model:page-size="historyPageSize"
              :total="historyTotal"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleHistorySizeChange"
              @current-change="handleHistoryCurrentChange"
            />
          </div>
        </div>
      </el-card>
    </div>    <!
-- 发送通知对话框 -->
    <el-dialog
      v-model="showSendDialog"
      title="发送通知"
      width="600px"
      :before-close="handleCloseSendDialog"
    >
      <el-form
        ref="sendFormRef"
        :model="sendForm"
        :rules="sendFormRules"
        label-width="100px"
      >
        <el-form-item label="通知模板" prop="templateId">
          <el-select
            v-model="sendForm.templateId"
            placeholder="选择通知模板"
            filterable
            @change="handleTemplateChange"
            style="width: 100%"
          >
            <el-option
              v-for="template in templates"
              :key="template.id"
              :label="template.name"
              :value="template.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="通知标题" prop="title">
          <el-input
            v-model="sendForm.title"
            placeholder="请输入通知标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="sendForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="通知类型" prop="type">
          <el-select v-model="sendForm.type" placeholder="选择通知类型">
            <el-option label="信息通知" value="INFO" />
            <el-option label="警告通知" value="WARNING" />
            <el-option label="错误通知" value="ERROR" />
            <el-option label="成功通知" value="SUCCESS" />
            <el-option label="系统通知" value="SYSTEM" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="sendForm.priority" placeholder="选择优先级">
            <el-option label="低优先级" value="LOW" />
            <el-option label="普通" value="MEDIUM" />
            <el-option label="高优先级" value="HIGH" />
            <el-option label="紧急" value="URGENT" />
          </el-select>
        </el-form-item>

        <el-form-item label="发送渠道" prop="channels">
          <el-checkbox-group v-model="sendForm.channels">
            <el-checkbox label="SYSTEM">系统内通知</el-checkbox>
            <el-checkbox label="EMAIL">邮件</el-checkbox>
            <el-checkbox label="SMS">短信</el-checkbox>
            <el-checkbox label="PUSH">推送通知</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="接收者" prop="recipients">
          <div class="recipients-section">
            <div class="recipient-type-tabs">
              <el-radio-group v-model="recipientType" @change="handleRecipientTypeChange">
                <el-radio-button label="USER">指定用户</el-radio-button>
                <el-radio-button label="ROLE">按角色</el-radio-button>
                <el-radio-button label="ALL">全部用户</el-radio-button>
              </el-radio-group>
            </div>
            
            <div v-if="recipientType === 'USER'" class="recipient-selector">
              <el-select
                v-model="selectedUsers"
                multiple
                filterable
                placeholder="选择接收用户"
                style="width: 100%"
              >
                <el-option
                  v-for="user in users"
                  :key="user.id"
                  :label="user.nickname || user.username"
                  :value="user.id"
                />
              </el-select>
            </div>
            
            <div v-if="recipientType === 'ROLE'" class="recipient-selector">
              <el-select
                v-model="selectedRoles"
                multiple
                filterable
                placeholder="选择接收角色"
                style="width: 100%"
              >
                <el-option
                  v-for="role in roles"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
                />
              </el-select>
            </div>
            
            <div v-if="recipientType === 'ALL'" class="recipient-info">
              <el-alert
                title="将发送给所有系统用户"
                type="info"
                :closable="false"
                show-icon
              />
            </div>
          </div>
        </el-form-item>

        <el-form-item label="定时发送">
          <el-switch v-model="enableSchedule" @change="handleScheduleChange" />
          <el-date-picker
            v-if="enableSchedule"
            v-model="sendForm.scheduledAt"
            type="datetime"
            placeholder="选择发送时间"
            style="margin-left: 12px"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseSendDialog">取消</el-button>
          <el-button
            type="primary"
            @click="handleSendNotification"
            :loading="sendLoading"
          >
            {{ enableSchedule ? '定时发送' : '立即发送' }}
          </el-button>
        </div>
      </template>
    </el-dialog>    <!-
- 发送详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="发送详情"
      width="500px"
    >
      <div v-if="selectedSendRecord" class="send-detail">
        <div class="detail-item">
          <label>通知标题：</label>
          <span>{{ selectedSendRecord.title }}</span>
        </div>
        <div class="detail-item">
          <label>接收者：</label>
          <span>{{ selectedSendRecord.recipientName }}</span>
        </div>
        <div class="detail-item">
          <label>发送渠道：</label>
          <el-tag :type="getChannelTagType(selectedSendRecord.channel)" size="small">
            {{ getChannelLabel(selectedSendRecord.channel) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <label>发送状态：</label>
          <el-tag :type="getStatusTagType(selectedSendRecord.status)" size="small">
            {{ getStatusLabel(selectedSendRecord.status) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <label>发送时间：</label>
          <span>{{ formatDateTime(selectedSendRecord.sentAt) }}</span>
        </div>
        <div v-if="selectedSendRecord.deliveredAt" class="detail-item">
          <label>送达时间：</label>
          <span>{{ formatDateTime(selectedSendRecord.deliveredAt) }}</span>
        </div>
        <div v-if="selectedSendRecord.readAt" class="detail-item">
          <label>阅读时间：</label>
          <span>{{ formatDateTime(selectedSendRecord.readAt) }}</span>
        </div>
        <div v-if="selectedSendRecord.failureReason" class="detail-item">
          <label>失败原因：</label>
          <span class="error-text">{{ selectedSendRecord.failureReason }}</span>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { 
  Plus, 
  Refresh, 
  Search, 
  CircleCheck, 
  View, 
  Bell, 
  DataAnalysis 
} from '@element-plus/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { ChartContainer } from '@/components/business'
import { notificationApi } from '@/api/modules/notification'
import type { 
  NotificationStats, 
  NotificationTemplate, 
  NotificationSendResult,
  User,
  Role
} from '@/types'
import { format } from 'date-fns'

// 状态管理
const notificationStore = useNotificationStore()
const userStore = useUserStore()

// 响应式数据
const refreshLoading = ref(false)
const trendPeriod = ref('7d')
const historySearchKeyword = ref('')
const historyFilters = ref({
  status: ''
})
const historyLoading = ref(false)
const historyCurrentPage = ref(1)
const historyPageSize = ref(20)
const historyTotal = ref(0)
const sendHistory = ref<NotificationSendResult[]>([])
const resendLoading = ref<number | null>(null)

// 发送对话框相关
const showSendDialog = ref(false)
const sendLoading = ref(false)
const sendFormRef = ref<FormInstance>()
const enableSchedule = ref(false)
const recipientType = ref('USER')
const selectedUsers = ref<number[]>([])
const selectedRoles = ref<number[]>([])

// 详情对话框相关
const showDetailDialog = ref(false)
const selectedSendRecord = ref<NotificationSendResult | null>(null)

// 数据
const stats = ref<NotificationStats | null>(null)
const trendChartData = ref<any>(null)
const channelChartData = ref<any>(null)
const templates = ref<NotificationTemplate[]>([])
const users = ref<User[]>([])
const roles = ref<Role[]>([])

// 发送表单
const sendForm = ref({
  templateId: null as number | null,
  title: '',
  content: '',
  type: 'INFO' as const,
  priority: 'MEDIUM' as const,
  channels: ['SYSTEM'] as string[],
  recipients: [] as any[],
  scheduledAt: null as Date | null
})

// 表单验证规则
const sendFormRules: FormRules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度应在1-100个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 1, max: 500, message: '内容长度应在1-500个字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择通知类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  channels: [
    { required: true, message: '请选择至少一个发送渠道', trigger: 'change' }
  ]
}

// 计算属性
const isLoading = computed(() => notificationStore.isLoading)

// 搜索防抖
let historySearchTimer: NodeJS.Timeout | null = null

// 监听搜索关键词变化
watch(historySearchKeyword, (newKeyword) => {
  if (historySearchTimer) {
    clearTimeout(historySearchTimer)
  }
  historySearchTimer = setTimeout(() => {
    handleHistorySearch()
  }, 300)
})

// 页面加载
onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadTrendData(),
    loadChannelData(),
    loadSendHistory(),
    loadTemplates(),
    loadUsers(),
    loadRoles()
  ])
})

// 加载统计数据
const loadStats = async () => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 30) // 最近30天
    
    stats.value = await notificationStore.fetchNotificationStats(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载趋势数据
const loadTrendData = async () => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    const days = parseInt(trendPeriod.value.replace('d', ''))
    startDate.setDate(endDate.getDate() - days)
    
    const response = await notificationApi.getNotificationTrends(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      'day'
    )
    
    // 转换为图表数据格式
    trendChartData.value = {
      labels: response.data.map((item: any) => format(new Date(item.date), 'MM-dd')),
      datasets: [
        {
          label: '发送量',
          data: response.data.map((item: any) => item.sent),
          borderColor: '#409eff',
          backgroundColor: 'rgba(64, 158, 255, 0.1)',
          tension: 0.4
        },
        {
          label: '阅读量',
          data: response.data.map((item: any) => item.read),
          borderColor: '#67c23a',
          backgroundColor: 'rgba(103, 194, 58, 0.1)',
          tension: 0.4
        }
      ]
    }
  } catch (error) {
    console.error('加载趋势数据失败:', error)
  }
}

// 加载渠道数据
const loadChannelData = async () => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 30)
    
    const response = await notificationApi.getChannelEffectiveness(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )
    
    // 转换为饼图数据格式
    channelChartData.value = {
      labels: response.data.map((item: any) => getChannelLabel(item.channel)),
      datasets: [{
        data: response.data.map((item: any) => item.sent),
        backgroundColor: [
          '#409eff',
          '#67c23a',
          '#e6a23c',
          '#f56c6c',
          '#909399'
        ]
      }]
    }
  } catch (error) {
    console.error('加载渠道数据失败:', error)
  }
}

// 加载发送历史
const loadSendHistory = async () => {
  historyLoading.value = true
  try {
    // 这里应该调用获取发送历史的API
    // 暂时使用模拟数据
    const mockHistory: NotificationSendResult[] = [
      {
        id: 1,
        status: 'SUCCESS',
        channel: 'SYSTEM',
        recipientId: 1,
        recipientName: '张三',
        sentAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
        readAt: new Date().toISOString(),
        title: '系统维护通知',
        metadata: {}
      },
      {
        id: 2,
        status: 'FAILED',
        channel: 'EMAIL',
        recipientId: 2,
        recipientName: '李四',
        sentAt: new Date().toISOString(),
        failureReason: '邮箱地址无效',
        title: '订单状态更新',
        metadata: {}
      }
    ]
    
    sendHistory.value = mockHistory
    historyTotal.value = mockHistory.length
  } catch (error) {
    console.error('加载发送历史失败:', error)
    ElMessage.error('加载发送历史失败')
  } finally {
    historyLoading.value = false
  }
}

// 加载模板列表
const loadTemplates = async () => {
  try {
    templates.value = await notificationStore.fetchTemplates()
  } catch (error) {
    console.error('加载模板列表失败:', error)
  }
}

// 加载用户列表
const loadUsers = async () => {
  try {
    // 这里应该调用获取用户列表的API
    users.value = []
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

// 加载角色列表
const loadRoles = async () => {
  try {
    // 这里应该调用获取角色列表的API
    roles.value = []
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

// 刷新数据
const handleRefresh = async () => {
  refreshLoading.value = true
  try {
    await Promise.all([
      loadStats(),
      loadTrendData(),
      loadChannelData(),
      loadSendHistory()
    ])
    ElMessage.success('刷新成功')
  } catch (error) {
    console.error('刷新失败:', error)
    ElMessage.error('刷新失败')
  } finally {
    refreshLoading.value = false
  }
}

// 趋势周期变化
const handleTrendPeriodChange = async () => {
  await loadTrendData()
}

// 历史搜索
const handleHistorySearch = async () => {
  historyCurrentPage.value = 1
  await loadSendHistory()
}

// 历史筛选变化
const handleHistoryFilterChange = async () => {
  historyCurrentPage.value = 1
  await loadSendHistory()
}

// 历史分页处理
const handleHistorySizeChange = async (size: number) => {
  historyPageSize.value = size
  await loadSendHistory()
}

const handleHistoryCurrentChange = async (page: number) => {
  historyCurrentPage.value = page
  await loadSendHistory()
}

// 重新发送
const handleResend = async (record: NotificationSendResult) => {
  try {
    await ElMessageBox.confirm(
      '确定要重新发送这条通知吗？',
      '确认重新发送',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    resendLoading.value = record.id
    await notificationApi.resendNotification(record.id, [record.channel])
    ElMessage.success('重新发送成功')
    await loadSendHistory()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重新发送失败:', error)
      ElMessage.error('重新发送失败')
    }
  } finally {
    resendLoading.value = null
  }
}

// 查看详情
const handleViewDetail = (record: NotificationSendResult) => {
  selectedSendRecord.value = record
  showDetailDialog.value = true
}

// 模板变化处理
const handleTemplateChange = (templateId: number) => {
  const template = templates.value.find(t => t.id === templateId)
  if (template) {
    sendForm.value.title = template.title
    sendForm.value.content = template.content
    sendForm.value.type = template.type as any
  }
}

// 接收者类型变化
const handleRecipientTypeChange = () => {
  selectedUsers.value = []
  selectedRoles.value = []
  updateRecipients()
}

// 定时发送变化
const handleScheduleChange = (enabled: boolean) => {
  if (!enabled) {
    sendForm.value.scheduledAt = null
  }
}

// 更新接收者列表
const updateRecipients = () => {
  sendForm.value.recipients = []
  
  if (recipientType.value === 'USER') {
    sendForm.value.recipients = selectedUsers.value.map(userId => ({
      type: 'USER',
      id: userId,
      name: users.value.find(u => u.id === userId)?.nickname || ''
    }))
  } else if (recipientType.value === 'ROLE') {
    sendForm.value.recipients = selectedRoles.value.map(roleId => ({
      type: 'ROLE',
      id: roleId,
      name: roles.value.find(r => r.id === roleId)?.name || ''
    }))
  } else if (recipientType.value === 'ALL') {
    sendForm.value.recipients = [{ type: 'ALL', id: 0, name: '全部用户' }]
  }
}

// 发送通知
const handleSendNotification = async () => {
  if (!sendFormRef.value) return
  
  try {
    await sendFormRef.value.validate()
    
    // 更新接收者列表
    updateRecipients()
    
    if (sendForm.value.recipients.length === 0 && recipientType.value !== 'ALL') {
      ElMessage.error('请选择接收者')
      return
    }
    
    sendLoading.value = true
    
    const sendData = {
      templateId: sendForm.value.templateId,
      title: sendForm.value.title,
      content: sendForm.value.content,
      type: sendForm.value.type,
      priority: sendForm.value.priority,
      channels: sendForm.value.channels,
      recipients: sendForm.value.recipients,
      scheduledAt: sendForm.value.scheduledAt?.toISOString()
    }
    
    await notificationStore.sendNotification(sendData)
    
    ElMessage.success(enableSchedule.value ? '定时发送设置成功' : '发送成功')
    handleCloseSendDialog()
    await loadSendHistory()
    await loadStats()
  } catch (error) {
    console.error('发送通知失败:', error)
    ElMessage.error('发送通知失败')
  } finally {
    sendLoading.value = false
  }
}

// 关闭发送对话框
const handleCloseSendDialog = () => {
  showSendDialog.value = false
  sendFormRef.value?.resetFields()
  sendForm.value = {
    templateId: null,
    title: '',
    content: '',
    type: 'INFO',
    priority: 'MEDIUM',
    channels: ['SYSTEM'],
    recipients: [],
    scheduledAt: null
  }
  enableSchedule.value = false
  recipientType.value = 'USER'
  selectedUsers.value = []
  selectedRoles.value = []
}

// 工具函数
const formatPercentage = (value?: number) => {
  if (typeof value !== 'number') return '0%'
  return `${(value * 100).toFixed(1)}%`
}

const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return format(date, 'yyyy-MM-dd HH:mm:ss')
  } catch (error) {
    return dateString
  }
}

const getChannelTagType = (channel: string) => {
  const typeMap = {
    SYSTEM: 'primary',
    EMAIL: 'success',
    SMS: 'warning',
    PUSH: 'info',
    WEBHOOK: 'danger'
  }
  return typeMap[channel as keyof typeof typeMap] || 'info'
}

const getChannelLabel = (channel: string) => {
  const labelMap = {
    SYSTEM: '系统',
    EMAIL: '邮件',
    SMS: '短信',
    PUSH: '推送',
    WEBHOOK: 'Webhook'
  }
  return labelMap[channel as keyof typeof labelMap] || channel
}

const getStatusTagType = (status: string) => {
  const typeMap = {
    SUCCESS: 'success',
    FAILED: 'danger',
    PENDING: 'warning'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    SUCCESS: '成功',
    FAILED: '失败',
    PENDING: '发送中'
  }
  return labelMap[status as keyof typeof labelMap] || status
}
</script>

<style scoped lang="scss">
.notification-send-stats {
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
  
  .stats-section {
    margin-bottom: 20px;
    
    .stat-card {
      display: flex;
      align-items: center;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        
        .el-icon {
          font-size: 24px;
          color: white;
        }
        
        &.success {
          background: var(--el-color-success);
        }
        
        &.primary {
          background: var(--el-color-primary);
        }
        
        &.warning {
          background: var(--el-color-warning);
        }
        
        &.info {
          background: var(--el-color-info);
        }
      }
      
      .stat-content {
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          line-height: 1;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
  
  .charts-section {
    margin-bottom: 20px;
    
    .chart-card {
      border: 1px solid var(--el-border-color-light);
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
      
      .chart-container {
        height: 300px;
        
        .chart-loading {
          padding: 40px 0;
        }
      }
    }
  }
  
  .history-section {
    .history-card {
      border: 1px solid var(--el-border-color-light);
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
          
          .search-input {
            width: 200px;
          }
          
          .el-select {
            width: 120px;
          }
        }
      }
      
      .history-content {
        .pagination-container {
          margin-top: 20px;
          display: flex;
          justify-content: center;
        }
      }
    }
  }
  
  .recipients-section {
    .recipient-type-tabs {
      margin-bottom: 12px;
    }
    
    .recipient-selector {
      margin-top: 12px;
    }
    
    .recipient-info {
      margin-top: 12px;
    }
  }
  
  .send-detail {
    .detail-item {
      display: flex;
      margin-bottom: 12px;
      
      label {
        width: 80px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
      
      span {
        flex: 1;
        color: var(--el-text-color-regular);
        
        &.error-text {
          color: var(--el-color-danger);
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
  .notification-send-stats {
    padding: 16px;
    
    .page-header {
      flex-direction: column;
      gap: 16px;
      
      .header-right {
        width: 100%;
        justify-content: flex-end;
      }
    }
    
    .charts-section {
      .el-col {
        margin-bottom: 20px;
      }
    }
    
    .history-section {
      .card-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
        
        .header-actions {
          flex-direction: column;
          
          .search-input,
          .el-select {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>