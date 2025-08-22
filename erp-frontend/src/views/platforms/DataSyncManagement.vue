<template>
  <div class="data-sync-management">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-section">
        <h2 class="page-title">数据同步管理</h2>
        <p class="page-description">管理平台数据同步任务、计划和日志</p>
      </div>
      <div class="page-actions">
        <el-button 
          type="default" 
          :icon="Refresh" 
          @click="refreshAllStatus"
          :loading="refreshing"
        >
          刷新状态
        </el-button>
        <el-button 
          type="primary" 
          :icon="VideoPlay" 
          @click="showSyncDialog"
          :disabled="hasActiveTasks"
        >
          启动同步
        </el-button>
      </div>
    </div>

    <!-- 同步操作面板 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">同步操作</h3>
        <div class="card-actions">
          <el-tag v-if="hasActiveTasks" type="warning" effect="plain">
            {{ activeTasks.length }} 个任务运行中
          </el-tag>
        </div>
      </div>
      <div class="card-body">
        <!-- 同步类型选择 -->
        <div class="sync-type-selector">
          <div class="sync-type-grid">
            <div 
              v-for="syncType in syncTypes" 
              :key="syncType.type"
              class="sync-type-card"
              :class="{ 
                active: selectedSyncTypes.includes(syncType.type),
                disabled: syncType.disabled 
              }"
              @click="toggleSyncType(syncType.type)"
            >
              <div class="sync-type-icon">
                <component :is="syncType.icon" />
              </div>
              <div class="sync-type-info">
                <h4>{{ syncType.name }}</h4>
                <p>{{ syncType.description }}</p>
                <div v-if="syncType.lastSync" class="last-sync">
                  上次同步: {{ formatDateTime(syncType.lastSync) }}
                </div>
              </div>
              <div v-if="syncType.status" class="sync-status">
                <el-tag :type="getSyncStatusType(syncType.status)" size="small">
                  {{ getSyncStatusText(syncType.status) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>   
 <!-- 同步进度显示 -->
    <div v-if="activeTasks.length > 0" class="content-card">
      <div class="card-header">
        <h3 class="card-title">同步进度</h3>
        <div class="card-actions">
          <el-button 
            type="danger" 
            size="small" 
            :icon="VideoPause"
            @click="stopAllTasks"
            :loading="stoppingTasks"
          >
            停止所有任务
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <div class="progress-list">
          <div 
            v-for="task in activeTasks" 
            :key="task.taskId"
            class="progress-item"
          >
            <div class="progress-info">
              <div class="task-header">
                <h4 class="task-name">{{ getTaskDisplayName(task) }}</h4>
                <div class="task-actions">
                  <el-button 
                    type="danger" 
                    size="small" 
                    text
                    @click="stopTask(task.taskId)"
                    :loading="task.stopping"
                  >
                    停止
                  </el-button>
                </div>
              </div>
              
              <div class="progress-bar-container">
                <el-progress 
                  :percentage="task.progress" 
                  :status="getProgressStatus(task.status)"
                  :stroke-width="8"
                />
                <div class="progress-text">
                  {{ task.processedRecords }}/{{ task.totalRecords }} 
                  ({{ task.progress }}%)
                </div>
              </div>
              
              <div class="task-details">
                <div class="detail-item">
                  <span class="detail-label">状态:</span>
                  <el-tag :type="getTaskStatusType(task.status)" size="small">
                    {{ getTaskStatusText(task.status) }}
                  </el-tag>
                </div>
                <div class="detail-item">
                  <span class="detail-label">开始时间:</span>
                  <span class="detail-value">{{ formatDateTime(task.startTime) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">成功:</span>
                  <span class="detail-value success">{{ task.successRecords }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">失败:</span>
                  <span class="detail-value error">{{ task.failedRecords }}</span>
                </div>
              </div>

              <!-- 错误信息 -->
              <div v-if="task.errors && task.errors.length > 0" class="task-errors">
                <el-collapse>
                  <el-collapse-item title="错误详情" name="errors">
                    <div class="error-list">
                      <div 
                        v-for="(error, index) in task.errors.slice(0, 5)" 
                        :key="index"
                        class="error-item"
                      >
                        <div class="error-header">
                          <span class="error-code">{{ error.errorCode }}</span>
                          <span class="error-record">{{ error.recordType }}: {{ error.recordId }}</span>
                        </div>
                        <div class="error-message">{{ error.errorMessage }}</div>
                      </div>
                      <div v-if="task.errors.length > 5" class="error-more">
                        还有 {{ task.errors.length - 5 }} 个错误...
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>   
 <!-- 同步计划设置 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">同步计划设置</h3>
        <div class="card-actions">
          <el-switch 
            v-model="scheduleEnabled" 
            @change="toggleSchedule"
            active-text="启用自动同步"
            inactive-text="禁用自动同步"
          />
        </div>
      </div>
      <div class="card-body">
        <div v-if="scheduleEnabled" class="schedule-config">
          <el-form 
            :model="scheduleForm" 
            label-width="120px"
            size="default"
          >
            <div class="form-row">
              <el-form-item label="同步频率">
                <el-select v-model="scheduleForm.frequency" @change="onFrequencyChange">
                  <el-option label="每小时" value="hourly" />
                  <el-option label="每天" value="daily" />
                  <el-option label="每周" value="weekly" />
                  <el-option label="自定义" value="custom" />
                </el-select>
              </el-form-item>
              
              <el-form-item v-if="scheduleForm.frequency === 'hourly'" label="间隔小时">
                <el-input-number 
                  v-model="scheduleForm.intervalHours" 
                  :min="1" 
                  :max="24"
                  controls-position="right"
                />
              </el-form-item>
              
              <el-form-item v-if="scheduleForm.frequency === 'daily'" label="执行时间">
                <el-time-picker
                  v-model="scheduleForm.dailyTime"
                  format="HH:mm"
                  placeholder="选择时间"
                />
              </el-form-item>
              
              <el-form-item v-if="scheduleForm.frequency === 'weekly'" label="执行日期">
                <el-select v-model="scheduleForm.weeklyDays" multiple>
                  <el-option label="周一" :value="1" />
                  <el-option label="周二" :value="2" />
                  <el-option label="周三" :value="3" />
                  <el-option label="周四" :value="4" />
                  <el-option label="周五" :value="5" />
                  <el-option label="周六" :value="6" />
                  <el-option label="周日" :value="0" />
                </el-select>
              </el-form-item>
              
              <el-form-item v-if="scheduleForm.frequency === 'custom'" label="Cron表达式">
                <el-input 
                  v-model="scheduleForm.cronExpression" 
                  placeholder="0 0 */6 * * ?"
                />
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="同步类型">
                <el-checkbox-group v-model="scheduleForm.syncTypes">
                  <el-checkbox label="PRODUCTS">商品</el-checkbox>
                  <el-checkbox label="ORDERS">订单</el-checkbox>
                  <el-checkbox label="INVENTORY">库存</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="错误处理">
                <el-radio-group v-model="scheduleForm.errorHandling">
                  <el-radio label="continue">继续执行</el-radio>
                  <el-radio label="stop">停止执行</el-radio>
                  <el-radio label="retry">自动重试</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item v-if="scheduleForm.errorHandling === 'retry'" label="重试次数">
                <el-input-number 
                  v-model="scheduleForm.retryCount" 
                  :min="1" 
                  :max="5"
                  controls-position="right"
                />
              </el-form-item>
            </div>
            
            <div class="form-actions">
              <el-button 
                type="primary" 
                @click="saveSchedule"
                :loading="savingSchedule"
              >
                保存计划
              </el-button>
              <el-button @click="resetSchedule">重置</el-button>
            </div>
          </el-form>
          
          <!-- 下次执行时间预览 -->
          <div v-if="nextExecutionTime" class="next-execution">
            <el-alert
              :title="`下次执行时间: ${formatDateTime(nextExecutionTime)}`"
              type="info"
              :closable="false"
            />
          </div>
        </div>
        
        <div v-else class="schedule-disabled">
          <el-empty description="自动同步已禁用" />
        </div>
      </div>
    </div>    
<!-- 同步日志查看 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">同步日志</h3>
        <div class="card-actions">
          <el-button 
            type="default" 
            size="small"
            :icon="Download"
            @click="exportLogs"
          >
            导出日志
          </el-button>
          <el-button 
            type="danger" 
            size="small"
            :icon="Delete"
            @click="clearLogs"
          >
            清空日志
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <!-- 日志筛选 -->
        <div class="logs-filters">
          <div class="filter-row">
            <el-select 
              v-model="logFilters.syncType" 
              placeholder="同步类型" 
              clearable
              size="small"
              style="width: 120px"
            >
              <el-option label="全部" value="" />
              <el-option label="商品" value="PRODUCTS" />
              <el-option label="订单" value="ORDERS" />
              <el-option label="库存" value="INVENTORY" />
            </el-select>
            
            <el-select 
              v-model="logFilters.status" 
              placeholder="状态" 
              clearable
              size="small"
              style="width: 100px"
            >
              <el-option label="全部" value="" />
              <el-option label="成功" value="COMPLETED" />
              <el-option label="失败" value="FAILED" />
              <el-option label="运行中" value="RUNNING" />
            </el-select>
            
            <el-date-picker
              v-model="logFilters.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              size="small"
              style="width: 300px"
            />
            
            <el-button 
              type="primary" 
              size="small"
              @click="loadSyncLogs"
            >
              查询
            </el-button>
          </div>
        </div>

        <!-- 日志列表 -->
        <div class="logs-table">
          <el-table 
            :data="syncLogs" 
            :loading="logsLoading"
            stripe
            size="small"
          >
            <el-table-column prop="taskId" label="任务ID" width="120" />
            <el-table-column prop="syncType" label="同步类型" width="80">
              <template #default="{ row }">
                <el-tag size="small">{{ getSyncTypeText(row?.syncType || '') }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getTaskStatusType(row?.status || '')" size="small">
                  {{ getTaskStatusText(row?.status || '') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" width="100">
              <template #default="{ row }">
                <el-progress 
                  :percentage="row?.progress || 0" 
                  :show-text="false"
                  :stroke-width="6"
                />
                <span class="progress-text">{{ row?.progress || 0 }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="processedRecords" label="处理记录" width="100">
              <template #default="{ row }">
                {{ row?.processedRecords || 0 }}/{{ row?.totalRecords || 0 }}
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="150">
              <template #default="{ row }">
                {{ row?.startTime ? formatDateTime(row.startTime) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="endTime" label="结束时间" width="150">
              <template #default="{ row }">
                {{ row?.endTime ? formatDateTime(row.endTime) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  size="small" 
                  text
                  @click="viewLogDetails(row)"
                >
                  详情
                </el-button>
                <el-button 
                  v-if="row?.status === 'FAILED'" 
                  type="warning" 
                  size="small" 
                  text
                  @click="retryTask(row?.taskId || '')"
                >
                  重试
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="logs-pagination">
            <el-pagination
              v-model:current-page="logPagination.page"
              v-model:page-size="logPagination.size"
              :total="logPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadSyncLogs"
              @current-change="loadSyncLogs"
            />
          </div>
        </div>
      </div>
    </div>    <
!-- 启动同步对话框 -->
    <el-dialog
      v-model="syncDialogVisible"
      title="启动数据同步"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="syncForm" 
        label-width="100px"
        size="default"
      >
        <el-form-item label="同步类型" required>
          <el-checkbox-group v-model="syncForm.syncTypes">
            <el-checkbox label="PRODUCTS">商品数据</el-checkbox>
            <el-checkbox label="ORDERS">订单数据</el-checkbox>
            <el-checkbox label="INVENTORY">库存数据</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="syncForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="强制同步">
          <el-switch 
            v-model="syncForm.force"
            active-text="是"
            inactive-text="否"
          />
          <div class="form-help">
            强制同步将忽略上次同步时间，重新同步所有数据
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="syncDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="startSync"
            :loading="startingSyncTask"
          >
            开始同步
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="logDetailDialogVisible"
      title="同步日志详情"
      width="800px"
    >
      <div v-if="selectedLog" class="log-detail">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">任务ID:</span>
              <span class="value">{{ selectedLog.taskId }}</span>
            </div>
            <div class="detail-item">
              <span class="label">同步类型:</span>
              <span class="value">{{ getSyncTypeText(selectedLog.syncType) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">状态:</span>
              <el-tag :type="getTaskStatusType(selectedLog.status)">
                {{ getTaskStatusText(selectedLog.status) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="label">进度:</span>
              <span class="value">{{ selectedLog.progress }}%</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>执行统计</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">总记录数:</span>
              <span class="value">{{ selectedLog.totalRecords }}</span>
            </div>
            <div class="detail-item">
              <span class="label">已处理:</span>
              <span class="value">{{ selectedLog.processedRecords }}</span>
            </div>
            <div class="detail-item">
              <span class="label">成功:</span>
              <span class="value success">{{ selectedLog.successRecords }}</span>
            </div>
            <div class="detail-item">
              <span class="label">失败:</span>
              <span class="value error">{{ selectedLog.failedRecords }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>时间信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">开始时间:</span>
              <span class="value">{{ formatDateTime(selectedLog.startTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">结束时间:</span>
              <span class="value">{{ selectedLog.endTime ? formatDateTime(selectedLog.endTime) : '未结束' }}</span>
            </div>
            <div v-if="selectedLog.endTime" class="detail-item">
              <span class="label">耗时:</span>
              <span class="value">{{ calculateDuration(selectedLog.startTime, selectedLog.endTime) }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="selectedLog.errorMessage" class="detail-section">
          <h4>错误信息</h4>
          <div class="error-message">
            {{ selectedLog.errorMessage }}
          </div>
        </div>
        
        <div v-if="selectedLog.details" class="detail-section">
          <h4>详细信息</h4>
          <pre class="detail-json">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Refresh, VideoPlay, VideoPause, Download, Delete,
  Box, ShoppingCart, House
} from '@element-plus/icons-vue'
import { platformApi } from '@/api/modules/platform'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import type { 
  SyncDataResult, 
  SyncLog, 
  SyncLogQuery, 
  SyncSchedule,
  SyncDataRequest 
} from '@/api/modules/platform'

// 类型定义
interface SyncType {
  type: string
  name: string
  description: string
  icon: any
  lastSync?: string
  status?: string
  disabled?: boolean
}

interface SyncForm {
  syncTypes: string[]
  dateRange: [Date, Date] | null
  force: boolean
}

interface LogFilters {
  syncType: string
  status: string
  dateRange: [Date, Date] | null
}

// Props
interface Props {
  platformId?: number
}

const props = withDefaults(defineProps<Props>(), {
  platformId: undefined
})

// 响应式数据
const refreshing = ref(false)
const stoppingTasks = ref(false)
const syncDialogVisible = ref(false)
const startingSyncTask = ref(false)
const logDetailDialogVisible = ref(false)
const scheduleEnabled = ref(false)
const savingSchedule = ref(false)
const logsLoading = ref(false)
const nextExecutionTime = ref<string | null>(null)

// 选中的同步类型
const selectedSyncTypes = ref<string[]>([])

// 活跃的同步任务
const activeTasks = ref<SyncDataResult[]>([])

// 同步日志
const syncLogs = ref<SyncLog[]>([])
const selectedLog = ref<SyncLog | null>(null)

// 同步类型配置
const syncTypes: SyncType[] = [
  {
    type: 'PRODUCTS',
    name: '商品数据',
    description: '同步商品信息、价格、库存等',
    icon: Box,
    lastSync: '2024-01-15 14:30:00',
    status: 'COMPLETED'
  },
  {
    type: 'ORDERS',
    name: '订单数据',
    description: '同步订单信息、状态更新等',
    icon: ShoppingCart,
    lastSync: '2024-01-15 15:00:00',
    status: 'RUNNING'
  },
  {
    type: 'INVENTORY',
    name: '库存数据',
    description: '同步库存数量、预警信息等',
    icon: House,
    lastSync: '2024-01-15 13:45:00',
    status: 'FAILED'
  }
]

// 同步表单
const syncForm = reactive<SyncForm>({
  syncTypes: [],
  dateRange: null,
  force: false
})

// 计划表单
const scheduleForm = reactive<SyncSchedule>({
  enabled: false,
  frequency: 'daily',
  intervalHours: 6,
  dailyTime: '02:00',
  weeklyDays: [1, 2, 3, 4, 5],
  cronExpression: '0 0 */6 * * ?',
  syncTypes: ['PRODUCTS', 'ORDERS', 'INVENTORY'],
  errorHandling: 'continue',
  retryCount: 3
})

// 日志筛选
const logFilters = reactive<LogFilters>({
  syncType: '',
  status: '',
  dateRange: null
})

// 日志分页
const logPagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 定时器
let statusTimer: NodeJS.Timeout | null = null

// 计算属性
const hasActiveTasks = computed(() => {
  return activeTasks.value.some(task => 
    task.status === 'RUNNING' || task.status === 'PENDING'
  )
})

// 面包屑导航
const breadcrumbItems = [
  { title: '仪表板', to: '/dashboard' },
  { title: '平台管理', to: '/platforms' },
  { title: '数据同步' }
]

// 方法
const toggleSyncType = (type: string) => {
  const index = selectedSyncTypes.value.indexOf(type)
  if (index > -1) {
    selectedSyncTypes.value.splice(index, 1)
  } else {
    selectedSyncTypes.value.push(type)
  }
}

const refreshAllStatus = async () => {
  try {
    refreshing.value = true
    await loadActiveTasks()
    await loadSyncLogs()
    ElMessage.success('状态刷新成功')
  } catch (error) {
    ElMessage.error('状态刷新失败')
  } finally {
    refreshing.value = false
  }
}

const showSyncDialog = () => {
  syncForm.syncTypes = [...selectedSyncTypes.value]
  syncDialogVisible.value = true
}

const startSync = async () => {
  if (syncForm.syncTypes.length === 0) {
    ElMessage.warning('请选择要同步的数据类型')
    return
  }

  try {
    startingSyncTask.value = true
    
    for (const syncType of syncForm.syncTypes) {
      const syncRequest: SyncDataRequest = {
        platformId: props.platformId,
        syncType: syncType as any,
        startDate: syncForm.dateRange?.[0]?.toISOString(),
        endDate: syncForm.dateRange?.[1]?.toISOString(),
        force: syncForm.force
      }
      
      const response = await platformApi.startDataSync(syncRequest)
      activeTasks.value.push(response.data)
    }
    
    syncDialogVisible.value = false
    ElMessage.success('同步任务已启动')
    
    // 开始轮询状态
    startStatusPolling()
    
  } catch (error) {
    ElMessage.error('启动同步任务失败')
  } finally {
    startingSyncTask.value = false
  }
}

const stopTask = async (taskId: string) => {
  try {
    const task = activeTasks.value.find(t => t.taskId === taskId)
    if (task) {
      task.stopping = true
    }
    
    await platformApi.stopSyncTask(taskId)
    
    // 从活跃任务列表中移除
    const index = activeTasks.value.findIndex(t => t.taskId === taskId)
    if (index > -1) {
      activeTasks.value.splice(index, 1)
    }
    
    ElMessage.success('任务已停止')
  } catch (error) {
    ElMessage.error('停止任务失败')
  }
}

const stopAllTasks = async () => {
  try {
    await ElMessageBox.confirm('确定要停止所有同步任务吗？', '确认操作', {
      type: 'warning'
    })
    
    stoppingTasks.value = true
    
    const stopPromises = activeTasks.value.map(task => 
      platformApi.stopSyncTask(task.taskId)
    )
    
    await Promise.all(stopPromises)
    activeTasks.value = []
    
    ElMessage.success('所有任务已停止')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('停止任务失败')
    }
  } finally {
    stoppingTasks.value = false
  }
}

const loadActiveTasks = async () => {
  try {
    const response = await platformApi.getActiveSyncTasks()
    activeTasks.value = response.data
  } catch (error) {
    console.error('加载活跃任务失败:', error)
  }
}

const loadSyncLogs = async () => {
  try {
    logsLoading.value = true
    
    const query: SyncLogQuery = {
      page: logPagination.page,
      size: logPagination.size,
      platformId: props.platformId,
      syncType: logFilters.syncType || undefined,
      status: logFilters.status || undefined,
      startDate: logFilters.dateRange?.[0]?.toISOString(),
      endDate: logFilters.dateRange?.[1]?.toISOString()
    }
    
    const response = await platformApi.getSyncLogs(query)
    syncLogs.value = response.data.records
    logPagination.total = response.data.total
    
  } catch (error) {
    ElMessage.error('加载同步日志失败')
  } finally {
    logsLoading.value = false
  }
}

const viewLogDetails = (log: SyncLog) => {
  selectedLog.value = log
  logDetailDialogVisible.value = true
}

const retryTask = async (taskId: string) => {
  try {
    await ElMessageBox.confirm('确定要重试此同步任务吗？', '确认操作', {
      type: 'warning'
    })
    
    const response = await platformApi.retrySyncTask(taskId)
    activeTasks.value.push(response.data)
    
    ElMessage.success('任务重试已启动')
    startStatusPolling()
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重试任务失败')
    }
  }
}

const exportLogs = async () => {
  try {
    const query: SyncLogQuery = {
      page: 1,
      size: 10000, // 导出所有数据
      platformId: props.platformId,
      syncType: logFilters.syncType || undefined,
      status: logFilters.status || undefined,
      startDate: logFilters.dateRange?.[0]?.toISOString(),
      endDate: logFilters.dateRange?.[1]?.toISOString()
    }
    
    const response = await platformApi.exportSyncLogs(query)
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = response.data.downloadUrl
    link.download = `sync-logs-${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('日志导出成功')
  } catch (error) {
    ElMessage.error('导出日志失败')
  }
}

const clearLogs = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有同步日志吗？此操作不可恢复。', '确认操作', {
      type: 'warning'
    })
    
    await platformApi.clearSyncLogs(props.platformId)
    
    syncLogs.value = []
    logPagination.total = 0
    
    ElMessage.success('日志已清空')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空日志失败')
    }
  }
}

const toggleSchedule = async (enabled: boolean) => {
  try {
    await platformApi.toggleSyncSchedule(enabled, props.platformId)
    
    if (enabled) {
      await loadSchedule()
      calculateNextExecutionTime()
    } else {
      nextExecutionTime.value = null
    }
    
    ElMessage.success(enabled ? '自动同步已启用' : '自动同步已禁用')
  } catch (error) {
    ElMessage.error('切换同步计划失败')
    scheduleEnabled.value = !enabled // 回滚状态
  }
}

const onFrequencyChange = () => {
  calculateNextExecutionTime()
}

const calculateNextExecutionTime = async () => {
  try {
    const response = await platformApi.getNextExecutionTime(scheduleForm)
    nextExecutionTime.value = response.data.nextExecution
  } catch (error) {
    console.error('计算下次执行时间失败:', error)
  }
}

const saveSchedule = async () => {
  try {
    savingSchedule.value = true
    
    const scheduleData = {
      ...scheduleForm,
      platformId: props.platformId
    }
    
    await platformApi.saveSyncSchedule(scheduleData)
    
    ElMessage.success('同步计划保存成功')
    calculateNextExecutionTime()
    
  } catch (error) {
    ElMessage.error('保存同步计划失败')
  } finally {
    savingSchedule.value = false
  }
}

const resetSchedule = () => {
  Object.assign(scheduleForm, {
    enabled: false,
    frequency: 'daily',
    intervalHours: 6,
    dailyTime: '02:00',
    weeklyDays: [1, 2, 3, 4, 5],
    cronExpression: '0 0 */6 * * ?',
    syncTypes: ['PRODUCTS', 'ORDERS', 'INVENTORY'],
    errorHandling: 'continue',
    retryCount: 3
  })
  nextExecutionTime.value = null
}

const loadSchedule = async () => {
  try {
    const response = await platformApi.getSyncSchedule(props.platformId)
    Object.assign(scheduleForm, response.data)
    scheduleEnabled.value = response.data.enabled
  } catch (error) {
    console.error('加载同步计划失败:', error)
  }
}

const startStatusPolling = () => {
  if (statusTimer) {
    clearInterval(statusTimer)
  }
  
  statusTimer = setInterval(async () => {
    if (activeTasks.value.length === 0) {
      clearInterval(statusTimer!)
      statusTimer = null
      return
    }
    
    try {
      // 更新任务状态
      for (const task of activeTasks.value) {
        const response = await platformApi.getSyncTaskStatus(task.taskId)
        Object.assign(task, response.data)
      }
      
      // 移除已完成的任务
      activeTasks.value = activeTasks.value.filter(task => 
        task.status === 'RUNNING' || task.status === 'PENDING'
      )
      
    } catch (error) {
      console.error('更新任务状态失败:', error)
    }
  }, 3000) // 每3秒更新一次
}// 工具方法

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

const getSyncStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'COMPLETED': 'success',
    'RUNNING': 'warning',
    'FAILED': 'danger',
    'PENDING': 'info'
  }
  return statusMap[status] || 'info'
}

const getSyncStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'COMPLETED': '已完成',
    'RUNNING': '运行中',
    'FAILED': '失败',
    'PENDING': '等待中'
  }
  return statusMap[status] || status
}

const getTaskDisplayName = (task: SyncDataResult) => {
  const typeMap: Record<string, string> = {
    'PRODUCTS': '商品数据同步',
    'ORDERS': '订单数据同步',
    'INVENTORY': '库存数据同步'
  }
  return typeMap[task.syncType || ''] || '数据同步'
}

const getProgressStatus = (status: string) => {
  if (status === 'FAILED') return 'exception'
  if (status === 'COMPLETED') return 'success'
  return undefined
}

const getTaskStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'COMPLETED': 'success',
    'RUNNING': 'warning',
    'FAILED': 'danger',
    'PENDING': 'info'
  }
  return statusMap[status] || 'info'
}

const getTaskStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'COMPLETED': '已完成',
    'RUNNING': '运行中',
    'FAILED': '失败',
    'PENDING': '等待中'
  }
  return statusMap[status] || status
}

const getSyncTypeText = (syncType: string) => {
  const typeMap: Record<string, string> = {
    'PRODUCTS': '商品',
    'ORDERS': '订单',
    'INVENTORY': '库存'
  }
  return typeMap[syncType] || syncType
}

const calculateDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const duration = end - start
  
  const hours = Math.floor(duration / (1000 * 60 * 60))
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((duration % (1000 * 60)) / 1000)
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟${seconds}秒`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds}秒`
  } else {
    return `${seconds}秒`
  }
}

// 生命周期
onMounted(async () => {
  await loadActiveTasks()
  await loadSyncLogs()
  await loadSchedule()
  
  if (activeTasks.value.length > 0) {
    startStatusPolling()
  }
})

onUnmounted(() => {
  if (statusTimer) {
    clearInterval(statusTimer)
  }
})
</script>

<style scoped>
.data-sync-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.page-title-section {
  flex: 1;
}

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

.page-actions {
  display: flex;
  gap: 12px;
}

.content-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.card-body {
  padding: 20px;
}

/* 同步类型选择 */
.sync-type-selector {
  margin-bottom: 20px;
}

.sync-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.sync-type-card {
  border: 2px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.sync-type-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.sync-type-card.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.sync-type-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sync-type-card .sync-type-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.sync-type-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 4px 0;
}

.sync-type-info p {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 0 8px 0;
}

.last-sync {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.sync-status {
  position: absolute;
  top: 12px;
  right: 12px;
}

/* 同步进度 */
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-bg-color-page);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.progress-bar-container {
  margin-bottom: 12px;
}

.progress-text {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}

.task-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.detail-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.detail-value {
  font-size: 12px;
  color: var(--el-text-color-primary);
}

.detail-value.success {
  color: var(--el-color-success);
}

.detail-value.error {
  color: var(--el-color-danger);
}

/* 错误信息 */
.task-errors {
  margin-top: 12px;
}

.error-list {
  max-height: 200px;
  overflow-y: auto;
}

.error-item {
  padding: 8px;
  border: 1px solid var(--el-color-danger-light-7);
  border-radius: 4px;
  margin-bottom: 8px;
  background: var(--el-color-danger-light-9);
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.error-code {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-danger);
}

.error-record {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.error-message {
  font-size: 12px;
  color: var(--el-text-color-primary);
}

.error-more {
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 8px;
}

/* 同步计划 */
.schedule-config {
  max-width: 800px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

.next-execution {
  margin-top: 16px;
}

.schedule-disabled {
  text-align: center;
  padding: 40px 0;
}

/* 日志筛选 */
.logs-filters {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

/* 日志表格 */
.logs-table {
  margin-top: 16px;
}

.logs-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

/* 对话框 */
.form-help {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 日志详情 */
.log-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.detail-grid .detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.detail-grid .label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.detail-grid .value {
  font-size: 12px;
  color: var(--el-text-color-primary);
}

.detail-grid .value.success {
  color: var(--el-color-success);
}

.detail-grid .value.error {
  color: var(--el-color-danger);
}

.error-message {
  padding: 12px;
  background: var(--el-color-danger-light-9);
  border: 1px solid var(--el-color-danger-light-7);
  border-radius: 4px;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.detail-json {
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  color: var(--el-text-color-primary);
  overflow-x: auto;
  white-space: pre-wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-sync-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .page-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .sync-type-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .task-details {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-row > * {
    width: 100%;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>