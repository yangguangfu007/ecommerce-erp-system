<template>
  <div class="system-logs">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h2>系统日志</h2>
        <p class="page-description">查看和管理系统运行日志</p>
      </div>
      <div class="page-actions">
        <el-button 
          type="danger" 
          :icon="Delete" 
          @click="handleClearLogs"
          :loading="clearLoading"
        >
          清空日志
        </el-button>
        <el-button 
          type="primary" 
          :icon="Refresh" 
          @click="handleRefresh"
          :loading="loading"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form 
        :model="queryParams" 
        inline 
        class="filter-form"
        @submit.prevent="handleSearch"
      >
        <el-form-item label="日志级别">
          <el-select 
            v-model="queryParams.level" 
            placeholder="请选择日志级别"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" value="" />
            <el-option label="跟踪" value="TRACE" />
            <el-option label="调试" value="DEBUG" />
            <el-option label="信息" value="INFO" />
            <el-option label="警告" value="WARN" />
            <el-option label="错误" value="ERROR" />
            <el-option label="致命" value="FATAL" />
          </el-select>
        </el-form-item>

        <el-form-item label="日志类型">
          <el-select 
            v-model="queryParams.type" 
            placeholder="请选择日志类型"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" value="" />
            <el-option label="系统" value="SYSTEM" />
            <el-option label="操作" value="OPERATION" />
            <el-option label="访问" value="ACCESS" />
            <el-option label="错误" value="ERROR" />
            <el-option label="安全" value="SECURITY" />
            <el-option label="审计" value="AUDIT" />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 350px"
          />
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入关键词搜索"
            style="width: 200px"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            搜索
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button 
            type="success" 
            :icon="Download" 
            @click="handleExport"
            :loading="exportLoading"
          >
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Document /></el-icon>
            日志记录
          </span>
          <div class="card-extra">
            <el-text type="info">
              共 {{ total }} 条记录
            </el-text>
          </div>
        </div>
      </template>

      <el-table 
        v-loading="loading"
        :data="logList" 
        stripe
        class="log-table"
        @row-click="handleRowClick"
      >
        <el-table-column prop="createdAt" label="时间" width="180" sortable>
          <template #default="{ row }">
            <el-text size="small">{{ formatDateTime(row.createdAt) }}</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="level" label="级别" width="80" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="getLogLevelType(row.level)" 
              size="small"
              effect="dark"
            >
              {{ getLogLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="getLogTypeColor(row.type)" 
              size="small"
              effect="plain"
            >
              {{ getLogTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="source" label="来源" width="120">
          <template #default="{ row }">
            <el-text size="small">{{ row.source }}</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="username" label="用户" width="100">
          <template #default="{ row }">
            <el-text size="small">{{ row.username || '-' }}</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="message" label="消息内容" min-width="300">
          <template #default="{ row }">
            <div class="log-message">
              <el-text 
                :class="['message-text', getLogLevelClass(row.level)]"
                truncated
              >
                {{ row.message }}
              </el-text>
              <el-button 
                v-if="row.details || row.stackTrace"
                type="primary" 
                link 
                size="small"
                @click.stop="showLogDetail(row)"
              >
                详情
              </el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="ip" label="IP地址" width="120">
          <template #default="{ row }">
            <el-text size="small">{{ row.ip || '-' }}</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="duration" label="耗时" width="80" align="right">
          <template #default="{ row }">
            <el-text size="small" v-if="row.duration">
              {{ row.duration }}ms
            </el-text>
            <el-text size="small" v-else>-</el-text>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="日志详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedLog" class="log-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="时间">
            {{ formatDateTime(selectedLog.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="级别">
            <el-tag :type="getLogLevelType(selectedLog.level)" size="small">
              {{ getLogLevelText(selectedLog.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="getLogTypeColor(selectedLog.type)" size="small">
              {{ getLogTypeText(selectedLog.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="来源">
            {{ selectedLog.source }}
          </el-descriptions-item>
          <el-descriptions-item label="用户">
            {{ selectedLog.username || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ selectedLog.ip || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="请求ID">
            {{ selectedLog.requestId || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="会话ID">
            {{ selectedLog.sessionId || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="耗时" v-if="selectedLog.duration">
            {{ selectedLog.duration }}ms
          </el-descriptions-item>
          <el-descriptions-item label="用户代理" span="2" v-if="selectedLog.userAgent">
            {{ selectedLog.userAgent }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section" v-if="selectedLog.message">
          <h4>消息内容</h4>
          <el-input
            :model-value="selectedLog.message"
            type="textarea"
            :rows="3"
            readonly
          />
        </div>

        <div class="detail-section" v-if="selectedLog.details">
          <h4>详细信息</h4>
          <el-input
            :model-value="JSON.stringify(selectedLog.details, null, 2)"
            type="textarea"
            :rows="6"
            readonly
          />
        </div>

        <div class="detail-section" v-if="selectedLog.stackTrace">
          <h4>堆栈跟踪</h4>
          <el-input
            :model-value="selectedLog.stackTrace"
            type="textarea"
            :rows="10"
            readonly
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Delete, 
  Refresh, 
  Download, 
  Document 
} from '@element-plus/icons-vue'
import { systemApi, type SystemLog, type SystemLogQuery } from '@/api/modules/system'
import { formatDateTime } from '@/utils'

// 响应式数据
const loading = ref(false)
const clearLoading = ref(false)
const exportLoading = ref(false)
const detailVisible = ref(false)
const logList = ref<SystemLog[]>([])
const total = ref(0)
const selectedLog = ref<SystemLog | null>(null)
const dateRange = ref<[string, string] | null>(null)

// 查询参数
const queryParams = reactive<SystemLogQuery>({
  page: 1,
  size: 20,
  level: '',
  type: '',
  keyword: '',
  startTime: '',
  endTime: ''
})

/**
 * 获取日志级别类型
 */
const getLogLevelType = (level: string) => {
  const typeMap: Record<string, string> = {
    'TRACE': 'info',
    'DEBUG': 'info', 
    'INFO': 'success',
    'WARN': 'warning',
    'ERROR': 'danger',
    'FATAL': 'danger'
  }
  return typeMap[level] || 'info'
}

/**
 * 获取日志级别文本
 */
const getLogLevelText = (level: string) => {
  const textMap: Record<string, string> = {
    'TRACE': '跟踪',
    'DEBUG': '调试',
    'INFO': '信息',
    'WARN': '警告',
    'ERROR': '错误',
    'FATAL': '致命'
  }
  return textMap[level] || level
}

/**
 * 获取日志级别样式类
 */
const getLogLevelClass = (level: string) => {
  const classMap: Record<string, string> = {
    'ERROR': 'error-message',
    'FATAL': 'error-message',
    'WARN': 'warning-message'
  }
  return classMap[level] || ''
}

/**
 * 获取日志类型颜色
 */
const getLogTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'SYSTEM': 'primary',
    'OPERATION': 'success',
    'ACCESS': 'info',
    'ERROR': 'danger',
    'SECURITY': 'warning',
    'AUDIT': 'primary'
  }
  return colorMap[type] || 'info'
}

/**
 * 获取日志类型文本
 */
const getLogTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'SYSTEM': '系统',
    'OPERATION': '操作',
    'ACCESS': '访问',
    'ERROR': '错误',
    'SECURITY': '安全',
    'AUDIT': '审计',
    'PERFORMANCE': '性能',
    'API': 'API'
  }
  return textMap[type] || type
}

/**
 * 加载日志列表
 */
const loadLogs = async () => {
  try {
    loading.value = true
    
    // 处理时间范围
    if (dateRange.value) {
      queryParams.startTime = dateRange.value[0]
      queryParams.endTime = dateRange.value[1]
    } else {
      queryParams.startTime = ''
      queryParams.endTime = ''
    }

    const response = await systemApi.getSystemLogs(queryParams)
    
    logList.value = response.data.content
    total.value = response.data.total
  } catch (error) {
    console.error('加载日志列表失败:', error)
    ElMessage.error('加载日志列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 搜索日志
 */
const handleSearch = () => {
  queryParams.page = 1
  loadLogs()
}

/**
 * 重置搜索条件
 */
const handleReset = () => {
  queryParams.level = ''
  queryParams.type = ''
  queryParams.keyword = ''
  queryParams.startTime = ''
  queryParams.endTime = ''
  dateRange.value = null
  queryParams.page = 1
  loadLogs()
}

/**
 * 刷新日志
 */
const handleRefresh = () => {
  loadLogs()
}

/**
 * 清空日志
 */
const handleClearLogs = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有日志吗？此操作不可恢复。',
      '清空确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    clearLoading.value = true
    
    // 清理30天前的日志
    await systemApi.cleanupSystemLogs(30)
    
    ElMessage.success('日志清空成功')
    loadLogs()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空日志失败:', error)
      ElMessage.error('清空日志失败，请重试')
    }
  } finally {
    clearLoading.value = false
  }
}

/**
 * 导出日志
 */
const handleExport = async () => {
  try {
    exportLoading.value = true
    
    const exportQuery = { ...queryParams }
    if (dateRange.value) {
      exportQuery.startTime = dateRange.value[0]
      exportQuery.endTime = dateRange.value[1]
    }

    const response = await systemApi.exportSystemLogs(exportQuery, 'excel')
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = response.data.downloadUrl
    link.download = `系统日志_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('日志导出成功')
  } catch (error) {
    console.error('导出日志失败:', error)
    ElMessage.error('导出日志失败，请重试')
  } finally {
    exportLoading.value = false
  }
}

/**
 * 分页大小改变
 */
const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  loadLogs()
}

/**
 * 当前页改变
 */
const handleCurrentChange = (page: number) => {
  queryParams.page = page
  loadLogs()
}

/**
 * 行点击事件
 */
const handleRowClick = (row: SystemLog) => {
  if (row.details || row.stackTrace) {
    showLogDetail(row)
  }
}

/**
 * 显示日志详情
 */
const showLogDetail = (log: SystemLog) => {
  selectedLog.value = log
  detailVisible.value = true
}

// 监听时间范围变化
watch(dateRange, () => {
  if (dateRange.value) {
    queryParams.startTime = dateRange.value[0]
    queryParams.endTime = dateRange.value[1]
  } else {
    queryParams.startTime = ''
    queryParams.endTime = ''
  }
})

// 组件挂载时加载数据
onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.system-logs {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-title h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.page-description {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.log-table {
  margin-bottom: 20px;
}

.log-message {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-text {
  flex: 1;
  min-width: 0;
}

.error-message {
  color: var(--el-color-danger);
}

.warning-message {
  color: var(--el-color-warning);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}

.log-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-logs {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .page-actions {
    justify-content: flex-end;
  }
  
  .filter-form {
    flex-direction: column;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>