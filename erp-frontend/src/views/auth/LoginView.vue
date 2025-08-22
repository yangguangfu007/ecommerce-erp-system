<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="/logo.svg" alt="ERP系统" class="login-logo">
          <h1 class="login-title">电商ERP管理系统</h1>
          <p class="login-subtitle">请登录您的账户</p>
        </div>

        <form class="login-form" data-test="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label" for="username">用户名</label>
            <div class="input-wrapper">
              <i class="fas fa-user input-icon"></i>
              <input 
                type="text" 
                id="username" 
                name="username" 
                class="form-input"
                :class="{ error: errors.username }"
                placeholder="请输入用户名"
                v-model="loginForm.username"
                data-test="username"
                required
              >
            </div>
            <div class="form-error" :class="{ show: errors.username }">
              {{ errors.username }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">密码</label>
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                name="password" 
                class="form-input"
                :class="{ error: errors.password }"
                placeholder="请输入密码"
                v-model="loginForm.password"
                @keyup.enter="handleLogin"
                data-test="password"
                required
              >
              <button type="button" class="password-toggle" @click="togglePassword">
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="form-error" :class="{ show: errors.password }">
              {{ errors.password }}
            </div>
          </div>

          <div class="form-options">
            <label class="checkbox-wrapper">
              <input type="checkbox" id="remember" name="remember" v-model="rememberMe">
              <span class="checkbox-label">记住我</span>
            </label>
            <a href="#" class="forgot-password" @click.prevent="showForgotPassword">忘记密码？</a>
          </div>

          <button type="submit" class="btn btn-primary btn-login" data-test="login-btn" :disabled="loading">
            <span class="btn-text" v-show="!loading">登录</span>
            <div class="btn-loading" v-show="loading">
              <i class="fas fa-spinner fa-spin"></i>
              <span>登录中...</span>
            </div>
          </button>


        </form>

        <div class="login-footer">
          <p>&copy; 2025 电商ERP管理系统. 保留所有权利.</p>
        </div>
      </div>
    </div>

    <!-- 忘记密码对话框 -->
    <div class="modal-overlay" v-show="forgotPasswordVisible" @click="closeForgotPassword">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">忘记密码</h3>
          <button class="modal-close" @click="closeForgotPassword">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleForgotPassword">
            <div class="form-group">
              <label class="form-label" for="email">邮箱地址</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope input-icon"></i>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  class="form-input"
                  :class="{ error: errors.email }"
                  placeholder="请输入注册邮箱"
                  v-model="forgotForm.email"
                  required
                >
              </div>
              <div class="form-error" :class="{ show: errors.email }">
                {{ errors.email }}
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeForgotPassword">取消</button>
          <button 
            type="button" 
            class="btn btn-primary" 
            :disabled="forgotLoading"
            @click="handleForgotPassword"
          >
            <span v-show="!forgotLoading">发送重置邮件</span>
            <span v-show="forgotLoading">
              <i class="fas fa-spinner fa-spin"></i> 发送中...
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const forgotLoading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const forgotPasswordVisible = ref(false)

// 登录表单
const loginForm = reactive({
  username: 'admin',
  password: 'admin123'
})

// 忘记密码表单
const forgotForm = reactive({
  email: ''
})

// 表单错误状态
const errors = reactive({
  username: '',
  password: '',
  email: ''
})

// 密码显示/隐藏切换
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 表单验证
const validateForm = (): boolean => {
  // 清除之前的错误
  errors.username = ''
  errors.password = ''
  
  let isValid = true

  // 验证用户名
  if (!loginForm.username.trim()) {
    errors.username = '请输入用户名'
    isValid = false
  } else if (loginForm.username.length < 3) {
    errors.username = '用户名至少需要3个字符'
    isValid = false
  }

  // 验证密码
  if (!loginForm.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (loginForm.password.length < 6) {
    errors.password = '密码至少需要6个字符'
    isValid = false
  }

  return isValid
}

// 验证邮箱表单
const validateEmailForm = (): boolean => {
  errors.email = ''
  
  if (!forgotForm.email.trim()) {
    errors.email = '请输入邮箱地址'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(forgotForm.email)) {
    errors.email = '请输入正确的邮箱地址'
    return false
  }
  
  return true
}

// 显示Toast消息
const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  // 检查是否在浏览器环境中
  if (typeof document === 'undefined') {
    console.log(`Toast: ${type} - ${message}`)
    return
  }
  
  // 创建toast元素
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${getToastIcon(type)}"></i>
    </div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `
  
  // 获取或创建toast容器
  let container = document.querySelector('.toast-container')
  if (!container) {
    container = document.createElement('div')
    container.className = 'toast-container'
    document.body.appendChild(container)
  }
  
  container.appendChild(toast)
  
  // 自动关闭
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 3000)
}

// 获取Toast图标
const getToastIcon = (type: string): string => {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  }
  return icons[type as keyof typeof icons] || icons.info
}

// 登录处理
const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // 使用用户状态管理的登录方法
    await userStore.login({
      username: loginForm.username,
      password: loginForm.password
    })

    // 保存登录信息
    if (rememberMe.value) {
      localStorage.setItem('rememberLogin', 'true')
      localStorage.setItem('username', loginForm.username)
    } else {
      localStorage.removeItem('rememberLogin')
      localStorage.removeItem('username')
    }

    showToast('登录成功！正在跳转...', 'success')

    // 跳转到仪表板
    setTimeout(() => {
      const redirect = route.query.redirect as string
      router.push(redirect || '/dashboard')
    }, 1000)

  } catch (error: unknown) {
    console.error('Login error:', error)
    showToast(error?.message || '登录失败，请稍后重试', 'error')
    
    // 清空密码
    loginForm.password = ''
  } finally {
    loading.value = false
  }
}

// 显示忘记密码对话框
const showForgotPassword = () => {
  forgotPasswordVisible.value = true
  forgotForm.email = ''
  errors.email = ''
}

// 关闭忘记密码对话框
const closeForgotPassword = () => {
  forgotPasswordVisible.value = false
  forgotForm.email = ''
  errors.email = ''
}

// 处理忘记密码
const handleForgotPassword = async () => {
  if (!validateEmailForm()) {
    return
  }

  forgotLoading.value = true

  try {
    await api.post('/auth/forgot-password', {
      email: forgotForm.email
    }, { skipAuth: true })

    showToast('重置密码邮件已发送，请查收邮箱', 'success')
    closeForgotPassword()
  } catch (error: unknown) {
    console.error('Forgot password error:', error)
    showToast(error?.message || '发送失败，请稍后重试', 'error')
  } finally {
    forgotLoading.value = false
  }
}

// 组件挂载时的处理
onMounted(() => {
  // 如果已经登录，直接跳转
  if (userStore.isLoggedIn) {
    router.push('/dashboard')
    return
  }

  // 检查是否记住登录
  const rememberLogin = localStorage.getItem('rememberLogin')
  const savedUsername = localStorage.getItem('username')
  
  if (rememberLogin === 'true' && savedUsername) {
    rememberMe.value = true
    loginForm.username = savedUsername
  }
})
</script>

<style scoped>
/* 导入CSS变量和Web端布局样式 */
@import url('/src/styles/variables.css');
@import url('/src/styles/web-layout.css');

/* 登录页面样式 - Web端全屏适配 */
.login-page {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%);
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: var(--spacing-xl);
}

.login-card {
  width: 100%;
  max-width: 450px;
  min-width: 400px;
  background: var(--bg-color-primary);
  border-radius: var(--card-border-radius);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: var(--spacing-xxxl) var(--spacing-xxxl) var(--spacing-xl);
}

.login-logo {
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-lg);
}

.login-title {
  font-size: var(--font-size-extra-large);
  font-weight: var(--font-weight-bold);
  color: var(--text-color-primary);
  margin: 0 0 var(--spacing-sm);
}

.login-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-color-secondary);
  margin: 0;
}

.login-form {
  padding: 0 var(--spacing-xxxl) var(--spacing-xl);
}

/* 表单组件样式 */
.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-primary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  height: var(--input-height-base);
  padding: 0 var(--input-padding-horizontal);
  padding-left: var(--spacing-xxxl);
  border: 1px solid var(--border-color-base);
  border-radius: var(--border-radius-base);
  background: var(--bg-color-primary);
  font-size: var(--font-size-base);
  color: var(--text-color-primary);
  transition: var(--transition-border);
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  outline: none;
}

.form-input.error {
  border-color: var(--danger-color);
}

.form-input.error:focus {
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

.input-icon {
  position: absolute;
  left: var(--spacing-md);
  color: var(--text-color-placeholder);
  font-size: var(--font-size-base);
  z-index: 1;
}

.password-toggle {
  position: absolute;
  right: var(--spacing-md);
  background: none;
  border: none;
  color: var(--text-color-placeholder);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: var(--transition-color);
  padding: 0;
}

.password-toggle:hover {
  color: var(--primary-color);
}

.form-error {
  display: none;
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-small);
  color: var(--danger-color);
}

.form-error.show {
  display: block;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.checkbox-label {
  font-size: var(--font-size-base);
  color: var(--text-color-regular);
  cursor: pointer;
}

.forgot-password {
  font-size: var(--font-size-small);
  color: var(--primary-color);
  text-decoration: none;
  transition: var(--transition-color);
}

.forgot-password:hover {
  color: var(--primary-color-dark);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  height: var(--button-height-base);
  padding: 0 var(--button-padding-horizontal);
  border: 1px solid transparent;
  border-radius: var(--border-radius-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  text-align: center;
  cursor: pointer;
  transition: var(--transition-base);
  user-select: none;
  white-space: nowrap;
  text-decoration: none;
  background: none;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-primary {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--text-color-white);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-color-light);
  border-color: var(--primary-color-light);
}

.btn-primary:active {
  background: var(--primary-color-dark);
  border-color: var(--primary-color-dark);
}

.btn-secondary {
  background: var(--bg-color-primary);
  border-color: var(--border-color-base);
  color: var(--text-color-regular);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-color-secondary);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-login {
  width: 100%;
  height: 48px;
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-medium);
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.login-footer {
  text-align: center;
  padding: var(--spacing-lg);
  background-color: var(--bg-color-secondary);
  color: var(--text-color-secondary);
  font-size: var(--font-size-small);
}

.login-footer p {
  margin: 0;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
  padding: var(--spacing-lg);
}

.modal-container {
  background: var(--bg-color-primary);
  border-radius: var(--card-border-radius);
  box-shadow: var(--box-shadow-dark);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--card-padding);
  border-bottom: 1px solid var(--border-color-light);
}

.modal-title {
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-primary);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-base);
  color: var(--text-color-placeholder);
  transition: var(--transition-base);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.modal-close:hover {
  background: var(--bg-color-secondary);
  color: var(--text-color-regular);
}

.modal-body {
  padding: var(--card-padding);
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--card-padding);
  border-top: 1px solid var(--border-color-light);
  background: var(--bg-color-tertiary);
  flex-shrink: 0;
}

/* Toast消息组件 */
.toast-container {
  position: fixed;
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: var(--z-index-message);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 300px;
  padding: var(--spacing-lg);
  background: var(--bg-color-primary);
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-dark);
  border-left: 4px solid var(--info-color);
  transform: translateX(100%);
  animation: slideIn 0.3s ease forwards;
}

.toast-success {
  border-left-color: var(--success-color);
}

.toast-warning {
  border-left-color: var(--warning-color);
}

.toast-error {
  border-left-color: var(--danger-color);
}

.toast-icon {
  color: var(--info-color);
}

.toast-success .toast-icon {
  color: var(--success-color);
}

.toast-warning .toast-icon {
  color: var(--warning-color);
}

.toast-error .toast-icon {
  color: var(--danger-color);
}

.toast-message {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--text-color-primary);
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-color-placeholder);
  transition: var(--transition-color);
  cursor: pointer;
  padding: 0;
}

.toast-close:hover {
  color: var(--text-color-regular);
}

@keyframes slideIn {
  to {
    transform: translateX(0);
  }
}

/* 响应式设计 - Web端优先 */
@media (min-width: 1200px) {
  .login-card {
    max-width: 500px;
    min-width: 450px;
  }
  
  .login-header {
    padding: var(--spacing-xxxl) var(--spacing-xxxl) var(--spacing-xl);
  }
  
  .login-form {
    padding: 0 var(--spacing-xxxl) var(--spacing-xl);
  }
}

@media (max-width: 768px) {
  .login-container {
    padding: var(--spacing-lg);
  }
  
  .login-card {
    max-width: 100%;
    min-width: 320px;
  }
  
  .login-header,
  .login-form {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: var(--spacing-md);
  }
  
  .login-card {
    max-width: 100%;
    min-width: 280px;
  }
  
  .login-header,
  .login-form {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
  
  .modal-container {
    max-width: 100%;
    margin: var(--spacing-md);
  }
  
  .toast {
    min-width: 280px;
  }
  
  .toast-container {
    left: var(--spacing-md);
    right: var(--spacing-md);
  }
}
</style>