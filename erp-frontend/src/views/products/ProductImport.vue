<template>
  <div class="product-import">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">商品导入</h2>
      <div class="page-actions">
        <el-button 
          type="default" 
          :icon="Download" 
          @click="downloadTemplate"
          :loading="downloadLoading"
        >
          下载模板
        </el-button>
      </div>
    </div>

    <!-- 导入步骤 -->
    <el-card class="steps-card">
      <template #header>
        <h3 class="card-title">导入步骤</h3>
      </template>
      <el-steps :active="currentStep" align-center>
        <el-step title="选择文件" description="上传Excel或CSV格式的商品文件" />
        <el-step title="数据预览" description="预览和验证导入的商品数据" />
        <el-step title="确认导入" description="确认无误后开始导入商品" />
      </el-steps>
    </el-card>

    <!-- 文件上传 -->
    <el-card v-show="currentStep === 0" class="upload-card">
      <template #header>
        <h3 class="card-title">上传商品文件</h3>
      </template>
      <FileUpload
        ref="fileUploadRef"
        accept=".xlsx,.xls,.csv"
        :max-size="10"
        :show-file-list="false"
        @file-selected="handleFileSelect"
        @file-removed="handleFileRemove"
      >
        <div class="upload-area">
          <div class="upload-icon">
            <el-icon :size="48"><UploadFilled /></el-icon>
          </div>
          <div class="upload-text">
            <h4>拖拽文件到此处或点击上传</h4>
            <p>支持 .xlsx, .xls, .csv 格式，文件大小不超过 10MB</p>
          </div>
          <el-button type="primary" :icon="Upload">选择文件</el-button>
        </div>
      </FileUpload>
      
      <!-- 文件信息 -->
      <div v-if="selectedFile" class="file-info">
        <div class="file-item">
          <el-icon class="file-icon"><Document /></el-icon>
          <div class="file-details">
            <div class="file-name">{{ selectedFile.name }}</div>
            <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
          </div>
          <el-button 
            type="danger" 
            :icon="Delete" 
            size="small" 
            @click="removeFile"
          />
        </div>
        <div class="file-actions">
          <el-button @click="resetImport">重新选择</el-button>
          <el-button 
            type="primary" 
            @click="parseFile"
            :loading="parseLoading"
          >
            解析文件
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据预览 -->
    <el-card v-show="currentStep === 1" class="preview-card">
      <template #header>
        <div class="card-header-content">
          <h3 class="card-title">数据预览</h3>
          <div class="card-actions">
            <span class="preview-info">共 {{ previewData.length }} 条数据</span>
          </div>
        </div>
      </template>
      
      <!-- 验证结果 -->
      <div v-if="validationErrors.length > 0" class="validation-errors">
        <el-alert
          title="数据验证失败"
          type="error"
          :closable="false"
          show-icon
        >
          <template #default>
            <div class="error-summary">
              发现 {{ validationErrors.length }} 个错误，请修正后重新上传
            </div>
            <ul class="error-list">
              <li v-for="error in validationErrors.slice(0, 5)" :key="`${error.row}-${error.field}`">
                第{{ error.row }}行 {{ error.field }}：{{ error.message }}
              </li>
              <li v-if="validationErrors.length > 5">
                还有 {{ validationErrors.length - 5 }} 个错误...
              </li>
            </ul>
          </template>
        </el-alert>
      </div>

      <!-- 数据表格 -->
      <BaseTable
        :data="previewData"
        :columns="previewColumns"
        :loading="false"
        :pagination="false"
        max-height="400"
        class="preview-table"
      />
      
      <div class="preview-actions">
        <el-button @click="resetImport">重新选择</el-button>
        <el-button 
          type="primary" 
          @click="confirmImport"
          :disabled="validationErrors.length > 0"
          :loading="importLoading"
        >
          确认导入
        </el-button>
      </div>
    </el-card>

    <!-- 导入结果 -->
    <el-card v-show="currentStep === 2" class="result-card">
      <template #header>
        <h3 class="card-title">导入结果</h3>
      </template>
      
      <div class="import-result">
        <div class="result-summary">
          <div class="result-item success">
            <div class="result-icon">
              <el-icon :size="32" color="#67c23a"><CircleCheckFilled /></el-icon>
            </div>
            <div class="result-info">
              <h4>导入成功</h4>
              <p>{{ importResult.success }} 条商品</p>
            </div>
          </div>
          <div v-if="importResult.failed > 0" class="result-item error">
            <div class="result-icon">
              <el-icon :size="32" color="#f56c6c"><CircleCloseFilled /></el-icon>
            </div>
            <div class="result-info">
              <h4>导入失败</h4>
              <p>{{ importResult.failed }} 条商品</p>
            </div>
          </div>
        </div>
        
        <!-- 失败详情 -->
        <div v-if="importResult.errors.length > 0" class="error-details">
          <h5>失败详情：</h5>
          <ul class="error-list">
            <li v-for="error in importResult.errors" :key="`${error.row}-${error.field}`">
              第{{ error.row }}行：{{ error.message }}
              <span v-if="error.sku" class="error-sku">(SKU: {{ error.sku }})</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="result-actions">
        <el-button @click="resetImport">重新导入</el-button>
        <el-button type="primary" @click="goToProductList">查看商品列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Download, 
  Upload, 
  UploadFilled, 
  Document, 
  Delete,
  CircleCheckFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import FileUpload from '@/components/business/FileUpload.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import { productApi } from '@/api/modules/product'
import type { ProductImportResult, ProductImportError } from '@/api/modules/product'

// 路由
const router = useRouter()

// 面包屑导航
const breadcrumbItems = [
  { label: '仪表板', to: '/dashboard' },
  { label: '商品管理', to: '/products' },
  { label: '商品导入' }
]

// 响应式数据
const currentStep = ref(0)
const selectedFile = ref<File | null>(null)
const previewData = ref<any[]>([])
const validationErrors = ref<ProductImportError[]>([])
const importResult = ref<ProductImportResult>({
  total: 0,
  success: 0,
  failed: 0,
  errors: [],
  successProducts: []
})

// 加载状态
const downloadLoading = ref(false)
const parseLoading = ref(false)
const importLoading = ref(false)

// 文件上传组件引用
const fileUploadRef = ref()

// 预览表格列配置
const previewColumns = computed(() => [
  {
    prop: 'name',
    label: '商品名称',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    prop: 'sku',
    label: 'SKU',
    width: 120,
    showOverflowTooltip: true
  },
  {
    prop: 'category',
    label: '分类',
    width: 120,
    showOverflowTooltip: true
  },
  {
    prop: 'price',
    label: '价格',
    width: 100,
    formatter: (row: any) => `¥${row.price?.toFixed(2) || '0.00'}`
  },
  {
    prop: 'stock',
    label: '库存',
    width: 80,
    align: 'center'
  },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    align: 'center',
    formatter: (row: any) => row.status === 'ACTIVE' ? '启用' : '禁用'
  }
])

/**
 * 格式化文件大小
 */
const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * 下载导入模板
 */
const downloadTemplate = async () => {
  try {
    downloadLoading.value = true
    const response = await productApi.getImportTemplate()
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = response.data.downloadUrl
    link.download = '商品导入模板.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('模板下载失败')
  } finally {
    downloadLoading.value = false
  }
}

/**
 * 处理文件选择
 */
const handleFileSelect = (file: File) => {
  selectedFile.value = file
  ElMessage.success('文件选择成功')
}

/**
 * 处理文件移除
 */
const handleFileRemove = () => {
  selectedFile.value = null
}

/**
 * 移除文件
 */
const removeFile = () => {
  selectedFile.value = null
  fileUploadRef.value?.clearFiles()
}

/**
 * 解析文件
 */
const parseFile = async () => {
  if (!selectedFile.value) {
    ElMessage.error('请先选择文件')
    return
  }

  try {
    parseLoading.value = true
    ElMessage.info('正在解析文件...')
    
    // 验证导入数据
    const response = await productApi.validateImportData(selectedFile.value)
    
    if (response.data.valid) {
      previewData.value = response.data.preview
      validationErrors.value = []
      currentStep.value = 1
      ElMessage.success('文件解析完成')
    } else {
      validationErrors.value = response.data.errors
      previewData.value = response.data.preview
      currentStep.value = 1
      ElMessage.warning('文件解析完成，但存在数据错误')
    }
  } catch (error) {
    console.error('文件解析失败:', error)
    ElMessage.error('文件解析失败，请检查文件格式')
  } finally {
    parseLoading.value = false
  }
}

/**
 * 确认导入
 */
const confirmImport = async () => {
  if (validationErrors.value.length > 0) {
    ElMessage.error('请先修正数据错误')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认导入 ${previewData.value.length} 条商品数据吗？`,
      '确认导入',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    importLoading.value = true
    ElMessage.info('正在导入商品数据...')
    
    // 执行导入
    const response = await productApi.importProducts(selectedFile.value!, {
      updateExisting: false,
      skipErrors: false
    })
    
    importResult.value = response.data
    currentStep.value = 2
    
    if (response.data.failed === 0) {
      ElMessage.success('商品导入完成')
    } else {
      ElMessage.warning(`导入完成，成功 ${response.data.success} 条，失败 ${response.data.failed} 条`)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('商品导入失败:', error)
      ElMessage.error('商品导入失败')
    }
  } finally {
    importLoading.value = false
  }
}

/**
 * 重置导入
 */
const resetImport = () => {
  currentStep.value = 0
  selectedFile.value = null
  previewData.value = []
  validationErrors.value = []
  importResult.value = {
    total: 0,
    success: 0,
    failed: 0,
    errors: [],
    successProducts: []
  }
  fileUploadRef.value?.clearFiles()
}

/**
 * 跳转到商品列表
 */
const goToProductList = () => {
  router.push('/products')
}

// 组件挂载
onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped lang="scss">
.product-import {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
    }
  }

  .steps-card {
    margin-bottom: 20px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }

  .upload-card {
    margin-bottom: 20px;

    .upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      border: 2px dashed var(--el-border-color);
      border-radius: 8px;
      background-color: var(--el-fill-color-lighter);
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      .upload-icon {
        margin-bottom: 16px;
        color: var(--el-color-primary);
      }

      .upload-text {
        text-align: center;
        margin-bottom: 20px;

        h4 {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0 0 8px 0;
        }

        p {
          font-size: 14px;
          color: var(--el-text-color-regular);
          margin: 0;
        }
      }
    }

    .file-info {
      margin-top: 20px;
      padding: 16px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 8px;

      .file-item {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        .file-icon {
          font-size: 24px;
          color: var(--el-color-primary);
          margin-right: 12px;
        }

        .file-details {
          flex: 1;

          .file-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
          }

          .file-size {
            font-size: 12px;
            color: var(--el-text-color-regular);
          }
        }
      }

      .file-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    }
  }

  .preview-card {
    margin-bottom: 20px;

    .card-header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }

      .preview-info {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }

    .validation-errors {
      margin-bottom: 20px;

      .error-summary {
        margin-bottom: 8px;
        font-weight: 600;
      }

      .error-list {
        margin: 0;
        padding-left: 20px;

        li {
          margin-bottom: 4px;
          font-size: 14px;
        }
      }
    }

    .preview-table {
      margin-bottom: 20px;
    }

    .preview-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }

  .result-card {
    .import-result {
      .result-summary {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;

        .result-item {
          display: flex;
          align-items: center;
          padding: 16px;
          border-radius: 8px;
          flex: 1;

          &.success {
            background-color: var(--el-color-success-light-9);
            border: 1px solid var(--el-color-success-light-7);
          }

          &.error {
            background-color: var(--el-color-danger-light-9);
            border: 1px solid var(--el-color-danger-light-7);
          }

          .result-icon {
            margin-right: 12px;
          }

          .result-info {
            h4 {
              font-size: 16px;
              font-weight: 600;
              margin: 0 0 4px 0;
            }

            p {
              font-size: 14px;
              color: var(--el-text-color-regular);
              margin: 0;
            }
          }
        }
      }

      .error-details {
        h5 {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0 0 8px 0;
        }

        .error-list {
          margin: 0;
          padding-left: 20px;

          li {
            margin-bottom: 4px;
            font-size: 14px;
            color: var(--el-text-color-regular);

            .error-sku {
              color: var(--el-color-danger);
              font-weight: 600;
            }
          }
        }
      }
    }

    .result-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }
  }
}
</style>