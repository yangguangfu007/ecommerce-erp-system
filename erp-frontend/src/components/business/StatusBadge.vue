<!-- 状态徽章组件 - 支持订单、库存、用户等状态显示 -->
<template>
  <span 
    :class="[
      'status-badge',
      `status-${normalizedStatus}`,
      size && `status-badge-${size}`
    ]"
    :title="title || text"
  >
    <i v-if="showIcon" :class="iconClass" class="status-icon"></i>
    {{ text }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 状态值 */
  status: string
  /** 状态类型：order, inventory, user, platform, logistics */
  type?: 'order' | 'inventory' | 'user' | 'platform' | 'logistics' | 'general'
  /** 显示文本，如果不提供则根据状态自动生成 */
  text?: string
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示图标 */
  showIcon?: boolean
  /** 提示文本 */
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'general',
  size: 'medium',
  showIcon: false
})

// 状态映射配置
const statusConfig = {
  // 订单状态
  order: {
    pending: { text: '待支付', icon: 'fas fa-clock' },
    paid: { text: '已支付', icon: 'fas fa-check-circle' },
    shipped: { text: '已发货', icon: 'fas fa-truck' },
    completed: { text: '已完成', icon: 'fas fa-check-double' },
    cancelled: { text: '已取消', icon: 'fas fa-times-circle' },
    refunded: { text: '已退款', icon: 'fas fa-undo' }
  },
  // 库存状态
  inventory: {
    sufficient: { text: '充足', icon: 'fas fa-check-circle' },
    low: { text: '偏低', icon: 'fas fa-exclamation-triangle' },
    critical: { text: '紧急', icon: 'fas fa-exclamation-circle' },
    outOfStock: { text: '缺货', icon: 'fas fa-times-circle' },
    normal: { text: '正常', icon: 'fas fa-check' }
  },
  // 用户状态
  user: {
    active: { text: '启用', icon: 'fas fa-user-check' },
    inactive: { text: '禁用', icon: 'fas fa-user-times' },
    pending: { text: '待激活', icon: 'fas fa-user-clock' },
    locked: { text: '已锁定', icon: 'fas fa-user-lock' }
  },
  // 平台状态
  platform: {
    connected: { text: '已连接', icon: 'fas fa-link' },
    disconnected: { text: '未连接', icon: 'fas fa-unlink' },
    syncing: { text: '同步中', icon: 'fas fa-sync fa-spin' },
    error: { text: '错误', icon: 'fas fa-exclamation-triangle' }
  },
  // 物流状态
  logistics: {
    pending: { text: '待发货', icon: 'fas fa-clock' },
    shipped: { text: '已发货', icon: 'fas fa-truck' },
    inTransit: { text: '运输中', icon: 'fas fa-shipping-fast' },
    delivered: { text: '已送达', icon: 'fas fa-check-circle' },
    exception: { text: '异常', icon: 'fas fa-exclamation-triangle' }
  },
  // 通用状态
  general: {
    active: { text: '启用', icon: 'fas fa-check-circle' },
    inactive: { text: '禁用', icon: 'fas fa-times-circle' },
    enabled: { text: '启用', icon: 'fas fa-toggle-on' },
    disabled: { text: '禁用', icon: 'fas fa-toggle-off' },
    success: { text: '成功', icon: 'fas fa-check' },
    failed: { text: '失败', icon: 'fas fa-times' },
    processing: { text: '处理中', icon: 'fas fa-spinner fa-spin' },
    waiting: { text: '等待中', icon: 'fas fa-clock' },
    draft: { text: '草稿', icon: 'fas fa-edit' }
  }
}

// 标准化状态值（处理大小写和下划线）
const normalizedStatus = computed(() => {
  return props.status.toLowerCase().replace(/_/g, '').replace(/-/g, '')
})

// 获取状态配置
const statusInfo = computed(() => {
  const typeConfig = statusConfig[props.type] || statusConfig.general
  return typeConfig[normalizedStatus.value] || typeConfig[props.status] || { text: props.status, icon: '' }
})

// 显示文本
const text = computed(() => {
  return props.text || statusInfo.value.text
})

// 图标类名
const iconClass = computed(() => {
  return statusInfo.value.icon
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.status-badge-small {
  padding: 2px 6px;
  font-size: 11px;
}

.status-badge-large {
  padding: 6px 12px;
  font-size: 13px;
}

.status-icon {
  font-size: 0.9em;
}

/* 订单状态样式 */
.status-pending {
  background: #fff7e6;
  color: #d46b08;
  border-color: #ffd591;
}

.status-paid {
  background: #f6ffed;
  color: #389e0d;
  border-color: #b7eb8f;
}

.status-shipped {
  background: #e6f7ff;
  color: #0958d9;
  border-color: #91d5ff;
}

.status-completed {
  background: #f6ffed;
  color: #389e0d;
  border-color: #b7eb8f;
}

.status-cancelled,
.status-failed {
  background: #fff2f0;
  color: #cf1322;
  border-color: #ffccc7;
}

.status-refunded {
  background: #f9f0ff;
  color: #722ed1;
  border-color: #d3adf7;
}

/* 库存状态样式 */
.status-sufficient,
.status-normal {
  background: #f6ffed;
  color: #389e0d;
  border-color: #b7eb8f;
}

.status-low {
  background: #fff7e6;
  color: #d46b08;
  border-color: #ffd591;
}

.status-critical {
  background: #fff2f0;
  color: #cf1322;
  border-color: #ffccc7;
}

.status-outofstock {
  background: #f5f5f5;
  color: #8c8c8c;
  border-color: #d9d9d9;
}

/* 用户状态样式 */
.status-active,
.status-enabled,
.status-success {
  background: #f6ffed;
  color: #389e0d;
  border-color: #b7eb8f;
}

.status-inactive,
.status-disabled {
  background: #f5f5f5;
  color: #8c8c8c;
  border-color: #d9d9d9;
}

.status-locked {
  background: #fff2f0;
  color: #cf1322;
  border-color: #ffccc7;
}

/* 平台状态样式 */
.status-connected {
  background: #f6ffed;
  color: #389e0d;
  border-color: #b7eb8f;
}

.status-disconnected,
.status-error {
  background: #fff2f0;
  color: #cf1322;
  border-color: #ffccc7;
}

.status-syncing,
.status-processing {
  background: #e6f7ff;
  color: #0958d9;
  border-color: #91d5ff;
}

/* 物流状态样式 */
.status-intransit {
  background: #e6f7ff;
  color: #0958d9;
  border-color: #91d5ff;
}

.status-delivered {
  background: #f6ffed;
  color: #389e0d;
  border-color: #b7eb8f;
}

.status-exception {
  background: #fff2f0;
  color: #cf1322;
  border-color: #ffccc7;
}

/* 通用状态样式 */
.status-waiting,
.status-draft {
  background: #f0f0f0;
  color: #595959;
  border-color: #d9d9d9;
}

/* 悬停效果 */
.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>