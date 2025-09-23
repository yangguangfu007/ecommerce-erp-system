<template>
  <div class="system-logs">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-section">
        <h2 class="page-title">系统日志</h2>
        <p class="page-description">查看和分析系统运行日志</p>
      </div>
      <div class="page-actions">
        <el-button 
          type="default" 
          :icon="Refresh" 
          @click="refreshLogs"
          :loading="loading"
        >
          刷新
        </el-button>
        <el-button 
          type="primary" 
          :icon="Download" 
          @click="exportLogs"
          :loading="exporting"
        >
          导出日志
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">筛选条件</h3>
        <el-button 
          type="default" 
          size="small" 
          @click="resetFilters"
        >
          重置筛选
        </el-button>
      </div>
      <div class="card-body">
        <el-form :model="filterForm" inline class="filter-form">
          <el-form-item label="日志级别">
            <el-select 
              v-model="filterForm.level" 
              placeholder="选择日志级别"
              clearable
              style="width: 120px"
            >
              <el-option label="全部" value="" />
              <el-option label="DEBUG" value="DEBUG" />
              <el-option label="INFO" value="INFO" />
              <el-option label="WARN" value="WARN" />
              <el-option label="ERROR" value="ERROR" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="模块">
            <el-select 
              v-model="filterForm.module" 
              placeholder="选择模块"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="用户服务" value="user-service" />
              <el-option label="商品服务" value="product-service" />
              <el-option label="订单服务" value="order-service" />
              <el-option label="库存服务" value="inventory-service" />
              <el-option label="平台服务" value="platform-service" />
              <el-option label="物流服务" value="logistics-service" />
              <el-option label="通知服务" value="notification-service" />
              <el-option label="网关服务" value="gateway-service" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="filterForm.timeRange"
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
              v-model="filterForm.keyword" 
              placeholder="搜索日志内容"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              :icon="Search" 
              @click="searchLogs"
              :loading="loading"
            >
              搜索
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">
          日志列表
          <el-tag v-if="logStats.total > 0" type="info" size="small">
            共 {{ logStats.total }} 条
          </el-tag>
        </h3>
        <div class="card-actions">
          <el-button 
            type="danger" 
            size="small" 
            :icon="Delete"
            @click="clearLogs"
            :disabled="logList.length === 0"
          >
            清空日志
          </el-button>
        </div>
      </div>
      <div class="card-body">
        <el-table 
          :data="logList" 
          v-loading="loading"
          stripe
          height="500"
          class="log-table"
        >
          <el-table-column prop="level" label="级别" width="80" align="center">
            <template #default="{ row }">
              <el-tag 
                :type="getLogLevelType(row.level)" 
                size="small"
              >
                {{ row.level }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="createdAt" label="时间" width="180">
            <template #default="{ row }">
              <span class="log-time">{{ formatTime(row.createdAt) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="module" label="模块" width="120">
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ row.module }}</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="message" label="日志内容" min-width="300">
            <template #default="{ row }">
              <div class="log-message" :class="getLogLevelClass(row.level)">
                {{ row.message }}
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="userId" label="用户" width="100">
            <template #default="{ row }">
              <span v-if="row.userId">{{ row.userId }}</span>
              <span v-else class="text-muted">系统</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="ip" label="IP地址" width="120">
            <template #default="{ row }">
              <span v-if="row.ip" class="log-ip">{{ row.ip }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                text
                @click="viewLogDetail(row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            :current-page="pagination.page"
            :page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="60%"
      :before-close="handleDetailClose"
    >
      <div v-if="selectedLog" class="log-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志级别">
            <el-tag :type="getLogLevelType(selectedLog.level)">
              {{ selectedLog.level }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="模块">
            {{ selectedLog.module }}
          </el-descriptions-item>
          <el-descriptions-item label="时间">
            {{ formatTime(selectedLog.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="用户">
            {{ selectedLog.userId || '系统' }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ selectedLog.ip || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="用户代理">
            {{ selectedLog.userAgent || '-' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="log-message-detail">
          <h4>日志内容</h4>
          <div class="message-content" :class="getLogLevelClass(selectedLog.level)">
            {{ selectedLog.message }}
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Download, Search, Delete } from '@element-plus/icons-vue'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'

// 类型定义
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

interface FilterForm {
  level: string
  module: string
  timeRange: [string, string] | null
  keyword: string
}

interface LogStats {
  total: number
  debug: number
  info: number
  warn: number
  error: number
}

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const detailDialogVisible = ref(false)
const selectedLog = ref<SystemLog | null>(null)

const logList = ref<SystemLog[]>([])
const logStats = ref<LogStats>({
  total: 0,
  debug: 0,
  info: 0,
  warn: 0,
  error: 0
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const filterForm = reactive<FilterForm>({
  level: '',
  module: '',
  timeRange: null,
  keyword: ''
})

// 面包屑导航
const breadcrumbItems = [
  { title: '仪表板', path: '/dashboard' },
  { title: '系统设置', path: '/settings' },
  { title: '系统日志' }
]

// 方法
const fetchLogs = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟日志数据
    const mockLogs: SystemLog[] = [
      {
        id: '1',
        level: 'ERROR',
        message: '用户登录失败：密码错误',
        module: 'user-service',
        userId: 'admin',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: '2024-01-15 14:30:25'
      },
      {
        id: '2',
        level: 'WARN',
        message: '库存预警：商品SKU-001库存不足，当前库存：5',
        module: 'inventory-service',
        userId: 'system',
        ip: '127.0.0.1',
        createdAt: '2024-01-15 14:25:10'
      },
      {
        id: '3',
        level: 'INFO',
        message: '订单创建成功：订单号 ORD-20240115-001',
        module: 'order-service',
        userId: 'user001',
        ip: '192.168.1.101',
        createdAt: '2024-01-15 14:20:15'
      },
      {
        id: '4',
        level: 'DEBUG',
        message: '数据库连接池状态检查：活跃连接 5/20',
        module: 'gateway-service',
        createdAt: '2024-01-15 14:15:30'
      },
      {
        id: '5',
        level: 'ERROR',
        message: '平台API调用失败：沃尔玛API返回401未授权',
        module: 'platform-service',
        userId: 'system',
        ip: '127.0.0.1',
        createdAt: '2024-01-15 14:10:45'
      }
    ]
    
    logList.value = mockLogs
    pagination.total = mockLogs.length
    
    // 更新统计信息
    logStats.value = {
      total: mockLogs.length,
      debug: mockLogs.filter(log => log.level === 'DEBUG').length,
      info: mockLogs.filter(log => log.level === 'INFO').length,
      warn: mockLogs.filter(log => log.level === 'WARN').length,
      error: mockLogs.filter(log => log.level === 'ERROR').length
    }
  } catch (err) {
    console.error('获取日志失败:', err)
    ElMessage.error('获取日志失败')
  } finally {
    loading.value = false
  }
}

const refreshLogs = () => {
  fetchLogs()
}

const searchLogs = () => {
  // 重置分页
  pagination.page = 1
  fetchLogs()
}

const resetFilters = () => {
  filterForm.level = ''
  filterForm.module = ''
  filterForm.timeRange = null
  filterForm.keyword = ''
  searchLogs()
}

const exportLogs = async () => {
  try {
    exporting.value = true
    
    // 模拟导出过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('日志导出成功')
  } catch (err) {
    console.error('日志导出失败:', err)
    ElMessage.error('日志导出失败')
  } finally {
    exporting.value = false
  }
}

const clearLogs = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有日志吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟清空操作
    logList.value = []
    pagination.total = 0
    logStats.value = {
      total: 0,
      debug: 0,
      info: 0,
      warn: 0,
      error: 0
    }
    
    ElMessage.success('日志已清空')
  } catch {
    // 用户取消操作
  }
}

const viewLogDetail = (log: SystemLog) => {
  selectedLog.value = log
  detailDialogVisible.value = true
}

const handleDetailClose = () => {
  detailDialogVisible.value = false
  selectedLog.value = null
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  fetchLogs()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchLogs()
}

const getLogLevelType = (level: string) => {
  const typeMap = {
    'DEBUG': 'info',
    'INFO': 'success',
    'WARN': 'warning',
    'ERROR': 'danger'
  }
  return typeMap[level as keyof typeof typeMap] || 'info'
}

const getLogLevelClass = (level: string) => {
  return `log-level-${level.toLowerCase()}`
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  fetchLogs()
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-body {
  padding: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.log-table {
  width: 100%;
}

.log-time {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
}

.log-message {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  word-break: break-all;
}

.log-level-debug {
  color: var(--el-color-info);
}

.log-level-info {
  color: var(--el-color-success);
}

.log-level-warn {
  color: var(--el-color-warning);
}

.log-level-error {
  color: var(--el-color-danger);
  font-weight: 500;
}

.log-ip {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
}

.text-muted {
  color: var(--el-text-color-placeholder);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.log-detail {
  padding: 0;
}

.log-message-detail {
  margin-top: 20px;
}

.log-message-detail h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
}

.message-content {
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-logs {
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
  
  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-form .el-form-item {
    margin-bottom: 16px;
  }
}
</style>