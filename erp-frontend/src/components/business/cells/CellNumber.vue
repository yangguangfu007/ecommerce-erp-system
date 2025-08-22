<template>
  <span class="cell-number" :class="numberClass">
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
  if (props.value === null || props.value === undefined) {
    return '-'
  }
  
  const num = Number(props.value)
  if (isNaN(num)) {
    return String(props.value)
  }
  
  if (props.column?.formatter) {
    return props.column.formatter(num)
  }
  
  // 根据列配置格式化数字
  if (props.column?.format === 'currency') {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(num)
  } else if (props.column?.format === 'percentage') {
    return `${(num * 100).toFixed(2)}%`
  } else if (props.column?.decimals !== undefined) {
    return num.toFixed(props.column.decimals)
  }
  
  return new Intl.NumberFormat('zh-CN').format(num)
})

const numberClass = computed(() => {
  const num = Number(props.value)
  if (isNaN(num)) return ''
  
  return {
    'positive': num > 0,
    'negative': num < 0,
    'zero': num === 0
  }
})
</script>

<style scoped>
.cell-number {
  font-family: 'Courier New', monospace;
  text-align: right;
  display: inline-block;
  width: 100%;
}

.cell-number.positive {
  color: var(--success-color);
}

.cell-number.negative {
  color: var(--danger-color);
}

.cell-number.zero {
  color: var(--text-color-secondary);
}
</style>