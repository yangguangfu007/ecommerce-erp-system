<template>
  <div class="report-generation-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-left">
        <h2 class="page-title">报表生成</h2>
        <p class="page-description">创建和管理多维度数据分析报表</p>
      </div>
      <div class="page-actions">
        <el-button 
          @click="showTemplateDialog = true"
          type="default"
        >
          <el-icon><Document /></el-icon>
          模板管理
        </el-button>
        <el-button 
          @click="resetForm"
          type="default"
        >
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
        <el-button 
          @click="generateReport"
          :loading="generating"
          type="primary"
        >
          <el-icon><TrendCharts /></el-icon>
          生成报表
        </el-button>
      </div>
    </div>

    <div class="report-content">
      <!-- 报表配置区域 -->
      <div class="config-section">
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">报表配置</h3>
            <div class="card-actions">
              <el-button 
                text 
                @click="loadTemplate"
                :disabled="!selectedTemplate"
              >
                <el-icon><Upload /></el-icon>
                加载模板
              </el-button>
              <el-button 
                text 
                @click="saveAsTemplate"
                :disabled="!reportConfig.name"
              >
                <el-icon><Download /></el-icon>
                保存为模板
              </el-button>
            </div>
          </div>        
  <div class="card-body">
            <el-form 
              ref="configFormRef"
              :model="reportConfig" 
              :rules="configRules"
              label-width="120px"
              class="report-config-form"
            >
              <!-- 基本信息 -->
              <div class="form-section">
                <h4 class="section-title">基本信息</h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="报表名称" prop="name">
                      <el-input 
                        v-model="reportConfig.name"
                        placeholder="请输入报表名称"
                        clearable
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="报表类型" prop="type">
                      <el-select 
                        v-model="reportConfig.type"
                        placeholder="请选择报表类型"
                        style="width: 100%"
                        @change="onReportTypeChange"
                      >
                        <el-option 
                          v-for="type in reportTypes"
                          :key="type.value"
                          :label="type.label"
                          :value="type.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="报表描述" prop="description">
                      <el-input 
                        v-model="reportConfig.description"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入报表描述"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <!-- 数据源配置 -->
              <div class="form-section">
                <h4 class="section-title">数据源配置</h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="数据源" prop="dataSource">
                      <el-select 
                        v-model="reportConfig.dataSource"
                        placeholder="请选择数据源"
                        style="width: 100%"
                        @change="onDataSourceChange"
                      >
                        <el-option 
                          v-for="source in dataSources"
                          :key="source.value"
                          :label="source.label"
                          :value="source.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="时间范围" prop="dateRange">
                      <el-date-picker
                        v-model="reportConfig.dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>    
          <!-- 维度配置 -->
              <div class="form-section">
                <h4 class="section-title">维度配置</h4>
                <div class="dimension-config">
                  <div class="dimension-group">
                    <label class="group-label">行维度</label>
                    <el-transfer
                      v-model="reportConfig.rowDimensions"
                      :data="availableDimensions"
                      :titles="['可选维度', '已选维度']"
                      :button-texts="['移除', '添加']"
                      filterable
                      filter-placeholder="搜索维度"
                    />
                  </div>
                  
                  <div class="dimension-group">
                    <label class="group-label">列维度</label>
                    <el-transfer
                      v-model="reportConfig.columnDimensions"
                      :data="availableDimensions"
                      :titles="['可选维度', '已选维度']"
                      :button-texts="['移除', '添加']"
                      filterable
                      filter-placeholder="搜索维度"
                    />
                  </div>
                </div>
              </div>

              <!-- 指标配置 -->
              <div class="form-section">
                <h4 class="section-title">指标配置</h4>
                <div class="metrics-config">
                  <el-table 
                    :data="reportConfig.metrics"
                    border
                    style="width: 100%"
                  >
                    <el-table-column prop="name" label="指标名称" width="200">
                      <template #default="{ row, $index }">
                        <el-select 
                          v-model="row.name"
                          placeholder="选择指标"
                          style="width: 100%"
                        >
                          <el-option 
                            v-for="metric in availableMetrics"
                            :key="metric.value"
                            :label="metric.label"
                            :value="metric.value"
                          />
                        </el-select>
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="aggregation" label="聚合方式" width="150">
                      <template #default="{ row, $index }">
                        <el-select 
                          v-model="row.aggregation"
                          placeholder="聚合方式"
                          style="width: 100%"
                        >
                          <el-option label="求和" value="sum" />
                          <el-option label="平均值" value="avg" />
                          <el-option label="计数" value="count" />
                          <el-option label="最大值" value="max" />
                          <el-option label="最小值" value="min" />
                        </el-select>
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="format" label="格式化" width="150">
                      <template #default="{ row, $index }">
                        <el-select 
                          v-model="row.format"
                          placeholder="格式化"
                          style="width: 100%"
                        >
                          <el-option label="数字" value="number" />
                          <el-option label="货币" value="currency" />
                          <el-option label="百分比" value="percentage" />
                          <el-option label="日期" value="date" />
                        </el-select>
                      </template>
                    </el-table-column>
                    
                    <el-table-column label="操作" width="100">
                      <template #default="{ row, $index }">
                        <el-button 
                          type="danger" 
                          size="small" 
                          @click="removeMetric($index)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  
                  <div class="metrics-actions">
                    <el-button 
                      @click="addMetric"
                      type="primary"
                      size="small"
                    >
                      <el-icon><Plus /></el-icon>
                      添加指标
                    </el-button>
                  </div>
                </div>
              </div>         
     <!-- 筛选条件 -->
              <div class="form-section">
                <h4 class="section-title">筛选条件</h4>
                <div class="filters-config">
                  <el-table 
                    :data="reportConfig.filters"
                    border
                    style="width: 100%"
                  >
                    <el-table-column prop="field" label="字段" width="200">
                      <template #default="{ row, $index }">
                        <el-select 
                          v-model="row.field"
                          placeholder="选择字段"
                          style="width: 100%"
                        >
                          <el-option 
                            v-for="field in availableFields"
                            :key="field.value"
                            :label="field.label"
                            :value="field.value"
                          />
                        </el-select>
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="operator" label="操作符" width="120">
                      <template #default="{ row, $index }">
                        <el-select 
                          v-model="row.operator"
                          placeholder="操作符"
                          style="width: 100%"
                        >
                          <el-option label="等于" value="eq" />
                          <el-option label="不等于" value="ne" />
                          <el-option label="大于" value="gt" />
                          <el-option label="小于" value="lt" />
                          <el-option label="包含" value="contains" />
                          <el-option label="不包含" value="not_contains" />
                        </el-select>
                      </template>
                    </el-table-column>
                    
                    <el-table-column prop="value" label="值">
                      <template #default="{ row, $index }">
                        <el-input 
                          v-model="row.value"
                          placeholder="请输入值"
                        />
                      </template>
                    </el-table-column>
                    
                    <el-table-column label="操作" width="100">
                      <template #default="{ row, $index }">
                        <el-button 
                          type="danger" 
                          size="small" 
                          @click="removeFilter($index)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  
                  <div class="filters-actions">
                    <el-button 
                      @click="addFilter"
                      type="primary"
                      size="small"
                    >
                      <el-icon><Plus /></el-icon>
                      添加筛选条件
                    </el-button>
                  </div>
                </div>
              </div>

              <!-- 格式设置 -->
              <div class="form-section">
                <h4 class="section-title">格式设置</h4>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="输出格式" prop="outputFormat">
                      <el-select 
                        v-model="reportConfig.outputFormat"
                        placeholder="请选择输出格式"
                        style="width: 100%"
                      >
                        <el-option label="Excel" value="excel" />
                        <el-option label="PDF" value="pdf" />
                        <el-option label="CSV" value="csv" />
                        <el-option label="在线预览" value="preview" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="页面方向" prop="orientation">
                      <el-radio-group v-model="reportConfig.orientation">
                        <el-radio value="portrait">纵向</el-radio>
                        <el-radio value="landscape">横向</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="页面大小" prop="pageSize">
                      <el-select 
                        v-model="reportConfig.pageSize"
                        placeholder="页面大小"
                        style="width: 100%"
                      >
                        <el-option label="A4" value="A4" />
                        <el-option label="A3" value="A3" />
                        <el-option label="Letter" value="Letter" />
                        <el-option label="Legal" value="Legal" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-form>
          </div>
        </div>
      </div>     
 <!-- 预览区域 -->
      <div class="preview-section">
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">报表预览</h3>
            <div class="card-actions">
              <el-button 
                text 
                @click="refreshPreview"
                :loading="previewing"
              >
                <el-icon><Refresh /></el-icon>
                刷新预览
              </el-button>
              <el-button 
                text 
                @click="showExportDialog = true"
                :disabled="!previewData.length"
              >
                <el-icon><Download /></el-icon>
                导出报表
              </el-button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="previewing" class="preview-loading">
              <el-skeleton :rows="8" animated />
            </div>
            
            <div v-else-if="previewData.length" class="preview-content">
              <!-- 图表预览 -->
              <div v-if="reportConfig.type === 'chart'" class="chart-preview">
                <ChartContainer
                  :data="chartData"
                  :type="chartType"
                  height="400px"
                  :options="chartOptions"
                />
              </div>
              
              <!-- 表格预览 -->
              <div v-else class="table-preview">
                <el-table 
                  :data="previewData"
                  border
                  stripe
                  style="width: 100%"
                  max-height="500"
                >
                  <el-table-column 
                    v-for="column in previewColumns"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="column.label"
                    :width="column.width"
                    :formatter="column.formatter"
                  />
                </el-table>
                
                <div class="preview-pagination">
                  <el-pagination
                    v-model:current-page="previewPagination.page"
                    v-model:page-size="previewPagination.size"
                    :page-sizes="[10, 20, 50, 100]"
                    :total="previewPagination.total"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="onPreviewSizeChange"
                    @current-change="onPreviewPageChange"
                  />
                </div>
              </div>
            </div>
            
            <div v-else class="preview-placeholder">
              <el-empty 
                description="暂无预览数据"
                :image-size="120"
              >
                <template #image>
                  <el-icon size="120"><Document /></el-icon>
                </template>
                <el-button 
                  type="primary" 
                  @click="generatePreview"
                  :disabled="!canPreview"
                >
                  生成预览
                </el-button>
              </el-empty>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模板管理对话框 -->
    <el-dialog
      v-model="showTemplateDialog"
      title="报表模板管理"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="template-management">
        <div class="template-actions">
          <el-button 
            @click="showCreateTemplateDialog = true"
            type="primary"
          >
            <el-icon><Plus /></el-icon>
            新建模板
          </el-button>
        </div>
        
        <el-table 
          :data="templates"
          border
          style="width: 100%"
          @selection-change="onTemplateSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="模板名称" />
          <el-table-column prop="type" label="报表类型" />
          <el-table-column prop="description" label="描述" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button 
                size="small" 
                @click="loadTemplateConfig(row)"
              >
                加载
              </el-button>
              <el-button 
                size="small" 
                @click="editTemplate(row)"
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteTemplate(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <el-button @click="showTemplateDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="confirmTemplateSelection"
          :disabled="!selectedTemplate"
        >
          确定
        </el-button>
      </template>
    </el-dialog>    <!
-- 创建模板对话框 -->
    <el-dialog
      v-model="showCreateTemplateDialog"
      title="创建报表模板"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="templateFormRef"
        :model="templateForm" 
        :rules="templateRules"
        label-width="100px"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input 
            v-model="templateForm.name"
            placeholder="请输入模板名称"
          />
        </el-form-item>
        <el-form-item label="模板描述" prop="description">
          <el-input 
            v-model="templateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateTemplateDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="createTemplate"
          :loading="creatingTemplate"
        >
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 数据导出对话框 -->
    <ExportDialog
      v-model="showExportDialog"
      :data="previewData"
      :columns="exportColumns"
      :title="reportConfig.name || '报表数据'"
      :default-filename="reportConfig.name || 'report'"
      @exported="handleExported"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, 
  TrendCharts, 
  Refresh, 
  Upload, 
  Download, 
  Plus 
} from '@element-plus/icons-vue'
import ChartContainer from '@/components/business/ChartContainer.vue'
import { ExportDialog } from '@/components/business'
import type { FormInstance, FormRules } from 'element-plus'
import type { ExportHistory } from '@/utils/export'

// 响应式数据
const configFormRef = ref<FormInstance>()
const templateFormRef = ref<FormInstance>()
const generating = ref(false)
const previewing = ref(false)
const creatingTemplate = ref(false)
const showTemplateDialog = ref(false)
const showCreateTemplateDialog = ref(false)
const showExportDialog = ref(false)

// 报表配置
const reportConfig = reactive({
  name: '',
  type: 'table',
  description: '',
  dataSource: '',
  dateRange: [] as string[],
  rowDimensions: [] as string[],
  columnDimensions: [] as string[],
  metrics: [] as Array<{
    name: string
    aggregation: string
    format: string
  }>,
  filters: [] as Array<{
    field: string
    operator: string
    value: string
  }>,
  outputFormat: 'preview',
  orientation: 'portrait',
  pageSize: 'A4'
})

// 模板表单
const templateForm = reactive({
  name: '',
  description: ''
})

// 预览数据
const previewData = ref<any[]>([])
const previewColumns = ref<any[]>([])
const previewPagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 模板数据
const templates = ref<any[]>([])
const selectedTemplate = ref<any>(null)

// 配置选项
const reportTypes = [
  { label: '表格报表', value: 'table' },
  { label: '图表报表', value: 'chart' },
  { label: '透视表', value: 'pivot' },
  { label: '交叉表', value: 'crosstab' }
]

const dataSources = [
  { label: '订单数据', value: 'orders' },
  { label: '商品数据', value: 'products' },
  { label: '库存数据', value: 'inventory' },
  { label: '用户数据', value: 'users' },
  { label: '销售数据', value: 'sales' },
  { label: '财务数据', value: 'finance' }
]

const availableDimensions = [
  { key: 'date', label: '日期' },
  { key: 'month', label: '月份' },
  { key: 'quarter', label: '季度' },
  { key: 'year', label: '年份' },
  { key: 'category', label: '商品分类' },
  { key: 'brand', label: '品牌' },
  { key: 'platform', label: '平台' },
  { key: 'store', label: '店铺' },
  { key: 'region', label: '地区' }
]

const availableMetrics = [
  { label: '销售额', value: 'sales_amount' },
  { label: '订单数量', value: 'order_count' },
  { label: '商品数量', value: 'product_count' },
  { label: '库存数量', value: 'inventory_count' },
  { label: '用户数量', value: 'user_count' },
  { label: '利润', value: 'profit' },
  { label: '成本', value: 'cost' }
]

const availableFields = [
  { label: '订单状态', value: 'order_status' },
  { label: '商品分类', value: 'product_category' },
  { label: '品牌', value: 'brand' },
  { label: '平台', value: 'platform' },
  { label: '价格', value: 'price' },
  { label: '库存状态', value: 'inventory_status' }
]// 表单验证规则

const configRules: FormRules = {
  name: [
    { required: true, message: '请输入报表名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择报表类型', trigger: 'change' }
  ],
  dataSource: [
    { required: true, message: '请选择数据源', trigger: 'change' }
  ],
  dateRange: [
    { required: true, message: '请选择时间范围', trigger: 'change' }
  ],
  outputFormat: [
    { required: true, message: '请选择输出格式', trigger: 'change' }
  ]
}

const templateRules: FormRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' }
  ]
}

// 计算属性
const canPreview = computed(() => {
  return reportConfig.name && 
         reportConfig.type && 
         reportConfig.dataSource && 
         reportConfig.dateRange.length === 2
})

const exportColumns = computed(() => {
  return previewColumns.value.map(col => ({
    key: col.prop,
    title: col.label,
    width: col.width
  }))
})

const chartData = computed(() => {
  if (reportConfig.type !== 'chart' || !previewData.value.length) {
    return { labels: [], datasets: [] }
  }
  
  // 根据预览数据生成图表数据
  const labels = previewData.value.map(item => item.label || item.name)
  const data = previewData.value.map(item => item.value || item.count)
  
  return {
    labels,
    datasets: [{
      label: '数据',
      data,
      backgroundColor: [
        '#409EFF',
        '#67C23A',
        '#E6A23C',
        '#F56C6C',
        '#909399'
      ]
    }]
  }
})

const chartType = computed(() => {
  // 根据配置确定图表类型
  if (reportConfig.columnDimensions.length > 0) {
    return 'bar'
  }
  return 'pie'
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  }
})

// 方法
const onReportTypeChange = (type: string) => {
  // 根据报表类型调整配置
  if (type === 'chart') {
    // 图表报表的特殊配置
  }
}

const onDataSourceChange = (source: string) => {
  // 根据数据源更新可用维度和指标
  console.log('数据源变更:', source)
}

const addMetric = () => {
  reportConfig.metrics.push({
    name: '',
    aggregation: 'sum',
    format: 'number'
  })
}

const removeMetric = (index: number) => {
  reportConfig.metrics.splice(index, 1)
}

const addFilter = () => {
  reportConfig.filters.push({
    field: '',
    operator: 'eq',
    value: ''
  })
}

const removeFilter = (index: number) => {
  reportConfig.filters.splice(index, 1)
}

const resetForm = () => {
  configFormRef.value?.resetFields()
  Object.assign(reportConfig, {
    name: '',
    type: 'table',
    description: '',
    dataSource: '',
    dateRange: [],
    rowDimensions: [],
    columnDimensions: [],
    metrics: [],
    filters: [],
    outputFormat: 'preview',
    orientation: 'portrait',
    pageSize: 'A4'
  })
  previewData.value = []
  previewColumns.value = []
}

const generatePreview = async () => {
  if (!canPreview.value) {
    ElMessage.warning('请完善报表配置信息')
    return
  }
  
  previewing.value = true
  
  try {
    // 模拟生成预览数据
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 生成模拟数据
    const mockData = generateMockData()
    previewData.value = mockData.data
    previewColumns.value = mockData.columns
    previewPagination.total = mockData.total
    
    ElMessage.success('预览生成成功')
  } catch (error) {
    console.error('生成预览失败:', error)
    ElMessage.error('生成预览失败')
  } finally {
    previewing.value = false
  }
}

const refreshPreview = () => {
  generatePreview()
}

const generateReport = async () => {
  if (!configFormRef.value) return
  
  try {
    await configFormRef.value.validate()
    
    generating.value = true
    
    // 模拟报表生成
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    if (reportConfig.outputFormat === 'preview') {
      await generatePreview()
    } else {
      // 模拟文件下载
      ElMessage.success(`报表已生成并下载为 ${reportConfig.outputFormat.toUpperCase()} 格式`)
    }
  } catch (error) {
    console.error('生成报表失败:', error)
    ElMessage.error('生成报表失败')
  } finally {
    generating.value = false
  }
}

const exportReport = () => {
  if (!previewData.value.length) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  
  ElMessage.success('报表导出成功')
}

const onPreviewSizeChange = (size: number) => {
  previewPagination.size = size
  generatePreview()
}

const onPreviewPageChange = (page: number) => {
  previewPagination.page = page
  generatePreview()
}// 模板
管理方法
const loadTemplate = () => {
  if (!selectedTemplate.value) {
    ElMessage.warning('请选择要加载的模板')
    return
  }
  
  loadTemplateConfig(selectedTemplate.value)
  showTemplateDialog.value = false
}

const saveAsTemplate = async () => {
  if (!reportConfig.name) {
    ElMessage.warning('请输入报表名称')
    return
  }
  
  templateForm.name = `${reportConfig.name}_模板`
  templateForm.description = reportConfig.description
  showCreateTemplateDialog.value = true
}

const loadTemplateConfig = (template: any) => {
  // 加载模板配置到当前表单
  Object.assign(reportConfig, template.config)
  ElMessage.success('模板加载成功')
}

const editTemplate = (template: any) => {
  templateForm.name = template.name
  templateForm.description = template.description
  showCreateTemplateDialog.value = true
}

const deleteTemplate = async (template: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板 "${template.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟删除
    const index = templates.value.findIndex(t => t.id === template.id)
    if (index > -1) {
      templates.value.splice(index, 1)
      ElMessage.success('模板删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

const createTemplate = async () => {
  if (!templateFormRef.value) return
  
  try {
    await templateFormRef.value.validate()
    
    creatingTemplate.value = true
    
    // 模拟创建模板
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newTemplate = {
      id: Date.now(),
      name: templateForm.name,
      description: templateForm.description,
      type: reportConfig.type,
      config: { ...reportConfig },
      createdAt: new Date().toLocaleString()
    }
    
    templates.value.unshift(newTemplate)
    
    showCreateTemplateDialog.value = false
    templateForm.name = ''
    templateForm.description = ''
    
    ElMessage.success('模板创建成功')
  } catch (error) {
    console.error('创建模板失败:', error)
    ElMessage.error('创建模板失败')
  } finally {
    creatingTemplate.value = false
  }
}

const onTemplateSelectionChange = (selection: any[]) => {
  selectedTemplate.value = selection.length > 0 ? selection[0] : null
}

const confirmTemplateSelection = () => {
  if (selectedTemplate.value) {
    loadTemplateConfig(selectedTemplate.value)
  }
  showTemplateDialog.value = false
}

// 处理导出完成
const handleExported = (result: ExportHistory) => {
  ElMessage.success(`报表导出完成: ${result.filename}`)
  console.log('导出结果:', result)
}

// 生成模拟数据
const generateMockData = () => {
  const columns = [
    { prop: 'date', label: '日期', width: 120 },
    { prop: 'category', label: '分类', width: 120 },
    { prop: 'sales', label: '销售额', width: 120, formatter: (row: any) => `¥${row.sales.toLocaleString()}` },
    { prop: 'orders', label: '订单数', width: 100 },
    { prop: 'growth', label: '增长率', width: 100, formatter: (row: any) => `${row.growth}%` }
  ]
  
  const data = []
  const categories = ['电子产品', '服装', '家居', '食品', '图书']
  
  for (let i = 0; i < 20; i++) {
    data.push({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      category: categories[i % categories.length],
      sales: Math.floor(Math.random() * 100000) + 10000,
      orders: Math.floor(Math.random() * 500) + 50,
      growth: (Math.random() * 20 - 10).toFixed(1)
    })
  }
  
  return {
    columns,
    data,
    total: 100
  }
}

// 初始化模板数据
const initTemplates = () => {
  templates.value = [
    {
      id: 1,
      name: '销售日报模板',
      type: 'table',
      description: '每日销售数据统计报表',
      createdAt: '2024-01-15 10:30:00',
      config: {
        name: '销售日报',
        type: 'table',
        dataSource: 'sales',
        dateRange: ['2024-01-01', '2024-01-31'],
        metrics: [
          { name: 'sales_amount', aggregation: 'sum', format: 'currency' },
          { name: 'order_count', aggregation: 'count', format: 'number' }
        ]
      }
    },
    {
      id: 2,
      name: '商品分析模板',
      type: 'chart',
      description: '商品销售分析图表',
      createdAt: '2024-01-10 14:20:00',
      config: {
        name: '商品分析',
        type: 'chart',
        dataSource: 'products',
        dateRange: ['2024-01-01', '2024-01-31'],
        metrics: [
          { name: 'sales_amount', aggregation: 'sum', format: 'currency' }
        ]
      }
    }
  ]
}

// 生命周期
onMounted(() => {
  initTemplates()
})
</script><
style scoped lang="scss">
.report-generation-view {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.page-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.page-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.content-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-body {
  padding: 20px;
}

.report-config-form {
  .form-section {
    margin-bottom: 32px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
}

.dimension-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  .dimension-group {
    .group-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-regular);
      margin-bottom: 8px;
    }
  }
}

.metrics-config,
.filters-config {
  .metrics-actions,
  .filters-actions {
    margin-top: 12px;
    text-align: right;
  }
}

.preview-loading {
  padding: 40px 0;
}

.preview-content {
  .chart-preview {
    margin-bottom: 20px;
  }
  
  .table-preview {
    .preview-pagination {
      margin-top: 16px;
      text-align: right;
    }
  }
}

.preview-placeholder {
  padding: 60px 0;
  text-align: center;
}

.template-management {
  .template-actions {
    margin-bottom: 16px;
    text-align: right;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .report-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .page-actions {
    justify-content: flex-end;
  }
  
  .dimension-config {
    .el-transfer {
      :deep(.el-transfer-panel) {
        width: 100%;
      }
    }
  }
}
</style>