<!--
  基础按钮组件
  参考 HTML 原型中的按钮设计，支持不同类型、尺寸和状态
-->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="nativeType"
    @click="handleClick"
  >
    <!-- 加载状态图标 -->
    <i v-if="loading" class="fas fa-spinner fa-spin btn-loading-icon"></i>
    
    <!-- 按钮图标 -->
    <i v-if="icon && !loading" :class="icon" class="btn-icon"></i>
    
    <!-- 按钮文字 -->
    <span v-if="$slots.default" class="btn-text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 按钮类型 */
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
  /** 按钮尺寸 */
  size?: 'small' | 'base' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 按钮图标 */
  icon?: string
  /** 原生按钮类型 */
  nativeType?: 'button' | 'submit' | 'reset'
  /** 是否为圆形按钮 */
  round?: boolean
  /** 是否为圆角按钮 */
  circle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'secondary',
  size: 'base',
  disabled: false,
  loading: false,
  nativeType: 'button',
  round: false,
  circle: false
})

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const emit = defineEmits<Emits>()

// 计算按钮样式类
const buttonClasses = computed(() => {
  return [
    'btn',
    `btn-${props.type}`,
    {
      [`btn-${props.size}`]: props.size !== 'base',
      'btn-loading': props.loading,
      'btn-round': props.round,
      'btn-circle': props.circle,
      'btn-disabled': props.disabled
    }
  ]
})

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    return
  }
  emit('click', event)
}
</script>

<style scoped>
/* 基础按钮样式 - 参考 HTML 原型 components.css */
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
  outline: none;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 按钮尺寸 */
.btn-small {
  height: var(--button-height-small);
  padding: 0 var(--spacing-lg);
  font-size: var(--font-size-small);
}

.btn-large {
  height: var(--button-height-large);
  padding: 0 var(--spacing-xxl);
  font-size: var(--font-size-large);
}

/* 按钮类型 */
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

.btn-success {
  background: var(--success-color);
  border-color: var(--success-color);
  color: var(--text-color-white);
}

.btn-success:hover:not(:disabled) {
  background: var(--success-color-light);
  border-color: var(--success-color-light);
}

.btn-warning {
  background: var(--warning-color);
  border-color: var(--warning-color);
  color: var(--text-color-white);
}

.btn-warning:hover:not(:disabled) {
  background: var(--warning-color-light);
  border-color: var(--warning-color-light);
}

.btn-danger {
  background: var(--danger-color);
  border-color: var(--danger-color);
  color: var(--text-color-white);
}

.btn-danger:hover:not(:disabled) {
  background: var(--danger-color-light);
  border-color: var(--danger-color-light);
}

.btn-outline {
  background: transparent;
  border-color: var(--border-color-base);
  color: var(--text-color-regular);
}

.btn-outline:hover:not(:disabled) {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--text-color-white);
}

/* 圆角按钮 */
.btn-round {
  border-radius: var(--border-radius-round);
}

.btn-circle {
  border-radius: var(--border-radius-circle);
  width: var(--button-height-base);
  padding: 0;
}

.btn-circle.btn-small {
  width: var(--button-height-small);
}

.btn-circle.btn-large {
  width: var(--button-height-large);
}

/* 加载状态 */
.btn-loading {
  pointer-events: none;
}

.btn-loading-icon {
  margin-right: var(--spacing-xs);
}

.btn-icon {
  font-size: var(--font-size-base);
}

.btn-text {
  display: inline-block;
}

/* 按钮组合 */
.btn + .btn {
  margin-left: var(--spacing-sm);
}
</style>