<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="error-title">页面不存在</h1>
        <p class="error-description">抱歉，您访问的页面不存在或已被删除。</p>
        <div class="error-actions">
          <el-button type="primary" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button @click="goBack">
            <el-icon><Back /></el-icon>
            返回上页
          </el-button>
        </div>
      </div>
      <div class="error-illustration">
        <el-icon size="200"><Warning /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled, Back, Warning } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-color-secondary);
  padding: var(--spacing-xl);
}

.not-found-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-xxxl);
  max-width: 800px;
  width: 100%;
}

.not-found-content {
  flex: 1;
}

.error-code {
  font-size: 6rem;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: var(--spacing-lg);
}

.error-title {
  font-size: var(--font-size-extra-large);
  font-weight: var(--font-weight-bold);
  color: var(--text-color-primary);
  margin-bottom: var(--spacing-md);
}

.error-description {
  font-size: var(--font-size-large);
  color: var(--text-color-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: var(--line-height-large);
}

.error-actions {
  display: flex;
  gap: var(--spacing-lg);
}

.error-illustration {
  flex-shrink: 0;
  color: var(--text-color-placeholder);
}

@media (max-width: 768px) {
  .not-found-container {
    flex-direction: column;
    text-align: center;
  }
  
  .error-code {
    font-size: 4rem;
  }
  
  .error-illustration {
    order: -1;
  }
  
  .error-actions {
    justify-content: center;
  }
}
</style>