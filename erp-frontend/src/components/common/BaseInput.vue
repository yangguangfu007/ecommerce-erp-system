<!--
  基础输入框组件
  参考 HTML 原型中的表单输入框设计，支持不同类型和状态
-->
<template>
  <div class="form-group" :class="groupClasses">
    <!-- 标签 -->
    <label v-if="label" class="form-label" :class="{ required }">
      {{ label }}
    </label>
    
    <!-- 输入框容器 -->
    <div class="input-wrapper" :class="wrapperClasses">
      <!-- 前置图标 -->
      <i v-if="prefixIcon" :class="prefixIcon" class="input-icon input-prefix-icon"></i>
      
      <!-- 输入框 -->
      <input
        ref="inputRef"
        :class="inputClasses"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :max="max"
        :min="min"
        :step="step"
        :autocomplete="autocomplete"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      
      <!-- 密码显示/隐藏切换 -->
      <i
        v-if="type === 'password'"
        :class="passwordVisible ? 'fas fa-eye-slash' : 'fas fa-eye'"
        class="password-toggle"
        @click="togglePasswordVisible"
      ></i>
      
      <!-- 后置图标 -->
      <i v-if="suffixIcon" :class="suffixIcon" class="input-icon input-suffix-icon"></i>
      
      <!-- 清除按钮 -->
      <i
        v-if="clearable && modelValue && !disabled && !readonly"
        class="fas fa-times input-clear"
        @click="handleClear"
      ></i>
    </div>
    
    <!-- 帮助文本 -->
    <div v-if="helpText" class="form-help">{{ helpText }}</div>
    
    <!-- 错误信息 -->
    <div v-if="errorMessage" class="form-error">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Props {
  /** 输入框值 */
  modelValue?: string | number
  /** 输入框类型 */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  /** 标签文本 */
  label?: string
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否必填 */
  required?: boolean
  /** 是否可清除 */
  clearable?: boolean
  /** 前置图标 */
  prefixIcon?: string
  /** 后置图标 */
  suffixIcon?: string
  /** 最大长度 */
  maxlength?: number
  /** 最小长度 */
  minlength?: number
  /** 最大值（数字类型） */
  max?: number
  /** 最小值（数字类型） */
  min?: number
  /** 步长（数字类型） */
  step?: number
  /** 自动完成 */
  autocomplete?: string
  /** 帮助文本 */
  helpText?: string
  /** 错误信息 */
  errorMessage?: string
  /** 验证状态 */
  validateStatus?: 'success' | 'error' | 'warning'
  /** 输入框尺寸 */
  size?: 'small' | 'base' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  size: 'base',
  autocomplete: 'off'
})

interface Emits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'input', value: string | number, event: Event): void
  (e: 'change', value: string | number, event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'clear'): void
  (e: 'keydown', event: KeyboardEvent): void
}

const emit = defineEmits<Emits>()

const inputRef = ref<HTMLInputElement>()
const passwordVisible = ref(false)

// 计算实际输入框类型
const inputType = computed(() => {
  if (props.type === 'password') {
    return passwordVisible.value ? 'text' : 'password'
  }
  return props.type
})

// 计算表单组样式类
const groupClasses = computed(() => {
  return {
    error: props.validateStatus === 'error' || props.errorMessage,
    success: props.validateStatus === 'success',
    warning: props.validateStatus === 'warning',
    disabled: props.disabled,
    readonly: props.readonly
  }
})

// 计算输入框容器样式类
const wrapperClasses = computed(() => {
  return {
    'has-prefix-icon': props.prefixIcon,
    'has-suffix-icon': props.suffixIcon || props.clearable || props.type === 'password',
    'has-feedback': props.validateStatus
  }
})

// 计算输入框样式类
const inputClasses = computed(() => {
  return [
    'form-input',
    {
      [`form-input-${props.size}`]: props.size !== 'base',
      error: props.validateStatus === 'error' || props.errorMessage,
      success: props.validateStatus === 'success',
      warning: props.validateStatus === 'warning'
    }
  ]
})

// 处理输入事件
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
  emit('input', value, event)
}

// 处理变更事件
const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('change', value, event)
}

// 处理焦点事件
const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

// 处理失焦事件
const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

// 切换密码可见性
const togglePasswordVisible = () => {
  passwordVisible.value = !passwordVisible.value
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 清除输入框内容
const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 聚焦输入框
const focus = () => {
  inputRef.value?.focus()
}

// 失焦输入框
const blur = () => {
  inputRef.value?.blur()
}

// 选中输入框内容
const select = () => {
  inputRef.value?.select()
}

// 暴露方法
defineExpose({
  focus,
  blur,
  select
})
</script>

<style scoped>
/* 表单组样式 - 参考 HTML 原型 components.css */
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

.form-label.required::after {
  content: '*';
  color: var(--danger-color);
  margin-left: var(--spacing-xs);
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
  border: 1px solid var(--border-color-base);
  border-radius: var(--border-radius-base);
  background: var(--bg-color-primary);
  font-size: var(--font-size-base);
  color: var(--text-color-primary);
  transition: var(--transition-border);
  outline: none;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-input.error {
  border-color: var(--danger-color);
}

.form-input.error:focus {
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

.form-input.success {
  border-color: var(--success-color);
}

.form-input.success:focus {
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
}

.form-input.warning {
  border-color: var(--warning-color);
}

.form-input.warning:focus {
  box-shadow: 0 0 0 2px rgba(230, 162, 60, 0.2);
}

/* 输入框尺寸 */
.form-input-small {
  height: var(--input-height-small);
  font-size: var(--font-size-small);
}

.form-input-large {
  height: var(--input-height-large);
  font-size: var(--font-size-large);
}

/* 图标样式 */
.input-icon {
  position: absolute;
  color: var(--text-color-placeholder);
  font-size: var(--font-size-base);
  z-index: 1;
}

.input-prefix-icon {
  left: var(--spacing-md);
}

.input-suffix-icon {
  right: var(--spacing-md);
}

.has-prefix-icon .form-input {
  padding-left: var(--spacing-xxxl);
}

.has-suffix-icon .form-input {
  padding-right: var(--spacing-xxxl);
}

/* 密码切换按钮 */
.password-toggle {
  position: absolute;
  right: var(--spacing-md);
  color: var(--text-color-placeholder);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: var(--transition-color);
  z-index: 2;
}

.password-toggle:hover {
  color: var(--primary-color);
}

/* 清除按钮 */
.input-clear {
  position: absolute;
  right: var(--spacing-md);
  color: var(--text-color-placeholder);
  font-size: var(--font-size-small);
  cursor: pointer;
  transition: var(--transition-color);
  z-index: 2;
}

.input-clear:hover {
  color: var(--text-color-regular);
}

/* 禁用状态 */
.form-input:disabled {
  background-color: var(--bg-color-secondary);
  color: var(--text-color-placeholder);
  cursor: not-allowed;
  opacity: 0.6;
}

/* 只读状态 */
.form-input[readonly] {
  background-color: var(--bg-color-tertiary);
  cursor: default;
}

/* 帮助文本 */
.form-help {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
  line-height: 1.4;
}

/* 错误信息 */
.form-error {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-small);
  color: var(--danger-color);
  line-height: 1.4;
}

/* 表单组状态样式 */
.form-group.error .form-label {
  color: var(--danger-color);
}

.form-group.disabled {
  opacity: 0.6;
}
</style>