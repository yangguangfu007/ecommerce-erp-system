<template>
  <el-dialog
    v-model="visible"
    title="导出设置"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent
    >
      <!-- 基本设置 -->
      <el-card class="setting-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Setting /></el-icon>
            <span>基本设置</span>
          </div>
        </template>
        
        <el-form-item label="文件名" prop="filename">
          <el-input
            v-model="form.filename"
            placeholder="请输入文件名（不含扩展名）"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="导出格式" prop="format">
          <el-radio-group v-model="form.format">
            <el-radio 
              v-for="format in availableFormats" 
              :key="format.value"
              :label="format.value"
            >
              <el-icon>
                <component :is="format.icon" />
              </el-icon>
              {{ format.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入导出文件标题（可选）"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="副标题" prop="subtitle">
          <el-input
            v-model="form.subtitle"
            placeholder="请输入导出文件副标题（可选）"
            clearable
          />
        </el-form-item>
      </el-card>

      <!-- 列设置 -->
      <el-card class="setting-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Grid /></el-icon>
            <span>列设置</span>
            <div class="header-actions">
              <el-button 
                size="small" 
                text 
                @click="selectAllColumns"
              >
                全选
              </el-button>
              <el-button 
                size="small" 
                text 
                @click="clearAllColumns"
              >
                清空
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="columns-container">
          <el-checkbox-group v-model="selectedColumns">
            <div class="column-list">
              <div 
                v-for="column in availableColumns" 
                :key="column.key"
                class="column-item"
              >
                <el-checkbox :label="column.key">
                  {{ column.title }}
                </el-checkbox>
                <el-input
                  v-if="selectedColumns.includes(column.key)"
                  v-model="column.width"
                  size="small"
                  type="number"
                  placeholder="宽度"
                  style="width: 80px; margin-left: 12px"
                />
              </div>
            </div>
          </el-checkbox-group>
        </div>
      </el-card>

      <!-- 数据设置 -->
      <el-card class="setting-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><DataBoard /></el-icon>
            <span>数据设置</span>
          </div>
        </template>
        
        <el-form-item label="数据范围">
          <el-radio-group v-model="form.dataRange">
            <el-radio label="all">全部数据 ({{ totalRecords }} 条)</el-radio>
            <el-radio label="current">当前页数据</el-radio>
            <el-radio label="selected">选中数据 ({{ selectedRecords }} 条)</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="包含表头">
          <el-switch v-model="form.showHeader" />
        </el-form-item>
        
        <el-form-item label="日期格式" v-if="hasDateColumns">
          <el-select v-model="form.dateFormat" placeholder="选择日期格式">
            <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
            <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
            <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
            <el-option label="MM/DD/YYYY" value="MM/DD/YYYY" />
          </el-select>
        </el-form-item>
      </el-card>

      <!-- 预览 -->
      <el-card class="setting-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><View /></el-icon>
            <span>数据预览</span>
            <span class="preview-count">(前 {{ Math.min(previewData.length, 5) }} 条)</span>
          </div>
        </template>
        
        <div class="preview-container">
          <el-table
            :data="previewData.slice(0, 5)"
            size="small"
            border
            max-height="200"
          >
            <el-table-column
              v-for="column in selectedColumnConfigs"
              :key="column.key"
              :prop="column.key"
              :label="column.title"
              :width="column.width"
              show-overflow-tooltip
            />
          </el-table>
          
          <div v-if="previewData.length === 0" class="no-data">
            暂无数据预览
          </div>
        </div>
      </el-card>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-info">
          <span class="export-info">
            将导出 {{ exportDataCount }} 条记录，{{ selectedColumns.length }} 个字段
          </span>
        </div>
        <div class="footer-actions">
          <el-button @click="handleClose">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleExport"
            :loading="isExporting"
            :disabled="selectedColumns.length === 0 || exportDataCount === 0"
          >
            开始导出
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { 
  Setting, 
  Grid, 
  DataBoard, 
  View,
  Document,
  Printer
} from '@element-plus/icons-vue'
import { ExportFormat, type ExportConfig, type ExportColumn } from '@/utils/export'

interface Props {
  modelValue: boolean
  data: any[]
  columns?: ExportColumn[]
  selectedData?: any[]
  defaultConfig?: Partial<ExportConfig>
}

const props = withDefaults(defineProps<Props>(), {
  selectedData: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'export': [config: ExportConfig]
}>()

// 表单引用
const formRef = ref<FormInstance>()

// 状态
const isExporting = ref(false)

// 表单数据
const form = ref({
  filename: '',
  format: ExportFormat.EXCEL,
  title: '',
  subtitle: '',
  dataRange: 'all',
  showHeader: true,
  dateFormat: 'YYYY-MM-DD'
})

// 选中的列
const selectedColumns = ref<string[]>([])

// 可用格式
const availableFormats = [
  { value: ExportFormat.EXCEL, label: 'Excel (.xlsx)', icon: Grid },
  { value: ExportFormat.CSV, label: 'CSV (.csv)', icon: Document },
  { value: ExportFormat.PDF, label: 'PDF (.pdf)', icon: Printer },
  { value: ExportFormat.JSON, label: 'JSON (.json)', icon: DataBoard }
]

// 表单验证规则
const rules: FormRules = {
  filename: [
    { required: true, message: '请输入文件名', trigger: 'blur' },
    { 
      pattern: /^[^<>:"/\\|?*]+$/, 
      message: '文件名不能包含特殊字符', 
      trigger: 'blur' 
    }
  ],
  format: [
    { required: true, message: '请选择导出格式', trigger: 'change' }
  ]
}

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const availableColumns = computed(() => {
  if (props.columns) {
    return props.columns
  }
  
  // 从数据中推断列
  if (props.data.length > 0) {
    const firstRow = props.data[0]
    return Object.keys(firstRow).map(key => ({
      key,
      title: key,
      width: 120
    }))
  }
  
  return []
})

const selectedColumnConfigs = computed(() => {
  return availableColumns.value.filter(col => selectedColumns.value.includes(col.key))
})

const totalRecords = computed(() => props.data.length)
const selectedRecords = computed(() => props.selectedData.length)

const exportDataCount = computed(() => {
  switch (form.value.dataRange) {
    case 'selected':
      return selectedRecords.value
    case 'current':
      return Math.min(totalRecords.value, 20) // 假设当前页20条
    default:
      return totalRecords.value
  }
})

const previewData = computed(() => {
  let data = props.data
  
  switch (form.value.dataRange) {
    case 'selected':
      data = props.selectedData
      break
    case 'current':
      data = props.data.slice(0, 20) // 假设当前页数据
      break
  }
  
  // 只返回选中的列
  return data.map(row => {
    const filteredRow: any = {}
    selectedColumns.value.forEach(key => {
      filteredRow[key] = row[key]
    })
    return filteredRow
  })
})

const hasDateColumns = computed(() => {
  return availableColumns.value.some(col => 
    col.type === 'date' || 
    col.key.toLowerCase().includes('date') ||
    col.key.toLowerCase().includes('time')
  )
})

// 监听对话框显示
watch(visible, (newValue) => {
  if (newValue) {
    initializeForm()
  }
})

// 方法
const initializeForm = () => {
  // 重置表单
  form.value = {
    filename: `export_${new Date().toISOString().slice(0, 10)}`,
    format: ExportFormat.EXCEL,
    title: '',
    subtitle: '',
    dataRange: 'all',
    showHeader: true,
    dateFormat: 'YYYY-MM-DD',
    ...props.defaultConfig
  }
  
  // 默认选中所有列
  selectedColumns.value = availableColumns.value.map(col => col.key)
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const selectAllColumns = () => {
  selectedColumns.value = availableColumns.value.map(col => col.key)
}

const clearAllColumns = () => {
  selectedColumns.value = []
}

const handleExport = async () => {
  try {
    // 验证表单
    const valid = await formRef.value?.validate()
    if (!valid) return
    
    if (selectedColumns.value.length === 0) {
      ElMessage.warning('请至少选择一个字段')
      return
    }
    
    isExporting.value = true
    
    // 准备导出数据
    let exportData = props.data
    
    switch (form.value.dataRange) {
      case 'selected':
        exportData = props.selectedData
        break
      case 'current':
        exportData = props.data.slice(0, 20) // 假设当前页数据
        break
    }
    
    // 准备导出配置
    const config: ExportConfig = {
      data: exportData,
      format: form.value.format,
      filename: form.value.filename,
      title: form.value.title || undefined,
      subtitle: form.value.subtitle || undefined,
      showHeader: form.value.showHeader,
      dateFormat: form.value.dateFormat,
      columns: selectedColumnConfigs.value
    }
    
    emit('export', config)
  } catch (error) {
    ElMessage.error('导出配置验证失败')
  } finally {
    isExporting.value = false
  }
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.setting-card {
  margin-bottom: 16px;
}

.setting-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.header-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.columns-container {
  max-height: 200px;
  overflow-y: auto;
}

.column-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.column-item:last-child {
  border-bottom: none;
}

.preview-container {
  max-height: 250px;
  overflow: auto;
}

.no-data {
  text-align: center;
  padding: 40px 0;
  color: var(--el-text-color-secondary);
}

.preview-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: normal;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.export-info {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.footer-actions {
  display: flex;
  gap: 12px;
}

:deep(.el-radio) {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  margin-right: 0;
}

:deep(.el-radio__label) {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>