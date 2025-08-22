<template>
  <span class="cell-text" :title="displayValue">
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
  
  if (props.column?.formatter) {
    return props.column.formatter(props.value)
  }
  
  return String(props.value)
})
</script>

<style scoped>
.cell-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>