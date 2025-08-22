<template>
  <div class="cell-image">
    <el-image
      v-if="imageUrl"
      :src="imageUrl"
      :alt="altText"
      fit="cover"
      class="image-preview"
      :preview-src-list="previewList"
      :initial-index="0"
      preview-teleported
    >
      <template #error>
        <div class="image-error">
          <el-icon><Picture /></el-icon>
          <span>加载失败</span>
        </div>
      </template>
    </el-image>
    
    <div v-else class="image-placeholder">
      <el-icon><Picture /></el-icon>
      <span>暂无图片</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Picture } from '@element-plus/icons-vue'

const props = defineProps<{
  value: any
  column?: any
  row?: any
}>()

const imageUrl = computed(() => {
  if (!props.value) return ''
  
  // 如果是数组，取第一个
  if (Array.isArray(props.value)) {
    return props.value[0] || ''
  }
  
  return String(props.value)
})

const previewList = computed(() => {
  if (!props.value) return []
  
  // 如果是数组，返回所有图片
  if (Array.isArray(props.value)) {
    return props.value.filter(url => url)
  }
  
  return [String(props.value)]
})

const altText = computed(() => {
  if (props.column?.altField && props.row) {
    return props.row[props.column.altField] || '图片'
  }
  return '图片'
})
</script>

<style scoped>
.cell-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-small);
  cursor: pointer;
}

.image-error,
.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius-small);
  color: var(--text-color-secondary);
  font-size: var(--font-size-small);
}

.image-error .el-icon,
.image-placeholder .el-icon {
  font-size: 16px;
  margin-bottom: 2px;
}

.image-error span,
.image-placeholder span {
  font-size: 10px;
  line-height: 1;
}
</style>