<template>
  <div class="system-settings">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h2>系统配置</h2>
        <p class="page-description">管理系统基本参数和功能设置</p>
      </div>
      <div class="page-actions">
        <el-button 
          type="default" 
          :icon="RefreshLeft" 
          @click="handleReset"
          :loading="resetLoading"
        >
          重置
        </el-button>
        <el-button 
          type="primary" 
          :icon="Check" 
          @click="handleSave"
          :loading="saveLoading"
        >
          保存配置
        </el-button>
      </div>
    </div>

    <!-- 配置标签页 -->
    <el-tabs v-model="activeTab" class="config-tabs">
      <!-- 基本设置 -->
      <el-tab-pane label="基本设置" name="general">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>基本设置</span>
            </div>
          </template>
          
          <el-form 
            ref="generalFormRef" 
            :model="generalConfig" 
            :rules="generalRules"
            label-width="120px"
            class="config-form"
          >
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="系统名称" prop="systemName">
                  <el-input 
                    v-model="generalConfig.systemName" 
                    placeholder="请输入系统名称"
                    maxlength="50"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="系统版本" prop="systemVersion">
                  <el-input 
                    v-model="generalConfig.systemVersion" 
                    placeholder="系统版本"
                    readonly
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="公司名称" prop="companyName">
                  <el-input 
                    v-model="generalConfig.companyName" 
                    placeholder="请输入公司名称"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系邮箱" prop="contactEmail">
                  <el-input 
                    v-model="generalConfig.contactEmail" 
                    placeholder="请输入联系邮箱"
                    type="email"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="时区设置" prop="timezone">
                  <el-select 
                    v-model="generalConfig.timezone" 
                    placeholder="请选择时区"
                    filterable
                  >
                    <el-option
                      v-for="tz in timezoneOptions"
                      :key="tz.value"
                      :label="tz.label"
                      :value="tz.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="语言设置" prop="language">
                  <el-select 
                    v-model="generalConfig.language" 
                    placeholder="请选择语言"
                  >
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="日期格式" prop="dateFormat">
                  <el-select 
                    v-model="generalConfig.dateFormat" 
                    placeholder="请选择日期格式"
                  >
                    <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                    <el-option label="MM/DD/YYYY" value="MM/DD/YYYY" />
                    <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="货币单位" prop="currency">
                  <el-select 
                    v-model="generalConfig.currency" 
                    placeholder="请选择货币单位"
                    filterable
                  >
                    <el-option label="人民币 (CNY)" value="CNY" />
                    <el-option label="美元 (USD)" value="USD" />
                    <el-option label="欧元 (EUR)" value="EUR" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 功能设置 -->
      <el-tab-pane label="功能设置" name="features">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <el-icon><Tools /></el-icon>
              <span>功能设置</span>
            </div>
          </template>

          <div class="feature-settings">
            <div class="setting-item" v-for="feature in featureSettings" :key="feature.key">
              <div class="setting-info">
                <h4>{{ feature.name }}</h4>
                <p>{{ feature.description }}</p>
              </div>
              <div class="setting-control">
                <el-switch 
                  v-model="feature.enabled"
                  :active-text="feature.enabled ? '已启用' : ''"
                  :inactive-text="!feature.enabled ? '已禁用' : ''"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 安全设置 -->
      <el-tab-pane label="安全设置" name="security">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <el-icon><Lock /></el-icon>
              <span>安全设置</span>
            </div>
          </template>

          <el-form 
            ref="securityFormRef" 
            :model="securityConfig" 
            :rules="securityRules"
            label-width="140px"
            class="config-form"
          >
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="密码最小长度" prop="minPasswordLength">
                  <el-input-number 
                    v-model="securityConfig.minPasswordLength"
                    :min="6"
                    :max="20"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="登录失败锁定次数" prop="maxLoginAttempts">
                  <el-input-number 
                    v-model="securityConfig.maxLoginAttempts"
                    :min="3"
                    :max="10"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="会话超时时间(分钟)" prop="sessionTimeout">
                  <el-input-number 
                    v-model="securityConfig.sessionTimeout"
                    :min="15"
                    :max="480"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密码过期天数" prop="passwordExpireDays">
                  <el-input-number 
                    v-model="securityConfig.passwordExpireDays"
                    :min="30"
                    :max="365"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="强制密码复杂度" prop="enforcePasswordComplexity">
              <el-switch 
                v-model="securityConfig.enforcePasswordComplexity"
                active-text="启用"
                inactive-text="禁用"
              />
              <div class="form-tip">
                启用后密码必须包含大小写字母、数字和特殊字符
              </div>
            </el-form-item>

            <el-form-item label="启用双因子认证" prop="enableTwoFactor">
              <el-switch 
                v-model="securityConfig.enableTwoFactor"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 通知设置 -->
      <el-tab-pane label="通知设置" name="notification">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <el-icon><Bell /></el-icon>
              <span>通知设置</span>
            </div>
          </template>

          <el-form 
            ref="notificationFormRef" 
            :model="notificationConfig" 
            :rules="notificationRules"
            label-width="120px"
            class="config-form"
          >
            <el-form-item label="邮件服务器" prop="emailHost">
              <el-input 
                v-model="notificationConfig.emailHost" 
                placeholder="请输入邮件服务器地址"
              />
            </el-form-item>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="端口" prop="emailPort">
                  <el-input-number 
                    v-model="notificationConfig.emailPort"
                    :min="1"
                    :max="65535"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="启用SSL" prop="emailSsl">
                  <el-switch 
                    v-model="notificationConfig.emailSsl"
                    active-text="启用"
                    inactive-text="禁用"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="发件人邮箱" prop="emailUsername">
                  <el-input 
                    v-model="notificationConfig.emailUsername" 
                    placeholder="请输入发件人邮箱"
                    type="email"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱密码" prop="emailPassword">
                  <el-input 
                    v-model="notificationConfig.emailPassword" 
                    placeholder="请输入邮箱密码"
                    type="password"
                    show-password
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item>
              <el-button 
                type="primary" 
                @click="testEmailConnection"
                :loading="testingEmail"
              >
                测试邮件连接
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { 
  Setting, 
  Tools, 
  Lock, 
  Bell, 
  Check, 
  RefreshLeft 
} from '@element-plus/icons-vue'
import { systemApi } from '@/api/modules/system'

// 响应式数据
const activeTab = ref('general')
const saveLoading = ref(false)
const resetLoading = ref(false)
const testingEmail = ref(false)

// 表单引用
const generalFormRef = ref<FormInstance>()
const securityFormRef = ref<FormInstance>()
const notificationFormRef = ref<FormInstance>()

// 基本配置
const generalConfig = reactive({
  systemName: '电商ERP管理系统',
  systemVersion: 'v1.0.0',
  companyName: '示例科技有限公司',
  contactEmail: 'admin@example.com',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  dateFormat: 'YYYY-MM-DD',
  currency: 'CNY'
})

// 功能设置
const featureSettings = reactive([
  {
    key: 'autoSync',
    name: '自动同步',
    description: '启用后系统将自动同步平台数据',
    enabled: true
  },
  {
    key: 'inventoryAlert',
    name: '库存预警',
    description: '启用后系统将发送库存不足通知',
    enabled: true
  },
  {
    key: 'emailNotification',
    name: '邮件通知',
    description: '启用后系统将发送邮件通知',
    enabled: false
  },
  {
    key: 'smsNotification',
    name: '短信通知',
    description: '启用后系统将发送短信通知',
    enabled: false
  },
  {
    key: 'orderAutoProcess',
    name: '订单自动处理',
    description: '启用后符合条件的订单将自动处理',
    enabled: false
  }
])

// 安全配置
const securityConfig = reactive({
  minPasswordLength: 8,
  maxLoginAttempts: 5,
  sessionTimeout: 120,
  passwordExpireDays: 90,
  enforcePasswordComplexity: true,
  enableTwoFactor: false
})

// 通知配置
const notificationConfig = reactive({
  emailHost: 'smtp.example.com',
  emailPort: 587,
  emailSsl: true,
  emailUsername: 'noreply@example.com',
  emailPassword: ''
})

// 时区选项
const timezoneOptions = [
  { label: '北京时间 (UTC+8)', value: 'Asia/Shanghai' },
  { label: '东京时间 (UTC+9)', value: 'Asia/Tokyo' },
  { label: '纽约时间 (UTC-5)', value: 'America/New_York' },
  { label: '伦敦时间 (UTC+0)', value: 'Europe/London' },
  { label: '洛杉矶时间 (UTC-8)', value: 'America/Los_Angeles' }
]

// 表单验证规则
const generalRules: FormRules = {
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 50, message: '系统名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  companyName: [
    { required: true, message: '请输入公司名称', trigger: 'blur' },
    { min: 2, max: 100, message: '公司名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  contactEmail: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  timezone: [
    { required: true, message: '请选择时区', trigger: 'change' }
  ],
  language: [
    { required: true, message: '请选择语言', trigger: 'change' }
  ]
}

const securityRules: FormRules = {
  minPasswordLength: [
    { required: true, message: '请设置密码最小长度', trigger: 'blur' }
  ],
  maxLoginAttempts: [
    { required: true, message: '请设置登录失败锁定次数', trigger: 'blur' }
  ],
  sessionTimeout: [
    { required: true, message: '请设置会话超时时间', trigger: 'blur' }
  ]
}

const notificationRules: FormRules = {
  emailHost: [
    { required: true, message: '请输入邮件服务器地址', trigger: 'blur' }
  ],
  emailPort: [
    { required: true, message: '请输入邮件服务器端口', trigger: 'blur' }
  ],
  emailUsername: [
    { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

/**
 * 保存配置
 */
const handleSave = async () => {
  try {
    // 验证所有表单
    const generalValid = await generalFormRef.value?.validate().catch(() => false)
    const securityValid = await securityFormRef.value?.validate().catch(() => false)
    const notificationValid = await notificationFormRef.value?.validate().catch(() => false)

    if (!generalValid || !securityValid || !notificationValid) {
      ElMessage.error('请检查表单填写是否正确')
      return
    }

    saveLoading.value = true

    // 构建配置数据
    const configData = {
      general: generalConfig,
      features: featureSettings.reduce((acc, item) => {
        acc[item.key] = item.enabled
        return acc
      }, {} as Record<string, boolean>),
      security: securityConfig,
      notification: notificationConfig
    }

    // 批量更新配置
    const configs = Object.entries(configData).flatMap(([category, data]) => 
      Object.entries(data).map(([key, value]) => ({
        key: `${category}.${key}`,
        value,
        description: `${category} - ${key}`
      }))
    )

    await systemApi.batchUpdateSystemConfigs({ configs })
    
    ElMessage.success('系统配置保存成功')
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败，请重试')
  } finally {
    saveLoading.value = false
  }
}

/**
 * 重置配置
 */
const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置系统配置吗？此操作将恢复所有配置为默认值。',
      '重置确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    resetLoading.value = true
    
    // 重置所有配置为默认值
    await systemApi.resetAllSystemConfigs()
    
    // 重新加载配置
    await loadConfigs()
    
    ElMessage.success('系统配置已重置为默认值')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置配置失败:', error)
      ElMessage.error('重置配置失败，请重试')
    }
  } finally {
    resetLoading.value = false
  }
}

/**
 * 测试邮件连接
 */
const testEmailConnection = async () => {
  try {
    testingEmail.value = true
    
    const config = {
      host: notificationConfig.emailHost,
      port: notificationConfig.emailPort,
      ssl: notificationConfig.emailSsl,
      username: notificationConfig.emailUsername,
      password: notificationConfig.emailPassword
    }

    const result = await systemApi.testSystemConnection('email', config)
    
    if (result.data.success) {
      ElMessage.success(`邮件连接测试成功 (${result.data.duration}ms)`)
    } else {
      ElMessage.error(`邮件连接测试失败: ${result.data.message}`)
    }
  } catch (error) {
    console.error('测试邮件连接失败:', error)
    ElMessage.error('测试邮件连接失败，请检查配置')
  } finally {
    testingEmail.value = false
  }
}

/**
 * 加载系统配置
 */
const loadConfigs = async () => {
  try {
    // 加载基本配置
    const generalConfigs = await systemApi.getSystemConfigsByType('GENERAL')
    if (generalConfigs.data) {
      generalConfigs.data.forEach(config => {
        const key = config.key.replace('general.', '')
        if (key in generalConfig) {
          (generalConfig as any)[key] = config.value
        }
      })
    }

    // 加载功能配置
    const featureConfigs = await systemApi.getSystemConfigsByType('GENERAL')
    if (featureConfigs.data) {
      featureConfigs.data.forEach(config => {
        const key = config.key.replace('features.', '')
        const feature = featureSettings.find(f => f.key === key)
        if (feature) {
          feature.enabled = config.value
        }
      })
    }

    // 加载安全配置
    const securityConfigs = await systemApi.getSystemConfigsByType('SECURITY')
    if (securityConfigs.data) {
      securityConfigs.data.forEach(config => {
        const key = config.key.replace('security.', '')
        if (key in securityConfig) {
          (securityConfig as any)[key] = config.value
        }
      })
    }

    // 加载通知配置
    const notificationConfigs = await systemApi.getSystemConfigsByType('NOTIFICATION')
    if (notificationConfigs.data) {
      notificationConfigs.data.forEach(config => {
        const key = config.key.replace('notification.', '')
        if (key in notificationConfig) {
          (notificationConfig as any)[key] = config.value
        }
      })
    }
  } catch (error) {
    console.error('加载系统配置失败:', error)
    ElMessage.error('加载系统配置失败')
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.system-settings {
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

.config-tabs {
  --el-tabs-header-height: 50px;
}

.config-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.config-form {
  padding: 20px 0;
}

.feature-settings {
  padding: 20px 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.setting-info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.setting-control {
  flex-shrink: 0;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-settings {
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
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .setting-control {
    align-self: flex-end;
  }
}
</style>