<template>
  <div class="store-management">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2 class="page-title">店铺管理</h2>
      <div class="page-actions">
        <el-button @click="refreshStoreList" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="showAddStoreDialog">
          <el-icon><Plus /></el-icon>
          添加店铺
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <SearchFilter
      v-model:keyword="searchForm.keyword"
      :filters="filterOptions"
      @search="handleSearch"
      @reset="handleResetSearch"
    />

    <!-- 店铺列表 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">店铺列表</h3>
        <div class="card-actions">
          <el-button 
            text 
            @click="handleBatchOperation('activate')"
            :disabled="selectedStores.length === 0"
          >
            <el-icon><Check /></el-icon>
            批量启用
          </el-button>
          <el-button 
            text 
            @click="handleBatchOperation('deactivate')"
            :disabled="selectedStores.length === 0"
          >
            <el-icon><Close /></el-icon>
            批量停用
          </el-button>
          <el-button text @click="exportStores">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <div class="card-body">
        <BaseTable
          :data="storeList"
          :columns="tableColumns"
          :loading="loading"
          :pagination="pagination"
          @selection-change="handleSelectionChange"
          @page-change="handlePageChange"
          @size-change="handleSizeChange"
        >
          <!-- 平台类型列 -->
          <template #platform="{ row }">
            <el-tag :type="getPlatformTagType(row.platform)">
              {{ getPlatformName(row.platform) }}
            </el-tag>
          </template>

          <!-- 状态列 -->
          <template #status="{ row }">
            <StatusBadge :status="row.status" :type="getStatusType(row.status)" />
          </template>

          <!-- 授权状态列 -->
          <template #authStatus="{ row }">
            <el-switch
              v-model="row.authStatus"
              :active-value="'AUTHORIZED'"
              :inactive-value="'UNAUTHORIZED'"
              active-text="已授权"
              inactive-text="未授权"
              :loading="row.authLoading"
              @change="handleAuthStatusChange(row)"
            />
          </template>

          <!-- 最后同步时间列 -->
          <template #lastSyncTime="{ row }">
            <span v-if="row.lastSyncTime" class="sync-time">
              {{ formatDateTime(row.lastSyncTime) }}
            </span>
            <span v-else class="text-muted">从未同步</span>
          </template>

          <!-- 操作列 -->
          <template #actions="{ row }">
            <div class="table-actions">
              <el-button 
                text 
                type="primary" 
                @click="showStoreDetail(row)"
                title="查看详情"
              >
                <el-icon><View /></el-icon>
              </el-button>
              <el-button 
                text 
                type="primary" 
                @click="showEditStoreDialog(row)"
                title="编辑店铺"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button 
                text 
                type="success" 
                @click="testStoreConnection(row)"
                :loading="row.testLoading"
                title="测试连接"
              >
                <el-icon><Connection /></el-icon>
              </el-button>
              <el-button 
                text 
                :type="row.status === 'ACTIVE' ? 'warning' : 'success'"
                @click="toggleStoreStatus(row)"
                :loading="row.statusLoading"
                :title="row.status === 'ACTIVE' ? '停用店铺' : '启用店铺'"
              >
                <el-icon v-if="row.status === 'ACTIVE'"><Close /></el-icon>
                <el-icon v-else><Check /></el-icon>
              </el-button>
              <el-button 
                text 
                type="danger" 
                @click="deleteStore(row)"
                title="删除店铺"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </BaseTable>
      </div>
    </div>

    <!-- 添加/编辑店铺对话框 -->
    <el-dialog
      v-model="storeDialogVisible"
      :title="isEditMode ? '编辑店铺' : '添加店铺'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="storeFormRef"
        :model="storeForm"
        :rules="storeFormRules"
        label-width="100px"
      >
        <el-form-item label="店铺名称" prop="storeName">
          <el-input
            v-model="storeForm.storeName"
            placeholder="请输入店铺名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="所属平台" prop="platformId">
          <el-select
            v-model="storeForm.platformId"
            placeholder="请选择平台"
            style="width: 100%"
            @change="handlePlatformChange"
          >
            <el-option
              v-for="platform in platformOptions"
              :key="platform.id"
              :label="platform.name"
              :value="platform.id"
            >
              <span>{{ platform.name }}</span>
              <el-tag size="small" style="margin-left: 8px">
                {{ getPlatformName(platform.type) }}
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="平台店铺ID" prop="platformStoreId">
          <el-input
            v-model="storeForm.platformStoreId"
            placeholder="请输入平台店铺ID"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="店铺状态" prop="status">
          <el-radio-group v-model="storeForm.status">
            <el-radio value="ACTIVE">启用</el-radio>
            <el-radio value="INACTIVE">停用</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- API凭证配置 -->
        <el-form-item label="API凭证" v-if="selectedPlatform">
          <div class="api-credentials">
            <div
              v-for="field in apiCredentialFields"
              :key="field.key"
              class="credential-field"
            >
              <el-form-item
                :label="field.label"
                :prop="`apiCredentials.${field.key}`"
                :rules="field.required ? [{ required: true, message: `请输入${field.label}` }] : []"
              >
                <el-input
                  v-model="storeForm.apiCredentials[field.key]"
                  :placeholder="`请输入${field.label}`"
                  :type="field.type === 'password' ? 'password' : 'text'"
                  :show-password="field.type === 'password'"
                />
              </el-form-item>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="storeDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleStoreSubmit"
            :loading="submitLoading"
          >
            {{ isEditMode ? '更新' : '创建' }}
          </el-button>
          <el-button 
            v-if="!isEditMode" 
            type="success" 
            @click="testStoreConfig"
            :loading="testLoading"
          >
            测试连接
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 店铺详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="店铺详情"
      width="800px"
    >
      <div v-if="currentStore" class="store-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="店铺名称">
            {{ currentStore.storeName }}
          </el-descriptions-item>
          <el-descriptions-item label="平台类型">
            <el-tag :type="getPlatformTagType(currentStore.platform)">
              {{ getPlatformName(currentStore.platform) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="平台店铺ID">
            {{ currentStore.platformStoreId }}
          </el-descriptions-item>
          <el-descriptions-item label="店铺状态">
            <StatusBadge :status="currentStore.status" :type="getStatusType(currentStore.status)" />
          </el-descriptions-item>
          <el-descriptions-item label="授权状态">
            <el-tag :type="currentStore.authStatus === 'AUTHORIZED' ? 'success' : 'danger'">
              {{ currentStore.authStatus === 'AUTHORIZED' ? '已授权' : '未授权' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后同步时间">
            <span v-if="currentStore.lastSyncTime">
              {{ formatDateTime(currentStore.lastSyncTime) }}
            </span>
            <span v-else class="text-muted">从未同步</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(currentStore.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(currentStore.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- API凭证信息 -->
        <div class="credential-info" v-if="currentStore.apiCredentials">
          <h4>API凭证配置</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item
              v-for="(value, key) in currentStore.apiCredentials"
              :key="key"
              :label="getCredentialLabel(key)"
            >
              <span v-if="isPasswordField(key)">••••••••</span>
              <span v-else>{{ value }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Plus,
  Check,
  Close,
  Download,
  View,
  Edit,
  Delete,
  Connection
} from '@element-plus/icons-vue'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import SearchFilter from '@/components/business/SearchFilter.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import StatusBadge from '@/components/business/StatusBadge.vue'
import { platformApi } from '@/api/modules/platform'
import type { Store, Platform } from '@/types'
import type { 
  StoreQuery, 
  CreateStoreForm, 
  UpdateStoreForm,
  ConnectionTestResult 
} from '@/api/modules/platform'
import { formatDateTime } from '@/utils'

// 面包屑导航
const breadcrumbItems = [
  { label: '首页', to: '/dashboard' },
  { label: '平台管理', to: '/platforms' },
  { label: '店铺管理' }
]

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const testLoading = ref(false)
const storeList = ref<Store[]>([])
const selectedStores = ref<Store[]>([])
const platformOptions = ref<Platform[]>([])

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  platformId: '',
  status: ''
})

// 筛选选项
const filterOptions = [
  {
    key: 'platformId',
    label: '所属平台',
    type: 'select',
    options: computed(() => platformOptions.value.map(p => ({ label: p.name, value: p.id })))
  },
  {
    key: 'status',
    label: '店铺状态',
    type: 'select',
    options: [
      { label: '启用', value: 'ACTIVE' },
      { label: '停用', value: 'INACTIVE' }
    ]
  }
]

// 表格列配置
const tableColumns = [
  { type: 'selection', width: 50 },
  { prop: 'storeName', label: '店铺名称', minWidth: 150 },
  { prop: 'platform', label: '平台类型', width: 120, slot: 'platform' },
  { prop: 'platformStoreId', label: '平台店铺ID', width: 150 },
  { prop: 'status', label: '店铺状态', width: 100, slot: 'status' },
  { prop: 'authStatus', label: '授权状态', width: 120, slot: 'authStatus' },
  { prop: 'lastSyncTime', label: '最后同步', width: 160, slot: 'lastSyncTime' },
  { prop: 'createdAt', label: '创建时间', width: 160, formatter: (row: Store) => formatDateTime(row.createdAt) },
  { prop: 'actions', label: '操作', width: 200, slot: 'actions', fixed: 'right' }
]

// 对话框状态
const storeDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEditMode = ref(false)
const currentStore = ref<Store | null>(null)

// 店铺表单
const storeFormRef = ref()
const storeForm = reactive<CreateStoreForm>({
  storeName: '',
  platformId: 0,
  platformStoreId: '',
  status: 'ACTIVE',
  apiCredentials: {}
})

// 表单验证规则
const storeFormRules = {
  storeName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 100, message: '店铺名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  platformId: [
    { required: true, message: '请选择所属平台', trigger: 'change' }
  ],
  platformStoreId: [
    { required: true, message: '请输入平台店铺ID', trigger: 'blur' },
    { max: 50, message: '平台店铺ID不能超过50个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择店铺状态', trigger: 'change' }
  ]
}

// 计算属性
const selectedPlatform = computed(() => {
  return platformOptions.value.find(p => p.id === storeForm.platformId)
})

const apiCredentialFields = computed(() => {
  if (!selectedPlatform.value) return []
  
  // 根据平台类型返回不同的API凭证字段
  const platformType = selectedPlatform.value.type
  
  switch (platformType) {
    case 'WALMART':
      return [
        { key: 'clientId', label: 'Client ID', required: true },
        { key: 'clientSecret', label: 'Client Secret', required: true, type: 'password' },
        { key: 'consumerId', label: 'Consumer ID', required: true }
      ]
    case 'AMAZON':
      return [
        { key: 'sellerId', label: 'Seller ID', required: true },
        { key: 'accessKeyId', label: 'Access Key ID', required: true },
        { key: 'secretAccessKey', label: 'Secret Access Key', required: true, type: 'password' },
        { key: 'marketplaceId', label: 'Marketplace ID', required: true }
      ]
    case 'EBAY':
      return [
        { key: 'appId', label: 'App ID', required: true },
        { key: 'devId', label: 'Dev ID', required: true },
        { key: 'certId', label: 'Cert ID', required: true, type: 'password' },
        { key: 'token', label: 'User Token', required: true, type: 'password' }
      ]
    case 'SHOPIFY':
      return [
        { key: 'shopDomain', label: 'Shop Domain', required: true },
        { key: 'accessToken', label: 'Access Token', required: true, type: 'password' },
        { key: 'apiKey', label: 'API Key', required: false },
        { key: 'apiSecret', label: 'API Secret', required: false, type: 'password' }
      ]
    default:
      return [
        { key: 'apiUrl', label: 'API URL', required: true },
        { key: 'apiKey', label: 'API Key', required: true },
        { key: 'apiSecret', label: 'API Secret', required: false, type: 'password' }
      ]
  }
})

// 方法
const fetchStoreList = async () => {
  try {
    loading.value = true
    
    const query: StoreQuery = {
      page: pagination.current,
      size: pagination.size,
      keyword: searchForm.keyword || undefined,
      platformId: searchForm.platformId || undefined,
      status: searchForm.status as unknown || undefined
    }
    
    const response = await platformApi.getStores(query)
    
    storeList.value = response.data.list.map(store => ({
      ...store,
      authStatus: store.apiCredentials ? 'AUTHORIZED' : 'UNAUTHORIZED',
      authLoading: false,
      testLoading: false,
      statusLoading: false
    }))
    
    pagination.total = response.data.total
    
  } catch (error) {
    console.error('获取店铺列表失败:', error)
    ElMessage.error('获取店铺列表失败')
  } finally {
    loading.value = false
  }
}

const fetchPlatformOptions = async () => {
  try {
    const response = await platformApi.getPlatforms({ page: 1, size: 100 })
    platformOptions.value = response.data.list.filter(p => p.isEnabled)
  } catch (error) {
    console.error('获取平台列表失败:', error)
  }
}

const refreshStoreList = () => {
  fetchStoreList()
}

const handleSearch = () => {
  pagination.current = 1
  fetchStoreList()
}

const handleResetSearch = () => {
  Object.assign(searchForm, {
    keyword: '',
    platformId: '',
    status: ''
  })
  pagination.current = 1
  fetchStoreList()
}

const handleSelectionChange = (selection: Store[]) => {
  selectedStores.value = selection
}

const handlePageChange = (page: number) => {
  pagination.current = page
  fetchStoreList()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchStoreList()
}

const showAddStoreDialog = () => {
  isEditMode.value = false
  resetStoreForm()
  storeDialogVisible.value = true
}

const showEditStoreDialog = (store: Store) => {
  isEditMode.value = true
  currentStore.value = store
  
  Object.assign(storeForm, {
    id: store.id,
    storeName: store.storeName,
    platformId: store.platformId || 0,
    platformStoreId: store.platformStoreId,
    status: store.status,
    apiCredentials: { ...store.apiCredentials }
  })
  
  storeDialogVisible.value = true
}

const showStoreDetail = (store: Store) => {
  currentStore.value = store
  detailDialogVisible.value = true
}

const resetStoreForm = () => {
  Object.assign(storeForm, {
    storeName: '',
    platformId: 0,
    platformStoreId: '',
    status: 'ACTIVE',
    apiCredentials: {}
  })
  
  if (storeFormRef.value && typeof storeFormRef.value.resetFields === 'function') {
    storeFormRef.value.resetFields()
  }
}

const handlePlatformChange = () => {
  // 清空API凭证
  storeForm.apiCredentials = {}
}

const handleStoreSubmit = async () => {
  try {
    if (storeFormRef.value && typeof storeFormRef.value.validate === 'function') {
      await storeFormRef.value.validate()
    }
    
    submitLoading.value = true
    
    if (isEditMode.value) {
      const updateForm: UpdateStoreForm = {
        id: storeForm.id!,
        storeName: storeForm.storeName,
        platformStoreId: storeForm.platformStoreId,
        status: storeForm.status,
        apiCredentials: storeForm.apiCredentials
      }
      
      await platformApi.updateStore(updateForm)
      ElMessage.success('店铺更新成功')
    } else {
      await platformApi.createStore(storeForm)
      ElMessage.success('店铺创建成功')
    }
    
    storeDialogVisible.value = false
    fetchStoreList()
    
  } catch (error) {
    console.error('保存店铺失败:', error)
    ElMessage.error('保存店铺失败')
  } finally {
    submitLoading.value = false
  }
}

const testStoreConfig = async () => {
  try {
    if (storeFormRef.value && typeof storeFormRef.value.validate === 'function') {
      await storeFormRef.value.validate()
    }
    
    testLoading.value = true
    
    // 这里应该调用测试配置的API
    // 暂时模拟测试结果
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('连接测试成功')
    
  } catch (error) {
    console.error('连接测试失败:', error)
    ElMessage.error('连接测试失败')
  } finally {
    testLoading.value = false
  }
}

const testStoreConnection = async (store: Store) => {
  try {
    store.testLoading = true
    
    const response = await platformApi.testStoreConnection(store.id)
    const result: ConnectionTestResult = response.data
    
    if (result.success) {
      ElMessage.success(`连接测试成功 (${result.responseTime}ms)`)
    } else {
      ElMessage.error(`连接测试失败: ${result.message}`)
    }
    
  } catch (error) {
    console.error('连接测试失败:', error)
    ElMessage.error('连接测试失败')
  } finally {
    store.testLoading = false
  }
}

const toggleStoreStatus = async (store: Store) => {
  try {
    await ElMessageBox.confirm(
      `确定要${store.status === 'ACTIVE' ? '停用' : '启用'}店铺"${store.storeName}"吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    store.statusLoading = true
    
    if (store.status === 'ACTIVE') {
      await platformApi.deactivateStore(store.id)
      store.status = 'INACTIVE'
      ElMessage.success('店铺已停用')
    } else {
      await platformApi.activateStore(store.id)
      store.status = 'ACTIVE'
      ElMessage.success('店铺已启用')
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换店铺状态失败:', error)
      ElMessage.error('操作失败')
    }
  } finally {
    store.statusLoading = false
  }
}

const handleAuthStatusChange = async (store: Store) => {
  try {
    store.authLoading = true
    
    // 这里应该处理授权状态变更的逻辑
    // 暂时模拟处理
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(`授权状态已${store.authStatus === 'AUTHORIZED' ? '启用' : '停用'}`)
    
  } catch (error) {
    console.error('更新授权状态失败:', error)
    ElMessage.error('更新授权状态失败')
    // 恢复原状态
    store.authStatus = store.authStatus === 'AUTHORIZED' ? 'UNAUTHORIZED' : 'AUTHORIZED'
  } finally {
    store.authLoading = false
  }
}

const deleteStore = async (store: Store) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除店铺"${store.storeName}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await platformApi.deleteStore(store.id)
    ElMessage.success('店铺删除成功')
    fetchStoreList()
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除店铺失败:', error)
      ElMessage.error('删除店铺失败')
    }
  }
}

const handleBatchOperation = async (operation: 'activate' | 'deactivate') => {
  try {
    const operationText = operation === 'activate' ? '启用' : '停用'
    
    await ElMessageBox.confirm(
      `确定要批量${operationText}选中的 ${selectedStores.value.length} 个店铺吗？`,
      `确认批量${operationText}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const promises = selectedStores.value.map(store => {
      return operation === 'activate' 
        ? platformApi.activateStore(store.id)
        : platformApi.deactivateStore(store.id)
    })
    
    await Promise.all(promises)
    
    ElMessage.success(`批量${operationText}成功`)
    fetchStoreList()
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`批量${operation}失败:`, error)
      ElMessage.error('批量操作失败')
    }
  }
}

const exportStores = () => {
  // 导出店铺数据的逻辑
  ElMessage.info('导出功能开发中...')
}

// 工具方法
const getPlatformName = (type: string) => {
  const platformNames: Record<string, string> = {
    WALMART: '沃尔玛',
    AMAZON: '亚马逊',
    EBAY: 'eBay',
    SHOPIFY: 'Shopify',
    CUSTOM: '自定义'
  }
  return platformNames[type] || type
}

const getPlatformTagType = (type: string) => {
  const tagTypes: Record<string, string> = {
    WALMART: 'primary',
    AMAZON: 'warning',
    EBAY: 'success',
    SHOPIFY: 'info',
    CUSTOM: 'default'
  }
  return tagTypes[type] || 'default'
}

const getStatusType = (status: string) => {
  return status === 'ACTIVE' ? 'success' : 'danger'
}

const getCredentialLabel = (key: string) => {
  const labels: Record<string, string> = {
    clientId: 'Client ID',
    clientSecret: 'Client Secret',
    consumerId: 'Consumer ID',
    sellerId: 'Seller ID',
    accessKeyId: 'Access Key ID',
    secretAccessKey: 'Secret Access Key',
    marketplaceId: 'Marketplace ID',
    appId: 'App ID',
    devId: 'Dev ID',
    certId: 'Cert ID',
    token: 'User Token',
    shopDomain: 'Shop Domain',
    accessToken: 'Access Token',
    apiKey: 'API Key',
    apiSecret: 'API Secret',
    apiUrl: 'API URL'
  }
  return labels[key] || key
}

const isPasswordField = (key: string) => {
  const passwordFields = ['clientSecret', 'secretAccessKey', 'certId', 'token', 'accessToken', 'apiSecret']
  return passwordFields.includes(key)
}

// 生命周期
onMounted(() => {
  fetchPlatformOptions()
  fetchStoreList()
})
</script>

<style scoped>
.store-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
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
  padding: 20px;
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
}

.card-body {
  padding: 20px;
}

.table-actions {
  display: flex;
  gap: 4px;
}

.sync-time {
  color: var(--el-text-color-regular);
  font-size: 12px;
}

.text-muted {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.api-credentials {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
}

.credential-field {
  margin-bottom: 16px;
}

.credential-field:last-child {
  margin-bottom: 0;
}

.store-detail {
  padding: 20px 0;
}

.credential-info {
  margin-top: 24px;
}

.credential-info h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>