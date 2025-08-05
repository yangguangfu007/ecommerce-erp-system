<template>
  <div class="product-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <div class="header-actions">
            <el-button type="success">
              <el-icon><Upload /></el-icon>
              批量导入
            </el-button>
            <el-button type="primary">
              <el-icon><Plus /></el-icon>
              添加商品
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="content-placeholder">
        <el-empty description="商品管理功能开发中..." />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus, Upload } from '@element-plus/icons-vue'
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.content-placeholder {
  padding: 60px 0;
}
</style>