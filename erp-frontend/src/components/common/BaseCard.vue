<!--
  基础卡片组件
  参考 HTML 原型中的卡片设计，用于统计展示和内容容器
-->
<template>
  <div class="base-card" :class="cardClasses">
    <!-- 卡片头部 -->
    <div v-if="showHeader && (title || subtitle || $slots.title || $slots.extra)" class="card-header">
      <div class="card-title-section">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        <slot name="title"></slot>
      </div>
      <div v-if="$slots.extra" class="card-extra">
        <slot name="extra"></slot>
      </div>
    </div>
    
    <!-- 卡片内容 -->
    <div class="card-body" :class="bodyClasses">
      <slot></slot>
    </div>
    
    <!-- 卡片底部 -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 卡片标题 */
  title?: string
  /** 卡片副标题 */
  subtitle?: string
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示阴影 */
  shadow?: 'always' | 'hover' | 'never'
  /** 卡片尺寸 */
  size?: 'small' | 'default' | 'large'
  /** 是否可悬停 */
  hoverable?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 自定义类名 */
  customClass?: string
  /** 内容区域是否无内边距 */
  bodyNoPadding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  bordered: true,
  shadow: 'always',
  size: 'default',
  hoverable: false,
  loading: false,
  bodyNoPadding: false
})

// 计算卡片样式类
const cardClasses = computed(() => {
  return [
    {
      [`card-${props.size}`]: props.size !== 'default',
      'card-bordered': props.bordered,
      [`card-shadow-${props.shadow}`]: props.shadow !== 'always',
      'card-hoverable': props.hoverable,
      'card-loading': props.loading
    },
    props.customClass
  ]
})

// 计算内容区样式类
const bodyClasses = computed(() => {
  return {
    'no-padding': props.bodyNoPadding
  }
})
</script>

<style scoped>
/* 基础卡片样式 - 参考 HTML 原型 components.css */
.base-card {
  background: var(--bg-color-primary);
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: var(--transition-box-shadow);
  position: relative;
}

/* 卡片边框 */
.card-bordered {
  border: 1px solid var(--border-color-light);
}

/* 卡片阴影 */
.card-shadow-hover {
  box-shadow: none;
}

.card-shadow-hover:hover {
  box-shadow: var(--card-shadow);
}

.card-shadow-never {
  box-shadow: none;
}

/* 卡片尺寸 */
.card-small {
  border-radius: var(--border-radius-base);
}

.card-small .card-header,
.card-small .card-body,
.card-small .card-footer {
  padding: var(--spacing-md);
}

.card-large .card-header,
.card-large .card-body,
.card-large .card-footer {
  padding: var(--spacing-xl);
}

/* 可悬停卡片 */
.card-hoverable {
  cursor: pointer;
  transition: var(--transition-base);
}

.card-hoverable:hover {
  box-shadow: var(--box-shadow-dark);
  transform: translateY(-2px);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--card-padding);
  border-bottom: 1px solid var(--border-color-light);
  background: var(--bg-color-primary);
}

.card-title-section {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.4;
}

.card-subtitle {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
  margin: 0;
  line-height: 1.4;
}

.card-extra {
  flex-shrink: 0;
  margin-left: var(--spacing-md);
}

/* 卡片内容 */
.card-body {
  padding: var(--card-padding);
  flex: 1;
}

.card-body.no-padding {
  padding: 0;
}

/* 卡片底部 */
.card-footer {
  padding: var(--card-padding);
  border-top: 1px solid var(--border-color-light);
  background: var(--bg-color-tertiary);
}

/* 加载状态 */
.card-loading {
  pointer-events: none;
  position: relative;
}

.card-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.card-loading::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color-light);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 11;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* 统计卡片样式 */
.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--card-padding);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-base);
  background: var(--primary-color);
  color: var(--text-color-white);
  font-size: var(--font-size-large);
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: var(--font-size-small);
  color: var(--text-color-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: var(--font-size-extra-large);
  font-weight: var(--font-weight-bold);
  color: var(--text-color-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-small);
}

.trend-up {
  color: var(--success-color);
}

.trend-down {
  color: var(--danger-color);
}

.trend-text {
  color: var(--text-color-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .card-extra {
    margin-left: 0;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    align-self: center;
  }
}
</style>