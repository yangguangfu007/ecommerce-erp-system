<template>
  <div class="export-button">
    <!-- 简单导出按钮 -->
    <el-button
      v-if="!showDropdown"
      type="primary"
      :icon="Download"
      :loading="isExporting"
      :disabled="disabled || !hasData"
      @click="handleExport"
    >
      {{ buttonText }}
    </el-button>

    <!-- 下拉菜单导出按钮 -->
    <el-dropdown
      v-else
      trigger="click"
      :disabled="disabled || !hasData"
      @command="handleDropdownCommand"
    >
      <el-button
        type="primary"
        :icon="Download"
        :loading="isExporting"
        :disabled="disabled || !hasData"
      >
        {{ buttonText }}
        <el-icon class="el-icon--right">
          <ArrowDown />
        </el-icon>
      </el-button>
      
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item 
            v-for="format in availableFormats" 
            :key="format.value"
            :command="format.value"
            :icon="format.icon"
          >
            {{ format.label }}
          </el-dropdown-item>
          
          <el-dropdown-item 
            v-if="showHistory && hasHistory"
            divided
            command="history"
            :icon="Clock"
          >
            导出历史
          </el-dropdown-item>
          
          <el-dropdown-item 
            v-if="showAdvanced"
            command="advanced"
            :icon="Setting"
          >
            高级设置
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 导出进度对话框 -->
    <el-dialog
      v-model="showProgressDialog"
      title="导出进度"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="export-progress">
        <div class="progress-info">
          <div class="current-file">
            正在导出: {{ currentExport?.filename }}
          </div>
          <div class="record-count">
            记录数量: {{ currentExport?.recordCount }}
          </div>
        </div>
        
        <el-progress 
          :percentage="exportProgress" 
          :stroke-width="8"
          :show-text="true"
        />
        
        <div class="progress-tips">
          <el-icon class="loading-icon">
            <Loading />
          </el-icon>
          <span>请稍候，正在生成文件...</span>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="cancelExport" :disabled="!isExporting">
          取消
        </el-button>
      </template>
    </el-dialog>

    <!-- 导出历史对话框 -->
    <ExportHistoryDialog
      v-model="showHistoryDialog"
      :history="exportHistory"
      @re-export="handleReExport"
      @clear-history="handleClearHistory"
    />

    <!-- 高级设置对话框 -->
    <ExportDialog
      v-model="showAdvancedDialog"
      :data="data"
      :columns="columns"
      :default-config="exportConfig"
      @export="handleAdvancedExport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Download, 
  ArrowDown, 
  Clock, 
  Setting, 
  Loading,
  Document,
  Grid,
  Printer,
  DataBoard
} from '@element-plus/icons-vue'
import { useExport } from '@/composables/useExport'
import { ExportFormat, type ExportColumn, type ExportConfig } from '@/utils/export'
import ExportHistoryDialog from './ExportHistoryDialog.vue'
import ExportDialog from './ExportDialog.vue'

interface Props {
  // 数据相关
  data: any[]
  columns?: ExportColumn[]
  filename?: string
  title?: string
  
  // 按钮配置
  buttonText?: string
  disabled?: boolean
  showDropdown?: boolean
  
  // 功能配置
  formats?: ExportFormat[]
  defaultFormat?: ExportFormat
  showHistory?: boolean
  showAdvanced?: boolean
  showProgress?: boolean
  
  // 导出配置
  exportConfig?: Partial<ExportConfig>
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: '导出',
  disabled: false,
  showDropdown: true,
  formats: () => [ExportFormat.EXCEL, ExportFormat.CSV, ExportFormat.PDF],
  defaultFormat: ExportFormat.EXCEL,
  showHistory: true,
  showAdvanced: true,
  showProgress: true
})

const emit = defineEmits<{
  'export-start': [format: ExportFormat]
  'export-success': [result: any]
  'export-error': [error: string]
}>()

// 使用导出功能
const {
  isExporting,
  exportProgress,
  exportHistory,
  currentExport,
  hasHistory,
  executeExport,
  exportExcel,
  exportCSV,
  exportPDF,
  exportJSON,
  clearHistory,
  reExport
} = useExport({
  showProgress: props.showProgress,
  showHistory: props.showHistory
})

// 状态
const showProgressDialog = ref(false)
const showHistoryDialog = ref(false)
const showAdvancedDialog = ref(false)

// 计算属性
const hasData = computed(() => props.data && props.data.length > 0)

const availableFormats = computed(() => {
  const formatConfig = {
    [ExportFormat.EXCEL]: { label: '导出为 Excel', icon: Grid },
    [ExportFormat.CSV]: { label: '导出为 CSV', icon: Document },
    [ExportFormat.PDF]: { label: '导出为 PDF', icon: Printer },
    [ExportFormat.JSON]: { label: '导出为 JSON', icon: DataBoard }
  }
  
  return props.formats.map(format => ({
    value: format,
    label: formatConfig[format].label,
    icon: formatConfig[format].icon
  }))
})

// 监听导出状态
watch(isExporting, (newValue) => {
  if (newValue && props.showProgress) {
    showProgressDialog.value = true
  } else {
    showProgressDialog.value = false
  }
})

// 方法
const handleExport = async () => {
  try {
    emit('export-start', props.defaultFormat)
    
    const config: ExportConfig = {
      data: props.data,
      format: props.defaultFormat,
      filename: props.filename,
      columns: props.columns,
      title: props.title,
      ...props.exportConfig
    }
    
    const result = await executeExport(config)
    
    if (result.success) {
      emit('export-success', result)
    } else {
      emit('export-error', result.error || '导出失败')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '导出失败'
    emit('export-error', errorMessage)
  }
}

const handleDropdownCommand = (command: string) => {
  switch (command) {
    case 'history':
      showHistoryDialog.value = true
      break
    case 'advanced':
      showAdvancedDialog.value = true
      break
    default:
      if (Object.values(ExportFormat).includes(command as ExportFormat)) {
        handleFormatExport(command as ExportFormat)
      }
  }
}

const handleFormatExport = async (format: ExportFormat) => {
  try {
    emit('export-start', format)
    
    const config: ExportConfig = {
      data: props.data,
      format,
      filename: props.filename,
      columns: props.columns,
      title: props.title,
      ...props.exportConfig
    }
    
    const result = await executeExport(config)
    
    if (result.success) {
      emit('export-success', result)
    } else {
      emit('export-error', result.error || '导出失败')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '导出失败'
    emit('export-error', errorMessage)
  }
}

const handleAdvancedExport = async (config: ExportConfig) => {
  try {
    emit('export-start', config.format)
    
    const result = await executeExport(config)
    
    if (result.success) {
      emit('export-success', result)
      showAdvancedDialog.value = false
    } else {
      emit('export-error', result.error || '导出失败')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '导出失败'
    emit('export-error', errorMessage)
  }
}

const handleReExport = async (historyId: string) => {
  try {
    const result = await reExport(historyId, props.data)
    if (result?.success) {
      ElMessage.success('重新导出成功')
      showHistoryDialog.value = false
    }
  } catch (error) {
    ElMessage.error('重新导出失败')
  }
}

const handleClearHistory = async () => {
  await clearHistory()
}

const cancelExport = () => {
  // 这里可以添加取消导出的逻辑
  showProgressDialog.value = false
  ElMessage.info('导出已取消')
}
</script>

<style scoped>
.export-button {
  display: inline-block;
}

.export-progress {
  padding: 20px 0;
}

.progress-info {
  margin-bottom: 20px;
}

.current-file {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.record-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.progress-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.loading-icon {
  margin-right: 8px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>