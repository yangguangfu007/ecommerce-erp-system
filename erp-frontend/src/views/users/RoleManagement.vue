<template>
  <div class="role-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary">
            <el-icon><Plus /></el-icon>
            添加角色
          </el-button>
        </div>
      </template>
      
      <div class="content-placeholder">
        <el-empty description="角色管理功能开发中..." />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-placeholder {
  padding: 60px 0;
}
</style>