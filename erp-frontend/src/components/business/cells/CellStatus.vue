<template>
  <el-tag
    :type="tagType"
    :effect="tagEffect"
    size="small"
    class="cell-status"
  >
    <el-icon v-if="statusIcon" class="status-icon">
      <component :is="statusIcon" />
    </el-icon>
    {{ displayValue }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Check,
  Clock,
  Warning,
  Close,
  Loading,
  QuestionFilled
} from '@element-plus/icons-vue'

const props = defineProps<{
  value: any
  column?: any
  row?: any
}>()

// 状态配置映射
const statusConfig = {
  // 订单状态
  pending: { type: 'warning', label: '待处理', icon: Clock },
  paid: { type: 'info', label: '已支付', icon: Check },
  shipped: { type: 'primary', label: '已发货', icon: Loading },
  delivered: { type: 'success', label: '已送达', icon: Check },
  completed: { type: 'success', label: '已完成', icon: Check },
  cancelled: { type: 'danger', label: '已取消', icon: Close },
  
  // 商品状态
  active: { type: 'success', label: '上架', icon: Check },
  inactive: { type: 'info', label: '下架', icon: Warning },
  out_of_stock: { type: 'danger', label: '缺货', icon: Close },
  
  // 库存状态
  normal: { type: 'success', label: '正常', icon: Check },
  low: { type: 'warning', label: '库存不足', icon: Warning },
  critical: { type: 'danger', label: '严重不足', icon: Warning },
  
  // 用户状态
  enabled: { type: 'success', label: '启用', icon: Check },
  disabled: { type: 'danger', label: '禁用', icon: Close },
  
  // 通用状态
  success: { type: 'success', label: '成功', icon: Check },
  error: { type: 'danger', label: '失败', icon: Close },
  processing: { type: 'primary', label: '处理中', icon: Loading },
  unknown: { type: 'info', label: '未知', icon: QuestionFilled }
}

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) {
    return '-'
  }
  
  if (props.column?.formatter) {
    return props.column.formatter(props.value)
  }
  
  // 从状态配置中获取显示文本
  const config = statusConfig[props.value as keyof typeof statusConfig]
  if (config) {
    return config.label
  }
  
  // 如果有自定义状态映射
  if (props.column?.statusMap) {
    return props.column.statusMap[props.value] || String(props.value)
  }
  
  return String(props.value)
})

const tagType = computed(() => {
  const config = statusConfig[props.value as keyof typeof statusConfig]
  if (config) {
    return config.type
  }
  
  // 如果有自定义类型映射
  if (props.column?.typeMap) {
    return props.column.typeMap[props.value] || 'info'
  }
  
  return 'info'
})

const tagEffect = computed(() => {
  return props.column?.effect || 'light'
})

const statusIcon = computed(() => {
  if (props.column?.showIcon === false) {
    return null
  }
  
  const config = statusConfig[props.value as keyof typeof statusConfig]
  if (config) {
    return config.icon
  }
  
  return null
})
</script>

<style scoped>
.cell-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-icon {
  font-size: 12px;
}
</style>