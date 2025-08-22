<template>
  <div class="platform-config">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-section">
        <h2 class="page-title">平台配置</h2>
        <p class="page-description">配置电商平台连接参数和同步设置</p>
      </div>
      <div class="page-actions">
        <el-button 
          type="default" 
          :icon="Connection" 
          @click="testConnection"
          :loading="testingConnection"
        >
          测试连接
        </el-button>
        <el-button 
          type="primary" 
          :icon="Check" 
          @click="saveConfig"
          :loading="saving"
        >
          保存配置
        </el-button>
      </div>
    </div>

    <!-- 平台类型选择 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">选择平台类型</h3>
      </div>
      <div class="card-body">
        <div class="platform-types">
          <div 
            v-for="platform in platformTypes" 
            :key="platform.type"
            class="platform-type-card"
            :class="{ active: selectedPlatformType === platform.type }"
            @click="selectPlatformType(platform.type)"
          >
            <div class="platform-icon">
              <component :is="platform.icon" />
            </div>
            <h4>{{ platform.name }}</h4>
            <p>{{ platform.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 配置表单 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">平台配置信息</h3>
      </div>
      <div class="card-body">
        <el-form 
          ref="configFormRef" 
          :model="configForm" 
          :rules="configRules" 
          label-width="120px"
          class="config-form"
        >
          <!-- 基本信息 -->
          <div class="form-section">
            <h4 class="section-title">基本信息</h4>
            
            <div class="form-row">
              <el-form-item label="平台名称" prop="platformName" class="form-group">
                <el-input 
                  v-model="configForm.platformName" 
                  placeholder="请输入平台名称"
                />
              </el-form-item>
              
              <el-form-item label="平台地址" prop="platformUrl" class="form-group">
                <el-input 
                  v-model="configForm.platformUrl" 
                  placeholder="https://example.com"
                />
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="描述" prop="description" class="form-group full-width">
                <el-input 
                  v-model="configForm.description" 
                  type="textarea" 
                  :rows="3"
                  placeholder="请输入平台描述"
                />
              </el-form-item>
            </div>
          </div>

          <!-- API配置 -->
          <div class="form-section">
            <h4 class="section-title">API配置</h4>
            
            <div class="form-row">
              <el-form-item label="API端点" prop="apiEndpoint" class="form-group">
                <el-input 
                  v-model="configForm.apiEndpoint" 
                  placeholder="https://api.example.com"
                />
              </el-form-item>
              
              <el-form-item label="API版本" prop="apiVersion" class="form-group">
                <el-select v-model="configForm.apiVersion" placeholder="请选择API版本">
                  <el-option label="v1" value="v1" />
                  <el-option label="v2" value="v2" />
                  <el-option label="v3" value="v3" />
                </el-select>
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="客户端ID" prop="clientId" class="form-group">
                <el-input 
                  v-model="configForm.clientId" 
                  placeholder="请输入客户端ID"
                />
              </el-form-item>
              
              <el-form-item label="客户端密钥" prop="clientSecret" class="form-group">
                <el-input 
                  v-model="configForm.clientSecret" 
                  type="password" 
                  placeholder="请输入客户端密钥"
                  show-password
                />
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="访问令牌" prop="accessToken" class="form-group">
                <el-input 
                  v-model="configForm.accessToken" 
                  type="password" 
                  placeholder="请输入访问令牌"
                  show-password
                />
              </el-form-item>
              
              <el-form-item label="刷新令牌" prop="refreshToken" class="form-group">
                <el-input 
                  v-model="configForm.refreshToken" 
                  type="password" 
                  placeholder="请输入刷新令牌"
                  show-password
                />
              </el-form-item>
            </div>
          </div>

          <!-- 同步设置 -->
          <div class="form-section">
            <h4 class="section-title">同步设置</h4>
            
            <div class="form-row">
              <el-form-item label="同步间隔" prop="syncInterval" class="form-group">
                <el-input-number 
                  v-model="configForm.syncInterval" 
                  :min="1" 
                  :max="1440"
                  controls-position="right"
                />
                <span class="input-suffix">分钟</span>
              </el-form-item>
              
              <el-form-item label="批量大小" prop="batchSize" class="form-group">
                <el-input-number 
                  v-model="configForm.batchSize" 
                  :min="1" 
                  :max="1000"
                  controls-position="right"
                />
                <span class="input-suffix">条</span>
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="自动同步" class="form-group">
                <el-switch v-model="configForm.autoSync" />
              </el-form-item>
              
              <el-form-item label="同步商品" class="form-group">
                <el-switch v-model="configForm.syncProducts" />
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="同步订单" class="form-group">
                <el-switch v-model="configForm.syncOrders" />
              </el-form-item>
              
              <el-form-item label="同步库存" class="form-group">
                <el-switch v-model="configForm.syncInventory" />
              </el-form-item>
            </div>
          </div>

          <!-- 高级设置 -->
          <div class="form-section">
            <h4 class="section-title">高级设置</h4>
            
            <div class="form-row">
              <el-form-item label="请求超时" prop="timeout" class="form-group">
                <el-input-number 
                  v-model="configForm.timeout" 
                  :min="1" 
                  :max="300"
                  controls-position="right"
                />
                <span class="input-suffix">秒</span>
              </el-form-item>
              
              <el-form-item label="重试次数" prop="retryCount" class="form-group">
                <el-input-number 
                  v-model="configForm.retryCount" 
                  :min="0" 
                  :max="10"
                  controls-position="right"
                />
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="Webhook地址" prop="webhookUrl" class="form-group">
                <el-input 
                  v-model="configForm.webhookUrl" 
                  placeholder="https://your-domain.com/webhook"
                />
              </el-form-item>
              
              <el-form-item label="Webhook密钥" prop="webhookSecret" class="form-group">
                <el-input 
                  v-model="configForm.webhookSecret" 
                  type="password" 
                  placeholder="请输入Webhook密钥"
                  show-password
                />
              </el-form-item>
            </div>
            
            <div class="form-row">
              <el-form-item label="启用日志" class="form-group">
                <el-switch v-model="configForm.enableLogging" />
              </el-form-item>
              
              <el-form-item label="启用通知" class="form-group">
                <el-switch v-model="configForm.enableNotifications" />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 连接状态 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">连接状态</h3>
      </div>
      <div class="card-body">
        <div class="connection-status">
          <div class="status-item">
            <div class="status-icon" :class="connectionStatus.type">
              <component :is="connectionStatus.icon" />
            </div>
            <div class="status-info">
              <h4>{{ connectionStatus.title }}</h4>
              <p>{{ connectionStatus.message }}</p>
              <div v-if="connectionStatus.details" class="status-details">
                <div v-for="(detail, key) in connectionStatus.details" :key="key" class="detail-item">
                  <span class="detail-label">{{ key }}:</span>
                  <span class="detail-value">{{ detail }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据同步功能 -->
    <div v-if="connectionStatus.type === 'status-success'" class="content-card">
      <div class="card-header">
        <h3 class="card-title">数据同步</h3>
      </div>
      <div class="card-body">
        <DataSyncPanel :platform-id="currentPlatformId" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Connection, Check, Shop, Warning, CircleCheck, CircleClose, QuestionFilled } from '@element-plus/icons-vue'
import { platformApi } from '@/api/modules/platform'
import BreadcrumbNav from '@/components/business/BreadcrumbNav.vue'
import { DataSyncPanel } from '@/components/business'

// 类型定义
interface PlatformType {
  type: string
  name: string
  description: string
  icon: any
}

interface ConfigForm {
  platformName: string
  platformUrl: string
  description: string
  apiEndpoint: string
  apiVersion: string
  clientId: string
  clientSecret: string
  accessToken: string
  refreshToken: string
  syncInterval: number
  batchSize: number
  autoSync: boolean
  syncProducts: boolean
  syncOrders: boolean
  syncInventory: boolean
  timeout: number
  retryCount: number
  webhookUrl: string
  webhookSecret: string
  enableLogging: boolean
  enableNotifications: boolean
}

interface ConnectionStatus {
  type: string
  icon: any
  title: string
  message: string
  details?: Record<string, string>
}

// 响应式数据
const configFormRef = ref()
const testingConnection = ref(false)
const saving = ref(false)
const selectedPlatformType = ref('walmart')
const currentPlatformId = ref<number | undefined>(1) // 模拟当前平台ID

// 平台类型选项
const platformTypes: PlatformType[] = [
  {
    type: 'walmart',
    name: '沃尔玛',
    description: 'Walmart Marketplace',
    icon: Shop
  },
  {
    type: 'amazon',
    name: '亚马逊',
    description: 'Amazon Marketplace',
    icon: Shop
  },
  {
    type: 'ebay',
    name: 'eBay',
    description: 'eBay Marketplace',
    icon: Shop
  },
  {
    type: 'shopify',
    name: 'Shopify',
    description: 'Shopify Store',
    icon: Shop
  }
]

// 配置表单
const configForm = reactive<ConfigForm>({
  platformName: '',
  platformUrl: '',
  description: '',
  apiEndpoint: '',
  apiVersion: '',
  clientId: '',
  clientSecret: '',
  accessToken: '',
  refreshToken: '',
  syncInterval: 30,
  batchSize: 100,
  autoSync: true,
  syncProducts: true,
  syncOrders: true,
  syncInventory: true,
  timeout: 30,
  retryCount: 3,
  webhookUrl: '',
  webhookSecret: '',
  enableLogging: true,
  enableNotifications: true
})

// 表单验证规则
const configRules = {
  platformName: [
    { required: true, message: '请输入平台名称', trigger: 'blur' }
  ],
  platformUrl: [
    { required: true, message: '请输入平台地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  apiEndpoint: [
    { required: true, message: '请输入API端点', trigger: 'blur' },
    { type: 'url', message: '请输入有效的API端点', trigger: 'blur' }
  ],
  apiVersion: [
    { required: true, message: '请选择API版本', trigger: 'change' }
  ],
  clientId: [
    { required: true, message: '请输入客户端ID', trigger: 'blur' }
  ],
  clientSecret: [
    { required: true, message: '请输入客户端密钥', trigger: 'blur' }
  ],
  syncInterval: [
    { required: true, message: '请输入同步间隔', trigger: 'blur' },
    { type: 'number', min: 1, max: 1440, message: '同步间隔必须在1-1440分钟之间', trigger: 'blur' }
  ],
  batchSize: [
    { required: true, message: '请输入批量大小', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '批量大小必须在1-1000之间', trigger: 'blur' }
  ],
  timeout: [
    { required: true, message: '请输入请求超时时间', trigger: 'blur' },
    { type: 'number', min: 1, max: 300, message: '超时时间必须在1-300秒之间', trigger: 'blur' }
  ],
  retryCount: [
    { required: true, message: '请输入重试次数', trigger: 'blur' },
    { type: 'number', min: 0, max: 10, message: '重试次数必须在0-10次之间', trigger: 'blur' }
  ],
  webhookUrl: [
    { type: 'url', message: '请输入有效的Webhook地址', trigger: 'blur' }
  ]
}

// 连接状态
const connectionStatus = ref<ConnectionStatus>({
  type: 'status-unknown',
  icon: QuestionFilled,
  title: '未测试',
  message: '请点击"测试连接"按钮验证配置'
})

// 面包屑导航
const breadcrumbItems = [
  { label: '仪表板', to: '/dashboard' },
  { label: '平台管理', to: '/platforms' },
  { label: '平台配置' }
]

// 方法
const selectPlatformType = (type: string) => {
  selectedPlatformType.value = type
  
  // 根据平台类型预填充一些默认值
  const platformDefaults = {
    walmart: {
      platformName: '沃尔玛旗舰店',
      platformUrl: 'https://marketplace.walmart.com',
      apiEndpoint: 'https://marketplace.walmartapis.com',
      apiVersion: 'v3'
    },
    amazon: {
      platformName: '亚马逊专营店',
      platformUrl: 'https://sellercentral.amazon.com',
      apiEndpoint: 'https://mws.amazonservices.com',
      apiVersion: 'v2'
    },
    ebay: {
      platformName: 'eBay国际店',
      platformUrl: 'https://www.ebay.com',
      apiEndpoint: 'https://api.ebay.com',
      apiVersion: 'v1'
    },
    shopify: {
      platformName: 'Shopify商店',
      platformUrl: 'https://your-store.myshopify.com',
      apiEndpoint: 'https://your-store.myshopify.com/admin/api',
      apiVersion: 'v1'
    }
  }
  
  const defaults = platformDefaults[type as keyof typeof platformDefaults]
  if (defaults) {
    Object.assign(configForm, defaults)
  }
}

const testConnection = async () => {
  try {
    // 先验证表单
    await configFormRef.value.validate()
    
    testingConnection.value = true
    connectionStatus.value = {
      type: 'status-testing',
      icon: Connection,
      title: '测试中...',
      message: '正在验证平台连接配置'
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟测试结果
    const testResult = Math.random() > 0.3 // 70% 成功率
    
    if (testResult) {
      connectionStatus.value = {
        type: 'status-success',
        icon: CircleCheck,
        title: '连接成功',
        message: '平台连接配置验证通过',
        details: {
          '响应时间': '156ms',
          'API版本': configForm.apiVersion,
          '最后测试': new Date().toLocaleString()
        }
      }
      ElMessage.success('平台连接测试成功')
    } else {
      connectionStatus.value = {
        type: 'status-error',
        icon: CircleClose,
        title: '连接失败',
        message: '无法连接到平台API，请检查配置信息',
        details: {
          '错误代码': '401',
          '错误信息': 'Unauthorized - Invalid credentials',
          '最后测试': new Date().toLocaleString()
        }
      }
      ElMessage.error('平台连接测试失败，请检查配置')
    }
  } catch (error) {
    connectionStatus.value = {
      type: 'status-error',
      icon: Warning,
      title: '配置错误',
      message: '请完善配置信息后再进行连接测试'
    }
    ElMessage.warning('请先完善配置信息')
  } finally {
    testingConnection.value = false
  }
}

const saveConfig = async () => {
  try {
    await configFormRef.value.validate()
    
    saving.value = true
    
    // 构建保存数据
    const configData = {
      ...configForm,
      platformType: selectedPlatformType.value
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('平台配置保存成功')
  } catch (error) {
    ElMessage.error('配置保存失败，请检查表单信息')
  } finally {
    saving.value = false
  }
}

const loadConfig = async () => {
  try {
    // 模拟加载配置数据
    const mockConfig = {
      platformName: '沃尔玛旗舰店',
      platformUrl: 'https://marketplace.walmart.com',
      description: '沃尔玛官方旗舰店',
      apiEndpoint: 'https://marketplace.walmartapis.com',
      apiVersion: 'v3',
      clientId: 'walmart_client_123',
      clientSecret: '',
      accessToken: '',
      refreshToken: '',
      syncInterval: 30,
      batchSize: 100,
      autoSync: true,
      syncProducts: true,
      syncOrders: true,
      syncInventory: true,
      timeout: 30,
      retryCount: 3,
      webhookUrl: 'https://your-domain.com/webhook/walmart',
      webhookSecret: '',
      enableLogging: true,
      enableNotifications: true
    }
    
    Object.assign(configForm, mockConfig)
  } catch (error) {
    ElMessage.error('加载配置失败')
  }
}

// 生命周期
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.platform-config {
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

.card-body {
  padding: 20px;
}

/* 平台类型选择 */
.platform-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.platform-type-card {
  border: 2px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.platform-type-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.platform-type-card.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.platform-icon {
  font-size: 32px;
  color: var(--el-color-primary);
  margin-bottom: 12px;
}

.platform-type-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.platform-type-card p {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0;
}

/* 配置表单 */
.config-form {
  max-width: none;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.input-suffix {
  margin-left: 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

/* 连接状态 */
.connection-status {
  padding: 0;
}

.status-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.status-icon.status-unknown {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.status-icon.status-testing {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.status-icon.status-success {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.status-icon.status-error {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.status-info {
  flex: 1;
}

.status-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 4px 0;
}

.status-info p {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 0 12px 0;
}

.status-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .platform-config {
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
  
  .platform-types {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .status-item {
    flex-direction: column;
    text-align: center;
  }
  
  .status-details {
    grid-template-columns: 1fr;
  }
}
</style>