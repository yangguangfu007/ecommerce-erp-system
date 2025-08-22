<template>
  <span class="cell-date" :title="fullDateTime">
    {{ displayValue }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: any
  column?: any
  row?: any
}>()

const displayValue = computed(() => {
  if (!props.value) {
    return '-'
  }
  
  const date = new Date(props.value)
  if (isNaN(date.getTime())) {
    return String(props.value)
  }
  
  if (props.column?.formatter) {
    return props.column.formatter(date)
  }
  
  // 根据列配置格式化日期
  const format = props.column?.format || 'datetime'
  
  switch (format) {
    case 'date':
      return date.toLocaleDateString('zh-CN')
    case 'time':
      return date.toLocaleTimeString('zh-CN')
    case 'datetime':
      return date.toLocaleString('zh-CN')
    case 'relative':
      return getRelativeTime(date)
    default:
      return date.toLocaleString('zh-CN')
  }
})

const fullDateTime = computed(() => {
  if (!props.value) return ''
  
  const date = new Date(props.value)
  if (isNaN(date.getTime())) return ''
  
  return date.toLocaleString('zh-CN')
})

const getRelativeTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}
</script>

<style scoped>
.cell-date {
  color: var(--text-color-secondary);
  font-size: var(--font-size-small);
}
</style>