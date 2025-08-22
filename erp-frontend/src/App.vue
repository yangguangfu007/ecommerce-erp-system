<script setup lang="ts">
// App.vue - 应用根组件
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 14px;
  line-height: 1.5;
}

html, body {
  height: 100%;
  width: 100%;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  background-color: #f5f7fa;
  color: #303133;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

#app {
  height: 100%;
  width: 100%;
  min-height: 100vh;
  position: relative;
}

/* 确保容器正确显示 */
.el-container {
  height: 100%;
  min-height: 100vh;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Element Plus 样式覆盖 - Web端优化 */
.el-card {
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-shadow);
}

.el-button {
  border-radius: var(--border-radius-base);
  font-weight: var(--font-weight-medium);
}

.el-input__wrapper {
  border-radius: var(--border-radius-base);
}

.el-select .el-input__wrapper {
  border-radius: var(--border-radius-base);
}

.el-table {
  font-size: var(--font-size-base);
}

.el-table .el-table__header-wrapper {
  background: var(--bg-color-secondary);
}

.el-pagination {
  justify-content: center;
}

/* Web端优先的响应式字体大小 */
@media (min-width: 1600px) {
  html {
    font-size: 16px;
  }
}

@media (min-width: 1200px) {
  html {
    font-size: 15px;
  }
}

@media (min-width: 1024px) {
  html {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  html {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  html {
    font-size: 12px;
  }
}
</style>
